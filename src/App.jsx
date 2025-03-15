import "./App.css";
import { Link, Route, Routes } from "react-router-dom";
import Clients from "./Clients";
import ClientDetails from "./ClientDetails";
import { useEffect } from "react";
import axios from "axios";
import UpdateClientName from "./UpdateClientName";
import AddArticles from "./AddArticles";
import AddClient from "./AddClient";

function App() {
  // Auto Login
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

        return response.data;
      } catch (error) {
        console.error(
          "SAP Login2 Error:",
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
        <nav className="fixed top-0 z-50 w-full h-11 flex justify-center items-center underline from-emerald-300 to-sky-400 bg-gradient-to-r space-x-6">
          <Link to="/clients" className="text-white hover:text-slate-100">
            Clients
          </Link>
          <Link to="/addClient" className="text-white hover:text-slate-100">
            Create Client
          </Link>
          <Link to="/addArticles" className="text-white hover:text-slate-100">
            Add Articles
          </Link>
        </nav>

        <div className="flex justify-center items-center w-full px-5 pt-16 pb-5 min-w-full">
          <Routes>
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/addClient" element={<AddClient />} />
            <Route path="/updateClient/:id" element={<UpdateClientName />} />
            <Route path="/addArticles" element={<AddArticles />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
