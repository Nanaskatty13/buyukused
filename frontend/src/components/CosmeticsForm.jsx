// frontend/src/components/CosmeticsForm.jsx

import React, { useState, useEffect } from 'react';

// ─── Constants ──────────────────────────────────────────────────

const COSMETIC_TYPES = [
  "Makeup",
  "Skincare",
  "Haircare",
  "Fragrance",
  "Body Care",
  "Bath & Shower",
  "Nail Care",
  "Lip Care",
  "Sun Care",
  "Men's Grooming",
  "Women's Grooming",
  "Beauty Tools",
  "Personal Care",
  "Other",
];

const COSMETIC_SKIN_TYPES = [
  "All Skin Types",
  "Normal",
  "Dry",
  "Oily",
  "Combination",
  "Sensitive",
  "Acne-Prone",
  "Mature",
];

const COSMETIC_CONCERNS = [
  "None",
  "Acne",
  "Dark Spots",
  "Hyperpigmentation",
  "Dryness",
  "Oil Control",
  "Aging",
  "Fine Lines",
  "Wrinkles",
  "Dullness",
  "Uneven Skin Tone",
  "Sun Damage",
  "Redness",
  "Pores",
  "Blackheads",
  "Whiteheads",
  "Hair Growth",
  "Hair Loss",
  "Hair Damage",
  "Dry Hair",
  "Oily Scalp",
  "Dandruff",
  "Frizz",
  "Other",
];

const COSMETIC_HAIR_TYPES = [
  "All Hair Types",
  "Straight",
  "Wavy",
  "Curly",
  "Coily",
  "Fine",
  "Thick",
  "Color-Treated",
  "Chemically Treated",
  "Damaged",
];

const COSMETIC_FORMATS = [
  "Cream",
  "Lotion",
  "Gel",
  "Serum",
  "Oil",
  "Balm",
  "Butter",
  "Foam",
  "Mousse",
  "Spray",
  "Mist",
  "Liquid",
  "Powder",
  "Stick",
  "Pencil",
  "Wax",
  "Paste",
  "Clay",
  "Bar",
  "Capsule",
  "Tablet",
  "Tool",
  "Other",
];

const COSMETIC_FINISHES = [
  "Natural",
  "Matte",
  "Dewy",
  "Glossy",
  "Satin",
  "Shimmer",
  "Metallic",
  "Radiant",
  "Luminous",
  "Soft Matte",
  "Other",
];

const COSMETIC_COVERAGE = [
  "Sheer",
  "Light",
  "Medium",
  "Full",
  "Buildable",
  "Not Applicable",
];

const COSMETIC_SIZES = [
  "Travel Size",
  "Mini",
  "Small",
  "Medium",
  "Large",
  "Full Size",
  "Professional Size",
  "Value Pack",
  "Sample Size",
];

const COSMETIC_GENDERS = [
  "Unisex",
  "Women",
  "Men",
  "Children",
  "Babies",
];

const COSMETIC_CONDITIONS = [
  "New",
  "New / Unopened",
  "New / Opened",
  "Used",
  "Like New",
];

const COSMETIC_SPF = [
  "None",
  "SPF 10",
  "SPF 15",
  "SPF 20",
  "SPF 25",
  "SPF 30",
  "SPF 40",
  "SPF 50",
  "SPF 50+",
];

const COSMETIC_PA0 = [
  "Not Specified",
  "3M",
  "6M",
  "9M",
  "12M",
  "18M",
  "24M",
  "30M",
  "36M",
];

const COSMETIC_CERTIFICATIONS = [
  "None",
  "Organic",
  "Natural",
  "Vegan Certified",
  "Cruelty-Free Certified",
  "Dermatologically Tested",
  "Hypoallergenic",
  "Halal",
  "Fair Trade",
  "Other",
];

// ─── Brand list ────────────────────────────────────────────────

const COSMETIC_BRANDS = [
  "4th & Reckless",
  "A'Pieu",
  "Aceology",
  "Aēsop",
  "AHC",
  "AOA Studio",
  "Apieu",
  "Aromatica",
  "Artdeco",
  "Avène",
  "B. by Superdrug",
  "BareMinerals",
  "Beauty Bakerie",
  "Beauty of Joseon",
  "Ben Nye",
  "Benefit Cosmetics",
  "Benton",
  "Biotherm",
  "Biore",
  "Black Pearl",
  "Blush",
  "Bobby Brown",
  "Bourjois",
  "Burt's Bees",
  "BYOMA",
  "C'est Moi",
  "C.O. Bigelow",
  "Cake Beauty",
  "Canmake",
  "CeraVe",
  "Chanel",
  "Charlotte Tilbury",
  "Chica Beauty",
  "Clarins",
  "Clinique",
  "ColourPop",
  "Cosrx",
  "Cover FX",
  "CoverGirl",
  "Cultured",
  "Danessa Myricks",
  "Dear Klairs",
  "Dermalogica",
  "DHC",
  "Dior",
  "Dr. Jart+",
  "Drunk Elephant",
  "E.l.f. Cosmetics",
  "EM Cosmetics",
  "Embryolisse",
  "Erno Laszlo",
  "Essence",
  "Estée Lauder",
  "Etude House",
  "Eve Lom",
  "Fenty Beauty",
  "Florence by Mills",
  "Flower Beauty",
  "Forbelovedone",
  "Formula 10.0.6",
  "Frudia",
  "Garnier",
  "Glossier",
  "Good Molecules",
  "Green Beaver",
  "Guerlain",
  "H&M Beauty",
  "Hada Labo",
  "Hanskin",
  "Huda Beauty",
  "I'm From",
  "I Dew Care",
  "I.T. Cosmetics",
  "Illamasqua",
  "Innisfree",
  "ION Cosmetics",
  "Isntree",
  "IT Cosmetics",
  "J. Cat Beauty",
  "Jaxon Lane",
  "Josie Maran",
  "Kao",
  "Kate Somerville",
  "Kevyn Aucoin",
  "Kiko Milano",
  "Kiss",
  "Klairs",
  "Kokie Cosmetics",
  "Korres",
  "Kosas",
  "KraveBeauty",
  "Kylie Cosmetics",
  "L'Oréal Paris",
  "La Mer",
  "La Roche-Posay",
  "Lakmé",
  "Laneige",
  "Laura Mercier",
  "Lemonhead",
  "Lily Lolo",
  "Lime Crime",
  "Liquid Death",
  "Lise Watier",
  "Lush",
  "LUX",
  "MAC Cosmetics",
  "Make Up For Ever",
  "Makeup Geek",
  "Makeup Revolution",
  "Mally Beauty",
  "Mario Badescu",
  "Maybelline",
  "Milani",
  "Mizon",
  "Morphe",
  "NARS",
  "Natasha Denona",
  "Neutrogena",
  "Nivea",
  "No7",
  "Nudestix",
  "NYX Professional Makeup",
  "Olay",
  "Origins",
  "Pacifica",
  "Palladio",
  "Pat McGrath Labs",
  "Paula's Choice",
  "Peach & Lily",
  "Peripera",
  "Physicians Formula",
  "Pixi",
  "POP Beauty",
  "Pretty Vulgar",
  "Purito",
  "Pyunkang Yul",
  "R+Co",
  "R.E.M. Beauty",
  "Rimmel",
  "Rituel de Fille",
  "RMS Beauty",
  "RoC",
  "Rose Inc",
  "Sacha Cosmetics",
  "Sally Hansen",
  "Sanoflore",
  "Seventh Generation",
  "Shiseido",
  "Skin 1004",
  "Skinfood",
  "SK-II",
  "Smashbox",
  "Some By Mi",
  "Stila",
  "Suave",
  "Sugarbear Hair",
  "Sun Bum",
  "Supergoop!",
  "Tarte Cosmetics",
  "The Body Shop",
  "The Creme Shop",
  "The Face Shop",
  "The Ordinary",
  "Thrive Causemetics",
  "Too Cool for School",
  "Too Faced",
  "Tonymoly",
  "Tower 28",
  "Ulta Beauty",
  "Urban Decay",
  "Vaseline",
  "Vichy",
  "Violet Voss",
  "Wet n Wild",
  "Yves Saint Laurent",
  "Zoeva",
  "Other",
];

