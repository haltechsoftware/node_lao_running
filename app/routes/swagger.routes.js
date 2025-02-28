import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../config/swagger.js";

const router = express.Router();

module.exports = (app) => {
  // Mount Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Lao Running API Documentation",
    }),
  );

  // Redirect root to API docs
  app.get("/docs", (req, res) => {
    res.redirect("/api-docs");
  });

  // Raw swagger.json endpoint
  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocument);
  });
};
