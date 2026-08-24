// frontend/src/components/FeaturedProducts.jsx
// BuyUKUsed Featured Products – Large Card Slider
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "./ProductCard";

// ============================================================
// FEATURED PRODUCTS COMPONENT
// ============================================================

const FeaturedProducts = ({
  products = [],
  title = "Latest Ads",
  link = "/products",
  loading = false,
}) => {
  // ==========================================================
  // SAFETY – use ALL products
  // ==========================================================

  const displayProducts = Array.isArray(products) ? products : [];

  // ==========================================================
  // SLIDER STATE
  // ==========================================================

  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(4);
  const trackRef = useRef(null);

  // ==========================================================
  // GROUP PRODUCTS INTO SLIDES
  // ==========================================================

  const getSlides = useCallback(() => {
    const slides = [];
    for (let i = 0; i < displayProducts.length; i += itemsPerSlide) {
      slides.push(displayProducts.slice(i, i + itemsPerSlide));
    }
    return slides;
  }, [displayProducts, itemsPerSlide]);

  const slides = getSlides();

  // ==========================================================
  // UPDATE ITEMS PER SLIDE BASED ON WINDOW WIDTH
  // ==========================================================

  useEffect(() => {
    const updateItemsPerSlide = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerSlide(1);
      else if (width < 1024) setItemsPerSlide(2);
      else setItemsPerSlide(4);
    };

    updateItemsPerSlide();
    window.addEventListener("resize", updateItemsPerSlide);
    return () => window.removeEventListener("resize", updateItemsPerSlide);
  }, []);

  // ==========================================================
  // RESET SLIDE INDEX WHEN PRODUCTS OR ITEMS PER SLIDE CHANGE
  // ==========================================================

  useEffect(() => {
    setCurrentSlide(0);
  }, [slides.length]);

  // ==========================================================
  // AUTO‑SLIDE (slow, 6 seconds per slide)
  // ==========================================================

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <section className="featured-apple">
        <div className="featured-apple-header">
          <h2 className="featured-apple-title">
            <span className="featured-apple-icon">✦</span> {title}
          </h2>
          <a href={link} className="featured-apple-link">View All →</a>
        </div>
        <div className="featured-apple-loading">Loading products...</div>
      </section>
    );
  }

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (displayProducts.length === 0) {
    return (
      <section className="featured-apple">
        <div className="featured-apple-header">
          <h2 className="featured-apple-title">
            <span className="featured-apple-icon">✦</span> {title}
          </h2>
          <a href={link} className="featured-apple-link">View All →</a>
        </div>
        <div className="featured-apple-empty">No products available.</div>
      </section>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ─── Styles ────────────────────────────────────────────── */}
      <style>
        {`
          .featured-apple {
            padding: 20px 0 40px;
          }

          .featured-apple-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 0 4px;
          }

          .featured-apple-title {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            color: #0f172a;
          }

          .featured-apple-icon {
            color: #2ecc71;
          }

          .featured-apple-link {
            color: #2563eb;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
          }

          .featured-apple-link:hover {
            text-decoration: underline;
          }

          /* ─── Slider Container ─── */
          .featured-slider-wrapper {
            position: relative;
            overflow: hidden;
            border-radius: 16px;
            margin: 0 -8px;
          }

          .featured-slider-track {
            display: flex;
            transition: transform 0.8s ease-in-out;
            will-change: transform;
          }

          .featured-slide {
            min-width: 100%;
            display: grid;
            gap: 16px;
            padding: 0 8px;
            box-sizing: border-box;
          }

          /* Desktop: 4 columns */
          .featured-slide {
            grid-template-columns: repeat(4, 1fr);
          }

          /* Tablet: 2 columns */
          @media (max-width: 1024px) {
            .featured-slide {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          /* Mobile: 1 column */
          @media (max-width: 640px) {
            .featured-slide {
              grid-template-columns: 1fr;
              gap: 12px;
            }
          }

          /* ─── Product Cards inside slider (larger) ─── */
          .featured-slide .product-card {
            max-width: 100% !important;
            height: auto !important;
            transform: scale(1);
            transition: transform 0.3s ease;
          }

          .featured-slide .product-card:hover {
            transform: scale(1.02);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
          }

          /* ─── Slider Controls ─── */
          .slider-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
            margin-top: 24px;
          }

          .slider-dots {
            display: flex;
            gap: 8px;
          }

          .slider-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #d1d5db;
            border: none;
            cursor: pointer;
            transition: background 0.3s ease, transform 0.2s ease;
            padding: 0;
          }

          .slider-dot.active {
            background: #2ecc71;
            transform: scale(1.2);
          }

          .slider-dot:hover {
            background: #9ca3af;
          }

          .slider-arrow {
            background: rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.2s ease;
            font-size: 18px;
            color: #374151;
          }

          .slider-arrow:hover {
            background: #f3f4f6;
            transform: scale(1.05);
          }

          .slider-arrow:active {
            transform: scale(0.95);
          }

          /* ─── Responsive ─── */
          @media (max-width: 640px) {
            .featured-apple-title {
              font-size: 22px;
            }
            .slider-arrow {
              width: 30px;
              height: 30px;
              font-size: 14px;
            }
            .slider-dot {
              width: 8px;
              height: 8px;
            }
          }
        `}
      </style>

      {/* ─── Section ─── */}
      <section className="featured-apple">
        {/* Header */}
        <div className="featured-apple-header">
          <h2 className="featured-apple-title">
            <span className="featured-apple-icon">✦</span> {title}
          </h2>
          <a href={link} className="featured-apple-link">View All →</a>
        </div>

        {/* Count */}
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', padding: '0 4px' }}>
          {displayProducts.length} {displayProducts.length === 1 ? 'product' : 'products'}
        </div>

        {/* ─── Slider ─── */}
        {slides.length > 0 && (
          <div className="featured-slider-wrapper">
            <div
              className="featured-slider-track"
              ref={trackRef}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, slideIndex) => (
                <div key={slideIndex} className="featured-slide">
                  {slide.map((product) => (
                    <div key={product._id || product.id} className="featured-slide-item">
                      <ProductCard product={product} appleStyle videoPreview />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Controls ─── */}
        {slides.length > 1 && (
          <div className="slider-controls">
            <button className="slider-arrow" onClick={goToPrev} aria-label="Previous slide">
              ‹
            </button>
            <div className="slider-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button className="slider-arrow" onClick={goToNext} aria-label="Next slide">
              ›
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default FeaturedProducts;