const express = require("express");
const { Room } = require("../models");

const router = express.Router();

router.get("/", async (req, res) => {
    const rooms = await Room.find(); // find all rooms
    res.json(rooms);
});

router.post("/", async (req, res) => {
    const { number, type, price } = req.body;
    const room = new Room({ number, type, price });
    await room.save();
    res.json(room);
});

module.exports = router;
