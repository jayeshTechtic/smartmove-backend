/**
 * languageService.js
 *
 * All language APIs.
 */
const LanguageModel = require("../schema/language.schema");

const languageService = {
  async getListOflanguage() {
    try {
      return await LanguageModel.find().lean();
    } catch (error) {
      throw error;
    }
  },
  async addLanguage(data) {
    try {
      return LanguageModel.create(data);
    } catch (error) {
      throw error;
    }
  },
};

module.exports = languageService;
