const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");


// ==========================
// Get Wishlist
// ==========================
exports.getWishlist = async (req, res) => {

    try {

        const wishlist = await Wishlist.findOne({

            user: req.user.id

        })
        .populate("products");


        if(!wishlist){

            return res.json({

                success:true,

                products:[]

            });

        }



        res.json({

            success:true,

            wishlist

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Add Product To Wishlist
// ==========================
exports.addToWishlist = async(req,res)=>{

    try{


        const {
            productId
        } = req.body;



        const product = await Product.findById(productId);



        if(!product){

            return res.status(404).json({

                success:false,

                message:"Product not found"

            });

        }



        let wishlist = await Wishlist.findOne({

            user:req.user.id

        });



        if(!wishlist){

            wishlist = await Wishlist.create({

                user:req.user.id,

                products:[]

            });

        }



        const alreadyAdded = wishlist.products.some(

            product => product.toString() === productId

        );



        if(alreadyAdded){

            return res.status(400).json({

                success:false,

                message:"Product already in wishlist"

            });

        }



        wishlist.products.push(productId);



        await wishlist.save();



        res.json({

            success:true,

            message:"Added to wishlist",

            wishlist

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Remove Product
// ==========================
exports.removeFromWishlist = async(req,res)=>{

    try{


        const wishlist = await Wishlist.findOne({

            user:req.user.id

        });



        if(!wishlist){

            return res.status(404).json({

                success:false,

                message:"Wishlist not found"

            });

        }



        wishlist.products = wishlist.products.filter(

            product => product.toString() !== req.params.productId

        );



        await wishlist.save();



        res.json({

            success:true,

            message:"Removed from wishlist",

            wishlist

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Check Wishlist Item
// ==========================
exports.checkWishlist = async(req,res)=>{

    try{


        const wishlist = await Wishlist.findOne({

            user:req.user.id

        });



        if(!wishlist){

            return res.json({

                success:true,

                exists:false

            });

        }



        const exists = wishlist.products.some(

            product => product.toString() === req.params.productId

        );



        res.json({

            success:true,

            exists

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Clear Wishlist
// ==========================
exports.clearWishlist = async(req,res)=>{

    try{


        const wishlist = await Wishlist.findOne({

            user:req.user.id

        });



        if(wishlist){

            wishlist.products = [];

            await wishlist.save();

        }



        res.json({

            success:true,

            message:"Wishlist cleared"

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};