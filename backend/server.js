const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const path = require("path");

const connectDB = require("./config/db");
require("./config/passport")(passport);

dotenv.config();

const app = express();

connectDB();

app.set("trust proxy", 1);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
    },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/notifications", require("./routes/notifications"));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "KN Classifieds API is running",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});