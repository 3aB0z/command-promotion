import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function ClientDetails() {
  const [client, setClient] = useState({
    CardCode: "",
    CardName: "",
    CardType: "",
  });
  const { id } = useParams();

  async function deleteClient() {
    try {
      const response = await axios.delete(
        `https://REDACTED_SAP_HOST:50000/b1s/v1/BusinessPartners('${id}')`,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Client deleted successfully:", response.data);
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    async function fetchClient() {
      const response = await axios.get(
        `https://REDACTED_SAP_HOST:50000/b1s/v1/BusinessPartners('${id}')?$select=CardCode,CardName,CardType`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );
      const foundClient = await response.data;

      foundClient && setClient(foundClient);
    }

    fetchClient();
  }, [id]);

  return (
    <>
      <div>
        {client.CardCode !== "" ? (
          <ul>
            <li>{client.CardCode}</li>
            <li>{client.CardName}</li>
            <li>{client.CardType}</li>
            <li>
              <Link to={`/updateClient/${client.CardCode}`}>
                Update your name
              </Link>
            </li>
            <li>
              <button onClick={deleteClient}>Delete your account</button>
            </li>
          </ul>
        ) : (
          <p>The client you want was not found!</p>
        )}
      </div>
    </>
  );
}
