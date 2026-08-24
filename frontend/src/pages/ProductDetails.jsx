// frontend/src/pages/ProductDetails.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";

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
import VerifiedBadge from "../components/VerifiedBadge";

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

// ── Unified colour list (iPhone colours + tablet colours) ──────
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

// ─── Console‑specific option lists ──────────────────────────────
const CONSOLE_TYPES = [
  'Home Console',
  'Handheld Console',
  'Hybrid Console',
  'Retro Console',
  'Portable Gaming PC',
  'Other',
];

const CONSOLE_EDITIONS = [
  'Standard Edition',
  'Digital Edition',
  'Disc Edition',
  'All-Digital Edition',
  'Slim Edition',
  'Pro Edition',
  'OLED Edition',
  'Limited Edition',
  'Special Edition',
  'Collector’s Edition',
  'Other',
];

const DISC_DRIVE_OPTIONS = [
  'Built-in Disc Drive',
  'No Disc Drive',
  'External Disc Drive Compatible',
  'Not Applicable',
];

const CONTROLLER_OPTIONS = [
  'No Controller',
  '1 Controller',
  '2 Controllers',
  '3 Controllers',
  '4 Controllers',
  'More than 4 Controllers',
];

const BATTERY_OPTIONS = [
  'Built-in Rechargeable Battery',
  'Replaceable Battery',
  'No Battery',
  'Not Applicable',
];

const CONSOLE_RESOLUTIONS = [
  '720p',
  '900p',
  '1080p',
  '1440p',
  '4K UHD',
  '8K UHD',
  'Other',
];

const VIDEO_OUTPUT_OPTIONS = [
  'HDMI',
  'HDMI 2.0',
  'HDMI 2.1',
  'DisplayPort',
  'USB-C DisplayPort',
  'Other',
];

const REGION_OPTIONS = [
  'NTSC',
  'PAL',
  'NTSC-J',
  'Region Free',
  'Other',
];

// ─── Smartwatch‑specific option lists ──────────────────────────
const WATCH_SIZE_OPTIONS = [
  '38mm',
  '40mm',
  '41mm',
  '42mm',
  '44mm',
  '45mm',
  '46mm',
  '47mm',
  '49mm',
  '51mm',
  'Other',
];

// ─── TV‑specific option lists ──────────────────────────────────
const TV_TYPES = [
  'Smart TV',
  'LED TV',
  'LCD TV',
  'OLED TV',
  'QLED TV',
  'Mini-LED TV',
  'Plasma TV',
  'Android TV',
  'Google TV',
  'Fire TV',
  'Other',
];

const DISPLAY_TECHNOLOGIES = [
  'LED',
  'LCD',
  'OLED',
  'QLED',
  'Neo QLED',
  'Mini-LED',
  'MicroLED',
  'NanoCell',
  'ULED',
  'Plasma',
  'Other',
];

const REFRESH_RATES = [
  '50Hz',
  '60Hz',
  '75Hz',
  '100Hz',
  '120Hz',
  '144Hz',
  '165Hz',
  '240Hz',
  'Other',
];

const TV_OPERATING_SYSTEMS = [
  'Tizen',
  'webOS',
  'Google TV',
  'Android TV',
  'Roku TV',
  'Fire TV',
  'VIDAA',
  'My Home Screen',
  'SmartCast',
  'Other',
];

const HDR_OPTIONS = [
  'HDR10',
  'HDR10+',
  'Dolby Vision',
  'HLG',
  'HDR10 + Dolby Vision',
  'HDR10+ + Dolby Vision',
  'No HDR',
  'Other',
];

const HDMI_OPTIONS = [
  '1 HDMI',
  '2 HDMI',
  '3 HDMI',
  '4 HDMI',
  '5 HDMI',
  '6 HDMI',
  'Other',
];

const USB_OPTIONS = [
  '1 USB',
  '2 USB',
  '3 USB',
  '4 USB',
  'Other',
];

// ─── Helpers for image messages ──────────────────────────────────

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

// ─── Helper: format price ──────────────────────────────────────
const formatPrice = (price) => {
  return `GH₵ ${Number(price).toLocaleString()}`;
};

