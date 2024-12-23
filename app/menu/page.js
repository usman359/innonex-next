"use client";

import { useEffect, useRef, useState } from "react";
import DragAndRelateTable from "../_components/DragAndRelateTable";
import ModulesTable from "../_components/ModulesTable";
import MyMenu from "../_components/MyMenu";
import Nav1 from "../_components/Nav1";
import Nav2 from "../_components/Nav2";
import { useTable } from "../_contexts/TableContext";

export default function Menu() {
  // States
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(true);
  const [modules, setModules] = useState(true);
  const [dragAndRelate, setDragAndRelate] = useState(false);
  const [myMenu, setMyMenu] = useState(false);

  // Refs
  const mainMenuRef = useRef();

  // Contexts
  const { setCurrentPage } = useTable();

  // Handlers
  const handleClick = (val) => {
    if (val === "modules") {
      setModules(true);
      setDragAndRelate(false);
      setMyMenu(false);
    }
    if (val === "dragAndRelate") {
      setDragAndRelate(true);
      setModules(false);
      setMyMenu(false);
    }
    if (val === "myMenu") {
      setMyMenu(true);
      setModules(false);
      setDragAndRelate(false);
    }
  };

  // Effects
  useEffect(() => {
    setCurrentPage("menu");
  }, [setCurrentPage]);

  return (
    <>
      {/* First Nav */}
      <Nav1 />

      {/* Second Nav */}
      <Nav2 />

      {isMainMenuOpen && (
        <div
          ref={mainMenuRef}
          className="relative text-sm flex justify-start items-start p-4"
        >
          {/* Center container */}
          <div className="w-full max-w-2xl bg-white shadow-md rounded-md p-4">
            {/* Header */}
            <header className="flex justify-between items-center mb-2 bg-stone-300 border-b-4 border-yellow-500 p-2">
              <span>Main Menu</span>
            </header>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              <button
                className={`text-center py-2 rounded ${
                  modules
                    ? "bg-stone-100 border-t-2 border-yellow-500"
                    : "bg-stone-300"
                }`}
                onClick={() => handleClick("modules")}
              >
                Modules
              </button>
              <button
                className={`text-center py-2 rounded ${
                  dragAndRelate
                    ? "bg-stone-100 border-t-2 border-yellow-500"
                    : "bg-stone-300"
                }`}
                onClick={() => handleClick("dragAndRelate")}
              >
                Drag & Relate
              </button>
              <button
                className={`text-center py-2 rounded ${
                  myMenu
                    ? "bg-stone-100 border-t-2 border-yellow-500"
                    : "bg-stone-300"
                }`}
                onClick={() => handleClick("myMenu")}
              >
                My Menu
              </button>
            </div>

            {/* Table */}
            <div>
              {modules && <ModulesTable />}
              {dragAndRelate && <DragAndRelateTable />}
              {myMenu && <MyMenu />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
