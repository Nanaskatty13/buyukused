// frontend/src/components/Hero.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Hero = ({ onSearch }) => {
  // ─── Carousel slides ──────────────────────────────────────────
  const slides = [
    {
      id: 1,
      image: "/categories/phones.webp",
      title: "Phones & Tablets",
      subtitle: "Latest smartphones and tablets",
    },
    {
      id: 2,
      image: "/categories/laptops.webp",
      title: "Laptops & Computers",
      subtitle: "MacBook, Dell, HP and more",
    },
    {
      id: 3,
      image: "/categories/cars.webp",
      title: "Cars & Vehicles",
      subtitle: "Trusted deals on wheels",
    },
    {
      id: 4,
      image: "/categories/real-estate.webp",
      title: "Real Estate",
      subtitle: "Houses, lands and apartments",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // ─── Auto-slide every 7 seconds ──────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(
        (prev) => (prev + 1) % slides.length
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // ─── Go to specific slide ────────────────────────────────────
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <>
      <style>
        {`
          /* =====================================================
             HERO
             The Hero starts at the very top so the background
             image sits behind the fixed navbar.
          ===================================================== */

          .hero-shopglowsy {
            position: relative;

            width: 100%;

            min-height: 700px;

            padding:
              110px 0 100px;

            margin: 0;

            background:
              #0f172a;

            overflow: hidden;

            box-sizing: border-box;
          }


          /* =====================================================
             BACKGROUND IMAGE
          ===================================================== */

          .hero-shopglowsy::before {
            content: "";

            position: absolute;

            top: 0;
            left: 0;
            right: 0;
            bottom: 0;

            width: 100%;
            height: 100%;

            background-image:
              url("https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2000&q=85");

            background-size: cover;

            background-position:
              center center;

            background-repeat: no-repeat;

            opacity: 0.88;

            z-index: 0;

            transform: scale(1.01);
          }


          /* =====================================================
             IMAGE OVERLAY
          ===================================================== */

          .hero-shopglowsy::after {
            content: "";

            position: absolute;

            top: 0;
            left: 0;
            right: 0;
            bottom: 0;

            width: 100%;
            height: 100%;

            background:
              linear-gradient(
                135deg,
                rgba(15, 23, 42, 0.62) 0%,
                rgba(15, 23, 42, 0.38) 45%,
                rgba(15, 23, 42, 0.55) 100%
              );

            z-index: 0;

            pointer-events: none;
          }


          /* =====================================================
             HERO CONTAINER
          ===================================================== */

          .hero-shopglowsy .container {
            position: relative;

            z-index: 2;

            width: 100%;

            max-width: 1200px;

            margin: 0 auto;

            padding:
              0 24px;

            display: grid;

            grid-template-columns:
              1fr 1fr;

            gap: 60px;

            align-items: center;

            box-sizing: border-box;
          }


          /* =====================================================
             HERO TEXT
          ===================================================== */

          .hero-shopglowsy-content {
            min-width: 0;
          }


          .hero-shopglowsy-content h1 {
            font-size: 48px;

            font-weight: 800;

            line-height: 1.15;

            margin:
              0 0 16px;

            color: #ffffff;

            letter-spacing:
              -0.8px;

            text-shadow:
              0 3px 18px rgba(0, 0, 0, 0.65);
          }


          .hero-shopglowsy-content h1 span {
            color: #2ecc71;
          }


          .hero-shopglowsy-content p {
            font-size: 18px;

            color:
              rgba(255, 255, 255, 0.96);

            max-width: 480px;

            margin:
              0 0 32px;

            line-height: 1.7;

            text-shadow:
              0 2px 12px rgba(0, 0, 0, 0.55);
          }


          /* =====================================================
             HERO BUTTONS
          ===================================================== */

          .hero-shopglowsy-actions {
            display: flex;

            flex-wrap: wrap;

            gap: 12px;

            margin-bottom: 32px;
          }


          /* PRIMARY BUTTON */

          .hero-shopglowsy-actions .btn-primary {
            display: inline-flex;

            align-items: center;

            justify-content: center;

            gap: 8px;

            background:
              #2ecc71;

            color: #ffffff;

            padding:
              14px 32px;

            border-radius:
              9999px;

            font-weight: 700;

            font-size: 16px;

            border: none;

            cursor: pointer;

            transition:
              all 0.25s ease;

            box-shadow:
              0 5px 18px
              rgba(46, 204, 113, 0.42);

            text-decoration: none;

            white-space: nowrap;
          }


          .hero-shopglowsy-actions .btn-primary:hover {
            background:
              #27ae60;

            transform:
              translateY(-2px);

            box-shadow:
              0 8px 24px
              rgba(46, 204, 113, 0.52);
          }


          /* SECONDARY BUTTON */

          .hero-shopglowsy-actions .btn-secondary {
            display: inline-flex;

            align-items: center;

            justify-content: center;

            gap: 8px;

            background:
              rgba(0, 0, 0, 0.30);

            backdrop-filter:
              blur(8px);

            -webkit-backdrop-filter:
              blur(8px);

            color:
              #ffffff;

            padding:
              14px 32px;

            border-radius:
              9999px;

            font-weight: 600;

            font-size: 16px;

            border:
              1px solid
              rgba(255, 255, 255, 0.28);

            cursor: pointer;

            transition:
              all 0.25s ease;

            text-decoration: none;

            white-space: nowrap;
          }


          .hero-shopglowsy-actions .btn-secondary:hover {
            background:
              rgba(0, 0, 0, 0.45);

            border-color:
              rgba(255, 255, 255, 0.45);

            transform:
              translateY(-2px);
          }


          /* =====================================================
             STATS
          ===================================================== */

          .hero-shopglowsy-stats {
            display: flex;

            gap: 48px;

            padding-top: 32px;

            border-top:
              1px solid
              rgba(255, 255, 255, 0.28);
          }


          .hero-shopglowsy-stats .stat {
            display: flex;

            flex-direction: column;

            min-width: 0;
          }


          .hero-shopglowsy-stats .stat-number {
            font-size: 28px;

            font-weight: 800;

            color: #ffffff;

            line-height: 1.2;

            text-shadow:
              0 2px 12px rgba(0, 0, 0, 0.55);
          }


          .hero-shopglowsy-stats .stat-label {
            font-size: 14px;

            color:
              rgba(255, 255, 255, 0.82);

            margin-top: 4px;

            text-shadow:
              0 1px 8px rgba(0, 0, 0, 0.45);
          }


          /* =====================================================
             CAROUSEL
          ===================================================== */

          .hero-carousel {
            position: relative;

            width: 100%;

            max-width: 480px;

            margin: 0 auto;

            border-radius: 18px;

            overflow: hidden;

            box-shadow:
              0 16px 45px
              rgba(0, 0, 0, 0.40);

            border:
              1px solid
              rgba(255, 255, 255, 0.14);

            background:
              rgba(15, 23, 42, 0.35);

            backdrop-filter:
              blur(4px);

            -webkit-backdrop-filter:
              blur(4px);
          }


          .hero-carousel .slide-track {
            display: flex;

            transition:
              transform 0.5s
              ease-in-out;

            will-change:
              transform;
          }


          .hero-carousel .slide {
            min-width: 100%;

            height: 450px;

            position: relative;

            background:
              #1e293b;

            display: flex;

            align-items: center;

            justify-content: center;

            overflow: hidden;
          }


          .hero-carousel .slide img {
            width: 100%;

            height: 100%;

            object-fit: cover;

            background:
              #1e293b;

            display: block;
          }


          /* =====================================================
             CAROUSEL OVERLAY
          ===================================================== */

          .hero-carousel .slide-overlay {
            position: absolute;

            bottom: 0;

            left: 0;

            right: 0;

            padding: 24px 20px 20px;

            background:
              linear-gradient(
                to top,
                rgba(0, 0, 0, 0.78) 0%,
                rgba(0, 0, 0, 0.30) 60%,
                transparent 100%
              );

            color: #ffffff;
          }


          .hero-carousel .slide-overlay h3 {
            font-size: 20px;

            font-weight: 700;

            margin:
              0 0 3px;
          }


          .hero-carousel .slide-overlay p {
            font-size: 14px;

            opacity: 0.9;

            margin: 0;

            line-height: 1.4;
          }


          /* =====================================================
             RESPONSIVE - TABLET
          ===================================================== */

          @media (max-width: 1024px) {

            .hero-shopglowsy {
              min-height: auto;

              padding:
                100px 0 80px;
            }


            .hero-shopglowsy .container {
              grid-template-columns:
                1fr;

              gap: 45px;

              text-align: center;
            }


            .hero-shopglowsy-content p {
              margin-left: auto;

              margin-right: auto;
            }


            .hero-shopglowsy-actions {
              justify-content:
                center;
            }


            .hero-shopglowsy-stats {
              justify-content:
                center;
            }


            .hero-carousel {
              margin:
                0 auto;

              max-width:
                min(90%, 520px);
            }
          }


          /* =====================================================
             RESPONSIVE - MOBILE
          ===================================================== */

          @media (max-width: 768px) {

            .hero-shopglowsy {
              padding:
                88px 0 60px;

              min-height:
                auto;
            }


            .hero-shopglowsy .container {
              padding:
                0 16px;

              gap:
                36px;
            }


            .hero-shopglowsy-content h1 {
              font-size:
                34px;

              line-height:
                1.15;

              letter-spacing:
                -0.5px;
            }


            .hero-shopglowsy-content p {
              font-size:
                16px;

              line-height:
                1.6;

              margin-bottom:
                24px;
            }


            .hero-shopglowsy-actions {
              margin-bottom:
                28px;
            }


            .hero-shopglowsy-stats {
              gap:
                18px;

              padding-top:
                24px;

              flex-direction:
                row;

              flex-wrap:
                wrap;
            }


            .hero-shopglowsy-stats .stat {
              flex:
                1 1 80px;

              align-items:
                center;
            }


            .hero-shopglowsy-stats .stat-number {
              font-size:
                24px;
            }


            .hero-shopglowsy-stats .stat-label {
              font-size:
                12px;

              text-align:
                center;
            }


            .hero-carousel {
              width:
                100%;

              max-width:
                100%;

              border-radius:
                15px;
            }


            .hero-carousel .slide {
              height:
                350px;
            }
          }


          /* =====================================================
             RESPONSIVE - SMALL MOBILE
          ===================================================== */

          @media (max-width: 480px) {

            .hero-shopglowsy {
              padding:
                78px 0 50px;
            }


            .hero-shopglowsy .container {
              padding:
                0 12px;

              gap:
                28px;
            }


            .hero-shopglowsy-content h1 {
              font-size:
                29px;
            }


            .hero-shopglowsy-content p {
              font-size:
                15px;

              margin-bottom:
                22px;
            }


            .hero-shopglowsy-actions {
              flex-direction:
                column;

              align-items:
                stretch;

              width:
                100%;
            }


            .hero-shopglowsy-actions .btn-primary,
            .hero-shopglowsy-actions .btn-secondary {
              width:
                100%;

              box-sizing:
                border-box;
            }


            .hero-shopglowsy-stats {
              gap:
                12px;
            }


            .hero-shopglowsy-stats .stat-number {
              font-size:
                21px;
            }


            .hero-carousel .slide {
              height:
                280px;
            }


            .hero-carousel .slide-overlay {
              padding:
                20px 15px 15px;
            }


            .hero-carousel .slide-overlay h3 {
              font-size:
                16px;
            }


            .hero-carousel .slide-overlay p {
              font-size:
                12px;
            }
          }


          /* =====================================================
             VERY SMALL MOBILE
          ===================================================== */

          @media (max-width: 380px) {

            .hero-shopglowsy {
              padding:
                70px 0 45px;
            }


            .hero-shopglowsy-content h1 {
              font-size:
                26px;
            }


            .hero-shopglowsy-content p {
              font-size:
                14px;
            }


            .hero-carousel .slide {
              height:
                240px;
            }


            .hero-shopglowsy-stats .stat-number {
              font-size:
                19px;
            }


            .hero-shopglowsy-stats .stat-label {
              font-size:
                11px;
            }
          }


          /* =====================================================
             REDUCE MOTION
          ===================================================== */

          @media (prefers-reduced-motion: reduce) {

            .hero-carousel .slide-track {
              transition:
                none;
            }


            .hero-shopglowsy-actions
            .btn-primary,
            .hero-shopglowsy-actions
            .btn-secondary {
              transition:
                none;
            }
          }
        `}
      </style>


      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="hero-shopglowsy">

        <div className="container">

          {/* ─── LEFT: TEXT CONTENT ─────────────────────────── */}

          <div className="hero-shopglowsy-content">

            <h1>
              Buy & Sell with{" "}
              <span>Trust</span>{" "}
              in Ghana
            </h1>


            <p>
              Join thousands of Ghanaians buying and
              selling safely. List your items for free
              and reach buyers across the country.
            </p>


            {/* ─── CTA BUTTONS ─────────────────────────────── */}

            <div className="hero-shopglowsy-actions">

              <Link
                to="/post-ad"
                className="btn-primary"
              >
                <i className="fas fa-plus-circle"></i>

                Start Selling
              </Link>


              <Link
                to="/products"
                className="btn-secondary"
              >
                <i className="fas fa-search"></i>

                Browse Ads
              </Link>

            </div>


            {/* ─── STATS ────────────────────────────────────── */}

            <div className="hero-shopglowsy-stats">

              <div className="stat">

                <span className="stat-number">
                  200+
                </span>

                <span className="stat-label">
                  Active Listings
                </span>

              </div>


              <div className="stat">

                <span className="stat-number">
                  90+
                </span>

                <span className="stat-label">
                  Trusted Sellers
                </span>

              </div>


              <div className="stat">

                <span className="stat-number">
                  10k+
                </span>

                <span className="stat-label">
                  Monthly Views
                </span>

              </div>

            </div>

          </div>


          {/* ─── RIGHT: CAROUSEL ────────────────────────────── */}

          <div className="hero-carousel">

            <div
              className="slide-track"
              style={{
                transform:
                  `translateX(-${currentSlide * 100}%)`,
              }}
            >

              {slides.map((slide, index) => (

                <div
                  key={slide.id}
                  className="slide"
                >

                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={
                      index === 0
                        ? "eager"
                        : "lazy"
                    }
                    fetchpriority={   // ✅ fixed: lowercase 'fetchpriority'
                      index === 0
                        ? "high"
                        : "auto"
                    }
                  />


                  <div className="slide-overlay">

                    <h3>
                      🛒 {slide.title}
                    </h3>

                    <p>
                      {slide.subtitle}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>
    </>
  );
};

export default Hero;