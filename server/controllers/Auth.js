const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
//send OTP
exports.sendOTP = async function (req, res) {
  try {
    //fetch email from body
    const { email } = req.body;

    //check if user already present in db
    const checkUserPresent = await User.findOne({ email });

    //if user exists return response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
    }

    //generate OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated", otp);

    //check if OTP is unique
    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      console.log("OTP generated", otp);
    }

    const otpPayload = { email, otp };

    //insert OTP in db
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return response successfully
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signUp
exports.signup = async (req, res) => {
  try {
    //data fetch from req.body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //validate the data which is fetched
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //match for password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm password values do not match, please try again",
      });
    }

    //check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists, sign in",
      });
    }

    // find most recent otp sent
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);

    //validate otp
    if (recentOtp.length == 0) {
      //otp not found
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp) {
      //invalid otp
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create entry in db
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    //return res
    return res.status(200).json({
      success: true,
      message: "User is registered Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered, please try again",
    });
  }
};

//login
exports.login = async (req, res) => {
  try {
    // get data from body
    const { email, password } = req.body;

    //validate data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are reqire, please try again",
      });
    }
    //check for user (exist or not)
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please signup",
      });
    }
    //check password and create jwt Token
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      //create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "login failure, please try again",
    });
  }
};

//changepassword
exports.changepassword = async (req, res) => {
  // get data from req.body
  const { oldPassword, newPassword, confirmPassword } = req.body;
  //validate data
  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(403).json({
      success: false,
      message: "All fields are reqire, please try again",
    });
  }
  //check for user (exist or not)
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User is not registered, please signup",
    });
  }
  //check password and create jwt Token
  if (await bcrypt.compare(oldPassword, user.password)) {
    if (newPassword === confirmPassword) {
      //Hash Password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "New password and confirm password does not match",
      });
    }
  }
};
