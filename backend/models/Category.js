const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema(

    {

        name: {

            type: String,

            required: [true, "Category name is required"],

            unique: true,

            trim: true

        },


        slug: {

            type: String,

            unique: true,

            lowercase: true,

            trim: true

        },


        description: {

            type: String,

            default: ""

        },


        image: {

            type: String,

            default: ""

        },


        isActive: {

            type: Boolean,

            default: true

        },


        createdBy: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User"

        }


    },

    {

        timestamps: true

    }

);



// Automatically create slug before saving
categorySchema.pre("save", function(next){

    if(this.name){

        this.slug = this.name

            .toLowerCase()

            .replace(/[^a-z0-9]+/g, "-")

            .replace(/(^-|-$)/g, "");

    }


    next();

});



module.exports = mongoose.model(
    "Category",
    categorySchema
);