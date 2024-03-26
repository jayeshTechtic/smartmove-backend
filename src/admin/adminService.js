/**
 * adminService.js
 *
 * All Admin APIs.
 */
const { sendMail, sortedObj } = require("../../Utils/commonFile");
const path = require("path");
const UserModel = require("../schema/user.schema");
const CategoryModel = require("../schema/category.schema");
const FurnitureCategoryModel = require("../schema/furnitureCategory.schema");
const ShoppingCategoryModel = require("../schema/shoppingCategory.schema");
const TermsConditionAndPrivacyPolicyModel = require("../schema/terms&ConditionAndPrivacyPolicy.schema");
const fs = require("fs");
var randomize = require("randomatic");
const schedule = require("node-schedule");
const { ObjectId } = require("mongodb");
const FurnitureModel = require("../schema/furniture.schema");
const moment = require("moment/moment");
const InteractionModel = require("../schema/interaction.schema");
const SubscriptionModel = require("../schema/subscription.schema");
const url = require("url");
const AccessModel = require("../schema/accesses.schema");
const { statusCode } = require("../../Utils/const");
const TermsAndConditionModel = require("../schema/terms&Condition.schema");
const PrivacyPolicyModel = require("../schema/privacyPolicy.schema");
const LanguageModel = require("../schema/language.schema");