// ─── Component ────────────────────────────────────────────────────

const CosmeticsForm = ({
  formData,
  handleChange,
  handleCheckboxChange,
  errors = {},
}) => {
  // ─── Local validation state ────────────────────────────────────
  const [localErrors, setLocalErrors] = useState({});

  // ─── Validate required fields on change ──────────────────────
  useEffect(() => {
    const newErrors = {};
    if (!formData.model?.trim()) newErrors.model = 'Product Name is required';
    if (!formData.cosmeticType) newErrors.cosmeticType = 'Please select the cosmetic type';
    setLocalErrors(newErrors);
  }, [formData.model, formData.cosmeticType]);

  // ─── Helper: is brand "Other" ──────────────────────────────────
  const isBrandOther = formData.cosmeticBrand === 'Other' || !COSMETIC_BRANDS.includes(formData.cosmeticBrand);

  // ─── Render ────────────────────────────────────────────────────

  return (
    <>
      {/* ─── INFORMATION HEADER ─── */}
      <div
        style={{
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '12px',
          padding: '18px',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ margin: '0 0 6px', fontSize: '20px' }}>
          💄 Cosmetic & Beauty Details
        </h3>

        <p
          style={{
            margin: 0,
            color: '#9a3412',
            fontSize: '13px',
            lineHeight: '1.5',
          }}
        >
          Provide accurate product information so buyers can easily understand
          the cosmetic, skincare, haircare, fragrance, or beauty product.
          <br />
          <strong style={{ color: '#dc2626' }}>* Required fields</strong>
        </p>
      </div>

      {/* ─── PRODUCT NAME ─── */}
      <div className="form-group">
        <label>Product Name *</label>

        <input
          type="text"
          name="model"
          value={formData.model || ''}
          onChange={handleChange}
          placeholder="e.g. Hydrating Facial Cleanser"
          required
          style={{
            borderColor: localErrors.model ? '#dc2626' : undefined,
          }}
        />

        {(errors.model || localErrors.model) && (
          <span className="error" style={{ color: '#dc2626', fontSize: '13px' }}>
            {errors.model || localErrors.model}
          </span>
        )}
      </div>

      {/* ─── BRAND ─── */}
      <div className="form-group">
        <label>Brand</label>

        <select
          name="cosmeticBrand"
          value={formData.cosmeticBrand || ''}
          onChange={handleChange}
        >
          <option value="">Select brand</option>

          {COSMETIC_BRANDS.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        {isBrandOther && (
          <input
            type="text"
            name="cosmeticBrand"
            value={formData.cosmeticBrand || ''}
            onChange={handleChange}
            placeholder="Enter custom brand name"
            style={{ marginTop: '6px' }}
          />
        )}
      </div>

      {/* ─── COSMETIC TYPE ─── */}
      <div className="form-group">
        <label>Cosmetic Type *</label>

        <select
          name="cosmeticType"
          value={formData.cosmeticType || ''}
          onChange={handleChange}
          required
          style={{
            borderColor: localErrors.cosmeticType ? '#dc2626' : undefined,
          }}
        >
          <option value="">Select cosmetic type</option>

          {COSMETIC_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {(errors.cosmeticType || localErrors.cosmeticType) && (
          <span className="error" style={{ color: '#dc2626', fontSize: '13px' }}>
            {errors.cosmeticType || localErrors.cosmeticType}
          </span>
        )}

        <small style={{ display: 'block', marginTop: '4px', color: '#6b7280', fontSize: '12px' }}>
          This is the main category of your product – choose the most relevant one.
        </small>
      </div>

      {/* ─── All other fields (unchanged) ─── */}
      {/* ... keep all remaining fields exactly as they were ... */}

      {/* ─── (Keep the rest of the form fields – they are unchanged) ─── */}

      {/* ─── PRODUCT LINE ─── */}
      <div className="form-group">
        <label>Product Line / Collection</label>

        <input
          type="text"
          name="productLine"
          value={formData.productLine || ''}
          onChange={handleChange}
          placeholder="e.g. Hydrating Range, Fit Me, Advanced Night Repair"
        />
      </div>

      {/* ─── PRODUCT FORMAT ─── */}
      <div className="form-group">
        <label>Product Format / Form</label>

        <select
          name="cosmeticFormat"
          value={formData.cosmeticFormat || ''}
          onChange={handleChange}
        >
          <option value="">Select product format</option>

          {COSMETIC_FORMATS.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      </div>

      {/* ─── CONDITION ─── */}
      <div className="form-group">
        <label>Condition</label>

        <select
          name="cosmeticCondition"
          value={formData.cosmeticCondition || ''}
          onChange={handleChange}
        >
          <option value="">Select condition</option>

          {COSMETIC_CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </div>

      {/* ─── SHADE ─── */}
      <div className="form-group">
        <label>Shade / Color</label>

        <input
          type="text"
          name="shade"
          value={formData.shade || ''}
          onChange={handleChange}
          placeholder="e.g. 220 Natural Beige, Ruby Red, Clear"
        />
      </div>

      {/* ─── COLOR FAMILY ─── */}
      <div className="form-group">
        <label>Color Family</label>

        <input
          type="text"
          name="colorFamily"
          value={formData.colorFamily || ''}
          onChange={handleChange}
          placeholder="e.g. Nude, Brown, Pink, Red"
        />
      </div>

      {/* ─── SKIN TYPE ─── */}
      <div className="form-group">
        <label>Skin Type</label>

        <select
          name="skinType"
          value={formData.skinType || ''}
          onChange={handleChange}
        >
          <option value="">Select skin type</option>

          {COSMETIC_SKIN_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* ─── SKIN CONCERN ─── */}
      <div className="form-group">
        <label>Skin / Beauty Concern</label>

        <select
          name="skinConcern"
          value={formData.skinConcern || ''}
          onChange={handleChange}
        >
          <option value="">Select concern</option>

          {COSMETIC_CONCERNS.map((concern) => (
            <option key={concern} value={concern}>
              {concern}
            </option>
          ))}
        </select>
      </div>

      {/* ─── HAIR TYPE ─── */}
      <div className="form-group">
        <label>Hair Type</label>

        <select
          name="hairType"
          value={formData.hairType || ''}
          onChange={handleChange}
        >
          <option value="">Select hair type</option>

          {COSMETIC_HAIR_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* ─── FINISH ─── */}
      <div className="form-group">
        <label>Finish</label>

        <select
          name="finish"
          value={formData.finish || ''}
          onChange={handleChange}
        >
          <option value="">Select finish</option>

          {COSMETIC_FINISHES.map((finish) => (
            <option key={finish} value={finish}>
              {finish}
            </option>
          ))}
        </select>
      </div>

      {/* ─── COVERAGE ─── */}
      <div className="form-group">
        <label>Coverage</label>

        <select
          name="coverage"
          value={formData.coverage || ''}
          onChange={handleChange}
        >
          <option value="">Select coverage</option>

          {COSMETIC_COVERAGE.map((coverage) => (
            <option key={coverage} value={coverage}>
              {coverage}
            </option>
          ))}
        </select>
      </div>

      {/* ─── SPF ─── */}
      <div className="form-group">
        <label>Sun Protection / SPF</label>

        <select
          name="spf"
          value={formData.spf || ''}
          onChange={handleChange}
        >
          <option value="">Select SPF</option>

          {COSMETIC_SPF.map((spf) => (
            <option key={spf} value={spf}>
              {spf}
            </option>
          ))}
        </select>
      </div>

      {/* ─── PRODUCT SIZE ─── */}
      <div className="form-group">
        <label>Product Size</label>

        <select
          name="cosmeticSize"
          value={formData.cosmeticSize || ''}
          onChange={handleChange}
        >
          <option value="">Select size</option>

          {COSMETIC_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* ─── VOLUME / WEIGHT ─── */}
      <div className="form-group">
        <label>Volume / Weight</label>

        <input
          type="text"
          name="volume"
          value={formData.volume || ''}
          onChange={handleChange}
          placeholder="e.g. 236ml, 50g, 100ml, 1.7 fl oz"
        />
      </div>

      {/* ─── SCENT ─── */}
      <div className="form-group">
        <label>Scent / Fragrance</label>

        <input
          type="text"
          name="scent"
          value={formData.scent || ''}
          onChange={handleChange}
          placeholder="e.g. Vanilla, Rose, Lavender, Unscented"
        />
      </div>

      {/* ─── SUITABLE FOR ─── */}
      <div className="form-group">
        <label>Suitable For</label>

        <select
          name="cosmeticGender"
          value={formData.cosmeticGender || ''}
          onChange={handleChange}
        >
          <option value="">Select suitable user</option>

          {COSMETIC_GENDERS.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
      </div>

      {/* ─── APPLICATION AREA ─── */}
      <div className="form-group">
        <label>Application Area</label>

        <input
          type="text"
          name="suitableFor"
          value={formData.suitableFor || ''}
          onChange={handleChange}
          placeholder="e.g. Face, Eyes, Lips, Body, Hair, Scalp"
        />
      </div>

      {/* ─── BENEFITS ─── */}
      <div className="form-group">
        <label>Key Benefits / Features</label>

        <textarea
          name="benefits"
          value={formData.benefits || ''}
          onChange={handleChange}
          rows="4"
          placeholder="e.g. Hydrates skin, reduces dryness, controls oil, adds shine..."
        />
      </div>

      {/* ─── INGREDIENTS ─── */}
      <div className="form-group">
        <label>Ingredients</label>

        <textarea
          name="ingredients"
          value={formData.ingredients || ''}
          onChange={handleChange}
          rows="5"
          placeholder="List the ingredients as shown on the product packaging."
        />
      </div>

      {/* ─── KEY INGREDIENTS ─── */}
      <div className="form-group">
        <label>Key / Active Ingredients</label>

        <input
          type="text"
          name="keyIngredients"
          value={formData.keyIngredients || ''}
          onChange={handleChange}
          placeholder="e.g. Hyaluronic Acid, Niacinamide, Vitamin C"
        />
      </div>

      {/* ─── ALLERGEN INFORMATION ─── */}
      <div className="form-group">
        <label>Allergen / Sensitivity Information</label>

        <textarea
          name="allergenInfo"
          value={formData.allergenInfo || ''}
          onChange={handleChange}
          rows="3"
          placeholder="Enter known allergens or sensitivity information if available."
        />
      </div>

      {/* ─── USAGE ─── */}
      <div className="form-group">
        <label>How to Use</label>

        <textarea
          name="usageInstructions"
          value={formData.usageInstructions || ''}
          onChange={handleChange}
          rows="4"
          placeholder="Explain how the product should be applied or used."
        />
      </div>

      {/* ─── WARNINGS ─── */}
      <div className="form-group">
        <label>Warnings / Precautions</label>

        <textarea
          name="warnings"
          value={formData.warnings || ''}
          onChange={handleChange}
          rows="4"
          placeholder="e.g. For external use only. Avoid contact with eyes. Keep out of reach of children."
        />
      </div>

      {/* ─── EXPIRATION DATE ─── */}
      <div className="form-group">
        <label>Expiration Date</label>

        <input
          type="date"
          name="expirationDate"
          value={formData.expirationDate || ''}
          onChange={handleChange}
        />
      </div>

      {/* ─── PAO ─── */}
      <div className="form-group">
        <label>Period After Opening (PAO)</label>

        <select
          name="pao"
          value={formData.pao || ''}
          onChange={handleChange}
        >
          <option value="">Select PAO</option>

          {COSMETIC_PA0.map((period) => (
            <option key={period} value={period}>
              {period}
            </option>
          ))}
        </select>

        <small
          style={{
            display: 'block',
            marginTop: '5px',
            color: '#666',
            fontSize: '12px',
          }}
        >
          Example: 12M means the product should generally be used within
          12 months after opening, according to its packaging.
        </small>
      </div>

      {/* ─── BATCH NUMBER ─── */}
      <div className="form-group">
        <label>Batch / Lot Number</label>

        <input
          type="text"
          name="batchNumber"
          value={formData.batchNumber || ''}
          onChange={handleChange}
          placeholder="Enter batch or lot number if available"
        />
      </div>

      {/* ─── COUNTRY OF ORIGIN ─── */}
      <div className="form-group">
        <label>Country of Origin</label>

        <input
          type="text"
          name="countryOfOrigin"
          value={formData.countryOfOrigin || ''}
          onChange={handleChange}
          placeholder="e.g. Ghana, USA, UK, France, Korea"
        />
      </div>

      {/* ─── CERTIFICATIONS ─── */}
      <div className="form-group">
        <label>Certification / Product Claims</label>

        <select
          name="certification"
          value={formData.certification || ''}
          onChange={handleChange}
        >
          <option value="">Select certification</option>

          {COSMETIC_CERTIFICATIONS.map((certification) => (
            <option key={certification} value={certification}>
              {certification}
            </option>
          ))}
        </select>
      </div>

      {/* ─── SEALED ─── */}
      <div className="form-group">
        <label>Packaging</label>

        <div className="checkbox-group">
          <input
            type="checkbox"
            name="sealed"
            checked={!!formData.sealed}
            onChange={handleCheckboxChange}
          />

          <span>Product is sealed / unopened</span>
        </div>
      </div>

      {/* ─── AUTHENTIC ─── */}
      <div className="form-group">
        <label>Authenticity</label>

        <div className="checkbox-group">
          <input
            type="checkbox"
            name="authentic"
            checked={!!formData.authentic}
            onChange={handleCheckboxChange}
          />

          <span>I confirm this product is authentic</span>
        </div>
      </div>

      {/* ─── CRUELTY FREE ─── */}
      <div className="form-group">
        <label>Product Attributes</label>

        <div
          className="checkbox-group"
          style={{ marginBottom: '8px' }}
        >
          <input
            type="checkbox"
            name="crueltyFree"
            checked={!!formData.crueltyFree}
            onChange={handleCheckboxChange}
          />

          <span>Cruelty-free</span>
        </div>

        {/* VEGAN */}
        <div
          className="checkbox-group"
          style={{ marginBottom: '8px' }}
        >
          <input
            type="checkbox"
            name="vegan"
            checked={!!formData.vegan}
            onChange={handleCheckboxChange}
          />

          <span>Vegan</span>
        </div>

        {/* PARABEN FREE */}
        <div
          className="checkbox-group"
          style={{ marginBottom: '8px' }}
        >
          <input
            type="checkbox"
            name="parabenFree"
            checked={!!formData.parabenFree}
            onChange={handleCheckboxChange}
          />

          <span>Paraben-free</span>
        </div>

        {/* SULFATE FREE */}
        <div
          className="checkbox-group"
          style={{ marginBottom: '8px' }}
        >
          <input
            type="checkbox"
            name="sulfateFree"
            checked={!!formData.sulfateFree}
            onChange={handleCheckboxChange}
          />

          <span>Sulfate-free</span>
        </div>

        {/* FRAGRANCE FREE */}
        <div
          className="checkbox-group"
          style={{ marginBottom: '8px' }}
        >
          <input
            type="checkbox"
            name="fragranceFree"
            checked={!!formData.fragranceFree}
            onChange={handleCheckboxChange}
          />

          <span>Fragrance-free</span>
        </div>

        {/* ALCOHOL FREE */}
        <div
          className="checkbox-group"
          style={{ marginBottom: '8px' }}
        >
          <input
            type="checkbox"
            name="alcoholFree"
            checked={!!formData.alcoholFree}
            onChange={handleCheckboxChange}
          />

          <span>Alcohol-free</span>
        </div>

        {/* HYPOALLERGENIC */}
        <div
          className="checkbox-group"
          style={{ marginBottom: '8px' }}
        >
          <input
            type="checkbox"
            name="hypoallergenic"
            checked={!!formData.hypoallergenic}
            onChange={handleCheckboxChange}
          />

          <span>Hypoallergenic</span>
        </div>

        {/* DERMATOLOGICALLY TESTED */}
        <div className="checkbox-group">
          <input
            type="checkbox"
            name="dermatologicallyTested"
            checked={!!formData.dermatologicallyTested}
            onChange={handleCheckboxChange}
          />

          <span>Dermatologically tested</span>
        </div>
      </div>
    </>
  );
};

export default CosmeticsForm;