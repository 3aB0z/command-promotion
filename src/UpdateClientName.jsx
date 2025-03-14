import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateClientName() {
  const [cardName, setCardName] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    async function updateClient() {
      try {
        const response = await axios.patch(
          `https://REDACTED_SAP_HOST:50000/b1s/v2/BusinessPartners('${id}')`,
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

    await updateClient();
    navigate(`/clients/${id}`);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        method="POST"
        className="flex w-96 flex-col space-y-3 bg-slate-50 px-6 py-4 rounded-lg"
      >
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl text-center font-medium text-blue-600 mb-8 pt-2">
            Update Card Name
          </h1>
          <label htmlFor="cardName">CardName:</label>
          <input
            className="border border-slate-300 rounded"
            type="text"
            name="cardName"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
        </div>
        <button type="submit" className="border text-white bg-blue-500">
          Update
        </button>
      </form>
    </>
  );
}
