import React, { useState, useEffect, useMemo } from "react";
import { useTable } from "../_contexts/TableContext";

export default function Spinner() {
  const {
    loginLoading,
    menuLoading,
    salesLoading,
    paymentsLoading,
    fromAndToLoading,
    postingDocument,
    updatingDocument,
    documentNumberLoading,
  } = useTable();

  const [displayText, setDisplayText] = useState("Loading...");

  const text = useMemo(() => {
    if (
      loginLoading ||
      menuLoading ||
      salesLoading ||
      paymentsLoading ||
      fromAndToLoading ||
      documentNumberLoading
    ) {
      return [
        "Loading...",
        "Please wait, we are gathering all necessary data...",
        "Still working on it, thanks for your patience...",
        "This is taking longer than usual, hold on tight...",
        "Almost there, just a few more moments...",
        "We appreciate your patience, still processing...",
        "Hang tight, ensuring everything is set up correctly...",
        "Finalizing the details, this will be worth the wait...",
      ];
    }

    if (postingDocument) {
      return [
        "Posting document...",
        "Please wait, your document is being processed...",
        "This is taking a bit longer, please hold on...",
        "Finalizing the document, almost done...",
        "Ensuring all details are correct, almost there...",
        "Still working on your document, thank you for waiting...",
        "We're almost finished, just a few more moments...",
        "Finalizing everything, we appreciate your patience...",
      ];
    }

    if (updatingDocument) {
      return [
        "Updating document...",
        "Please wait, your updates are being applied...",
        "This is taking longer than expected, please be patient...",
        "Almost done updating, just a bit more...",
        "Ensuring the updates are correct, almost there...",
        "Thank you for waiting, applying the final touches...",
        "Almost finished with the update, just a little longer...",
        "Wrapping up the update, thank you for your patience...",
      ];
    }

    return ["Loading..."]; // Default text array if none of the conditions are met
  }, [
    loginLoading,
    menuLoading,
    salesLoading,
    paymentsLoading,
    fromAndToLoading,
    documentNumberLoading,
    postingDocument,
    updatingDocument,
  ]);

  useEffect(() => {
    let timerIds = [];

    text.forEach((message, index) => {
      const timerId = setTimeout(() => {
        setDisplayText(message);
      }, index * 6000);
      timerIds.push(timerId);
    });

    return () => timerIds.forEach(clearTimeout); // Clear all timers on unmount
  }, [text]);

  return (
    <div className="loader-container">
      <div className="fading-bars">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      <div className="loading-text">{displayText}</div>
    </div>
  );
}
