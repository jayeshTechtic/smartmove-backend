/**
 * furnitureController.js
 *
 * All furniture APIs.
 */

const { statusCode } = require("../../Utils/const");
const {
  printConsole,
  translateTheText,
  setGlobalLanguage,
  getUserbyProfileId,
  sendPushNotification,
  sendPushNotificationOnActions,
} = require("../../Utils/commonFile");
const furnitureService = require("./furniture.service");
const {
  addFurnitureSchema,
  updateFurnitureSchema,
} = require("../../Utils/Validations/furnitureValidationSchema");
const UserModel = require("../schema/user.schema");
const InvitedUserModel = require("../schema/invitedUser.schema");
const FurnitureCategoryModel = require("../schema/furnitureCategory.schema");
const { ObjectId } = require("mongodb");
const NotificationCountModel = require("../schema/notificationCount.schema");
const {
  createOrUpdateNotificationCount,
  getAllNotificationCount,
} = require("../users/userService");
const FurnitureModel = require("../schema/furniture.schema");

// add furniture
/*
    write down the Params 
    No of Params
    user_id: body.user_id
    furniture_title: body.furniture_title,
    furniture_link: body.furniture_link,
    price: body.price,
    breadth: body.breadth,
    length: body.length,
    height: body.height,
    furniture_category_id: body.furniture_category_id
*/
const addFurniture = async (req, res) => {
  try {
    const { body, decoded } = req;
    // const { error } = addFurnitureSchema.validate(body, {
    //   abortEarly: false,
    // });
    await setGlobalLanguage(decoded.user_id);
    // if (error) {
    if (false) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      // const userData = await UserModel.findById(decoded.user_id);
      let userData = await getUserbyProfileId(body.profile_id);

      const nonSubData =
        await furnitureService.getFurnitureDataBasedOnSubcription(
          body,
          userData.subcription
        );

      // If user.subcription is "free tier" than maximum of 5 entries can be entered per "Furniture" and subcategory (Saved, Favorites & Bought).
      /**
       * Note:- Because nonSubData.length is starting from 0 we kept condition of >= 5.
       */
      if (
        userData.subcription === "free tier" &&
        nonSubData &&
        nonSubData.length >= 5
      ) {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText(
            "Please subscribe to the function extension to enter additional entries"
          ),
        });
      }

      const data = {
        user_id: userData._id,
        furniture_title: body.furniture_title,
        furniture_link: body.furniture_link,
        price: body.price,
        breadth: body.breadth,
        length: body.length,
        height: body.height,
        is_marked_favourite: body.is_marked_favourite,
        is_purchased: body.is_purchased,
        furniture_category_id: body.furniture_category_id,
        profile_id: body.profile_id,
      };
      await furnitureService
        .addMoreFurnitureOfTheUser(data)
        .then(async (response) => {
          // send push notification
          sendPushNotificationOnActions(body, decoded);

          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Entry successful"),
          });
        });
    }
  } catch (error) {
    printConsole(error);
    // Check if the error is a validation error
    if (error.name === "ValidationError") {
      // If validation fails, send a 400 Bad Request response with the validation errors
      return res
        .status(400)
        .json({ statusCode: statusCode.validation, message: error.message });
    }
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// const addFurniture = async (req, res) => {
//   try {
//     const { body, decoded } = req;
//     // const { error } = addFurnitureSchema.validate(body, {
//     //   abortEarly: false,
//     // });
//     await setGlobalLanguage(decoded.user_id);
//     // if (error) {
//     if (false) {
//       return res.status(400).json({
//         statusCode: statusCode.validation,
//         message: await translateTheText("Form validations are required"),
//         data: error.details.map((rec) => rec.context),
//       });
//     } else {
//       const nonSubData =
//         await furnitureService.getFurnitureDataBasedOnSubcription(
//           body,
//           "free tier"
//         );
//       const subData = await furnitureService.getFurnitureDataBasedOnSubcription(
//         body,
//         "function extension"
//       );
//       printConsole(nonSubData);
//       if (nonSubData && nonSubData.length < 5) {
//         const data = {
//           user_id: decoded.user_id,
//           furniture_title: body.furniture_title,
//           furniture_link: body.furniture_link,
//           price: body.price,
//           breadth: body.breadth,
//           length: body.length,
//           height: body.height,
//           is_marked_favourite: body.is_marked_favourite,
//           is_purchased: body.is_purchased,
//           furniture_category_id: body.furniture_category_id,
//         };
//         await furnitureService
//           .addMoreFurnitureOfTheUser(data)
//           .then(async (response) => {
//             return res.status(200).json({
//               statusCode: statusCode.sucess,
//               message: await translateTheText("Entry successful"),
//             });
//           });
//       } else if (subData && subData.length > 0) {
//         const data = {
//           user_id: decoded.user_id,
//           furniture_title: body.furniture_title,
//           furniture_link: body.furniture_link,
//           price: body.price,
//           breadth: body.breadth,
//           length: body.length,
//           height: body.height,
//           is_marked_favourite: body.is_marked_favourite,
//           is_purchased: body.is_purchased,
//           furniture_category_id: body.furniture_category_id,
//         };
//         await furnitureService
//           .addMoreFurnitureOfTheUser(data)
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
//     }
//   } catch (error) {
//     printConsole(error);
//     res.status(500).json({
//       statusCode: statusCode.internalError,
//       message: await translateTheText("Internal server error"),
//     });
//   }
// };

// update furniture
/*
    write down the Params 
    No of Params
    furniture_title: body.furniture_title,
    furniture_link: body.furniture_link,
    price: body.price,
    breadth: body.breadth,
    length: body.length,
    height: body.height,
    user_id: decoded.user_id
    furniture_id: body.furniture_id
    furniture_category_id: body.furniture_category_id
*/
const updateFurniture = async (req, res) => {
  try {
    const { body, decoded } = req;
    const { error } = updateFurnitureSchema.validate(body, {
      abortEarly: false,
    });
    await setGlobalLanguage(decoded.user_id);
    // if (error) {
    if (false) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      if (decoded.user_type == "user") {
        let userData = await getUserbyProfileId(body.profile_id);
        const data = {
          user_id: userData._id,
          furniture_title: body.furniture_title,
          furniture_link: body.furniture_link,
          price: body.price,
          breadth: body.breadth,
          length: body.length,
          height: body.height,
          furniture_id: body.furniture_id,
          is_marked_favourite: body.is_marked_favourite,
          is_purchased: body.is_purchased,
          furniture_category_id: body.furniture_category_id,
          profile_id: body.profile_id,
        };
        await furnitureService
          .updateFurnitureOfTheUser(data)
          .then(async (response) => {
            // send push notification
            sendPushNotificationOnActions(body, decoded);

            const furnitureData = await FurnitureModel.findById({
              _id: data.furniture_id,
              user_id: data.user_id,
            });

            let notification_count = 0;
            let furniture_category_notification_count = 0;

            let saved = {
              notification_count: 0,
              list: {},
            };
            let favourite = { notification_count: 0, list: {} };
            let purchased = { notification_count: 0, list: {} };

            const addNotificationCountForList = (count) => {
              furniture_category_notification_count += 1;
              if (Boolean(furnitureData?.is_purchased)) {
                purchased.notification_count = count;
              } else if (Boolean(furnitureData?.is_marked_favourite)) {
                favourite.notification_count = count;
              } else {
                saved.notification_count = count;
              }
            };

            const addNewEntyForSavedPurchasedFavouriteItems = () => {
              if (Boolean(furnitureData?.is_purchased)) {
                purchased.list = {
                  category_id: body.furniture_id,
                  notification_count: 1,
                };
              } else if (Boolean(furnitureData?.is_marked_favourite)) {
                favourite.list = {
                  category_id: body.furniture_id,
                  notification_count: 1,
                };
              } else {
                saved.list = {
                  category_id: body?.furniture_id,
                  notification_count: 1,
                };
              }
            };

            // add notification count
            const addNotificationCount = async (addNotificationTo) => {
              console.log("addNotificationTo---->", addNotificationTo);
              const notificationCount = await getAllNotificationCount();
              // add notification to co users
              if (addNotificationTo == "couser") {
              } else {
                // add notification to main users

                const furnitureListItem = await FurnitureModel.findById(
                  body?.furniture_id
                );

                console.log("furnitureListItem--ID", furnitureListItem?._id);

                if (notificationCount && notificationCount?.length > 0) {
                  notificationCount.forEach((profile) => {
                    const id1 = new ObjectId(profile.profile_id);
                    const id2 = new ObjectId(body.profile_id);
                    console.log("here------>289");
                    notification_count +=
                      profile?.main_user_notification?.notification_count;

                    if (id1.equals(id2)) {
                      console.log("here------>291");
                      if (
                        profile?.main_user_notification
                          ?.furniture_notifications &&
                        profile?.main_user_notification?.furniture_notifications
                          ?.length > 0
                      ) {
                        console.log("here------>298");
                        profile?.main_user_notification?.furniture_notifications.forEach(
                          (furnitureItem) => {
                            const id1 = new ObjectId(
                              furnitureItem?.category_id
                            );
                            const id2 = new ObjectId(
                              body.furniture_category_id
                            );
                            // notification_count +=
                            //   furnitureItem?.notification_count;
                            console.log("**********************************");
                            console.log("**********************************");
                            console.log(
                              "notification_count",
                              notification_count
                            );
                            console.log("**********************************");
                            console.log("**********************************");
                            if (id1.equals(id2)) {
                              furniture_category_notification_count =
                                furnitureItem?.notification_count;
                              console.log(
                                "here------>352",
                                furnitureItem?.notification_count
                              );
                              console.log(
                                "here------>352",
                                furniture_category_notification_count
                              );
                              console.log(
                                "here------>362",
                                Boolean(furnitureListItem?.is_marked_favourite)
                              );

                              if (
                                Boolean(furnitureListItem?.is_marked_favourite)
                              ) {
                                if (
                                  furnitureItem?.child_notification?.favourite
                                    ?.list &&
                                  furnitureItem?.child_notification?.favourite
                                    ?.list?.length > 0
                                ) {
                                  const count =
                                    furnitureItem?.child_notification?.favourite
                                      .notification_count + 1;
                                  addNotificationCountForList(count);
                                  // notification_count += 1;

                                  // check if list?.category_id is available or not
                                  let isListCategoryAvailable = false;
                                  furnitureItem?.child_notification?.favourite?.list.forEach(
                                    (list) => {
                                      const id1 = new ObjectId(
                                        list?.category_id
                                      );
                                      const id2 = new ObjectId(
                                        body.furniture_id
                                      );
                                      if (id1.equals(id2)) {
                                        isListCategoryAvailable = true;
                                      }
                                    }
                                  );
                                  console.log(
                                    "isListCategoryAvailable---> 393",
                                    isListCategoryAvailable
                                  );
                                  if (isListCategoryAvailable) {
                                    furnitureItem?.child_notification?.favourite?.list.forEach(
                                      (list) => {
                                        const id1 = new ObjectId(
                                          list?.category_id
                                        );
                                        const id2 = new ObjectId(
                                          body.furniture_id
                                        );
                                        if (id1.equals(id2)) {
                                          favourite.list = {
                                            category_id: list?.category_id,
                                            notification_count:
                                              list?.notification_count + 1,
                                          };
                                        }
                                      }
                                    );
                                  } else {
                                    favourite.list = {
                                      notification_count: 1,
                                      category_id: body?.furniture_id,
                                    };
                                  }
                                } else {
                                  // notification_count += 1;
                                  addNotificationCountForList(1);
                                  favourite.list = {
                                    notification_count: 1,
                                    category_id: body?.furniture_id,
                                  };
                                }
                              } else if (
                                Boolean(furnitureListItem?.is_purchased)
                              ) {
                                console.log(
                                  "furnitureListItem?.is_purchased---> 430",
                                  Boolean(furnitureListItem?.is_purchased)
                                );
                                if (
                                  furnitureItem?.child_notification?.purchased
                                    ?.list &&
                                  furnitureItem?.child_notification?.purchased
                                    ?.list?.length > 0
                                ) {
                                  console.log("here---> 440");
                                  const count =
                                    furnitureItem?.child_notification?.purchased
                                      .notification_count + 1;
                                  addNotificationCountForList(count);
                                  // notification_count += 1;

                                  // check if list?.category_id is available or not
                                  let isListCategoryAvailable = false;
                                  furnitureItem?.child_notification?.purchased?.list.forEach(
                                    (list) => {
                                      const id1 = new ObjectId(
                                        list?.category_id
                                      );
                                      const id2 = new ObjectId(
                                        body.furniture_id
                                      );
                                      if (id1.equals(id2)) {
                                        isListCategoryAvailable = true;
                                      }
                                    }
                                  );
                                  console.log(
                                    "here---> 460",
                                    isListCategoryAvailable
                                  );
                                  if (isListCategoryAvailable) {
                                    furnitureItem?.child_notification?.purchased?.list.forEach(
                                      (list) => {
                                        const id1 = new ObjectId(
                                          list?.category_id
                                        );
                                        const id2 = new ObjectId(
                                          body.furniture_id
                                        );
                                        if (id1.equals(id2)) {
                                          purchased.list = {
                                            category_id: list?.category_id,
                                            notification_count:
                                              list?.notification_count + 1,
                                          };
                                          console.log(
                                            "purchased.list---->462",
                                            purchased.list
                                          );
                                        }
                                      }
                                    );
                                  } else {
                                    console.log("here---> 484");
                                    purchased.list = {
                                      notification_count: 1,
                                      category_id: body?.furniture_id,
                                    };
                                  }
                                } else {
                                  // notification_count += 1;
                                  addNotificationCountForList(1);
                                  purchased.list = {
                                    notification_count: 1,
                                    category_id: body?.furniture_id,
                                  };
                                }
                              } else {
                                if (
                                  furnitureItem?.child_notification?.saved
                                    ?.list &&
                                  furnitureItem?.child_notification?.saved?.list
                                    ?.length > 0
                                ) {
                                  const count =
                                    furnitureItem?.child_notification?.saved
                                      .notification_count + 1;
                                  addNotificationCountForList(count);
                                  // notification_count += 1;

                                  // check if list?.category_id is available or not
                                  let isListCategoryAvailable = false;
                                  furnitureItem?.child_notification?.saved?.list.forEach(
                                    (list) => {
                                      const id1 = new ObjectId(
                                        list?.category_id
                                      );
                                      const id2 = new ObjectId(
                                        body.furniture_id
                                      );
                                      if (id1.equals(id2)) {
                                        isListCategoryAvailable = true;
                                      }
                                    }
                                  );
                                  if (isListCategoryAvailable) {
                                    furnitureItem?.child_notification?.saved?.list.forEach(
                                      (list) => {
                                        const id1 = new ObjectId(
                                          list?.category_id
                                        );
                                        const id2 = new ObjectId(
                                          body.furniture_id
                                        );
                                        if (id1.equals(id2)) {
                                          saved.list = {
                                            category_id: list?.category_id,
                                            notification_count:
                                              list?.notification_count + 1,
                                          };
                                        }
                                      }
                                    );
                                  } else {
                                    saved.list = {
                                      notification_count: 1,
                                      category_id: body?.furniture_id,
                                    };
                                  }
                                } else {
                                  // notification_count += 1;
                                  addNotificationCountForList(1);
                                  saved.list = {
                                    notification_count: 1,
                                    category_id: body?.furniture_id,
                                  };
                                }
                              }
                            } else {
                              addNotificationCountForList(1);
                              addNewEntyForSavedPurchasedFavouriteItems();
                            }
                          }
                        );
                      } else {
                        addNotificationCountForList(1);
                        addNewEntyForSavedPurchasedFavouriteItems();
                      }
                    }
                  });
                } else {
                  addNotificationCountForList(1);
                  addNewEntyForSavedPurchasedFavouriteItems();
                }

                let dataToUpdate = {};
                dataToUpdate = {
                  profile_id: body.profile_id,
                  main_user_notification: {
                    notification_count: notification_count + 1,
                    furniture_notifications: {
                      category_id: body.furniture_category_id,
                      notification_count: furniture_category_notification_count,
                      child_notification: {},
                    },
                  },
                };

                console.log("notification_count--->666", notification_count);

                console.log(
                  "furniture_category_notification_count--->660",
                  furniture_category_notification_count
                );

                if (Boolean(furnitureData?.is_purchased)) {
                  dataToUpdate.main_user_notification.furniture_notifications.child_notification.purchased =
                    purchased;
                } else if (Boolean(furnitureData?.is_marked_favourite)) {
                  dataToUpdate.main_user_notification.furniture_notifications.child_notification.favourite =
                    favourite;
                } else {
                  dataToUpdate.main_user_notification.furniture_notifications.child_notification.saved =
                    saved;
                }

                console.log(
                  "here------------------> 647",
                  dataToUpdate.main_user_notification.furniture_notifications
                    .child_notification
                );
                console.log("here------------------> 652", purchased);

                if (Boolean(furnitureData?.is_purchased)) {
                  createOrUpdateNotificationCount(
                    body.profile_id,
                    body.furniture_category_id,
                    dataToUpdate,
                    "purchased"
                  );
                } else if (Boolean(furnitureData?.is_marked_favourite)) {
                  createOrUpdateNotificationCount(
                    body.profile_id,
                    body.furniture_category_id,
                    dataToUpdate,
                    "favourite"
                  );
                } else {
                  createOrUpdateNotificationCount(
                    body.profile_id,
                    body.furniture_category_id,
                    dataToUpdate,
                    "saved"
                  );
                }
              }
            };

            const isThereAnyUserIvitedwithCurrentProfileId =
              await InvitedUserModel.find({
                profile_id: body.profile_id,
              });
            if (
              isThereAnyUserIvitedwithCurrentProfileId &&
              isThereAnyUserIvitedwithCurrentProfileId?.length > 0
            ) {
              await Promise.all(
                isThereAnyUserIvitedwithCurrentProfileId.map(async (data) => {
                  const id1 = new ObjectId(data.parent_id);
                  const id2 = new ObjectId(decoded.user_id);
                  if (id1.equals(id2)) {
                    // add notification count to all co-users
                    addNotificationCount("couser");
                  } else {
                    // add notification count to main-users
                    addNotificationCount("mainuser");
                  }
                })
              );
            }

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
    // Check if the error is a validation error
    if (error.name === "ValidationError") {
      // If validation fails, send a 400 Bad Request response with the validation errors
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// delete furniture
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id
    furniture_id: body.furniture_id
*/
const deleteFurniture = async (req, res) => {
  try {
    const { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (decoded.user_type == "user") {
      let userData = await getUserbyProfileId(body.profile_id);
      const data = {
        user_id: userData._id,
        furniture_id: body.furniture_id,
        profile_id: body.profile_id,
      };
      await furnitureService
        .deleteFurnitureOfTheUser(data)
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

// list of furniture
/*
    write down the Params 
    No of Params
    user_id: query.user_id
*/
const getFurnitureList = async (req, res) => {
  try {
    const { decoded, query } = req;
    await setGlobalLanguage(query.user_id);
    if (decoded.user_type == "user" || decoded.user_type == "admin") {
      await furnitureService
        .getListOfFurniture(query)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully got the furniture list"
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

// mark furniture as fav
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id
    furniture_id: body.furniture_id
*/
const markFurnitureAsfav = async (req, res) => {
  try {
    const { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);
    if (decoded.user_type == "user") {
      let userData = await getUserbyProfileId(body.profile_id);
      await furnitureService
        .updateFurnitureasFav(body, userData._id)
        .then(async (response) => {
          if (
            body.is_marked_favourite == "true" ||
            body.is_marked_favourite == true
          ) {
            // send push notification
            sendPushNotificationOnActions(body, decoded);

            // notification count
            const furnitureData = await FurnitureModel.findById({
              _id: body.furniture_id,
              user_id: userData._id,
            });

            let notification_count = 0;
            let furniture_category_notification_count = 0;

            let favourite = { notification_count: 0, list: {} };

            const addNotificationCountForList = (count) => {
              furniture_category_notification_count += 1;
              if (Boolean(furnitureData?.is_marked_favourite)) {
                favourite.notification_count = count;
              }
            };

            const addNewEntyForSavedPurchasedFavouriteItems = () => {
              if (Boolean(furnitureData?.is_marked_favourite)) {
                favourite.list = {
                  category_id: body.furniture_id,
                  notification_count: 1,
                };
              }
            };

            // add notification count
            const addNotificationCount = async (addNotificationTo) => {
              const notificationCount = await getAllNotificationCount();
              // add notification to co users
              if (addNotificationTo == "couser") {
              } else {
                // add notification to main users

                const furnitureListItem = await FurnitureModel.findById(
                  body?.furniture_id
                );

                if (notificationCount && notificationCount?.length > 0) {
                  notificationCount.forEach((profile) => {
                    const id1 = new ObjectId(profile.profile_id);
                    const id2 = new ObjectId(body.profile_id);

                    notification_count +=
                      profile?.main_user_notification?.notification_count;

                    if (id1.equals(id2)) {
                      if (
                        profile?.main_user_notification
                          ?.furniture_notifications &&
                        profile?.main_user_notification?.furniture_notifications
                          ?.length > 0
                      ) {
                        profile?.main_user_notification?.furniture_notifications.forEach(
                          (furnitureItem) => {
                            const id1 = new ObjectId(
                              furnitureItem?.category_id
                            );
                            const id2 = new ObjectId(
                              furnitureData.furniture_category_id
                            );

                            if (id1.equals(id2)) {
                              furniture_category_notification_count =
                                furnitureItem?.notification_count;

                              if (
                                Boolean(furnitureListItem?.is_marked_favourite)
                              ) {
                                if (
                                  furnitureItem?.child_notification?.favourite
                                    ?.list &&
                                  furnitureItem?.child_notification?.favourite
                                    ?.list?.length > 0
                                ) {
                                  const count =
                                    furnitureItem?.child_notification?.favourite
                                      .notification_count + 1;
                                  addNotificationCountForList(count);

                                  // check if list?.category_id is available or not
                                  let isListCategoryAvailable = false;
                                  furnitureItem?.child_notification?.favourite?.list.forEach(
                                    (list) => {
                                      const id1 = new ObjectId(
                                        list?.category_id
                                      );
                                      const id2 = new ObjectId(
                                        body.furniture_id
                                      );
                                      if (id1.equals(id2)) {
                                        isListCategoryAvailable = true;
                                      }
                                    }
                                  );

                                  if (isListCategoryAvailable) {
                                    furnitureItem?.child_notification?.favourite?.list.forEach(
                                      (list) => {
                                        const id1 = new ObjectId(
                                          list?.category_id
                                        );
                                        const id2 = new ObjectId(
                                          body.furniture_id
                                        );
                                        if (id1.equals(id2)) {
                                          favourite.list = {
                                            category_id: list?.category_id,
                                            notification_count:
                                              list?.notification_count + 1,
                                          };
                                        }
                                      }
                                    );
                                  } else {
                                    favourite.list = {
                                      notification_count: 1,
                                      category_id: body?.furniture_id,
                                    };
                                  }
                                } else {
                                  addNotificationCountForList(1);
                                  favourite.list = {
                                    notification_count: 1,
                                    category_id: body?.furniture_id,
                                  };
                                }
                              }
                            } else {
                              addNotificationCountForList(1);
                              addNewEntyForSavedPurchasedFavouriteItems();
                            }
                          }
                        );
                      } else {
                        addNotificationCountForList(1);
                        addNewEntyForSavedPurchasedFavouriteItems();
                      }
                    }
                  });
                } else {
                  addNotificationCountForList(1);
                  addNewEntyForSavedPurchasedFavouriteItems();
                }

                let dataToUpdate = {};
                dataToUpdate = {
                  profile_id: body.profile_id,
                  main_user_notification: {
                    notification_count: notification_count + 1,
                    furniture_notifications: {
                      category_id: furnitureData.furniture_category_id,
                      notification_count: furniture_category_notification_count,
                      child_notification: {},
                    },
                  },
                };

                if (Boolean(furnitureData?.is_marked_favourite)) {
                  dataToUpdate.main_user_notification.furniture_notifications.child_notification.favourite =
                    favourite;
                }

                if (Boolean(furnitureData?.is_marked_favourite)) {
                  createOrUpdateNotificationCount(
                    body.profile_id,
                    furnitureData.furniture_category_id,
                    dataToUpdate,
                    "favourite"
                  );
                }
              }
            };

            const isThereAnyUserIvitedwithCurrentProfileId =
              await InvitedUserModel.find({
                profile_id: body.profile_id,
              });
            if (
              isThereAnyUserIvitedwithCurrentProfileId &&
              isThereAnyUserIvitedwithCurrentProfileId?.length > 0
            ) {
              await Promise.all(
                isThereAnyUserIvitedwithCurrentProfileId.map(async (data) => {
                  const id1 = new ObjectId(data.parent_id);
                  const id2 = new ObjectId(decoded.user_id);
                  if (id1.equals(id2)) {
                    // add notification count to all co-users
                    addNotificationCount("couser");
                  } else {
                    // add notification count to main-users
                    addNotificationCount("mainuser");
                  }
                })
              );
            }

            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText("Added to favourite"),
              data: response,
            });
          } else {
            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText("Removed from favourite"),
              data: response,
            });
          }
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

// add furniture to purchased
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id
    furniture_id: body.furniture_id
*/
const addFurnitureAsPurchased = async (req, res) => {
  try {
    const { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);
    if (decoded.user_type == "user") {
      let userData = await getUserbyProfileId(body.profile_id);
      await furnitureService
        .updateFurnitureaspurchased(body, userData._id)
        .then(async (response) => {
          // send push notification
          sendPushNotificationOnActions(body, decoded);

          // notification count
          const furnitureData = await FurnitureModel.findById({
            _id: body.furniture_id,
            user_id: userData._id,
          }).lean();

          let notification_count = 0;
          let furniture_category_notification_count = 0;

          let purchased = { notification_count: 0, list: {} };

          const addNotificationCountForList = (count) => {
            furniture_category_notification_count += 1;
            if (Boolean(furnitureData?.is_purchased)) {
              purchased.notification_count = count;
            }
          };

          const addNewEntyForSavedPurchasedFavouriteItems = () => {
            if (Boolean(furnitureData?.is_purchased)) {
              purchased.list = {
                category_id: body.furniture_id,
                notification_count: 1,
              };
            }
          };

          // add notification count
          const addNotificationCount = async (addNotificationTo) => {
            const notificationCount = await getAllNotificationCount();

            // add notification to co users
            if (addNotificationTo == "couser") {
            } else {
              // add notification to main users

              const furnitureListItem = await FurnitureModel.findById(
                body?.furniture_id
              ).lean();

              if (notificationCount && notificationCount?.length > 0) {
                notificationCount.forEach((profile) => {
                  const id1 = new ObjectId(profile.profile_id);
                  const id2 = new ObjectId(body.profile_id);

                  notification_count +=
                    profile?.main_user_notification?.notification_count;

                  if (id1.equals(id2)) {
                    if (
                      profile?.main_user_notification
                        ?.furniture_notifications &&
                      profile?.main_user_notification?.furniture_notifications
                        ?.length > 0
                    ) {
                      profile?.main_user_notification?.furniture_notifications.forEach(
                        (furnitureItem) => {
                          const id1 = new ObjectId(furnitureItem?.category_id);
                          const id2 = new ObjectId(
                            furnitureData.furniture_category_id
                          );

                          if (id1.equals(id2)) {
                            furniture_category_notification_count =
                              furnitureItem?.notification_count;

                            if (Boolean(furnitureListItem?.is_purchased)) {
                              if (
                                furnitureItem?.child_notification?.purchased
                                  ?.list &&
                                furnitureItem?.child_notification?.purchased
                                  ?.list?.length > 0
                              ) {
                                const count =
                                  furnitureItem?.child_notification?.purchased
                                    .notification_count + 1;
                                addNotificationCountForList(count);

                                // check if list?.category_id is available or not
                                let isListCategoryAvailable = false;
                                furnitureItem?.child_notification?.purchased?.list.forEach(
                                  (list) => {
                                    const id1 = new ObjectId(list?.category_id);
                                    const id2 = new ObjectId(body.furniture_id);
                                    if (id1.equals(id2)) {
                                      isListCategoryAvailable = true;
                                    }
                                  }
                                );

                                if (isListCategoryAvailable) {
                                  furnitureItem?.child_notification?.purchased?.list.forEach(
                                    (list) => {
                                      const id1 = new ObjectId(
                                        list?.category_id
                                      );
                                      const id2 = new ObjectId(
                                        body.furniture_id
                                      );
                                      if (id1.equals(id2)) {
                                        purchased.list = {
                                          category_id: list?.category_id,
                                          notification_count:
                                            list?.notification_count + 1,
                                        };
                                      }
                                    }
                                  );
                                } else {
                                  purchased.list = {
                                    notification_count: 1,
                                    category_id: body?.furniture_id,
                                  };
                                }
                              } else {
                                addNotificationCountForList(1);
                                purchased.list = {
                                  notification_count: 1,
                                  category_id: body?.furniture_id,
                                };
                              }
                            }
                          } else {
                            addNotificationCountForList(1);
                            addNewEntyForSavedPurchasedFavouriteItems();
                          }
                        }
                      );
                    } else {
                      addNotificationCountForList(1);
                      addNewEntyForSavedPurchasedFavouriteItems();
                    }
                  }
                });
              } else {
                addNotificationCountForList(1);
                addNewEntyForSavedPurchasedFavouriteItems();
              }

              let dataToUpdate = {};
              dataToUpdate = {
                profile_id: body.profile_id,
                main_user_notification: {
                  notification_count: notification_count + 1,
                  furniture_notifications: {
                    category_id: furnitureData.furniture_category_id,
                    notification_count: furniture_category_notification_count,
                    child_notification: {},
                  },
                },
              };

              if (Boolean(furnitureData?.is_purchased)) {
                dataToUpdate.main_user_notification.furniture_notifications.child_notification.purchased =
                  purchased;
              }

              if (Boolean(furnitureData?.is_purchased)) {
                createOrUpdateNotificationCount(
                  body.profile_id,
                  furnitureData.furniture_category_id,
                  dataToUpdate,
                  "purchased"
                );
              }
            }
          };

          const isThereAnyUserIvitedwithCurrentProfileId =
            await InvitedUserModel.find({
              profile_id: body.profile_id,
            }).lean();
          if (
            isThereAnyUserIvitedwithCurrentProfileId &&
            isThereAnyUserIvitedwithCurrentProfileId?.length > 0
          ) {
            await Promise.all(
              isThereAnyUserIvitedwithCurrentProfileId.map(async (data) => {
                const id1 = new ObjectId(data.parent_id);
                const id2 = new ObjectId(decoded.user_id);
                if (id1.equals(id2)) {
                  // add notification count to all co-users
                  addNotificationCount("couser");
                } else {
                  // add notification count to main-users
                  addNotificationCount("mainuser");
                }
              })
            );
          }

          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully added/updated to cart"
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

// get list of purchased furniture
/*
    write down the Params 
    No of Params
    user_id: params.user_id
*/
const getPurchasedFurniture = async (req, res) => {
  try {
    const { decoded, query } = req;
    await setGlobalLanguage(query.user_id);
    if (decoded.user_type == "user" || decoded.user_type == "admin") {
      let userData = await getUserbyProfileId(query.profile_id);
      await furnitureService
        .getPurchasedFurnitureList(query, userData?._id)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Successfully got purchased list"),
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

// get list of fav furniture
/*
    write down the Params 
    No of Params
    user_id: params.user_id
*/
const getFavFurniture = async (req, res) => {
  try {
    const { decoded, query } = req;
    await setGlobalLanguage(decoded.user_id);
    if (decoded.user_type == "user" || decoded.user_type == "admin") {
      await furnitureService
        .getfavFurnitureList(query)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Successfully got fav list"),
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

// add furniture category
/*
    write down the Params 
    No of Params
    furniture_category_name: body.furniture_category_name
    furniture_category_image: body.furniture_category_image
    user_id: decoded.user_id
*/
const addFurnitureCategory = async (req, res) => {
  try {
    const { body, file, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (!body.furniture_category_name) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Furniture Category name should not be empty",
        key: "furniture_category_name",
      });
    } else if (body.furniture_category_name) {
      let userData = await getUserbyProfileId(body.profile_id);

      const catList = await FurnitureCategoryModel.find({
        user_id: userData?._id,
        profile_id: body.profile_id,
      });

      if (
        userData.subcription === "free tier" &&
        catList &&
        catList?.length >= 1
      ) {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText(
            "Please subscribe to the function extension to enter additional entries"
          ),
        });
      }

      await furnitureService
        .addFurnitureOfTheUser({
          smartMove: "true",
          furniture_category_name: body.furniture_category_name,
          user_id: userData?._id,
          furniture_category_image:
            "public/categoryimage/1704261888607-Further_Other.png",
          furniture_image_mime_type: "image/png",
          profile_id: body.profile_id,
        })
        .then(async (response) => {
          // send push notification
          sendPushNotificationOnActions(body, decoded);
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully added the furniture category"
            ),
          });
        });
    }
    // else if (!file) {
    //   res.status(500).json({
    //     statusCode: statusCode.validation,
    //     message: await translateTheText("Form validations are required"),
    //     label: "Furniture Category image should not be empty",
    //     key: "furniture_category_image",
    //   });
    // }
    // else if (body.furniture_category_name && file.filename) {
    //   const data = {
    //     furniture_category_name: body.furniture_category_name,
    //     furniture_category_image:
    //       "public/furniturecategoryimage/" + file.filename,
    //     furniture_image_mime_type: file.mimetype,
    //     user_id: decoded.user_id,
    //   };
    //   await furnitureService
    //     .addFurnitureOfTheUser(data)
    //     .then(async (response) => {
    //       return res.status(200).json({
    //         statusCode: statusCode.sucess,
    //         message: await translateTheText(
    //           "Successfully added the furniture category"
    //         ),
    //       });
    //     });
    // }
  } catch (error) {
    printConsole("error while uploading", error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// update Furniture category
/*
    write down the params
    No of params
    furniture_category_id: body.furniture_category_id
    furniture_category_name: body.furniture_category_name
    furniture_category_image: body.furniture_category_image
    user_id: decoded.user_id
*/
// let updateFurnitureCategory = async (req, res) => {
//     try {
//         let { body, file, decoded } = req
//         await setGlobalLanguage(decoded.user_id)
//         if (!body.furniture_category_name) {
//             res.status(500).json({
//                 statusCode: statusCode.validation,
//                 message: await translateTheText("Form validations are required"),
//                 label: "Furniture Category image should not be empty",
//                 key: "furniture_category_image"
//             })
//         } else if (!file) {
//             res.status(500).json({
//                 statusCode: statusCode.validation,
//                 message: await translateTheText("Form validations are required"),
//                 label: "Furniture Category image should not be empty",
//                 key: "furniture_category_image"
//             })
//         } else if (!body.furniture_category_id) {
//             res.status(500).json({
//                 statusCode: statusCode.validation,
//                 message: await translateTheText("Form validations are required"),
//                 label: "Furniture Category id should not be empty",
//                 key: "furniture_category_id"
//             })
//         } else if (body.furniture_category_name && file.filename && body.furniture_category_id) {
//             const data = {
//                 furniture_category_name: body.furniture_category_name,
//                 furniture_category_image: 'public/furniturecategoryimage/' + file.filename,
//                 furniture_image_mime_type: file.mimetype,
//                 furniture_category_id: body.furniture_category_id
//             }
//             await furnitureService.updateFurnitureCatOfTheUser(data, decoded.user_id)
//                 .then(async response => {
//                     res.status(200).json({
//                         statusCode: statusCode.sucess,
//                         message: await translateTheText("Successfully updated the furniture category"),
//                         data: response
//                     })
//                 })
//                 .catch(async (error) => {
//                     printConsole("error ", error)
//                     res.status(500).json({
//                         statusCode: statusCode.internalError,
//                         message: await translateTheText("Internal server error")
//                     })
//                 });
//         }
//     } catch (error) {
//         printConsole(error);
//         res.status(500).json({
//             statusCode: statusCode.internalError,
//             message: await translateTheText("Internal server error")
//         })
//     }
// }

// delete category
/*
    write down the params
    No of params
    furniture_category_id: body.furniture_category_id
    user_id: decoded.user_id
*/
// let deleteFurnitureCategory = async (req, res) => {
//     try {
//         let { params, decoded } = req
//         await setGlobalLanguage(decoded.user_id)
//         if (!params.furniture_category_id) {
//             return res.status(400).json({ statusCode: statusCode.validation, message: await translateTheText("Furniture Category Id should not be empty") });
//         } else {
//             if (decoded.user_type == "user") {
//                 await furnitureService.deleteFurnitureCategory(params, decoded.user_id)
//                     .then(async response => {
//                         res.status(200).json({
//                             statusCode: statusCode.sucess,
//                             message: await translateTheText("Successfully deleted the furniture category")
//                         })
//                     })
//                     .catch(async (error) => {
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

// get furniture category list API
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id
*/
let getFurnitureCategoryList = async (req, res) => {
  try {
    const { params } = req;
    await setGlobalLanguage(req.decoded.user_id);
    if (req.decoded.user_type == "user" || req.decoded.user_type == "admin") {
      let userData = await getUserbyProfileId(params.profile_id);
      const catList = await furnitureService.getFurnitureCategory(
        userData?._id,
        params.profile_id
      );
      res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText(
          "Successfully got the furniture category list"
        ),
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

module.exports = {
  addFurniture,
  updateFurniture,
  deleteFurniture,
  getFurnitureList,
  markFurnitureAsfav,
  addFurnitureAsPurchased,
  getPurchasedFurniture,
  getFavFurniture,
  addFurnitureCategory,
  // updateFurnitureCategory,
  // deleteFurnitureCategory,
  getFurnitureCategoryList,
};
