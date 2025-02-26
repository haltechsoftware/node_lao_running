import express from "express";
const router = express.Router();
import manualPaymentController from "../controllers/manual_payment.controller";
import multer from "multer";
import auth from "../middleware/auth.middleware";
import { handleMulterError } from "../middleware/error.middleware";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default router;

module.exports = (app) => {
  // User routes
  router.post(
    "/",
    auth,
    (req, res, next) => {
      upload.single("payment_slip")(req, res, (err) => {
        if (err) {
          handleMulterError(err, req, res, next);
        } else {
          next();
        }
      });
    },
    manualPaymentController.create,
  );
  router.get("/", auth, manualPaymentController.findAll);

  // Get current user payment with package
  router.get("/current", auth, manualPaymentController.getCurrentUserPayment);

  // Admin routes
  router.get("/admin", auth, manualPaymentController.findAllAdmin);
  router.get("/:id", auth, manualPaymentController.findOne);
  router.put("/:id/approve", auth, manualPaymentController.approve);
  router.put("/:id/reject", auth, manualPaymentController.reject);
  router.put(
    "/upload-slip",
    auth,
    upload.single("payment_slip"),
    manualPaymentController.uploadSlip,
  );
  app.use("/api/slip", router);
};
