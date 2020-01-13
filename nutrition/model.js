const mongoose = require("mongoose");

const nutritionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  nutrition: {
    type: Array,
    required: true
  }
});
const Nutrition = mongoose.model("Nutrition", nutritionSchema);
module.exports = Nutrition