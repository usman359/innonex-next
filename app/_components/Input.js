import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      value,
      onChange,
      onKeyDown,
      readOnly = false,
      onFocus,
      onBlur,
      isEditable = true,
      icon,
      onIconClick,
      status, // Add the status prop to control background color
      pathname = null,
      style,
    },
    ref
  ) => {
    return (
      <div className="flex gap-2 items-center relative" style={style}>
        <label className="w-[8rem]">{label}</label>
        <input
          type={type}
          value={value ?? ""}
          onChange={onChange}
          onKeyDown={onKeyDown}
          readOnly={readOnly || !onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          ref={ref}
          className={`outline-yellow-600 focus:bg-yellow-300 border border-stone-400 pr-6 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 rounded-none ${
            pathname !== "/incoming-payments"
              ? "w-[8.5rem]"
              : "w-[7.75rem] ml-auto"
          } ${
            isEditable
              ? "bg-yellow-200" // If doc number is manually entered, show yellow background
              : status === "Open"
              ? "bg-white" // Default background for "Open" status
              : "bg-stone-200" // Gray background for non-"Open" status
          }`}
        />
        {icon && (
          <span
            className="absolute right-1 cursor-pointer"
            onClick={onIconClick}
          >
            {icon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
