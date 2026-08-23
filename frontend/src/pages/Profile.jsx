// ============================================================
// frontend/src/pages/Profile.jsx
// BuyUKUsed - User Profile
// ============================================================

import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "../styles/global.css";

import {
  getProducts,
  getUserNotifications,
  getImageUrl,
  API_URL,
  deleteProduct,
} from "../services/api";

import { messages } from "../services/messages";

const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // ==========================================================
  // DATA STATE
  // ==========================================================

  const [products, setProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messagesList, setMessagesList] = useState([]);

  const [loading, setLoading] = useState(false);

  const [deletingProductId, setDeletingProductId] =
    useState(null);

  const [stats, setStats] = useState({
    totalAds: 0,
    totalViews: 0,
    totalNotifications: 0,
    unreadNotifications: 0,
    unreadMessages: 0,
  });

  // ==========================================================
  // EDIT PROFILE MODAL
  // ==========================================================

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("buyer");

  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] =
    useState("");

  const [editLoading, setEditLoading] =
    useState(false);

  const [editError, setEditError] = useState("");

  const [removePhoto, setRemovePhoto] =
    useState(false);

  // ==========================================================
  // KEEP EDIT FIELDS IN SYNC WITH USER
  // ==========================================================

  useEffect(() => {
    if (!user) return;

    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");
    setEditRole(user.role || "buyer");

    const existingPhoto =
      user.photoURL ||
      user.photo ||
      user.profileImage ||
      "";

    setEditPhotoPreview(existingPhoto);

    setEditPhoto(null);
    setRemovePhoto(false);
  }, [user]);

  // ==========================================================
  // LOAD PROFILE DATA
  // ==========================================================

  const loadUserData = useCallback(async () => {
    if (!user || !token) {
      return;
    }

    const userId =
      user._id ||
      user.id ||
      user.userId;

    if (!userId) {
      console.warn(
        "⚠️ No user ID found in user object:",
        user
      );

      return;
    }

    try {
      setLoading(true);

      console.log(
        "👤 Loading profile data for user:",
        userId
      );

      const results =
        await Promise.allSettled([
          getProducts({
            sellerId: userId,
            limit: 100,
          }),

          getUserNotifications(
            userId,
            token
          ),

          messages.getForUser(
            userId,
            token
          ),
        ]);

      // ========================================================
      // PRODUCTS
      // ========================================================

      let userProducts = [];

      if (
        results[0]?.status ===
        "fulfilled"
      ) {
        const productResponse =
          results[0].value;

        userProducts =
          Array.isArray(productResponse)
            ? productResponse
            : productResponse?.products ||
              [];
      } else {
        console.error(
          "❌ Products request failed:",
          results[0]?.reason
        );

        try {
          const response =
            await fetch(
              `${API_URL}/api/users/me/products`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          if (response.ok) {
            const data =
              await response.json();

            userProducts =
              data?.products || [];
          }
        } catch (fallbackError) {
          console.error(
            "❌ Fallback product fetch failed:",
            fallbackError
          );
        }
      }

      // ========================================================
      // NOTIFICATIONS
      // ========================================================

      let userNotifs = [];

      if (
        results[1]?.status ===
        "fulfilled"
      ) {
        const notifResponse =
          results[1].value;

        userNotifs =
          Array.isArray(
            notifResponse
          )
            ? notifResponse
            : notifResponse?.notifications ||
              notifResponse?.data ||
              [];
      } else {
        console.error(
          "❌ Notifications request failed:",
          results[1]?.reason
        );
      }

      // ========================================================
      // MESSAGES
      // ========================================================

      let userMessages = [];

      if (
        results[2]?.status ===
        "fulfilled"
      ) {
        const msgResponse =
          results[2].value;

        userMessages =
          Array.isArray(msgResponse)
            ? msgResponse
            : msgResponse?.messages ||
              msgResponse?.data ||
              [];
      } else {
        console.error(
          "❌ Messages request failed:",
          results[2]?.reason
        );
      }

      // ========================================================
      // UPDATE STATE
      // ========================================================

      setProducts(userProducts);
      setNotifications(userNotifs);
      setMessagesList(userMessages);

      // ========================================================
      // UNREAD MESSAGES
      // ========================================================

      const unreadMsgs =
        userMessages.filter(
          (message) => {
            const receiverId =
              typeof message.receiver ===
              "string"
                ? message.receiver
                : message.receiver?._id;

            return (
              String(receiverId) ===
                String(userId) &&
              !message.read
            );
          }
        ).length;

      // ========================================================
      // TOTAL VIEWS
      // ========================================================

      const totalViews =
        userProducts.reduce(
          (sum, product) =>
            sum +
            Number(
              product.views || 0
            ),
          0
        );

      // ========================================================
      // UNREAD NOTIFICATIONS
      // ========================================================

      const unreadNotifications =
        userNotifs.filter(
          (notification) =>
            !notification.read
        ).length;

      // ========================================================
      // UPDATE STATS
      // ========================================================

      setStats({
        totalAds:
          userProducts.length,

        totalViews,

        totalNotifications:
          userNotifs.length,

        unreadNotifications,

        unreadMessages:
          unreadMsgs,
      });

    } catch (error) {
      console.error(
        "❌ Profile loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    if (!user || !token) return;

    loadUserData();
  }, [
    user,
    token,
    loadUserData,
  ]);

  // ==========================================================
  // DELETE PRODUCT
  // ==========================================================

  const handleDeleteProduct = async (
    productId
  ) => {
    if (
      !window.confirm(
        "Delete this product permanently?"
      )
    ) {
      return;
    }

    if (!token) {
      alert(
        "Session expired. Please login again."
      );

      return;
    }

    setDeletingProductId(productId);

    try {
      const result =
        await deleteProduct(
          productId,
          token
        );

      if (
        result?.success ||
        result?.message?.includes(
          "deleted"
        )
      ) {
        setProducts(
          (prev) =>
            prev.filter(
              (product) =>
                product._id !==
                productId
            )
        );

        setStats(
          (prev) => ({
            ...prev,

            totalAds:
              Math.max(
                0,
                prev.totalAds - 1
              ),
          })
        );
      } else {
        alert(
          result?.message ||
            "Delete failed."
        );
      }
    } catch (error) {
      console.error(
        "❌ Delete error:",
        error
      );

      alert(
        error?.message ||
          "Something went wrong."
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  // ==========================================================
  // EDIT PHOTO
  // ==========================================================

  const handleEditPhotoChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      editPhotoPreview &&
      editPhotoPreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        editPhotoPreview
      );
    }

    setEditPhoto(file);

    setEditPhotoPreview(
      URL.createObjectURL(file)
    );

    setRemovePhoto(false);
  };

  // ==========================================================
  // REMOVE PHOTO
  // ==========================================================

  const handleRemovePhoto = () => {
    if (
      editPhotoPreview &&
      editPhotoPreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        editPhotoPreview
      );
    }

    setEditPhoto(null);
    setEditPhotoPreview("");
    setRemovePhoto(true);
  };

  // ==========================================================
  // UPDATE PROFILE
  // ==========================================================

  const handleUpdateProfile = async (
    event
  ) => {
    event.preventDefault();

    if (!token) {
      setEditError(
        "Session expired. Please login again."
      );

      return;
    }

    setEditError("");
    setEditLoading(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "name",
        editName.trim()
      );

      formData.append(
        "email",
        editEmail
          .trim()
          .toLowerCase()
      );

      formData.append(
        "phone",
        editPhone.trim()
      );

      formData.append(
        "role",
        editRole
      );

      if (removePhoto) {
        formData.append(
          "removePhoto",
          "true"
        );
      } else if (editPhoto) {
        formData.append(
          "photo",
          editPhoto
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/users/profile`,
          {
            method: "PUT",

            credentials: "include",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: formData,
          }
        );

      let data = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Update failed (${response.status})`
        );
      }

      if (data.success !== false) {
        setShowEditModal(false);

        window.location.reload();
      } else {
        setEditError(
          data.message ||
            "Update failed"
        );
      }
    } catch (error) {
      console.error(
        "❌ Profile update error:",
        error
      );

      setEditError(
        error?.message ||
          "Something went wrong."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navigateTo = (path) => {
    navigate(path);
  };

  // ==========================================================
  // REQUEST RIDE
  // ==========================================================

  const handleRequestRide = () => {
    navigate("/book-rider");
  };

  // ==========================================================
  // NOT LOGGED IN
  // ==========================================================

  if (!user) {
    return (
      <div
        className="container"
        style={{
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h2>Please Login</h2>

        <p
          style={{
            color:
              "var(--gray-500)",
          }}
        >
          You need to be logged in
          to view your profile.
        </p>

        <Link
          to="/login"
          className="btn-primary"
          style={{
            display:
              "inline-block",
            marginTop: "16px",
          }}
        >
          Login
        </Link>
      </div>
    );
  }

  // ==========================================================
  // PROFILE VALUES
  // ==========================================================

  const profileName =
    user.name || "User";

  const profileEmail =
    user.email || "";

  const profilePhoto =
    user.photoURL ||
    user.photo ||
    user.profileImage ||
    "";

  const profileInitial =
    profileName
      ?.charAt(0)
      .toUpperCase() || "U";

  const profileRole =
    user.role || "buyer";

  // ==========================================================
  // VERIFIED SELLER
  // ==========================================================
  //
  // The backend User model uses:
  //
  // isVerifiedSeller: true
  //
  // Only sellers can receive this badge.
  //
  // ==========================================================

  const isVerifiedSeller =
    profileRole === "seller" &&
    user.isVerifiedSeller === true;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="container"
      style={{
        padding:
          "30px 20px",
      }}
    >
      {/* ========================================================
          PROFILE HEADER
      ======================================================== */}

      <div
        className="profile-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          padding:
            "24px 28px",
          background: "white",
          borderRadius:
            "var(--radius-md)",
          border:
            "1px solid var(--gray-200)",
          marginBottom:
            "24px",
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        {/* ======================================================
            AVATAR
        ====================================================== */}

        <div
          className="profile-avatar"
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background:
              "var(--primary)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            fontSize: "32px",
            fontWeight: 700,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {profilePhoto ? (
            <img
              src={
                profilePhoto.startsWith(
                  "http"
                )
                  ? profilePhoto
                  : getImageUrl(
                      profilePhoto
                    )
              }
              alt={
                profileName ||
                "Profile"
              }
              loading="eager"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit:
                  "cover",
              }}
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            profileInitial
          )}
        </div>

        {/* ======================================================
            PROFILE INFORMATION
        ====================================================== */}

        <div
          style={{
            flex: 1,
            minWidth:
              "220px",
          }}
        >
          <h1
            style={{
              fontSize:
                "24px",
              fontWeight: 700,
              display:
                "flex",
              alignItems:
                "center",
              gap: "10px",
              flexWrap:
                "wrap",
              margin:
                "0 0 6px",
            }}
          >
            {profileName}

            {/* ==================================================
                ADMIN BADGE
            ================================================== */}

            {profileRole ===
              "admin" && (
              <span
                style={{
                  background:
                    "#f59e0b",
                  color:
                    "white",
                  fontSize:
                    "12px",
                  padding:
                    "4px 12px",
                  borderRadius:
                    "999px",
                  fontWeight: 700,
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: "5px",
                }}
              >
                <i className="fas fa-shield-alt"></i>
                Admin
              </span>
            )}

            {/* ==================================================
                VERIFIED SELLER BADGE
            ================================================== */}

            {isVerifiedSeller && (
              <span
                title="Verified Seller"
                aria-label="Verified Seller"
                style={{
                  display:
                    "inline-flex",

                  alignItems:
                    "center",

                  gap: "5px",

                  background:
                    "#2563eb",

                  color:
                    "#ffffff",

                  fontSize:
                    "12px",

                  padding:
                    "4px 11px",

                  borderRadius:
                    "999px",

                  fontWeight: 700,

                  whiteSpace:
                    "nowrap",

                  boxShadow:
                    "0 2px 6px rgba(37,99,235,0.25)",
                }}
              >
                <span
                  style={{
                    width:
                      "16px",

                    height:
                      "16px",

                    borderRadius:
                      "50%",

                    background:
                      "#ffffff",

                    color:
                      "#2563eb",

                    display:
                      "inline-flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    fontSize:
                      "10px",

                    fontWeight:
                      900,
                  }}
                >
                  ✓
                </span>

                Verified
              </span>
            )}

            {/* ==================================================
                ROLE BADGE
            ================================================== */}

            {profileRole &&
              profileRole !==
                "admin" && (
                <span
                  style={{
                    background:
                      "#31f705",
                    color:
                      "#374151",
                    fontSize:
                      "12px",
                    padding:
                      "4px 12px",
                    borderRadius:
                      "999px",
                    fontWeight:
                      600,
                  }}
                >
                  {profileRole
                    .charAt(
                      0
                    )
                    .toUpperCase() +
                    profileRole.slice(
                      1
                    )}
                </span>
              )}
          </h1>

          <p
            style={{
              color:
                "var(--gray-500)",
              margin:
                "0 0 4px",
            }}
          >
            {profileEmail}
          </p>

          <p
            style={{
              color:
                "var(--gray-500)",
              margin: 0,
            }}
          >
            <i className="fas fa-calendar-alt"></i>{" "}
            Member since{" "}
            {user.createdAt
              ? new Date(
                  user.createdAt
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div
            style={{
              position:
                "absolute",
              top: "10px",
              right: "14px",
              fontSize:
                "11px",
              color:
                "var(--gray-400)",
              display:
                "flex",
              alignItems:
                "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width:
                  "8px",
                height:
                  "8px",
                borderRadius:
                  "50%",
                border:
                  "2px solid var(--gray-300)",
                borderTopColor:
                  "var(--primary)",
                animation:
                  "profileSpin 0.8s linear infinite",
              }}
            />

            Updating...
          </div>
        )}

        {/* ======================================================
            PROFILE ACTIONS
        ====================================================== */}

        <div
          style={{
            display:
              "flex",
            gap: "10px",
            flexWrap:
              "wrap",
            alignItems:
              "center",
          }}
        >
          <button
            type="button"
            onClick={
              handleRequestRide
            }
            style={{
              padding:
                "10px 20px",

              background:
                "#111827",

              color: "white",

              border: "none",

              borderRadius:
                "999px",

              fontWeight: 700,

              display:
                "inline-flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap: "8px",

              cursor:
                "pointer",

              fontSize:
                "14px",
            }}
          >
            <i className="fas fa-motorcycle"></i>

            Request a Ride
          </button>

          <Link
            to="/post-ad"
            className="btn-secondary"
            style={{
              padding:
                "10px 20px",
              background:
                "var(--secondary)",
              color: "white",
              border: "none",
              borderRadius:
                "999px",
              fontWeight: 600,
              textDecoration:
                "none",
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: "8px",
            }}
          >
            <i className="fas fa-plus-circle"></i>

            Post Ad
          </Link>

          <button
            className="btn-outline"
            onClick={() => {
              setShowEditModal(
                true
              );

              setRemovePhoto(
                false
              );

              setEditError("");
            }}
            style={{
              padding:
                "10px 20px",
              border:
                "1.5px solid var(--gray-300)",
              borderRadius:
                "999px",
              background:
                "transparent",
              fontWeight: 600,
              cursor:
                "pointer",
            }}
          >
            <i className="fas fa-pen"></i>{" "}
            Edit Profile
          </button>
        </div>
      </div>

      {/* ========================================================
          VERIFIED SELLER INFORMATION
      ======================================================== */}

      {isVerifiedSeller && (
        <div
          style={{
            marginBottom:
              "24px",

            padding:
              "14px 18px",

            borderRadius:
              "12px",

            border:
              "1px solid #bfdbfe",

            background:
              "#eff6ff",

            display:
              "flex",

            alignItems:
              "center",

            gap:
              "12px",

            color:
              "#1e3a8a",
          }}
        >
          <span
            style={{
              width:
                "28px",

              height:
                "28px",

              borderRadius:
                "50%",

              background:
                "#2563eb",

              color:
                "#ffffff",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              fontWeight:
                900,
            }}
          >
            ✓
          </span>

          <div>
            <strong>
              Verified Seller
            </strong>

            <div
              style={{
                fontSize:
                  "13px",

                marginTop:
                  "2px",

                color:
                  "#475569",
              }}
            >
              This seller has been verified by BuyUKUsed.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          QUICK RIDE REQUEST
      ======================================================== */}

      <div
        style={{
          background:
            "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
          color: "#fff",
          borderRadius:
            "var(--radius-md)",
          padding:
            "20px 22px",
          marginBottom:
            "24px",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "space-between",
          gap: "18px",
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
            gap: "14px",
            minWidth:
              "220px",
            flex: 1,
          }}
        >
          <div
            style={{
              width:
                "48px",
              height:
                "48px",
              borderRadius:
                "50%",
              background:
                "rgba(255,255,255,0.12)",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              fontSize:
                "21px",
            }}
          >
            <i className="fas fa-motorcycle"></i>
          </div>

          <div>
            <h2
              style={{
                margin:
                  "0 0 4px",
                fontSize:
                  "17px",
                fontWeight:
                  800,
              }}
            >
              Need a ride?
            </h2>

            <p
              style={{
                margin: 0,
                color:
                  "rgba(255,255,255,0.72)",
                fontSize:
                  "13px",
                lineHeight:
                  1.5,
              }}
            >
              Request a rider to pick up
              or deliver an item.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            handleRequestRide
          }
          style={{
            border: "none",
            background:
              "#fff",
            color:
              "#111827",
            padding:
              "10px 18px",
            borderRadius:
              "999px",
            fontWeight:
              800,
            cursor:
              "pointer",
            display:
              "inline-flex",
            alignItems:
              "center",
            gap: "8px",
            whiteSpace:
              "nowrap",
          }}
        >
          <i className="fas fa-motorcycle"></i>

          Request a Ride
        </button>
      </div>

      {/* ========================================================
          STATS
      ======================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
        }}
      >
        {/* TOTAL ADS */}

        <div
          onClick={() =>
            navigateTo(
              "/my-ads"
            )
          }
          style={{
            background:
              "white",
            padding:
              "16px 20px",
            borderRadius:
              "var(--radius-md)",
            border:
              "1px solid var(--gray-200)",
            textAlign:
              "center",
            cursor:
              "pointer",
          }}
        >
          <div
            style={{
              fontSize:
                "28px",
              fontWeight:
                800,
              color:
                "var(--primary)",
            }}
          >
            {stats.totalAds}
          </div>

          <div
            style={{
              fontSize:
                "13px",
              color:
                "var(--gray-500)",
            }}
          >
            TOTAL ADS
          </div>
        </div>

        {/* TOTAL VIEWS */}

        <div
          onClick={() =>
            navigateTo(
              "/analytics"
            )
          }
          style={{
            background:
              "white",
            padding:
              "16px 20px",
            borderRadius:
              "var(--radius-md)",
            border:
              "1px solid var(--gray-200)",
            textAlign:
              "center",
            cursor:
              "pointer",
          }}
        >
          <div
            style={{
              fontSize:
                "28px",
              fontWeight:
                800,
              color:
                "#8b5cf6",
            }}
          >
            {stats.totalViews}
          </div>

          <div
            style={{
              fontSize:
                "13px",
              color:
                "var(--gray-500)",
            }}
          >
            TOTAL VIEWS
          </div>
        </div>

        {/* NOTIFICATIONS */}

        <div
          onClick={() =>
            navigateTo(
              "/notifications"
            )
          }
          style={{
            background:
              "white",
            padding:
              "16px 20px",
            borderRadius:
              "var(--radius-md)",
            border:
              "1px solid var(--gray-200)",
            textAlign:
              "center",
            cursor:
              "pointer",
          }}
        >
          <div
            style={{
              fontSize:
                "28px",
              fontWeight:
                800,
              color:
                "#f59e0b",
            }}
          >
            {
              stats.totalNotifications
            }
          </div>

          <div
            style={{
              fontSize:
                "13px",
              color:
                "var(--gray-500)",
            }}
          >
            NOTIFICATIONS
          </div>

          {stats.unreadNotifications >
            0 && (
            <span
              style={{
                background:
                  "#e74c3c",
                color:
                  "white",
                fontSize:
                  "11px",
                padding:
                  "1px 10px",
                borderRadius:
                  "999px",
                display:
                  "inline-block",
                marginTop:
                  "4px",
              }}
            >
              {
                stats.unreadNotifications
              }{" "}
              unread
            </span>
          )}
        </div>

        {/* MESSAGES */}

        <div
          onClick={() =>
            navigateTo(
              "/messages"
            )
          }
          style={{
            background:
              "white",
            padding:
              "16px 20px",
            borderRadius:
              "var(--radius-md)",
            border:
              "1px solid var(--gray-200)",
            textAlign:
              "center",
            cursor:
              "pointer",
          }}
        >
          <div
            style={{
              fontSize:
                "28px",
              fontWeight:
                800,
              color:
                "#0ea5e9",
            }}
          >
            {
              messagesList.length
            }
          </div>

          <div
            style={{
              fontSize:
                "13px",
              color:
                "var(--gray-500)",
            }}
          >
            MESSAGES
          </div>

          {stats.unreadMessages >
            0 && (
            <span
              style={{
                background:
                  "#e74c3c",
                color:
                  "white",
                fontSize:
                  "11px",
                padding:
                  "1px 10px",
                borderRadius:
                  "999px",
                display:
                  "inline-block",
                marginTop:
                  "4px",
              }}
            >
              {
                stats.unreadMessages
              }{" "}
              unread
            </span>
          )}
        </div>
      </div>

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading && (
        <div
          style={{
            marginTop:
              "16px",
            padding:
              "10px 14px",
            borderRadius:
              "var(--radius-md)",
            background:
              "var(--gray-50)",
            color:
              "var(--gray-500)",
            fontSize:
              "13px",
            textAlign:
              "center",
          }}
        >
          Loading your latest
          profile activity...
        </div>
      )}

      {/* ========================================================
          EDIT PROFILE MODAL
      ======================================================== */}

      {showEditModal && (
        <div
          className="edit-profile-overlay"
          onClick={() =>
            setShowEditModal(
              false
            )
          }
        >
          <div
            className="edit-profile-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              className="close-btn"
              onClick={() =>
                setShowEditModal(
                  false
                )
              }
            >
              &times;
            </button>

            <h2>
              Edit Profile
            </h2>

            {editError && (
              <div className="error-banner">
                {editError}
              </div>
            )}

            <form
              onSubmit={
                handleUpdateProfile
              }
            >
              {/* PROFILE PHOTO */}

              <div className="form-group">
                <label>
                  Profile Photo
                </label>

                <div className="photo-upload-row">
                  <div className="photo-preview">
                    {editPhotoPreview ? (
                      <img
                        src={
                          editPhotoPreview.startsWith(
                            "http"
                          ) ||
                          editPhotoPreview.startsWith(
                            "blob:"
                          )
                            ? editPhotoPreview
                            : getImageUrl(
                                editPhotoPreview
                              )
                        }
                        alt="Preview"
                      />
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleEditPhotoChange
                    }
                    disabled={
                      editLoading
                    }
                  />

                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={
                      handleRemovePhoto
                    }
                    disabled={
                      editLoading
                    }
                  >
                    Remove Photo
                  </button>
                </div>
              </div>

              {/* NAME */}

              <div className="form-group">
                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={
                    editName
                  }
                  onChange={(e) =>
                    setEditName(
                      e.target.value
                    )
                  }
                  required
                  disabled={
                    editLoading
                  }
                />
              </div>

              {/* EMAIL */}

              <div className="form-group">
                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={
                    editEmail
                  }
                  onChange={(e) =>
                    setEditEmail(
                      e.target.value
                    )
                  }
                  required
                  disabled={
                    editLoading
                  }
                />
              </div>

              {/* PHONE */}

              <div className="form-group">
                <label>
                  Phone
                </label>

                <input
                  type="tel"
                  value={
                    editPhone
                  }
                  onChange={(e) =>
                    setEditPhone(
                      e.target.value
                    )
                  }
                  disabled={
                    editLoading
                  }
                />
              </div>

              {/* ACCOUNT TYPE */}

              <div className="form-group">
                <label>
                  Account Type
                </label>

                <select
                  value={
                    editRole
                  }
                  onChange={(e) =>
                    setEditRole(
                      e.target.value
                    )
                  }
                  disabled={
                    editLoading
                  }
                >
                  <option value="buyer">
                    Buyer
                  </option>

                  <option value="seller">
                    Seller
                  </option>

                  <option value="rider">
                    Rider
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="save-btn"
                disabled={
                  editLoading
                }
              >
                {editLoading
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ANIMATION
      ======================================================== */}

      <style>
        {`
          @keyframes profileSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 700px) {
            .profile-header {
              padding: 20px !important;
            }

            .profile-header > div:last-child {
              width: 100%;
            }
          }

          @media (max-width: 600px) {
            .profile-header {
              gap: 16px !important;
            }

            .profile-header > div:last-child {
              display: grid !important;
              grid-template-columns: 1fr !important;
              width: 100% !important;
            }

            .profile-header > div:last-child button,
            .profile-header > div:last-child a {
              width: 100%;
              box-sizing: border-box;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Profile;