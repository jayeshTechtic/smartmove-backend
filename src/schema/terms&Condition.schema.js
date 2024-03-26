/**
 * Models/TermsAndCondition.js
 *
 * Create mongoDB Schema for the terms and condition details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const termsAndCondition = new Schema({
    terms_and_condition: {
        type: String,
        required: ["Terms and Condition should not be empty"]
    },
    language_id: {
        type: Schema.Types.ObjectId,
        ref: 'languages'
    },
    created_dt: {
        type: Date,
        default: Date.now()
    },
    updated_dt: {
        type: Date
    }
});

const TermsAndConditionModel = mongoose.model("TermsAndCondition", termsAndCondition);

module.exports = TermsAndConditionModel;
