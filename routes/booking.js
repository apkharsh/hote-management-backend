const express = require("express");
const router = express.Router();
// const { bookRoom, getBookings, updateBooking, deleteBooking, filterBookings } = require('../controllers/Booking.js');
const bookingsController = require("../controllers/Booking.js");

const bookRoom = bookingsController.bookRoom;
const updateBooking = bookingsController.updateBooking;
const getAllBookings = bookingsController.getAllBookings;
const deleteBooking = bookingsController.deleteBooking;

router.post("/create", bookRoom);
router.get("/update", updateBooking);
router.get("/all", getAllBookings);
// router.patch('/update/:id', updateBooking);
router.delete("/delete/:id", deleteBooking);
// router.get('/filter', filterBookings);
// router.get('/view', bookingsController.viewBookings);

module.exports = router;
