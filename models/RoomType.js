const mongoose = require("mongoose");

const RoomTypeSchema = new mongoose.Schema({
  TypeName: String,
  Price: Number,
});

module.exports = mongoose.model("RoomType", RoomTypeSchema);
