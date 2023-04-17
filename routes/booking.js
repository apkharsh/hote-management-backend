const express = require("express");
const { Booking, Room } = require("../models");

const router = express.Router();

router.get("/", async (req, res) => {
    const bookings = await Booking.find().populate("room");
    res.json(bookings);
});

router.post("/", async (req, res) => {
    const { user, room, startTime, endTime } = req.body;

    // Check if the room is available for the given time period
    const existingBooking = await Booking.findOne({
        room,
        $or: [
            {
                startTime: {
                    $lte: startTime,
                },
                endTime: {
                    $gte: startTime,
                },
            },
            {
                startTime: {
                    $lte: endTime,
                },
                endTime: {
                    $gte: endTime,
                },
            },
            {
                startTime: {
                    $gte: startTime,
                },
                endTime: {
                    $lte: endTime,
                },
            },
        ],
    });

    if (existingBooking) {
        return res.status(400).json({
            error: "Room is not available for the given time period",
        });
    }

    // Create the new booking
    const booking = new Booking({
        user,
        room,
        startTime,
        endTime,
    });
    await booking.save();

    res.json(booking);
});

router.put("/:id", async (req, res) => {
    const { user, room, startTime, endTime } = req.body;

    // Check if the room is available for the updated time period
    const existingBooking = await Booking.findOne({
        room,
        _id: {
            $ne: req.params.id,
        },
        $or: [
            {
                startTime: {
                    $lte: startTime,
                },
                endTime: {
                    $gte: startTime,
                },
            },
            {
                startTime: {
                    $lte: endTime,
                },
                endTime: {
                    $gte: endTime,
                },
            },
            {
                startTime: {
                    $gte: startTime,
                },
                endTime: {
                    $lte: endTime,
                },
            },
        ],
    });

    if (existingBooking) {
        return res.status(400).json({
            error: "Room is not available for the updated time period",
        });
    }

    // Update the booking
    const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        {
            user,
            room,
            startTime,
            endTime,
        },
        {
            new: true,
        }
    );

    res.json(booking);
});

// Delete a booking by ID
router.delete("/:bookingId", async (req, res) => {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    const startTime = new Date(booking.startTime);
    const currentTime = new Date();

    // Check if booking can be cancelled
    if (startTime - currentTime <= 48 * 60 * 60 * 1000) {
        booking.status = "Cancelled";
        booking.cancelledAt = new Date();

        // Calculate refund
        let refundAmount = 0;
        if (startTime - currentTime >= 24 * 60 * 60 * 1000) {
            refundAmount = booking.totalPrice / 2;
        }

        booking.refundAmount = refundAmount;

        // Update booking in database
        await booking.save();

        return res.json({
            message: "Booking cancelled successfully",
            refundAmount,
        });
    } else {
        // If booking cannot be cancelled, return error message
        return res.status(400).json({ message: "Booking cannot be cancelled" });
    }
});

module.exports = router;
