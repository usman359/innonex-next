import { useRouter } from "next/navigation";
import { useTable } from "../_contexts/TableContext";
import Modal from "./Modal";
import { useState } from "react";

const WindowControls = ({ isMac }) => {
  const router = useRouter();
  const { resetItemData, setHasUnsavedChanges, hasUnsavedChanges } = useTable();
  const [pendingAction, setPendingAction] = useState(null);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);

  const handleModalYes = () => {
    resetItemData();

    if (pendingAction) {
      resetItemData();
    }
    setShowUnsavedChangesModal(false);
    setPendingAction(null);
    setHasUnsavedChanges(false);

    router.back();
  };

  const handleModalNo = () => {
    setShowUnsavedChangesModal(false);
    setPendingAction(null);
  };

  const handleClose = () => {
    if (!hasUnsavedChanges) {
      resetItemData();
      router.back();
      return;
    }
    setShowUnsavedChangesModal(true);
  };

  return (
    <div
      className={`window-controls ${
        isMac ? "mac-controls" : "windows-controls"
      }`}
    >
      {isMac ? (
        <button onClick={handleClose} className="control-btn close-btn">
          {/* Close button */}
          <svg
            className="bg-white p-0.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="#a8a29e"
            width="16"
            height="16"
          >
            <path d="M1.293 1.293a1 1 0 011.414 0L8 6.586l5.293-5.293a1 1 0 011.414 1.414L9.414 8l5.293 5.293a1 1 0 01-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 01-1.414-1.414L6.586 8 1.293 2.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      ) : (
        <button onClick={handleClose} className="control-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="red"
            width="16"
            height="16"
          >
            <path d="M1.293 1.293a1 1 0 011.414 0L8 6.586l5.293-5.293a1 1 0 011.414 1.414L9.414 8l5.293 5.293a1 1 0 01-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 01-1.414-1.414L6.586 8 1.293 2.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      )}

      {/* Modal for unsaved changes */}
      {showUnsavedChangesModal && (
        <Modal
          isOpen={showUnsavedChangesModal}
          onClose={handleModalNo}
          onChoose={handleModalYes}
          title="Unsaved Changes"
          disableOutsideClickAndClose={true}
          showFooterButtons={false}
        >
          <div className="p-4">
            <p>
              Unsaved data will be lost. Do you want to continue without saving?
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-stone-300 text-stone-700 px-4 py-2 mr-2"
                onClick={handleModalNo}
              >
                No
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2"
                onClick={handleModalYes}
              >
                Yes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WindowControls;
