import React from "react";
import { myMenu } from "../_data/myMenu";

export default function MyMenu() {
  return (
    <div>
      {/* Module items */}
      {myMenu.map((item, index) => (
        <div
          key={index}
          className="border-b border-stone-200 py-1 px-2 last:border-none bg-stone-100 cursor-pointer hover:bg-yellow-500"
        >
          {item}
        </div>
      ))}
    </div>
  );
}
