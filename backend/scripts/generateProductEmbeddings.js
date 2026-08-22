// ============================================================
// backend/scripts/generateProductEmbeddings.js
// Generate missing visual embeddings for existing products
// ============================================================

require("dotenv").config();

const mongoose = require("mongoose");

const Product = require("../models/Product");

const {
  createImageEmbeddingFromUrl,
  MODEL_ID,
  EMBEDDING_DIMENSIONS,
} = require("../services/imageEmbeddingService");

// ============================================================
// MAIN
// ============================================================

const run = async () => {
  try {
    console.log(
      "🔌 Connecting to MongoDB..."
    );

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "✅ MongoDB connected"
    );

    const products =
      await Product.find({
        status: {
          $in: [
            "active",
            "pending",
          ],
        },

        $or: [
          {
            imageEmbedding: {
              $exists: false,
            },
          },
          {
            imageEmbedding: {
              $size: 0,
            },
          },
        ],
      }).select(
        "+imageEmbedding +imageEmbeddingModel +imageEmbeddingUpdatedAt"
      );

    console.log(
      `📦 Products requiring embeddings: ${products.length}`
    );

    let success = 0;
    let failed = 0;

    for (
      const product of products
    ) {
      try {
        const imageUrl =
          product.image ||
          product.images?.[0];

        if (!imageUrl) {
          console.log(
            `⚠️ Skipping ${product._id}: no image`
          );

          failed++;
          continue;
        }

        console.log(
          `🖼️ Processing: ${product.title}`
        );

        const embedding =
          await createImageEmbeddingFromUrl(
            imageUrl
          );

        if (
          !embedding ||
          embedding.length !==
            EMBEDDING_DIMENSIONS
        ) {
          throw new Error(
            "Invalid embedding"
          );
        }

        product.imageEmbedding =
          embedding;

        product.imageEmbeddingModel =
          MODEL_ID;

        product.imageEmbeddingUpdatedAt =
          new Date();

        await product.save();

        success++;

        console.log(
          `✅ Indexed: ${product._id}`
        );
      } catch (error) {
        failed++;

        console.error(
          `❌ Failed ${product._id}:`,
          error.message
        );
      }
    }

    console.log(
      "========================================"
    );

    console.log(
      "VISUAL EMBEDDING MIGRATION COMPLETE"
    );

    console.log(
      `✅ Success: ${success}`
    );

    console.log(
      `❌ Failed: ${failed}`
    );

    console.log(
      "========================================"
    );
  } catch (error) {
    console.error(
      "❌ Migration error:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();

    console.log(
      "🔌 MongoDB disconnected"
    );
  }
};

run();