"use client";

import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import toast from "react-hot-toast";
import FooterMaster from "../_components/FooterMaster";
import ItemMasterHeader from "../_components/ItemMasterHeader";
import Main from "../_components/Main";
import Nav1 from "../_components/Nav1";
import Nav2 from "../_components/Nav2";
import Spinner from "../_components/Spinner";
import WindowControls from "../_components/WindowControls";
import { useTable } from "../_contexts/TableContext";

const ItemMasterData = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    setCurrentPage,
    status,
    setItemsByDateAndFormType,
    setItems,
    setCustomers,
    setUdfs,
    setSeires,
    setSalesEmployees,
    setFreights,
    setWarehouses,
    setTaxRates,
    selectedFromDate,
    selectedToDate,
    paymentsLoading,
    setPaymentsLoading,
    loadingCount,
    setLoadingCount,
    SERVER_ADDRESS,
    setOrderType,
    orderType,
    selectedItem,
    setSelectedItem,
    setSelectedFromDate,
    setDocumentNumber,
    setPayments,
    token,
  } = useTable();

  useEffect(() => {
    localStorage.setItem("pathname", pathname.split("/").join("/"));
    const page = pathname
      .split("/")
      .join("")
      .split("-")
      .join(" ")
      .toLowerCase();

    setCurrentPage(page);

    setOrderType("INP");
  }, [
    pathname,
    setCurrentPage,
    setOrderType,
    setLoadingCount,
    setSelectedFromDate,
  ]);

  const statusMap = {
    Open: "bost_Open",
    Closed: "bost_Close",
    Cancelled: "tYES",
    Delivery: "bost_Delivered",
  };

  const statusParam = statusMap[status] || "bost_Open";

  const formattedFromDate = selectedFromDate
    ? format(new Date(selectedFromDate), "yyyy-MM-dd'T'00:00:00.000")
    : "";
  const formattedToDate = selectedToDate
    ? format(new Date(selectedToDate), "yyyy-MM-dd'T'00:00:00.000")
    : "";

  useEffect(() => {
    const fetchData = async () => {
      window.scrollTo(0, 0);
      if (!orderType) return;
      if (loadingCount === 0) {
        try {
          setPaymentsLoading(true);

          const fetchCustomers = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetCustomers`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load customers");
              const data = await res.json();
              setCustomers(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load vendors.");
            }
          };

          const fetchSeries = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetSeires/${orderType}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load series");
              const data = await res.json();
              console.log(data);
              setSeires(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load series.");
            }
          };

          const fetchPayments = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Payments/GetPaymentList/${orderType}/${statusParam}/${formattedToDate}/${formattedFromDate}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok)
                throw new Error(
                  "Failed to load payments by date and form type"
                );
              const data = await res.json();
              setPayments(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load payments by date and form type.");
            }
          };

          // Run each fetch function independently
          await fetchCustomers();
          await fetchSeries();
          await fetchPayments();
        } catch (error) {
          toast.error("An unexpected error occurred. Please try again.");
        } finally {
          setPaymentsLoading(false);
        }

        setLoadingCount(1);
      }
    };

    fetchData();
  }, [
    status,
    selectedFromDate,
    selectedToDate,
    orderType,
    setItemsByDateAndFormType,
    setCustomers,
    setItems,
    setWarehouses,
    setSalesEmployees,
    setFreights,
    setUdfs,
    setTaxRates,
    setLoadingCount,
    loadingCount,
    formattedToDate,
    formattedFromDate,
    statusParam,
    SERVER_ADDRESS,
    setSelectedItem,
    router,
    selectedItem?.docEntry,
    selectedItem?.documentLines,
    selectedItem,
    setSeires,
    setDocumentNumber,
    token,
    setPayments,
    setPaymentsLoading,
  ]);

  return (
    <>
      {paymentsLoading && <Spinner />}
      <WindowControls isMac={true} />
      <Nav1 />
      <Nav2 />
      <div className="min-h-screen text-xs flex flex-col bg-white">
        <Suspense fallback={<Spinner />}>
          <ItemMasterHeader />
          <Main />
          <FooterMaster />
        </Suspense>
      </div>
    </>
  );
};

export default ItemMasterData;
