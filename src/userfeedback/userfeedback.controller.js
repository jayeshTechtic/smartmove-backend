const {
  printConsole,
  translateTheText,
  setGlobalLanguage,
} = require("../../Utils/commonFile");
const { statusCode } = require("../../Utils/const");
const userFeedbackService = require("./userfeedback.service");

// add user Feedback
/*
    write down the params
    No of params
    user_feedback: body.user_feedback
    user_id: body.user_id
*/
let addfeedback = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(body.user_id);
    if (decoded.user_type == "user") {
      await userFeedbackService.addUserFeedback(body);
      res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText("Feedback added successfully"),
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
// get user Feedback
let getfeedback = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded?.user_id);
    if (decoded.user_type == "user" || decoded.user_type == "admin") {
      const response = await userFeedbackService.getUserFeedback(
        decoded?.user_id
      );
      res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText("Feedback got successfully"),
        data: response,
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
  addfeedback,
  getfeedback,
};
