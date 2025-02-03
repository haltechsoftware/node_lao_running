    import error from "../controllers/error.controller.js";
    import express from "express";

    const router = express.Router();

    module.exports = app => {
      // Get Error.
      router.get("/error", error.error);

      app.use('/api', router);
    }