// In models/Booking.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    roomType: {
        type: String,
        enum: ["A", "B", "C"],
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
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
});

bookingSchema.statics.isRoomAvailable = async function (
    // this function is called on the model, not on an instance of the model
    // and the purpose of this function is to check if a room is available for a given time period
    roomType,
    startTime,
    endTime
) {
    // Check if there is any booking for the same room type that overlaps with the requested time period
    const booking = await this.findOne({
        roomType,
        $or: [
            // this tells us that the requested time period overlaps with the existing booking
            { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
            { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
            { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
            // there are three startTime because the requested time period can be either before, after, or in between the existing booking
            // $lte means less than or equal to
            // $gte means greater than or equal to
            // $lt means less than
            // $or: means or in mongoose queries (https://mongoosejs.com/docs/queries.html)
        ],
    });

    return !booking;
};

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
