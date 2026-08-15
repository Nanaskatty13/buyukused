import React, { useRef } from 'react';
import ProductCard from './ProductCard';

const FeaturedProducts = ({ products = [], title = 'Latest Ads', link = '/products' }) => {
  const scrollRef = useRef(null);

  // Only show up to 8 products
  const display = products.slice(0, 8);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (display.length === 0) {
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

  return (
    <section className="featured-apple">
      <div className="featured-apple-header">
        <h2 className="featured-apple-title">
          <span className="featured-apple-icon">✦</span> {title}
        </h2>
        <a href={link} className="featured-apple-link">View All →</a>
      </div>

      <div className="featured-apple-carousel-wrapper">
        <button 
          className="featured-apple-arrow featured-apple-arrow-left" 
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div className="featured-apple-carousel" ref={scrollRef}>
          {display.map((product) => (
            <div key={product._id} className="featured-apple-item">
              <ProductCard product={product} appleStyle videoPreview />
            </div>
          ))}
        </div>

        <button 
          className="featured-apple-arrow featured-apple-arrow-right" 
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default FeaturedProducts;