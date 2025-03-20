import { Icon } from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Link } from "react-router-dom";
import profileImage from "/src/assets/ProfileImage.png";

export default function DisplaySelectedClient({ selectedClient }) {
  return (
    <>
      <div className="w-[300px] lg:min-h-full min-h-[250px] lg:h-auto flex flex-col gap-y-4 border p-4 rounded-lg bg-slate-50 shadow-lg shadow-slate-100">
        <h1 className="w-fit text-xl font-semibold text-sky-500">
          Selected Client
        </h1>
        <div className="relative w-full flex flex-col items-center gap-4 justify-between flex-1">
          <img
            src={profileImage}
            alt="Profil Image"
            className="w-24 h-24 border rounded-full"
          />
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
              <Link
                to={`/clients/${selectedClient.CardCode}`}
                className="self-start flex items-center gap-0.5 group"
              >
                <span className="group-hover:text-indigo-600 text-sm transition-colors">
                  More Details
                </span>
                <Icon
                  name="arrow-top"
                  className="text-indigo-500 rotate-45 w-3.5 group-hover:text-indigo-600 transition-colors"
                />
              </Link>
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
