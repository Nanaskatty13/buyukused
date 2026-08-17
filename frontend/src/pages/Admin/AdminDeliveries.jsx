import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deliveries,
} from "../../services/api";

import {
  getToken,
} from "../../utils/storage";

import {
  FaMotorcycle,
  FaBox,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSyncAlt,
} from "react-icons/fa";

const STATUS_OPTIONS = [
  "pending",
  "accepted",
  "picked_up",
  "in_transit",
  "delivered",
  "cancelled",
];

const statusLabel = (status) => {
  switch (status) {
    case "pending":
      return "Pending";

    case "accepted":
      return "Accepted";

    case "picked_up":
      return "Picked Up";

    case "in_transit":
      return "In Transit";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    default:
      return status || "Unknown";
  }
};

const statusClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";

    case "accepted":
      return "bg-blue-100 text-blue-800";

    case "picked_up":
      return "bg-indigo-100 text-indigo-800";

    case "in_transit":
      return "bg-purple-100 text-purple-800";

    case "delivered":
      return "bg-green-100 text-green-800";

    case "cancelled":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  try {
    return new Date(date).toLocaleString();
  } catch {
    return "—";
  }
};

const getId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || "";
};

const getList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.deliveries)) {
    return response.deliveries;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.deliveries)) {
    return response.data.deliveries;
  }

  return [];
};

