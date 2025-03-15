import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableRow,
  TableCell,
  TableHeaderRow,
  TableHeaderCell,
} from "@ui5/webcomponents-react";

export default function Clients() {
  const [clients, setClients] = useState([]);

  const isClintsFetched = clients.length === 0;

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
        setClients(response.data.value);
      } catch (error) {
        console.error(error.message);
      }
    }
    fetchClients();
  }, [isClintsFetched]);

  return (
    <div className="flex justify-center items-center p-4">
      {clients.length > 0 ? (
        <Table
          headerRow={
            <TableHeaderRow sticky className="bg-gray-100 h-11">
              <TableHeaderCell minWidth="200px">
                <span>Card Code</span>
              </TableHeaderCell>
              <TableHeaderCell minWidth="200px" width="auto">
                <span>Card Name</span>
              </TableHeaderCell>
              <TableHeaderCell minWidth="200px">
                <span>Card Type</span>
              </TableHeaderCell>
              <TableHeaderCell width="150px">
                <span>Details</span>
              </TableHeaderCell>
            </TableHeaderRow>
          }
          className="divide-y divide-gray-200 border"
        >
          {clients.map((client) => (
            <TableRow key={client.CardCode}>
              <TableCell>{client.CardCode}</TableCell>
              <TableCell>{client.CardName}</TableCell>
              <TableCell>{client.CardType}</TableCell>
              <TableCell>
                <Link
                  to={`/clients/${client.CardCode}`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Details
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      ) : (
        <div className="text-gray-500">Clients table is empty!</div>
      )}
    </div>
  );
}
