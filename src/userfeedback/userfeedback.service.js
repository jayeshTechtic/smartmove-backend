/**
 * adminService.js
 *
 * All Admin APIs.
 */
const { ObjectId } = require("mongodb");
const UserFeedbackModel = require("../schema/userFeedback.schema");

const accountingService = {
  async addUserFeedback(data) {
    try {
      const payload = {
        ...data,
        is_feedback_provided: true,
      };
      return UserFeedbackModel.create(payload);
    } catch (error) {
      throw error;
    }
  },
  async getUserFeedback(user_id) {
    try {
      const feedbackData = await UserFeedbackModel.findOne({
        user_id: new ObjectId(user_id),
      }).lean();

      let response = {
        is_feedback: false,
      };

      if (feedbackData && feedbackData.is_feedback_provided) {
        response.is_feedback = true;

        if (feedbackData.user_feedback) {
          response.user_feedback = feedbackData.user_feedback;
        } else {
          response.user_feedback = "";
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = accountingService;
