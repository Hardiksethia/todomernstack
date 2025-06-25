import React, { useState } from "react";
import classNames from 'classnames';


export function Tabs({ tabs = [] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex border-b">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={classNames(
              "px-4 py-2 text-sm font-medium",
              i === active ? "border-b-2 border-black text-black" : "text-gray-500"
            )}
            onClick={() => setActive(i)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs[active].content}</div>
    </div>
  );
}
export default Tabs;