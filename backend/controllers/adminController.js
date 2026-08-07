const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Orders");

// ==========================
// Admin Dashboard Statistics
// ==========================
exports.getDashboardStats = async (req, res) => {
    try {
        const users = await User.countDocuments();
        const products = await Product.countDocuments();

        let orders = 0;
        if (Order) {
            orders = await Order.countDocuments();
        }

        res.json({
            success: true,
            stats: {
                users,
                products,
                orders
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================
// Get All Users
// ==========================
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================
// Update User Role
// ==========================
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password");


        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        res.json({
            success: true,
            user
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================
// Delete User
// ==========================
exports.deleteUser = async (req, res) => {
    try {

        const user = await User.findByIdAndDelete(req.params.id);


        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        res.json({
            success: true,
            message: "User deleted successfully"
        });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================
// Get All Products
// ==========================
exports.getProducts = async (req, res) => {
    try {

        const products = await Product.find()
            .populate("seller", "name email")
            .sort({ createdAt: -1 });


        res.json({
            success: true,
            products
        });


    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message
        });

    }
};


// ==========================
// Delete Product
// ==========================
exports.deleteProduct = async (req,res)=>{

    try {

        const product = await Product.findByIdAndDelete(req.params.id);


        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found"
            });
        }


        res.json({
            success:true,
            message:"Product deleted successfully"
        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};