function AdminDeliveries() {
  const [deliveriesList, setDeliveriesList] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [selectedDelivery, setSelectedDelivery] =
    useState(null);

  const token = getToken();

  // ============================================================
  // FETCH DELIVERIES
  // ============================================================

  const fetchDeliveries = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await deliveries.getAll(
            {},
            token
          );

        setDeliveriesList(
          getList(response)
        );
      } catch (err) {
        console.error(
          "Failed to load deliveries:",
          err
        );

        setError(
          err?.message ||
            "Unable to load deliveries."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredDeliveries =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return deliveriesList.filter(
        (delivery) => {
          const matchesStatus =
            statusFilter === "all" ||
            delivery.status ===
              statusFilter;

          if (!matchesStatus) {
            return false;
          }

          if (!query) {
            return true;
          }

          const searchable = [
            delivery.productTitle,
            delivery.pickupLocation,
            delivery.deliveryLocation,
            delivery.buyerName,
            delivery.buyerPhone,
            delivery.sellerName,
            delivery.sellerPhone,
            delivery.riderName,
            delivery.riderPhone,
            delivery.riderBikeNumber,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      deliveriesList,
      statusFilter,
      search,
    ]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const stats = useMemo(() => {
    const total =
      deliveriesList.length;

    const pending =
      deliveriesList.filter(
        (item) =>
          item.status === "pending"
      ).length;

    const active =
      deliveriesList.filter(
        (item) =>
          [
            "accepted",
            "picked_up",
            "in_transit",
          ].includes(item.status)
      ).length;

    const completed =
      deliveriesList.filter(
        (item) =>
          item.status === "delivered"
      ).length;

    const cancelled =
      deliveriesList.filter(
        (item) =>
          item.status === "cancelled"
      ).length;

    const revenue =
      deliveriesList.reduce(
        (sum, item) =>
          sum +
          Number(
            item.deliveryFee || 0
          ),
        0
      );

    return {
      total,
      pending,
      active,
      completed,
      cancelled,
      revenue,
    };
  }, [deliveriesList]);

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  const handleStatusChange = async (
    delivery,
    status
  ) => {
    const id = getId(delivery);

    if (!id) {
      return;
    }

    try {
      await deliveries.updateStatus(
        id,
        status,
        token
      );

      setDeliveriesList((current) =>
        current.map((item) =>
          getId(item) === id
            ? {
                ...item,
                status,
              }
            : item
        )
      );

      setSelectedDelivery(
        (current) =>
          current &&
          getId(current) === id
            ? {
                ...current,
                status,
              }
            : current
      );
    } catch (err) {
      console.error(
        "Failed to update delivery:",
        err
      );

      alert(
        err?.message ||
          "Failed to update delivery."
      );
    }
  };

  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = async (
    delivery
  ) => {
    const id = getId(delivery);

    if (!id) {
      return;
    }

    const reason =
      window.prompt(
        "Reason for cancellation:"
      );

    if (reason === null) {
      return;
    }

    try {
      await deliveries.cancel(
        id,
        reason,
        token
      );

      setDeliveriesList((current) =>
        current.map((item) =>
          getId(item) === id
            ? {
                ...item,
                status: "cancelled",
                cancellationReason:
                  reason,
              }
            : item
        )
      );

      setSelectedDelivery(
        (current) =>
          current &&
          getId(current) === id
            ? {
                ...current,
                status: "cancelled",
                cancellationReason:
                  reason,
              }
            : current
      );
    } catch (err) {
      console.error(
        "Failed to cancel delivery:",
        err
      );

      alert(
        err?.message ||
          "Failed to cancel delivery."
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <FaMotorcycle className="mx-auto mb-4 animate-pulse text-4xl text-gray-700" />

          <p className="text-gray-600">
            Loading delivery system...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Riders & Deliveries
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage all delivery activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            fetchDeliveries(true)
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          <FaSyncAlt
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">

        <StatCard
          title="Total"
          value={stats.total}
          icon={<FaBox />}
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<FaClock />}
        />

        <StatCard
          title="Active"
          value={stats.active}
          icon={<FaMotorcycle />}
        />

        <StatCard
          title="Delivered"
          value={stats.completed}
          icon={<FaCheckCircle />}
        />

        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={<FaTimesCircle />}
        />

        <StatCard
          title="Fees"
          value={`GHS ${stats.revenue.toLocaleString()}`}
          icon={<span>₵</span>}
        />

      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="grid gap-3 md:grid-cols-2">

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search rider, buyer, seller, location..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
          >
            <option value="all">
              All statuses
            </option>

            {STATUS_OPTIONS.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {statusLabel(status)}
                </option>
              )
            )}
          </select>

        </div>
      </div>

      {/* ======================================================
          DELIVERY LIST
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {filteredDeliveries.length === 0 ? (
          <div className="px-6 py-16 text-center">

            <FaMotorcycle className="mx-auto mb-4 text-4xl text-gray-300" />

            <h3 className="font-semibold text-gray-900">
              No deliveries found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are no deliveries matching your filters.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-full text-sm">

              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Delivery
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Buyer
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Seller
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Rider
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Fee
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Date
                  </th>

                  <th className="px-4 py-3 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {filteredDeliveries.map(
                  (delivery) => {
                    const id =
                      getId(delivery);

                    return (
                      <tr
                        key={id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-4 py-4">

                          <div className="font-medium text-gray-900">
                            {delivery.productTitle ||
                              "General delivery"}
                          </div>

                          <div className="mt-1 max-w-xs text-xs text-gray-500">
                            <span>
                              {delivery.pickupLocation}
                            </span>

                            <span className="mx-1">
                              →
                            </span>

                            <span>
                              {delivery.deliveryLocation}
                            </span>
                          </div>

                        </td>

                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {delivery.buyerName ||
                              "—"}
                          </div>

                          <div className="text-xs text-gray-500">
                            {delivery.buyerPhone ||
                              "—"}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {delivery.sellerName ||
                              "—"}
                          </div>

                          <div className="text-xs text-gray-500">
                            {delivery.sellerPhone ||
                              "—"}
                          </div>
                        </td>

                        <td className="px-4 py-4">

                          {delivery.riderName ? (
                            <>
                              <div className="flex items-center gap-2 font-medium">
                                <FaMotorcycle />

                                {delivery.riderName}
                              </div>

                              <div className="text-xs text-gray-500">
                                {delivery.riderPhone ||
                                  "—"}
                              </div>

                              {delivery.riderBikeNumber && (
                                <div className="text-xs text-gray-500">
                                  Bike:{" "}
                                  {
                                    delivery.riderBikeNumber
                                  }
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No rider assigned
                            </span>
                          )}

                        </td>

                        <td className="px-4 py-4 font-medium">
                          GHS{" "}
                          {Number(
                            delivery.deliveryFee ||
                              0
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                              delivery.status
                            )}`}
                          >
                            {statusLabel(
                              delivery.status
                            )}
                          </span>

                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-xs text-gray-500">
                          {formatDate(
                            delivery.createdAt
                          )}
                        </td>

                        <td className="px-4 py-4 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedDelivery(
                                delivery
                              )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-100"
                          >
                            Manage
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ======================================================
          DETAILS MODAL
      ====================================================== */}

      {selectedDelivery && (
        <DeliveryModal
          delivery={
            selectedDelivery
          }
          onClose={() =>
            setSelectedDelivery(
              null
            )
          }
          onStatusChange={
            handleStatusChange
          }
          onCancel={
            handleCancel
          }
        />
      )}

    </div>
  );
}

// ================================================================
// STAT CARD
// ================================================================

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

      <div className="mb-3 flex items-center justify-between text-gray-500">
        <span className="text-xs font-medium">
          {title}
        </span>

        <span>
          {icon}
        </span>
      </div>

      <div className="text-xl font-bold text-gray-900">
        {value}
      </div>

    </div>
  );
}

// ================================================================
// DELIVERY MODAL
// ================================================================

