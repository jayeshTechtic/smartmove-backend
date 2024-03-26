/**
 * Routes/userRouter.js
 *
 * All the User's API.
 */

const express = require("express");
const router = express.Router();
const interactionController = require("./interactionController");
const validateToken = require("../../jwtValidateToken").validateToken;

/* Set intractions */
router.post("/", validateToken, interactionController.setIntractions);

module.exports = router;
