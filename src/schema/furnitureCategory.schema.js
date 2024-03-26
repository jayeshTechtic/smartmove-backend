/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const furnitureCategory = new Schema({
  furniture_category_name: {
    type: String,
    required: ["Furniture Category name should not be empty"],
  },
  furniture_category_image: {
    type: String,
    // required: ["Furniture Category image should not be empty"]
  },
  furniture_image_mime_type: {
    type: String,
  },
  smartMove: {
    type: String,
    default: "fasle",
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    default: null,
  },
  profile_id: {
    type: Schema.Types.ObjectId,
    // ref: "Users",
    default: null,
  },
  created_dt: {
    type: Date,
    default: Date.now(),
  },
  updated_dt: {
    type: Date,
  },
});

const FurnitureCatModel = mongoose.model(
  "FurnitureCategory",
  furnitureCategory
);

module.exports = FurnitureCatModel;
