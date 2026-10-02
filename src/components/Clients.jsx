import {
  RadioButton,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@ui5/webcomponents-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { SAP_API_URL } from "../config";

export default function Clients({
  selectedClient,
  setSelectedClient,
  setIsClientsLoading,
}) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    async function fetchClients() {
      try {
        setIsClientsLoading(true);
        const response = await axios.get(
          `${SAP_API_URL}/BusinessPartners?$select=CardCode,CardName,CardType`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          },
        );
        const data =
          response.data.value.map((item) => ({
            CardCode: item.CardCode,
            CardName: item.CardName,
            CardType: item.CardType,
          })) || [];
        if (data.length !== 0) {
          setClients(data);
          setSelectedClient(data[0]);
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setIsClientsLoading(false);
      }
    }

    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex justify-center items-center w-full h-full">
        {clients.length > 0 ? (
          <Table
            headerRow={
              <TableHeaderRow sticky className="bg-gray-100">
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
              </TableHeaderRow>
            }
            className="h-[448px] divide-y divide-gray-200 border"
          >
            {clients.map((client, index) => {
              const isClientSelected =
                selectedClient.CardCode === client.CardCode;
              return (
                <TableRow
                  key={client.CardCode}
                  onClick={() => setSelectedClient(client)}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                    isClientSelected && "bg-emerald-300/20"
                  } hover:bg-stone-200`}
                >
                  <TableCell>
                    <RadioButton
                      onChange={() => setSelectedClient(client)}
                      checked={isClientSelected}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {client.CardCode}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {client.CardName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {client.CardType}
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        ) : (
          <div className="text-gray-500">Clients table is empty!</div>
        )}
      </div>
    </>
  );
}
