/**
 * todo/todoController.js
 *
 * todo task APIs.
 */

const { statusCode } = require("../../Utils/const");
const {
  printConsole,
  getListOfCategory,
  translateTheText,
  setGlobalLanguage,
  getUserbyProfileId,
  sendPushNotificationOnActions,
} = require("../../Utils/commonFile");
const todoListService = require("./todoListService");
const {
  toDoTaskSchema,
  updateToDoTaskSchema,
} = require("../../Utils/Validations/taskValidationSchema");
const UserModel = require("../schema/user.schema");

// add todo task
/*
    write down the Params 
    No of Params
    task_name: body.task_name
    user_id: decoded.user_id
*/
const addTodoTask = async (req, res) => {
  try {
    const { body, decoded } = req;
    const { error } = toDoTaskSchema.validate(body, {
      abortEarly: false,
    });
    await setGlobalLanguage(decoded.user_id);
    if (error) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      // const userData = await UserModel.findById(decoded.user_id);
      const userData = await getUserbyProfileId(body.profile_id);
      if (userData.user_type == "user") {
        const data = {
          user_id: userData._id,
          profile_id: body.profile_id,
          task_title: body.task_title,
        };
        const nonSubData =
          await todoListService.getTaskForLoginBasedOnSubcription(
            userData._id,
            userData.subcription,
            body.profile_id
          );
        // If user.subcription is "free tier" than maximum 3 To-Do lists can be created.
        /**
         * Note:- Because nonSubData[0]?.todoLists?.length is starting from 0 we kept condition of >= 3.
         */
        if (
          userData.subcription === "free tier" &&
          nonSubData &&
          nonSubData[0]?.todoLists?.length >= 5
        ) {
          return res.status(400).json({
            statusCode: statusCode.validation,
            message: await translateTheText(
              "Please subscribe to the function extension to enter additional entries"
            ),
          });
        }

        const dataExists = await todoListService.checkGivenTaskIsPresentOrNot(
          data
        );
        if (dataExists.length > 0) {
          return res.status(400).json({
            statusCode: statusCode.validation,
            message: await translateTheText(
              "Task with given name is already exists"
            ),
          });
        } else {
          await todoListService
            .addTodoListOfTheUser(data)
            .then(async (response) => {
              // send push notification
              sendPushNotificationOnActions(body, decoded);
              return res.status(200).json({
                statusCode: statusCode.sucess,
                message: await translateTheText("Entry successful"),
              });
            });
        }
      } else {
        res.status(401).json({
          statusCode: statusCode.unauthorised,
          message: await translateTheText(
            "You are not authorised to use this api"
          ),
        });
      }
    }
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// const addTodoTask = async (req, res) => {
//   try {
//     const { body, decoded } = req;
//     const { error } = toDoTaskSchema.validate(body, {
//       abortEarly: false,
//     });
//     await setGlobalLanguage(decoded.user_id);
//     if (error) {
//       return res.status(400).json({
//         statusCode: statusCode.validation,
//         message: await translateTheText("Form validations are required"),
//         data: error.details.map((rec) => rec.context),
//       });
//     } else {
//       if (decoded.user_type == "user") {
//         const data = {
//           user_id: decoded.user_id,
//           task_title: body.task_title,
//         };
//         const nonSubData =
//           await todoListService.getTaskForLoginBasedOnSubcription(
//             decoded.user_id,
//             "free tier"
//           );
//         const subData = await todoListService.getTaskForLoginBasedOnSubcription(
//           decoded.user_id,
//           "function extension"
//         );
//         if (
//           nonSubData &&
//           nonSubData.length > 0 &&
//           nonSubData[0].todoLists.length < 5
//         ) {
//           const dataExists = await todoListService.checkGivenTaskIsPresentOrNot(
//             data
//           );
//           if (dataExists.length > 0) {
//             return res.status(400).json({
//               statusCode: statusCode.validation,
//               message: await translateTheText(
//                 "Task with given name is already exists"
//               ),
//             });
//           } else {
//             await todoListService
//               .addTodoListOfTheUser(data)
//               .then(async (response) => {
//                 return res.status(200).json({
//                   statusCode: statusCode.sucess,
//                   message: await translateTheText("Entry successful"),
//                 });
//               });
//           }
//         } else if (subData && subData.length > 0) {
//           const dataExists = await todoListService.checkGivenTaskIsPresentOrNot(
//             data
//           );
//           if (dataExists.length > 0) {
//             return res.status(400).json({
//               statusCode: statusCode.validation,
//               message: await translateTheText(
//                 "Task with given name is already exists"
//               ),
//             });
//           } else {
//             await todoListService
//               .addTodoListOfTheUser(data)
//               .then(async (response) => {
//                 return res.status(200).json({
//                   statusCode: statusCode.sucess,
//                   message: await translateTheText("Entry successful"),
//                 });
//               });
//           }
//         } else {
//           return res.status(400).json({
//             statusCode: statusCode.validation,
//             message: await translateTheText(
//               "The limit for entries has been reached, please subscribe to the feature extension or premium subscription to add more entries."
//             ),
//           });
//         }
//       } else {
//         res.status(401).json({
//           statusCode: statusCode.unauthorised,
//           message: await translateTheText(
//             "You are not authorised to use this api"
//           ),
//         });
//       }
//     }
//   } catch (error) {
//     printConsole(error);
//     res.status(500).json({
//       statusCode: statusCode.internalError,
//       message: await translateTheText("Internal server error"),
//     });
//   }
// };

// update todo task
/*
    write down the Params 
    No of Params
    task_name: body.task_name
    user_id: decoded.user_id
    task_id: body.task_id
*/
const updateTodoTask = async (req, res) => {
  try {
    const { body, decoded } = req;
    const { error } = updateToDoTaskSchema.validate(body, {
      abortEarly: false,
    });
    await setGlobalLanguage(decoded.user_id);
    if (error) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      if (decoded.user_type == "user") {
        const userData = await getUserbyProfileId(body.profile_id);

        const data = {
          user_id: userData._id,
          task_title: body.task_title,
          task_id: body.task_id,
          is_completed: body.is_completed,
          profile_id: body.profile_id,
        };
        await todoListService
          .updateTodoListOfTheUser(data)
          .then(async (response) => {
            // send push notification
            sendPushNotificationOnActions(body, decoded);
            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText("Entry update was successful"),
              data: response,
            });
          });
      } else {
        res.status(401).json({
          statusCode: statusCode.unauthorised,
          message: await translateTheText(
            "You are not authorised to use this api"
          ),
        });
      }
    }
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// delete todo task
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id
    task_id: body.task_id
