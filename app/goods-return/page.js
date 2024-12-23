"use client";

import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Footer from "../_components/Footer";
import Header from "../_components/Header";
import Main from "../_components/Main";
import Nav1 from "../_components/Nav1";
import Nav2 from "../_components/Nav2";
import Spinner from "../_components/Spinner";
import { useTable } from "../_contexts/TableContext";
import WindowControls from "../_components/WindowControls";

const GoodsReturn = () => {
  const newSeries = useRef(null);
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
    salesLoading,
    setSalesLoading,
    loadingCount,
    setLoadingCount,
    SERVER_ADDRESS,
    setOrderType,
    orderType,
    selectedItem,
    setSelectedItem,
    setSelectedFromDate,
    setIsAddMode,
    setCurrentDocumentIndex,
    setSeries,
    series,
    setDocumentNumber,
    token,
    itemsByDateAndFormType,
    selectedSeriesIndex,
    copyToTriggered,
    setCopyToTriggered,
    copyToFrom,
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

    setOrderType("PRN");

    setLoadingCount(0);
  }, [
    setCurrentPage,
    pathname,
    setOrderType,
    selectedFromDate,
    setSelectedFromDate,
    setLoadingCount,
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
          setSalesLoading(true);

          const fetchVendors = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetVendors`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load vendors");
              const data = await res.json();
              // console.log(data);
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
              setSeires(data);
              newSeries.current =
                selectedSeriesIndex >= 0 && data[selectedSeriesIndex]?.series;
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load series.");
            }
          };

          const fetchUdfs = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetAllUDFs/ORDR/RDR1`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load UDFs");
              const data = await res.json();
              setUdfs(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load UDFs.");
            }
          };

          const fetchItems = async () => {
            try {
              const res = await fetch(`${SERVER_ADDRESS}api/Common/GetItems`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) throw new Error("Failed to load items");
              const data = await res.json();
              setItems(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load items.");
            }
          };

          const fetchWarehouses = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetAllWarehouse`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load warehouses");
              const data = await res.json();
              setWarehouses(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load warehouses.");
            }
          };

          const fetchTaxRate = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetTaxRate`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load tax rate");
              const data = await res.json();
              setTaxRates(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load tax rate.");
            }
          };

          const fetchSalesEmployee = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetAllSaleEmployee`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load sales employees");
              const data = await res.json();
              setSalesEmployees(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load sales employees.");
            }
          };

          const fetchFreights = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetFreights`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load freights");
              const data = await res.json();
              setFreights(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load freights.");
            }
          };

          const fetchItemsByDateAndFormType = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Marketing/GetDocuments/${orderType}/${statusParam}/${formattedToDate}/${formattedFromDate}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (!res.ok)
                throw new Error("Failed to load items by date and form type");
              const data = await res.json();
              setItemsByDateAndFormType(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load items by date and form type.");
            }
          };

          // Run each fetch function independently
          await fetchVendors();
          await fetchSeries();
          await fetchUdfs();
          await fetchItems();
          await fetchWarehouses();
          await fetchTaxRate();
          await fetchSalesEmployee();
          await fetchFreights();
          await fetchItemsByDateAndFormType();

          if (copyToTriggered) {
            const firstItem = itemsByDateAndFormType[0] || [{}];
            const latestDocNum = firstItem.docNum
              ? Number(firstItem.docNum) + 1
              : 1;

            setDocumentNumber(latestDocNum);

            console.log(selectedItem);
            if (selectedItem) {
              let newBaseType;
              if (copyToFrom === "goods receipt po") newBaseType = 20;

              const updatedDocumentLines = selectedItem.documentLines.map(
                (line, index) => ({
                  ...line,
                  baseType: newBaseType,
                  baseEntry: selectedItem.docEntry,
                  baseLine: index,
                })
              );

              const updatedDocumentAdditionalExpenses =
                selectedItem.documentAdditionalExpenses.map(
                  (expense, index) => ({
                    ...expense,
                    baseDocType: newBaseType,
                    baseDocEntry: selectedItem.docEntry,
                    baseDocLine: index,
                  })
                );

              const updatedData = {
                ...selectedItem,
                docEntry: latestDocNum,
                docNum: latestDocNum.toString(),
                series: newSeries.current,
                documentAdditionalExpenses: updatedDocumentAdditionalExpenses,
                documentLines: updatedDocumentLines,
              };

              console.log(updatedData);
              setSelectedItem(updatedData);
              setIsAddMode(true);
              setCurrentDocumentIndex(0);
            }

            setCopyToTriggered(false);
          }
        } catch (error) {
          toast.error("An unexpected error occurred. Please try again.");
        } finally {
          setSalesLoading(false);
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
    setSeries,
    setItems,
    setWarehouses,
    setSalesEmployees,
    setFreights,
    setSalesLoading,
    setUdfs,
    setTaxRates,
    setLoadingCount,
    loadingCount,
    formattedToDate,
    formattedFromDate,
    statusParam,
    SERVER_ADDRESS,
    setSelectedItem,
    setIsAddMode,
    setCurrentDocumentIndex,
    router,
    selectedItem?.docEntry,
    selectedItem?.documentLines,
    selectedItem,
    series,
    setDocumentNumber,
    token,
    copyToTriggered,
    selectedSeriesIndex,
    itemsByDateAndFormType,
    setCopyToTriggered,
    copyToFrom,
    setSeires,
  ]);

  return (
    <div className="text-xs h-screen">
      {salesLoading && <Spinner />}
      <WindowControls isMac={true} />
      <Nav1 />
      <Nav2 />
      <div className="bg-white min-h-screen text-xs flex flex-col justify-between">
        <Header />
        <Main />
        <Footer />
      </div>
    </div>
  );
};

export default GoodsReturn;
