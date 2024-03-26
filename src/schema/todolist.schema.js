/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskItemSchema = new Schema({
  task_item_name: {
    type: String,
    required: [true, "Task Item Name should not be empty"],
  },
  is_completed: {
    type: Boolean,
    default: false,
  },
  note: {
    type: String,
    default: "",
  },
  created_dt: {
    type: Date,
    default: Date.now(),
  },
});

const todoList = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "Categorys",
  },
  task_title: {
    type: String,
    required: [true, "Task Title should not be empty"],
  },
  task_item: [taskItemSchema],
  profile_id: {
    type: Schema.Types.ObjectId,
    // ref: "Users",
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

const TodoModel = mongoose.model("TodoList", todoList);

module.exports = TodoModel;
