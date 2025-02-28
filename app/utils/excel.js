import ExcelJS from "exceljs";
import bcrypt from "bcryptjs";
import db from "../../models";
import { v4 as uuidv4 } from "uuid";

/**
 * Parse Excel file and extract runner data
 * @param {string} filePath - Path to the Excel file
 * @returns {Promise<Array>} Array of parsed runner data
 */
export const parseExcelFile = async (filePath) => {
  console.log(`Parsing Excel file: ${filePath}`);
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("Excel file does not contain any worksheets");
    }

    const runners = [];
    const skippedRows = [];

    // Skip header row
    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex > 1) {
        // Skip header row
        try {
          const fullNameValue = row.getCell(1).value?.toString().trim() || "";
          let name, surname;

          // Define common Lao name prefixes
          const laoPrefixes = ["ທ ", "ທ້າວ ", "ນ ", "ນາງ ", "ທ.", "ນ."];

          // Remove prefix if it exists
          let cleanName = fullNameValue;
          for (const prefix of laoPrefixes) {
            if (cleanName.startsWith(prefix)) {
              cleanName = cleanName.substring(prefix.length).trim();
              break; // Stop after first match
            }
          }

          if (cleanName.includes(" ")) {
            // Split by space if space exists
            const nameParts = cleanName.split(/\s+/);
            name = nameParts[0];
            surname = nameParts.slice(1).join(" ");
          } else {
            // If no space, use the full value as name and phone as surname
            name = cleanName;
            const phone = row.getCell(6).value?.toString().trim() || "";
            surname = phone;
          }
          const phone = row.getCell(6).value?.toString().trim();

          let gender = row.getCell(2).value?.toString().toLowerCase();
          if (gender === "ຍິງ" || gender === "female" || gender === "f") {
            gender = "female";
          } else {
            gender = "male"; // Default to male
          }

          const range =
            row.getCell(9).value?.toString().toLowerCase().trim() || "free";

          // Validate range values
          let validRange = range;
          if (!["free", "15", "42", "100", "200"].includes(range)) {
            validRange = "free";
          }

          const runner = {
            name: name,
            surname: surname,
            phone: phone,
            email: row.getCell(5).value?.toString().trim() || null,
            gender: gender,
            dob: row.getCell(3).value || null, // Assuming ISO date format
            national_id: 126, // Default to Laos if not specified
            range: validRange,
            size_shirt: row.getCell(8).value?.toString().trim() || null,
          };

          console.log("runner", runner);

          // Validate required fields
          if (runner.name && runner.surname && runner.phone) {
            runners.push(runner);
          } else {
            skippedRows.push({
              rowIndex,
              reason: "Missing required fields (name, surname, or phone)",
            });
          }
        } catch (error) {
          console.error(`Error parsing row ${rowIndex}:`, error);
          skippedRows.push({
            rowIndex,
            reason: `Error parsing data: ${error.message}`,
          });
        }
      }
    });

    console.log(
      `Successfully parsed ${runners.length} runners, skipped ${skippedRows.length} rows`,
    );
    if (skippedRows.length > 0) {
      console.log("Skipped rows:", skippedRows);
    }

    return runners;
  } catch (error) {
    console.error("Excel parsing error:", error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

/**
 * Process runner data and create/update database records
 * @param {Array} runnerData - Array of parsed runner data
 * @returns {Promise<Object>} Import results
 */
export const processRunners = async (runnerData) => {
  const results = {
    total: runnerData.length,
    imported: 0,
    skipped: 0,
    errors: [],
  };

  // Generate a random string for the default password
  const generateRandomPassword = (length = 8) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
  };

  const defaultPassword = generateRandomPassword();
  const encryptedPassword = await bcrypt.hash(defaultPassword, 10);

  for (const runner of runnerData) {
    try {
      // Check if phone already exists
      const existingUser = await db.User.findOne({
        where: { phone: runner.phone },
      });

      if (existingUser) {
        results.skipped++;
        continue;
      }

      // Start transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Format phone number (remove leading zeros if any)
        const formattedPhone = runner.phone.replace(/^0+/, "");

        // Generate email if not provided
        const email = runner.email || `${formattedPhone}@vari-run.com`;

        // Create user
        const user = await db.User.create(
          {
            name: runner.name,
            phone: formattedPhone,
            email: email,
            password: encryptedPassword,
            is_active: true,
            sub: uuidv4(), // Generate a unique ID
          },
          { transaction },
        );

        // Assign User role
        const userRole = await db.Role.findOne({ where: { name: "User" } });
        await user.addRole(userRole, { transaction });

        console.log({
          name: runner.name,
          surname: runner.surname,
          gender: runner.gender,
          dob: new Date(runner.dob || Date.now()),
          national_id: runner.national_id,
          range: runner.range,
          size_shirt: runner.size_shirt,
          bib: user.id.toString().padStart(5, "0"),
        });

        // Create user profile
        await user.createUserProfile(
          {
            name: runner.name,
            surname: runner.surname,
            gender: runner.gender,
            dob: new Date(runner.dob || Date.now()),
            national_id: runner.national_id,
            range: runner.range,
            size_shirt: runner.size_shirt,
            bib: user.id.toString().padStart(5, "0"),
          },
          { transaction },
        );

        // Initialize ranking
        await user.createRanking(
          {
            total_range: 0,
            total_time: 0,
          },
          { transaction },
        );

        await transaction.commit();
        results.imported++;
      } catch (error) {
        await transaction.rollback();
        results.errors.push({
          runner: `${runner.name} ${runner.surname} (${runner.phone})`,
          error: error.message,
        });
      }
    } catch (error) {
      results.errors.push({
        runner: `${runner.name} ${runner.surname} (${runner.phone})`,
        error: error.message,
      });
    }
  }

  return results;
};
