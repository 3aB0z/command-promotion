import {
  Button,
  Dialog,
  FlexBox,
  Icon,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import profileImage from "../public/ProfileImage.png";

export default function DisplaySelectedClients({
  selectedClient,
  setSelectedClient,
}) {
  const [clients, setClients] = useState([]);
  const [isClientsOpen, setIsClientsOpen] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await axios.get(
          "https://REDACTED_SAP_HOST:50000/b1s/v2/BusinessPartners?$select=CardCode,CardName,CardType",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );
        const data = response.data.value || [];
        setClients(data);
      } catch (error) {
        console.error(error.message);
      }
    }

    fetchClients();
  }, []);

  return (
    <>
      <div className="w-full flex flex-col gap-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-sky-500">
            Selected Client
          </h1>
          <Button
            onClick={() => setIsClientsOpen(true)}
            className="border border-sky-500 bg-sky-50 hover:bg-sky-100 transition-colors group"
          >
            <div className="flex flex-row items-center gap-x-1">
              <span className="text-sky-500 group-hover:text-sky-600 transition-colors">
                Select Client
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                height={12}
                width={10.5}
                className="fill-sky-500 group-hover:fill-sky-600"
              >
                <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
              </svg>
            </div>
          </Button>
          <Dialog
            footer={
              <FlexBox
                fitContainer
                justifyContent="End"
                style={{ paddingBlock: "0.25rem" }}
              >
                <Button onClick={() => setIsClientsOpen(false)}>Close</Button>
              </FlexBox>
            }
            onClose={() => setIsClientsOpen(false)}
            headerText="Clients"
            open={isClientsOpen}
          >
            <div className="flex justify-center items-center p-4">
              {clients.length > 0 ? (
                <Table
                  headerRow={
                    <TableHeaderRow sticky className="bg-gray-100 h-11">
                      <TableHeaderCell minWidth="45px">
                        <span></span>
                      </TableHeaderCell>
                      <TableHeaderCell minWidth="150px">
                        <span>Card Code</span>
                      </TableHeaderCell>
                      <TableHeaderCell minWidth="250px">
                        <span>Card Name</span>
                      </TableHeaderCell>
                      <TableHeaderCell minWidth="150px">
                        <span>Card Type</span>
                      </TableHeaderCell>
                      <TableHeaderCell minWidth="100px">
                        <span>Details</span>
                      </TableHeaderCell>
                    </TableHeaderRow>
                  }
                  className="divide-y divide-gray-200 border"
                >
                  {clients.map((client, index) => {
                    const isClientSelected =
                      selectedClient.CardCode === client.CardCode;
                    return (
                      <TableRow
                        key={client.CardCode}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } ${
                          isClientSelected && "bg-emerald-200/40"
                        } hover:bg-stone-200 transition-colors duration-200`}
                      >
                        <TableCell className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="radio"
                            onChange={() => setSelectedClient(client)}
                            checked={isClientSelected}
                          />
                        </TableCell>
                        <TableCell className="px-4 py-2 whitespace-nowrap">
                          {client.CardCode}
                        </TableCell>
                        <TableCell className="px-4 py-2 whitespace-nowrap">
                          {client.CardName}
                        </TableCell>
                        <TableCell className="px-4 py-2 whitespace-nowrap">
                          {client.CardType}
                        </TableCell>
                        <TableCell className="px-4 py-2 whitespace-nowrap">
                          <Link
                            to={`/clients/${client.CardCode}`}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Details
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </Table>
              ) : (
                <div className="text-gray-500">Clients table is empty!</div>
              )}
            </div>
          </Dialog>
        </div>
        {selectedClient.CardCode !== "" && (
          <div className="relative w-[430px] flex justify-between">
            <div className="flex gap-4">
              <Link
                to={`/clients/${selectedClient.CardCode}`}
                title="Go to Profile"
              >
                <img
                  src={profileImage}
                  alt="Profil Image"
                  className="w-h-24 h-24 border rounded-full"
                />
              </Link>
              <ul className="flex flex-col justify-center gap-y-2 text-sm font-semibold">
                <li>
                  Card Code:{" "}
                  <span className="text-blue-900 font-normal">
                    {selectedClient.CardCode}
                  </span>
                </li>
                <li>
                  Card Name:{" "}
                  <span className="text-blue-900 font-normal">
                    {selectedClient.CardName}
                  </span>
                </li>
                <li>
                  Card Type:{" "}
                  <span className="text-blue-900 font-normal">
                    {selectedClient.CardType}
                  </span>
                </li>
              </ul>
            </div>
            <Link
              to={`/clients/${selectedClient.CardCode}`}
              title="More Details"
              className="absolute top-0 right-0 bg-slate-50 px-[7px] pt-1 border rounded-md hover:bg-slate-100"
            >
              <Icon name="overflow" className="text-slate-600" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
