const Booking = require("../models/Booking");
const Room = require("../models/Room");
const nodemailer = require("nodemailer");

const get_available_rooms = async (start_time, end_time, type_preference=null) => {

    const bookings = await Booking.find({
        $or:[
            {
                $and: [
                    { checkInTime: { $lte: start_time } },
                    { checkOutTime: { $gte: start_time } },
                ]
            },
            {
                $and: [
                    { checkInTime: { $lte: end_time } },
                    { checkOutTime: { $gte: end_time } },
                ]
            }
        ]
    });

    const booked_rooms = bookings.map((booking) => booking.roomID);

    if(type_preference != null)
    {
        const available_rooms = await Room.find({
            $and: [
                { _id: { $nin: booked_rooms } },
                { roomType: type_preference },
            ],
        });

        // Return IDs of available rooms
        return available_rooms.map((room) => room._id);
    }
    else {
        const available_rooms = await Room.find({
             _id: { $nin: booked_rooms }
        });

        // Return IDs of available rooms
        return available_rooms.map((room) => room._id);
    }
}


const send_email = async (booking) => {

    const email = booking.email;
    const userName = booking.userName;
    const checkInTime = booking.checkInTime;
    const checkOutTime = booking.checkOutTime;
    const roomNumber = booking.roomID.roomNumber;

    console.log("Sending email to: ", email);

    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "apk.harsh.dev@gmail.com",
            pass: "gawoyqwegkcdtvjb"
        }
    });

    // Create the email
    const mailOptions = {
        from: "apk.harsh.dev@gmail.com",
        to: email,
        secure: false,
        subject: "Booking Confirmed",
        text: `Hello ${userName},\n\nYour booking has been confirmed.\n\nRoom Number: ${roomNumber}\nCheck In Time: ${checkInTime}\nCheck Out Time: ${checkOutTime}\n\nThank you for choosing us.`
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, data) => {
        if(err)
        {
            console.log("Error: ", err);
        }
        else
        {
            console.log("Email sent successfully");
        }
    });
}


// Export the function
module.exports = {
    get_available_rooms,
    send_email
}