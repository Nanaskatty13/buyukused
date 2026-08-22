// ============================================================
// backend/services/imageEmbeddingService.js
// BuyUKUsed Visual Search / CLIP Embeddings
// ============================================================

const {
  pipeline,
} = require("@huggingface/transformers");

// ============================================================
// CONFIGURATION
// ============================================================

const MODEL_ID =
  "Xenova/clip-vit-base-patch32";

const EMBEDDING_DIMENSIONS = 512;

// ============================================================
// SINGLETON PIPELINE
// ============================================================

let extractorPromise = null;

// ============================================================
// GET IMAGE FEATURE EXTRACTOR
// ============================================================

const getExtractor = async () => {
  if (!extractorPromise) {
    console.log(
      "🤖 Loading CLIP visual search model..."
    );

    extractorPromise =
      pipeline(
        "image-feature-extraction",
        MODEL_ID
      )
        .then((extractor) => {
          console.log(
            "✅ CLIP visual search model loaded"
          );

          return extractor;
        })
        .catch((error) => {
          extractorPromise = null;

          console.error(
            "❌ Failed to load CLIP model:",
            error
          );

          throw error;
        });
  }

  return extractorPromise;
};

// ============================================================
// NORMALIZE VECTOR
// ============================================================

const normalizeVector = (
  vector
) => {
  const values = Array.from(
    vector || []
  );

  if (
    values.length !==
    EMBEDDING_DIMENSIONS
  ) {
    throw new Error(
      `Invalid image embedding dimensions. Expected ${EMBEDDING_DIMENSIONS}, received ${values.length}`
    );
  }

  let magnitude = 0;

  for (const value of values) {
    magnitude +=
      Number(value) *
      Number(value);
  }

  magnitude = Math.sqrt(
    magnitude
  );

  if (!Number.isFinite(magnitude) || magnitude === 0) {
    throw new Error(
      "Unable to normalize image embedding"
    );
  }

  return values.map(
    (value) =>
      Number(value) / magnitude
  );
};

// ============================================================
// BUFFER -> EMBEDDING
// ============================================================

const createImageEmbeddingFromBuffer =
  async (buffer) => {
    if (
      !buffer ||
      !Buffer.isBuffer(buffer) ||
      buffer.length === 0
    ) {
      throw new Error(
        "A valid image buffer is required"
      );
    }

    const extractor =
      await getExtractor();

    const features =
      await extractor(buffer);

    if (
      !features ||
      !features.data
    ) {
      throw new Error(
        "CLIP did not return image features"
      );
    }

    return normalizeVector(
      features.data
    );
  };

// ============================================================
// URL -> EMBEDDING
// ============================================================

const createImageEmbeddingFromUrl =
  async (imageUrl) => {
    if (
      !imageUrl ||
      typeof imageUrl !== "string"
    ) {
      throw new Error(
        "A valid image URL is required"
      );
    }

    const response =
      await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download image. HTTP ${response.status}`
      );
    }

    const arrayBuffer =
      await response.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    return createImageEmbeddingFromBuffer(
      buffer
    );
  };

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  MODEL_ID,
  EMBEDDING_DIMENSIONS,
  getExtractor,
  normalizeVector,
  createImageEmbeddingFromBuffer,
  createImageEmbeddingFromUrl,
};