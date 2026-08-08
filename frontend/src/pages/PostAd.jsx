import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createProductWithFiles } from '../services/api'; // ✅ fixed import

// (Keep all your LOCATION DATA, iphoneColors, etc. unchanged – they're too long to repeat here)
// I'll assume you keep the data arrays as they are.

const PostAd = () => {
  const { user, token, login, register } = useAuth();
  const navigate = useNavigate();

  // ... all state declarations unchanged (step, formData, mediaItems, etc.)
  // They are identical to what you have – I'll omit them for brevity.

  // ... all handler functions (handleChange, goToNextStep, etc.) unchanged.

  return (
    <div className="post-ad-container">
      <h2>📢 Post Free Ad</h2>
      <p className="subtitle">
        {step === 1 ? 'Step 1 of 2 – Basic details' : 'Step 2 of 2 – Additional details'}
      </p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="form-group">
              <label>Ad Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Toyota Corolla 2020"
                required
              />
            </div>

            <div className="form-group">
              <label>Price (GH₵) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Cars">Cars</option>
                <option value="Phones">Phones</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Jobs">Jobs</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home">Home</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Location dropdowns – same as before, just with className="form-group" */}
            <div className="form-group">
              <label>Location *</label>
              <select value={selectedCountry} onChange={handleCountryChange}>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={selectedRegion} onChange={handleRegionChange}>
                <option value="">Select Region</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedRegion}
              >
                <option value="">Select City</option>
                {selectedRegion && citiesByRegion[selectedRegion]?.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="hint">
                Your ad will appear as: <strong>{formData.location}</strong>
              </span>
            </div>

            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="sellerPhone"
                value={formData.sellerPhone}
                onChange={handleChange}
                placeholder="054 123 4567"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your item..."
              />
            </div>

            <div className="form-group">
              <label>Upload Images (up to 5)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
              <span className="hint">You can select multiple images.</span>
            </div>

            <div className="form-group">
              <label>Upload Video (optional)</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
              />
              <span className="hint">MP4, MOV, AVI (max 50MB).</span>
            </div>

            {mediaItems.length > 0 && (
              <div className="media-grid">
                {mediaItems.map((item, index) => (
                  <div key={index} className="media-item">
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeMedia(index)}
                    >
                      ✕
                    </button>
                    {item.type === 'video' ? (
                      <video src={item.preview} muted playsInline />
                    ) : (
                      <img src={item.preview} alt={`Preview ${index + 1}`} />
                    )}
                    {item.type === 'video' && (
                      <span className="video-badge">🎬</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="btn-primary" onClick={goToNextStep}>
              Next: Additional Details →
            </button>
          </>
        )}

        {/* STEP 2 – exactly the same, just with className="form-group" and step buttons */}
        {step === 2 && (
          <>
            <div className="form-group">
              <label>Storage</label>
              <select name="storage" value={formData.storage} onChange={handleChange}>
                <option value="">Select storage</option>
                <option value="16GB">16GB</option>
                <option value="32GB">32GB</option>
                <option value="64GB">64GB</option>
                <option value="128GB">128GB</option>
                <option value="256GB">256GB</option>
                <option value="512GB">512GB</option>
                <option value="1TB">1TB</option>
                <option value="2TB">2TB</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Color</label>
              <select name="color" value={formData.color} onChange={handleChange}>
                <option value="">Select color</option>
                {iphoneColors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Battery Health (%)</label>
              <input
                type="number"
                name="batteryHealth"
                value={formData.batteryHealth}
                onChange={handleChange}
                placeholder="e.g. 85"
                min="0"
                max="100"
                step="1"
              />
              <span className="hint">Enter battery health percentage (0–100).</span>
            </div>

            <div className="form-group">
              <label>SIM Status</label>
              <select name="simStatus" value={formData.simStatus} onChange={handleChange}>
                <option value="eSIM Unlocked">eSIM Unlocked</option>
                <option value="SIM Unlocked">SIM Unlocked</option>
                <option value="Locked">Locked</option>
                <option value="Bypass">Bypass</option>
              </select>
            </div>

            <div className="form-group">
              <label>Face ID</label>
              <select name="faceId" value={formData.faceId} onChange={handleChange}>
                <option value="Working">Working</option>
                <option value="Not Working">Not Working</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>

            <div className="form-group">
              <label>Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange}>
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label>Negotiation</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  name="negotiation"
                  checked={formData.negotiation}
                  onChange={handleChange}
                />
                <span>Price is negotiable</span>
              </div>
              <span className="hint">If checked, buyers can negotiate.</span>
            </div>

            <div className="form-group">
              <label>Swap Accepted</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  name="swapAccepted"
                  checked={formData.swapAccepted}
                  onChange={handleChange}
                />
                <span>I accept trades / swaps</span>
              </div>
              <span className="hint">Indicate you are open to swapping.</span>
            </div>

            <div className="step-buttons">
              <button type="button" className="btn-outline" onClick={goToPreviousStep}>
                ← Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ flex: 2 }} // optional inline for fine-tuning
              >
                {isSubmitting ? 'Publishing...' : 'Publish Ad →'}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Auth Modal – with updated classes */}
      {showAuthModal && (
        <div className="auth-overlay" onClick={closeAuthModal}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeAuthModal}>&times;</button>
            <h2>{authMode === 'login' ? 'Welcome Back 👋' : 'Join KN Classifieds 🚀'}</h2>
            <p className="auth-subtitle">
              {authMode === 'login' ? 'Login to publish your ad' : 'Create an account to publish your ad'}
            </p>
            {authError && <div className="error-banner">{authError}</div>}
            <form onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder={authMode === 'login' ? 'Enter your password' : 'Min 6 characters'}
                  required
                  minLength="6"
                />
              </div>
              {authMode === 'register' && (
                <div className="form-group">
                  <label>Phone (optional)</label>
                  <input
                    type="tel"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="054 123 4567"
                  />
                </div>
              )}
              <button
                type="submit"
                className={authMode === 'login' ? 'btn-primary' : 'btn-secondary'}
                disabled={authLoading}
              >
                {authLoading
                  ? authMode === 'login' ? 'Logging in...' : 'Creating account...'
                  : authMode === 'login' ? 'Log In →' : 'Create Account →'}
              </button>
            </form>
            <div className="auth-footer">
              {authMode === 'login' ? (
                <>
                  No account?{' '}
                  <span onClick={() => switchAuthMode('register')}>Create free account</span>
                </>
              ) : (
                <>
                  Already have account?{' '}
                  <span onClick={() => switchAuthMode('login')}>Sign in</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostAd;