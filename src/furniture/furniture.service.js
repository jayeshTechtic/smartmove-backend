/**
 * furnitureService.js
 *
 * All furniture APIs.
 */
const { ObjectId } = require("mongodb");
const FurnitureModel = require("../schema/furniture.schema");
const FurnitureCategoryModel = require("../schema/furnitureCategory.schema");
const UserModel = require("../schema/user.schema");
const adminService = require("../admin/adminService");
const fs = require("fs");
const {
  translateTheText,
  getUserbyProfileId,
} = require("../../Utils/commonFile");

const furnitureService = {
  async getFurnitureDataBasedOnSubcription(data, subcription) {
    try {
      const userData = await UserModel.aggregate([
        {
          $match: {
            _id: new ObjectId(data.user_id),
            subcription: subcription,
          },
        },
      ]);
      // console.log(userData)
      if (userData.length > 0 && userData[0]._id) {
        return await FurnitureModel.find({
          user_id: new ObjectId(userData[0]._id),
          furniture_category_id: data.furniture_category_id,
          profile_id: new ObjectId(data.profile_id),
        });
      } else {
        return await FurnitureModel.find({
          user_id: new ObjectId(data.user_id),
          furniture_category_id: data.furniture_category_id,
          profile_id: new ObjectId(data.profile_id),
        });
      }
    } catch (error) {
      throw error;
    }
  },

  async addMoreFurnitureOfTheUser(data) {
    try {
      return FurnitureModel.create(data);
    } catch (error) {
      throw error;
    }
  },

  async updateFurnitureOfTheUser(data) {
    try {
      return await FurnitureModel.findByIdAndUpdate(
        {
          _id: data.furniture_id,
          user_id: data.user_id,
        },
        {
          furniture_title: data.furniture_title,
          furniture_link: data.furniture_link,
          price: data.price,
          breadth: data.breadth,
          length: data.length,
          height: data.height,
          is_marked_favourite: data.is_marked_favourite,
          is_purchased: data.is_purchased,
          furniture_category_id: data.furniture_category_id,
          updated_dt: Date.now(),
        },
        {
          new: true,
          // runValidators: true
        }
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteFurnitureOfTheUser(data) {
    try {
      return FurnitureModel.findByIdAndDelete({
        _id: data.furniture_id,
        user_id: data.user_id,
        profile_id: data.profile_id,
      });
    } catch (error) {
      throw error;
    }
  },

  // async getListOfFurniture(data, query) {
  //   try {
  //     let queryData = [];
  //     query.limit = query.limit ? parseInt(query.limit) : 10;
  //     // Match stage for filtering based on user_id and task_title
  //     let matchStage = {
  //       $match: {
  //         furniture_category_id: new ObjectId(query.furniture_category_id),
  //         user_id: new ObjectId(data.user_id),
  //         is_purchased: false,
  //         is_marked_favourite: false,
  //       },
  //     };

  //     if (query.filter) {
  //       matchStage.$match.$or = [
  //         { furniture_title: query.filter },
  //         { furniture_link: query.filter },
  //         { price: query.filter },
  //         { breadth: query.filter },
  //         { height: query.filter },
  //         { length: query.filter },
  //       ];
  //     }

  //     queryData.push(matchStage);

  //     // Meta data
  //     queryData.push({
  //       $facet: {
  //         metadata: [
  //           { $count: "total" },
  //           {
  //             $addFields: {
  //               page: {
  //                 $ceil: {
  //                   $divide: ["$total", query.limit],
  //                 },
  //               },
  //               currentPage: parseInt(query.current_page),
  //             },
  //           },
  //         ],
  //         data: [
  //           { $skip: (parseInt(query.current_page) - 1) * query.limit },
  //           { $limit: query.limit },
  //         ],
  //       },
  //     });

  //     return await FurnitureModel.aggregate(queryData);
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  // async getListOfFurniture(data, query) {
  //   try {
  //     let queryData = [];
  //     query.limit = query.limit ? parseInt(query.limit) : 10;

  //     // Match stage for filtering based on user_id and task_title
  //     let matchStage = {
  //       $match: {
  //         furniture_category_id: new ObjectId(query.furniture_category_id),
  //         user_id: new ObjectId(data.user_id),
  //         is_purchased: false,
  //         is_marked_favourite: false,
  //       },
  //     };

  //     if (query.filter) {
  //       matchStage.$match.$or = [
  //         { furniture_title: query.filter },
  //         { furniture_link: query.filter },
  //         { price: query.filter },
  //         { breadth: query.filter },
  //         { height: query.filter },
  //         { length: query.filter },
  //       ];
  //     }

  //     queryData.push(matchStage);

  //     // Add $sort stage to sort by the newest date
  //     queryData.push({ $sort: { created_dt: -1 } });

  //     // Meta data
  //     queryData.push({
  //       $facet: {
  //         metadata: [
  //           { $count: "total" },
  //           {
  //             $addFields: {
  //               page: {
  //                 $ceil: {
  //                   $divide: ["$total", query.limit],
  //                 },
  //               },
  //               currentPage: parseInt(query.current_page),
  //             },
  //           },
  //         ],
  //         data: [
  //           { $skip: (parseInt(query.current_page) - 1) * query.limit },
  //           { $limit: query.limit },
  //         ],
  //       },
  //     });

  //     return await FurnitureModel.aggregate(queryData);
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async getListOfFurniture(query) {
    try {
      let userData = await getUserbyProfileId(query.profile_id);
      const filter = {
        furniture_category_id: new ObjectId(query.furniture_category_id),
        user_id: new ObjectId(userData._id),
        is_purchased: false,
        is_marked_favourite: false,
        profile_id: new ObjectId(query.profile_id),
      };

      if (query.filter) {
        filter.$or = [
          { furniture_title: { $regex: query.filter, $options: "i" } },
          { furniture_link: { $regex: query.filter, $options: "i" } },
          { price: { $regex: query.filter, $options: "i" } },
          { breadth: { $regex: query.filter, $options: "i" } },
          { height: { $regex: query.filter, $options: "i" } },
          { length: { $regex: query.filter, $options: "i" } },
        ];
      }

      const total = await FurnitureModel.countDocuments(filter);

      const dataResult = await FurnitureModel.find(filter)
        .sort({ created_dt: -1, _id: -1 })
        .skip((parseInt(query.current_page) - 1) * query.limit)
        .limit(query.limit);

      const totalPages = Math.ceil(total / query.limit);

      return {
        metadata: {
          total,
          page: totalPages,
          currentPage: parseInt(query.current_page),
        },
        data: dataResult,
      };
    } catch (error) {
      throw error;
    }
  },

  async updateFurnitureasFav(data, userId) {
    try {
      return FurnitureModel.findByIdAndUpdate(
        {
          _id: data.furniture_id,
          user_id: userId,
        },
        {
          is_marked_favourite: data.is_marked_favourite,
          is_purchased: !data.is_marked_favourite,
          updated_dt: Date.now(),
        },
        {
          new: true,
        }
      );
    } catch (error) {
      throw error;
    }
  },

  async updateFurnitureaspurchased(data, userId) {
    try {
      return FurnitureModel.findByIdAndUpdate(
        {
          _id: data.furniture_id,
          user_id: userId,
        },
        {
          is_marked_favourite: !data.is_purchased,
          is_purchased: data.is_purchased,
          updated_dt: Date.now(),
        },
        {
          new: true,
        }
      );
    } catch (error) {
      throw error;
    }
  },

  //   async getPurchasedFurnitureList(data) {
  //     try {
  //       return FurnitureModel.aggregate([
  //         {
  //           $match: {
  //             user_id: new ObjectId(data.user_id),
  //             is_purchased: true,
  //             furniture_category_id: new ObjectId(data.furniture_category_id),
  //           },
  //         },
  //         {
  //           $group: {
  //             _id: "$furniture_category_id", // Group by user_id
  //             total_price: { $sum: { $toDouble: "$price" } },
  //             furniture_list: { $push: "$$ROOT" },
  //           },
  //         },
  //       ]);
  //     } catch (error) {
  //       throw error;
  //     }
  //   },

  // async getPurchasedFurnitureList(data) {
  //   try {
  //     const currentPage = parseInt(data.current_page, 10) || 1; // Default to page 1 if not provided
  //     const limit = parseInt(data.limit, 10) || 5; // Default limit if not provided

  //     const skip = (currentPage - 1) * limit;

  //     const [totalCount, result] = await Promise.all([
  //       FurnitureModel.countDocuments({
  //         user_id: new ObjectId(data.user_id),
  //         is_purchased: true,
  //         furniture_category_id: new ObjectId(data.furniture_category_id),
  //       }),
  //       FurnitureModel.aggregate([
  //         {
  //           $match: {
  //             user_id: new ObjectId(data.user_id),
  //             is_purchased: true,
  //             furniture_category_id: new ObjectId(data.furniture_category_id),
  //           },
  //         },
  //         {
  //           $skip: skip,
  //         },
  //         {
  //           $limit: limit,
  //         },
  //       ]),
  //     ]);

  //     const totalPurchasedItems = totalCount;
  //     const totalPages = Math.ceil(totalPurchasedItems / limit);

  //     let total_price = 0;
  //     result &&
  //       result.length > 0 &&
  //       result.forEach((item) => {
  //         if (Number(item?.price)) {
  //           total_price = Number(total_price) + Number(item?.price);
  //         }
  //       });

  //     return {
  //       furniture_list: result,
  //       total_price,
  //       total_purchased_items: totalPurchasedItems,
  //       total_pages: totalPages,
  //       current_page: currentPage,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async getPurchasedFurnitureList(data, user_id) {
    try {
      const currentPage = parseInt(data.current_page, 10) || 1; // Default to page 1 if not provided
      const limit = parseInt(data.limit, 10) || 5; // Default limit if not provided

      const skip = (currentPage - 1) * limit;

      const [totalCount, result] = await Promise.all([
        FurnitureModel.countDocuments({
          user_id: new ObjectId(user_id),
          is_purchased: true,
          furniture_category_id: new ObjectId(data.furniture_category_id),
        }),
        FurnitureModel.aggregate([
          {
            $match: {
              user_id: new ObjectId(user_id),
              is_purchased: true,
              furniture_category_id: new ObjectId(data.furniture_category_id),
            },
          },
          {
            $sort: { created_dt: -1, _id: -1 },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ]),
      ]);

      const totalPurchasedItems = totalCount;
      const totalPages = Math.ceil(totalPurchasedItems / limit);

      let total_price = 0;
      result &&
        result.length > 0 &&
        result.forEach((item) => {
          if (Number(item?.price)) {
            total_price = Number(total_price) + Number(item?.price);
          }
        });

      return {
        furniture_list: result,
        total_price,
        total_purchased_items: totalPurchasedItems,
        total_pages: totalPages,
        current_page: currentPage,
      };
    } catch (error) {
      throw error;
    }
  },

  // async getfavFurnitureList(data) {
  //     try {
  //         return FurnitureModel.find(
  //             {
  //                 user_id: data.user_id,
  //                 is_marked_favourite: true,
  //                 furniture_category_id: data.furniture_category_id
  //             })
  //     } catch (error) {
  //         throw error;
  //     }
  // },

  // async getfavFurnitureList(data) {
  //   try {
  //     const currentPage = parseInt(data.current_page, 10) || 1; // Default to page 1 if not provided
  //     const limit = parseInt(data.limit, 10) || 5; // Default limit if not provided

  //     const skip = (currentPage - 1) * limit;

  //     const [totalCount, result] = await Promise.all([
  //       FurnitureModel.countDocuments({
  //         user_id: data.user_id,
  //         is_marked_favourite: true,
  //         furniture_category_id: data.furniture_category_id,
  //       }),
  //       FurnitureModel.find({
  //         user_id: data.user_id,
  //         is_marked_favourite: true,
  //         furniture_category_id: data.furniture_category_id,
  //       })
  //         .skip(skip)
  //         .limit(limit),
  //     ]);

  //     const totalFurnitureItems = totalCount;
  //     const totalPages = Math.ceil(totalFurnitureItems / limit);

  //     return {
  //       furniture_list: result,
  //       total_furniture_items: totalFurnitureItems,
  //       total_pages: totalPages,
  //       current_page: currentPage,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async getfavFurnitureList(data) {
    try {
      const currentPage = parseInt(data.current_page, 10) || 1; // Default to page 1 if not provided
      const limit = parseInt(data.limit, 10) || 5; // Default limit if not provided

      const skip = (currentPage - 1) * limit;

      let userData = await getUserbyProfileId(data.profile_id);

      const [totalCount, result] = await Promise.all([
        FurnitureModel.countDocuments({
          user_id: userData._id,
          is_marked_favourite: true,
          furniture_category_id: data.furniture_category_id,
        }),
        FurnitureModel.find({
          user_id: userData._id,
          is_marked_favourite: true,
          furniture_category_id: data.furniture_category_id,
        })
          .sort({ created_dt: -1, _id: -1 })
          .skip(skip)
          .limit(limit),
      ]);

      const totalFurnitureItems = totalCount;
      const totalPages = Math.ceil(totalFurnitureItems / limit);

      return {
        furniture_list: result,
        total_furniture_items: totalFurnitureItems,
        total_pages: totalPages,
        current_page: currentPage,
      };
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

  async updateFurnitureCatOfTheUser(data, userId) {
    try {
      const filePath = await FurnitureCategoryModel.findOne(
        { _id: data.furniture_category_id },
        { _id: 0, furniture_category_image: 1 }
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
        { _id: data.furniture_category_id },
        {
          furniture_category_image: data.furniture_category_image,
          furniture_category_name: data.furniture_category_name,
          furniture_image_mime_type: data.furniture_image_mime_type,
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteFurnitureCategory(data, userId) {
    try {
      const filePath = await FurnitureCategoryModel.findOne(
        { _id: data.furniture_category_id },
        { _id: 0, furniture_category_image: 1 }
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
        user_id: userId,
      });
    } catch (error) {
      throw error;
    }
  },

  // async getFurnitureCategory(userId) {
  //   try {
  //     const userData = await FurnitureCategoryModel.find({ user_id: userId });
  //     const adminData = await adminService.getFurnitureCategory();
  //     const data = {
  //       adminData,
  //       userData,
  //     };
  //     return data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async getFurnitureCategory(userId, profile_id) {
    try {
      const userData = await FurnitureCategoryModel.find({
        user_id: userId,
        profile_id: profile_id,
      }).sort({ created_dt: -1 });

      const adminData = await adminService.getFurnitureCategory();

      if (adminData && adminData.length > 0) {
        const modifiedAdmindata = await Promise.all(
          adminData.map(async (item) => {
            const translatedFurnitureCategory = await translateTheText(
              item.furniture_category_name
            );
            return {
              ...item,
              furniture_category_name: translatedFurnitureCategory,
            };
          })
        );

        // const data = {
        //   adminData: modifiedAdmindata,
        //   userData,
        // };

        // return data;
        return [...modifiedAdmindata, ...userData];
      }

      // return {
      //   adminData: [],
      //   userData,
      // };
      return userData;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = furnitureService;
