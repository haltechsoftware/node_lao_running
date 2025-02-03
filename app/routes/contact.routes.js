import contact from "../controllers/contact.controller.js";
import express from "express";
import auth from "../middleware/auth.middleware";
import role from "../middleware/role.middleware";
import validation from "../validations/contact.validation"

const router = express.Router();

module.exports = app => {
  // Create contact
  router.post("", validation.store, contact.store);
  // Delete contact
  router.delete("/:id", auth, role.hasRole(['Admin', 'Super_Admin']), contact.destroy);
  // Get a contact
  router.get("/:id", auth, role.hasRole(['Admin', 'Super_Admin']), contact.show);
  // Get contact
  router.get("", auth, role.hasRole(['Admin', 'Super_Admin']), contact.index);

  app.use('/api/contact', router);
}