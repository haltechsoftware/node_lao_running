import express from "express";
import multer from "multer";
import path from "path";
import runner_import from "../controllers/runner_import.controller.js";
import auth from "../middleware/auth.middleware";
import role from "../middleware/role.middleware";

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/excel/");
  },
  filename: function (req, file, cb) {
    cb(null, `runner-import-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /xlsx|xls/;
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed!"));
  }
};

// Initialize upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = (app) => {
  // Import runners from Excel file
  router.post(
    "/import",
    auth,
    role.hasRole(["Admin", "Super_Admin"]),
    upload.single("file"),
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
