import "./App.css";
import { useEffect } from "react";
import axios from "axios";
import CreateOrder from "./CreateOrder";

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
      <div className="flex justify-center items-center w-full px-5 pt-16 pb-5 min-w-full">
        <CreateOrder />
      </div>
    </>
  );
}

export default App;
