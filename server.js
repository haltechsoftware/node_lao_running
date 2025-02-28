import express from "express";
import cors from "cors";
import "dotenv/config";
import createError from "http-errors";
import Response from "./app/helpers/response.helper";
import Message from "./app/helpers/message.helper";
// Remove direct swagger imports as they'll be handled through routes
// import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "./app/config/swagger.js";

const { ValidationError } = require("express-validation");
const app = express();

const corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://146.190.81.44",
    "http://146.190.81.44:3000",
    "https://running.kaiymuan.com",
    "https://virtual-run.varilao.com",
    "https://virtual-run.varilao.com/",
  ],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  }),
);

// Remove direct Swagger UI setup as it's now in swagger.routes.js
// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocument, {
//     explorer: true,
//     customCss: ".swagger-ui .topbar { display: none }",
//     customSiteTitle: "Lao Running API Documentation",
//   }),

import manual_payment from "./app/routes/manual_payment.routes";
manual_payment(app);

import otp from "./app/routes/otp.routes";
otp(app);

// Add swagger routes
import swagger from "./app/routes/swagger.routes";
swagger(app);

import admin from "./app/routes/admin_result.routes";
admin(app);

import run from "./app/routes/run_result.routes";
run(app);

import user from "./app/routes/user.routes";
user(app);

import runner from "./app/routes/runner.routes";
runner(app);

import info from "./app/routes/info.routes";
info(app);

import summary from "./app/routes/summary.routes";
summary(app);

import video from "./app/routes/video.routes";
video(app);

import contact from "./app/routes/contact.routes";
contact(app);

import error from "./app/routes/error.routes";
error(app);

process.on("unhandledRejection", function (err) {
  console.error("unhandledRejection: ", err);
  process.exit(1); // Exit the process to prevent unstable state
});

process.on("SequelizeValidationError", function (err) {
  console.log(555555, err);
});

app.use((req, res, next) => {
  const error = createError(404, Message.fail._routeNotfound);
  next(error);
});

app.use((error, req, res) => {
  console.log(error);
  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json(error);
  }

  Response.error(res, error);
});

// set port, listen for requests
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
