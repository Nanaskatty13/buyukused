const errorHandler = (err, req, res, next) => {

    console.error("❌ ERROR:", err);



    let error = {
        message: err.message || "Server Error",
        statusCode: err.statusCode || 500
    };



    // ==========================
    // Mongoose Bad Object ID
    // ==========================
    if(err.name === "CastError"){

        error = {

            message:"Resource not found",

            statusCode:404

        };

    }



    // ==========================
    // Mongoose Validation Error
    // ==========================
    if(err.name === "ValidationError"){

        error = {

            message:Object.values(err.errors)
                .map(e => e.message)
                .join(", "),

            statusCode:400

        };

    }



    // ==========================
    // Duplicate Field Error
    // ==========================
    if(err.code === 11000){

        const field = Object.keys(err.keyValue)[0];


        error = {

            message:`${field} already exists`,

            statusCode:400

        };

    }



    // ==========================
    // JWT Errors
    // ==========================
    if(err.name === "JsonWebTokenError"){

        error = {

            message:"Invalid authentication token",

            statusCode:401

        };

    }



    if(err.name === "TokenExpiredError"){

        error = {

            message:"Authentication token expired",

            statusCode:401

        };

    }



    // ==========================
    // Response
    // ==========================
    res.status(error.statusCode).json({

        success:false,

        message:error.message,

        ...(process.env.NODE_ENV === "development" && {

            stack:err.stack

        })

    });

};



module.exports = errorHandler;