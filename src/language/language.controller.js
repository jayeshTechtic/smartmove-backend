const { printConsole, translateTheText } = require("../../Utils/commonFile");
const { statusCode } = require("../../Utils/const");
const languageService = require("./language.service");

// get list of languages
/*
    write down the params
    No of params
*/
let getListofLanguages = async (req, res) => {
  try {
    await languageService.getListOflanguage().then(async (response) => {
      const modifiedResponse = await Promise.all(
        response.map(async (item) => {
          const language_name = await translateTheText(item.language_name);
          return {
            ...item,
            language_name,
          };
        })
      );
      return res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText("Successfully got the lists"),
        data: modifiedResponse,
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

// add language
let addLanguage = async (req, res) => {
  try {
    await languageService.addLanguage(req.body).then(async (response) => {
      return res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText("Successfully added new language"),
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
  getListofLanguages,
  addLanguage,
};
