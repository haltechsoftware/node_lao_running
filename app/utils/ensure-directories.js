import fs from "fs";
import path from "path";

/**
 * Ensure all required directories exist
 */
export const ensureDirectories = () => {
  const directories = ["uploads", "uploads/excel", "templates"];

  directories.forEach((dir) => {
    const fullPath = path.join(__dirname, "../../", dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  });
};

// Run once at startup
ensureDirectories();
