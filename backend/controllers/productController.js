// ============================================================
// PRODUCT RESPONSE FORMATTER
// ============================================================

const formatProduct = (product) => {
  if (!product) {
    return null;
  }

  const data =
    typeof product.toObject === "function"
      ? product.toObject()
      : { ...product };

  // ----------------------------------------------------------
  // SIM STATUS
  // Support current + possible legacy field names
  // ----------------------------------------------------------

  const rawSimStatus =
    data.simStatus ??
    data.sim_status ??
    data.sim ??
    data.simLockStatus ??
    data.simLock ??
    "";

  const normalizedSimStatus =
    rawSimStatus !== null &&
    rawSimStatus !== undefined
      ? String(rawSimStatus).trim()
      : "";

  // ----------------------------------------------------------
  // RETURN NORMALIZED PRODUCT
  // ----------------------------------------------------------

  return {
    ...data,

    // Product condition details
    batteryHealth:
      data.batteryHealth !== undefined &&
      data.batteryHealth !== null &&
      data.batteryHealth !== ""
        ? Number(data.batteryHealth)
        : null,

    faceId:
      data.faceId !== undefined &&
      data.faceId !== null
        ? String(data.faceId).trim()
        : "",

    storage:
      data.storage !== undefined &&
      data.storage !== null
        ? String(data.storage).trim()
        : "",

    condition:
      data.condition !== undefined &&
      data.condition !== null &&
      data.condition !== ""
        ? String(data.condition).trim()
        : "Good",

    // IMPORTANT
    simStatus: normalizedSimStatus,

    swapAccepted:
      data.swapAccepted === true,

    // --------------------------------------------------------
    // MEDIA
    // --------------------------------------------------------

    images:
      Array.isArray(data.images)
        ? data.images
        : data.image
        ? [data.image]
        : [],

    videos:
      Array.isArray(data.videos)
        ? data.videos
        : [],

    image:
      data.image ||
      (Array.isArray(data.images) &&
      data.images.length > 0
        ? data.images[0]
        : ""),

    // --------------------------------------------------------
    // OTHER PRODUCT FIELDS
    // --------------------------------------------------------

    brand:
      data.brand || "",

    model:
      data.model || "",

    processor:
      data.processor || "",

    screenSize:
      data.screenSize || "",

    graphics:
      data.graphics || "",

    year:
      data.year || "",

    connectivity:
      data.connectivity || "",

    warranty:
      data.warranty || "",

    ram:
      data.ram || "",

    color:
      data.color || "",
  };
};