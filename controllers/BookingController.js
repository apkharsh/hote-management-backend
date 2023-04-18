// In controllers/bookings.js
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { get_available_rooms } = require("./Helper");

// /api/bookings/create
// COMPLETE
const bookRoom = async (req, res) => {
    
    const { username, email, roomType, startTime, endTime, roomNumber } = req.body;

    if(!username || !email || !roomType || !startTime || !endTime)
    {
        return res.status(400).json({
            error: "Please enter all the fields"
        });
    }
    else
    {
        // If room number is given, check that exact room
        if(roomNumber == null)
        {
            // Get available rooms
            const available_rooms = await get_available_rooms(startTime, endTime, roomType);

            if(available_rooms.length == 0)
            {
                return res.status(400).json({
                    error: "No rooms available"
                });
            }
            else
            {
                // Pick the first room
                const roomID = available_rooms[0];

                // Get the Price of the room
                const room = Room.findById(roomID);
                const price = room.price;
                const numHours = ceil((endTime - startTime) / 3600000);
                const totalPrice = price * numHours;

                // Create a new booking
                const booking = new Booking({
                    roomID,
                    username,
                    email,
                    startTime,
                    endTime,
                    totalPrice
                });

                // Save the booking
                await booking.save();

                // Populate and send the booking
                const populated_booking = await Booking.findById(booking._id).populate("roomID");

                res.status(200).json({
                    message: "Booking successful",
                    booking: populated_booking
                });
            }
        }
        else
        {
            // roomNumber is given, check that exact room
            
            // Get available rooms
            const available_rooms = await get_available_rooms(startTime, endTime, roomType);

            // get room with roomNumber
            const room_wanted = Room.find({"roomNumber": roomNumber});

            if(available_rooms.includes(room_wanted._id))
            {
                // Book the room
                const roomID = room_wanted._id;
                
                // Get the Price of the room
                const price = room_wanted.price;
                const numHours = ceil((endTime - startTime) / 3600000);
                const totalPrice = price * numHours;

                // Create a new booking
                const booking = new Booking({
                    roomID,
                    username,
                    email,
                    startTime,
                    endTime,
                    totalPrice
                });
                
                // Save the booking
                await booking.save();

                // Populate and send the booking
                const populated_booking = await Booking.findById(booking._id).populate("roomID");

                res.status(200).json({
                    message: "Booking successful",
                    booking: populated_booking
                });
            }
            else
            {
                // Room not available
                res.status(400).json({
                    error: "Room not available"
                });
            }
        }
    }
};

// /api/bookings/update/:id
// TODO.
const updateBooking = async (req, res) => {
    // Get email, username, startTime, endTime, roomNumber from the request body
};

// /api/bookings/delete/:id
// COMPLETE
const deleteBooking = async (req, res) => {

    const { id } = req.params;

    try {

        // Find the booking with the given id
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(400).json({
                error: "Booking not found"
            });
        }

        // Delete the booking
        await Booking.findByIdAndDelete(id);

        res.status(200).json({
            message: "Booking deleted successfully"
        });

    } catch (error) {

        res.status(400).json({
            error: error.message
        });

    }
}

// /api/bookings/getRefundAmount/:id
// COMPLETE
const getRefundAmount = async (req, res) => {

    const { id } = req.params;

    try {

        // Find the booking with the given id
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(400).json({
                error: "Booking not found"
            });
        }

        // Calculate the refund amount
        const refundAmount = booking.getRefund();

        res.status(200).json({
            "Refund": refundAmount
        });
        
    } catch (error) {

        res.status(400).json({
            error: error.message
        });

    }

}

// /api/bookings/all?roomType=A&roomNumber=101&startTime=t1&endTime=t2&id='xyz'
// COMPLETE
const getBookings = async (req, res) => {

    console.log("Find Bookings...");

    try {

        const { id, roomType, roomNumber, startTime, endTime } = req.query;

        if (id)
        {
            // Find a single booking with a bookingId
            const booking = await Booking.findById(id);
            return res.status(200).json({
                booking
            });
        }
        else
        {
            let filters = {};

            if (roomType) {
                filters.roomType = roomType;
            }
    
            if (roomNumber) {
                filters.roomNumber = roomNumber;
            }
    
            if(startTime && endTime) {
                filters.startTime = { $gte: startTime };
                filters.endTime = { $lte: endTime };
            }
    
            const bookings = await Booking.find(filters);
    
            return res.status(200).json({
                bookings
            });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};


module.exports = {
    bookRoom,
    updateBooking,
    deleteBooking,
    getBookings,
    getRefundAmount
};
