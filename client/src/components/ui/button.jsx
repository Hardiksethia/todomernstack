import React from "react";
import classNames from "classnames";

export function button({ children, className, variant = "default", ...props }) {
  const base = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-black text-white hover:bg-neutral-800",
    outline: "border border-gray-300 text-black hover:bg-gray-100",
    ghost: "hover:bg-gray-100 text-black",
  };
  return (
    <button className={classNames(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
export default button;