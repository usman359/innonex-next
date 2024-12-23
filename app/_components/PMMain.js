import { useTable } from "../_contexts/TableContext";
import BankTransferTable from "./BankTransferTable";
import CashTable from "./CashTable";
import CheckTable from "./CheckTable";

export default function PMMain() {
  const {
    check,
    setCheck,
    bankTransfer,
    setBankTransfer,
    cash,
    setCash,
    cashTotal,
    glAccount,
    transferAccount,
    transferSum,
    transferDate,
    transferReference,
    paymentChecks,
    isAddMode,
  } = useTable();

  // Handlers
  const handleClick = (val) => {
    if (val === "content") {
      setContent(true);
      setLogistic(false);
      setAccounting(false);
      setAttachment(false);
    }
    if (val === "logistic") {
      setLogistic(true);
      setContent(false);
      setAccounting(false);
      setAttachment(false);
    }
    if (val === "accounting") {
      setAccounting(true);
      setContent(false);
      setLogistic(false);
      setAttachment(false);
    }
    if (val === "attachment") {
      setAttachment(true);
      setContent(false);
      setLogistic(false);
      setAccounting(false);
    }

    if (val === "check") {
      setCheck(true);
      setBankTransfer(false);
      setCash(false);
    }
    if (val === "bankTransfer") {
      setBankTransfer(true);
      setCheck(false);
      setCash(false);
    }
    if (val === "cash") {
      setCash(true);
      setCheck(false);
      setBankTransfer(false);
    }
  };

  // Determine if each tab should be disabled
  const isCheckDisabled = !isAddMode && paymentChecks.length === 0;
  const isBankTransferDisabled =
    !isAddMode &&
    (transferSum === null ||
      transferAccount === null ||
      transferDate === null ||
      transferReference === null);
  const isCashDisabled =
    !isAddMode && (cashTotal === null || glAccount === null);

  return (
    <main className="px-4">
      <header className="grid grid-cols-4 cursor-pointer mb-4">
        <span
          className={`border-black text-center ${
            check ? "bg-stone-100 border-t" : "bg-stone-300 border"
          } ${
            isCheckDisabled && !isAddMode
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
          onClick={!isCheckDisabled ? () => handleClick("check") : undefined}
        >
          Check
        </span>
        <span
          className={`border-black text-center ${
            bankTransfer ? "bg-stone-100 border-t" : "bg-stone-300 border"
          } ${
            isBankTransferDisabled && !isAddMode
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
          onClick={
            !isBankTransferDisabled
              ? () => handleClick("bankTransfer")
              : undefined
          }
        >
          Bank Transfer
        </span>
        <span
          className={`border-black text-center ${
            cash ? "bg-stone-100 border-t" : "bg-stone-300 border"
          } ${
            isCashDisabled && !isAddMode
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
          onClick={!isCashDisabled ? () => handleClick("cash") : undefined}
        >
          Cash
        </span>
      </header>
      {/* Main content container */}
      <div className="min-h-[18rem] border border-stone-300 p-4">
        <>
          {check && <CheckTable />}
          {bankTransfer && <BankTransferTable />}
          {cash && <CashTable />}
        </>
      </div>
    </main>
  );
}
