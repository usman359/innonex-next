import { usePathname } from "next/navigation";
import { useState } from "react";
import BankTransferTable from "./BankTransferTable";
import CashTable from "./CashTable";
import CheckTable from "./CheckTable";
import ContentTable from "./ContentTable";
import AttachmentTable from "./AttachmentTable";
import AccountingTable from "./AccountingTable";
import LogisticTable from "./LogisticTable";
import { useTable } from "../_contexts/TableContext";
import IPContentTable from "./IPContentTable";
import OPContentTable from "./OPContentTable";
import General from "./General";
import GeneralItemMasterData from "./GeneralItemMasterData";

export default function Main() {
  const {
    check,
    setCheck,
    bankTransfer,
    setBankTransfer,
    cash,
    setCash,
    general,
    setGeneral,
    generalItemMasterData,
    setGeneralItemMasterData,
    paymentTerms,
    setPaymentTerms,
    paymentRun,
    setPaymentRun,
    remarksTab,
    setRemarksTab,
  } = useTable();
  const pathname = usePathname();

  // States
  const [content, setContent] = useState(true);
  const [logistic, setLogistic] = useState(false);
  const [accounting, setAccounting] = useState(false);
  const [attachment, setAttachment] = useState(false);

  const isIncomingPayments = pathname === "/incoming-payments";
  const isOutgoingPayments = pathname === "/outgoing-payments";
  const isPaymentMeans = pathname === "/payment-means";
  const isBPMasterData = pathname === "/business-partner-master-data";
  const isItemMasterData = pathname === "/item-master-data";

  // Handlers
  const handleClick = (val) => {
    setContent(val === "content");
    setLogistic(val === "logistic");
    setAccounting(val === "accounting");
    setAttachment(val === "attachment");
    setCheck(val === "check");
    setBankTransfer(val === "bankTransfer");
    setCash(val === "cash");
    setGeneral(val === "general");
    setGeneralItemMasterData(val === "generalItemMasterData");
  };

  return (
    <main
      className={`px-4 ${
        pathname === "/business-partner-master-data" ||
        pathname === "/item-master-data"
          ? "mt-12"
          : "mt-0"
      }`}
    >
      {/* Tab Container */}
      <header className="grid grid-cols-4 cursor-pointer mb-4">
        {isItemMasterData ? (
          <>
            <span
              className={`border-black text-center ${
                generalItemMasterData
                  ? "bg-stone-100 border-t"
                  : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("generalItemMasterData")}
            >
              General
            </span>
            <span
              className={`border-black text-center ${
                paymentTerms ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("paymentTerms")}
            >
              Payment Terms
            </span>
            <span
              className={`border-black text-center ${
                paymentRun ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("paymentRun")}
            >
              Payment Run
            </span>
            <span
              className={`border-black text-center ${
                accounting ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("accounting")}
            >
              Accounting
            </span>
            <span
              className={`border-black text-center ${
                remarksTab ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("remarksTab")}
            >
              Remarks
            </span>
          </>
        ) : isPaymentMeans ? (
          <>
            <span
              className={`border-black text-center ${
                check ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("check")}
            >
              Check
            </span>
            <span
              className={`border-black text-center ${
                bankTransfer ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("bankTransfer")}
            >
              Bank Transfer
            </span>
            <span
              className={`border-black text-center ${
                cash ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("cash")}
            >
              Cash
            </span>
          </>
        ) : isBPMasterData ? (
          <>
            <span
              className={`border-black text-center ${
                general ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("general")}
            >
              General
            </span>
            <span
              className={`border-black text-center ${
                paymentTerms ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("paymentTerms")}
            >
              Payment Terms
            </span>
            <span
              className={`border-black text-center ${
                paymentRun ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("paymentRun")}
            >
              Payment Run
            </span>
            <span
              className={`border-black text-center ${
                accounting ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("accounting")}
            >
              Accounting
            </span>
            <span
              className={`border-black text-center ${
                remarksTab ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("remarksTab")}
            >
              Remarks
            </span>
          </>
        ) : (
          <>
            <span
              className={`border-black text-center ${
                content ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("content")}
            >
              Contents
            </span>
            {!isIncomingPayments && (
              <span
                className={`border-black text-center ${
                  logistic ? "bg-stone-100 border-t" : "bg-stone-300 border"
                }`}
                onClick={() => handleClick("logistic")}
              >
                Logistics
              </span>
            )}
            {!isIncomingPayments && (
              <span
                className={`border-black text-center ${
                  accounting ? "bg-stone-100 border-t" : "bg-stone-300 border"
                }`}
                onClick={() => handleClick("accounting")}
              >
                Accounting
              </span>
            )}
            <span
              className={`border-black text-center ${
                attachment ? "bg-stone-100 border-t" : "bg-stone-300 border"
              }`}
              onClick={() => handleClick("attachment")}
            >
              Attachments
            </span>
          </>
        )}
      </header>

      {/* Main Content */}
      <div className="min-h-[18rem] border border-stone-300 p-4">
        {isIncomingPayments && (
          <>
            {content && <IPContentTable />}
            {attachment && <AttachmentTable />}
          </>
        )}

        {isOutgoingPayments && (
          <>
            {content && <OPContentTable />}
            {attachment && <AttachmentTable />}
          </>
        )}

        {isPaymentMeans && (
          <>
            {check && <CheckTable />}
            {bankTransfer && <BankTransferTable />}
            {cash && <CashTable />}
          </>
        )}

        {isItemMasterData && (
          <>{generalItemMasterData && <GeneralItemMasterData />}</>
        )}

        {isBPMasterData && (
          <>
            {general && <General />}
            {/* {bankTransfer && <BankTransferTable />}
            {cash && <CashTable />} */}
          </>
        )}

        {!isIncomingPayments &&
          !isOutgoingPayments &&
          !isPaymentMeans &&
          !isBPMasterData &&
          !isItemMasterData && (
            <>
              {content && <ContentTable />}
              {logistic && <LogisticTable />}
              {accounting && <AccountingTable />}
              {attachment && <AttachmentTable />}
            </>
          )}
      </div>
    </main>
  );
}
