import React from "react";
import { useRouter } from "next/navigation";
import Dropdown from "./Dropdown";
import { useTable } from "../_contexts/TableContext";

export default function Nav1() {
  const router = useRouter();
  const { resetItemData } = useTable();

  const menuItems = [
    {
      label: "File",
      menuItems: [
        { label: "Close" },
        { label: "Save as Draft", disabled: true },
        { label: "Page Setup..." },
        { label: "Preview..." },
        {
          label: "Print",
          subMenu: [{ label: "Print..." }],
        },
        {
          label: "Lock",
          onClick: () => {
            // localStorage.removeItem("isLogin");
            router.push("/login");
          },
        },
      ],
    },
    {
      label: "Edit",
      menuItems: [
        { label: "Undo", disabled: true },
        { label: "Redo", disabled: true },
        { label: "Cut", disabled: true },
        { label: "Copy", disabled: true },
        { label: "Paste", disabled: true },
      ],
    },
    {
      label: "View",
      menuItems: [
        { label: "User-Defined Fields" },
        { label: "System Information" },
      ],
    },
    {
      label: "Modules",
      menuItems: [
        {
          label: "Sales - A/R",
          subMenu: [
            {
              label: "Sales Quotation",
              onClick: () => {
                // window.location.href = "/sales-quotation";
                resetItemData();
                router.push("/sales-quotation");
              },
            },
            {
              label: "Sales Order",
              onClick: () => {
                // window.location.href = "/sales-order";
                resetItemData();
                router.push("/sales-order");
              },
            },
            {
              label: "Delivery",
              onClick: () => {
                // window.location.href = "/delivery";
                resetItemData();
                router.push("/delivery");
              },
            },
            {
              label: "Return Request",
              onClick: () => {
                // window.location.href = "/return-request";
                resetItemData();
                router.push("/return-request");
              },
            },
            {
              label: "Return",
              onClick: () => {
                // window.location.href = "/return";
                resetItemData();
                router.push("/return");
              },
            },
            {
              label: "A/R Down Payment Request",
              onClick: () => {
                // window.location.href = "/ar-down-payment-request";
                resetItemData();
                router.push("/ar-down-payment-request");
              },
            },
            {
              label: "A/R Invoice",
              onClick: () => {
                // window.location.href = "/ar-invoice";
                resetItemData();
                router.push("/ar-invoice");
              },
            },
            {
              label: "A/R Credit Memo",
              onClick: () => {
                // window.location.href = "/ar-credit-memo";
                resetItemData();
                router.push("/ar-credit-memo");
              },
            },
          ],
        },
        {
          label: "Purchasing - A/P",
          subMenu: [
            {
              label: "Purchase Request",
              onClick: () => {
                // window.location.href = "/purchase-request";
                resetItemData();
                router.push("/purchase-request");
              },
            },
            {
              label: "Purchase Quotation",
              onClick: () => {
                // window.location.href = "/purchase-quotation";
                resetItemData();
                router.push("/purchase-quotation");
              },
            },
            {
              label: "Purchase Order",
              onClick: () => {
                // window.location.href = "/purchase-order";
                resetItemData();
                router.push("/purchase-order");
              },
            },
            {
              label: "Goods Receipt PO",
              onClick: () => {
                // window.location.href = "/goods-receipt-po";
                resetItemData();
                router.push("/goods-receipt-po");
              },
            },
            {
              label: "Goods Return",
              onClick: () => {
                // window.location.href = "/goods-return";
                resetItemData();
                router.push("/goods-return");
              },
            },
            // {
            //   label: "A/P Down Payment Request",
            //   onClick: () => {
            //     resetItemData();
            //     router.push("/ap-down-payment-request");
            //   },
            // },
            {
              label: "A/P Invoice",
              onClick: () => {
                // window.location.href = "/ap-invoice";
                resetItemData();
                router.push("/ap-invoice");
              },
            },
            {
              label: "A/P Credit Memo",
              onClick: () => {
                // window.location.href = "/ap-credit-memo";
                resetItemData();
                router.push("/ap-credit-memo");
              },
            },
          ],
        },
        {
          label: "Banking",
          subMenu: [
            {
              label: "Incoming Payments",
              onClick: () => {
                // window.location.href = "/incoming-payments";
                resetItemData();
                router.push("/incoming-payments");
              },
            },
            {
              label: "Outgoing Payments",
              onClick: () => {
                // window.location.href = "/incoming-payments";
                resetItemData();
                router.push("/outgoing-payments");
              },
            },
          ],
        },
        {
          label: "Business Partners",
          subMenu: [
            {
              label: "Business Partner Master Data",
              onClick: () => {
                resetItemData();
                router.push("/business-partner-master-data");
              },
            },
          ],
        },
        {
          label: "Inventory",
          subMenu: [
            {
              label: "Item Master Data",
              onClick: () => {
                resetItemData();
                router.push("/item-master-data");
              },
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 bg-stone-400 bg-gradient-to-b from-stone-200 to-stone-400 px-4 text-sm py-1 border-b-4 border-yellow-500 cursor-default">
      {menuItems.map((menuItem) => (
        <Dropdown
          key={menuItem.label}
          label={menuItem.label}
          menuItems={menuItem.menuItems}
        />
      ))}
    </div>
  );
}
