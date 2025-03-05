import "./App.css";
import { Link, Route, Routes } from "react-router-dom";
import Home from "./Home";
import ClientDetails from "./ClientDetails";
import { useEffect, useState } from "react";
import axios from "axios";
import CreateClient from "./CreateClient";
import UpdateClientName from "./UpdateClientName";

function App() {
  const [clients, setClients] = useState([]);

  // Auto Login
  useEffect(() => {
    async function loginToSAP() {
      try {
        const loginData = {
          CompanyDB: "SBODemo",
          UserName: "REDACTED_USERNAME",
          Password: "REDACTED_CREDENTIAL",
        };

        const response = await axios.post(
          "https://REDACTED_SAP_HOST:50000/b1s/v1/Login",
          loginData,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );

        return response.data;
      } catch (error) {
        console.error(
          "SAP Login Error:",
          error.response?.data || error.message
        );
        throw new Error("Failed to authenticate with SAP Service Layer");
      }
    }

    async function fetchClients() {
      try {
        const response = await axios.get(
          "https://REDACTED_SAP_HOST:50000/b1s/v1/BusinessPartners?$select=CardCode,CardName,CardType",
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

    async function initApp() {
      await loginToSAP();
      await fetchClients();
    }

    initApp();
  }, []);

  return (
    <>
      <div className="flex flex-col justify-start items-center w-full">
        <nav className="w-full h-10 flex justify-center items-center underline bg-zinc-900 space-x-5">
          <Link to="/">Home</Link>
          <Link to="/createClient">Create Client</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home clients={clients} />} />
          <Route
            path="/clients/:id"
            element={<ClientDetails clients={clients} />}
          />
          <Route path="/createClient" element={<CreateClient />} />
          <Route path="/updateClient/:id" element={<UpdateClientName />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
