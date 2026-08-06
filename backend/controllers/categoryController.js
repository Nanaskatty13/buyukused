const Category = require("../models/Category");


// ==========================
// Get All Categories
// ==========================
exports.getCategories = async (req, res) => {

    try {

        const categories = await Category.find()
            .sort({ createdAt: -1 });


        res.json({

            success: true,

            categories

        });


    } catch(error) {

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Get Single Category
// ==========================
exports.getCategory = async (req,res)=>{

    try{

        const category = await Category.findById(
            req.params.id
        );


        if(!category){

            return res.status(404).json({

                success:false,

                message:"Category not found"

            });

        }


        res.json({

            success:true,

            category

        });


    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Create Category
// ==========================
exports.createCategory = async(req,res)=>{

    try{

        const {
            name,
            description,
            image
        } = req.body;



        const existingCategory = await Category.findOne({
            name
        });



        if(existingCategory){

            return res.status(400).json({

                success:false,

                message:"Category already exists"

            });

        }



        const category = await Category.create({

            name,

            description,

            image

        });



        res.status(201).json({

            success:true,

            message:"Category created successfully",

            category

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Update Category
// ==========================
exports.updateCategory = async(req,res)=>{

    try{


        const category = await Category.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new:true,
                runValidators:true
            }

        );



        if(!category){

            return res.status(404).json({

                success:false,

                message:"Category not found"

            });

        }



        res.json({

            success:true,

            message:"Category updated successfully",

            category

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Delete Category
// ==========================
exports.deleteCategory = async(req,res)=>{

    try{


        const category = await Category.findByIdAndDelete(

            req.params.id

        );



        if(!category){

            return res.status(404).json({

                success:false,

                message:"Category not found"

            });

        }



        res.json({

            success:true,

            message:"Category deleted successfully"

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};