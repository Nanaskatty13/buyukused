const express = require("express");
const router = express.Router();


// Get notifications
router.get("/", async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Notifications route working"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Mark notification as read
router.put("/:id", async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Notification updated"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;