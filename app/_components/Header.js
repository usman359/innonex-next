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

const Header = () => {
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
  } = useTable();

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
    const selectedIndex = e.target.selectedIndex - 1; // Adjust for any placeholder option
    // console.log(selectedIndex);
    const selectedSeries = seires[selectedIndex];
    setSeries(selectedSeries.seriesName); // Update selected series name
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
              Authorization: `Bearer ${token}`,
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
    [setSalesLoading, SERVER_ADDRESS, token, updateRowsToDisplay]
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
    return () => window.removeEventListener("keyup", handleKeyDown);
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
  ]);

  // New function to fetch vendors
  const fetchVendors = useCallback(async () => {
    setSalesLoading(true);
    try {
      const response = await fetch(`${SERVER_ADDRESS}api/Common/GetVendors`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
          Authorization: `Bearer ${token}`,
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
            {pathname === "/payment-means" ? (
              <Input
                label="Currency"
                value={selectedCustomer.cardCode}
                readOnly={status !== "Open"}
                isEditable={isDocNumManuallyEntered}
                onIconClick={() => setIsModalOpen(true)}
                status={status}
              />
            ) : (
              <>
                <Input
                  label={
                    pathname !== "/incoming-payments" ? "Customer" : "Code"
                  }
                  value={customerCodeSearchTerm || selectedCustomer.cardCode}
                  ref={customerCodeRef}
                  readOnly={status !== "Open" || !isAddMode}
                  isEditable={isDocNumManuallyEntered}
                  onChange={handleCustomerCodeInput}
                  icon={
                    isAddMode &&
                    isCustomerIconVisible &&
                    !isDocNumManuallyEntered && (
                      <HiAdjustmentsHorizontal className="text-stone-500" />
                    )
                  }
                  onIconClick={handleAdjustmentsClick}
                  status={status}
                  style={{
                    visibility: isAccountSelected ? "hidden" : "visible",
                  }}
                />
                {isDropdownVisibleCode && filteredCustomerList.length > 0 && (
                  <ul
                    ref={dropdownRefCode}
                    className="absolute translate-x-full translate-y-5 z-10 bg-white border border-stone-300 w-[8.5rem] max-h-40 overflow-y-auto"
                  >
                    {filteredCustomerList.map((customer) => (
                      <li
                        key={customer.cardCode}
                        onClick={() => handleItemClick(customer)} // Use handleItemClick here
                        className="cursor-pointer p-2 hover:bg-stone-100"
                      >
                        {customer.cardCode} - {customer.cardName}
                      </li>
                    ))}
                  </ul>
                )}

                <Input
                  label="Name"
                  ref={customerNameRef}
                  value={customerNameSearchTerm || selectedCustomer.cardName}
                  readOnly={status !== "Open"}
                  isEditable={isDocNumManuallyEntered}
                  onChange={handleCustomerNameInput} // Use the new handler for name input
                  icon={
                    isAddMode &&
                    isCustomerIconVisible &&
                    !isDocNumManuallyEntered && (
                      <HiAdjustmentsHorizontal className="text-stone-500" />
                    )
                  }
                  onIconClick={() => setIsModalOpen(true)}
                  status={status}
                  style={{
                    visibility: isAccountSelected ? "hidden" : "visible",
                  }}
                />

                {isDropdownVisibleName && filteredCustomerList.length > 0 && (
                  <ul
                    ref={dropdownRefName}
                    className="absolute translate-x-full translate-y-10 z-10 bg-white border border-stone-300 w-[8.5rem] max-h-40 overflow-y-auto"
                  >
                    {filteredCustomerList.map((customer) => (
                      <li
                        key={customer.cardCode}
                        onClick={() => handleItemClick(customer)} // Use handleItemClick here
                        className="cursor-pointer p-2 hover:bg-stone-100"
                      >
                        {customer.cardName} - {customer.cardCode}
                      </li>
                    ))}
                  </ul>
                )}

                {pathname === "/incoming-payments" && (
                  <div
                    className="flex items-center justify-between w-full"
                    style={{
                      visibility: isAccountSelected ? "hidden" : "visible",
                    }}
                  >
                    <div className="space-x-1.5">
                      <label>Bill To</label>
                      <select
                        value=""
                        onChange={() => {}}
                        className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-16 bg-white ${
                          isDocNumManuallyEntered ? "bg-yellow-200" : ""
                        }`}
                      >
                        <option value="billTo">Bill to</option>
                      </select>
                    </div>

                    <div>
                      <textarea
                        value={address || ""}
                        rows="5"
                        onChange={handleFieldChange(setAddress)}
                        readOnly={false}
                        className={`border resize-none border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-[8.5rem] bg-white ${
                          isDocNumManuallyEntered ? "bg-yellow-200" : ""
                        }`}
                      />
                    </div>
                  </div>
                )}

                {pathname !== "/incoming-payments" ? (
                  <Input
                    label="Contact Person"
                    value={contactPerson}
                    onChange={handleFieldChange(setContactPerson)}
                    type="text"
                    readOnly={false}
                    isEditable={isDocNumManuallyEntered}
                    status={status}
                  />
                ) : (
                  <Input
                    label="Contact Person"
                    value={contactPerson}
                    onChange={handleFieldChange(setContactPerson)}
                    type="text"
                    readOnly={false}
                    isEditable={isDocNumManuallyEntered}
                    status={"Open"}
                    style={{
                      visibility: isAccountSelected ? "hidden" : "visible",
                    }}
                  />
                )}
                {pathname !== "/incoming-payments" ? (
                  <Input
                    label={"Customer Ref. No."}
                    value={customerRefNumber}
                    onChange={handleFieldChange(setCustomerRefNumber)}
                    readOnly={isDocNumManuallyEntered || status !== "Open"}
                    isEditable={isDocNumManuallyEntered}
                    status={status}
                  />
                ) : null}

                {pathname !== "/incoming-payments" ? (
                  <Select
                    label="Currency"
                    options={[{ value: "primary", label: "Local Currency" }]}
                    value="primary"
                    onChange={() => setHasUnsavedChanges(true)}
                    isEditable={isDocNumManuallyEntered}
                    status={status}
                    isDocNumManuallyEntered={isDocNumManuallyEntered}
                  />
                ) : null}

                {isAccountSelected && (
                  <Select
                    label="Currency"
                    options={[{ value: "pkr", label: "PKR" }]}
                    value="pkr"
                    onChange={() => setHasUnsavedChanges(true)}
                    isEditable={isDocNumManuallyEntered}
                    status={status}
                    isDocNumManuallyEntered={isDocNumManuallyEntered}
                  />
                )}
              </>
            )}
          </div>

          {pathname === "/incoming-payments" && (
            <div className="flex flex-col gap-0.5">
              <div className="flex gap-1.5">
                <input
                  type="radio"
                  id="customerRadio"
                  name="entityType"
                  checked={selectedEntityType === "customer"}
                  onChange={() => handleEntityTypeChange("customer")}
                  disabled={!isAddMode || ctrlFEnterPressed} // Disable unless not in add mode and ctrlFEnterPressed is true
                />
                <label htmlFor="customerRadio">Customer</label>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="radio"
                  id="vendorRadio"
                  name="entityType"
                  checked={selectedEntityType === "vendor"}
                  onChange={() => handleEntityTypeChange("vendor")}
                  disabled={!isAddMode || ctrlFEnterPressed} // Disable unless not in add mode and ctrlFEnterPressed is true
                />
                <label htmlFor="vendorRadio">Vendor</label>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="radio"
                  id="accountRadio"
                  name="entityType"
                  checked={selectedEntityType === "account"}
                  onChange={() => handleEntityTypeChange("account")}
                  disabled={!isAddMode || ctrlFEnterPressed} // Disable unless not in add mode and ctrlFEnterPressed is true
                />
                <label htmlFor="accountRadio">Account</label>
              </div>
            </div>
          )}
        </div>

        {pathname !== "/payment-means" && (
          <div className="flex flex-col gap-0.5 sm:mt-2">
            <div className="flex items-center justify-between w-full">
              <div className="space-x-1.5">
                <label className="inline-block w-[3.8rem]">No.</label>
                <select
                  value={series}
                  onChange={handleSeriesChange}
                  className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-16 ${
                    isDocNumManuallyEntered
                      ? "bg-yellow-200"
                      : status === "Open"
                      ? "bg-white"
                      : "bg-stone-200"
                  }`}
                >
                  {ctrlFEnterPressed
                    ? [{ value: "", label: "" }, ...seires].map((s, index) => (
                        <option key={index} value={s.seriesName || s.value}>
                          {s.seriesName || s.label}
                        </option>
                      ))
                    : seires.map((s, index) => (
                        <option key={index} value={s.seriesName}>
                          {s.seriesName}
                        </option>
                      ))}
                </select>
              </div>

              <input
                ref={docNumRef}
                type="text"
                value={documentNumber || ""}
                readOnly={!isDocNumManuallyEntered}
                onChange={handleDocNumChange}
                onKeyDown={handleDocNumKeyDown}
                className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-[8.5rem] ${
                  isDocNumManuallyEntered
                    ? "bg-yellow-200"
                    : status === "Open"
                    ? "bg-white"
                    : "bg-stone-200"
                }`}
              />
            </div>

            {pathname !== "/incoming-payments" && (
              <Select
                label="Status"
                options={[
                  { value: "Open", label: "Open" },
                  { value: "Closed", label: "Closed" },
                  { value: "Cancelled", label: "Cancelled" },
                  { value: "Delivery", label: "Delivery" },
                ]}
                value={status}
                onChange={handleStatusChange}
                disabled={ctrlFEnterPressed}
                isEditable={ctrlFEnterPressed}
                status={status}
                isDocNumManuallyEntered={isDocNumManuallyEntered} // Add this line to control background color
                className="status-select"
              />
            )}

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
                  className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-1/2 ${
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

            {/* Delivery Date  */}
            {pathname !== "/incoming-payments" &&
              pathname !== "/sales-quotation" && (
                <div className="flex gap-2 items-center">
                  <label className="w-[8rem]">Delivery Date</label>
                  {!showDeliveryCalendar ? (
                    <input
                      type="text"
                      value={
                        deliveryDate
                          ? format(new Date(deliveryDate), "dd.MM.yyyy")
                          : ""
                      }
                      readOnly={status !== "Open" || isDocNumManuallyEntered}
                      onFocus={handleFocus(setShowDeliveryCalendar)}
                      onChange={handleDateChange(setDeliveryDate)}
                      className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-1/2 ${
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
                      value={deliveryDate || ""}
                      readOnly={status !== "Open" || isDocNumManuallyEntered}
                      onChange={handleDateChange(setDeliveryDate)}
                      onBlur={handleBlur(setShowDeliveryCalendar)}
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
              )}

            {/* Valid Date  */}
            {pathname !== "/incoming-payments" &&
              pathname === "/sales-quotation" && (
                <div className="flex gap-2 items-center">
                  <label className="w-[8rem]">Valid Date</label>
                  {!showDeliveryCalendar ? (
                    <input
                      type="text"
                      value={
                        deliveryDate
                          ? format(new Date(deliveryDate), "dd.MM.yyyy")
                          : ""
                      }
                      readOnly={status !== "Open" || isDocNumManuallyEntered}
                      onFocus={handleFocus(setShowDeliveryCalendar)}
                      onChange={handleDateChange(setDeliveryDate)}
                      className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-1/2 ${
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
                      value={deliveryDate || ""}
                      readOnly={status !== "Open" || isDocNumManuallyEntered}
                      onChange={handleDateChange(setDeliveryDate)}
                      onBlur={handleBlur(setShowDeliveryCalendar)}
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
              )}

            {/* Due Date */}
            {pathname === "/incoming-payments" && (
              <div className="flex gap-2 items-center">
                <label className="w-[8rem]">Due Date</label>
                {!showPostingCalendar ? (
                  <input
                    type="text"
                    value={
                      dueDate ? format(new Date(dueDate), "dd.MM.yyyy") : ""
                    }
                    readOnly={status !== "Open" || isDocNumManuallyEntered}
                    onFocus={handleFocus(setShowPostingCalendar)}
                    onChange={handleDateChange(setDueDate)}
                    className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-1/2 ${
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
            )}

            {/* Document Date */}
            <div className="flex gap-2 items-center">
              <label className="w-[8rem]">Document Date</label>
              {!showDocumentCalendar ? (
                <input
                  type="text"
                  value={
                    documentDate
                      ? format(new Date(documentDate), "dd.MM.yyyy")
                      : ""
                  }
                  readOnly={status !== "Open" || isDocNumManuallyEntered}
                  onFocus={handleFocus(setShowDocumentCalendar)}
                  onChange={handleDateChange(setDocumentDate)}
                  className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-1/2 ${
                    isDocNumManuallyEntered
                      ? "bg-yellow-200"
                      : pathname === "/incoming-payments"
                      ? "bg-white"
                      : status === "Open"
                      ? "bg-white"
                      : "bg-stone-200"
                  }`}
                />
              ) : (
                <input
                  type="date"
                  value={documentDate || ""}
                  readOnly={status !== "Open" || isDocNumManuallyEntered}
                  onChange={handleDateChange(setDocumentDate)}
                  onBlur={handleBlur(setShowDocumentCalendar)}
                  className={`border border-stone-400 focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 focus:border-0 focus:outline-none rounded-none w-1/2 ${
                    isDocNumManuallyEntered
                      ? "bg-yellow-200"
                      : pathname === "/incoming-payments"
                      ? "bg-white"
                      : status === "Open"
                      ? "bg-white"
                      : "bg-stone-200"
                  }`}
                />
              )}
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

export default Header;
