import { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import ReactToPrint from "react-to-print";
import { useTable } from "../_contexts/TableContext";
import Input from "./Input";
import { TableRow } from "./TableRow";
import { format, parseISO } from "date-fns";

export default function CheckTable() {
  const {
    contentTableRef,
    printButtonRef,
    wordButtonRef,
    calculateTotals,
    setOperation,
    isDocNumEditable,
    // setRowsToDisplayState,
    status,
    isAddMode,
    checkLabels,
    setHasUnsavedChanges,
    ctrlFEnterPressed,
    filteredRowsToDisplayState,
    rowsToDisplayState,
    isDocNumManuallyEntered,
    setPaymentChecks,
    setBankOptions,
    setCheckAccount,
    bankOptions,
    SERVER_ADDRESS,
    check,
    checkOptions,
    setCheckOptions,
    setChecks,
    selectedItem,
    checkRowsToDisplayState,
    setCheckRowsToDisplayState,
    total,
    setBankCharge,
    cashTotal,
    bankTotal,
  } = useTable();

  const [accountOptions, setAccountOptions] = useState([]);

  useEffect(() => {
    // Calculate sum of the rows' amounts
    console.log(checkRowsToDisplayState);
    const rowsSum = checkRowsToDisplayState.reduce(
      (acc, row) => acc + (parseFloat(row.amount) || 0),
      0
    );
    const overallTotal = parseFloat(total) || 0;

    // Calculate Bank Charge
    const charge = overallTotal - rowsSum;
    setBankCharge(charge);

    const cashSum = parseFloat(cashTotal) || 0;
    const transferSum = parseFloat(bankTotal) || 0;
    // setPaid(cashSum + transferSum);
  }, [
    bankTotal,
    cashTotal,
    check,
    checkRowsToDisplayState,
    setBankCharge,
    total,
  ]); // Re-run when relevant data changes

  useEffect(() => {
    if (selectedItem?.paymentChecks?.length > 0) {
      const rows = selectedItem.paymentChecks.map((check) => ({
        dueDate: check.dueDate,
        checkNumber: check.checkNumber,
        amount: check.checkSum, // Standardize to 'amount'
        account: check.AccountNum, // Standardize to 'account'
        checkAccount: check.checkAccount,
        bankCode: check.bankCode,
        selectedBankName: check.SelectedBankName,
        isEditable: true, // Rows are not editable by default
        lineStatus: "bost_Open",
        countryRegion: check.countryRegion || "Pakistan", // Default value
        bankName: check.bankCode || "", // Assuming bankCode maps to bankName
      }));

      setCheckRowsToDisplayState(rows);
    }
  }, [selectedItem, setCheckRowsToDisplayState]);

  // Initialize rowsToDisplayState with the first row editable only once on first render
  useEffect(() => {
    if (checkRowsToDisplayState.length === 0) {
      const initialRows = Array.from({ length: 10 }, (_, index) => ({
        lineStatus: "bost_Open",
        isEditable: index === 0, // Only the first row is editable initially
      }));
      setCheckRowsToDisplayState(initialRows);
    }
  }, [setCheckRowsToDisplayState, checkRowsToDisplayState.length]);
  useEffect(() => {
    setCheckRowsToDisplayState((prevRows) => {
      const rows = [...prevRows];

      while (rows.length < 10) {
        rows.push({
          lineStatus: "bost_Open",
          isEditable: isAddMode && rows.length === prevRows.length, // Editable only in add mode
          dueDate: null,
          amount: null,
        });
      }

      return rows;
    });
  }, [isAddMode, setCheckRowsToDisplayState]);

  const handleFieldChange = (value, rowIndex, fieldName) => {
    const updatedRows = [...rowsToDisplayState];

    // Update the field in the row
    updatedRows[rowIndex][fieldName] = value;

    // Update rowsToDisplayState with the new value
    setCheckRowsToDisplayState(updatedRows);

    // Update the PaymentChecks to keep it in sync with the rowsToDisplayState
    setPaymentChecks((prevChecks) => {
      const newChecks = [...prevChecks];

      // Ensure the row exists in PaymentChecks
      if (!newChecks[rowIndex]) {
        newChecks[rowIndex] = {
          DueDate: null,
          CheckNumber: String(rowIndex),
          CheckSum: null,
          AccountNum: null,
          CheckAccount: null,
          BankCode: "CBA",
          SelectedBankName: "CommonWealth Bank",
        };
      }

      // Update the appropriate field in PaymentChecks
      if (fieldName === "dueDate") {
        newChecks[rowIndex].DueDate = value ? `${value}T00:00:00` : null;
      } else if (fieldName === "amount") {
        newChecks[rowIndex].CheckSum = value || null;
      } else if (fieldName === "account") {
        newChecks[rowIndex].AccountNum = value || null;
      } else if (fieldName === "bankName") {
        fetchBankAccountFromCode(value);
        newChecks[rowIndex].BankCode = value || "";
      } else if (fieldName === "countryRegion") {
        // Handle additional fields if needed
        updatedRows[rowIndex].countryRegion = value || "Pakistan";
      }
      setChecks(newChecks);
      return newChecks;
    });

    if (
      updatedRows[rowIndex].dueDate &&
      updatedRows[rowIndex].amount &&
      rowIndex + 1 < updatedRows.length
    ) {
      updatedRows[rowIndex + 1].isEditable = true;
    }

    setHasUnsavedChanges(true);
    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  // const handleFieldChange = (value, rowIndex, fieldName) => {
  //   console.log(fieldName);
  //   const updatedRows = [...rowsToDisplayState];

  //   const defaults = {
  //     countryRegion: "Pakistan",
  //     bankName: "Commonwealth Bank",
  //     branch: 1,
  //     account: 1,
  //     checkNo: 1,
  //   };

  //   updatedRows[rowIndex][fieldName] = value || defaults[fieldName];

  //   // If the field is bankName, fetch related accounts and update options
  //   if (fieldName === "bankName") {
  //     fetchBankAccountFromCode(value);

  //     const selectedBankName = updatedRows[rowIndex].bankName || "";
  //     // console.log(updatedRows[rowIndex].account);
  //     // console.log(
  //     //   `Field: ${fieldName}, Selected Bank for this account: ${selectedBankName}`
  //     // );
  //     // console.log(accountOptions);
  //     const selectedAccount = accountOptions.find(
  //       (account) => account.code === value
  //     );
  //     // console.log(selectedAccount?.name);

  //     // Add selected bank name to the local storage data structure
  //     setPaymentChecks((prevChecks) => {
  //       const newChecks = [...prevChecks];
  //       if (!newChecks[rowIndex]) {
  //         newChecks[rowIndex] = {
  //           DueDate: null,
  //           CheckNumber: String(rowIndex),
  //           CheckSum: null,
  //           AccountNum: null,
  //           CheckAccount: null,
  //           BankCode: "MIB",
  //           check,
  //         };
  //       }
  //       // Store both the bank and account information
  //       newChecks[rowIndex].SelectedBankName = selectedBankName;
  //       newChecks[rowIndex].AccountNum = value;
  //       setChecks(newChecks);
  //       return newChecks;
  //     });
  //   }

  //   // Make the next row editable if the current row has both dueDate and amount filled
  //   if (
  //     updatedRows[rowIndex].dueDate &&
  //     updatedRows[rowIndex].amount &&
  //     rowIndex + 1 < updatedRows.length
  //   ) {
  //     updatedRows[rowIndex + 1].isEditable = true;
  //   }

  //   setCheckRowsToDisplayState(updatedRows);

  //   setPaymentChecks((prevChecks) => {
  //     const newChecks = [...prevChecks];
  //     if (!newChecks[rowIndex]) {
  //       newChecks[rowIndex] = {
  //         DueDate: null,
  //         CheckNumber: String(rowIndex),
  //         CheckSum: null,
  //         AccountNum: null,
  //         CheckAccount: null,
  //         BankCode: "MIB",
  //         check,
  //         accountCode: checkOptions[0]?.AcctCode,
  //       };
  //     }
  //     if (fieldName === "dueDate")
  //       newChecks[rowIndex].DueDate = value ? `${value}T00:00:00` : null;
  //     if (fieldName === "amount") newChecks[rowIndex].CheckSum = value || null;
  //     if (fieldName === "bankName")
  //       newChecks[rowIndex].BankCode = value || defaults.bankName;
  //     if (fieldName === "account")
  //       newChecks[rowIndex].AccountNum = value || defaults.account;

  //     return newChecks;
  //   });

  //   setHasUnsavedChanges(true);
  //   if (isAddMode) setOperation("add");
  //   if (!isAddMode) setOperation("update");
  //   if (ctrlFEnterPressed) setOperation("update");
  // };

  const fetchBankAccountFromCode = async (bankCode) => {
    try {
      const response = await fetch(
        `${SERVER_ADDRESS}api/Common/GetBankAccount/${bankCode}`
      );
      if (response.ok) {
        const data = await response.json();
        setCheckAccount(data);
        setAccountOptions(data);
      }
    } catch (error) {
      console.error("Error fetching bank account data:", error);
    }
  };

  const fetchBankOptions = async () => {
    try {
      const response = await fetch(
        `${SERVER_ADDRESS}api/Common/GetBanks/check`
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setBankOptions(data);
      }
    } catch (error) {
      console.error("Error fetching bank data:", error);
    }
  };

  useEffect(() => {
    fetchBankOptions();
  }, []);
  const fetchGlOptions = async () => {
    try {
      const response = await fetch(`${SERVER_ADDRESS}api/Common/GetBanks/gl`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setCheckOptions(data);
      }
    } catch (error) {
      console.error("Error fetching bank data:", error);
    }
  };

  useEffect(() => {
    fetchGlOptions();
  }, []);

  const columns = [
    {
      render: ({ line, index }) => (
        <div
          className={`w-full h-full ${
            line.lineStatus === "bost_Open" ? "bg-white" : "bg-stone-200"
          }`}
        >
          <div>{index + 1}</div>
        </div>
      ),
    },
    {
      render: ({ line, index, inputClassName }) =>
        line.isEditable || index === 0 ? (
          <input
            type={isAddMode ? "date" : "text"}
            value={
              isAddMode
                ? line.dueDate || ""
                : line.dueDate
                ? format(parseISO(line.dueDate), "yyyy-MM-dd")
                : ""
            }
            onChange={(e) =>
              handleFieldChange(e.target.value, index, "dueDate")
            }
            className={`${inputClassName} w-full h-full bg-white`}
            disabled={!isAddMode}
          />
        ) : null,
    },
    {
      render: ({ line, index, inputClassName }) =>
        line.isEditable || index === 0 ? (
          <input
            type="number"
            value={line.amount || line.checkSum || ""}
            onChange={(e) => handleFieldChange(e.target.value, index, "amount")}
            className={`${inputClassName} w-full h-full bg-white`}
            disabled={!isAddMode}
          />
        ) : null,
    },
    {
      render: ({ line, index, inputClassName }) =>
        line.isEditable || index === 0 ? (
          <select
            value={line.countryRegion || ""}
            onChange={(e) =>
              handleFieldChange(e.target.value, index, "countryRegion")
            }
            className={`${inputClassName} w-full h-full bg-white`}
            disabled={!isAddMode}
          >
            <option value="Pakistan">Pakistan</option>
            <option value="Australia">Australia</option>
            <option value="New Zealand">New Zealand</option>
          </select>
        ) : null,
    },
    {
      render: ({ line, index, inputClassName }) =>
        line.isEditable || index === 0 ? (
          <select
            value={line.bankName || ""}
            onChange={(e) =>
              handleFieldChange(e.target.value, index, "bankName")
            }
            className={`${inputClassName} w-full h-full bg-white`}
            disabled={!isAddMode}
          >
            {bankOptions.map((bank) => (
              <option key={bank.BankCode} value={bank.BankCode}>
                {bank.BankName}
              </option>
            ))}
          </select>
        ) : null,
    },
    {
      render: ({ line, index, inputClassName }) =>
        line.isEditable || index === 0 ? (
          <input
            type="number"
            value={line.checkNo || 1}
            readOnly
            className={`${inputClassName} w-full h-full bg-white`}
            disabled={!isAddMode}
          />
        ) : null,
    },
    {
      render: ({ line, index, inputClassName }) =>
        line.isEditable || index === 0 ? (
          <select
            value={line.account || ""}
            onChange={(e) =>
              handleFieldChange(e.target.value, index, "account")
            }
            className={`${inputClassName} w-full h-full bg-white`}
            disabled={!isAddMode}
          >
            {accountOptions.map((account) => (
              <option key={account.code} value={account.code}>
                {account.name}
              </option>
            ))}
          </select>
        ) : null,
    },
    {
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
    },
  ];

  return (
    <main className="relative overflow-x-auto">
      <header className="flex flex-col sm:flex-row gap-2 mb-1">
        <Input
          label="G/L Account"
          value={checkOptions[0]?.FatherNum}
          readOnly={status !== "Open"}
          isEditable={isDocNumManuallyEntered}
          status={status}
        />
        <span>{checkOptions[0]?.AcctName || null}</span>
      </header>
      <main className="flex gap-2 items-center mb-2">
        <input type="checkbox" />
        <label>Search By Bank Code</label>
      </main>

      <ReactToPrint
        trigger={() => (
          <button ref={printButtonRef} className="hidden">
            Print
          </button>
        )}
        content={() => contentTableRef.current}
      />
      <button className="hidden" ref={wordButtonRef}>
        Download as DOCX
      </button>

      <div className="max-h-[18.25rem] overflow-y-auto">
        <table
          id="table-to-xls"
          ref={contentTableRef}
          className="w-full border-collapse table-auto"
        >
          <thead>
            <tr className="bg-stone-200 sticky top-0 z-10">
              {checkLabels.map((item, index) => (
                <th
                  key={index + item}
                  className="border border-stone-300 text-left p-0.5"
                >
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checkRowsToDisplayState.map((line, lineIndex) => (
              <TableRow
                key={lineIndex}
                line={line}
                index={lineIndex}
                columns={columns}
                status={status}
                isDocNumEditable={isDocNumEditable}
                isAddMode={isAddMode}
              />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
