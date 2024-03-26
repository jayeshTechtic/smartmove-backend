/**
 * Models/PrivacyPolicy.js
 *
 * Create mongoDB Schema for the privacy policy details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const privacyPolicy = new Schema({
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

const PrivacyPolicyModel = mongoose.model("PrivacyPolicy", privacyPolicy);

module.exports = PrivacyPolicyModel;
