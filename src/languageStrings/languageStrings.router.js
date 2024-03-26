/**
 * Routes/scaleRouter.js
 *
 * All the scaleController's API.
 */

const express = require("express");
const router = express.Router();
const languageStringsController = require("./languageStrings.controllers");
const validateToken = require("../../jwtValidateToken").validateToken;

/*  add accounting  */
router.put("/addlanguageString", validateToken, languageStringsController.addLanguageStrings);
/*  update accounting  */
router.patch("/updatelanguageString", validateToken, languageStringsController.updateLanguageStrings);
/*  delete accounting  */
router.delete("/deletelanguageString", validateToken, languageStringsController.deleteLanguageStrings);
/*  accounting list  */
router.get("/languageStringBasedOnUserSelectedLanguage", languageStringsController.languageStringsList);

module.exports = router;