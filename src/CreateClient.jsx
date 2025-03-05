import { useState } from "react";
import axios from "axios";

export default function CreateClient() {
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
          "https://REDACTED_SAP_HOST:50000/b1s/v1/BusinessPartners",
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
      <form onSubmit={handleSubmit} method="POST">
        <label htmlFor="cardCode">CardCode:</label>
        <input
          type="text"
          name="cardCode"
          value={formInputs.cardCode}
          onChange={(e) =>
            setFormInputs((prv) => {
              return { ...prv, cardCode: e.target.value };
            })
          }
        />
        <label htmlFor="cardName">CardName:</label>
        <input
          type="text"
          name="cardName"
          value={formInputs.cardName}
          onChange={(e) =>
            setFormInputs((prv) => {
              return { ...prv, cardName: e.target.value };
            })
          }
        />
        <label htmlFor="cardType">CardType:</label>
        <input
          type="text"
          name="cardType"
          value={formInputs.cardType}
          onChange={(e) =>
            setFormInputs((prv) => {
              return { ...prv, cardType: e.target.value };
            })
          }
        />
        <button type="submit">Create</button>
      </form>
    </>
  );
}
