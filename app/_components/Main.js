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
import ItemsTable from "./ItemsTable";
import CostsTable from "./CostsTable";

export default function Main() {
  const {
    setCheck,
    setBankTransfer,
    setCash,
    setGeneral,
    setGeneralItemMasterData,
    setPaymentTerms,
    setPaymentRun,
    setRemarksTab,
    setItemsTab,
    setCostsTab,
    setAttachmentsTab,
  } = useTable();

  const pathname = usePathname();

  // Tabs State
  const [activeTab, setActiveTab] = useState("content");

  const isIncomingPayments = pathname === "/incoming-payments";
  const isOutgoingPayments = pathname === "/outgoing-payments";
  const isPaymentMeans = pathname === "/payment-means";
  const isBPMasterData = pathname === "/business-partner-master-data";
  const isItemMasterData = pathname === "/item-master-data";
  const isLandedCosts = pathname === "/landed-costs";

  // Handler for Tab Click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCheck(tab === "check");
    setBankTransfer(tab === "bankTransfer");
    setCash(tab === "cash");
    setGeneral(tab === "general");
    setGeneralItemMasterData(tab === "generalItemMasterData");
    setPaymentTerms(tab === "paymentTerms");
    setPaymentRun(tab === "paymentRun");
    setRemarksTab(tab === "remarksTab");
    setItemsTab(tab === "items");
    setCostsTab(tab === "costs");
    setAttachmentsTab(tab === "attachments");
  };

  return (
    <main
      className={`px-4 ${
        isBPMasterData || isItemMasterData ? "mt-12" : "mt-0"
      }`}
    >
      {/* Tab Navigation */}
      <header className="grid grid-cols-4 gap-2 cursor-pointer mb-4 border-b border-stone-300">
        {isItemMasterData ? (
          <>
            {[
              "generalItemMasterData",
              "paymentTerms",
              "paymentRun",
              "accounting",
              "remarksTab",
            ].map((tab) => (
              <span
                key={tab}
                className={`text-center py-2 ${
                  activeTab === tab
                    ? "bg-stone-100 border-t-2 border-black"
                    : "bg-stone-300"
                }`}
                onClick={() => handleTabClick(tab)}
              >
                {tab.replace(/([A-Z])/g, " $1").trim()}
              </span>
            ))}
          </>
        ) : isPaymentMeans ? (
          <>
            {["check", "bankTransfer", "cash"].map((tab) => (
              <span
                key={tab}
                className={`text-center py-2 ${
                  activeTab === tab
                    ? "bg-stone-100 border-t-2 border-black"
                    : "bg-stone-300"
                }`}
                onClick={() => handleTabClick(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            ))}
          </>
        ) : isBPMasterData ? (
          <>
            {[
              "general",
              "paymentTerms",
              "paymentRun",
              "accounting",
              "remarksTab",
            ].map((tab) => (
              <span
                key={tab}
                className={`text-center py-2 ${
                  activeTab === tab
                    ? "bg-stone-100 border-t-2 border-black"
                    : "bg-stone-300"
                }`}
                onClick={() => handleTabClick(tab)}
              >
                {tab.replace(/([A-Z])/g, " $1").trim()}
              </span>
            ))}
          </>
        ) : isLandedCosts ? (
          <>
            <span
              className={`text-center py-2 ${
                activeTab === "items"
                  ? "bg-stone-100 border-t-2 border-black"
                  : "bg-stone-300"
              }`}
              onClick={() => handleTabClick("items")}
            >
              Items
            </span>
            {!isIncomingPayments && (
              <span
                className={`text-center py-2 ${
                  activeTab === "costs"
                    ? "bg-stone-100 border-t-2 border-black"
                    : "bg-stone-300"
                }`}
                onClick={() => handleTabClick("costs")}
              >
                Costs
              </span>
            )}
            {!isIncomingPayments && (
              <span
                className={`text-center py-2 ${
                  activeTab === "attachments"
                    ? "bg-stone-100 border-t-2 border-black"
                    : "bg-stone-300"
                }`}
                onClick={() => handleTabClick("attachments")}
              >
                Attachments
              </span>
            )}
          </>
        ) : null}
      </header>

      {/* Tab Content */}
      <div className="min-h-[18rem] border border-stone-300 p-4">
        {isIncomingPayments && (
          <>
            {activeTab === "content" && <IPContentTable />}
            {activeTab === "attachment" && <AttachmentTable />}
          </>
        )}

        {isOutgoingPayments && (
          <>
            {activeTab === "content" && <OPContentTable />}
            {activeTab === "attachment" && <AttachmentTable />}
          </>
        )}

        {isPaymentMeans && (
          <>
            {activeTab === "check" && <CheckTable />}
            {activeTab === "bankTransfer" && <BankTransferTable />}
            {activeTab === "cash" && <CashTable />}
          </>
        )}

        {isItemMasterData && (
          <>
            {activeTab === "generalItemMasterData" && <GeneralItemMasterData />}
          </>
        )}

        {isBPMasterData && <>{activeTab === "general" && <General />}</>}

        {isLandedCosts && (
          <>
            {activeTab === "items" && <ItemsTable />}
            {activeTab === "costs" && <CostsTable />}
            {activeTab === "attachments" && <AttachmentTable />}
          </>
        )}

        {!isIncomingPayments &&
          !isOutgoingPayments &&
          !isPaymentMeans &&
          !isBPMasterData &&
          !isItemMasterData && (
            <>
              {activeTab === "content" && <ContentTable />}
              {activeTab === "logistic" && <LogisticTable />}
              {activeTab === "accounting" && <AccountingTable />}
              {activeTab === "attachment" && <AttachmentTable />}
            </>
          )}
      </div>
    </main>
  );
}
