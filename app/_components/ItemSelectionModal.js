import React, { useEffect, useRef, useState } from "react";

const ItemSelectionModal = ({ orders, onClose, onOrderSelect }) => {
  const modalRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState(orders);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Handle search input and filter customers
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        order.documentLines[0].itemDescription
          .toLowerCase()
          .includes(lowerCaseQuery) ||
        order.documentLines[0].itemCode.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-center items-center">
      <div ref={modalRef} className="bg-white w-3/5 p-4 rounded shadow-lg">
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-xl">List of Items</h2>
          <button onClick={onClose} className="text-xl">
            &times;
          </button>
        </header>
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by description or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-start">#</th>
                <th className="border px-2 py-1 text-start">
                  Item Description
                </th>
                <th className="border px-2 py-1 text-start">Item No</th>
                <th className="border px-2 py-1 text-start">MfgCode</th>
                <th className="border px-2 py-1 text-start">CSDCode</th>
                <th className="border px-2 py-1 text-start">SUSCCode</th>
                <th className="border px-2 py-1 text-start">In Stock</th>
                <th className="border px-2 py-1 text-start">Carton Size</th>
                <th className="border px-2 py-1 text-start">Manufacturer</th>
                <th className="border px-2 py-1 text-start">
                  Preferred Vendor
                </th>
                <th className="border px-2 py-1 text-start">Tax</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr
                  key={index}
                  onClick={() => onOrderSelect(order)}
                  className="cursor-pointer hover:bg-gray-200 whitespace-nowrap"
                >
                  <td className="border px-2 py-1">{index + 1}</td>
                  <td className="border px-2 py-1">
                    {order.documentLines[0].itemDescription}
                  </td>
                  <td className="border px-2 py-1">
                    {order.documentLines[0].itemCode}
                  </td>
                  <td className="border px-2 py-1">
                    {order.documentLines[0].u_MfgCode}
                  </td>
                  <td className="border px-2 py-1">
                    {order.documentLines[0].u_CSDCode}
                  </td>
                  <td className="border px-2 py-1">
                    {order.documentLines[0].u_USCCode}
                  </td>
                  <td className="border px-2 py-1">
                    {order.documentLines[0].openQuantity}
                  </td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1"></td>
                  <td className="border px-2 py-1">
                    {order.documentLines[0].u_TaxType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ItemSelectionModal;
