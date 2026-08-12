// frontend/src/pages/InfoPage.jsx

import React from "react";
import { Link } from "react-router-dom";

const InfoPage = ({
  title,
  subtitle,
  icon,
  children,
  backTo = "/",
  backText = "Back to Home",
}) => {
  return (
    <div className="info-page">
      <div className="info-page-container">

        {/* Header */}
        <div className="info-page-header">
          <div className="info-page-icon">
            <i className={`fas ${icon}`}></i>
          </div>

          <h1>{title}</h1>

          {subtitle && <p>{subtitle}</p>}
        </div>

        {/* Content */}
        <div className="info-page-content">
          {children}
        </div>

        {/* Bottom Navigation */}
        <div className="info-page-bottom">
          <Link to={backTo} className="info-back-btn">
            <i className="fas fa-arrow-left"></i>
            {backText}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default InfoPage;