/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accessOptionsSchema = new Schema(
  {
    view: {
      type: Boolean,
      default: false,
    },
    edit: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const accessesSchema = new Schema(
  {
    analytics: accessOptionsSchema,
    user_management: accessOptionsSchema,
    accounting: accessOptionsSchema,
    security_and_data: accessOptionsSchema,
    users_and_access_settings: accessOptionsSchema,
    language_and_notifications_settings: accessOptionsSchema,
  },
  { _id: false }
);

const accesses = new Schema({
  sub_admin_id: {
    type: String,
  },
  first_name: {
    type: String,
    default: "",
  },
  last_name: {
    type: String,
    default: "",
  },
  accesses: {
    type: accessesSchema,
    default: {
      analytics: { view: false, edit: false },
      user_management: { view: false, edit: false },
      accounting: { view: false, edit: false },
      security_and_data: { view: false, edit: false },
      users_and_access_settings: { view: false, edit: false },
      language_and_notifications_settings: { view: false, edit: false },
    },
  },
  created_dt: {
    type: Date,
    default: Date.now(),
  },
  updated_dt: {
    type: Date,
  },
});

const AccessModel = mongoose.model("Accesses", accesses);

module.exports = AccessModel;
