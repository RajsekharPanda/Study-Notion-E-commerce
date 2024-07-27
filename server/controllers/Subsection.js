const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const uploadImageToCloudinary = require("../utils/imageUploader");

//create subsection
exports.createSubSection = async (req, res) => {
  try {
    //fetch data from req body
    const { title, timeDuration, description, sectionId } = req.body;
    //extract file/video
    const video = req.files.videoFile;
    //validation
    if (!title || !timeDuration || !description || !sectionId || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    //create subSection
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });
    //update section with this sub section objectId
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: SubSectionDetails._id,
        },
      },
      { new: true }
    );
    //log updated section here, after adding populate query
    //return response
    return res.status(200).json({
      success: true,
      message: "Sub section created successfully",
      updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//update subsection
//delete subsection
