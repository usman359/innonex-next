import { format } from "date-fns";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AiFillDelete } from "react-icons/ai"; // Import bin icon
import { useTable } from "../_contexts/TableContext";
import { TableRow } from "./TableRow";

export default function IPContentTable() {
  const pathname = usePathname();

  const {
    contentTableRef,
    selectedCustomer,
    itemType,
    setItemType,
    calculateTotals,
    setOriginalRows,
    setOperation,
    isDocNumEditable,
    setRowsToDisplayState,
    status,
    isAddMode,
    salesOrderItemsLabels,
    checkLabels,
    setHasUnsavedChanges,
    ctrlFEnterPressed,
    filteredRowsToDisplayState,
    rowsToDisplayState,
    incomingPaymentLabels,
    selectedRows,
    setSelectedRows,
  } = useTable();

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
        const isRowFilled = line.docEntry || line.BaseRef || line.DocEntry;
        // console.log(isRowFilled);
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
      },
    },
    {
      className: "", // For Item Description or Document Number based on pathname
      render: ({ line, index, inputClassName }) => {
        return (
          <div>
            {line.docEntry || line.BaseRef | line.DocEntry
              ? line.DocEntry || line.BaseRef || line.docEntry
              : ""}
          </div>
        );
      },
    },
    {
      className: "", // For UoM Code
      render: ({ line }) => (
        <div>
          <div>
            {line.docEntry || line.BaseRef || line.DocEntry
              ? `${line.installmentId || 1} of 1`
              : ""}
          </div>
        </div>
      ),
    },
    {
      className: "", // For Quantity or Document Type based on pathname
      render: ({ line, index, inputClassName }) => {
        return (
          <div>
            <div>
              {line.docEntry || line.BaseRef || line.DocEntry
                ? line.documentType || "IN"
                : ""}
            </div>
          </div>
        );
      },
    },
    {
      className: "", // For Quantity or Document Type based on pathname
      render: ({ line, index, inputClassName }) => {
        return (
          <div>
            <div>
              {line.docEntry || line.BaseRef || line.DocEntry
                ? line.DocDate || line.docDate
                  ? format(line.DocDate || line.docDate, "dd.MM.yyyy")
                  : ""
                : ""}
            </div>
          </div>
        );
      },
    },
    {
      className: "", // For Unit Price or Applied Sum based on pathname
      render: ({ line, index, inputClassName }) => {
        return (
          <div>
            {line.docEntry || line.BaseRef || line.DocEntry
              ? line.appliedSys || line.NetAmount || line.DocTotal
              : ""}
          </div>
        );
      },
    },

    {
      className: "", // For Total (LC)
      render: ({ line }) => {
        return (
          <div>
            {(line.docEntry || line.BaseRef || line.DocEntry) && "0.0000"}
          </div>
        );
      },
    },
    {
      className: "", // For Whse
      render: ({ line, index, inputClassName }) => {
        return (
          <div>
            {line.docEntry || line.BaseRef || line.DocEntry
              ? line.sumApplied || line.NetAmount || line.DocTotal
              : ""}
          </div>
        );
      },
    },
    {
      className: "", // For Tax Code
      render: ({ line, index, inputClassName }) => {
        return line.docEntry || line.BaseRef || line.DocEntry ? (
          <div>
            <input type="checkbox" checked={false} onChange={() => {}} />
          </div>
        ) : null;
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
                isRowEditable={isRowEditable(lineIndex)} // Check if row is editable
                status={status}
                isAddMode={isAddMode} // Pass isAddMode to control background logic
                pathname={pathname} // Pass pathname to control background logic
                selectedRows={selectedRows}
              />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
