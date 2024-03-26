const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const config = require("dotenv").config();

const db = {
    mongoose: mongoose,
    url: config.parsed.DB_URL
};
module.exports = db;
