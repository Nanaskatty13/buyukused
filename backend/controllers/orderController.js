const Order = require("../models/Orders");
const Product = require("../models/Product");


// ==========================
// Create Order
// ==========================
exports.createOrder = async (req, res) => {

    try {

        const {
            items,
            shippingAddress,
            paymentMethod,
            paymentResult,
            totalAmount
        } = req.body;



        if (!items || items.length === 0) {

            return res.status(400).json({

                success:false,

                message:"No order items"

            });

        }



        const order = await Order.create({

            user: req.user.id,

            items,

            shippingAddress,

            paymentMethod,

            paymentResult,

            totalAmount

        });



        res.status(201).json({

            success:true,

            message:"Order created successfully",

            order

        });



    } catch(error) {

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Get My Orders
// ==========================
exports.getMyOrders = async(req,res)=>{

    try{


        const orders = await Order.find({

            user:req.user.id

        })
        .populate("items.product")
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
// Get Single Order
// ==========================
exports.getOrderById = async(req,res)=>{

    try{


        const order = await Order.findById(

            req.params.id

        )
        .populate("user","name email phone")
        .populate("items.product");



        if(!order){

            return res.status(404).json({

                success:false,

                message:"Order not found"

            });

        }



        res.json({

            success:true,

            order

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Update Order Status
// ==========================
exports.updateOrderStatus = async(req,res)=>{

    try{


        const {
            status
        } = req.body;



        const order = await Order.findById(

            req.params.id

        );



        if(!order){

            return res.status(404).json({

                success:false,

                message:"Order not found"

            });

        }



        order.status = status;


        if(status === "Delivered"){

            order.deliveredAt = Date.now();

        }


        await order.save();



        res.json({

            success:true,

            message:"Order status updated",

            order

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Get All Orders (Admin)
// ==========================
exports.getAllOrders = async(req,res)=>{

    try{


        const orders = await Order.find()

        .populate("user","name email phone")

        .populate("items.product")

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
// Delete Order
// ==========================
exports.deleteOrder = async(req,res)=>{

    try{


        const order = await Order.findByIdAndDelete(

            req.params.id

        );



        if(!order){

            return res.status(404).json({

                success:false,

                message:"Order not found"

            });

        }



        res.json({

            success:true,

            message:"Order deleted successfully"

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};