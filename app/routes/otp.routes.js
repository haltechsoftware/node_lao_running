import otp from "../controllers/otp.controller.js";
import express from "express";

const router = express.Router();

module.exports = (app) => {
  // Create Otp
  router.post(
    "",
    otp.store,
  );

  app.use("/api/otp", router);
};
