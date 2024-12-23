import React from "react";

const TextArea = ({
  label,
  value,
  onChange,
  readOnly = false,
  onFocus,
  onBlur,
  isEditable = true,
  className = "", // Allow passing custom classes
  icon, // New prop for the icon
  onIconClick, // New prop for icon click handler
  status, // Add status prop to control background color
}) => {
  return (
    <div className="flex gap-2 items-center relative">
      <label className="w-[8rem]">{label}</label>
      <textarea
        value={value || ""} // Ensure the value is controlled and has a fallback
        onChange={onChange}
        readOnly={readOnly}
        onFocus={onFocus}
        onBlur={onBlur}
        rows="5"
        className={`rounded-sm outline-none focus:bg-yellow-300 border border-stone-400 w-[8.5rem] pr-6 resize-none ${
          status === "Open"
            ? "bg-white" // Default background for "Open" status
            : "bg-stone-200" // Gray background for non-"Open" status
        } ${className}`} // Merge custom className with conditional classes
      />
      {icon && (
        <span className="absolute right-1 cursor-pointer" onClick={onIconClick}>
          {icon}
        </span>
      )}
    </div>
  );
};

export default TextArea;
