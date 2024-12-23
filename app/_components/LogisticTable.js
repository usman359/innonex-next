import React, { useState } from "react";
import Address from "./Address";

export default function LogisticTable() {
  // States
  const [shipType, setShipType] = useState("");
  const [showAddressBox, setShowAddressBox] = useState(false);
  const [isPickingSheetPrinted, setIsPickingSheetPrinted] = useState(false);
  const [isProcureNonDropShip, setIsProcureNonDropShip] = useState(true);
  const [isApproved, setIsApproved] = useState(true);
  const [isPartialDeliveryAllowed, setIsPartialDeliveryAllowed] =
    useState(true);

  // Handlers
  const handleDotClick = () => {
    setShowAddressBox(true);
  };

  return (
    <>
      <div className="flex justify-between">
        {/* Vertical items */}
        <div className="flex flex-col gap-2">
          {/* To, text area and 3 dots container */}
          <div className="flex gap-2 border-b">
            {/* Label and option box */}
            <div className="flex flex-col">
              <label>Ship To</label>
              <select className="rounded-sm ml-auto w-[8.5rem] outline-none focus:bg-yellow-200 border border-gray-400"></select>
            </div>
            {/* Text area */}
            <textarea
              rows="4"
              className="rounded-sm resize-none w-1/2 outline-none focus:bg-yellow-200 border border-gray-400"
            />
            {/* 3 dots container */}
            <div className="flex items-end">
              <button
                onClick={handleDotClick}
                className="bg-yellow-300 h-4 w-4 flex items-center justify-center px-3 border border-black"
              >
                ...
              </button>
            </div>
          </div>
          {/* To, text area and 3 dots container */}
          <div className="flex gap-2 border-b">
            {/* Label and option box */}
            <div className="flex flex-col">
              <label>Bill To</label>
              <select className="rounded-sm ml-auto w-[8.5rem] outline-none focus:bg-yellow-200 border border-gray-400"></select>
            </div>
            {/* Text area */}
            <textarea
              rows="4"
              className="rounded-sm resize-none w-1/2 outline-none focus:bg-yellow-200 border border-gray-400"
            />
            {/* 3 dots container */}
            <div className="flex items-end">
              <button
                onClick={handleDotClick}
                className="bg-yellow-300 h-4 w-4 flex items-center justify-center px-3 border border-black"
              >
                ...
              </button>
            </div>
          </div>
          {/* Shipping type text and option container */}
          <div className="flex gap-2 border-b relative">
            {/* Label and option box */}
            {/* Label text */}
            <label>Shipping Text</label>
            {/* Select box */}
            <select
              onChange={(e) => setShipType(e.target.value)}
              value={shipType}
              className="absolute right-[2.1rem] rounded-sm ml-auto w-[9.3rem] outline-none focus:bg-yellow-200 border border-gray-400"
            >
              <option value="primary"></option>
              <option value="manual">AKA Own Tpt</option>
              <option value="manual">CMA</option>
              <option value="manual">FUG</option>
              <option value="manual">RHK</option>
              <option value="manual">SKB</option>
              <option value="manual">Define New</option>
            </select>
          </div>
        </div>

        {/* Second box */}
        <div className="flex flex-col gap-1">
          {/* Checkbox and text container */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={isPickingSheetPrinted}
              onChange={(e) => setIsPickingSheetPrinted(e.target.checked)}
            />
            <label>Print Picking Sheet</label>
          </div>
          {/* Checkbox and text container */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isProcureNonDropShip}
              onChange={(e) => setIsProcureNonDropShip(e.target.checked)}
            />
            <label>Procure Non Drop-Ship Items</label>
          </div>
          {/* Checkbox and text container */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isApproved}
              onChange={(e) => setIsApproved(e.target.checked)}
            />
            <label>Approved</label>
          </div>
          {/* Checkbox and text container */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={isPartialDeliveryAllowed}
              onChange={(e) => setIsPartialDeliveryAllowed(e.target.checked)}
            />
            <label>Allow Partial Delivery</label>
          </div>

          {/* Label and input/option container */}
          <div className="flex gap-2 items-center border-b">
            <label className="w-[9rem]">Pick and Pack Remarks</label>
            <input
              type="text"
              className="rounded-sm outline-none focus:bg-yellow-200 border border-gray-400"
            />
          </div>
          {/* Label and input/option container */}
          <div className="flex gap-2 items-center border-b">
            <label className="w-[9rem]">BP Channel Name</label>
            <input
              type="text"
              className="rounded-sm outline-none focus:bg-yellow-200 border border-gray-400"
            />
          </div>
          {/* Label and input/option container */}
          <div className="flex gap-2 items-center border-b">
            <label className="w-[9rem]">BP Channel Contact</label>
            <select className="rounded-sm ml-auto w-[8.5rem] outline-none focus:bg-yellow-200 border border-gray-400"></select>
          </div>
        </div>
      </div>

      {/* Address Box */}
      {showAddressBox && <Address setShowAddressBox={setShowAddressBox} />}
    </>
  );
}
