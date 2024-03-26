/**
 * Routes/userFeedbackRouter.js
 *
 * All the userFeedbackController's API.
 */

const express = require("express");
const router = express.Router();
const userFeedbackController = require("./userfeedback.controller");
const validateToken = require("../../jwtValidateToken").validateToken;

/*  add userFeedback  */
router.put(
  "/addUserFeedback",
  validateToken,
  userFeedbackController.addfeedback
);
/*  get userFeedback  */
router.get("/userFeedback", validateToken, userFeedbackController.getfeedback);

module.exports = router;
