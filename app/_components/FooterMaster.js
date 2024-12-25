import { format, isValid, parseISO } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTable } from "../_contexts/TableContext";
import Spinner from "./Spinner";

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
    setOwner,
    customerRefNumber,
    isAddMode,
    freights,
    setFreights,
    setFreightTotal,
    postingDocument,
    updatingDocument,
    setPostingDocument,
    setUpdatingDocument,
    status,
    discountPercentage,
    discountValue,
    setDiscountValue,
    SERVER_ADDRESS,
    setHasUnsavedChanges,
    setDiscountPercentage,
    setDocumentAdditionalExpenses,
    setTotal,
    ctrlFEnterPressed,
    selectedEntityType,
    dueDate,
    token,
    setPaymentChecks,
    setGlAccount,
    setTransferDate,
    setReferenceBank,
    bankOptions,
    setCashTotal,
    setBankTotal,
    cashOptions,
  } = useTable();

  const isAccountSelected = selectedEntityType === "account";

  // Local States
  const [tempDiscountPercentage, setTempDiscountPercentage] =
    useState(discountPercentage);
  const [selectedOwnerRow, setSelectedOwnerRow] = useState(null); // Track the highlighted row
  const [selectedFreightRow, setSelectedFreightRow] = useState(null); // Track the highlighted row
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isFreightModalOpen, setIsFreightModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCopyFromContainer, setShowCopyFromContainer] = useState(false);
  const [footerBtnText, setFooterBtnText] = useState("");

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

  // Helper Maps
  const statusMap = {
    Open: "bost_Open",
    Closed: "bost_Close",
    Cancelled: "tYES",
    Delivery: "bost_Delivered",
  };

  const documentStatus = statusMap[status] || "bost_Open"; // Map status to document status
  const isCopyToButtonEnabled = !isAddMode && documentStatus === "bost_Open";

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
    // Common validation: Ensure customer details are provided
    if (!selectedCustomer?.cardName) {
      toast.error("Card Code and Card Name are required.");
      return false;
    }

    return true;
  };

  const getBusinessPartnerApiEndpoint = () => {
    return operation === "add"
      ? `${SERVER_ADDRESS}api/SAPGeneral/PostBusinessPartner`
      : `${SERVER_ADDRESS}api/SAPGeneral/UpdateBusinessPartner/${selectedItem?.cardCode}`;
  };

  const prepareBusinessPartnerData = () => {
    return {
      AdditionalID: selectedItem?.additionalID || "",
      AttachmentEntry: selectedItem?.attachmentEntry || 0,
      CardCode: selectedItem?.cardCode || "",
      CardForeignName: selectedItem?.cardForeignName || "",
      CardName: selectedCustomer?.cardName || "",
      Cellular: selectedItem?.cellular || "",
      CreateDate: selectedItem?.createDate || "",
      DebitorAccount: selectedItem?.debitorAccount || "",
      DocDateString: selectedItem?.docDateString || "",
      DownPaymentClearAct: selectedItem?.downPaymentClearAct || "",
      DownPaymentInterimAccount: selectedItem?.downPaymentInterimAccount || "",
      EmailAddress: selectedItem?.emailAddress || "",
      FederalTaxID: customerRefNumber || "",
      GetAttachments: selectedItem?.getAttachments || "",
      GroupCode: selectedItem?.groupCode || "",
      LicTradNum: selectedItem?.licTradNum || "",
      LinkedBusinessPartner: selectedItem?.linkedBusinessPartner || "",
      MailAddress: selectedItem?.mailAddress || "",
      Notes: selectedItem?.notes || "",
      Phone1: selectedItem?.phone1 || "",
      Phone2: selectedItem?.phone2 || "",
      Picture: selectedItem?.picture || "",
      Project: selectedItem?.project || "",
      ProjectCode: selectedItem?.projectCode || "",
      Series: selectedItem?.series || "",
      SlpCode: selectedItem?.slpCode || "",
      U_Attachment: selectedItem?.u_Attachment || "",
    };
  };

  // Handle POST/UPDATE Document
  const handlePostDocument = async () => {
    if (!validateRequiredFields()) return;

    let apiEndpoint;
    let method = "POST";
    let data;

    // Determine API Endpoint and Payload
    if (pathname === "/business-partner-master-data") {
      apiEndpoint = getBusinessPartnerApiEndpoint();
      data = prepareBusinessPartnerData();
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

        if (pathname === "/business-partner-master-data") {
          toast.success(
            responseData.Message || "Business Partner updated successfully!"
          );
          resetItemData();
          return;
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
