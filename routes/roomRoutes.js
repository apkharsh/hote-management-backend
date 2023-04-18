const express = require('express');
const router = express.Router();

const { createRoom, deleteRoom, getAllRooms, deleteRoomByNumber } = require('../controllers/RoomController.js');

// BASE: /api/rooms/
router.get('/all', getAllRooms); // Search Params will be used
router.post('/create', createRoom);
router.delete('/delete/:id', deleteRoom);
router.delete('/deleteByNumber/:roomNumber', deleteRoomByNumber);

module.exports = router;