const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

// Load environment variables
dotenv.config();

// Import Passport strategies (define below)
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LocalStrategy = require("passport-local").Strategy;

const app = express();

// ===================== CORS =====================
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5000", // your frontend port
  credentials: true,
}));

// ===================== Middleware =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// ===================== Static Files =====================
app.use(express.static(path.join(__dirname, "public")));

// ===================== MongoDB Connection =====================
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/kn_classifieds")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ===================== Models =====================
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for OAuth users
  phone: String,
  photoURL: String,
  googleId: String,
  facebookId: String,
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
  location: String,
  description: String,
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sellerName: String,
  sellerPhone: String,
  image: String,
  images: [String],
  brand: String,
  model: String,
  condition: String,
  storage: String,
  ram: String,
  color: String,
  views: { type: Number, default: 0 },
  promo: String,
  verified: { type: Boolean, default: false },
  yearsOnPlatform: Number,
  createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Notification = mongoose.model("Notification", NotificationSchema);

// ===================== Passport Serialization =====================
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ===================== Passport Strategies =====================
// Local Strategy
passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: "Incorrect email." });
    if (!user.password) return done(null, false, { message: "Account uses social login." });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return done(null, false, { message: "Incorrect password." });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        user.photoURL = user.photoURL || profile.photos[0]?.value;
        await user.save();
      } else {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          photoURL: profile.photos[0]?.value,
        });
        await user.save();
      }
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/auth/facebook/callback`,
  profileFields: ["id", "displayName", "emails", "photos"]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails?.[0]?.value });
      if (user) {
        user.facebookId = profile.id;
        user.photoURL = user.photoURL || profile.photos?.[0]?.value;
        await user.save();
      } else {
        user = new User({
          name: profile.displayName,
          email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
          facebookId: profile.id,
          photoURL: profile.photos?.[0]?.value,
        });
        await user.save();
      }
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// ===================== JWT Helpers =====================
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ===================== Routes =====================

// ---- Auth ----
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, phone });
    await user.save();
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, photoURL: user.photoURL } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: info.message || "Invalid credentials" });
    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      const token = generateToken(user);
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, photoURL: user.photoURL } });
    });
  })(req, res, next);
});

// OAuth endpoints
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  const token = generateToken(req.user);
  res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5000"}/#token=${token}`);
});

app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  const token = generateToken(req.user);
  res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5000"}/#token=${token}`);
});

app.get("/auth/me", async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone, photoURL: user.photoURL });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/auth/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

// ---- Products ----
app.get("/api/products", async (req, res) => {
  try {
    const { category, location, search } = req.query;
    let filter = {};
    if (category && category !== "all") filter.category = category;
    if (location && location !== "all") filter.location = location;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    // Expect user info from token (we'll attach user via middleware later)
    const { title, price, category, location, description, sellerId, sellerName, sellerPhone, image, images, brand, model, condition, storage, ram, color } = req.body;
    const product = new Product({
      title, price, category, location, description,
      sellerId, sellerName, sellerPhone,
      image, images: images || [],
      brand, model, condition, storage, ram, color,
      views: 0
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    product.views += 1;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Notifications ----
app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notifications", async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    const notif = new Notification({ userId, title, message });
    await notif.save();
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== Start Server =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});