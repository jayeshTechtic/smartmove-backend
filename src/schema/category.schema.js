/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const category = new Schema({
    category_name: {
        type: String,
        required: ["Category name should not be empty"]
    },
    created_dt: {
        type: Date,
        default: Date.now()
    },
    updated_dt: {
        type: Date
    }
});

const CategoryModel = mongoose.model("Category", category);

module.exports = CategoryModel;
