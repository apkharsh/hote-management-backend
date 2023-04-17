const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

// Middleware
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }));


// Connect to MongoDB
const connectionUrl = "mongodb+srv://apkharsh:apk.DEV@maincluster.19ywzbx.mongodb.net/test"
mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// import all routes
const roomRoutes = require("./routes/booking.js");

// now use these routes
app.use("/api", roomRoutes);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

app.get("/", (req, res) => {
    res.send("Hello World!");
});



