import user from "../controllers/user.controller.js";
import express from "express";
import auth from "../middleware/auth.middleware";
import role from "../middleware/role.middleware";
import validation from "../validations/user.validation"

const router = express.Router();

module.exports = app => {
  // Login User
  router.post("/login", validation.login, user.login);

  // Get User by token
  router.post("/me", auth, user.me);

  // Create Admin
  router.post("/admin", auth, role.hasRole(['Admin', 'Super_Admin']), user.createAdmin);

  // Get all Admin
  router.get("/admin", auth, role.hasRole(['Admin', 'Super_Admin']), user.getAllAdmin);

  // Get One Admin
  router.get("/admin/:id", auth, role.hasRole(['Admin', 'Super_Admin']), user.getOneAdmin);

  // Delete a Admin
  router.delete("/admin/:id", auth, role.hasRole('Super_Admin'), user.destroyAdmin);

  // Delete a Admin
  router.put("/admin/:id", auth, role.hasRole('Super_Admin'), validation.resetPassword, user.resetPasswordAdmin);

  // Delete a Admin
  router.post("/reset-password", validation.resetPasswordUser, user.resetPasswordUser);

  app.use('/api/auth', router);
}