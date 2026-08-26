// frontend/src/admin/Sellers.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getAdminUsers, updateAdminUserRole, deleteAdminUser } from "../services/api";
import { getImageUrl } from "../services/api";

const Sellers = () => {
  const { token } = useAuth();

  // ─── State ──────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ─── Fetch users ───────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      };

      const data = await getAdminUsers(params, token);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter, statusFilter, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ─── Actions ───────────────────────────────────────────────────
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to "${newRole}"?`)) return;

    try {
      setActionLoading(true);
      await updateAdminUserRole(userId, newRole, token);
      // Refresh list
      fetchUsers();
    } catch (err) {
      alert(`Failed to update role: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      setActionLoading(true);
      await deleteAdminUser(userId, token);
      fetchUsers();
    } catch (err) {
      alert(`Failed to delete user: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Render helpers ────────────────────────────────────────────
  const totalPages = Math.ceil(total / limit);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "#dc2626";
      case "seller":
        return "#2563eb";
      default:
        return "#6b7280";
    }
  };

  const getStatusBadgeColor = (status) => {
    if (status === "active") return "#22c55e";
    if (status === "suspended") return "#f59e0b";
    if (status === "banned") return "#dc2626";
    return "#6b7280";
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
        👥 Seller Management
      </h1>

      {/* ─── Filters ─────────────────────────────────────────────── */}
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
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            flex: "1 1 200px",
            fontSize: "14px",
          }}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          <option value="">All Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>

        <button
          onClick={() => {
            setPage(1);
            fetchUsers();
          }}
          style={{
            padding: "8px 16px",
            background: "var(--primary, #2563eb)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Apply Filters
        </button>

        <button
          onClick={() => {
            setSearch("");
            setRoleFilter("");
            setStatusFilter("");
            setPage(1);
            fetchUsers();
          }}
          style={{
            padding: "8px 16px",
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* ─── Error ───────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* ─── Table ───────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          No users found.
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>User</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Email</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Phone</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Role</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{ borderTop: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <img
                        src={getImageUrl(user.avatar || user.profileImage)}
                        alt={user.name}
                        style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span>{user.name}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>{user.email}</td>
                    <td style={{ padding: "12px 16px" }}>{user.phone || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background: getRoleBadgeColor(user.role),
                          color: "white",
                          padding: "2px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background: getStatusBadgeColor(user.status || "active"),
                          color: "white",
                          padding: "2px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {user.status || "active"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                        {/* Role change dropdown */}
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          disabled={actionLoading}
                          style={{
                            padding: "4px 6px",
                            fontSize: "12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            background: "white",
                          }}
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Status toggle (suspend/activate) */}
                        <button
                          onClick={() =>
                            handleRoleChange(
                              user._id,
                              user.status === "active" ? "suspended" : "active"
                            )
                          }
                          disabled={actionLoading}
                          style={{
                            padding: "4px 10px",
                            fontSize: "12px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            background: user.status === "active" ? "#f59e0b" : "#22c55e",
                            color: "white",
                          }}
                        >
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={actionLoading}
                          style={{
                            padding: "4px 10px",
                            fontSize: "12px",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            background: "#dc2626",
                            color: "white",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ─── Pagination ───────────────────────────────────────── */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  background: "white",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: "14px" }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: "6px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  background: "white",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  opacity: page === totalPages ? 0.5 : 1,
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