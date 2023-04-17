const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    number: { type: Number, required: true, unique: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;

// initially i have fixed amount of room numbers so what should i do to use that room numbers in my code
