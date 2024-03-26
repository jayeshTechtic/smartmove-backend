/**
 * adminService.js
 *
 * All Admin APIs.
 */
const { ObjectId } = require("mongodb");
const AccountingModel = require("../schema/accounting.schema");
const FurnitureModel = require("../schema/furniture.schema");
const ShoppingModel = require("../schema/shoppinglist.schema");
const UserModel = require("../schema/user.schema");

const accountingService = {
  async addAccountingDetails(data) {
    try {
      return AccountingModel.create(data);
    } catch (error) {
      throw error;
    }
  },

  async updateAccountingDetails(data) {
    try {
      return AccountingModel.findByIdAndUpdate(
        {
          _id: new ObjectId(data.accounting_id),
          user_id: new ObjectId(data.user_id),
          profile_id: new ObjectId(data.profile_id),
        },
        { accounting_title: data.accounting_title, price: data.price },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteAccountingDetails(data) {
    try {
      return AccountingModel.findByIdAndDelete({
        _id: new ObjectId(data.accounting_id),
        user_id: new ObjectId(data.user_id),
        profile_id: new ObjectId(data.profile_id),
      });
    } catch (error) {
      throw error;
    }
  },

  // async getListOfAccountingDetails(data) {
  //     try {
  //         const furniture = await FurnitureModel.aggregate([
  //             {
  //                 $match: {
  //                     user_id: new ObjectId(data.user_id)
  //                 }
  //             },
  //             {
  //                 $group: {
  //                     _id: null,
  //                     totalPrice: { $sum: { $toDouble: "$price" } }
  //                 }
  //             }
  //         ]);

  //         const shopping = await ShoppingModel.aggregate([
  //             {
  //                 $match: {
  //                     user_id: new ObjectId(data.user_id)
  //                 }
  //             },
  //             {
  //                 $group: {
  //                     _id: null,
  //                     totalPrice: { $sum: { $toDouble: "$price" } }
  //                 }
  //             }
  //         ]);

  //         const accounting = await AccountingModel.aggregate([
  //             {
  //                 $match: {
  //                     user_id: new ObjectId(data.user_id)
  //                 }
  //             },
  //             {
  //                 $group: {
  //                     _id: null, // Group by user_id
  //                     total_price: { $sum: { $toDouble: "$price" } },
  //                     accounting_list: { $push: "$$ROOT" }
  //                 }
  //             }
  //         ]);

  //         const userData = await UserModel.findOne({ _id: new ObjectId(data.user_id) }, { user_budget: 1 })
  //         const total = furniture[0]?.totalPrice + shopping[0]?.totalPrice + accounting[0]?.total_price

  //         const response = [
  //             {
  //                 "metadata": [
  //                     {
  //                         "total": total,
  //                         "user_budget": userData.user_budget
  //                     }
  //                 ],
  //                 "data": [
  //                     { accounting_title: "Furniture", price: furniture[0]?.totalPrice },
  //                     { accounting_title: "Shopping", price: shopping[0]?.totalPrice },
  //                     ...accounting[0]?.accounting_list,
  //                 ]
  //             }
  //         ]

  //         return response;
  //     } catch (error) {
  //         throw error;
  //     }
  // },

  async getListOfAccountingDetails(data) {
    try {
      const furnitureResult = await FurnitureModel.aggregate([
        {
          $match: {
            user_id: new ObjectId(data.user_id),
            profile_id: new ObjectId(data.profile_id),
            is_purchased: true,
          },
        },
        {
          $group: {
            _id: null,
            totalPrice: {
              $sum: {
                $toDouble: {
                  $cond: {
                    if: { $eq: ["$price", ""] }, // Check if price is an empty string
                    then: 0, // Replace empty string with 0
                    else: "$price", // Use the actual price if it's not empty
                  },
                },
              },
            },
          },
        },
      ]);

      // const furnitureResult = await FurnitureModel.aggregate([
      //   {
      //     $match: {
      //       user_id: new ObjectId(data.user_id),
      //       is_purchased: true,
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: null,
      //       totalPrice: { $sum: { $toDouble: "$price" } },
      //     },
      //   },
      // ]);

      const shoppingResult = await ShoppingModel.aggregate([
        {
          $match: {
            user_id: new ObjectId(data.user_id),
            profile_id: new ObjectId(data.profile_id),
            is_completed: true,
          },
        },
        {
          $group: {
            _id: null,
            totalPrice: { $sum: { $toDouble: "$price" } },
          },
        },
      ]);

      const accountingResult = await AccountingModel.aggregate([
        {
          $match: {
            user_id: new ObjectId(data.user_id),
            profile_id: new ObjectId(data.profile_id),
          },
        },
        {
          $sort: {
            created_dt: -1, // Sort by 'created_dt' in descending order
          },
        },
        {
          $group: {
            _id: null,
            total_price: { $sum: { $toDouble: "$price" } },
            accounting_list: { $push: "$$ROOT" },
          },
        },
      ]);

      // const userData = await UserModel.findOne(
      //   { _id: new ObjectId(data.user_id) },
      //   { user_budget: 1 }
      // );

      const userData = await UserModel.findOne(
        {
          _id: new ObjectId(data.user_id),
          "profiles._id": new ObjectId(data.profile_id),
        },
        { "profiles.$": 1 } // Projection to get only the matched profile
      );

      let userBudget = null;

      if (userData && userData?.profiles && userData?.profiles?.length > 0) {
        userBudget = userData.profiles[0].user_budget;

        // return userBudget;
      } else {
        // Handle case where user or profile is not found
        // return null;
      }

      const totalFurniturePrice = furnitureResult[0]?.totalPrice || 0;
      const totalShoppingPrice = shoppingResult[0]?.totalPrice || 0;
      const totalAccountingPrice = accountingResult[0]?.total_price || 0;

      const total =
        totalFurniturePrice + totalShoppingPrice + totalAccountingPrice;

      const response = [
        {
          metadata: [
            {
              total: total,
              user_budget: userBudget,
            },
          ],
          data: [
            { accounting_title: "Furniture", price: totalFurniturePrice },
            { accounting_title: "Shopping", price: totalShoppingPrice },
            ...(accountingResult[0]?.accounting_list || []),
          ],
        },
      ];

      return response;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  },

  async addAccountingUserBudget(data, userData) {
    try {
      return await UserModel.findOneAndUpdate(
        // { _id: new ObjectId(userData._id) },
        { _id: userData._id, "profiles._id": data.profile_id },
        { $set: { "profiles.$.user_budget": data?.user_budget } }
        // { user_budget: data.user_budget }
        // { $set: { "profiles.user_budget": data?.user_budget } }
        // {
        //   $set: {
        //     "profiles.$[profile].user_budget": data?.user_budget,
        //   },
        // },
        // {
        //   arrayFilters: [{ "profile._id": data?.user_budget }],
        // }
      );
    } catch (error) {
      throw error;
    }
  },
};

module.exports = accountingService;
