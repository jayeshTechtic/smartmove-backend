/**
 * todoService.js
 *
 * All To-Do APIs.
 */
const { ObjectId } = require("mongodb");
const { printConsole } = require("../../Utils/commonFile");
const TodoModel = require("../schema/todolist.schema");
const UserModel = require("../schema/user.schema");
const CategoryModel = require("../schema/category.schema");

const todoService = {
  // async getTaskForLoginBasedOnSubcription(user_id, subcription,) {
  //   try {
  //     return UserModel.aggregate([
  //       {
  //         $match: {
  //           _id: new ObjectId(user_id),
  //           subcription: subcription,
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "todolists", // Collection name of the second model
  //           localField: "_id",
  //           foreignField: "user_id",
  //           as: "todoLists",
  //         },
  //       },
  //     ]);
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async getTaskForLoginBasedOnSubcription(user_id, subcription, profile_id) {
    try {
      return UserModel.aggregate([
        {
          $match: {
            _id: new ObjectId(user_id),
            subcription: subcription,
          },
        },
        {
          $lookup: {
            from: "todolists", // Collection name of the second model
            let: { user_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user_id", "$$user_id"] },
                      { $eq: ["$profile_id", new ObjectId(profile_id)] },
                    ],
                  },
                },
              },
            ],
            as: "todoLists",
          },
        },
        {
          $match: {
            todoLists: { $ne: [] }, // Filter out documents without todoLists
          },
        },
      ]);
    } catch (error) {
      throw error;
    }
  },

  async checkGivenTaskIsPresentOrNot(data) {
    try {
      return TodoModel.find({
        user_id: new ObjectId(data.user_id),
        profile_id: new ObjectId(data.profile_id),
        task_title: data.task_title,
      });
    } catch (error) {
      throw error;
    }
  },

  async addTodoListOfTheUser(data) {
    try {
      return TodoModel.create(data);
    } catch (error) {
      throw error;
    }
  },

  async updateTodoListOfTheUser(data) {
    try {
      return TodoModel.findByIdAndUpdate(
        {
          _id: data.task_id,
          user_id: data.user_id,
          profile_id: data.profile_id,
        },
        {
          task_title: data.task_title,
          updated_dt: Date.now(),
          is_completed: data.is_completed,
        },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteTodoListOfTheUser(data) {
    try {
      return TodoModel.findByIdAndDelete({
        _id: data.task_id,
        user_id: data.user_id,
        profile_id: data.profile_id,
      });
    } catch (error) {
      throw error;
    }
  },

  // async getListOfTodoTask(data, query) {
  //   try {
  //     let queryData = [];
  //     let skip = 0;
  //     query.limit = query.limit ? parseInt(query.limit) : 10;

  //     // Match stage for filtering based on user_id and task_title
  //     let matchStage = {
  //       $match: {
  //         user_id: new ObjectId(data.user_id),
  //       },
  //     };

  //     if (query.filter) {
  //       matchStage.$match.$or = [{ task_title: query.filter }];
  //     }

  //     queryData.push(matchStage);
  //     queryData.push(
  //       // {
  //       //   $sort: {
  //       //     task_title: 1,
  //       //   },
  //       // },
  //       {
  //         $project: {
  //           task_item: 0,
  //         },
  //       }
  //     );

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

  //     return TodoModel.aggregate(queryData);
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async getListOfTodoTask(data, query) {
    try {
      let queryData = [];
      query.limit = query.limit ? parseInt(query.limit) : 10;

      // Match stage for filtering based on user_id and task_title
      let matchStage = {
        $match: {
          user_id: new ObjectId(data.user_id),
          profile_id: new ObjectId(query.profile_id),
        },
      };

      if (query.filter) {
        matchStage.$match.$or = [{ task_title: query.filter }];
      }

      queryData.push(matchStage);

      // Sort by created_dt in descending order
      queryData.push({
        $sort: {
          created_dt: -1,
        },
      });

      // Exclude task_item
      queryData.push({
        $project: {
          task_item: 0,
        },
      });

      // Meta data
      queryData.push({
        $facet: {
          metadata: [
            { $count: "total" },
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
            { $skip: (parseInt(query.current_page) - 1) * query.limit },
            { $limit: query.limit },
          ],
        },
      });

      return TodoModel.aggregate(queryData);
    } catch (error) {
      throw error;
    }
  },

  async getTaskItemForLoginBasedOnSubcription(data, subscription, profile_id) {
    try {
      return UserModel.aggregate([
        {
          $match: {
            _id: new ObjectId(data.user_id),
            subcription: subscription,
          },
        },
        {
          $lookup: {
            from: "todolists",
            localField: "_id",
            foreignField: "user_id", // Change this to the correct field
            pipeline: [
              {
                $match: {
                  _id: new ObjectId(data.task_id),
                  user_id: new ObjectId(data.user_id),
                  profile_id: new ObjectId(profile_id),
                },
              },
            ],
            as: "todoLists",
          },
        },
        {
          $unwind: "$todoLists",
        },
        {
          $match: {
            "todoLists.task_item.is_completed":
              data.is_completed == "true" ? true : false,
          },
        },
        {
          $project: {
            _id: 1,
            todoLists: 1,
          },
        },
      ]);
    } catch (error) {
      throw error;
    }
  },

  async addTodoTaskItems(data, count = 0) {
    try {
      const taskItemText = data.task_item_name.split(", ");
      for (let i = 0; i < count; i++) {
        if (taskItemText[i]) {
          let payload = [];
          payload.push({
            task_item_name: taskItemText[i],
            is_completed: data.is_completed,
            note: data.note,
          });

          await TodoModel.findByIdAndUpdate(
            { _id: data.task_id, user_id: data.user_id },
            { $push: { task_item: payload } },
            { new: true }
          );
        }
      }
      return true;
    } catch (error) {
      throw error;
    }
  },

  async updateTodoTaskItems(data, user_id) {
    try {
      await TodoModel.updateOne(
        {
          _id: data.task_id,
          user_id: user_id,
          "task_item._id": data.task_item_id,
        },
        {
          $set: {
            "task_item.$.task_item_name": data.task_item_name,
            "task_item.$.is_completed": data.is_completed,
            "task_item.$.note": data.note,
            updated_dt: Date.now(),
          },
        }
      );
      return TodoModel.findById({
        _id: data.task_id,
        user_id: user_id,
      });
    } catch (error) {
      throw error;
    }
  },

  async deleteTodoTaskItems(data, user_id) {
    try {
      await TodoModel.updateOne(
        {
          _id: data.task_id,
          user_id: user_id,
        },
        {
          $pull: {
            task_item: { _id: data.task_item_id },
          },
        }
      );
      return TodoModel.findById({
        _id: data.task_id,
        user_id: user_id,
      });
    } catch (error) {
      throw error;
    }
  },

  //   async getListOfTodoTaskItemList(data, user_id) {
  //     try {
  //       let queryData = [
  //         {
  //           $match: {
  //             // user_id: new ObjectId(user_id),
  //             _id: new ObjectId(data.task_id),
  //           },
  //         },
  //         {
  //           $project: {
  //             task_title: 1,
  //             task_item: {
  //               $filter: {
  //                 input: "$task_item",
  //                 as: "item",
  //                 cond: {
  //                   $eq: [
  //                     "$$item.is_completed",
  //                     data.is_completed == "true" ? true : false,
  //                   ],
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $limit: 1,
  //         },
  //       ];
  //       if (data.filter) {
  //         queryData.push(
  //           {
  //             $project: {
  //               _id: 0,
  //               task_item: {
  //                 $filter: {
  //                   input: "$task_item",
  //                   as: "item",
  //                   cond: {
  //                     $regexMatch: {
  //                       input: "$$item.task_item_name",
  //                       regex: data.filter,
  //                       options: "i", // Case-insensitive
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //           {
  //             // $limit: parseInt(data.limit),
  //             $limit: 2,
  //           }
  //         );
  //       }
  //       queryData.push(
  //         {
  //           $project: {
  //             task_item: 1,
  //             // totalTaskItems: { $size: "$task_item" },
  //             totalTaskItems: { $size: "$task_item" },
  //             totalPages: {
  //               $ceil: {
  //                 $divide: [{ $size: "$task_item" }, parseInt(data.limit)],
  //               },
  //             },
  //             currentPage: data.current_page,
  //           },
  //         },
  //         {
  //           $skip: (data.current_page - 1) * parseInt(data.limit),
  //         }
  //       );
  //       return TodoModel.aggregate(queryData);
  //     } catch (error) {
  //       throw error;
  //     }
  //   },

  //   async getListOfTodoTaskItemList(data, user_id) {
  //     try {
  //       let queryData = [
  //         {
  //           $match: {
  //             _id: new ObjectId(data.task_id),
  //           },
  //         },
  //         {
  //           $project: {
  //             task_title: 1,
  //             task_item: {
  //               $filter: {
  //                 input: "$task_item",
  //                 as: "item",
  //                 cond: {
  //                   $eq: [
  //                     "$$item.is_completed",
  //                     data.is_completed == "true" ? true : false,
  //                   ],
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       ];

  //       if (data.filter) {
  //         queryData.push({
  //           $project: {
  //             _id: 0,
  //             task_item: {
  //               $filter: {
  //                 input: "$task_item",
  //                 as: "item",
  //                 cond: {
  //                   $regexMatch: {
  //                     input: "$$item.task_item_name",
  //                     regex: data.filter,
  //                     options: "i", // Case-insensitive
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         });
  //       }

  //       // Add $project stage for limiting the number of items in task_item array
  //       queryData.push({
  //         $project: {
  //           task_title: 1,
  //           task_item: { $slice: ["$task_item", 0, parseInt(data.limit)] },
  //         },
  //       });

  //       // Add $project and $skip stages for pagination
  //       queryData.push(
  //         {
  //           $project: {
  //             task_item: 1,
  //             totalTaskItems: { $size: "$task_item" },
  //             totalPages: {
  //               $ceil: {
  //                 $divide: [{ $size: "$task_item" }, parseInt(data.limit)],
  //               },
  //             },
  //             currentPage: data.current_page,
  //           },
  //         },
  //         {
  //           $skip: (data.current_page - 1) * parseInt(data.limit),
  //         }
  //       );

  //       return TodoModel.aggregate(queryData);
  //     } catch (error) {
  //       throw error;
  //     }
  //   },

  // correct with pagination but issue in currentPage data
  //   async getListOfTodoTaskItemList(data, user_id) {
  //     try {
  //       const { task_id, is_completed, filter, limit, current_page } = data;

  //       let pipeline = [
  //         {
  //           $match: {
  //             _id: new ObjectId(task_id),
  //           },
  //         },
  //         {
  //           $project: {
  //             task_title: 1,
  //             task_item: {
  //               $filter: {
  //                 input: "$task_item",
  //                 as: "item",
  //                 cond: {
  //                   $eq: ["$$item.is_completed", is_completed === "true"],
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       ];

  //       if (filter) {
  //         pipeline.push({
  //           $project: {
  //             task_title: 1,
  //             task_item: {
  //               $filter: {
  //                 input: "$task_item",
  //                 as: "item",
  //                 cond: {
  //                   $regexMatch: {
  //                     input: "$$item.task_item_name",
  //                     regex: filter,
  //                     options: "i",
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         });
  //       }

  //       pipeline.push(
  //         {
  //           $project: {
  //             task_title: 1,
  //             task_item: { $slice: ["$task_item", 0, parseInt(limit)] },
  //             totalTaskItems: { $size: "$task_item" },
  //           },
  //         },
  //         {
  //           $addFields: {
  //             totalPages: {
  //               $ceil: {
  //                 $divide: ["$totalTaskItems", parseInt(limit)],
  //               },
  //             },
  //             currentPage: parseInt(current_page),
  //           },
  //         }
  //       );

  //       return TodoModel.aggregate(pipeline);
  //     } catch (error) {
  //       throw error;
  //     }
  //   },

  // async getListOfTodoTaskItemList(data, user_id) {
  //   try {
  //     const { task_id, is_completed, filter, limit, current_page } = data;

  //     const pipeline = [
  //       {
  //         $match: {
  //           _id: new ObjectId(task_id),
  //         },
  //       },
  //       {
  //         $project: {
  //           task_title: 1,
  //           task_item: {
  //             $filter: {
  //               input: "$task_item",
  //               as: "item",
  //               cond: {
  //                 $eq: ["$$item.is_completed", is_completed === "true"],
  //               },
  //             },
  //           },
  //         },
  //       },
  //     ];

  //     if (filter) {
  //       pipeline.push({
  //         $project: {
  //           task_title: 1,
  //           task_item: {
  //             $filter: {
  //               input: "$task_item",
  //               as: "item",
  //               cond: {
  //                 $regexMatch: {
  //                   input: "$$item.task_item_name",
  //                   regex: filter,
  //                   options: "i",
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       });
  //     }

  //     pipeline.push(
  //       {
  //         $project: {
  //           task_title: 1,
  //           task_item: 1,
  //           totalTaskItems: { $size: "$task_item" },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           totalPages: {
  //             $ceil: {
  //               $divide: ["$totalTaskItems", parseInt(limit)],
  //             },
  //           },
  //           currentPage: { $toInt: current_page },
  //         },
  //       },
  //       {
  //         $project: {
  //           task_title: 1,
  //           task_item: {
  //             $slice: [
  //               "$task_item",
  //               {
  //                 $multiply: [
  //                   parseInt(limit),
  //                   { $subtract: ["$currentPage", 1] },
  //                 ],
  //               },
  //               parseInt(limit),
  //             ],
  //           },
  //           totalTaskItems: 1,
  //           totalPages: 1,
  //           currentPage: 1,
  //         },
  //       }
  //     );

  //     const result = await TodoModel.aggregate(pipeline);

  //     return result[0] || null;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  // async getListOfTodoTaskItemList(data, user_id) {
  //   try {
  //     const { task_id, is_completed, filter, limit, current_page } = data;

  //     const pipeline = [
  //       {
  //         $match: {
  //           _id: new ObjectId(task_id),
  //         },
  //       },
  //       {
  //         $project: {
  //           task_title: 1,
  //           task_item: {
  //             $filter: {
  //               input: "$task_item",
  //               as: "item",
  //               cond: {
  //                 $eq: ["$$item.is_completed", is_completed === "true"],
  //               },
  //             },
  //           },
  //         },
  //       },
  //     ];

  //     if (filter) {
  //       pipeline.push({
  //         $project: {
  //           task_title: 1,
  //           task_item: {
  //             $filter: {
  //               input: "$task_item",
  //               as: "item",
  //               cond: {
  //                 $regexMatch: {
  //                   input: "$$item.task_item_name",
  //                   regex: filter,
  //                   options: "i",
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       });
  //     }

  //     pipeline.push(
  //       {
  //         $unwind: "$task_item",
  //       },
  //       {
  //         $sort: {
  //           "task_item.created_dt": -1,
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: "$_id",
  //           task_title: { $first: "$task_title" },
  //           task_item: {
  //             $push: {
  //               task_item_name: "$task_item.task_item_name",
  //               created_dt: "$task_item.created_dt",
  //               // Include other fields as needed
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           totalTaskItems: { $size: "$task_item" },
  //           totalPages: {
  //             $ceil: {
  //               $divide: [{ $size: "$task_item" }, parseInt(limit)],
  //             },
  //           },
  //           currentPage: { $toInt: current_page },
  //         },
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           task_title: 1,
  //           task_item: {
  //             $slice: [
  //               "$task_item",
  //               {
  //                 $multiply: [
  //                   parseInt(limit),
  //                   { $subtract: ["$currentPage", 1] },
  //                 ],
  //               },
  //               parseInt(limit),
  //             ],
  //           },
  //           totalTaskItems: 1,
  //           totalPages: 1,
  //           currentPage: 1,
  //         },
  //       }
  //     );

  //     const result = await TodoModel.aggregate(pipeline);

  //     return result[0] || null;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  async getListOfTodoTaskItemList(data) {
    try {
      const { task_id, is_completed, filter, limit, current_page, profile_id } =
        data;

      const pipeline = [
        {
          $match: {
            _id: new ObjectId(task_id),
            profile_id: new ObjectId(profile_id),
          },
        },
        {
          $project: {
            task_title: 1,
            task_item: {
              $filter: {
                input: "$task_item",
                as: "item",
                cond: {
                  $eq: ["$$item.is_completed", is_completed === "true"],
                },
              },
            },
          },
        },
      ];

      if (filter) {
        pipeline.push({
          $project: {
            task_title: 1,
            task_item: {
              $filter: {
                input: "$task_item",
                as: "item",
                cond: {
                  $regexMatch: {
                    input: "$$item.task_item_name",
                    regex: filter,
                    options: "i",
                  },
                },
              },
            },
          },
        });
      }

      pipeline.push(
        {
          $unwind: "$task_item",
        },
        {
          $sort: {
            "task_item.created_dt": -1,
            "task_item._id": -1,
          },
        },
        {
          $group: {
            _id: "$_id",
            task_title: { $first: "$task_title" },
            task_item: {
              $push: {
                _id: "$task_item._id", // Include the _id field from task_item
                task_item_name: "$task_item.task_item_name",
                note: "$task_item.note",
                created_dt: "$task_item.created_dt",
                i: "$task_item.i",
                // Include other fields as needed
              },
            },
          },
        },
        {
          $addFields: {
            totalTaskItems: { $size: "$task_item" },
            totalPages: {
              $ceil: {
                $divide: [{ $size: "$task_item" }, parseInt(limit)],
              },
            },
            currentPage: { $toInt: current_page },
          },
        },
        {
          $project: {
            _id: 1,
            task_title: 1,
            task_item: {
              $slice: [
                "$task_item",
                {
                  $multiply: [
                    parseInt(limit),
                    { $subtract: ["$currentPage", 1] },
                  ],
                },
                parseInt(limit),
              ],
            },
            totalTaskItems: 1,
            totalPages: 1,
            currentPage: 1,
          },
        }
      );

      const result = await TodoModel.aggregate(pipeline);

      return result[0] || null;
    } catch (error) {
      throw error;
    }
  },

  async addTodoTaskItems(data, count = 0) {
    try {
      const taskItemText = data.task_item_name.split(", ");
      for (let i = 0; i < count; i++) {
        if (taskItemText[i]) {
          let payload = [];
          payload.push({
            task_item_name: taskItemText[i],
            is_completed: data.is_completed,
            note: data.note,
          });

          await TodoModel.findByIdAndUpdate(
            { _id: data.task_id, user_id: data.user_id },
            { $push: { task_item: payload } },
            { new: true }
          );
        }
      }
      return true;
    } catch (error) {
      throw error;
    }
  },

  async addCategory(data) {
    try {
      return CategoryModel.create(data);
    } catch (error) {
      throw error;
    }
  },
};

module.exports = todoService;
