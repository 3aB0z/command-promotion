import "./App.css";
import { Route, Routes } from "react-router-dom";
import Clients from "./Clients";
import ClientDetails from "./ClientDetails";
import { useEffect } from "react";
import axios from "axios";
import UpdateClientName from "./UpdateClientName";
import AddClient from "./AddClient";
import CreateOrder from "./CreateOrder";
import Navbar from "./Navbar";
import Home from "./Home";

function App() {
  useEffect(() => {
    async function loginToSAP() {
      try {
        const loginData = {
          CompanyDB: "REDACTED_COMPANY_DATABASE",
          UserName: "REDACTED_USERNAME",
          Password: "REDACTED_CREDENTIAL",
        };

        const response = await axios.post(
          "https://REDACTED_SAP_HOST:50000/b1s/v2/Login",
          loginData,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );

        console.log("Logged Successfull:", response);
      } catch (error) {
        console.error(
          "SAP Login Error:",
          error.response?.data || error.message
        );
        throw new Error("Failed to authenticate with SAP Service Layer");
      }
    }

    loginToSAP();
  }, []);

  return (
    <>
      <div className="relative w-full h-screen flex flex-col justify-start items-center">
        <Navbar />
        <div className="flex justify-center items-center w-full px-5 pt-16 pb-5 min-w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/addClient" element={<AddClient />} />
            <Route path="/updateClient/:id" element={<UpdateClientName />} />
            <Route path="/createOrder" element={<CreateOrder />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
