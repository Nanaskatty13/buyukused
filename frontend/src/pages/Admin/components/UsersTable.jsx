// ============================================================
// components/UsersTable.jsx
// BuyUKUsed - Premium Admin Users Table
// ============================================================

import React, { useState } from "react";

import {
  updateUser,
  deleteUser,
} from "../../../services/api";

import { useAuth } from "../../../context/AuthContext";

// ============================================================
// USERS TABLE
// ============================================================

const UsersTable = ({
  users,
  loading,
  refreshData,
  showNotification,

  onVerifyUser,
  onUnverifyUser,
  verifyingUser,
}) => {
  const { token } = useAuth();

  const [editingUser, setEditingUser] =
    useState(null);

  const [editForm, setEditForm] =
    useState({});

  const [selectedUser, setSelectedUser] =
    useState(null);

  // ==========================================================
  // VERIFY STATUS
  // ==========================================================

  const isUserVerified = (user) => {
    if (!user) return false;

    if (user.isVerified === true) {
      return true;
    }

    if (user.verified === true) {
      return true;
    }

    if (user.emailVerified === true) {
      return true;
    }

    const verificationStatus =
      String(
        user.verificationStatus || ""
      ).toLowerCase();

    return [
      "verified",
      "approved",
    ].includes(
      verificationStatus
    );
  };

  // ==========================================================
  // USER ID
  // ==========================================================

  const getUserId = (user) => {
    return user?._id || user?.id;
  };

  // ==========================================================
  // USER INITIALS
  // ==========================================================

  const getInitials = (user) => {
    const name =
      user?.name ||
      user?.email ||
      "User";

    const parts = String(name)
      .trim()
      .split(/\s+/);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[parts.length - 1][0]
      ).toUpperCase();
    }

    return String(name)
      .slice(0, 2)
      .toUpperCase();
  };

  // ==========================================================
  // ROLE STYLE
  // ==========================================================

  const getRoleStyle = (role) => {
    const normalized =
      String(role || "buyer").toLowerCase();

    const styles = {
      admin: {
        background: "#f3e8ff",
        color: "#7e22ce",
        border: "#d8b4fe",
      },

      seller: {
        background: "#fff7ed",
        color: "#c2410c",
        border: "#fed7aa",
      },

      rider: {
        background: "#eff6ff",
        color: "#1d4ed8",
        border: "#bfdbfe",
      },

      buyer: {
        background: "#ecfdf5",
        color: "#047857",
        border: "#a7f3d0",
      },
    };

    return (
      styles[normalized] ||
      styles.buyer
    );
  };

  // ==========================================================
  // EDIT USER
  // ==========================================================

  const handleEdit = (user) => {
    setEditingUser(
      getUserId(user)
    );

    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "buyer",
      isActive:
        user.isActive !== false,
    });
  };

  // ==========================================================
  // SAVE USER
  // ==========================================================

  const handleSave = async (id) => {
    try {
      const result =
        await updateUser(
          id,
          editForm,
          token
        );

      if (result?.success) {
        showNotification?.(
          "User updated successfully",
          "success"
        );

        setEditingUser(null);

        refreshData?.();
      } else {
        showNotification?.(
          result?.message ||
            "Update failed",
          "error"
        );
      }
    } catch (err) {
      console.error(
        "❌ Update user error:",
        err
      );

      showNotification?.(
        err?.message ||
          "Something went wrong",
        "error"
      );
    }
  };

  // ==========================================================
  // DELETE USER
  // ==========================================================

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this user?"
      )
    ) {
      return;
    }

    try {
      const result =
        await deleteUser(
          id,
          token
        );

      if (result?.success) {
        showNotification?.(
          "User deleted successfully",
          "success"
        );

        refreshData?.();
      } else {
        showNotification?.(
          result?.message ||
            "Delete failed",
          "error"
        );
      }
    } catch (err) {
      console.error(
        "❌ Delete user error:",
        err
      );

      showNotification?.(
        err?.message ||
          "Something went wrong",
        "error"
      );
    }
  };

  // ==========================================================
  // DATE FORMAT
  // ==========================================================

  const formatDate = (date) => {
    if (!date) return "—";

    try {
      return new Date(
        date
      ).toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );
    } catch {
      return "—";
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        style={{
          background: "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "18px",
          padding: "60px 20px",
          textAlign: "center",
          boxShadow:
            "0 4px 20px rgba(15,23,42,0.04)",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            border:
              "3px solid #e5e7eb",
            borderTop:
              "3px solid #111827",
            borderRadius: "50%",
            margin:
              "0 auto 16px",
            animation:
              "spin 0.8s linear infinite",
          }}
        />

        <div
          style={{
            fontWeight: 700,
            color: "#111827",
          }}
        >
          Loading users...
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#6b7280",
            marginTop: "5px",
          }}
        >
          Please wait
        </div>

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
          `}
        </style>
      </div>
    );
  }

  // ==========================================================
  // NO USERS
  // ==========================================================

  if (!users) {
    return (
      <div
        style={{
          background: "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "18px",
          padding: "50px 20px",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        No users data available.
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <div
        style={{
          background: "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow:
            "0 8px 30px rgba(15,23,42,0.05)",
        }}
      >
        {/* ====================================================
            TABLE TOP BAR
        ==================================================== */}

        <div
          style={{
            padding:
              "22px 24px",
            borderBottom:
              "1px solid #eef0f3",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background:
                    "#111827",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  fontSize: "19px",
                }}
              >
                👥
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  Users
                </h2>

                <p
                  style={{
                    margin:
                      "3px 0 0",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  Manage marketplace accounts
                </p>
              </div>
            </div>
          </div>

          {/* USER COUNT */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding:
                "8px 13px",
              background:
                "#f8fafc",
              border:
                "1px solid #e5e7eb",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#374151",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            />

            {users.length}{" "}
            {users.length === 1
              ? "user"
              : "users"}
          </div>
        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "1180px",
              borderCollapse:
                "separate",
              borderSpacing: 0,
            }}
          >
            {/* ==================================================
                HEADER
            ================================================== */}

            <thead>
              <tr
                style={{
                  background:
                    "#f8fafc",
                }}
              >
                {[
                  "User",
                  "Role",
                  "Account",
                  "Verification",
                  "Location",
                  "Joined",
                  "Actions",
                ].map(
                  (
                    heading,
                    index
                  ) => (
                    <th
                      key={heading}
                      style={{
                        padding:
                          "13px 18px",
                        textAlign:
                          index === 6
                            ? "right"
                            : "left",
                        fontSize:
                          "11px",
                        fontWeight:
                          800,
                        color:
                          "#6b7280",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.06em",
                        borderBottom:
                          "1px solid #e5e7eb",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            {/* ==================================================
                BODY
            ================================================== */}

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding:
                        "70px 20px",
                      textAlign:
                        "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "42px",
                        marginBottom:
                          "10px",
                      }}
                    >
                      👥
                    </div>

                    <div
                      style={{
                        fontWeight:
                          800,
                        color:
                          "#111827",
                        fontSize:
                          "15px",
                      }}
                    >
                      No users found
                    </div>

                    <div
                      style={{
                        marginTop:
                          "5px",
                        fontSize:
                          "13px",
                        color:
                          "#6b7280",
                      }}
                    >
                      There are no users matching the current filters.
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(
                  (user) => {
                    const userId =
                      getUserId(user);

                    const verified =
                      isUserVerified(
                        user
                      );

                    const isVerifying =
                      Boolean(
                        verifyingUser?.[
                          userId
                        ]
                      );

                    const isAdmin =
                      String(
                        user.role ||
                          ""
                      ).toLowerCase() ===
                      "admin";

                    const roleStyle =
                      getRoleStyle(
                        user.role
                      );

                    // ==================================================
                    // EDIT MODE
                    // ==================================================

                    if (
                      editingUser ===
                      userId
                    ) {
                      return (
                        <tr
                          key={userId}
                          style={{
                            background:
                              "#fafafa",
                          }}
                        >
                          {/* USER */}

                          <td
                            style={{
                              padding:
                                "16px 18px",
                              borderBottom:
                                "1px solid #eef0f3",
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
                              <div
                                style={{
                                  width:
                                    "38px",
                                  height:
                                    "38px",
                                  borderRadius:
                                    "11px",
                                  background:
                                    "#111827",
                                  color:
                                    "#fff",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {getInitials(
                                  user
                                )}
                              </div>

                              <input
                                value={
                                  editForm.name
                                }
                                onChange={(
                                  e
                                ) =>
                                  setEditForm(
                                    {
                                      ...editForm,
                                      name:
                                        e
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                placeholder="Name"
                                style={{
                                  width:
                                    "170px",
                                  padding:
                                    "9px 10px",
                                  border:
                                    "1px solid #d1d5db",
                                  borderRadius:
                                    "8px",
                                  outline:
                                    "none",
                                  fontSize:
                                    "13px",
                                }}
                              />
                            </div>
                          </td>

                          {/* ROLE */}

                          <td
                            style={{
                              padding:
                                "16px 18px",
                              borderBottom:
                                "1px solid #eef0f3",
                            }}
                          >
                            <select
                              value={
                                editForm.role
                              }
                              onChange={(
                                e
                              ) =>
                                setEditForm(
                                  {
                                    ...editForm,
                                    role:
                                      e
                                        .target
                                        .value,
                                  }
                                )
                              }
                              style={{
                                padding:
                                  "9px 10px",
                                border:
                                  "1px solid #d1d5db",
                                borderRadius:
                                  "8px",
                                background:
                                  "#fff",
                                outline:
                                  "none",
                                fontSize:
                                  "13px",
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
                          </td>

                          {/* ACCOUNT */}

                          <td
                            style={{
                              padding:
                                "16px 18px",
                              borderBottom:
                                "1px solid #eef0f3",
                            }}
                          >
                            <label
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "8px",
                                cursor:
                                  "pointer",
                                fontSize:
                                  "13px",
                                fontWeight:
                                  700,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  editForm.isActive
                                }
                                onChange={(
                                  e
                                ) =>
                                  setEditForm(
                                    {
                                      ...editForm,
                                      isActive:
                                        e
                                          .target
                                          .checked,
                                    }
                                  )
                                }
                              />

                              Active
                            </label>
                          </td>

                          {/* VERIFICATION */}

                          <td
                            style={{
                              padding:
                                "16px 18px",
                              borderBottom:
                                "1px solid #eef0f3",
                            }}
                          >
                            {verified
                              ? "Verified"
                              : "Not verified"}
                          </td>

                          {/* LOCATION */}

                          <td
                            style={{
                              padding:
                                "16px 18px",
                              borderBottom:
                                "1px solid #eef0f3",
                            }}
                          >
                            —
                          </td>

                          {/* JOINED */}

                          <td
                            style={{
                              padding:
                                "16px 18px",
                              borderBottom:
                                "1px solid #eef0f3",
                            }}
                          >
                            —
                          </td>

                          {/* ACTIONS */}

                          <td
                            style={{
                              padding:
                                "16px 18px",
                              borderBottom:
                                "1px solid #eef0f3",
                              textAlign:
                                "right",
                            }}
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "flex-end",
                                gap: "7px",
                              }}
                            >
                              <button
                                onClick={() =>
                                  handleSave(
                                    userId
                                  )
                                }
                                style={{
                                  border:
                                    "none",
                                  background:
                                    "#111827",
                                  color:
                                    "#fff",
                                  padding:
                                    "9px 14px",
                                  borderRadius:
                                    "8px",
                                  fontWeight:
                                    700,
                                  cursor:
                                    "pointer",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                Save
                              </button>

                              <button
                                onClick={() =>
                                  setEditingUser(
                                    null
                                  )
                                }
                                style={{
                                  border:
                                    "1px solid #d1d5db",
                                  background:
                                    "#fff",
                                  color:
                                    "#374151",
                                  padding:
                                    "9px 14px",
                                  borderRadius:
                                    "8px",
                                  fontWeight:
                                    700,
                                  cursor:
                                    "pointer",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // ==================================================
                    // NORMAL ROW
                    // ==================================================

                    return (
                      <tr
                        key={userId}
                        onMouseEnter={(
                          e
                        ) => {
                          e.currentTarget.style.background =
                            "#fafafa";
                        }}
                        onMouseLeave={(
                          e
                        ) => {
                          e.currentTarget.style.background =
                            "#ffffff";
                        }}
                        style={{
                          background:
                            "#ffffff",
                          transition:
                            "background 0.15s ease",
                        }}
                      >
                        {/* ==================================================
                            USER
                        ================================================== */}

                        <td
                          style={{
                            padding:
                              "16px 18px",
                            borderBottom:
                              "1px solid #f0f1f3",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "12px",
                            }}
                          >
                            {/* AVATAR */}

                            <div
                              style={{
                                width:
                                  "42px",
                                height:
                                  "42px",
                                flexShrink: 0,
                                borderRadius:
                                  "13px",
                                background:
                                  "#111827",
                                color:
                                  "#ffffff",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  800,
                                letterSpacing:
                                  "0.02em",
                              }}
                            >
                              {getInitials(
                                user
                              )}
                            </div>

                            <div
                              style={{
                                minWidth:
                                  0,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight:
                                    750,
                                  color:
                                    "#111827",
                                  fontSize:
                                    "13px",
                                  whiteSpace:
                                    "nowrap",
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  maxWidth:
                                    "210px",
                                }}
                              >
                                {user.name ||
                                  "Unnamed User"}
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    "3px",
                                  fontSize:
                                    "12px",
                                  color:
                                    "#6b7280",
                                  whiteSpace:
                                    "nowrap",
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  maxWidth:
                                    "210px",
                                }}
                              >
                                {user.email ||
                                  "No email"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* ==================================================
                            ROLE
                        ================================================== */}

                        <td
                          style={{
                            padding:
                              "16px 18px",
                            borderBottom:
                              "1px solid #f0f1f3",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              padding:
                                "6px 10px",
                              borderRadius:
                                "999px",
                              background:
                                roleStyle.background,
                              color:
                                roleStyle.color,
                              border:
                                `1px solid ${roleStyle.border}`,
                              fontSize:
                                "11px",
                              fontWeight:
                                800,
                              textTransform:
                                "capitalize",
                            }}
                          >
                            {user.role ||
                              "buyer"}
                          </span>
                        </td>

                        {/* ==================================================
                            ACCOUNT STATUS
                        ================================================== */}

                        <td
                          style={{
                            padding:
                              "16px 18px",
                            borderBottom:
                              "1px solid #f0f1f3",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "7px",
                              fontSize:
                                "12px",
                              fontWeight:
                                700,
                              color:
                                user.isActive !==
                                false
                                  ? "#047857"
                                  : "#b91c1c",
                            }}
                          >
                            <span
                              style={{
                                width:
                                  "7px",
                                height:
                                  "7px",
                                borderRadius:
                                  "50%",
                                background:
                                  user.isActive !==
                                  false
                                    ? "#10b981"
                                    : "#ef4444",
                              }}
                            />

                            {user.isActive !==
                            false
                              ? "Active"
                              : "Inactive"}
                          </div>
                        </td>

                        {/* ==================================================
                            VERIFICATION
                        ================================================== */}

                        <td
                          style={{
                            padding:
                              "16px 18px",
                            borderBottom:
                              "1px solid #f0f1f3",
                          }}
                        >
                          {verified ? (
                            <div
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "6px",
                                padding:
                                  "6px 10px",
                                borderRadius:
                                  "999px",
                                background:
                                  "#ecfdf5",
                                color:
                                  "#047857",
                                border:
                                  "1px solid #a7f3d0",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  800,
                              }}
                            >
                              <span>
                                ✓
                              </span>

                              Verified
                            </div>
                          ) : (
                            <div
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: "6px",
                                padding:
                                  "6px 10px",
                                borderRadius:
                                  "999px",
                                background:
                                  "#fff7ed",
                                color:
                                  "#c2410c",
                                border:
                                  "1px solid #fed7aa",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  800,
                              }}
                            >
                              <span>
                                !
                              </span>

                              Pending
                            </div>
                          )}
                        </td>

                        {/* ==================================================
                            LOCATION
                        ================================================== */}

                        <td
                          style={{
                            padding:
                              "16px 18px",
                            borderBottom:
                              "1px solid #f0f1f3",
                            color:
                              "#4b5563",
                            fontSize:
                              "12px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "6px",
                            }}
                          >
                            <span
                              style={{
                                fontSize:
                                  "13px",
                              }}
                            >
                              📍
                            </span>

                            {user.location ||
                              "Ghana"}
                          </div>
                        </td>

                        {/* ==================================================
                            JOINED
                        ================================================== */}

                        <td
                          style={{
                            padding:
                              "16px 18px",
                            borderBottom:
                              "1px solid #f0f1f3",
                            color:
                              "#6b7280",
                            fontSize:
                              "12px",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatDate(
                            user.createdAt
                          )}
                        </td>

                        {/* ==================================================
                            ACTIONS
                        ================================================== */}

                        <td
                          style={{
                            padding:
                              "16px 18px",
                            borderBottom:
                              "1px solid #f0f1f3",
                            textAlign:
                              "right",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "flex-end",
                              gap: "6px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            {/* STATS */}

                            <button
                              onClick={() =>
                                setSelectedUser(
                                  user
                                )
                              }
                              title="View user details"
                              style={{
                                background:
                                  "#f8fafc",
                                color:
                                  "#374151",
                                border:
                                  "1px solid #e5e7eb",
                                padding:
                                  "8px 11px",
                                borderRadius:
                                  "8px",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  700,
                                fontSize:
                                  "11px",
                              }}
                            >
                              View
                            </button>

                            {/* EDIT */}

                            <button
                              onClick={() =>
                                handleEdit(
                                  user
                                )
                              }
                              title="Edit user"
                              style={{
                                background:
                                  "#111827",
                                color:
                                  "#ffffff",
                                border:
                                  "1px solid #111827",
                                padding:
                                  "8px 11px",
                                borderRadius:
                                  "8px",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  700,
                                fontSize:
                                  "11px",
                              }}
                            >
                              Edit
                            </button>

                            {/* VERIFY */}

                            {!isAdmin &&
                              !verified && (
                                <button
                                  onClick={() =>
                                    onVerifyUser?.(
                                      userId
                                    )
                                  }
                                  disabled={
                                    isVerifying
                                  }
                                  title="Verify user"
                                  style={{
                                    background:
                                      isVerifying
                                        ? "#d1fae5"
                                        : "#ecfdf5",
                                    color:
                                      "#047857",
                                    border:
                                      "1px solid #a7f3d0",
                                    padding:
                                      "8px 11px",
                                    borderRadius:
                                      "8px",
                                    cursor:
                                      isVerifying
                                        ? "not-allowed"
                                        : "pointer",
                                    fontWeight:
                                      800,
                                    fontSize:
                                      "11px",
                                    opacity:
                                      isVerifying
                                        ? 0.65
                                        : 1,
                                  }}
                                >
                                  {isVerifying
                                    ? "Verifying..."
                                    : "Verify"}
                                </button>
                              )}

                            {/* UNVERIFY */}

                            {!isAdmin &&
                              verified && (
                                <button
                                  onClick={() =>
                                    onUnverifyUser?.(
                                      userId
                                    )
                                  }
                                  disabled={
                                    isVerifying
                                  }
                                  title="Remove verification"
                                  style={{
                                    background:
                                      "#fff7ed",
                                    color:
                                      "#c2410c",
                                    border:
                                      "1px solid #fed7aa",
                                    padding:
                                      "8px 11px",
                                    borderRadius:
                                      "8px",
                                    cursor:
                                      isVerifying
                                        ? "not-allowed"
                                        : "pointer",
                                    fontWeight:
                                      800,
                                    fontSize:
                                      "11px",
                                    opacity:
                                      isVerifying
                                        ? 0.65
                                        : 1,
                                  }}
                                >
                                  {isVerifying
                                    ? "Updating..."
                                    : "Unverify"}
                                </button>
                              )}

                            {/* DELETE */}

                            <button
                              onClick={() =>
                                handleDelete(
                                  userId
                                )
                              }
                              title="Delete user"
                              style={{
                                background:
                                  "#fff1f2",
                                color:
                                  "#be123c",
                                border:
                                  "1px solid #fecdd3",
                                padding:
                                  "8px 11px",
                                borderRadius:
                                  "8px",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  800,
                                fontSize:
                                  "11px",
                              }}
                            >
                              Delete
                            </button>

                            {isAdmin && (
                              <span
                                style={{
                                  fontSize:
                                    "10px",
                                  color:
                                    "#9ca3af",
                                  fontWeight:
                                    700,
                                  marginLeft:
                                    "3px",
                                }}
                              >
                                Admin
                              </span>
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

        {/* ====================================================
            TABLE FOOTER
        ==================================================== */}

        {users.length > 0 && (
          <div
            style={{
              padding:
                "14px 20px",
              borderTop:
                "1px solid #eef0f3",
              background:
                "#fafafa",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize:
                  "12px",
                color:
                  "#6b7280",
              }}
            >
              Showing{" "}
              <strong
                style={{
                  color:
                    "#374151",
                }}
              >
                {users.length}
              </strong>{" "}
              users
            </span>

            <span
              style={{
                fontSize:
                  "11px",
                color:
                  "#9ca3af",
              }}
            >
              BuyUKUsed Admin
            </span>
          </div>
        )}
      </div>

      {/* ==========================================================
          USER DETAILS MODAL
      ========================================================== */}

      {selectedUser && (
        <div
          onClick={() =>
            setSelectedUser(null)
          }
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(15,23,42,0.55)",
            backdropFilter:
              "blur(8px)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY:
                "auto",
              background:
                "#ffffff",
              borderRadius:
                "22px",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.2)",
              overflow:
                "hidden",
            }}
          >
            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div
              style={{
                padding:
                  "24px",
                background:
                  "#111827",
                color:
                  "#ffffff",
                position:
                  "relative",
              }}
            >
              <button
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
                style={{
                  position:
                    "absolute",
                  top: "16px",
                  right: "16px",
                  width: "34px",
                  height: "34px",
                  borderRadius:
                    "50%",
                  border:
                    "1px solid rgba(255,255,255,0.2)",
                  background:
                    "rgba(255,255,255,0.08)",
                  color:
                    "#ffffff",
                  fontSize:
                    "20px",
                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "14px",
                  paddingRight:
                    "40px",
                }}
              >
                <div
                  style={{
                    width:
                      "54px",
                    height:
                      "54px",
                    borderRadius:
                      "16px",
                    background:
                      "#ffffff",
                    color:
                      "#111827",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontWeight:
                      900,
                    fontSize:
                      "15px",
                  }}
                >
                  {getInitials(
                    selectedUser
                  )}
                </div>

                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize:
                        "20px",
                      fontWeight:
                        850,
                    }}
                  >
                    {selectedUser.name ||
                      "Unnamed User"}
                  </h2>

                  <p
                    style={{
                      margin:
                        "4px 0 0",
                      color:
                        "#cbd5e1",
                      fontSize:
                        "12px",
                    }}
                  >
                    User account details
                  </p>
                </div>
              </div>
            </div>

            {/* ==================================================
                MODAL BODY
            ================================================== */}

            <div
              style={{
                padding:
                  "24px",
              }}
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px",
                }}
              >
                {/* ROLE */}

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #eef0f3",
                    borderRadius:
                      "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "10px",
                      fontWeight:
                        800,
                      color:
                        "#9ca3af",
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.05em",
                      marginBottom:
                        "6px",
                    }}
                  >
                    Role
                  </div>

                  <div
                    style={{
                      fontSize:
                        "14px",
                      fontWeight:
                        800,
                      color:
                        "#111827",
                      textTransform:
                        "capitalize",
                    }}
                  >
                    {selectedUser.role ||
                      "buyer"}
                  </div>
                </div>

                {/* ACCOUNT */}

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #eef0f3",
                    borderRadius:
                      "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "10px",
                      fontWeight:
                        800,
                      color:
                        "#9ca3af",
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.05em",
                      marginBottom:
                        "6px",
                    }}
                  >
                    Account
                  </div>

                  <div
                    style={{
                      fontSize:
                        "14px",
                      fontWeight:
                        800,
                      color:
                        selectedUser.isActive !==
                        false
                          ? "#047857"
                          : "#b91c1c",
                    }}
                  >
                    {selectedUser.isActive !==
                    false
                      ? "Active"
                      : "Inactive"}
                  </div>
                </div>

                {/* VERIFICATION */}

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #eef0f3",
                    borderRadius:
                      "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "10px",
                      fontWeight:
                        800,
                      color:
                        "#9ca3af",
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.05em",
                      marginBottom:
                        "6px",
                    }}
                  >
                    Verification
                  </div>

                  <div
                    style={{
                      fontSize:
                        "14px",
                      fontWeight:
                        800,
                      color:
                        isUserVerified(
                          selectedUser
                        )
                          ? "#047857"
                          : "#c2410c",
                    }}
                  >
                    {isUserVerified(
                      selectedUser
                    )
                      ? "✓ Verified"
                      : "Pending"}
                  </div>
                </div>

                {/* LOCATION */}

                <div
                  style={{
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #eef0f3",
                    borderRadius:
                      "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "10px",
                      fontWeight:
                        800,
                      color:
                        "#9ca3af",
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.05em",
                      marginBottom:
                        "6px",
                    }}
                  >
                    Location
                  </div>

                  <div
                    style={{
                      fontSize:
                        "14px",
                      fontWeight:
                        700,
                      color:
                        "#111827",
                    }}
                  >
                    {selectedUser.location ||
                      "Ghana"}
                  </div>
                </div>

                {/* EMAIL */}

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #eef0f3",
                    borderRadius:
                      "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "10px",
                      fontWeight:
                        800,
                      color:
                        "#9ca3af",
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.05em",
                      marginBottom:
                        "6px",
                    }}
                  >
                    Email
                  </div>

                  <div
                    style={{
                      fontSize:
                        "13px",
                      fontWeight:
                        700,
                      color:
                        "#111827",
                      wordBreak:
                        "break-all",
                    }}
                  >
                    {selectedUser.email ||
                      "—"}
                  </div>
                </div>

                {/* PHONE */}

                {selectedUser.phone && (
                  <div
                    style={{
                      gridColumn:
                        "1 / -1",
                      padding:
                        "15px",
                      background:
                        "#f8fafc",
                      border:
                        "1px solid #eef0f3",
                      borderRadius:
                        "14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "10px",
                        fontWeight:
                          800,
                        color:
                          "#9ca3af",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.05em",
                        marginBottom:
                          "6px",
                      }}
                    >
                      Phone
                    </div>

                    <div
                      style={{
                        fontSize:
                          "13px",
                        fontWeight:
                          700,
                        color:
                          "#111827",
                      }}
                    >
                      {selectedUser.phone}
                    </div>
                  </div>
                )}

                {/* JOINED */}

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                    padding:
                      "15px",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #eef0f3",
                    borderRadius:
                      "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "10px",
                      fontWeight:
                        800,
                      color:
                        "#9ca3af",
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.05em",
                      marginBottom:
                        "6px",
                    }}
                  >
                    Joined
                  </div>

                  <div
                    style={{
                      fontSize:
                        "13px",
                      fontWeight:
                        700,
                      color:
                        "#111827",
                    }}
                  >
                    {formatDate(
                      selectedUser.createdAt
                    )}
                  </div>
                </div>

                {/* VERIFIED DATE */}

                {selectedUser.verifiedAt && (
                  <div
                    style={{
                      gridColumn:
                        "1 / -1",
                      padding:
                        "15px",
                      background:
                        "#ecfdf5",
                      border:
                        "1px solid #a7f3d0",
                      borderRadius:
                        "14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "10px",
                        fontWeight:
                          800,
                        color:
                          "#047857",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.05em",
                        marginBottom:
                          "6px",
                      }}
                    >
                      Verified At
                    </div>

                    <div
                      style={{
                        fontSize:
                          "13px",
                        fontWeight:
                          700,
                        color:
                          "#065f46",
                      }}
                    >
                      {new Date(
                        selectedUser.verifiedAt
                      ).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* ==================================================
                  MODAL ACTIONS
              ================================================== */}

              {!String(
                selectedUser.role ||
                  ""
              )
                .toLowerCase()
                .includes("admin") && (
                <div
                  style={{
                    display:
                      "flex",
                    gap: "8px",
                    marginTop:
                      "18px",
                  }}
                >
                  {isUserVerified(
                    selectedUser
                  ) ? (
                    <button
                      onClick={() => {
                        onUnverifyUser?.(
                          getUserId(
                            selectedUser
                          )
                        );

                        setSelectedUser(
                          null
                        );
                      }}
                      disabled={
                        Boolean(
                          verifyingUser?.[
                            getUserId(
                              selectedUser
                            )
                          ]
                        )
                      }
                      style={{
                        flex: 1,
                        padding:
                          "11px",
                        borderRadius:
                          "10px",
                        border:
                          "1px solid #fed7aa",
                        background:
                          "#fff7ed",
                        color:
                          "#c2410c",
                        fontWeight:
                          800,
                        cursor:
                          "pointer",
                      }}
                    >
                      Unverify User
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onVerifyUser?.(
                          getUserId(
                            selectedUser
                          )
                        );

                        setSelectedUser(
                          null
                        );
                      }}
                      disabled={
                        Boolean(
                          verifyingUser?.[
                            getUserId(
                              selectedUser
                            )
                          ]
                        )
                      }
                      style={{
                        flex: 1,
                        padding:
                          "11px",
                        borderRadius:
                          "10px",
                        border:
                          "1px solid #a7f3d0",
                        background:
                          "#ecfdf5",
                        color:
                          "#047857",
                        fontWeight:
                          800,
                        cursor:
                          "pointer",
                      }}
                    >
                      Verify User
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() =>
                  setSelectedUser(
                    null
                  )
                }
                style={{
                  width:
                    "100%",
                  marginTop:
                    "10px",
                  padding:
                    "12px",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "10px",
                  background:
                    "#ffffff",
                  color:
                    "#374151",
                  fontWeight:
                    800,
                  cursor:
                    "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================
// EXPORT
// ============================================================

export default UsersTable;