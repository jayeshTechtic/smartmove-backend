const InteractionModel = require("../schema/interaction.schema");

const UserService = {
  // Possible item values
  // furniture, shoppingList, calendar, todo, scale, cardboardAndroomPlanner, accounting, planer3D, login
  async interactions(data, user_id) {
    try {
      let payload = {};
      if (data == "login") {
        // Get the start and end of the current day
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Check if the user has logged in today
        const isUserloggedInToday = await InteractionModel.findOne({
          userId: user_id,
          created_dt: { $gte: todayStart, $lte: todayEnd },
        });

        if (!isUserloggedInToday) {
          // User has not logged in today
          payload = {
            item: data,
            userId: user_id,
          };

          // Create a new interaction record
          await InteractionModel.create(payload);
        }
      } else {
        // For actions other than login
        payload = {
          item: data,
        };

        // Create a new interaction record
        await InteractionModel.create(payload);
      }
      return;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = UserService;
