const express = require("express");
const Room = require("../models/RoomSchema");

const router = express.Router();

// router.get("/", async (req, res) => {
//   const rooms = await Room.find(); // find all rooms
//   res.json(rooms);
// });

router.post("/newroom", async (req, res) => {
  const data = req.body;
  const room = new Room({
    roomNo: data.number,
    type: data.type,
    bookings: [
      {
        start: "2023-04-18T07:56:43.320Z",
        end: "2023-04-18T08:56:43.320Z",
      },
    ],
  });
  await room.save();
  res.json(room);
});

module.exports = router;
