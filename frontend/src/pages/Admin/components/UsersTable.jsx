// ============================================================
// components/UsersTable.jsx
// BuyUKUsed - Admin Users Table
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

  // ----------------------------------------------------------
  // VERIFY / UNVERIFY PROPS
  // ----------------------------------------------------------

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
  // GUARD AGAINST MISSING USERS
  // ==========================================================

  if (!users) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "var(--gray-500)",
        }}
      >
        No users data
      </div>
    );
  }

  // ==========================================================
  // EDIT USER
  // ==========================================================

  const handleEdit = (user) => {
    setEditingUser(user._id);

    setEditForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "buyer",
      isActive: user.isActive !== false,
    });
  };

  // ==========================================================
  // SAVE USER
  // ==========================================================

  const handleSave = async (id) => {
    try {
      const result = await updateUser(
        id,
        editForm,
        token
      );

      if (result?.success) {
        showNotification?.(
          "User updated successfully",
          "success"
        );

        refreshData?.();

        setEditingUser(null);
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
        "Delete this user?"
      )
    ) {
      return;
    }

    try {
      const result = await deleteUser(
        id,
        token
      );

      if (result?.success) {
        showNotification?.(
          "User deleted",
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
  // VERIFY STATUS HELPER
  // ==========================================================
  //
  // The primary field is:
  //
  // user.isVerified
  //
  // Additional fields are checked as compatibility fallbacks.
  //
  // ==========================================================

  const isUserVerified = (user) => {
    if (!user) {
      return false;
    }

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
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "var(--gray-500)",
        }}
      >
        Loading users...
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="table-container">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <h2>
        👥 Users ({users.length})
      </h2>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          className="admin-table"
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
            minWidth: "950px",
          }}
        >
          {/* ==================================================
              TABLE HEADER
              ================================================== */}

          <thead>
            <tr
              style={{
                background:
                  "#f3f4f6",
              }}
            >
              <th
                style={{
                  padding: "10px",
                  textAlign:
                    "left",
                }}
              >
                Name
              </th>

              <th
                style={{
                  padding: "10px",
                  textAlign:
                    "left",
                }}
              >
                Email
              </th>

              <th
                style={{
                  padding: "10px",
                  textAlign:
                    "left",
                }}
              >
                Role
              </th>

              <th
                style={{
                  padding: "10px",
                  textAlign:
                    "left",
                }}
              >
                Status
              </th>

              <th
                style={{
                  padding: "10px",
                  textAlign:
                    "center",
                }}
              >
                Verified
              </th>

              <th
                style={{
                  padding: "10px",
                  textAlign:
                    "left",
                }}
              >
                Location
              </th>

              <th
                style={{
                  padding: "10px",
                  textAlign:
                    "left",
                }}
              >
                Joined
              </th>

              <th
                style={{
                  padding: "10px",
                  textAlign:
                    "left",
                  minWidth: "300px",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* ==================================================
              TABLE BODY
              ================================================== */}

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    padding:
                      "40px 20px",
                    textAlign:
                      "center",
                    color:
                      "var(--gray-500)",
                  }}
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const verified =
                  isUserVerified(
                    user
                  );

                const userId =
                  user._id ||
                  user.id;

                const isVerifying =
                  Boolean(
                    verifyingUser?.[
                      userId
                    ]
                  );

                const isAdmin =
                  String(
                    user.role || ""
                  ).toLowerCase() ===
                  "admin";

                return (
                  <tr
                    key={userId}
                    style={{
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    {/* ==================================================
                        EDIT MODE
                        ================================================== */}

                    {editingUser ===
                    userId ? (
                      <>
                        {/* NAME */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
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
                                  name: e
                                    .target
                                    .value,
                                }
                              )
                            }
                            style={{
                              padding:
                                "6px",
                              width:
                                "100%",
                              boxSizing:
                                "border-box",
                            }}
                          />
                        </td>

                        {/* EMAIL */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
                          <input
                            value={
                              editForm.email
                            }
                            onChange={(
                              e
                            ) =>
                              setEditForm(
                                {
                                  ...editForm,
                                  email:
                                    e
                                      .target
                                      .value,
                                }
                              )
                            }
                            style={{
                              padding:
                                "6px",
                              width:
                                "100%",
                              boxSizing:
                                "border-box",
                            }}
                          />
                        </td>

                        {/* ROLE */}

                        <td
                          style={{
                            padding:
                              "8px",
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
                                "6px",
                              width:
                                "100%",
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

                        {/* STATUS */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
                          <label>
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
                            />{" "}
                            Active
                          </label>
                        </td>

                        {/* VERIFIED */}

                        <td
                          style={{
                            padding:
                              "8px",
                            textAlign:
                              "center",
                          }}
                        >
                          {verified
                            ? "✅ Yes"
                            : "❌ No"}
                        </td>

                        {/* LOCATION */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
                          —
                        </td>

                        {/* JOINED */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
                          —
                        </td>

                        {/* ACTIONS */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
                          <button
                            onClick={() =>
                              handleSave(
                                userId
                              )
                            }
                            style={{
                              background:
                                "#16a34a",
                              color:
                                "white",
                              border:
                                "none",
                              padding:
                                "4px 12px",
                              borderRadius:
                                "4px",
                              cursor:
                                "pointer",
                              marginRight:
                                "4px",
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
                              background:
                                "#6b7280",
                              color:
                                "white",
                              border:
                                "none",
                              padding:
                                "4px 12px",
                              borderRadius:
                                "4px",
                              cursor:
                                "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* ==================================================
                            NAME
                            ================================================== */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
                          {user.name ||
                            "Unnamed User"}
                        </td>

                        {/* ==================================================
                            EMAIL
                            ================================================== */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
                          {user.email ||
                            "—"}
                        </td>

                        {/* ==================================================
                            ROLE
                            ================================================== */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
                          <span
                            style={{
                              background:
                                user.role ===
                                "admin"
                                  ? "#8b5cf6"
                                  : user.role ===
                                    "seller"
                                  ? "#f59e0b"
                                  : user.role ===
                                    "rider"
                                  ? "#3b82f6"
                                  : "#10b981",

                              color:
                                "white",

                              padding:
                                "2px 10px",

                              borderRadius:
                                "12px",

                              fontSize:
                                "12px",

                              textTransform:
                                "capitalize",
                            }}
                          >
                            {user.role ||
                              "buyer"}
                          </span>
                        </td>

                        {/* ==================================================
                            STATUS
                            ================================================== */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
                          <span
                            style={{
                              color:
                                user.isActive !==
                                false
                                  ? "#16a34a"
                                  : "#dc2626",
                              fontWeight:
                                600,
                            }}
                          >
                            {user.isActive !==
                            false
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* ==================================================
                            VERIFIED
                            ================================================== */}

                        <td
                          style={{
                            padding:
                              "8px",
                            textAlign:
                              "center",
                          }}
                        >
                          {verified ? (
                            <span
                              style={{
                                color:
                                  "#16a34a",
                                fontWeight:
                                  700,
                              }}
                            >
                              ✅ Yes
                            </span>
                          ) : (
                            <span
                              style={{
                                color:
                                  "#dc2626",
                                fontWeight:
                                  700,
                              }}
                            >
                              ❌ No
                            </span>
                          )}
                        </td>

                        {/* ==================================================
                            LOCATION
                            ================================================== */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
                          {user.location ||
                            "—"}
                        </td>

                        {/* ==================================================
                            JOINED
                            ================================================== */}

                        <td
                          style={{
                            padding:
                              "8px",
                            fontSize:
                              "12px",
                            color:
                              "var(--gray-500)",
                          }}
                        >
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* ==================================================
                            ACTIONS
                            ================================================== */}

                        <td
                          style={{
                            padding:
                              "8px",
                          }}
                        >
                          {/* STATS */}

                          <button
                            onClick={() =>
                              setSelectedUser(
                                user
                              )
                            }
                            style={{
                              background:
                                "#6b7280",
                              color:
                                "white",
                              border:
                                "none",
                              padding:
                                "4px 10px",
                              borderRadius:
                                "4px",
                              cursor:
                                "pointer",
                              marginRight:
                                "4px",
                              fontSize:
                                "12px",
                            }}
                          >
                            Stats
                          </button>

                          {/* EDIT */}

                          <button
                            onClick={() =>
                              handleEdit(
                                user
                              )
                            }
                            style={{
                              background:
                                "#3b82f6",
                              color:
                                "white",
                              border:
                                "none",
                              padding:
                                "4px 12px",
                              borderRadius:
                                "4px",
                              cursor:
                                "pointer",
                              marginRight:
                                "4px",
                            }}
                          >
                            Edit
                          </button>

                          {/* DELETE */}

                          <button
                            onClick={() =>
                              handleDelete(
                                userId
                              )
                            }
                            style={{
                              background:
                                "#dc2626",
                              color:
                                "white",
                              border:
                                "none",
                              padding:
                                "4px 12px",
                              borderRadius:
                                "4px",
                              cursor:
                                "pointer",
                              marginRight:
                                "4px",
                            }}
                          >
                            Delete
                          </button>

                          {/* ==================================================
                              VERIFY / UNVERIFY
                              ================================================== */}

                          {!isAdmin ? (
                            verified ? (
                              <button
                                onClick={() =>
                                  onUnverifyUser?.(
                                    userId
                                  )
                                }
                                disabled={
                                  isVerifying
                                }
                                style={{
                                  background:
                                    "#dc2626",
                                  color:
                                    "white",
                                  border:
                                    "none",
                                  padding:
                                    "4px 12px",
                                  borderRadius:
                                    "4px",
                                  cursor:
                                    isVerifying
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    isVerifying
                                      ? 0.6
                                      : 1,
                                  fontSize:
                                    "12px",
                                  marginTop:
                                    "4px",
                                  display:
                                    "inline-block",
                                }}
                              >
                                {isVerifying
                                  ? "Unverifying..."
                                  : "Unverify"}
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  onVerifyUser?.(
                                    userId
                                  )
                                }
                                disabled={
                                  isVerifying
                                }
                                style={{
                                  background:
                                    "#16a34a",
                                  color:
                                    "white",
                                  border:
                                    "none",
                                  padding:
                                    "4px 12px",
                                  borderRadius:
                                    "4px",
                                  cursor:
                                    isVerifying
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    isVerifying
                                      ? 0.6
                                      : 1,
                                  fontSize:
                                    "12px",
                                  marginTop:
                                    "4px",
                                  display:
                                    "inline-block",
                                }}
                              >
                                {isVerifying
                                  ? "Verifying..."
                                  : "Verify"}
                              </button>
                            )
                          ) : (
                            <span
                              style={{
                                display:
                                  "inline-block",
                                marginTop:
                                  "6px",
                                fontSize:
                                  "11px",
                                color:
                                  "var(--gray-400)",
                              }}
                            >
                              Admin
                            </span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ==========================================================
          USER STATS MODAL
          ========================================================== */}

      {selectedUser && (
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
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            zIndex: 9999,
            padding: "20px",
            boxSizing:
              "border-box",
          }}
          onClick={() =>
            setSelectedUser(null)
          }
        >
          <div
            style={{
              background:
                "white",
              borderRadius:
                "var(--radius-xl)",
              maxWidth:
                "480px",
              width: "100%",
              padding:
                "32px",
              position:
                "relative",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              boxSizing:
                "border-box",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* CLOSE */}

            <button
              onClick={() =>
                setSelectedUser(
                  null
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

            {/* TITLE */}

            <h2
              style={{
                fontSize:
                  "24px",
                fontWeight:
                  800,
                marginBottom:
                  "8px",
              }}
            >
              📊 User Stats
            </h2>

            <p
              style={{
                color:
                  "var(--gray-500)",
                marginBottom:
                  "20px",
              }}
            >
              {selectedUser.name ||
                "Unnamed User"}
            </p>

            {/* ==================================================
                USER DETAILS
                ================================================== */}

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
                  background:
                    "var(--gray-50)",
                  padding:
                    "14px",
                  borderRadius:
                    "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "var(--gray-400)",
                  }}
                >
                  Role
                </div>

                <div
                  style={{
                    fontWeight:
                      600,
                    textTransform:
                      "capitalize",
                  }}
                >
                  {selectedUser.role ||
                    "buyer"}
                </div>
              </div>

              {/* STATUS */}

              <div
                style={{
                  background:
                    "var(--gray-50)",
                  padding:
                    "14px",
                  borderRadius:
                    "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "var(--gray-400)",
                  }}
                >
                  Status
                </div>

                <div
                  style={{
                    fontWeight:
                      600,
                    color:
                      selectedUser.isActive !==
                      false
                        ? "#16a34a"
                        : "#dc2626",
                  }}
                >
                  {selectedUser.isActive !==
                  false
                    ? "Active"
                    : "Inactive"}
                </div>
              </div>

              {/* VERIFIED */}

              <div
                style={{
                  background:
                    "var(--gray-50)",
                  padding:
                    "14px",
                  borderRadius:
                    "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "var(--gray-400)",
                  }}
                >
                  Verification
                </div>

                <div
                  style={{
                    fontWeight:
                      600,
                    color:
                      isUserVerified(
                        selectedUser
                      )
                        ? "#16a34a"
                        : "#dc2626",
                  }}
                >
                  {isUserVerified(
                    selectedUser
                  )
                    ? "✅ Verified"
                    : "❌ Not Verified"}
                </div>
              </div>

              {/* LOCATION */}

              <div
                style={{
                  background:
                    "var(--gray-50)",
                  padding:
                    "14px",
                  borderRadius:
                    "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "var(--gray-400)",
                  }}
                >
                  Location
                </div>

                <div
                  style={{
                    fontWeight:
                      600,
                  }}
                >
                  {selectedUser.location ||
                    "—"}
                </div>
              </div>

              {/* JOINED */}

              <div
                style={{
                  background:
                    "var(--gray-50)",
                  padding:
                    "14px",
                  borderRadius:
                    "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "var(--gray-400)",
                  }}
                >
                  Joined
                </div>

                <div
                  style={{
                    fontWeight:
                      600,
                  }}
                >
                  {selectedUser.createdAt
                    ? new Date(
                        selectedUser.createdAt
                      ).toLocaleDateString()
                    : "—"}
                </div>
              </div>

              {/* EMAIL */}

              <div
                style={{
                  background:
                    "var(--gray-50)",
                  padding:
                    "14px",
                  borderRadius:
                    "var(--radius-md)",
                  gridColumn:
                    "1 / -1",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "var(--gray-400)",
                  }}
                >
                  Email
                </div>

                <div
                  style={{
                    fontWeight:
                      600,
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
                    background:
                      "var(--gray-50)",
                    padding:
                      "14px",
                    borderRadius:
                      "var(--radius-md)",
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "11px",
                      color:
                        "var(--gray-400)",
                    }}
                  >
                    Phone
                  </div>

                  <div
                    style={{
                      fontWeight:
                        600,
                    }}
                  >
                    {selectedUser.phone}
                  </div>
                </div>
              )}

              {/* VERIFICATION DATE */}

              {selectedUser.verifiedAt && (
                <div
                  style={{
                    background:
                      "var(--gray-50)",
                    padding:
                      "14px",
                    borderRadius:
                      "var(--radius-md)",
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "11px",
                      color:
                        "var(--gray-400)",
                    }}
                  >
                    Verified At
                  </div>

                  <div
                    style={{
                      fontWeight:
                        600,
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
                CLOSE BUTTON
                ================================================== */}

            <button
              onClick={() =>
                setSelectedUser(
                  null
                )
              }
              style={{
                width: "100%",
                padding:
                  "12px",
                marginTop:
                  "20px",
                background:
                  "var(--gray-200)",
                border:
                  "none",
                borderRadius:
                  "var(--radius-full)",
                fontWeight:
                  600,
                cursor:
                  "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// EXPORT
// ============================================================

export default UsersTable;