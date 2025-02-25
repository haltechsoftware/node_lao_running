import multer from "multer";
import Status from "../helpers/status.helper";

/**
 * Handle Multer-specific errors
 *
 * @param {Error} err - Error object from Multer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(Status.code.BadRequest).json({
        message: "File size too large. Maximum size is 10MB.",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(Status.code.BadRequest).json({
        message: "Unexpected field or too many files uploaded.",
      });
    }

    return res.status(Status.code.BadRequest).json({
      message: `File upload error: ${err.message}`,
    });
  } else {
    // Non-Multer error
    return res.status(Status.code.InternalServerError).json({
      message: err.message || "An unknown error occurred during file upload.",
    });
  }
};

/**
 * General error handling middleware
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || Status.code.InternalServerError;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
