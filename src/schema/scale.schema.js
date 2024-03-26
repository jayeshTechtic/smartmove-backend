/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const measurementsSchema = new Schema({
  title: {
    type: String,
    default: "",
  },
  value: {
    type: String,
    default: "",
  },
});

const scale = new Schema({
  title: {
    type: String,
    required: ["Title should not be empty"],
  },
  // height: {
  //     type: String,
  // },
  // width: {
  //     type: String,
  // },
  // length: {
  //     type: String,
  // },
  // photo_video_url: {
  //     type: String,
  // },
  measurements: [measurementsSchema],
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

const ScaleModel = mongoose.model("Scale", scale);

module.exports = ScaleModel;
