const User = require("../models/User");
const jwt = require("jsonwebtoken");


// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d"
        }
    );
};


// ==========================
// Register User
// ==========================
exports.register = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            phone
        } = req.body;


        const cleanEmail = email.toLowerCase().trim();


        const existingUser = await User.findOne({
            email: cleanEmail
        });


        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }


        const user = await User.create({
            name,
            email: cleanEmail,
            password,
            phone
        });


        res.status(201).json({

            success: true,

            message: "Account created successfully",

            token: generateToken(user),

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }

        });


    } catch(error){

        console.error(error);

        res.status(500).json({
            success:false,
            message:error.message
        });

    }
};



// ==========================
// Login User
// ==========================
exports.login = async (req,res)=>{

    try {

        const {
            email,
            password
        } = req.body;


        const cleanEmail = email.toLowerCase().trim();


        const user = await User.findOne({
            email: cleanEmail
        });


        if(!user){

            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            });

        }


        const passwordMatch = await user.comparePassword(password);


        if(!passwordMatch){

            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            });

        }



        res.json({

            success:true,

            token:generateToken(user),

            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                phone:user.phone,
                role:user.role
            }

        });



    }catch(error){

        console.error(error);

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================
// Get Current User
// ==========================
exports.getMe = async(req,res)=>{

    try {

        const user = await User.findById(req.user._id)
        .select("-password");


        if(!user){

            return res.status(404).json({
                success:false,
                message:"User not found"
            });

        }


        res.json({
            success:true,
            user
        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ==========================
// Update Profile
// ==========================
exports.updateProfile = async(req,res)=>{

    try {

        const {
            name,
            phone,
            location,
            avatar
        } = req.body;


        const user = await User.findByIdAndUpdate(

            req.user._id,

            {
                name,
                phone,
                location,
                avatar
            },

            {
                new:true
            }

        ).select("-password");



        res.json({

            success:true,

            message:"Profile updated",

            user

        });



    }catch(error){

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};



// ==========================
// Logout
// ==========================
exports.logout = async(req,res)=>{

    res.json({

        success:true,

        message:"Logged out successfully"

    });

};