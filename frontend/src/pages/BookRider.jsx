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
  // INPUT STYLE
  // ==========================================================

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border:
      "1px solid var(--gray-200, #e5e7eb)",
    borderRadius:
      "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    background: "#fff",
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
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
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
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding:
              "28px 24px",
            marginBottom: "18px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: "#eef2ff",
              color: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "23px",
              marginBottom: "14px",
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
              background: "#dcfce7",
              color: "#166534",
              border:
                "1px solid #bbf7d0",
              padding: "14px 16px",
              borderRadius: "12px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              fontWeight: 600,
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
              background: "#fee2e2",
              color: "#991b1b",
              border:
                "1px solid #fecaca",
              padding: "14px 16px",
              borderRadius: "12px",
              marginBottom: "18px",
              fontSize: "14px",
              lineHeight: 1.5,
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
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding:
              "28px 24px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.05)",
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
            style={{
              width: "100%",
              border: "none",
              borderRadius: "12px",
              padding: "15px",
              background:
                loading
                  ? "#9ca3af"
                  : "#111827",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 800,
              cursor: loading
                ? "not-allowed"
                : "pointer",
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
          SPINNER ANIMATION
      ====================================================== */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 600px) {
            form section div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default BookRider;