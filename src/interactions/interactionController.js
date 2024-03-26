const {
  printConsole,
  translateTheText,
  setGlobalLanguage,
} = require("../../Utils/commonFile");
const { statusCode } = require("../../Utils/const");
const interactionService = require("./interactionService");

// Intractions
let setIntractions = async (req, res) => {
  try {
    const { query, decoded } = req;
    // await setGlobalLanguage(decoded?.user_id);
    return await interactionService
      .interactions(query?.item, decoded.user_id)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Intractions added Successfully"),
        });
      })
      .catch(async (error) => {
        printConsole("error ", error);
        res.status(500).json({
          statusCode: statusCode.internalError,
          message: await translateTheText(error),
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
  setIntractions,
};
