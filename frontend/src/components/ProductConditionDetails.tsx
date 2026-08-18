// frontend/src/components/ProductConditionDetails.tsx

"use client";

type ProductConditionDetailsProps = {
  product?: {
    batteryHealth?: number | string | null;
    faceId?: string | null;
    storage?: string | null;
    condition?: string | null;
    simStatus?: string | null;
    swapAccepted?: boolean | string | number | null;
  } | null;

  // Optional direct props
  batteryHealth?: number | string | null;
  faceId?: string | null;
  storage?: string | null;
  condition?: string | null;
  simStatus?: string | null;
  swapAccepted?: boolean | string | number | null;

  className?: string;
};

// ============================================================
// NORMALIZE STRING
// ============================================================

const normalizeString = (
  value: unknown
): string => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

// ============================================================
// PARSE BOOLEAN
// ============================================================

const parseBoolean = (
  value: unknown
): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized =
      value.trim().toLowerCase();

    return (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes" ||
      normalized === "on"
    );
  }

  return false;
};

// ============================================================
// PRODUCT CONDITION DETAILS
// ============================================================

export default function ProductConditionDetails({
  product,

  batteryHealth: batteryHealthProp,
  faceId: faceIdProp,
  storage: storageProp,
  condition: conditionProp,
  simStatus: simStatusProp,
  swapAccepted: swapAcceptedProp,

  className = "",
}: ProductConditionDetailsProps) {
  // ==========================================================
  // PRODUCT VALUES
  // Product values take priority over direct props.
  // ==========================================================

  const batteryHealth =
    product?.batteryHealth ??
    batteryHealthProp ??
    null;

  const faceId =
    product?.faceId ??
    faceIdProp ??
    "";

  const storage =
    product?.storage ??
    storageProp ??
    "";

  const condition =
    product?.condition ??
    conditionProp ??
    "";

  const simStatus =
    product?.simStatus ??
    simStatusProp ??
    "";

  const swapAccepted =
    product?.swapAccepted ??
    swapAcceptedProp ??
    false;

  // ==========================================================
  // NORMALIZED VALUES
  // ==========================================================

  const batteryValue =
    normalizeString(
      batteryHealth
    );

  const faceIdValue =
    normalizeString(faceId);

  const storageValue =
    normalizeString(storage);

  const conditionValue =
    normalizeString(condition);

  const simStatusValue =
    normalizeString(simStatus);

  const swapValue =
    parseBoolean(swapAccepted);

  // ==========================================================
  // DISPLAY VALUES
  //
  // These fallbacks make sure older products that were created
  // before these fields existed still display correctly.
  // ==========================================================

  const batteryDisplay =
    batteryValue
      ? `${batteryValue}%`
      : "—";

  const faceIdDisplay =
    faceIdValue || "—";

  const storageDisplay =
    storageValue || "—";

  const conditionDisplay =
    conditionValue || "—";

  const simDisplay =
    simStatusValue || "SIM Unlocked";

  const swapDisplay =
    swapValue
      ? "Swap OK"
      : "Swap Not Accepted";

  // ==========================================================
  // ITEM COMPONENT
  // ==========================================================

  const Item = ({
    icon,
    value,
  }: {
    icon: string;
    value: string;
  }) => {
    return (
      <div
        className="
          flex
          items-center
          gap-1.5
          whitespace-nowrap
        "
      >
        <span
          className="
            text-sm
            leading-none
          "
          aria-hidden="true"
        >
          {icon}
        </span>

        <span
          className="
            font-medium
            text-gray-800
            dark:text-gray-100
          "
        >
          {value}
        </span>
      </div>
    );
  };

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div
      className={[
        "w-full",
        "rounded-xl",
        "border",
        "border-gray-200",
        "bg-white",
        "px-3",
        "py-2.5",
        "text-sm",
        "text-gray-800",
        "dark:border-gray-700",
        "dark:bg-gray-900",
        "dark:text-gray-100",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ======================================================
          DESKTOP
      ======================================================= */}

      <div
        className="
          hidden
          items-center
          gap-x-4
          gap-y-2
          md:flex
          md:flex-wrap
        "
      >
        <Item
          icon="🔋"
          value={batteryDisplay}
        />

        <Item
          icon="😊"
          value={faceIdDisplay}
        />

        <Item
          icon="💾"
          value={storageDisplay}
        />

        <Item
          icon="📋"
          value={conditionDisplay}
        />

        <Item
          icon="📱"
          value={simDisplay}
        />

        <Item
          icon="🔄"
          value={swapDisplay}
        />
      </div>

      {/* ======================================================
          MOBILE
      ======================================================= */}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-x-3
          gap-y-2
          md:hidden
        "
      >
        <Item
          icon="🔋"
          value={batteryDisplay}
        />

        <Item
          icon="😊"
          value={faceIdDisplay}
        />

        <Item
          icon="💾"
          value={storageDisplay}
        />

        <Item
          icon="📋"
          value={conditionDisplay}
        />

        <Item
          icon="📱"
          value={simDisplay}
        />

        <Item
          icon="🔄"
          value={swapDisplay}
        />
      </div>
    </div>
  );
}