/**
 * userService.js
 *
 * All User related APIs which will connect with database and will response back.
 */
const { ObjectId } = require("mongodb");
const {
  sendMail,
  printConsole,
  decrypt,
  translateTheText,
} = require("../../Utils/commonFile");
const UserModel = require("../schema/user.schema");
const FurnitureModel = require("../schema/furniture.schema");
// const FurnitureCategoryModel = require("../schema/furnitureCategory.schema");
// const ShoppingCategoryModel = require("../schema/shoppingCategory.schema");
const TodoModel = require("../schema/todolist.schema");
const LanguageModel = require("../schema/language.schema");
// const path = require('path');
// var randomize = require("randomatic");
const InvitedUserModel = require("../schema/invitedUser.schema");
const config = require("dotenv").config();
const schedule = require("node-schedule");
const fs = require("fs");
const { statusCode } = require("../../Utils/const");
const NotificationCountModel = require("../schema/notificationCount.schema");

const UserService = {
  async findExistingUser(whereQuery) {
    return UserModel.findOne(whereQuery);
  },

  async registerUser(data) {
    const createdUser = await UserModel.create(data);
    return createdUser;
  },

  async sendEmailsToRegisteredUser(data) {
    const reset_token = Math.floor(100000 + Math.random() * 900000);
    await UserModel.findByIdAndUpdate(
      { _id: data._id },
      { reset_token: reset_token }
    );

    let language = data?.language === "en" ? "english" : "germen";
    let context1 = fs.readFileSync(
      `./emailTemplates/emailVerification.${language}.html`,
      "utf8"
    );
    context1 = context1.replace("{{ verificationCode }}", reset_token);
    await sendMail(data.email, "Email Verification", context1);
    return true;
  },

  async welcomeToUserEmail(data) {
    await UserModel.findByIdAndUpdate(
      { _id: data._id },
      {
        reset_token: null,
        is_email_verified: data.is_email_verified,
        is_verified: data.is_verified,
        status: data.status,
      }
    );
    // welcome email
    let language = data?.language === "en" ? "english" : "germen";
    let context = fs.readFileSync(
      `./emailTemplates/welcomeEmail.${language}.html`,
      "utf8"
    );
    context = context.replace(
      "USERNAME",
      data.first_name + " " + data.last_name
    );
    return await sendMail(data.email, "Welcome to Smart Move", context);
  },

  // async addDefaultFurnitureCategoryBasedOnUserId(userId) {
  //     const payload = [
  //         {
  //             furniture_category_name: "Dressers",
  //             furniture_category_image: 'public/furniturecategoryimage/1703747743522-Screenshot_2.png', shopping_image_mime_type: 'image/png',
  //             user_id: userId
  //         },
  //         {
  //             furniture_category_name: "Bathroom",
  //             furniture_category_image: 'public/furniturecategoryimage/1703747743522-Screenshot_2.png', shopping_image_mime_type: 'image/png',
  //             user_id: userId
  //         },
  //         {
  //             furniture_category_name: "Balcony/Garden",
  //             furniture_category_image: 'public/furniturecategoryimage/1703747743522-Screenshot_2.png', shopping_image_mime_type: 'image/png',
  //             user_id: userId
  //         }
  //     ]
  //     return await FurnitureCategoryModel.insertMany(payload)
  // },

  // async addDefaultShoppingCategoryBasedOnUserId(userId) {
  //     const payload =
  //     {
  //         shopping_category_name: "Office",
  //         shopping_category_image: 'public/Shoppingcategoryimage/1703767079542-Screenshot_2.png',
  //         shopping_image_mime_type: 'image/png',
  //         user_id: userId
  //     }
  //     return await ShoppingCategoryModel.create(payload)
  // },

  async updateUserProfileData(data) {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      language: data.language,
      country: data.country,
      region: data.region,
      dob: data.dob,
      device_type: data.device_type,
      device_token: data.device_token,
      updated_dt: Date.now(),
    };
    if (data.password) {
      (payload.salt = data.salt), (payload.password = data.password);
    }
    return UserModel.findByIdAndUpdate({ _id: data._id }, payload, {
      new: true,
    });
  },

  async forgotPassowrdEmail(data) {
    try {
      const reset_token = Math.floor(100000 + Math.random() * 900000);
      const resetTokenExpiry = Date.now() + 3600000;
      await UserModel.findByIdAndUpdate(
        { _id: data._id },
        { reset_token: reset_token, reset_token_expiry: resetTokenExpiry }
      );

      const language = data?.language === "en" ? "english" : "germen";
      let context = fs.readFileSync(
        `./emailTemplates/forgotpassword.${language}.html`,
        "utf8"
      );
      context = context.replace("{{ verificationCode }}", reset_token);
      await sendMail(data.email, "Forgot Password Request", context);
      // Schedule the next execution after a minute
      schedule.scheduleJob(new Date(Date.now() + 3600000), async () => {
        printConsole("expiring the reset password token after an hour");
        await UserModel.findByIdAndUpdate(
          { _id: data._id },
          { reset_token: null, reset_token_expiry: null }
        );
      });
      return true;
    } catch (error) {
      throw error;
    }
  },

  async resetPasswordWithNewSalt(pass, salt, id) {
    try {
      return UserModel.updateOne({
        password: pass,
        salt: salt,
        reset_token: null,
      }).where({ _id: id });
    } catch (error) {
      throw error;
    }
  },

  async addDeviceToken(data, userData, is_social_login) {
    try {
      let userInfo = userData.device;
      let isDeviceToken = userInfo.filter(
        (rec) => rec.token == data.device_token
      );
      if (isDeviceToken.length == 0) {
        console.log(isDeviceToken);
        if (userInfo.length > 1) {
          userInfo.shift();
        }
        // push new json into userinfo
        userInfo.push({
          type: data.device_type,
          token: data.device_token,
        });
        // update the userdata into the mongodb database
        userData = await UserModel.findByIdAndUpdate(
          { _id: userData._id },
          { $set: { device: userInfo, is_social_login } },
          { new: true }
        );
      } else {
        userData = await UserModel.findByIdAndUpdate(
          { _id: userData._id },
          { $set: { is_social_login } },
          { new: true }
        );
      }
      return userData;
    } catch (error) {
      throw error;
    }
  },

  // async addDeviceToken(data, userData) {
  //   try {
  //     let userInfo = userData.device;
  //     let isDeviceToken = userInfo.filter(
  //       (rec) => rec.token == data.device_token
  //     );
  //     if (isDeviceToken.length == 0) {
  //       console.log(isDeviceToken);
  //       if (userInfo.length > 1) {
  //         userInfo.shift();
  //       }
  //       // push new json into userinfo
  //       userInfo.push({
  //         type: data.device_type,
  //         token: data.device_token,
  //       });
  //       // update the userdata into the mongodb database
  //       return UserModel.findByIdAndUpdate(
  //         { _id: userData._id },
  //         { $set: { device: userInfo } },
  //         { new: true }
  //       );
  //     } else {
  //       return userData;
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async updateLoginStatus(userId, is_loggedId) {
    await UserModel.findByIdAndUpdate({ _id: userId }, { is_loggedId });
  },

  async logoutUser(data) {
    try {
      const whereQuery = {
        _id: data?.user_id || data?._id,
      };
      const userData = await UserModel.findOne(whereQuery, {
        password: 0,
        salt: 0,
      });

      // console.log("data 205------>", data);
      // console.log("userData 206------>", userData);
      // const deviceData =
      //   userData &&
      //   userData?.device.find((rec) => rec.token == data.device_token);
      // console.log("deviceData 210------>", deviceData);

      // if (deviceData && deviceData._id) {
      //   // update the userdata into the mongodb database
      //   await UserModel.findByIdAndUpdate(
      //     {
      //       _id:
      //         data && data?.user_id
      //           ? new ObjectId(data.user_id)
      //           : new ObjectId(data?._id),
      //     },
      //     { $pull: { device: { _id: new ObjectId(deviceData._id) } } }
      //   );
      // }

      return true;
    } catch (error) {
      // console.log("error 204------>", error);
      throw error;
    }
  },

  async getListOfUserDataBasedOnUserId(data) {
    try {
      const userData = await UserModel.findOne(
        { _id: data.id, is_deleted: false },
        { password: 0, salt: 0 }
      );
      // const jsonData = await decrypt(userData.password, userData.salt)
      // userData.password = jsonData.password
      return userData;
    } catch (error) {
      throw error;
    }
  },

  // async deleteTheUser(data) {
  //   try {
  //     await FurnitureModel.aggregate([
  //       { $match: { user_id: new ObjectId(data.id) } },
  //     ]);
  //     // await FurnitureCategoryModel.aggregate([{ $match: { user_id: new ObjectId(data.id) } }]);
  //     await TodoModel.aggregate([
  //       { $match: { user_id: new ObjectId(data.id) } },
  //     ]);
  //     // await ShoppingCategoryModel.aggregate([{ $match: { user_id: new ObjectId(data.id) } }]);
  //     return await UserModel.findByIdAndDelete({ _id: data.id });
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  async deleteTheUser(data) {
    try {
      await FurnitureModel.aggregate([
        { $match: { user_id: new ObjectId(data.id) } },
      ]);
      // await FurnitureCategoryModel.aggregate([{ $match: { user_id: new ObjectId(data.id) } }]);
      await TodoModel.aggregate([
        { $match: { user_id: new ObjectId(data.id) } },
      ]);
      // await ShoppingCategoryModel.aggregate([{ $match: { user_id: new ObjectId(data.id) } }]);
      return await UserModel.findByIdAndUpdate(
        { _id: data.id },
        { is_deleted: true }
      );
    } catch (error) {
      throw error;
    }
  },

  async setUserLanguage(data) {
    try {
      await UserModel.findByIdAndUpdate(
        { _id: data.user_id },
        { language: data.language }
      );
      return await UserModel.findById(
        { _id: data.user_id },
        { password: 0, salt: 0 }
      );
    } catch (error) {
      throw error;
    }
  },

  async setUserCurrency(data) {
    try {
      await UserModel.findByIdAndUpdate(
        { _id: data.user_id },
        { currency: data.currency }
      );
      return await UserModel.findById(
        { _id: data.user_id },
        { password: 0, salt: 0 }
      );
    } catch (error) {
      throw error;
    }
  },

  async setUserNotification(data) {
    try {
      await UserModel.findByIdAndUpdate(
        { _id: data.user_id },
        { notify_me: data.notify_me }
      );
      return await UserModel.findById(
        { _id: data.user_id },
        { password: 0, salt: 0 }
      );
    } catch (error) {
      throw error;
    }
  },

  async sendInvitationToUser(data, decoded) {
    try {
      const user = await UserModel.findOne({ email: data.email });
      // let invitedUser = await InvitedUserModel.findOne({ email: data.email })
      const invistedList = await InvitedUserModel.find({
        parent_id: data.parent_id,
      });

      let isUserAlredyInvited = false;

      if (invistedList && invistedList.length > 0) {
        invistedList.forEach((user) => {
          if (user.email == data.email) {
            isUserAlredyInvited = true;
          }
        });
      }

      // else if (
      //   invistedList.length >= config.parsed.MAX_LIMIT_TO_INVITE_USERS
      // ) {
      //   throw {
      //     status: 400,
      //     statusCode: statusCode.validation,
      //     message: await translateTheText(
      //       "You are not allowed to add more than 10 users"
      //     ),
      //   };
      // }

      if (!user) {
        throw "User does not exist with this email";
      } else if (
        decoded.subcription == "free tier" &&
        invistedList &&
        invistedList.length >=
          config.parsed.MAX_LIMIT_TO_INVITE_USERS_FOR_FREE_TIER
      ) {
        throw {
          status: 400,
          statusCode: statusCode.validation,
          message: await translateTheText(
            "To add more co-users, please upgrade your plan"
          ),
        };
      } else if (isUserAlredyInvited) {
        throw {
          status: 400,
          statusCode: statusCode.validation,
          message: await translateTheText("User is alredy invited"),
        };
      } else {
        const reset_token = Math.floor(100000 + Math.random() * 900000);
        await InvitedUserModel.create({
          email: data.email,
          parent_id: data.parent_id,
          verification_code: reset_token,
        });
        const invitedUser = await InvitedUserModel.findOne({
          email: data.email,
        });

        // email verfication after registration
        const language = data?.language === "en" ? "english" : "germen";
        let context1 = fs.readFileSync(
          `./emailTemplates/inviedCoUser.${language}.html`,
          "utf8"
        );
        context1 = context1
          .replace("USERNAME", decoded.first_name + " " + decoded.last_name)
          .replace("{{ verificationCode }}", reset_token);
        await sendMail(data.email, "Invited Co-user Email", context1);
        return true;
      }
    } catch (error) {
      throw error;
    }
  },

  async checkInvitedUser(whereQuery) {
    return InvitedUserModel.findOne(whereQuery);
  },

  async verifyInvitatedUser(data, name) {
    try {
      await InvitedUserModel.findByIdAndUpdate(
        { _id: data._id },
        { verification_code: null, status: "joined app", name: name }
      );
      return await UserModel.findOneAndUpdate(
        { email: data.email },
        { is_user_invited: true }
      );
      // return true
    } catch (error) {
      throw error;
    }
  },

  async listOfInvitedUser(data) {
    try {
      const checkIsUserIdIsParentId = await InvitedUserModel.find({
        parent_id: new ObjectId(data.user_id),
        status: "joined app",
      });
      // printConsole("checkIsUserIdIsParentId", checkIsUserIdIsParentId)
      if (checkIsUserIdIsParentId.length > 0) {
        return UserModel.aggregate([
          {
            $match: {
              _id: new ObjectId(data.user_id),
            },
          },
          {
            $lookup: {
              from: "invitedusers", // Collection name of the second model
              localField: "_id",
              pipeline: [
                {
                  $match: {
                    status: "joined app",
                    is_deleted: false,
                  },
                },
              ],
              foreignField: "parent_id",
              as: "inviteduserList",
            },
          },
          {
            $project: {
              _id: 1,
              first_name: 1,
              last_name: 1,
              inviteduserList: 1,
              profile_name: 1,
            },
          },
        ]);
      } else {
        const user = await InvitedUserModel.aggregate([
          {
            $match: {
              email: data.email,
              status: "joined app",
              is_deleted: false,
            },
          },
          {
            $lookup: {
              from: "users", // Collection name of the second model
              localField: "parent_id",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    inviteduserList: 1,
                    profile_name: 1,
                  },
                },
              ],
              foreignField: "_id",
              as: "parentList",
            },
          },
          {
            $group: {
              _id: "$parent_id",
              parentDetails: {
                $push: "$parentList",
              },
              // Add other fields if needed
            },
          },
        ]);
        // printConsole("user", user)
        if (user.length > 0) {
          let responseData = [];
          user.map((rec) => {
            rec.parentDetails &&
              rec.parentDetails[0] &&
              rec.parentDetails[0][0] &&
              rec?.parentDetails[0][0] &&
              responseData.push(rec.parentDetails[0][0]);
          });
          return responseData;
        }
        return [];
      }
    } catch (error) {
      throw error;
    }
  },

  // async findExistingUserAsHeIsParentOrNOtAndThenDelete(user_id, data) {
  //   try {
  //     const userData = await InvitedUserModel.findOne({ parent_id: user_id });
  //     if (userData) {
  //       return await InvitedUserModel.findByIdAndDelete({
  //         _id: data.delete_user_id,
  //       });
  //     } else {
  //       throw "You are not authorised to delete this user";
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  async findExistingUserAsHeIsParentOrNOtAndThenDelete(user_id, data) {
    try {
      const isInvitedUser = await InvitedUserModel.find({
        parent_id: user_id,
      });

      if (
        isInvitedUser.length > 0 &&
        data?.delete_user_id &&
        data?.delete_user_id?.length > 0
      ) {
        data?.delete_user_id.forEach(async (user) => {
          await InvitedUserModel.findByIdAndUpdate(
            {
              _id: user,
            },
            {
              is_deleted: true,
            }
          );
        });
      }

      return;
    } catch (error) {
      throw error;
    }
  },

  async updateTandCandPrivacyPolicy(user_id, data) {
    try {
      await UserModel.findByIdAndUpdate(
        { _id: user_id },
        {
          is_t_and_c_checked: data.is_t_and_c_checked,
          is_privacy_policy_checked: data.is_privacy_policy_checked,
        }
      );
      return await UserModel.findById(
        { _id: user_id },
        { password: 0, salt: 0 }
      );
    } catch (error) {
      throw error;
    }
  },

  async updateTandCandPrivacyPolicy(user_id, data) {
    try {
      await UserModel.findByIdAndUpdate(
        { _id: user_id },
        {
          is_t_and_c_checked: data.is_t_and_c_checked,
          is_privacy_policy_checked: data.is_privacy_policy_checked,
        }
      );
      return await UserModel.findById(
        { _id: user_id },
        { password: 0, salt: 0 }
      );
    } catch (error) {
      throw error;
    }
  },

  async listOfTermsAndConditionBasedOnLanguageSelected(
    data,
    languageCode = "de"
  ) {
    try {
      if (data?.user_id) {
        return await UserModel.aggregate([
          {
            $match: {
              _id: new ObjectId(data.user_id),
            },
          },
          {
            $lookup: {
              from: "languages", // Collection name of the second model
              localField: "language",
              pipeline: [
                {
                  $lookup: {
                    from: "termsconditionandprivacypolicies", // Collection name of the second model
                    localField: "_id",
                    foreignField: "language_id",
                    as: "terms_and_conditions",
                  },
                },
                {
                  $unwind: "$terms_and_conditions",
                },
              ],
              foreignField: "language_short_form",
              as: "language",
            },
          },
          {
            $unwind: "$language",
          },
          {
            $project: {
              _id: 0,
              terms_and_conditions: "$language.terms_and_conditions",
            },
          },
        ]);
      } else {
        return await LanguageModel.aggregate([
          {
            $match: {
              // language_name: "German",
              language_short_form: languageCode,
            },
          },
          {
            $lookup: {
              from: "termsconditionandprivacypolicies", // Collection name of the second model
              localField: "_id",
              foreignField: "language_id",
              as: "terms_and_conditions",
            },
          },
          {
            $project: {
              _id: 0,
              terms_and_conditions: 1,
            },
          },
        ]);
      }
    } catch (error) {
      throw error;
    }
  },

  async updateInvitedUserName(data) {
    try {
      await InvitedUserModel.findOneAndUpdate(
        { email: data.email },
        { name: data.profile_name }
        // { new: true }
      );
      await UserModel.findOneAndUpdate(
        { email: data.email },
        { profile_name: data.profile_name }
        // { new: true }
      );
      return;
    } catch (error) {
      throw error;
    }
  },

  async addUserProfile(profile_name, user_id, email) {
    const handleAddProfile = async () => {
      const updatedUser = await UserModel.findByIdAndUpdate(
        { _id: user_id },
        { $push: { profiles: { profile_name } } }
      );
      return updatedUser;
    };
    try {
      const user = await UserModel.findById({ _id: user_id });
      if (user) {
        if (user.subcription == "free tier") {
          const coUser = await InvitedUserModel.find({
            email,
          }).lean();
          // let totalCousers = 0;
          // totalCousers =
          //   totalCousers + coUser &&
          //   coUser.length + user?.profiles &&
          //   user.profiles.length;

          // if (user?.profiles && user.profiles.length >= 2) {
          // if (totalCousers >= 2) {
          if (user?.profiles && user.profiles.length >= 1) {
            throw {
              status: 400,
              statusCode: statusCode.validation,
              message: await translateTheText(
                "To invite further co-users, you must subscribe to the function extension subscription"
              ),
            };
          } else {
            return handleAddProfile();
          }
        } else {
          return handleAddProfile();
        }
      }
    } catch (error) {
      throw error;
    }
  },

  // async getUserProfile(user_id) {
  //   try {
  //     let userProfiles = [];
  //     const user = await UserModel.findById({ _id: user_id }).lean();
  //     const coUser = await InvitedUserModel.find({
  //       email: user.email,
  //     }).lean();

  //     if (user) {
  //       if (user?.profiles && user?.profiles.length > 0) {
  //         user.profiles.forEach((item) => {
  //           userProfiles.push({
  //             _id: item?._id,
  //             profile_id: item?._id,
  //             profile_name: item?.profile_name,
  //             profile_type: "Main user",
  //             created_dt: item?.created_dt,
  //           });
  //         });
  //       }
  //     }

  //     if (coUser && coUser.length > 0) {
  //       coUser.forEach(async (item) => {
  //         if (item.status == "joined app") {
  //           const user = await UserModel.findById({
  //             _id: new ObjectId(item.parent_id),
  //           }).lean();
  //           if (user && user?.profiles && user.profiles?.length > 0) {
  //             user.profiles.forEach((profile) => {
  //               if (profile._id.equals(item.profile_id))
  //                 userProfiles.push({
  //                   _id: item?._id,
  //                   profile_id: profile?._id,
  //                   profile_name: profile?.profile_name,
  //                   profile_type: "Co user",
  //                   created_dt: item?.created_dt,
  //                 });
  //             });
  //           }
  //         }
  //       });
  //     }

  //     return userProfiles;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async getUserProfile(user_id) {
    try {
      let userProfiles = [];
      const user = await UserModel.findById({ _id: user_id }).lean();
      const coUser = await InvitedUserModel.find({ email: user.email }).lean();

      if (user && user.profiles && user.profiles.length > 0) {
        for (const item of user.profiles) {
          userProfiles.push({
            _id: item._id,
            profile_id: item._id,
            profile_name: item.profile_name,
            profile_type: "Main user",
            created_dt: item.created_dt,
          });
        }
      }

      if (coUser && coUser.length > 0) {
        for (const item of coUser) {
          if (item.status == "joined app") {
            const user = await UserModel.findById({
              _id: new ObjectId(item.parent_id),
            }).lean();
            if (user && user.profiles && user.profiles.length > 0) {
              for (const profile of user.profiles) {
                if (profile._id.equals(item.profile_id)) {
                  userProfiles.push({
                    _id: item._id,
                    profile_id: profile._id,
                    profile_name: profile.profile_name,
                    profile_type: "Co user",
                    created_dt: item.created_dt,
                  });
                }
              }
            }
          }
        }
      }

      return userProfiles;
    } catch (error) {
      throw error;
    }
  },

  async deleteUserRelocationProfile(profileId, user_id) {
    try {
      await InvitedUserModel.deleteMany({
        profile_id: new ObjectId(profileId),
      });

      const updatedUser = await UserModel.findByIdAndUpdate(
        { _id: user_id },
        { $pull: { profiles: { _id: profileId } } }
      );

      return updatedUser;
    } catch (error) {
      throw error;
    }
  },

  async inviteaCouser(data, decoded) {
    try {
      const user = await UserModel.findOne({ email: data.email });
      const invistedList = await InvitedUserModel.find({
        parent_id: data.parent_id,
      });

      let isUserAlredyInvited = false;

      if (invistedList && invistedList.length > 0) {
        invistedList.forEach((user) => {
          if (user.email == data.email && data.profile_id == user.profile_id) {
            isUserAlredyInvited = true;
          }
        });
      }

      if (!user) {
        throw {
          status: 400,
          statusCode: statusCode.validation,
          message: await translateTheText(
            "User does not exist with this email"
          ),
        };
      } else if (
        decoded.subcription === "free tier" &&
        invistedList &&
        invistedList.length >= 1
      ) {
        throw {
          status: 400,
          statusCode: statusCode.validation,
          message: await translateTheText(
            "To be able to invite further co-users, you must subscribe to the function extension subscription"
          ),
        };
      } else if (isUserAlredyInvited) {
        throw {
          status: 400,
          statusCode: statusCode.validation,
          message: await translateTheText("User is alredy invited"),
        };
      } else {
        const verification_code = Math.floor(100000 + Math.random() * 900000);
        await InvitedUserModel.create({
          email: data.email,
          parent_id: data.parent_id,
          profile_id: data.profile_id,
          verification_code: verification_code,
        });

        // email verfication after registration
        const language = decoded?.language === "en" ? "english" : "germen";
        let context1 = fs.readFileSync(
          `./emailTemplates/inviedCoUser.${language}.html`,
          "utf8"
        );
        context1 = context1
          .replace("USERNAME", decoded.first_name + " " + decoded.last_name)
          .replace("{{ verificationCode }}", verification_code);
        await sendMail(data.email, "Invited Co-user Email", context1);
        return true;
      }
    } catch (error) {
      throw error;
    }
  },

  // async inviteaCouser(data, decoded) {
  //   try {
  //     const user = await UserModel.findOne({ email: data.email });
  //     const invistedList = await InvitedUserModel.find({
  //       parent_id: data.parent_id,
  //     });

  //     let isUserAlredyInvited = false;

  //     if (invistedList && invistedList.length > 0) {
  //       invistedList.forEach((user) => {
  //         if (user.email == data.email && data.profile_id == user.profile_id) {
  //           isUserAlredyInvited = true;
  //         }
  //       });
  //     }

  //     if (!user) {
  //       throw {
  //         status: 400,
  //         statusCode: statusCode.validation,
  //         message: await translateTheText(
  //           "User does not exist with this email"
  //         ),
  //       };
  //     } else if (decoded.subcription === "free tier") {
  //       if (invistedList && invistedList.length >= 1) {
  //         // if (
  //         //   (invistedList && invistedList.length >= 2) ||
  //         //   (user?.profiles && user.profiles.length >= 2) ||
  //         //   (invistedList.length >= 1 && user.profiles.length >= 1)
  //         // )

  //         throw {
  //           status: 400,
  //           statusCode: statusCode.validation,
  //           message: await translateTheText(
  //             "To be able to invite further co-users, you must subscribe to the function extension subscription"
  //           ),
  //         };
  //       } else {
  //         const verification_code = Math.floor(100000 + Math.random() * 900000);
  //         await InvitedUserModel.create({
  //           email: data.email,
  //           parent_id: data.parent_id,
  //           profile_id: data.profile_id,
  //           verification_code: verification_code,
  //         });

  //         // email verfication after registration
  //         const language = data?.language === "en" ? "english" : "germen";
  //         let context1 = fs.readFileSync(
  //           `./emailTemplates/inviedCoUser.${language}.html`,
  //           "utf8"
  //         );
  //         context1 = context1
  //           .replace("USERNAME", decoded.first_name + " " + decoded.last_name)
  //           .replace("{{ verificationCode }}", verification_code);
  //         await sendMail(data.email, "Invited Co-user Email", context1);
  //         return true;
  //       }
  //     } else if (isUserAlredyInvited) {
  //       throw {
  //         status: 400,
  //         statusCode: statusCode.validation,
  //         message: await translateTheText("User is alredy invited"),
  //       };
  //     } else {
  //       const verification_code = Math.floor(100000 + Math.random() * 900000);
  //       await InvitedUserModel.create({
  //         email: data.email,
  //         parent_id: data.parent_id,
  //         profile_id: data.profile_id,
  //         verification_code: verification_code,
  //       });

  //       // email verfication after registration
  //       let context1 = fs.readFileSync(
  //         "./emailTemplates/inviedCoUser.english.html",
  //         "utf8"
  //       );
  //       context1 = context1
  //         .replace("USERNAME", decoded.first_name + " " + decoded.last_name)
  //         .replace("{{ verificationCode }}", verification_code);
  //       await sendMail(data.email, "Invited Co-user Email", context1);
  //       return true;
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async verifyInvitation(data, name) {
    try {
      return await InvitedUserModel.findByIdAndUpdate(
        { _id: data._id },
        { verification_code: null, status: "joined app" }
      );
      // return await UserModel.findOneAndUpdate(
      //   { email: data.email },
      //   { is_user_invited: true }
      // );
    } catch (error) {
      throw error;
    }
  },

  async getInvitedUserProfile(user_id, profile_id) {
    try {
      let movingProfile = [];
      let userProfiles = [];
      const user = await UserModel.findById({ _id: user_id }).lean();
      const coUser = await InvitedUserModel.find({
        parent_id: new ObjectId(user_id),
        profile_id: new ObjectId(profile_id),
      }).lean();

      if (user) {
        if (user?.profiles && user?.profiles.length > 0) {
          user.profiles.forEach((item) => {
            const id1 = item?._id;
            const id2 = profile_id;

            if (id1.equals(id2)) {
              movingProfile.push({
                _id: item?._id,
                profile_name: item?.profile_name,
                profile_type: "Main user",
                created_dt: item?.created_dt,
              });
            }
          });
        }
      }

      // invited use profile list
      if (coUser && coUser.length > 0) {
        coUser.forEach((item) => {
          if (item.status == "joined app") {
            if (user && user?.profiles && user?.profiles.length > 0) {
              user.profiles.forEach(async (user) => {
                const id1 = user?._id;
                const id2 = item?.profile_id;

                if (id1.equals(id2) && user_id == item?.parent_id) {
                  const couser = await UserModel.find({
                    email: item.email,
                  }).lean();

                  if (couser.length > 0) {
                    userProfiles.push({
                      _id: item?._id,
                      profile_name:
                        couser[0]?.first_name + couser[0]?.last_name,
                      profile_type: "Co user",
                      created_dt: item?.created_dt,
                    });
                  }
                }
              });
            }
          }
        });
      }

      return { moving_profiles: movingProfile, user_profiles: userProfiles };
    } catch (error) {
      throw error;
    }
  },

  async renameUserRelocationProfile(user_id, data) {
    try {
      return await UserModel.findOneAndUpdate(
        { _id: user_id, "profiles._id": data.profile_id },
        { $set: { "profiles.$.profile_name": data.profile_name } }
      );
    } catch (error) {
      throw error;
    }
  },

  // async deleteUserRelocationProfile(profileId, user_id) {
  //   try {
  //     const updatedUser = await UserModel.findByIdAndUpdate(
  //       { _id: user_id },
  //       { $pull: { profiles: { _id: profileId } } }
  //     );

  //     return updatedUser;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async removeCouser(data) {
    try {
      // return await UserModel.findOneAndUpdate(
      //   { _id: user_id, "profiles._id": data.profile_id },
      //   { $set: { "profiles.$.profile_name": data.profile_name } }
      // );
      // return await InvitedUserModel.findOneAndUpdate(
      //   { _id: new ObjectId(data.profile_id) },
      //   { is_deleted: true }
      //   // { $set: { "profiles.$.profile_name": data.profile_name } }
      // );
      if (data && data?.invite_id) {
        return await InvitedUserModel.deleteMany({
          // profile_id: new ObjectId(data.profile_id),
          _id: { $in: data.invite_id.map((id) => new ObjectId(id)) },
        });
      }
      // else {
      //   return await InvitedUserModel.findOneAndDelete({
      //     profile_id: new ObjectId(data.profile_id),
      //   });
      // }
    } catch (error) {
      throw error;
    }
  },

  async getAllNotificationCount() {
    return await NotificationCountModel.find();
  },

  async getnotificationCount(user_id) {
    try {
      const userProfiles = await UserService.getUserProfile(user_id);
      const notificationCount = [];

      if (userProfiles && userProfiles.length > 0) {
        for (profile of userProfiles) {
          if (profile.profile_type == "Main user") {
            const notifications = await NotificationCountModel.findOne({
              profile_id: profile.profile_id,
            }).lean();
            if (notifications && Object.keys(notifications).length > 0) {
              if (
                notifications?.main_user_notification &&
                notifications?.main_user_notification?.notification_count > 0
              ) {
                notificationCount.push({
                  profile_id: notifications.profile_id,
                  notifications: notifications.main_user_notification,
                });
              }
            }
          } else {
            const notifications = await NotificationCountModel.findOne({
              profile_id: profile.profile_id,
            }).lean();
            if (notifications && Object.keys(notifications).length > 0) {
              if (
                notifications?.main_user_notification &&
                notifications?.main_user_notification?.notification_count > 0
              ) {
                notificationCount.push({
                  profile_id: notifications.profile_id,
                  notifications: notifications.main_user_notification,
                });
              }
            }
          }
        }
      }
      // else {
      //    return userProfiles;
      // }

      return notificationCount;
    } catch (error) {
      throw error;
    }
  },

  // async createOrUpdateNotificationCount(profileId, dataToUpdate) {
  //   try {
  //     // Check if the document with the given profileId exists
  //     const existingDocument = await NotificationCountModel.findOne({
  //       profile_id: profileId,
  //     });

  //     // If the document exists and profiles is an array
  //     if (existingDocument && Object.keys(existingDocument).length > 0) {
  //       // Update the document
  //       const filter = {
  //         profile_id: profileId,
  //       };
  //       const update = dataToUpdate;
  //       // Perform the update operation
  //       const updatedDocument = await NotificationCountModel.findOneAndUpdate(
  //         filter,
  //         update
  //       );
  //       return updatedDocument;
  //     } else {
  //       // Create a new document
  //       const newDocument = new NotificationCountModel(dataToUpdate);
  //       return await newDocument.save();
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async tempcreateOrUpdateNotificationCount(
    profileId,
    categoryId,
    dataToUpdate
  ) {
    try {
      // Check if the document with the given profileId exists
      let existingDocument = await NotificationCountModel.findOne({
        profile_id: profileId,
      });

      // If the document exists
      if (existingDocument) {
        // Check if main_user_notification.furniture_notifications.category_id exists
        let categoryExists = false;
        if (
          existingDocument?.main_user_notification?.furniture_notifications &&
          existingDocument?.main_user_notification?.furniture_notifications
            ?.length > 0
        ) {
          existingDocument.main_user_notification.furniture_notifications.forEach(
            (notification) => {
              if (
                dataToUpdate?.main_user_notification?.furniture_notifications
              ) {
                const id1 = new ObjectId(
                  dataToUpdate?.main_user_notification?.furniture_notifications.category_id
                );
                const id2 = new ObjectId(notification.category_id);
                if (id1.equals(id2)) {
                  categoryExists = true;
                }
              }
            }
          );
        }
        // add or update furniture_notifications
        if (categoryExists) {
          // Update the existing data
          const filter = {
            profile_id: profileId,
            "main_user_notification.furniture_notifications.category_id":
              dataToUpdate.main_user_notification.furniture_notifications
                .category_id,
          };
          const update = {
            $set: {
              "main_user_notification.furniture_notifications.$":
                dataToUpdate.main_user_notification.furniture_notifications,
            },
          };

          // Perform the update operation
          let updatedDocument;
          updatedDocument = await NotificationCountModel.updateOne(
            filter,
            update
          );
        } else {
          // Add new data to furniture_notifications array
          const filter = { profile_id: profileId };
          const update = {
            $addToSet: {
              "main_user_notification.furniture_notifications":
                dataToUpdate.main_user_notification.furniture_notifications,
            },
          };
          const options = { upsert: true };
          // Perform the update operation
          await NotificationCountModel.updateOne(filter, update, options);
        }

        // Check if main_user_notification.furniture_notifications.child_notification.saved.list.category_id exists or not

        const existingCategoryIndex =
          existingDocument.main_user_notification.furniture_notifications.findIndex(
            (notification) => notification.category_id === categoryId
          );

        if (existingCategoryIndex !== -1) {
          // Category exists
          const existingCategory =
            existingDocument.main_user_notification.furniture_notifications[
              existingCategoryIndex
            ];

          // Update or add new data in the saved list
          {
            const existingDataIndex =
              existingCategory.child_notification.saved.list.findIndex(
                (item) =>
                  item.category_id ===
                  dataToUpdate.main_user_notification.furniture_notifications
                    .child_notification.saved.list.category_id
              );
            if (existingDataIndex !== -1) {
              console.log("existingDataIndex 1305", existingDataIndex);
              // Data exists, update it
              existingCategory.child_notification.saved.list[
                existingDataIndex
              ].notification_count =
                dataToUpdate.main_user_notification.furniture_notifications.child_notification.saved.list.notification_count;
            } else {
              console.log(
                "existingCategory 1313",
                existingCategory.child_notification.saved.list
              );
              console.log("existingDataIndex 1316", existingDataIndex);
              // Data doesn't exist, add it
              existingCategory.child_notification.saved.list.push(
                dataToUpdate.main_user_notification.furniture_notifications
                  .child_notification.saved.list
              );
              console.log(
                "existingCategory 1323",
                existingCategory.child_notification.saved.list
              );
            }
          }
          console.log(
            "existingDocument--------------1329",
            existingDocument.main_user_notification.furniture_notifications[0]
              .child_notification.saved.list
          );

          // Save the updated document
          // return await existingDocument.save();
          return existingDocument
            .save()
            .then((savedDocument) => {
              console.log(
                "Document saved successfully:",
                savedDocument.main_user_notification.furniture_notifications[0]
                  .child_notification.saved.list
              );
              return true;
            })
            .catch((error) => {
              console.error("Error saving document:", error);
            });
        } else {
          // Category doesn't exist, add new category with saved list data
          console.log("here------------------>1473");
          existingDocument.main_user_notification.furniture_notifications.push({
            category_id: categoryId,
            child_notification: {
              saved:
                dataToUpdate.main_user_notification.furniture_notifications
                  .child_notification.saved,
            },
          });

          console.log("here------------------>1361");
          // Save the updated document
          const updatedDocument = await existingDocument.save();
          return updatedDocument;
        }
      } else {
        // Create a new document
        console.log("here------------------>1368");
        const newDocument = new NotificationCountModel(dataToUpdate);
        return await newDocument.save();
      }
    } catch (error) {
      throw error;
    }
  },

  async createOrUpdateNotificationCount(
    profileId,
    categoryId,
    dataToUpdate,
    notificationType
  ) {
    try {
      let existingDocument = await NotificationCountModel.findOne({
        profile_id: profileId,
      });
      const handleNotificationCounts = () => {
        if (existingDocument) {
          if (
            existingDocument.main_user_notification.furniture_notifications
              ?.length > 0
          ) {
            existingDocument.main_user_notification.furniture_notifications.forEach(
              (item, index) => {
                const id1 = new ObjectId(item.category_id);
                const id2 = new ObjectId(categoryId);
                if (id1.equals(id2)) {
                  if (item?.child_notification?.favourite?.list?.length > 0) {
                    item?.child_notification?.favourite?.list?.forEach(
                      (listItem, listIndex) => {
                        const id1 = new ObjectId(listItem.category_id);
                        const id2 = new ObjectId(
                          dataToUpdate.main_user_notification.furniture_notifications.child_notification[
                            notificationType
                          ].list.category_id
                        );
                        if (id1.equals(id2)) {
                          if (notificationType !== "favourite") {
                            existingDocument.main_user_notification.furniture_notifications[
                              index
                            ].child_notification?.favourite?.list.splice(
                              listIndex,
                              1
                            );

                            existingDocument.main_user_notification.notification_count =
                              existingDocument.main_user_notification
                                .notification_count - 1;

                            existingDocument.main_user_notification.furniture_notifications[
                              index
                            ].notification_count =
                              existingDocument.main_user_notification
                                .furniture_notifications[index]
                                .notification_count - 1;

                            existingDocument.main_user_notification.furniture_notifications[
                              index
                            ].child_notification.favourite.notification_count =
                              existingDocument.main_user_notification
                                .furniture_notifications[index]
                                .child_notification.favourite
                                .notification_count - 1;
                          }
                        }
                      }
                    );
                  }
                  if (item?.child_notification?.purchased?.list?.length > 0) {
                    item?.child_notification?.purchased?.list?.forEach(
                      (listItem, listIndex) => {
                        const id1 = new ObjectId(listItem.category_id);
                        const id2 = new ObjectId(
                          dataToUpdate.main_user_notification.furniture_notifications.child_notification[
                            notificationType
                          ].list.category_id
                        );
                        if (id1.equals(id2)) {
                          if (notificationType !== "purchased") {
                            existingDocument.main_user_notification.furniture_notifications[
                              index
                            ].child_notification?.purchased?.list.splice(
                              listIndex,
                              1
                            );

                            existingDocument.main_user_notification.notification_count =
                              existingDocument.main_user_notification
                                .notification_count - 1;

                            existingDocument.main_user_notification.furniture_notifications[
                              index
                            ].notification_count =
                              existingDocument.main_user_notification
                                .furniture_notifications[index]
                                .notification_count - 1;

                            existingDocument.main_user_notification.furniture_notifications[
                              index
                            ].child_notification.purchased.notification_count =
                              existingDocument.main_user_notification
                                .furniture_notifications[index]
                                .child_notification.purchased
                                .notification_count - 1;
                          }
                        }
                      }
                    );
                  }
                  if (item?.child_notification?.saved?.list?.length > 0) {
                    item?.child_notification?.saved?.list?.forEach(
                      (listItem, listIndex) => {
                        const id1 = new ObjectId(listItem.category_id);
                        const id2 = new ObjectId(
                          dataToUpdate.main_user_notification.furniture_notifications.child_notification[
                            notificationType
                          ].list.category_id
                        );
                        if (id1.equals(id2)) {
                          if (notificationType !== "saved") {
                            existingDocument.main_user_notification.furniture_notifications[
                              index
                            ].child_notification?.saved?.list.splice(
                              listIndex,
                              1
                            );

                            existingDocument.main_user_notification.notification_count =
                              existingDocument.main_user_notification
                                .notification_count - 1;

                            existingDocument.main_user_notification.furniture_notifications[
                              index
                            ].notification_count =
                              existingDocument.main_user_notification
                                .furniture_notifications[index]
                                .notification_count - 1;

                            existingDocument.main_user_notification.furniture_notifications[
                              index
                            ].child_notification.saved.notification_count =
                              existingDocument.main_user_notification
                                .furniture_notifications[index]
                                .child_notification.saved.notification_count -
                              1;
                          }
                        }
                      }
                    );
                  }
                }
              }
            );
          }
        }
      };

      if (notificationType == "purchased") {
        if (existingDocument) {
          const categoryToUpdate =
            dataToUpdate.main_user_notification.furniture_notifications;

          // Check if the category ID exists in the existing document
          let categoryIndex =
            existingDocument.main_user_notification.furniture_notifications.findIndex(
              (notification) => notification.category_id === categoryId
            );

          console.log(
            "dataToUpdate----->1405",
            dataToUpdate.main_user_notification.furniture_notifications
              .child_notification
          );
          console.log("categoryToUpdate----->1409", categoryToUpdate);
          console.log("categoryIndex----->1410", categoryIndex);

          if (categoryIndex !== -1) {
            // Category exists, update existing data
            const existingSavedList =
              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].child_notification?.purchased?.list;

            if (existingSavedList) {
              // update saved.notification_count
              existingDocument.main_user_notification.notification_count =
                dataToUpdate.main_user_notification.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].notification_count =
                dataToUpdate.main_user_notification.furniture_notifications.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].child_notification.purchased.notification_count =
                dataToUpdate.main_user_notification.furniture_notifications.child_notification.purchased.notification_count;

              const newDataList =
                categoryToUpdate.child_notification.purchased.list;

              console.log("existingSavedList----->1427", existingSavedList);
              console.log("newDataList----->", newDataList);

              // Update existing items or add new items to saved list
              const existingItemIndex =
                existingSavedList &&
                existingSavedList.findIndex(
                  (existingItem) =>
                    existingItem.category_id === newDataList.category_id
                );
              console.log("existingItemIndex----->1467", existingItemIndex);

              if (existingItemIndex !== -1) {
                console.log("here----->1439_________________________");
                // Existing item found, update it
                existingSavedList[existingItemIndex].notification_count =
                  newDataList.notification_count;
              } else {
                console.log("here----->1443");
                // Existing item not found, add it to the list
                existingSavedList.push(newDataList);
                // existingDocument.main_user_notification.furniture_notifications[
                //   categoryIndex
                // ].child_notification.purchased.list.push(newDataList);
              }

              console.log("existingDocument---->1478", existingDocument);

              handleNotificationCounts();

              // Update the document
              await existingDocument.save();
            } else {
              // update furniture_notifications.notification_count
              existingDocument.main_user_notification.notification_count =
                dataToUpdate.main_user_notification.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].notification_count =
                dataToUpdate.main_user_notification.furniture_notifications.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].child_notification.purchased =
                dataToUpdate.main_user_notification.furniture_notifications.child_notification.purchased;
              handleNotificationCounts();
              await existingDocument.save();
            }
          } else {
            console.log("here---->1498");

            // Category doesn't exist, add new category with saved list data
            const filter = { profile_id: profileId };
            const update = {
              $addToSet: {
                "main_user_notification.furniture_notifications":
                  categoryToUpdate,
              },
              $set: {
                "main_user_notification.notification_count":
                  dataToUpdate.main_user_notification.notification_count,
              },
            };
            await NotificationCountModel.updateOne(filter, update);
          }
        } else {
          // Create a new document
          const newDocument = new NotificationCountModel(dataToUpdate);
          await newDocument.save();
        }
      } else if (notificationType == "favourite") {
        if (existingDocument) {
          const categoryToUpdate =
            dataToUpdate.main_user_notification.furniture_notifications;

          // Check if the category ID exists in the existing document
          let categoryIndex =
            existingDocument.main_user_notification.furniture_notifications.findIndex(
              (notification) => {
                const id1 = new ObjectId(notification.category_id);
                const id2 = new ObjectId(categoryId);
                return id1.equals(id2);
              }
            );

          console.log(
            "categoryId-******************************1529",
            categoryId
          );

          console.log(
            "details-******************************1521",
            existingDocument.main_user_notification.furniture_notifications
          );
          console.log(
            "categoryIndex-******************************1521",
            categoryIndex
          );

          // console.log(
          //   "dataToUpdate----->",
          //   dataToUpdate.main_user_notification.furniture_notifications
          //     .child_notification.saved.list
          // );
          // console.log("categoryToUpdate----->", categoryToUpdate);
          // console.log("categoryIndex----->", categoryIndex);

          if (categoryIndex !== -1) {
            console.log("here --------------> 1498");
            // Category exists, update existing data
            let existingSavedList =
              existingDocument?.main_user_notification?.furniture_notifications[
                categoryIndex
              ]?.child_notification?.favourite?.list;

            console.log("existingSavedList--->", existingSavedList);

            if (existingSavedList) {
              // update saved.notification_count
              existingDocument.main_user_notification.notification_count =
                dataToUpdate.main_user_notification.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].notification_count =
                dataToUpdate.main_user_notification.furniture_notifications.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].child_notification.favourite.notification_count =
                dataToUpdate.main_user_notification.furniture_notifications.child_notification.favourite.notification_count;

              const newDataList =
                categoryToUpdate.child_notification.favourite.list;
              console.log("newDataList----->", newDataList);
              console.log("existingSavedList---->", existingSavedList);

              // Update existing items or add new items to saved list
              const existingItemIndex =
                existingSavedList &&
                existingSavedList?.findIndex(
                  (existingItem) =>
                    existingItem.category_id === newDataList.category_id
                );
              console.log("existingItemIndex----->1467", existingItemIndex);

              if (existingItemIndex !== -1) {
                console.log(
                  "here----------------------------------------------------- 1557"
                );

                // Existing item found, update it
                existingSavedList[existingItemIndex].notification_count =
                  newDataList.notification_count;
              } else {
                console.log(
                  "here-----------------------------------------------------1565"
                );
                // Existing item not found, add it to the list
                existingSavedList.push(newDataList);
                // existingSavedList =
                //   existingDocument?.main_user_notification?.furniture_notifications[
                //     categoryIndex
                //   ]?.child_notification?.favourite.list.push(newDataList);

                // existingDocument?.main_user_notification?.furniture_notifications[
                //   categoryIndex
                // ]?.child_notification?.favourite?.list.push(newDataList);
              }

              console.log("existingDocument---->1478", existingDocument);
              handleNotificationCounts();
              // Update the document
              await existingDocument.save();
            } else {
              // update furniture_notifications.notification_count
              existingDocument.main_user_notification.notification_count =
                dataToUpdate.main_user_notification.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].notification_count =
                dataToUpdate.main_user_notification.furniture_notifications.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].child_notification.favourite =
                dataToUpdate.main_user_notification.furniture_notifications.child_notification.favourite;
              handleNotificationCounts();
              await existingDocument.save();
            }
          } else {
            console.log("here---->1498");

            // Category doesn't exist, add new category with saved list data
            const filter = { profile_id: profileId };
            const update = {
              $addToSet: {
                "main_user_notification.furniture_notifications":
                  categoryToUpdate,
              },
              $set: {
                "main_user_notification.notification_count":
                  dataToUpdate.main_user_notification.notification_count,
              },
            };
            await NotificationCountModel.updateOne(filter, update);
          }
        } else {
          console.log(
            "dataToUpdate---->1551",
            dataToUpdate.main_user_notification.furniture_notifications
              .child_notification.favourite
          );
          // Create a new document
          const newDocument = new NotificationCountModel(dataToUpdate);
          await newDocument.save();
        }
      } else if (notificationType == "saved") {
        if (existingDocument) {
          const categoryToUpdate =
            dataToUpdate.main_user_notification.furniture_notifications;
          console.log(
            "dataToUpdate----->1578",
            dataToUpdate.main_user_notification.furniture_notifications
              .child_notification
          );
          console.log(
            "categoryToUpdate---->1578",
            categoryToUpdate?.notification_count
          );

          // Check if the category ID exists in the existing document
          let categoryIndex =
            existingDocument.main_user_notification.furniture_notifications.findIndex(
              (notification) => notification.category_id === categoryId
            );
          console.log("categoryIndex----->", categoryIndex);

          if (categoryIndex !== -1) {
            // Category exists, update existing data
            console.log(
              "existingSavedList----> 1603",
              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].child_notification
            );
            const existingSavedList =
              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].child_notification?.saved?.list;

            console.log("existingSavedList---->1606", existingSavedList);

            if (existingSavedList) {
              // update furniture_notifications.notification_count
              existingDocument.main_user_notification.notification_count =
                dataToUpdate.main_user_notification.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].notification_count =
                dataToUpdate.main_user_notification.furniture_notifications.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].child_notification.saved.notification_count =
                dataToUpdate.main_user_notification.furniture_notifications.child_notification.saved.notification_count;

              const newDataList =
                categoryToUpdate.child_notification.saved.list;
              console.log("newDataList----->", newDataList);

              // Update existing items or add new items to saved list
              const existingItemIndex =
                existingSavedList &&
                existingSavedList.findIndex(
                  (existingItem) =>
                    existingItem.category_id === newDataList.category_id
                );
              console.log("existingItemIndex----->1467", existingItemIndex);
              console.log("existingSavedList---->", existingSavedList);

              if (existingItemIndex !== -1) {
                // Existing item found, update it
                existingSavedList[existingItemIndex].notification_count =
                  newDataList.notification_count;
              } else {
                // Existing item not found, add it to the list
                existingSavedList.push(newDataList);
              }

              console.log("existingDocument---->1478", existingDocument);
              handleNotificationCounts();

              // Update the document
              await existingDocument.save();
            } else {
              // update furniture_notifications.notification_count
              existingDocument.main_user_notification.notification_count =
                dataToUpdate.main_user_notification.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].notification_count =
                dataToUpdate.main_user_notification.furniture_notifications.notification_count;

              existingDocument.main_user_notification.furniture_notifications[
                categoryIndex
              ].child_notification.saved =
                dataToUpdate.main_user_notification.furniture_notifications.child_notification.saved;

              handleNotificationCounts();
              await existingDocument.save();
            }
          } else {
            console.log("here---->1498");

            // Category doesn't exist, add new category with saved list data
            const filter = { profile_id: profileId };
            const update = {
              $addToSet: {
                "main_user_notification.furniture_notifications":
                  categoryToUpdate,
              },
              $set: {
                "main_user_notification.notification_count":
                  dataToUpdate.main_user_notification.notification_count,
              },
            };
            await NotificationCountModel.updateOne(filter, update);
          }
        } else {
          // Create a new document
          const newDocument = new NotificationCountModel(dataToUpdate);
          await newDocument.save();
        }
      }
    } catch (error) {
      throw error;
    }
  },
};

module.exports = UserService;
