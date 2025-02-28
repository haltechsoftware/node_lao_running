import express from "express";
import multer from "multer";
import path from "path";
import runner_import from "../controllers/runner_import.controller.js";
import auth from "../middleware/auth.middleware";
import role from "../middleware/role.middleware";
import fs from "fs";

const router = express.Router();

// Ensure the uploads directory exists
const uploadDir = "uploads/excel/";
console.log(!fs.existsSync(uploadDir));

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `runner-import-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Excel files can have various mimetypes
  const validMimeTypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel.sheet.macroEnabled.12",
    "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
  ];

  const validExtensions = /xlsx|xls/i;
  const extname = validExtensions.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = validMimeTypes.includes(file.mimetype);

  console.log(
    `File upload attempt: ${file.originalname}, mimetype: ${file.mimetype}`,
  );

  if (extname && mimetype) {
    return cb(null, true);
  } else if (!extname) {
    return cb(new Error("Only .xlsx or .xls files are allowed!"));
  } else {
    return cb(
      new Error(
        "Invalid Excel file format. Please ensure you're uploading a valid Excel file.",
      ),
    );
  }
};

// Initialize upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB limit
});

module.exports = (app) => {
  // Import runners from Excel file
  router.post(
    "/import",
    auth,
    role.hasRole(["Admin", "Super_Admin"]),
    (req, res, next) => {
      upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          return res.status(400).json({
            message: `Upload error: ${err.message}`,
            error: "MULTER_ERROR",
          });
        } else if (err) {
          // An unknown error occurred when uploading
          return res.status(400).json({
            message: err.message,
            error: "FILE_FILTER_ERROR",
          });
        }
        // Everything went fine
        next();
      });
    },
    runner_import.importRunners,
  );

  // Get import template
  router.get(
    "/template",
    auth,
    role.hasRole(["Admin", "Super_Admin"]),
    runner_import.getTemplate,
  );

  app.use("/api/runners", router);
};
