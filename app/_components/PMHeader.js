import { useTable } from "../_contexts/TableContext";
import Input from "./Input";
import Spinner from "./Spinner";

const PMHeader = () => {
  const {
    selectedCustomer,
    status,
    isDocNumManuallyEntered,
    documentNumberLoading,
  } = useTable();

  return (
    <div>
      {documentNumberLoading && <Spinner />}
      <h1 className="bg-stone-400 bg-gradient-to-b from-stone-200 to-stone-400 capitalize text-lg px-4 mb-1 border-b-4 border-yellow-500">
        Payment Means
      </h1>
      <header className="flex flex-col sm:flex-row justify-between px-4 my-4 sm:my-0">
        <div className="flex gap-4">
          <div className="flex flex-col gap-0.5 sm:mt-2">
            <Input
              label="Currency"
              value={""}
              readOnly={status !== "Open"}
              isEditable={isDocNumManuallyEntered}
              status={status}
            />
          </div>
        </div>
      </header>
    </div>
  );
};

export default PMHeader;
