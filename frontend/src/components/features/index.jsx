import React from "react";
import "./style.scss";

const Features = () => {
  return (
    <section className="features">
      <div className="feature-card">
        <h3>Fast</h3>
        <p>Our website loads incredibly fast.</p>
      </div>
      <div className="feature-card">
        <h3>Secure</h3>
        <p>We prioritize security at every step.</p>
      </div>
      <div className="feature-card">
        <h3>Responsive</h3>
        <p>Perfect on all devices.</p>
      </div>
    </section>
  );
};

export default Features;
