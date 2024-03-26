/**
 * Routes/LanguageRouter.js
 *
 * All the languageController's API.
 */

const express = require("express");
const router = express.Router();
const languageController = require("./language.controller");
// const validateToken = require("../../jwtValidateToken").validateToken;

/*  get languages list  */
router.get("/languagesList", languageController.getListofLanguages);
/*  add language  */
router.post("/language", languageController.addLanguage);

module.exports = router;
