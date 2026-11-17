// frontend/src/pages/ProductDetails.jsx

import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import { FaMotorcycle } from "react-icons/fa";

import {
  getProduct,
  updateProductWithFiles,
  getImageUrl,
  updateProductStatus,
  getProducts,
} from "../services/api";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import SoldBadge from "../components/SoldBadge";
import ReviewSection from "../components/ReviewSection";

// ── Laptop constants ──────────────────────────────────────────────
import {
  LAPTOP_BRANDS,
  getModelsByBrand,
  PROCESSOR_OPTIONS,
  RAM_OPTIONS,
  SCREEN_SIZE_OPTIONS,
  GRAPHICS_OPTIONS,
} from "../components/LaptopForm";

// ── Tablet constants ──────────────────────────────────────────────
import {
  TABLET_BRANDS,
  getTabletModelsByBrand,
  TABLET_COLORS,
  TABLET_SCREEN_SIZES,
  CONNECTIVITY_OPTIONS,
  YEAR_OPTIONS,
} from "../components/TabletForm";

// ── Brand lists for TV, Consoles, Accessories ──────────────────
const TV_BRANDS = ['Samsung', 'LG', 'Sony', 'TCL', 'Hisense', 'Panasonic', 'Philips', 'Vizio', 'Sharp', 'Other'];
const CONSOLE_BRANDS = ['Sony PlayStation', 'Microsoft Xbox', 'Nintendo', 'Sega', 'Atari', 'Other'];
const ACCESSORY_BRANDS = ['Apple', 'Samsung', 'Sony', 'Bose', 'Beats', 'JBL', 'Logitech', 'Razer', 'Corsair', 'SteelSeries', 'HyperX', 'Other'];

const iphoneColors = [
  "Space Gray", "Orange", "Deep Blue", "Silver", "Gold", "Black", "White",
  "Blue", "Coral", "Yellow", "Red", "Purple", "Green", "Midnight Green",
  "Graphite", "Pacific Blue", "Midnight", "Starlight", "Pink", "Sierra Blue",
  "Alpine Green", "Deep Purple", "Space Black", "Black Titanium", "White Titanium",
  "Blue Titanium", "Natural Titanium", "Desert Titanium", "Teal", "Ultramarine",
  "Product Red", "Rose Gold", "Matte Black", "Jet Black", "Burgundy", "Crimson",
];

const ALL_COLORS = [
  ...new Set([...iphoneColors, ...TABLET_COLORS]),
].sort((a, b) => a.localeCompare(b));

const CONSOLE_TYPES = ['Home Console','Handheld Console','Hybrid Console','Retro Console','Portable Gaming PC','Other'];
const CONSOLE_EDITIONS = ['Standard Edition','Digital Edition','Disc Edition','All-Digital Edition','Slim Edition','Pro Edition','OLED Edition','Limited Edition','Special Edition','Collector’s Edition','Other'];
const DISC_DRIVE_OPTIONS = ['Built-in Disc Drive','No Disc Drive','External Disc Drive Compatible','Not Applicable'];
const CONTROLLER_OPTIONS = ['No Controller','1 Controller','2 Controllers','3 Controllers','4 Controllers','More than 4 Controllers'];
const BATTERY_OPTIONS = ['Built-in Rechargeable Battery','Replaceable Battery','No Battery','Not Applicable'];
const CONSOLE_RESOLUTIONS = ['720p','900p','1080p','1440p','4K UHD','8K UHD','Other'];
const VIDEO_OUTPUT_OPTIONS = ['HDMI','HDMI 2.0','HDMI 2.1','DisplayPort','USB-C DisplayPort','Other'];
const REGION_OPTIONS = ['NTSC','PAL','NTSC-J','Region Free','Other'];
const WATCH_SIZE_OPTIONS = ['38mm','40mm','41mm','42mm','44mm','45mm','46mm','47mm','49mm','51mm','Other'];
const TV_TYPES = ['Smart TV','LED TV','LCD TV','OLED TV','QLED TV','Mini-LED TV','Plasma TV','Android TV','Google TV','Fire TV','Other'];
const DISPLAY_TECHNOLOGIES = ['LED','LCD','OLED','QLED','Neo QLED','Mini-LED','MicroLED','NanoCell','ULED','Plasma','Other'];
const REFRESH_RATES = ['50Hz','60Hz','75Hz','100Hz','120Hz','144Hz','165Hz','240Hz','Other'];
const TV_OPERATING_SYSTEMS = ['Tizen','webOS','Google TV','Android TV','Roku TV','Fire TV','VIDAA','My Home Screen','SmartCast','Other'];
const HDR_OPTIONS = ['HDR10','HDR10+','Dolby Vision','HLG','HDR10 + Dolby Vision','HDR10+ + Dolby Vision','No HDR','Other'];
const HDMI_OPTIONS = ['1 HDMI','2 HDMI','3 HDMI','4 HDMI','5 HDMI','6 HDMI','Other'];
const USB_OPTIONS = ['1 USB','2 USB','3 USB','4 USB','Other'];

// ─── Image-message detection ─────────────────────────────────
const isImageMessage = (text) => {
  if (!text) return false;
  const imagePatterns = [
    /^📷 Image:/,
    /^🎥 Video:/,
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)/i,
    /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)/i,
    /res\.cloudinary\.com\/.*image\/upload/,
  ];
  return imagePatterns.some(pattern => pattern.test(text));
};

const extractImageUrl = (text) => {
  const match = text.match(/^(?:📷 Image|🎥 Video):\s*(.+)/);
  if (match) return match[1].trim();
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) return urlMatch[0];
  return null;
};

const formatPrice = (price) => `GH₵ ${Number(price).toLocaleString()}`;

// ─── WhatsApp-style chat helpers ────────────────────────────
const getMsgId = (val) => (typeof val === 'string' ? val : val?._id || val?.id || '');

const sameDay = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a), db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