*/
const deleteTodoTask = async (req, res) => {
  try {
    const { body, decoded } = req;
    if (decoded.user_type == "user") {
      const data = {
        user_id: decoded.user_id,
        task_id: body.task_id,
        profile_id: body.profile_id,
      };
      await setGlobalLanguage(decoded.user_id);
      await todoListService
        .deleteTodoListOfTheUser(data)
        .then(async (response) => {
          // send push notification
          sendPushNotificationOnActions(body, decoded);
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Entry deleted"),
          });
        });
    } else {
      res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "You are not authorised to use this api"
        ),
      });
    }
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// list of todo task
/*
    write down the Params 
    No of Params
    user_id: query.user_id
*/
const getTodoTaskList = async (req, res) => {
  try {
    const { decoded, query } = req;
    if (decoded.user_type == "user") {
      const userData = await getUserbyProfileId(query.profile_id);
      const data = {
        user_id: userData._id,
      };
      await setGlobalLanguage(query.user_id);
      await todoListService
        .getListOfTodoTask(data, query)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Successfully got the tasks list"),
            data: response,
          });
        });
    } else {
      res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "You are not authorised to use this api"
        ),
      });
    }
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// add todo task items
/*
    write down the Params 
    No of Params
    user_id: body.user_id,
    task_id: body.task_id,
    task_item_name: body.task_item_name
*/
const addTodoTaskItems = async (req, res) => {
  try {
    const { decoded, body } = req;
    // const userData = await UserModel.findById(decoded.user_id);
    const userData = await getUserbyProfileId(body.profile_id);

    if (userData.user_type == "user") {
      await setGlobalLanguage(body.user_id);
      const nonSubData =
        await todoListService.getTaskItemForLoginBasedOnSubcription(
          body,
          userData.subcription,
          body?.profile_id
        );

      let count = 0;
      if (nonSubData.length == 0) {
        count =
          body.task_item_name.split(", ").length > 5
            ? 5
            : body.task_item_name.split(", ").length;
        await todoListService
          .addTodoTaskItems(body, count)
          .then(async (response) => {
            // send push notification
            sendPushNotificationOnActions(body, decoded);
            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText("Entry successful"),
              data: response,
            });
          });
      } else if (
        nonSubData &&
        nonSubData.length > 0 &&
        (nonSubData[0]?.todoLists?.task_item.length < 5 ||
          nonSubData[0]?.todoLists.length == 0)
      ) {
        printConsole("inside");
        const taskItemText = body.task_item_name.split(", ");
        if (
          (nonSubData.length == 0 ||
            nonSubData[0]?.todoLists.length == 0 ||
            nonSubData[0]?.todoLists?.task_item.length < 3) &&
          taskItemText.length <= 5
        ) {
          count = taskItemText.length;
          printConsole("1", count);
        } else if (
          nonSubData[0]?.todoLists?.task_item.length == 0 ||
          taskItemText.length >= 5
        ) {
          count = 5;
          printConsole("2", count);
        } else if (
          nonSubData[0]?.todoLists?.task_item.length >= 3 &&
          taskItemText.length < 5
        ) {
          if (
            taskItemText.length == 1 &&
            Math.abs(
              parseInt(nonSubData[0]?.todoLists?.task_item.length) -
                taskItemText.length
            ) > 1
          ) {
            count = 1;
            printConsole("3", count);
          } else {
            count = Math.abs(
              5 - parseInt(nonSubData[0]?.todoLists?.task_item.length)
            );
            printConsole("4", count);
          }
        }
        await todoListService
          .addTodoTaskItems(body, count)
          .then(async (response) => {
            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText("Entry successful"),
              data: response,
            });
          });
      } else if (userData.subcription !== "free tier") {
        await todoListService
          .addTodoTaskItems(body, body.task_item_name.split(", ").length)
          .then(async (response) => {
            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText("Entry successful"),
            });
          });
      } else {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText(
            "The function extension must first be purchased in order to add further content."
          ),
        });
      }
    } else {
      res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "You are not authorised to use this api"
        ),
      });
    }
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// const addTodoTaskItems = async (req, res) => {
//   try {
//     const { decoded, body } = req;
//     if (decoded.user_type == "user") {
//       await setGlobalLanguage(body.user_id);
//       const nonSubData =
//         await todoListService.getTaskItemForLoginBasedOnSubcription(
//           body,
//           "free tier"
//         );
//       // printConsole(nonSubData[0]?.todoLists?.task_item)
//       const subData =
//         await todoListService.getTaskItemForLoginBasedOnSubcription(
//           body,
//           "function extension"
//         );
//       let count = 0;
//       if (nonSubData.length == 0) {
//         count =
//           body.task_item_name.split(", ").length > 5
//             ? 5
//             : body.task_item_name.split(", ").length;
//         await todoListService
//           .addTodoTaskItems(body, count)
//           .then(async (response) => {
//             return res.status(200).json({
//               statusCode: statusCode.sucess,
//               message: await translateTheText("Entry successful"),
//               data: response,
//             });
//           });
//       } else if (
//         nonSubData &&
//         nonSubData.length > 0 &&
//         (nonSubData[0]?.todoLists?.task_item.length < 5 ||
//           nonSubData[0]?.todoLists.length == 0)
//       ) {
//         printConsole("inside");
//         const taskItemText = body.task_item_name.split(", ");
//         if (
//           (nonSubData.length == 0 ||
//             nonSubData[0]?.todoLists.length == 0 ||
//             nonSubData[0]?.todoLists?.task_item.length < 3) &&
//           taskItemText.length <= 5
//         ) {
//           count = taskItemText.length;
//           printConsole("1", count);
//         } else if (
//           nonSubData[0]?.todoLists?.task_item.length == 0 ||
//           taskItemText.length >= 5
//         ) {
//           count = 5;
//           printConsole("2", count);
//         } else if (
//           nonSubData[0]?.todoLists?.task_item.length >= 3 &&
//           taskItemText.length < 5
//         ) {
//           if (
//             taskItemText.length == 1 &&
//             Math.abs(
//               parseInt(nonSubData[0]?.todoLists?.task_item.length) -
//                 taskItemText.length
//             ) > 1
//           ) {
//             count = 1;
//             printConsole("3", count);
//           } else {
//             count = Math.abs(
//               5 - parseInt(nonSubData[0]?.todoLists?.task_item.length)
//             );
//             printConsole("4", count);
//           }
//         }
//         await todoListService
//           .addTodoTaskItems(body, count)
//           .then(async (response) => {
//             return res.status(200).json({
//               statusCode: statusCode.sucess,
//               message: await translateTheText("Entry successful"),
//               data: response,
//             });
//           });
//       } else if (subData && subData.length > 0) {
//         await todoListService
//           .addTodoTaskItems(body, body.task_item_name.split(", ").length)
//           .then(async (response) => {
//             return res.status(200).json({
//               statusCode: statusCode.sucess,
//               message: await translateTheText("Entry successful"),
//             });
//           });
//       } else {
//         return res.status(400).json({
//           statusCode: statusCode.validation,
//           message: await translateTheText("Upgrade plan To add More Tasks"),
//         });
//       }
//     } else {
//       res.status(401).json({
//         statusCode: statusCode.unauthorised,
//         message: await translateTheText(
//           "You are not authorised to use this api"
//         ),
//       });
//     }
//   } catch (error) {
//     printConsole(error);
//     res.status(500).json({
//       statusCode: statusCode.internalError,
//       message: await translateTheText("Internal server error"),
//     });
//   }
// };

