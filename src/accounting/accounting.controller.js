const {
  printConsole,
  translateTheText,
  setGlobalLanguage,
  getUserbyProfileId,
  sendPushNotificationOnActions,
} = require("../../Utils/commonFile");
const { statusCode } = require("../../Utils/const");
const accountingService = require("./accounting.server");
const userService = require("../users/userService");

// add accounting
/*
    write down the params
    No of params
    accounting_title: body.accounting_title
    price: body.price
    user_id: body.user_id
*/
let addAccounting = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(body.user_id);
    if (decoded.user_type == "user") {
      // const userData = await userService.findExistingUser({
      //   _id: body.user_id,
      //   subcription: "smartmove premium",
      // });

      let userData = await getUserbyProfileId(body.profile_id);

      if (userData && userData?.subcription == "smartmove premium") {
        await accountingService.addAccountingDetails(body);
        // send push notification
        sendPushNotificationOnActions(body, decoded);
        res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully added the accounting details"
          ),
        });
      } else {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText(
            "Please subscribe to the smartmove premium to be able to use this function"
          ),
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

// update accounting
/*
    write down the params
    No of params
    accounting_title: body.accounting_title
    price: body.price
    user_id: body.user_id
    accounting_id: body.accounting_id
*/
let updateAccounting = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(body.user_id);
    if (decoded.user_type == "user") {
      // const userData = await userService.findExistingUser({
      //   _id: body.user_id,
      //   subcription: "function extension",
      // });

      let userData = await getUserbyProfileId(body.profile_id);

      if (userData && userData?.subcription == "smartmove premium") {
        const accountingData = await accountingService.updateAccountingDetails(
          body
        );
        // send push notification
        sendPushNotificationOnActions(body, decoded);
        res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully updated the accounting details"
          ),
          data: accountingData,
        });
      } else {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText(
            "Please subscribe to accounting to be able to use this function."
          ),
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

// delete accounting
/*
    write down the params
    No of params
    user_id: body.user_id
    accounting_id: body.accounting_id
*/
let deleteAccounting = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(body.user_id);
    if (decoded.user_type == "user") {
      // const userData = await userService.findExistingUser({
      //   _id: body.user_id,
      //   subcription: "function extension",
      // });

      let userData = await getUserbyProfileId(body.profile_id);

      if (userData && userData?.subcription == "smartmove premium") {
        await accountingService.deleteAccountingDetails(body);
        // send push notification
        sendPushNotificationOnActions(body, decoded);
        res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully deleted the accounting details"
          ),
        });
      } else {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText(
            "Please subscribe to the smartmove premium to be able to use this function"
          ),
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

// list of accounting
/*
    write down the params
    No of params
    user_id: query.user_id
*/
let accountingList = async (req, res) => {
  try {
    let { query, decoded } = req;
    await setGlobalLanguage(query.user_id);
    if (decoded.user_type == "user" || decoded.user_type == "admin") {
      // const userData = await userService.findExistingUser({
      //   _id: query.user_id,
      //   subcription: "function extension",
      // });
      let userData = await getUserbyProfileId(query.profile_id);

      if (userData && userData?.subcription == "smartmove premium") {
        const accountingList =
          await accountingService.getListOfAccountingDetails(query);
        res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("List of accounting details"),
          data: accountingList,
        });
      } else {
        return res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText(
            "Please subscribe to the smartmove premium to be able to use this function"
          ),
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

// add user bugget
/*
    write down the params
    No of params
    user_id: body.user_id
    user_budget: body.user_budget
*/
let setUserBudget = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(body.user_id);
    if (decoded.user_type == "user") {
      let userData = await getUserbyProfileId(body.profile_id);

      await accountingService.addAccountingUserBudget(body, userData);
      res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText(
          "Successfully added the accounting details"
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

module.exports = {
  addAccounting,
  updateAccounting,
  deleteAccounting,
  accountingList,
  setUserBudget,
};
