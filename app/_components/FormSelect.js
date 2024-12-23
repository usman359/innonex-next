import React from "react";

export default function FormSelect({
  label,
  onChange = null,
  value = null,
  options = null,
}) {
  return (
    <div className="flex gap-2 items-center border-b">
      <label className="w-[9rem]">{label}</label>
      <select
        onChange={onChange}
        value={value}
        className="rounded-sm ml-auto w-[8.5rem] outline-none focus:bg-yellow-200 border border-gray-400"
      >
        {options?.map((item, index) => (
          <option key={index} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
