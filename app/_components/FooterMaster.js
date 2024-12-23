import { format, isValid, parseISO, set } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaChevronUp } from "react-icons/fa";
import { HiAdjustmentsHorizontal, HiCurrencyDollar } from "react-icons/hi2";
import { useTable } from "../_contexts/TableContext";
import PaymentMeans from "../payment-means/page";
import Input from "./Input";
import Modal from "./Modal";
import PMModal from "./PMModal";
import Select from "./Select";
import Spinner from "./Spinner";
import TextArea from "./TextArea";

const FooterMaster = () => {
  const pathname = usePathname();

  const freightModalRef = useRef(null);
  const copyToButtonRef = useRef(null);
  const copyFromButtonRef = useRef(null);
  const copyToContainerRef = useRef(null);
  const copyFromContainerRef = useRef(null);
  const router = useRouter();
  const ownerModalRef = useRef(null);
  const {
    selectedItem,
    salesEmployees,
    totalBeforeDiscount,
    setTotalBeforeDiscount,
    total,
    selectedCustomer,
    deliveryDate,
    postingDate,
    documentNumber,
    documentDate,
    rowsToDisplayState,
    operation,
    setOperation,
    resetItemData,
    remarks,
    setRemarks,
    salesEmployee,
    setSalesEmployee,
    owner,
    setOwner,
    customerRefNumber,
    isDocNumManuallyEntered,
    isAddMode,
    freights,
    setFreights,
    freightTotal,
    setFreightTotal,
    postingDocument,
    updatingDocument,
    setPostingDocument,
    setUpdatingDocument,
    status,
    isItemDescriptionIconVisible,
    discountPercentage,
    discountValue,
    setDiscountValue,
    SERVER_ADDRESS,
    setHasUnsavedChanges,
    setItemsByDateAndFormType,
    selectedFromDate,
    selectedToDate,
    setDiscountPercentage,
    documentAdditionalExpenses,
    setDocumentAdditionalExpenses,
    setTotal,
    orderType,
    ctrlFEnterPressed,
    tax,
    series,
    journalRemarks,
    setJournalRemarks,
    selectedEntityType,
    dueDate,
    selectedRows,
    glAccount,
    transferDate,
    referenceBank,
    token,
    setPayments,
    bankTotal,
    setCopyToTriggered,
    setCopyToFrom,
    currentPage,
    paymentOnAccount,
    setPaymentOnAccount,
    isPaymentMeansModalOpen,
    setIsPaymentMeansModalOpen,
    cashTotal,
    checks,
    setPaymentChecks,
    setGlAccount,
    setTransferDate,
    setReferenceBank,
    bankOptions,
    setCashTotal,
    setBankTotal,
    setCurrentPage,
    copyToFrom,
    copyToTo,
    setCopyToTo,
    cashOptions,
    documentEntry,
  } = useTable();

  const isAccountSelected = selectedEntityType === "account";

  // Local States
  const [tempDiscountPercentage, setTempDiscountPercentage] =
    useState(discountPercentage);
  const [tempDiscountValue, setTempDiscountValue] = useState(discountValue);
  const [selectedOwnerRow, setSelectedOwnerRow] = useState(null); // Track the highlighted row
  const [selectedFreightRow, setSelectedFreightRow] = useState(null); // Track the highlighted row
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isFreightModalOpen, setIsFreightModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCopyFromContainer, setShowCopyFromContainer] = useState(false);
  const [showCopyToContainer, setShowCopyToContainer] = useState(false);
  const [footerBtnText, setFooterBtnText] = useState("");
  const [payOnAccount, setPayOnAccount] = useState(false);
  const [paid, setPaid] = useState(null);

  const openPaymentMeansModal = () => {
    setOperation("ok");
    setIsPaymentMeansModalOpen(true);
  };

  const closePaymentMeansModal = () => {
    setIsPaymentMeansModalOpen(false);
  };

  useEffect(() => {
    if (selectedItem && pathname === "/incoming-payments") {
      // console.log(selectedItem);
      const newChecks = selectedItem.paymentChecks || [];
      setPaymentChecks(newChecks);
      // console.log(bankOptions);
      // console.log(cashOptions);
      const selectedBank = bankOptions.find(
        (bank) => bank.BankCode === selectedItem.transferAccount
      );
      const selectedCashBank = cashOptions.find(
        (bank) => bank.BankCode === selectedItem.cashAccount
      );
      console.log(selectedCashBank);
      setGlAccount(selectedCashBank?.BankName);
      setTransferDate(selectedItem.transferDate);
      setReferenceBank(selectedItem.transferReference);
      setBankTotal(selectedItem.transferSum);
      setCashTotal(selectedItem.cashSum);
    }
  }, [
    selectedItem,
    pathname,
    setPaymentChecks,
    setGlAccount,
    setTransferDate,
    setReferenceBank,
    bankOptions,
    setCashTotal,
    setBankTotal,
    cashOptions,
  ]);

  // useEffect(() => {
  //   if (isAddMode || operation === "update") {
  //     const totalFreight = freights.reduce((sum, freight) => {
  //       return sum + (parseFloat(freight.netAmount) || 0);
  //     }, 0);
  //     setFreightTotal(totalFreight.toFixed(4));
  //   }
  // }, [freights, isAddMode, operation]);

  useEffect(() => {
    // console.log(operation);
    if (pathname === "/payment-means") {
      setFooterBtnText("OK");
    } else if (isAddMode && operation === "add") {
      setFooterBtnText("Add");
    } else if (operation === "update") {
      setFooterBtnText("Update");
    } else if (operation === "find") {
      setFooterBtnText("Find");
    } else if (operation === "ok") {
      setFooterBtnText("Add");
    } else {
      setFooterBtnText("OK"); // Default to "Add" for other paths
    }
  }, [pathname, isAddMode, operation]);

  // Close the container if clicked outside, but not when clicking the button
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        copyToContainerRef.current &&
        !copyToContainerRef.current.contains(event.target) &&
        !copyToButtonRef.current.contains(event.target)
      ) {
        setShowCopyToContainer(false);
      }
      if (
        copyFromContainerRef.current &&
        !copyFromContainerRef.current.contains(event.target) &&
        !copyFromButtonRef.current.contains(event.target)
      ) {
        setShowCopyFromContainer(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper Maps
  const statusMap = {
    Open: "bost_Open",
    Closed: "bost_Close",
    Cancelled: "tYES",
    Delivery: "bost_Delivered",
  };

  const documentStatus = statusMap[status] || "bost_Open"; // Map status to document status
  const isCopyToButtonEnabled = !isAddMode && documentStatus === "bost_Open";
  // const isCopyToButtonEnabled = currentPage && !copyToFrom;
  // const isCopyFromButtonEnabled = currentPage && copyToTo === pathname;
  // console.log(pathname);
  // console.log(copyToTo);
  // console.log(isCopyToButtonEnabled);
  // console.log(isCopyFromButtonEnabled);

  const taxGroupOptions = [
    { value: "S2", label: "AU Sales - GST Exempt/GST Fee" },
    { value: "GST-ZRO", label: "NZ GST - Zero Rated" },
    { value: "Define New", label: "Define New" },
  ];

  const distributionMethodOptions = [
    "None",
    "Quantity",
    "Volume",
    "Weight",
    "Equally",
    "Row Total",
  ];

  const filteredEmployees = salesEmployees.filter(
    (emp) =>
      `${emp.name} ${emp.code}.toLowerCase().includes(searchTerm.toLowerCase())`
  );

  const filteredFreights = freights.filter(
    (freight) =>
      `${freight.ExpnsName}.toLowerCase().includes(searchTerm.toLowerCase())`
  );

  // Utility Functions
  // Close modal and reset selection logic
  const closeModalAndResetSelection = () => {
    setSelectedOwnerRow(null);
    setSelectedFreightRow(null);
    setIsOwnerModalOpen(false);
    setIsFreightModalOpen(false);
    setSearchTerm(""); // Reset search term when closing modals
  };

  // Modal close handler
  const handleModalClose = useCallback(() => {
    closeModalAndResetSelection();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (isFreightModalOpen &&
          freightModalRef.current &&
          !freightModalRef.current.contains(event.target)) ||
        (isOwnerModalOpen &&
          ownerModalRef.current &&
          !ownerModalRef.current.contains(event.target))
      ) {
        handleModalClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFreightModalOpen, isOwnerModalOpen, handleModalClose]);

  const handleChooseClick = () => {
    if (selectedOwnerRow) {
      handleOwnerSelection(selectedOwnerRow);
      setIsOwnerModalOpen(false); // Close the owner modal
    } else if (selectedFreightRow) {
      handleFreightSelection(selectedFreightRow);
      setIsFreightModalOpen(false); // Close the freight modal
    }
  };

  const handleRowClick = (row, type) => {
    if (type === "owner") setSelectedOwnerRow(row);
    if (type === "freight") setSelectedFreightRow(row);
  };

  const handleRowDoubleClick = (row, type) => {
    if (type === "owner") {
      handleOwnerSelection(row);
    } else if (type === "freight") {
      handleFreightSelection(row);
    }
  };

  const formatDateForApi = (date) => {
    if (!date) return null;
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(parsedDate)) {
      console.error("Invalid date passed to formatDateForApi:", date);
      return null;
    }
    return format(parsedDate, "yyyy-MM-dd'T'00:00:00");
  };

  const validateRequiredFields = () => {
    const isSalesOrderPage = pathname !== "/incoming-payments"; // Check if the current page is not Incoming Payments

    // Common validation: Ensure customer details are provided
    if (!selectedCustomer?.cardCode || !selectedCustomer?.cardName) {
      toast.error("Card Code and Card Name are required.");
      return false;
    }

    // Validate date fields based on the page type
    if (isSalesOrderPage) {
      if (!postingDate || !documentDate || !deliveryDate) {
        toast.error(
          "Posting Date, Document Date, and Delivery Date are required."
        );
        return false;
      }
      if (
        !isValid(parseISO(postingDate)) ||
        !isValid(parseISO(documentDate)) ||
        !isValid(parseISO(deliveryDate))
      ) {
        toast.error("One or more date values provided are invalid.");
        return false;
      }
    } else {
      // Incoming Payments page
      if (!postingDate || !documentDate || !dueDate) {
        toast.error(
          "Posting Date, Document Date, and Due Date are required for payments."
        );
        return false;
      }
      if (
        !isValid(parseISO(postingDate)) ||
        !isValid(parseISO(documentDate)) ||
        !isValid(parseISO(dueDate))
      ) {
        toast.error("One or more date values provided are invalid.");
        return false;
      }
    }

    // Validate line items if it's a Sales Order page
    if (isSalesOrderPage) {
      const nonEmptyRows = (rowsToDisplayState || []).filter(
        (row) => row.itemCode || row.itemDescription
      );
      if (nonEmptyRows.length === 0) {
        toast.error("At least one row in the content table is required.");
        return false;
      }
      for (const row of nonEmptyRows) {
        if (row.unitPrice <= 0) {
          toast.error("Unit Price must be greater than 0 for all items.");
          return false;
        }
      }
    }

    // Validate discount for both pages
    if (parseFloat(discountValue) > totalBeforeDiscount) {
      toast.error(
        "Discount value cannot be greater than the Total Before Discount."
      );
      setTotal(0);
      return false;
    }

    if (
      isSalesOrderPage &&
      (totalBeforeDiscount === null ||
        total === null ||
        isNaN(totalBeforeDiscount) ||
        isNaN(total))
    ) {
      toast.error("Total Before Discount and Total values are required.");
      return false;
    }

    return true;
  };

  // Handlers
  const handleEmployeeChange = (e) => {
    const selectedEmployeeCode = e.target.value;
    const selectedEmployee = salesEmployees.find(
      (emp) => emp.code === selectedEmployeeCode
    );
    setSalesEmployee(selectedEmployee?.name || ""); // Set the name of the selected employee
    setHasUnsavedChanges(true); // Mark as unsaved changes
    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const handleOwnerChange = (e) => {
    setOwner(e.target.value || "");
    setHasUnsavedChanges(true); // Mark as unsaved changes
    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
    setHasUnsavedChanges(true); // Mark as unsaved changes
    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const handleJournalRemarksChange = (e) => {
    setJournalRemarks(e.target.value);
    setHasUnsavedChanges(true); // Mark as unsaved changes
    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const handleTotalBeforeDiscountChange = (e) => {
    setTotalBeforeDiscount(e.target.value * 1);
    setHasUnsavedChanges(true); // Mark as unsaved changes
    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const handleOwnerSelection = (employee) => {
    setOwner(employee.name || "");
    setHasUnsavedChanges(true);
    setIsOwnerModalOpen(false);
    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const calculateTotalFreight = () => {
    const totalFreight = freights.reduce((total, freight) => {
      // Parse netAmount as a float and ensure it's a valid number or default to 0
      const netAmount = parseFloat(freight.netAmount);
      return total + (isNaN(netAmount) ? 0 : netAmount);
    }, 0);

    return Math.round(totalFreight * 100) / 100; // Format to 4 decimal places
  };

  const handleFreightChange = (index, field, value) => {
    const updatedFreights = [...freights];

    if (field === "netAmount") {
      const netAmount = parseFloat(value) || 0;
      updatedFreights[index].netAmount = netAmount;
      updatedFreights[index].grossAmount = netAmount; // Assuming grossAmount is the same as netAmount
    } else {
      updatedFreights[index][field] = value || ""; // Handle other fields like taxGroup
    }

    console.log(updatedFreights);
    setFreights(updatedFreights);

    // Recalculate the freight total and update state
    // const newTotalFreight = calculateTotalFreight(updatedFreights);
    // setFreightTotal(newTotalFreight);

    // Update documentAdditionalExpenses after every change
    updateDocumentAdditionalExpenses(index, updatedFreights[index]);
  };

  // Helper function to update documentAdditionalExpenses
  const updateDocumentAdditionalExpenses = (index, freightRow) => {
    setDocumentAdditionalExpenses((prevExpenses) => {
      const existingExpenseIndex = prevExpenses.findIndex(
        (exp) => exp.LineNum === index
      );

      const expenseCode = freightRow.ExpnsCode;
      const vatGroup = freightRow.taxGroup || ""; // Retrieve the correct taxGroup for each row
      const netAmount = parseFloat(freightRow.netAmount) || 0; // Ensure netAmount is valid

      // Prepare the new expense object
      const newExpense = {
        LineNum: index,
        LineTotal: netAmount,
        ExpenseName: freightRow.ExpnsName,
        ExpenseCode: expenseCode,
        VatGroup: vatGroup,
      };

      // If netAmount is greater than 0, update or add the expense
      if (netAmount > 0) {
        if (existingExpenseIndex > -1) {
          // Update the existing expense
          return prevExpenses.map((exp, i) =>
            i === existingExpenseIndex ? newExpense : exp
          );
        } else {
          // Add the new expense
          return [...prevExpenses, newExpense];
        }
      } else if (existingExpenseIndex > -1) {
        // Remove the expense if netAmount is 0
        return prevExpenses.filter((_, i) => i !== existingExpenseIndex);
      }

      // If no changes are required, return the existing expenses
      return prevExpenses;
    });
  };

  useEffect(() => {
    // if (isFreightModalOpen) {
    // console.log(freights);
    // Create a copy of the freights and update it based on the documentAdditionalExpenses
    const updatedFreights = freights.map((freight, index) => {
      const associatedExpense = selectedItem?.documentAdditionalExpenses?.find(
        (expense) => expense.expenseCode === freight.ExpnsCode
      );
      // console.log(associatedExpense);

      // Update netAmount and grossAmount based on the associatedExpense
      if (associatedExpense) {
        return {
          ...freight,
          netAmount: associatedExpense.lineTotal, // Update netAmount with LineTotal from the expense
          grossAmount: associatedExpense.lineTotal, // Assuming grossAmount is the same as netAmount
        };
      }

      // If no associatedExpense found, return freight as is
      return freight;
    });

    // console.log(updatedFreights);
    // Set the updated freights
    setFreights(updatedFreights);

    // Now update documentAdditionalExpenses after every change (if needed)
    updatedFreights.forEach((freight, index) => {
      updateDocumentAdditionalExpenses(index, freight);
    });
    // }
  }, [isFreightModalOpen]);

  const handleFreightSelection = (freight) => {
    const index = selectedFreightRow.index;
    const updatedFreights = [...freights];

    // updatedFreights[index] = {
    //   ...updatedFreights[index],
    //   ...freight,
    //   netAmount: parseFloat(freight.netAmount) || 0,
    //   grossAmount: parseFloat(freight.grossAmount) || 0,
    // };

    updatedFreights[index] = freight;

    // Ensure that netAmount is a valid number
    const netAmount = parseFloat(freight.netAmount);
    updatedFreights[index].netAmount = isNaN(netAmount) ? 0 : netAmount;

    // Update freight total
    setFreightTotal(calculateTotalFreight());
    setFreights(updatedFreights);
    setHasUnsavedChanges(true);

    if (freight.netAmount > 0.0) {
      const newExpense = {
        LineNum: index, // Use the current index for LineNum
        LineTotal: freight.netAmount,
        ExpenseName: freight.ExpnsName,
        ExpenseCode: freight.ExpnsCode,
        VatGroup: freight.taxGroup || "",
      };

      setDocumentAdditionalExpenses((prev) => {
        const existingIndex = prev.findIndex((exp) => exp.LineNum === index);

        if (existingIndex > -1) {
          // Update existing expense
          return prev.map((exp, i) => (i === existingIndex ? newExpense : exp));
        } else {
          // Add new expense
          return [...prev, newExpense];
        }
      });
    } else {
      // Remove the expense if netAmount is set to 0
      setDocumentAdditionalExpenses((prev) =>
        prev.filter((exp) => exp.LineNum !== index)
      );
    }

    // setFreights(updatedFreights); // Update freights state
    // setFreightTotal(calculateTotalFreight(updatedFreights)); // Recalculate total
    // console.log(calculateTotalFreight(updatedFreights));
    // setHasUnsavedChanges(true);

    // setDocumentAdditionalExpenses((prev) => {
    //   const expenseIndex = prev.findIndex((exp) => exp.LineNum === index);
    //   const newExpense = {
    //     LineNum: index,
    //     LineTotal: updatedFreights[index].netAmount,
    //     ExpenseName: updatedFreights[index].ExpnsName,
    //     ExpenseCode: updatedFreights[index].ExpnsCode,
    //     VatGroup: updatedFreights[index].taxGroup || "",
    //   };

    //   if (expenseIndex > -1) {
    //     return prev.map((exp, i) => (i === expenseIndex ? newExpense : exp));
    //   } else {
    //     return [...prev, newExpense];
    //   }
    // });

    setIsFreightModalOpen(false); // Close the modal
    // setHasUnsavedChanges(true);
    // setIsOwnerModalOpen(false);
    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const handleDiscountPercentageChange = (e) => {
    // Parse the value and ensure it is a valid number
    const value = e.target.value ? parseFloat(e.target.value) : 0;

    // Ensure the percentage does not exceed 100%
    if (value > 100) {
      toast.error("Discount percentage cannot be greater than 100.");
      return;
    }

    // Round to 4 decimal places before setting
    const roundedValue = Math.round(value * 10000) / 10000;
    setDiscountPercentage(roundedValue);

    // Calculate the discount value based on total before discount
    if (totalBeforeDiscount > 0) {
      const calculatedDiscountValue =
        Math.round(((totalBeforeDiscount * roundedValue) / 100) * 10000) /
        10000;

      // Set discount value, rounding to 4 decimal places
      setDiscountValue(calculatedDiscountValue);
    }

    setHasUnsavedChanges(true); // Mark as unsaved changes

    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  // Handle discount value change
  const handleDiscountValueChange = (e) => {
    const value = e.target.value ? parseFloat(e.target.value) : 0;

    // Validate and prevent discount from exceeding total before discount
    if (value > totalBeforeDiscount) {
      toast.error(
        "Discount value cannot be greater than the Total Before Discount."
      );
      return;
    }

    // Round to 4 decimal places before setting
    const roundedValue = Math.round(value * 10000) / 10000;
    setDiscountValue(roundedValue);

    // Calculate the discount percentage based on the discount value
    if (totalBeforeDiscount > 0) {
      const newDiscountPercentage = (roundedValue / totalBeforeDiscount) * 100;
      setDiscountPercentage(Math.round(newDiscountPercentage * 10000) / 10000); // Round to 4 decimal places
    }

    setHasUnsavedChanges(true); // Mark as unsaved changes

    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  // useEffect to update temp states when context values change
  useEffect(() => {
    setDiscountPercentage(discountPercentage);
    setDiscountValue(discountValue);
  }, [
    discountPercentage,
    discountValue,
    setDiscountPercentage,
    setDiscountValue,
  ]);

  // Handler for Pay on Account checkbox
  const handlePayOnAccountToggle = () => {
    setPayOnAccount((prev) => !prev); // Toggle the payOnAccount state
  };

  // Update Payment on Account value handler
  const handlePaymentOnAccountChange = (e) => {
    const value = e.target.value;
    setPaymentOnAccount(value); // Update as user types, without formatting
    setHasUnsavedChanges(true);

    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  // Prepare Payment Data (specific for payments)
  const preparePaymentData = () => {
    const selectedRowsData = rowsToDisplayState?.filter((_, index) =>
      selectedRows?.includes(index)
    );

    const paymentInvoices = selectedRowsData?.map((row, index) => ({
      LineNum: index,
      DocEntry: Number(row.DocEntry) || Number(row.BaseRef),
      SumApplied: row.sumApplied || row.NetAmount || row.DocTotal || 0,
      DistributionRule: null,
      InvoiceType: row.invoiceType || "it_Invoice",
      InstallmentId: row.installmentId || 1,
    }));

    const paymentData = {
      DocEntry: 0,
      DocNum: null,
      DocType: "rCustomer",
      DocDate: formatDateForApi(postingDate),
      CardCode: selectedCustomer?.cardCode,
      CardName: selectedCustomer?.cardName,
      CashAccount: glAccount || null,
      // ControlAccount: checksData[0]?.accountCode
      //   ? checksData[0]?.accountCode
      //   : null,
      CashSum: Number(cashTotal) || 0.0,

      TransferAccount: glAccount || null,
      TransferSum: Number(bankTotal) || 0.0,
      TransferDate: formatDateForApi(transferDate) || null,
      TransferReference: referenceBank || null,
      Reference1: null,
      Reference2: null,
      CounterReference: null,
      Remarks: remarks || null,
      JournalRemarks: journalRemarks || null,
      TaxDate: formatDateForApi(new Date()),
      Series: 15,
      BankCode: null,
      BankAccount: null,
      TransferRealAmount: 0,
      DueDate: formatDateForApi(dueDate),
      AttachmentEntry: null,
      U_Channel: null,
      PaymentInvoices: paymentInvoices,
      PaymentChecks: checks,
      PaymentAccounts: [],
    };

    console.log(paymentData);

    return paymentData;
  };

  // Prepare Document Data (specific for non-payment documents)
  const prepareDocumentData = () => {
    const salesPersonCode =
      salesEmployees.find((emp) => emp.name === salesEmployee)?.code || -1;

    const nonEmptyRows = rowsToDisplayState.filter(
      (row) => row.itemCode && row.itemDescription
    );

    let vatGroup;
    if (
      pathname.startsWith("/purchase") ||
      pathname === "/goods-receipt-po" ||
      pathname === "/goods-return" ||
      pathname === "/ap-invoice" ||
      pathname === "/ap-credit-memo"
    ) {
      console.log(true);
      vatGroup = "purchase";
    }

    console.log(documentAdditionalExpenses);
    let documentLines = nonEmptyRows?.map((row, index) => {
      const lineData = {
        LineNum: index,
        BaseType: -1,
        BaseEntry: null,
        BaseLine: -1,
        ItemCode: row.itemCode || "",
        ItemDescription: row.itemDescription || "",
        Quantity: row.quantity || 0,
        UnitPrice: row.unitPrice || 0,
        WarehouseCode: row.warehouseCode || "01",
        TaxCode: row.taxCode || "",
        DiscountPercent: row.discountPercent || 0.0,
        SalesPersonCode: salesPersonCode,
        UoMCode: row.uoMCode || "Manual",
        UoMEntry: -1,
        LineTotal: row.lineTotal || 0,
        ProjectCode: row.projectCode || "",
        FreeText: row.freeText || "",
        Text: row.text || "",
        RequiredDate: formatDateForApi(deliveryDate),
        CostingCode5: row.costingCode5 || null,
        VatGroup:
          vatGroup === "purchase" ? null : row.vatGroup || row.taxCode || null,
        BatchNumbers: row.batchNumbers || [],
        SerialNumbers: row.serialNumbers || [],
        LineStatus: row.lineStatus,
        DocumentLineAdditionalExpenses:
          row.documentLineAdditionalExpenses || [],
      };

      if (selectedItem && selectedItem.documentLines) {
        const additionalLine = selectedItem.documentLines.find(
          (line) => line.itemCode === row.itemCode
        );
        if (additionalLine) {
          lineData.BaseType = additionalLine.baseType;
          lineData.BaseEntry = additionalLine.baseEntry;
          lineData.BaseLine = additionalLine.baseLine;
        }
      }

      return lineData;
    });

    // Ensure documentAdditionalExpenses exists and is valid before mapping
    const updatedAdditionalExpenses = documentAdditionalExpenses.map(
      (expense, index) => {
        let exp = expense.LineNum;
        console.log(exp);
        return {
          ...expense,
          BaseDocType: selectedItem?.documentLines[0].baseType || -1,
          BaseDocEntry: selectedItem?.documentLines[0].baseEntry || -1,
          BaseDocLine: exp ?? -1,
        };
      }
    );

    // console.log(updatedAdditionalExpenses);

    let documentData = {
      RequriedDate: formatDateForApi(deliveryDate),
      DocEntry: Number(documentEntry),
      DocNum: String(documentNumber),
      NumAtCard: customerRefNumber || null,
      Series: selectedItem?.series || series || null,
      CardCode: selectedItem?.cardCode || selectedCustomer?.cardCode || null,
      CardName: selectedItem?.cardName || selectedCustomer?.cardName || null,
      DocDate: formatDateForApi(postingDate),
      DocDueDate: formatDateForApi(deliveryDate),
      TaxDate: formatDateForApi(documentDate),
      Comments: remarks || null,
      DiscountPercent: Number(discountPercentage) || 0,
      TotalDiscount: discountValue || 0,
      DocTotal: Number(total) || 0,
      DocumentLines: documentLines,
      SalesPersonCode: salesPersonCode,
      AttachmentEntry: null,
      DocumentAdditionalExpenses: updatedAdditionalExpenses.filter(
        (exp) => exp.LineNum >= 0
      ),
      DocumentStatus: documentStatus,
    };

    console.log(selectedItem);
    // console.log(selectedItem.series);
    // console.log(series);
    console.log("Document Data:", documentData);

    return documentData;
  };

  // Handle POST/UPDATE Document
  const handlePostDocument = async () => {
    if (!validateRequiredFields()) return;

    let apiEndpoint;
    let method = "POST";
    let data;

    // Dynamically prepare data and endpoint based on the pathname
    if (pathname === "/incoming-payments") {
      // For payments
      apiEndpoint =
        operation === "add" || operation === "ok"
          ? `${SERVER_ADDRESS}api/Payments/PostPayments/${orderType}`
          : `${SERVER_ADDRESS}api/Payments/UpdatePayments/${orderType}`;
      data = preparePaymentData();
    } else {
      // For other documents
      apiEndpoint =
        operation === "add" || operation === "ok"
          ? `${SERVER_ADDRESS}api/Marketing/PostDocuments/${orderType}`
          : `${SERVER_ADDRESS}api/Marketing/UpdateDocuments/${orderType}`;
      data = prepareDocumentData();
    }

    try {
      if (operation === "add") setPostingDocument(true);
      if (operation === "update") setUpdatingDocument(true);

      const response = await fetch(apiEndpoint, {
        method,
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        if (pathname !== "/incoming-payments") {
          const resFetchItemsByFormType = await fetch(
            `${SERVER_ADDRESS}api/Marketing/GetDocuments/${orderType}/${
              statusMap[status]
            }/${formatDateForApi(selectedToDate)}/${formatDateForApi(
              selectedFromDate
            )}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (resFetchItemsByFormType.ok) {
            resetItemData();
            const data = await resFetchItemsByFormType.json();
            console.log(data);
            setItemsByDateAndFormType(data);
            toast.success(
              responseData.Message || "Operation completed successfully!"
            );
          } else {
            const errorData = await resFetchItemsByFormType.json();
            toast.error(
              errorData.Message || "Failed to fetch items by form type."
            );
          }
        } else {
          const resFetchPayments = await fetch(
            `${SERVER_ADDRESS}api/Payments/GetPaymentList/${orderType}/${statusMap[status]}/${formattedToDate}/${formattedFromDate}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (resFetchPayments.ok) {
            resetItemData();
            const data = await resFetchPayments.json();
            setPayments(data);
            toast.success(
              responseData.Message || "Operation completed successfully!"
            );
          } else {
            const errorData = await resFetchPayments.json();
            toast.error(
              errorData.Message || "Failed to fetch payments by form type."
            );
          }
        }
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.Message || "There was an error during the operation."
        );
      }
    } catch (error) {
      resetItemData();
      toast.error("An error occurred: " + error.message);
    } finally {
      setPostingDocument(false);
      setUpdatingDocument(false);
      setHasUnsavedChanges(false);
    }
  };

  const handleOperation = (text) => {
    if (text === "Add" || text === "Update") {
      handlePostDocument();
    } else if (text === "OK" || text === "Cancel") {
      router.push("/menu");
      resetItemData();
    }
  };

  const handleCopyToItemClick = async (e) => {
    // setOperation("ok");
    setCopyToTriggered(true);
    setCurrentPage(`/${currentPage.split(" ").join("-")}`);
    // console.log(`/${currentPage.split(" ").join("-")}`);
    // let currentPage = `/${currentPage.split(" ").join("-")}`;
    // console.log(currentPage);
    console.log(selectedItem);
    setCopyToFrom(currentPage);
    setCopyToTo(`/${e.target.textContent.toLowerCase().split(" ").join("-")}`);
    if (
      pathname === "/sales-quotation" &&
      e.target.textContent === "Sales Order"
    ) {
      router.push("/sales-order");
    }
    if (
      pathname === "/sales-quotation" &&
      e.target.textContent === "Delivery"
    ) {
      router.push("/delivery");
    }
    if (
      pathname === "/sales-quotation" &&
      e.target.textContent === "A/R Invoice"
    ) {
      router.push("/ar-invoice");
    }
    if (pathname === "/sales-order" && e.target.textContent === "Delivery") {
      router.push("/delivery");
    }
    if (pathname === "/sales-order" && e.target.textContent === "A/R Invoice") {
      router.push("/ar-invoice");
    }
    if (pathname === "/delivery" && e.target.textContent === "Return Request") {
      router.push("/return-request");
    }
    if (pathname === "/delivery" && e.target.textContent === "Return") {
      router.push("/return");
    }
    if (pathname === "/delivery" && e.target.textContent === "A/R Invoice") {
      router.push("/ar-invoice");
    }
    if (pathname === "/return-request" && e.target.textContent === "Return") {
      router.push("/return");
    }
    if (
      pathname === "/return-request" &&
      e.target.textContent === "A/R Credit Memo"
    ) {
      router.push("/ar-credit-memo");
    }
    if (pathname === "/return" && e.target.textContent === "A/R Credit Memo") {
      router.push("/ar-credit-memo");
    }
    if (pathname === "/return" && e.target.textContent === "Delivery") {
      router.push("/delivery");
    }
    if (
      pathname === "/ar-down-payment-request" &&
      e.target.textContent === "A/R Credit Memo"
    ) {
      router.push("/ar-credit-memo");
    }
    if (
      pathname === "/ar-invoice" &&
      e.target.textContent === "Return Request"
    ) {
      router.push("/return-request");
    }
    if (
      pathname === "/ar-invoice" &&
      e.target.textContent === "A/R Credit Memo"
    ) {
      router.push("/ar-credit-memo");
    }
    if (
      pathname === "/purchase-request" &&
      e.target.textContent === "Purchase Quotation"
    ) {
      router.push("/purchase-quotation");
    }
    if (
      pathname === "/purchase-request" &&
      e.target.textContent === "Purchase Order"
    ) {
      router.push("/purchase-order");
    }
    if (
      pathname === "/purchase-quotation" &&
      e.target.textContent === "Purchase Order"
    ) {
      router.push("/purchase-order");
    }
    if (
      pathname === "/purchase-quotation" &&
      e.target.textContent === "Goods Receipt PO"
    ) {
      router.push("/goods-receipt-po");
    }
    if (
      pathname === "/purchase-quotation" &&
      e.target.textContent === "A/P Invoice"
    ) {
      router.push("/ap-invoice");
    }
    if (
      pathname === "/purchase-order" &&
      e.target.textContent === "Goods Receipt PO"
    ) {
      router.push("/goods-receipt-po");
    }
    if (
      pathname === "/purchase-order" &&
      e.target.textContent === "A/P Invoice"
    ) {
      router.push("/ap-invoice");
    }
    if (
      pathname === "/goods-receipt-po" &&
      e.target.textContent === "Goods Return"
    ) {
      router.push("/goods-return");
    }
    if (
      pathname === "/goods-receipt-po" &&
      e.target.textContent === "A/P Invoice"
    ) {
      router.push("/ap-invoice");
    }
    if (
      pathname === "/goods-return" &&
      e.target.textContent === "Purchase Quotation"
    ) {
      router.push("/purchase-quotation");
    }
    if (
      pathname === "/goods-return" &&
      e.target.textContent === "Purchase Order"
    ) {
      router.push("/purchase-order");
    }
    if (
      pathname === "/ap-invoice" &&
      e.target.textContent === "A/P Credit Memo"
    ) {
      router.push("/ap-credit-memo");
    }
  };

  const handleCopyFromItemClick = async (e) => {
    setCopyToTriggered(true);
    setCurrentPage(`/${currentPage.split(" ").join("-")}`);
    console.log(selectedItem);
    setCopyToFrom(currentPage);
    setCopyToTo(`/${e.target.textContent.toLowerCase().split(" ").join("-")}`);
    if (
      pathname === "/delivery" &&
      e.target.textContent === "Sales Quotation"
    ) {
      router.push("/sales-quotation");
    }
    if (pathname === "/delivery" && e.target.textContent === "Sales Order") {
      router.push("/sales-order");
    }
    if (pathname === "/delivery" && e.target.textContent === "Return") {
      router.push("/return");
    }

    if (
      pathname === "/ar-invoice" &&
      e.target.textContent === "Sales Quotation"
    ) {
      router.push("/sales-quotation");
    }
    if (pathname === "/ar-invoice" && e.target.textContent === "Sales Order") {
      router.push("/sales-order");
    }
    if (pathname === "/ar-invoice" && e.target.textContent === "Delivery") {
      router.push("/delivery");
    }

    if (
      pathname === "/sales-order" &&
      e.target.textContent === "Sales Quotation"
    ) {
      router.push("/sales-quotation");
    }

    if (pathname === "/return-request" && e.target.textContent === "Delivery") {
      router.push("/delivery");
    }
    if (
      pathname === "/return-request" &&
      e.target.textContent === "A/R Invoice"
    ) {
      router.push("/ar-invoice");
    }

    if (pathname === "/ar-credit-memo" && e.target.textContent === "Return") {
      router.push("/return");
    }
    if (
      pathname === "/ar-credit-memo" &&
      e.target.textContent === "A/R Invoice"
    ) {
      router.push("/ar-invoice");
    }
    if (
      pathname === "/ar-credit-memo" &&
      e.target.textContent === "Return Request"
    ) {
      router.push("/return-request");
    }

    if (
      pathname === "/purchase-order" &&
      e.target.textContent === "Purchase Request"
    ) {
      router.push("/purchase-request");
    }
    if (
      pathname === "/purchase-order" &&
      e.target.textContent === "Purchase Quotation"
    ) {
      router.push("/purchase-quotation");
    }

    if (
      pathname === "/goods-receipt-po" &&
      e.target.textContent === "Purchase Quotation"
    ) {
      router.push("/purchase-quotation");
    }
    if (
      pathname === "/goods-receipt-po" &&
      e.target.textContent === "Purchase Order"
    ) {
      router.push("/purchase-order");
    }
    if (
      pathname === "/goods-receipt-po" &&
      e.target.textContent === "Goods Return"
    ) {
      router.push("/goods-return");
    }

    if (
      pathname === "/ap-invoice" &&
      e.target.textContent === "Purchase Quotation"
    ) {
      router.push("/purchase-quotation");
    }
    if (
      pathname === "/ap-invoice" &&
      e.target.textContent === "Purchase Order"
    ) {
      router.push("/purchase-order");
    }
    if (
      pathname === "/ap-invoice" &&
      e.target.textContent === "Goods Receipt PO"
    ) {
      router.push("/goods-receipt-po");
    }

    if (
      pathname === "/goods-return" &&
      e.target.textContent === "Goods Receipt PO"
    ) {
      router.push("/goods-receipt-po");
    }

    if (
      pathname === "/ap-credit-memo" &&
      e.target.textContent === "Goods Return"
    ) {
      router.push("/goods-return");
    }
    if (
      pathname === "/ap-credit-memo" &&
      e.target.textContent === "A/P Invoice"
    ) {
      router.push("/ap-invoice");
    }
  };

  useEffect(() => {
    if (selectedItem) {
      setRemarks(selectedItem.comments || "");
      setDiscountPercentage(
        Math.round(selectedItem.discountPercent * 100) / 100
      ); // Set discount percentage from API
      const calculatedDiscountValue =
        (selectedItem.discountPercent / 100) * totalBeforeDiscount; // Calculate the discount value
      setDiscountValue(Math.round(calculatedDiscountValue * 100) / 100); // Set discount value with precision

      const employee = salesEmployees.find(
        (emp) => emp.code * 1 === selectedItem.salesPersonCode
      );
      setSalesEmployee(employee ? employee.name : ""); // Set name or empty if not found
      setOwner(selectedItem.owner || "");
    }
  }, [
    selectedItem,
    salesEmployees,
    setRemarks,
    setSalesEmployee,
    setOwner,
    totalBeforeDiscount,
    setDiscountPercentage,
    setDiscountValue,
  ]);

  return (
    <>
      {(postingDocument || updatingDocument) && <Spinner />}
      <footer className="flex flex-col sm:flex-row items-end justify-between px-4 my-4 sm:my-0">
        <div className="flex flex-col gap-0.5 sm:mt-2">
          <div className="flex items-center gap-2 my-4">
            <button
              onClick={() => handleOperation(footerBtnText)}
              className="bg-yellow-200 px-2 border border-stone-400"
            >
              {footerBtnText}
            </button>
            <button
              onClick={() => handleOperation("Cancel")}
              className="bg-yellow-200 px-2 border border-stone-400"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 my-4">
          <button
            className={`bg-gradient-to-b ${
              (operation === "add" && isCopyToButtonEnabled) ||
              ctrlFEnterPressed
                ? "from-stone-100 to-stone-300 text-stone-700 cursor-pointer"
                : "from-stone-100 to-stone-300 text-stone-700 opacity-70"
            } px-2 border border-stone-400 flex items-center`}
            disabled={
              !(isCopyToButtonEnabled || ctrlFEnterPressed) ||
              operation !== "add"
            }
            onClick={() => setShowCopyFromContainer((open) => !open)}
          >
            You Can Also
          </button>
        </div>
      </footer>
    </>
  );
};

export default FooterMaster;