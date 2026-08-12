import React, { useState } from "react";
import InfoPage from "./InfoPage";

const ReportAd = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <InfoPage
      title="Report Ad"
      subtitle="Help us keep the marketplace safe by reporting suspicious or inappropriate advertisements."
      icon="fa-flag"
    >
      <section>
        <h2>When should you report an ad?</h2>

        <p>
          You should report an advertisement if you believe it violates our
          marketplace rules or may put other users at risk.
        </p>

        <ul className="info-list">
          <li>Suspected scam or fraudulent advertisement.</li>
          <li>Fake, stolen, or misleading product information.</li>
          <li>Illegal or prohibited items.</li>
          <li>False pricing or misleading descriptions.</li>
          <li>Inappropriate or abusive content.</li>
          <li>Duplicate or spam advertisements.</li>
          <li>Suspicious seller behavior.</li>
        </ul>
      </section>

      <section>
        <h2>Report an advertisement</h2>

        {submitted ? (
          <div className="info-success">
            <h3>Report received</h3>
            <p>
              Thank you for helping keep our marketplace safe. Our team will
              review the report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="info-form">
            <div className="form-group">
              <label htmlFor="adId">Ad ID</label>
              <input
                id="adId"
                name="adId"
                type="text"
                placeholder="Enter the advertisement ID"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason for reporting</label>
              <select id="reason" name="reason" required>
                <option value="">Select a reason</option>
                <option value="scam">Scam or fraud</option>
                <option value="fake">Fake or misleading information</option>
                <option value="illegal">Illegal or prohibited item</option>
                <option value="spam">Spam or duplicate ad</option>
                <option value="inappropriate">
                  Inappropriate content
                </option>
                <option value="seller">Suspicious seller</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="details">Additional details</label>
              <textarea
                id="details"
                name="details"
                rows="5"
                placeholder="Tell us what you believe is wrong with this advertisement..."
              />
            </div>

            <button type="submit" className="info-button">
              Submit Report
            </button>
          </form>
        )}
      </section>

      <section>
        <h2>Important</h2>

        <p>
          Please only submit genuine reports. False or abusive reports may
          affect your marketplace account.
        </p>

        <p>
          If you believe you are in immediate danger or the situation involves
          criminal activity, contact the appropriate local authorities.
        </p>
      </section>
    </InfoPage>
  );
};

export default ReportAd;