const adminService = {
  async invalidLoginCredentialsNotification(data) {
    try {
      let forgotPasswordLink = path.join(__dirname, `forgot_password`);
      let html = `
            <h3>Dear ${data.first_name} ${data.last_name},</h3>
            <p>We hope this email finds you well.</p>
            <p>It appears that there was an attempt to log in to your account with an incorrect password. For security reasons, we wanted to inform you of this activity.</p>
            <p>If you were the one attempting to log in and encountered issues, please double-check your password for accuracy. If you have forgotten your password, you can reset it by clicking on the "Forgot Password" link on the login page.</p>
            <p>If you did not attempt to log in, we recommend taking the following steps:</p>
            <ul>
                <li>Change your password immediately by visiting <a href=${forgotPasswordLink}>${forgotPasswordLink}</a>.</li>
                <li>Enable two-factor authentication for an added layer of security.</li>
            </ul>
            <p>If you have any concerns or questions, please do not hesitate to contact our support team at <a href = "mailto: support@smartmove.com">support@smartmove.com</a></p>
            <p>Thank you for your attention to this matter, and we apologize for any inconvenience.</p>
            <h4>Thanks,</h4>
            <p>Smart Move Team</p>
            `;
      return await sendMail(data.email, "Account Security Notification", html);
    } catch (error) {
      throw error;
    }
  },

  async forgotPassowrdEmail(data) {
    try {
      const reset_token = randomize("Aa0", 30);
      const resetTokenExpiry = Date.now() + 3600000;
      await UserModel.findByIdAndUpdate(
        {_id: data._id},
        {reset_token: reset_token, reset_token_expiry: resetTokenExpiry}
      );
      data.reset_password_url = path.join(
        process.env.RESET_PASSWORD_LINK,
        `?reset_password_token=${reset_token}`
      );

      let html = `
            <h3>Hi ${data.first_name} ${data.last_name}</h3>
            <p>You received this email because we received a password
            reset request for your account. The below link will get expired in an hour.</p>
            <p>Your new password Link
            <a href="${data.reset_password_url}">Click here..</a></p>
            <h4>Thanks,</h4>
            <p>Smart Move Team</p>
            `;
      await sendMail(data.email, "Forgot Password", html);
      // Schedule the next execution after a minute
      schedule.scheduleJob(new Date(Date.now() + 3600000), async () => {
        printConsole("expiring the reset password token after an hour");
        await UserModel.findByIdAndUpdate(
          {_id: data._id},
          {reset_token: null, reset_token_expiry: null}
        );
      });
      return true;
    } catch (error) {
      throw error;
    }
  },

  async verifyUserProfile(data) {
    try {
      return UserModel.findByIdAndUpdate(
        {_id: data.user_id},
        {is_verified: true, status: "active"}
      );
    } catch (error) {
      throw error;
    }
  },

  async verifySubUserProfile(data) {
    try {
      return UserModel.findByIdAndUpdate(
        {_id: data.user_id},
        {is_verified: true, status: "active"}
      );
    } catch (error) {
      throw error;
    }
  },

  async verifyAdminUserProfile(data) {
    try {
      return UserModel.findByIdAndUpdate(
        {_id: data.user_id},
        {is_verified: true, status: "active"}
      );
    } catch (error) {
      throw error;
    }
  },

  //   async getListofUser(whereQuery, query = {}) {
  //       try {
  //           query.limit = query.limit ? parseInt(query.limit) : 10;
  //           let userData = await UserModel.find(whereQuery, { password: 0, salt: 0 })
  //               .skip((parseInt(query.current_page) - 1) * query.limit)
  //               .limit(query.limit);
  //           let totalUsers = await UserModel.countDocuments(whereQuery);
  //           let totalPages = Math.ceil(totalUsers / query.limit);
  //           return {
  //               data: userData,
  //               metadata: {
  //                   total: totalUsers,
  //                   page: totalPages,
  //                   currentPage: parseInt(query.current_page)
  //               }
  //           };
  //       } catch (error) {
  //           throw error;
  //       }
  //   },

  async updateAdminUserData(data) {
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
      email: data.email,
    };
    if (data.password) {
      (payload.salt = data.salt), (payload.password = data.password);
    }
    return UserModel.findByIdAndUpdate(
      {_id: data._id},
      {$set: payload},
      {new: true}
    );
  },

  async getListOfUserById(whereQuery) {
    try {
      const userData = await UserModel.findById(whereQuery, {
        password: 0,
        salt: 0,
      });
      return {
        data: userData,
      };
    } catch (error) {
      throw error;
    }
  },

  async deleteUser(whereQuery) {
    try {
      const userData = await UserModel.findByIdAndDelete(whereQuery, {
        password: 0,
        salt: 0,
      });
      return {
        data: userData,
      };
    } catch (error) {
      throw error;
    }
  },

  async getListofSubAdminUser(query) {
    try {
      let queryData = [];
      query.limit = query.limit ? parseInt(query.limit) : 10;

      let matchStage = {
        $match: {
          user_type: "sub-admin",
        },
      };
      queryData.push(matchStage);

      queryData.push({
        $project: {
          password: 0,
          salt: 0,
        },
      });

      queryData.push({
        $sort: {
          created_dt: -1,
        },
      });

      queryData.push({
        $facet: {
          metadata: [
            {$count: "total"},
            {
              $addFields: {
                page: {
                  $ceil: {
                    $divide: ["$total", query.limit],
                  },
                },
                currentPage: parseInt(query.current_page),
              },
            },
          ],
          data: [
            {$skip: (parseInt(query.current_page) - 1) * query.limit},
            {$limit: query.limit},
          ],
        },
      });

      return await UserModel.aggregate(queryData);
    } catch (error) {
      throw error;
    }
  },

  async getListofUser(query) {
    try {
      let queryData = [];
      query.limit = query.limit ? parseInt(query.limit) : 10;

      // Match stage
      let matchStage = {
        $match: {
          user_type: "user",
        },
      };

      // Filter stage
      if (query.filter) {
        matchStage.$match.$or = [
          {email: {$regex: new RegExp(query.filter, "i")}},
          {country: {$regex: new RegExp(query.filter, "i")}},
        ];
      }
      queryData.push(matchStage);
      // Year filter
      if (query.year) {
        const yearMatchStage = {
          $match: {
            created_dt: {
              $gte: new Date(`${query.year}-01-01`),
              $lt: new Date(`${query.year}-12-31T23:59:59`),
            },
          },
        };
        queryData.push(yearMatchStage);
      }

      // Today filter
      if (query.today) {
        const todayMatchStage = {
          $match: {
            created_dt: {
              $gte: new Date(query.today),
              $lt: new Date(new Date(query.today).setHours(23, 59, 59)),
            },
          },
        };
        queryData.push(todayMatchStage);
      }

      // start date end date between filter
      if (query.startDate || query.endDate) {
        const dateMatchStage = {
          $match: {
            created_dt: {},
          },
        };
        if (query.startDate && query.endDate) {
          dateMatchStage.$match.created_dt.$gte = new Date(query.startDate);
          dateMatchStage.$match.created_dt.$lt = new Date(
            new Date(query.endDate).setHours(23, 59, 59)
          );
        } else if (query.startDate) {
          dateMatchStage.$match.created_dt.$gte = new Date(query.startDate);
        } else if (query.endDate) {
          dateMatchStage.$match.created_dt.$lt = new Date(
            new Date(query.endDate).setHours(23, 59, 59)
          );
        }
        queryData.push(dateMatchStage);
      }

      // Status match stage
      if (query.status) {
        let statusMatchStage;
        if (query.status.toLowerCase() === "inactive") {
          statusMatchStage = {
            $match: {
              status: "inactive",
            },
          };
        } else if (query.status.toLowerCase() === "active") {
          statusMatchStage = {
            $match: {
              status: "active",
            },
          };
        } else if (query.status.toLowerCase() === "blocked") {
          statusMatchStage = {
            $match: {
              status: "blocked",
            },
          };
        } else if (query.status.toLowerCase() === "newuser") {
          const latestMonthMatchStage = {
            $match: {
              created_dt: {
                $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000),
                $lt: new Date(),
              },
            },
          };
          queryData.push(latestMonthMatchStage);
        }
        if (statusMatchStage) {
          queryData.push(statusMatchStage);
        }
      }

      // Projection stage
      queryData.push({
        $project: {
          password: 0,
          salt: 0,
        },
      });

      // Sorting stage (by createdAt field in descending order)
      queryData.push({
        $sort: {
          created_dt: -1,
        },
      });

      // Pagination stage
      queryData.push({
        $facet: {
          metadata: [
            {$count: "total"},
            {
              $addFields: {
                page: {
                  $ceil: {
                    $divide: ["$total", query.limit],
                  },
                },
                currentPage: parseInt(query.current_page),
              },
            },
          ],
          data: [
            {$skip: (parseInt(query.current_page) - 1) * query.limit},
            {$limit: query.limit},
          ],
        },
      });

      return await UserModel.aggregate(queryData);
    } catch (error) {
      throw error;
    }
  },

  async removeTheParticularUser(whereQuery) {
    try {
      return UserModel.findByIdAndUpdate(whereQuery, {status: "inactive"});
    } catch (error) {
      throw error;
    }
  },

  async blockedTheParticularUser(whereQuery) {
    try {
      return UserModel.findByIdAndUpdate(whereQuery, {status: "blocked"});
    } catch (error) {
      throw error;
    }
  },

  async unblockedTheParticularUser(whereQuery) {
    try {
      return UserModel.findByIdAndUpdate(whereQuery, {status: "active"});
    } catch (error) {
      throw error;
    }
  },

  async addCategories(data) {
    try {
      return CategoryModel.create(data);
    } catch (error) {
      throw error;
    }
  },

  async updateCategory(data) {
    try {
      return CategoryModel.findByIdAndUpdate(
        {_id: data.category_id},
        {category_name: data.category_name},
        {new: true}
      );
    } catch (error) {
      throw error;
    }
  },

  async updateUserList(data) {
    try {
      const response = await UserModel.findByIdAndUpdate(
        data._id,
        {
          $set: {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            dob: data.dob,
            country: data.country,
            region: data.region,
            language: data.language,
          },
        },
        {
          new: true,
        }
      );
      console.log("temp", response);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async deleteCategory(data) {
    try {
      return CategoryModel.findByIdAndDelete(
        {_id: data.category_id},
        {new: true}
      );
    } catch (error) {
      throw error;
    }
  },

  async addFurnitureOfTheUser(data) {
    try {
      return FurnitureCategoryModel.create(data);
    } catch (error) {
      throw error;
    }
  },

  async updateFurnitureOfTheUser(data) {
    try {
      const filePath = await FurnitureCategoryModel.findOne(
        {_id: data.furniture_category_id},
        {_id: 0, furniture_category_image: 1}
      );

      // Use fs.unlink to delete the file
      fs.unlink(filePath.furniture_category_image, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err.message}`);
        } else {
          console.log(`File ${filePath} deleted successfully`);
        }
      });
      return FurnitureCategoryModel.findByIdAndUpdate(
        {_id: data.furniture_category_id},
        {
          furniture_category_image: data.furniture_category_image,
          furniture_category_name: data.furniture_category_name,
          furniture_image_mime_type: data.furniture_image_mime_type,
        },
        {new: true}
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteFurnitureCategory(data) {
    try {
      const filePath = await FurnitureCategoryModel.findOne(
        {_id: data.furniture_category_id},
        {_id: 0, furniture_category_image: 1}
      );

      // Use fs.unlink to delete the file
      fs.unlink(filePath.furniture_category_image, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err.message}`);
        } else {
          console.log(`File ${filePath} deleted successfully`);
        }
      });
      return FurnitureCategoryModel.findByIdAndDelete({
        _id: data.furniture_category_id,
      });
    } catch (error) {
      throw error;
    }
  },

  async getFurnitureCategory() {
    try {
      return FurnitureCategoryModel.find({user_id: null})
        .sort({created_dt: -1})
        .lean();
    } catch (error) {
      throw error;
    }
  },

  async findUserByEmail(email) {
    try {
      const userEmails = UserModel.find({email});
      return userEmails;
    } catch (error) {
      throw error;
    }
  },

  async addShoppingOfTheUser(data) {
    try {
      return ShoppingCategoryModel.create(data);
    } catch (error) {
      throw error;
    }
  },

  async updateShoppingOfTheUser(data) {
    try {
      const filePath = await ShoppingCategoryModel.findOne(
        {_id: data.shopping_category_id},
        {_id: 0, shopping_category_image: 1}
      );

      // Use fs.unlink to delete the file
      fs.unlink(filePath.shopping_category_image, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err.message}`);
        } else {
          console.log(`File ${filePath} deleted successfully`);
        }
      });
      return ShoppingCategoryModel.findByIdAndUpdate(
        {_id: data.shopping_category_id},
        {
          shopping_category_image: data.shopping_category_image,
          shopping_category_name: data.shopping_category_name,
          shopping_image_mime_type: data.shopping_image_mime_type,
        },
        {new: true}
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteShoppingCategory(data) {
    try {
      const filePath = await ShoppingCategoryModel.findOne(
        {_id: data.shopping_category_id},
        {_id: 0, shopping_category_image: 1}
      );

      // Use fs.unlink to delete the file
      fs.unlink(filePath.shopping_category_image, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err.message}`);
        } else {
          console.log(`File ${filePath} deleted successfully`);
        }
      });
      return await ShoppingCategoryModel.findByIdAndDelete({
        _id: data.shopping_category_id,
      });
    } catch (error) {
      throw error;
    }
  },

  async getShoppingCategory() {
    try {
      return ShoppingCategoryModel.find({user_id: null});
    } catch (error) {
      throw error;
    }
  },

  async addTermsConditionAndPrivacyPolicy(data) {
    try {
      const existingData = await TermsConditionAndPrivacyPolicyModel.findOne({
        language_id: new ObjectId(data.language_id),
      });
      if (!existingData) {
        return await TermsConditionAndPrivacyPolicyModel.create(data);
      } else if (existingData?._id) {
        data.terms_id = existingData._id;

        return await TermsConditionAndPrivacyPolicyModel.findByIdAndUpdate(
          {
            _id: new ObjectId(data.terms_id),
            language_id: new ObjectId(data.language_id),
          },
          {
            terms_and_condition: data.terms_and_condition,
            privacy_policy: data.privacy_policy,
          },
          {new: true}
        );
      }
    } catch (error) {
      throw error;
    }
  },

  async addTermsAndCondition(data) {
    try {
      const existingData = await TermsAndConditionModel.findOne({
        language_id: new ObjectId(data.language_id),
      });
      if (!existingData) {
        return await TermsAndConditionModel.create(data);
      } else if (existingData?._id) {
        data.terms_id = existingData._id;

        return await TermsAndConditionModel.findByIdAndUpdate(
          {
            _id: new ObjectId(data.terms_id),
            language_id: new ObjectId(data.language_id),
          },
          {
            terms_and_condition: data.terms_and_condition,
          },
          {new: true}
        );
      }
    } catch (error) {
      throw error;
    }
  },

  async addPrivacyPolicy(data) {
    try {
      const existingData = await PrivacyPolicyModel.findOne({
        language_id: new ObjectId(data.language_id),
      });
      if (!existingData) {
        return await PrivacyPolicyModel.create(data);
      } else if (existingData?._id) {
        data.policy_id = existingData._id;

        return await PrivacyPolicyModel.findByIdAndUpdate(
          {
            _id: new ObjectId(data.policy_id),
            language_id: new ObjectId(data.language_id),
          },
          {
            privacy_policy: data.privacy_policy,
          },
          {new: true}
        );
      }
    } catch (error) {
      throw error;
    }
  },

  async getAnalytics(query) {
    try {
      let users = await UserModel.find();
      let furnitureData = await FurnitureModel.find();
      let interactionsData = await InteractionModel.find();
      const languagesData = await LanguageModel.find();

      const languageNames = {};
      languagesData.forEach(lang => {
        languageNames[lang.language_short_form] = lang.language_name;
      });

      const languageCount = {};
      const countryCount = {};
      const regionCount = {};
      const furnitureCount = {};
      const interactionCount = {};

      let login_user = 0;
      let website_details = [];

      let currentUsers = [];
      if (!query?.duration || query?.duration === "total") {
        currentUsers = [...users];
        furnitureData.length > 0 &&
          furnitureData.forEach((item) => {
            const furnitureTitle = item.furniture_title;
            furnitureCount[furnitureTitle] = (furnitureCount[furnitureTitle] || 0) + 1;

            if (item?.furniture_link) {
              if (item.furniture_link.startsWith('www')) {
                item.furniture_link = 'https://' + item.furniture_link;
              }
              const parsedUrl = url.parse(item.furniture_link);
              const domain = parsedUrl && parsedUrl.hostname?.split(".")[1]; // Extracting the second part of the hostname
              if (domain) {
                const existingSite = website_details.find(site => site.name === domain);
                if (existingSite) {
                  existingSite.count++;
                } else {
                  website_details.push({ name: domain, count: 1 });
                }
              }
            }
          });

        interactionsData.length > 0 &&
          interactionsData.forEach((item) => {
            if (item?.item) {
              const interActionItem = item?.item;
              interactionCount[interActionItem] = (interactionCount[interActionItem] || 0) + 1;
            }
          });
      } else if (query?.duration && query?.duration === "today") {
        users?.length > 0 &&
          users.forEach((user) => {
            const formattedUserDate = moment(user.created_dt).format(
              "YYYY-MM-DD"
            );
            const todaysFormatteUserdDate = moment().format("YYYY-MM-DD");
            if (
              moment(todaysFormatteUserdDate).isSame(moment(formattedUserDate))
            ) {
              currentUsers.push(user);
            }
          });

        furnitureData.length > 0 &&
          furnitureData.forEach((item) => {
            const formattedfurnitureDate = moment(item.created_dt).format(
              "YYYY-MM-DD"
            );
            const todaysFormattefurnituredDate = moment().format("YYYY-MM-DD");
            if (
              moment(todaysFormattefurnituredDate).isSame(
                moment(formattedfurnitureDate)
              )
            ) {
              const furnitureTitle = item.furniture_title;
              furnitureCount[furnitureTitle] = (furnitureCount[furnitureTitle] || 0) + 1;
              if (item?.furniture_link) {
                if (item.furniture_link.startsWith('www')) {
                  item.furniture_link = 'https://' + item.furniture_link;
                }
                const parsedUrl = url.parse(item.furniture_link);
                const domain = parsedUrl && parsedUrl.hostname?.split(".")[1]; // Extracting the second part of the hostname
                if (domain) {
                  const existingSite = website_details.find(site => site.name === domain);
                  if (existingSite) {
                    existingSite.count++;
                  } else {
                    website_details.push({ name: domain, count: 1 });
                  }
                }
              }
            }
          });

        interactionsData.length > 0 &&
          interactionsData.forEach((item) => {
            const formattedInteractionDate = moment(item.created_dt).format(
              "YYYY-MM-DD"
            );
            const todaysFormatteInteractiondDate =
              moment().format("YYYY-MM-DD");
            if (
              moment(todaysFormatteInteractiondDate).isSame(
                moment(formattedInteractionDate)
              )
            ) {
              if (item?.item) {
                const interActionItem = item?.item;
                interactionCount[interActionItem] = (interactionCount[interActionItem] || 0) + 1;
              }
            }
          });
      } else if (query?.duration) {
        users?.length > 0 &&
          users.forEach((user) => {
            const formattedUserYear = moment(user.created_dt).format("YYYY");
            const currentFormatteUserdYear = moment(query?.duration).format(
              "YYYY"
            );
            if (
              moment(currentFormatteUserdYear).isSame(moment(formattedUserYear))
            ) {
              currentUsers.push(user);
            }
          });

        furnitureData.length > 0 &&
          furnitureData.forEach((item) => {
            const formattedfurnitureDate = moment(item.created_dt).format(
              "YYYY"
            );
            const currentFormattefurnituredDate = moment(
              query?.duration
            ).format("YYYY");
            if (
              moment(currentFormattefurnituredDate).isSame(
                moment(formattedfurnitureDate)
              )
            ) {
              const furnitureTitle = item.furniture_title;
              furnitureCount[furnitureTitle] = (furnitureCount[furnitureTitle] || 0) + 1;
              if (item?.furniture_link) {
                if (item.furniture_link.startsWith('www')) {
                  item.furniture_link = 'https://' + item.furniture_link;
                }
                const parsedUrl = url.parse(item.furniture_link);
                const domain = parsedUrl && parsedUrl.hostname?.split(".")[1]; // Extracting the second part of the hostname
                if (domain) {
                  const existingSite = website_details.find(site => site.name === domain);
                  if (existingSite) {
                    existingSite.count++;
                  } else {
                    website_details.push({ name: domain, count: 1 });
                  }
                }
              }
            }
          });

        interactionsData.length > 0 &&
          interactionsData.forEach((item) => {
            const formattedInteractionDate = moment(item.created_dt).format(
              "YYYY"
            );
            const currentFormatteInteractiondDate = moment(
              query?.duration
            ).format("YYYY");
            if (
              moment(currentFormatteInteractiondDate).isSame(
                moment(formattedInteractionDate)
              )
            ) {
              if (item?.item) {
                const interActionItem = item?.item;
                interactionCount[interActionItem] = (interactionCount[interActionItem] || 0) + 1;
              }
            }
          });
      }
      // start date - end date
      if (query?.startDate && query?.endDate) {
        currentUsers = [];

        users?.length > 0 &&
          users.forEach((user) => {
            const formattedDate = moment(user.created_dt).format("YYYY-MM-DD");
            if (
              moment(formattedDate).isSameOrAfter(moment(query?.startDate)) &&
              moment(formattedDate).isSameOrBefore(moment(query?.endDate))
            ) {
              currentUsers.push(user);
            }
          });

        sofa = 0;
        bett = 0;
        wardrobe = 0;

        furnitureData.length > 0 &&
          furnitureData.forEach((item) => {
            const formattedDate = moment(item.created_dt).format("YYYY-MM-DD");
            if (
              moment(formattedDate).isSameOrAfter(moment(query?.startDate)) &&
              moment(formattedDate).isSameOrBefore(moment(query?.endDate))
            ) {
              const furnitureTitle = item.furniture_title;
              furnitureCount[furnitureTitle] = (furnitureCount[furnitureTitle] || 0) + 1;
              if (item?.furniture_link) {
                if (item.furniture_link.startsWith('www')) {
                  item.furniture_link = 'https://' + item.furniture_link;
                }
                const parsedUrl = url.parse(item.furniture_link);
                const domain = parsedUrl && parsedUrl.hostname?.split(".")[1]; // Extracting the second part of the hostname
                if (domain) {
                  const existingSite = website_details.find(site => site.name === domain);
                  if (existingSite) {
                    existingSite.count++;
                  } else {
                    website_details.push({ name: domain, count: 1 });
                  }
                }
              }
            }
          });

        interactionsData.length > 0 &&
          interactionsData.forEach((item) => {
            const formattedDate = moment(item.created_dt).format("YYYY-MM-DD");
            if (
              moment(formattedDate).isSameOrAfter(moment(query?.startDate)) &&
              moment(formattedDate).isSameOrBefore(moment(query?.endDate))
            ) {
              if (item?.item) {
                const interActionItem = item?.item;
                interactionCount[interActionItem] = (interactionCount[interActionItem] || 0) + 1;
              }
            }
          });
      }

      let android_user = 0;
      let apple_user = 0;
      let co_user = 0;
      let new_user = 0;
      let active_users = 0;
      let deleted_user = 0;

      currentUsers?.forEach((item) => {
        const userCreatedAt = moment(item.created_dt);
        const oneMonthAgo = moment().subtract(1, "month");
        const isDateWithinLastMonth = userCreatedAt.isAfter(oneMonthAgo);

        // new user
        if (isDateWithinLastMonth) {
          new_user = new_user + 1;
        }
        // android_user || apple_user
        item?.device?.length > 0 &&
          item?.device?.forEach((device) => {
            if (device?.type == "android") {
              android_user = android_user + 1;
            } else if (device?.type == "ios") {
              apple_user = apple_user + 1;
            }
          });

        // active_users
        if (item?.status === "active") {
          active_users = active_users + 1;
        }
        // deleted_user
        if (Boolean(item?.is_deleted)) {
          deleted_user = deleted_user + 1;
        }
        // co-user
        if (Boolean(item?.is_user_invited)) {
          co_user = co_user + 1;
        }

        // Count languages
        if (item?.language) {
          // Get language name from mapping
          const languageName = languageNames[item?.language] || item?.language;
          languageCount[languageName] = (languageCount[languageName] || 0) + 1;
        }

        // Count countries
        if (item?.country) {
          countryCount[item.country] = (countryCount[item.country] || 0) + 1;
        }

        // Count regions
        if (item?.region) {
          regionCount[item.region] = (regionCount[item.region] || 0) + 1;
        }
      });

      const usersBirthYear = await UserModel.aggregate([
        {
          $match: {
            dob: {$exists: true},
          },
        },
        {
          $addFields: {
            birth_date: {
              $toDate: "$dob",
            },
          },
        },
        {
          $match: {
            birth_date: {$exists: true, $type: "date"},
          },
        },
        {
          $group: {
            _id: {$year: "$birth_date"},
            users: {$sum: 1},
          },
        },
        {
          $sort: {users: -1},
        },
        {
          $project: {
            _id: 0,
            year: "$_id",
            users: 1,
          },
        },
        {
          $sort: {year: 1},
        },
      ]);

      return {
        users: sortedObj({
          total_users: currentUsers?.length,
          apple_user,
          android_user,
          active_users,
          deleted_user,
          co_user,
          login_user,
          new_user,
        }),
        languages: sortedObj(languageCount),
        interactions: sortedObj(interactionCount),
        furniture: sortedObj(furnitureCount),
        country: sortedObj(countryCount),
        region: sortedObj(regionCount),
        usersBirthYear: usersBirthYear.sort((a, b) => b.users - a.users),
        website_details: website_details.sort((a, b) => b.count - a.count),
      };
    } catch (error) {
      throw error;
    }
  },

  // async getAnalytics(query) {
  //   try {
  //     let users = await UserModel.find();
  //     let furnitureData = await FurnitureModel.find();
  //     let interactionsData = await InteractionModel.find();

  //     let sofa = 0;
  //     let bett = 0;
  //     let wardrobe = 0;
  //     let login_user = 0;
  //     let website_details = [];
  //     let interactions = {
  //       furniture: 0,
  //       shoppingList: 0,
  //       calendar: 0,
  //       todo: 0,
  //       scale: 0,
  //       cardboardAndroomPlanner: 0,
  //       accounting: 0,
  //       planer3D: 0,
  //     };

  //     let currentUsers = [];
  //     if (!query?.duration || query?.duration === "total") {
  //       currentUsers = [...users];
  //       furnitureData.length > 0 &&
  //         furnitureData.forEach((item) => {
  //           if (item?.furniture_title == "sofa") {
  //             sofa = sofa + 1;
  //           }
  //           if (item?.furniture_title == "bett") {
  //             bett = bett + 1;
  //           }
  //           if (item?.furniture_title == "wardrobe") {
  //             wardrobe = wardrobe + 1;
  //           }
  //           if (item?.furniture_link) {
  //             const parsedUrl = url.parse(item?.furniture_link);
  //             const domain = parsedUrl && parsedUrl?.hostname?.split(".")[1]; // Extracting the second part of the hostname
  //             if (domain) {
  //               if (website_details?.length > 0) {
  //                 website_details.forEach((site) => {
  //                   if (site.name == domain) {
  //                     site.count = site.count + 1;
  //                   }
  //                 });
  //               } else {
  //                 website_details.push({
  //                   name: domain,
  //                   count: 1,
  //                 });
  //               }
  //             }
  //           }
  //         });

  //       interactionsData.length > 0 &&
  //         interactionsData.forEach((item) => {
  //           // login-user
  //           if (item?.item == "login") {
  //             login_user = login_user + 1;
  //           }
  //           if (item?.item == "furniture") {
  //             interactions.furniture = interactions.furniture + 1;
  //           }
  //           if (item?.item == "shoppingList") {
  //             interactions.shoppingList = interactions.shoppingList + 1;
  //           }
  //           if (item?.item == "calendar") {
  //             interactions.calendar = interactions.calendar + 1;
  //           }
  //           if (item?.item == "todo") {
  //             interactions.todo = interactions.todo + 1;
  //           }
  //           if (item?.item == "scale") {
  //             interactions.scale = interactions.scale + 1;
  //           }
  //           if (item?.item == "cardboardAndroomPlanner") {
  //             interactions.cardboardAndroomPlanner =
  //               interactions.cardboardAndroomPlanner + 1;
  //           }
  //           if (item?.item == "accounting") {
  //             interactions.accounting = interactions.accounting + 1;
  //           }
  //           if (item?.item == "planer3D") {
  //             interactions.planer3D = interactions.planer3D + 1;
  //           }
  //         });
  //     } else if (query?.duration && query?.duration === "today") {
  //       users?.length > 0 &&
  //         users.forEach((user) => {
  //           const formattedUserDate = moment(user.created_dt).format(
  //             "YYYY-MM-DD"
  //           );
  //           const todaysFormatteUserdDate = moment().format("YYYY-MM-DD");
  //           if (
  //             moment(todaysFormatteUserdDate).isSame(moment(formattedUserDate))
  //           ) {
  //             currentUsers.push(user);
  //           }
  //         });

  //       furnitureData.length > 0 &&
  //         furnitureData.forEach((item) => {
  //           const formattedfurnitureDate = moment(item.created_dt).format(
  //             "YYYY-MM-DD"
  //           );
  //           const todaysFormattefurnituredDate = moment().format("YYYY-MM-DD");
  //           if (
  //             moment(todaysFormattefurnituredDate).isSame(
  //               moment(formattedfurnitureDate)
  //             )
  //           ) {
  //             if (item?.furniture_title == "sofa") {
  //               sofa = sofa + 1;
  //             }
  //             if (item?.furniture_title == "bett") {
  //               bett = bett + 1;
  //             }
  //             if (item?.furniture_title == "wardrobe") {
  //               wardrobe = wardrobe + 1;
  //             }
  //             if (item?.furniture_link) {
  //               const parsedUrl = url.parse(item?.furniture_link);
  //               const domain = parsedUrl && parsedUrl?.hostname?.split(".")[1]; // Extracting the second part of the hostname
  //               if (domain) {
  //                 if (website_details?.length > 0) {
  //                   website_details.forEach((site) => {
  //                     if (site.name == domain) {
  //                       site.count = site.count + 1;
  //                     }
  //                   });
  //                 } else {
  //                   website_details.push({
  //                     name: domain,
  //                     count: 1,
  //                   });
  //                 }
  //               }
  //             }
  //           }
  //         });

  //       interactionsData.length > 0 &&
  //         interactionsData.forEach((item) => {
  //           const formattedInteractionDate = moment(item.created_dt).format(
  //             "YYYY-MM-DD"
  //           );
  //           const todaysFormatteInteractiondDate =
  //             moment().format("YYYY-MM-DD");
  //           if (
  //             moment(todaysFormatteInteractiondDate).isSame(
  //               moment(formattedInteractionDate)
  //             )
  //           ) {
  //             if (item?.item == "furniture") {
  //               interactions.furniture = interactions.furniture + 1;
  //             }
  //             if (item?.item == "shoppingList") {
  //               interactions.shoppingList = interactions.shoppingList + 1;
  //             }
  //             if (item?.item == "calendar") {
  //               interactions.calendar = interactions.calendar + 1;
  //             }
  //             if (item?.item == "todo") {
  //               interactions.todo = interactions.todo + 1;
  //             }
  //             if (item?.item == "scale") {
  //               interactions.scale = interactions.scale + 1;
  //             }
  //             if (item?.item == "cardboardAndroomPlanner") {
  //               interactions.cardboardAndroomPlanner =
  //                 interactions.cardboardAndroomPlanner + 1;
  //             }
  //             if (item?.item == "accounting") {
  //               interactions.accounting = interactions.accounting + 1;
  //             }
  //             if (item?.item == "planer3D") {
  //               interactions.planer3D = interactions.planer3D + 1;
  //             }
  //           }
  //         });
  //     } else if (query?.duration) {
  //       users?.length > 0 &&
  //         users.forEach((user) => {
  //           const formattedUserYear = moment(user.created_dt).format("YYYY");
  //           const currentFormatteUserdYear = moment(query?.duration).format(
  //             "YYYY"
  //           );
  //           if (
  //             moment(currentFormatteUserdYear).isSame(moment(formattedUserYear))
  //           ) {
  //             currentUsers.push(user);
  //           }
  //         });

  //       furnitureData.length > 0 &&
  //         furnitureData.forEach((item) => {
  //           const formattedfurnitureDate = moment(item.created_dt).format(
  //             "YYYY"
  //           );
  //           const currentFormattefurnituredDate = moment(
  //             query?.duration
  //           ).format("YYYY");
  //           if (
  //             moment(currentFormattefurnituredDate).isSame(
  //               moment(formattedfurnitureDate)
  //             )
  //           ) {
  //             if (item?.furniture_title == "sofa") {
  //               sofa = sofa + 1;
  //             }
  //             if (item?.furniture_title == "bett") {
  //               bett = bett + 1;
  //             }
  //             if (item?.furniture_title == "wardrobe") {
  //               wardrobe = wardrobe + 1;
  //             }
  //             if (item?.furniture_link) {
  //               const parsedUrl = url.parse(item?.furniture_link);
  //               const domain = parsedUrl && parsedUrl?.hostname?.split(".")[1]; // Extracting the second part of the hostname
  //               if (domain) {
  //                 if (website_details?.length > 0) {
  //                   website_details.forEach((site) => {
  //                     if (site.name == domain) {
  //                       site.count = site.count + 1;
  //                     }
  //                   });
  //                 } else {
  //                   website_details.push({
  //                     name: domain,
  //                     count: 1,
  //                   });
  //                 }
  //               }
  //             }
  //           }
  //         });

  //       interactionsData.length > 0 &&
  //         interactionsData.forEach((item) => {
  //           const formattedInteractionDate = moment(item.created_dt).format(
  //             "YYYY"
  //           );
  //           const currentFormatteInteractiondDate = moment(
  //             query?.duration
  //           ).format("YYYY");
  //           if (
  //             moment(currentFormatteInteractiondDate).isSame(
  //               moment(formattedInteractionDate)
  //             )
  //           ) {
  //             if (item?.item == "furniture") {
  //               interactions.furniture = interactions.furniture + 1;
  //             }
  //             if (item?.item == "shoppingList") {
  //               interactions.shoppingList = interactions.shoppingList + 1;
  //             }
  //             if (item?.item == "calendar") {
  //               interactions.calendar = interactions.calendar + 1;
  //             }
  //             if (item?.item == "todo") {
  //               interactions.todo = interactions.todo + 1;
  //             }
  //             if (item?.item == "scale") {
  //               interactions.scale = interactions.scale + 1;
  //             }
  //             if (item?.item == "cardboardAndroomPlanner") {
  //               interactions.cardboardAndroomPlanner =
  //                 interactions.cardboardAndroomPlanner + 1;
  //             }
  //             if (item?.item == "accounting") {
  //               interactions.accounting = interactions.accounting + 1;
  //             }
  //             if (item?.item == "planer3D") {
  //               interactions.planer3D = interactions.planer3D + 1;
  //             }
  //           }
  //         });
  //     }
  //     // start date - end date
  //     if (query?.startDate && query?.endDate) {
  //       currentUsers = [];

  //       users?.length > 0 &&
  //         users.forEach((user) => {
  //           const formattedDate = moment(user.created_dt).format("YYYY-MM-DD");
  //           if (
  //             moment(formattedDate).isSameOrAfter(moment(query?.startDate)) &&
  //             moment(formattedDate).isSameOrBefore(moment(query?.endDate))
  //           ) {
  //             currentUsers.push(user);
  //           }
  //         });

  //       sofa = 0;
  //       bett = 0;
  //       wardrobe = 0;

  //       furnitureData.length > 0 &&
  //         furnitureData.forEach((item) => {
  //           const formattedDate = moment(item.created_dt).format("YYYY-MM-DD");
  //           if (
  //             moment(formattedDate).isSameOrAfter(moment(query?.startDate)) &&
  //             moment(formattedDate).isSameOrBefore(moment(query?.endDate))
  //           ) {
  //             if (item?.furniture_title == "sofa") {
  //               sofa = sofa + 1;
  //             }
  //             if (item?.furniture_title == "bett") {
  //               bett = bett + 1;
  //             }
  //             if (item?.furniture_title == "wardrobe") {
  //               wardrobe = wardrobe + 1;
  //             }
  //             if (item?.furniture_link) {
  //               const parsedUrl = url.parse(item?.furniture_link);
  //               const domain = parsedUrl && parsedUrl?.hostname?.split(".")[1]; // Extracting the second part of the hostname
  //               if (domain) {
  //                 if (website_details?.length > 0) {
  //                   website_details.forEach((site) => {
  //                     if (site.name == domain) {
  //                       site.count = site.count + 1;
  //                     }
  //                   });
  //                 } else {
  //                   website_details.push({
  //                     name: domain,
  //                     count: 1,
  //                   });
  //                 }
  //               }
  //             }
  //           }
  //         });

  //       interactions = {
  //         furniture: 0,
  //         shoppingList: 0,
  //         calendar: 0,
  //         todo: 0,
  //         scale: 0,
  //         cardboardAndroomPlanner: 0,
  //         accounting: 0,
  //         planer3D: 0,
  //       };

  //       interactionsData.length > 0 &&
  //         interactionsData.forEach((item) => {
  //           const formattedDate = moment(item.created_dt).format("YYYY-MM-DD");
  //           if (
  //             moment(formattedDate).isSameOrAfter(moment(query?.startDate)) &&
  //             moment(formattedDate).isSameOrBefore(moment(query?.endDate))
  //           ) {
  //             if (item?.item == "furniture") {
  //               interactions.furniture = interactions.furniture + 1;
  //             }
  //             if (item?.item == "shoppingList") {
  //               interactions.shoppingList = interactions.shoppingList + 1;
  //             }
  //             if (item?.item == "calendar") {
  //               interactions.calendar = interactions.calendar + 1;
  //             }
  //             if (item?.item == "todo") {
  //               interactions.todo = interactions.todo + 1;
  //             }
  //             if (item?.item == "scale") {
  //               interactions.scale = interactions.scale + 1;
  //             }
  //             if (item?.item == "cardboardAndroomPlanner") {
  //               interactions.cardboardAndroomPlanner =
  //                 interactions.cardboardAndroomPlanner + 1;
  //             }
  //             if (item?.item == "accounting") {
  //               interactions.accounting = interactions.accounting + 1;
  //             }
  //             if (item?.item == "planer3D") {
  //               interactions.planer3D = interactions.planer3D + 1;
  //             }
  //           }
  //         });
  //     }

  //     let android_user = 0;
  //     let apple_user = 0;
  //     let co_user = 0;
  //     // let login_user = 0;
  //     let new_user = 0;
  //     let active_users = 0;
  //     let deleted_user = 0;
  //     let english = 0;
  //     let german = 0;
  //     let switzerlandBasedUsers = 0;
  //     let austriaBasedUsers = 0;
  //     let deutschlandBasedUsers = 0;

  //     currentUsers?.forEach((item) => {
  //       const userCreatedAt = moment(item.created_dt);
  //       const oneMonthAgo = moment().subtract(1, "month");
  //       const isDateWithinLastMonth = userCreatedAt.isAfter(oneMonthAgo);

  //       // new user
  //       if (isDateWithinLastMonth) {
  //         new_user = new_user + 1;
  //       }
  //       // android_user || apple_user
  //       item?.device?.length > 0 &&
  //         item?.device?.forEach((device) => {
  //           if (device?.type == "android") {
  //             android_user = android_user + 1;
  //           } else if (device?.type == "ios") {
  //             apple_user = apple_user + 1;
  //           }
  //         });

  //       // active_users
  //       if (item?.status === "active") {
  //         active_users = active_users + 1;
  //       }
  //       // deleted_user
  //       if (Boolean(item?.is_deleted)) {
  //         deleted_user = deleted_user + 1;
  //       }
  //       // co-user
  //       if (Boolean(item?.is_user_invited)) {
  //         co_user = co_user + 1;
  //       }
  //       // // login-user
  //       // if (Boolean(item?.is_loggedId)) {
  //       //   login_user = login_user + 1;
  //       // }

  //       // english language based user
  //       if (item?.language === "en") {
  //         english = english + 1;
  //       }
  //       // german language based user
  //       if (item?.language === "de") {
  //         german = german + 1;
  //       }

  //       // switzerland Based Users
  //       if (item?.country == "Switzerland") {
  //         switzerlandBasedUsers = switzerlandBasedUsers + 1;
  //       }
  //       // austria Based Users
  //       if (item?.country == "Austria") {
  //         austriaBasedUsers = austriaBasedUsers + 1;
  //       }
  //       // deutschland Based Users
  //       if (item?.country == "Deutschland") {
  //         deutschlandBasedUsers = deutschlandBasedUsers + 1;
  //       }
  //     });

  //     const usersBirthYear = await UserModel.aggregate([
  //       {
  //         $match: {
  //           dob: { $exists: true },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           birth_date: {
  //             $toDate: "$dob",
  //           },
  //         },
  //       },
  //       {
  //         $match: {
  //           birth_date: { $exists: true, $type: "date" },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: { $year: "$birth_date" },
  //           users: { $sum: 1 },
  //         },
  //       },
  //       {
  //         $sort: { users: -1 },
  //       },
  //       {
  //         $limit: 3,
  //       },
  //       {
  //         $project: {
  //           _id: 0,
  //           year: "$_id",
  //           users: 1,
  //         },
  //       },
  //       {
  //         $sort: { year: 1 },
  //       },
  //     ]);

  //     return {
  //       users: {
  //         total_users: currentUsers?.length,
  //         apple_user,
  //         android_user,
  //         active_users,
  //         deleted_user,
  //         co_user,
  //         login_user,
  //         new_user,
  //       },
  //       languages: {
  //         english,
  //         german,
  //       },
  //       interactions,
  //       furniture: {
  //         sofa: sofa,
  //         bett: bett,
  //         wardrobe: wardrobe,
  //       },
  //       country: {
  //         switzerland: switzerlandBasedUsers,
  //         austria: austriaBasedUsers,
  //         deutschland: deutschlandBasedUsers,
  //       },
  //       usersBirthYear,
  //       website_details,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async addSubscription(data) {
    try {
      return SubscriptionModel.create(data);
    } catch (error) {
      throw error;
    }
  },

  async getSubscriptions(language) {
    try {
      return await SubscriptionModel.find({
        language_code: language,
      });
    } catch (error) {
      throw error;
    }
  },

  async updateSubscription(planId, updatedData) {
    try {
      return SubscriptionModel.findByIdAndUpdate(planId, updatedData, {
        new: true,
      });
    } catch (error) {
      throw error;
    }
  },

  async deleteSubscription(data) {
    try {
      return SubscriptionModel.findByIdAndDelete({_id: data._id}, {new: true});
    } catch (error) {
      throw error;
    }
  },

  async getAccessSettings(query, user_type, user_id) {
    try {
      let queryData = [];
      if (user_type == "admin") {
        const data = await AccessModel.find().lean();
        return {
          status: 200,
          statusCode: statusCode.sucess,
          message: "Successfully got access settings",
          data: data,
        };
      } else if (user_type == "sub-admin") {
        const isUserHasAccess = await AccessModel.find({
          sub_admin_id: user_id,
          "accesses.users_and_access_settings.view": true,
        });
        if (isUserHasAccess.length > 0) {
          const data = await AccessModel.find();
          return {
            status: 200,
            statusCode: statusCode.sucess,
            message: "Successfully got access settings",
            data: data,
          };
        }
      }
      query.limit = query.limit ? parseInt(query.limit) : 10;
      queryData.push({
        $sort: {
          created_dt: -1,
        },
      });
      // Pagination stage
      queryData.push({
        $facet: {
          metadata: [
            {$count: "total"},
            {
              $addFields: {
                page: {
                  $ceil: {
                    $divide: ["$total", query.limit],
                  },
                },
                currentPage: parseInt(query.current_page),
              },
            },
          ],
          data: [
            {$skip: (parseInt(query.current_page) - 1) * query.limit},
            {$limit: query.limit},
          ],
        },
      });
      return await AccessModel.aggregate(queryData);
    } catch (error) {
      throw error;
    }
  },
  async updateAccessSettings(decoded, body) {
    try {
      if (decoded.user_type == "admin") {
        await AccessModel.findOneAndUpdate(
          {
            sub_admin_id: body.sub_admin_id,
          },
          {$set: {[`accesses.${body.feature}`]: body.permisions}},
          {new: true}
        );
        return {
          status: 200,
          statusCode: statusCode.sucess,
          message: "Successfully updated permission",
        };
      } else if (decoded.user_type == "sub-admin") {
        const isUserHasAccessToUpdate = await AccessModel.findOne({
          sub_admin_id: decoded.user_id,
          "accesses.users_and_access_settings.edit": true,
        }).lean();
        if (isUserHasAccessToUpdate) {
          const data = await AccessModel.findOneAndUpdate(
            {
              sub_admin_id: body.sub_admin_id,
            },
            {$set: {[`accesses.${body.feature}`]: body.permisions}},
            {new: true}
          );
          return {
            status: 200,
            statusCode: statusCode.sucess,
            message: "Successfully updated permission",
            data,
          };
        } else {
          return {
            status: 400,
            statusCode: statusCode.validation,
            message: "You don't have permission to perform this operation",
          };
        }
      }
    } catch (error) {
      throw error;
    }
  },
};

module.exports = adminService;
