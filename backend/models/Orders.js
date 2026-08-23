const mongoose = require("mongoose");



const orderSchema = new mongoose.Schema(

    {


        // Customer who placed order
        user: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true

        },


        // Products inside order
        items: [

            {

                product: {

                    type: mongoose.Schema.Types.ObjectId,

                    ref: "Product",

                    required: true

                },


                seller: {

                    type: mongoose.Schema.Types.ObjectId,

                    ref: "User"

                },


                name: {

                    type: String,

                    required: true

                },


                image: {

                    type: String,

                    default: ""

                },


                quantity: {

                    type: Number,

                    required: true,

                    default: 1

                },


                price: {

                    type: Number,

                    required: true

                }


            }

        ],



        // Total amount
        totalAmount: {

            type: Number,

            required: true

        },



        // Payment information
        payment: {


            method: {

                type: String,

                enum: [

                    "cash",

                    "paystack",

                    "mobile_money",

                    "card"

                ],

                default: "paystack"

            },


            reference: {

                type: String,

                default: ""

            },


            status: {

                type: String,

                enum: [

                    "pending",

                    "paid",

                    "failed",

                    "refunded"

                ],

                default: "pending"

            }


        },



        // Delivery details
        shippingAddress: {


            fullName: {

                type: String,

                required: true

            },


            phone: {

                type: String,

                required: true

            },


            location: {

                type: String,

                required: true

            },


            address: {

                type: String,

                default: ""

            }


        },



        // Order status
        status: {

            type: String,

            enum: [

                "pending",

                "processing",

                "shipped",

                "delivered",

                "cancelled"

            ],

            default: "pending"

        }



    },

    {

        timestamps:true

    }

);



// Search optimization
orderSchema.index({

    user:1,

    createdAt:-1

});


module.exports = mongoose.model(

    "Order",

    orderSchema

);