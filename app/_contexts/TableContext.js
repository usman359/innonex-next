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
import toast from "react-hot-toast";

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

const landedCostsItemsLabels = [
  "#",
  "Item No.",
  "Qty",
  "Base Doc. Price",
  "Base Doc. Value",
  "Proj. Cust",
  "Customs Value",
  "Expenditure",
  "Alloc. Costs Val.",
  "Whse Price",
  "Total",
  "Total Costs",
  "Warehouse",
  "Release No.",
  "Var Costs",
  "Const Costs",
  "Expected Customs",
  "FOB and Included Costs",
  "Project",
  "Dimension 1",
  "UoM Code",
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
  const [businessPartners, setBusinessPartners] = useState([]);
  const [selectedEntityType, setSelectedEntityType] = useState("customer");
  const [
    selectedEntityTypeBusinessPartner,
    setSelectedEntityTypeBusinessPartner,
  ] = useState("active");
  const [check, setCheck] = useState(true);
  const [bankTransfer, setBankTransfer] = useState(false);
  const [cash, setCash] = useState(false);
  const [general, setGeneral] = useState(true);
  const [generalItemMasterData, setGeneralItemMasterData] = useState(true);
  const [paymentTerms, setPaymentTerms] = useState(false);
  const [paymentRun, setPaymentRun] = useState(false);
  const [accounting, setAccounting] = useState(false);
  const [remarksTab, setRemarksTab] = useState(false);
  const [itemsTab, setItemsTab] = useState(false);
  const [costsTab, setCostsTab] = useState(false);
  const [attachmentsTab, setAttachmentsTab] = useState(false);
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

  const getToken = () => {
    return localStorage.getItem("token") || token;
  };

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

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const currentDate = format(new Date(), "yyyy-MM-dd");

    async function fetchData() {
      if (
        pathname !== "/incoming-payments" &&
        pathname !== "/business-partner-master-data"
      ) {
        if (isAddMode) {
          console.log(itemsByDateAndFormType);
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
            setPostingDate(currentDate);
            setDocumentDate(currentDate);
            setDueDate(currentDate);

            // if (ctrlFEnterPressed) {
            //   setStatus("");
            // }

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
            // console.log(seires);
            // const seriesCode = seires[0]?.series;
            const seriesCode =
              selectedSeriesIndex >= 0 && seires[selectedSeriesIndex]?.series;
            console.log(seriesCode);
            if (seriesCode) {
              const response = await fetch(
                `${SERVER_ADDRESS}api/Common/GetNextDocNum/${table}/${seriesCode}`,
                {
                  headers: {
                    Authorization: `Bearer ${getToken()}`,
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

          // setPostingDate(currentDate);
          // setDocumentDate(currentDate);
          // setDueDate(currentDate);
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
      } else if (pathname === "/business-partner-master-data") {
        if (isAddMode) {
          if (businessPartners.length > 0) {
            setRowsToDisplayState(
              new Array(10).fill({ lineStatus: "bost_Open" })
            );

            const nextNumber = businessPartners[0]?.docNum + 1;
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
            if (currentPage === "business partner master data") table = "OCRD";

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
        } else if (businessPartners.length > 0) {
          // When not in Add mode, handle editing existing payments
          const currentIndex = Math.max(
            0,
            Math.min(currentDocumentIndex, payments.length - 1)
          );
          const currentBusinessPartner = businessPartners[currentDocumentIndex];
          console.log(currentBusinessPartner);
          setSelectedItem(currentBusinessPartner);
          setCurrentDocumentIndex(currentIndex);

          // // Populate the rows from the existing payment's invoices
          // const updatedRows = currentBusinessPartner?.paymentInvoices.map(
          //   (row) => ({
          //     ...row,
          //     lineStatus: row.lineStatus || "bost_Open", // Ensure correct lineStatus is applied
          //   })
          // );

          // console.log(updatedRows);
          // Ensure at least 10 rows
          // setRowsToDisplayState(ensureMinimumRows(updatedRows));
          setPostingDate(formatDate(currentBusinessPartner?.docDate));
          // console.log(formatDate(currentPayment?.dueDate));
          // console.log(formatDate(currentPayment?.taxDate));
          setDueDate(formatDate(currentBusinessPartner?.dueDate));
          setDocumentDate(formatDate(currentBusinessPartner?.taxDate));
          setDocumentNumber(currentBusinessPartner?.docNum);
          setAddress(currentBusinessPartner?.address);
          setRemarks(currentBusinessPartner?.remarks);
          setJournalRemarks(currentBusinessPartner?.journalRemarks);

          console.log(currentBusinessPartner);
          setSelectedCustomer({
            cardCode: currentBusinessPartner?.cardCode,
            cardName: currentBusinessPartner?.cardName,
          });
        }
      }
    }
    fetchData();
  }, [
    itemsByDateAndFormType,
    payments,
    // isAddMode,
    // currentDocumentIndex,
    // pathname,
    // seires,
    // currentPage,
    // series,
    // selectedSeriesIndex,
    // token,
  ]);

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

    setOperation("find");

    if (docNumRef.current) {
      docNumRef.current.focus(); // Set focus on the No. field
      docNumRef.current.select(); // Highlight the text (if any)
    }

    setSeries(""); // Set the Series to the first option
    setStatus(""); // Reset Status to the default first option ("Open")
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

  const handleDocNumKeyDown = useCallback(
    async (e) => {
      if (!orderType) return;

      if (e.key === "Enter") {
        setIsAddMode(false);
        setctrlFEnterPressed(false);

        if (!documentNumber || String(documentNumber).trim() === "") {
          toast.error(
            "Please enter the document number. Document number is mandatory."
          );
          return;
        }

        setIsDocNumManuallyEntered(false);
        setDocumentNumberLoading(true);
        setIsCustomerIconVisible(false);
        setIsItemDescriptionIconVisible(true);
        setLoadingCount(2);
        setctrlFEnterPressed(false);

        // Track if status or series was changed by the user
        const statusChanged = status !== "";
        const seriesChanged = series !== "";

        if (pathname !== "/incoming-payments") {
          setItemsByDateAndFormType([]);
          try {
            const response = await fetch(
              `${SERVER_ADDRESS}api/Marketing/GetDocumentDetails/${orderType}/${documentNumber}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              console.log(data);
              setSelectedItem(data);

              console.log(data.series);
              if (data.series) {
                const matchingSeries = seires.find(
                  (s) => s.series === Number(data.series)
                );
                console.log(matchingSeries);
                console.log(seires);

                const seriesMatches =
                  !seriesChanged ||
                  (matchingSeries && matchingSeries.seriesName === series);
                const statusMatches =
                  !statusChanged || data.documentStatus === statusMap[status];

                if (
                  (!statusChanged && !seriesChanged) ||
                  (statusMatches && seriesMatches)
                ) {
                  // Set up the form with the fetched document details
                  setOperation("add");
                  updateRowsToDisplay(data.documentLines || []);
                  setSelectedCustomer({
                    cardCode: data.cardCode,
                    cardName: data.cardName,
                  });
                  setCustomerRefNumber(data.numAtCard);

                  // Map status to the correct key from the statusMap
                  const statusValueIndex = Object.values(statusMap).findIndex(
                    (status) => status === data.documentStatus
                  );
                  const statusKey = Object.keys(statusMap)[statusValueIndex];
                  console.log(statusKey);
                  setStatus(statusKey);
                  setSeries(matchingSeries.seriesName);

                  // Set dates and other document fields
                  setPostingDate(format(parseISO(data.docDate), "yyyy-MM-dd"));
                  setDeliveryDate(
                    format(parseISO(data.docDueDate), "yyyy-MM-dd")
                  );
                  setDocumentDate(format(parseISO(data.taxDate), "yyyy-MM-dd"));

                  // Calculate totals
                  const totalBeforeDiscountValue = data.documentLines.reduce(
                    (acc, line) => acc + (line.lineTotal || 0),
                    0
                  );
                  setTotalBeforeDiscount(totalBeforeDiscountValue);

                  const discPercentage = data.discountPercent || 0;
                  setDiscountPercentage(discPercentage);

                  const discValue =
                    (totalBeforeDiscountValue * discPercentage) / 100;
                  setDiscountValue(discValue);

                  setRemarks(data.comments);
                  setTax(data.taxAmount);
                  // console.log(
                  //   data.documentAdditionalExpenses.reduce(
                  //     (acc, line) => acc + (line.lineTotal || 0),
                  //     0
                  //   )
                  // );
                  setFreightTotal(
                    data.documentAdditionalExpenses.reduce(
                      (acc, line) => acc + (line.lineTotal || 0),
                      0
                    )
                  );
                } else {
                  resetItemData();
                  toast.error("No matching records were found");
                }
              } else {
                resetItemData();
                toast.error("No matching records were found");
              }
            }
          } catch (error) {
            resetItemData();
            toast.error(error.message);
            router.push("/login"); // Redirect to login on error
          } finally {
            setDocumentNumberLoading(false); // Ensure loading state is reset
          }
        } else if (pathname === "/incoming-payments") {
          setPayments([]);
          try {
            const response = await fetch(
              `${SERVER_ADDRESS}api/Payments/GetPaymentDetails/${orderType}/${documentNumber}`,
              {
                headers: {
                  Authorization: `Bearer ${getToken()}`,
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              console.log(data);

              const matchingSeries = seires?.find(
                (s) => s.series === Number(data.series)
              );

              const seriesMatches =
                !seriesChanged ||
                (matchingSeries && matchingSeries.seriesName === series);
              const statusMatches =
                !statusChanged || data.documentStatus === statusMap[status];

              if (
                (!statusChanged && !seriesChanged) ||
                (statusMatches && seriesMatches)
              ) {
                setOperation("add");
                updateRowsToDisplay(data.paymentInvoices || []);
                setSelectedCustomer({
                  cardCode: data.cardCode,
                  cardName: data.cardName,
                });

                setAddress(data.address);

                // Set dates and other document fields
                setPostingDate(format(parseISO(data.docDate), "yyyy-MM-dd"));
                setDueDate(format(parseISO(data.dueDate), "yyyy-MM-dd"));
                setDocumentDate(format(parseISO(data.taxDate), "yyyy-MM-dd"));

                setRemarks(data.remarks);
                setJournalRemarks(data.journalRemarks);

                // Map status to the correct key from the statusMap
                const statusValueIndex = Object.values(statusMap).findIndex(
                  (status) => status === data.documentStatus
                );
                const statusKey = Object.keys(statusMap)[statusValueIndex];
                setStatus(statusKey);
                setSeries(matchingSeries.seriesName);

                // Calculate totals
                const totalAmountDue = data.paymentInvoices.reduce(
                  (acc, line) => acc + (line.appliedSys || 0),
                  0
                );
                // console.log(totalAmountDue);
                // setNetTotal(netTotal);

                // const totalAmountDue = netTotal + transferSum;
                setTotal(totalAmountDue);
              } else {
                resetItemData();
                toast.error("No matching records were found");
              }
            } else {
              const errorData = await response.json();
              toast.error(
                errorData.Message || "Failed to fetch items by document number"
              );
              // resetItemData(); // Clear the form if no valid data is fetched
              setIsDocNumManuallyEntered(false); // Stay in manual entry mode
            }
          } catch (error) {
            resetItemData();
            toast.error(error.message);
            router.push("/login"); // Redirect to login on error
          } finally {
            setDocumentNumberLoading(false); // Ensure loading state is reset
          }
        }
      }
    },
    [
      orderType,
      setIsAddMode,
      documentNumber,
      setIsDocNumManuallyEntered,
      setDocumentNumberLoading,
      setIsCustomerIconVisible,
      setIsItemDescriptionIconVisible,
      setLoadingCount,
      setctrlFEnterPressed,
      status,
      series,
      pathname,
      setItemsByDateAndFormType,
      SERVER_ADDRESS,
      token,
      setSelectedItem,
      seires,
      statusMap,
      setOperation,
      updateRowsToDisplay,
      setSelectedCustomer,
      setCustomerRefNumber,
      setStatus,
      setSeries,
      setPostingDate,
      setDeliveryDate,
      setDocumentDate,
      setTotalBeforeDiscount,
      setDiscountPercentage,
      setDiscountValue,
      setRemarks,
      setTax,
      setFreightTotal,
      resetItemData,
      router,
      setPayments,
      setAddress,
      setDueDate,
      setJournalRemarks,
      setTotal,
    ]
  );

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
        businessPartners,
        setBusinessPartners,
        selectedEntityTypeBusinessPartner,
        setSelectedEntityTypeBusinessPartner,
        handleDocNumKeyDown,
        itemsTab,
        setItemsTab,
        costsTab,
        setCostsTab,
        attachmentsTab,
        setAttachmentsTab,
        landedCostsItemsLabels,
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
