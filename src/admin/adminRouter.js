/**
 * Routes/adminRouter.js
 *
 * All the admin's API.
 */

const express = require("express");
const router = express.Router();
const adminController = require("./adminController");
const validateToken = require("../../jwtValidateToken").validateToken;
const multer = require("multer");
// Set up Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/categoryimage"); // Uploads will be stored in the 'public/' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

/*  Admin Login  */
router.put("/login", adminController.adminLogin);
/*  Admin Refresh Token  */
router.put("/refreshToken", validateToken, adminController.refreshToken);
/*  Forgot Password  */
router.put("/forgotPassword", adminController.forgotPassowrd);
/*  Reset Password  */
router.post("/resetPassword", adminController.resetPassword);
/* Verify User */
router.patch("/userVerification", validateToken, adminController.verifyProfile);
/* Verify User */
router.put("/userSubVerification", validateToken, adminController.verifySubAdminProfile);
/*  User List  */
router.get(
  "/userList",
  validateToken,
  adminController.getUserListForAdminLogin
);
/* details of user by its id */
router.get(
  "/getDataByUserId/:id",
  validateToken,
  adminController.getDataByUserId
);
/* update updateUserDetails */
router.patch(
  "/updateUserDetails",
  validateToken,
  adminController.updateUserDetails
);

/* remove the user */
router.patch("/removeUser/:id", validateToken, adminController.removeTheUser);
/* blocked the user */
router.put("/blockUser/:id", validateToken, adminController.blockTheUser);
// unblocked user
router.put("/unblockUser/:id", validateToken, adminController.unblockTheUser);
// delete user api
router.delete(
  "/deleteAdminUser/:id",
  validateToken,
  adminController.deleteAdminUser
);
/* add the user */
router.put("/addTheUser", validateToken, adminController.addTheUser);
router.put("/sendMailAgain", validateToken, adminController.sendVerificationMailAgain);

/* admin logout */
router.post("/adminLogout", validateToken, adminController.logout);
/* create category */
router.put("/addCategory", validateToken, adminController.addCategories);
/* update category */
router.patch("/updateCategory", validateToken, adminController.updateCategory);
/* delete category */
router.delete("/deleteCategory", validateToken, adminController.deleteCategory);
/* category list */
router.get("/categoryList", validateToken, adminController.getCategoryList);
/*  add furniture category  */
router.put(
  "/addFurnitureCategory",
  validateToken,
  upload.single("furniture_category_image"),
  adminController.addFurnitureCategory
);
/* update furniture category */
router.patch(
  "/updateFurnitureCategory",
  validateToken,
  upload.single("furniture_category_image"),
  adminController.updateFurnitureCategory
);
/* delete furniture category */
router.delete(
  "/deleteFurnitureCategory/:furniture_category_id",
  validateToken,
  adminController.deleteFurnitureCategory
);
/* furniture category list */
router.get(
  "/furnitureCategoryList",
  validateToken,
  adminController.getFurnitureCategoryListForAdminLogin
);
/*  add Shopping category  */
router.put(
  "/addShoppingCategory",
  validateToken,
  upload.single("shopping_category_image"),
  adminController.addShoppingCategory
);
/* update Shopping category */
router.patch(
  "/updateShoppingCategory",
  validateToken,
  upload.single("shopping_category_image"),
  adminController.updateShoppingCategory
);
/* delete Shopping category */
router.delete(
  "/deleteShoppingCategory/:shopping_category_id",
  validateToken,
  adminController.deleteShoppingCategory
);
/* Shopping category list */
router.get(
  "/ShoppingCategoryList",
  validateToken,
  adminController.getShoppingCategoryList
);

/* Analytics Routes */
/* Get Analytics */
router.get("/getAnalytics", validateToken, adminController.getAnalytics);
router.post(
  "/updateUserDetails",
  validateToken,
  adminController.userAdminUpdatedList
);

/* upload terms and condition and privacy policy files based on languages */
router.put(
  "/uploadTermsandConditionFiles",
  validateToken,
  adminController.uploadTermsandConditionandPrivacyPolicy
);

/* upload terms and condition based on languages */
router.put(
  "/uploadTermsandCondition",
  validateToken,
  adminController.uploadTermsandCondition
);

/* upload privacy policy based on languages */
router.put(
  "/uploadPrivacyPolicy",
  validateToken,
  adminController.uploadPrivacyPolicy
);

/*admin  Verify User */
router.put("/adminVerification", validateToken, adminController.verifyProfile);
// Get Subscriptions
router.get(
  "/subscription/:language_code?",
  validateToken,
  adminController.getSubscriptions
);
// Add Subscription
router.post(
  "/subscription",
  validateToken,
  upload.any(),
  adminController.addSubscription
);
// Update Subscription
router.put(
  "/subscription",
  validateToken,
  upload.any(),
  adminController.updateSubscription
);
// Delete Subscription
router.delete(
  "/subscription/:id",
  validateToken,
  adminController.deleteSubscription
);
// GET sub User
router.get(
  "/userSubAdminList",
  validateToken,
  adminController.getUserSubListForAdminLogin
);

// add sub user
router.put(
  "/addTheSubAdminUser",
  validateToken,
  adminController.addTheSubAdminUser
);
// update sub admin
router.post(
  "/updateSubAdminDetails",
  validateToken,
  adminController.userSubAdminUpdatedList
);
// get access settings
router.get("/accessSettings", validateToken, adminController.getAccessSettings);
// update access settings
router.put(
  "/accessSettings",
  validateToken,
  adminController.updateAccessSettings
);

// inform users via mail
router.post(
  "/informUsersViaMail",
  validateToken,
  adminController.informUserViaMail
);

module.exports = router;
