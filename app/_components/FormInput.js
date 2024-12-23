import React from "react";

export default function FormInput({ label }) {
  return (
    // {/* Label and input/option container */}
    <div className="flex gap-2 items-center border-b">
      <label className="w-[9rem]">{label}</label>
      <input
        type="text"
        className="rounded-sm outline-none w-1/2 focus:bg-yellow-200 border border-gray-400"
      />
    </div>
  );
}
