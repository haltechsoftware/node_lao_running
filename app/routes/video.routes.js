import video from "../controllers/video.controller.js";
import express from "express";
import auth from "../middleware/auth.middleware";
import role from "../middleware/role.middleware";
import validation from "../validations/video.validation"

const router = express.Router();

module.exports = app => {
  // Create video
  router.post("", auth, role.hasRole(['Admin', 'Super_Admin']), validation.store, video.store);
  // Delete video
  router.delete("/:id", auth, role.hasRole(['Admin', 'Super_Admin']), video.destroy);
  // Get a video
  router.get("/:id", video.show);
  // Get video
  router.get("", video.index);

  app.use('/api/video', router);
}