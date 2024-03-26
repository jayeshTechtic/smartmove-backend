/**
 * Routes/accountingRouter.js
 *
 * All the accountingController's API.
 */

const express = require("express");
const router = express.Router();
const accountingController = require("./accounting.controller");
const validateToken = require("../../jwtValidateToken").validateToken;

/*  add accounting  */
router.put("/addAccounting", validateToken, accountingController.addAccounting);
/*  update accounting  */
router.patch("/updateAccounting", validateToken, accountingController.updateAccounting);
/*  delete accounting  */
router.delete("/deleteAccounting", validateToken, accountingController.deleteAccounting);
/*  accounting list  */
router.get("/accountingList", validateToken, accountingController.accountingList);
/* set user budget */
router.patch("/addorUpdateUserBudget", validateToken, accountingController.setUserBudget);

module.exports = router;