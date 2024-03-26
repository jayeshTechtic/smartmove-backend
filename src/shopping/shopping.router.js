/**
 * Routes/ShoppingRouter.js
 *
 * All the Shopping's API.
 */

const express = require("express");
const router = express.Router();
const ShoppingController = require("./shopping.controller");
const validateToken = require("../../jwtValidateToken").validateToken;
const multer = require("multer");
// Set up Multer for file upload
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public/Shoppingcategoryimage"); // Uploads will be stored in the 'public/' directory
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });

// const upload = multer({ storage: storage });

/*  add Shopping category  */
// router.put(
//   "/addShoppingCategory",
//   validateToken,
//   upload.single("shopping_category_image"),
//   ShoppingController.addShoppingCategory
// );
router.put(
  "/addShoppingCategory",
  validateToken,
  ShoppingController.addShoppingCategory
);
/* update Shopping category */
// router.patch(
//   "/updateShoppingCategory",
//   validateToken,
//   upload.single("shopping_category_image"),
//   ShoppingController.updateShoppingCategory
// );
// router.patch(
//   "/updateShoppingCategory",
//   validateToken,
//   ShoppingController.updateShoppingCategory
// );
/* delete Shopping category */
// router.delete("/deleteShoppingCategory/:shopping_category_id", validateToken, ShoppingController.deleteShoppingCategory)
/* Shopping category list */
router.get(
  "/ShoppingCategoryList/:profile_id",
  validateToken,
  ShoppingController.getShoppingCategoryList
);
/* Add Shopping Items */
router.put(
  "/addShoppingItems",
  validateToken,
  ShoppingController.addShoppingList
);
/* Update Shopping Items */
router.patch(
  "/updateShoppingItem",
  validateToken,
  ShoppingController.updateShoppingList
);
/* Delete Shopping Items */
router.delete(
  "/deleteShoppingItem",
  validateToken,
  ShoppingController.deleteShoppingList
);
/* list Shopping Items */
router.get(
  "/listShoppingItem",
  validateToken,
  ShoppingController.getShoppingItemList
);

module.exports = router;
