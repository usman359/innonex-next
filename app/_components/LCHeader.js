import { format, parseISO } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { useTable } from "../_contexts/TableContext";
import Input from "./Input";
import Modal from "./Modal";
import Select from "./Select";
import Spinner from "./Spinner";

const LCHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const customerRef = useRef(null);

  const customerCodeRef = useRef(null);
  const customerNameRef = useRef(null);
  const dropdownRefCode = useRef(null);
  const dropdownRefName = useRef(null);

  const [showDeliveryCalendar, setShowDeliveryCalendar] = useState(false);
  const [showPostingCalendar, setShowPostingCalendar] = useState(false);
  const [showDocumentCalendar, setShowDocumentCalendar] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDropdownVisibleCode, setIsDropdownVisibleCode] = useState(false);
  const [isDropdownVisibleName, setIsDropdownVisibleName] = useState(false);

  const {
    customers,
    selectedItem,
    selectedCustomer,
    setSelectedCustomer,
    status,
    setStatus,
    isAddMode,
    setOriginalCustomer,
    documentNumber,
    setDocumentNumber,
    postingDate,
    setPostingDate,
    deliveryDate,
    setDeliveryDate,
    documentDate,
    setDocumentDate,
    customerRefNumber,
    setCustomerRefNumber,
    setOperation,
    isCustomerIconVisible,
    setRemarks,
    setIsCustomerIconVisible,
    setIsItemDescriptionIconVisible,
    isDocNumManuallyEntered,
    setIsDocNumManuallyEntered,
    updateRowsToDisplay,
    statusMap,
    resetItemData,
    documentNumberLoading,
    setDocumentNumberLoading,
    setItemsByDateAndFormType,
    setLoadingCount,
    setDiscountPercentage,
    setDiscountValue,
    setTotalBeforeDiscount,
    SERVER_ADDRESS,
    setHasUnsavedChanges,
    series,
    ctrlFEnterPressed,
    setctrlFEnterPressed,
    orderType,
    handleFindAction,
    setTax,
    setShowRecordIcons,
    setNavDateButtonText,
    seires,
    setSeries,
    setIsAddMode,
    setAddress,
    setJournalRemarks,
    token,
    setDueDate,
    setTotal,
    address,
    dueDate,
    setSalesLoading,
    contactPerson,
    setContactPerson,
    selectedEntityType,
    setSelectedEntityType,
    setPayments,
    setCustomers,
    setFreightTotal,
    setSelectedItem,
    filteredCustomerList,
    setFilteredCustomerList,
    customerCodeSearchTerm,
    setCustomerCodeSearchTerm,
    customerNameSearchTerm,
    setCustomerNameSearchTerm,
    docNumRef,
    handleDocNumKeyDown,
    setSelectedSeriesIndex,
  } = useTable();

  const getToken = () => {
    return localStorage.getItem("token") || token;
  };

  const isAccountSelected =
    pathname === "/incoming-payments" && selectedEntityType === "account";

  const [selectedCustomerRow, setSelectedCustomerRow] = useState(null);

  // Handle the Customer Code Input
  const handleCustomerCodeInput = (e) => {
    const value = e.target.value.trim().toLowerCase();
    setCustomerCodeSearchTerm(value);

    if (value.length > 0) {
      const filtered = customers.filter((customer) =>
        customer.cardCode.toLowerCase().includes(value)
      );
      setFilteredCustomerList(filtered);
      setIsDropdownVisibleCode(filtered.length > 0);
    } else {
      setIsDropdownVisibleCode(false);
    }
  };

  // Handle the Customer Name Input
  const handleCustomerNameInput = (e) => {
    const value = e.target.value.trim().toLowerCase();
    setCustomerNameSearchTerm(value);

    if (value.length > 0) {
      const filtered = customers.filter((customer) =>
        customer.cardName.toLowerCase().includes(value)
      );
      setFilteredCustomerList(filtered);
      setIsDropdownVisibleName(filtered.length > 0);
    } else {
      setIsDropdownVisibleName(false);
    }
  };

  // Close the dropdown if clicking outside
  const handleClickOutside = (e) => {
    if (
      dropdownRefCode.current &&
      !dropdownRefCode.current.contains(e.target) &&
      customerCodeRef.current &&
      !customerCodeRef.current.contains(e.target)
    ) {
      setIsDropdownVisibleCode(false);
    }

    if (
      dropdownRefName.current &&
      !dropdownRefName.current.contains(e.target) &&
      customerNameRef.current &&
      !customerNameRef.current.contains(e.target)
    ) {
      setIsDropdownVisibleName(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close modal and reset selection logic
  const closeModalAndResetSelection = () => {
    setSelectedCustomerRow(null);
    setIsModalOpen(false);
    setSearchTerm(""); // Reset search term when closing modals
  };

  // Function to handle the click on the adjustment icon
  const handleAdjustmentsClick = () => {
    setIsModalOpen(true);
  };

  const handleSeriesChange = (e) => {
    const selectedIndex = e.target.selectedIndex; // Adjust for any placeholder option
    // console.log(selectedIndex);
    const selectedSeries = seires[selectedIndex];
    setSeries(selectedSeries?.seriesName); // Update selected series name
    setSelectedSeriesIndex(selectedIndex); // Track selected index in TableContext
  };

  const fetchInvoicesByCustomerCode = useCallback(
    async (cardCode) => {
      setSalesLoading(true);
      try {
        const response = await fetch(
          `${SERVER_ADDRESS}api/Common/GetInvoices/${cardCode}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to fetch invoices. Please try again.");
          return;
        }

        const data = await response.json();
        console.log(data);
        updateRowsToDisplay(data);
      } catch (error) {
        toast.error("An error occurred while fetching invoices.");
      } finally {
        setSalesLoading(false);
      }
    },
    [setSalesLoading, SERVER_ADDRESS, getToken, updateRowsToDisplay]
  );

  // Modal close handler
  const handleModalClose = useCallback(() => {
    closeModalAndResetSelection();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isModalOpen &&
        customerRef.current &&
        !customerRef.current.contains(event.target)
      ) {
        handleModalClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, handleModalClose]);

  const handleChooseClick = () => {
    if (selectedCustomerRow) {
      handleCustomerSelection(selectedCustomerRow);
      setIsModalOpen(false); // Close the item modal
    }
  };

  const handleRowClick = (row, type) => {
    if (type === "customer") setSelectedCustomerRow(row);
  };

  // Update the `handleRowClick` and row rendering logic inside the modal
  const handleRowDoubleClick = (row) => {
    // Directly select the customer on double click
    handleCustomerSelection(row);
  };

  const handleFieldChange = (setter) => (e) => {
    setter(e.target.value);
    setHasUnsavedChanges(true);

    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const handleDateChange = (setter) => (e) => {
    const dateValue = e.target.value;
    // Update if date is valid or clear
    setter(dateValue ? new Date(dateValue).toISOString().split("T")[0] : "");
    setHasUnsavedChanges(true);

    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const handleBlur = (setShowCalendar) => () => {
    setShowCalendar(false);
  };

  const handleFocus = (setShowCalendar) => () => {
    setShowCalendar(true);
  };

  const handleCustomerSelection = useCallback(
    (customer) => {
      setSelectedCustomer(customer);
      setCustomerCodeSearchTerm(customer.cardCode); // Update the input field value
      setCustomerNameSearchTerm(customer.cardName);
      // setIsDropdownVisible(false); // Close the dropdown
      setIsModalOpen(false);
      setIsCustomerIconVisible(true);
      setIsItemDescriptionIconVisible(true);
      setHasUnsavedChanges(true);

      if (pathname === "/incoming-payments") {
        fetchInvoicesByCustomerCode(customer.cardCode);
      }
    },
    [
      setSelectedCustomer,
      setIsItemDescriptionIconVisible,
      setHasUnsavedChanges,
      setIsCustomerIconVisible,
      fetchInvoicesByCustomerCode,
      pathname,
    ]
  );

  // Handle document number changes
  const handleDocNumChange = (e) => {
    const value = Number(e.target.value);
    setDocumentNumber(value);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setShowRecordIcons(false);
    setNavDateButtonText("Search");
  };

  useEffect(() => {
    const handleGlobalEnterKey = (e) => {
      // Check if Enter is pressed
      if (e.key === "Enter") {
        setIsAddMode(false);
        const activeElement = document.activeElement;
        // Check if the active element is one of the input fields (documentNumber, series, status)
        if (
          activeElement === docNumRef.current ||
          activeElement.classList.contains("series-input") ||
          activeElement.classList.contains("status-select") ||
          activeElement === document.body
        ) {
          handleDocNumKeyDown(e);
        }
      }
    };

    // Attach the event listener for keydown on the entire document
    document.addEventListener("keydown", handleGlobalEnterKey);

    return () => {
      // Clean up the event listener when the component is unmounted
      document.removeEventListener("keydown", handleGlobalEnterKey);
    };
  }, [handleDocNumKeyDown, setIsAddMode]);

  // Utility Functions
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.cardCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.cardName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        handleFindAction();

        setctrlFEnterPressed(true); // Set the manual entry mode

        // Reset document number field
        setDocumentNumber(null);

        if (docNumRef.current) {
          docNumRef.current.focus(); // Set focus on the No. field
          docNumRef.current.select(); // Highlight the text (if any)
        }

        // Reset the Series and Status fields to their first option
        setSeries(""); // Set the Series to the first option
        setStatus(""); // Reset Status to the default first option ("Open")
        // setctrlFEnterPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleFindAction,
    setSeries,
    setStatus,
    setDocumentNumber,
    setctrlFEnterPressed,
    docNumRef,
  ]);

  const handleItemClick = (customer) => {
    setSelectedCustomer(customer); // Update selected customer
    setCustomerCodeSearchTerm(customer.cardCode); // Update the customer code search term
    setCustomerNameSearchTerm(customer.cardName); // Update the customer name search term
    setIsDropdownVisibleCode(false); // Hide the dropdown for customer code
    setIsDropdownVisibleName(false); // Hide the dropdown for customer name

    // Set the visibility for the icon
    setIsCustomerIconVisible(true); // Ensure icon is visible after customer selection
    setIsItemDescriptionIconVisible(true);
  };

  useEffect(() => {
    if (selectedItem) {
      setDocumentNumber(selectedItem.docNum);
      setPostingDate(format(parseISO(selectedItem.docDate), "yyyy-MM-dd"));
      setDeliveryDate(format(new Date(), "yyyy-MM-dd"));
      setDocumentDate(format(parseISO(selectedItem.taxDate), "yyyy-MM-dd"));

      setSelectedCustomer({
        cardCode: selectedItem?.cardCode,
        cardName: selectedItem?.cardName,
      });

      setOriginalCustomer({
        cardCode: selectedItem?.cardCode,
        cardName: selectedItem?.cardName,
      });
    }
  }, [
    selectedItem,
    setDeliveryDate,
    setDocumentDate,
    setPostingDate,
    setSelectedCustomer,
    setOriginalCustomer,
    setDiscountValue,
    setDocumentNumber,
  ]);

  // New function to fetch vendors
  const fetchVendors = useCallback(async () => {
    setSalesLoading(true);
    try {
      const response = await fetch(`${SERVER_ADDRESS}api/Common/GetVendors`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to fetch vendors. Please try again.");
        return;
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      toast.error("An error occurred while fetching vendors.");
    } finally {
      setSalesLoading(false);
    }
  }, [setSalesLoading, SERVER_ADDRESS, token, setCustomers]);

  // New function to fetch vendors
  const fetchCustomers = useCallback(async () => {
    setSalesLoading(true);
    try {
      const response = await fetch(`${SERVER_ADDRESS}api/Common/GetCustomers`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to fetch customers. Please try again.");
        return;
      }

      const data = await response.json();
      setCustomers(data);
      updateRowsToDisplay(data); // Display customers in the list
    } catch (error) {
      toast.error("An error occurred while fetching customers.");
    } finally {
      setSalesLoading(false);
    }
  }, [
    setSalesLoading,
    SERVER_ADDRESS,
    token,
    setCustomers,
    updateRowsToDisplay,
  ]);

  // Handler for changing entity type
  const handleEntityTypeChange = (type) => {
    resetItemData(); // Reset data when switching between Customer and Vendor
    setSelectedEntityType(type);

    if (type === "customer") {
      fetchCustomers(); // Call your existing customer fetch function
    } else if (type === "vendor") {
      fetchVendors(); // Fetch vendors when vendor is selected
    }
  };

  return (
    <div>
      {documentNumberLoading && <Spinner />}
      <h1 className="bg-stone-400 bg-gradient-to-b from-stone-200 to-stone-400 capitalize text-lg px-4 mb-1 border-b-4 border-yellow-500">
        {pathname
          .split("/")
          .join("")
          .split("-")
          .join(" ")
          .replace(/_/g, "/")
          .replace(/\b\w/g, (char) => char.toUpperCase())}
      </h1>
      <header className="flex flex-col sm:flex-row justify-between px-4 my-4 sm:my-0">
        <div className="flex gap-4">
          <div className="flex flex-col gap-0.5 sm:mt-2">
            <>
              <div className="flex w-full gap-0.5">
                {/* First Input Field with Label */}
                <div className="flex">
                  <label className="w-[8.5rem]">Vendor</label>
                  <input
                    type="text"
                    value={""}
                    readOnly={isDocNumManuallyEntered || status !== "Open"} // Disable when status is not 'Open'
                    // onChange={handleDiscountPercentageChange}
                    className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-16 ${
                      isDocNumManuallyEntered
                        ? "bg-yellow-200"
                        : status === "Open"
                        ? "bg-white"
                        : "bg-stone-200"
                    }`}
                  />
                </div>

                {/* Second Input Field with Modal Icon */}
                <div className="flex relative">
                  <input
                    type="text"
                    value={""}
                    readOnly={isDocNumManuallyEntered || status !== "Open"} // Disable when status is not 'Open'
                    // onChange={handleDiscountValueChange}
                    className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-[8.5rem] ${
                      isDocNumManuallyEntered
                        ? "bg-yellow-200"
                        : status === "Open"
                        ? "bg-white"
                        : "bg-stone-200"
                    }`}
                  />

                  {/* Modal Icon */}
                  {isAddMode && (
                    <div
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 cursor-pointer"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <HiAdjustmentsHorizontal className="text-stone-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex w-full gap-0.5">
                {/* First Input Field with Label */}
                <div className="flex">
                  <label className="w-[8.5rem]">Broker</label>
                  <input
                    type="text"
                    value={""}
                    readOnly={isDocNumManuallyEntered || status !== "Open"} // Disable when status is not 'Open'
                    // onChange={handleDiscountPercentageChange}
                    className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-16 ${
                      isDocNumManuallyEntered
                        ? "bg-yellow-200"
                        : status === "Open"
                        ? "bg-white"
                        : "bg-stone-200"
                    }`}
                  />
                </div>

                {/* Second Input Field with Modal Icon */}
                <div className="flex">
                  <input
                    type="text"
                    value={""}
                    readOnly={isDocNumManuallyEntered || status !== "Open"} // Disable when status is not 'Open'
                    // onChange={handleDiscountValueChange}
                    className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-[8.5rem] ${
                      isDocNumManuallyEntered
                        ? "bg-yellow-200"
                        : status === "Open"
                        ? "bg-white"
                        : "bg-stone-200"
                    }`}
                  />

                  {/* Modal Icon */}
                  {isAddMode && (
                    <div
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 cursor-pointer"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <HiAdjustmentsHorizontal className="text-stone-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex w-full gap-1.5">
                <Select
                  label="PKR"
                  options={[{ value: "primary", label: "Local Currency" }]}
                  value="primary"
                  onChange={() => setHasUnsavedChanges(true)}
                  isEditable={isDocNumManuallyEntered}
                  status={status}
                  isDocNumManuallyEntered={isDocNumManuallyEntered}
                />

                {/* checkbox with the text as Closed Document */}
                <div className="flex gap-1.5 items-center">
                  <input
                    type="checkbox"
                    id="closedDocument"
                    name="closedDocument"
                    checked={false}
                    // onChange={handleClosedDocumentChange}
                    disabled={!isAddMode || ctrlFEnterPressed} // Disable unless not in add mode and ctrlFEnterPressed is true
                  />
                  <label htmlFor="closedDocument">Closed Document</label>
                </div>
              </div>

              <div className="flex w-full">
                <label className="w-[8.5rem]">Project</label>
                <input
                  type="Project"
                  value={deliveryDate || ""}
                  readOnly={status !== "Open" || isDocNumManuallyEntered}
                  onChange={handleDateChange(setDeliveryDate)}
                  className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-1/2 ${
                    isDocNumManuallyEntered
                      ? "bg-yellow-200"
                      : status === "Open"
                      ? "bg-white"
                      : "bg-stone-200"
                  }`}
                />
              </div>

              <div className="flex w-full">
                <label className="w-[8.5rem]">Cost to be Changed</label>
                <input
                  type="Project"
                  value={deliveryDate || ""}
                  readOnly={status !== "Open" || isDocNumManuallyEntered}
                  onChange={handleDateChange(setDeliveryDate)}
                  className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-1/2 ${
                    isDocNumManuallyEntered
                      ? "bg-yellow-200"
                      : status === "Open"
                      ? "bg-white"
                      : "bg-stone-200"
                  }`}
                />
              </div>
            </>
          </div>
        </div>

        {pathname !== "/payment-means" && (
          <div className="flex flex-col gap-0.5 sm:mt-2">
            <div className="flex">
              <label className="w-[8.5rem]">Number</label>
              <input
                type="text"
                value={""}
                readOnly={isDocNumManuallyEntered || status !== "Open"} // Disable when status is not 'Open'
                // onChange={handleDiscountPercentageChange}
                className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-[8rem] ${
                  isDocNumManuallyEntered
                    ? "bg-yellow-200"
                    : status === "Open"
                    ? "bg-white"
                    : "bg-stone-200"
                }`}
              />
            </div>
            <Select
              label="Series"
              options={[
                { value: "Open", label: "Open" },
                { value: "Closed", label: "Closed" },
                { value: "Cancelled", label: "Cancelled" },
                { value: "Delivery", label: "Delivery" },
              ]}
              value={status}
              onChange={handleStatusChange}
              disabled={ctrlFEnterPressed}
              // isEditable={ctrlFEnterPressed}
              status={status}
              isDocNumManuallyEntered={isDocNumManuallyEntered} // Add this line to control background color
              className="status-select"
            />
            {/* Posting Date */}
            <div className="flex gap-2 items-center">
              <label className="w-[8rem]">Posting Date</label>
              {!showPostingCalendar ? (
                <input
                  type="text"
                  value={
                    postingDate
                      ? format(new Date(postingDate), "dd.MM.yyyy")
                      : ""
                  }
                  readOnly={status !== "Open" || isDocNumManuallyEntered}
                  onFocus={handleFocus(setShowPostingCalendar)}
                  onChange={handleDateChange(setPostingDate)}
                  className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-[8rem] ${
                    isDocNumManuallyEntered
                      ? "bg-yellow-200"
                      : status === "Open"
                      ? "bg-white"
                      : "bg-stone-200"
                  }`}
                />
              ) : (
                <input
                  type="date"
                  value={postingDate}
                  readOnly={status !== "Open" || isDocNumManuallyEntered}
                  onChange={handleDateChange(setPostingDate)}
                  onBlur={handleBlur(setShowPostingCalendar)}
                  className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-1/2 ${
                    isDocNumManuallyEntered
                      ? "bg-yellow-200"
                      : status === "Open"
                      ? "bg-white"
                      : "bg-stone-200"
                  }`}
                />
              )}
            </div>
            {/* Due Date */}
            <div className="flex gap-2 items-center">
              <label className="w-[8rem]">Due Date</label>
              {!showPostingCalendar ? (
                <input
                  type="text"
                  value={dueDate ? format(new Date(dueDate), "dd.MM.yyyy") : ""}
                  readOnly={status !== "Open" || isDocNumManuallyEntered}
                  onFocus={handleFocus(setShowPostingCalendar)}
                  onChange={handleDateChange(setDueDate)}
                  className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-[8rem] ${
                    isDocNumManuallyEntered
                      ? "bg-yellow-200"
                      : status === "Open"
                      ? "bg-white"
                      : "bg-stone-200"
                  }`}
                />
              ) : (
                <input
                  type="date"
                  value={dueDate || ""}
                  readOnly={status !== "Open" || isDocNumManuallyEntered}
                  onChange={handleDateChange(setDueDate)}
                  onBlur={handleBlur(setShowPostingCalendar)}
                  className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-1/2 ${
                    isDocNumManuallyEntered
                      ? "bg-yellow-200"
                      : status === "Open"
                      ? "bg-white"
                      : "bg-stone-200"
                  }`}
                />
              )}
            </div>

            <div className="flex">
              <label className="w-[8.5rem]">Reference</label>
              <input
                type="text"
                value={""}
                readOnly={isDocNumManuallyEntered || status !== "Open"} // Disable when status is not 'Open'
                // onChange={handleDiscountPercentageChange}
                className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-[8rem] ${
                  isDocNumManuallyEntered
                    ? "bg-yellow-200"
                    : status === "Open"
                    ? "bg-white"
                    : "bg-stone-200"
                }`}
              />
            </div>

            <div className="flex">
              <label className="w-[8.5rem]">File No.</label>
              <input
                type="text"
                value={""}
                readOnly={isDocNumManuallyEntered || status !== "Open"} // Disable when status is not 'Open'
                // onChange={handleDiscountPercentageChange}
                className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-[8rem] ${
                  isDocNumManuallyEntered
                    ? "bg-yellow-200"
                    : status === "Open"
                    ? "bg-white"
                    : "bg-stone-200"
                }`}
              />
            </div>
          </div>
        )}
      </header>

      {/* Customer Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Select a Customer"
        onChoose={handleChooseClick}
        selectedItem={selectedCustomerRow}
      >
        <input
          type="text"
          placeholder="Search by code or name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 p-2 border border-stone-300 rounded w-full"
        />
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead className="sticky top-0 bg-stone-200">
              <tr>
                <th className="p-2 border text-start">#</th>
                <th className="p-2 border text-start">Card Code</th>
                <th className="p-2 border text-start">Card Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <tr
                    key={index}
                    className={`cursor-pointer hover:bg-stone-100 ${
                      selectedCustomerRow === customer ? "bg-yellow-200" : ""
                    }`}
                    onClick={() => handleRowClick(customer, "customer")}
                    onDoubleClick={() => handleRowDoubleClick(customer)}
                  >
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{customer.cardCode}</td>
                    <td className="p-2 border">{customer.cardName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-stone-500">
                    No customers available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default LCHeader;
