import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [clients, setClients] = useState([]);

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
        const data = await response.data.value;

        setClients(data);
      } catch (error) {
        console.error(error.message);
      }
    }

    fetchClients();
  }, []);
  return (
    <>
      <div className="flex justify-center items-center">
        {clients.length !== 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr className="bg-zinc-300">
                <th className="px-4 py-2 text-left font-medium text-gray-700 tracking-wider sticky top-0 bg-gray-100">
                  Card Code:
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 tracking-wider sticky top-0 bg-gray-100">
                  Card Name:
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 tracking-wider sticky top-0 bg-gray-100">
                  Card Type:
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 tracking-wider sticky top-0 bg-gray-100">
                  Details:
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client, index) => {
                return (
                  <tr
                    key={client.CardCode}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-stone-200 transition-colors duration-200`}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      {client.CardCode}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {client.CardName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {client.CardType}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Link to={`/clients/${client.CardCode}`}>Details</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <span>Clients table is empty!</span>
        )}
      </div>
    </>
  );
}
