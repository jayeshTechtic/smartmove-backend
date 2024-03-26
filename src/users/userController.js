/**
 * users/userController.js
 *
 * User APIs.
 */

const {
  userSignupSchema,
  userSignInSchema,
  resetPasswordSchema,
  userUpdateAccountSchema,
  userSocialSignInSchema,
} = require("../../Utils/Validations/userValidationSchema");
const {
  printConsole,
  encrypt,
  createJwtToken,
  decrypt,
  translateTheText,
  setGlobalLanguage,
  sendPushNotification,
  getUserbyProfileId,
} = require("../../Utils/commonFile");
const { statusCode } = require("../../Utils/const");
const userService = require("./userService");
var randomize = require("randomatic");
const { validate } = require("node-apple-receipt-verify");
const LanguageModel = require("../schema/language.schema");
const TermsAndConditionModel = require("../schema/terms&Condition.schema");
const PrivacyPolicyModel = require("../schema/privacyPolicy.schema");
const InvitedUserModel = require("../schema/invitedUser.schema");
const { ObjectId } = require("mongodb");
const UserModel = require("../schema/user.schema");

// Register any user to this app
/*
    write down the Params 
    No of Params
    email: body.email,
    password: body.password,
    first_name: body.first_name,
    last_name: body.last_name,
    dob: body.dob,
    country: body.country,
    language: body.language,
    is_t_and_c_checked: body.is_t_and_c_checked
    is_privacy_policy_checked: body.is_privacy_policy_checked
*/
let userRegistration = async (req, res) => {
  try {
    let { body } = req;
    const { error } = userSignupSchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      // check if email id is exists or not
      const whereQuery = {
        email: body.email,
      };
      const exisitingUser = await userService.findExistingUser(whereQuery);
      if (exisitingUser && exisitingUser.email) {
        res.status(409).json({
          statusCode: statusCode.alreadyExists,
          message: await translateTheText(
            "User already exists with same emailId"
          ),
        });
      } else {
        body.salt = randomize("Aa0", 128);
        const jsonData = {
          password: body.password,
          salt: body.salt,
        };
        body.password = await encrypt(jsonData, body.salt);
        return await userService
          .registerUser(body)
          .then(async (response) => {
            await userService.sendEmailsToRegisteredUser(response);
            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText(
                "An email has sent to given email. Please verify your email."
              ),
            });
          })
          .catch(async (error) => {
            printConsole("error ", error);
            res.status(500).json({
              statusCode: statusCode.internalError,
              message: await translateTheText("Internal server error"),
            });
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

// Send Mail Again for Verify registed user
let resendMail = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Email is required"),
      });
    }

    const exisitingUser = await userService.findExistingUser({
      email: req.body.email,
    });
    if (exisitingUser && Object.values(exisitingUser)?.length) {
      await userService.sendEmailsToRegisteredUser(exisitingUser);
      return res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText(
          "An email has sent to given email. Please verify your email."
        ),
      });
    }

    return res.status(404).json({
      statusCode: statusCode.notFound,
      message: await translateTheText("User not found with this email id"),
    });
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// Verify Registered user
/*
    write down the Params 
    No of Params
    email: body.email,
    verification_code: body.verification_code,
    device_token: body.device_token,
    device_type: body.device_type
*/
let verifyRegisteredUser = async (req, res) => {
  try {
    let { body } = req;
    // check if email id is exists or not
    const whereQuery = {
      email: body.email,
      reset_token: body.verification_code,
    };
    let exisitingUser = await userService.findExistingUser(whereQuery);
    if (!exisitingUser && !exisitingUser?.email) {
      process.env.USER_SELECTED_LANGUAGE = "de";
      res.status(404).json({
        statusCode: statusCode.notFound,
        message: await translateTheText("Invalid verification code"),
      });
    } else {
      if (body.is_forgot_verification == "false") {
        exisitingUser.is_email_verified = true;
        exisitingUser.is_verified = true;
        exisitingUser.status = "active";
      }
      console.log(exisitingUser);
      return await userService
        .welcomeToUserEmail(exisitingUser)
        .then(async (response) => {
          const userData = await userService.addDeviceToken(
            body,
            exisitingUser
          );
          const resp = {
            user_id: userData._id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            dob: userData.dob,
            country: userData.country,
            region: userData.region,
            device_type: body.device_type,
            device_token: body.device_token,
            created_dt: userData.created_dt,
            notify_me: userData.notify_me,
            language: userData.language,
            currency: userData.currency,
            is_email_verified: userData.is_email_verified,
            is_t_and_c_checked: userData.is_t_and_c_checked,
            is_privacy_policy_checked: userData.is_privacy_policy_checked,
          };
          process.env.USER_SELECTED_LANGUAGE = userData.language;
          const encrytedData = await encrypt(resp, userData._id);
          const token = await createJwtToken(encrytedData, userData._id);
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Successfully registered"),
            data: { user_token: token, resp },
          });
        })
        .catch(async (error) => {
          printConsole("error ", error);
          res.status(500).json({
            statusCode: statusCode.internalError,
            message: await translateTheText("Internal server error"),
          });
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

// Login API
/*
    write down the Params 
    No of Params
    email: body.email,
    password: body.password,
*/
let userLogin = async (req, res) => {
  try {
    let { body } = req;
    // form validations
    const { error } = userSignInSchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Login Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      if (body.password) {
        const whereQuery = {
          email: body.email,
          // status: "active",
          // is_verified: true,
          is_deleted: false,
        };
        let userData = await userService.findExistingUser(whereQuery);
        // if (userData && userData.status == "inactive") {
        //   return res.status(401).json({
        //     statusCode: statusCode.userIsNotActive,
        //     message: await translateTheText(
        //       "Please contact your admin to active your account."
        //     ),
        //   });
        // }
        // else if (userData && userData.is_email_verified == false) {
        //   return res.status(401).json({
        //     statusCode: statusCode.userIsNotVerified,
        //     message: await translateTheText(
        //       "Please verify email Id before login"
        //     ),
        //   });
        // }
        // else if (userData && userData.email) {
        if (userData && userData.email) {
          process.env.USER_SELECTED_LANGUAGE = userData.language;
          const jsonData = await decrypt(userData.password, userData.salt);
          if (body.password === jsonData.password) {
            await userService.updateLoginStatus(userData?._id, true);
            userData = await userService.addDeviceToken(body, userData);
            const response = {
              user_id: userData._id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email,
              user_type: userData.user_type,
              country: userData.country,
              region: userData.region,
              device_type: body.device_type,
              device_token: body.device_token,
              created_dt: userData.created_dt,
              notify_me: userData.notify_me,
              language: userData.language,
              is_verified: userData.is_verified,
              is_email_verified: userData.is_email_verified,
              currency: userData.currency,
              is_t_and_c_checked: userData.is_t_and_c_checked,
              is_privacy_policy_checked: userData.is_privacy_policy_checked,
              subcription: userData.subcription,
              profiles: userData.profiles,
              is_social_login: userData.is_social_login,
            };

            const encrytedData = await encrypt(response, userData._id);
            const token = await createJwtToken(encrytedData, userData._id);
            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText("Successfully logged in"),
              data: { user_token: token, response },
            });
          } else {
            process.env.USER_SELECTED_LANGUAGE = "de";
            // Password is not correct
            return res.status(403).json({
              statusCode: statusCode.dataForbidden,
              message: await translateTheText(
                "Incorrect email address or password"
              ),
            });
          }
        } else {
          process.env.USER_SELECTED_LANGUAGE = "de";
          return res.status(404).json({
            statusCode: statusCode.notFound,
            message: await translateTheText(
              "Incorrect email address or password"
            ),
          });
        }
      }
    }
  } catch (error) {
    process.env.USER_SELECTED_LANGUAGE = "de";
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// Social Login API
/*
    write down the Params 
    No of Params
    email: body.email,
    first_name: body.first_name,
    last_name: body.last_name,
    social_type: body.social_type,
    social_id: body.social_id,
    device_token: body.device_token,
    device_type: body.device_type
*/
let userSocialMediaLogin = async (req, res) => {
  try {
    let { body } = req;
    // form validations
    const { error } = userSocialSignInSchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Login Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      const whereQuery = {
        email: body.email,
        is_deleted: false,
      };
      const userData = await userService.findExistingUser(whereQuery);
      if (userData && userData.status == "inactive") {
        return res.status(401).json({
          statusCode: statusCode.userIsNotActive,
          message: await translateTheText(
            "Please contact your admin to active your account."
          ),
        });
      } else if (userData && userData.is_verified == false) {
        return res.status(401).json({
          statusCode: statusCode.userIsNotVerified,
          message: await translateTheText(
            "You are not verified. Please contact the admin to verfiy this user."
          ),
        });
      } else if (userData && userData.email) {
        const whereQuery = {
          email: body.email,
          social_type: body.social_type,
          social_id: body.social_id,
        };
        let userSocialLoginData = await userService.findExistingUser(
          whereQuery
        );
        if (userSocialLoginData) {
          userSocialLoginData = await userService.addDeviceToken(
            body,
            userData,
            true
          );
          const response = {
            user_id: userSocialLoginData._id,
            first_name: userSocialLoginData.first_name,
            last_name: userSocialLoginData.last_name,
            email: userSocialLoginData.email,
            user_type: userSocialLoginData.user_type,
            country: userSocialLoginData.country,
            region: userSocialLoginData.region,
            device_type: body.device_type,
            device_token: body.device_token,
            created_dt: userSocialLoginData.created_dt,
            notify_me: userSocialLoginData.notify_me,
            is_verified: userSocialLoginData.is_verified,
            is_email_verified: userSocialLoginData.is_email_verified,
            language: userSocialLoginData.language,
            currency: userSocialLoginData.currency,
            is_t_and_c_checked: userSocialLoginData.is_t_and_c_checked,
            is_privacy_policy_checked:
              userSocialLoginData.is_privacy_policy_checked,
            is_social_login: userSocialLoginData.is_social_login,
          };

          const encrytedData = await encrypt(response, userSocialLoginData._id);
          const token = await createJwtToken(
            encrytedData,
            userSocialLoginData._id
          );
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Successfully logged in"),
            data: { user_token: token, response },
          });
        } else {
          res.status(500).json({
            statusCode: statusCode.internalError,
            message: await translateTheText(
              "Social Id or Social type is mismatched"
            ),
          });
        }
      } else {
        body.status = "active";
        body.is_verified = true;
        return await userService
          .registerUser(body)
          .then(async (response) => {
            console.log("response line 392------>", response);
            let updatedResponse = await userService.addDeviceToken(
              body,
              response
            );
            console.log("updatedResponse line 394------>", updatedResponse);
            const resp = {
              user_id: response._id,
              first_name: response.first_name,
              last_name: response.last_name,
              email: response.email,
              user_type: response.user_type,
              device_type: body.device_type,
              device_token: body.device_token,
              created_dt: response.created_dt,
              notify_me: response.notify_me,
              is_verified: response.is_verified,
              is_email_verified: response.is_email_verified,
              language: response.language,
              is_email_verified: response.verification_code ? false : true,
              currency: response.currency,
              is_t_and_c_checked: response.is_t_and_c_checked,
              is_privacy_policy_checked: response.is_privacy_policy_checked,
              is_social_login: response.is_social_login,
            };

            // const encrytedData = await encrypt(response, response._id);
            // const token = await createJwtToken(encrytedData, response._id);
            const encrytedData = await encrypt(
              updatedResponse,
              updatedResponse._id
            );
            const token = await createJwtToken(
              encrytedData,
              updatedResponse._id
            );
            console.log("token line 415------>", token);
            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText("Successfully logged in"),
              data: {
                user_token: token,
                response: {
                  ...updatedResponse,
                  user_id: updatedResponse._id,
                  device_token: token,
                },
              },
            });
          })
          .catch(async (error) => {
            printConsole("error ", error);
            res.status(500).json({
              statusCode: statusCode.internalError,
              message: await translateTheText("Internal server error"),
            });
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

// get Refresh Token
/*
    write down the Params 
    No of Params
    email: body.email,
*/
// let refreshToken = async (req, res) => {
//     try {
//         let { body, headers } = req
//         const whereQuery = {
//             email: body.email,
//             status: "active",
//             is_verified: true,
//             is_deleted: false
//         }
//         const userData = await userService.findExistingUser(whereQuery);
//         const response = {
//             user_id: userData._id,
//             first_name: userData.first_name,
//             last_name: userData.last_name,
//             email: userData.email,
//             user_type: userData.user_type,
//             device_type: userData.device_type,
//             device_token: userData.device_token,
//             created_dt: userData.created_dt
//         }
//         const token = await refreshJwtToken(headers.authorization.split(" ")[1], response);
//         return res.status(200).json({ statusCode: statusCode.sucess, message: await translateTheText("Successfully logged in"), data: { user_token: token, response } });
//     } catch (error) {
//         printConsole(error);
//         res.status(500).json({
//             statusCode: statusCode.internalError,
//             message: await translateTheText("Internal server error")
//         })
//     }
// }

// Forgot password
/*
    write down the Params 
    No of Params
    email: body.email,
*/
let forgotPassowrd = async (req, res) => {
  try {
    let { body } = req;
    if (body.email) {
      const whereQuery = {
        email: body.email,
        status: "active",
        is_verified: true,
        is_deleted: false,
      };
      const userData = await userService.findExistingUser(whereQuery);
      if (userData && userData.email) {
        // await setGlobalLanguage(userData._id);
        await userService.forgotPassowrdEmail(userData);
        return res.status(201).json({
          statusCode: statusCode.successWithoutBody,
          message: await translateTheText("Mail sent to the given email id"),
        });
      } else {
        process.env.USER_SELECTED_LANGUAGE = "de";
        return res.status(404).json({
          statusCode: statusCode.notFound,
          message: await translateTheText(
            "No User found with the given email Id"
          ),
        });
      }
    } else {
      return res.status(404).json({
        statusCode: statusCode.notFound,
        message: await translateTheText("Please provide email Id"),
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

// Reset your password
/*
    write down the Params 
    No of Params
    token: body.reset_token,
    password: body.password,
*/
let resetPassword = async (req, res) => {
  try {
    let { body } = req;
    // form validations
    process.env.USER_SELECTED_LANGUAGE = "de";
    const { error } = resetPasswordSchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Reset Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      const whereQuery = {
        email: body.email,
        // reset_token: body.reset_token,
        // reset_token_expiry: { $gt: Date.now() }
      };
      const userData = await userService.findExistingUser(whereQuery);
      if (userData && userData.email) {
        // await setGlobalLanguage(userData._id);
        const salt = randomize("Aa0", 128);

        const jsonData = {
          password: body.password,
          salt: salt,
        };
        const password = await encrypt(jsonData, salt);
        await userService.resetPasswordWithNewSalt(
          password,
          salt,
          userData._id
        );
        return res.status(201).json({
          statusCode: statusCode.successWithoutBody,
          message: await translateTheText("Password reset successfully"),
        });
      } else {
        return res.status(404).json({
          statusCode: statusCode.notFound,
          message: await translateTheText(
            "User does not exists with given email Id"
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

// Update user Profile
/*
    write down the Params 
    No of Params
    email: body.email,
    password: body.password,
    first_name: body.first_name,
    last_name: body.last_name,
    DOB: body.DOB,
    language: body.language,
    device_type: body.device_type,
    device_token: body.device_token,
    _id: body._id
*/
let userUpdateAccount = async (req, res) => {
  try {
    let { body } = req;
    await setGlobalLanguage(body._id);
    const { error } = userUpdateAccountSchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      if (body.password) {
        body.salt = randomize("Aa0", 128);
        const jsonData = {
          password: body.password,
          salt: body.salt,
        };
        body.password = await encrypt(jsonData, body.salt);
      }
      return await userService
        .updateUserProfileData(body)
        .then(async (response) => {
          process.env.USER_SELECTED_LANGUAGE = response.language;
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Profile Updated Successfully"),
            data: {
              first_name: response.first_name,
              last_name: response.last_name,
              email: response.email,
              user_type: response.user_type,
              status: response.status,
              language: response.language,
              country: response.country,
              region: response.region,
              dob: response.dob,
              is_verified: response.is_verified,
              device_type: response.device_type,
              device_token: response.device_token,
              is_email_verified: response.is_email_verified,
              created_dt: response.created_dt,
              updated_dt: response.updated_dt,
              _id: response._id,
              is_t_and_c_checked: response.is_t_and_c_checked,
              is_privacy_policy_checked: response.is_privacy_policy_checked,
            },
          });
        })
        .catch(async (error) => {
          printConsole("error ", error);
          res.status(500).json({
            statusCode: statusCode.internalError,
            message: await translateTheText("Internal server error"),
          });
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

// Logout from your profile
/*
    write down the Params 
    No of Params
    _id: decoded
*/
let userLogout = async (req, res) => {
  try {
    let { decoded } = req;
    // console.log("decoded 682------>", decoded);
    // console.log("decoded?.device_token 683------>", decoded?.device_token);
    await setGlobalLanguage(decoded.user_id);
    await userService.logoutUser(decoded);
    await userService.updateLoginStatus(decoded.user_id, false);
    return res.status(200).json({
      statusCode: statusCode.successWithoutBody,
      message: await translateTheText("Successfully logged out"),
    });
  } catch (error) {
    // console.log("error------>", error);
    // printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// user Profile data by id
/*
    write down the Params 
    No of Params
    _id: body._id
*/
let getUserdataBasedOnId = async (req, res) => {
  try {
    let { params, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    return await userService
      .getListOfUserDataBasedOnUserId(params)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Profile Updated Successfully"),
          data: response,
        });
      })
      .catch(async (error) => {
        printConsole("error ", error);
        res.status(500).json({
          statusCode: statusCode.internalError,
          message: await translateTheText("Internal server error"),
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

// delete user profile
/*
    write down the Params 
    No of Params
    _id: params.id
*/
let deleteUser = async (req, res) => {
  try {
    let { params, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    return await userService
      .deleteTheUser(params)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Successfully deleted the user"),
        });
      })
      .catch(async (error) => {
        printConsole("error ", error);
        res.status(500).json({
          statusCode: statusCode.internalError,
          message: await translateTheText("Internal server error"),
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

// set user language
/*
    write down the Params 
    No of Params
    _id: decoded.user_id
    language: body.language
*/
let setLanguage = async (req, res) => {
  try {
    let { body, decoded } = req;
    const payload = {
      user_id: decoded.user_id,
      language: body.language,
    };
    process.env.USER_SELECTED_LANGUAGE = body.language;
    return await userService
      .setUserLanguage(payload)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Language changed successfully"),
          data: response,
        });
      })
      .catch(async (error) => {
        printConsole("error ", error);
        res.status(500).json({
          statusCode: statusCode.internalError,
          message: await translateTheText("Internal server error"),
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

// set user currency
/*
    write down the Params 
    No of Params
    _id: decoded.user_id
    currency: body.currency
*/
let setCurrency = async (req, res) => {
  try {
    let { body, decoded } = req;
    const payload = {
      user_id: decoded.user_id,
      currency: body.currency,
    };
    await setGlobalLanguage(payload.user_id);
    return await userService
      .setUserCurrency(payload)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Successfully set the currency"),
          data: response,
        });
      })
      .catch(async (error) => {
        printConsole("error ", error);
        res.status(500).json({
          statusCode: statusCode.internalError,
          message: await translateTheText("Internal server error"),
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

// set user notify me
/*
    write down the Params 
    No of Params
    _id: decoded.user_id
    nofity_me: body.nofity_me
*/
let setnotification = async (req, res) => {
  try {
    let { body, decoded } = req;
    const payload = {
      user_id: decoded.user_id,
      notify_me: body.notify_me,
    };
    await setGlobalLanguage(payload.user_id);
    return await userService
      .setUserNotification(payload)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Successfully set the country"),
          data: response,
        });
      })
      .catch(async (error) => {
        printConsole("error ", error);
        res.status(500).json({
          statusCode: statusCode.internalError,
          message: await translateTheText("Internal server error"),
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

// Invite co user
/*
    write down the Params 
    No of Params
    parent_id: decoded.user_id,
    email: body.email
*/
let inviteUser = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (decoded.email !== body.email) {
      const payload = {
        parent_id: decoded.user_id,
        email: body.email,
      };
      return await userService
        .sendInvitationToUser(payload, decoded)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("User invited successfully"),
          });
        })
        .catch(async (error) => {
          printConsole("error ", error);
          res.status(error.status || 500).json({
            statusCode: error.statusCode || statusCode.internalError,
            message: await translateTheText(error.message || error),
          });
        });
    } else {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText(
          "A user cannot invite themselves. Please provide a different email ID for the invitation"
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

// verify invited co user
/*
    write down the Params 
    No of Params
    verification_code: body.verification_code,
    email: body.email
*/
let verifyInviteUser = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    const payload = {
      verification_code: body.verification_code,
      email: body.email,
    };
    const checkIsThisUserIsInvitedUser = await userService.checkInvitedUser(
      payload
    );
    const userData = await userService.findExistingUser({ email: body.email });
    if (!userData?.email) {
      return res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "User Data with the given email Id does not exists"
        ),
      });
    } else if (!checkIsThisUserIsInvitedUser?.email) {
      return res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "Given email Id or verification code is incorrect"
        ),
      });
    } else if (checkIsThisUserIsInvitedUser?.email && userData?.email) {
      return await userService
        .verifyInvitatedUser(checkIsThisUserIsInvitedUser, body.name)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Successfully added as co-user"),
          });
        })
        .catch(async (error) => {
          printConsole("error ", error);
          res.status(500).json({
            statusCode: statusCode.internalError,
            message: await translateTheText(error),
          });
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

// get list of invited co user
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id
*/
let getListOfInvitedUser = async (req, res) => {
  try {
    let { decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    return await userService
      .listOfInvitedUser(decoded)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("List of invited user"),
          data: response,
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

// get list of invited co user
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id
    delete_user_id: body.delete_user_id
*/
let deleteCoUser = async (req, res) => {
  try {
    let { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);
    return await userService
      .findExistingUserAsHeIsParentOrNOtAndThenDelete(decoded.user_id, body)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("User deleted Successfully"),
          data: response,
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

// update terms and condition and privacy policy
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id
    is_t_and_c_checked: body.is_t_and_c_checked
    is_privacy_policy_checked: body.is_privacy_policy_checked
*/
let updateTandCPrivacyPolicy = async (req, res) => {
  try {
    let { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);
    return await userService
      .updateTandCandPrivacyPolicy(decoded.user_id, body)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Terms and Condition and Privacy policy updated Successfully"
          ),
          data: response,
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

// get list of terms and condition based on language selected
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id
*/
let getListOfTermsAndConditionBasedOnLanguageSelected = async (req, res) => {
  try {
    let { decoded, params } = req;
    if (decoded?.user_id) {
      await setGlobalLanguage(decoded.user_id);
    }
    return await userService
      .listOfTermsAndConditionBasedOnLanguageSelected(
        decoded,
        params && params?.languageCode
      )
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Terms and Condition and Privacy Policy"
          ),
          data: response,
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

let getTermsAndConditionByLanguage = async (req, res) => {
  try {
    let { decoded, params } = req;
    if (decoded?.user_id) {
      await setGlobalLanguage(decoded.user_id);
    }
    const language = await LanguageModel.find({
      language_short_form: params.languageCode,
    });
    const termsAndCondition = await TermsAndConditionModel.find({
      language_id: language[0]["_id"],
    });

    return res.status(200).json({
      statusCode: statusCode.sucess,
      message: await translateTheText("Successfully got Terms and Condition"),
      data: {
        termsAndCondition: termsAndCondition?.length
          ? termsAndCondition[0]
          : {},
      },
    });
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

let getPrivacyPlicyByLanguage = async (req, res) => {
  try {
    let { decoded, params } = req;
    if (decoded?.user_id) {
      await setGlobalLanguage(decoded.user_id);
    }
    const language = await LanguageModel.find({
      language_short_form: params.languageCode,
    });
    const privacyPolicy = await PrivacyPolicyModel.find({
      language_id: language[0]["_id"],
    });

    return res.status(200).json({
      statusCode: statusCode.sucess,
      message: await translateTheText("Successfully got Privacy Policy"),
      data: { privacyPolicy: privacyPolicy?.length ? privacyPolicy[0] : {} },
    });
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// update invited user name
/*
    write down the Params 
    No of Params
    user_id: decoded.user_id
    name,
    parent_id
*/
let updateInvitedUserName = async (req, res) => {
  try {
    let { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);
    return await userService
      .updateInvitedUserName(body)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully updated invited username"
          ),
          data: response,
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

// check-validation for In app purchase subscriptons for Android
let IAPValidationAndroid = async (req, res) => {
  try {
    let { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);
    console.log("IAPValidation body", body);
    return res.status(200).json({
      statusCode: statusCode.sucess,
      message: await translateTheText("Successfully validate"),
      // data: response,
    });
    return await userService
      .updateInvitedUserName(body)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully updated invited username"
          ),
          data: response,
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

// temp variable
// Sample in-memory database to store user subscriptions
const userSubscriptions = {};

// Helper functions
function calculateExpirationDate() {
  // Calculate the expiration date of the subscription (in a real scenario, you'd use your subscription logic)
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + 1); // Add one month for simplicity
  return expirationDate;
}

function validateReceipt(receipt) {
  // Validate the receipt with Apple's servers (in a real scenario, you'd make a request to Apple's servers)
  // For the sake of this example, assume all receipts are valid
  return true;
}

// check-validation for In app purchase subscriptons for IOS
let IAPValidationIOS = async (req, res) => {
  try {
    let { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);
    const userId = decoded.user_id;
    const subscription = userSubscriptions[userId];
    console.log("IAPValidationIOS body ----1268>", body);
    if (subscription) {
      // Check if the subscription is still valid
      const isValid = validateReceipt(subscription.receipt);

      const validationResult = await validate(receipt, {
        /* Apple's shared secret and other options */
        ...body,
      });
      console.log("validationResult-----1277>", validationResult);

      if (validationResult) {
        res.json({
          subscribed: true,
          expirationDate: subscription.expirationDate,
        });
      } else {
        // If the subscription is no longer valid, remove it from the database
        delete userSubscriptions[userId];
        res.json({ subscribed: false });
      }
    } else {
      res.json({ subscribed: false });
    }
    return res.status(200).json({
      statusCode: statusCode.sucess,
      message: await translateTheText("Successfully validate"),
      // data: response,
    });
    return await userService
      .updateInvitedUserName(body)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully updated invited username"
          ),
          data: response,
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
// Save In app purchase subscriptons for IOS
let savesubscription = async (req, res) => {
  try {
    let { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);
    console.log("savesubscription body----1328>", body);

    const userId = decoded.user_id;
    const receipt = body.receipt;

    // Validate the receipt with Apple's servers (in a real scenario, you'd make a request to Apple's servers)
    // const isValid = validateReceipt(receipt);
    const validationResult = await validate(receipt, {
      /* Apple's shared secret and other options */
      ...body,
    });
    console.log("validationResult-----1339>", validationResult);
    // Process validationResult and update subscription status

    if (validationResult) {
      // Save the subscription details
      userSubscriptions[userId] = {
        receipt,
        expirationDate: calculateExpirationDate(),
      };

      res.json({ success: true, message: "Subscription saved successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid purchase receipt" });
    }

    return res.status(200).json({
      statusCode: statusCode.sucess,
      message: await translateTheText("Successfully validate"),
      // data: response,
    });
    return await userService
      .updateInvitedUserName(body)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully updated invited username"
          ),
          data: response,
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

// create user Profile
/*
    write down the Params 
    No of Params

*/
let createUserProfile = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);

    if (!body || !body.profile_name) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Profile name should not be empty"),
      });
    } else {
      if (body.profile_name) {
        return await userService
          .addUserProfile(body.profile_name, decoded.user_id, decoded.email)
          .then(async (response) => {
            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText("Profile added Successfully"),
            });
          })
          .catch(async (error) => {
            printConsole("error ", error);
            console.log("error.status", error.status);
            res.status(error.status || 500).json({
              statusCode: error.statusCode || statusCode.internalError,
              message:
                error.message ||
                (await translateTheText("Internal server error")),
            });
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

// get user Profile
/*
    write down the Params 
    No of Params
*/
let getUserProfile = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);

    return await userService
      .getUserProfile(decoded.user_id)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("List of user Profiles"),
          data: response,
        });
      })
      .catch(async (error) => {
        res.status(error.status || 500).json({
          statusCode: error.statusCode || statusCode.internalError,
          message:
            error.message || (await translateTheText("Internal server error")),
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

// delete user relocation Profile
/*
    write down the Params 
    No of Params
*/
let deleteUserProfile = async (req, res) => {
  try {
    let { params, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    return await userService
      .deleteUserRelocationProfile(params.id, decoded.user_id)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully deleted the user relocation profile"
          ),
        });
      })
      .catch(async (error) => {
        printConsole("error ", error);
        res.status(500).json({
          statusCode: statusCode.internalError,
          message: await translateTheText("Internal server error"),
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

// invite a co user
/*
    write down the Params 
    No of Params
*/
let inviteaCouser = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (decoded.email !== body.email) {
      const payload = {
        parent_id: decoded.user_id,
        profile_id: body.profile_id,
        email: body.email,
      };
      return await userService
        .inviteaCouser(payload, decoded)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("User invited successfully"),
          });
        })
        .catch(async (error) => {
          printConsole("error ", error);
          res.status(error.status || 500).json({
            statusCode: error.statusCode || statusCode.internalError,
            message: await translateTheText(error.message || error),
          });
        });
    } else if (decoded.email == body.email) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText(
          "A user cannot invite themselves. Please provide a different email ID for the invitation"
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

  // try {
  //   const user = await UserModel.findOne({ email: data.email });
  //   // let invitedUser = await InvitedUserModel.findOne({ email: data.email })
  //   const invistedList = await InvitedUserModel.find({
  //     parent_id: data.parent_id,
  //   });

  //   let isUserAlredyInvited = false;

  //   if (invistedList && invistedList.length > 0) {
  //     invistedList.forEach((user) => {
  //       if (user.email == data.email) {
  //         isUserAlredyInvited = true;
  //       }
  //     });
  //   }

  //   // else if (
  //   //   invistedList.length >= config.parsed.MAX_LIMIT_TO_INVITE_USERS
  //   // ) {
  //   //   throw {
  //   //     status: 400,
  //   //     statusCode: statusCode.validation,
  //   //     message: await translateTheText(
  //   //       "You are not allowed to add more than 10 users"
  //   //     ),
  //   //   };
  //   // }

  //   if (!user) {
  //     throw "User does not exist with this email";
  //   } else if (
  //     decoded.subcription == "free tier" &&
  //     invistedList &&
  //     invistedList.length >=
  //       config.parsed.MAX_LIMIT_TO_INVITE_USERS_FOR_FREE_TIER
  //   ) {
  //     throw {
  //       status: 400,
  //       statusCode: statusCode.validation,
  //       message: await translateTheText(
  //         "To add more co-users, please upgrade your plan"
  //       ),
  //     };
  //   } else if (isUserAlredyInvited) {
  //     throw {
  //       status: 400,
  //       statusCode: statusCode.validation,
  //       message: await translateTheText("User is alredy invited"),
  //     };
  //   } else {
  //     const reset_token = Math.floor(100000 + Math.random() * 900000);
  //     await InvitedUserModel.create({
  //       email: data.email,
  //       parent_id: data.parent_id,
  //       verification_code: reset_token,
  //     });
  //     const invitedUser = await InvitedUserModel.findOne({
  //       email: data.email,
  //     });

  //     // email verfication after registration
  //     let context1 = fs.readFileSync(
  //       "./emailTemplates/inviedCoUser.html",
  //       "utf8"
  //     );
  //     context1 = context1
  //       .replace("USERNAME", decoded.first_name + " " + decoded.last_name)
  //       .replace("{{ verificationCode }}", reset_token);
  //     await sendMail(data.email, "Invited Co-user Email", context1);
  //     return true;
  //   }
  // } catch (error) {
  //   throw error;
  // }
};

// verify invited co user
/*
    write down the Params 
    No of Params
    verification_code: body.verification_code,
    email: body.email
*/
let verifyInvitation = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    const payload = {
      verification_code: body.verification_code,
      email: decoded.email,
    };
    const checkIsThisUserIsInvitedUser = await userService.checkInvitedUser(
      payload
    );
    const userData = await userService.findExistingUser({
      email: decoded.email,
    });
    if (!userData?.email) {
      return res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "User Data with the given email Id does not exists"
        ),
      });
    } else if (!checkIsThisUserIsInvitedUser?.email) {
      return res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "Given email Id or verification code is incorrect"
        ),
      });
    } else if (checkIsThisUserIsInvitedUser?.email && userData?.email) {
      return await userService
        .verifyInvitation(checkIsThisUserIsInvitedUser, body.name)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Successfully added as co-user"),
          });
        })
        .catch(async (error) => {
          printConsole("error ", error);
          res.status(500).json({
            statusCode: statusCode.internalError,
            message: await translateTheText(error),
          });
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

// get invited user Profile
/*
    write down the Params 
    No of Params
*/
let getInvitedUserProfile = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);

    if (!body || !body.profile_id) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Profile id should not be empty"),
      });
    } else {
      return await userService
        .getInvitedUserProfile(decoded.user_id, body.profile_id)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("List of user Profiles"),
            data: response,
          });
        })
        .catch(async (error) => {
          res.status(error.status || 500).json({
            statusCode: error.statusCode || statusCode.internalError,
            message:
              error.message ||
              (await translateTheText("Internal server error")),
          });
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

// rename user relocation profile
let renameUserRelocationProfile = async (req, res) => {
  try {
    let { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);
    return await userService
      .renameUserRelocationProfile(decoded.user_id, body)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Successfully updated profile name"),
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

// remove user relocation profile
let removeCouser = async (req, res) => {
  try {
    let { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);

    // send push notification
    if (body && body?.invite_id && body.invite_id.length > 0) {
      // send notification to co-user
      const invitedData = await Promise.all(
        body?.invite_id?.map(async (inviteItem) => {
          return await InvitedUserModel.findById({
            _id: inviteItem,
          });
        })
      );

      const usersData =
        invitedData &&
        invitedData.length > 0 &&
        (await Promise.all(
          invitedData?.map(async (data) => {
            if (data) {
              return await UserModel.findOne(
                {
                  email: data.email,
                },
                { "device.token": 1, email: 1, _id: 0 }
              );
            }
          })
        ));

      if (usersData && usersData.length > 0) {
        // user left as a co-user
        if (usersData[0]?.email === decoded?.email) {
          // send notification to main user
          let userData = await getUserbyProfileId(invitedData[0]?.profile_id);

          let payload = { title: "Smartmove", body: "", token: "" };
          payload.body = `${
            userData.first_name + userData.last_name
          } left as a co-user`;
          if (userData?.device && userData?.device.length > 0) {
            userData?.device.forEach((device) => {
              payload.token = device.token;
              console.log(payload);
              sendPushNotification(payload);
            });
          } else {
            console.log("User or device not found.");
          }
        } else {
          let tokens = usersData.map((userData) => {
            if (userData.device && userData.device.length > 0) {
              return userData.device.map((device) => device.token);
            }
          });

          if (tokens && tokens.length > 0) {
            tokens.flat();
            tokens.forEach((token) => {
              if (Array.isArray(token)) {
                token.forEach((item) => {
                  let payload = { title: "Smartmove", body: "", token: "" };
                  payload.body = `${
                    decoded.first_name + decoded.last_name
                  } removed you as a co-user`;
                  payload.token = item;
                  sendPushNotification(payload);
                });
              } else {
                let payload = { title: "Smartmove", body: "", token: "" };
                payload.body = `${
                  decoded.first_name + decoded.last_name
                } removed you as a co-user`;
                payload.token = token;
                sendPushNotification(payload);
              }
            });
          }
        }
      }
    }

    return await userService
      .removeCouser(body)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Successfully removed profile"),
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

// get notification count
/*
    write down the Params 
    No of Params
*/
let notificationCount = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);

    return await userService
      .getnotificationCount(decoded.user_id)
      .then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully got notification count"
          ),
          data: response,
        });
      })
      .catch(async (error) => {
        res.status(error.status || 500).json({
          statusCode: error.statusCode || statusCode.internalError,
          message:
            error.message || (await translateTheText("Internal server error")),
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
  userRegistration,
  userLogin,
  // refreshToken,
  forgotPassowrd,
  resetPassword,
  userUpdateAccount,
  userLogout,
  getUserdataBasedOnId,
  deleteUser,
  setLanguage,
  setCurrency,
  setnotification,
  inviteUser,
  verifyRegisteredUser,
  verifyInviteUser,
  getListOfInvitedUser,
  deleteCoUser,
  userSocialMediaLogin,
  updateTandCPrivacyPolicy,
  getListOfTermsAndConditionBasedOnLanguageSelected,
  updateInvitedUserName,
  IAPValidationAndroid,
  IAPValidationIOS,
  savesubscription,
  createUserProfile,
  getUserProfile,
  deleteUserProfile,
  inviteaCouser,
  verifyInvitation,
  getInvitedUserProfile,
  renameUserRelocationProfile,
  removeCouser,
  getTermsAndConditionByLanguage,
  getPrivacyPlicyByLanguage,
  resendMail,
  notificationCount,
};
