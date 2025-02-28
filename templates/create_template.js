import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

async function createTemplate() {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Runners");

  // Define the columns
  worksheet.columns = [
    { header: "Name", key: "name", width: 20 },
    { header: "Surname", key: "surname", width: 20 },
    { header: "Phone", key: "phone", width: 15 },
    { header: "Email (optional)", key: "email", width: 30 },
    { header: "Gender (male/female)", key: "gender", width: 15 },
    { header: "Date of Birth (YYYY-MM-DD)", key: "dob", width: 20 },
    { header: "National ID (default: 126)", key: "national_id", width: 20 },
    { header: "Range (free/15/42/100/200)", key: "range", width: 25 },
    { header: "Shirt Size (optional)", key: "size_shirt", width: 15 },
  ];

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Add a sample row with notes
  worksheet.addRow({
    name: "John",
    surname: "Doe",
    phone: "2055012345",
    email: "john.doe@example.com",
    gender: "male",
    dob: "1990-01-01",
    national_id: "126",
    range: "free",
    size_shirt: "L",
  });

  // Ensure directory exists
  const dir = path.dirname(path.join(__dirname, "runner_import_template.xlsx"));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Save the template
  await workbook.xlsx.writeFile(
    path.join(__dirname, "runner_import_template.xlsx"),
  );
  console.log("Template created successfully!");
}

createTemplate().catch((err) => console.error(err));

// NOTE: Run this script once to generate the template file
// node -r esm templates/create_template.js
