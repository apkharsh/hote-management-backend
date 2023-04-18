const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bookingRoutes = require("./routes/bookingRoutes.js");
const roomRoutes = require("./routes/roomRoutes.js");
const colors = require("colors");

const app = express();

// Middleware
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
const connectionUrl = "mongodb+srv://apkharsh:apk.DEV@maincluster.19ywzbx.mongodb.net/test"
mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// now use these routes
app.use("/api/bookings/", bookingRoutes);
app.use("/api/rooms/", roomRoutes);

// TEST PURPOSES
app.get("/", (req, res) => {
    res.send("Hello World!");
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB!"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