function DeliveryModal({
  delivery,
  onClose,
  onStatusChange,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >

      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="flex items-center justify-between border-b px-6 py-4">

          <div>
            <h3 className="text-lg font-bold">
              Delivery Details
            </h3>

            <p className="text-xs text-gray-500">
              {getId(delivery)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>

        </div>

        <div className="space-y-6 p-6">

          {/* PRODUCT */}

          <section>

            <h4 className="mb-3 font-semibold">
              Product
            </h4>

            <div className="rounded-xl bg-gray-50 p-4">

              <div className="font-medium">
                {delivery.productTitle ||
                  "General delivery"}
              </div>

              {delivery.product && (
                <div className="mt-1 text-xs text-gray-500">
                  Product ID:{" "}
                  {getId(
                    delivery.product
                  )}
                </div>
              )}

            </div>

          </section>

          {/* ROUTE */}

          <section>

            <h4 className="mb-3 font-semibold">
              Route
            </h4>

            <div className="grid gap-3 md:grid-cols-2">

              <InfoBox
                icon={<FaMapMarkerAlt />}
                title="Pickup"
                value={
                  delivery.pickupLocation
                }
                contact={
                  delivery.pickupContactName
                }
                phone={
                  delivery.pickupPhone
                }
              />

              <InfoBox
                icon={<FaMapMarkerAlt />}
                title="Destination"
                value={
                  delivery.deliveryLocation
                }
                contact={
                  delivery.deliveryContactName
                }
                phone={
                  delivery.deliveryPhone
                }
              />

            </div>

          </section>

          {/* PEOPLE */}

          <section>

            <h4 className="mb-3 font-semibold">
              People
            </h4>

            <div className="grid gap-3 md:grid-cols-3">

              <PersonBox
                title="Buyer"
                name={
                  delivery.buyerName
                }
                phone={
                  delivery.buyerPhone
                }
              />

              <PersonBox
                title="Seller"
                name={
                  delivery.sellerName
                }
                phone={
                  delivery.sellerPhone
                }
              />

              <PersonBox
                title="Rider"
                name={
                  delivery.riderName ||
                  "Not assigned"
                }
                phone={
                  delivery.riderPhone
                }
              />

            </div>

          </section>

          {/* RIDER */}

          <section>

            <h4 className="mb-3 font-semibold">
              Rider information
            </h4>

            <div className="grid gap-3 md:grid-cols-2">

              <DetailRow
                label="Bike type"
                value={
                  delivery.riderBikeType
                }
              />

              <DetailRow
                label="Bike number"
                value={
                  delivery.riderBikeNumber
                }
              />

            </div>

          </section>

          {/* FEE */}

          <section>

            <h4 className="mb-3 font-semibold">
              Payment
            </h4>

            <div className="rounded-xl bg-gray-50 p-4">

              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  Delivery fee
                </span>

                <strong>
                  {delivery.currency ||
                    "GHS"}{" "}
                  {Number(
                    delivery.deliveryFee ||
                      0
                  ).toLocaleString()}
                </strong>
              </div>

            </div>

          </section>

          {/* NOTES */}

          {delivery.notes && (
            <section>

              <h4 className="mb-3 font-semibold">
                Notes
              </h4>

              <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                {delivery.notes}
              </div>

            </section>
          )}

          {/* STATUS */}

          <section>

            <h4 className="mb-3 font-semibold">
              Manage status
            </h4>

            <div className="flex flex-col gap-3 sm:flex-row">

              <select
                value={
                  delivery.status ||
                  "pending"
                }
                onChange={(event) =>
                  onStatusChange(
                    delivery,
                    event.target.value
                  )
                }
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
              >
                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {statusLabel(
                        status
                      )}
                    </option>
                  )
                )}
              </select>

              {delivery.status !==
                "cancelled" &&
                delivery.status !==
                  "delivered" && (
                  <button
                    type="button"
                    onClick={() =>
                      onCancel(
                        delivery
                      )
                    }
                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Cancel Delivery
                  </button>
                )}

            </div>

          </section>

          {/* TIMELINE */}

          <section>

            <h4 className="mb-3 font-semibold">
              Timeline
            </h4>

            <div className="space-y-2 text-sm">

              <DetailRow
                label="Created"
                value={formatDate(
                  delivery.createdAt
                )}
              />

              <DetailRow
                label="Accepted"
                value={formatDate(
                  delivery.acceptedAt
                )}
              />

              <DetailRow
                label="Picked up"
                value={formatDate(
                  delivery.pickedUpAt
                )}
              />

              <DetailRow
                label="In transit"
                value={formatDate(
                  delivery.inTransitAt
                )}
              />

              <DetailRow
                label="Delivered"
                value={formatDate(
                  delivery.deliveredAt
                )}
              />

              <DetailRow
                label="Cancelled"
                value={formatDate(
                  delivery.cancelledAt
                )}
              />

            </div>

          </section>

        </div>

      </div>
    </div>
  );
}

// ================================================================
// INFO BOX
// ================================================================

function InfoBox({
  icon,
  title,
  value,
  contact,
  phone,
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">

      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </div>

      <div className="text-sm text-gray-700">
        {value || "—"}
      </div>

      {contact && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <FaUser />
          {contact}
        </div>
      )}

      {phone && (
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <FaPhone />
          {phone}
        </div>
      )}

    </div>
  );
}

// ================================================================
// PERSON BOX
// ================================================================

function PersonBox({
  title,
  name,
  phone,
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">

      <div className="mb-2 text-xs font-semibold uppercase text-gray-500">
        {title}
      </div>

      <div className="font-medium">
        {name || "—"}
      </div>

      {phone && (
        <div className="mt-1 text-xs text-gray-500">
          {phone}
        </div>
      )}

    </div>
  );
}

// ================================================================
// DETAIL ROW
// ================================================================

function DetailRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-2">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-gray-900">
        {value || "—"}
      </span>

    </div>
  );
}

export default AdminDeliveries;