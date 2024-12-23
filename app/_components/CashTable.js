import { useEffect, useState } from "react";
import { useTable } from "../_contexts/TableContext";
import Input from "./Input";
import Modal from "./Modal";

export default function CashTable() {
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [selectedCashRow, setSelectedCashRow] = useState(null);
  const [cashSearchTerm, setCashSearchTerm] = useState("");

  const {
    glAccount,
    setGlAccount,
    status,
    isDocNumManuallyEntered,
    bankOptions,
    cashTotal,
    setCashTotal,
    SERVER_ADDRESS,
    setCashOptions,
    cashOptions,
  } = useTable();

  const handleModalClose = () => {
    setCashModalOpen(false); // Close modal on button click or overlay click
  };

  const handleRowClick = (row) => {
    setSelectedCashRow(row);
  };

  const handleRowDoubleClick = (row) => {
    handleBankSelection(row);
  };

  const handleBankSelection = (bank) => {
    setGlAccount(bank.BankName);
    setCashModalOpen(false); // Close modal after selection
  };

  const handleChooseClick = () => {
    if (selectedCashRow) {
      handleBankSelection(selectedCashRow);
      setCashModalOpen(false);
    }
  };

  const reopenBankModal = () => {
    setCashModalOpen(true); // Reopen modal when button is clicked
  };

  const fetchCashOptions = async () => {
    try {
      const response = await fetch(`${SERVER_ADDRESS}api/Common/GetBanks/cash`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setCashOptions(data);
      }
    } catch (error) {
      console.error("Error fetching bank data:", error);
    }
  };

  useEffect(() => {
    fetchCashOptions();
  }, []);

  return (
    <main className="relative overflow-x-auto">
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          label="G/L Account"
          value={glAccount || ""}
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

      <div className="mt-36 flex justify-end">
        <Input
          label="Total"
          value={cashTotal}
          onChange={(e) => setCashTotal(e.target.value)}
          isEditable={isDocNumManuallyEntered}
          status={status}
        />
      </div>

      {/* Bank Selection Modal */}
      <Modal
        isOpen={cashModalOpen}
        onClose={handleModalClose} // Ensure state resets on moda close
        title="Select an Account"
        onChoose={handleChooseClick} // Handle Choose button click
        selectedItem={selectedCashRow}
      >
        <input
          type="text"
          placeholder="Search by bank code or bank name"
          value={cashSearchTerm}
          onChange={(e) => setCashSearchTerm(e.target.value)}
          className="mb-4 p-2 border border-stone-300 rounded w-full"
        />
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead className="sticky top-0 bg-stone-200">
              <tr className="bg-stone-200">
                <th className="p-2 border text-start">#</th>
                <th className="p-2 border text-start">Account Code</th>
                <th className="p-2 border text-start">Account Name</th>
              </tr>
            </thead>
            <tbody>
              {cashOptions
                ?.filter(
                  (bank) =>
                    bank.BankCode.toLowerCase().includes(
                      cashSearchTerm.toLowerCase()
                    ) ||
                    bank.BankName.toLowerCase().includes(
                      cashSearchTerm.toLowerCase()
                    )
                )
                .map((bank, index) => (
                  <tr
                    key={index}
                    className={`cursor-pointer hover:bg-gray-100 ${
                      selectedCashRow === bank ? "bg-yellow-200" : ""
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
