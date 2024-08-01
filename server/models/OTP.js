const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3000,
  },
});

// func to send email.
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from Study Notion",
      otp
    );
    console.log("Mail sent successfully", mailResponse);
  } catch (error) {
    console.log("error occured while sending OTP", error);
    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  console.log("New document saved to database");
  await sendVerificationEmail(this.email, this.otp);
  next();
});
const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
