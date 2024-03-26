/**
 * furnitureValidation.js
 *
 * List of the task validations
 */

const Joi = require("joi");

const addFurnitureSchema = Joi.object({
  furniture_category_id: Joi.string()
    .required()
    .label("Furniture Cateogry Id should not be empty"),
  furniture_title: Joi.string()
    .required()
    .label("Furniture Title should not be empty"),
  user_id: Joi.string().required().label("User Id should not be empty"),
  // furniture_link: Joi.string(),
  // price: Joi.string(),
  // breadth: Joi.string(),
  // length: Joi.string(),
  // height: Joi.string(),
  // is_purchased: Joi.boolean(),
  // is_marked_favourite: Joi.boolean()
});

const updateFurnitureSchema = Joi.object({
  furniture_category_id: Joi.string()
    .required()
    .label("Furniture Cateogry Id should not be empty"),
  // furniture_title: Joi.string()
  //   .required()
  //   .label("Furniture Title should not be empty"),
  // furniture_link: Joi.string(),
  // price: Joi.string(),
  // breadth: Joi.string(),
  // length: Joi.string(),
  // height: Joi.string(),
  user_id: Joi.string().required().label("User Id should not be empty"),
  furniture_id: Joi.string(),
  // is_purchased: Joi.boolean(),
  // is_marked_favourite: Joi.boolean(),
  profile_id: Joi.string().required().label("Profile Id should not be empty"),
});

module.exports = {
  addFurnitureSchema,
  updateFurnitureSchema,
};
