const express = require("express");
const mongoose = require("mongoose");
const app = express();
const router = require("./routes/booking");

// Connect to MongoDB
const connectionUrl = "mongodb+srv://apkharsh:apk.DEV@maincluster.19ywzbx.mongodb.net/test"
mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use("/create", router);


const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

app.get("/", (req, res) => {
    res.send("Hello World!");
});



