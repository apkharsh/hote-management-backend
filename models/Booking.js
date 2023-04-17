const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    email: { type: String, required: true },
    user: { type: String, required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalAmount: { type: Number, required: true , default: 0}
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
