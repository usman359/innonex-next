import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { dragAndRelate } from "../_data/dragAndRelate";

export default function DragAndRelateTable() {
  // Navigates
  const router = useRouter();

  // States
  const [openModule, setOpenModule] = useState(null);

  return (
    <>
      {/* Module items */}
      {dragAndRelate.map((item, index) => (
        <React.Fragment key={index}>
          <div
            key={index}
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
              {/* Items */}
              {item.subitems.map((subitem, subIndex) => (
                <div
                  key={subIndex}
                  className="border-b ml-12 border-stone-200 p-1 last:border-none cursor-pointer hover:bg-yellow-400"
                  onClick={() => {
                    if (subitem === "Sales Order") router.push("/sales-order");
                    if (subitem === "Purchase Order")
                      navigate("/purchase-order");
                  }}
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
