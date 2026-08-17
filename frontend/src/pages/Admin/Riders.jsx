// frontend/src/pages/Admin/Riders.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdminRiders,
  getAdminRiderStats,
  approveRider,
  rejectRider,
  activateRider,
  deactivateRider,
} from "../../services/api";

import { useAuth } from "../../context/AuthContext";

// ============================================================
// RIDERS PAGE
// ============================================================

const Riders = ({
  loading: parentLoading = false,
  showNotification,
}) => {
  const { token } = useAuth();

  const [riders, setRiders] =
    useState([]);

  const [stats, setStats] =
    useState({
      total: 0,
      approved: 0,
      pending: 0,
      available: 0,
      inactive: 0,
      totalDeliveries: 0,
      completedDeliveries: 0,
      activeDeliveries: 0,
      cancelledDeliveries: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");

  const [selectedRider, setSelectedRider] =
    useState(null);

  const [actionLoading, setActionLoading] =
    useState(null);

  // ==========================================================
  // LOAD RIDERS
  // ==========================================================

  const loadRiders = useCallback(
    async () => {
      try {
        setLoading(true);

        const [
          ridersResponse,
          statsResponse,
        ] = await Promise.all([
          getAdminRiders(
            {
              status,
              search,
            },
            token
          ),

          getAdminRiderStats(
            token
          ),
        ]);

        setRiders(
          ridersResponse?.riders ||
            []
        );

        setStats(
          statsResponse?.stats ||
            {}
        );
      } catch (error) {
        console.error(
          "Failed to load riders:",
          error
        );

        showNotification?.(
          error.message ||
            "Failed to load riders",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [
      token,
      status,
      search,
      showNotification,
    ]
  );

  useEffect(() => {
    loadRiders();
  }, [loadRiders]);

  // ==========================================================
  // APPROVE
  // ==========================================================

  const handleApprove = async (
    rider
  ) => {
    try {
      setActionLoading(
        rider._id
      );

      await approveRider(
        rider._id,
        token
      );

      showNotification?.(
        `${rider.name} has been approved as a rider.`,
        "success"
      );

      await loadRiders();
    } catch (error) {
      showNotification?.(
        error.message ||
          "Failed to approve rider",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================================
  // REJECT
  // ==========================================================

  const handleReject = async (
    rider
  ) => {
    const confirmed =
      window.confirm(
        `Remove rider approval from ${rider.name}?`
      );

    if (!confirmed) return;

    try {
      setActionLoading(
        rider._id
      );

      await rejectRider(
        rider._id,
        token
      );

      showNotification?.(
        `${rider.name} is no longer approved.`,
        "success"
      );

      await loadRiders();
    } catch (error) {
      showNotification?.(
        error.message ||
          "Failed to reject rider",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================================
  // ACTIVATE
  // ==========================================================

  const handleActivate = async (
    rider
  ) => {
    try {
      setActionLoading(
        rider._id
      );

      await activateRider(
        rider._id,
        token
      );

      showNotification?.(
        `${rider.name}'s account has been activated.`,
        "success"
      );

      await loadRiders();
    } catch (error) {
      showNotification?.(
        error.message ||
          "Failed to activate rider",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================================
  // DEACTIVATE
  // ==========================================================

  const handleDeactivate = async (
    rider
  ) => {
    const confirmed =
      window.confirm(
        `Deactivate ${rider.name}'s rider account?`
      );

    if (!confirmed) return;

    try {
      setActionLoading(
        rider._id
      );

      await deactivateRider(
        rider._id,
        token
      );

      showNotification?.(
        `${rider.name}'s account has been deactivated.`,
        "success"
      );

      await loadRiders();
    } catch (error) {
      showNotification?.(
        error.message ||
          "Failed to deactivate rider",
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================================
  // FILTERED RIDERS
  // ==========================================================

  const filteredRiders =
    useMemo(() => {
      if (!search.trim()) {
        return riders;
      }

      const term =
        search
          .trim()
          .toLowerCase();

      return riders.filter(
        (rider) =>
          rider.name
            ?.toLowerCase()
            .includes(term) ||
          rider.email
            ?.toLowerCase()
            .includes(term) ||
          rider.phone
            ?.toLowerCase()
            .includes(term) ||
          rider.riderProfile?.bikeType
            ?.toLowerCase()
            .includes(term) ||
          rider.riderProfile?.bikeNumber
            ?.toLowerCase()
            .includes(term) ||
          rider.riderProfile?.serviceArea
            ?.toLowerCase()
            .includes(term)
      );
    }, [riders, search]);

  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatDate = (
    date
  ) => {
    if (!date) return "—";

    return new Date(
      date
    ).toLocaleDateString(
      "en-GH",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatus = (
    rider
  ) => {
    if (!rider.isActive) {
      return {
        text: "Inactive",
        className:
          "rider-status inactive",
      };
    }

    if (
      !rider.riderProfile
        ?.isApproved
    ) {
      return {
        text: "Pending",
        className:
          "rider-status pending",
      };
    }

    if (
      rider.riderProfile
        ?.isAvailable
    ) {
      return {
        text: "Available",
        className:
          "rider-status available",
      };
    }

    return {
      text: "Offline",
      className:
        "rider-status offline",
    };
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  if (
    parentLoading ||
    loading
  ) {
    return (
      <div className="riders-page">
        <div className="riders-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>
            Loading riders...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="riders-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="riders-header">
        <div>
          <h1>
            Rider Management
          </h1>

          <p>
            Manage rider applications,
            approvals and delivery
            activity.
          </p>
        </div>

        <button
          type="button"
          className="rider-refresh-btn"
          onClick={loadRiders}
        >
          <i className="fas fa-refresh"></i>
          Refresh
        </button>
      </div>

      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <div className="rider-stats-grid">

        <div className="rider-stat-card">
          <div className="rider-stat-icon">
            <i className="fas fa-motorcycle"></i>
          </div>

          <div>
            <span>
              Total Riders
            </span>

            <strong>
              {stats.total || 0}
            </strong>
          </div>
        </div>

        <div className="rider-stat-card">
          <div className="rider-stat-icon">
            <i className="fas fa-user-clock"></i>
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {stats.pending || 0}
            </strong>
          </div>
        </div>

        <div className="rider-stat-card">
          <div className="rider-stat-icon">
            <i className="fas fa-circle-check"></i>
          </div>

          <div>
            <span>
              Approved
            </span>

            <strong>
              {stats.approved || 0}
            </strong>
          </div>
        </div>

        <div className="rider-stat-card">
          <div className="rider-stat-icon">
            <i className="fas fa-signal"></i>
          </div>

          <div>
            <span>
              Available Now
            </span>

            <strong>
              {stats.available || 0}
            </strong>
          </div>
        </div>

        <div className="rider-stat-card">
          <div className="rider-stat-icon">
            <i className="fas fa-truck"></i>
          </div>

          <div>
            <span>
              Total Deliveries
            </span>

            <strong>
              {stats.totalDeliveries ||
                0}
            </strong>
          </div>
        </div>

        <div className="rider-stat-card">
          <div className="rider-stat-icon">
            <i className="fas fa-check-double"></i>
          </div>

          <div>
            <span>
              Completed
            </span>

            <strong>
              {stats.completedDeliveries ||
                0}
            </strong>
          </div>
        </div>

      </div>

      {/* ======================================================
          CONTROLS
      ====================================================== */}

      <div className="riders-controls">

        <div className="rider-search">
          <i className="fas fa-search"></i>

          <input
            type="text"
            placeholder="Search riders, phone, bike or area..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />
        </div>

        <div className="rider-filters">

          {[
            ["all", "All"],
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["available", "Available"],
            ["offline", "Offline"],
            ["inactive", "Inactive"],
          ].map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  status === value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setStatus(value)
                }
              >
                {label}
              </button>
            )
          )}

        </div>

      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="riders-table-card">

        <div className="riders-table-wrapper">

          <table className="riders-table">

            <thead>
              <tr>
                <th>Rider</th>
                <th>Phone</th>
                <th>Bike</th>
                <th>Service Area</th>
                <th>Status</th>
                <th>Deliveries</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredRiders.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="riders-empty"
                  >
                    <i className="fas fa-motorcycle"></i>

                    <strong>
                      No riders found
                    </strong>

                    <span>
                      There are no riders
                      matching your
                      current filters.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredRiders.map(
                  (rider) => {
                    const riderStatus =
                      getStatus(
                        rider
                      );

                    const riderStats =
                      rider.riderStats ||
                      {};

                    const isProcessing =
                      actionLoading ===
                      rider._id;

                    return (
                      <tr
                        key={
                          rider._id
                        }
                      >

                        {/* RIDER */}

                        <td>
                          <div className="rider-person">

                            <div className="rider-avatar">
                              {rider.avatar ||
                              rider.photoURL ? (
                                <img
                                  src={
                                    rider.avatar ||
                                    rider.photoURL
                                  }
                                  alt={
                                    rider.name
                                  }
                                />
                              ) : (
                                <i className="fas fa-user"></i>
                              )}
                            </div>

                            <div>
                              <strong>
                                {rider.name}
                              </strong>

                              <span>
                                {rider.email}
                              </span>
                            </div>

                          </div>
                        </td>

                        {/* PHONE */}

                        <td>
                          {rider.phone ||
                            "—"}
                        </td>

                        {/* BIKE */}

                        <td>
                          <div className="rider-bike">

                            <strong>
                              {rider
                                .riderProfile
                                ?.bikeType ||
                                "—"}
                            </strong>

                            <span>
                              {rider
                                .riderProfile
                                ?.bikeNumber ||
                                "No number"}
                            </span>

                          </div>
                        </td>

                        {/* AREA */}

                        <td>
                          {rider
                            .riderProfile
                            ?.serviceArea ||
                            "—"}
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={
                              riderStatus.className
                            }
                          >
                            <span className="status-dot"></span>

                            {
                              riderStatus.text
                            }
                          </span>
                        </td>

                        {/* DELIVERIES */}

                        <td>
                          <div className="rider-delivery-count">

                            <strong>
                              {
                                riderStats.completedDeliveries ||
                                rider
                                  .riderProfile
                                  ?.completedDeliveries ||
                                0
                              }
                            </strong>

                            <span>
                              completed
                            </span>

                          </div>
                        </td>

                        {/* JOINED */}

                        <td>
                          {formatDate(
                            rider.createdAt
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="rider-actions">

                            <button
                              type="button"
                              className="view-btn"
                              onClick={() =>
                                setSelectedRider(
                                  rider
                                )
                              }
                            >
                              <i className="fas fa-eye"></i>
                              View
                            </button>

                            {!rider
                              .riderProfile
                              ?.isApproved ? (
                              <button
                                type="button"
                                className="approve-btn"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  handleApprove(
                                    rider
                                  )
                                }
                              >
                                <i className="fas fa-check"></i>
                                Approve
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="reject-btn"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  handleReject(
                                    rider
                                  )
                                }
                              >
                                <i className="fas fa-xmark"></i>
                                Reject
                              </button>
                            )}

                            {rider.isActive ? (
                              <button
                                type="button"
                                className="deactivate-btn"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  handleDeactivate(
                                    rider
                                  )
                                }
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="activate-btn"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  handleActivate(
                                    rider
                                  )
                                }
                              >
                                Activate
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ======================================================
          RIDER DETAILS MODAL
      ====================================================== */}

      {selectedRider && (
        <div
          className="rider-modal-overlay"
          onClick={() =>
            setSelectedRider(
              null
            )
          }
        >

          <div
            className="rider-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="rider-modal-header">

              <div>
                <h2>
                  Rider Details
                </h2>

                <p>
                  Complete rider
                  information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRider(
                    null
                  )
                }
              >
                <i className="fas fa-xmark"></i>
              </button>

            </div>

            <div className="rider-modal-profile">

              <div className="rider-modal-avatar">

                {selectedRider.avatar ||
                selectedRider.photoURL ? (
                  <img
                    src={
                      selectedRider.avatar ||
                      selectedRider.photoURL
                    }
                    alt={
                      selectedRider.name
                    }
                  />
                ) : (
                  <i className="fas fa-user"></i>
                )}

              </div>

              <div>
                <h3>
                  {selectedRider.name}
                </h3>

                <p>
                  {selectedRider.email}
                </p>

                <span
                  className={
                    getStatus(
                      selectedRider
                    ).className
                  }
                >
                  <span className="status-dot"></span>
                  {
                    getStatus(
                      selectedRider
                    ).text
                  }
                </span>
              </div>

            </div>

            <div className="rider-details-grid">

              <div>
                <span>
                  Phone
                </span>
                <strong>
                  {selectedRider.phone ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Location
                </span>
                <strong>
                  {selectedRider.location ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Bike Type
                </span>
                <strong>
                  {selectedRider
                    .riderProfile
                    ?.bikeType ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Bike Number
                </span>
                <strong>
                  {selectedRider
                    .riderProfile
                    ?.bikeNumber ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Service Area
                </span>
                <strong>
                  {selectedRider
                    .riderProfile
                    ?.serviceArea ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Identification
                </span>
                <strong>
                  {selectedRider
                    .riderProfile
                    ?.identificationNumber ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Rating
                </span>
                <strong>
                  ⭐{" "}
                  {Number(
                    selectedRider
                      .riderProfile
                      ?.rating ??
                      5
                  ).toFixed(1)}
                </strong>
              </div>

              <div>
                <span>
                  Completed
                </span>
                <strong>
                  {selectedRider
                    .riderProfile
                    ?.completedDeliveries ||
                    0}
                </strong>
              </div>

              <div>
                <span>
                  Account
                </span>
                <strong>
                  {selectedRider.isActive
                    ? "Active"
                    : "Inactive"}
                </strong>
              </div>

              <div>
                <span>
                  Approved
                </span>
                <strong>
                  {selectedRider
                    .riderProfile
                    ?.isApproved
                    ? "Yes"
                    : "No"}
                </strong>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Riders;