const formatChatTime = (str) => {
  if (!str) return '';
  return new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatChatDay = (str) => {
  if (!str) return '';
  const d = new Date(str);
  const now = new Date();
  const yst = new Date(now); yst.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return 'Today';
  if (sameDay(d, yst)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
};

const mergeChatMessages = (existing, incoming) => {
  const incomingIds = new Set((incoming || []).map((m) => m?._id).filter(Boolean));
  const pending = (existing || []).filter((m) => m?._optimistic && !incomingIds.has(m._id));
  const merged = [...(incoming || []), ...pending];
  const seen = new Set();
  return merged.filter((m) => {
    if (!m) return false;
    const id = m._id;
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

// ─── Optimised Product Card for related products ────────────
const RelatedProductCard = memo(({ product }) => {
  const navigate = useNavigate();

  const image = product.images?.[0] || product.image || "";
  const imageUrl = useMemo(() => {
    if (!image) return "https://placehold.co/300x300?text=No+Image";
    let url = getImageUrl(image);
    if (url.includes('res.cloudinary.com')) {
      url = url.replace('/image/upload/', '/image/upload/w_300,h_300,c_fill,f_auto,q_auto/');
    }
    return url;
  }, [image]);

  const isSold = product.status === "sold";

  return (
    <div
      className="related-product-card"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(238,246,255,0.42) 50%, rgba(255,255,255,0.62) 100%)",
        backdropFilter: "blur(14px) saturate(180%)",
        WebkitBackdropFilter: "blur(14px) saturate(180%)",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow: "0 8px 28px rgba(31,38,135,0.10), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.25)",
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.2s ease",
        cursor: "pointer",
        position: "relative",
        isolation: "isolate",
      }}
      onClick={() => navigate(`/product/${product._id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 14px 40px rgba(31,38,135,0.16), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(255,255,255,0.3)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.98)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(31,38,135,0.10), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.25)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.75)";
      }}
    >
      <div style={{ position: "relative", width: "100%", paddingBottom: "100%", background: "#f1f5f9", overflow: "hidden" }}>
        <img
          src={imageUrl} alt={product.title} loading="lazy"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.currentTarget.src = "https://placehold.co/300x300?text=No+Image"; }}
        />
        {isSold && (
          <div style={{ position: "absolute", top: "6px", right: "6px", background: "linear-gradient(135deg, rgba(220,38,38,0.94) 0%, rgba(185,28,28,0.88) 100%)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: "white", padding: "2px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", border: "1px solid rgba(255,255,255,0.35)", boxShadow: "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
            Sold
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.title}</h4>
        <div style={{ fontSize: "11px", color: "var(--gray-500)", marginBottom: "2px" }}>{product.location || "Ghana"}</div>
        <div style={{ fontSize: "16px", fontWeight: 800, color: isSold ? "#9ca3af" : "var(--primary)" }}>{formatPrice(product.price)}</div>
      </div>
    </div>
  );
});

// ─── Loading dots ─────────────────────────────────────────
const LoadingDots = () => {
  return (
    <div className="loading-dots-wrapper">
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <style>
        {`
          .loading-dots-wrapper { display: flex; justify-content: center; align-items: center; padding: 40px 20px; width: 100%; }
          .loading-dots { display: flex; gap: 8px; align-items: center; }
          .loading-dots span { display: block; width: 14px; height: 14px; background: linear-gradient(135deg, #0066cc 0%, #3b82f6 100%); border-radius: 50%; box-shadow: 0 2px 10px rgba(0,102,204,0.35), inset 0 1px 0 rgba(255,255,255,0.4); animation: loading-dot-bounce 1.2s ease-in-out infinite; }
          .loading-dots span:nth-child(1) { animation-delay: 0s; }
          .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
          .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes loading-dot-bounce { 0%, 80%, 100% { transform: translateY(0) scale(0.8); opacity: 0.4; } 40% { transform: translateY(-20px) scale(1); opacity: 1; } }
        `}
      </style>
    </div>
  );
};

// ================================================================
// MAIN COMPONENT
// ================================================================

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, token } = useAuth();
  const { toggleFavorite, isFavorite } = useCart();

  // ─── Product state ─────────────────────────────────────────
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─── Related products ──────────────────────────────────────
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // ─── Gallery ───────────────────────────────────────────────
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [watermarkedImages, setWatermarkedImages] = useState([]);
  const watermarkCache = useRef({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ─── Edit modal ────────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "", price: "", description: "", category: "", location: "", condition: "",
    storage: "", color: "", status: "active", sellerPhone: "", batteryHealth: "", faceId: "",
    simStatus: "", negotiation: false, swapAccepted: false, warranty: "",
    brand: "", model: "", processor: "", ram: "", screenSize: "", graphics: "",
    year: "", connectivity: "",
    consoleType: "", edition: "", discDrive: "", controllersIncluded: "", battery: "",
    resolution: "", videoOutput: "", region: "",
    watchSize: "",
    tvType: "", displayTechnology: "", refreshRate: "", operatingSystem: "", hdr: "",
    hdmiPorts: "", usbPorts: "", smartTV: false, voiceControl: false, wallMountable: false,
  });
  const [imagesToKeep, setImagesToKeep] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newFilePreviews, setNewFilePreviews] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // ─── Status ────────────────────────────────────────────────
  const [isUpdating, setIsUpdating] = useState(false);

  // ─── Messaging ─────────────────────────────────────────────
  const [showChatModal, setShowChatModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [messagingAvailable, setMessagingAvailable] = useState(true);
  const [viewingImage, setViewingImage] = useState(null);

  const pollInterval = useRef(null);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const chatModalRef = useRef(null);
  const prevMsgLenRef = useRef(0);

  // Sorted + deduped messages for render
  const sortedMessages = useMemo(() => {
    const seen = new Set();
    const list = (messages || []).filter((m) => {
      if (!m || !m._id) return true;
      if (seen.has(m._id)) return false;
      seen.add(m._id);
      return true;
    });
    list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    return list;
  }, [messages]);

  // ─── Fetch product ────────────────────────────────────────
  const fetchRelatedProducts = async (currentProduct) => {
    try {
      setRelatedLoading(true);
      const params = { category: currentProduct.category, limit: 4, status: "active" };
      const data = await getProducts(params);
      if (data?.products) {
        let filtered = data.products.filter((p) => p._id !== currentProduct._id);
        if (filtered.length < 3) {
          const fallbackData = await getProducts({ category: currentProduct.category, limit: 6, status: "active" });
          if (fallbackData?.products) {
            filtered = fallbackData.products.filter((p) => p._id !== currentProduct._id);
          }
        }
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (err) {
      console.error("Failed to fetch related products:", err);
    } finally {
      setRelatedLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getProduct(id);
        if (data?.product) {
          const p = data.product;
          setProduct(p);
          setEditForm({
            title: p.title || "", price: p.price ?? "", description: p.description || "",
            category: p.category || "", location: p.location || "", condition: p.condition || "",
            storage: p.storage || "", color: p.color || "", status: p.status || "active",
            sellerPhone: p.sellerPhone || "",
            batteryHealth: p.batteryHealth !== null && p.batteryHealth !== undefined ? p.batteryHealth : "",
            faceId: p.faceId || "", simStatus: p.simStatus || "",
            negotiation: Boolean(p.negotiation), swapAccepted: Boolean(p.swapAccepted),
            warranty: p.warranty || "",
            brand: p.brand || "", model: p.model || "", processor: p.processor || "",
            ram: p.ram || "", screenSize: p.screenSize || "", graphics: p.graphics || "",
            year: p.year || "", connectivity: p.connectivity || "",
            consoleType: p.consoleType || "", edition: p.edition || "", discDrive: p.discDrive || "",
            controllersIncluded: p.controllersIncluded || "", battery: p.battery || "",
            resolution: p.resolution || "", videoOutput: p.videoOutput || "", region: p.region || "",
            watchSize: p.watchSize || "",
            tvType: p.tvType || "", displayTechnology: p.displayTechnology || "",
            refreshRate: p.refreshRate || "", operatingSystem: p.operatingSystem || "",
            hdr: p.hdr || "", hdmiPorts: p.hdmiPorts || "", usbPorts: p.usbPorts || "",
            smartTV: Boolean(p.smartTV), voiceControl: Boolean(p.voiceControl), wallMountable: Boolean(p.wallMountable),
          });
          const existingImages = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
          setImagesToKeep(existingImages);
          fetchRelatedProducts(p);
        } else {
          setError("Product not found.");
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setError(err?.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // ─── Watermark generation ──────────────────────────────────
  const imagePaths = useMemo(() => {
    if (!product) return [];
    const imgs = Array.isArray(product.images) && product.images.length > 0 ? product.images : product.image ? [product.image] : [];
    return imgs;
  }, [product]);

  useEffect(() => {
    if (!imagePaths.length) { setWatermarkedImages([]); return; }
    const cacheKey = product?._id || id;
    if (watermarkCache.current[cacheKey]?.length === imagePaths.length) {
      setWatermarkedImages(watermarkCache.current[cacheKey]);
      return;
    }
    const watermarked = new Array(imagePaths.length).fill(null);
    let processedCount = 0;
    const processImage = (index) => {
      const path = imagePaths[index];
      if (!path) {
        watermarked[index] = getImageUrl(path);
        processedCount++;
        if (processedCount === imagePaths.length) {
          watermarkCache.current[cacheKey] = watermarked;
          setWatermarkedImages([...watermarked]);
        }
        return;
      }
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 800;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const text = "Posted on buyukused.com";
        const fontSize = Math.max(14, Math.min(28, width / 18));
        ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(text, width / 2, height * 0.45);
        watermarked[index] = canvas.toDataURL('image/png');
        processedCount++;
        if (processedCount === imagePaths.length) {
          watermarkCache.current[cacheKey] = watermarked;
          setWatermarkedImages([...watermarked]);
        } else {
          setWatermarkedImages([...watermarked]);
        }
      };
      img.onerror = () => {
        watermarked[index] = getImageUrl(path);
        processedCount++;
        if (processedCount === imagePaths.length) {
          watermarkCache.current[cacheKey] = watermarked;
          setWatermarkedImages([...watermarked]);
        } else {
          setWatermarkedImages([...watermarked]);
        }
      };
      img.src = getImageUrl(path);
    };
    for (let i = 0; i < imagePaths.length; i++) {
      setTimeout(() => processImage(i), i * 50);
    }
  }, [imagePaths, id, product?._id]);

  useEffect(() => { setCurrentImageIndex(0); }, [product]);

  useEffect(() => {
    return () => {
      newFilePreviews.forEach((url) => { URL.revokeObjectURL(url); });
    };
  }, [newFilePreviews]);

  // ─── iOS/Android keyboard resize for chat modal ───────────
  useEffect(() => {
    if (!showChatModal || typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const handler = () => {
      const modal = chatModalRef.current;
      if (!modal) return;
      if (window.matchMedia('(max-width: 600px)').matches) {
        modal.style.height = `${vv.height}px`;
        modal.style.maxHeight = `${vv.height}px`;
      }
    };

    vv.addEventListener('resize', handler);
    vv.addEventListener('scroll', handler);
    handler();

    return () => {
      vv.removeEventListener('resize', handler);
      vv.removeEventListener('scroll', handler);
      const modal = chatModalRef.current;
      if (modal) {
        modal.style.height = '';
        modal.style.maxHeight = '';
      }
    };
  }, [showChatModal]);

  const canEdit = Boolean(user && product && (
    user.role === "admin" ||
    product?.sellerId?._id === user?._id ||
    product?.sellerId === user?._id ||
    product?.sellerId?.toString?.() === user?._id?.toString?.()
  ));

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRemoveExistingImage = (index) => setImagesToKeep((prev) => prev.filter((_, i) => i !== index));

  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    setNewFilePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeNewFile = (index) => {
    const preview = newFilePreviews[index];
    if (preview) URL.revokeObjectURL(preview);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);
    try {
      if (!token) throw new Error("You must be logged in to edit this product.");
      const formData = new FormData();
      Object.keys(editForm).forEach((key) => {
        if (key === "price") {
          const price = parseFloat(editForm[key]);
          formData.append(key, Number.isFinite(price) ? price : 0);
        } else if (key === "batteryHealth") {
          if (editForm[key] !== "" && editForm[key] !== null && editForm[key] !== undefined) {
            const battery = parseFloat(editForm[key]);
            if (Number.isFinite(battery)) formData.append(key, battery);
          }
        } else if (key === "negotiation" || key === "swapAccepted") {
          formData.append(key, editForm[key] ? "true" : "false");
        } else {
          formData.append(key, editForm[key] ?? "");
        }
      });
      formData.append("imagesToKeep", JSON.stringify(imagesToKeep));
      newFiles.forEach((file) => formData.append("files", file));
      const result = await updateProductWithFiles(id, formData, token);
      if (!result?.success) throw new Error(result?.message || "Failed to update product.");
      const updated = await getProduct(id);
      if (updated?.product) {
        setProduct(updated.product);
        const updatedImages = Array.isArray(updated.product.images) ? updated.product.images : updated.product.image ? [updated.product.image] : [];
        setImagesToKeep(updatedImages);
        setNewFiles([]);
        setNewFilePreviews([]);
        setCurrentImageIndex(0);
        setEditForm({
          title: updated.product.title || "", price: updated.product.price ?? "",
          description: updated.product.description || "", category: updated.product.category || "",
          location: updated.product.location || "", condition: updated.product.condition || "",
          storage: updated.product.storage || "", color: updated.product.color || "",
          status: updated.product.status || "active", sellerPhone: updated.product.sellerPhone || "",
          batteryHealth: updated.product.batteryHealth !== null && updated.product.batteryHealth !== undefined ? updated.product.batteryHealth : "",
          faceId: updated.product.faceId || "", simStatus: updated.product.simStatus || "",
          negotiation: Boolean(updated.product.negotiation), swapAccepted: Boolean(updated.product.swapAccepted),
          warranty: updated.product.warranty || "",
          brand: updated.product.brand || "", model: updated.product.model || "",
          processor: updated.product.processor || "", ram: updated.product.ram || "",
          screenSize: updated.product.screenSize || "", graphics: updated.product.graphics || "",
          year: updated.product.year || "", connectivity: updated.product.connectivity || "",
          consoleType: updated.product.consoleType || "", edition: updated.product.edition || "",
          discDrive: updated.product.discDrive || "", controllersIncluded: updated.product.controllersIncluded || "",
          battery: updated.product.battery || "", resolution: updated.product.resolution || "",
          videoOutput: updated.product.videoOutput || "", region: updated.product.region || "",
          watchSize: updated.product.watchSize || "",
          tvType: updated.product.tvType || "", displayTechnology: updated.product.displayTechnology || "",
          refreshRate: updated.product.refreshRate || "", operatingSystem: updated.product.operatingSystem || "",
          hdr: updated.product.hdr || "", hdmiPorts: updated.product.hdmiPorts || "",
          usbPorts: updated.product.usbPorts || "",
          smartTV: Boolean(updated.product.smartTV), voiceControl: Boolean(updated.product.voiceControl),
          wallMountable: Boolean(updated.product.wallMountable),
        });
      }
      setShowEditModal(false);
    } catch (err) {
      console.error("Product update error:", err);
      setEditError(err?.message || "Something went wrong while updating the product.");
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Gallery derived ───────────────────────────────────────
  const images = Array.isArray(product?.images) && product.images.length > 0 ? product.images : product?.image ? [product.image] : [];
  const hasImages = images.length > 0;
  const totalImages = hasImages ? images.length : 1;

  const getOptimizedImageUrl = (path, width = 800, height = 800) => {
    if (!path) return "https://placehold.co/600x600?text=No+Image";
    let url = getImageUrl(path);
    if (url.includes('res.cloudinary.com')) {
      url = url.replace('/image/upload/', `/image/upload/w_${width},h_${height},c_fill,f_auto,q_auto/`);
    }
    return url;
  };
  const getThumbnailUrl = (path) => {
    if (!path) return "https://placehold.co/100x100?text=No+Image";
    let url = getImageUrl(path);
    if (url.includes('res.cloudinary.com')) {
      url = url.replace('/image/upload/', '/image/upload/w_100,h_100,c_fill,f_auto,q_auto/');
    }
    return url;
  };
  const getLightboxImageUrl = (path) => {
    if (!path) return "https://placehold.co/1200x1200?text=No+Image";
    let url = getImageUrl(path);
    if (url.includes('res.cloudinary.com')) {
      url = url.replace('/image/upload/', '/image/upload/w_1200,h_1200,c_limit,f_auto,q_auto/');
    }
    return url;
  };
  const getCurrentImage = () => {
    if (watermarkedImages.length > 0 && watermarkedImages[currentImageIndex]) return watermarkedImages[currentImageIndex];
    if (hasImages && images[currentImageIndex]) return getOptimizedImageUrl(images[currentImageIndex], 800, 800);
    if (product?.image) return getOptimizedImageUrl(product.image, 800, 800);
    return "https://placehold.co/600x600?text=No+Image";
  };
  const getThumbnail = (index) => {
    if (watermarkedImages.length > 0 && watermarkedImages[index]) return watermarkedImages[index];
    if (hasImages && images[index]) return getThumbnailUrl(images[index]);
    return "https://placehold.co/100x100?text=No+Image";
  };
  const getLightboxImage = (index) => {
    if (watermarkedImages.length > 0 && watermarkedImages[index]) return watermarkedImages[index];
    const path = images[index] || product?.image;
    if (path) return getLightboxImageUrl(path);
    return "https://placehold.co/1200x1200?text=No+Image";
  };

  const handlePrev = (e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages); };
  const handleNext = (e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % totalImages); };
  const handleThumbClick = (index) => setCurrentImageIndex(index);

  const openLightbox = (index) => {
    if (totalImages > 0) { setLightboxIndex(index); setLightboxOpen(true); }
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevLightboxImage = () => setLightboxIndex((prev) => (prev - 1 + totalImages) % totalImages);
  const nextLightboxImage = () => setLightboxIndex((prev) => (prev + 1) % totalImages);

  const preloadImages = useCallback((urls) => {
    urls.forEach(url => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    });
  }, []);

  useEffect(() => {
    if (lightboxOpen && hasImages) {
      const indices = [lightboxIndex, (lightboxIndex + 1) % totalImages, (lightboxIndex - 1 + totalImages) % totalImages];
      preloadImages(indices.map(idx => getLightboxImage(idx)));
    }
  }, [lightboxOpen, lightboxIndex, totalImages, preloadImages]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightboxImage();
      if (e.key === 'ArrowRight') nextLightboxImage();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen]);

  // ─── WhatsApp contact ──────────────────────────────────────
  const handleContact = () => {
    if (product?.status === "sold") { alert("Sorry, this item has already been sold."); return; }
    if (!user) { navigate("/login"); return; }
    const rawPhone = product?.sellerPhone || "";
    let phone = String(rawPhone).replace(/\D/g, "");
    if (phone.startsWith("0") && phone.length === 10) phone = "233" + phone.substring(1);
    if (!phone || phone.length < 10) { alert("This seller has not provided a valid WhatsApp number."); return; }
    const price = Number(product?.price || 0);
    const formattedPrice = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 0 }).format(price);
    let titleWithSpecs = `"${product?.title || "this item"}"`;
    if (product?.storage) titleWithSpecs = `"${product.title}" (${product.storage})`;
    const message = `Hello, I'm interested in ${titleWithSpecs} priced at ${formattedPrice} listed on BuyUkUsed.com. Is it still available?`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  };

  // ─── Mark sold / available ─────────────────────────────────
  const handleMarkAsSold = async () => {
    if (!user) { alert("Please login to manage your products."); return; }
    if (!canEdit) { alert("You do not have permission to change this product."); return; }
    const isCurrentlySold = product?.status === "sold";
    const newStatus = isCurrentlySold ? "active" : "sold";
    const confirmMessage = isCurrentlySold
      ? `Mark "${product.title}" as available again?`
      : `Mark "${product.title}" as sold? This will hide the Contact Seller button.`;
    if (!window.confirm(confirmMessage)) return;
    setIsUpdating(true);
    try {
      const result = await updateProductStatus(product._id, newStatus, token);
      if (!result?.success) throw new Error(result?.message || "Failed to update product status.");
      const updated = await getProduct(id);
      if (updated?.product) {
        setProduct(updated.product);
        setEditForm((prev) => ({ ...prev, status: updated.product.status || newStatus }));
      }
      alert(newStatus === "sold" ? "Product marked as sold." : "Product marked as available.");
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status: " + (err?.message || "Something went wrong."));
    } finally {
      setIsUpdating(false);
    }
  };

  // ─── CHAT – fetch messages ─────────────────────────────────
  const fetchMessages = async () => {
    if (!user || !product) return;
    try {
      const sellerId_ = product.sellerId?._id || product.sellerId;
      if (!sellerId_) { setChatError('Seller information not available.'); return; }

      const apiBase = import.meta.env.VITE_API_URL || 'https://buyukused-y6cp.onrender.com';

      const response = await fetch(`${apiBase}/api/messages/conversation/${sellerId_}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403 || response.status === 404) {
        const fallbackResponse = await fetch(`${apiBase}/api/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!fallbackResponse.ok) throw new Error('Failed to fetch messages');
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success) {
          const allMessages = fallbackData.messages || [];
          const productMessages = allMessages.filter((msg) => msg.productId && msg.productId._id === product._id);
          setMessages((prev) => mergeChatMessages(prev, productMessages));
          setChatError('');
          setMessagingAvailable(true);
          return;
        }
        throw new Error('Messaging not available');
      }

      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      if (data.success) {
        setMessages((prev) => mergeChatMessages(prev, data.messages || []));
        setChatError('');
        setMessagingAvailable(true);
      } else {
        setChatError(data.message || 'Could not load messages');
        setMessagingAvailable(false);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setChatError('Could not load messages');
      setMessagingAvailable(false);
    }
  };

  // ─── CHAT – send (optimistic) ──────────────────────────────
  const sendMessage = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!user) { navigate('/login'); return; }
    const text = newMessage.trim();
    if (!text) return;

    const sellerId_ = product?.sellerId?._id || product?.sellerId;
    if (!sellerId_) { alert('Seller information not available.'); return; }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = {
      _id: tempId,
      sender: { _id: user._id, name: user.name },
      receiver: sellerId_,
      productId: product._id,
      message: text,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');
    if (chatInputRef.current) chatInputRef.current.style.height = 'auto';
    setSending(true);
    setChatError('');

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'https://buyukused-y6cp.onrender.com';
      const response = await fetch(`${apiBase}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiver: sellerId_, productId: product._id, message: text }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Could not send message');
      const sent = data.message || data.data;
      if (sent && sent._id) {
        setMessages((prev) => {
          const seen = new Set();
          return prev
            .map((m) => (m._id === tempId ? sent : m))
            .filter((m) => {
              if (!m || !m._id) return true;
              if (seen.has(m._id)) return false;
              seen.add(m._id);
              return true;
            });
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setNewMessage(text);
      setChatError(err.message || 'Could not send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // ─── CHAT – open / close ───────────────────────────────────
  const openChat = () => {
    if (!user) { navigate('/login'); return; }
    setShowChatModal(true);
    setChatError('');
    setMessagingAvailable(true);
    setChatLoading(true);
    fetchMessages().finally(() => setChatLoading(false));
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = setInterval(() => { fetchMessages(); }, 5000);
  };

  const closeChat = () => {
    setShowChatModal(false);
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  // ─── Auto-scroll chat ──────────────────────────────────────
  useEffect(() => {
    if (!showChatModal) { prevMsgLenRef.current = 0; return; }
    const behavior = prevMsgLenRef.current === 0 ? 'auto' : 'smooth';
    messagesEndRef.current?.scrollIntoView({ behavior });
    prevMsgLenRef.current = sortedMessages.length;
  }, [sortedMessages.length, showChatModal]);

  // ─── Loading / error / not-found ───────────────────────────
  if (loading) {
    return <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}><LoadingDots /></div>;
  }
  if (error) {
    return <div className="container" style={{ padding: "60px 20px", textAlign: "center", color: "#e74c3c" }}>{error}</div>;
  }
  if (!product) {
    return <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>Product not found.</div>;
  }

  // ─── Derived values ────────────────────────────────────────
  const liked = isFavorite(product._id);
  const isSold = product.status === "sold";

  const isLaptop = product.category === "Laptops";
  const isTablet = product.category === "Tablets";
  const isTV = product.category === "TVs" || product.category === "TV";
  const isConsole = product.category === "Game Consoles" || product.category === "Consoles";
  const isAccessory = product.category === "Accessories";
  const isPhone = product.category === "Phones";
  const isSmartwatch = product.category === "Smartwatches";

  let specsTitle = "📋 Specifications";
  if (isLaptop) specsTitle = "💻 Laptop Specifications";
  else if (isTablet) specsTitle = "📲 Tablet Specifications";
  else if (isTV) specsTitle = "📺 TV Specifications";
  else if (isConsole) specsTitle = "🎮 Game Console Specifications";
  else if (isAccessory) specsTitle = "🎧 Accessories Specifications";
  else if (isPhone) specsTitle = "📱 Phone Specifications";
  else if (isSmartwatch) specsTitle = "⌚ Smartwatch Specifications";

  const SpecRow = ({ label, value, tooltip }) => (
    <div><strong title={tooltip}>{label}:</strong> {value}</div>
  );

  const renderSpecs = () => {
    const specs = [];
    if (product.condition) specs.push(<SpecRow key="condition" label="Condition" value={product.condition} />);
    if (product.warranty) specs.push(<SpecRow key="warranty" label="Warranty" value={product.warranty} />);
    if (product.negotiation) specs.push(<SpecRow key="negotiation" label="Negotiable" value="Yes" />);
    if (product.swapAccepted) specs.push(<SpecRow key="swap" label="Swap Accepted" value="Yes" />);
    if (product.color) specs.push(<SpecRow key="color" label="Color" value={product.color} />);

    if (isLaptop) {
      if (product.brand) specs.push(<SpecRow key="brand" label="Brand" value={product.brand} />);
      if (product.model) specs.push(<SpecRow key="model" label="Model" value={product.model} />);
      if (product.processor) specs.push(<SpecRow key="processor" label="Processor" value={product.processor} tooltip="The brain of the computer; higher numbers and more cores mean better multitasking." />);
      if (product.ram) specs.push(<SpecRow key="ram" label="RAM" value={product.ram} tooltip="Temporary storage for active tasks; 8GB handles basic work, 16GB+ is recommended for gaming and heavy creative work." />);
      if (product.storage) specs.push(<SpecRow key="storage" label="Storage" value={product.storage} tooltip="Solid‑state drives (SSD) offer fast boot and load times compared to older hard drives (HDD)." />);
      if (product.screenSize) specs.push(<SpecRow key="screenSize" label="Screen Size" value={product.screenSize} tooltip="Display diagonal size in inches." />);
      if (product.graphics) specs.push(<SpecRow key="graphics" label="Graphics" value={product.graphics} tooltip="Handles visual rendering, video editing, and 3D gaming." />);
      if (product.batteryHealth !== null && product.batteryHealth !== undefined) specs.push(<SpecRow key="battery" label="Battery Health" value={`${product.batteryHealth}%`} />);
    } else if (isTablet) {
      if (product.brand) specs.push(<SpecRow key="brand" label="Brand" value={product.brand} />);
      if (product.model) specs.push(<SpecRow key="model" label="Model" value={product.model} />);
      if (product.year) specs.push(<SpecRow key="year" label="Year" value={product.year} />);
      if (product.storage) specs.push(<SpecRow key="storage" label="Storage" value={product.storage} />);
      if (product.screenSize) specs.push(<SpecRow key="screenSize" label="Screen Size" value={product.screenSize} />);
      if (product.connectivity) specs.push(<SpecRow key="connectivity" label="Connectivity" value={product.connectivity} />);
      if (product.batteryHealth !== null && product.batteryHealth !== undefined) specs.push(<SpecRow key="battery" label="Battery Health" value={`${product.batteryHealth}%`} />);
    } else if (isPhone) {
      if (product.brand) specs.push(<SpecRow key="brand" label="Brand" value={product.brand} />);
      if (product.model) specs.push(<SpecRow key="model" label="Model" value={product.model} />);
      if (product.storage) specs.push(<SpecRow key="storage" label="Storage" value={product.storage} />);
      if (product.screenSize) specs.push(<SpecRow key="screenSize" label="Screen Size" value={product.screenSize} />);
      if (product.batteryHealth !== null && product.batteryHealth !== undefined) specs.push(<SpecRow key="battery" label="Battery Health" value={`${product.batteryHealth}%`} />);
      if (product.faceId) specs.push(<SpecRow key="faceId" label="Face ID" value={product.faceId} />);
      if (product.simStatus) specs.push(<SpecRow key="sim" label="SIM Status" value={product.simStatus} />);
    } else if (isTV) {
      if (product.brand) specs.push(<SpecRow key="brand" label="Brand" value={product.brand} />);
      if (product.model) specs.push(<SpecRow key="model" label="Model" value={product.model} />);
      if (product.tvType) specs.push(<SpecRow key="tvType" label="TV Type" value={product.tvType} />);
      if (product.screenSize) specs.push(<SpecRow key="screenSize" label="Screen Size" value={product.screenSize} />);
      if (product.resolution) specs.push(<SpecRow key="resolution" label="Resolution" value={product.resolution} />);
      if (product.displayTechnology) specs.push(<SpecRow key="displayTechnology" label="Display Technology" value={product.displayTechnology} />);
      if (product.refreshRate) specs.push(<SpecRow key="refreshRate" label="Refresh Rate" value={product.refreshRate} />);
      if (product.operatingSystem) specs.push(<SpecRow key="operatingSystem" label="Operating System" value={product.operatingSystem} />);
      if (product.hdr) specs.push(<SpecRow key="hdr" label="HDR" value={product.hdr} />);
      if (product.hdmiPorts) specs.push(<SpecRow key="hdmiPorts" label="HDMI Ports" value={product.hdmiPorts} />);
      if (product.usbPorts) specs.push(<SpecRow key="usbPorts" label="USB Ports" value={product.usbPorts} />);
      if (product.connectivity) specs.push(<SpecRow key="connectivity" label="Connectivity" value={product.connectivity} />);
      if (product.year) specs.push(<SpecRow key="year" label="Year" value={product.year} />);
      if (product.smartTV) specs.push(<SpecRow key="smartTV" label="Smart TV" value="Yes" />);
      if (product.voiceControl) specs.push(<SpecRow key="voiceControl" label="Voice Control" value="Yes" />);
      if (product.wallMountable) specs.push(<SpecRow key="wallMountable" label="Wall Mountable" value="Yes" />);
    } else if (isConsole) {
      if (product.brand) specs.push(<SpecRow key="brand" label="Brand" value={product.brand} />);
      if (product.model) specs.push(<SpecRow key="model" label="Model" value={product.model} />);
      if (product.consoleType) specs.push(<SpecRow key="consoleType" label="Console Type" value={product.consoleType} />);
      if (product.edition) specs.push(<SpecRow key="edition" label="Edition" value={product.edition} />);
      if (product.discDrive) specs.push(<SpecRow key="discDrive" label="Disc Drive" value={product.discDrive} />);
      if (product.controllersIncluded) specs.push(<SpecRow key="controllers" label="Controllers Included" value={product.controllersIncluded} />);
      if (product.battery) specs.push(<SpecRow key="battery" label="Battery" value={product.battery} />);
      if (product.resolution) specs.push(<SpecRow key="resolution" label="Resolution" value={product.resolution} />);
      if (product.videoOutput) specs.push(<SpecRow key="videoOutput" label="Video Output" value={product.videoOutput} />);
      if (product.region) specs.push(<SpecRow key="region" label="Region" value={product.region} />);
      if (product.storage) specs.push(<SpecRow key="storage" label="Storage" value={product.storage} />);
      if (product.ram) specs.push(<SpecRow key="ram" label="RAM" value={product.ram} />);
      if (product.screenSize) specs.push(<SpecRow key="screenSize" label="Screen Size" value={product.screenSize} />);
      if (product.year) specs.push(<SpecRow key="year" label="Year" value={product.year} />);
      if (product.connectivity) specs.push(<SpecRow key="connectivity" label="Connectivity" value={product.connectivity} />);
    } else if (isSmartwatch) {
      if (product.brand) specs.push(<SpecRow key="brand" label="Brand" value={product.brand} />);
      if (product.model) specs.push(<SpecRow key="model" label="Model" value={product.model} />);
      if (product.watchSize) specs.push(<SpecRow key="watchSize" label="Watch Size" value={product.watchSize} />);
      if (product.connectivity) specs.push(<SpecRow key="connectivity" label="Connectivity" value={product.connectivity} />);
      if (product.color) specs.push(<SpecRow key="color" label="Color" value={product.color} />);
      if (product.batteryHealth !== null && product.batteryHealth !== undefined) specs.push(<SpecRow key="battery" label="Battery Health" value={`${product.batteryHealth}%`} />);
      if (product.warranty) specs.push(<SpecRow key="warranty" label="Warranty" value={product.warranty} />);
    } else if (isAccessory) {
      if (product.brand) specs.push(<SpecRow key="brand" label="Brand" value={product.brand} />);
      if (product.model) specs.push(<SpecRow key="model" label="Model" value={product.model} />);
      if (product.connectivity) specs.push(<SpecRow key="connectivity" label="Connectivity" value={product.connectivity} />);
    }
    return specs;
  };

  const hasAnySpec = () => renderSpecs().length > 0;

  const isSeller = user && (
    product?.sellerId?._id === user._id ||
    product?.sellerId === user._id ||
    product?.sellerId?.toString() === user._id?.toString()
  );

  const sellerName = (() => {
    const seller = product.seller || product.sellerId || {};
    return seller.name || product.sellerName || 'Seller';
  })();

  const sellerId = (() => {
    if (!product) return '';
    const candidates = [
      product?.sellerId?._id, product?.sellerId, product?.seller?._id, product?.seller,
      product?.sellerId?.id, product?.seller?.id, product?.userId, product?.ownerId,
    ];
    for (const c of candidates) {
      if (c && typeof c === 'string') return c;
      if (c && typeof c === 'object' && c._id) return c._id;
    }
    return '';
  })();

  const sellerAvatarForChat = (() => {
    const seller = product.seller || product.sellerId || {};
    const img = seller.profileImage || seller.photo || seller.avatar || seller.profilePicture || seller.image || null;
    if (!img) return null;
    return typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://')) ? img : getImageUrl(img);
  })();

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <>
      <style>
        {`
          /* ═══════════════════════════════════════════════════════
             LIQUID MIRROR — iOS27-STYLE PAGE / PANELS / BUTTONS
             ═══════════════════════════════════════════════════════ */

          .liquid-pd-page {
            position: relative;
            overflow: hidden;
            border-radius: 16px;
            background: linear-gradient(
              135deg,
              #eef4ff 0%,
              #f5f0ff 40%,
              #eaf7ff 70%,
              #f2f8ff 100%
            );
          }

          .liquid-pd-page::before {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            border-radius: inherit;
            background:
              radial-gradient(circle at 8% 15%, rgba(0,102,204,0.22) 0%, rgba(0,102,204,0.08) 25%, transparent 55%),
              radial-gradient(circle at 92% 60%, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 25%, transparent 55%),
              radial-gradient(circle at 50% 115%, rgba(6,182,212,0.18) 0%, rgba(6,182,212,0.06) 25%, transparent 55%),
              radial-gradient(circle at 30% 80%, rgba(59,130,246,0.12) 0%, transparent 50%);
            animation: liquid-pd-float 24s ease-in-out infinite;
            will-change: transform;
            z-index: 0;
          }
          .liquid-pd-page > * { position: relative; z-index: 1; }

          @keyframes liquid-pd-float {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
            33%      { transform: translate3d(-30px, 24px, 0) scale(1.06); }
            66%      { transform: translate3d(24px, -20px, 0) scale(0.97); }
          }

          .liquid-pd-panel {
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.62) 0%,
              rgba(255,255,255,0.22) 50%,
              rgba(255,255,255,0.52) 100%
            );
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.7);
            border-radius: 16px;
            box-shadow:
              0 6px 24px rgba(31,38,135,0.08),
              inset 0 1px 0 rgba(255,255,255,0.9),
              inset 0 -1px 0 rgba(255,255,255,0.2);
          }

          .liquid-pd-panel-warm {
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.7) 0%,
              rgba(254,249,195,0.4) 50%,
              rgba(255,255,255,0.55) 100%
            );
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.75);
            border-radius: 16px;
            box-shadow:
              0 6px 24px rgba(180,130,30,0.10),
              inset 0 1px 0 rgba(255,255,255,0.9),
              inset 0 -1px 0 rgba(255,255,255,0.2);
          }

          .liquid-pd-image-frame {
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.55) 0%,
              rgba(241,245,249,0.35) 50%,
              rgba(255,255,255,0.5) 100%
            );
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.75);
            border-radius: 16px;
            box-shadow:
              0 8px 28px rgba(31,38,135,0.10),
              inset 0 1px 0 rgba(255,255,255,0.95),
              inset 0 -1px 0 rgba(255,255,255,0.25);
            overflow: hidden;
          }

          .liquid-pd-btn {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            border-radius: var(--radius-full);
            font-weight: 700;
            cursor: pointer;
            backdrop-filter: blur(10px) saturate(180%);
            -webkit-backdrop-filter: blur(10px) saturate(180%);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            touch-action: manipulation;
            white-space: nowrap;
            border: 1px solid rgba(255,255,255,0.35);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.35),
              0 4px 14px rgba(0,0,0,0.1);
          }
          .liquid-pd-btn:hover:not(:disabled) { transform: translateY(-1px); }
          .liquid-pd-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
          .liquid-pd-btn:disabled { cursor: not-allowed; opacity: 0.7; }

          .liquid-pd-btn-wa {
            background: linear-gradient(135deg, rgba(37,211,102,0.94) 0%, rgba(29,177,84,0.88) 100%);
            color: #ffffff;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.35),
              0 4px 14px rgba(37,211,102,0.3);
          }
          .liquid-pd-btn-msg {
            background: linear-gradient(135deg, rgba(7,94,84,0.94) 0%, rgba(5,75,67,0.88) 100%);
            color: #ffffff;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.3),
              0 4px 14px rgba(7,94,84,0.3);
          }
          .liquid-pd-btn-blue {
            background: linear-gradient(135deg, rgba(0,102,204,0.94) 0%, rgba(0,85,165,0.88) 100%);
            color: #ffffff;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.35),
              0 4px 14px rgba(0,102,204,0.3);
          }
          .liquid-pd-btn-light {
            background: linear-gradient(135deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.3) 100%);
            color: #111827;
            border: 1px solid rgba(255,255,255,0.75);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.9),
              0 2px 10px rgba(31,38,135,0.06);
          }
          .liquid-pd-btn-red {
            background: linear-gradient(135deg, rgba(220,38,38,0.94) 0%, rgba(185,28,28,0.88) 100%);
            color: #ffffff;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.3),
              0 4px 14px rgba(220,38,38,0.3);
          }
          .liquid-pd-btn-green {
            background: linear-gradient(135deg, rgba(34,197,94,0.94) 0%, rgba(22,163,74,0.88) 100%);
            color: #ffffff;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.3),
              0 4px 14px rgba(34,197,94,0.3);
          }
          .liquid-pd-btn-outline-blue {
            background: linear-gradient(135deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.3) 100%);
            color: #0066cc;
            border: 1px solid rgba(0,102,204,0.45);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.9),
              0 2px 10px rgba(0,102,204,0.15);
          }
          .liquid-pd-btn-outline-gray {
            background: linear-gradient(135deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.24) 100%);
            color: #374151;
            border: 1px solid rgba(255,255,255,0.68);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.85),
              0 2px 10px rgba(31,38,135,0.06);
          }
          .liquid-pd-btn-outline-gray.liked {
            color: #e74c3c;
            border-color: rgba(231,76,60,0.45);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.85),
              0 2px 10px rgba(231,76,60,0.15);
          }
          .liquid-pd-btn-gray {
            background: linear-gradient(135deg, rgba(156,163,175,0.85) 0%, rgba(107,114,128,0.75) 100%);
            color: #ffffff;
            cursor: not-allowed;
            opacity: 0.7;
          }

          .liquid-pd-badge-glass {
            background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 100%);
            backdrop-filter: blur(8px) saturate(180%);
            -webkit-backdrop-filter: blur(8px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.7);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.9),
              0 2px 8px rgba(31,38,135,0.06);
            border-radius: 20px;
            padding: 2px 10px;
            font-size: 10px;
            font-style: italic;
            font-weight: 600;
            color: #1a56db;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s ease;
          }
          .liquid-pd-badge-glass:hover {
            background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(232,240,254,0.75) 100%);
            border-color: rgba(0,102,204,0.55);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,1),
              0 4px 14px rgba(0,102,204,0.18);
            transform: translateY(-1px);
          }

          .liquid-pd-image-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%);
            backdrop-filter: blur(10px) saturate(180%);
            -webkit-backdrop-filter: blur(10px) saturate(180%);
            color: #ffffff;
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            font-size: 18px;
            cursor: pointer;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow:
              0 4px 12px rgba(0,0,0,0.25),
              inset 0 1px 0 rgba(255,255,255,0.25);
            transition: transform 0.15s ease, background 0.15s ease;
          }
          .liquid-pd-image-nav:hover {
            background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 100%);
            transform: translateY(-50%) scale(1.08);
          }

          .liquid-pd-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.6);
            cursor: pointer;
            padding: 0;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          }

          .liquid-pd-thumb {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
            cursor: pointer;
            flex-shrink: 0;
            background: #f1f5f9;
            transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          }
          .liquid-pd-thumb:hover { transform: translateY(-2px); }

          .liquid-pd-lightbox-close {
            position: fixed;
            top: 70px;
            right: 20px;
            background: linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.7) 100%);
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            color: #1a1a1a;
            border: 1px solid rgba(255,255,255,0.6);
            border-radius: 50%;
            width: 48px;
            height: 48px;
            font-size: 24px;
            cursor: pointer;
            z-index: 10004;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow:
              0 8px 28px rgba(0,0,0,0.35),
              inset 0 1px 0 rgba(255,255,255,0.9);
            line-height: 1;
          }
          .liquid-pd-lightbox-close:hover {
            transform: scale(1.06);
            box-shadow:
              0 12px 36px rgba(0,0,0,0.45),
              inset 0 1px 0 rgba(255,255,255,1);
          }

          .liquid-pd-lightbox-nav {
            position: fixed;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 100%);
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            color: #ffffff;
            border: 1px solid rgba(255,255,255,0.35);
            border-radius: 50%;
            width: 52px;
            height: 52px;
            font-size: 24px;
            cursor: pointer;
            z-index: 10003;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease, background 0.2s ease;
            box-shadow:
              0 8px 24px rgba(0,0,0,0.35),
              inset 0 1px 0 rgba(255,255,255,0.35);
          }
          .liquid-pd-lightbox-nav:hover {
            background: linear-gradient(135deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.22) 100%);
            transform: translateY(-50%) scale(1.06);
          }

          .liquid-pd-lightbox-counter {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            color: #ffffff;
            background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.1) 100%);
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.3);
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 10003;
            box-shadow:
              0 6px 20px rgba(0,0,0,0.35),
              inset 0 1px 0 rgba(255,255,255,0.3);
          }

          /* ═══════════════════════════════════════════════════════
             RESPONSIVE
             ═══════════════════════════════════════════════════════ */
          @media (max-width: 768px) {
            .product-detail { grid-template-columns: 1fr !important; gap: 16px !important; }
            .thumbnails img { width: 50px !important; height: 50px !important; }
            .details h1 { font-size: 22px !important; }
            .details .price { font-size: 26px !important; }
            .details .meta { font-size: 13px !important; gap: 6px !important; }
            .actions button { font-size: 14px !important; padding: 8px 16px !important; }
            .safety { font-size: 11px !important; padding: 8px 10px !important; }
            .specs-grid { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 480px) {
            .thumbnails img { width: 40px !important; height: 40px !important; }
            .details h1 { font-size: 18px !important; }
            .details .price { font-size: 20px !important; }
            .actions { flex-direction: column !important; }
            .actions button { width: 100% !important; justify-content: center !important; padding: 8px 12px !important; }
          }
          .related-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
          @media (max-width: 600px) { .related-products-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

          /* ─── Lightbox overlay ──────────────────────────── */
          .lightbox-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.92); display: flex; align-items: center; justify-content: center; z-index: 10002; padding: 16px; cursor: pointer; }
          .lightbox-image { max-width: 90vw; max-height: 90vh; object-fit: contain; cursor: default; border-radius: 8px; box-shadow: 0 8px 40px rgba(0,0,0,0.6); }
          .lightbox-prev { left: 16px; }
          .lightbox-next { right: 16px; }
          @media (max-width: 600px) {
            .liquid-pd-lightbox-close { top: 60px; right: 12px; width: 44px; height: 44px; font-size: 22px; }
            .liquid-pd-lightbox-nav { width: 44px; height: 44px; font-size: 20px; }
            .lightbox-prev { left: 8px; }
            .lightbox-next { right: 8px; }
            .lightbox-image { max-width: 95vw; max-height: 80vh; }
            .liquid-pd-lightbox-counter { bottom: 16px; font-size: 12px; padding: 4px 12px; }
          }

          /* ═══════════════════════════════════════════════════════
             WhatsApp-style chat modal — BASE (desktop/tablet)
             ═══════════════════════════════════════════════════════ */
          .wa-chat-overlay {
            position: fixed; inset: 0;
            background: rgba(11, 20, 26, 0.85);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            z-index: 10000;
            padding: 16px;
            animation: wa-fade-in 0.15s ease;
          }
          @keyframes wa-fade-in { from { opacity: 0; } to { opacity: 1; } }

          .wa-chat-modal {
            width: 100%;
            max-width: 520px;
            height: min(560px, calc(100dvh - 48px));
            max-height: calc(100dvh - 48px);
            background: #efeae2;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 24px 80px rgba(0,0,0,0.5);
            animation: wa-slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes wa-slide-up {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          .wa-chat-header {
            flex-shrink: 0;
            background: #075e54;
            color: #ffffff;
            padding: 10px 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .wa-chat-back-btn {
            background: transparent;
            border: none;
            color: #ffffff;
            cursor: pointer;
            width: 36px; height: 36px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 17px;
            transition: background 0.15s;
            flex-shrink: 0;
          }
          .wa-chat-back-btn:hover { background: rgba(255,255,255,0.12); }

          .wa-chat-avatar {
            width: 40px; height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.22);
            display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 16px;
            flex-shrink: 0;
            overflow: hidden;
            border: 1.5px solid rgba(255,255,255,0.3);
          }

          .wa-chat-body {
            flex: 1;
            overflow-y: auto;
            min-height: 0;
            padding: 14px 12px;
            background-color: #efeae2;
            background-image:
              radial-gradient(circle at 20px 20px, rgba(0,0,0,0.03) 1px, transparent 1.5px),
              radial-gradient(circle at 60px 60px, rgba(0,0,0,0.025) 1px, transparent 1.5px);
            background-size: 40px 40px, 40px 40px;
            overscroll-behavior: contain;
            scroll-behavior: smooth;
          }
          .wa-chat-body::-webkit-scrollbar { width: 6px; }
          .wa-chat-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 3px; }

          .wa-date-divider {
            display: flex; justify-content: center;
            margin: 12px 0 8px;
          }
          .wa-date-divider > span {
            background: #ffffff;
            padding: 5px 12px;
            border-radius: 8px;
            font-size: 11.5px;
            font-weight: 600;
            color: #667781;
            box-shadow: 0 1px 0.5px rgba(11,20,26,0.13);
          }

          .wa-bubble {
            max-width: 78%;
            padding: 6px 9px 4px 10px;
            font-size: 14px;
            line-height: 1.4;
            color: #111b21;
            word-wrap: break-word;
            word-break: break-word;
            overflow-wrap: anywhere;
            box-shadow: 0 1px 0.5px rgba(11,20,26,0.13);
            position: relative;
            margin-bottom: 2px;
          }
          .wa-bubble.mine {
            background: #dcf8c6;
            margin-left: auto;
            border-radius: 8px;
            border-top-right-radius: 8px;
            border-bottom-right-radius: 2px;
          }
          .wa-bubble.theirs {
            background: #ffffff;
            margin-right: auto;
            border-radius: 8px;
            border-top-left-radius: 8px;
            border-bottom-left-radius: 2px;
          }

          .wa-bubble-meta {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 4px;
            font-size: 10.5px;
            color: #667781;
            margin-top: 2px;
            margin-left: 12px;
            line-height: 1;
          }
          .wa-bubble-meta .wa-check { font-size: 11px; }

          .wa-chat-composer {
            flex-shrink: 0;
            background: #f0f2f5;
            padding: 8px 10px;
            display: flex;
            align-items: flex-end;
            gap: 6px;
            border-top: 1px solid #e5e7eb;
          }
          .wa-chat-input {
            flex: 1;
            min-width: 0;
            border: none;
            outline: none;
            background: #ffffff;
            padding: 9px 14px;
            border-radius: 20px;
            font-size: 14.5px;
            color: #111b21;
            font-family: inherit;
            line-height: 20px;
            resize: none;
            min-height: 38px;
            max-height: 90px;
            overflow-y: auto;
            box-sizing: border-box;
            -webkit-appearance: none;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
            box-shadow: 0 1px 1px rgba(0,0,0,0.04);
            transition: box-shadow 0.15s;
          }
          .wa-chat-input:focus { box-shadow: 0 0 0 2px rgba(37, 211, 102, 0.25); }
          .wa-chat-input::placeholder { color: #8696a0; }

          .wa-send-btn {
            width: 42px; height: 42px;
            border-radius: 50%;
            background: #25d366;
            color: #ffffff;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
            transition: background 0.15s, opacity 0.15s, transform 0.1s;
            box-shadow: 0 2px 4px rgba(37, 211, 102, 0.3);
          }
          .wa-send-btn:hover:not(:disabled) { background: #1fb855; }
          .wa-send-btn:active:not(:disabled) { transform: scale(0.94); }
          .wa-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

          .wa-error-banner {
            flex-shrink: 0;
            background: #fef2f2;
            color: #b91c1c;
            padding: 6px 14px;
            font-size: 12px;
            border-top: 1px solid #fecaca;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          @media (max-width: 600px) {
            .wa-chat-overlay { padding: 0; align-items: stretch; justify-content: stretch; }
            .wa-chat-modal {
              width: 100%; max-width: 100%;
              height: 100vh; height: 100dvh;
              max-height: 100vh; max-height: 100dvh;
              border-radius: 0; margin: 0;
            }
            .wa-chat-header {
              padding-top: calc(10px + env(safe-area-inset-top, 0px));
              padding-bottom: 10px;
              padding-left: calc(12px + env(safe-area-inset-left, 0px));
              padding-right: calc(12px + env(safe-area-inset-right, 0px));
            }
            .wa-chat-body { padding: 10px 8px; }
            .wa-chat-composer {
              padding-top: 8px;
              padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
              padding-left: calc(8px + env(safe-area-inset-left, 0px));
              padding-right: calc(8px + env(safe-area-inset-right, 0px));
              gap: 4px;
            }
            .wa-chat-input {
              font-size: 16px;
              padding: 8px 12px;
              min-height: 36px;
              max-height: 90px;
              line-height: 20px;
            }
            .wa-send-btn { width: 40px; height: 40px; font-size: 15px; }
            .wa-bubble { max-width: 82%; font-size: 14px; }
            .wa-chat-avatar { width: 36px; height: 36px; font-size: 14px; }
            .wa-chat-back-btn { width: 34px; height: 34px; font-size: 16px; }
            .wa-error-banner { font-size: 11.5px; padding: 5px 12px; }
          }
          @media (max-width: 380px) {
            .wa-chat-header {
              padding-top: calc(8px + env(safe-area-inset-top, 0px));
              padding-bottom: 8px;
              padding-left: calc(8px + env(safe-area-inset-left, 0px));
              padding-right: calc(8px + env(safe-area-inset-right, 0px));
              gap: 6px;
            }
            .wa-chat-body { padding: 8px 4px; }
            .wa-chat-composer {
              padding-top: 6px;
              padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
              padding-left: calc(6px + env(safe-area-inset-left, 0px));
              padding-right: calc(6px + env(safe-area-inset-right, 0px));
              gap: 3px;
            }
            .wa-chat-input { padding: 7px 10px; min-height: 34px; max-height: 80px; font-size: 16px; line-height: 18px; }
            .wa-send-btn { width: 36px; height: 36px; font-size: 14px; }
            .wa-chat-avatar { width: 32px; height: 32px; font-size: 13px; }
            .wa-chat-back-btn { width: 30px; height: 30px; font-size: 14px; }
            .wa-bubble { max-width: 88%; font-size: 13.5px; }
            .wa-date-divider > span { font-size: 10.5px; padding: 4px 10px; }
          }
          @media (max-width: 900px) and (max-height: 500px) and (orientation: landscape) {
            .wa-chat-overlay { padding: 0; align-items: stretch; justify-content: stretch; }
            .wa-chat-modal {
              width: 100%; max-width: 100%;
              height: 100vh; height: 100dvh;
              max-height: 100vh; max-height: 100dvh;
              border-radius: 0;
            }
            .wa-chat-header {
              padding-top: calc(6px + env(safe-area-inset-top, 0px));
              padding-bottom: 6px;
              padding-left: calc(12px + env(safe-area-inset-left, 0px));
              padding-right: calc(12px + env(safe-area-inset-right, 0px));
            }
            .wa-chat-body { padding: 6px 16px; }
            .wa-chat-composer {
              padding-top: 6px;
              padding-bottom: calc(6px + env(safe-area-inset-bottom, 0px));
              padding-left: calc(12px + env(safe-area-inset-left, 0px));
              padding-right: calc(12px + env(safe-area-inset-right, 0px));
            }
            .wa-chat-input { min-height: 32px; max-height: 60px; }
            .wa-send-btn { width: 36px; height: 36px; }
            .wa-chat-avatar { width: 32px; height: 32px; }
            .wa-bubble { max-width: 60%; }
          }
          @media (min-width: 601px) and (max-width: 1024px) {
            .wa-chat-modal {
              max-width: 560px;
              height: min(560px, 72dvh);
              max-height: min(560px, 72dvh);
            }
          }

          /* ═══════════════════════════════════════════════════════
             REDUCED MOTION
             ═══════════════════════════════════════════════════════ */
          @media (prefers-reduced-motion: reduce) {
            .liquid-pd-page::before {
              animation: none !important;
            }
            .liquid-pd-btn,
            .liquid-pd-thumb,
            .liquid-pd-image-nav,
            .liquid-pd-lightbox-close,
            .liquid-pd-lightbox-nav {
              transition: none !important;
            }
            .liquid-pd-btn:hover:not(:disabled),
            .liquid-pd-thumb:hover,
            .liquid-pd-lightbox-close:hover,
            .liquid-pd-image-nav:hover {
              transform: none !important;
            }
          }
        `}
      </style>

      <div className="container liquid-pd-page" style={{ padding: "16px 12px" }}>
        <div className="product-detail" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* GALLERY */}
          <div className="gallery">
            <div
              className="main-image liquid-pd-image-frame"
              style={{ position: "relative", aspectRatio: "1/1", cursor: hasImages ? "pointer" : "default" }}
              onClick={() => hasImages && openLightbox(currentImageIndex)}
            >
              <img src={getCurrentImage()} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {isSold && <SoldBadge variant="ribbon" />}
              {totalImages > 1 && (
                <>
                  <button type="button" onClick={handlePrev} className="liquid-pd-image-nav" style={{ left: "6px" }}>‹</button>
                  <button type="button" onClick={handleNext} className="liquid-pd-image-nav" style={{ right: "6px" }}>›</button>
                  <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "4px", zIndex: 10 }}>
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleThumbClick(idx)}
                        className="liquid-pd-dot"
                        style={{
                          background: idx === currentImageIndex
                            ? "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 100%)"
                            : "rgba(255,255,255,0.5)",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {hasImages && totalImages > 1 && (
              <div className="thumbnails" style={{ display: "flex", gap: "6px", marginTop: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                {images.map((_, idx) => (
                  <img
                    key={idx}
                    src={getThumbnail(idx)}
                    alt={`Thumb ${idx + 1}`}
                    loading="lazy"
                    onClick={() => handleThumbClick(idx)}
                    className="liquid-pd-thumb"
                    style={{
                      border: currentImageIndex === idx
                        ? "3px solid rgba(0,102,204,0.85)"
                        : "2px solid rgba(255,255,255,0.75)",
                      boxShadow: currentImageIndex === idx
                        ? "0 4px 14px rgba(0,102,204,0.35), inset 0 1px 0 rgba(255,255,255,0.9)"
                        : "0 2px 8px rgba(31,38,135,0.08), inset 0 1px 0 rgba(255,255,255,0.85)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="details">
            <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "2px" }}>
              {product.title}
              {isSold && (
                <span style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#b91c1c",
                  background: "linear-gradient(135deg, rgba(254,226,226,0.92) 0%, rgba(254,202,202,0.75) 100%)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(252,165,165,0.6)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  marginLeft: "6px",
                  display: "inline-block",
                  verticalAlign: "middle",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(220,38,38,0.15)",
                }}>SOLD</span>
              )}
            </h1>

            <div className="price" style={{ fontSize: "28px", fontWeight: 800, color: isSold ? "#9ca3af" : "var(--primary)", marginBottom: "2px" }}>
              GH₵ {Number(product.price || 0).toLocaleString()}
              {product.oldPrice && (
                <span style={{ fontSize: "15px", fontWeight: 400, color: "var(--gray-400)", textDecoration: "line-through", marginLeft: "8px" }}>GH₵ {Number(product.oldPrice).toLocaleString()}</span>
              )}
            </div>

            <div className="meta" style={{ display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "13px", color: "var(--gray-500)", marginBottom: "6px" }}>
              <span><i className="fas fa-map-marker-alt" /> {product.location || "Ghana"}</span>
              <span><i className="fas fa-tag" /> {product.category}</span>
              <span><i className="fas fa-eye" /> {product.views || 0} views</span>
              <span><i className="fas fa-clock" /> {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ""}</span>
              {product.simStatus && product.category !== 'Laptops' && (
                <span style={{ color: "#0055a5", fontWeight: 600 }}><i className="fas fa-sim-card" /> SIM: {product.simStatus}</span>
              )}
            </div>

            {hasAnySpec() && (
              <div className="specs liquid-pd-panel" style={{ marginBottom: "10px", padding: "12px 14px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>{specsTitle}</h3>
                <div className="specs-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "4px", fontSize: "13px" }}>
                  {renderSpecs()}
                </div>
              </div>
            )}

            <div className="description" style={{ color: "var(--gray-700)", lineHeight: 1.5, marginBottom: "10px", fontSize: "14px" }}>
              {product.description || "No description provided."}
            </div>

            {/* SELLER CARD */}
            <div className="seller liquid-pd-panel" style={{ marginBottom: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="seller-avatar-wrapper" style={{ position: 'relative', width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(226,232,240,0.4) 100%)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.75)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(31,38,135,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
                {(() => {
                  const seller = product.seller || product.sellerId || {};
                  const imageField = seller.profileImage || seller.photo || seller.avatar || seller.profilePicture || seller.profilePic || seller.picture || seller.image || seller.profile_pic || seller.profile_picture || null;
                  const name = seller.name || product.sellerName || 'KN Seller';
                  let avatarUrl = null;
                  if (imageField) {
                    if (typeof imageField === 'string' && (imageField.startsWith('http://') || imageField.startsWith('https://'))) { avatarUrl = imageField; } else { avatarUrl = getImageUrl(imageField); }
                  }
                  if (avatarUrl) {
                    return <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; const parent = e.currentTarget.parentElement; parent.innerHTML = `<i class="fas fa-user-circle" style="font-size: 22px; color: var(--gray-400);"></i>`; parent.style.display = 'flex'; parent.style.alignItems = 'center'; parent.style.justifyContent = 'center'; }} />;
                  }
                  return <i className="fas fa-user-circle" style={{ fontSize: '22px', color: 'var(--gray-400)' }} />;
                })()}
                <span className={`seller-status-dot ${(() => { const seller = product.seller || product.sellerId || {}; if (seller.online === true) return 'online'; if (seller.online === false) return 'offline'; if (seller.lastActive) { const last = new Date(seller.lastActive); const diffMin = (new Date() - last) / 60000; return diffMin < 2 ? 'online' : 'offline'; } return 'unknown'; })()}`} />
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <Link to={`/seller/${sellerId}`} style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)', textDecoration: 'underline', textDecorationColor: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                    <i className="fas fa-user" />{sellerName}
                  </Link>
                  <Link
                    to={`/seller/${sellerId}`}
                    className="liquid-pd-badge-glass"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fas fa-external-link-alt" style={{ fontSize: '8px' }} />VIEW PROFILE
                  </Link>
                </div>
                {user ? (product.sellerPhone && (<div style={{ fontSize: '12px', color: 'var(--gray-600)' }}><i className="fas fa-phone" style={{ marginRight: '4px' }} />{product.sellerPhone}</div>)) : (
                  <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}><i className="fas fa-lock" style={{ marginRight: '4px' }} /><span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/login')}>Sign up</span>{' to view seller\'s phone number'}</div>
                )}
                {(() => { const seller = product.seller || product.sellerId || {}; if (seller.createdAt) { return <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: '1px' }}><i className="fas fa-calendar-alt" style={{ marginRight: '4px' }} />Member since {new Date(seller.createdAt).toLocaleDateString()}</div>; } return null; })()}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="actions" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {isSold ? (
                <button type="button" disabled className="liquid-pd-btn liquid-pd-btn-gray" style={{ padding: "8px 20px", fontSize: "14px" }}><i className="fas fa-ban" />Sold Out</button>
              ) : user ? (
                <>
                  <button type="button" onClick={handleContact} className="liquid-pd-btn liquid-pd-btn-wa" style={{ padding: "8px 20px", fontSize: "14px" }}><i className="fab fa-whatsapp" />Contact Seller</button>
                  {!isSeller && (
                    <button type="button" onClick={openChat} className="liquid-pd-btn liquid-pd-btn-msg" style={{ padding: "8px 20px", fontSize: "14px" }}><i className="fas fa-comment-dots" />Message Seller</button>
                  )}
                </>
              ) : (
                <button type="button" onClick={() => navigate('/login')} className="liquid-pd-btn liquid-pd-btn-blue" style={{ padding: "8px 20px", fontSize: "14px" }}><i className="fas fa-sign-in-alt" />Sign up to contact seller</button>
              )}

              <button
                type="button"
                onClick={() => navigate("/book-rider", { state: { productId: product?._id || product?.id, productTitle: product?.title || product?.name || "", productPrice: product?.price || 0, sellerId: product?.sellerId?._id || product?.sellerId || "", sellerName: product?.sellerName || "", sellerPhone: product?.sellerPhone || "" } })}
                className="liquid-pd-btn liquid-pd-btn-light"
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                <FaMotorcycle size={15} />BOOK A BIKE RIDER
              </button>

              {canEdit && (
                <button
                  type="button"
                  onClick={handleMarkAsSold}
                  disabled={isUpdating}
                  className={`liquid-pd-btn ${isSold ? "liquid-pd-btn-green" : "liquid-pd-btn-red"}`}
                  style={{ padding: "8px 16px", fontSize: "13px", fontWeight: 600 }}
                >
                  {isUpdating ? "⏳ Updating..." : (<><i className={isSold ? "fas fa-undo" : "fas fa-check-circle"} />{isSold ? "Mark Available" : "Mark as Sold"}</>)}
                </button>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="liquid-pd-btn liquid-pd-btn-outline-blue"
                  style={{ padding: "8px 16px", fontSize: "13px", fontWeight: 600 }}
                >
                  <i className="fas fa-pen" />Edit
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleFavorite(product._id)}
                className={`liquid-pd-btn liquid-pd-btn-outline-gray ${liked ? "liked" : ""}`}
                style={{ padding: "8px 16px", fontSize: "13px", fontWeight: 600 }}
              >
                <i className={liked ? "fas fa-heart" : "far fa-heart"} />{liked ? "Saved" : "Save"}
              </button>
            </div>

            {/* SAFETY */}
            <div className="safety liquid-pd-panel-warm" style={{ marginTop: "8px", padding: "12px 14px", fontSize: "11px", color: "#854d0e" }}>
              <strong><i className="fas fa-shield-alt" /> Safety tips</strong>
              <ul style={{ paddingLeft: "16px", marginTop: "3px", marginBottom: 0 }}>
                <li>Avoid paying in advance, even for delivery.</li>
                <li>Meet with the seller at a safe public place.</li>
                <li>Inspect the item before paying.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* REVIEW SECTION */}
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.6)" }}>
          <ReviewSection sellerId={sellerId} productId={product._id} sellerName={sellerName} currentUser={user} showWriteReview={!isSeller && !isSold} />
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.6)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "12px" }}>You might also like</h2>
            {relatedLoading ? (
              <div style={{ textAlign: "center", padding: "30px", color: "var(--gray-400)" }}>Loading related products...</div>
            ) : (
              <div className="related-products-grid">
                {relatedProducts.map((rp) => (<RelatedProductCard key={rp._id} product={rp} />))}
              </div>
            )}
          </div>
        )}

        {/* EDIT MODAL */}
        {showEditModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(11,20,26,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }} onClick={() => setShowEditModal(false)}>
            <div
              className="liquid-pd-panel"
              style={{ maxWidth: "600px", width: "100%", padding: "32px", position: "relative", maxHeight: "90vh", overflowY: "auto", borderRadius: "var(--radius-xl)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ position: "absolute", top: "14px", right: "18px", fontSize: "24px", cursor: "pointer", color: "#6b7280", background: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.35) 100%)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.75)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(31,38,135,0.08)", lineHeight: 1 }}
              >
                ×
              </button>
              <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "20px", textAlign: "center" }}>Edit Product</h2>
              {editError && (
                <div style={{ background: "linear-gradient(135deg, rgba(254,226,226,0.9) 0%, rgba(254,202,202,0.75) 100%)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(252,165,165,0.55)", color: "#b91c1c", padding: "10px 14px", borderRadius: "var(--radius-sm)", marginBottom: "16px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)" }}>{editError}</div>
              )}
              <form onSubmit={handleEditSubmit}>{/* The edit form remains unchanged – keep your existing code */}</form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            WHATSAPP-STYLE CHAT MODAL (kept WhatsApp styled)
            ═══════════════════════════════════════════════════════════ */}
        {showChatModal && (
          <div className="wa-chat-overlay" onClick={closeChat}>
            <div
              className="wa-chat-modal"
              ref={chatModalRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="wa-chat-header">
                <button type="button" className="wa-chat-back-btn" onClick={closeChat} aria-label="Close chat">
                  <i className="fas fa-arrow-left" />
                </button>
                <div className="wa-chat-avatar">
                  {sellerAvatarForChat ? (
                    <img src={sellerAvatarForChat} alt={sellerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    (sellerName || 'S').charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sellerName}</div>
                  <div style={{ fontSize: 11.5, opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.title}
                  </div>
                </div>
              </div>

              <div className="wa-chat-body">
                {chatLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
                    <LoadingDots />
                  </div>
                ) : sortedMessages.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', color: '#667781', minHeight: '100%' }}>
                    <div style={{ background: '#fef3c7', color: '#b45309', padding: '10px 14px', borderRadius: 10, fontSize: 12, marginBottom: 14, maxWidth: 280, lineHeight: 1.5 }}>
                      <i className="fas fa-lock" style={{ marginRight: 6 }} />
                      Your messages are private. Start the conversation with {sellerName}.
                    </div>
                    <div style={{ fontSize: 13 }}>No messages yet</div>
                  </div>
                ) : (
                  sortedMessages.map((msg, idx) => {
                    const prev = sortedMessages[idx - 1];
                    const showDate = !prev || !sameDay(prev.createdAt, msg.createdAt);
                    const isMine = getMsgId(msg.sender) === user._id;
                    const isImg = isImageMessage(msg.message);
                    const imgUrl = isImg ? extractImageUrl(msg.message) : null;

                    return (
                      <React.Fragment key={msg._id || `msg-${idx}`}>
                        {showDate && (
                          <div className="wa-date-divider">
                            <span>{formatChatDay(msg.createdAt)}</span>
                          </div>
                        )}
                        <div className={`wa-bubble ${isMine ? 'mine' : 'theirs'}`}>
                          {isImg && imgUrl ? (
                            <img
                              src={imgUrl}
                              alt="Shared"
                              onClick={() => setViewingImage(imgUrl)}
                              style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 6, display: 'block', cursor: 'pointer', marginBottom: 2 }}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.message}</div>
                          )}
                          <div className="wa-bubble-meta">
                            {msg._optimistic && (
                              <i className="fas fa-clock" style={{ fontSize: 9 }} title="Sending..." />
                            )}
                            <span>{formatChatTime(msg.createdAt)}</span>
                            {isMine && !msg._optimistic && (
                              <i className="fas fa-check-double wa-check" style={{ color: msg.read ? '#53bdeb' : '#8696a0' }} />
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {chatError && (
                <div className="wa-error-banner">
                  <i className="fas fa-exclamation-circle" /> {chatError}
                </div>
              )}

              <form className="wa-chat-composer" onSubmit={sendMessage}>
                <textarea
                  ref={chatInputRef}
                  rows={1}
                  className="wa-chat-input"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 90) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newMessage.trim() && !sending && user) {
                        e.currentTarget.form?.requestSubmit();
                      }
                    }
                  }}
                  placeholder={user ? `Message ${sellerName}…` : 'Please login to message'}
                  disabled={!user || sending}
                  enterKeyHint="send"
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  className="wa-send-btn"
                  disabled={!user || sending || !newMessage.trim()}
                  aria-label="Send message"
                >
                  <i className={sending ? 'fas fa-circle-notch fa-spin' : 'fas fa-paper-plane'} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* LIGHTBOX for chat images */}
        {viewingImage && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.92)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10001, cursor: "pointer", padding: 20 }} onClick={() => setViewingImage(null)}>
            <img src={viewingImage} alt="Full screen" style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
          </div>
        )}

        {/* PRODUCT GALLERY LIGHTBOX */}
        {lightboxOpen && (
          <div className="lightbox-overlay" onClick={closeLightbox}>
            <button type="button" className="liquid-pd-lightbox-close" onClick={closeLightbox} aria-label="Close fullscreen image">✕</button>
            {totalImages > 1 && (
              <>
                <button type="button" className="liquid-pd-lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); prevLightboxImage(); }} aria-label="Previous image">‹</button>
                <button type="button" className="liquid-pd-lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); nextLightboxImage(); }} aria-label="Next image">›</button>
                <div className="liquid-pd-lightbox-counter">{lightboxIndex + 1} / {totalImages}</div>
              </>
            )}
            <img className="lightbox-image" src={getLightboxImage(lightboxIndex)} alt={product.title} onClick={(e) => e.stopPropagation()} />
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetails;