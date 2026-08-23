// ============================================================
// frontend/src/admin/Sellers.jsx
// BuyUKUsed - Admin Seller Management
// ============================================================

import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import { useAuth } from "../context/AuthContext";

import {
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  verifyAdminSeller,
  unverifyAdminSeller,
  deleteAdminUser,
  getImageUrl,
} from "../services/api";

// ============================================================
// COMPONENT
// ============================================================

const Sellers = () => {
  const { token } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  // Pagination
  const [page, setPage] =
    useState(1);

  const [limit] =
    useState(20);

  const [total, setTotal] =
    useState(0);

  // Filters
  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("seller");

  const [statusFilter, setStatusFilter] =
    useState("");

  // ==========================================================
  // FETCH USERS
  // ==========================================================

  const fetchUsers = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit,

          ...(search.trim()
            ? {
                search:
                  search.trim(),
              }
            : {}),

          ...(roleFilter
            ? {
                role:
                  roleFilter,
              }
            : {}),

          ...(statusFilter
            ? {
                status:
                  statusFilter,
              }
            : {}),
        };

        const data =
          await getAdminUsers(
            params,
            token
          );

        setUsers(
          Array.isArray(
            data?.users
          )
            ? data.users
            : []
        );

        setTotal(
          Number(
            data?.total || 0
          )
        );
      } catch (err) {
        console.error(
          "❌ Error fetching sellers:",
          err
        );

        setError(
          err?.message ||
            "Failed to load sellers."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      limit,
      search,
      roleFilter,
      statusFilter,
      token,
    ]
  );

  // ==========================================================
  // INITIAL / FILTER FETCH
  // ==========================================================

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ==========================================================
  // CHANGE ROLE
  // ==========================================================

  const handleRoleChange = async (
    userId,
    newRole
  ) => {
    if (!userId || !newRole) {
      return;
    }

    if (
      !window.confirm(
        `Change this user's role to "${newRole}"?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      await updateAdminUserRole(
        userId,
        newRole,
        token
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "❌ Role update error:",
        err
      );

      window.alert(
        `Failed to update role: ${
          err?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // ACTIVATE / SUSPEND
  // ==========================================================

  const handleStatusChange = async (
    user
  ) => {
    if (!user?._id) {
      return;
    }

    const currentlyActive =
      user.isActive !== false;

    const newIsActive =
      !currentlyActive;

    const actionText =
      newIsActive
        ? "activate"
        : "suspend";

    if (
      !window.confirm(
        `Are you sure you want to ${actionText} ${user.name}?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      await updateAdminUserStatus(
        user._id,
        newIsActive,
        token
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "❌ Status update error:",
        err
      );

      window.alert(
        `Failed to ${actionText} seller: ${
          err?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // VERIFY SELLER
  // ==========================================================

  const handleVerify = async (
    userId
  ) => {
    if (!userId) {
      return;
    }

    if (
      !window.confirm(
        "Verify this seller?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      await verifyAdminSeller(
        userId,
        token
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "❌ Seller verification error:",
        err
      );

      window.alert(
        `Failed to verify seller: ${
          err?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // UNVERIFY SELLER
  // ==========================================================

  const handleUnverify = async (
    userId
  ) => {
    if (!userId) {
      return;
    }

    if (
      !window.confirm(
        "Remove this seller's verification?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      await unverifyAdminSeller(
        userId,
        token
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "❌ Seller unverification error:",
        err
      );

      window.alert(
        `Failed to remove verification: ${
          err?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (
    userId,
    userName
  ) => {
    if (!userId) {
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${
          userName || "this seller"
        }? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);

      await deleteAdminUser(
        userId,
        token
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "❌ Delete seller error:",
        err
      );

      window.alert(
        `Failed to delete seller: ${
          err?.message ||
          "Unknown error"
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================================
  // FILTER ACTIONS
  // ==========================================================

  const handleApplyFilters =
    () => {
      setPage(1);

      // fetchUsers will run automatically
      // because the filter state changes.
    };

  const handleClearFilters =
    () => {
      setSearch("");
      setRoleFilter("seller");
      setStatusFilter("");
      setPage(1);
    };

  // ==========================================================
  // HELPERS
  // ==========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / limit
      )
    );

  const getRoleBadgeColor = (
    role
  ) => {
    switch (role) {
      case "admin":
        return "#dc2626";

      case "seller":
        return "#2563eb";

      case "rider":
        return "#7c3aed";

      case "buyer":
        return "#6b7280";

      default:
        return "#6b7280";
    }
  };

  const getStatusBadgeColor = (
    isActive
  ) => {
    return isActive !== false
      ? "#22c55e"
      : "#dc2626";
  };

  const getVerificationBadgeColor =
    (user) => {
      if (
        user?.isVerified === true &&
        user?.verificationStatus ===
          "approved"
      ) {
        return "#16a34a";
      }

      if (
        user?.verificationStatus ===
        "pending"
      ) {
        return "#f59e0b";
      }

      if (
        user?.verificationStatus ===
        "rejected"
      ) {
        return "#dc2626";
      }

      return "#6b7280";
    };

  const getVerificationText =
    (user) => {
      if (
        user?.isVerified === true &&
        user?.verificationStatus ===
          "approved"
      ) {
        return "Verified";
      }

      if (
        user?.verificationStatus ===
        "pending"
      ) {
        return "Pending";
      }

      if (
        user?.verificationStatus ===
        "rejected"
      ) {
        return "Rejected";
      }

      return "Not Verified";
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            margin: 0,
            marginBottom: "6px",
          }}
        >
          Seller Management
        </h1>

        <p
          style={{
            margin: 0,
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Manage sellers, verification,
          roles, account status and
          seller accounts.
        </p>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "24px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search seller by name, email, phone or shop..."
          value={search}
          onChange={(e) => {
            setSearch(
              e.target.value
            );
            setPage(1);
          }}
          style={{
            padding:
              "10px 12px",
            border:
              "1px solid #d1d5db",
            borderRadius: "6px",
            flex:
              "1 1 260px",
            fontSize: "14px",
            outline: "none",
          }}
        />

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(
              e.target.value
            );
            setPage(1);
          }}
          style={{
            padding:
              "10px 12px",
            border:
              "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            background:
              "white",
          }}
        >
          <option value="">
            All Roles
          </option>

          <option value="buyer">
            Buyers
          </option>

          <option value="seller">
            Sellers
          </option>

          <option value="rider">
            Riders
          </option>

          <option value="admin">
            Admins
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(
              e.target.value
            );
            setPage(1);
          }}
          style={{
            padding:
              "10px 12px",
            border:
              "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            background:
              "white",
          }}
        >
          <option value="">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="suspended">
            Suspended
          </option>

          <option value="banned">
            Banned
          </option>
        </select>

        <button
          type="button"
          onClick={
            handleApplyFilters
          }
          style={{
            padding:
              "10px 16px",
            background:
              "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor:
              "pointer",
            fontWeight: 600,
          }}
        >
          Apply Filters
        </button>

        <button
          type="button"
          onClick={
            handleClearFilters
          }
          style={{
            padding:
              "10px 16px",
            background:
              "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor:
              "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          style={{
            background:
              "#fee2e2",
            color:
              "#b91c1c",
            padding:
              "12px 16px",
            borderRadius:
              "6px",
            marginBottom:
              "16px",
            border:
              "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* ======================================================
          RESULTS COUNT
      ====================================================== */}

      {!loading && (
        <div
          style={{
            marginBottom:
              "12px",
            fontSize:
              "14px",
            color:
              "#6b7280",
          }}
        >
          {total} user
          {total === 1
            ? ""
            : "s"}{" "}
          found
        </div>
      )}

      {/* ======================================================
          TABLE
      ====================================================== */}

      {loading ? (
        <div
          style={{
            textAlign:
              "center",
            padding:
              "60px 20px",
            color:
              "#6b7280",
          }}
        >
          Loading sellers...
        </div>
      ) : users.length === 0 ? (
        <div
          style={{
            textAlign:
              "center",
            padding:
              "60px 20px",
            color:
              "#6b7280",
            background:
              "white",
            borderRadius:
              "8px",
            border:
              "1px solid #e5e7eb",
          }}
        >
          No users found.
        </div>
      ) : (
        <>
          <div
            style={{
              overflowX:
                "auto",
              background:
                "white",
              borderRadius:
                "8px",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "1050px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f3f4f6",
                  }}
                >
                  <th
                    style={{
                      padding:
                        "12px 16px",
                      textAlign:
                        "left",
                      fontWeight: 600,
                    }}
                  >
                    User
                  </th>

                  <th
                    style={{
                      padding:
                        "12px 16px",
                      textAlign:
                        "left",
                      fontWeight: 600,
                    }}
                  >
                    Email
                  </th>

                  <th
                    style={{
                      padding:
                        "12px 16px",
                      textAlign:
                        "left",
                      fontWeight: 600,
                    }}
                  >
                    Phone
                  </th>

                  <th
                    style={{
                      padding:
                        "12px 16px",
                      textAlign:
                        "left",
                      fontWeight: 600,
                    }}
                  >
                    Role
                  </th>

                  <th
                    style={{
                      padding:
                        "12px 16px",
                      textAlign:
                        "left",
                      fontWeight: 600,
                    }}
                  >
                    Account
                  </th>

                  <th
                    style={{
                      padding:
                        "12px 16px",
                      textAlign:
                        "left",
                      fontWeight: 600,
                    }}
                  >
                    Verification
                  </th>

                  <th
                    style={{
                      padding:
                        "12px 16px",
                      textAlign:
                        "center",
                      fontWeight: 600,
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map(
                  (user) => {
                    const active =
                      user.isActive !==
                      false;

                    const verified =
                      user.isVerified ===
                        true &&
                      user.verificationStatus ===
                        "approved";

                    return (
                      <tr
                        key={
                          user._id
                        }
                        style={{
                          borderTop:
                            "1px solid #e5e7eb",
                        }}
                      >
                        {/* USER */}

                        <td
                          style={{
                            padding:
                              "12px 16px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "10px",
                            }}
                          >
                            <img
                              src={getImageUrl(
                                user.avatar ||
                                  user.profileImage ||
                                  user.photo ||
                                  user.photoURL
                              )}
                              alt={
                                user.name ||
                                "User"
                              }
                              style={{
                                width:
                                  "38px",
                                height:
                                  "38px",
                                borderRadius:
                                  "50%",
                                objectFit:
                                  "cover",
                                background:
                                  "#f3f4f6",
                              }}
                              onError={(
                                e
                              ) => {
                                e.currentTarget.src =
                                  "/placeholder.png";
                              }}
                            />

                            <div>
                              <div
                                style={{
                                  fontWeight:
                                    600,
                                }}
                              >
                                {user.name ||
                                  "Unnamed User"}
                              </div>

                              {user.shopName && (
                                <div
                                  style={{
                                    fontSize:
                                      "12px",
                                    color:
                                      "#6b7280",
                                    marginTop:
                                      "2px",
                                  }}
                                >
                                  {user.shopName}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}

                        <td
                          style={{
                            padding:
                              "12px 16px",
                          }}
                        >
                          {user.email ||
                            "—"}
                        </td>

                        {/* PHONE */}

                        <td
                          style={{
                            padding:
                              "12px 16px",
                          }}
                        >
                          {user.phone ||
                            "—"}
                        </td>

                        {/* ROLE */}

                        <td
                          style={{
                            padding:
                              "12px 16px",
                          }}
                        >
                          <span
                            style={{
                              background:
                                getRoleBadgeColor(
                                  user.role
                                ),
                              color:
                                "white",
                              padding:
                                "4px 10px",
                              borderRadius:
                                "12px",
                              fontSize:
                                "12px",
                              fontWeight:
                                600,
                              textTransform:
                                "capitalize",
                            }}
                          >
                            {user.role ||
                              "unknown"}
                          </span>
                        </td>

                        {/* ACCOUNT STATUS */}

                        <td
                          style={{
                            padding:
                              "12px 16px",
                          }}
                        >
                          <span
                            style={{
                              background:
                                getStatusBadgeColor(
                                  user.isActive
                                ),
                              color:
                                "white",
                              padding:
                                "4px 10px",
                              borderRadius:
                                "12px",
                              fontSize:
                                "12px",
                              fontWeight:
                                600,
                            }}
                          >
                            {active
                              ? "Active"
                              : "Suspended"}
                          </span>
                        </td>

                        {/* VERIFICATION */}

                        <td
                          style={{
                            padding:
                              "12px 16px",
                          }}
                        >
                          <span
                            style={{
                              background:
                                getVerificationBadgeColor(
                                  user
                                ),
                              color:
                                "white",
                              padding:
                                "4px 10px",
                              borderRadius:
                                "12px",
                              fontSize:
                                "12px",
                              fontWeight:
                                600,
                            }}
                          >
                            {getVerificationText(
                              user
                            )}
                          </span>

                          {verified &&
                            user.verifiedAt && (
                              <div
                                style={{
                                  fontSize:
                                    "11px",
                                  color:
                                    "#6b7280",
                                  marginTop:
                                    "4px",
                                }}
                              >
                                Verified{" "}
                                {new Date(
                                  user.verifiedAt
                                ).toLocaleDateString()}
                              </div>
                            )}
                        </td>

                        {/* ACTIONS */}

                        <td
                          style={{
                            padding:
                              "12px 16px",
                            textAlign:
                              "center",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "6px",
                              justifyContent:
                                "center",
                              alignItems:
                                "center",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            {/* ROLE */}

                            <select
                              value={
                                user.role
                              }
                              onChange={(
                                e
                              ) =>
                                handleRoleChange(
                                  user._id,
                                  e
                                    .target
                                    .value
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              style={{
                                padding:
                                  "6px 8px",
                                fontSize:
                                  "12px",
                                border:
                                  "1px solid #d1d5db",
                                borderRadius:
                                  "4px",
                                background:
                                  "white",
                              }}
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

                              <option value="admin">
                                Admin
                              </option>
                            </select>

                            {/* VERIFY */}

                            {user.role ===
                              "seller" &&
                              !verified && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVerify(
                                      user._id
                                    )
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                  style={{
                                    padding:
                                      "6px 10px",
                                    fontSize:
                                      "12px",
                                    border:
                                      "none",
                                    borderRadius:
                                      "4px",
                                    cursor:
                                      "pointer",
                                    background:
                                      "#16a34a",
                                    color:
                                      "white",
                                    fontWeight:
                                      600,
                                  }}
                                >
                                  Verify
                                </button>
                              )}

                            {/* UNVERIFY */}

                            {user.role ===
                              "seller" &&
                              verified && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUnverify(
                                      user._id
                                    )
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                  style={{
                                    padding:
                                      "6px 10px",
                                    fontSize:
                                      "12px",
                                    border:
                                      "none",
                                    borderRadius:
                                      "4px",
                                    cursor:
                                      "pointer",
                                    background:
                                      "#f59e0b",
                                    color:
                                      "white",
                                    fontWeight:
                                      600,
                                  }}
                                >
                                  Unverify
                                </button>
                              )}

                            {/* SUSPEND / ACTIVATE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  user
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              style={{
                                padding:
                                  "6px 10px",
                                fontSize:
                                  "12px",
                                border:
                                  "none",
                                borderRadius:
                                  "4px",
                                cursor:
                                  "pointer",
                                background:
                                  active
                                    ? "#f59e0b"
                                    : "#22c55e",
                                color:
                                  "white",
                                fontWeight:
                                  600,
                              }}
                            >
                              {active
                                ? "Suspend"
                                : "Activate"}
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  user._id,
                                  user.name
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              style={{
                                padding:
                                  "6px 10px",
                                fontSize:
                                  "12px",
                                border:
                                  "none",
                                borderRadius:
                                  "4px",
                                cursor:
                                  "pointer",
                                background:
                                  "#dc2626",
                                color:
                                  "white",
                                fontWeight:
                                  600,
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* ====================================================
              PAGINATION
          ==================================================== */}

          {totalPages > 1 && (
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "center",
                alignItems:
                  "center",
                gap: "8px",
                marginTop:
                  "20px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setPage(
                    (p) =>
                      Math.max(
                        1,
                        p - 1
                      )
                  )
                }
                disabled={
                  page === 1 ||
                  actionLoading
                }
                style={{
                  padding:
                    "7px 12px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "4px",
                  background:
                    "white",
                  cursor:
                    page === 1
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    page === 1
                      ? 0.5
                      : 1,
                }}
              >
                Previous
              </button>

              <span
                style={{
                  fontSize:
                    "14px",
                  padding:
                    "0 8px",
                }}
              >
                Page {page} of{" "}
                {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage(
                    (p) =>
                      Math.min(
                        totalPages,
                        p + 1
                      )
                  )
                }
                disabled={
                  page ===
                    totalPages ||
                  actionLoading
                }
                style={{
                  padding:
                    "7px 12px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "4px",
                  background:
                    "white",
                  cursor:
                    page ===
                    totalPages
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    page ===
                    totalPages
                      ? 0.5
                      : 1,
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Sellers;