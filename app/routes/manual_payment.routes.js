import express from "express";
const router = express.Router();
import manualPaymentController from "../controllers/manual_payment.controller";
import multer from "multer";
import auth from "../middleware/auth.middleware";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

export default router;

module.exports = (app) => {
  // User routes
  router.post(
    "/",
    auth,
    upload.single("payment_slip"),
    manualPaymentController.create,
  );
  router.get("/", auth, manualPaymentController.findAll);

  // Admin routes
  router.get("/admin", auth, manualPaymentController.findAllAdmin);
  router.get("/:id", auth, manualPaymentController.findOne);
  router.put("/:id/approve", auth, manualPaymentController.approve);
  router.put("/:id/reject", auth, manualPaymentController.reject);

  app.use("/api/slip", router);
};