// ─── Helper: Product Card for related products ──────────────────
const RelatedProductCard = ({ product }) => {
  const navigate = useNavigate();

  const image = product.images?.[0] || product.image || "";
  const imageUrl = image ? getImageUrl(image) : "https://placehold.co/300x300?text=No+Image";
  const isSold = product.status === "sold";

  return (
    <div
      className="related-product-card"
      style={{
        background: "white",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={() => navigate(`/product/${product._id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "100%",
          background: "#f1f5f9",
          overflow: "hidden",
        }}
      >
        <img
          src={imageUrl}
          alt={product.title}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/300x300?text=No+Image";
          }}
        />
        {isSold && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "#dc2626",
              color: "white",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Sold
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px" }}>
        <h4
          style={{
            fontSize: "15px",
            fontWeight: 700,
            margin: "0 0 4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.title}
        </h4>
        <div
          style={{
            fontSize: "12px",
            color: "var(--gray-500)",
            marginBottom: "4px",
          }}
        >
          {product.location || "Ghana"}
        </div>
        <div
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: isSold ? "#9ca3af" : "var(--primary)",
          }}
        >
          {formatPrice(product.price)}
        </div>
      </div>
    </div>
  );
};

// ================================================================
// MAIN COMPONENT
// ================================================================

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // <-- added for query param detection

  const { user, token } = useAuth();
  const { toggleFavorite, isFavorite } = useCart();

  // ================================================================
  // PRODUCT STATE
  // ================================================================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─── RELATED PRODUCTS ──────────────────────────────────────────
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // ================================================================
  // IMAGE STATE
  // ================================================================

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ================================================================
  // EDIT MODAL STATE
  // ================================================================

  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    location: "",
    condition: "",
    storage: "",
    color: "",
    status: "active",
    sellerPhone: "",
    batteryHealth: "",
    faceId: "",
    simStatus: "",
    negotiation: false,
    swapAccepted: false,
    warranty: "",
    // Laptop & Tablet & other electronics
    brand: "",
    model: "",
    processor: "",
    ram: "",
    screenSize: "",
    graphics: "",
    // Tablet specific
    year: "",
    connectivity: "",
    // 🎮 Console specific
    consoleType: "",
    edition: "",
    discDrive: "",
    controllersIncluded: "",
    battery: "",
    resolution: "",
    videoOutput: "",
    region: "",
    // ⌚ Smartwatch specific
    watchSize: "",
    // 📺 TV specific
    tvType: "",
    displayTechnology: "",
    refreshRate: "",
    operatingSystem: "",
    hdr: "",
    hdmiPorts: "",
    usbPorts: "",
    smartTV: false,
    voiceControl: false,
    wallMountable: false,
  });

  const [imagesToKeep, setImagesToKeep] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newFilePreviews, setNewFilePreviews] = useState([]);

  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // ================================================================
  // STATUS UPDATE
  // ================================================================

  const [isUpdating, setIsUpdating] = useState(false);

  // ================================================================
  // MESSAGING STATE
  // ================================================================

  const [showChatModal, setShowChatModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [messagingAvailable, setMessagingAvailable] = useState(true);
  const [viewingImage, setViewingImage] = useState(null);

  // Polling interval reference
  const pollInterval = useRef(null);

  // ================================================================
  // AUTO-OPEN CHAT MODAL (from ?openChat=true query param)
  // ================================================================

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openChat') === 'true') {
      if (user) {
        openChat();
      }
    }
  }, [location.search, user]);

  // ================================================================
  // FETCH PRODUCT
  // ================================================================

  const fetchRelatedProducts = async (currentProduct) => {
    try {
      setRelatedLoading(true);

      const params = {
        category: currentProduct.category,
        limit: 8,
        status: "active",
      };

      const data = await getProducts(params);

      if (data?.products) {
        let filtered = data.products.filter((p) => p._id !== currentProduct._id);

        if (filtered.length < 4) {
          const fallbackParams = {
            category: currentProduct.category,
            limit: 12,
            status: "active",
          };
          const fallbackData = await getProducts(fallbackParams);
          if (fallbackData?.products) {
            filtered = fallbackData.products.filter((p) => p._id !== currentProduct._id);
          }
        }

        setRelatedProducts(filtered.slice(0, 6));
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
            title: p.title || "",
            price: p.price ?? "",
            description: p.description || "",
            category: p.category || "",
            location: p.location || "",
            condition: p.condition || "",
            storage: p.storage || "",
            color: p.color || "",
            status: p.status || "active",
            sellerPhone: p.sellerPhone || "",
            batteryHealth:
              p.batteryHealth !== null && p.batteryHealth !== undefined
                ? p.batteryHealth
                : "",
            faceId: p.faceId || "",
            simStatus: p.simStatus || "",
            negotiation: Boolean(p.negotiation),
            swapAccepted: Boolean(p.swapAccepted),
            warranty: p.warranty || "",
            brand: p.brand || "",
            model: p.model || "",
            processor: p.processor || "",
            ram: p.ram || "",
            screenSize: p.screenSize || "",
            graphics: p.graphics || "",
            year: p.year || "",
            connectivity: p.connectivity || "",
            // Console fields
            consoleType: p.consoleType || "",
            edition: p.edition || "",
            discDrive: p.discDrive || "",
            controllersIncluded: p.controllersIncluded || "",
            battery: p.battery || "",
            resolution: p.resolution || "",
            videoOutput: p.videoOutput || "",
            region: p.region || "",
            // Smartwatch field
            watchSize: p.watchSize || "",
            // TV fields
            tvType: p.tvType || "",
            displayTechnology: p.displayTechnology || "",
            refreshRate: p.refreshRate || "",
            operatingSystem: p.operatingSystem || "",
            hdr: p.hdr || "",
            hdmiPorts: p.hdmiPorts || "",
            usbPorts: p.usbPorts || "",
            smartTV: Boolean(p.smartTV),
            voiceControl: Boolean(p.voiceControl),
            wallMountable: Boolean(p.wallMountable),
          });

          const existingImages =
            Array.isArray(p.images) && p.images.length > 0
              ? p.images
              : p.image
              ? [p.image]
              : [];

          setImagesToKeep(existingImages);

          // ─── Fetch related products ──────────────────────────
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

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // ================================================================
  // RESET IMAGE INDEX
  // ================================================================

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product]);

  // ================================================================
  // CLEAN PREVIEW URLS
  // ================================================================

  useEffect(() => {
    return () => {
      newFilePreviews.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [newFilePreviews]);

  // ================================================================
  // PERMISSION
  // ================================================================

  const canEdit = Boolean(
    user &&
      product &&
      (
        user.role === "admin" ||
        product?.sellerId?._id === user?._id ||
        product?.sellerId === user?._id ||
        product?.sellerId?.toString?.() === user?._id?.toString?.()
      )
  );

  // ================================================================
  // EDIT FORM
  // ================================================================

  const handleEditChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ================================================================
  // REMOVE EXISTING IMAGE
  // ================================================================

  const handleRemoveExistingImage = (index) => {
    setImagesToKeep((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ================================================================
  // ADD NEW IMAGES
  // ================================================================

  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    setNewFiles((prev) => [
      ...prev,
      ...files,
    ]);

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setNewFilePreviews((prev) => [
      ...prev,
      ...previews,
    ]);

    e.target.value = "";
  };

  // ================================================================
  // REMOVE NEW IMAGE
  // ================================================================

  const removeNewFile = (index) => {
    const preview = newFilePreviews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setNewFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setNewFilePreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ================================================================
  // EDIT SUBMIT
  // ================================================================

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    setEditError("");
    setEditLoading(true);

    try {
      if (!token) {
        throw new Error(
          "You must be logged in to edit this product."
        );
      }

      const formData = new FormData();

      Object.keys(editForm).forEach((key) => {
        if (key === "price") {
          const price = parseFloat(editForm[key]);

          formData.append(
            key,
            Number.isFinite(price) ? price : 0
          );
        } else if (key === "batteryHealth") {
          if (
            editForm[key] !== "" &&
            editForm[key] !== null &&
            editForm[key] !== undefined
          ) {
            const battery = parseFloat(
              editForm[key]
            );

            if (Number.isFinite(battery)) {
              formData.append(
                key,
                battery
              );
            }
          }
        } else if (
          key === "negotiation" ||
          key === "swapAccepted"
        ) {
          formData.append(
            key,
            editForm[key]
              ? "true"
              : "false"
          );
        } else {
          formData.append(
            key,
            editForm[key] ?? ""
          );
        }
      });

      formData.append(
        "imagesToKeep",
        JSON.stringify(imagesToKeep)
      );

      newFiles.forEach((file) => {
        formData.append(
          "files",
          file
        );
      });

      const result =
        await updateProductWithFiles(
          id,
          formData,
          token
        );

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Failed to update product."
        );
      }

      const updated =
        await getProduct(id);

      if (updated?.product) {
        setProduct(updated.product);

        const updatedImages =
          Array.isArray(
            updated.product.images
          )
            ? updated.product.images
            : updated.product.image
            ? [updated.product.image]
            : [];

        setImagesToKeep(
          updatedImages
        );

        setNewFiles([]);
        setNewFilePreviews([]);
        setCurrentImageIndex(0);

        setEditForm({
          title:
            updated.product.title || "",
          price:
            updated.product.price ?? "",
          description:
            updated.product.description ||
            "",
          category:
            updated.product.category ||
            "",
          location:
            updated.product.location ||
            "",
          condition:
            updated.product.condition ||
            "",
          storage:
            updated.product.storage || "",
          color:
            updated.product.color || "",
          status:
            updated.product.status ||
            "active",
          sellerPhone:
            updated.product.sellerPhone ||
            "",
          batteryHealth:
            updated.product.batteryHealth !==
              null &&
            updated.product.batteryHealth !==
              undefined
              ? updated.product
                  .batteryHealth
              : "",
          faceId:
            updated.product.faceId || "",
          simStatus:
            updated.product.simStatus || "",
          negotiation:
            Boolean(
              updated.product.negotiation
            ),
          swapAccepted:
            Boolean(
              updated.product.swapAccepted
            ),
          warranty:
            updated.product.warranty || "",
          brand: updated.product.brand || "",
          model: updated.product.model || "",
          processor: updated.product.processor || "",
          ram: updated.product.ram || "",
          screenSize: updated.product.screenSize || "",
          graphics: updated.product.graphics || "",
          year: updated.product.year || "",
          connectivity: updated.product.connectivity || "",
          consoleType: updated.product.consoleType || "",
          edition: updated.product.edition || "",
          discDrive: updated.product.discDrive || "",
          controllersIncluded: updated.product.controllersIncluded || "",
          battery: updated.product.battery || "",
          resolution: updated.product.resolution || "",
          videoOutput: updated.product.videoOutput || "",
          region: updated.product.region || "",
          watchSize: updated.product.watchSize || "",
          tvType: updated.product.tvType || "",
          displayTechnology: updated.product.displayTechnology || "",
          refreshRate: updated.product.refreshRate || "",
          operatingSystem: updated.product.operatingSystem || "",
          hdr: updated.product.hdr || "",
          hdmiPorts: updated.product.hdmiPorts || "",
          usbPorts: updated.product.usbPorts || "",
          smartTV: Boolean(updated.product.smartTV),
          voiceControl: Boolean(updated.product.voiceControl),
          wallMountable: Boolean(updated.product.wallMountable),
        });
      }

      setShowEditModal(false);
    } catch (err) {
      console.error(
        "Product update error:",
        err
      );

      setEditError(
        err?.message ||
          "Something went wrong while updating the product."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ================================================================
  // IMAGE GALLERY
  // ================================================================

  const images =
    Array.isArray(product?.images) &&
    product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];

  const hasImages =
    images.length > 0;

  const totalImages =
    hasImages
      ? images.length
      : 1;

  const handlePrev = (e) => {
    e.stopPropagation();

    setCurrentImageIndex(
      (prev) =>
        (prev -
          1 +
          totalImages) %
        totalImages
    );
  };

  const handleNext = (e) => {
    e.stopPropagation();

    setCurrentImageIndex(
      (prev) =>
        (prev + 1) %
        totalImages
    );
  };

  const handleThumbClick = (
    index
  ) => {
    setCurrentImageIndex(index);
  };

  const getCurrentImage = () => {
    if (
      hasImages &&
      images[currentImageIndex]
    ) {
      return getImageUrl(
        images[currentImageIndex]
      );
    }

    if (product?.image) {
      return getImageUrl(
        product.image
      );
    }

    return "https://placehold.co/600x600?text=No+Image";
  };

  // ================================================================
  // WHATSAPP CONTACT SELLER – simple and reliable
  // ================================================================

  const handleContact = () => {
    if (product?.status === "sold") {
      alert(
        "Sorry, this item has already been sold."
      );
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    const rawPhone =
      product?.sellerPhone || "";

    let phone =
      String(rawPhone).replace(
        /\D/g,
        ""
      );

    if (
      phone.startsWith("0") &&
      phone.length === 10
    ) {
      phone =
        "233" +
        phone.substring(1);
    }

    if (
      !phone ||
      phone.length < 10
    ) {
      alert(
        "This seller has not provided a valid WhatsApp number."
      );
      return;
    }

    const price = Number(
      product?.price || 0
    );

    const formattedPrice =
      new Intl.NumberFormat(
        "en-GH",
        {
          style: "currency",
          currency: "GHS",
          minimumFractionDigits: 0,
        }
      ).format(price);

    let titleWithSpecs =
      `"${product?.title || "this item"}"`;

    if (product?.storage) {
      titleWithSpecs =
        `"${product.title}" (${product.storage})`;
    }

    const message =
      `Hello, I'm interested in ${titleWithSpecs} ` +
      `priced at ${formattedPrice} ` +
      `listed on BuyUkUsed.com. ` +
      `Is it still available?`;

    const encodedMessage =
      encodeURIComponent(
        message
      );

    // ── Always use the web‑based link ──
    const whatsappUrl =
      `https://wa.me/${phone}?text=${encodedMessage}`;

    window.location.href =
      whatsappUrl;
  };

  // ================================================================
  // MARK SOLD / AVAILABLE
  // ================================================================

  const handleMarkAsSold = async () => {
    if (!user) {
      alert(
        "Please login to manage your products."
      );
      return;
    }

    if (!canEdit) {
      alert(
        "You do not have permission to change this product."
      );
      return;
    }

    const isCurrentlySold =
      product?.status === "sold";

    const newStatus =
      isCurrentlySold
        ? "active"
        : "sold";

    const confirmMessage =
      isCurrentlySold
        ? `Mark "${product.title}" as available again?`
        : `Mark "${product.title}" as sold? This will hide the Contact Seller button.`;

    if (
      !window.confirm(
        confirmMessage
      )
    ) {
      return;
    }

    setIsUpdating(true);

    try {
      const result =
        await updateProductStatus(
          product._id,
          newStatus,
          token
        );

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Failed to update product status."
        );
      }

      const updated =
        await getProduct(id);

      if (updated?.product) {
        setProduct(
          updated.product
        );

        setEditForm(
          (prev) => ({
            ...prev,
            status:
              updated.product
                .status ||
              newStatus,
          })
        );
      }

      alert(
        newStatus === "sold"
          ? "Product marked as sold."
          : "Product marked as available."
      );
    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      alert(
        "Failed to update status: " +
          (
            err?.message ||
            "Something went wrong."
          )
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // ================================================================
  // MESSAGING – FETCH MESSAGES
  // ================================================================

  const fetchMessages = async () => {
    if (!user || !product) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://buyukused.onrender.com'}/api/messages/${user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 403 || response.status === 404) {
        setMessagingAvailable(false);
        setChatError('Messaging is not yet available. Please contact the seller via WhatsApp.');
        setMessages([]);
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      
      if (data.success) {
        const productMessages = data.messages.filter(
          msg => msg.productId && msg.productId._id === product._id
        );
        setMessages(productMessages);
        setChatError('');
        setMessagingAvailable(true);
      } else {
        setChatError(data.message || 'Could not load messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setChatError('Could not load messages');
    }
  };

  // ================================================================
  // MESSAGING – SEND MESSAGE
  // ================================================================

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!newMessage.trim()) return;

    const sellerId = product?.sellerId?._id || product?.sellerId;
    if (!sellerId) {
      alert('Seller information not available.');
      return;
    }

    setSending(true);
    setChatError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://buyukused.onrender.com'}/api/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiver: sellerId,
            productId: product._id,
            message: newMessage.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      } else {
        setChatError(data.message || 'Could not send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setChatError('Could not send message');
    } finally {
      setSending(false);
    }
  };

  // ================================================================
  // MESSAGING – OPEN CHAT MODAL
  // ================================================================

  const openChat = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setShowChatModal(true);
    setChatLoading(true);
    fetchMessages().finally(() => setChatLoading(false));

    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = setInterval(() => {
      if (messagingAvailable) {
        fetchMessages();
      }
    }, 5000);
  };

  // ================================================================
  // MESSAGING – CLOSE CHAT MODAL
  // ================================================================

  const closeChat = () => {
    setShowChatModal(false);
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  // ================================================================
  // LOADING / ERROR
  // ================================================================

  if (loading) {
    return (
      <div
        className="container"
        style={{
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container"
        style={{
          padding: "60px 20px",
          textAlign: "center",
          color: "#e74c3c",
        }}
      >
        {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="container"
        style={{
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        Product not found.
      </div>
    );
  }

  // ================================================================
  // DERIVED VALUES
  // ================================================================

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
    <div>
      <strong title={tooltip}>{label}:</strong> {value}
    </div>
  );

  const renderSpecs = () => {
    const specs = [];

    if (product.condition) {
      specs.push(<SpecRow key="condition" label="Condition" value={product.condition} />);
    }
    if (product.warranty) {
      specs.push(<SpecRow key="warranty" label="Warranty" value={product.warranty} />);
    }
    if (product.negotiation) {
      specs.push(<SpecRow key="negotiation" label="Negotiable" value="Yes" />);
    }
    if (product.swapAccepted) {
      specs.push(<SpecRow key="swap" label="Swap Accepted" value="Yes" />);
    }
    if (product.color) {
      specs.push(<SpecRow key="color" label="Color" value={product.color} />);
    }

    if (isLaptop) {
      if (product.brand) specs.push(<SpecRow key="brand" label="Brand" value={product.brand} />);
      if (product.model) specs.push(<SpecRow key="model" label="Model" value={product.model} />);
      if (product.processor) {
        specs.push(
          <SpecRow
            key="processor"
            label="Processor"
            value={product.processor}
            tooltip="The brain of the computer; higher numbers and more cores mean better multitasking."
          />
        );
      }
      if (product.ram) {
        specs.push(
          <SpecRow
            key="ram"
            label="RAM"
            value={product.ram}
            tooltip="Temporary storage for active tasks; 8GB handles basic work, 16GB+ is recommended for gaming and heavy creative work."
          />
        );
      }
      if (product.storage) {
        specs.push(
          <SpecRow
            key="storage"
            label="Storage"
            value={product.storage}
            tooltip="Solid‑state drives (SSD) offer fast boot and load times compared to older hard drives (HDD)."
          />
        );
      }
      if (product.screenSize) {
        specs.push(
          <SpecRow
            key="screenSize"
            label="Screen Size"
            value={product.screenSize}
            tooltip="Display diagonal size in inches."
          />
        );
      }
      if (product.graphics) {
        specs.push(
          <SpecRow
            key="graphics"
            label="Graphics"
            value={product.graphics}
            tooltip="Handles visual rendering, video editing, and 3D gaming."
          />
        );
      }
      if (product.batteryHealth !== null && product.batteryHealth !== undefined) {
        specs.push(<SpecRow key="battery" label="Battery Health" value={`${product.batteryHealth}%`} />);
      }
    } else if (isTablet) {
      if (product.brand) specs.push(<SpecRow key="brand" label="Brand" value={product.brand} />);
      if (product.model) specs.push(<SpecRow key="model" label="Model" value={product.model} />);
      if (product.year) specs.push(<SpecRow key="year" label="Year" value={product.year} />);
      if (product.storage) specs.push(<SpecRow key="storage" label="Storage" value={product.storage} />);
      if (product.screenSize) specs.push(<SpecRow key="screenSize" label="Screen Size" value={product.screenSize} />);
      if (product.connectivity) specs.push(<SpecRow key="connectivity" label="Connectivity" value={product.connectivity} />);
      if (product.batteryHealth !== null && product.batteryHealth !== undefined) {
        specs.push(<SpecRow key="battery" label="Battery Health" value={`${product.batteryHealth}%`} />);
      }
    } else if (isPhone) {
      if (product.brand) specs.push(<SpecRow key="brand" label="Brand" value={product.brand} />);
      if (product.model) specs.push(<SpecRow key="model" label="Model" value={product.model} />);
      if (product.storage) specs.push(<SpecRow key="storage" label="Storage" value={product.storage} />);
      if (product.screenSize) specs.push(<SpecRow key="screenSize" label="Screen Size" value={product.screenSize} />);
      if (product.batteryHealth !== null && product.batteryHealth !== undefined) {
        specs.push(<SpecRow key="battery" label="Battery Health" value={`${product.batteryHealth}%`} />);
      }
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
      if (product.batteryHealth !== null && product.batteryHealth !== undefined) {
        specs.push(<SpecRow key="battery" label="Battery Health" value={`${product.batteryHealth}%`} />);
      }
      if (product.warranty) specs.push(<SpecRow key="warranty" label="Warranty" value={product.warranty} />);
    } else if (isAccessory) {
      if (product.brand) specs.push(<SpecRow key="brand" label="Brand" value={product.brand} />);
      if (product.model) specs.push(<SpecRow key="model" label="Model" value={product.model} />);
      if (product.connectivity) specs.push(<SpecRow key="connectivity" label="Connectivity" value={product.connectivity} />);
    }

    return specs;
  };

  const hasAnySpec = () => {
    return renderSpecs().length > 0;
  };

  const isSeller = user && (
    product?.sellerId?._id === user._id ||
    product?.sellerId === user._id ||
    product?.sellerId?.toString() === user._id?.toString()
  );

  // ─── NEW: Get seller object and verification status ──────────
  const sellerObj = product.seller || product.sellerId || {};
  const sellerName = sellerObj.name || product.sellerName || 'Seller';
  const sellerId = sellerObj._id || product.sellerId?._id || product.sellerId || product.seller?._id || '';
  const isVerified = sellerObj.isVerified === true;

  // ================================================================
  // RENDER
  // ================================================================

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .product-detail {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }

            .thumbnails img {
              width: 60px !important;
              height: 60px !important;
            }

            .details h1 {
              font-size: 22px !important;
            }

            .details .price {
              font-size: 26px !important;
            }

            .details .meta {
              font-size: 13px !important;
              gap: 10px !important;
            }

            .actions button {
              font-size: 14px !important;
              padding: 10px 18px !important;
            }

            .safety {
              font-size: 12px !important;
              padding: 12px 14px !important;
            }

            .specs-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 480px) {
            .thumbnails img {
              width: 50px !important;
              height: 50px !important;
            }

            .details h1 {
              font-size: 20px !important;
            }

            .details .price {
              font-size: 22px !important;
            }

            .actions {
              flex-direction: column !important;
            }

            .actions button {
              width: 100% !important;
              justify-content: center !important;
            }
          }

          .related-products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
          }

          @media (max-width: 600px) {
            .related-products-grid {
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
          }
        `}
      </style>

      <div
        className="container"
        style={{
          padding: "30px 20px",
        }}
      >
        <div
          className="product-detail"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
          }}
        >
          {/* GALLERY */}
          <div className="gallery">
            <div
              className="main-image"
              style={{
                position: "relative",
                background: "#f1f5f9",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                aspectRatio: "1/1",
              }}
            >
              <img
                src={getCurrentImage()}
                alt={product.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {isSold && <SoldBadge variant="ribbon" />}

              {totalImages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "12px",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      fontSize: "24px",
                      cursor: "pointer",
                      zIndex: 10,
                    }}
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "12px",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.5)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      fontSize: "24px",
                      cursor: "pointer",
                      zIndex: 10,
                    }}
                  >
                    ›
                  </button>

                  <div
                    style={{
                      position: "absolute",
                      bottom: "16px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: "8px",
                      zIndex: 10,
                    }}
                  >
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleThumbClick(idx)}
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background:
                            idx === currentImageIndex
                              ? "white"
                              : "rgba(255,255,255,0.5)",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {hasImages && totalImages > 1 && (
              <div
                className="thumbnails"
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "12px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                }}
              >
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(img)}
                    alt={`Thumb ${idx + 1}`}
                    onClick={() => handleThumbClick(idx)}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      border:
                        currentImageIndex === idx
                          ? "3px solid var(--primary)"
                          : "2px solid transparent",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="details">
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                marginBottom: "8px",
              }}
            >
              {product.title}

              {isSold && (
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#dc2626",
                    background: "#fee2e2",
                    padding: "2px 14px",
                    borderRadius: "4px",
                    marginLeft: "12px",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                >
                  SOLD
                </span>
              )}
            </h1>

            <div
              className="price"
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: isSold ? "#9ca3af" : "var(--primary)",
                marginBottom: "8px",
              }}
            >
              GH₵ {Number(product.price || 0).toLocaleString()}
              {product.oldPrice && (
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 400,
                    color: "var(--gray-400)",
                    textDecoration: "line-through",
                    marginLeft: "12px",
                  }}
                >
                  GH₵ {Number(product.oldPrice).toLocaleString()}
                </span>
              )}
            </div>

            <div
              className="meta"
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                fontSize: "14px",
                color: "var(--gray-500)",
                marginBottom: "16px",
              }}
            >
              <span>
                <i className="fas fa-map-marker-alt" /> {product.location || "Ghana"}
              </span>
              <span>
                <i className="fas fa-tag" /> {product.category}
              </span>
              <span>
                <i className="fas fa-eye" /> {product.views || 0} views
              </span>
              <span>
                <i className="fas fa-clock" />{" "}
                {product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString()
                  : ""}
              </span>
              {product.simStatus && product.category !== 'Laptops' && (
                <span style={{ color: "#0055a5", fontWeight: 600 }}>
                  <i className="fas fa-sim-card" /> SIM: {product.simStatus}
                </span>
              )}
            </div>

            {hasAnySpec() && (
              <div
                className="specs"
                style={{
                  marginBottom: "20px",
                  padding: "16px",
                  background: "var(--gray-50)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "12px",
                  }}
                >
                  {specsTitle}
                </h3>
                <div
                  className="specs-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "8px",
                  }}
                >
                  {renderSpecs()}
                </div>
              </div>
            )}

            <div
              className="description"
              style={{
                color: "var(--gray-700)",
                lineHeight: 1.7,
                marginBottom: "20px",
              }}
            >
              {product.description || "No description provided."}
            </div>

            {/* SELLER CARD – UPDATED WITH VERIFIED BADGE */}
            <div
              className="seller"
              style={{
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                className="seller-avatar-wrapper"
                style={{
                  position: 'relative',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--gray-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                }}
              >
                {(() => {
                  const imageField =
                    sellerObj.profileImage ||
                    sellerObj.photo ||
                    sellerObj.avatar ||
                    sellerObj.profilePicture ||
                    sellerObj.profilePic ||
                    sellerObj.picture ||
                    sellerObj.image ||
                    sellerObj.profile_pic ||
                    sellerObj.profile_picture ||
                    null;

                  const name = sellerName;

                  let avatarUrl = null;
                  if (imageField) {
                    if (typeof imageField === 'string' && (imageField.startsWith('http://') || imageField.startsWith('https://'))) {
                      avatarUrl = imageField;
                    } else {
                      avatarUrl = getImageUrl(imageField);
                    }
                  }

                  if (avatarUrl) {
                    return (
                      <img
                        src={avatarUrl}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          console.warn('⚠️ Avatar failed to load:', avatarUrl);
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          parent.innerHTML = `<i class="fas fa-user-circle" style="font-size: 28px; color: var(--gray-400);"></i>`;
                          parent.style.display = 'flex';
                          parent.style.alignItems = 'center';
                          parent.style.justifyContent = 'center';
                        }}
                      />
                    );
                  }

                  return <i className="fas fa-user-circle" style={{ fontSize: '28px', color: 'var(--gray-400)' }} />;
                })()}

                <span
                  className={`seller-status-dot ${
                    (() => {
                      if (sellerObj.online === true) return 'online';
                      if (sellerObj.online === false) return 'offline';
                      if (sellerObj.lastActive) {
                        const last = new Date(sellerObj.lastActive);
                        const now = new Date();
                        const diffMs = now - last;
                        const diffMin = diffMs / 60000;
                        return diffMin < 2 ? 'online' : 'offline';
                      }
                      return 'unknown';
                    })()
                  }`}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <Link
                    to={`/seller/${sellerId}`}
                    style={{
                      fontWeight: 700,
                      fontSize: '16px',
                      marginBottom: '2px',
                      color: 'var(--primary)',
                      textDecoration: 'underline',
                      textDecorationColor: 'var(--primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fas fa-user" />
                    {sellerName}
                  </Link>
                  {isVerified && <VerifiedBadge size={18} />}
                </div>

                {user ? (
                  product.sellerPhone && (
                    <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                      <i className="fas fa-phone" style={{ marginRight: '6px' }} />
                      {product.sellerPhone}
                    </div>
                  )
                ) : (
                  <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                    <i className="fas fa-lock" style={{ marginRight: '6px' }} />
                    <span
                      style={{
                        color: 'var(--primary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate('/login')}
                    >
                      Sign up
                    </span>
                    {' to view seller\'s phone number'}
                  </div>
                )}

                {sellerObj.createdAt && (
                  <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>
                    <i className="fas fa-calendar-alt" style={{ marginRight: '4px' }} />
                    Member since {new Date(sellerObj.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div
              className="actions"
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {isSold ? (
                <button
                  type="button"
                  disabled
                  style={{
                    padding: "12px 32px",
                    background: "#9ca3af",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 700,
                    fontSize: "16px",
                    cursor: "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: 0.7,
                  }}
                >
                  <i className="fas fa-ban" />
                  Sold Out
                </button>
              ) : (
                user ? (
                  <button
                    type="button"
                    onClick={handleContact}
                    className="btn-secondary"
                    style={{
                      padding: "12px 32px",
                      background: "var(--secondary)",
                      color: "white",
                      border: "none",
                      borderRadius: "var(--radius-full)",
                      fontWeight: 700,
                      fontSize: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      touchAction: "manipulation",
                    }}
                  >
                    <i className="fab fa-whatsapp" />
                    Contact Seller
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="btn-secondary"
                    style={{
                      padding: "12px 32px",
                      background: "#0055a5",
                      color: "white",
                      border: "none",
                      borderRadius: "var(--radius-full)",
                      fontWeight: 700,
                      fontSize: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <i className="fas fa-sign-in-alt" />
                    Sign up to contact seller
                  </button>
                )
              )}

              {!isSold && user && !isSeller && messagingAvailable && (
                <button
                  type="button"
                  onClick={openChat}
                  style={{
                    padding: "12px 32px",
                    background: "#0055a5",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 700,
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    touchAction: "manipulation",
                  }}
                >
                  <i className="fas fa-comment-dots" />
                  Message Seller
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  navigate("/book-rider", {
                    state: {
                      productId: product?._id || product?.id,
                      productTitle: product?.title || product?.name || "",
                      productPrice: product?.price || 0,
                      sellerId: product?.sellerId?._id || product?.sellerId || "",
                      sellerName: product?.sellerName || "",
                      sellerPhone: product?.sellerPhone || "",
                    },
                  })
                }
                style={{
                  padding: "12px 24px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "var(--radius-full)",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: 700,
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaMotorcycle size={18} />
                BOOK A BIKE RIDER
              </button>

              {canEdit && (
                <button
                  type="button"
                  onClick={handleMarkAsSold}
                  disabled={isUpdating}
                  style={{
                    padding: "12px 24px",
                    background: isSold ? "#22c55e" : "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 600,
                    fontSize: "16px",
                    cursor: isUpdating ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: isUpdating ? 0.7 : 1,
                    touchAction: "manipulation",
                  }}
                >
                  {isUpdating ? (
                    "⏳ Updating..."
                  ) : (
                    <>
                      <i className={isSold ? "fas fa-undo" : "fas fa-check-circle"} />
                      {isSold ? "Mark Available" : "Mark as Sold"}
                    </>
                  )}
                </button>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  style={{
                    padding: "12px 24px",
                    border: "1.5px solid var(--primary)",
                    borderRadius: "var(--radius-full)",
                    background: "white",
                    color: "var(--primary)",
                    fontWeight: 600,
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i className="fas fa-pen" />
                  Edit
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleFavorite(product._id)}
                className="btn-outline"
                style={{
                  padding: "12px 24px",
                  border: "1.5px solid var(--gray-300)",
                  borderRadius: "var(--radius-full)",
                  background: "transparent",
                  fontWeight: 600,
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: liked ? "#e74c3c" : "var(--gray-700)",
                }}
              >
                <i className={liked ? "fas fa-heart" : "far fa-heart"} />
                {liked ? "Saved" : "Save"}
              </button>
            </div>

            {/* SAFETY */}
            <div
              className="safety"
              style={{
                marginTop: "20px",
                background: "#fef9c3",
                borderRadius: "var(--radius-md)",
                padding: "14px 18px",
                fontSize: "13px",
                color: "#854d0e",
              }}
            >
              <strong>
                <i className="fas fa-shield-alt" /> Safety tips
              </strong>
              <ul style={{ paddingLeft: "20px", marginTop: "4px" }}>
                <li>Avoid paying in advance, even for delivery.</li>
                <li>Meet with the seller at a safe public place.</li>
                <li>Inspect the item before paying.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div
            style={{
              marginTop: "60px",
              paddingTop: "40px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 800,
                marginBottom: "20px",
              }}
            >
              You might also like
            </h2>

            {relatedLoading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--gray-400)" }}>
                Loading related products...
              </div>
            ) : (
              <div className="related-products-grid">
                {relatedProducts.map((relatedProduct) => (
                  <RelatedProductCard
                    key={relatedProduct._id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* EDIT MODAL */}
        {showEditModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
            onClick={() => setShowEditModal(false)}
          >
            <div
              style={{
                background: "white",
                borderRadius: "var(--radius-xl)",
                maxWidth: "600px",
                width: "100%",
                padding: "32px",
                position: "relative",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "18px",
                  fontSize: "28px",
                  cursor: "pointer",
                  color: "var(--gray-400)",
                  background: "none",
                  border: "none",
                }}
              >
                &times;
              </button>

              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                Edit Product
              </h2>

              {editError && (
                <div
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "16px",
                  }}
                >
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit}>
                {/* Title */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {/* Price */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Price (GH₵) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    required
                    step="0.01"
                    min="0"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {/* Seller Phone */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Seller Phone
                  </label>
                  <input
                    type="tel"
                    name="sellerPhone"
                    value={editForm.sellerPhone}
                    onChange={handleEditChange}
                    placeholder="e.g. 054 123 4567"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {/* Category */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  >
                    <option value="Cars">Cars</option>
                    <option value="Phones">Phones</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Tablets">Tablets</option>
                    <option value="TVs">TVs</option>
                    <option value="Game Consoles">Game Consoles</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Jobs">Jobs</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                    <option value="Smartwatches">Smartwatches</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Location */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {/* Description */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows="3"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* ==================================================
                    CONSOLE‑SPECIFIC FIELDS
                ================================================== */}

                {editForm.category === "Game Consoles" && (
                  <>
                    <div
                      style={{
                        marginTop: "16px",
                        paddingTop: "12px",
                        borderTop: "1px solid #e5e7eb",
                        marginBottom: "12px",
                      }}
                    >
                      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
                        🎮 Console Details
                      </h3>
                    </div>

                    {/* Console Type */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        Console Type
                      </label>
                      <select
                        name="consoleType"
                        value={editForm.consoleType}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select console type</option>
                        {CONSOLE_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Edition */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        Edition
                      </label>
                      <select
                        name="edition"
                        value={editForm.edition}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select edition</option>
                        {CONSOLE_EDITIONS.map(ed => (
                          <option key={ed} value={ed}>{ed}</option>
                        ))}
                      </select>
                    </div>

                    {/* Disc Drive */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        Disc Drive
                      </label>
                      <select
                        name="discDrive"
                        value={editForm.discDrive}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select disc drive</option>
                        {DISC_DRIVE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Controllers Included */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        Controllers Included
                      </label>
                      <select
                        name="controllersIncluded"
                        value={editForm.controllersIncluded}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select controllers</option>
                        {CONTROLLER_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Battery */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        Battery
                      </label>
                      <select
                        name="battery"
                        value={editForm.battery}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select battery</option>
                        {BATTERY_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Resolution */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        Resolution
                      </label>
                      <select
                        name="resolution"
                        value={editForm.resolution}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select resolution</option>
                        {CONSOLE_RESOLUTIONS.map(res => (
                          <option key={res} value={res}>{res}</option>
                        ))}
                      </select>
                    </div>

                    {/* Video Output */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        Video Output
                      </label>
                      <select
                        name="videoOutput"
                        value={editForm.videoOutput}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select video output</option>
                        {VIDEO_OUTPUT_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Region */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        Region
                      </label>
                      <select
                        name="region"
                        value={editForm.region}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select region</option>
                        {REGION_OPTIONS.map(reg => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* ==================================================
                    SMARTWATCH‑SPECIFIC FIELDS
                ================================================== */}

                {editForm.category === "Smartwatches" && (
                  <div className="form-group" style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                      Watch Size
                    </label>
                    <select
                      name="watchSize"
                      value={editForm.watchSize}
                      onChange={handleEditChange}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1.5px solid var(--gray-200)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "14px",
                      }}
                    >
                      <option value="">Select size</option>
                      {WATCH_SIZE_OPTIONS.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* ==================================================
                    TV‑SPECIFIC FIELDS
                ================================================== */}

                {editForm.category === "TVs" && (
                  <>
                    <div
                      style={{
                        marginTop: "16px",
                        paddingTop: "12px",
                        borderTop: "1px solid #e5e7eb",
                        marginBottom: "12px",
                      }}
                    >
                      <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
                        📺 TV Details
                      </h3>
                    </div>

                    {/* TV Type */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        TV Type
                      </label>
                      <select
                        name="tvType"
                        value={editForm.tvType}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select TV type</option>
                        {TV_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Display Technology */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        Display Technology
                      </label>
                      <select
                        name="displayTechnology"
                        value={editForm.displayTechnology}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select technology</option>
                        {DISPLAY_TECHNOLOGIES.map(tech => (
                          <option key={tech} value={tech}>{tech}</option>
                        ))}
                      </select>
                    </div>

                    {/* Refresh Rate */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        Refresh Rate
                      </label>
                      <select
                        name="refreshRate"
                        value={editForm.refreshRate}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select refresh rate</option>
                        {REFRESH_RATES.map(rate => (
                          <option key={rate} value={rate}>{rate}</option>
                        ))}
                      </select>
                    </div>

                    {/* Operating System */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        Operating System
                      </label>
                      <select
                        name="operatingSystem"
                        value={editForm.operatingSystem}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select OS</option>
                        {TV_OPERATING_SYSTEMS.map(os => (
                          <option key={os} value={os}>{os}</option>
                        ))}
                      </select>
                    </div>

                    {/* HDR */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        HDR
                      </label>
                      <select
                        name="hdr"
                        value={editForm.hdr}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select HDR</option>
                        {HDR_OPTIONS.map(hdr => (
                          <option key={hdr} value={hdr}>{hdr}</option>
                        ))}
                      </select>
                    </div>

                    {/* HDMI Ports */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        HDMI Ports
                      </label>
                      <select
                        name="hdmiPorts"
                        value={editForm.hdmiPorts}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select HDMI ports</option>
                        {HDMI_OPTIONS.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    {/* USB Ports */}
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                        USB Ports
                      </label>
                      <select
                        name="usbPorts"
                        value={editForm.usbPorts}
                        onChange={handleEditChange}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          border: "1.5px solid var(--gray-200)",
                          borderRadius: "var(--radius-md)",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">Select USB ports</option>
                        {USB_OPTIONS.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    {/* Smart TV, Voice Control, Wall Mountable – checkboxes */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "20px",
                        marginTop: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="smartTV"
                          checked={editForm.smartTV}
                          onChange={handleEditChange}
                        />
                        Smart TV
                      </label>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="voiceControl"
                          checked={editForm.voiceControl}
                          onChange={handleEditChange}
                        />
                        Voice Control
                      </label>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="wallMountable"
                          checked={editForm.wallMountable}
                          onChange={handleEditChange}
                        />
                        Wall Mountable
                      </label>
                    </div>
                  </>
                )}

                {/* ==================================================
                    GENERIC FIELDS (always shown)
                ================================================== */}

                {/* Condition */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={editForm.condition}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                {/* Storage – already used by consoles, kept here */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Storage
                  </label>
                  <select
                    name="storage"
                    value={editForm.storage}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">Select storage</option>
                    <option value="16GB">16GB</option>
                    <option value="32GB">32GB</option>
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                    <option value="2TB">2TB</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Color */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Color
                  </label>
                  <select
                    name="color"
                    value={editForm.color}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">Select color</option>
                    {ALL_COLORS.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Battery Health – may also be used for phones; keep generic */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Battery Health (%)
                  </label>
                  <input
                    type="number"
                    name="batteryHealth"
                    value={editForm.batteryHealth}
                    onChange={handleEditChange}
                    min="0"
                    max="100"
                    step="1"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {/* Face ID – only for phones */}
                {editForm.category === "Phones" && (
                  <div className="form-group" style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                      Face ID
                    </label>
                    <select
                      name="faceId"
                      value={editForm.faceId}
                      onChange={handleEditChange}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1.5px solid var(--gray-200)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "14px",
                      }}
                    >
                      <option value="">Select Face ID status</option>
                      <option value="Working">Working</option>
                      <option value="Not Working">Not Working</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>
                )}

                {/* SIM Status – only for phones */}
                {editForm.category === "Phones" && (
                  <div className="form-group" style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                      SIM Status
                    </label>
                    <select
                      name="simStatus"
                      value={editForm.simStatus}
                      onChange={handleEditChange}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1.5px solid var(--gray-200)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "14px",
                      }}
                    >
                      <option value="">Select SIM status</option>
                      <option value="eSIM Unlocked">eSIM Unlocked</option>
                      <option value="SIM Unlocked">SIM Unlocked</option>
                      <option value="Locked">Locked</option>
                      <option value="Bypass">Bypass</option>
                    </select>
                  </div>
                )}

                {/* Warranty */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Warranty Period
                  </label>
                  <select
                    name="warranty"
                    value={editForm.warranty}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">No warranty</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="3 weeks">3 weeks</option>
                    <option value="4 weeks">4 weeks</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((months) => (
                      <option key={months} value={`${months} month${months > 1 ? 's' : ''}`}>
                        {months} month{months > 1 ? 's' : ''}
                      </option>
                    ))}
                    <option value="1 year">1 year</option>
                  </select>
                </div>

                {/* Negotiation / Swap */}
                <div style={{ display: "flex", gap: "20px", marginBottom: "12px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      name="negotiation"
                      checked={editForm.negotiation}
                      onChange={handleEditChange}
                    />
                    <label style={{ fontWeight: 600, fontSize: "13px" }}>Negotiation</label>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      name="swapAccepted"
                      checked={editForm.swapAccepted}
                      onChange={handleEditChange}
                    />
                    <label style={{ fontWeight: 600, fontSize: "13px" }}>Swap Accepted</label>
                  </div>
                </div>

                {/* Status */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                {/* Current Images */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Current Images
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {imagesToKeep.map((img, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          width: "80px",
                          height: "80px",
                          border: "1px solid var(--gray-200)",
                          borderRadius: "var(--radius-sm)",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt={`Current ${idx + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          style={{
                            position: "absolute",
                            top: "2px",
                            right: "2px",
                            background: "rgba(220,38,38,0.8)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {imagesToKeep.length === 0 && (
                      <span style={{ color: "var(--gray-400)", fontSize: "13px" }}>No images</span>
                    )}
                  </div>
                </div>

                {/* New Images */}
                <div className="form-group" style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                    Add New Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewFileChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1.5px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                    }}
                  />
                  {newFilePreviews.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                      {newFilePreviews.map((preview, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            width: "80px",
                            height: "80px",
                            border: "1px solid var(--gray-200)",
                            borderRadius: "var(--radius-sm)",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={preview}
                            alt={`New ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <button
                            type="button"
                            onClick={() => removeNewFile(idx)}
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "2px",
                              background: "rgba(220,38,38,0.8)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save */}
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "var(--secondary)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-full)",
                    fontWeight: 700,
                    fontSize: "16px",
                    cursor: editLoading ? "not-allowed" : "pointer",
                    opacity: editLoading ? 0.7 : 1,
                  }}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* CHAT MODAL */}
        {showChatModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              padding: "20px",
            }}
            onClick={closeChat}
          >
            <div
              style={{
                background: "white",
                borderRadius: "var(--radius-xl)",
                maxWidth: "500px",
                width: "100%",
                height: "500px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--gray-200)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--primary)",
                  color: "white",
                  borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>
                    <i className="fas fa-comment-dots" style={{ marginRight: "8px" }} />
                    Messages with {sellerName}
                  </h3>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>{product.title}</div>
                </div>
                <button
                  type="button"
                  onClick={closeChat}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {chatLoading ? (
                  <div style={{ textAlign: "center", color: "var(--gray-400)", padding: "20px" }}>
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--gray-400)", padding: "20px" }}>
                    No messages yet. Start the conversation with {sellerName}!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender && msg.sender.toString() === user._id.toString();
                    const isImage = isImageMessage(msg.message);
                    const imageUrl = isImage ? extractImageUrl(msg.message) : null;

                    return (
                      <div
                        key={msg._id || msg.id}
                        style={{
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                          background: isMine ? "var(--primary)" : "var(--gray-100)",
                          color: isMine ? "white" : "var(--gray-800)",
                          padding: isImage ? "4px" : "8px 14px",
                          borderRadius: "12px",
                          borderBottomRightRadius: isMine ? "4px" : "12px",
                          borderBottomLeftRadius: isMine ? "12px" : "4px",
                          overflow: "hidden",
                        }}
                      >
                        {isImage ? (
                          <>
                            <img
                              src={imageUrl}
                              alt="Shared image"
                              style={{
                                maxWidth: "100%",
                                maxHeight: "300px",
                                borderRadius: "8px",
                                display: "block",
                                cursor: "pointer",
                              }}
                              onClick={() => setViewingImage(imageUrl)}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                parent.style.padding = "8px 14px";
                                parent.textContent = "📷 Image (failed to load)";
                              }}
                            />
                            <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "4px", textAlign: "right" }}>
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ""}
                            </div>
                          </>
                        ) : (
                          <>
                            <div>{msg.message}</div>
                            <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "4px", textAlign: "right" }}>
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ""}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
                {chatError && (
                  <div style={{ color: "#dc2626", fontSize: "13px", textAlign: "center" }}>{chatError}</div>
                )}
              </div>

              <form
                onSubmit={sendMessage}
                style={{
                  padding: "12px",
                  borderTop: "1px solid var(--gray-200)",
                  display: "flex",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={user ? `Message ${sellerName}...` : "Please login to message"}
                  disabled={!user || sending}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={!user || sending || !newMessage.trim()}
                  style={{
                    padding: "10px 20px",
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700,
                    cursor: sending ? "not-allowed" : "pointer",
                    opacity: sending ? 0.7 : 1,
                  }}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* LIGHTBOX */}
        {viewingImage && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10001,
              cursor: "pointer",
            }}
            onClick={() => setViewingImage(null)}
          >
            <img
              src={viewingImage}
              alt="Full screen"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetails;