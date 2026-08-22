// ============================================================
// backend/controllers/imageSearchController.js
// BuyUKUsed Visual Product Search
// ============================================================

const Product = require("../models/Product");

// ============================================================
// GEMINI CONFIG
// ============================================================

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_VISION_MODEL ||
  "gemini-2.5-flash";

// ============================================================
// CATEGORY LIST
// ============================================================

const VALID_CATEGORIES = [
  "Cars",
  "Phones",
  "Laptops",
  "Tablets",
  "Accessories",
  "Real Estate",
  "Jobs",
  "Electronics",
  "Fashion",
  "Home",
  "TVs",
  "Game Consoles",
  "Smartwatches",
  "Other",
];

// ============================================================
// ESCAPE REGEX
// ============================================================

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// ============================================================
// NORMALIZE CATEGORY
// ============================================================

const normalizeCategory = (value) => {
  if (!value) {
    return "Other";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  const map = {
    car: "Cars",
    cars: "Cars",

    phone: "Phones",
    phones: "Phones",
    iphone: "Phones",
    smartphone: "Phones",
    smartphones: "Phones",
    mobile: "Phones",

    laptop: "Laptops",
    laptops: "Laptops",
    notebook: "Laptops",
    notebooks: "Laptops",
    macbook: "Laptops",

    tablet: "Tablets",
    tablets: "Tablets",
    ipad: "Tablets",

    accessory: "Accessories",
    accessories: "Accessories",
    charger: "Accessories",
    chargers: "Accessories",
    cable: "Accessories",
    cables: "Accessories",
    earphones: "Accessories",
    headphones: "Accessories",
    earbuds: "Accessories",

    "real estate": "Real Estate",
    property: "Real Estate",
    house: "Real Estate",
    land: "Real Estate",

    job: "Jobs",
    jobs: "Jobs",

    electronic: "Electronics",
    electronics: "Electronics",
    gadget: "Electronics",
    gadgets: "Electronics",

    fashion: "Fashion",
    clothing: "Fashion",
    clothes: "Fashion",
    shoes: "Fashion",
    shoe: "Fashion",
    bags: "Fashion",

    home: "Home",
    furniture: "Home",
    appliance: "Home",
    appliances: "Home",

    tv: "TVs",
    tvs: "TVs",
    television: "TVs",

    console: "Game Consoles",
    consoles: "Game Consoles",
    gaming: "Game Consoles",
    playstation: "Game Consoles",
    xbox: "Game Consoles",
    nintendo: "Game Consoles",

    watch: "Smartwatches",
    smartwatch: "Smartwatches",
    smartwatches: "Smartwatches",
  };

  if (map[normalized]) {
    return map[normalized];
  }

  const exact = VALID_CATEGORIES.find(
    (category) =>
      category.toLowerCase() ===
      normalized
  );

  return exact || "Other";
};

// ============================================================
// CLEAN AI RESULT
// ============================================================

const cleanAIResult = (data) => {
  const result = data || {};

  return {
    category: normalizeCategory(
      result.category
    ),

    brand:
      typeof result.brand === "string"
        ? result.brand.trim()
        : "",

    model:
      typeof result.model === "string"
        ? result.model.trim()
        : "",

    productType:
      typeof result.productType === "string"
        ? result.productType.trim()
        : "",

    keywords: Array.isArray(
      result.keywords
    )
      ? result.keywords
          .filter(
            (item) =>
              typeof item ===
              "string"
          )
          .map((item) =>
            item.trim()
          )
          .filter(Boolean)
          .slice(0, 15)
      : [],

    description:
      typeof result.description ===
      "string"
        ? result.description.trim()
        : "",

    color:
      typeof result.color === "string"
        ? result.color.trim()
        : "",
  };
};

// ============================================================
// EXTRACT JSON FROM GEMINI
// ============================================================

const extractJSON = (text) => {
  if (!text) {
    throw new Error(
      "AI returned an empty response"
    );
  }

  let cleaned = text.trim();

  // Remove markdown fences
  cleaned = cleaned
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start =
      cleaned.indexOf("{");

    const end =
      cleaned.lastIndexOf("}");

    if (
      start !== -1 &&
      end !== -1 &&
      end > start
    ) {
      return JSON.parse(
        cleaned.substring(
          start,
          end + 1
        )
      );
    }
  }

  throw new Error(
    "Unable to parse AI response"
  );
};

// ============================================================
// ANALYZE IMAGE WITH GEMINI
// ============================================================

const analyzeProductImage = async (
  buffer,
  mimeType
) => {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the server"
    );
  }

  const base64Image =
    buffer.toString("base64");

  const prompt = `
You are the visual product identification system for BuyUKUsed, a Ghanaian marketplace.

Analyze the uploaded product image.

Identify the most likely product shown.

Return ONLY valid JSON.

Use this exact structure:

{
  "category": "",
  "brand": "",
  "model": "",
  "productType": "",
  "color": "",
  "description": "",
  "keywords": []
}

Allowed category values:

Cars
Phones
Laptops
Tablets
Accessories
Real Estate
Jobs
Electronics
Fashion
Home
TVs
Game Consoles
Smartwatches
Other

Instructions:

1. Identify the product category.
2. Identify brand if visible or strongly inferable.
3. Identify model if visible or strongly inferable.
4. Identify product type.
5. Identify dominant visible color.
6. Give a short description of the physical product.
7. Give up to 15 useful search keywords.
8. Do NOT invent an exact model if it cannot be determined.
9. If text is visible on the product, use it.
10. Focus on information that can help find similar products in a marketplace.
`;

  const response =
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type:
                      mimeType,
                    data:
                      base64Image,
                  },
                },
              ],
            },
          ],

          generationConfig: {
            temperature: 0.1,
            responseMimeType:
              "application/json",
          },
        }),
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "Gemini API error:",
      errorText
    );

    throw new Error(
      "Image analysis service failed"
    );
  }

  const data =
    await response.json();

  const text =
    data?.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text;

  if (!text) {
    throw new Error(
      "AI could not identify the product"
    );
  }

  return cleanAIResult(
    extractJSON(text)
  );
};

// ============================================================
// BUILD SEARCH QUERY
// ============================================================

const buildVisualSearchQuery = (
  analysis
) => {
  const orConditions = [];

  const addRegex = (
    field,
    value
  ) => {
    if (!value) {
      return;
    }

    const safe =
      escapeRegex(value);

    if (!safe) {
      return;
    }

    orConditions.push({
      [field]: {
        $regex: safe,
        $options: "i",
      },
    });
  };

  // Exact-ish brand
  if (analysis.brand) {
    addRegex(
      "brand",
      analysis.brand
    );
  }

  // Exact-ish model
  if (analysis.model) {
    addRegex(
      "model",
      analysis.model
    );
  }

  // Product type
  if (analysis.productType) {
    addRegex(
      "title",
      analysis.productType
    );

    addRegex(
      "description",
      analysis.productType
    );
  }

  // AI keywords
  for (const keyword of
    analysis.keywords) {
    addRegex(
      "title",
      keyword
    );

    addRegex(
      "description",
      keyword
    );

    addRegex(
      "brand",
      keyword
    );

    addRegex(
      "model",
      keyword
    );

    addRegex(
      "compatibleWith",
      keyword
    );

    addRegex(
      "accessoryType",
      keyword
    );
  }

  // Description
  if (analysis.description) {
    const words =
      analysis.description
        .split(/\s+/)
        .filter(
          (word) =>
            word.length >= 4
        )
        .slice(0, 8);

    for (const word of words) {
      addRegex(
        "title",
        word
      );

      addRegex(
        "description",
        word
      );
    }
  }

  return orConditions;
};

// ============================================================
// SCORE PRODUCT
// ============================================================

