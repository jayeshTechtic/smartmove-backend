/**
 * catValidation.js
 *
 * List of the user validations
 */

const Joi = require("joi");

const categorySchema = Joi.object({
    category_name: Joi.string().required().label("Category Name should not be empty"),
});

const updateCategorySchema = Joi.object({
    category_name: Joi.string().required().label("Category Name should not be empty"),
    category_id: Joi.string().required().label("Category Id should not be empty"),
});

module.exports = {
    categorySchema,
    updateCategorySchema
}