import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddClient() {
  const [formInputs, setFormInputs] = useState({
    cardCode: "",
    cardName: "",
    cardType: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    async function createClient() {
      try {
        const data = {
          CardCode: formInputs.cardCode,
          CardName: formInputs.cardName,
          CardType: formInputs.cardType.toUpperCase(),
        };

        const response = await axios.post(
          "https://REDACTED_SAP_HOST:50000/b1s/v2/BusinessPartners",
          JSON.stringify(data),
          {
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
            withCredentials: true,
          }
        );

        setError("");
        console.log(
          "Client created successfully:",
          response.data.CardCode,
          response.data.CardName,
          response.data.CardType
        );
        navigate("/clients");
      } catch (error) {
        console.error(error.message);
        setError("Invalid values!");
      }
    }

    createClient();
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
            Add Client
          </h1>
          <label htmlFor="cardCode">CardCode:</label>
          <input
            className="border border-slate-300 rounded"
            type="text"
            name="cardCode"
            value={formInputs.cardCode}
            onChange={(e) =>
              setFormInputs((prv) => {
                return { ...prv, cardCode: e.target.value };
              })
            }
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor="cardName">CardName:</label>
          <input
            className="border border-slate-300 rounded"
            type="text"
            name="cardName"
            value={formInputs.cardName}
            onChange={(e) =>
              setFormInputs((prv) => {
                return { ...prv, cardName: e.target.value };
              })
            }
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label htmlFor="cardType">CardType:</label>
          <input
            className="border border-slate-300 rounded"
            type="text"
            name="cardType"
            value={formInputs.cardType}
            onChange={(e) =>
              setFormInputs((prv) => {
                return { ...prv, cardType: e.target.value };
              })
            }
          />
        </div>
        <button type="submit" className="border text-white bg-blue-500 mt-4">
          Create
        </button>
        {error && <span className="text-rose-500 text-center">{error}</span>}
      </form>
    </>
  );
}
