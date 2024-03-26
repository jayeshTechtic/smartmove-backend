/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shoppingCategory = new Schema({
  shopping_category_name: {
    type: String,
    required: ["Shopping Category name should not be empty"],
  },
  smartMove: {
    type: String,
    default: "false",
  },
  shopping_category_image: {
    type: String,
    // required: ["Shopping Category image should not be empty"]
  },
  shopping_image_mime_type: {
    type: String,
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

const ShoppingCatModel = mongoose.model("ShoppingCategory", shoppingCategory);

module.exports = ShoppingCatModel;
