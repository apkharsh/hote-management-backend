// In controllers/bookings.js

const Booking = require("../models/Booking");

// bookRoom route is working fine
const bookRoom = async (req, res) => {
    const { email, roomType, date, startTime, endTime } = req.body;

    // Check if the requested room is available for the requested time period
    const isAvailable = await Booking.isRoomAvailable(
        roomType,
        date,
        startTime,
        endTime
    );

    console.log(req.body)
    console.log('bhai yha tak to phochgye')

    if (!isAvailable) {
        return res.status(400).json({
            error: "The requested room is not available for the requested time period",
        });
    }

    // Calculate the total price based on the room type and duration
    const duration = (endTime - startTime) / 3600000; // convert milliseconds to hours
    let price;
    switch (roomType) {
        case "A":
            price = duration * 100;
            break;
        case "B":
            price = duration * 80;
            break;
        case "C":
            price = duration * 50;
            break;
        default:
            return res.status(400).json({ error: "Invalid room type" });
    }

    // Create a new booking model

    const booking = new Booking({
        email: email,
        roomType: roomType,
        date: date,
        startTime: startTime,
        endTime: endTime,
        totalPrice: price,
    });

    console.log(booking)
    console.log("end of book room")

    try {
        await booking.save();
        res.status(201).json({
            message: "Booking created successfully",
            booking,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const updateBooking = async (req, res) => {
    const { bookingId, email, roomType, date, startTime, endTime } = req.body;

    try {
        // Check if the booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(400).json({ error: "Booking not found" });
        }

        // Check if the requested room type is available for the requested time period on that day
        const isAvailable = await Booking.isRoomAvailable(
            roomType,
            date,
            startTime,
            endTime,
            bookingId
        );

        if (!isAvailable) {
            return res.status(400).json({
                error: "The requested room is not available for the requested time period",
            });
        }

        // Update the booking details
        booking.email = email;
        booking.roomType = roomType;
        booking.date = date;
        booking.startTime = startTime;
        booking.endTime = endTime;

        // Calculate the new total price based on the updated booking details
        const duration = (endTime - startTime) / 3600000; // convert milliseconds to hours

        switch (roomType) {
            case "A":
                booking.totalPrice = duration * 100;
                break;
            case "B":
                booking.totalPrice = duration * 80;
                break;
            case "C":
                booking.totalPrice = duration * 50;
                break;
            default:
                return res.status(400).json({ error: "Invalid room type" });
        }

        // Save the updated booking and return a response with the updated booking details and total price
        await booking.save();

        res.status(200).json({
            message: "Booking updated successfully",
            booking,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getRefundAmount = (startTime, endTime, price) => {
    const now = new Date();
    const diffHours = Math.round((startTime - now) / (1000 * 60 * 60));

    if (diffHours > 48) {
        return price;
    } else if (diffHours > 24) {
        return price / 2;
    } else {
        return 0;
    }
};

const deleteBooking = async (req, res, next) => {
    try {
        // we are passing email instead id
        // find if booking exists with current email
        const booking = await Booking.findOne({ email: req.params.id });
        // const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        const startTime = new Date(booking.startTime);
        const currentTime = now.getTime();
        const bookingDate = new Date(booking.date);
        const Today = new Date();

        
        if(bookingDate < Today){
            return res.status(400).json({ error: "Cannot cancel past bookings" });
        }

        if (startTime > now) {
            const refundAmount = getRefundAmount(
                startTime,
                booking.endTime,
                booking.price
            );

            await Booking.deleteOne({ _id: booking._id });

            if (refundAmount > 0) {
                return res.json({ message: "Booking cancelled", refundAmount });
            } else {
                return res.json({ message: "Booking cancelled" });
            }
        } else {
            return res
                .status(400)
                .json({ error: "Cannot cancel past bookings" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Server error" });
    }
};

// GET /bookings/filter?roomType=:roomType&startTime=:startTime&endTime=:endTime
const filterBookings = async (req, res) => {
    const { roomType, startTime, endTime } = req.query;

    let query = {};
    if (roomType) {
        query.roomType = roomType;
    }
    if (startTime || endTime) {
        query.startDate = {};
        if (startTime) {
            query.startDate.$gte = new Date(startTime);
        }
        if (endTime) {
            query.startDate.$lte = new Date(endTime);
        }
    }

    const bookings = await Booking.find(query);
    return res.json(bookings);
};

// this is working
const getAllBookings = async (req, res) => {
    console.log("get all bookings")
    try {
        const { roomType, roomNumber, startDate, endDate } = req.query;

        let filters = {};

        if (roomType) {
            filters.roomType = roomType;
        }

        if (roomNumber) {
            filters.roomNumber = roomNumber;
        }

        if (startDate && endDate) {
            filters.startTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const bookings = await Booking.find(filters);

        return res.status(200).json({
            bookings,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};

const viewBookings = async (req, res) => {
    try {
        const { roomNumber, roomType, start, end } = req.query;

        let bookings = await Booking.find();

        // Apply filters
        if (roomNumber) {
            bookings = bookings.filter(
                (booking) => booking.roomNumber === roomNumber
            );
        }
        if (roomType) {
            bookings = bookings.filter(
                (booking) => booking.roomType === roomType
            );
        }
        if (start) {
            bookings = bookings.filter(
                (booking) => booking.startTime >= new Date(start)
            );
        }
        if (end) {
            bookings = bookings.filter(
                (booking) => booking.endTime <= new Date(end)
            );
        }

        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    bookRoom,
    updateBooking,
    deleteBooking,
    getRefundAmount,
    filterBookings,
    getAllBookings
    // viewBookings
};
