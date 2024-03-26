/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planImagesSchema = new Schema({
  plan_image: {
    type: String,
  },
  plan_image_mime_type: {
    type: String,
  },
});

const subscription = new Schema({
  plan_title: {
    type: String,
    required: [true, "Plan Name should not be empty"],
  },
  description: {
    type: String,
    required: [true, "description should not be empty"],
  },
  price: {
    type: Number,
    required: [true, "price should not be empty"],
  },
  currency: {
    type: String,
  },
  language_code: {
    type: String,
    required: ["Language code should not be empty"],
  },
  button_text: {
    type: String,
  },
  plan_icon: {
    type: String,
  },
  plan_icon_mime_type: {
    type: String,
  },
  plan_images: [planImagesSchema],
  package_key: {
    type: String,
  },
  created_dt: {
    type: Date,
    default: Date.now(),
  },
  updated_dt: {
    type: Date,
  },
});

const SubscriptionModel = mongoose.model("Subscription", subscription);

module.exports = SubscriptionModel;
