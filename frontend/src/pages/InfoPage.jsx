// frontend/src/pages/InfoPage.jsx

import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const InfoPage = ({
  title,
  subtitle,
  icon = "fa-info-circle", // default icon if not provided
  children,
  backTo = "/",
  backText = "Back to Home",
  showBackButton = true,
  headerActions, // optional extra actions (buttons/links) in header
}) => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="info-page">
      <div className="info-page-container">
        {/* Header */}
        <div className="info-page-header">
          <div className="info-page-icon" aria-hidden="true">
            <i className={`fas ${icon}`}></i>
          </div>

          <h1>{title}</h1>

          {subtitle && <p>{subtitle}</p>}

          {headerActions && (
            <div className="info-page-actions">{headerActions}</div>
          )}
        </div>

        {/* Content */}
        <div className="info-page-content">{children}</div>

        {/* Bottom Navigation */}
        {showBackButton && (
          <div className="info-page-bottom">
            <Link to={backTo} className="info-back-btn">
              <i className="fas fa-arrow-left" aria-hidden="true"></i>
              {backText}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default InfoPage;