/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invitedUser = new Schema({
  email: {
    type: String,
    required: [true, "Email should not be empty"],
  },
  name: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["invited", "joined app"],
    default: "invited",
  },
  parent_id: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: [true, "Parent Id should not be empty"],
  },
  profile_id: {
    type: Schema.Types.ObjectId,
    required: [true, "Profile Id should not be empty"],
  },
  verification_code: {
    type: String,
    default: null,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  created_dt: {
    type: Date,
    default: Date.now(),
  },
  updated_dt: {
    type: Date,
  },
});

const InvitedUserModel = mongoose.model("InvitedUser", invitedUser);

module.exports = InvitedUserModel;
