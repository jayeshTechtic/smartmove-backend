/**
 * todoTaskValidation.js
 *
 * List of the task validations
 */

const Joi = require("joi");

const toDoTaskSchema = Joi.object({
  task_title: Joi.string().required().label("Task Title should not be empty"),
  profile_id: Joi.string().required().label("Profile id should not be empty"),
});

const updateToDoTaskSchema = Joi.object({
  task_title: Joi.string().required().label("Task Title should not be empty"),
  task_id: Joi.string().required().label("Task id should not be empty"),
  profile_id: Joi.string().required().label("Profile id should not be empty"),
  user_id: Joi.string().required().label("User id id should not be empty"),
});

module.exports = {
  toDoTaskSchema,
  updateToDoTaskSchema,
};
