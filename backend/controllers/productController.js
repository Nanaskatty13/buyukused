const Product = require("../models/Product");


// ==========================
// Get All Products
// ==========================
exports.getProducts = async (req, res) => {

    try {

        const {
            search,
            category,
            page = 1,
            limit = 12
        } = req.query;


        let query = {};


        // Search
        if (search) {

            query.$or = [

                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];

        }



        // Category filter
        if(category){

            query.category = category;

        }



        const products = await Product.find(query)

            .populate("seller", "name email phone")

            .limit(limit * 1)

            .skip((page - 1) * limit)

            .sort({
                createdAt:-1
            });



        const total = await Product.countDocuments(query);



        res.json({

            success:true,

            products,

            pagination:{

                currentPage:Number(page),

                totalPages:Math.ceil(total / limit),

                totalProducts:total

            }

        });



    } catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Get Single Product
// ==========================
exports.getProductById = async(req,res)=>{

    try{


        const product = await Product.findById(

            req.params.id

        )
        .populate("seller","name email phone");



        if(!product){

            return res.status(404).json({

                success:false,

                message:"Product not found"

            });

        }



        res.json({

            success:true,

            product

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Create Product
// ==========================
exports.createProduct = async(req,res)=>{

    try{


        const product = await Product.create({

            ...req.body,

            seller:req.user.id

        });



        res.status(201).json({

            success:true,

            message:"Product created successfully",

            product

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Update Product
// ==========================
exports.updateProduct = async(req,res)=>{

    try{


        const product = await Product.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new:true,
                runValidators:true
            }

        );



        if(!product){

            return res.status(404).json({

                success:false,

                message:"Product not found"

            });

        }



        res.json({

            success:true,

            message:"Product updated successfully",

            product

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Delete Product
// ==========================
exports.deleteProduct = async(req,res)=>{

    try{


        const product = await Product.findByIdAndDelete(

            req.params.id

        );



        if(!product){

            return res.status(404).json({

                success:false,

                message:"Product not found"

            });

        }



        res.json({

            success:true,

            message:"Product deleted successfully"

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Update Stock
// ==========================
exports.updateStock = async(req,res)=>{

    try{


        const {
            stock
        } = req.body;



        const product = await Product.findByIdAndUpdate(

            req.params.id,

            {
                stock
            },

            {
                new:true
            }

        );



        if(!product){

            return res.status(404).json({

                success:false,

                message:"Product not found"

            });

        }



        res.json({

            success:true,

            message:"Stock updated",

            product

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Get Seller Products
// ==========================
exports.getSellerProducts = async(req,res)=>{

    try{


        const products = await Product.find({

            seller:req.user.id

        })
        .sort({
            createdAt:-1
        });



        res.json({

            success:true,

            products

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};