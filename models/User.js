const mongoose = require("mongoose");

const UserScheme = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: Number,
  roomId: String,
  startTime: Date,
  endTime: Date,
});

module.exports = mongoose.model("User", UserScheme);
