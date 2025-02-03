import run_result from "../controllers/run_result.controller.js";
import auth from "../middleware/auth.middleware";
import role from "../middleware/role.middleware";
import upload from '../utils/multer'
import express from "express";
import request from '../validations/run_result.validation'
const router = express.Router();

module.exports = app => {

  // Create a new run_result
  router.post("/", auth, role.hasRole('User'), upload.single('image'), run_result.create);

  // Retrieve all run_results
  router.get("/", auth, role.hasRole('User'), run_result.findAll);

  // Retrieve a single run_result with id
  router.get("/:id", auth, role.hasRole('User'), run_result.findOne);

  // Update a run_result with id
  router.put("/:id", auth, role.hasRole('User'), run_result.update);

  // Delete a run_result with id
  router.delete("/:id", auth, role.hasRole('User'), run_result.delete);

  app.use('/api/run-results', router);
};