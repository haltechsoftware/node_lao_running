import fs from "fs";
import path from "path";
import Response from "../helpers/response.helper";
import Message from "../helpers/message.helper";
import Status from "../helpers/status.helper";
import { parseExcelFile, processRunners } from "../utils/excel";

/**
 * Import runners from Excel file
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.importRunners = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res
        .status(Status.code.BadRequest)
        .json({ message: "Please upload an Excel file" });
    }

    const filePath = req.file.path;

    try {
      // Parse the Excel file
      const runnerData = await parseExcelFile(filePath);

      if (!runnerData || runnerData.length === 0) {
        return res
          .status(Status.code.BadRequest)
          .json({ message: "No valid runner data found in the file" });
      }

      // Process the runner data
      const results = await processRunners(runnerData);

      // Delete the temporary file
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });

      return Response.success(res, Message.success._success, results);
    } catch (error) {
      // Delete the temporary file in case of error
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get import template
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getTemplate = (req, res, next) => {
  try {
    const templatePath = path.join(
      __dirname,
      "../../templates/runner_import_template.xlsx",
    );

    if (!fs.existsSync(templatePath)) {
      return res
        .status(Status.code.NotFound)
        .json({ message: "Template file not found" });
    }

    res.download(templatePath, "runner_import_template.xlsx");
  } catch (error) {
    next(error);
  }
};
