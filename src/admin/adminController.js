/**
 * admin/adminController.js
 *
 * Admin APIs.
 */
const { ObjectId } = require("mongodb");
const {
  categorySchema,
  updateCategorySchema,
} = require("../../Utils/Validations/categorySchema");
const {
  resetPasswordSchema,
  userSignupSchema,
  adminResetPasswordSchema,
  SubAdminuserSignupSchema,
} = require("../../Utils/Validations/userValidationSchema");
const {
  encrypt,
  createJwtToken,
  printConsole,
  sendMail,
  getListOfCategory,
  decrypt,
  refreshJwtToken,
  translateTheText,
  setGlobalLanguage,
} = require("../../Utils/commonFile");
const { statusCode } = require("../../Utils/const");
const SubscriptionModel = require("../schema/subscription.schema");
const userService = require("../users/userService");
const adminService = require("./adminService");
var randomize = require("randomatic");
const fs = require("fs");
const AccessModel = require("../schema/accesses.schema");
const UserModel = require("../schema/user.schema");

// Login API
/*
    write down the Params
    No of Params
    email: body.email,
    password: body.password,
*/

let adminLogin = async (req, res) => {
  try {
    let { body } = req;
    if (!body.email || !body.password) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Login Form validations are required"),
      });
    } else {
      const whereQuery = {
        email: body.email,
        user_type: { $in: ["admin", "sub-admin", "user"] },
        status: "active",
        // is_verified: true,
        is_deleted: false,
      };
      const adminData = await userService.findExistingUser(whereQuery);
      // if (adminData && adminData.email) {
      if (adminData && Object.values(adminData)?.length) {

        if (adminData?.is_verified === true) {
          await setGlobalLanguage(adminData._id);
          const jsonData = await decrypt(adminData.password, adminData.salt);
          if (body.password === jsonData.password) {
            let allowed_features;

            if (adminData.user_type != "admin") {
              allowed_features = await AccessModel.findOne({
                sub_admin_id: new ObjectId(adminData._id),
              })
                .select("accesses")
                .exec();
            }

            const response = {
              user_id: adminData._id,
              first_name: adminData.first_name,
              last_name: adminData.last_name,
              email: adminData.email,
              user_type: adminData.user_type,
              device_type: adminData.device_type,
              language: adminData.language,
              device_token: adminData.device_token,
              created_dt: adminData.created_dt,
              is_verified: adminData.is_verified,
              accesses:
                adminData.user_type != "admin"
                  ? allowed_features && allowed_features?.accesses
                  : "all",
            };
            const encrytedData = await encrypt(response, adminData._id);
            const token = await createJwtToken(encrytedData, adminData._id);
            return res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText("Successfully logged in"),
              data: { user_token: token, response },
            });
          } else {
            // if invalid credentials then send email for the same
            await adminService.invalidLoginCredentialsNotification(adminData);
            // Password is not correct
            return res.status(403).json({
              statusCode: statusCode.dataForbidden,
              message: await translateTheText(
                "Enter password does not matched. Please try again."
              ),
            });
          }
        } else {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("Email is not verified")
          });
        }
      } else {
        return res.status(404).json({
          statusCode: statusCode.notFound,
          message: await translateTheText(
            "No User found with the given email Id"
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

// let adminLogin = async (req, res) => {
//   try {
//     let { body } = req;
//     if (!body.email || !body.password) {
//       return res.status(400).json({
//         statusCode: statusCode.validation,
//         message: await translateTheText("Login Form validations are required"),
//       });
//     } else {
//       const whereQuery = {
//         email: body.email,
//         user_type: { $in: ["admin", "sub-admin", "user"] },
//         status: "active",
//         is_verified: true,
//         is_deleted: false,
//       };
//       const adminData = await userService.findExistingUser(whereQuery);
//       if (adminData && adminData.email) {
//         await setGlobalLanguage(adminData._id);
//         const jsonData = await decrypt(adminData.password, adminData.salt);
//         if (body.password === jsonData.password) {
//           let allowed_features;

//           if (adminData.user_type != "admin") {
//             allowed_features = await AccessModel.findOne({
//               sub_admin_id: new ObjectId(adminData._id),
//             })
//               .select("accesses")
//               .exec();
//           }

//           const response = {
//             user_id: adminData._id,
//             first_name: adminData.first_name,
//             last_name: adminData.last_name,
//             email: adminData.email,
//             user_type: adminData.user_type,
//             device_type: adminData.device_type,
//             language: adminData.language,
//             device_token: adminData.device_token,
//             created_dt: adminData.created_dt,
//             is_verified: adminData.is_verified,
//             accesses:
//               adminData.user_type != "admin"
//                 ? allowed_features && allowed_features?.accesses
//                 : "all",
//           };
//           const encrytedData = await encrypt(response, adminData._id);
//           const token = await createJwtToken(encrytedData, adminData._id);
//           return res.status(200).json({
//             statusCode: statusCode.sucess,
//             message: await translateTheText("Successfully logged in"),
//             data: { user_token: token, response },
//           });
//         } else {
//           // if invalid credentials then send email for the same
//           await adminService.invalidLoginCredentialsNotification(adminData);
//           // Password is not correct
//           return res.status(403).json({
//             statusCode: statusCode.dataForbidden,
//             message: await translateTheText(
//               "Enter password does not matched. Please try again."
//             ),
//           });
//         }
//       } else {
//         return res.status(404).json({
//           statusCode: statusCode.notFound,
//           message: await translateTheText(
//             "No User found with the given email Id"
//           ),
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

// get Refresh Token
/*
    write down the Params
    No of Params
    email: body.email,
*/
let refreshToken = async (req, res) => {
  try {
    let { body, headers } = req;
    const whereQuery = {
      email: body.email,
      user_type: "admin",
      status: "active",
      is_verified: true,
      is_deleted: false,
    };
    const userData = await userService.findExistingUser(whereQuery);
    const response = {
      user_id: userData._id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      device_type: userData.device_type,
      language: userData.language,
      device_token: userData.device_token,
      created_dt: userData.created_dt,
    };
    process.env.USER_SELECTED_LANGUAGE = userData.language;
    const token = await refreshJwtToken(
      headers.authorization.split(" ")[1],
      response
    );
    return res.status(200).json({
      statusCode: statusCode.sucess,
      message: await translateTheText("Successfully logged in"),
      data: { user_token: token, response },
    });
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

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
        user_type: "admin",
        is_verified: true,
        is_deleted: false,
      };
      const userData = await userService.findExistingUser(whereQuery);
      if (userData && userData.email) {
        process.env.USER_SELECTED_LANGUAGE = userData.language;
        await adminService.forgotPassowrdEmail(userData);
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Mail sent to the given email id"),
        });
      } else {
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
    const { error } = adminResetPasswordSchema.validate(body, {
      abortEarly: false,
    });
    process.env.USER_SELECTED_LANGUAGE = "en";
    if (error) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Login Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      const whereQuery = {
        reset_token: body.reset_token,
        reset_token_expiry: { $gt: Date.now() },
      };
      const userData = await userService.findExistingUser(whereQuery);
      if (userData && userData.email) {
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
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully your password is reset."
          ),
        });
      } else {
        return res.status(404).json({
          statusCode: statusCode.notFound,
          message: await translateTheText(
            "Reset token is expired. Please try again."
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

// Verfy user profile
/*
    write down the Params
    No of Params
    user_id: body.user_id
*/
let verifyProfile = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    if (req.decoded.user_type == "admin") {
      if (req.body.user_id) {
        let { body } = req;
        await adminService.verifyUserProfile(body);
        res.status(200).json({
          statusCode: statusCode.successWithoutBody,
          message: await translateTheText("Successfully verified user"),
        });
      } else {
        res.status(401).json({
          statusCode: statusCode.notFound,
          message: await translateTheText(
            "Please provide user id for which you are trying to verified."
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

let verifySubAdminProfile = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    if (req.decoded.user_type == "admin") {
      if (req.body.user_id) {
        let { body } = req;
        await adminService.verifySubUserProfile(body);
        res.status(200).json({
          statusCode: statusCode.successWithoutBody,
          message: await translateTheText("Successfully verified user"),
        });
      } else {
        res.status(401).json({
          statusCode: statusCode.notFound,
          message: await translateTheText(
            "Please provide user id for which you are trying to verified."
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

let verifyAdminProfile = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    if (req.decoded.user_type == "admin") {
      if (req.body.user_id) {
        let { body } = req;
        await adminService.verifyAdminUserProfile(body);
        res.status(200).json({
          statusCode: statusCode.successWithoutBody,
          message: await translateTheText("Successfully verified user"),
        });
      } else {
        res.status(401).json({
          statusCode: statusCode.notFound,
          message: await translateTheText(
            "Please provide user id for which you are trying to verified."
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

// user data based on given id
/*
    write down the Params
    No of Params
    _id: params.user_id
*/
// let getDataByUserId = async (req, res) => {
//     try {
//         await setGlobalLanguage(req.decoded.user_id)
//         if (req.decoded.user_type == "admin") {
//             let { params } = req;
//             const whereQuery = {
//                 _id: params.id,
//                 status: "active"
//             }
//             const userList = await adminService.getListofUserListById(whereQuery)
//             if (userList) {
//                 res.status(201).json({
//                     statusCode: statusCode.sucess,
//                     message: await translateTheText("Successfully listed the details the user"),
//                     data: userList
//                 })
//             } else {
//                 res.status(404).json({
//                     statusCode: statusCode.notFound,
//                     message: await translateTheText("Given user not found")
//                 })
//             }
//         } else {
//             res.status(401).json({
//                 statusCode: statusCode.unauthorised,
//                 message: await translateTheText("You are not authorized to access this API URL")
//             })
//         }
//     } catch (error) {
//         console.log(error,"error")
//         printConsole(error);
//         res.status(500).json({
//             statusCode: statusCode.internalError,
//             message: await translateTheText("Internal server error")
//         })
//     }
// }

// const getDataByUserId = async (req, res) => {
//     try {
//         await setGlobalLanguage(req.decoded.user_id);

//         if (req.decoded.user_type === "admin") {
//             const { params } = req;
//             const whereQuery = {
//                 _id: params.id,
//                 status: "active",
//             };
//             console.log(whereQuery,"whereQuerytest")
//             const userList = await adminService.getListofUserListById(whereQuery);

//             if (userList && userList.data.length > 0) {
//                 res.status(201).json({
//                     statusCode: statusCode.success,
//                     message: await translateTheText("Successfully listed the details of the user"),
//                     data: userList,
//                 });
//             }
//         } else {
//             res.status(401).json({
//                 statusCode: statusCode.unauthorized,
//                 message: await translateTheText("You are not authorized to access this API URL"),
//             });
//         }
//     } catch (error) {
//         console.log("Error:", error);
//         printConsole(error);
//         res.status(500).json({
//             statusCode: statusCode.internalError,
//             message: await translateTheText("Internal server error"),
//         });
//     }
// };

const getDataByUserId = async (req, res) => {
  try {
    const { decoded, query } = req;
    await setGlobalLanguage(decoded.user_id);
    if (req.decoded.user_type === "admin") {
      const { params } = req;
      const whereQuery = {
        _id: params.id,
        status: "active",
      };
      const response = await adminService.getListOfUserById(whereQuery);
      return res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText("Successfully got the list of users"),
        data: response,
      });
    } else {
      return res.status(401).json({
        statusCode: statusCode.unauthorized,
        message: await translateTheText(
          "You are not authorized to access this API URL"
        ),
      });
    }
  } catch (error) {
    printConsole(error);
    return res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

let updateUserDetails = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
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
      if (decoded.user_type == "admin") {
        await adminService
          .updateUserList(body)
          .then(async (response) => {
            res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText("Successfully updated the user"),
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
      } else {
        res.status(401).json({
          statusCode: statusCode.unauthorised,
          message: await translateTheText(
            "You are not authorized to access this API URL"
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

let deleteAdminUser = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    if (req.decoded.user_type == "admin") {
      const { params } = req;
      const whereQuery = {
        _id: params.id,
      };
      await adminService.deleteUser(whereQuery);
      res.status(201).json({
        statusCode: statusCode.successWithoutBody,
        message: await translateTheText("Successfully delete the user"),
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

// Remove the user based on given id
/*
    write down the Params
    No of Params
    _id: params.user_id
*/
let removeTheUser = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    if (req.decoded.user_type == "admin") {
      let { params } = req;
      const whereQuery = {
        _id: params.id,
      };
      await adminService.removeTheParticularUser(whereQuery);
      res.status(201).json({
        statusCode: statusCode.successWithoutBody,
        message: await translateTheText("Successfully removed the user"),
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

// add user
/*
    write down the params
    No of params
    email: body.email,
    password: body.password,
    first_name: body.first_name,
    last_name: body.last_name,
    birth_date: body.birth_date,
    country: body.country,
    language: body.language
*/
let addTheUser = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
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

let sendVerificationMailAgain = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);

    // Check if the user already exists
    const existingUser = await adminService.findUserByEmail(body.email);
    console.log(body.email, "body.email");
    if (existingUser) {
      return res.status(409).json({
        statusCode: statusCode.conflict,
        message: await translateTheText("User already exists"),
      });
    }
    await userService.sendEmailsToRegisteredUser(body.email);
    return res.status(200).json({
      statusCode: statusCode.success,
      message: await translateTheText(
        "An email has been sent to the given email. Please verify your email."
      ),
    });
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

let blockTheUser = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    if (req.decoded.user_type == "admin") {
      let { params } = req;
      const whereQuery = {
        _id: params.id,
      };
      await adminService.blockedTheParticularUser(whereQuery);
      res.status(201).json({
        statusCode: statusCode.successWithoutBody,
        message: await translateTheText("Successfully blocked the user"),
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


let unblockTheUser = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    if (req.decoded.user_type == "admin") {
      let {params} = req;
      const whereQuery = {
        _id: params.id,
      };
      await adminService.unblockedTheParticularUser(whereQuery);
      res.status(201).json({
        statusCode: statusCode.successWithoutBody,
        message: await translateTheText("Successfully unblocked the user"),
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


// admin logout
/*
    write down the params
    No of params
*/
let logout = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    return res.status(200).json({
      statusCode: statusCode.sucess,
      message: await translateTheText("Successfully logged out"),
    });
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// add category
/*
    write down the params
    No of params
    category_name: body.category_name
*/
let addCategories = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    const { error } = categorySchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      if (decoded.user_type == "admin") {
        await adminService.addCategories(body);
        res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText("Successfully added the category"),
        });
      } else {
        res.status(401).json({
          statusCode: statusCode.unauthorised,
          message: await translateTheText(
            "You are not authorized to access this API URL"
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

// update category
/*
    write down the params
    No of params
    category_name: body.category_name
    category_id: body.category_id
*/
let updateCategory = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    const { error } = updateCategorySchema.validate(body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        data: error.details.map((rec) => rec.context),
      });
    } else {
      if (decoded.user_type == "admin") {
        await adminService
          .updateCategory(body)
          .then(async (response) => {
            res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText(
                "Successfully updated the category"
              ),
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
      } else {
        res.status(401).json({
          statusCode: statusCode.unauthorised,
          message: await translateTheText(
            "You are not authorized to access this API URL"
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

// delete category
/*
    write down the params
    No of params
    category_name: body.category_name
    category_id: body.category_id
*/
let deleteCategory = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (!body.category_id) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Category Id should not be empty"),
      });
    } else {
      if (decoded.user_type == "admin") {
        await adminService
          .deleteCategory(body)
          .then(async (response) => {
            res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText(
                "Successfully deleted the category"
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
      } else {
        res.status(401).json({
          statusCode: statusCode.unauthorised,
          message: await translateTheText(
            "You are not authorized to access this API URL"
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

// list of category
/*
    write down the params
    No of params
    category_name: body.category_name
    category_id: body.category_id
*/
let getCategoryList = async (req, res) => {
  try {
    let { decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (decoded.user_type == "admin") {
      await getListOfCategory()
        .then(async (response) => {
          res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully got the category list"
            ),
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

// get user list API
/*
    write down the Params
    No of Params
*/
// let getUserListForAdminLogin = async (req, res) => {
//     try {
//         await setGlobalLanguage(req.decoded.user_id);
//         if (req.decoded.user_type === "admin") {
//             const whereQuery = {
//                 user_type: "user"
//             };
//             const page = req.query.page || 1; // Default to page 1 if not provided
//             const limit = 10; // Set your desired limit here
//             const userList = await adminService.getListofUser(whereQuery, { current_page: page, limit });
//             res.status(200).json({
//                 statusCode: statusCode.success,
//                 message: await translateTheText("Successfully got the list of users"),
//                 data: userList.data,
//                 metadata: userList.metadata
//             });
//         } else {
//             res.status(401).json({
//                 statusCode: statusCode.unauthorized,
//                 message: await translateTheText("You are not authorized to access this API URL")
//             });
//         }
//     } catch (error) {
//         printConsole(error);
//         res.status(500).json({
//             statusCode: statusCode.internalError,
//             message: await translateTheText("Internal server error")
//         });
//     }
// };

// const getUserListForAdminLogin = async (req, res) => {
//     try {
//         const { decoded, query } = req;
//         await setGlobalLanguage(decoded.user_id);

//         if (req.decoded.user_type === "admin") {
//             const data = {
//                 user_id: decoded.user_id
//             };
//             const response = await adminService.getListofUser(query);
//             return res.status(200).json({
//                 statusCode: statusCode.success,
//                 message: await translateTheText("Successfully got the list of users"),
//                 data: response
//             });
//         } else {
//             return res.status(401).json({
//                 statusCode: statusCode.unauthorized,
//                 message: await translateTheText("You are not authorized to access this API URL")
//             });
//         }
//     } catch (error) {
//         printConsole(error);
//         return res.status(500).json({
//             statusCode: statusCode.internalError,
//             message: await translateTheText("Internal server error")
//         });
//     }
// };

const getUserListForAdminLogin = async (req, res) => {
  try {
    const { decoded, query } = req;
    await setGlobalLanguage(decoded.user_id);

    if (req.decoded.user_type === "admin") {
      const whereQuery = {
        user_type: "user",
      };
      const response = await adminService.getListofUser(query);
      console.log("response", response);
      return res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText("Successfully got the list of users"),
        data: response,
      });
    } else {
      return res.status(401).json({
        statusCode: statusCode.unauthorized,
        message: await translateTheText(
          "You are not authorized to access this API URL"
        ),
      });
    }
  } catch (error) {
    printConsole(error);
    return res.status(500).json({
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
*/
const addFurnitureCategory = async (req, res) => {
  try {
    const { body, file, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (!body.furniture_category_name) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Furniture Category image should not be empty",
        key: "furniture_category_image",
      });
    } else if (!file) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Furniture Category image should not be empty",
        key: "furniture_category_image",
      });
    } else if (body.furniture_category_name && file.filename) {
      const data = {
        furniture_category_name: body.furniture_category_name,
        furniture_category_image: "public/categoryimage/" + file.filename,
        furniture_image_mime_type: file.mimetype,
      };
      await adminService.addFurnitureOfTheUser(data).then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully added the furniture category"
          ),
        });
      });
    }
  } catch (error) {
    printConsole("error while uploading", error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// update category
/*
    write down the params
    No of params
    furniture_category_id: body.furniture_category_id
    furniture_category_name: body.furniture_category_name
    furniture_category_image: body.furniture_category_image
*/
let updateFurnitureCategory = async (req, res) => {
  try {
    let { body, file, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (!body.furniture_category_name) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Furniture Category image should not be empty",
        key: "furniture_category_image",
      });
    } else if (!file) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Furniture Category image should not be empty",
        key: "furniture_category_image",
      });
    } else if (!body.furniture_category_id) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Furniture Category id should not be empty",
        key: "furniture_category_id",
      });
    } else if (
      body.furniture_category_name &&
      file.filename &&
      body.furniture_category_id
    ) {
      const data = {
        furniture_category_name: body.furniture_category_name,
        furniture_category_image: "public/categoryimage/" + file.filename,
        furniture_image_mime_type: file.mimetype,
        furniture_category_id: body.furniture_category_id,
      };
      await adminService
        .updateFurnitureOfTheUser(data)
        .then(async (response) => {
          res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully updated the furniture category"
            ),
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
    }
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// delete category
/*
    write down the params
    No of params
    furniture_category_id: body.furniture_category_id
*/
let deleteFurnitureCategory = async (req, res) => {
  try {
    let { params, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (!params.furniture_category_id) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText(
          "Furniture Category Id should not be empty"
        ),
      });
    } else {
      if (decoded.user_type == "admin") {
        await adminService
          .deleteFurnitureCategory(params)
          .then(async (response) => {
            res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText(
                "Successfully deleted the furniture category"
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
      } else {
        res.status(401).json({
          statusCode: statusCode.unauthorised,
          message: await translateTheText(
            "You are not authorized to access this API URL"
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

// get furniture category list API
/*
    write down the Params
    No of Params
*/
let getFurnitureCategoryListForAdminLogin = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    if (req.decoded.user_type == "admin") {
      const catList = await adminService.getFurnitureCategory();
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

// add shopping category
/*
    write down the Params
    No of Params
    shopping_category_name: body.shopping_category_name
    shopping_category_image: body.shopping_category_image
*/
const addShoppingCategory = async (req, res) => {
  try {
    const { body, file, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (!body.shopping_category_name) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Shopping Category image should not be empty",
        key: "Shopping_category_image",
      });
    } else if (!file) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Shopping Category image should not be empty",
        key: "Shopping_category_image",
      });
    } else if (body.shopping_category_name && file.filename) {
      const data = {
        shopping_category_name: body.shopping_category_name,
        shopping_category_image: "public/categoryimage/" + file.filename,
        shopping_image_mime_type: file.mimetype,
      };
      await adminService.addShoppingOfTheUser(data).then(async (response) => {
        return res.status(200).json({
          statusCode: statusCode.sucess,
          message: await translateTheText(
            "Successfully added the Shopping category"
          ),
        });
      });
    }
  } catch (error) {
    printConsole("error while uploading", error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// update category
/*
    write down the params
    No of params
    shopping_category_id: body.shopping_category_id
    shopping_category_name: body.shopping_category_name
    shopping_category_image: body.shopping_category_image
*/
let updateShoppingCategory = async (req, res) => {
  try {
    let { body, file, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (!body.shopping_category_name) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Shopping Category image should not be empty",
        key: "Shopping_category_image",
      });
    } else if (!file) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Shopping Category image should not be empty",
        key: "Shopping_category_image",
      });
    } else if (!body.shopping_category_id) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "Shopping Category id should not be empty",
        key: "Shopping_category_id",
      });
    } else if (
      body.shopping_category_name &&
      file.filename &&
      body.shopping_category_id
    ) {
      const data = {
        shopping_category_name: body.shopping_category_name,
        shopping_category_image: "public/categoryimage/" + file.filename,
        shopping_image_mime_type: file.mimetype,
        shopping_category_id: body.shopping_category_id,
      };
      await adminService
        .updateShoppingOfTheUser(data)
        .then(async (response) => {
          res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully updated the Shopping category"
            ),
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
    }
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// delete category
/*
    write down the params
    No of params
    shopping_category_id: body.shopping_category_id
*/

let userAdminUpdatedList = async (req, res) => {
  try {
    let { body } = req;
    await setGlobalLanguage(body._id);
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
      if (body.password) {
        body.salt = randomize("Aa0", 128);
        const jsonData = {
          password: body.password,
          salt: body.salt,
        };
        body.password = await encrypt(jsonData, body.salt);
      }
      return await adminService
        .updateAdminUserData(body)
        .then(async (response) => {
          process.env.USER_SELECTED_LANGUAGE = response.language;
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("User Updated Successfully"),
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
              created_dt: response.created_dt,
              updated_dt: response.updated_dt,
              _id: response._id,
              // is_t_and_c_checked: userData.is_t_and_c_checked,
              // is_privacy_policy_checked: userData.is_privacy_policy_checked
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

let deleteShoppingCategory = async (req, res) => {
  try {
    let { params, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    if (!params.shopping_category_id) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText(
          "Shopping Category Id should not be empty"
        ),
      });
    } else {
      if (decoded.user_type == "admin") {
        await adminService
          .deleteShoppingCategory(params)
          .then(async (response) => {
            res.status(200).json({
              statusCode: statusCode.sucess,
              message: await translateTheText(
                "Successfully deleted the Shopping category"
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
      } else {
        res.status(401).json({
          statusCode: statusCode.unauthorised,
          message: await translateTheText(
            "You are not authorized to access this API URL"
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

// get Shopping category list API
/*
    write down the Params
    No of Params
*/
let getShoppingCategoryList = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);
    if (req.decoded.user_type == "admin") {
      const catList = await adminService.getShoppingCategory(
        req.decoded.user_id
      );

      res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText(
          "Successfully got the list of shopping category"
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

const getAnalytics = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);

    if (req.decoded.user_type == "admin") {
      const { query } = req;
      const analyticsData = await adminService.getAnalytics(query);
      res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText("Successfully got the analytics data"),
        data: analyticsData,
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
// upload terms and condition and privacy policy files for all langagues
/*
    write down the Params
    No of Params
    langague_id: body.language_id
    terms_and_condition: body.file
    privacy_policy: body.file,
    terms_id: body.terms_id
*/
let uploadTermsandConditionandPrivacyPolicy = async (req, res) => {
  try {
    const { body } = req;
    if (!body.language_id) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "language Id should not be empty",
        key: "language_id",
      });
    } else if (body.terms_and_condition && body.privacy_policy) {
      const data = {
        language_id: body.language_id,
        terms_and_condition: body.terms_and_condition,
        privacy_policy: body.privacy_policy,
        terms_id: body?.terms_id,
      };
      await adminService
        .addTermsConditionAndPrivacyPolicy(data)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully added the Shopping category"
            ),
          });
        });
    }
  } catch (error) {
    printConsole("error while uploading", error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};


let uploadTermsandCondition = async (req, res) => {
  try {
    const { body } = req;
    console.log({ body });
    if (!body.language_id) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "language Id should not be empty",
        key: "language_id",
      });
    } else if (body.terms_and_condition) {
      const data = {
        language_id: body.language_id,
        terms_and_condition: body.terms_and_condition,
        terms_id: body?.terms_id,
      };
      await adminService
        .addTermsAndCondition(data)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully added the Terms and Condition"
            ),
          });
        });
    }
  } catch (error) {
    printConsole("error while uploading", error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

let uploadPrivacyPolicy = async (req, res) => {
  try {
    const { body } = req;
    if (!body.language_id) {
      res.status(500).json({
        statusCode: statusCode.validation,
        message: await translateTheText("Form validations are required"),
        label: "language Id should not be empty",
        key: "language_id",
      });
    } else if (body.privacy_policy) {
      const data = {
        language_id: body.language_id,
        privacy_policy: body.privacy_policy,
        policy_id: body?.policy_id,
      };
      await adminService
        .addPrivacyPolicy(data)
        .then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully added the Privacy Policy"
            ),
          });
        });
    }
  } catch (error) {
    printConsole("error while uploading", error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

const getSubscriptions = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);

    // if (req.decoded.user_type == "admin") {
    // const language = req?.body?.language_code || req?.decoded?.language;
    const language =
      (req?.params && req?.params?.language_code) || req?.decoded?.language;
    const subscriptions = await adminService.getSubscriptions(language);
    res.status(200).json({
      statusCode: statusCode.sucess,
      message: await translateTheText(
        "Successfully got the subscriptions data"
      ),
      data: subscriptions,
    });

    // } else {
    //   res.status(401).json({
    //     statusCode: statusCode.unauthorised,
    //     message: await translateTheText(
    //       "You are not authorized to access this API URL"
    //     ),
    //   });
    // }
  } catch (error) {
    printConsole(error);
    res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};
const addSubscription = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);

    if (req.decoded.user_type == "admin") {
      const { body, file, files, decoded } = req;
      await setGlobalLanguage(decoded.user_id);
      // if (!body?.plan_image) {
      //   res.status(500).json({
      //     statusCode: statusCode.validation,
      //     message: await translateTheText("Plan image should not be empty"),
      //   });
      // } else

      let plan_icon = "";
      let plan_icon_mime_type = "";
      let plan_images = [];
      if (files && files?.length > 0) {
        files.forEach(async (item) => {
          if (item.fieldname == "plan_icon") {
            plan_icon = "public/categoryimage/" + item.filename;
            plan_icon_mime_type = item.mimetype;
          }
          if (item.fieldname == "plan_images") {
            plan_images.push({
              plan_image: "public/categoryimage/" + item.filename,
              plan_image_mime_types: item.mimetype,
            });
          }
        });
      }

      // if (!files.fieldname =="plan_icon") {
      //   res.status(500).json({
      //     statusCode: statusCode.validation,
      //     message: await translateTheText("Plan icon should not be empty"),
      //   });
      // }
      if (body.plan_title) {
        const data = {
          plan_title: body.plan_title,
          description: body.description,
          price: body.price,
          language_code: body.language_code,
          currency: body.currency,
          button_text: body.button_text,
          plan_icon,
          plan_icon_mime_type,
          plan_images,
        };
        await adminService.addSubscription(data).then(async (response) => {
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText(
              "Successfully added subscription plan"
            ),
          });
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

const updateSubscription = async (req, res) => {
  try {
    await setGlobalLanguage(req.decoded.user_id);

    if (req.decoded.user_type === "admin") {
      const { body, files, decoded } = req;

      if (!body.plan_id) {
        res.status(400).json({
          statusCode: statusCode.validation,
          message: await translateTheText("Plan ID should not be empty"),
        });
        return;
      }

      const existingSubscription = await SubscriptionModel.findById(
        body.plan_id
      );

      if (!existingSubscription) {
        res.status(404).json({
          statusCode: statusCode.notFound,
          message: await translateTheText("Subscription plan not found"),
        });
        return;
      }

      const updatedData = {
        plan_title: body.plan_title || existingSubscription.plan_title,
        description: body.description || existingSubscription.description,
        price: body.price || existingSubscription.price,
        language_code: body.language_code || existingSubscription.language_code,
        currency: body.currency || existingSubscription.currency,
        button_text: body.button_text || existingSubscription.button_text,
      };

      if (files && files.length > 0) {
        const filePath = await SubscriptionModel.findOne({
          _id: body.plan_id,
        });

        let plan_images = [];
        if (files && files?.length > 0) {
          files.forEach(async (item) => {
            if (item.fieldname == "plan_icon") {
              // Use fs.unlink to delete the file
              fs.unlink(filePath.plan_icon, (err) => {
                if (err) {
                  console.error(`Error deleting file: ${err.message}`);
                } else {
                  console.log(`File ${filePath} deleted successfully`);
                }
              });

              updatedData.plan_icon = "public/categoryimage/" + item.filename;
              updatedData.plan_icon_mime_type = item.mimetype;
            }
            if (item.fieldname == "plan_images") {
              if (filePath?.plan_images && filePath?.plan_images?.length > 0) {
                filePath?.plan_images?.forEach((file) => {
                  // Use fs.unlink to delete the file
                  fs.unlink(file.plan_image, (err) => {
                    if (err) {
                      console.error(`Error deleting file: ${err.message}`);
                    } else {
                      console.log(`File ${filePath} deleted successfully`);
                    }
                  });
                });
              }

              plan_images.push({
                plan_image: "public/categoryimage/" + item.filename,
                plan_image_mime_types: item.mimetype,
              });
            }
          });
        }

        // Use fs.unlink to delete the file
        // fs.unlink(filePath.plan_icon, (err) => {
        //   if (err) {
        //     console.error(`Error deleting file: ${err.message}`);
        //   } else {
        //     console.log(`File ${filePath} deleted successfully`);
        //   }
        // });

        // updatedData.plan_image = "public/categoryimage/" + files.filename;
        // updatedData.plan_image_mime_type = file.mimetype;

        updatedData.plan_images = plan_images;
      }

      await adminService.updateSubscription(body.plan_id, updatedData);

      res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText(
          "Successfully updated subscription plan"
        ),
      });
    } else {
      res.status(401).json({
        statusCode: statusCode.unauthorized,
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

let deleteSubscription = async (req, res) => {
  try {
    if (req.decoded.user_type == "admin") {
      const { params } = req;
      const whereQuery = {
        _id: params.id,
      };
      await adminService.deleteSubscription(whereQuery);
      res.status(201).json({
        statusCode: statusCode.successWithoutBody,
        message: await translateTheText("Successfully deleted subscription"),
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

const getUserSubListForAdminLogin = async (req, res) => {
  try {
    const { decoded, query } = req;
    await setGlobalLanguage(decoded.user_id);

    if (req.decoded.user_type === "admin") {
      const whereQuery = {
        user_type: "sub-admin",
        ...query,
      };
      const response = await adminService.getListofSubAdminUser(whereQuery);
      console.log("response", response);
      return res.status(200).json({
        statusCode: statusCode.success,
        message: await translateTheText("Successfully got the list of users"),
        data: response,
      });
    } else {
      return res.status(401).json({
        statusCode: statusCode.unauthorized,
        message: await translateTheText(
          "You are not authorized to access this API URL"
        ),
      });
    }
  } catch (error) {
    printConsole(error);
    return res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// sub admin user data
let addTheSubAdminUser = async (req, res) => {
  try {
    let { body, decoded } = req;
    await setGlobalLanguage(decoded.user_id);
    const { error } = SubAdminuserSignupSchema.validate(body, {
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
        // return await userService
        //   .registerUser(body)
        //   .then(async (response) => {
        //     if (response) {
        //       await AccessModel.create({
        //         sub_admin_id: response._id,
        //         first_name: response.first_name,
        //         last_name: response.last_name,
        //       });
        //     }
        //     // welcome email
        //     const html = `
        //                 <h3>Hi ${response.first_name} ${response.last_name}</h3> <br/>
        //                 <p>You have signed up successfully! Before Sign In please use forgot your password and reset it.</p> <br/>
        //                 <br/>
        //                 <br/>
        //                 <p>Regards,</p>  <br/>
        //                 <p>Smart Move team</p>
        //                 `;
        //     sendMail("techtic.avani@gmail.com", "Welcome to Smart Move", html);
        //     console.log("is callling");
        //     return res.status(200).json({
        //       statusCode: statusCode.sucess,
        //       message: await translateTheText("Successfully registered"),
        //       data: {
        //         first_name: response.first_name,
        //         last_name: response.last_name,
        //         email: response.email,
        //         user_type: "sub-admin",
        //         status: response.status,
        //         language: response.language,
        //         is_verified: response.is_verified,
        //         device_type: response.device_type,
        //         device_token: response.device_token,
        //         created_dt: response.created_dt,
        //         _id: response._id,
        //       },
        //     });
        //   })
        return await userService
          .registerUser(body)
          .then(async (response) => {
            await AccessModel.create({
              sub_admin_id: response._id,
              first_name: response.first_name,
              last_name: response.last_name,
            });
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

// sub admin user data
let userSubAdminUpdatedList = async (req, res) => {
  try {
    let { body } = req;
    await setGlobalLanguage(body._id);
    const { error } = SubAdminuserSignupSchema.validate(body, {
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
      return await adminService
        .updateAdminUserData(body)
        .then(async (response) => {
          process.env.USER_SELECTED_LANGUAGE = response.language;
          return res.status(200).json({
            statusCode: statusCode.sucess,
            message: await translateTheText("User Updated Successfully"),
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
              device_type: "sub-admin",
              device_token: response.device_token,
              created_dt: response.created_dt,
              updated_dt: response.updated_dt,
              _id: response._id,
              // is_t_and_c_checked: userData.is_t_and_c_checked,
              // is_privacy_policy_checked: userData.is_privacy_policy_checked
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

// get access settings
const getAccessSettings = async (req, res) => {
  try {
    const { decoded, query } = req;
    await setGlobalLanguage(decoded.user_id);
    if (
      req.decoded.user_type === "admin" ||
      req.decoded.user_type === "sub-admin"
    ) {
      const response = await adminService.getAccessSettings(query);
      console.log("response", response);
      return res.status(200).json({
        statusCode: statusCode.sucess,
        message: await translateTheText("Successfully got the list of users"),
        data: response,
      });
    } else {
      return res.status(401).json({
        statusCode: statusCode.unauthorized,
        message: await translateTheText(
          "You are not authorized to access this API URL"
        ),
      });
    }
  } catch (error) {
    printConsole(error);
    return res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

// update access settings
const updateAccessSettings = async (req, res) => {
  try {
    const { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);
    if (
      req.decoded.user_type === "admin" ||
      req.decoded.user_type === "sub-admin"
    ) {
      const response = await adminService.updateAccessSettings(
        req.decoded,
        body
      );
      return res.status(response.status).json({
        statusCode: response.statusCode,
        message: await translateTheText(response.message),
        data: response.data,
      });
    } else {
      return res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "You are not authorized to access this API URL"
        ),
      });
    }
  } catch (error) {
    printConsole(error);
    return res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const informUserViaMail = async (req, res) => {
  try {
    const { decoded, body } = req;
    await setGlobalLanguage(decoded.user_id);

    if (decoded.user_type === "user") {
      return res.status(401).json({
        statusCode: statusCode.unauthorised,
        message: await translateTheText(
          "You are not authorized to access this API URL"
        ),
      });
    }

    if (!body.message && !body.subject) {
      return res.status(400).json({
        statusCode: statusCode.validation,
        message: await translateTheText(
          "Subject and Message must be required"
        ),
      });
    }

    const commonUserData = await UserModel.find({ user_type: "user", is_deleted: false, is_verified: true, status: "active", is_email_verified: true }).select("first_name last_name user_type email").limit(5);

    for (let i = 0; i < commonUserData.length; i++) {
      try {
        const { first_name, last_name, email } = commonUserData[i];

        // Email content and options
        const mailSubject = req.body.subject;
        const mailHtml = `Dear ${first_name + " " + last_name},\n ${body.message}.`;
        //   const mailHtml = `
        //   <html>
        //     <body>
        //       <p>Dear ${first_name} ${last_name},</p>
        //       <p>${req.body.message}</p>
        //     </body>
        //   </html>
        // `;

        // Send the email
        await sendMail(email, mailSubject, mailHtml, null);
        console.log(`Email sent to ${email}`);

        // Introduce a delay between emails (adjust the delay as needed)
        if (i < commonUserData.length - 1) {
          await delay(5000); // 5000 milliseconds (5 second) delay
        }
      } catch (error) {
        console.error(`Error sending email to ${email}: ${error.message}`);
      }
    }
    return res.status(200).json({
      statusCode: statusCode.sucess,
      message: await translateTheText("Email Sent to the users"),
    });

  } catch (error) {
    printConsole(error);
    return res.status(500).json({
      statusCode: statusCode.internalError,
      message: await translateTheText("Internal server error"),
    });
  }
}

module.exports = {
  adminLogin,
  forgotPassowrd,
  resetPassword,
  refreshToken,
  verifyProfile,
  getDataByUserId,
  getUserListForAdminLogin,
  removeTheUser,
  addTheUser,
  logout,
  addCategories,
  updateCategory,
  deleteCategory,
  getCategoryList,
  addFurnitureCategory,
  updateFurnitureCategory,
  deleteFurnitureCategory,
  getFurnitureCategoryListForAdminLogin,
  getShoppingCategoryList,
  deleteShoppingCategory,
  updateShoppingCategory,
  addShoppingCategory,
  updateUserDetails,
  getAnalytics,
  deleteAdminUser,
  userAdminUpdatedList,
  blockTheUser,
  uploadTermsandConditionandPrivacyPolicy,
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  getUserSubListForAdminLogin,
  userSubAdminUpdatedList,
  addTheSubAdminUser,
  getAccessSettings,
  updateAccessSettings,
  verifyAdminProfile,
  verifySubAdminProfile,
  sendVerificationMailAgain,
  uploadTermsandCondition,
  uploadPrivacyPolicy,
  informUserViaMail,
  unblockTheUser,
};
