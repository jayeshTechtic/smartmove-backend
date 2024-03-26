/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedback = new Schema({
  user_feedback: {
    type: String,
    // required: ["User Feedback should not be empty"],
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  is_feedback_provided: {
    type: Boolean,
  },
  created_dt: {
    type: Date,
    default: Date.now(),
  },
  updated_dt: {
    type: Date,
  },
});

const UserFeedbackModel = mongoose.model("UserFeedback", feedback);

module.exports = UserFeedbackModel;
