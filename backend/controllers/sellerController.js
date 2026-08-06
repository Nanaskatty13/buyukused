const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Orders");



// ==========================
// Become Seller
// ==========================
exports.registerSeller = async (req, res) => {

    try {

        const {
            shopName,
            description,
            phone,
            location
        } = req.body;


        const user = await User.findById(req.user.id);


        if(!user){

            return res.status(404).json({

                success:false,

                message:"User not found"

            });

        }


        user.shopName = shopName;
        user.shopDescription = description;
        user.phone = phone || user.phone;
        user.location = location || user.location;

        user.role = "seller";


        await user.save();



        res.json({

            success:true,

            message:"Seller account created successfully",

            seller:user

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Get Seller Profile
// ==========================
exports.getSellerProfile = async(req,res)=>{

    try{


        const seller = await User.findById(

            req.user.id

        )
        .select("-password");



        if(!seller){

            return res.status(404).json({

                success:false,

                message:"Seller not found"

            });

        }



        res.json({

            success:true,

            seller

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Update Seller Profile
// ==========================
exports.updateSellerProfile = async(req,res)=>{

    try{


        const {

            shopName,

            shopDescription,

            phone,

            location,

            avatar

        } = req.body;



        const seller = await User.findByIdAndUpdate(

            req.user.id,

            {

                shopName,

                shopDescription,

                phone,

                location,

                avatar

            },

            {
                new:true
            }

        )
        .select("-password");



        res.json({

            success:true,

            message:"Seller profile updated",

            seller

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Seller Dashboard Stats
// ==========================
exports.getSellerDashboard = async(req,res)=>{

    try{


        const products = await Product.countDocuments({

            seller:req.user.id

        });



        const orders = await Order.find({

            "items.seller":req.user.id

        });



        let totalSales = 0;


        orders.forEach(order=>{

            order.items.forEach(item=>{

                if(item.seller?.toString() === req.user.id){

                    totalSales += item.price * item.quantity;

                }

            });

        });



        res.json({

            success:true,

            stats:{

                products,

                orders:orders.length,

                totalSales

            }

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
exports.getMyProducts = async(req,res)=>{

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



// ==========================
// Seller Orders
// ==========================
exports.getSellerOrders = async(req,res)=>{

    try{


        const orders = await Order.find({

            "items.seller":req.user.id

        })
        .populate(
            "user",
            "name email phone"
        )
        .sort({

            createdAt:-1

        });



        res.json({

            success:true,

            orders

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Seller Earnings
// ==========================
exports.getSellerEarnings = async(req,res)=>{

    try{


        const orders = await Order.find({

            "items.seller":req.user.id

        });



        let earnings = 0;



        orders.forEach(order=>{

            order.items.forEach(item=>{


                if(
                    item.seller &&
                    item.seller.toString() === req.user.id
                ){

                    earnings += item.price * item.quantity;

                }


            });


        });



        res.json({

            success:true,

            earnings

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};