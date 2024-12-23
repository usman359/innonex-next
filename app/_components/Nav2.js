import { format, parseISO } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Spinner from "../_components/Spinner";
import { useTable } from "../_contexts/TableContext";
import { icons } from "../_data/nav2";
import { DateFilter } from "./DateFilter";
import { IconButton } from "./IconButton";
import Modal from "./Modal";

const ACTIONS = {
  ADD: "Add",
  FIRST_RECORD: "First Data Record",
  LAST_RECORD: "Last Data Record",
  NEXT_RECORD: "Next Record",
  PREVIOUS_RECORD: "Previous Record",
  MS_EXCEL: "MS-Excel",
  FORM_SETTINGS: "Form Settings",
  PRINT: "Print",
  MS_WORD: "MS-Word",
  RELOAD: "Reload",
};

export default function Nav2() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    excelButtonRef,
    printButtonRef,
    wordButtonRef,
    currentPage,
    setSelectedItem,
    updateRowsToDisplay,
    setHiAdjustmentsVisible,
    resetItemData,
    selectedFromDate,
    selectedToDate,
    setSelectedFromDate,
    setSelectedToDate,
    itemsByDateAndFormType,
    setIsAddMode,
    currentDocumentIndex,
    setCurrentDocumentIndex,
    isDocNumManuallyEntered,
    setItemsByDateAndFormType,
    fromAndToLoading,
    setFromAndToLoading,
    setIsCustomerIconVisible,
    setIsItemDescriptionIconVisible,
    setIsDocNumManuallyEntered,
    SERVER_ADDRESS,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    showRecordIcons,
    setctrlFEnterPressed,
    orderType,
    status,
    handleFindAction,
    setDocumentNumber,
    navDateButtonText,
    setNavDateButtonText,
    setStatus,
    setShowRecordIcons,
    token,
    payments,
    setPayments,
    isAddMode,
    documentNumber,
    setSalesLoading,
    seires,
    statusChanged,
    setTotalBeforeDiscount,
    setDiscountPercentage,
    seriesChanged,
    setOperation,
    setSelectedCustomer,
    setCustomerRefNumber,
    setSeries,
    setPostingDate,
    setDeliveryDate,
    setDocumentDate,
    setRemarks,
    setTax,
    setDiscountValue,
    setFreightTotal,
  } = useTable();

  const getToken = () => {
    return localStorage.getItem("token") || token;
  };

  // Local states to temporarily hold selected dates and modal data
  const [tempFromDate, setTempFromDate] = useState(selectedFromDate);
  const [tempToDate, setTempToDate] = useState(selectedToDate);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [reloadLoadingCount, setReloadLoadingCount] = useState(0);
  const [datesChanged, setDatesChanged] = useState(false);

  const isIncomingPayments = pathname === "/incoming-payments";

  useEffect(() => {
    if (isDocNumManuallyEntered) setNavDateButtonText("Search");
  }, [isDocNumManuallyEntered, setNavDateButtonText]);

  const statusMap = {
    Open: "bost_Open",
    Closed: "bost_Close",
    Cancelled: "tYES",
    Delivery: "bost_Delivered",
  };

  // const statusParam = statusMap[status] || "bost_Open"; // Default to 'bost_Open' (Open status)

  const handleModalYes = async () => {
    // resetItemData();

    // console.log(pendingAction);
    switch (pendingAction) {
      case ACTIONS.ADD:
        resetItemData();

        if (status !== "Open") {
          setStatus("Open");
          const newStatusParam = statusMap["Open"];
          await fetchData(tempFromDate, tempToDate, newStatusParam);
        } else {
          // console.log("Status already 'Open', no fetch needed");
        }

        setIsDocNumManuallyEntered(false);
        setctrlFEnterPressed(false);
        break;

      case ACTIONS.LAST_RECORD:
        handleLastRecord();
        break;
      case ACTIONS.FIRST_RECORD:
        handleFirstRecord();
        break;
      case ACTIONS.NEXT_RECORD:
        handleNextRecord();
        break;
      case ACTIONS.PREVIOUS_RECORD:
        handlePreviousRecord();
        break;

      case ACTIONS.RELOAD:
        await handleReloadAction();
        break;

      default:
        // If no specific action, just reset unsaved changes without fetching
        if (hasUnsavedChanges) {
          toast.success("No changes made. Current document retained.");
        }
        break;
    }
    setShowUnsavedChangesModal(false);
    setPendingAction(null);
    setHasUnsavedChanges(false);
  };

  const handleModalNo = () => {
    setShowUnsavedChangesModal(false);
    setPendingAction(null);
  };

  const fetchData = async (newFromDate, newToDate, statusParam) => {
    if (!datesChanged && reloadLoadingCount === 0) {
      console.log("Fetch skipped: No date change or reload.");
      return;
    }
    try {
      setFromAndToLoading(true);

      const formattedFromDate = format(
        new Date(newFromDate),
        "yyyy-MM-dd'T'00:00:00"
      );
      const formattedToDate = format(
        new Date(newToDate),
        "yyyy-MM-dd'T'23:59:59"
      );

      // console.log(pathname);
      // console.log(isIncomingPayments);
      const apiUrl = isIncomingPayments
        ? `${SERVER_ADDRESS}api/Payments/GetPaymentList/${orderType}/${statusParam}/${formattedToDate}/${formattedFromDate}`
        : `${SERVER_ADDRESS}api/Marketing/GetDocuments/${orderType}/${statusParam}/${formattedToDate}/${formattedFromDate}`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          console.log(data);
          resetItemData();

          if (isIncomingPayments) {
            setPayments(data); // Set the fetched payments
          } else {
            setItemsByDateAndFormType(data); // Set the fetched items
          }

          setNavDateButtonText("Show");
          setHasFetchedData(true); // Indicate that data has been successfully fetched
          setIsModalOpen(true); // Open modal with the fetched data
          setShowRecordIcons(true);
        } else {
          resetItemData();
          setNavDateButtonText("Search");
          setIsModalOpen(false);
          setShowRecordIcons(false);
          toast.error("No matching records were found");
          setStatus("Open");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.Message || "No matching records were found");
        resetItemData();
        setNavDateButtonText("Search");
        setSelectedItem(null);
        router.push("/login");
      }
    } catch (error) {
      toast.error(error.message);
      resetItemData();
      setStatus("Open");
      setNavDateButtonText("Search");
      setSelectedItem(null);
      router.push("/login"); // Redirect to login page in case of failure
    } finally {
      setFromAndToLoading(false);
    }
  };

  // Filter the data based on the page
  const filteredItems = isIncomingPayments
    ? payments?.length > 0
      ? payments.filter((payment) =>
          payment.docNum.toString()?.includes(searchTerm)
        )
      : []
    : itemsByDateAndFormType?.length > 0
    ? itemsByDateAndFormType.filter((item) => item.docNum?.includes(searchTerm))
    : [];

  const handleTempFromDateChange = (event) => {
    const newFromDate = new Date(event.target.value);
    setTempFromDate(newFromDate);
    setNavDateButtonText("Search");
    setDatesChanged(true);
  };

  const handleTempToDateChange = (event) => {
    const newToDate = new Date(event.target.value);
    setTempToDate(newToDate);
    setNavDateButtonText("Search");
    setDatesChanged(true);
  };

  const handleSearchClick = async () => {
    if (navDateButtonText === "Search") {
      if (status === "") {
        setStatus("Open");
      }

      const currentStatusParam = statusMap[status] || statusMap["Open"];
      // console.log(currentStatusParam);

      setDocumentNumber(null);
      setSelectedFromDate(tempFromDate);
      setSelectedToDate(tempToDate);
      setIsAddMode(false);
      setIsDocNumManuallyEntered(false);
      setHasUnsavedChanges(false);
      setctrlFEnterPressed(false);
      await fetchData(tempFromDate, tempToDate, currentStatusParam); // Call API
      setDatesChanged(false);
    } else {
      // Handle logic when the button is "Open"
      setIsModalOpen(true); // Open the modal window
    }
  };

  const handleChooseClick = () => {
    if (selectedRow) {
      handleRecordSelection(selectedRow);
      setIsModalOpen(false); // Close the item modal after selection
    }
  };

  const handleRowClick = (row) => {
    setSelectedRow(row); // Set the selected row
  };

  const handleRowDoubleClick = (row) => {
    handleRecordSelection(row); // Directly select the row on double-click
    setIsModalOpen(false); // Close the modal after selection
  };

  const handleRecordSelection = (selected) => {
    setSelectedItem(selected);

    if (isIncomingPayments) {
      // For Incoming Payments, update the rows and index using the payments array
      updateRowsToDisplay(
        selected?.paymentInvoices ||
          new Array(10).fill({ lineStatus: "bost_Open" })
      );
      setCurrentDocumentIndex(payments.indexOf(selected)); // Update index based on the payments array
    } else {
      // For other pages, update the rows and index using the itemsByDateAndFormType array
      updateRowsToDisplay(
        selected?.documentLines ||
          new Array(10).fill({ lineStatus: "bost_Open" })
      );
      setCurrentDocumentIndex(itemsByDateAndFormType.indexOf(selected)); // Update index based on the items array
    }

    setIsAddMode(false); // Exit add mode
    setHiAdjustmentsVisible(true);
    setIsCustomerIconVisible(false);
    setIsItemDescriptionIconVisible(true);

    // Reset unsaved changes and manual entry status
    setHasUnsavedChanges(false);
    setIsDocNumManuallyEntered(false);
  };

  const handlePreviousRecord = () => {
    const data = isIncomingPayments ? payments : itemsByDateAndFormType;

    if (isAddMode) {
      // Find the previous item based on document number
      const previousDocNumber = documentNumber - 1;
      const previousItem = data.find(
        (item) => Number(item.docNum) === Number(previousDocNumber)
      );

      if (previousItem) {
        const previousIndex = data.indexOf(previousItem);
        setCurrentDocumentIndex(previousIndex);
        setSelectedItem(previousItem);
        handleRecordSelection(previousItem, previousIndex);
      } else {
        toast.error("No previous record found.");
      }
    } else if (currentDocumentIndex < data.length - 1) {
      // Standard mode: navigate to the previous index
      const previousIndex = currentDocumentIndex + 1;
      const previousItem = data[previousIndex];
      setCurrentDocumentIndex(previousIndex);
      setSelectedItem(previousItem);
      handleRecordSelection(previousItem, previousIndex);
    }
  };

  const handleNextRecord = () => {
    const data = isIncomingPayments ? payments : itemsByDateAndFormType;

    if (isAddMode) {
      const nextDocNumber = documentNumber + 1;
      const nextItem = data.find(
        (item) => Number(item.docNum) === Number(nextDocNumber)
      );

      if (nextItem) {
        const nextIndex = data.indexOf(nextItem);
        setCurrentDocumentIndex(nextIndex);
        setSelectedItem(nextItem);
        handleRecordSelection(nextItem, nextIndex);
      } else {
        toast.error("No next record found.");
      }
    } else if (currentDocumentIndex > 0) {
      const nextIndex = currentDocumentIndex - 1;
      const nextItem = data[nextIndex];
      setCurrentDocumentIndex(nextIndex);
      setSelectedItem(nextItem);
      handleRecordSelection(nextItem, nextIndex);
    }
  };

  const handleFirstRecord = () => {
    const data = isIncomingPayments ? payments : itemsByDateAndFormType;

    if (!data || data.length === 0) {
      toast.error("No records available.");
      return;
    }

    if (isAddMode) {
      const firstDocNumber = Math.min(
        ...data.map((item) => Number(item.docNum))
      );
      const firstItem = data.find(
        (item) => Number(item.docNum) === Number(firstDocNumber)
      );

      if (firstItem) {
        const firstIndex = data.indexOf(firstItem);
        setCurrentDocumentIndex(firstIndex);
        setSelectedItem(firstItem);
        handleRecordSelection(firstItem, firstIndex);
      } else {
        toast.error("No first record found.");
      }
    } else {
      const firstIndex = data.length - 1;
      const firstItem = data[firstIndex];

      if (firstItem) {
        setCurrentDocumentIndex(firstIndex);
        setSelectedItem(firstItem);
        handleRecordSelection(firstItem, firstIndex);
      } else {
        toast.error("No first record found.");
      }
    }
  };

  const handleLastRecord = () => {
    const data = isIncomingPayments ? payments : itemsByDateAndFormType;
    if (data.length > 0) {
      const lastIndex = 0;
      const lastItem = data[lastIndex];
      setCurrentDocumentIndex(lastIndex);
      setSelectedItem(lastItem);
      handleRecordSelection(lastItem, lastIndex);
    }
  };

  function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
      return "th";
    }
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  const formatDateWithSuffix = (date) => {
    if (!date || isNaN(new Date(date))) {
      return "Invalid Date"; // Handle invalid date case
    }

    const day = format(new Date(date), "d"); // Ensure valid date conversion
    const dayWithSuffix = `${day}${getDaySuffix(day)}`;
    const formattedDate = `${dayWithSuffix} ${format(
      new Date(date),
      "MMMM yyyy"
    )}`;
    return formattedDate;
  };

  const handleClick = async (action) => {
    // console.log(action);

    if (action === "Find") {
      handleFindAction();
    }
    if (action === "Reload") {
      console.log(hasUnsavedChanges);
      if (hasUnsavedChanges) {
        setShowUnsavedChangesModal(true);
        setPendingAction(action);
        return;
      }

      // If no unsaved changes, proceed with reloading directly
      await handleReloadAction();
      return;
    }
    if (
      isDocNumManuallyEntered &&
      [
        ACTIONS.NEXT_RECORD,
        ACTIONS.PREVIOUS_RECORD,
        ACTIONS.FIRST_RECORD,
        ACTIONS.LAST_RECORD,
      ].includes(action)
    ) {
      setIsDocNumManuallyEntered(false);
      return;
    }

    if (hasUnsavedChanges) {
      setShowUnsavedChangesModal(true);
      setPendingAction(action);
      return;
    }

    switch (action) {
      case ACTIONS.ADD:
        resetItemData();
        if (status !== "Open") {
          setStatus("Open");

          const newStatusParam = statusMap["Open"];
          await fetchData(tempFromDate, tempToDate, newStatusParam);
        } else {
          // console.log("Status already 'Open', no fetch needed"); // Log that the status is already 'Open'
        }

        setIsDocNumManuallyEntered(false);
        setctrlFEnterPressed(false);
        break;

      case ACTIONS.FIRST_RECORD:
        handleFirstRecord();
        break;

      case ACTIONS.LAST_RECORD:
        handleLastRecord();
        break;

      case ACTIONS.NEXT_RECORD:
        handleNextRecord();
        break;

      case ACTIONS.PREVIOUS_RECORD:
        handlePreviousRecord();
        break;

      case ACTIONS.MS_EXCEL:
        excelButtonRef?.current?.handleDownload();
        break;

      case ACTIONS.FORM_SETTINGS:
        router.push("/form-settings", { state: { currentPage } });
        break;

      case ACTIONS.PRINT:
        printButtonRef?.current?.click();
        break;

      case ACTIONS.MS_WORD:
        wordButtonRef?.current?.click();
        break;

      default:
        break;
    }
  };

  // Extract the Reload action to a separate function for better readability
  const handleReloadAction = async () => {
    // // Ensure reloading only happens if changes were made
    // if (!hasUnsavedChanges) {
    //   toast.success("No changes detected. Reload skipped.");
    //   return;
    // }

    setSalesLoading(true);
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
            setDeliveryDate(format(parseISO(data.docDueDate), "yyyy-MM-dd"));
            setDocumentDate(format(parseISO(data.taxDate), "yyyy-MM-dd"));

            // Calculate totals
            const totalBeforeDiscountValue = data.documentLines.reduce(
              (acc, line) => acc + (line.lineTotal || 0),
              0
            );
            setTotalBeforeDiscount(totalBeforeDiscountValue);

            const discPercentage = data.discountPercent || 0;
            setDiscountPercentage(discPercentage);

            const discValue = (totalBeforeDiscountValue * discPercentage) / 100;
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
          // toast.error("No matching records were found");
        }
      } else {
        resetItemData();
        toast.error("No matching records were found.");
      }
    } catch (error) {
      resetItemData();
      toast.error(error.message);
      router.push("/login"); // Redirect to login on error
    } finally {
      setSalesLoading(false);
    }
  };

  return (
    <div className="relative bg-white px-4 py-3 text-xs">
      {fromAndToLoading && <Spinner />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-3 md:gap-4 flex-wrap justify-start md:justify-start order-2 sm:order-1">
          {icons.map((icon, index) => {
            return (
              <IconButton
                key={index}
                src={icon.src}
                alt={icon.alt}
                text={icon.text}
                onClick={() => handleClick(icon.text)}
              />
            );
          })}
        </div>

        <div className="flex gap-2 flex-wrap items-center order-1 sm:order-2 md:justify-end text-xs">
          {currentPage !== "menu" && (
            <>
              <DateFilter
                label="From:"
                value={tempFromDate}
                onChange={handleTempFromDateChange}
              />
              <DateFilter
                label="To:"
                value={tempToDate}
                onChange={handleTempToDateChange}
              />
              <button
                onClick={handleSearchClick}
                disabled={!selectedFromDate || !selectedToDate}
                className={`px-2 border border-stone-400 ${
                  selectedFromDate && selectedToDate
                    ? "bg-yellow-200"
                    : "bg-stone-400"
                }`}
              >
                {navDateButtonText}
              </button>
            </>
          )}
        </div>
      </div>
      {/* Modal for search results */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Select a Document"
          onChoose={handleChooseClick}
          selectedItem={selectedRow}
        >
          <input
            type="text"
            placeholder="Search by document number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 p-2 border border-stone-300 rounded w-full"
          />
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead className="sticky top-0 bg-stone-200">
                <tr>
                  <th className="p-2 border text-start">#</th>
                  <th className="p-2 border text-start">Document Number</th>
                  <th className="p-2 border text-start">Customer Code</th>
                  <th className="p-2 border text-start">Customer Name</th>
                  <th className="p-2 border text-start">
                    {isIncomingPayments ? "Cash Sum" : "Document Total"}
                  </th>
                  <th className="p-2 border text-start">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {!isIncomingPayments
                  ? filteredItems?.map((result, index) => (
                      <tr
                        key={index}
                        className={`cursor-pointer hover:bg-stone-100 ${
                          selectedRow === result ? "bg-yellow-200" : ""
                        }`}
                        onClick={() => handleRowClick(result)}
                        onDoubleClick={() => handleRowDoubleClick(result)}
                      >
                        <td className="p-2 border">{index + 1}</td>
                        <td className="p-2 border">{result.docNum}</td>
                        <td className="p-2 border">{result.cardCode}</td>
                        <td className="p-2 border">{result.cardName}</td>
                        <td className="p-2 border">{result.docTotal}</td>
                        <td className="p-2 border">
                          {formatDateWithSuffix(result.docDueDate)}
                        </td>
                      </tr>
                    ))
                  : filteredItems?.map((payment, index) => (
                      <tr
                        key={index}
                        className={`cursor-pointer hover:bg-stone-100 ${
                          selectedRow === payment ? "bg-yellow-200" : ""
                        }`}
                        onClick={() => handleRowClick(payment)}
                        onDoubleClick={() => handleRowDoubleClick(payment)}
                      >
                        <td className="p-2 border">{index + 1}</td>
                        <td className="p-2 border">{payment.docNum}</td>
                        <td className="p-2 border">{payment.cardCode}</td>
                        <td className="p-2 border">{payment.cardName}</td>
                        <td className="p-2 border">{payment.cashSum}</td>
                        <td className="p-2 border">
                          {formatDateWithSuffix(payment.dueDate)}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* Modal for unsaved changes */}
      {showUnsavedChangesModal && (
        <Modal
          isOpen={showUnsavedChangesModal}
          onClose={handleModalNo}
          onChoose={handleModalYes}
          title="Unsaved Changes"
          disableOutsideClickAndClose={true}
          showFooterButtons={false}
        >
          <div className="p-4">
            <p>
              Unsaved data will be lost. Do you want to continue without saving?
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-stone-300 text-stone-700 px-4 py-2 mr-2"
                onClick={handleModalNo}
              >
                No
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2"
                onClick={handleModalYes}
              >
                Yes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
