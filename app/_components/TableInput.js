import { memo } from "react";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";

export const TableInput = ({
  value,
  onChange,
  readOnly = false,
  iconVisible = false,
  onIconClick,
  className, // Accept className for dynamic styling
  isDropdownVisible,
  filteredItemList,
  handleItemSelect, // Pass the appropriate item select handler
  index,
}) => {
  return (
    <div className="flex items-center w-full relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e, index)}
        readOnly={readOnly}
        className={`w-full pr-8 ${className || ""}`} // Use passed className
      />
      {iconVisible && (
        <span
          className="absolute right-2 cursor-pointer text-stone-500"
          onClick={onIconClick}
        >
          <HiAdjustmentsHorizontal />
        </span>
      )}
      {/* Dropdown for filtered items */}
      {isDropdownVisible && filteredItemList.length > 0 && (
        <ul className="absolute z-10 translate-y-[5.55rem] bg-white border border-stone-300 w-[8.5rem] max-h-40 overflow-y-auto">
          {filteredItemList.map((item) => (
            <li
              key={item.ItemCOde} // Assuming ItemCode is unique
              onClick={() => handleItemSelect(item)}
              className="cursor-pointer p-2 hover:bg-stone-100"
            >
              {item.ItemCOde} - {item.ItemName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Wrap your component with React.memo and assign a displayName
const MemoizedTableInput = memo(TableInput);
MemoizedTableInput.displayName = "TableInput"; // Add displayName explicitly

export { MemoizedTableInput };
