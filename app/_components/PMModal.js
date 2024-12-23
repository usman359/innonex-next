import { useCallback, useEffect, useRef, forwardRef } from "react";
import { MdClose } from "react-icons/md";

const PMModal = forwardRef(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      disableOutsideClickAndClose = false,
      onChoose,
      showFooterButtons = true,
      selectedItem,
    },
    ref
  ) => {
    const modalRef = useRef(null); // Use forwarded ref or create a new ref

    const handleClickOutside = useCallback(
      (event) => {
        if (
          !disableOutsideClickAndClose &&
          modalRef.current &&
          !modalRef.current.contains(event.target)
        ) {
          onClose();
        }
      },
      [onClose, disableOutsideClickAndClose]
    );

    useEffect(() => {
      if (!disableOutsideClickAndClose) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [handleClickOutside, disableOutsideClickAndClose]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div
          ref={modalRef}
          className="bg-white p-4 shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-5xl max-h-[85vh] overflow-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            {!disableOutsideClickAndClose && (
              <MdClose
                onClick={onClose}
                className="cursor-pointer text-gray-500 text-2xl"
              />
            )}
          </div>
          {children}
        </div>
      </div>
    );
  }
);

// Set the display name for better debugging
PMModal.displayName = "Modal";

export default PMModal;
