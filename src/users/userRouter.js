/**
 * Routes/userRouter.js
 *
 * All the User's API.
 */

const express = require("express");
const router = express.Router();
const userController = require("./userController");
const validateToken = require("../../jwtValidateToken").validateToken;

/*  User Registation  */
router.put("/registration", userController.userRegistration);
router.put("/resendMail", userController.resendMail);
/* Verify registered user */
router.patch("/verifyRegUser", userController.verifyRegisteredUser);
router.put("/verifyRegUser", userController.verifyRegisteredUser);
/*  User Login  */
router.put("/login", userController.userLogin);
/* Social media Login */
router.put("/socialLogin", userController.userSocialMediaLogin);
/*  Refresh Token  */
// router.put("/refreshToken", validateToken, userController.refreshToken);
/*  Forgot Password  */
router.put("/forgotPassword", userController.forgotPassowrd);
/*  Reset Password  */
router.post("/resetPassowrd", userController.resetPassword);
/*  User update profile account  */
router.post(
  "/updateUserAccount",
  validateToken,
  userController.userUpdateAccount
);
/* Logout */
router.patch("/logout", validateToken, userController.userLogout);
/* get user data */
router.get("/userData/:id", validateToken, userController.getUserdataBasedOnId);
/* delete user */
router.delete("/deleteUser/:id", validateToken, userController.deleteUser);
/* set language */
router.patch("/changeLanguage", validateToken, userController.setLanguage);
/* set currency */
router.patch("/changeCurrency", validateToken, userController.setCurrency);
/* set user notification */
router.patch("/setnotification", validateToken, userController.setnotification);
/* send invitation to the user */
router.put("/sendInvitationEmail", validateToken, userController.inviteUser);
/* Verify invited user */
router.patch(
  "/verifyInviteUser",
  validateToken,
  userController.verifyInviteUser
);
/* Verify invited user */
router.get(
  "/ListOfInvitedUser",
  validateToken,
  userController.getListOfInvitedUser
);
/* Delete co user */
router.delete("/deleteCoUser", validateToken, userController.deleteCoUser);
/* Update t&c and Privacy Policy */
router.patch(
  "/updateTandCPrivacyPolicy",
  validateToken,
  userController.updateTandCPrivacyPolicy
);
/* Get terms and condition and privacy policy based on logged in user */
// router.get(
//   "/termsConditionAndPrivacyPolicy",
//   validateToken,
//   userController.getListOfTermsAndConditionBasedOnLanguageSelected
// );
router.get(
  "/termsConditionAndPrivacyPolicy/:languageCode?",
  userController.getListOfTermsAndConditionBasedOnLanguageSelected
);

router.get(
  "/termsAndCondition/:languageCode?",
  userController.getTermsAndConditionByLanguage
);

router.get(
  "/privacyPolicy/:languageCode?",
  userController.getPrivacyPlicyByLanguage
);

/* update invited user name */
router.put(
  "/updateInvitedUserName",
  validateToken,
  userController.updateInvitedUserName
);

/* check-validation for In app purchase subscriptons for Android*/
router.post(
  "/savesubscriptionAndroid",
  validateToken,
  userController.IAPValidationAndroid
);

/* check-validation for In app purchase subscriptons for IOS*/
router.post(
  "/check-validation",
  validateToken,
  userController.IAPValidationIOS
);
router.post(
  "/savesubscription",
  validateToken,
  userController.savesubscription
);

/* create user relocation profile */
router.post(
  "/createUserRelocationProfile",
  validateToken,
  userController.createUserProfile
);
/* get user relocation profile */
router.get(
  "/getUserRelocationProfile",
  validateToken,
  userController.getUserProfile
);
/* delete user relocation profile */
router.delete(
  "/deleteUserRelocationProfile/:id",
  validateToken,
  userController.deleteUserProfile
);

/* invite a co user */
router.post("/inviteaCouser", validateToken, userController.inviteaCouser);

/* Verify invited user */
router.post(
  "/verifyInvitation",
  validateToken,
  userController.verifyInvitation
);

/* get invited user relocation profile */
router.put(
  "/getInvitedUserRelocationProfile",
  validateToken,
  userController.getInvitedUserProfile
);

/* get invited user relocation profile */
router.put(
  "/renameUserRelocationProfile",
  validateToken,
  userController.renameUserRelocationProfile
);

/* delete co-user */
router.delete("/removeCouser", validateToken, userController.removeCouser);

/* Notification count */
router.get(
  "/notificationCount",
  validateToken,
  userController.notificationCount
);

module.exports = router;
