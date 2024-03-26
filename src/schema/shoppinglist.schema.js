/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shoppingList = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: [true, "User Id should not be empty"],
  },
  shopping_category_id: {
    type: Schema.Types.ObjectId,
    ref: "shoppingcategories",
    required: [true, "Shopping Category Id should not be empty"],
  },
  shopping_item_name: {
    type: String,
    required: [true, "Shopping Item Name should not be empty"],
  },
  price: {
    type: String,
    required: false,
  },
  is_completed: {
    type: Boolean,
    default: false,
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

const ShoppingModel = mongoose.model("ShoppingList", shoppingList);

module.exports = ShoppingModel;
