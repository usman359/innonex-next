import React from "react";

const Select = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  isEditable = true,
  readOnly = false,
  status, // Add the status prop to control background color
  onlyFirstOption = false,
  isDocNumManuallyEntered, // Add the isDocNumManuallyEntered prop
  className = "",
}) => {
  // Add an empty option at the start if isRowEditable is true
  const updatedOptions = isEditable
    ? [{ value: "", label: "" }, ...options]
    : options;

  return (
    <div className="flex gap-2 items-center">
      <label className="w-[8rem]">{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled || onlyFirstOption}
        readOnly={readOnly}
        className={`outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none border border-stone-400 w-[8rem] disabled:opacity-100 flex-1 ${className} ${
          isDocNumManuallyEntered
            ? "bg-yellow-200"
            : status === "Open"
            ? "bg-white"
            : "bg-stone-200"
        }`}
      >
        {updatedOptions.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
