import otp from "../controllers/otp.controller.js";
import express from "express";

const router = express.Router();

module.exports = (app) => {
  // Create Otp
  router.post(
    "",
    otp.store,
  );

  // Resend Otp
  router.post(
    "/resend",
    otp.resendOtp,
  );

    // Resend Otp
  router.post(
    "/verify",
    otp.verifyOtp,
  );

  app.use("/api/otp", router);
};
