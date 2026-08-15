import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getProduct,
  updateProductWithFiles,
  getImageUrl,
  updateProductStatus,
} from "../services/api";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import SoldBadge from "../components/SoldBadge";

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

// ================================================================
// COMPONENT
// ================================================================

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, token } = useAuth();
  const { toggleFavorite, isFavorite } = useCart();

  // ================================================================
  // PRODUCT STATE
  // ================================================================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  // FETCH PRODUCT
  // ================================================================

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
            // Laptop / Tablet / TV / Console / Accessory fields
            brand: p.brand || "",
            model: p.model || "",
            processor: p.processor || "",
            ram: p.ram || "",
            screenSize: p.screenSize || "",
            graphics: p.graphics || "",
            year: p.year || "",
            connectivity: p.connectivity || "",
          });

          const existingImages =
            Array.isArray(p.images) && p.images.length > 0
              ? p.images
              : p.image
              ? [p.image]
              : [];

          setImagesToKeep(existingImages);
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
          // Laptop / Tablet / TV / Console / Accessory
          brand: updated.product.brand || "",
          model: updated.product.model || "",
          processor: updated.product.processor || "",
          ram: updated.product.ram || "",
          screenSize: updated.product.screenSize || "",
          graphics: updated.product.graphics || "",
          year: updated.product.year || "",
          connectivity: updated.product.connectivity || "",
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

  const liked =
    isFavorite(product._id);

  const isSold =
    product.status === "sold";

  const isLaptop = product.category === "Laptops";
  const isTablet = product.category === "Tablets";
  const isTV = product.category === "TVs" || product.category === "TV";
  const isConsole = product.category === "Game Consoles" || product.category === "Consoles";
  const isAccessory = product.category === "Accessories";

  let specsTitle = "📋 Specifications";
  if (isLaptop) specsTitle = "💻 Laptop Specifications";
  else if (isTablet) specsTitle = "📲 Tablet Specifications";
  else if (isTV) specsTitle = "📺 TV Specifications";
  else if (isConsole) specsTitle = "🎮 Game Console Specifications";
  else if (isAccessory) specsTitle = "🎧 Accessories Specifications";

  // ── Check for any spec to decide if the section should show ──
  const hasAnySpec = () => {
    const fields = [
      product.storage, product.color, product.condition,
      product.batteryHealth !== null && product.batteryHealth !== undefined,
      product.negotiation, product.swapAccepted, product.warranty,
      product.brand, product.model, product.processor, product.ram,
      product.screenSize, product.graphics, product.year, product.connectivity,
    ];

    if (product.category === "Phones") {
      fields.push(product.faceId, product.simStatus);
    }

    return fields.some(f => f);
  };

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
        `}
      </style>

      <div
        className="container"
        style={{
          padding: "30px 20px",
        }}
      >
        {/* ============================================================
            PRODUCT LAYOUT
        ============================================================ */}

        <div
          className="product-detail"
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: "40px",
          }}
        >
          {/* ========================================================
              GALLERY
          ======================================================== */}

          <div className="gallery">
            <div
              className="main-image"
              style={{
                position:
                  "relative",
                background:
                  "#f1f5f9",
                borderRadius:
                  "var(--radius-md)",
                overflow: "hidden",
                aspectRatio: "1/1",
              }}
            >
              <img
                src={getCurrentImage()}
                alt={
                  product.title
                }
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit:
                    "cover",
                  display:
                    "block",
                }}
              />

              {/* SOLD RIBBON */}

              {isSold && (
                <SoldBadge
                  variant="ribbon"
                />
              )}

              {/* SLIDER CONTROLS */}

              {totalImages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={
                      handlePrev
                    }
                    style={{
                      position:
                        "absolute",
                      top: "50%",
                      left: "12px",
                      transform:
                        "translateY(-50%)",
                      background:
                        "rgba(0,0,0,0.5)",
                      color:
                        "white",
                      border:
                        "none",
                      borderRadius:
                        "50%",
                      width: "40px",
                      height: "40px",
                      fontSize:
                        "24px",
                      cursor:
                        "pointer",
                      zIndex: 10,
                    }}
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleNext
                    }
                    style={{
                      position:
                        "absolute",
                      top: "50%",
                      right: "12px",
                      transform:
                        "translateY(-50%)",
                      background:
                        "rgba(0,0,0,0.5)",
                      color:
                        "white",
                      border:
                        "none",
                      borderRadius:
                        "50%",
                      width: "40px",
                      height: "40px",
                      fontSize:
                        "24px",
                      cursor:
                        "pointer",
                      zIndex: 10,
                    }}
                  >
                    ›
                  </button>

                  <div
                    style={{
                      position:
                        "absolute",
                      bottom: "16px",
                      left: "50%",
                      transform:
                        "translateX(-50%)",
                      display:
                        "flex",
                      gap: "8px",
                      zIndex: 10,
                    }}
                  >
                    {images.map(
                      (_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            handleThumbClick(
                              idx
                            )
                          }
                          style={{
                            width:
                              "10px",
                            height:
                              "10px",
                            borderRadius:
                              "50%",
                            background:
                              idx ===
                              currentImageIndex
                                ? "white"
                                : "rgba(255,255,255,0.5)",
                            border:
                              "none",
                            cursor:
                              "pointer",
                            padding: 0,
                          }}
                        />
                      )
                    )}
                  </div>
                </>
              )}
            </div>

            {/* THUMBNAILS */}

            {hasImages &&
              totalImages > 1 && (
                <div
                  className="thumbnails"
                  style={{
                    display:
                      "flex",
                    gap: "10px",
                    marginTop:
                      "12px",
                    overflowX:
                      "auto",
                    paddingBottom:
                      "4px",
                  }}
                >
                  {images.map(
                    (
                      img,
                      idx
                    ) => (
                      <img
                        key={idx}
                        src={getImageUrl(
                          img
                        )}
                        alt={`Thumb ${
                          idx + 1
                        }`}
                        onClick={() =>
                          handleThumbClick(
                            idx
                          )
                        }
                        style={{
                          width:
                            "80px",
                          height:
                            "80px",
                          objectFit:
                            "cover",
                          borderRadius:
                            "var(--radius-sm)",
                          cursor:
                            "pointer",
                          border:
                            currentImageIndex ===
                            idx
                              ? "3px solid var(--primary)"
                              : "2px solid transparent",
                          flexShrink:
                            0,
                        }}
                      />
                    )
                  )}
                </div>
              )}
          </div>

          {/* ========================================================
              DETAILS
          ======================================================== */}

          <div className="details">
            <h1
              style={{
                fontSize:
                  "28px",
                fontWeight:
                  800,
                marginBottom:
                  "8px",
              }}
            >
              {product.title}

              {isSold && (
                <span
                  style={{
                    fontSize:
                      "16px",
                    fontWeight:
                      700,
                    color:
                      "#dc2626",
                    background:
                      "#fee2e2",
                    padding:
                      "2px 14px",
                    borderRadius:
                      "4px",
                    marginLeft:
                      "12px",
                    display:
                      "inline-block",
                    verticalAlign:
                      "middle",
                  }}
                >
                  SOLD
                </span>
              )}
            </h1>

            {/* PRICE */}

            <div
              className="price"
              style={{
                fontSize:
                  "32px",
                fontWeight:
                  800,
                color: isSold
                  ? "#9ca3af"
                  : "var(--primary)",
                marginBottom:
                  "8px",
              }}
            >
              GH₵{" "}
              {Number(
                product.price ||
                  0
              ).toLocaleString()}
              
              {product.oldPrice && (
                <span
                  style={{
                    fontSize:
                      "18px",
                    fontWeight:
                      400,
                    color:
                      "var(--gray-400)",
                    textDecoration:
                      "line-through",
                    marginLeft:
                      "12px",
                  }}
                >
                  GH₵{" "}
                  {Number(
                    product.oldPrice
                  ).toLocaleString()}
                </span>
              )}
            </div>

            {/* META */}

            <div
              className="meta"
              style={{
                display:
                  "flex",
                gap: "16px",
                flexWrap:
                  "wrap",
                fontSize:
                  "14px",
                color:
                  "var(--gray-500)",
                marginBottom:
                  "16px",
              }}
            >
              <span>
                <i className="fas fa-map-marker-alt" />{" "}
                {product.location ||
                  "Ghana"}
              </span>

              <span>
                <i className="fas fa-tag" />{" "}
                {product.category}
              </span>

              <span>
                <i className="fas fa-eye" />{" "}
                {product.views ||
                  0}{" "}
                views
              </span>

              <span>
                <i className="fas fa-clock" />{" "}
                {product.createdAt
                  ? new Date(
                      product.createdAt
                    ).toLocaleDateString()
                  : ""}
              </span>
            </div>

            {/* ======================================================
                SPECIFICATIONS – with laptop tooltips
            ====================================================== */}

            {hasAnySpec() && (
              <div
                className="specs"
                style={{
                  marginBottom:
                    "20px",
                  padding:
                    "16px",
                  background:
                    "var(--gray-50)",
                  borderRadius:
                    "var(--radius-md)",
                }}
              >
                <h3
                  style={{
                    fontSize:
                      "16px",
                    fontWeight:
                      700,
                    marginBottom:
                      "12px",
                  }}
                >
                  {specsTitle}
                </h3>

                <div
                  className="specs-grid"
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "8px",
                  }}
                >
                  {/* ── Common: Brand & Model ── */}
                  {product.brand && (
                    <div>
                      <strong>Brand:</strong>{" "}
                      {product.brand}
                    </div>
                  )}
                  {product.model && (
                    <div>
                      <strong>Model:</strong>{" "}
                      {product.model}
                    </div>
                  )}

                  {/* ── Laptop specific with tooltips ── */}
                  {isLaptop && (
                    <>
                      {product.processor && (
                        <div>
                          <strong
                            title="The brain of the computer (e.g., Intel Core or AMD Ryzen); higher numbers and more cores mean better multitasking."
                          >
                            Processor:
                          </strong>{" "}
                          {product.processor}
                        </div>
                      )}
                      {product.ram && (
                        <div>
                          <strong
                            title="Temporary storage for active tasks; 8GB handles basic work, 16GB+ is recommended for gaming and heavy creative work."
                          >
                            RAM:
                          </strong>{" "}
                          {product.ram}
                        </div>
                      )}
                      {product.graphics && (
                        <div>
                          <strong
                            title="Handles visual rendering, video editing, and 3D gaming."
                          >
                            Graphics:
                          </strong>{" "}
                          {product.graphics}
                        </div>
                      )}
                      {/* Storage and screen size are already common; we can add tooltips too */}
                      {product.storage && (
                        <div>
                          <strong
                            title="Solid‑state drives (SSD) offer fast boot and load times compared to older hard drives (HDD)."
                          >
                            Storage:
                          </strong>{" "}
                          {product.storage}
                        </div>
                      )}
                      {product.screenSize && (
                        <div>
                          <strong
                            title="Display resolution and size, such as Full HD (1920×1080) or WUXGA."
                          >
                            Screen Size:
                          </strong>{" "}
                          {product.screenSize}
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Tablet specific ── */}
                  {isTablet && (
                    <>
                      {product.year && (
                        <div>
                          <strong>Year:</strong>{" "}
                          {product.year}
                        </div>
                      )}
                      {product.connectivity && (
                        <div>
                          <strong>Connectivity:</strong>{" "}
                          {product.connectivity}
                        </div>
                      )}
                      {/* Screen size and storage also show for tablets via common fields */}
                    </>
                  )}

                  {/* ── TV specific ── */}
                  {isTV && (
                    <>
                      {product.screenSize && (
                        <div>
                          <strong>Screen Size:</strong>{" "}
                          {product.screenSize}
                        </div>
                      )}
                      {product.connectivity && (
                        <div>
                          <strong>Connectivity:</strong>{" "}
                          {product.connectivity}
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Game Console specific ── */}
                  {isConsole && (
                    <>
                      {product.connectivity && (
                        <div>
                          <strong>Connectivity:</strong>{" "}
                          {product.connectivity}
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Accessories specific ── */}
                  {isAccessory && (
                    <>
                      {/* No extra fields, but could add compatibility later */}
                    </>
                  )}

                  {/* ── Common fields (storage, color, condition, etc.) ── */}
                  {/* For laptops, storage and screen size are already displayed above, so we skip duplicates if isLaptop */}
                  {!isLaptop && product.storage && (
                    <div>
                      <strong>Storage:</strong>{" "}
                      {product.storage}
                    </div>
                  )}

                  {!isLaptop && product.screenSize && (
                    <div>
                      <strong>Screen Size:</strong>{" "}
                      {product.screenSize}
                    </div>
                  )}

                  {product.color && (
                    <div>
                      <strong>Color:</strong>{" "}
                      {product.color}
                    </div>
                  )}

                  {product.condition && (
                    <div>
                      <strong>Condition:</strong>{" "}
                      {product.condition}
                    </div>
                  )}

                  {product.batteryHealth !==
                    null &&
                    product.batteryHealth !==
                      undefined && (
                      <div>
                        <strong>Battery Health:</strong>{" "}
                        {product.batteryHealth}%
                      </div>
                    )}

                  {/* ── Phone‑only fields ── */}
                  {product.category === "Phones" && (
                    <>
                      {product.faceId && (
                        <div>
                          <strong>Face ID:</strong>{" "}
                          {product.faceId}
                        </div>
                      )}
                      {product.simStatus && (
                        <div>
                          <strong>SIM Status:</strong>{" "}
                          {product.simStatus}
                        </div>
                      )}
                    </>
                  )}

                  {product.negotiation && (
                    <div>
                      <strong>Negotiable:</strong> Yes
                    </div>
                  )}

                  {product.swapAccepted && (
                    <div>
                      <strong>Swap Accepted:</strong> Yes
                    </div>
                  )}

                  {product.warranty && (
                    <div>
                      <strong>Warranty:</strong>{" "}
                      {product.warranty}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DESCRIPTION */}

            <div
              className="description"
              style={{
                color:
                  "var(--gray-700)",
                lineHeight: 1.7,
                marginBottom:
                  "20px",
              }}
            >
              {product.description ||
                "No description provided."}
            </div>

            {/* ─── SELLER CARD – UPDATED ─── */}
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
              {/* Avatar */}
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
                  const seller = product.seller || product.sellerId || {};
                  const image = seller.profileImage || seller.photo || seller.avatar || seller.profilePicture || null;
                  const name = seller.name || product.sellerName || 'KN Seller';

                  if (image) {
                    return (
                      <img
                        src={getImageUrl(image)}
                        alt={name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.textContent = name.charAt(0).toUpperCase();
                        }}
                      />
                    );
                  }
                  return name.charAt(0).toUpperCase();
                })()}

                {/* Status indicator */}
                <span
                  className={`seller-status-dot ${
                    (() => {
                      const seller = product.seller || product.sellerId || {};
                      if (seller.online === true) return 'online';
                      if (seller.online === false) return 'offline';
                      if (seller.lastActive) {
                        const last = new Date(seller.lastActive);
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

              {/* Seller info */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '16px',
                    marginBottom: '2px',
                  }}
                >
                  <i className="fas fa-user" style={{ marginRight: '6px' }} />
                  {(() => {
                    const seller = product.seller || product.sellerId || {};
                    return seller.name || product.sellerName || 'KN Seller';
                  })()}
                </div>

                {product.sellerPhone && (
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'var(--gray-600)',
                    }}
                  >
                    <i className="fas fa-phone" style={{ marginRight: '6px' }} />
                    {product.sellerPhone}
                  </div>
                )}

                {(() => {
                  const seller = product.seller || product.sellerId || {};
                  if (seller.createdAt) {
                    return (
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--gray-400)',
                          marginTop: '4px',
                        }}
                      >
                        <i className="fas fa-calendar-alt" style={{ marginRight: '4px' }} />
                        Member since {new Date(seller.createdAt).toLocaleDateString()}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* ======================================================
                ACTION BUTTONS
            ====================================================== */}

            <div
              className="actions"
              style={{
                display:
                  "flex",
                gap: "12px",
                flexWrap:
                  "wrap",
              }}
            >
              {/* CONTACT SELLER */}

              {isSold ? (
                <button
                  type="button"
                  disabled
                  style={{
                    padding:
                      "12px 32px",
                    background:
                      "#9ca3af",
                    color:
                      "white",
                    border:
                      "none",
                    borderRadius:
                      "var(--radius-full)",
                    fontWeight:
                      700,
                    fontSize:
                      "16px",
                    cursor:
                      "not-allowed",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "8px",
                    opacity: 0.7,
                  }}
                >
                  <i className="fas fa-ban" />
                  Sold Out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleContact
                  }
                  className="btn-secondary"
                  style={{
                    padding:
                      "12px 32px",
                    background:
                      "var(--secondary)",
                    color:
                      "white",
                    border:
                      "none",
                    borderRadius:
                      "var(--radius-full)",
                    fontWeight:
                      700,
                    fontSize:
                      "16px",
                    cursor:
                      "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: "8px",
                    touchAction:
                      "manipulation",
                  }}
                >
                  <i className="fab fa-whatsapp" />
                  Contact Seller
                </button>
              )}

              {/* MARK SOLD / AVAILABLE */}

              {canEdit && (
                <button
                  type="button"
                  onClick={
                    handleMarkAsSold
                  }
                  disabled={
                    isUpdating
                  }
                  style={{
                    padding:
                      "12px 24px",
                    background:
                      isSold
                        ? "#22c55e"
                        : "#dc2626",
                    color:
                      "white",
                    border:
                      "none",
                    borderRadius:
                      "var(--radius-full)",
                    fontWeight:
                      600,
                    fontSize:
                      "16px",
                    cursor:
                      isUpdating
                        ? "not-allowed"
                        : "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "8px",
                    opacity:
                      isUpdating
                        ? 0.7
                        : 1,
                    touchAction:
                      "manipulation",
                  }}
                >
                  {isUpdating ? (
                    "⏳ Updating..."
                  ) : (
                    <>
                      <i
                        className={
                          isSold
                            ? "fas fa-undo"
                            : "fas fa-check-circle"
                        }
                      />

                      {isSold
                        ? "Mark Available"
                        : "Mark as Sold"}
                    </>
                  )}
                </button>
              )}

              {/* EDIT */}

              {canEdit && (
                <button
                  type="button"
                  onClick={() =>
                    setShowEditModal(
                      true
                    )
                  }
                  style={{
                    padding:
                      "12px 24px",
                    border:
                      "1.5px solid var(--primary)",
                    borderRadius:
                      "var(--radius-full)",
                    background:
                      "white",
                    color:
                      "var(--primary)",
                    fontWeight:
                      600,
                    fontSize:
                      "16px",
                    cursor:
                      "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "8px",
                  }}
                >
                  <i className="fas fa-pen" />
                  Edit
                </button>
              )}

              {/* FAVORITE */}

              <button
                type="button"
                onClick={() =>
                  toggleFavorite(
                    product._id
                  )
                }
                className="btn-outline"
                style={{
                  padding:
                    "12px 24px",
                  border:
                    "1.5px solid var(--gray-300)",
                  borderRadius:
                    "var(--radius-full)",
                  background:
                    "transparent",
                  fontWeight:
                    600,
                  fontSize:
                    "16px",
                  cursor:
                    "pointer",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                  color: liked
                    ? "#e74c3c"
                    : "var(--gray-700)",
                }}
              >
                <i
                  className={
                    liked
                      ? "fas fa-heart"
                      : "far fa-heart"
                  }
                />

                {liked
                  ? "Saved"
                  : "Save"}
              </button>
            </div>

            {/* SAFETY */}

            <div
              className="safety"
              style={{
                marginTop:
                  "20px",
                background:
                  "#fef9c3",
                borderRadius:
                  "var(--radius-md)",
                padding:
                  "14px 18px",
                fontSize:
                  "13px",
                color:
                  "#854d0e",
              }}
            >
              <strong>
                <i className="fas fa-shield-alt" />{" "}
                Safety tips
              </strong>

              <ul
                style={{
                  paddingLeft:
                    "20px",
                  marginTop:
                    "4px",
                }}
              >
                <li>
                  Avoid paying in
                  advance, even
                  for delivery.
                </li>

                <li>
                  Meet with the
                  seller at a
                  safe public
                  place.
                </li>

                <li>
                  Inspect the
                  item before
                  paying.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ============================================================
            EDIT MODAL – with all categories and ALL_COLORS
        ============================================================ */}

        {showEditModal && (
          <div
            style={{
              position:
                "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor:
                "rgba(0,0,0,0.5)",
              backdropFilter:
                "blur(4px)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              zIndex: 9999,
              padding:
                "20px",
            }}
            onClick={() =>
              setShowEditModal(
                false
              )
            }
          >
            <div
              style={{
                background:
                  "white",
                borderRadius:
                  "var(--radius-xl)",
                maxWidth:
                  "600px",
                width:
                  "100%",
                padding:
                  "32px",
                position:
                  "relative",
                maxHeight:
                  "90vh",
                overflowY:
                  "auto",
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* CLOSE */}

              <button
                type="button"
                onClick={() =>
                  setShowEditModal(
                    false
                  )
                }
                style={{
                  position:
                    "absolute",
                  top: "14px",
                  right: "18px",
                  fontSize:
                    "28px",
                  cursor:
                    "pointer",
                  color:
                    "var(--gray-400)",
                  background:
                    "none",
                  border:
                    "none",
                }}
              >
                &times;
              </button>

              <h2
                style={{
                  fontSize:
                    "24px",
                  fontWeight:
                    800,
                  marginBottom:
                    "20px",
                  textAlign:
                    "center",
                }}
              >
                Edit Product
              </h2>

              {/* ERROR */}

              {editError && (
                <div
                  style={{
                    background:
                      "#fee2e2",
                    color:
                      "#dc2626",
                    padding:
                      "10px 14px",
                    borderRadius:
                      "var(--radius-sm)",
                    marginBottom:
                      "16px",
                  }}
                >
                  {editError}
                </div>
              )}

              <form
                onSubmit={
                  handleEditSubmit
                }
              >
                {/* TITLE */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      editForm.title
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  />
                </div>

                {/* PRICE */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Price (GH₵) *
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={
                      editForm.price
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                    step="0.01"
                    min="0"
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  />
                </div>

                {/* PHONE */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Seller Phone
                  </label>

                  <input
                    type="tel"
                    name="sellerPhone"
                    value={
                      editForm.sellerPhone
                    }
                    onChange={
                      handleEditChange
                    }
                    placeholder="e.g. 054 123 4567"
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  />
                </div>

                {/* CATEGORY */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      editForm.category
                    }
                    onChange={
                      handleEditChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  >
                    <option value="Cars">
                      Cars
                    </option>
                    <option value="Phones">
                      Phones
                    </option>
                    <option value="Laptops">
                      Laptops
                    </option>
                    <option value="Tablets">
                      Tablets
                    </option>
                    <option value="TVs">
                      TVs
                    </option>
                    <option value="Game Consoles">
                      Game Consoles
                    </option>
                    <option value="Accessories">
                      Accessories
                    </option>
                    <option value="Real Estate">
                      Real Estate
                    </option>
                    <option value="Jobs">
                      Jobs
                    </option>
                    <option value="Electronics">
                      Electronics
                    </option>
                    <option value="Fashion">
                      Fashion
                    </option>
                    <option value="Home">
                      Home
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* LOCATION */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={
                      editForm.location
                    }
                    onChange={
                      handleEditChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  />
                </div>

                {/* DESCRIPTION */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      editForm.description
                    }
                    onChange={
                      handleEditChange
                    }
                    rows="3"
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                      resize:
                        "vertical",
                    }}
                  />
                </div>

                {/* CONDITION */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Condition
                  </label>

                  <select
                    name="condition"
                    value={
                      editForm.condition
                    }
                    onChange={
                      handleEditChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  >
                    <option value="Brand New">
                      Brand New
                    </option>
                    <option value="Like New">
                      Like New
                    </option>
                    <option value="Excellent">
                      Excellent
                    </option>
                    <option value="Good">
                      Good
                    </option>
                    <option value="Fair">
                      Fair
                    </option>
                    <option value="Poor">
                      Poor
                    </option>
                  </select>
                </div>

                {/* ─── CATEGORY‑SPECIFIC SECTIONS ────────────────────────── */}

                {/* LAPTOP */}
                {editForm.category === "Laptops" && (
                  <>
                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Brand
                      </label>

                      <select
                        name="brand"
                        value={
                          editForm.brand
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select brand
                        </option>
                        {LAPTOP_BRANDS.map(
                          (brand) => (
                            <option
                              key={
                                brand
                              }
                              value={
                                brand
                              }
                            >
                              {brand}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Model
                      </label>

                      <select
                        name="model"
                        value={
                          editForm.model
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                        disabled={
                          !editForm.brand
                        }
                      >
                        <option value="">
                          {editForm.brand
                            ? "Select model"
                            : "Select a brand first"}
                        </option>
                        {getModelsByBrand(
                          editForm.brand
                        ).map(
                          (model) => (
                            <option
                              key={
                                model
                              }
                              value={
                                model
                              }
                            >
                              {model}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Processor
                      </label>

                      <select
                        name="processor"
                        value={
                          editForm.processor
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select processor
                        </option>
                        {PROCESSOR_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        RAM
                      </label>

                      <select
                        name="ram"
                        value={
                          editForm.ram
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select RAM
                        </option>
                        {RAM_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Screen Size
                      </label>

                      <select
                        name="screenSize"
                        value={
                          editForm.screenSize
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select screen size
                        </option>
                        {SCREEN_SIZE_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Graphics
                      </label>

                      <select
                        name="graphics"
                        value={
                          editForm.graphics
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select graphics
                        </option>
                        {GRAPHICS_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </>
                )}

                {/* TABLET */}
                {editForm.category === "Tablets" && (
                  <>
                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Brand
                      </label>

                      <select
                        name="brand"
                        value={
                          editForm.brand
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select brand
                        </option>
                        {TABLET_BRANDS.map(
                          (brand) => (
                            <option
                              key={
                                brand
                              }
                              value={
                                brand
                              }
                            >
                              {brand}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Model
                      </label>

                      <select
                        name="model"
                        value={
                          editForm.model
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                        disabled={
                          !editForm.brand
                        }
                      >
                        <option value="">
                          {editForm.brand
                            ? "Select model"
                            : "Select a brand first"}
                        </option>
                        {getTabletModelsByBrand(
                          editForm.brand
                        ).map(
                          (model) => (
                            <option
                              key={
                                model
                              }
                              value={
                                model
                              }
                            >
                              {model}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Year
                      </label>

                      <select
                        name="year"
                        value={
                          editForm.year
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select year
                        </option>
                        {YEAR_OPTIONS.map(
                          (year) => (
                            <option
                              key={year}
                              value={year}
                            >
                              {year}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Connectivity
                      </label>

                      <select
                        name="connectivity"
                        value={
                          editForm.connectivity
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select connectivity
                        </option>
                        {CONNECTIVITY_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Screen Size
                      </label>

                      <select
                        name="screenSize"
                        value={
                          editForm.screenSize
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select screen size
                        </option>
                        {TABLET_SCREEN_SIZES.map(
                          (size) => (
                            <option
                              key={size}
                              value={size}
                            >
                              {size}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </>
                )}

                {/* TV */}
                {editForm.category === "TVs" && (
                  <>
                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Brand
                      </label>

                      <select
                        name="brand"
                        value={
                          editForm.brand
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select brand
                        </option>
                        {TV_BRANDS.map(
                          (brand) => (
                            <option
                              key={
                                brand
                              }
                              value={
                                brand
                              }
                            >
                              {brand}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Model
                      </label>

                      <input
                        type="text"
                        name="model"
                        value={
                          editForm.model
                        }
                        onChange={
                          handleEditChange
                        }
                        placeholder="e.g. QN90B"
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      />
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Screen Size
                      </label>

                      <select
                        name="screenSize"
                        value={
                          editForm.screenSize
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select screen size
                        </option>
                        {SCREEN_SIZE_OPTIONS.map(
                          (size) => (
                            <option
                              key={size}
                              value={size}
                            >
                              {size}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Connectivity (Smart TV features)
                      </label>

                      <select
                        name="connectivity"
                        value={
                          editForm.connectivity
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select connectivity
                        </option>
                        {CONNECTIVITY_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </>
                )}

                {/* GAME CONSOLES */}
                {editForm.category === "Game Consoles" && (
                  <>
                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Brand
                      </label>

                      <select
                        name="brand"
                        value={
                          editForm.brand
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select brand
                        </option>
                        {CONSOLE_BRANDS.map(
                          (brand) => (
                            <option
                              key={
                                brand
                              }
                              value={
                                brand
                              }
                            >
                              {brand}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Model
                      </label>

                      <input
                        type="text"
                        name="model"
                        value={
                          editForm.model
                        }
                        onChange={
                          handleEditChange
                        }
                        placeholder="e.g. PS5, Xbox Series X"
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      />
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Connectivity (Wi‑Fi, Bluetooth, etc.)
                      </label>

                      <select
                        name="connectivity"
                        value={
                          editForm.connectivity
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select connectivity
                        </option>
                        {CONNECTIVITY_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </>
                )}

                {/* ACCESSORIES */}
                {editForm.category === "Accessories" && (
                  <>
                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Brand
                      </label>

                      <select
                        name="brand"
                        value={
                          editForm.brand
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select brand
                        </option>
                        {ACCESSORY_BRANDS.map(
                          (brand) => (
                            <option
                              key={
                                brand
                              }
                              value={
                                brand
                              }
                            >
                              {brand}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Model
                      </label>

                      <input
                        type="text"
                        name="model"
                        value={
                          editForm.model
                        }
                        onChange={
                          handleEditChange
                        }
                        placeholder="e.g. AirPods Pro, 4K Webcam"
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      />
                    </div>

                    <div
                      className="form-group"
                      style={{
                        marginBottom:
                          "12px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "block",
                          fontWeight:
                            600,
                          fontSize:
                            "13px",
                          marginBottom:
                            "4px",
                        }}
                      >
                        Connectivity (if applicable)
                      </label>

                      <select
                        name="connectivity"
                        value={
                          editForm.connectivity
                        }
                        onChange={
                          handleEditChange
                        }
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px 14px",
                          border:
                            "1.5px solid var(--gray-200)",
                          borderRadius:
                            "var(--radius-md)",
                          fontSize:
                            "14px",
                        }}
                      >
                        <option value="">
                          Select connectivity
                        </option>
                        {CONNECTIVITY_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option
                              }
                              value={
                                option
                              }
                            >
                              {option}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </>
                )}

                {/* ─── COMMON REMAINING FIELDS ────────────────────────── */}

                {/* STORAGE (but we already show it for laptops in specs, but we keep it in edit) */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Storage
                  </label>

                  <select
                    name="storage"
                    value={
                      editForm.storage
                    }
                    onChange={
                      handleEditChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  >
                    <option value="">
                      Select storage
                    </option>
                    <option value="16GB">
                      16GB
                    </option>
                    <option value="32GB">
                      32GB
                    </option>
                    <option value="64GB">
                      64GB
                    </option>
                    <option value="128GB">
                      128GB
                    </option>
                    <option value="256GB">
                      256GB
                    </option>
                    <option value="512GB">
                      512GB
                    </option>
                    <option value="1TB">
                      1TB
                    </option>
                    <option value="2TB">
                      2TB
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* COLOR – using ALL_COLORS */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Color
                  </label>

                  <select
                    name="color"
                    value={
                      editForm.color
                    }
                    onChange={
                      handleEditChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  >
                    <option value="">
                      Select color
                    </option>

                    {ALL_COLORS.map(
                      (color) => (
                        <option
                          key={
                            color
                          }
                          value={
                            color
                          }
                        >
                          {color}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* BATTERY */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Battery Health (%)
                  </label>

                  <input
                    type="number"
                    name="batteryHealth"
                    value={
                      editForm.batteryHealth
                    }
                    onChange={
                      handleEditChange
                    }
                    min="0"
                    max="100"
                    step="1"
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  />
                </div>

                {/* FACE ID – only for phones, but we keep it in edit form for all */}
                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Face ID
                  </label>

                  <select
                    name="faceId"
                    value={
                      editForm.faceId
                    }
                    onChange={
                      handleEditChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  >
                    <option value="">
                      Select Face ID status
                    </option>
                    <option value="Working">
                      Working
                    </option>
                    <option value="Not Working">
                      Not Working
                    </option>
                    <option value="Not Available">
                      Not Available
                    </option>
                  </select>
                </div>

                {/* SIM – only for phones, but we keep it in edit form for all */}
                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    SIM Status
                  </label>

                  <select
                    name="simStatus"
                    value={
                      editForm.simStatus
                    }
                    onChange={
                      handleEditChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  >
                    <option value="">
                      Select SIM status
                    </option>
                    <option value="eSIM Unlocked">
                      eSIM Unlocked
                    </option>
                    <option value="SIM Unlocked">
                      SIM Unlocked
                    </option>
                    <option value="Locked">
                      Locked
                    </option>
                    <option value="Bypass">
                      Bypass
                    </option>
                  </select>
                </div>

                {/* WARRANTY */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Warranty Period
                  </label>

                  <select
                    name="warranty"
                    value={
                      editForm.warranty
                    }
                    onChange={
                      handleEditChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  >
                    <option value="">
                      No warranty
                    </option>

                    <option value="1 week">
                      1 week
                    </option>

                    <option value="2 weeks">
                      2 weeks
                    </option>

                    <option value="3 weeks">
                      3 weeks
                    </option>

                    <option value="4 weeks">
                      4 weeks
                    </option>

                    {Array.from(
                      {
                        length: 12,
                      },
                      (_, i) =>
                        i + 1
                    ).map(
                      (months) => (
                        <option
                          key={
                            months
                          }
                          value={`${months} month${
                            months > 1
                              ? "s"
                              : ""
                          }`}
                        >
                          {months}{" "}
                          month
                          {months >
                          1
                            ? "s"
                            : ""}
                        </option>
                      )
                    )}

                    <option value="1 year">
                      1 year
                    </option>
                  </select>
                </div>

                {/* NEGOTIATION / SWAP */}

                <div
                  style={{
                    display:
                      "flex",
                    gap:
                      "20px",
                    marginBottom:
                      "12px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="negotiation"
                      checked={
                        editForm.negotiation
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                    <label
                      style={{
                        fontWeight:
                          600,
                        fontSize:
                          "13px",
                      }}
                    >
                      Negotiation
                    </label>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="swapAccepted"
                      checked={
                        editForm.swapAccepted
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                    <label
                      style={{
                        fontWeight:
                          600,
                        fontSize:
                          "13px",
                      }}
                    >
                      Swap Accepted
                    </label>
                  </div>
                </div>

                {/* STATUS */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      editForm.status
                    }
                    onChange={
                      handleEditChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "10px 14px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="pending">
                      Pending
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                    <option value="sold">
                      Sold
                    </option>
                  </select>
                </div>

                {/* EXISTING IMAGES */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Current Images
                  </label>

                  <div
                    style={{
                      display:
                        "flex",
                      flexWrap:
                        "wrap",
                      gap:
                        "8px",
                    }}
                  >
                    {imagesToKeep.map(
                      (
                        img,
                        idx
                      ) => (
                        <div
                          key={
                            idx
                          }
                          style={{
                            position:
                              "relative",
                            width:
                              "80px",
                            height:
                              "80px",
                            border:
                              "1px solid var(--gray-200)",
                            borderRadius:
                              "var(--radius-sm)",
                            overflow:
                              "hidden",
                          }}
                        >
                          <img
                            src={getImageUrl(
                              img
                            )}
                            alt={`Current ${
                              idx +
                              1
                            }`}
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                            }}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveExistingImage(
                                idx
                              )
                            }
                            style={{
                              position:
                                "absolute",
                              top:
                                "2px",
                              right:
                                "2px",
                              background:
                                "rgba(220,38,38,0.8)",
                              color:
                                "white",
                              border:
                                "none",
                              borderRadius:
                                "50%",
                              width:
                                "20px",
                              height:
                                "20px",
                              fontSize:
                                "12px",
                              cursor:
                                "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )
                    )}

                    {imagesToKeep.length ===
                      0 && (
                      <span
                        style={{
                          color:
                            "var(--gray-400)",
                          fontSize:
                            "13px",
                        }}
                      >
                        No images
                      </span>
                    )}
                  </div>
                </div>

                {/* NEW IMAGES */}

                <div
                  className="form-group"
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        600,
                      fontSize:
                        "13px",
                      marginBottom:
                        "4px",
                    }}
                  >
                    Add New Images
                  </label>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={
                      handleNewFileChange
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "8px 12px",
                      border:
                        "1.5px solid var(--gray-200)",
                      borderRadius:
                        "var(--radius-md)",
                      fontSize:
                        "14px",
                    }}
                  />

                  {newFilePreviews.length >
                    0 && (
                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        gap:
                          "8px",
                        marginTop:
                          "8px",
                      }}
                    >
                      {newFilePreviews.map(
                        (
                          preview,
                          idx
                        ) => (
                          <div
                            key={
                              idx
                            }
                            style={{
                              position:
                                "relative",
                              width:
                                "80px",
                              height:
                                "80px",
                              border:
                                "1px solid var(--gray-200)",
                              borderRadius:
                                "var(--radius-sm)",
                              overflow:
                                "hidden",
                            }}
                          >
                            <img
                              src={
                                preview
                              }
                              alt={`New ${
                                idx +
                                1
                              }`}
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                objectFit:
                                  "cover",
                              }}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeNewFile(
                                  idx
                                )
                              }
                              style={{
                                position:
                                  "absolute",
                                top:
                                  "2px",
                                right:
                                  "2px",
                                background:
                                  "rgba(220,38,38,0.8)",
                                color:
                                  "white",
                                border:
                                  "none",
                                borderRadius:
                                  "50%",
                                width:
                                  "20px",
                                height:
                                  "20px",
                                fontSize:
                                  "12px",
                                cursor:
                                  "pointer",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* SAVE */}

                <button
                  type="submit"
                  disabled={
                    editLoading
                  }
                  style={{
                    width:
                      "100%",
                    padding:
                      "14px",
                    background:
                      "var(--secondary)",
                    color:
                      "white",
                    border:
                      "none",
                    borderRadius:
                      "var(--radius-full)",
                    fontWeight:
                      700,
                    fontSize:
                      "16px",
                    cursor:
                      editLoading
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      editLoading
                        ? 0.7
                        : 1,
                  }}
                >
                  {editLoading
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================
            RELATED PRODUCTS
        ============================================================ */}

        <div
          style={{
            marginTop:
              "60px",
          }}
        >
          <h2
            style={{
              fontSize:
                "22px",
              fontWeight:
                800,
              marginBottom:
                "20px",
            }}
          >
            You might also like
          </h2>

          <div
            style={{
              color:
                "var(--gray-500)",
            }}
          >
            Related products
            coming soon...
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;