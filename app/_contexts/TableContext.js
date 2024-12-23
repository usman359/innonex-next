"use client";

import { format, isValid, parseISO } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const salesOrderItemsLabels = [
  "#",
  "Item No.",
  "Item Description",
  "UOM Code",
  "Quantity",
  "Unit Price",
  "Total (LC)",
  "Whse",
  "Tax Code",
];

const incomingPaymentLabels = [
  "#",
  "Selected",
  "Document No.",
  "Installment",
  "Document Type",
  "Date",
  "Total",
  "Cash Discount %",
  "Total Payment",
  "Payment Run Order",
];

const checkLabels = [
  "#",
  "Due Date",
  "Amount",
  "Country/Region",
  "Bank Name",
  "Branch",
  "Account",
  "Check No.",
];

const statusMap = {
  Open: "bost_Open",
  Closed: "bost_Close",
  Cancelled: "tYES",
  Delivery: "bost_Delivered",
};

const SERVER_ADDRESS = "http://182.191.88.73:9000/";

const TableContext = createContext();

function TableProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const firstDayOfCurrentMonth = useMemo(() => {
    const date = new Date();
    // const month =
    //   pathname === "/ar-invoice" ? date.getMonth() - 4 : date.getMonth();
    date.setMonth(date.getMonth());
    // date.setMonth(month);
    date.setDate(1);
    return date;
  }, []);

  // Refs
  const contentTableRef = useRef(null);
  const excelButtonRef = useRef(null);
  const printButtonRef = useRef(null);
  const wordButtonRef = useRef(null);
  const docNumRef = useRef(null);

  // Global States
  const [currentPage, setCurrentPage] = useState("");
  const [token, setToken] = useState("");
  const [hiAdjustmentsVisible, setHiAdjustmentsVisible] = useState(false);
  const [orderType, setOrderType] = useState("");
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState(
    firstDayOfCurrentMonth
  );
  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [operation, setOperation] = useState("add");
  const [isAddMode, setIsAddMode] = useState(true);
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [isDocNumManuallyEntered, setIsDocNumManuallyEntered] = useState(false);
  const [udfs, setUdfs] = useState([]);
  const [loginLoading, setLoginLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [fromAndToLoading, setFromAndToLoading] = useState(false);
  const [postingDocument, setPostingDocument] = useState(false);
  const [updatingDocument, setUpdatingDocument] = useState(false);
  const [documentNumberLoading, setDocumentNumberLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track unsaved changes
  const [showRecordIcons, setShowRecordIcons] = useState(true);
  const [ctrlFEnterPressed, setctrlFEnterPressed] = useState(false);
  const [navDateButtonText, setNavDateButtonText] = useState("Show");
  const [payments, setPayments] = useState([]);
  const [selectedEntityType, setSelectedEntityType] = useState("customer");
  const [check, setCheck] = useState(true);
  const [bankTransfer, setBankTransfer] = useState(false);
  const [cash, setCash] = useState(false);
  const [general, setGeneral] = useState(true);
  const [generalItemMasterData, setGeneralItemMasterData] = useState(true);
  const [paymentTerms, setPaymentTerms] = useState(false);
  const [paymentRun, setPaymentRun] = useState(false);
  const [accounting, setAccounting] = useState(false);
  const [remarksTab, setRemarksTab] = useState(false);
  const [copyToTriggered, setCopyToTriggered] = useState(false);
  const [copyToFrom, setCopyToFrom] = useState(null);
  const [copyToTo, setCopyToTo] = useState(null);
  const [isPaymentMeansModalOpen, setIsPaymentMeansModalOpen] = useState(false);

  // Header States
  const [customers, setCustomers] = useState([]);
  const [seires, setSeires] = useState([]);
  const [series, setSeries] = useState("Primary");
  const [status, setStatus] = useState("Open");
  const [selectedCustomer, setSelectedCustomer] = useState({
    cardCode: "",
    cardName: "",
  });
  const [documentNumber, setDocumentNumber] = useState(null);
  const [documentEntry, setDocumentEntry] = useState(null);
  const [contactPerson, setContactPerson] = useState(null);
  const [customerRefNumber, setCustomerRefNumber] = useState(null);
  const [postingDate, setPostingDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [documentDate, setDocumentDate] = useState(null);
  const [reference, setReference] = useState(null);
  const [originalCustomer, setOriginalCustomer] = useState({});
  const [isCustomerIconVisible, setIsCustomerIconVisible] = useState(true);
  const [address, setAddress] = useState();
  const [selectedSeriesIndex, setSelectedSeriesIndex] = useState(0); // Default to the first series
  const [filteredCustomerList, setFilteredCustomerList] = useState([]);
  const [customerCodeSearchTerm, setCustomerCodeSearchTerm] = useState("");
  const [customerNameSearchTerm, setCustomerNameSearchTerm] = useState("");

  // Table States
  const [itemsByDateAndFormType, setItemsByDateAndFormType] = useState([]);
  const [paymentsByDocNum, setPaymentsByDocNum] = useState({});
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [salesOrderData, setSalesOrderData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [rowsToDisplayState, setRowsToDisplayState] = useState(
    new Array(10).fill({ lineStatus: "bost_Open" }) // Ensure each row starts with 'lineStatus: "bost_Open"'
  );
  const [checkRowsToDisplayState, setCheckRowsToDisplayState] = useState(
    new Array(10).fill({ lineStatus: "bost_Open" }) // Ensure each row starts with 'lineStatus: "bost_Open"'
  );

  const [warehouseCode, setWarehouseCode] = useState("01");
  const [originalRows, setOriginalRows] = useState([]);
  const [isItemDescriptionIconVisible, setIsItemDescriptionIconVisible] =
    useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [paymentChecks, setPaymentChecks] = useState([]);
  const [paymentBankTransfer, setPaymentBankTransfer] = useState([]);
  const [paymentCash, setPaymentCash] = useState([]);
  const [glAccount, setGlAccount] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [referenceBank, setReferenceBank] = useState("");
  const [checkOptions, setCheckOptions] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [cashOptions, setCashOptions] = useState([]);
  const [checkAccount, setCheckAccount] = useState([]);
  const [bankTotal, setBankTotal] = useState(null);
  const [cashTotal, setCashTotal] = useState(null);
  const [checks, setChecks] = useState([]);

  // Footer States
  const [salesEmployees, setSalesEmployees] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  const [lineTotal, setLineTotal] = useState(null);
  const [totalBeforeDiscount, setTotalBeforeDiscount] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState(null);
  const [discountValue, setDiscountValue] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [salesEmployee, setSalesEmployee] = useState("");
  const [owner, setOwner] = useState("");
  const [freights, setFreights] = useState([]);
  const [freightTotal, setFreightTotal] = useState(null);
  const [tax, setTax] = useState(null);
  const [total, setTotal] = useState(null);
  const [selectedFreight, setSelectedFreight] = useState(null); // To hold the selected freight
  const [documentAdditionalExpenses, setDocumentAdditionalExpenses] = useState(
    []
  );
  const [journalRemarks, setJournalRemarks] = useState(null);
  const [paymentOnAccount, setPaymentOnAccount] = useState("0.0000");
  const [bankCharge, setBankCharge] = useState(null);

  // const isTokenValid = (token) => {
  //   try {
  //     if (!token) return false;
  //     const { exp } = jwtDecode(token); // Decode token to get expiration
  //     return exp > Date.now() / 1000; // Check if the token is still valid
  //   } catch (error) {
  //     console.error("Invalid token", error);
  //     return false;
  //   }
  // };

  useEffect(() => {
    // This effect will run when the component mounts (or page reloads).
    setRowsToDisplayState((prevRows) => {
      return ensureMinimumRows(
        prevRows.map((row) => ({
          ...row,
          lineStatus: row.lineStatus || "bost_Open",
        }))
      );
    });
  }, []);

  const filteredRowsToDisplayState = useMemo(() => {
    return rowsToDisplayState;
  }, [rowsToDisplayState]);

  useEffect(() => {
    // This effect will run when the component mounts (or page reloads).
    setRowsToDisplayState((prevRows) => {
      // Ensure all rows have the lineStatus of "bost_Open"
      const updatedRows = prevRows.map((row) => ({
        ...row,
        lineStatus: row.lineStatus || "bost_Open",
      }));

      // Add empty rows to ensure a minimum of 10 rows
      while (updatedRows.length < 10) {
        updatedRows.push({ lineStatus: "bost_Open" });
      }

      return updatedRows; // Return the updated rows with `lineStatus` applied
    });
  }, []); // Empty dependency array ensures it runs only on component mount

  // Update rows to display, ensuring a minimum of 10 rows
  const updateRowsToDisplay = useCallback((rows = []) => {
    // Ensure rows is an array before proceeding
    const updatedRows = Array.isArray(rows) ? [...rows] : [];

    // Ensure each row has the 'lineStatus' as 'bost_Open'
    updatedRows.forEach((row, index) => {
      updatedRows[index] = {
        ...row,
        lineStatus: row.lineStatus || "bost_Open", // Set 'bost_Open' if lineStatus is not already set
      };
    });

    // Add empty rows if there are fewer than 10 rows, with lineStatus 'bost_Open'
    while (updatedRows.length < 10) {
      updatedRows.push({ lineStatus: "bost_Open" });
    }

    // Update the state with the new rows
    // Update the state with the new rows ensuring at least 10
    setRowsToDisplayState(ensureMinimumRows(updatedRows));
  }, []);

  // Handlers
  const resetItemData = useCallback(() => {
    setSelectedItem(null);
    setCurrentDocumentIndex(0);
    updateRowsToDisplay(new Array(10).fill({ lineStatus: "bost_Open" }));
    setCheckRowsToDisplayState(new Array(10).fill({ lineStatus: "bost_Open" }));
    setGlAccount("");
    setTransferDate("");
    setReferenceBank("");
    setCashTotal(null);
    setBankTotal(null);

    setFilteredCustomerList([]);
    setCustomerCodeSearchTerm("");
    setCustomerNameSearchTerm("");

    // Reset total-related fields
    setTotalBeforeDiscount(null);
    setDiscountPercentage(null);
    setDiscountValue(null);
    setFreightTotal(null); // Reset freight total
    setTax(null); // Reset tax
    setTotal(null); // Reset total

    setAddress(null);

    setSelectedEntityType("customer");

    // Reset other states
    setSelectedCustomer({ cardCode: "", cardName: "" });
    setCustomerRefNumber(null);

    // Reset dates
    const currentDate = format(new Date(), "yyyy-MM-dd");
    setPostingDate(currentDate);
    setDueDate(currentDate);
    setDeliveryDate("");
    setDocumentDate(currentDate);

    setWarehouseCode("01");
    setIsAddMode(true);
    setRemarks("");
    setJournalRemarks("");
    setOwner("");
    setOperation("add");
    setIsCustomerIconVisible(true);
    setIsItemDescriptionIconVisible(false);
    setHasUnsavedChanges(false);
    setSalesEmployee("");
    setShowRecordIcons(true);
    setIsDocNumManuallyEntered(false);
    setctrlFEnterPressed(false);
    setIsAddMode(true);
    setStatus("Open");
    setFreightTotal(null);
  }, [updateRowsToDisplay]);

  // New function to calculate total freight amount
  const calculateTotalFreight = () => {
    const totalFreight = freights.reduce((sum, freight) => {
      return sum + (parseFloat(freight.netAmount) || 0);
    }, 0);
    setFreightTotal(totalFreight);
  };

  // Update selected freight and recalculate total
  const updateSelectedFreight = (freight) => {
    const updatedFreights = [...freights];
    const index = updatedFreights.findIndex((f) => f.id === freight.id); // Assuming each freight has a unique 'id'
    if (index !== -1) {
      updatedFreights[index] = freight;
    } else {
      updatedFreights.push(freight); // Add new freight if it doesn't exist
    }
    setFreights(updatedFreights);
    calculateTotalFreight(); // Calculate total freight each time a freight is updated
    setHasUnsavedChanges(true); // Mark as unsaved changes
  };

  const calculateTotals = useCallback(() => {
    console.log(rowsToDisplayState);
    if (!rowsToDisplayState || rowsToDisplayState.length === 0) {
      // Reset totals if there are no rows to display
      setTotalBeforeDiscount(0);
      setTax(0);
      setTotal(0);
      return;
    }

    if (pathname !== "/incoming-payments") {
      const totalBeforeDiscountCalculated = rowsToDisplayState.reduce(
        (sum, row) => sum + (parseFloat(row.lineTotal) || 0),
        0
      );

      // console.log("Total before discount", totalBeforeDiscountCalculated);
      // console.log("Discount percentage", discountPercentage);
      const calculatedDiscountValue =
        (totalBeforeDiscountCalculated * discountPercentage) / 100;
      // console.log(calculatedDiscountValue);
      // console.log(calculatedDiscountValue.toFixed(4));

      let discountedAmount =
        totalBeforeDiscountCalculated - calculatedDiscountValue;

      const validFreightTotal = freightTotal || 0;
      // console.log(validFreightTotal);

      const taxableAmount =
        Number(totalBeforeDiscountCalculated) -
        Number(calculatedDiscountValue) +
        Number(validFreightTotal);
      // console.log(taxableAmount);

      let totalTax = 0;

      // console.log(rowsToDisplayState);
      rowsToDisplayState.forEach((row) => {
        if (row.itemCode && row.itemDescription) {
          console.log(taxRates);
          const taxRate = taxRates.find(
            (rate) => rate.description === row.taxCode
          );
          console.log(taxRate);
          let taxValue = taxRate ? parseFloat(taxRate.value) : 0;
          // console.log("Tax value", taxValue);
          if (taxValue > 0) {
            let lineTotal = (row.lineTotal * discountPercentage) / 100;
            lineTotal = row.lineTotal - lineTotal;
            totalTax += (lineTotal * taxValue) / 100;
            // taxValue = taxValue / 100;
            console.log(totalTax);
          }
          // console.log(taxValue);
          // console.log(taxValue);
          // const rowTotal =
          // parseFloat(row.quantity || 0) * parseFloat(row.unitPrice || 0);

          // totalTax += (rowTotal * taxValue) / 100; // Calculate tax using taxValue
          // console.log(totalTax);
        }
      });
      // console.log(totalTax);
      // console.log("Disocunted amount", discountedAmount);
      // totalTax = taxableAmount * taxValue;
      // const calculatedTax = (taxableAmount * 10) / 100;
      const finalTotal = taxableAmount + totalTax;
      // console.log(finalTotal);

      // console.log(calculatedDiscountValue);
      // setDiscountValue(calculatedDiscountValue.toFixed(4));
      setDiscountValue(Math.round(calculatedDiscountValue * 100) / 100);
      setTotalBeforeDiscount(
        Math.round(totalBeforeDiscountCalculated * 100) / 100
      );
      console.log(totalTax);
      console.log(Math.round(totalTax * 100) / 100);
      setTax(Math.round(totalTax * 100) / 100);
      setTotal(Math.round(finalTotal * 100) / 100);
    } else if (
      pathname === "/incoming-payments" ||
      pathname === "/payment-means"
    ) {
      let totalAmountDue = 0;
      // console.log(selectedRows);
      // Only calculate total for selected rows when in Add mode
      if (isAddMode && selectedRows.length > 0) {
        const selectedRowsData = rowsToDisplayState.filter((_, index) =>
          selectedRows.includes(index)
        );
        totalAmountDue = selectedRowsData.reduce(
          (sum, row) =>
            sum +
            (row.sumApplied ||
              row.NetAmount ||
              row.DocTotal ||
              row.docEntry ||
              0),
          0
        );
        // console.log(totalAmountDue);
      } else {
        totalAmountDue = rowsToDisplayState.reduce(
          (sum, row) => sum + (row.sumApplied || row.NetAmount || 0),
          0
        );
      }

      // console.log(totalAmountDue);
      setTotal(Math.round(totalAmountDue * 100) / 100);
    }
  }, [
    rowsToDisplayState,
    pathname,
    discountPercentage,
    freightTotal,
    taxRates,
    selectedRows,
    isAddMode,
  ]);

  const calculateFreightFromAPI = (freightData = []) => {
    if (!freightData || freightData.length === 0) return 0;

    const totalFreight = freightData.reduce((sum, freight) => {
      return sum + (parseFloat(freight.lineTotal) || 0); // Ensure valid float value for netAmount
    }, 0);

    return Math.round(totalFreight * 100) / 100; // Return the freight total formatted to 4 decimal places
  };

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return "";
    const parsedDate = parseISO(dateStr);
    return isValid(parsedDate) ? format(parsedDate, "yyyy-MM-dd") : "";
  };

  const ensureMinimumRows = (rows, minRows = 10) => {
    const updatedRows = [...rows];

    // Ensure at least `minRows` rows, filling them with `lineStatus: "bost_Open"`
    while (updatedRows.length < minRows) {
      updatedRows.push({ lineStatus: "bost_Open" });
    }

    return updatedRows;
  };

  // useEffect(() => {
  //   const storedToken = localStorage.getItem("token");
  //   const lastPath = sessionStorage.getItem("lastPath") || "/";

  //   if (storedToken && isTokenValid(storedToken)) {
  //     saveToken(storedToken); // Save valid token
  //     if (pathname !== lastPath) {
  //       console.log("Restoring path:", lastPath);
  //       router.replace(lastPath); // Use replace to prevent additional history entries
  //     }
  //   } else {
  //     console.log("Invalid token");
  //     saveToken(""); // Clear invalid token
  //     sessionStorage.removeItem("lastPath");
  //     router.replace("/login");
  //   }
  // }, []); // Run on initial render

  // // Save the current path in sessionStorage
  // useEffect(() => {
  //   if (token && pathname) {
  //     sessionStorage.setItem("lastPath", pathname); // Save current path
  //     saveToken(token);
  //   }
  // }, [pathname, token]); // Runs only when pathname or token changes

  // const saveToken = (newToken) => {
  //   if (newToken) {
  //     localStorage.setItem("token", newToken);
  //     setToken(newToken);
  //   } else {
  //     localStorage.removeItem("token");
  //     setToken("");
  //   }
  // };

  useEffect(() => {
    const currentDate = format(new Date(), "yyyy-MM-dd");

    async function fetchData() {
      if (pathname !== "/incoming-payments") {
        if (isAddMode) {
          // console.log(itemsByDateAndFormType);
          if (itemsByDateAndFormType.length > 0) {
            setRowsToDisplayState((prevRows) =>
              ensureMinimumRows(
                prevRows.map((row) => ({ ...row, lineStatus: "bost_Open" }))
              )
            );
            const nextNumber = Number(itemsByDateAndFormType[0]?.docNum) + 1;
            // console.log(nextNumber);
            setDocumentNumber(nextNumber);
            setDocumentEntry(Number(itemsByDateAndFormType[0]?.docEntry));
          } else {
            setRowsToDisplayState((prevRows) =>
              ensureMinimumRows(
                prevRows.map((row) => ({ ...row, lineStatus: "bost_Open" }))
              )
            );

            let table;
            console.log(currentPage);
            // Sale Tables
            if (currentPage === "sales quotation") table = "OQUT";
            if (currentPage === "sales order") table = "ORDR";
            if (currentPage === "delivery") table = "ODLN";
            if (currentPage === "return request") table = "ORRR";
            if (currentPage === "return") table = "ORDN";
            if (currentPage === "ar down payment request") table = "ODPI";
            if (currentPage === "ar invoice") table = "OINV";
            if (currentPage === "ar credit memo") table = "ORIN";

            // Purchase Tables
            if (currentPage === "purchase request") table = "OPRQ";
            if (currentPage === "purchase quotation") table = "OPQT";
            if (currentPage === "purchase order") table = "OPOR";
            if (currentPage === "goods receipt po") table = "OPDN";
            if (currentPage === "goods return") table = "ORPD";
            if (currentPage === "ap invoice") table = "OPCH";
            if (currentPage === "ap credit memo") table = "ORPC";

            // Banking Tables
            if (currentPage === "incoming payments") table = "ORCT";

            // Business Partner
            if (currentPage === "business partner master data") table = "OCRD";

            // Inventory
            if (currentPage === "iterm master data") table = "OITM";
            console.log(seires);
            // const seriesCode = seires[0]?.series;
            const seriesCode =
              selectedSeriesIndex >= 0 && seires[selectedSeriesIndex]?.series;
            console.log(seriesCode);
            if (seriesCode) {
              const response = await fetch(
                `${SERVER_ADDRESS}api/Common/GetNextDocNum/${table}/${seriesCode}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const data = await response.json();
              console.log(data);
              if (data.length > 0) {
                setDocumentNumber(data[0]?.DocNum);
              } else {
                setDocumentNumber(1);
              }
            }
          }

          setPostingDate(currentDate);
          setDocumentDate(currentDate);
          setDueDate(currentDate);
        } else if (itemsByDateAndFormType.length > 0) {
          const currentIndex = Math.max(
            0,
            Math.min(currentDocumentIndex, itemsByDateAndFormType.length - 1)
          );
          // console.log(currentIndex);
          const currentItem = itemsByDateAndFormType[currentIndex];
          setSelectedItem(currentItem);
          setCurrentDocumentIndex(currentIndex);

          const updatedRows = (currentItem?.documentLines || []).map((row) => ({
            ...row,
            lineStatus: row.lineStatus || "bost_Open",
          }));

          while (updatedRows.length < 10) {
            updatedRows.push({ lineStatus: "bost_Open" });
          }

          setRowsToDisplayState(updatedRows);
          setPostingDate(formatDate(currentItem?.docDate));
          setDeliveryDate(formatDate(currentItem?.docDueDate));
          setDocumentDate(formatDate(currentItem?.taxDate));
          setCustomerRefNumber(currentItem?.numAtCard);
          setDocumentNumber(currentItem?.docNum);
          setDocumentEntry(currentItem?.docEntry);
          const freightTotalFromAPI = calculateFreightFromAPI(
            currentItem?.documentAdditionalExpenses || []
          );
          setFreightTotal(freightTotalFromAPI); // Set the freight total in the state
          // setFreightTotal(
          //   currentItem.documentAdditionalExpenses?.reduce(
          //     (total, expense) => total + parseFloat(expense.lineTotal) || 0,
          //     0
          //   )
          // );
        }
      } else if (pathname === "/incoming-payments") {
        if (isAddMode) {
          if (payments.length > 0) {
            setRowsToDisplayState(
              new Array(10).fill({ lineStatus: "bost_Open" })
            );

            const nextNumber = payments[0]?.docNum + 1;
            setDocumentNumber(nextNumber);
            // console.log(updatedRows);
          } else {
            // Initialize empty rows if no paymentInvoices exist
            setRowsToDisplayState(
              new Array(10).fill({ lineStatus: "bost_Open" })
            );

            let table;
            console.log(currentPage);
            // Banking Tables
            if (currentPage === "incoming payments") table = "ORCT";

            // console.log(seires);
            // const seriesCode = seires[0]?.series;
            const seriesCode =
              selectedSeriesIndex >= 0 && seires[selectedSeriesIndex]?.series;
            // console.log(seriesCode);
            if (seriesCode) {
              const response = await fetch(
                `${SERVER_ADDRESS}api/Common/GetNextDocNum/${table}/${seriesCode}`
              );
              const data = await response.json();
              console.log(data);
              if (data) {
                setDocumentNumber(data[0]?.DocNum);
              }
            }
            // setDocumentNumber(1);
          }
          const currentDate = format(new Date(), "yyyy-MM-dd");
          setPostingDate(currentDate);
          setDocumentDate(currentDate);
          setDueDate(currentDate);
        } else if (payments.length > 0) {
          // When not in Add mode, handle editing existing payments
          const currentIndex = Math.max(
            0,
            Math.min(currentDocumentIndex, payments.length - 1)
          );
          const currentPayment = payments[currentDocumentIndex];
          console.log(currentPayment);
          setSelectedItem(currentPayment);
          setCurrentDocumentIndex(currentIndex);

          // Populate the rows from the existing payment's invoices
          const updatedRows = currentPayment?.paymentInvoices.map((row) => ({
            ...row,
            lineStatus: row.lineStatus || "bost_Open", // Ensure correct lineStatus is applied
          }));

          // console.log(updatedRows);
          // Ensure at least 10 rows
          setRowsToDisplayState(ensureMinimumRows(updatedRows));
          setPostingDate(formatDate(currentPayment?.docDate));
          // console.log(formatDate(currentPayment?.dueDate));
          // console.log(formatDate(currentPayment?.taxDate));
          setDueDate(formatDate(currentPayment?.dueDate));
          setDocumentDate(formatDate(currentPayment?.taxDate));
          setDocumentNumber(currentPayment?.docNum);
          setAddress(currentPayment?.address);
          setRemarks(currentPayment?.remarks);
          setJournalRemarks(currentPayment?.journalRemarks);
        }
      }
    }
    fetchData();
  }, [
    itemsByDateAndFormType,
    payments,
    isAddMode,
    currentDocumentIndex,
    // pathname,
    // seires,
    // currentPage,
    series,
    // selectedSeriesIndex,
    // token,
  ]);

  // useEffect(() => {
  //   if (selectedItem) {
  //     console.log(selectedItem);
  //     setRemarks(selectedItem.comments || "");
  //     setDiscountPercentage(selectedItem.discountPercent || 0);

  //     // Trigger totals calculation after data is loaded
  //     calculateTotals();

  //     setFreightTotal(
  //       selectedItem.documentAdditionalExpenses?.reduce(
  //         (total, expense) => total + parseFloat(expense.lineTotal) || 0,
  //         0
  //       )
  //     );

  //     // Set the sales employee and owner values
  //     const employee = salesEmployees.find(
  //       (emp) => emp.code * 1 === selectedItem.salesPersonCode
  //     );
  //     setSalesEmployee(employee ? employee.name : "");
  //     setOwner(selectedItem.owner || "");
  //     setCustomerRefNumber(selectedItem.numAtCard);
  //   }
  // }, [
  //   selectedItem,
  //   salesEmployees,
  //   calculateTotals,
  //   calculateTotalFreight,
  //   freights,
  // ]);

  // useEffect(() => {
  //   // Ensure totals are recalculated when `ctrlFEnterPressed` is true
  //   if (ctrlFEnterPressed) {
  //     calculateTotals();
  //     setctrlFEnterPressed(false); // Reset the flag after recalculating totals
  //   }
  // }, [ctrlFEnterPressed, rowsToDisplayState, calculateTotals]);

  const handleFindAction = useCallback(() => {
    setIsAddMode(false); // Exit Add mode
    resetItemData(); // Reset form data
    setIsDocNumManuallyEntered(true); // Enable manual document number entry
    setShowRecordIcons(false); // Hide record navigation icons during search
    setctrlFEnterPressed(true);

    // Clear header dates when Ctrl + F is pressed
    setPostingDate("");
    setDeliveryDate("");
    setDocumentDate("");

    calculateTotals();

    setAddress(null);

    // Clear footer-specific fields when Ctrl + F is pressed
    setTotalBeforeDiscount(null);
    setTax(null);
    setFreightTotal(null);
    setTotal(null);

    setDocumentNumber(null);

    if (docNumRef.current) {
      docNumRef.current.focus(); // Set focus on the No. field
      docNumRef.current.select(); // Highlight the text (if any)
    }
  }, [
    resetItemData,
    setIsDocNumManuallyEntered,
    setShowRecordIcons,
    setctrlFEnterPressed,
    setTotalBeforeDiscount,
    setTax,
    setFreightTotal,
    setTotal,
    // calculateTotals,
  ]);

  return (
    <TableContext.Provider
      value={{
        handleFindAction,
        contentTableRef,
        excelButtonRef,
        printButtonRef,
        wordButtonRef,
        items,
        setItems,
        customers,
        setCustomers,
        series,
        setSeries,
        salesOrderData,
        setSalesOrderData,
        salesEmployees,
        setSalesEmployees,
        warehouses,
        setWarehouses,
        taxRates,
        setTaxRates,
        currentPage,
        setCurrentPage,
        selectedItem,
        setSelectedItem,
        totalBeforeDiscount,
        setTotalBeforeDiscount,
        discountPercentage,
        setDiscountPercentage,
        loginLoading,
        setLoginLoading,
        menuLoading,
        setMenuLoading,
        salesLoading,
        setSalesLoading,
        paymentsLoading,
        setPaymentsLoading,
        fromAndToLoading,
        setFromAndToLoading,
        documentNumberLoading,
        setDocumentNumberLoading,
        postingDocument,
        setPostingDocument,
        updatingDocument,
        setUpdatingDocument,
        setFromAndToLoading,
        rowsToDisplayState,
        setRowsToDisplayState,
        updateRowsToDisplay,
        hiAdjustmentsVisible,
        setHiAdjustmentsVisible,
        resetItemData,
        selectedCustomer,
        setSelectedCustomer,
        calculateTotals,
        total,
        setTotal,
        postingDate,
        setPostingDate,
        dueDate,
        documentDate,
        setDocumentDate,
        deliveryDate,
        setDeliveryDate,
        documentNumber,
        setDocumentNumber,
        updateSelectedFreight,
        warehouseCode,
        setWarehouseCode,
        status,
        setStatus,
        itemsByDateAndFormType,
        setItemsByDateAndFormType,
        selectedFromDate,
        setSelectedFromDate,
        selectedToDate,
        setSelectedToDate,
        orderType,
        setOrderType,
        isAddMode,
        setIsAddMode,
        currentDocumentIndex,
        setCurrentDocumentIndex,
        originalCustomer,
        setOriginalCustomer,
        originalRows,
        setOriginalRows,
        operation,
        setOperation,
        lineTotal,
        setLineTotal,
        remarks,
        setRemarks,
        salesEmployee,
        setSalesEmployee,
        owner,
        setOwner,
        isAsideOpen,
        setIsAsideOpen,
        isCustomerIconVisible,
        setIsCustomerIconVisible,
        isItemDescriptionIconVisible,
        setIsItemDescriptionIconVisible,
        customerRefNumber,
        setCustomerRefNumber,
        statusMap,
        freights,
        setFreights,
        freightTotal,
        setFreightTotal,
        setToken,
        token,
        udfs,
        setUdfs,
        salesOrderItemsLabels,
        isDocNumManuallyEntered,
        setIsDocNumManuallyEntered,
        loadingCount,
        setLoadingCount,
        discountValue,
        setDiscountValue,
        SERVER_ADDRESS,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        documentAdditionalExpenses,
        setDocumentAdditionalExpenses,
        showRecordIcons,
        setShowRecordIcons,
        ctrlFEnterPressed,
        setctrlFEnterPressed,
        tax,
        setTax,
        navDateButtonText,
        setNavDateButtonText,
        filteredRowsToDisplayState,
        seires,
        setSeires,
        checkLabels,
        incomingPaymentLabels,
        payments,
        setPayments,
        paymentsByDocNum,
        setPaymentsByDocNum,
        address,
        setAddress,
        journalRemarks,
        setJournalRemarks,
        setDueDate,
        contactPerson,
        setContactPerson,
        reference,
        setReference,
        selectedEntityType,
        setSelectedEntityType,
        selectedRows,
        setSelectedRows,
        paymentChecks,
        setPaymentChecks,
        glAccount,
        setGlAccount,
        transferDate,
        setTransferDate,
        referenceBank,
        setReferenceBank,
        paymentBankTransfer,
        setPaymentBankTransfer,
        paymentCash,
        setPaymentCash,
        bankOptions,
        setBankOptions,
        checkAccount,
        setCheckAccount,
        bankTotal,
        setBankTotal,
        check,
        setCheck,
        bankTransfer,
        setBankTransfer,
        cash,
        setCash,
        general,
        setGeneral,
        cashTotal,
        setCashTotal,
        cashOptions,
        setCashOptions,
        checkOptions,
        setCheckOptions,
        selectedSeriesIndex,
        setSelectedSeriesIndex,
        copyToTriggered,
        setCopyToTriggered,
        copyToFrom,
        setCopyToFrom,
        paymentOnAccount,
        setPaymentOnAccount,
        isPaymentMeansModalOpen,
        setIsPaymentMeansModalOpen,
        checks,
        setChecks,
        copyToTo,
        setCopyToTo,
        checkRowsToDisplayState,
        setCheckRowsToDisplayState,
        bankCharge,
        setBankCharge,
        filteredCustomerList,
        setFilteredCustomerList,
        customerCodeSearchTerm,
        setCustomerCodeSearchTerm,
        customerNameSearchTerm,
        setCustomerNameSearchTerm,
        docNumRef,
        documentEntry,
        setDocumentEntry,
        paymentTerms,
        setPaymentTerms,
        paymentRun,
        setPaymentRun,
        accounting,
        setAccounting,
        remarksTab,
        setRemarksTab,
        generalItemMasterData,
        setGeneralItemMasterData,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

function useTable() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context;
}

export { TableProvider, useTable };
