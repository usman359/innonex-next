import { format } from "date-fns";

// Assuming `formatCustomDate` is a function that returns the date in the "1stSep2024" format
export const DateFilter = ({
  label,
  value,
  onChange,
  customDisplayValue,
  ...rest
}) => (
  <div className="flex items-center gap-1">
    <label className="md:w-full">{label}</label>

    {/* Display the custom formatted date */}
    <span>{customDisplayValue}</span>

    {/* Input field for date picker */}
    <input
      type="date"
      value={format(value, "yyyy-MM-dd")} // Keep the correct format for the input field
      onChange={onChange}
      max={format(new Date(), "yyyy-MM-dd")}
      {...rest}
      className="border rounded-sm px-2 text-xs font-light focus:outline-none focus:bg-yellow-200"
    />
  </div>
);
