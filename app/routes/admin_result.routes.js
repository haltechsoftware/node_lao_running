import run_result from "../controllers/run_result.controller.js";
import auth from "../middleware/auth.middleware";
import role from "../middleware/role.middleware";
import express from "express";
const router = express.Router();

module.exports = app => {
  // Retrieve all run_results
  router.get("/", auth, role.hasRole(['Admin','Super_Admin']), run_result.findAllAdmin);

  router.get("/:id", auth, role.hasRole(['Admin','Super_Admin']), run_result.findOne);

  router.put("/:id", auth, role.hasRole(['Admin','Super_Admin']), run_result.update);

  app.use('/api/admin-results', router);
};