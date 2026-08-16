import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

console.log("🔗 Delivery API_URL:", API_URL);

// ============================================================
// DELIVERY BOOKING
// ============================================================

const DeliveryBooking = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    pickupLocation: "",
    pickupAddress: "",
    dropoffLocation: "",
    dropoffAddress: "",
    recipientName: "",
    recipientPhone: "",
    packageDescription: "",
    deliveryNotes: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD CURRENT USER
  // ==========================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken");

        if (!token) {
          setError(
            "Please log in before booking a rider."
          );
          setLoadingUser(false);
          return;
        }

        const response = await axios.get(
          `${API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const currentUser =
          response.data?.user;

        if (!currentUser) {
          throw new Error(
            "Unable to load your account."
          );
        }

        setUser(currentUser);

        setForm((previous) => ({
          ...previous,
          recipientName:
            currentUser.name || "",
          recipientPhone:
            currentUser.phone || "",
        }));
      } catch (err) {
        console.error(
          "❌ Load user error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Please log in to book a rider."
        );
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // SUBMIT BOOKING
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (!user) {
      setError(
        "Please log in before booking a rider."
      );
      return;
    }

    if (
      !form.pickupLocation.trim() ||
      !form.pickupAddress.trim() ||
      !form.dropoffLocation.trim() ||
      !form.dropoffAddress.trim() ||
      !form.recipientName.trim() ||
      !form.recipientPhone.trim() ||
      !form.packageDescription.trim()
    ) {
      setError(
        "Please complete all required fields."
      );
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/deliveries`,
        {
          pickupLocation:
            form.pickupLocation.trim(),

          pickupAddress:
            form.pickupAddress.trim(),

          dropoffLocation:
            form.dropoffLocation.trim(),

          dropoffAddress:
            form.dropoffAddress.trim(),

          recipientName:
            form.recipientName.trim(),

          recipientPhone:
            form.recipientPhone.trim(),

          packageDescription:
            form.packageDescription.trim(),

          deliveryNotes:
            form.deliveryNotes.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          timeout: 60000,
        }
      );

      console.log(
        "✅ Delivery booking:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Your rider request has been created successfully."
      );

      setForm((previous) => ({
        ...previous,
        pickupLocation: "",
        pickupAddress: "",
        dropoffLocation: "",
        dropoffAddress: "",
        packageDescription: "",
        deliveryNotes: "",
      }));
    } catch (err) {
      console.error(
        "❌ Delivery booking error:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          "Your session has expired. Please log in again."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to book a rider. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loadingUser) {
    return (
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        Loading your account...
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "40px 20px 80px",
      }}
    >
      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "var(--primary)",
            fontWeight: 700,
          }}
        >
          ← Back
        </Link>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "18px",
          padding: "30px",
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "45px",
              marginBottom: "10px",
            }}
          >
            🏍️
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 800,
            }}
          >
            Book a Bike Rider
          </h1>

          <p
            style={{
              color: "var(--gray-500)",
              marginTop: "8px",
              lineHeight: 1.6,
            }}
          >
            Connect with an available rider to
            pick up and deliver your item.
          </p>
        </div>

        {success && (
          <div
            style={{
              background: "#dcfce7",
              color: "#166534",
              padding: "14px",
              borderRadius: "10px",
              marginBottom: "20px",
              lineHeight: 1.5,
            }}
          >
            {success}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "14px",
              borderRadius: "10px",
              marginBottom: "20px",
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {!user ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
            }}
          >
            <p>
              You must be logged in to book a
              rider.
            </p>

            <Link
              to="/login"
              className="btn-primary"
              style={{
                display: "inline-block",
                padding: "12px 25px",
                borderRadius: "50px",
                textDecoration: "none",
              }}
            >
              Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* PICKUP */}

            <h3
              style={{
                marginBottom: "15px",
              }}
            >
              📍 Pickup Details
            </h3>

            <div
              style={{
                display: "grid",
                gap: "15px",
              }}
            >
              <input
                name="pickupLocation"
                value={
                  form.pickupLocation
                }
                onChange={handleChange}
                placeholder="Pickup location"
                required
                disabled={loading}
                style={inputStyle}
              />

              <textarea
                name="pickupAddress"
                value={
                  form.pickupAddress
                }
                onChange={handleChange}
                placeholder="Full pickup address"
                rows="3"
                required
                disabled={loading}
                style={inputStyle}
              />
            </div>

            {/* DELIVERY */}

            <h3
              style={{
                marginTop: "28px",
                marginBottom: "15px",
              }}
            >
              🏠 Delivery Details
            </h3>

            <div
              style={{
                display: "grid",
                gap: "15px",
              }}
            >
              <input
                name="dropoffLocation"
                value={
                  form.dropoffLocation
                }
                onChange={handleChange}
                placeholder="Drop-off location"
                required
                disabled={loading}
                style={inputStyle}
              />

              <textarea
                name="dropoffAddress"
                value={
                  form.dropoffAddress
                }
                onChange={handleChange}
                placeholder="Full delivery address"
                rows="3"
                required
                disabled={loading}
                style={inputStyle}
              />
            </div>

            {/* RECIPIENT */}

            <h3
              style={{
                marginTop: "28px",
                marginBottom: "15px",
              }}
            >
              👤 Recipient
            </h3>

            <div
              style={{
                display: "grid",
                gap: "15px",
              }}
            >
              <input
                name="recipientName"
                value={
                  form.recipientName
                }
                onChange={handleChange}
                placeholder="Recipient name"
                required
                disabled={loading}
                style={inputStyle}
              />

              <input
                name="recipientPhone"
                value={
                  form.recipientPhone
                }
                onChange={handleChange}
                placeholder="Recipient phone number"
                required
                disabled={loading}
                style={inputStyle}
              />
            </div>

            {/* PACKAGE */}

            <h3
              style={{
                marginTop: "28px",
                marginBottom: "15px",
              }}
            >
              📦 Package
            </h3>

            <div
              style={{
                display: "grid",
                gap: "15px",
              }}
            >
              <textarea
                name="packageDescription"
                value={
                  form.packageDescription
                }
                onChange={handleChange}
                placeholder="What is being delivered? Example: iPhone 15 Pro Max"
                rows="3"
                required
                disabled={loading}
                style={inputStyle}
              />

              <textarea
                name="deliveryNotes"
                value={
                  form.deliveryNotes
                }
                onChange={handleChange}
                placeholder="Additional delivery instructions (optional)"
                rows="3"
                disabled={loading}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "28px",
                padding: "15px",
                border: "none",
                borderRadius: "50px",
                background:
                  "var(--primary)",
                color: "white",
                fontSize: "16px",
                fontWeight: 800,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                opacity: loading
                  ? 0.7
                  : 1,
              }}
            >
              {loading
                ? "Booking Rider..."
                : "🏍️ BOOK A BIKE RIDER"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ============================================================
// INPUT STYLE
// ============================================================

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 15px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  background: "white",
};

export default DeliveryBooking;