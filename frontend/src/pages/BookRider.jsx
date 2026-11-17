// frontend/src/pages/BookRider.jsx

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaMotorcycle,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaBox,
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

import { createDelivery } from "../services/deliveryService";

const BookRider = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================================
  // PRODUCT PASSED FROM PRODUCT PAGE
  // ==========================================================

  const productFromPage =
    location.state?.product || null;

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [form, setForm] = useState({
    product: productFromPage?._id || productFromPage?.id || "",
    productTitle: productFromPage?.title || "",

    pickupLocation: "",
    pickupContactName: "",
    pickupPhone: "",

    deliveryLocation: "",
    deliveryContactName: "",
    deliveryPhone: "",

    notes: "",
    deliveryFee: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (
      !form.pickupLocation.trim()
    ) {
      setError(
        "Please enter the pickup location."
      );

      setLoading(false);
      return;
    }

    if (
      !form.deliveryLocation.trim()
    ) {
      setError(
        "Please enter the delivery location."
      );

      setLoading(false);
      return;
    }

    if (
      !form.pickupPhone.trim() &&
      !form.deliveryPhone.trim()
    ) {
      setError(
        "Please provide at least one contact phone number."
      );

      setLoading(false);
      return;
    }

    // --------------------------------------------------------
    // CREATE REQUEST
    // --------------------------------------------------------

    try {
      const response =
        await createDelivery({
          product:
            form.product || null,

          productTitle:
            form.productTitle.trim(),

          pickupLocation:
            form.pickupLocation.trim(),

          pickupContactName:
            form.pickupContactName.trim(),

          pickupPhone:
            form.pickupPhone.trim(),

          deliveryLocation:
            form.deliveryLocation.trim(),

          deliveryContactName:
            form.deliveryContactName.trim(),

          deliveryPhone:
            form.deliveryPhone.trim(),

          notes:
            form.notes.trim(),

          deliveryFee:
            form.deliveryFee
              ? Number(form.deliveryFee)
              : 0,
        });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to create delivery request."
        );
      }

      setSuccess(
        "Your rider request has been created successfully."
      );

      // ------------------------------------------------------
      // REDIRECT AFTER SHORT DELAY
      // ------------------------------------------------------

      setTimeout(() => {
        navigate("/profile");
      }, 1800);
    } catch (err) {
      console.error(
        "❌ Book rider error:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          "Please log in before booking a rider."
        );

        setTimeout(() => {
          navigate("/login", {
            state: {
              from: "/book-rider",
            },
          });
        }, 1200);

        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to book a rider. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INPUT STYLE – liquid glass
  // ==========================================================

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "12px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    color: "#111827",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.38) 100%)",
    backdropFilter: "blur(10px) saturate(180%)",
    WebkitBackdropFilter: "blur(10px) saturate(180%)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 10px rgba(31,38,135,0.06)",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "7px",
    color: "#111827",
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="liquid-rider-page"
      style={{
        minHeight: "100vh",
        padding:
          "30px 16px 60px",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
        }}
      >
        {/* ==================================================
            BACK
        ================================================== */}

        <Link
          to="/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "20px",
            color: "#374151",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          <FaArrowLeft />
          Back to Marketplace
        </Link>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="liquid-rider-panel"
          style={{
            padding:
              "28px 24px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(199,210,254,0.85) 0%, rgba(165,180,252,0.65) 100%)",
              backdropFilter: "blur(8px) saturate(180%)",
              WebkitBackdropFilter: "blur(8px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.75)",
              color: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "23px",
              marginBottom: "14px",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 14px rgba(79,70,229,0.15)",
            }}
          >
            <FaMotorcycle />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 800,
              color: "#111827",
            }}
          >
            Book a Bike Rider
          </h1>

          <p
            style={{
              margin:
                "8px 0 0",
              color: "#6b7280",
              lineHeight: 1.6,
              fontSize: "14px",
            }}
          >
            Connect with a rider to pick up
            and deliver your item safely.
          </p>
        </div>

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(220,252,231,0.7) 100%)",
              backdropFilter: "blur(12px) saturate(180%)",
              WebkitBackdropFilter: "blur(12px) saturate(180%)",
              color: "#166534",
              border:
                "1px solid rgba(187,247,208,0.75)",
              padding: "14px 16px",
              borderRadius: "14px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 18px rgba(22,101,52,0.10)",
            }}
          >
            <FaCheckCircle />
            {success}
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            role="alert"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(254,226,226,0.6) 100%)",
              backdropFilter: "blur(12px) saturate(180%)",
              WebkitBackdropFilter: "blur(12px) saturate(180%)",
              color: "#991b1b",
              border:
                "1px solid rgba(252,165,165,0.55)",
              padding: "14px 16px",
              borderRadius: "14px",
              marginBottom: "18px",
              fontSize: "14px",
              lineHeight: 1.5,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 18px rgba(220,38,38,0.08)",
            }}
          >
            {error}
          </div>
        )}

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="liquid-rider-panel"
          style={{
            padding:
              "28px 24px",
          }}
        >
          {/* ==================================================
              ITEM
          ================================================== */}

          <section
            style={{
              marginBottom: "28px",
            }}
          >
            <h2
              style={{
                fontSize: "17px",
                margin:
                  "0 0 16px",
                fontWeight: 800,
              }}
            >
              <FaBox
                style={{
                  marginRight: "8px",
                }}
              />
              Item
            </h2>

            <label
              style={labelStyle}
              htmlFor="productTitle"
            >
              Item / Product
            </label>

            <input
              id="productTitle"
              name="productTitle"
              value={
                form.productTitle
              }
              onChange={
                handleChange
              }
              placeholder="e.g. iPhone 15 Pro Max"
              disabled={loading}
              style={inputStyle}
            />

            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginTop: "7px",
              }}
            >
              You can enter what the rider
              is picking up if this request
              is not linked to a product listing.
            </p>
          </section>

          {/* ==================================================
              PICKUP
          ================================================== */}

          <section
            style={{
              marginBottom: "28px",
            }}
          >
            <h2
              style={{
                fontSize: "17px",
                margin:
                  "0 0 16px",
                fontWeight: 800,
              }}
            >
              <FaMapMarkerAlt
                style={{
                  marginRight: "8px",
                }}
              />
              Pickup
            </h2>

            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <label
                style={labelStyle}
                htmlFor="pickupLocation"
              >
                Pickup Location *
              </label>

              <input
                id="pickupLocation"
                name="pickupLocation"
                value={
                  form.pickupLocation
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Circle, Accra"
                required
                disabled={loading}
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label
                  style={labelStyle}
                  htmlFor="pickupContactName"
                >
                  Contact Name
                </label>

                <input
                  id="pickupContactName"
                  name="pickupContactName"
                  value={
                    form.pickupContactName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Name"
                  disabled={loading}
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={labelStyle}
                  htmlFor="pickupPhone"
                >
                  <FaPhone
                    style={{
                      marginRight:
                        "5px",
                    }}
                  />
                  Phone
                </label>

                <input
                  id="pickupPhone"
                  name="pickupPhone"
                  type="tel"
                  value={
                    form.pickupPhone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="024..."
                  disabled={loading}
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          {/* ==================================================
              DELIVERY
          ================================================== */}

          <section
            style={{
              marginBottom: "28px",
            }}
          >
            <h2
              style={{
                fontSize: "17px",
                margin:
                  "0 0 16px",
                fontWeight: 800,
              }}
            >
              <FaMapMarkerAlt
                style={{
                  marginRight: "8px",
                }}
              />
              Delivery
            </h2>

            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <label
                style={labelStyle}
                htmlFor="deliveryLocation"
              >
                Delivery Location *
              </label>

              <input
                id="deliveryLocation"
                name="deliveryLocation"
                value={
                  form.deliveryLocation
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. East Legon, Accra"
                required
                disabled={loading}
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label
                  style={labelStyle}
                  htmlFor="deliveryContactName"
                >
                  <FaUser
                    style={{
                      marginRight:
                        "5px",
                    }}
                  />
                  Recipient Name
                </label>

                <input
                  id="deliveryContactName"
                  name="deliveryContactName"
                  value={
                    form.deliveryContactName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Name"
                  disabled={loading}
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={labelStyle}
                  htmlFor="deliveryPhone"
                >
                  <FaPhone
                    style={{
                      marginRight:
                        "5px",
                    }}
                  />
                  Phone
                </label>

                <input
                  id="deliveryPhone"
                  name="deliveryPhone"
                  type="tel"
                  value={
                    form.deliveryPhone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="024..."
                  disabled={loading}
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          {/* ==================================================
              FEE
          ================================================== */}

          <section
            style={{
              marginBottom: "28px",
            }}
          >
            <label
              style={labelStyle}
              htmlFor="deliveryFee"
            >
              Delivery Fee (GHS)
            </label>

            <input
              id="deliveryFee"
              name="deliveryFee"
              type="number"
              min="0"
              step="0.01"
              value={
                form.deliveryFee
              }
              onChange={
                handleChange
              }
              placeholder="Optional"
              disabled={loading}
              style={inputStyle}
            />

            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginTop: "7px",
              }}
            >
              Leave blank if the delivery
              fee has not yet been agreed.
            </p>
          </section>

          {/* ==================================================
              NOTES
          ================================================== */}

          <section
            style={{
              marginBottom: "28px",
            }}
          >
            <label
              style={labelStyle}
              htmlFor="notes"
            >
              Additional Instructions
            </label>

            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={
                handleChange
              }
              placeholder="Any instructions for the rider..."
              rows={4}
              maxLength={1000}
              disabled={loading}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
          </section>

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <button
            type="submit"
            disabled={loading}
            className={loading ? "liquid-rider-btn liquid-rider-btn-disabled" : "liquid-rider-btn"}
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "16px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {loading ? (
              <>
                <FaSpinner
                  style={{
                    animation:
                      "spin 1s linear infinite",
                  }}
                />
                Booking Rider...
              </>
            ) : (
              <>
                <FaMotorcycle />
                BOOK A BIKE RIDER
              </>
            )}
          </button>

          <p
            style={{
              textAlign: "center",
              color: "#6b7280",
              fontSize: "12px",
              lineHeight: 1.5,
              marginTop: "14px",
              marginBottom: 0,
            }}
          >
            Your request will be made available
            to approved riders who are online.
          </p>
        </form>
      </div>

      {/* ======================================================
          LIQUID iOS27 + SPINNER STYLES
      ====================================================== */}

      <style>
        {`
          /* ─── Spinner ─────────────────────────────────── */
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }

          /* ─── Page — liquid mirror background ────────── */
          @keyframes liquid-rider-float {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
            33%      { transform: translate3d(-30px, 24px, 0) scale(1.06); }
            66%      { transform: translate3d(24px, -20px, 0) scale(0.97); }
          }

          .liquid-rider-page {
            position: relative;
            isolation: isolate;
            overflow: hidden;
            border-radius: 20px;
            background: linear-gradient(
              135deg,
              #eef4ff 0%,
              #f5f0ff 40%,
              #eaf7ff 70%,
              #f2f8ff 100%
            );
          }

          .liquid-rider-page::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background:
              radial-gradient(circle at 8% 15%, rgba(0,102,204,0.22) 0%, rgba(0,102,204,0.08) 25%, transparent 55%),
              radial-gradient(circle at 92% 60%, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 25%, transparent 55%),
              radial-gradient(circle at 50% 115%, rgba(6,182,212,0.18) 0%, rgba(6,182,212,0.06) 25%, transparent 55%),
              radial-gradient(circle at 30% 80%, rgba(59,130,246,0.12) 0%, transparent 50%);
            animation: liquid-rider-float 24s ease-in-out infinite;
            will-change: transform;
          }

          /* ─── Panels — liquid glass ──────────────────── */
          .liquid-rider-panel {
            background: linear-gradient(
              135deg,
              rgba(255,255,255,0.72) 0%,
              rgba(238,246,255,0.42) 50%,
              rgba(255,255,255,0.62) 100%
            );
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.75);
            border-radius: 18px;
            box-shadow:
              0 8px 28px rgba(31,38,135,0.10),
              inset 0 1px 0 rgba(255,255,255,0.95),
              inset 0 -1px 0 rgba(255,255,255,0.25);
          }

          /* ─── Inputs — liquid glass focus ───────────── */
          .liquid-rider-panel input:focus,
          .liquid-rider-panel textarea:focus {
            border-color: rgba(0,102,204,0.6) !important;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,1),
              0 0 0 3px rgba(0,102,204,0.14),
              0 4px 14px rgba(31,38,135,0.10) !important;
          }

          /* ─── Submit button — liquid blue glass ─────── */
          .liquid-rider-btn {
            position: relative;
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 14px;
            cursor: pointer;
            color: #ffffff;
            background: linear-gradient(
              135deg,
              rgba(0,102,204,0.94) 0%,
              rgba(0,85,165,0.88) 100%
            );
            backdrop-filter: blur(14px) saturate(180%);
            -webkit-backdrop-filter: blur(14px) saturate(180%);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.35),
              0 4px 14px rgba(0,102,204,0.30);
            transition:
              transform 0.15s ease,
              box-shadow 0.15s ease;
          }
          .liquid-rider-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.45),
              0 8px 24px rgba(0,102,204,0.42);
          }
          .liquid-rider-btn:active:not(:disabled) {
            transform: translateY(0) scale(0.98);
          }

          /* ─── Disabled state — liquid gray glass ────── */
          .liquid-rider-btn-disabled,
          .liquid-rider-btn:disabled {
            cursor: not-allowed;
            background: linear-gradient(
              135deg,
              rgba(156,163,175,0.85) 0%,
              rgba(107,114,128,0.75) 100%
            );
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.3),
              0 2px 10px rgba(0,0,0,0.08);
          }

          /* ─── Mobile — stack two-column grids ───────── */
          @media (max-width: 600px) {
            form section div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
            }
          }

          /* ─── Reduced motion ────────────────────────── */
          @media (prefers-reduced-motion: reduce) {
            .liquid-rider-page::before { animation: none !important; }
            .liquid-rider-btn { transition: none !important; }
            .liquid-rider-btn:hover:not(:disabled) { transform: none !important; }
          }
        `}
      </style>
    </div>
  );
};

export default BookRider;