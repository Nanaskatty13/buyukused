import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

// ============================================================
// API
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

// ============================================================
// STATUS LABEL
// ============================================================

const statusLabel = {
  requested: "Available",
  accepted: "Accepted",
  rider_arriving: "Arriving",
  picked_up: "Picked Up",
  on_the_way: "On The Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// ============================================================
// STATUS COLORS
// ============================================================

const statusColor = {
  requested: "#2563eb",
  accepted: "#7c3aed",
  rider_arriving: "#d97706",
  picked_up: "#0891b2",
  on_the_way: "#ea580c",
  delivered: "#16a34a",
  cancelled: "#dc2626",
};

// ============================================================
// RIDER DASHBOARD
// ============================================================

const RiderDashboard = () => {
  const [available, setAvailable] =
    useState([]);

  const [myDeliveries, setMyDeliveries] =
    useState([]);

  const [rider, setRider] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = () => {
    return (
      localStorage.getItem(
        "token"
      ) ||
      localStorage.getItem(
        "authToken"
      ) ||
      localStorage.getItem(
        "accessToken"
      )
    );
  };

  // ==========================================================
  // AXIOS
  // ==========================================================

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type":
        "application/json",
    },
  });

  api.interceptors.request.use(
    (config) => {
      const token =
        getToken();

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

      return config;
    }
  );

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadDashboard =
    async () => {
      try {
        setError("");

        const [
          availableResponse,
          myResponse,
        ] = await Promise.all([
          api.get(
            "/api/deliveries/available"
          ),

          api.get(
            "/api/deliveries/my"
          ),
        ]);

        setAvailable(
          availableResponse.data
            ?.deliveries || []
        );

        setMyDeliveries(
          myResponse.data
            ?.deliveries || []
        );

        // Get rider info from localStorage
        const savedUser =
          localStorage.getItem(
            "user"
          );

        if (savedUser) {
          try {
            setRider(
              JSON.parse(
                savedUser
              )
            );
          } catch {
            // Ignore malformed local user
          }
        }
      } catch (err) {
        console.error(
          "❌ Rider dashboard error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to load rider dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadDashboard();

    const interval =
      setInterval(
        loadDashboard,
        10000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  // ==========================================================
  // ACCEPT DELIVERY
  // ==========================================================

  const acceptDelivery =
    async (deliveryId) => {
      try {
        setActionLoading(
          deliveryId
        );

        setError("");
        setMessage("");

        const response =
          await api.patch(
            `/api/deliveries/${deliveryId}/accept`
          );

        setMessage(
          response.data
            ?.message ||
            "Delivery accepted."
        );

        await loadDashboard();
      } catch (err) {
        console.error(
          "❌ Accept delivery:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to accept this delivery."
        );
      } finally {
        setActionLoading("");
      }
    };

  // ==========================================================
  // UPDATE STATUS
  // ==========================================================

  const updateStatus =
    async (
      deliveryId,
      status
    ) => {
      try {
        setActionLoading(
          deliveryId
        );

        setError("");
        setMessage("");

        const response =
          await api.patch(
            `/api/deliveries/${deliveryId}/status`,
            {
              status,
            }
          );

        setMessage(
          response.data
            ?.message ||
            "Delivery updated."
        );

        await loadDashboard();
      } catch (err) {
        console.error(
          "❌ Update status:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to update delivery."
        );
      } finally {
        setActionLoading("");
      }
    };

  // ==========================================================
  // AVAILABILITY
  // ==========================================================

  const updateAvailability =
    async (status) => {
      try {
        setActionLoading(
          "availability"
        );

        setError("");
        setMessage("");

        const response =
          await api.patch(
            "/api/deliveries/rider/availability",
            {
              status,
            }
          );

        setMessage(
          response.data
            ?.message ||
            "Availability updated."
        );

        if (
          response.data?.rider
        ) {
          setRider(
            response.data.rider
          );

          localStorage.setItem(
            "user",
            JSON.stringify(
              response.data.rider
            )
          );
        }
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to update availability."
        );
      } finally {
        setActionLoading("");
      }
    };

  // ==========================================================
  // ACTIVE DELIVERY
  // ==========================================================

  const activeDelivery =
    myDeliveries.find(
      (delivery) =>
        [
          "accepted",
          "rider_arriving",
          "picked_up",
          "on_the_way",
        ].includes(
          delivery.status
        )
    );

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: 40,
          textAlign: "center",
        }}
      >
        Loading rider dashboard...
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "30px 20px 60px",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 30,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            Rider Dashboard
          </h1>

          <p
            style={{
              marginTop: 7,
              color: "#6b7280",
            }}
          >
            Welcome{" "}
            {rider?.name ||
              "Rider"}
          </p>
        </div>

        {/* ====================================================
            AVAILABILITY
        ==================================================== */}

        <div
          style={{
            background:
              "#f8fafc",
            padding: 15,
            borderRadius: 14,
            border:
              "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 8,
              color: "#6b7280",
            }}
          >
            RIDER STATUS
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <button
              onClick={() =>
                updateAvailability(
                  "available"
                )
              }
              disabled={
                actionLoading ===
                "availability"
              }
              style={{
                border: "none",
                borderRadius: 8,
                padding:
                  "9px 14px",
                background:
                  "#16a34a",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🟢 Available
            </button>

            <button
              onClick={() =>
                updateAvailability(
                  "offline"
                )
              }
              disabled={
                actionLoading ===
                "availability"
              }
              style={{
                border:
                  "1px solid #d1d5db",
                borderRadius: 8,
                padding:
                  "9px 14px",
                background:
                  "white",
                color: "#374151",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {error && (
        <div
          style={{
            background:
              "#fee2e2",
            color: "#991b1b",
            padding: 14,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            background:
              "#dcfce7",
            color: "#166534",
            padding: 14,
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          {message}
        </div>
      )}

      {/* ======================================================
          ACTIVE DELIVERY
      ====================================================== */}

      {activeDelivery && (
        <section
          style={{
            marginBottom: 35,
          }}
        >
          <h2
            style={{
              fontSize: 21,
              marginBottom: 15,
            }}
          >
            🚴 Active Delivery
          </h2>

          <div
            style={{
              background:
                "white",
              border:
                "2px solid #111827",
              borderRadius: 18,
              padding: 22,
              boxShadow:
                "0 8px 30px rgba(0,0,0,.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: 20,
                flexWrap:
                  "wrap",
              }}
            >
              <div>
                <strong>
                  Customer
                </strong>

                <div
                  style={{
                    marginTop: 5,
                  }}
                >
                  {
                    activeDelivery.customerName
                  }
                </div>

                <div
                  style={{
                    marginTop: 5,
                  }}
                >
                  📞{" "}
                  <a
                    href={`tel:${activeDelivery.customerPhone}`}
                  >
                    {
                      activeDelivery.customerPhone
                    }
                  </a>
                </div>
              </div>

              <div>
                <span
                  style={{
                    display:
                      "inline-block",
                    padding:
                      "7px 12px",
                    borderRadius:
                      20,
                    background:
                      statusColor[
                        activeDelivery
                          .status
                      ] ||
                      "#6b7280",
                    color:
                      "white",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  {
                    statusLabel[
                      activeDelivery
                        .status
                    ]
                  }
                </span>
              </div>
            </div>

            <hr
              style={{
                margin:
                  "20px 0",
                border: 0,
                borderTop:
                  "1px solid #e5e7eb",
              }}
            />

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(240px,1fr))",
                gap: 18,
              }}
            >
              <div>
                <small
                  style={{
                    color:
                      "#6b7280",
                  }}
                >
                  PICKUP
                </small>

                <div
                  style={{
                    marginTop: 5,
                    fontWeight: 700,
                  }}
                >
                  📍{" "}
                  {
                    activeDelivery
                      .pickup
                      ?.address
                  }
                </div>
              </div>

              <div>
                <small
                  style={{
                    color:
                      "#6b7280",
                  }}
                >
                  DESTINATION
                </small>

                <div
                  style={{
                    marginTop: 5,
                    fontWeight: 700,
                  }}
                >
                  🏁{" "}
                  {
                    activeDelivery
                      .destination
                      ?.address
                  }
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                background:
                  "#f8fafc",
                padding: 14,
                borderRadius: 10,
              }}
            >
              <strong>
                📦 Item:
              </strong>{" "}
              {
                activeDelivery.itemDescription
              }
            </div>

            <div
              style={{
                marginTop: 18,
                display:
                  "flex",
                gap: 10,
                flexWrap:
                  "wrap",
              }}
            >
              {activeDelivery.status ===
                "accepted" && (
                <button
                  onClick={() =>
                    updateStatus(
                      activeDelivery._id,
                      "rider_arriving"
                    )
                  }
                  disabled={
                    !!actionLoading
                  }
                  style={{
                    padding:
                      "12px 18px",
                    border: "none",
                    borderRadius: 10,
                    background:
                      "#d97706",
                    color:
                      "white",
                    fontWeight: 700,
                    cursor:
                      "pointer",
                  }}
                >
                  🚴 I'm Arriving
                </button>
              )}

              {activeDelivery.status ===
                "rider_arriving" && (
                <button
                  onClick={() =>
                    updateStatus(
                      activeDelivery._id,
                      "picked_up"
                    )
                  }
                  disabled={
                    !!actionLoading
                  }
                  style={{
                    padding:
                      "12px 18px",
                    border: "none",
                    borderRadius: 10,
                    background:
                      "#0891b2",
                    color:
                      "white",
                    fontWeight: 700,
                    cursor:
                      "pointer",
                  }}
                >
                  📦 Picked Up
                </button>
              )}

              {activeDelivery.status ===
                "picked_up" && (
                <button
                  onClick={() =>
                    updateStatus(
                      activeDelivery._id,
                      "on_the_way"
                    )
                  }
                  disabled={
                    !!actionLoading
                  }
                  style={{
                    padding:
                      "12px 18px",
                    border: "none",
                    borderRadius: 10,
                    background:
                      "#ea580c",
                    color:
                      "white",
                    fontWeight: 700,
                    cursor:
                      "pointer",
                  }}
                >
                  🛵 On The Way
                </button>
              )}

              {activeDelivery.status ===
                "on_the_way" && (
                <button
                  onClick={() =>
                    updateStatus(
                      activeDelivery._id,
                      "delivered"
                    )
                  }
                  disabled={
                    !!actionLoading
                  }
                  style={{
                    padding:
                      "12px 18px",
                    border: "none",
                    borderRadius: 10,
                    background:
                      "#16a34a",
                    color:
                      "white",
                    fontWeight: 700,
                    cursor:
                      "pointer",
                  }}
                >
                  ✅ Delivered
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          AVAILABLE DELIVERIES
      ====================================================== */}

      <section>
        <h2
          style={{
            fontSize: 21,
            marginBottom: 15,
          }}
        >
          📦 Available Delivery Requests
        </h2>

        {available.length ===
        0 ? (
          <div
            style={{
              background:
                "#f8fafc",
              border:
                "1px solid #e5e7eb",
              borderRadius: 15,
              padding: 30,
              textAlign:
                "center",
              color:
                "#6b7280",
            }}
          >
            No delivery requests
            available right now.
          </div>
        ) : (
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap: 18,
            }}
          >
            {available.map(
              (delivery) => (
                <div
                  key={
                    delivery._id
                  }
                  style={{
                    background:
                      "white",
                    border:
                      "1px solid #e5e7eb",
                    borderRadius:
                      16,
                    padding: 20,
                    boxShadow:
                      "0 5px 20px rgba(0,0,0,.05)",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap: 10,
                    }}
                  >
                    <strong>
                      📦 Delivery
                    </strong>

                    <strong>
                      GH₵{" "}
                      {Number(
                        delivery.deliveryFee ||
                          0
                      ).toFixed(
                        2
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      marginTop: 18,
                    }}
                  >
                    <div>
                      <small
                        style={{
                          color:
                            "#6b7280",
                        }}
                      >
                        PICKUP
                      </small>

                      <div
                        style={{
                          marginTop: 4,
                          fontWeight: 700,
                        }}
                      >
                        📍{" "}
                        {
                          delivery
                            .pickup
                            ?.address
                        }
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                      }}
                    >
                      <small
                        style={{
                          color:
                            "#6b7280",
                        }}
                      >
                        DESTINATION
                      </small>

                      <div
                        style={{
                          marginTop: 4,
                          fontWeight: 700,
                        }}
                      >
                        🏁{" "}
                        {
                          delivery
                            .destination
                            ?.address
                        }
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 15,
                      padding: 12,
                      background:
                        "#f8fafc",
                      borderRadius:
                        9,
                    }}
                  >
                    {
                      delivery.itemDescription
                    }
                  </div>

                  <button
                    onClick={() =>
                      acceptDelivery(
                        delivery._id
                      )
                    }
                    disabled={
                      !!actionLoading ||
                      !!activeDelivery
                    }
                    style={{
                      width:
                        "100%",
                      marginTop:
                        18,
                      padding:
                        "13px",
                      border:
                        "none",
                      borderRadius:
                        10,
                      background:
                        activeDelivery
                          ? "#9ca3af"
                          : "#111827",
                      color:
                        "white",
                      fontWeight:
                        800,
                      cursor:
                        activeDelivery
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {actionLoading ===
                    delivery._id
                      ? "Accepting..."
                      : "ACCEPT DELIVERY"}
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* ======================================================
          DELIVERY HISTORY
      ====================================================== */}

      <section
        style={{
          marginTop: 40,
        }}
      >
        <h2
          style={{
            fontSize: 21,
            marginBottom: 15,
          }}
        >
          📋 Delivery History
        </h2>

        {myDeliveries.length ===
        0 ? (
          <p
            style={{
              color:
                "#6b7280",
            }}
          >
            You haven't completed
            any deliveries yet.
          </p>
        ) : (
          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap: 10,
            }}
          >
            {myDeliveries.map(
              (delivery) => (
                <div
                  key={
                    delivery._id
                  }
                  style={{
                    padding: 16,
                    border:
                      "1px solid #e5e7eb",
                    borderRadius:
                      12,
                    background:
                      "white",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap: 15,
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <div>
                      <strong>
                        {
                          delivery.itemDescription
                        }
                      </strong>

                      <div
                        style={{
                          color:
                            "#6b7280",
                          marginTop: 5,
                          fontSize:
                            13,
                        }}
                      >
                        {
                          delivery
                            .pickup
                            ?.address
                        }{" "}
                        →{" "}
                        {
                          delivery
                            .destination
                            ?.address
                        }
                      </div>
                    </div>

                    <span
                      style={{
                        color:
                          statusColor[
                            delivery
                              .status
                          ],
                        fontWeight:
                          800,
                      }}
                    >
                      {
                        statusLabel[
                          delivery
                            .status
                        ]
                      }
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default RiderDashboard;