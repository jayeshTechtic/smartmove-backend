/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const language = new Schema({
    language_name: {
        type: String,
        required: ["Language Name should not be empty"]
    },
    language_short_form: {
        type: String,
        required: ["Language short form should not be empty"]
    },
    created_dt: {
        type: Date,
        default: Date.now()
    },
    updated_dt: {
        type: Date
    }
});

const LanguageModel = mongoose.model("Language", language);

module.exports = LanguageModel;
