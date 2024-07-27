const Tag = require("../models/category");

//create tag handler function 
exports.createCategory = async (req,res) =>{
   try {
      //fetch data
      const {name, description} = req.body;
      //validation
      if (!name || !description) {
         return res.status(400).json({
            success:false,
            message:"All fields are required",
         })
      }

      //create entry in DB
      const categoryDetails = await Category.create({
         name:name,
         description:description,
      });
      console.log(categoryDetails);

      //return response
      return res.status(200).json({
         success:true,
         message:"Categoies created successfully",
      })

   } catch (error) {
      return res.status(500).json({
         success:false,
         message:error.message,
      })
   }
}

//getAllCategories handler function
exports.showAllCategory = async (req,res) =>{
   try {
      const allCategories = await Category.find({},{name:true, description:true})
      res.status(200).json({
         success:true,
         message:'All Categories returned successfully',
         allCategories,
      })
   } catch (error) {
      return res.status(500).json({
         success:false,
         message:error.message,
      }) 
   }
}