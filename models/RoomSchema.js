const RoomType = require("./RoomType");
const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomNo: Number,
  type: String,
  bookings: [
    {
      type: Map,
      of: String,
    },
  ],
});

module.exports = mongoose.model("RoomSchema", RoomSchema);
