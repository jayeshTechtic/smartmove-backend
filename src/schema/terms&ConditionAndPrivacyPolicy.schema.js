/**
 * Models/TermsConditionAndPrivacyPolicyModel.js
 *
 * Create mongoDB Schema for the terms and condition and privacy policy details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const termsConditionAndPrivacyPolicy = new Schema({
    terms_and_condition: {
        type: String,
        required: ["Terms and Condition should not be empty"]
    },
    privacy_policy: {
        type: String,
        required: ["Privacy Policy should not be empty"]
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

const TermsConditionAndPrivacyPolicyModel = mongoose.model("TermsConditionAndPrivacyPolicy", termsConditionAndPrivacyPolicy);

module.exports = TermsConditionAndPrivacyPolicyModel;
