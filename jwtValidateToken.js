const jwt = require("jsonwebtoken");
const {
  decrypt,
  printConsole,
  translateTheText,
} = require("./Utils/commonFile");
const { statusCode } = require("./Utils/const");
const config = require("dotenv").config();

module.exports = {
  validateToken: async (req, res, next) => {
    const authorizationHeaader = req.headers.authorization;
    let result;
    if (authorizationHeaader) {
      // console.log("req header", req.headers)
      const token = req.headers.authorization.split(" ")[1]; // Bearer <token>
      // Find the index of 'Authorization' in the array
      //   console.log("req.rawHeaders", req.rawHeaders);
      let authIndex = req.rawHeaders.indexOf("Authorization");
      if (authIndex == -1) authIndex = req.rawHeaders.indexOf("authorization");

      // If 'Authorization' is found and there is a next element, extract the Bearer token
      let device_token = "";
      //   console.log("req.rawHeaders.length", req.rawHeaders.length);
      //   console.log("authIndex", authIndex);
      if (authIndex !== -1 && req.rawHeaders.length > authIndex + 1) {
        // console.log("inside authIndex");
        device_token = req.rawHeaders[authIndex + 1].split(" ")[1];
      } else {
        printConsole("Bearer token not found in headers.");
      }
      const options = {
        expiresIn: "7d",
      };
      try {
        // verify device_token
        const deviceTokenResult = jwt.verify(
          device_token,
          config.parsed.JWT_SECRET,
          options
        );
        const deviceTokenData = await decrypt(
          deviceTokenResult.data,
          deviceTokenResult.user_id
        );
        // verify makes sure that the token hasn't expired and has been issued by us
        result = jwt.verify(token, config.parsed.JWT_SECRET, options);
        const decryptedData = await decrypt(result.data, result.user_id);

        if (
          deviceTokenData.device_token == decryptedData.device_token ||
          decryptedData.user_type == "admin" ||
          decryptedData.user_type == "sub-admin"
        ) {
          // Let's pass back the decoded token to the request object
          req.decoded = decryptedData;
          // We call next to pass execution to the subsequent middleware
          next();
        } else {
          res.status(401).json({
            statusCode: statusCode.inValidDeviceToken,
            message: await translateTheText("Your device token is mismatched"),
          });
        }
      } catch (err) {
        // Throw an error just in case anything goes wrong with verification
        result = {
          statusCode: statusCode.unauthorised,
          error: await translateTheText("JWT Token Exprired"),
        };
        res.status(401).send(result);
      }
    } else {
      result = {
        error: await translateTheText(`Authentication error. Token required.`),
        statusCode: statusCode.unauthorised,
      };
      res.status(401).send(result);
    }
  },
};
