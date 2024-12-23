export const TableRow = ({
  line,
  index,
  columns,
  handleQuantityChange,
  handleUnitPriceChange,
  setCurrentRowIndex,
  setItemModalOpen,
  setWarehouseModalOpen,
  isRowEditable,
  status,
  isItemDescriptionIconVisible,
  isDocNumEditable,
  isAddMode,
  pathname,
  selectedRows,
}) => {
  const getRowBackground = (line) => {
    if (selectedRows?.includes(index)) {
      return "bg-amber-200";
    }
    if (pathname === "/incoming-payments" && !isAddMode) {
      const isFilled =
        line.docEntry ||
        line.BaseRef ||
        line.installmentId ||
        line.documentType ||
        line.appliedSys ||
        line.sumApplied; // Add relevant fields that indicate a filled row

      return isFilled ? "bg-amber-200" : "bg-white";
    }
    // Default background colors based on lineStatus or empty status for other paths
    return line.lineStatus === "bost_Open" ? "bg-white" : "bg-stone-200";
  };

  // Use the getRowBackground function to determine the background color
  const rowClassName = getRowBackground(line);

  return (
    <tr className={`w-full ${rowClassName}`}>
      {columns.map((col, colIndex) => (
        <td
          key={colIndex + col}
          className={`border border-stone-300 ${
            colIndex === 2 ? "min-w-[250px] max-w-[400px] break-all" : ""
          }`}
        >
          {col?.render({
            line,
            index,
            handleQuantityChange,
            handleUnitPriceChange,
            setCurrentRowIndex,
            setItemModalOpen,
            setWarehouseModalOpen,
            isRowEditable,
            status,
            isItemDescriptionIconVisible:
              isRowEditable &&
              line.lineStatus === "bost_Open" &&
              isItemDescriptionIconVisible,
            isDocNumEditable,
            inputClassName: `outline-none focus:ring-2 focus:ring-yellow-600`,
          })}
        </td>
      ))}
    </tr>
  );
};
