/**
 * shoppingService.js
 *
 * All shopping APIs.
 */
const { ObjectId } = require("mongodb");
const adminService = require("../admin/adminService");
const ShoppingCategoryModel = require("../schema/shoppingCategory.schema");
const ShoppingModel = require("../schema/shoppinglist.schema");
const UserModel = require("../schema/user.schema");
const { printConsole, translateTheText } = require("../../Utils/commonFile");

const shoppingService = {
  async addShoppingOfTheUser(data) {
    try {
      return ShoppingCategoryModel.create(data);
    } catch (error) {
      throw error;
    }
  },

  async updateShoppingOfTheUser(data, userId) {
    try {
      // const filePath = await ShoppingCategoryModel.findOne(
      //   { _id: data.shopping_category_id },
      //   { _id: 0, shopping_category_image: 1 }
      // );

      // // Use fs.unlink to delete the file
      // fs.unlink(filePath.shopping_category_image, (err) => {
      //   if (err) {
      //     printConsole(`Error deleting file: ${err.message}`);
      //   } else {
      //     printConsole(`File ${filePath} deleted successfully`);
      //   }
      // });
      return ShoppingCategoryModel.findByIdAndUpdate(
        { _id: data.shopping_category_id, user_id: userId },
        {
          shopping_category_name: data.shopping_category_name,
          // shopping_category_image: data.shopping_category_image,
          // shopping_image_mime_type: data.shopping_image_mime_type,
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteShoppingCategory(data, userId) {
    try {
      const filePath = await ShoppingCategoryModel.findOne(
        { _id: data.shopping_category_id },
        { _id: 0, shopping_category_image: 1 }
      );

      // Use fs.unlink to delete the file
      fs.unlink(filePath.shopping_category_image, (err) => {
        if (err) {
          printConsole(`Error deleting file: ${err.message}`);
        } else {
          printConsole(`File ${filePath} deleted successfully`);
        }
      });
      return ShoppingCategoryModel.findByIdAndDelete({
        _id: data.shopping_category_id,
        user_id: userId,
      });
    } catch (error) {
      throw error;
    }
  },

  // async getShoppingCategory() {
  //   try {
  //     return await ShoppingCategoryModel.find();
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async getShoppingCategory(user_id, profile_id) {
    try {
      // const shoppingCategory = await ShoppingCategoryModel.find()
      //   .sort({ created_dt: -1 })
      //   .lean();
      // const shoppingCategory = await ShoppingCategoryModel.find().lean();
      const shoppingCategory = await ShoppingCategoryModel.find({
        user_id: { $exists: false },
      }).lean();
      const userwiseShoppingCategory = await ShoppingCategoryModel.find({
        user_id,
        profile_id,
      }).lean();

      if (
        (shoppingCategory && shoppingCategory.length > 0) ||
        (userwiseShoppingCategory && userwiseShoppingCategory.length > 0)
      ) {
        let allShoppingCategorydata = [];
        const shoppingCategorydata = await Promise.all(
          shoppingCategory.map(async (item) => {
            const translatedShoppingCategorydata = await translateTheText(
              item.shopping_category_name
            );
            return {
              ...item,
              shopping_category_name: translatedShoppingCategorydata,
            };
          })
        );
        const userwiseShoppingCategoryData = await Promise.all(
          userwiseShoppingCategory.map(async (item) => {
            const translatedShoppingCategorydata = await translateTheText(
              item.shopping_category_name
            );
            return {
              ...item,
              shopping_category_name: translatedShoppingCategorydata,
            };
          })
        );
        // return shoppingCategorydata;
        allShoppingCategorydata = [
          ...shoppingCategorydata,
          ...userwiseShoppingCategoryData,
        ];
        return allShoppingCategorydata;
      }
      return;
    } catch (error) {
      throw error;
    }
  },

  async getShoppingItemForLoginBasedOnSubcription(data, subscription, user_id) {
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
            from: "shoppinglists", // Collection name of the second model
            localField: "_id",
            pipeline: [
              {
                $match: {
                  shopping_category_id: new ObjectId(data.shopping_category_id),
                  profile_id: new ObjectId(data.profile_id),
                  is_completed: data.is_completed == "true" ? true : false,
                },
              },
            ],
            foreignField: "user_id",
            as: "userShopping",
          },
        },
        {
          $project: {
            _id: 1,
            userShopping: 1,
          },
        },
      ]);
    } catch (error) {
      throw error;
    }
  },

  async addShoppingItems(data, count) {
    try {
      const shoppingText = data.shopping_item_name.split(", ");
      for (let i = 0; i < count; i++) {
        if (shoppingText[i]) {
          const shoppingData = {
            shopping_item_name: shoppingText[i],
            shopping_category_id: data.shopping_category_id,
            user_id: data.user_id,
            price: data.price,
            is_completed: data.is_completed,
            profile_id: data?.profile_id,
          };
          await ShoppingModel.create(shoppingData);
        }
      }
      return true;
    } catch (error) {
      throw error;
    }
  },

  async updateShoppingList(data) {
    try {
      return ShoppingModel.findByIdAndUpdate(
        {
          _id: data.shopping_item_id,
          user_id: data.user_id,
          profile_id: data.profile_id,
        },
        {
          shopping_item_name: data.shopping_item_name,
          shopping_category_id: data.shopping_category_id,
          price: data.price,
          is_completed: data.is_completed,
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteShoppingList(data, userId) {
    try {
      return ShoppingModel.findByIdAndDelete({
        _id: data.shopping_item_id,
        user_id: userId,
        profile_id: data.profile_id,
      });
    } catch (error) {
      throw error;
    }
  },

  // async getListOfShoppingItem(query) {
  //     try {
  //         let queryData = [];
  //         // let skip = 0;
  //         query.limit = query.limit ? parseInt(query.limit) : 10;

  //         // Match stage for filtering based on user_id and task_title
  //         let matchStage = {
  //             $match: {
  //                 shopping_category_id: new ObjectId(query.shopping_category_id),
  //                 user_id: new ObjectId(query.user_id)
  //             }
  //         };

  //         if (query.filter) {
  //             matchStage.$match.$or = [
  //                 { shopping_item_name: query.filter },
  //                 { is_completed: Boolean(query.filter) ? true : false }
  //             ];
  //         }

  //         queryData.push(matchStage);

  //         if (query.filter == 'true' || query.filter == true) {
  //             queryData.push({
  //                 $group: {
  //                     _id: "$shopping_category_id", // Group by user_id
  //                     total_price: { $sum: { $toDouble: "$price" } },
  //                     shopping_list: { $push: "$$ROOT" }
  //                 }
  //             })
  //         }

  //         // Meta data
  //         queryData.push({
  //             $facet: {
  //                 metadata: [
  //                     { $count: 'total' },
  //                     {
  //                         $addFields: {
  //                             page: {
  //                                 $ceil: {
  //                                     $divide: ['$total', query.limit],
  //                                 },
  //                             },
  //                             currentPage: parseInt(query.current_page)
  //                         },
  //                     },
  //                 ],
  //                 data: [
  //                     { $skip: (parseInt(query.current_page) - 1) * query.limit },
  //                     { $limit: query.limit },
  //                 ],
  //             },
  //         });

  //         return await ShoppingModel.aggregate(queryData);
  //     } catch (error) {
  //         throw error;
  //     }
  // }

  // async getListOfShoppingItem(query) {
  //   try {
  //     let queryData = [];
  //     query.limit = query.limit ? parseInt(query.limit) : 10;

  //     // Match stage for filtering based on user_id and task_title
  //     let matchStage = {
  //       $match: {
  //         shopping_category_id: new ObjectId(query.shopping_category_id),
  //         user_id: new ObjectId(query.user_id),
  //       },
  //     };

  //     if (query.filter) {
  //       // Use $eq for equality check instead of $or
  //       matchStage.$match.$or = [
  //         { shopping_item_name: query.filter },
  //         { is_completed: { $eq: query.filter == "true" ? true : false } },
  //       ];
  //     }

  //     queryData.push(matchStage);

  //     if (query.filter == "true" || query.filter == true) {
  //       queryData.push({
  //         $group: {
  //           _id: "$shopping_category_id", // Group by shopping_category_id
  //           total_price: { $sum: { $toDouble: "$price" } },
  //           shopping_list: { $push: "$$ROOT" },
  //         },
  //       });
  //     }

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
  //           // Skip and limit only when a filter is provided
  //           ...(query.filter
  //             ? [
  //                 { $skip: (parseInt(query.current_page) - 1) * query.limit },
  //                 { $limit: query.limit },
  //               ]
  //             : []),
  //         ],
  //       },
  //     });

  //     return await ShoppingModel.aggregate(queryData);
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  // async getListOfShoppingItem(query) {
  //   try {
  //     let queryData = [];
  //     query.limit = query.limit ? parseInt(query.limit) : 10;

  //     // Match stage for filtering based on user_id and task_title
  //     let matchStage = {
  //       $match: {
  //         shopping_category_id: new ObjectId(query.shopping_category_id),
  //         user_id: new ObjectId(query.user_id),
  //       },
  //     };

  //     if (query.filter) {
  //       // Use $eq for equality check instead of $or
  //       matchStage.$match.$or = [
  //         { shopping_item_name: query.filter },
  //         { is_completed: { $eq: query.filter == "true" ? true : false } },
  //       ];
  //     }

  //     queryData.push(matchStage);

  //     if (query.filter == "true" || query.filter == true) {
  //       queryData.push({
  //         $group: {
  //           _id: "$shopping_category_id", // Group by shopping_category_id
  //           total_price: { $sum: { $toDouble: "$price" } },
  //           shopping_list: { $push: "$$ROOT" },
  //         },
  //       });
  //     }

  //     // Add a sort stage to sort by the newest date
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
  //           // Skip and limit only when a filter is provided
  //           ...(query.filter
  //             ? [
  //                 { $skip: (parseInt(query.current_page) - 1) * query.limit },
  //                 { $limit: query.limit },
  //               ]
  //             : []),
  //         ],
  //       },
  //     });

  //     return await ShoppingModel.aggregate(queryData);
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async getListOfShoppingItem(query, user_id) {
    try {
      query.limit = query.limit ? parseInt(query.limit) : 10;

      // Match stage for filtering based on user_id and task_title
      let matchStage = {
        $match: {
          shopping_category_id: new ObjectId(query.shopping_category_id),
          user_id: new ObjectId(user_id),
          // profile_id: new ObjectId(query.profile_id),
        },
      };

      if (query.filter) {
        // Use $eq for equality check instead of $or
        matchStage.$match.$or = [
          { shopping_item_name: query.filter },
          { is_completed: { $eq: query.filter == "true" ? true : false } },
        ];
      }

      // Sort stage to sort by the newest date
      let sortStage = { $sort: { created_dt: -1, _id: -1 } };

      // Pagination stages
      let skipStage = {
        $skip: (parseInt(query.current_page) - 1) * query.limit,
      };
      let limitStage = { $limit: query.limit };

      // Aggregate pipeline
      let pipeline = [matchStage, sortStage, skipStage, limitStage];

      // Data retrieval
      let data = await ShoppingModel.aggregate([...pipeline]);

      // Metadata (total count and pagination information)
      let totalCount = await ShoppingModel.countDocuments(matchStage.$match);
      let totalPages = Math.ceil(totalCount / query.limit);

      let metadata = {
        total: totalCount,
        page: Math.ceil(totalCount / query.limit),
        currentPage: parseInt(query.current_page),
        total_price: data.reduce((total, item) => {
          const itemPrice = parseFloat(item.price);
          return isNaN(itemPrice) ? total : total + itemPrice;
        }, 0),
      };

      return { metadata, data };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = shoppingService;
