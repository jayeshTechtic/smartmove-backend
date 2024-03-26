/**
 * shoppingController.js
 *
 * All shopping APIs.
 */

const { statusCode } = require("../../Utils/const");
const {
  printConsole,
  translateTheText,
  setGlobalLanguage,
  getUserbyProfileId,
  sendPushNotificationOnActions,
} = require("../../Utils/commonFile");
const shoppingService = require("./shopping.service");
const ShoppingCategoryModel = require("../schema/shoppingCategory.schema");
const UserModel = require("../schema/user.schema");

// add shopping category
/*
    write down the Params 
    No of Params
    shopping_category_name: body.shopping_category_name
    shopping_category_image: body.shopping_category_image
    user_id: decoded.user_id
*/
const addShoppingCategory = async (req, res) => {
  try {
    const { body, decoded } = req;
    await setGlobalLanguage(req.decoded.user_id);
    if (!body.shopping_category_name) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Shopping Category name should not be empty",
        key: "shopping_category_name",
      });
    } else if (body.shopping_category_name) {
      let userData = await getUserbyProfileId(body.profile_id);
      const nonSubData = await ShoppingCategoryModel.find({
        user_id: userData?._id,
        profile_id: body?.profile_id,
      }).lean();

      if (
        userData.subcription === "free tier" &&
        nonSubData &&
        nonSubData.length >= 2
      ) {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText(
            "Please subscribe to the function extension to enter additional entries"
          ),
        });
      }

      const data = {
        smartMove: "true",
        shopping_category_name: body?.shopping_category_name,
        user_id: userData._id,
        shopping_category_image:
          "public/categoryimage/1704261888607-Further_Other.png",
        shopping_image_mime_type: "image/png",
        profile_id: body?.profile_id,
      };
      await shoppingService
        .addShoppingOfTheUser(data)
        .then(async (response) => {
          // send push notification
          sendPushNotificationOnActions(body, decoded);
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully added the Shopping category"
            ),
          });
        });
    }
    // else if (!file) {
    //     res.status(500).json({
    //         statusCode: statusCode.validation,
    //         message: await translateTheText("Form validations are required"),
    //         label: "Shopping Category image should not be empty",
    //         key: "Shopping_category_image"
    //     })
    // } else if (body.shopping_category_name && file.filename) {
    //     const data = {
    //         shopping_category_name: body.shopping_category_name,
    //         // shopping_category_image: 'public/Shoppingcategoryimage/' + file.filename,
    //         // shopping_image_mime_type: file.mimetype,
    //         user_id: decoded.user_id
    //     }
    //     await shoppingService.addShoppingOfTheUser(data)
    //         .then(async response => {
    //             return  res.status(200).json({
    //                 statusCode: statusCode.sucess,
    //                 message: await translateTheText("Successfully added the Shopping category")
    //             });
    //         })
    // }
  } catch (error) {
    printConsole("error while uploading", error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// // update category
// /*
//     write down the params
//     No of params
//     shopping_category_id: body.shopping_category_id
//     shopping_category_name: body.shopping_category_name
//     shopping_category_image: body.shopping_category_image
//     user_id: decoded.user_id
// */
// let updateShoppingCategory = async (req, res) => {
//   try {
//     let { body, file, decoded } = req;
//     if (!body.shopping_category_name) {
//       res.status(500).json({
//         statusCode: statusCode.validation,
//         message: await translateTheText("Form validations are required"),
//         label: "Shopping Category name should not be empty",
//         key: "shopping_category_name",
//       });
//     }
//     // else if (!file) {
//     //   res.status(500).json({
//     //     statusCode: statusCode.validation,
//     //     message: await translateTheText("Form validations are required"),
//     //     label: "Shopping Category image should not be empty",
//     //     key: "Shopping_category_image",
//     //   });
//     // }
//     else if (!body.shopping_category_id) {
//       res.status(500).json({
//         statusCode: statusCode.validation,
//         message: await translateTheText("Form validations are required"),
//         label: "Shopping Category id should not be empty",
//         key: "shopping_category_id",
//       });
//     } else if (body.shopping_category_id & body.shopping_category_name) {
//       await shoppingService
//         .updateShoppingOfTheUser({
//           shopping_category_name: body.furniture_category_name,
//           user_id: decoded.user_id,
//           shopping_category_id: body.shopping_category_id,
//         })
//         .then(async (response) => {
//           return res.status(200).json({
//             statusCode: statusCode.sucess,
//             message: await translateTheText(
//               "Successfully updated the Shopping category"
//             ),
//           });
//         });
//     }
//     // else if (
//     //   body.shopping_category_name &&
//     //   file.filename &&
//     //   body.shopping_category_id
//     // ) {
//     //   const data = {
//     //     shopping_category_name: body.shopping_category_name,
//     //     shopping_category_image:
//     //       "public/Shoppingcategoryimage/" + file.filename,
//     //     shopping_image_mime_type: file.mimetype,
//     //     shopping_category_id: body.shopping_category_id,
//     //   };
//     //   await shoppingService
//     //     .updateShoppingOfTheUser(data, decoded.user_id)
//     //     .then(async (response) => {
//     //       res.status(200).json({
//     //         statusCode: statusCode.sucess,
//     //         message: await translateTheText(
//     //           "Successfully updated the Shopping category"
//     //         ),
//     //         data: response,
//     //       });
//     //     })
//     //     .catch(async (error) => {
//     //       printConsole("error ", error);
//     //       res.status(500).json({
//     //         statusCode: statusCode.internalError,
//     //         message: await translateTheText("Internal server error"),
//     //       });
//     //     });
//     // }
//   } catch (error) {
//     printConsole(error);
//     res.status(500).json({
//       statusCode: statusCode.internalError,
//       message: await translateTheText("Internal server error"),
//     });
//   }
// };

// // delete category
// /*
//     write down the params
//     No of params
//     shopping_category_id: body.shopping_category_id
//     user_id: decoded.user_id
// */
// let deleteShoppingCategory = async (req, res) => {
//     try {
//         let { params, decoded } = req
//         if (!params.shopping_category_id) {
//             return res.status(400).json({ statusCode: statusCode.validation, message: await translateTheText("Shopping Category Id should not be empty") });
//         } else {
//             if (decoded.user_type == "user") {
//                 await shoppingService.deleteShoppingCategory(params, decoded.user_id)
//                     .then(response => {
//                         res.status(200).json({
//                             statusCode: statusCode.sucess,
//                             message: await translateTheText("Successfully deleted the Shopping category")
//                         })
//                     })
//                     .catch((error) => {
//                         printConsole("error ", error)
//                         res.status(500).json({
//                             statusCode: statusCode.internalError,
//                             message: await translateTheText("Internal server error")
//                         })
//                     });
//             } else {
//                 res.status(401).json({
//                     statusCode: statusCode.unauthorised,
//                     message: await translateTheText("You are not authorized to access this API URL")
//                 })
//             }
//         }
//     } catch (error) {
//         printConsole(error);
//         res.status(500).json({
//             statusCode: statusCode.internalError,
//             message: await translateTheText("Internal server error")
//         })
//     }
// }

// get Shopping category list API
/*
    write down the Params 
    No of Params
*/
let getShoppingCategoryList = async (req, res) => {
  try {
    const { params } = req;
    if (req.decoded.user_type == "user" || req.decoded.user_type == "admin") {
      await setGlobalLanguage(req.decoded.user_id);
      let userData = await getUserbyProfileId(params?.profile_id);
      const catList = await shoppingService.getShoppingCategory(
        userData?._id,
        params?.profile_id
      );
      res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText("Successfully got the list of user"),
        data: catList,
      });
    } else {
      res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "You are not authorized to access this API URL"
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

// add shopping List
/*
    write down the Params 
    No of Params
    user_id: body.user_id
    shopping_item_name: body.shopping_item_name
    shopping_category_id: body.shopping_category_id
    price: body.price
    is_completed: body.is_completed
*/
const addShoppingList = async (req, res) => {
  try {
    const { decoded, body } = req;
    let userData = await getUserbyProfileId(body.profile_id);
    // const userData = await UserModel.findById(decoded.user_id);
    if (userData.user_type === "user") {
      await setGlobalLanguage(body.user_id);
      const nonSubData =
        await shoppingService.getShoppingItemForLoginBasedOnSubcription(
          body,
          userData.subcription,
          userData?._id
        );

      // If user.subcription is "free tier" than maximum of 10 entries can be entered per "room".
      /**
       * Note:- Because nonSubData[0]?.userShopping?.length is starting from 0 we kept condition of >= 10.
       */
      if (
        userData.subcription === "free tier" &&
        nonSubData &&
        nonSubData[0]?.userShopping?.length >= 10
      ) {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText(
            "Please subscribe to the function extension to enter additional entries"
          ),
        });
      }

      const shoppingText = body.shopping_item_name.split(", ");
      let count = 0;
      if (nonSubData[0].userShopping.length < 3 && shoppingText.length <= 5) {
        count = shoppingText.length;
      } else if (
        nonSubData[0].userShopping.length == 0 ||
        shoppingText.length >= 5
      ) {
        count = 5;
      } else if (
        nonSubData[0].userShopping.length >= 3 &&
        shoppingText.length < 5
      ) {
        if (
          shoppingText.length == 1 &&
          Math.abs(
            parseInt(nonSubData[0].userShopping.length) - shoppingText.length
          ) > 1
        ) {
          count = 1;
        } else {
          count = Math.abs(5 - parseInt(nonSubData[0].userShopping.length));
        }
      }
      await shoppingService
        .addShoppingItems(body, count)
        .then(async (response) => {
          // send push notification
          sendPushNotificationOnActions(body, decoded);
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(`Entry successful`),
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

// const addShoppingList = async (req, res) => {
//   try {
//     const { decoded, body } = req;
//     if (decoded.user_type == "user") {
//       await setGlobalLanguage(body.user_id);
//       const nonSubData =
//         await shoppingService.getShoppingItemForLoginBasedOnSubcription(
//           body,
//           "free tier"
//         );
//       console.log(nonSubData[0]?.userShopping);
//       const subData =
//         await shoppingService.getShoppingItemForLoginBasedOnSubcription(
//           body,
//           "function extension"
//         );
//       if (
//         nonSubData &&
//         nonSubData.length > 0 &&
//         nonSubData[0].userShopping.length < 5
//       ) {
//         const shoppingText = body.shopping_item_name.split(", ");
//         let count = 0;
//         if (nonSubData[0].userShopping.length < 3 && shoppingText.length <= 5) {
//           count = shoppingText.length;
//           console.log("1", count);
//         } else if (
//           nonSubData[0].userShopping.length == 0 ||
//           shoppingText.length >= 5
//         ) {
//           count = 5;
//           console.log("2", count);
//         } else if (
//           nonSubData[0].userShopping.length >= 3 &&
//           shoppingText.length < 5
//         ) {
//           if (
//             shoppingText.length == 1 &&
//             Math.abs(
//               parseInt(nonSubData[0].userShopping.length) - shoppingText.length
//             ) > 1
//           ) {
//             count = 1;
//             console.log("3", count);
//           } else {
//             count = Math.abs(5 - parseInt(nonSubData[0].userShopping.length));
//             console.log("4", count);
//           }
//         }
//         await shoppingService
//           .addShoppingItems(body, count)
//           .then(async (response) => {
//             return res.status(200).json({
//               statusCode: statusCode.sucess,
//               message: await translateTheText(`Entry successful`),
//             });
//           });
//       } else if (subData && subData.length > 0) {
//         await shoppingService
//           .addShoppingItems(body, body.shopping_item_name.split(", ").length)
//           .then(async (response) => {
//             return res.status(200).json({
//               statusCode: statusCode.sucess,
//               message: await translateTheText("Entry successful"),
//             });
//           });
//       } else {
//         return res.status(400).json({
//           statusCode: statusCode.validation,
//           message: await translateTheText(
//             "The limit for entries has been reached, please subscribe to the feature extension or premium subscription to add more entries."
//           ),
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

// update shopping List
/*
    write down the Params 
    No of Params
    price: body.price
    user_id: body.user_id
    shopping_item_id: body.shopping_item_id
    shopping_item_name: body.shopping_item_name
    shopping_category_id: body.shopping_category_id
    is_completed: body.is_completed
*/
// const updateShoppingList = async (req, res) => {
//   try {
//     const { decoded, body } = req;
//     await setGlobalLanguage(body.user_id);
//     let userData = await getUserbyProfileId(body.profile_id);
//     if (decoded.user_type == "user") {

//       const nonSubData =
//         await shoppingService.getShoppingItemForLoginBasedOnSubcription(
//           body,
//           userData.subcription,
//           userData?._id
//         );
//       const subData =
//         await shoppingService.getShoppingItemForLoginBasedOnSubcription(
//           body,
//           userData.subcription,
//           userData?._id
//         );
//       if (
//         nonSubData &&
//         nonSubData.length > 0 &&
//         nonSubData[0].userShopping.length < 5
//       ) {
//         await shoppingService
//           .updateShoppingList(body)
//           .then(async (response) => {
//             return res.status(200).json({
//               statusCode: statusCode.sucess,
//               message: await translateTheText("Entry update was successful"),
//               data: response,
//             });
//           });
//       } else if (subData && subData.length > 0) {
//         await shoppingService
//           .updateShoppingList(body)
//           .then(async (response) => {
//             return res.status(200).json({
//               statusCode: statusCode.sucess,
//               message: await translateTheText("Entry update was successful"),
//             });
//           });
//       } else {
//         return res.status(400).json({
//           statusCode: statusCode.validation,
//           message: await translateTheText(
//             "The limit for entries has been reached, please subscribe to the feature extension or premium subscription to add more entries."
//           ),
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

const updateShoppingList = async (req, res) => {
  try {
    const { decoded, body } = req;
    await setGlobalLanguage(body.user_id);
    if (decoded.user_type == "user") {
      await shoppingService.updateShoppingList(body).then(async (response) => {
        // send push notification
        sendPushNotificationOnActions(body, decoded);
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Entry update was successful"),
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

// delete shopping List
/*
    write down the Params 
    No of Params
    user_id: body.user_id
*/
const deleteShoppingList = async (req, res) => {
  try {
    const { decoded, body } = req;
    await setGlobalLanguage(body.user_id);
    if (decoded.user_type == "user") {
      let userData = await getUserbyProfileId(body.profile_id);
      await shoppingService
        .deleteShoppingList(body, userData?._id)
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

// get list of shopping list
/*
    write down the Params 
    No of Params
    user_id: body.user_id,
    shopping_category_id: body.shopping_category_id
*/
const getShoppingItemList = async (req, res) => {
  try {
    const { decoded, query } = req;
    if (decoded.user_type == "user" || decoded.user_type == "admin") {
      await setGlobalLanguage(query.user_id);
      printConsole(query);
      let userData = await getUserbyProfileId(query?.profile_id);
      await shoppingService
        .getListOfShoppingItem(query, userData?._id)
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

module.exports = {
  addShoppingCategory,
  //   updateShoppingCategory,
  // deleteShoppingCategory,
  getShoppingCategoryList,
  addShoppingList,
  updateShoppingList,
  deleteShoppingList,
  getShoppingItemList,
};
