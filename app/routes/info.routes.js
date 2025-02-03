import info from "../controllers/info.controller.js";
import express from "express";
import semiAuth from "../middleware/semiAuth.middleware";

const router = express.Router();

module.exports = app => {
  // Get all Package.
  router.get("/package", semiAuth, info.findAllPackage);

  // Get one Package.
  router.get("/package/:id", info.findOnePackage);

  // Get all Branche.
  router.get("/hal-branche", info.findAllBranche);

  // Get one Branche.
  router.get("/hal-branche/:id", info.findOneBranche);

  // Get all Nation.
  router.get("/national", info.findAllNation);

  // Get one Nation.
  router.get("/national/:id", info.findOneNation);

  // Get all Ranking.
  router.get("/ranking/", info.findAllRanking);


  // Get all Images.
  router.get("/image/", info.findAllImage);

  app.use('/api/info', router);
}