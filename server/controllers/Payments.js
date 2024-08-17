const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//capture the payment amd initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  //get courseId and userId
  const { course_id } = req.body;
  const user_id = req.user.id;
  //validation
  //valid courseId
  if (!course_id) {
    return res.json({
      success: false,
      message: "Please provide valid course ID",
    });
  }
  //valid courseDetail
  let course;
  try {
    course = await Course.findById(course_id);
    if (!course) {
      return res.json({
        success: false,
        message: "Course not found",
      });
    }

    //user already pay for the same course
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "You have already paid for this course",
      });
    }
  } catch (error) {
   console.error(error)
   return res.status(500).json({
    success: false,
    message: error.message,
   })
  }
  //create order
  const amount = course.price ;
  const currency = "INR" ;

  const options = {
   amount:amount*100,
   currency,
   receipt:Math.random(Date.now()).toString(),
   notes:{
      courseId:course_id,
      userId:user_id,
   }
  };
  try {
   //initiate the payment using razorpay
   const paymentResponse = await instance.orders.create(options);
   console.log(paymentResponse);
   //return response
   return res.status(200).json({
    success: true,
    courseName:course.courseName,
    courseDescription:course.courseDescription,
    thumbnail:course.thumbnail,
    orderId:paymentResponse.id,
    currency:paymentResponse.currency,
    amount:paymentResponse.amount,
   })
  } catch (error) {
   console.log(error)
   res.json({
      success: false,
      message: "Could not initiate order",
   })
  }
  

};



//verify signature of Razorpay and server
exports.verifySignature = async (req, res) => {
   const webhookSecret = "12345678";

   const signature = req.headers["x-razorpay-signature"];

   const shasum = crypto.createHmac("sha256", webhookSecret)
   shasum.update(JSON.stringify(req.body));
   const digest = shasum.digest("hex");


   if (signature === digest) {
      console.log("Payment is authorised")

      const {courseid, userId} = req.body.payload.payment.entity.notes
      
      try {
        //fulfil the action

        //find the course and enroll the student
        const enrolledCourse = await Course.findOneAndUpdate({_id:courseId},{$push:{studentsEnrolled:userId}},{new:true});
        if (!enrolledCourse) {
          return res.status(500).json({
            success: false,
            message: "Course not found",
          });
        }

        console.log(enrolledCourse)

        //find the student and add the course to their list enrolledCourses by me
        const enrolledStudent = await User.findOneAndUpdate({_id:userId},{$push:{courses:courseId}},{new:true});
        console.log(enrolledStudent);

        //sent the conformation mail
        const emailResponse = await mailSender(enrolledStudent.email, "Congratulation from StudyNotion","Congratulation, you are onboarded into new course", )
        console.log(emailResponse)
        return res.status(200).json({
          success: true,
          message: "Signature verified and course enrolled successfully",
        }); 
      } catch (error) {
        console.log(error)
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
   }
   else{
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
   }
}