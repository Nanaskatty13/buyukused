import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'KN Classifieds',
    siteDesc: 'Buy & Sell in Ghana',
    email: 'admin@knclassifieds.com',
    phone: '0542928081',
    maintenance: false,
    registration: true,
    approval: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = () => {
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-container">
      <div className="settings-grid">
        <div className="settings-card">
          <h4>⚙️ General Settings</h4>
          <div className="form-group">
            <label>Site Name</label>
            <input
              type="text"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Site Description</label>
            <input
              type="text"
              name="siteDesc"
              value={settings.siteDesc}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Contact Email</label>
            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
            />
          </div>
          <button className="btn-save" onClick={handleSave}>Save Changes</button>
        </div>

        <div className="settings-card">
          <h4>🔒 Security & Preferences</h4>
          <div className="form-group">
            <label>Maintenance Mode</label>
            <div className="toggle-group">
              <label>
                <input
                  type="checkbox"
                  name="maintenance"
                  checked={settings.maintenance}
                  onChange={handleChange}
                />
                Enable maintenance mode
              </label>
            </div>
            <div className="hint">When enabled, only admins can access the site.</div>
          </div>
          <div className="form-group">
            <label>User Registration</label>
            <div className="toggle-group">
              <label>
                <input
                  type="checkbox"
                  name="registration"
                  checked={settings.registration}
                  onChange={handleChange}
                />
                Allow new registrations
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Product Approval</label>
            <div className="toggle-group">
              <label>
                <input
                  type="checkbox"
                  name="approval"
                  checked={settings.approval}
                  onChange={handleChange}
                />
                Require admin approval for new products
              </label>
            </div>
            <div className="hint">When enabled, products must be reviewed before going live.</div>
          </div>
          <button className="btn-save" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;