/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accounting = new Schema({
  accounting_title: {
    type: String,
    required: ["Accounting title should not be empty"],
  },
  price: {
    type: String,
    required: ["Price should not be empty"],
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "Users",
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

const AccountingModel = mongoose.model("Accounting", accounting);

module.exports = AccountingModel;
