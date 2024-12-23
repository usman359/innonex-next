import React, { useState } from "react";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";

export default function AccountingTable() {
  // States
  const [paymentTerms, setPaymentTerms] = useState("");
  const [indicator, setIndicator] = useState("");

  const paymentTermOptions = [
    { value: "", label: "" },
    { value: "cash-basic", label: "Cash Basic" },
    { value: "define-new", label: "Define New" },
  ];

  const indictorOptions = [
    { value: "", label: "" },
    { value: "define-new", label: "Define New" },
  ];

  return (
    <div className="flex justify-between">
      {/* Box 1 */}
      <div className="flex flex-col gap-1">
        <div className="mb-8">
          <FormInput label="Jounal Remark" />
        </div>

        <FormSelect
          label="Payment Terms"
          onChange={(e) => setPaymentTerms(e.target.value)}
          value={paymentTerms}
          options={paymentTermOptions}
        />

        <FormSelect label="Payment Method" />

        <FormSelect label="Central Bank Ind." />

        {/* Label and input/option container */}
        <div className="flex flex-col">
          {/* Text */}
          <label>Manually Recalculate Due Date:</label>
          {/* Option/input container */}
          <div className="flex">
            <select className="rounded-sm w-[7.5rem] outline-none focus:bg-yellow-200 border border-gray-400">
              <option value="primary">Local Currency</option>
              <option value="manual">Manual</option>
            </select>
            <input
              type="text"
              className="rounded-sm mr-1 w-10 outline-none focus:bg-yellow-200 border border-gray-400"
            />
            {/* Months text */}
            <span>Months</span>
            {/* Plus text */}
            <span>+</span>
            <input
              type="text"
              defaultValue={0}
              className="rounded-sm mr-1 w-10 outline-none focus:bg-yellow-200 border border-gray-400"
            />
            <span>Days</span>
          </div>
        </div>
      </div>

      {/* Second box */}
      <div className="flex flex-col gap-1">
        <FormInput label="BP Project" />

        <FormInput label="Create QR Code From" />

        <FormInput label="Cancellation Date" />

        <FormInput label="Required Date" />

        <FormSelect
          label="Indicator"
          onChange={(e) => setIndicator(e.target.value)}
          value={indicator}
          options={indictorOptions}
        />

        <FormInput label="Federal Tax ID" />

        <FormInput label="Order Number" />

        {/* Label and input/option container */}
        <div className="flex gap-2 items-center border-b mb-4">
          <label className="w-[9rem]">Referred Document</label>
          {/* 3 dots container */}
          <div className="flex items-end">
            <button className="bg-yellow-300 h-4 w-4 flex items-center justify-center px-3 border border-black">
              ...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
