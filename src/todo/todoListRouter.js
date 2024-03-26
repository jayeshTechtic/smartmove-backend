/**
 * Routes/todoRouter.js
 *
 * All the todo task API.
 */

const express = require("express");
const router = express.Router();
const todoListController = require("./todoListController");
const validateToken = require("../../jwtValidateToken").validateToken;

/*  Add todo task  */
router.put("/addTodoTaskList", validateToken, todoListController.addTodoTask);
/*  Update todo task  */
router.patch(
  "/updateTodoTaskList",
  validateToken,
  todoListController.updateTodoTask
);
/*  Delete todo task  */
router.delete(
  "/deleteTodoTaskList",
  validateToken,
  todoListController.deleteTodoTask
);
/*  get todo task list  */
router.get("/taskList", validateToken, todoListController.getTodoTaskList);
/*  add todo task list item  */
router.put("/addtaskItem", validateToken, todoListController.addTodoTaskItems);
/*  update todo task list item  */
router.patch(
  "/updatetaskItem",
  validateToken,
  todoListController.updateTodoTaskItems
);
/*  delete todo task list item  */
router.delete(
  "/deletetaskItem",
  validateToken,
  todoListController.deleteTodoTaskItems
);
/*  list of todo task list item  */
router.get("/taskItemList", validateToken, todoListController.getTaskItemList);
/* List of category */
router.get("/catList", validateToken, todoListController.getCategoryList);
/* Add category */
router.post("/catList", validateToken, todoListController.addCategoryList);

module.exports = router;
