import React from "react";
import { attachments } from "../_data/attachments";

const rows = 10;

export default function AttachmentTable() {
  return (
    <main className="overflow-x-scroll">
      {/* Main table content container */}
      <table className="w-full border-collapse">
        <thead>
          {/* Heading container */}
          <tr className="bg-gray-200">
            {attachments.map((item, index) => (
              <th key={index} className={`border border-gray-300 p-0.5`}>
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Rows and columns of the fields container */}
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: attachments.length }, (_, colIndex) => (
                <td
                  key={colIndex}
                  className={`border border-gray-300 ${
                    colIndex >= 0 && colIndex <= 3 ? "bg-gray-200" : ""
                  } p-0.5`}
                >
                  &nbsp;
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
