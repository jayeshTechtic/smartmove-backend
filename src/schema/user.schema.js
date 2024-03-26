/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deviceSchema = new Schema({
  type: {
    type: String,
    required: [true, "Device type should not be empty"],
  },
  token: {
    type: String,
    required: [true, "Device token should not be empty"],
  },
});

const profilesSchema = new Schema({
  profile_name: {
    type: String,
    // required: [true, "Profile name should not be empty"],
  },
  created_dt: {
    type: Date,
    default: Date.now(),
  },
  updated_dt: {
    type: Date,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  user_budget: {
    type: String,
    default: null,
  },
});

const user = new Schema({
  first_name: {
    type: String,
    required: [true, "First Name should not be empty"],
  },
  last_name: {
    type: String,
    required: [true, "Last Name should not be empty"],
  },
  email: {
    type: String,
    required: [true, "Email should not be empty"],
  },
  password: {
    type: String,
  },
  salt: {
    type: String,
  },
  user_type: {
    type: String,
    enum: ["admin", "user", "sub-admin"],
    default: "user",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "blocked", "newuser"],
    default: "active",
  },
  dob: {
    type: Date,
  },
  country: {
    type: String,
  },
  region: {
    type: String,
  },
  language: {
    type: String,
    enum: ["en", "de", "fr", "it"],
    default: "de",
  },
  notify_me: {
    type: Boolean,
    default: false,
  },
  currency: {
    type: String,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  subcription: {
    type: String,
    enum: ["free tier", "function extension", "smartmove premium"],
    default: "free tier",
  },
  device: [deviceSchema],
  social_type: {
    type: String,
    enum: ["google", "facebook", "apple"],
  },
  social_id: {
    type: String,
  },
  reset_token: {
    type: String,
  },
  reset_token_expiry: {
    type: Date,
  },
  is_user_invited: {
    type: Boolean,
    default: false,
  },
  invited_user_id: {
    type: Schema.Types.ObjectId,
    ref: "invitedusers",
    default: null,
  },
  is_t_and_c_checked: {
    type: Boolean,
    default: false,
  },
  is_privacy_policy_checked: {
    type: Boolean,
    default: false,
  },
  is_email_verified: {
    type: Boolean,
    default: false,
  },
  // user_budget: {
  //   type: String,
  //   default: null,
  // },
  profile_name: {
    type: String,
    default: null,
  },
  profiles: [profilesSchema],
  created_dt: {
    type: Date,
    default: Date.now(),
  },
  updated_dt: {
    type: Date,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  is_loggedId: {
    type: Boolean,
    default: false,
  },
  is_social_login: {
    type: Boolean,
    default: false,
  },
});

const UserModel = mongoose.model("User", user);

module.exports = UserModel;
