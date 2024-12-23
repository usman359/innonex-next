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

const General = () => {
  const pathname = usePathname();
  const router = useRouter();
  const customerRef = useRef(null);

  const [showDeliveryCalendar, setShowDeliveryCalendar] = useState(false);
  const [showPostingCalendar, setShowPostingCalendar] = useState(false);
  const [showDocumentCalendar, setShowDocumentCalendar] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
  } = useTable();

  const isAccountSelected =
    pathname === "/incoming-payments" && selectedEntityType === "account";

  const [selectedCustomerRow, setSelectedCustomerRow] = useState(null);

  const docNumRef = useRef(null);

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

  const handleDocNumKeyDown = useCallback(
    async (e) => {
      if (!orderType) return;

      if (e.key === "Enter") {
        setIsAddMode(false);

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
                  Authorization: `Bearer ${token}`,
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
                  Authorization: `Bearer ${token}`,
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
            console.log(error);
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

        // Reset document number field
        setDocumentNumber(null);

        if (docNumRef.current) {
          docNumRef.current.focus(); // Set focus on the No. field
          docNumRef.current.select(); // Highlight the text (if any)
        }

        // Reset the Series and Status fields to their first option
        setSeries(""); // Set the Series to the first option
        setStatus(""); // Reset Status to the default first option ("Open")
        setctrlFEnterPressed(false);
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
  ]);

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
    <div className="flex flex-col justify-between h-[30rem]">
      {documentNumberLoading && <Spinner />}
      <header className="flex flex-col sm:flex-row justify-between px-4 my-4 sm:my-0">
        <div className="flex gap-4">
          <div className="flex flex-col gap-0.5 sm:mt-2">
            <Input
              label="Tel 1"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="Tel 2"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="Mobile Phone"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="Fax"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="E-Mail"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="Web Site"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Select
              label="Shopping Type"
              // options={[{ value: "pkr", label: "PKR" }]}
              options={[{}]}
              value=""
              onChange={() => setHasUnsavedChanges(true)}
              isEditable={isDocNumManuallyEntered}
              status={status}
              isDocNumManuallyEntered={isDocNumManuallyEntered}
            />

            <Input
              label="Password"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="Factoring Indicator"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="BP Project"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Select
              label="Industry"
              // options={[{ value: "pkr", label: "PKR" }]}
              options={[{}]}
              value=""
              onChange={() => setHasUnsavedChanges(true)}
              isEditable={isDocNumManuallyEntered}
              status={status}
              isDocNumManuallyEntered={isDocNumManuallyEntered}
            />

            <Select
              label="Type of Business"
              options={[
                { value: "company", label: "Company" },
                { value: "private", label: "Private" },
                { value: "govermant", label: "Govermany" },
                { value: "employee", label: "Employee" },
              ]}
              value=""
              onChange={() => setHasUnsavedChanges(true)}
              isEditable={isDocNumManuallyEntered}
              status={status}
              isDocNumManuallyEntered={isDocNumManuallyEntered}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-0.5 sm:mt-2">
            <div className="flex items-center justify-between w-full"></div>

            <Input
              label="Contact Person"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="ID No. 2"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="Unified Federal Tax ID"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="Remarks"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="BP Channel Code"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />

            <Input
              label="Territory"
              value={selectedCustomer.cardCode}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              onIconClick={handleAdjustmentsClick}
              status={status}
              style={{
                visibility: isAccountSelected ? "hidden" : "visible",
              }}
            />
          </div>
        </div>
      </header>

      <main>
        <header className="flex flex-col sm:flex-row justify-between px-4 my-4 sm:my-0">
          <div className="flex gap-4">
            <div className="flex flex-col gap-0.5 sm:mt-2">
              <h1 className="underline">Personal Data Protection</h1>

              <Input
                label="Alias Name"
                value={selectedCustomer.cardCode}
                readOnly={status !== "Open"}
                isEditable={isDocNumManuallyEntered}
                onIconClick={handleAdjustmentsClick}
                status={status}
                style={{
                  visibility: isAccountSelected ? "hidden" : "visible",
                }}
              />

              <div className="flex flex-col gap-0.5 mt-12">
                <div className="flex gap-1.5">
                  <input
                    type="radio"
                    id="activeRadio"
                    name="entityType"
                    checked={selectedEntityType === "active"}
                    onChange={() => handleEntityTypeChange("active")}
                    disabled={!isAddMode || ctrlFEnterPressed} // Disable unless not in add mode and ctrlFEnterPressed is true
                  />
                  <label htmlFor="activeRadio">Active</label>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="radio"
                    id="inactiveRadio"
                    name="entityType"
                    checked={selectedEntityType === "inactive"}
                    onChange={() => handleEntityTypeChange("inactive")}
                    disabled={!isAddMode || ctrlFEnterPressed} // Disable unless not in add mode and ctrlFEnterPressed is true
                  />
                  <label htmlFor="inactiveRadio">Inactive</label>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="radio"
                    id="advancedRadio"
                    name="entityType"
                    checked={selectedEntityType === "advanced"}
                    onChange={() => handleEntityTypeChange("advanced")}
                    disabled={!isAddMode || ctrlFEnterPressed} // Disable unless not in add mode and ctrlFEnterPressed is true
                  />
                  <label htmlFor="advancedRadio">Account</label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-0.5 sm:mt-2">
              <div className="flex items-center justify-between w-full"></div>

              <Input
                label="GLN"
                value={selectedCustomer.cardCode}
                readOnly={status !== "Open"}
                isEditable={isDocNumManuallyEntered}
                onIconClick={handleAdjustmentsClick}
                status={status}
                style={{
                  visibility: isAccountSelected ? "hidden" : "visible",
                }}
              />
            </div>
          </div>
        </header>
      </main>

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

export default General;
