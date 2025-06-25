import React from "react";

export function Card({ children, className }) {
  return (
    <div className={`rounded-xl border bg-white p-6 shadow-sm ${className || ""}`}>
      {children}
    </div>
  );
}
export default Card;  