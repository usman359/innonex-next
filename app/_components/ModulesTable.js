import React, { useState } from "react";
import { modules } from "../_data/modules";
import { useRouter } from "next/navigation";
import { useTable } from "../_contexts/TableContext";
import Spinner from "./Spinner";

export default function ModulesTable() {
  // States
  const [openModule, setOpenModule] = useState(null);
  const router = useRouter();
  const { menuLoading, setMenuLoading } = useTable();

  const salesRoutes = {
    // "Sales Blanket Agreement": "sales-blanket-agreement",
    "Sales Quotation": "sales-quotation",
    "Sales Order": "sales-order",
    Delivery: "delivery",
    "Return Request": "return-request",
    Return: "return",
    "A/R Down Payment Request": "ar-down-payment-request",
    "A/R Invoice": "ar-invoice",
    "A/R Credit Memo": "ar-credit-memo",
    // "A/R Invoice + Payment": "ar-invoice-payment",
    // "A/R Reserve Invoice": "ar-reserve-invoice",
    // "Document Generation Wizard": "document-generation-wizard",
    // "Recurring Transactions": "recurring-transactions",
    // "Recurring Transaction Templates": "recurring-transaction-templates",
    // "Document Printing": "document-printing",
    // "Dunning Wizard": "dunning-wizard",
    // "Gross Profit Recalculation Wizard": "gross-profit-recalculation-wizard",
    // "Sales Report": "sales-report",
  };

  const purchaseRoutes = {
    // "Purchase Blanket Agreement": "purchase-blanket-agreement",
    "Purchase Request": "purchase-request",
    "Purchase Quotation": "purchase-quotation",
    "Purchase Order": "purchase-order",
    "Goods Receipt PO": "goods-receipt-po",
    // "Goods Return Request": "goods-return-request",
    "Goods Return": "goods-return",
    "A/P Down Payment Request": "ap-down-payment-request",
    // "A/P Down Payment Invoice": "ap-down-payment-invoice",
    "A/P Invoice": "ap-invoice",
    "A/P Credit Memo": "ap-credit-memo",
    // "A/P Reserve Invoice": "ap-reserve-invoice",
    // "Recurring Transactions": "recurring-transactions",
    // "Recurring Transactions Templates": "recurring-transactions-templates",
    // "Landed Costs": "landed-costs",
    // "Procurement Confirmation Wizard": "procurement-confirmation-wizard",
    // "Purchase Quotation Generation Wizard":
    // "purchase-quotation-generation-wizard",
    // "Document Printing": "document-printing",
    // "Purchasing Reports": "purchasing-reports",
  };

  const bankingRoutes = {
    "Incoming Payments": "incoming-payments",
    "Outgoing Payments": "outgoing-payments",
  };

  const businessRoutes = {
    "Business Partner Master Data": "business-partner-master-data",
  };

  const inventoryRoutes = {
    "Item Master Data": "item-master-data",
  };

  const handleSubitemClick = (subitem) => {
    setMenuLoading(true); // Set loading to true before navigating
    const route =
      salesRoutes[subitem] ||
      purchaseRoutes[subitem] ||
      bankingRoutes[subitem] ||
      businessRoutes[subitem] ||
      inventoryRoutes[subitem];

    console.log(route);

    if (route) {
      console.log(route);
      router.push(`/${route}`);
      setMenuLoading(false);
    } else {
      setMenuLoading(false); // Turn off loading if no route is found
    }
  };

  return (
    <>
      {/* Module items */}
      {modules.map((item, index) => (
        <React.Fragment key={index}>
          {menuLoading && <Spinner />}
          <div
            className="border-b border-stone-200 py-1 px-2 last:border-none bg-stone-100 cursor-pointer hover:bg-yellow-400"
            onClick={() => {
              if (item.subitems)
                setOpenModule(openModule === index ? null : index);
            }}
          >
            {item.label}
          </div>

          {item.label && item.subitems && openModule === index && (
            <div className="bg-stone-100">
              {/* Subitems */}
              {item.subitems.map((subitem, subIndex) => (
                <div
                  key={subIndex}
                  className="border-b ml-12 border-stone-200 p-1 last:border-none cursor-pointer hover:bg-yellow-400"
                  onClick={() => handleSubitemClick(subitem)}
                >
                  {subitem}
                </div>
              ))}
            </div>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
