import React, { useState } from "react";

export default function Dropdown({ label, menuItems }) {
  const [isHovered, setIsHovered] = useState(false);
  const [subMenuHover, setSubMenuHover] = useState(null);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setSubMenuHover(null);
      }}
      className="relative"
    >
      <span className="cursor-pointer">{label}</span>
      {isHovered && (
        <div className="absolute z-10 bg-white border border-gray-300 shadow-lg w-48">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.label}
                onMouseEnter={() => setSubMenuHover(item.label)}
                onMouseLeave={() => setSubMenuHover(null)}
                className="hover:bg-yellow-200 px-4 py-2 relative cursor-pointer"
                onClick={item.onClick ? item.onClick : undefined}
              >
                {item.label}
                {item.subMenu && subMenuHover === item.label && (
                  <div className="absolute left-full top-0 z-10 bg-white border border-gray-300 shadow-lg w-48">
                    <ul>
                      {item.subMenu.map((subItem) => (
                        <li
                          key={subItem.label}
                          className="hover:bg-yellow-200 px-4 py-2 cursor-pointer"
                          onClick={
                            subItem.onClick ? subItem.onClick : undefined
                          }
                        >
                          {subItem.label}
                          {subItem.subMenu && (
                            <div className="absolute left-full top-0 z-10 bg-white border border-gray-300 shadow-lg w-48">
                              <ul>
                                {subItem.subMenu.map((subSubItem) => (
                                  <li
                                    key={subSubItem.label}
                                    className="hover:bg-yellow-200 px-4 py-2 cursor-pointer"
                                    onClick={
                                      subSubItem.onClick
                                        ? subSubItem.onClick
                                        : undefined
                                    }
                                  >
                                    {subSubItem.label}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
