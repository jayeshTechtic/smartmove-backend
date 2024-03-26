/**
 * scaleService.js
 *
 * All scale APIs.
 */
const { ObjectId } = require("mongodb");
const LanguageStringsModel = require("../schema/languageStrings.schema");
const UserModel = require("../schema/user.schema");
const LanguageModel = require("../schema/language.schema");

const languageStringsService = {
  async addLanguageStringsBasedOnSelectedLanguage(data) {
    try {
      return LanguageStringsModel.create(data);
    } catch (error) {
      throw error;
    }
  },

  async updateLanguageStringsBasedOnSelectedLanguage(data) {
    try {
      return LanguageStringsModel.findByIdAndUpdate(
        {
          _id: new ObjectId(data.language_string_id),
          user_id: new ObjectId(data.language_id),
        },
        data,
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteLanguageStringsBasedOnSelectedLanguage(data) {
    try {
      return LanguageStringsModel.findByIdAndDelete({
        _id: new ObjectId(data.language_string_id),
        user_id: new ObjectId(data.language_id),
      });
    } catch (error) {
      throw error;
    }
  },

  async getListOflanguageStrings(data) {
    try {
      if (data.user_id) {
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
                    from: "languagestrings", // Collection name of the second model
                    localField: "_id",
                    foreignField: "language_id",
                    as: "languageStrings",
                  },
                },
              ],
              foreignField: "language_short_form",
              as: "language",
            },
          },
          {
            $unwind: "$language",
          },
          // {
          //   $project: {
          //     _id: 0,
          //     language_string: "$language.languageStrings",
          //   },
          // },
          // {
          //   $unwind: "$language_string",
          // },
          {
            $project: {
              _id: 0,
              languageStrings: "$language.languageStrings",
            },
          },
          {
            $unwind: "$languageStrings",
          },
        ]);
      } else {
        return LanguageModel.aggregate([
          {
            $match: {
              language_short_form: "de",
            },
          },
          {
            $lookup: {
              from: "languagestrings", // Collection name of the second model
              localField: "_id",
              foreignField: "language_id",
              as: "languageStrings",
            },
          },
          {
            $unwind: "$languageStrings",
          },
        ]);
      }
    } catch (error) {
      throw error;
    }
  },
};

module.exports = languageStringsService;
