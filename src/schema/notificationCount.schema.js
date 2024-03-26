/**
 * Models/user.js
 *
 * Create mongoDB Schema for the user details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const furnitureChildSavedListNotificationSchema = new Schema(
  {
    notification_count: {
      type: Number,
      default: 0,
    },
    category_id: {
      type: String,
    },
  },
  { _id: false }
);
const furnitureChildSavedNotificationSchema = new Schema(
  {
    notification_count: {
      type: Number,
      default: 0,
    },
    list: [furnitureChildSavedListNotificationSchema],
  },
  { _id: false }
);

const furnitureChildNotificationSchema = new Schema(
  {
    saved: furnitureChildSavedNotificationSchema,
    favourite: furnitureChildSavedNotificationSchema,
    purchased: furnitureChildSavedNotificationSchema,
  },
  { _id: false }
);

const furnitureNotificationsSchema = new Schema(
  {
    category_id: {
      type: String,
    },
    notification_count: {
      type: Number,
      default: 0,
    },
    child_notification: furnitureChildNotificationSchema,
  },
  { _id: false }
);

const mainUserNotificationSchema = new Schema(
  {
    notification_count: {
      type: Number,
      default: 0,
    },
    furniture_notifications: [furnitureNotificationsSchema],
  },
  { _id: false }
);

const coUserNotificationSchema = new Schema(
  {
    notification_count: {
      type: Number,
      default: 0,
    },
    furniture_notifications: [furnitureNotificationsSchema],
  },
  { _id: false }
);

const NotificationCount = new Schema({
  profile_id: {
    type: String,
  },
  main_user_notification: mainUserNotificationSchema,
  co_user_notification: [coUserNotificationSchema],
});

const NotificationCountModel = mongoose.model(
  "NotificationCount",
  NotificationCount
);

module.exports = NotificationCountModel;
