// // routes/bookings.js

// const express = require("express");
// const router = express.Router();
// const Booking = require("../models/Booking");

// routes/bookings.js

const express = require('express');
const router = express.Router();
const { bookRoom, getBookings, updateBooking, deleteBooking, filterBookings } = require('../controllers/Booking.js');

router.post('/create', bookRoom);
router.get('/get', getBookings);
router.get('/all', bookingsController.getAllBookings);
router.patch('/api/update/:id', updateBooking);
router.delete('/delete/:id', deleteBooking);
router.get('/filter', filterBookings);
// router.get('/view', bookingsController.viewBookings);



// // Get all bookings
// router.get("/", async (req, res, next) => {
//     try {
//         // Retrieve all bookings from the database
//         const bookings = await Booking.find();

//         // Filter bookings by room type
//         if (req.query.roomType) {
//             bookings = bookings.filter(
//                 (booking) => booking.roomType === req.query.roomType
//             );
//         }

//         // Filter bookings by start time
//         if (req.query.startTime) {
//             bookings = bookings.filter(
//                 (booking) => booking.startTime >= req.query.startTime
//             );
//         }

//         // Filter bookings by end time
//         if (req.query.endTime) {
//             bookings = bookings.filter(
//                 (booking) => booking.endTime <= req.query.endTime
//             );
//         }

//         // Return the filtered bookings in the response
//         res.json(bookings);
//     } catch (err) {
//         next(err);
//     }
// });

// module.exports = router;
