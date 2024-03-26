const {
  printConsole,
  translateTheText,
  setGlobalLanguage,
  getUserbyProfileId,
  sendPushNotificationOnActions,
} = require("../../Utils/commonFile");
const { statusCode } = require("../../Utils/const");
const UserModel = require("../schema/user.schema");
const scaleService = require("./scale.service");

// add accounting
/*
    write down the params
    No of params
    title: body.title
    length: body.length
    height: body.height
    width: body.width
    user_id: body.user_id
*/
let addScaleMeasurement = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(body.user_id);
    // const userData = await UserModel.findById(decoded.user_id);
    let userData = await getUserbyProfileId(body.profile_id);

    if (userData.user_type == "user") {
      const nonSubData =
        await scaleService.getScaleItemForLoginBasedOnSubcription(
          body,
          userData?.subcription,
          userData?._id
        );

      // If user.subcription is "free tier" than maximum of 15 measurements can be stored.
      /**
       * Note:- Because nonSubData[0].scaleList.length is starting from 0 we kept condition of >= 15.
       */
      if (
        userData.subcription === "free tier" &&
        nonSubData &&
        nonSubData[0].scaleList.length >= 15
      ) {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText(
            "Please subscribe to the function extension to enter additional entries"
          ),
        });
      }
      await scaleService.addScaleMeasurements(body).then(async (response) => {
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

// let addScaleMeasurement = async (req, res) => {
//   try {
//     let { body, decoded } = req;
//     await setGlobalLanguage(body.user_id);
//     if (decoded.user_type == "user") {
//       const nonSubData =
//         await scaleService.getScaleItemForLoginBasedOnSubcription(
//           body,
//           "free tier"
//         );
//       console.log(nonSubData);
//       const subData = await scaleService.getScaleItemForLoginBasedOnSubcription(
//         body,
//         "function extension"
//       );
//       if (
//         nonSubData &&
//         nonSubData.length > 0 &&
//         nonSubData[0].scaleList.length < 15
//       ) {
//         await scaleService.addScaleMeasurements(body).then(async (response) => {
//           return res.status(200).json({
//             statusCode: statusCode.sucess,
//             message: await translateTheText(`Entry successful`),
//           });
//         });
//       } else if (subData && subData.length > 0) {
//         await scaleService.addScaleMeasurements(body).then(async (response) => {
//           return res.status(200).json({
//             statusCode: statusCode.sucess,
//             message: await translateTheText(`Entry successful`),
//           });
//         });
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
//           "You are not authorized to access this API URL"
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

// update accounting
/*
    write down the params
    No of params
    title: body.title
    length: body.length
    height: body.height
    width: body.width
    user_id: body.user_id
    scale_id: body.scale_id
*/
// let updateScaleMeasurement = async (req, res) => {
//   try {
//     let { body, decoded } = req;
//     await setGlobalLanguage(body.user_id);
//     if (decoded.user_type == "user") {
//       const nonSubData =
//         await scaleService.getScaleItemForLoginBasedOnSubcription(
//           body,
//           "free tier"
//         );
//       console.log(nonSubData);
//       const subData = await scaleService.getScaleItemForLoginBasedOnSubcription(
//         body,
//         "function extension"
//       );
//       if (
//         nonSubData &&
//         nonSubData.length > 0 &&
//         nonSubData[0].scaleList.length < 15
//       ) {
//         await scaleService.updateScaleList(body).then(async (response) => {
//           return res.status(200).json({
//             statusCode: statusCode.sucess,
//             message: await translateTheText("Entry update was successful"),
//             data: response,
//           });
//         });
//       } else if (subData && subData.length > 0) {
//         await scaleService.updateScaleList(body).then(async (response) => {
//           return res.status(200).json({
//             statusCode: statusCode.sucess,
//             message: await translateTheText("Entry update was successful"),
//           });
//         });
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
//           "You are not authorized to access this API URL"
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

// delete accounting

let updateScaleMeasurement = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(body.user_id);
    if (decoded.user_type == "user") {
      let userData = await getUserbyProfileId(body.profile_id);
      await scaleService
        .updateScaleList(body, userData?._id)
        .then(async (response) => {
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

/*
    write down the params
    No of params
    user_id: body.user_id
    accounting_id: body.accounting_id
*/
let deleteScaleMeasurement = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(body.user_id);
    if (decoded.user_type == "user") {
      let userData = await getUserbyProfileId(body.profile_id);
      await scaleService.deleteScaleDetails(body, userData?._id);
      // send push notification
      sendPushNotificationOnActions(body, decoded);
      res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText("Entry deleted"),
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

// list of accounting
/*
    write down the params
    No of params
    user_id: query.user_id
*/
let scaleMeasurementList = async (req, res) => {
  try {
    let { query, decoded } = req;
    if (decoded.user_type == "user" || decoded.user_type == "admin") {
      await setGlobalLanguage(query.user_id);
      let userData = await getUserbyProfileId(query.profile_id);
      printConsole(query);
      await scaleService
        .getListOfScale(query, userData?._id)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Successfully got the lists"),
            data: response,
          });
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

// add Scale Measurement
let addScaleMeasurements = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(body.user_id);
    const userData = await getUserbyProfileId(body.profile_id);
    // const userData = await UserModel.findById(decoded.user_id);
    if (userData.user_type == "user") {
      const scaleData =
        await scaleService.getScaleItemForLoginBasedOnSubcriptionAndScaleId(
          body,
          userData?.subcription,
          userData?._id
        );

      if (scaleData && scaleData.length > 0) {
        await scaleService.addScaleMeasurement(body).then(async (response) => {
          // send push notification
          sendPushNotificationOnActions(body, decoded);
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              `Scale measurement added successfullly`
            ),
          });
        });
      } else {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText("Sclae not found"),
        });
      }
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

// let addScaleMeasurements = async (req, res) => {
//   try {
//     let { body, decoded } = req;
//     await setGlobalLanguage(body.user_id);
//     if (decoded.user_type == "user") {
//       const nonSubData =
//         await scaleService.getScaleItemForLoginBasedOnSubcription(
//           body,
//           "free tier"
//         );
//       console.log(nonSubData);
//       const subData = await scaleService.getScaleItemForLoginBasedOnSubcription(
//         body,
//         "function extension"
//       );

//       if (
//         (nonSubData && nonSubData.length > 0) ||
//         (subData && subData.length > 0)
//       ) {
//         await scaleService.addScaleMeasurement(body).then(async (response) => {
//           return res.status(200).json({
//             statusCode: statusCode.sucess,
//             message: await translateTheText(
//               `Scale measurement added successfullly`
//             ),
//           });
//         });
//       } else {
//         return res.status(400).json({
//           statusCode: statusCode.validation,
//           message: await translateTheText("Sclae not found"),
//         });
//       }

//       //   if (
//       //     nonSubData &&
//       //     nonSubData.length > 0 &&
//       //     nonSubData[0].scaleList.length < 15
//       //   ) {
//       //     await scaleService.updateScaleMeasurement(body).then(async (response) => {
//       //       return res.status(200).json({
//       //         statusCode: statusCode.sucess,
//       //         message: await translateTheText(`Entry successful`),
//       //       });
//       //     });
//       //   } else if (subData && subData.length > 0) {
//       //     await scaleService.updateScaleMeasurement(body).then(async (response) => {
//       //       return res.status(200).json({
//       //         statusCode: statusCode.sucess,
//       //         message: await translateTheText(`Entry successful`),
//       //       });
//       //     });
//       //   } else {
//       //     return res.status(400).json({
//       //       statusCode: statusCode.validation,
//       //       message: await translateTheText(
//       //         "The limit for entries has been reached, please subscribe to the feature extension or premium subscription to add more entries."
//       //       ),
//       //     });
//       //   }
//     } else {
//       res.status(401).json({
//         statusCode: statusCode.unauthorised,
//         message: await translateTheText(
//           "You are not authorized to access this API URL"
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

// update Scale Measurement
let updateScaleMeasurements = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(body.user_id);
    const userData = await getUserbyProfileId(body.profile_id);

    if (decoded.user_type == "user") {
      const scaleData =
        await scaleService.getScaleItemForLoginBasedOnSubcriptionAndScaleId(
          body,
          userData?.subcription,
          userData?._id
        );

      if (scaleData && scaleData.length > 0) {
        await scaleService
          .updateScaleMeasurement(body)
          .then(async (response) => {
            // send push notification
            sendPushNotificationOnActions(body, decoded);
            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText(
                `Scale measurement updated successfullly`
              ),
            });
          });
      } else {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText("Sclae not found"),
        });
      }
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

// delete Scale Measurement
let deleteScaleMeasurements = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(body.user_id);
    if (decoded.user_type == "user") {
      await scaleService.deleteScaleMeasurement(body);
      // send push notification
      sendPushNotificationOnActions(body, decoded);
      res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText(
          "Scale measurement deleted successfully"
        ),
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

// get Scale Measurements
let getScaleMeasurements = async (req, res) => {
  try {
    let { query, decoded, body } = req;
    if (decoded.user_type == "user" || decoded.user_type == "admin") {
      await setGlobalLanguage(query.user_id);
      await scaleService.getScaleMeasurements(body).then(async (response) => {
        // send push notification
        sendPushNotificationOnActions(body, decoded);
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Successfully got the lists"),
          data: response,
        });
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
  addScaleMeasurement,
  updateScaleMeasurement,
  deleteScaleMeasurement,
  scaleMeasurementList,
  addScaleMeasurements,
  updateScaleMeasurements,
  deleteScaleMeasurements,
  getScaleMeasurements,
};
