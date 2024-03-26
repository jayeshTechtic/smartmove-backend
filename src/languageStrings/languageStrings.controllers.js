const {
  printConsole,
  translateTheText,
  setGlobalLanguage,
} = require("../../Utils/commonFile");
const { statusCode } = require("../../Utils/const");
const languageStringsService = require("./languageStrings.service");

// add language strings based on selected languages
/*
    write down the params
    No of params
    body: body
*/
let addLanguageStrings = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (decoded.user_type == "admin") {
      await languageStringsService
        .addLanguageStringsBasedOnSelectedLanguage(body)
        .then(async (response) => {
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

// update language string
/*
    write down the params
    No of params
    body: body
*/
let updateLanguageStrings = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (decoded.user_type == "admin") {
      body.updated_dt = Date.now();
      await languageStringsService
        .updateLanguageStringsBasedOnSelectedLanguage(body)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(`Entry update was successful`),
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

// delete accounting
/*
    write down the params
    No of params
    body: body
*/
let deleteLanguageStrings = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (decoded.user_type == "admin") {
      await languageStringsService.deleteLanguageStringsBasedOnSelectedLanguage(
        body
      );
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
    body: body
*/
let languageStringsList = async (req, res) => {
  try {
    let { query } = req;
    if (query.user_id) await setGlobalLanguage(query.user_id);
    await languageStringsService
      .getListOflanguageStrings(query)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Successfully got the lists"),
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
  addLanguageStrings,
  updateLanguageStrings,
  deleteLanguageStrings,
  languageStringsList,
};
