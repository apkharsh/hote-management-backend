const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema({
  name: String,
  phoneNo: Number,
});

module.exports = mongoose.model("Hotel", HotelSchema);
