import summary from "../controllers/summary.controller.js";
import express from "express";
import auth from "../middleware/auth.middleware";
import role from "../middleware/role.middleware";

const router = express.Router();

module.exports = app => {
  // Get summary
  router.get("", auth, role.hasRole(['Admin', 'Super_Admin']), summary.summary);

  // Get total Range
  router.get("/package", summary.totalRange);

  app.use('/api/summary', router);
}