const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  subscription: Object,
  plan: String,
  lastActive: String,
});

const userModel = mongoose.model("userModel", userSchema);
module.exports = userModel;
