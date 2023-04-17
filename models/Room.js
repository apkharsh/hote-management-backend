const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    // roomNumber: {
    //     type: Number,
    //     required: true,
    // },
    roomType: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
