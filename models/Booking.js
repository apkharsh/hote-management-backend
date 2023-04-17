// In models/Booking.js

const mongoose = require("mongoose");
const moment = require("moment");

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
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: Number,
        required: true,
    },
    endTime: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
});

// old version code
// bookingSchema.statics.isRoomAvailable = async function (
//     // this function is called on the model, not on an instance of the model
//     // and the purpose of this function is to check if a room is available for a given time period
//     roomType,
//     startTime,
//     endTime
// ) {
//     // Check if there is any booking for the same room type that overlaps with the requested time period
//     const booking = await this.findOne({
//         roomType,
//         $or: [
//             // this tells us that the requested time period overlaps with the existing booking
//             { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
//             { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
//             { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
//             // there are three startTime because the requested time period can be either before, after, or in between the existing booking
//             // $lte means less than or equal to
//             // $gte means greater than or equal to
//             // $lt means less than
//             // $or: means or in mongoose queries (https://mongoosejs.com/docs/queries.html)
//         ],
//     });

//     return !booking;
// };

// updated code with date checking as well - nt working
// bookingSchema.statics.isRoomAvailable = async function (
//     roomType,
//     startTime,
//     endTime
// ) {
//     // Check if there is any booking for the same room type that overlaps with the requested time period
//     const booking = await this.findOne({
//         roomType,
//         $or: [
//             {
//                 $and: [
//                     { startTime: { $lt: startTime } },
//                     { endTime: { $gt: startTime } },
//                     { date: { $eq: moment(startTime).format("YYYY-MM-DD") } },
//                 ],
//             },
//             {
//                 $and: [
//                     { startTime: { $gte: startTime } },
//                     { endTime: { $lte: endTime } },
//                     { date: { $eq: moment(startTime).format("YYYY-MM-DD") } },
//                 ],
//             },
//             {
//                 $and: [
//                     { startTime: { $lt: endTime } },
//                     { endTime: { $gt: endTime } },
//                     { date: { $eq: moment(endTime).format("YYYY-MM-DD") } },
//                 ],
//             },
//         ],
//     });

//     return !booking;
// };
bookingSchema.statics.isRoomAvailable = async function (
    roomType,
    date,
    startTime,
    endTime
) {
    // Check if there is any booking for the same room type that overlaps with the requested time period
    const overlappingBooking = await this.findOne({
        roomType,
        $or: [
            // check if the requested time period overlaps with an existing booking
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        ],
    });

    if (overlappingBooking) {
        return false; // room is not available for the requested time period
    }

    // Check if there are any bookings for the same room type on the requested date
    // const date = moment(startTime).format("YYYY-MM-DD");
    const bookingsForDate = await this.find({ roomType, date });

    for (let i = 0; i < bookingsForDate.length; i++) {
        const existingBooking = bookingsForDate[i];
        // check if the requested time period clashes with an existing booking on the same date
        if (
            (startTime >= existingBooking.startTime &&
                startTime < existingBooking.endTime) ||
            (endTime > existingBooking.startTime &&
                endTime <= existingBooking.endTime) ||
            (startTime <= existingBooking.startTime &&
                endTime >= existingBooking.endTime)
        ) {
            return false; // room is not available for the requested time period
        }
    }

    return true; // room is available for the requested time period
};

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
