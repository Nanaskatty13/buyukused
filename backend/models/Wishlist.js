const mongoose = require("mongoose");


const wishlistSchema = new mongoose.Schema(

    {


        // User who owns the wishlist
        user: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

            unique: true

        },


        // Saved products
        products: [

            {

                type: mongoose.Schema.Types.ObjectId,

                ref: "Product"

            }

        ]


    },

    {

        timestamps: true

    }

);



// Prevent duplicate product entries
wishlistSchema.index({

    user: 1,

    products: 1

});



module.exports = mongoose.model(

    "Wishlist",

    wishlistSchema

);