import { useState } from "react";
import axios from "axios";

export default function AddClient() {
  const [formInputs, setFormInputs] = useState({
    cardCode: "",
    cardName: "",
    cardType: "",
  });

  function handleSubmit(e) {
    e.preventDefault();

    async function createClient() {
      try {
        const data = {
          CardCode: formInputs.cardCode,
          CardName: formInputs.cardName,
          CardType: formInputs.cardType,
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

        console.log(
          "Client created successfully:",
          response.data.CardCode,
          response.data.CardName,
          response.data.CardType
        );
      } catch (error) {
        console.error(error.message);
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
        <button type="submit" className="border text-white bg-blue-500">
          Create
        </button>
      </form>
    </>
  );
}
