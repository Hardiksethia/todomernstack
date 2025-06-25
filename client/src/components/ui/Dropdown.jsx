import React, { useState, useRef, useEffect } from "react";
import classNames from 'classnames';



export default function Dropdown({ triggerText = "Open Dropdown" }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {triggerText}
      </button>

      {open && (
        <div className="absolute mt-2 w-40 bg-white border rounded shadow-md">
          <ul>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Item 1</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Item 2</li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Item 3</li>
          </ul>
        </div>
      )}
    </div>
  );
}
