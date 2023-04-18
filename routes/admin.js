const express = require("express");
const router = express.Router();
const User = require("../models/User");
const RoomSchema = require("../models/RoomSchema");

router.post("/newbooking", async (req, res) => {
  const data = req.body;
  console.log(data);
  const newUser = new User({
    name: data.name,
    email: data.email,
    phoneNumber: data.phoneNumber,
    roomId: data.roomId,
    startTime: data.startTime,
    endTime: data.endTime,
  });

  await newUser.save();

  const start_time = new Date(data.startTime);
  const end_time = new Date(data.endTime);

  const arr = await RoomSchema.find(
    {
      start_time: { $lt: end_time },
      end_time: { $gt: start_time },
    }
    // function (err, results) {
    //   if (err) {
    //     console.log(err);
    //   } else if (results.length > 0) {
    //     console.log("Time frame not available");
    //   } else {
    //     console.log("Time frame available");
    //   }
    // }
  );
  console.log(arr);
  res.send("created");
});
// router.delete();
// router.put();

module.exports = router;
