/**
 * scaleService.js
 *
 * All scale APIs.
 */
const { ObjectId } = require("mongodb");
const ScaleModel = require("../schema/scale.schema");
const UserModel = require("../schema/user.schema");
const { printConsole } = require("../../Utils/commonFile");

const scaleService = {
  async getScaleItemForLoginBasedOnSubcription(data, subscription, user_id) {
    try {
      return UserModel.aggregate([
        {
          $match: {
            _id: new ObjectId(user_id),
            subcription: subscription,
          },
        },
        {
          $lookup: {
            from: "scales", // Collection name of the second model
            localField: "_id",
            // pipeline: [
            //     {
            //         $match: {
            //             shopping_category_id: new ObjectId(data.shopping_category_id),
            //             is_completed: data.is_completed == 'true' ? true : false
            //         }
            //     }
            // ],
            pipeline: [
              {
                $match: {
                  profile_id: new ObjectId(data.profile_id),
                  user_id: new ObjectId(user_id),
                },
              },
            ],
            foreignField: "user_id",
            as: "scaleList",
          },
        },
        {
          $project: {
            _id: 1,
            scaleList: 1,
          },
        },
      ]);
    } catch (error) {
      throw error;
    }
  },
  async getScaleItemForLoginBasedOnSubcriptionAndScaleId(
    data,
    subscription,
    user_id
  ) {
    try {
      return UserModel.aggregate([
        {
          $match: {
            _id: new ObjectId(user_id),
            subcription: subscription,
          },
        },
        {
          $lookup: {
            from: "scales", // Collection name of the second model
            localField: "_id",
            // pipeline: [
            //     {
            //         $match: {
            //             shopping_category_id: new ObjectId(data.shopping_category_id),
            //             is_completed: data.is_completed == 'true' ? true : false
            //         }
            //     }
            // ],
            pipeline: [
              {
                $match: {
                  _id: new ObjectId(data.scale_id),
                  profile_id: new ObjectId(data.profile_id),
                  user_id: new ObjectId(user_id),
                },
              },
            ],
            foreignField: "user_id",
            as: "scaleList",
          },
        },
        {
          $project: {
            _id: 1,
            scaleList: 1,
          },
        },
      ]);
    } catch (error) {
      throw error;
    }
  },

  async addScaleMeasurements(data) {
    try {
      return ScaleModel.create(data);
    } catch (error) {
      throw error;
    }
  },

  async updateScaleList(data, userId) {
    try {
      return ScaleModel.findByIdAndUpdate(
        {
          _id: new ObjectId(data.scale_id),
          user_id: new ObjectId(userId),
          profile_id: new ObjectId(data.profile_id),
        },
        {
          title: data.title,
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteScaleDetails(data, user_id) {
    try {
      return ScaleModel.findByIdAndDelete({
        _id: new ObjectId(data.scale_id),
        user_id: new ObjectId(user_id),
        profile_id: new ObjectId(data.profile_id),
      });
    } catch (error) {
      throw error;
    }
  },

  //   async getListOfScale(data) {
  //       try {
  //           return ScaleModel.aggregate([
  //               {
  //                   $match: {
  //                       user_id: new ObjectId(data.user_id)
  //                   }
  //               }
  //           ]);
  //       } catch (error) {
  //           throw error;
  //       }
  //   }

  async getListOfScale(data, user_id) {
    try {
      const currentPage = parseInt(data.current_page, 10) || 1; // Default to page 1 if not provided
      const limit = parseInt(data.limit, 10) || 5; // Default limit if not provided

      const skip = (currentPage - 1) * limit;

      const [totalCount, result] = await Promise.all([
        ScaleModel.countDocuments({
          user_id: new ObjectId(user_id),
          profile_id: new ObjectId(data.profile_id),
        }),
        ScaleModel.aggregate([
          {
            $match: {
              user_id: new ObjectId(user_id),
              profile_id: new ObjectId(data.profile_id),
            },
          },
          {
            $sort: {
              created_dt: -1, // Sort by 'created_dt' in descending order
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              _id: 1,
              title: 1,
              user_id: 1,
              profile_id: 1,
              created_dt: 1,
            },
          },
        ]),
      ]);

      const totalScaleItems = totalCount;
      const totalPages = Math.ceil(totalScaleItems / limit);

      return {
        scale_items: result,
        total_scale_items: totalScaleItems,
        total_pages: totalPages,
        current_page: currentPage,
      };
    } catch (error) {
      throw error;
    }
  },

  async addScaleMeasurement({ scale_id, measurements }) {
    try {
      const updatedScaleMeasurements = await ScaleModel.findByIdAndUpdate(
        { _id: new ObjectId(scale_id) },
        {
          $push: {
            measurements: measurements,
          },
          // updated_dt: Date.now(),
        },
        { new: true }
      );

      if (!updatedScaleMeasurements) {
        throw new Error("Scale not found");
      }

      return updatedScaleMeasurements;
    } catch (error) {
      throw error;
    }
  },

  async updateScaleMeasurement({ scale_id, measurement_id, measurements }) {
    try {
      const updatedScaleMeasurements = await ScaleModel.findOneAndUpdate(
        {
          _id: new ObjectId(scale_id),
          "measurements._id": measurement_id,
        },
        {
          $set: {
            "measurements.$.title": measurements.title,
            "measurements.$.value": measurements.value,
            // updated_dt: Date.now(),
          },
        },
        { new: true }
      );

      if (!updatedScaleMeasurements) {
        throw new Error("Scale or measurement not found");
      }

      return updatedScaleMeasurements;
    } catch (error) {
      throw error;
    }
  },

  async deleteScaleMeasurement({ scale_id, measurement_id }) {
    try {
      const updatedScale = await ScaleModel.findByIdAndUpdate(
        { _id: new ObjectId(scale_id) },
        {
          $pull: {
            measurements: { _id: measurement_id },
          },
          // updated_dt: Date.now(),
        },
        { new: true }
      );

      if (!updatedScale) {
        throw new Error("Scale not found");
      }

      return updatedScale;
    } catch (error) {
      throw error;
    }
  },

  async getScaleMeasurements({ scale_id }) {
    try {
      const scale = await ScaleModel.findById(scale_id);

      if (!scale) {
        throw new Error("Scale measurements not found");
      }

      const measurements = scale.measurements || [];

      return measurements;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = scaleService;
