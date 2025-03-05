import { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function UpdateClientName() {
  const [cardName, setCardName] = useState("");

  const { id } = useParams();

  function handleSubmit(e) {
    e.preventDefault();

    async function updateClient() {
      try {
        const response = await axios.patch(
          `https://REDACTED_SAP_HOST:50000/b1s/v1/BusinessPartners('${id}')`,
          JSON.stringify({ CardName: cardName }),
          {
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            withCredentials: true,
          }
        );

        console.log("Client updated successfully:", response.data);
      } catch (error) {
        console.error(error.message);
      }
    }

    updateClient();
  }

  return (
    <>
      <form onSubmit={handleSubmit} method="POST">
        <label htmlFor="cardName">CardName:</label>
        <input
          type="text"
          name="cardName"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
        />
        <button type="submit">Update</button>
      </form>
    </>
  );
}
