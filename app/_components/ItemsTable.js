import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AiFillDelete } from "react-icons/ai";
import { useTable } from "../_contexts/TableContext";
import Modal from "./Modal";
import { TableInput } from "./TableInput";
import { TableRow } from "./TableRow";

export default function ItemsTable() {
  const pathname = usePathname();

  const itemModalRef = useRef(null);
  const warehouseModalRef = useRef(null);
  const isCustomerSelected = useRef(null);
  const {
    contentTableRef,
    selectedCustomer,
    updateRowsToDisplay,
    itemType,
    setItemType,
    calculateTotals,
    warehouses,
    setOriginalRows,
    setOperation,
    isDocNumEditable,
    setRowsToDisplayState,
    status,
    isAddMode,
    items,
    salesOrderItemsLabels,
    checkLabels,
    setHasUnsavedChanges,
    ctrlFEnterPressed,
    taxRates,
    filteredRowsToDisplayState,
    rowsToDisplayState,
    incomingPaymentLabels,
    selectedRows,
    setSelectedRows,
    selectedItem,
  } = useTable();

  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");
  const [selectedItemRow, setSelectedItemRow] = useState(null); // Track the highlighted row
  const [selectedWarehouseRow, setSelectedWarehouseRow] = useState(null); // Track the highlighted row

  const handleCheckboxChange = (index) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows?.includes(index)) {
        // Deselect row, making it white
        return prevSelectedRows.filter((i) => i !== index);
      } else {
        // Select row, making it amber
        return [...prevSelectedRows, index];
      }
    });
  };

  const handleDeleteRow = (index) => {
    // Filter out rows that are completely empty
    const nonEmptyRows = rowsToDisplayState.filter(
      (row) => row.itemCode || row.itemDescription
    );

    // Check if there's only 1 non-empty row
    if (nonEmptyRows.length <= 1) {
      toast.error("There needs to be at least one row present.");
      return;
    }

    // Proceed to delete the row
    let updatedRows = rowsToDisplayState.filter(
      (_, rowIndex) => rowIndex !== index
    );

    // After deletion, ensure the last row has the correct lineStatus
    updatedRows = updatedRows.map((row) => ({
      ...row,
      lineStatus: row.lineStatus || "bost_Open", // Ensure each row has 'bost_Open' lineStatus
    }));

    // Ensure at least 10 rows
    while (updatedRows.length < 10) {
      updatedRows.push({ lineStatus: "bost_Open" });
    }

    // Update the state with the new rows
    setRowsToDisplayState(updatedRows);
    setHasUnsavedChanges(true); // Mark as unsaved changes

    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  useEffect(() => {
    if (isAddMode && selectedCustomer) {
      // Reset selected rows to ensure all rows have white background
      setSelectedRows([]);
    }
  }, [isAddMode, selectedCustomer, setSelectedRows]);

  useEffect(() => {
    // Ensure a minimum of 10 rows with 'bost_Open'
    if (filteredRowsToDisplayState.length < 10) {
      setRowsToDisplayState((prevRows) => {
        const updatedRows = [...prevRows];
        while (updatedRows.length < 10) {
          updatedRows.push({ lineStatus: "bost_Open" });
        }
        return updatedRows;
      });
    }
  }, [filteredRowsToDisplayState.length, setRowsToDisplayState]);

  const ensureMinimumRows = useCallback((rows) => {
    const updatedRows = [...rows];
    while (updatedRows.length < 10) {
      updatedRows.push({ lineStatus: "bost_Open" }); // Add empty rows with bost_Open status
    }
    return updatedRows;
  }, []);

  useEffect(() => {
    if (isAddMode) {
      setRowsToDisplayState((prevRows) =>
        ensureMinimumRows(
          prevRows.map((row) => ({ ...row, lineStatus: "bost_Open" }))
        )
      );
    }
  }, [isAddMode, ensureMinimumRows, setRowsToDisplayState]);

  useEffect(() => {
    const lastRow = rowsToDisplayState[rowsToDisplayState.length - 1];
    if (lastRow?.itemCode && lastRow?.itemDescription) {
      setRowsToDisplayState((prevRows) => [
        ...prevRows,
        { lineStatus: "bost_Open" },
      ]);
    }
  }, [rowsToDisplayState, setRowsToDisplayState]);

  useEffect(() => {
    if (isDocNumEditable) {
      const emptyRows = new Array(10).fill({ lineStatus: "bost_Open" });
      setRowsToDisplayState(emptyRows);
    }
  }, [isDocNumEditable, setRowsToDisplayState]);

  const filteredItems =
    items?.filter(
      (line) =>
        line.ItemCode?.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
        line.ItemName?.toLowerCase().includes(itemSearchTerm.toLowerCase())
    ) || [];

  const filteredWarehouse =
    warehouses?.filter(
      (warehouse) =>
        warehouse.code
          ?.toLowerCase()
          .includes(warehouseSearchTerm.toLowerCase()) ||
        warehouse.name
          ?.toLowerCase()
          .includes(warehouseSearchTerm.toLowerCase())
    ) || [];

  const handleTaxCodeChange = (e, index) => {
    const updatedRows = [...rowsToDisplayState];
    const selectedTaxCode = e.target.value;

    // Update the tax code for the specific row
    updatedRows[index] = {
      ...updatedRows[index],
      taxCode: selectedTaxCode,
      vatGroup: selectedTaxCode,
    };

    setRowsToDisplayState(updatedRows);
    setHasUnsavedChanges(true); // Mark as unsaved changes

    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const handleWarehouseSelection = (warehouse) => {
    const updatedRows = [...rowsToDisplayState];
    updatedRows[currentRowIndex] = {
      ...updatedRows[currentRowIndex],
      warehouseCode: warehouse.code,
    };
    updateRowsToDisplay(updatedRows);

    setHasUnsavedChanges(true); // Mark as unsaved changes

    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
    setWarehouseModalOpen(false);
  };

  const handleItemSelection = (item) => {
    const updatedRows = [...rowsToDisplayState];

    if (currentRowIndex !== null && updatedRows[currentRowIndex]) {
      updatedRows[currentRowIndex] = {
        ...updatedRows[currentRowIndex],
        itemCode: item.ItemCOde,
        itemDescription: item.ItemName,
        uoMCode:
          updatedRows[currentRowIndex].uoMCode || item.uoMCode || "Manual",
        quantity: item.quantity?.toString() || "1",
        unitPrice: item.unitPrice?.toString() || "1",
        lineTotal: (item.quantity || 1) * (item.unitPrice || 1),
        warehouseCode: updatedRows[currentRowIndex].warehouseCode || "01",
        lineStatus: "bost_Open",
        taxCode:
          updatedRows[currentRowIndex].taxCode ||
          item.taxCode ||
          item.vatGroup ||
          "GST-EO",
      };

      calculateTotals(updatedRows);

      // Ensure at least 10 rows
      if (
        updatedRows[currentRowIndex].itemCode &&
        updatedRows[currentRowIndex].itemDescription &&
        currentRowIndex === updatedRows.length - 1
      ) {
        updatedRows.push({ lineStatus: "bost_Open" });
      }

      if (updatedRows.length <= currentRowIndex + 1) {
        updatedRows.push({ lineStatus: "bost_Open" });
      }

      setRowsToDisplayState(updatedRows);
      setHasUnsavedChanges(true);

      if (isAddMode) setOperation("add");
      if (!isAddMode) setOperation("update");
      if (ctrlFEnterPressed) setOperation("update");

      setItemModalOpen(false);
    } else {
      toast.error("Invalid row selection.");
    }
  };

  const handleQuantityChange = (e, rowIndex) => {
    const quantity = e.target.value;
    const updatedRows = [...rowsToDisplayState];
    const unitPrice = parseFloat(updatedRows[rowIndex].unitPrice) || 0;
    const lineTotal = (parseFloat(quantity) || 0) * unitPrice;

    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      quantity,
      lineTotal,
    };

    setRowsToDisplayState(updatedRows);
    setHasUnsavedChanges(true); // Mark as unsaved changes

    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const handleUnitPriceChange = (e, rowIndex) => {
    const unitPrice = e.target.value;
    const updatedRows = [...rowsToDisplayState];
    const quantity = parseFloat(updatedRows[rowIndex].quantity) || 0;
    const lineTotal = quantity * (parseFloat(unitPrice) || 0);

    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      unitPrice,
      lineTotal,
    };

    setRowsToDisplayState(updatedRows);
    setHasUnsavedChanges(true); // Mark as unsaved changes

    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const isRowEditable = (index) => {
    const prevRow = rowsToDisplayState[index - 1];
    // Row is editable if it's the first row or the previous row is filled and open
    return (
      index === 0 ||
      (prevRow?.itemCode &&
        prevRow?.itemDescription &&
        prevRow?.lineStatus === "bost_Open")
    );
  };

  const getLastFilledRowIndex = () => {
    return rowsToDisplayState.reduce((lastFilledIndex, row, index) => {
      if (row.itemCode && row.itemDescription) {
        return index;
      }
      return lastFilledIndex;
    }, -1);
  };

  const isIconVisibleForRow = (line, index) => {
    // Hide icons when the status is not 'Open'
    if (status !== "Open") {
      return false;
    }

    if (line.lineStatus !== "bost_Open") {
      return false;
    }

    if (isAddMode) {
      isCustomerSelected.current =
        selectedCustomer?.cardCode && selectedCustomer?.cardName;

      if (index === 0 && isCustomerSelected.current) {
        return true;
      }

      if (index > 0) {
        const previousRow = rowsToDisplayState[index - 1];
        if (previousRow?.itemCode && previousRow?.itemDescription) {
          return true;
        }
      }

      if (line.itemCode && line.itemDescription) {
        return true;
      }

      return false;
    }

    if (!isAddMode) {
      if (line.itemCode && line.itemDescription) {
        return true;
      }

      return (
        index === getLastFilledRowIndex() + 1 && line.lineStatus === "bost_Open"
      );
    }

    return false;
  };

  // Close modal and reset selection logic
  const closeModalAndResetSelection = () => {
    setSelectedItemRow(null);
    setSelectedWarehouseRow(null);
    setItemModalOpen(false);
    setWarehouseModalOpen(false);
    setItemSearchTerm(""); // Reset search term when closing modals
    setWarehouseSearchTerm("");
  };

  // Modal close handler
  const handleModalClose = useCallback(() => {
    closeModalAndResetSelection();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (itemModalOpen &&
          itemModalRef.current &&
          !itemModalRef.current.contains(event.target)) ||
        (warehouseModalOpen &&
          warehouseModalRef.current &&
          !warehouseModalRef.current.contains(event.target))
      ) {
        handleModalClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [itemModalOpen, warehouseModalOpen, handleModalClose]);

  const handleChooseClick = () => {
    if (selectedItemRow) {
      handleItemSelection(selectedItemRow);
      setItemModalOpen(false); // Close the item modal
    } else if (selectedWarehouseRow) {
      handleWarehouseSelection(selectedWarehouseRow);
      setWarehouseModalOpen(false); // Close the warehouse modal
    }
  };

  const handleRowClick = (row, type) => {
    if (type === "item") setSelectedItemRow(row);
    if (type === "warehouse") setSelectedWarehouseRow(row);
  };

  const handleRowDoubleClick = (row, type) => {
    // Handle selection based on the type (either item or warehouse)
    if (type === "item") {
      handleItemSelection(row);
    } else if (type === "warehouse") {
      handleWarehouseSelection(row);
    }
  };

  const lastFilledRowIndex = getLastFilledRowIndex();

  const columns = [
    {
      className: "", // For index + 1
      render: ({ index }) => (
        <div>
          <div>{index + 1}</div>
        </div>
      ),
    },
    {
      className: "", // For Checkbox in Incoming Payments or Item Code
      render: ({ line, index, inputClassName }) => {
        if (pathname === "/incoming-payments") {
          const isRowFilled = line.docEntry || line.BaseRef || line.DocEntry;
          console.log(isRowFilled);
          return (
            isRowFilled && (
              <div className="flex justify-center items-center">
                <input
                  type="checkbox"
                  checked={selectedRows?.includes(index)} // Directly check if row is selected
                  onChange={() => handleCheckboxChange(index)}
                  className="accent-white w-full h-full"
                />
              </div>
            )
          );
        } else {
          // Render the usual Item Code for other pages
          return (
            <TableInput
              value={line.itemCode || ""}
              readOnly
              iconVisible={isIconVisibleForRow(line, index)} // Control visibility with conditional logic
              onIconClick={() => {
                setCurrentRowIndex(index);
                setItemModalOpen(true);
              }}
              onChange={() => {}}
              status={status}
              isFilled={!!(line.itemCode && line.itemDescription)}
              className={`${inputClassName} w-full h-full ${
                line.lineStatus === "bost_Open" ? "bg-white" : "bg-stone-200"
              }`}
            />
          );
        }
      },
    },
    {
      className: "", // For Item Description or Document Number based on pathname
      render: ({ line, index, inputClassName }) => {
        // Handle the document number specifically for incoming payments
        if (pathname === "/incoming-payments") {
          return (
            <div>
              {line.DocEntry || line.BaseRef
                ? line.DocEntry || line.BaseRef
                : ""}
            </div>
          );
        } else {
          // Handle item description for other pages
          return (
            <TableInput
              value={line.itemDescription || ""}
              readOnly
              iconVisible={isIconVisibleForRow(line, index)}
              onIconClick={() => {
                setCurrentRowIndex(index);
                setItemModalOpen(true);
              }}
              onChange={() => {}}
              status={status}
              className={`${inputClassName} w-full h-full ${
                line.lineStatus === "bost_Open" ? "bg-white" : "bg-stone-200"
              }`}
            />
          );
        }
      },
    },
    {
      className: "", // For UoM Code
      render: ({ line }) => (
        <div>
          <div>
            {pathname === "/incoming-payments" &&
            (line.docEntry || line.BaseRef)
              ? `${line.installmentId || 1} of 1`
              : ""}
            {pathname !== "/incoming-payments" &&
            line.itemCode &&
            line.itemDescription
              ? line.uoMCode || "Manual"
              : ""}
          </div>
        </div>
      ),
    },
    {
      className: "", // For Quantity or Document Type based on pathname
      render: ({ line, index, inputClassName }) => {
        if (pathname === "/incoming-payments") {
          return (
            <div>
              <div>
                {line.docEntry || line.BaseRef ? line.documentType || "IN" : ""}
              </div>
            </div>
          );
        } else {
          return (
            <input
              type="number"
              disabled={
                !isRowEditable ||
                line.lineStatus !== "bost_Open" ||
                !(line.itemCode && line.itemDescription)
              }
              value={line.quantity?.toString() || ""}
              onChange={(e) => handleQuantityChange(e, index)}
              className={`${inputClassName} w-full h-full ${
                line.lineStatus === "bost_Open" ? "bg-white" : "bg-stone-200"
              }`} // Maintain focus and background logic for quantity
            />
          );
        }
      },
    },

    {
      className: "", // For Unit Price or Applied Sum based on pathname
      render: ({ line, index, inputClassName }) => {
        if (pathname === "/incoming-payments") {
          return (
            <div>
              {line.docEntry || line.BaseRef
                ? line.appliedSys || line.NetAmount
                : ""}
            </div>
          );
        } else {
          return (
            <input
              type="number"
              disabled={
                !isRowEditable ||
                line.lineStatus !== "bost_Open" ||
                !(line.itemCode && line.itemDescription)
              }
              value={line.unitPrice?.toString() || ""}
              onChange={(e) => handleUnitPriceChange(e, index)}
              className={`${inputClassName} w-full h-full ${
                line.lineStatus === "bost_Open" ? "bg-white" : "bg-stone-200"
              }`}
            />
          );
        }
      },
    },

    {
      className: "", // For Total (LC)
      render: ({ line }) => {
        if (pathname === "/incoming-payments") {
          return <div>{(line.docEntry || line.BaseRef) && "0.0000"}</div>;
        } else {
          return (
            <div
              className={`w-full h-full ${
                line.lineStatus === "bost_Open" ? "bg-white" : "bg-stone-200"
              }`}
            >
              <div>{Math.round(line.lineTotal * 100) / 100 || ""}</div>
            </div>
          );
        }
      },
    },
    {
      className: "", // For Whse
      render: ({ line, index, inputClassName }) => {
        if (pathname === "/incoming-payments") {
          return (
            <div>
              {line.docEntry || line.BaseRef
                ? line.sumApplied || line.NetAmount
                : ""}
            </div>
          );
        } else {
          return (
            <TableInput
              value={line.warehouseCode || ""}
              readOnly
              iconVisible={isIconVisibleForRow(line)} // Control visibility with conditional logic
              onIconClick={() => {
                setCurrentRowIndex(index);
                setWarehouseModalOpen(true);
              }}
              onChange={() => {}}
              status={status}
              isFilled={!!(line.itemCode && line.itemDescription)} // Check if row is filled
              className={`${inputClassName} w-full h-full ${
                line.lineStatus === "bost_Open" ? "bg-white" : "bg-stone-200"
              }`}
            />
          );
        }
      },
    },
    {
      className: "", // For Tax Code
      render: ({ line, index, inputClassName }) => {
        // For the incoming payments page
        if (pathname === "/incoming-payments") {
          return line.docEntry || line.BaseRef ? (
            <div>
              <input type="checkbox" checked={false} onChange={() => {}} />
            </div>
          ) : null;
        }
        // For other pages
        else {
          const shouldShowTaxCodeSelect =
            line.itemCode &&
            line.itemDescription &&
            line.warehouseCode &&
            line.lineStatus === "bost_Open";
          // console.log(taxRates);
          // console.log(selectedItem);

          return shouldShowTaxCodeSelect ? (
            <select
              className={`${inputClassName} w-full h-full bg-white`}
              value={line.vatGroup || line.taxCode || ""}
              onChange={(e) => handleTaxCodeChange(e, index)}
            >
              {taxRates.map((rate, idx) => (
                <option key={idx} value={rate.description}>
                  {rate.description}
                </option>
              ))}
            </select>
          ) : line.itemCode &&
            line.itemDescription &&
            line.lineStatus !== "bost_Open" ? (
            <div
              className={`${inputClassName} w-full h-full bg-stone-200 pl-1`}
            >
              {line.vatGroup || line.taxCode || "GST-EO"}
            </div>
          ) : (
            <div
              className={`${inputClassName} w-full h-full bg-stone-200`}
            ></div> // Empty for incomplete rows
          );
        }
      },
    },
  ];

  // Add delete icon conditionally
  if (isAddMode || status === "Open") {
    if (
      rowsToDisplayState.some(
        (line) =>
          line.itemCode &&
          line.itemDescription &&
          line.lineStatus === "bost_Open"
      )
    ) {
      columns.push({
        className: "", // For Delete icon (bin icon)
        render: ({ line, index }) => (
          <div className="flex justify-center items-center">
            {line.itemCode &&
              line.itemDescription &&
              line.lineStatus === "bost_Open" && (
                <AiFillDelete
                  className="cursor-pointer text-red-500"
                  onClick={() => handleDeleteRow(index)}
                  title="Delete this row"
                />
              )}
          </div>
        ),
      });
    }
  }

  useEffect(() => {
    if (rowsToDisplayState.length === 0) {
      // Ensure all rows are initialized with lineStatus: "bost_Open"
      const initialRows = new Array(10).fill({ lineStatus: "bost_Open" });
      setRowsToDisplayState(initialRows);
    }
  }, [rowsToDisplayState.length, setRowsToDisplayState]);

  useEffect(() => {
    if (rowsToDisplayState.length > 0) {
      setOriginalRows([...rowsToDisplayState]);
      calculateTotals(rowsToDisplayState);
    }
  }, [rowsToDisplayState, calculateTotals, setOriginalRows]);

  useEffect(() => {
    if (rowsToDisplayState.length < 10) {
      setRowsToDisplayState((prevRows) => {
        const updatedRows = [...prevRows];
        while (updatedRows.length < 10) {
          updatedRows.push({ lineStatus: "bost_Open" });
        }
        return updatedRows;
      });
    }
  }, [rowsToDisplayState.length, setRowsToDisplayState]);

  return (
    <main className="relative overflow-x-auto">
      {pathname !== "/incoming-payments" && (
        <header className="flex flex-col sm:flex-row justify-between mb-2">
          <div className="flex gap-4 outline-none">
            <label className="w-[10rem]">Items/Service Type</label>
            <select
              className="w-full sm:w-1/2 border border-stone-200"
              onChange={(e) => setItemType(e.target.value)}
              value={itemType}
            >
              <option value="salesOrderItems">Item</option>
            </select>
          </div>
        </header>
      )}

      <div className="max-h-[18.25rem] overflow-y-auto">
        <table
          id="table-to-xls"
          ref={contentTableRef}
          className="w-full border-collapse table-auto"
        >
          <thead>
            <tr className="bg-stone-200 whitespace-nowrap sticky top-0 z-10">
              <>
                {pathname === "/payment-means" &&
                  checkLabels.map((item, index) => (
                    <th
                      key={index}
                      className="border border-stone-300 text-left p-0.5"
                    >
                      {item}
                    </th>
                  ))}
                {pathname === "/incoming-payments" &&
                  incomingPaymentLabels.map((item, index) => (
                    <th
                      key={index}
                      className="border border-stone-300 text-left p-0.5"
                    >
                      {item}
                    </th>
                  ))}
                {pathname !== "/incoming-payments" &&
                  pathname !== "/payment-means" &&
                  salesOrderItemsLabels.map((item, index) => (
                    <th
                      key={index}
                      className="border border-stone-300 text-left p-0.5"
                    >
                      {item}
                    </th>
                  ))}
              </>
            </tr>
          </thead>
          <tbody>
            {filteredRowsToDisplayState?.map((line, lineIndex) => (
              <TableRow
                key={lineIndex}
                line={line}
                index={lineIndex}
                columns={columns}
                handleQuantityChange={handleQuantityChange}
                handleUnitPriceChange={handleUnitPriceChange}
                setCurrentRowIndex={setCurrentRowIndex}
                setItemModalOpen={setItemModalOpen}
                setWarehouseModalOpen={setWarehouseModalOpen}
                isRowEditable={isRowEditable(lineIndex)} // Check if row is editable
                status={status}
                isItemDescriptionIconVisible={isIconVisibleForRow(
                  line,
                  lineIndex,
                  lastFilledRowIndex
                )} // Control visibility of the icons based on new logic
                isDocNumEditable={isDocNumEditable}
                isAddMode={isAddMode} // Pass isAddMode to control background logic
                pathname={pathname} // Pass pathname to control background logic
                selectedRows={selectedRows}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={warehouseModalOpen}
        onClose={handleModalClose} // Ensure state resets on moda close
        title="Select a Warehouse"
        onChoose={handleChooseClick} // Handle Choose button click
        selectedItem={selectedWarehouseRow}
      >
        <input
          type="text"
          placeholder="Search by warehouse code or warehouse name"
          value={warehouseSearchTerm}
          onChange={(e) => setWarehouseSearchTerm(e.target.value)}
          className="mb-4 p-2 border border-stone-300 rounded w-full"
        />
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead className="sticky top-0 bg-stone-200">
              <tr className="bg-stone-200">
                <th className="p-2 border text-start">#</th>
                <th className="p-2 border text-start">Warehouse Code</th>
                <th className="p-2 border text-start">Warehouse Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarehouse.map((warehouse, index) => (
                <tr
                  key={index}
                  className={`cursor-pointer hover:bg-gray-100 ${
                    selectedWarehouseRow === warehouse
                      ? "bg-yellow-200" // Highlight selected row
                      : ""
                  }`}
                  onClick={() => handleRowClick(warehouse, "warehouse")} // Single click highlights
                  onDoubleClick={() =>
                    handleRowDoubleClick(warehouse, "warehouse")
                  }
                >
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{warehouse.code}</td>
                  <td className="p-2 border">{warehouse.name}</td>
                </tr>
              ))}
              {filteredWarehouse.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-stone-500">
                    No warehouse available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal
        isOpen={itemModalOpen}
        onClose={handleModalClose} // Ensure state resets on modal close
        title="Select an Item"
        onChoose={handleChooseClick} // Handle Choose button click
        selectedItem={selectedItemRow}
      >
        <input
          type="text"
          placeholder="Search by item code or name"
          value={itemSearchTerm}
          onChange={(e) => setItemSearchTerm(e.target.value)}
          className="mb-4 p-2 border border-stone-300 rounded w-full"
        />
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead className="sticky top-0 bg-stone-200">
              <tr className="bg-stone-200">
                <th className="p-2 border text-start">#</th>
                <th className="p-2 border text-start">Item Code</th>
                <th className="p-2 border text-start">Description</th>
                <th className="p-2 border text-start">In Stock</th>
                <th className="p-2 border text-start">Warehouse Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr
                  key={index}
                  className={`cursor-pointer hover:bg-stone-100 ${
                    selectedItemRow === item
                      ? "bg-yellow-200" // Highlight selected row
                      : ""
                  }`}
                  onClick={() => handleRowClick(item, "item")} // Single click highlights
                  onDoubleClick={() => handleRowDoubleClick(item, "item")}
                >
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{item.ItemCOde}</td>
                  <td className="p-2 border">{item.ItemName}</td>
                  <td className="p-2 border">{item.onhand}</td>
                  <td className="p-2 border">{item.DfltWH}</td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No items available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </main>
  );
}
