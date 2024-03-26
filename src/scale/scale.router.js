/**
 * Routes/scaleRouter.js
 *
 * All the scaleController's API.
 */

const express = require("express");
const router = express.Router();
const scaleController = require("./scale.controller");
const validateToken = require("../../jwtValidateToken").validateToken;

/*  add accounting  */
router.put("/addScaling", validateToken, scaleController.addScaleMeasurement);
/*  update accounting  */
router.patch(
  "/updateScaling",
  validateToken,
  scaleController.updateScaleMeasurement
);
/*  delete accounting  */
router.delete(
  "/deleteScaling",
  validateToken,
  scaleController.deleteScaleMeasurement
);
/*  accounting list  */
router.get("/scalingList", validateToken, scaleController.scaleMeasurementList);

/*  add Scale Measurement  */
router.post(
  "/addScaleMeasurement",
  validateToken,
  scaleController.addScaleMeasurements
);
/*  update Scale Measurement  */
router.put(
  "/updateScaleMeasurement",
  validateToken,
  scaleController.updateScaleMeasurements
);
/*  delete Scale Measurement */
router.delete(
  "/deleteScaleMeasurement",
  validateToken,
  scaleController.deleteScaleMeasurements
);
/*  get Scale Measurement  */
router.put(
  "/getScaleMeasurements",
  validateToken,
  scaleController.getScaleMeasurements
);

module.exports = router;
