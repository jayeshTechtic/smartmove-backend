/**
 * Routes/country.router.js
 *
 * All the country's API.
 */

const express = require("express");
const router = express.Router();
const validateToken = require("../../jwtValidateToken").validateToken;
const countryController = require("../country&Region/country.controller");

// router.post("/addCountry", validateToken, countryController.addCountry);
router.get("/getCountryAndRegionLists", (req, res, next) => {
    // Check if req.header.token is present
    if (req.header('Authorization')) {
        // If token is present, apply validateToken middleware
        validateToken(req, res, next);
    } else {
        // If token is not present, proceed without validateToken middleware
        next();
    }
}, countryController.getCountryAndRegion);

module.exports = router;