// update todo task items
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id,
    task_id: body.task_id,
    task_item_name: body.task_item_name
    status: body.status,
    task_item_id: body.task_item_id
*/
const updateTodoTaskItems = async (req, res) => {
  try {
    const { decoded, body } = req;
    if (decoded.user_type == "user") {
      await setGlobalLanguage(decoded.user_id);
      await todoListService
        .updateTodoTaskItems(body, decoded.user_id)
        .then(async (response) => {
          // send push notification
          sendPushNotificationOnActions(body, decoded);
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Entry update was successful"),
            data: response,
          });
        });
    } else {
      res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "You are not authorised to use this api"
        ),
      });
    }
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// delete todo task items
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id,
    task_id: body.task_id,
    task_item_id: body.task_item_id
*/
const deleteTodoTaskItems = async (req, res) => {
  try {
    const { decoded, body } = req;
    if (decoded.user_type == "user") {
      await setGlobalLanguage(decoded.user_id);
      await todoListService
        .deleteTodoTaskItems(body, decoded.user_id)
        .then(async (response) => {
          // send push notification
          sendPushNotificationOnActions(body, decoded);
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Entry deleted"),
            data: response,
          });
        });
    } else {
      res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "You are not authorised to use this api"
        ),
      });
    }
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// delete todo task items
/*
    write down the Params 
    No of Params
    user_id: query.user_id,
    task_id: body.task_id
*/
const getTaskItemList = async (req, res) => {
  try {
    const { decoded, query } = req;
    if (decoded.user_type == "user" || decoded.user_type == "admin") {
      await setGlobalLanguage(query.user_id);
      await todoListService
        .getListOfTodoTaskItemList(query)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully got the task item lists"
            ),
            data: response,
          });
        });
    } else {
      res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "You are not authorised to use this api"
        ),
      });
    }
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// list of category
/*
    write down the params
    No of params
    category_name: body.category_name
    category_id: body.category_id
*/
let getCategoryList = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    await getListOfCategory().then(async (response) => {
      res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText("Successfully got the category list"),
        data: response,
      });
    });
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

let addCategoryList = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    await todoListService
      .addCategory({ category_name: req.body.category_name })
      .then(async (response) => {
        // send push notification
        sendPushNotificationOnActions(body, decoded);
        res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Successfully added the category"),
          data: response,
        });
      });
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

module.exports = {
  addTodoTask,
  updateTodoTask,
  deleteTodoTask,
  getTodoTaskList,
  addTodoTaskItems,
  updateTodoTaskItems,
  deleteTodoTaskItems,
  getTaskItemList,
  getCategoryList,
  addCategoryList,
};
