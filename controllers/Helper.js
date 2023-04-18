const Booking = require("../models/Booking");
const Room = require("../models/Room");

const get_available_rooms = async (start_time, end_time, type_preference=null) => {

    const bookings = await Booking.find({
        $or:[
            {
                $and: [
                    { checkInTime: { $lte: start_time } },
                    { checkOutTime: { $gte: start_time } },
                ]
            },
            {
                $and: [
                    { checkInTime: { $lte: end_time } },
                    { checkOutTime: { $gte: end_time } },
                ]
            }
        ]
    });

    const booked_rooms = bookings.map((booking) => booking.roomID);

    if(type_preference != null)
    {
        const available_rooms = await Room.find({
            $and: [
                { _id: { $nin: booked_rooms } },
                { roomType: type_preference },
            ],
        });
    }
    else {
        const available_rooms = await Room.find({
             _id: { $nin: booked_rooms }
        });
    }

    // Return IDs of available rooms
    return available_rooms.map((room) => room._id);
}

// Export the function
module.exports = {
    get_available_rooms
}