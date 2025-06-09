import React from "react";
import './Aurora.css';

export default function Aurora({ colorStops = ["#5227FF", "#7cff67", "#5227FF"] }) {
  const style = {
    background: `linear-gradient(120deg, ${colorStops.join(',')})`
  };

  return (
    <div className="aurora-container">
      <div className="aurora" style={style}></div>
    </div>
  );
}
