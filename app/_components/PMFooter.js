import { useEffect, useState } from "react";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { useTable } from "../_contexts/TableContext";
import Input from "./Input";
import Spinner from "./Spinner";

const PMFooter = () => {
  const {
    owner,
    isDocNumManuallyEntered,
    postingDocument,
    updatingDocument,
    status,
    isItemDescriptionIconVisible,
    check,
    bankTransfer,
    cash,
    setIsPaymentMeansModalOpen,
    cashTotal,
    bankTotal,
    total,
    bankCharge,
  } = useTable();

  // Local States
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [paid, setPaid] = useState(null);

  useEffect(() => {
    const cashSum = parseFloat(cashTotal) || 0;
    const transferSum = parseFloat(bankTotal) || 0;

    setPaid(cashSum + transferSum);
  }, [cash, bankTransfer, check, cashTotal, bankTotal]);

  const handleClickCancel = () => {
    console.log("Clicked cancel");
  };

  return (
    <>
      {(postingDocument || updatingDocument) && <Spinner />}
      <footer className="flex flex-col sm:flex-row items-end justify-between px-4 my-4 sm:my-0">
        <div className="flex flex-col gap-0.5 sm:mt-2">
          <Input
            label="Overall Amount"
            value={`PKR ${Number(total)?.toFixed(4)}`}
            readOnly={isDocNumManuallyEntered || status !== "Open"}
            isEditable={isDocNumManuallyEntered}
            status={status}
          />

          <Input
            label="Balance Due"
            value={`PKR ${Number(total)?.toFixed(4)}`}
            readOnly={isDocNumManuallyEntered || status !== "Open"}
            isEditable={isDocNumManuallyEntered}
            status={status}
          />

          <Input
            label="Bank Charge"
            value={`PKR ${Number(bankCharge)?.toFixed(4)}` || ""}
            onChange={() => {}}
            readOnly={isDocNumManuallyEntered || status !== "Open"} // Disable when status is not 'Open'}
            isEditable={isDocNumManuallyEntered}
            icon={
              status === "Open" &&
              isItemDescriptionIconVisible && (
                <HiAdjustmentsHorizontal className="text-stone-500" />
              )
            }
            onIconClick={() => setIsOwnerModalOpen(true)}
            status={status}
          />

          <div className="flex items-center gap-2 my-4">
            <button
              onClick={() => setIsPaymentMeansModalOpen(false)}
              className="bg-yellow-200 px-2 border border-stone-400"
            >
              OK
            </button>
            <button
              onClick={handleClickCancel}
              className="bg-yellow-200 px-2 border border-stone-400"
            >
              Cancel
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 sm:mt-2">
          <Input
            label="Paid"
            type="text"
            value={`PKR ${Number(total)?.toFixed(4)}`}
            readOnly={isDocNumManuallyEntered || status !== "Open"} // Disable when status is not 'Open'}
            isEditable={isDocNumManuallyEntered}
            className={isDocNumManuallyEntered ? "bg-yellow-200" : ""}
            status={status}
          />
        </div>
      </footer>
    </>
  );
};

export default PMFooter;
