import React from "react";
import InfoPage from "./InfoPage";

const HowItWorks = () => {
  return (
    <InfoPage
      title="How It Works"
      subtitle="Buying and selling on BuyUk Used is simple."
      icon="fa-question-circle"
    >
      <section>
        <div className="info-step">
          <span>1</span>

          <div>
            <h2>Create an Account</h2>
            <p>
              Sign up for a free account to access marketplace features
              and manage your activity.
            </p>
          </div>
        </div>

        <div className="info-step">
          <span>2</span>

          <div>
            <h2>Browse or Post an Ad</h2>
            <p>
              Buyers can browse available listings while sellers can
              create ads for their products.
            </p>
          </div>
        </div>

        <div className="info-step">
          <span>3</span>

          <div>
            <h2>Contact the Seller</h2>
            <p>
              Found something you like? Contact the seller to ask
              questions and discuss the product.
            </p>
          </div>
        </div>

        <div className="info-step">
          <span>4</span>

          <div>
            <h2>Agree on the Deal</h2>
            <p>
              Discuss the price, location, delivery and other details
              directly with the seller.
            </p>
          </div>
        </div>

        <div className="info-step">
          <span>5</span>

          <div>
            <h2>Complete the Transaction</h2>
            <p>
              Complete your transaction safely and make sure the item
              matches the listing before paying.
            </p>
          </div>
        </div>
      </section>
    </InfoPage>
  );
};

export default HowItWorks;