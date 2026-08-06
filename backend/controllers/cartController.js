const Cart = require("../models/Cart");
const Product = require("../models/Product");


// ==========================
// Get User Cart
// ==========================
exports.getCart = async (req, res) => {

    try {

        const cart = await Cart.findOne({
            user: req.user.id
        })
        .populate("items.product");


        if (!cart) {

            return res.json({
                success: true,
                items: []
            });

        }


        res.json({

            success: true,

            cart

        });


    } catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Add Product To Cart
// ==========================
exports.addToCart = async (req,res)=>{

    try{

        const {
            productId,
            quantity
        } = req.body;


        const product = await Product.findById(productId);


        if(!product){

            return res.status(404).json({

                success:false,

                message:"Product not found"

            });

        }



        let cart = await Cart.findOne({

            user:req.user.id

        });



        if(!cart){

            cart = await Cart.create({

                user:req.user.id,

                items:[]

            });

        }



        const existingItem = cart.items.find(

            item => item.product.toString() === productId

        );



        if(existingItem){

            existingItem.quantity += quantity || 1;

        }else{

            cart.items.push({

                product:productId,

                quantity:quantity || 1

            });

        }



        await cart.save();



        res.json({

            success:true,

            message:"Product added to cart",

            cart

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Update Cart Quantity
// ==========================
exports.updateCart = async(req,res)=>{

    try{

        const {
            quantity
        } = req.body;



        const cart = await Cart.findOne({

            user:req.user.id

        });



        if(!cart){

            return res.status(404).json({

                success:false,

                message:"Cart not found"

            });

        }



        const item = cart.items.id(req.params.itemId);



        if(!item){

            return res.status(404).json({

                success:false,

                message:"Cart item not found"

            });

        }



        item.quantity = quantity;



        await cart.save();



        res.json({

            success:true,

            message:"Cart updated",

            cart

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Remove Cart Item
// ==========================
exports.removeFromCart = async(req,res)=>{

    try{


        const cart = await Cart.findOne({

            user:req.user.id

        });



        if(!cart){

            return res.status(404).json({

                success:false,

                message:"Cart not found"

            });

        }



        cart.items = cart.items.filter(

            item => item._id.toString() !== req.params.itemId

        );



        await cart.save();



        res.json({

            success:true,

            message:"Item removed",

            cart

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Clear Cart
// ==========================
exports.clearCart = async(req,res)=>{

    try{


        const cart = await Cart.findOne({

            user:req.user.id

        });



        if(cart){

            cart.items = [];

            await cart.save();

        }



        res.json({

            success:true,

            message:"Cart cleared"

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};