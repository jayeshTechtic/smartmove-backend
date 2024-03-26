/**
 * Models/country.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const regionSchema = new Schema({
    region_name: {
        type: String,
        required: [true, "region name should not be empty"],
    },
    created_dt: {
        type: Date,
        default: Date.now(),
    },
});

const countryList = new Schema({
    country_name: {
        type: String,
        required: [true, "country name should not be empty"],
    },
    regions: [regionSchema],
    created_dt: {
        type: Date,
        default: Date.now(),
    },
    updated_dt: {
        type: Date,
    },
});

const CountryModel = mongoose.model("CountryList", countryList);

module.exports = CountryModel;
