import React from "react";
import classNames from 'classnames';


export function Input({ label, error, helper, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        {...props}
        className={classNames(
          "block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none",
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black",
          className
        )}
      />
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
export default Input;