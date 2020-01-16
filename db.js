const dotenv = require('dotenv')

dotenv.config()

const mongoose = require("mongoose");
const connection = process.env.DATABASE_URI;
const connectDb = () => {
  return mongoose.connect(connection);
};
module.exports = connectDb;