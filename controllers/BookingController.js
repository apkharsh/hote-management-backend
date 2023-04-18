// In controllers/bookings.js
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { get_available_rooms, send_email } = require("./Helper");

// /api/bookings/create
// COMPLETE
const bookRoom = async (req, res) => {
    const { username, email, roomType, startTime, endTime, roomNumber } = req.body;

    if (!username || !email || !roomType || !startTime || !endTime) {
        return res.status(400).json({
            error: "Please enter all the fields",
        });
    } else {
        // If room number is given, check that exact room
        if (roomNumber == null) {
            // Get available rooms
            let available_rooms = await get_available_rooms(
                startTime,
                endTime,
                roomType
            );

            if (available_rooms.length == 0) {
                return res.status(400).json({
                    error: "No rooms available",
                });
            } else {
                // Pick the first room
                const roomID = available_rooms[0];

                // Get the Price of the room
                const room = await Room.findById(roomID);
                const price = room.price;
                const numHours = Math.ceil((endTime - startTime) / 3600000);
                const totalPrice = price * numHours;

                // Create a new booking
                const booking = new Booking({
                    roomID: roomID,
                    userName: username,
                    email: email,
                    checkInTime: startTime,
                    checkOutTime: endTime,
                    totalPrice: totalPrice,
                });

                // Save the booking
                await booking.save();

                // Populate and send the booking
                const populated_booking = await Booking.findById(
                    booking._id
                ).populate("roomID");

                // SEND EMAIL TO USER REGARDING THE BOOKING
                await send_email(populated_booking);

                res.status(200).json({
                    message: "Booking successful",
                    booking: populated_booking,
                });
            }
        } else {
            // roomNumber is given, check that exact room

            // Get available rooms
            let available_rooms = await get_available_rooms(
                startTime,
                endTime,
                roomType
            );

            // get room with roomNumber
            const room_wanted = await Room.findOne({ roomNumber: roomNumber });

            available_rooms = available_rooms.map((room_id) =>
                room_id.toString()
            );

            if (available_rooms.includes(room_wanted._id.toString())) {
                // Book the room
                const roomID = room_wanted._id;

                // Get the Price of the room
                const price = room_wanted.price;
                const numHours = Math.ceil((endTime - startTime) / 3600000);
                const totalPrice = price * numHours;

                // Create a new booking
                const booking = new Booking({
                    roomID: roomID,
                    userName: username,
                    email: email,
                    checkInTime: startTime,
                    checkOutTime: endTime,
                    totalPrice: totalPrice,
                });

                // Save the booking
                await booking.save();

                // Populate and send the booking
                const populated_booking = await Booking.findById(
                    booking._id
                ).populate("roomID");

                // SEND EMAIL TO USER REGARDING THE BOOKING
                await send_email(populated_booking);

                res.status(200).json({
                    message: "Booking successful",
                    booking: populated_booking,
                });
            } else {
                // Room not available
                res.status(400).json({
                    error: "Room not available",
                });
            }
        }
    }
};

// /api/bookings/update/:id
// TODO. beta mode
const updateBooking = async (req, res) => {

    const { email, username, startTime, endTime, roomNumber } = req.body;
    
    // Get the booking with the given id
    // Check if the booking exists
    const { id } = req.params;

    const booking = await Booking.findById(id);
    const prevBooking = booking;

    // if booking not found on that id
    if (!booking) {
        return res.status(400).json({
            error: "Booking not found",
        });
    }
    else {
        // if booking is found check which fields are changed
        var changes = {
            email: booking.email,
            userName: booking.userName,
            startTime: booking.checkInTime,
            endTime: booking.checkOutTime,
            // roomNumber: booking.roomID.roomNumber
        };

        if (email != null) {
            changes.email = email;
        }
        if (username != null) {
            changes.userName = username;
        }
        if (startTime != null) {
            changes.startTime = startTime;
        }
        if (endTime != null) {
            changes.endTime = endTime;
        }

        // if (roomNumber != null) {
        //     changes.newRoomNumber = roomNumber;
        // }

        console.log(changes);

        // first delete the current room and then check the available_rooms for the new changes
        await Booking.findByIdAndDelete(id);

        // now check the available_rooms for the new changes
        let available_rooms = await get_available_rooms(
            changes.startTime,
            changes.endTime,
            booking.roomID.roomType
        );

        if(available_rooms.length == 0){
            // if no rooms are available then revert back to the previous booking
            await Booking.create(prevBooking);
            
            return res.status(400).json({
                error: "No rooms available",
            });
        } 
        else {
            
            // now create a new booking with the new changes
            const roomID = available_rooms[0];

            // Get the Price of the room
            const price = prevBooking.roomID.price;
            console.log(price);
            console.log(typeof price);
            const numHours = Math.ceil((changes.endTime - changes.startTime) / 3600000);
            const totalPrice = price * numHours;

            const newBooking = new Booking({
                roomID: roomID,
                userName: changes.userName,
                email: changes.email,
                checkInTime: changes.startTime,
                checkOutTime: changes.endTime,
                totalPrice: totalPrice,
            });

            // Save the booking
            // await newBooking.save();
            // // Populate and send the booking

            // // send email to the user regarding the booking
            // await send_email(newBooking);
            // return res.status(200).json({
            //     message: "Booking updated successfully",
            //     booking: newBooking,
            // });
        }
    }
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
                error: "Booking not found",
            });
        }

        // Delete the booking
        await Booking.findByIdAndDelete(id);

        res.status(200).json({
            message: "Booking deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};

// /api/bookings/getRefundAmount/:id
// COMPLETE
const getRefundAmount = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the booking with the given id
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(400).json({
                error: "Booking not found",
            });
        }

        // Calculate the refund amount
        const refundAmount = booking.getRefund();

        res.status(200).json({
            Refund: refundAmount,
        });
    } catch (error) {
        res.status(400).json({
            error: error.message,
        });
    }
};

// /api/bookings/all?roomType=A&roomNumber=101&startTime=t1&endTime=t2&id='xyz'
// COMPLETE
const getBookings = async (req, res) => {
    console.log("Find Bookings...");

    try {
        const { id, roomType, roomNumber, startTime, endTime } = req.query;

        if (id) {
            // Find a single booking with a bookingId
            const booking = await Booking.findById(id);

            // Populate the room
            const populated_booking = await Booking.findById(
                booking._id
            ).populate("roomID");

            return res.status(200).json({
                booking: populated_booking,
            });
        } else {
            let filters = {};

            if (roomType) {
                filters.roomType = roomType;
            }

            if (roomNumber) {
                filters.roomNumber = roomNumber;
            }

            if (startTime && endTime) {
                filters.startTime = { $gte: startTime };
                filters.endTime = { $lte: endTime };
            }

            const bookings = await Booking.find(filters);

            // Populate the rooms
            for (let i = 0; i < bookings.length; i++) {
                const populated_booking = await Booking.findById(
                    bookings[i]._id
                ).populate("roomID");
                bookings[i] = populated_booking;
            }

            return res.status(200).json({
                bookings,
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
    getRefundAmount,
};
