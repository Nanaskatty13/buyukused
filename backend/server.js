const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const path = require("path");

dotenv.config();

const connectDB = require("./config/db");
require("./config/passport")(passport);

const app = express();

// Connect Database
connectDB();

app.set("trust proxy", 1);

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: process.env.JWT_SECRET || "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static(path.join(__dirname, "public")));


// =============================
// ROUTES
// =============================

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const notificationRoutes = require("./routes/notifications");

console.log("AUTH ROUTE:", typeof authRoutes);
console.log("PRODUCT ROUTE:", typeof productRoutes);
console.log("NOTIFICATION ROUTE:", typeof notificationRoutes);


app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/notifications", notificationRoutes);


// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "KN Classifieds API is running 🚀",
  });
});


// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: err.message || "Server error",
  });
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});