/**
 * Models/interaction.js
 *
 * Create mongoDB Schema for the Interaction details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const interaction = new Schema({
  item: {
    type: String,
    required: [true, "Item should not be empty"],
  },
  userId: {
    type: String,
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

const InteractionModel = mongoose.model("Interaction", interaction);

module.exports = InteractionModel;
