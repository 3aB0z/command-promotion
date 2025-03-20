import "@ui5/webcomponents-icons/dist/AllIcons.js";

export default function DisplaySelectedClient({ selectedClient }) {
  return (
    <>
      <div className="w-[300px] min-h-[155px] flex flex-col gap-y-4 border p-4 rounded-lg bg-slate-50 shadow-lg shadow-slate-100">
        <h1 className="w-fit text-xl font-semibold text-sky-500">
          Selected Client
        </h1>
        <div className="relative w-full flex flex-col items-center gap-4 justify-between flex-1">
          {selectedClient.CardCode !== "" ? (
            <>
              <ul className="w-full flex flex-col justify-center gap-y-2 px-1 text-sm font-semibold">
                <li className="flex items-center gap-1">
                  Card Code:
                  <span className="text-blue-900 font-normal">
                    {selectedClient.CardCode}
                  </span>
                </li>
                <li className="flex items-center gap-1">
                  <p className="whitespace-nowrap">Card Name:</p>
                  <span className="text-blue-900 font-normal truncate">
                    {selectedClient.CardName}
                  </span>
                </li>
                <li className="flex items-center gap-1">
                  Card Type:
                  <span className="text-blue-900 font-normal">
                    {selectedClient.CardType}
                  </span>
                </li>
              </ul>
            </>
          ) : (
            <div className="flex items-center flex-1">
              <span className="text-slate-400/60">Select a client</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
