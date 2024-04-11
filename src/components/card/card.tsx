import React from "react";
import "./card.css";

interface CardProps {
  title: string;
  logo: string;
  desc: string;
}
const card: React.FC<CardProps> = ({ title, logo, desc }) => {
  return (
    <div className="gradient-border">
      <div className="card-container">
        <div>
          <h1>{title}</h1>
          <img src={logo} className="card-svg" alt="" />
        </div>

        <p className="card-desc">{desc}</p>
      </div>
    </div>
  );
};

export default card;
