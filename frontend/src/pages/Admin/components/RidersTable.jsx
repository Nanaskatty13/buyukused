// frontend/src/pages/Admin/components/RidersTable.jsx
import React, { useState, useMemo } from "react";
import { approveRider, rejectRider, updateUser } from "../../../services/api";

export default function RidersTable({ riders, loading, refreshData, showNotification, searchTerm }) {
  const [processingId, setProcessingId] = useState(null);

  const filteredRiders = useMemo(() => {
    if (!searchTerm) return riders;
    const term = searchTerm.toLowerCase();
    return riders.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term) ||
        r.phone?.toLowerCase().includes(term) ||
        r.riderProfile?.bikeType?.toLowerCase().includes(term) ||
        r.riderProfile?.bikeNumber?.toLowerCase().includes(term) ||
        r.riderProfile?.serviceArea?.toLowerCase().includes(term)
    );
  }, [riders, searchTerm]);

  // ─── Approve ──────────────────────────────────────────────
  const handleApprove = async (riderId) => {
    try {
      setProcessingId(riderId);
      await approveRider(riderId);
      showNotification("Rider approved successfully", "success");
      await refreshData();
    } catch (error) {
      showNotification(error.message || "Failed to approve rider", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // ─── Reject (remove approval) ────────────────────────────
  const handleReject = async (riderId) => {
    if (!window.confirm("Are you sure you want to remove this rider's approval?")) return;
    try {
      setProcessingId(riderId);
      await rejectRider(riderId);
      showNotification("Rider approval removed", "success");
      await refreshData();
    } catch (error) {
      showNotification(error.message || "Failed to remove approval", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // ─── Toggle active account ───────────────────────────────
  const handleToggleActive = async (rider) => {
    const nextStatus = rider.isActive === false;
    const action = nextStatus ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${action} this rider account?`)) return;
    try {
      setProcessingId(rider._id);
      await updateUser(rider._id, { isActive: nextStatus });
      showNotification(nextStatus ? "Rider account activated" : "Rider account deactivated", "success");
      await refreshData();
    } catch (error) {
      showNotification(error.message || "Failed to update rider account", "error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="admin-loading">Loading riders...</div>;
  if (!filteredRiders.length) {
    return (
      <div className="admin-card" style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "42px", marginBottom: "12px" }}>🏍️</div>
        <h3>No riders found</h3>
        <p style={{ color: "#6b7280" }}>Rider accounts will appear here when users register as riders.</p>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Rider Management</h2>
          <p style={{ margin: "6px 0 0", color: "#6b7280" }}>Manage rider applications, approvals and accounts.</p>
        </div>
        <button onClick={refreshData} style={{ border: "1px solid #d1d5db", background: "#fff", padding: "9px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
          ↻ Refresh
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1050px" }}>
          <thead>
            <tr>
              <th>Rider</th>
              <th>Contact</th>
              <th>Motorcycle</th>
              <th>Service Area</th>
              <th>Approval</th>
              <th>Availability</th>
              <th>Deliveries</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRiders.map((rider) => {
              const profile = rider.riderProfile || {};
              const approved = profile.isApproved === true;
              const available = profile.isAvailable === true;
              const active = rider.isActive !== false;
              const processing = processingId === rider._id;

              return (
                <tr key={rider._id}>
                  <td style={{ padding: "14px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {rider.avatar || rider.photoURL ? (
                        <img src={rider.avatar || rider.photoURL} alt={rider.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                          {rider.name?.charAt(0)?.toUpperCase() || "R"}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700 }}>{rider.name || "Unnamed Rider"}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>{rider.email || "No email"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <div>{rider.phone || "No phone"}</div>
                    <small style={{ color: "#6b7280" }}>{rider.location || "Ghana"}</small>
                  </td>
                  <td style={{ padding: "14px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <strong>{profile.bikeType || "Not provided"}</strong>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "3px" }}>{profile.bikeNumber || "No bike number"}</div>
                  </td>
                  <td style={{ padding: "14px 12px", borderBottom: "1px solid #f1f5f9" }}>{profile.serviceArea || "Not specified"}</td>
                  <td style={{ padding: "14px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ display: "inline-flex", padding: "5px 9px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, background: approved ? "#dcfce7" : "#fef3c7", color: approved ? "#166534" : "#92400e" }}>
                      {approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ display: "inline-flex", padding: "5px 9px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, background: available ? "#dcfce7" : "#f3f4f6", color: available ? "#166534" : "#4b5563" }}>
                      {available ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <strong>{profile.completedDeliveries}</strong>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>⭐ {Number(profile.rating ?? 5).toFixed(1)}</div>
                  </td>
                  <td style={{ padding: "14px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                      {!approved ? (
                        <button onClick={() => handleApprove(rider._id)} disabled={processing} style={{ border: "none", background: "#16a34a", color: "#fff", padding: "7px 10px", borderRadius: "7px", cursor: processing ? "not-allowed" : "pointer", fontWeight: 600, opacity: processing ? 0.6 : 1 }}>
                          ✓ Approve
                        </button>
                      ) : (
                        <button onClick={() => handleReject(rider._id)} disabled={processing} style={{ border: "1px solid #dc2626", background: "#fff", color: "#dc2626", padding: "7px 10px", borderRadius: "7px", cursor: processing ? "not-allowed" : "pointer", fontWeight: 600, opacity: processing ? 0.6 : 1 }}>
                          Remove Approval
                        </button>
                      )}
                      <button onClick={() => handleToggleActive(rider)} disabled={processing} style={{ border: "1px solid #d1d5db", background: active ? "#fff" : "#111827", color: active ? "#374151" : "#fff", padding: "7px 10px", borderRadius: "7px", cursor: processing ? "not-allowed" : "pointer", fontWeight: 600, opacity: processing ? 0.6 : 1 }}>
                        {active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}