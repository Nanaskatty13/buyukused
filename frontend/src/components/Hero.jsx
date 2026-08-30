// frontend/src/components/Hero.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Hero = ({ onSearch }) => {
  // ─── Carousel slides ──────────────────────────────────────────
  const slides = [
    {
      id: 1,
      image: '/categories/phones.webp',
      title: 'Phones & Tablets',
      subtitle: 'Latest smartphones and tablets',
    },
    {
      id: 2,
      image: '/categories/laptops.webp',
      title: 'Laptops & Computers',
      subtitle: 'MacBook, Dell, HP and more',
    },
    {
      id: 3,
      image: '/categories/cars.webp',
      title: 'Cars & Vehicles',
      subtitle: 'Trusted deals on wheels',
    },
    {
      id: 4,
      image: '/categories/real-estate.webp',
      title: 'Real Estate',
      subtitle: 'Houses, lands and apartments',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // ─── Auto-slide every 6 seconds ───────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // ─── Go to a specific slide ──────────────────────────────────
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // ─── Next / Previous ─────────────────────────────────────────
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <>
      <style>
        {`
          .hero-shopglowsy {
            padding: 80px 0 100px;
            position: relative;
            background: #0f172a;
            overflow: hidden;
          }

          /* ─── Background image – clear and vibrant ─── */
          .hero-shopglowsy::before {
            content: '';
            position: absolute;
            top: -80px;
            left: 0;
            right: 0;
            height: calc(100% + 80px);
            background-image: url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80');
            background-size: cover;
            background-position: center;
            opacity: 0.85;
            z-index: 0;
          }

          /* ─── Light overlay ─── */
          .hero-shopglowsy::after {
            content: '';
            position: absolute;
            top: -80px;
            left: 0;
            right: 0;
            height: calc(100% + 80px);
            background: linear-gradient(
              135deg,
              rgba(15, 23, 42, 0.35) 0%,
              rgba(30, 41, 59, 0.15) 100%
            );
            z-index: 0;
          }

          .hero-shopglowsy .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
            position: relative;
            z-index: 1;
          }

          .hero-shopglowsy-content h1 {
            font-size: 48px;
            font-weight: 800;
            line-height: 1.15;
            margin-bottom: 16px;
            color: #ffffff;
            text-shadow: 0 2px 16px rgba(0, 0, 0, 0.6);
          }

          .hero-shopglowsy-content h1 span {
            color: #2ecc71;
          }

          .hero-shopglowsy-content p {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.95);
            max-width: 480px;
            margin-bottom: 32px;
            line-height: 1.7;
            text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
          }

          .hero-shopglowsy-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 32px;
          }

          .hero-shopglowsy-actions .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #2ecc71;
            color: #fff;
            padding: 14px 32px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 16px;
            border: none;
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 4px 14px rgba(46, 204, 113, 0.4);
            text-decoration: none;
          }

          .hero-shopglowsy-actions .btn-primary:hover {
            background: #27ae60;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(46, 204, 113, 0.5);
          }

          .hero-shopglowsy-actions .btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(6px);
            color: #fff;
            padding: 14px 32px;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 16px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            cursor: pointer;
            transition: all 0.25s ease;
            text-decoration: none;
          }

          .hero-shopglowsy-actions .btn-secondary:hover {
            background: rgba(0, 0, 0, 0.4);
            transform: translateY(-2px);
          }

          .hero-shopglowsy-stats {
            display: flex;
            gap: 48px;
            padding-top: 32px;
            border-top: 1px solid rgba(255, 255, 255, 0.25);
          }

          .hero-shopglowsy-stats .stat {
            display: flex;
            flex-direction: column;
          }

          .hero-shopglowsy-stats .stat-number {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
          }

          .hero-shopglowsy-stats .stat-label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
          }

          /* ─── Carousel ─────────────────────────────────────────── */
          .hero-carousel {
            position: relative;
            width: 100%;
            max-width: 480px;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
          }

          .hero-carousel .slide-track {
            display: flex;
            transition: transform 0.8s ease-in-out;
          }

          .hero-carousel .slide {
            min-width: 100%;
            height: 320px;
            position: relative;
            background: #1e293b;
          }

          .hero-carousel .slide img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .hero-carousel .slide-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 20px;
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.7) 0%,
              transparent 100%
            );
            color: #fff;
          }

          .hero-carousel .slide-overlay h3 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 2px;
          }

          .hero-carousel .slide-overlay p {
            font-size: 14px;
            opacity: 0.9;
            margin: 0;
          }

          /* ─── Carousel Controls ─── */
          .carousel-controls {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 12px;
          }

          .carousel-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            border: none;
            cursor: pointer;
            transition: background 0.3s ease;
            padding: 0;
          }

          .carousel-dot.active {
            background: #2ecc71;
          }

          .carousel-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            font-size: 18px;
            cursor: pointer;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }

          .carousel-arrow:hover {
            background: rgba(0, 0, 0, 0.6);
          }

          .carousel-arrow.prev {
            left: 8px;
          }

          .carousel-arrow.next {
            right: 8px;
          }

          /* ─── Responsive ─── */
          @media (max-width: 1024px) {
            .hero-shopglowsy .container {
              grid-template-columns: 1fr;
              text-align: center;
            }

            .hero-shopglowsy-content p {
              margin-left: auto;
              margin-right: auto;
            }

            .hero-shopglowsy-actions {
              justify-content: center;
            }

            .hero-shopglowsy-stats {
              justify-content: center;
            }

            .hero-carousel {
              margin: 0 auto;
              max-width: 90%;
            }
          }

          @media (max-width: 768px) {
            .hero-shopglowsy {
              padding: 50px 0 60px;
            }

            .hero-shopglowsy-content h1 {
              font-size: 32px;
            }

            .hero-shopglowsy-stats {
              flex-direction: column;
              gap: 16px;
              align-items: center;
            }

            .hero-carousel .slide {
              height: 300px;
            }
          }

          @media (max-width: 480px) {
            .hero-shopglowsy-actions {
              flex-direction: column;
              align-items: center;
            }

            .hero-shopglowsy-actions .btn-primary,
            .hero-shopglowsy-actions .btn-secondary {
              width: 100%;
              justify-content: center;
            }

            .hero-carousel .slide {
              height: 260px;
            }

            .hero-carousel .slide-overlay h3 {
              font-size: 16px;
            }

            .hero-carousel .slide-overlay p {
              font-size: 12px;
            }

            .carousel-arrow {
              width: 28px;
              height: 28px;
              font-size: 14px;
            }
          }

          @media (max-width: 380px) {
            .hero-carousel .slide {
              height: 220px;
            }
          }
        `}
      </style>

      <section className="hero-shopglowsy">
        <div className="container">

          {/* ─── Left: Text Content ─── */}
          <div className="hero-shopglowsy-content">

            <h1>
              Buy & Sell with <span>Trust</span> in Ghana
            </h1>

            <p>
              Join thousands of Ghanaians buying and selling safely.
              List your items for free and reach buyers across the country.
            </p>

            {/* ─── CTA Buttons ─── */}
            <div className="hero-shopglowsy-actions">

              <Link to="/post-ad" className="btn-primary">
                <i className="fas fa-plus-circle"></i>
                Start Selling
              </Link>

              <Link to="/products" className="btn-secondary">
                <i className="fas fa-search"></i>
                Browse Ads
              </Link>

            </div>

            {/* ─── Stats ─── */}
            <div className="hero-shopglowsy-stats">

              <div className="stat">
                <span className="stat-number">200+</span>
                <span className="stat-label">Active Listings</span>
              </div>

              <div className="stat">
                <span className="stat-number">90+</span>
                <span className="stat-label">Trusted Sellers</span>
              </div>

              <div className="stat">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Monthly Views</span>
              </div>

            </div>
          </div>

          {/* ─── Right: Carousel ─── */}
          <div className="hero-carousel">

            <div
              className="slide-track"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {slides.map((slide, index) => (
                <div key={slide.id} className="slide">

                  {/* FIX: use lowercase `fetchpriority` */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchpriority={index === 0 ? "high" : "auto"}
                  />

                  <div className="slide-overlay">
                    <h3>🛒 {slide.title}</h3>
                    <p>{slide.subtitle}</p>
                  </div>

                </div>
              ))}
            </div>

            {/* ─── Navigation Arrows ─── */}
            <button
              type="button"
              className="carousel-arrow prev"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              ‹
            </button>

            <button
              type="button"
              className="carousel-arrow next"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              ›
            </button>

            {/* ─── Dots ─── */}
            <div className="carousel-controls">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`carousel-dot ${
                    index === currentSlide ? 'active' : ''
                  }`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;