const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
// exports.auth = async (req, res, next) => {
//   try {
//     //extract token
//     const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ", "");
//     // const token = req.header("Authorisation")
//     //send response if token is missing
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Token is missing',
//       })
//     }

//     console.log("backend token:" + token);
//     //verify token
//     try {
//       console.log(process.env.JWT_SECRET)
//       const decode = await jwt.verify(token, process.env.JWT_SECRET);
//       console.log("decode code", decode);
//       req.user = decode;
//     } catch (error) {
//       //verification issues
//       console.log(error.message);
//       return res.status(401).json({
//         success: false,
//         message: 'token is invalid',
//       });
//     }
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: 'Something went wrong while validating the token',
//     });
//   }
// }

exports.auth = async (req, res, next) => {
  try {
    // Extract token
    let token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "");
    // const token = req.header("Authorization")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    try {
      console.log(process.env.JWT_SECRET);
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      console.log("decode code", decode);
      req.user = decode;
    } catch (error) {
      console.log(error.message);
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

//isStudent
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for students only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
    });
  }
};
//isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Instructor only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
    });
  }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admins only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
    });
  }
};
