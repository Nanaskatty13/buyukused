const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");

dotenv.config();

const connectDB = require("./config/db");
require("./config/passport")(passport);

const app = express();

// ===============================
// ENV CHECK
// ===============================
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missing = requiredEnv.filter(key => !process.env[key]);
if (missing.length) {
  console.error(`❌ Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}
if (!process.env.SESSION_SECRET) {
  console.warn("⚠️ SESSION_SECRET missing. Using JWT_SECRET.");
}

// ===============================
// TRUST PROXY
// ===============================
app.set("trust proxy", 1);

// ===============================
// MIDDLEWARE
// ===============================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ===============================
// CORS – allow both local and production
// ===============================
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // ✅ Add your production frontend URL(s) here
  "https://sell-platform2-rfxi0orto-nanaskatty13s-projects.vercel.app",
  // Or use environment variable (recommended)
  process.env.FRONTEND_URL,
].filter(Boolean);

console.log("🟢 Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log("Blocked CORS:", origin);
      callback(new Error("CORS not allowed for this origin"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ===============================
// BODY PARSER (JSON & URL-encoded)
// ===============================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===============================
// ✅ MULTER CONFIGURATION
// ===============================
const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only images and videos are allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});

app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// ===============================
// SESSION
// ===============================
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// ===============================
// PASSPORT
// ===============================
app.use(passport.initialize());
app.use(passport.session());

// ===============================
// RATE LIMIT (improved)
// ===============================

// --- Custom middleware to detect admin token ---
const skipIfAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "admin") {
      req.skipRateLimit = true;
    }
  } catch (e) {
    // Invalid token – ignore
  }
  next();
};

// --- Apply the middleware before the rate limiter ---
app.use(skipIfAdmin);

// --- Rate limiter configuration ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // higher limit in dev
  skip: (req) => {
    if (req.skipRateLimit) return true;
    if (process.env.NODE_ENV === 'development') return true;
    return false;
  },
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);
app.use("/auth", limiter);

// ===============================
// ROUTES
// ===============================
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

console.log("✅ Routes loaded:");
console.log(`  - Auth: ${typeof authRoutes === 'function' ? 'router' : typeof authRoutes}`);
console.log(`  - Products: ${typeof productRoutes === 'function' ? 'router' : typeof productRoutes}`);
console.log(`  - Notifications: ${typeof notificationRoutes === 'function' ? 'router' : typeof notificationRoutes}`);
console.log(`  - Users: ${typeof userRoutes === 'function' ? 'router' : typeof userRoutes}`);
console.log(`  - Messages: ${typeof messageRoutes === 'function' ? 'router' : typeof messageRoutes}`);

app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// ===============================
// STATIC FILES
// ===============================
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(uploadDir));

// ===============================
// CATCH-ALL FOR FRONTEND ROUTING
// ===============================
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api") && !req.path.startsWith("/auth")) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.status(404).json({ success: false, message: "Route not found" });
  }
});

// ===============================
// 404 HANDLER (API)
// ===============================
app.use((req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/auth")) {
    res.status(404).json({ success: false, message: "Route not found" });
  } else {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});

// ===============================
// ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === "FILE_TOO_LARGE") {
      return res.status(413).json({
        success: false,
        message: "File too large. Max size is 50MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: messages,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ===============================
// UNHANDLED REJECTIONS
// ===============================
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    const connection = await connectDB();
    console.log(`✅ MongoDB connected to: ${connection.name}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📌 Allowed Origins: ${allowedOrigins.join(", ")}`);
    });
  } catch (error) {
    console.error("❌ Server failed:", error.message);
    process.exit(1);
  }
};

start();