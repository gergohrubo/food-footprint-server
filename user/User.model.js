const mongoose = require("mongoose");
let validator = require('validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: (value) => {
      return validator.isEmail(value)
    }
  },
  password: {
    type: String,
    required: true
  }
});
const User = mongoose.model("User", userSchema);
module.exports = User;