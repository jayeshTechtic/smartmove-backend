/**
 * Models/furniture.js
 *
 * Create mongoDB Schema for the furniture details.
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const furniture = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
  furniture_category_id: {
    type: Schema.Types.ObjectId,
    ref: "furniturecategories",
  },
  furniture_title: {
    type: String,
    required: [true, "Furniture Title should not be empty"],
  },
  furniture_link: {
    type: String,
    required: false,
    default: "",
    // validate: {
    //   validator: function (value) {
    //     // Regular expression to match URL pattern
    //     // const urlPattern = /^(http[s]?:\/\/)?(www\.)?([a-zA-Z0-9_-]+)(\.[a-zA-Z]{2,})+([a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]*)$/;
    //     const urlPattern = /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g;
    //     return urlPattern.test(value);
    //   },
    //   message: props => `${props.value} is not a valid URL!`
    // }
  },
  price: {
    type: String,
    required: false,
    default: 0,
  },
  breadth: {
    type: String,
    required: false,
    default: "",
  },
  length: {
    type: String,
    required: false,
    default: "",
  },
  height: {
    type: String,
    required: false,
    default: "",
  },
  is_marked_favourite: {
    type: Boolean,
    default: false,
    default: "",
  },
  is_purchased: {
    type: Boolean,
    default: false,
    default: "",
  },
  profile_id: {
    type: Schema.Types.ObjectId,
    // ref: "Users",
    default: null,
  },
  created_dt: {
    type: Date,
    default: Date.now(),
  },
  updated_dt: {
    type: Date,
  },
});

const FurnitureModel = mongoose.model("Furniture", furniture);

module.exports = FurnitureModel;
