import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../config/swagger.js";
import basicAuth from "express-basic-auth";

module.exports = (app) => {
  // Basic auth middleware for Swagger UI in production
  const swaggerAuth = basicAuth({
    users: { admin: process.env.SWAGGER_PASSWORD || "leenaa" },
    challenge: true,
    realm: "Lao Running API Documentation",
  });

  // Apply authentication middleware only in production
  const swaggerMiddleware = [swaggerAuth];

  // Mount Swagger UI with conditional authentication
  app.use(
    "/api-docs",
    ...swaggerMiddleware,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Lao Running API Documentation",
    }),
  );

  // Redirect /docs to /api-docs with the same auth requirements
  app.get("/docs", ...swaggerMiddleware, (req, res) => {
    res.redirect("/api-docs");
  });

  // Raw swagger.json endpoint, also protected in production
  app.get("/swagger.json", ...swaggerMiddleware, (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocument);
  });
};
