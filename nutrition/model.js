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
  nutrients: {
    type: {},
    required: false
  },
  meals: {
    type: [{}],
    required: true
  }
});
const Nutrition = mongoose.model("Nutrition", nutritionSchema);
module.exports = Nutrition