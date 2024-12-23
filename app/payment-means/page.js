"use client";

import PMFooter from "../_components/PMFooter";
import PMHeader from "../_components/PMHeader";
import PMMain from "../_components/PMMain";
import Spinner from "../_components/Spinner";
import WindowControls from "../_components/WindowControls";
import { useTable } from "../_contexts/TableContext";

const PaymentMeans = () => {
  const { salesLoading } = useTable();
  return (
    <>
      {salesLoading && <Spinner />}
      <WindowControls isMac={true} />
      <div className="min-h-screen text-xs flex flex-col bg-white justify-between">
        <PMHeader />
        <PMMain />
        <PMFooter />
      </div>
    </>
  );
};

export default PaymentMeans;
