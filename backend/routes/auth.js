const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../models/User");


// Generate JWT
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || "secretkey",
        { expiresIn: "30d" }
    );
};


// =====================
// Register
// =====================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone
        });


        res.status(201).json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });


    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});



// =====================
// Login
// =====================
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;


        const user = await User.findOne({ email });


        if (!user || !(await user.comparePassword(password))) {

            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            });

        }


        res.json({

            success:true,

            token: generateToken(user._id),

            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                phone:user.phone,
                role:user.role
            }

        });


    } catch(error){

        res.status(500).json({
            error:error.message
        });

    }

});




// =====================
// Google Login
// =====================

router.get(
    "/google",
    passport.authenticate("google", {
        scope:["profile","email"]
    })
);



router.get(
    "/google/callback",

    passport.authenticate("google", {
        failureRedirect:"/login"
    }),

    (req,res)=>{

        const token = generateToken(req.user.id);

        res.redirect(
            `${process.env.FRONTEND_URL}/#token=${token}`
        );

    }
);




// =====================
// Facebook Login
// =====================

router.get(
    "/facebook",

    passport.authenticate("facebook", {
        scope:["email"]
    })
);



router.get(
    "/facebook/callback",

    passport.authenticate("facebook", {
        failureRedirect:"/login"
    }),

    (req,res)=>{

        const token = generateToken(req.user.id);

        res.redirect(
            `${process.env.FRONTEND_URL}/#token=${token}`
        );

    }
);





// =====================
// Current User
// =====================

router.get("/me", async(req,res)=>{


    try{

        const authHeader = req.headers.authorization;


        if(!authHeader){

            return res.status(401).json({
                message:"No token"
            });

        }


        const token = authHeader.split(" ")[1];


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        const user = await User
            .findById(decoded.id)
            .select("-password");



        if(!user){

            return res.status(404).json({
                message:"User not found"
            });

        }


        res.json(user);



    }catch(error){

        res.status(401).json({
            message:"Invalid token"
        });

    }


});





// =====================
// Logout
// =====================

router.post("/logout",(req,res)=>{


    if(req.logout){

        req.logout(()=>{});

    }


    res.json({
        message:"Logged out"
    });


});



module.exports = router;