const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
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

// ===============================
// TRUST PROXY
// ===============================
app.set("trust proxy", 1);

// ===============================
// BASE URL (for building absolute URLs)
// ===============================
app.use((req, res, next) => {
  req.baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  next();
});

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
// CORS – ✅ Now includes local network IP for mobile testing
// ===============================
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://sell-platform2.vercel.app",
  "https://sell-platform2-mcv0eniwt-nanaskatty13s-projects.vercel.app",
  process.env.FRONTEND_URL,
  // Add your local network IP for mobile testing (e.g., http://192.168.1.100:5173)
  // Uncomment and replace with your actual IP:
  // "http://192.168.1.100:5173",
].filter(Boolean);

console.log("🟢 Allowed Origins (exact matches):", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("🔍 Incoming origin:", origin);
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (/^https?:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      console.log("🚫 Blocked CORS:", origin);
      callback(new Error("CORS not allowed for this origin"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ===============================
// BODY PARSER – ✅ increased limit for large JSON/urlencoded
// ===============================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===============================
// MULTER CONFIGURATION
// ===============================
const uploadDir = path.join(__dirname, "public/uploads");
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Created uploads directory: ${uploadDir}`);
  } else {
    console.log(`📁 Upload directory exists: ${uploadDir}`);
  }
} catch (err) {
  console.error(`❌ Failed to create upload directory: ${err.message}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "-");
    cb(null, base + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error("Only images (jpg, png, gif) and videos (mp4, mov, avi, webm) are allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB (more than enough for mobile photos)
  fileFilter,
});

// Attach multer instance to req for easy use in routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// ===============================
// PASSPORT (initialize only – no session)
// ===============================
app.use(passport.initialize());
// ❌ No passport.session() – we use JWT, not sessions

// ===============================
// RATE LIMIT – skipped for admins and in development
// ===============================
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
    // ignore
  }
  next();
};

app.use(skipIfAdmin);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 500,
  skip: (req) => {
    if (req.skipRateLimit) return true;
    if (process.env.NODE_ENV === "development") return true;
    return false;
  },
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api", limiter);
app.use("/auth", limiter);

// ===============================
// HEALTH CHECK
// ===============================
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===============================
// ROUTES
// ===============================
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const adminRoutes = require("./routes/admin");

console.log("✅ Routes loaded:");
console.log(`  - Auth: ${typeof authRoutes === "function" ? "router" : typeof authRoutes}`);
console.log(`  - Products: ${typeof productRoutes === "function" ? "router" : typeof productRoutes}`);
console.log(`  - Notifications: ${typeof notificationRoutes === "function" ? "router" : typeof notificationRoutes}`);
console.log(`  - Users: ${typeof userRoutes === "function" ? "router" : typeof userRoutes}`);
console.log(`  - Messages: ${typeof messageRoutes === "function" ? "router" : typeof messageRoutes}`);
console.log(`  - Admin: ${typeof adminRoutes === "function" ? "router" : typeof adminRoutes}`);

app.use("/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);

// ===============================
// STATIC FILES – ONLY FOR UPLOADS
// ===============================
app.use("/uploads", express.static(uploadDir));

// ===============================
// 404 HANDLER (API only)
// ===============================
app.use((req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/auth")) {
    return res.status(404).json({ success: false, message: "API endpoint not found" });
  }
  res.status(404).send("Not Found");
});

// ===============================
// ERROR HANDLER (must be last)
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

    // ✅ Increase server timeout to 2 minutes – crucial for mobile uploads
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📌 Allowed Origins: ${allowedOrigins.join(", ") || "(wildcard for vercel.app)"}`);
      console.log(`🔗 Base URL: ${process.env.BASE_URL || "(auto-detected)"}`);
    });

    // ⏱️ 120 seconds timeout for slow mobile connections
    server.timeout = 120000;

  } catch (error) {
    console.error("❌ Server failed:", error.message);
    process.exit(1);
  }
};

start();