import { body } from "express-validator";

exports.create = [
  body("package_id")
    .not()
    .isEmpty()
    .withMessage("Package ID is required")
    .isNumeric()
    .withMessage("Package ID must be a number"),
  body("address").not().isEmpty().withMessage("Address is required"),
];

exports.approve = [body("notes").optional()];

exports.reject = [
  body("notes").not().isEmpty().withMessage("Rejection reason is required"),
];
