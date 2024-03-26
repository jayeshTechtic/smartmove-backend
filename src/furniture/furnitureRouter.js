/**
 * Routes/furnitureRouter.js
 *
 * All the furniture's API.
 */

const express = require("express");
const router = express.Router();
const furnitureController = require("./furniture.controller");
const validateToken = require("../../jwtValidateToken").validateToken;
const multer = require("multer");
// Set up Multer for file upload
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public/furniturecategoryimage"); // Uploads will be stored in the 'public/' directory
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });

// const upload = multer({ storage: storage });

/*  add furniture  */
router.put("/addFurniture", validateToken, furnitureController.addFurniture);
/*  update furniture  */
router.patch(
  "/updateFurniture",
  validateToken,
  furnitureController.updateFurniture
);
/*  delete furniture  */
router.delete(
  "/deleteFurniture",
  validateToken,
  furnitureController.deleteFurniture
);
/*  furniture list  */
router.get(
  "/FurnitureList",
  validateToken,
  furnitureController.getFurnitureList
);
/*  mark furniture as fav  */
router.patch(
  "/markAsFav",
  validateToken,
  furnitureController.markFurnitureAsfav
);
/*  mark furniture as purchased  */
router.patch(
  "/purchaseFurniture",
  validateToken,
  furnitureController.addFurnitureAsPurchased
);
/* get purchased list */
router.get(
  "/purchasedList",
  validateToken,
  furnitureController.getPurchasedFurniture
);
/* get favourite list */
router.get("/favList", validateToken, furnitureController.getFavFurniture);
/*  add furniture category  */
// router.put("/addFurnitureCategory", validateToken, upload.single("furniture_category_image"), furnitureController.addFurnitureCategory)
router.put(
  "/addFurnitureCategory",
  validateToken,
  furnitureController.addFurnitureCategory
);
/* update furniture category */
// router.patch(
//   "/updateFurnitureCategory",
//   validateToken,
//   upload.single("furniture_category_image"),
//   furnitureController.updateFurnitureCategory
// );
// /* delete furniture category */
// router.delete("/deleteFurnitureCategory/:furniture_category_id", validateToken, furnitureController.deleteFurnitureCategory)
/* furniture category list */
router.get(
  "/furnitureCategoryList/:profile_id",
  validateToken,
  furnitureController.getFurnitureCategoryList
);

module.exports = router;
