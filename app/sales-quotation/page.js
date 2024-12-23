"use client";

import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Footer from "../_components/Footer";
import Header from "../_components/Header";
import Main from "../_components/Main";
import Nav1 from "../_components/Nav1";
import Nav2 from "../_components/Nav2";
import Spinner from "../_components/Spinner";
import { useTable } from "../_contexts/TableContext";
import WindowControls from "../_components/WindowControls";

const SalesQuotation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    setCurrentPage,
    status,
    token,
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
    orderType,
    setOrderType,
    setSelectedFromDate,
    setDocumentNumber,
  } = useTable();

  const getToken = () => {
    return localStorage.getItem("token") || token;
  };

  useEffect(() => {
    localStorage.setItem("pathname", pathname.split("/").join("/"));
    const page = pathname
      .split("/")
      .join("")
      .split("-")
      .join(" ")
      .toLowerCase();

    setCurrentPage(page);

    setOrderType("SQ");

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

          const fetchCustomers = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetCustomers`,
                {
                  headers: { Authorization: `Bearer ${getToken()}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load customers");
              const data = await res.json();
              setCustomers(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load customers.");
              router.push("/login");
            }
          };

          const fetchSeries = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetSeires/${orderType}`,
                {
                  headers: { Authorization: `Bearer ${getToken()}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load series");
              const data = await res.json();
              setSeires(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load series.");
              router.push("/login");
            }
          };

          const fetchUdfs = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetAllUDFs/ORDR/RDR1`,
                {
                  headers: { Authorization: `Bearer ${getToken()}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load UDFs");
              const data = await res.json();
              setUdfs(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load UDFs.");
              router.push("/login");
            }
          };

          const fetchItems = async () => {
            try {
              const res = await fetch(`${SERVER_ADDRESS}api/Common/GetItems`, {
                headers: { Authorization: `Bearer ${getToken()}` },
              });
              if (!res.ok) throw new Error("Failed to load items");
              const data = await res.json();
              setItems(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load items.");
              router.push("/login");
            }
          };

          const fetchWarehouses = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetAllWarehouse`,
                {
                  headers: { Authorization: `Bearer ${getToken()}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load warehouses");
              const data = await res.json();
              setWarehouses(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load warehouses.");
              router.push("/login");
            }
          };

          const fetchTaxRate = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetTaxRate`,
                {
                  headers: { Authorization: `Bearer ${getToken()}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load tax rate");
              const data = await res.json();
              console.log(data);
              setTaxRates(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load tax rate.");
              router.push("/login");
            }
          };

          const fetchSalesEmployee = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetAllSaleEmployee`,
                {
                  headers: { Authorization: `Bearer ${getToken()}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load sales employees");
              const data = await res.json();
              setSalesEmployees(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load sales employees.");
              router.push("/login");
            }
          };

          const fetchFreights = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Common/GetFreights`,
                {
                  headers: { Authorization: `Bearer ${getToken()}` },
                }
              );
              if (!res.ok) throw new Error("Failed to load freights");
              const data = await res.json();
              setFreights(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load freights.");
              router.push("/login");
            }
          };

          const fetchItemsByDateAndFormType = async () => {
            try {
              const res = await fetch(
                `${SERVER_ADDRESS}api/Marketing/GetDocuments/${orderType}/${statusParam}/${formattedToDate}/${formattedFromDate}`,
                {
                  headers: { Authorization: `Bearer ${getToken()}` },
                }
              );
              if (!res.ok)
                throw new Error("Failed to load items by date and form type");
              const data = await res.json();
              setItemsByDateAndFormType(data);
            } catch (error) {
              console.error(error.message);
              toast.error("Failed to load items by date and form type.");
              router.push("/login");
            }
          };

          // Run each fetch function independently
          await fetchCustomers();
          await fetchSeries();
          await fetchUdfs();
          await fetchItems();
          await fetchWarehouses();
          await fetchTaxRate();
          await fetchSalesEmployee();
          await fetchFreights();
          await fetchItemsByDateAndFormType();
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
    router,
    setSeires,
    setDocumentNumber,
    token,
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

export default SalesQuotation;
