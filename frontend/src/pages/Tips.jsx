import React from "react";
import InfoPage from "./InfoPage";

const Tips = () => {
  return (
    <InfoPage
      title="Tips"
      subtitle="Helpful tips for a better marketplace experience."
      icon="fa-lightbulb"
    >
      <section>
        <h2>Tips for Sellers</h2>

        <ul className="info-list">
          <li>Use clear and accurate product titles.</li>
          <li>Upload high-quality photos.</li>
          <li>Provide honest descriptions.</li>
          <li>Set a reasonable price.</li>
          <li>Respond to buyers promptly.</li>
          <li>Keep your contact information updated.</li>
        </ul>
      </section>

      <section>
        <h2>Tips for Buyers</h2>

        <ul className="info-list">
          <li>Read the entire advertisement.</li>
          <li>Ask questions before buying.</li>
          <li>Check the condition of the item.</li>
          <li>Compare prices before making a decision.</li>
          <li>Use safe meeting locations.</li>
        </ul>
      </section>
    </InfoPage>
  );
};

export default Tips;