import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTable } from "../_contexts/TableContext";
import Input from "./Input";
import Modal from "./Modal";

export default function BankTransferTable() {
  const {
    status,
    ctrlFEnterPressed,
    isDocNumManuallyEntered,
    glAccount,
    setGlAccount,
    transferDate,
    setTransferDate,
    referenceBank,
    setReferenceBank,
    setHasUnsavedChanges,
    isAddMode,
    setOperation,
    bankOptions,
    bankTotal,
    setBankTotal,
    SERVER_ADDRESS,
    setBankOptions,
  } = useTable();

  const [showPostingCalendar, setShowPostingCalendar] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [selectedBankRow, setSelectedBankRow] = useState(null);
  const [bankSearchTerm, setBankSearchTerm] = useState("");

  const handleBlur = (setShowCalendar) => () => {
    setShowCalendar(false);
  };

  const handleFocus = (setShowCalendar) => () => {
    setShowCalendar(true);
  };

  const handleDateChange = (setter) => (e) => {
    const dateValue = e.target.value;
    setter(dateValue ? new Date(dateValue).toISOString().split("T")[0] : "");
    setHasUnsavedChanges(true);

    if (isAddMode) setOperation("add");
    if (!isAddMode) setOperation("update");
    if (ctrlFEnterPressed) setOperation("update");
  };

  const handleModalClose = () => {
    setBankModalOpen(false);
  };

  const handleRowClick = (row) => {
    setSelectedBankRow(row);
  };

  const handleRowDoubleClick = (row) => {
    handleBankSelection(row);
  };

  const handleBankSelection = (bank) => {
    setGlAccount(bank.BankName);
    setBankModalOpen(false);
  };

  const handleChooseClick = () => {
    if (selectedBankRow) {
      handleBankSelection(selectedBankRow);
      setBankModalOpen(false);
    }
  };

  const reopenBankModal = () => {
    setBankModalOpen(true); // Reopen modal when button is clicked
  };

  const fetchAccountOptions = async () => {
    try {
      const response = await fetch(`${SERVER_ADDRESS}api/Common/GetBanks/bank`);
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
    fetchAccountOptions();
  }, []);

  return (
    <main className="relative overflow-x-auto">
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          label="G/L Account"
          value={glAccount}
          onChange={(e) => setGlAccount(e.target.value)}
          isEditable={isDocNumManuallyEntered}
          status={status}
        />
        <button
          onClick={reopenBankModal}
          className="px-2 bg-amber-200 text-black border border-stone-400"
        >
          Choose Bank
        </button>
      </div>
      <div className="flex flex-col sm:flex-row mb-4 w-[17rem]">
        <label className="w-[8.5rem]">Transfer Date</label>
        {!showPostingCalendar ? (
          <input
            type="text"
            value={
              transferDate ? format(new Date(transferDate), "dd.MM.yyyy") : ""
            }
            readOnly={status !== "Open" || isDocNumManuallyEntered}
            onFocus={handleFocus(setShowPostingCalendar)}
            onChange={handleDateChange(setTransferDate)}
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
            value={transferDate}
            readOnly={status !== "Open" || isDocNumManuallyEntered}
            onChange={handleDateChange(setTransferDate)}
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
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <Input
          label="Reference"
          value={referenceBank}
          onChange={(e) => setReferenceBank(e.target.value)}
          isEditable={isDocNumManuallyEntered}
          status={status}
        />
      </div>
      <div className="mt-36 flex justify-end">
        <Input
          label="Total"
          value={bankTotal}
          onChange={(e) => setBankTotal(e.target.value)}
          isEditable={isDocNumManuallyEntered}
          status={status}
        />
      </div>

      {/* Bank Selection Modal */}
      <Modal
        isOpen={bankModalOpen}
        onClose={handleModalClose} // Ensure state resets on modal close
        title="Select a Bank"
        onChoose={handleChooseClick} // Handle Choose button click
        selectedItem={selectedBankRow}
      >
        <input
          type="text"
          placeholder="Search by bank code or bank name"
          value={bankSearchTerm}
          onChange={(e) => setBankSearchTerm(e.target.value)}
          className="mb-4 p-2 border border-stone-300 rounded w-full"
        />
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead className="sticky top-0 bg-stone-200">
              <tr className="bg-stone-200">
                <th className="p-2 border text-start">#</th>
                <th className="p-2 border text-start">Bank Code</th>
                <th className="p-2 border text-start">Bank Name</th>
              </tr>
            </thead>
            <tbody>
              {bankOptions
                ?.filter(
                  (bank) =>
                    bank.BankCode?.toLowerCase().includes(
                      bankSearchTerm.toLowerCase()
                    ) ||
                    bank.BankName?.toLowerCase().includes(
                      bankSearchTerm.toLowerCase()
                    )
                )
                .map((bank, index) => (
                  <tr
                    key={index}
                    className={`cursor-pointer hover:bg-gray-100 ${
                      selectedBankRow === bank ? "bg-yellow-200" : ""
                    }`}
                    onClick={() => handleRowClick(bank)}
                    onDoubleClick={() => handleRowDoubleClick(bank)}
                  >
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">{bank.BankCode}</td>
                    <td className="p-2 border">{bank.BankName}</td>
                  </tr>
                ))}
              {bankOptions.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-stone-500">
                    No banks available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </main>
  );
}