const scoreProduct = (
  product,
  analysis
) => {
  let score = 0;

  const brand =
    String(
      product.brand || ""
    ).toLowerCase();

  const model =
    String(
      product.model || ""
    ).toLowerCase();

  const title =
    String(
      product.title || ""
    ).toLowerCase();

  const description =
    String(
      product.description || ""
    ).toLowerCase();

  const productType =
    String(
      analysis.productType || ""
    ).toLowerCase();

  const aiBrand =
    String(
      analysis.brand || ""
    ).toLowerCase();

  const aiModel =
    String(
      analysis.model || ""
    ).toLowerCase();

  if (
    analysis.category &&
    product.category ===
      analysis.category
  ) {
    score += 30;
  }

  if (
    aiBrand &&
    brand &&
    brand.includes(aiBrand)
  ) {
    score += 40;
  }

  if (
    aiModel &&
    model &&
    model.includes(aiModel)
  ) {
    score += 50;
  }

  if (
    productType &&
    (
      title.includes(
        productType
      ) ||
      description.includes(
        productType
      )
    )
  ) {
    score += 20;
  }

  if (
    analysis.color &&
    (
      title.includes(
        analysis.color
          .toLowerCase()
      ) ||
      description.includes(
        analysis.color
          .toLowerCase()
      ) ||
      String(
        product.color || ""
      )
        .toLowerCase()
        .includes(
          analysis.color
            .toLowerCase()
        )
    )
  ) {
    score += 10;
  }

  for (const keyword of
    analysis.keywords) {
    const normalized =
      keyword.toLowerCase();

    if (
      title.includes(
        normalized
      )
    ) {
      score += 5;
    }

    if (
      description.includes(
        normalized
      )
    ) {
      score += 3;
    }

    if (
      brand.includes(
        normalized
      )
    ) {
      score += 8;
    }

    if (
      model.includes(
        normalized
      )
    ) {
      score += 10;
    }
  }

  return score;
};

// ============================================================
// IMAGE SEARCH
// ============================================================

exports.searchProductsByImage =
  async (req, res) => {
    try {
      console.log(
        "========================================"
      );

      console.log(
        "🖼️ VISUAL PRODUCT SEARCH"
      );

      console.log(
        "========================================"
      );

      // ------------------------------------------------------
      // CHECK FILE
      // ------------------------------------------------------

      if (
        !req.file ||
        !req.file.buffer
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload a product image",
        });
      }

      // ------------------------------------------------------
      // CHECK MIME TYPE
      // ------------------------------------------------------

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          req.file.mimetype
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only JPG, JPEG, PNG and WEBP images are supported",
        });
      }

      // ------------------------------------------------------
      // SIZE LIMIT
      // ------------------------------------------------------

      if (
        req.file.size >
        8 * 1024 * 1024
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Image must be smaller than 8MB",
        });
      }

      // ------------------------------------------------------
      // AI ANALYSIS
      // ------------------------------------------------------

      const analysis =
        await analyzeProductImage(
          req.file.buffer,
          req.file.mimetype
        );

      console.log(
        "🤖 Image analysis:",
        analysis
      );

      // ------------------------------------------------------
      // BUILD QUERY
      // ------------------------------------------------------

      const orConditions =
        buildVisualSearchQuery(
          analysis
        );

      const baseQuery = {
        status: "active",
      };

      // Strong category filter when
      // AI is reasonably confident.
      if (
        analysis.category &&
        analysis.category !==
          "Other"
      ) {
        baseQuery.category =
          analysis.category;
      }

      // ------------------------------------------------------
      // SEARCH
      // ------------------------------------------------------

      let products = [];

      if (
        orConditions.length > 0
      ) {
        products =
          await Product.find({
            ...baseQuery,
            $or: orConditions,
          })
            .populate(
              "sellerId",
              "name email phone location avatar"
            )
            .limit(100)
            .lean();
      }

      // ------------------------------------------------------
      // FALLBACK:
      // CATEGORY ONLY
      // ------------------------------------------------------

      if (
        products.length === 0
      ) {
        const fallbackQuery = {
          status: "active",
        };

        if (
          analysis.category &&
          analysis.category !==
            "Other"
        ) {
          fallbackQuery.category =
            analysis.category;
        }

        products =
          await Product.find(
            fallbackQuery
          )
            .populate(
              "sellerId",
              "name email phone location avatar"
            )
            .sort({
              createdAt: -1,
            })
            .limit(100)
            .lean();
      }

      // ------------------------------------------------------
      // SCORE RESULTS
      // ------------------------------------------------------

      products =
        products.map(
          (product) => ({
            ...product,

            visualSearchScore:
              scoreProduct(
                product,
                analysis
              ),
          })
        );

      products.sort(
        (a, b) =>
          b.visualSearchScore -
          a.visualSearchScore
      );

      // Return top results
      products =
        products.slice(0, 40);

      console.log(
        `🔎 Found ${products.length} similar products`
      );

      console.log(
        "========================================"
      );

      return res.json({
        success: true,

        message:
          products.length > 0
            ? "Similar products found"
            : "No similar products found",

        analysis,

        products,

        total:
          products.length,
      });
    } catch (error) {
      console.error(
        "❌ Visual search error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to search products by image",
      });
    }
  };