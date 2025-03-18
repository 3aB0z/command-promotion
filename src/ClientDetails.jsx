import { Button, Dialog, Icon } from "@ui5/webcomponents-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import profileImage from "/src/assets/ProfileImage.png";

export default function ClientDetails() {
  const [client, setClient] = useState({
    CardCode: "",
    CardName: "",
    CardType: "",
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  async function deleteClient() {
    try {
      const response = await axios.delete(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/BusinessPartners('${id}')`,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Client deleted successfully:", response.data);
      navigate("/clients");
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    async function fetchClient() {
      const response = await axios.get(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/BusinessPartners('${id}')?$select=CardCode,CardName,CardType`,
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
      <div className="relative w-full flex justify-center">
        {client.CardCode !== "" && (
          <ul className="w-2/3 min-w-[600px] max-w-[800px] flex justify-between items-center gap-x-4 p-5">
            <div className="flex gap-4">
              <li>
                <img
                  src={profileImage}
                  alt="Profil Image"
                  className="w-h-40 h-40 border rounded-full"
                />
              </li>
              <ul className="flex flex-col justify-center gap-y-2 text-lg">
                <li>
                  Card Code:{" "}
                  <span className="text-blue-600 font-semibold">
                    {client.CardCode}
                  </span>
                </li>
                <li>
                  Card Name:{" "}
                  <span className="text-blue-600 font-semibold">
                    {client.CardName}
                  </span>
                </li>
                <li>
                  Card Type:{" "}
                  <span className="text-blue-600 font-semibold">
                    {client.CardType}
                  </span>
                </li>
              </ul>
            </div>
            <li className="flex flex-col gap-3">
              <Link
                to={`/updateClient/${client.CardCode}`}
                title="Edit profile name"
                className="border border-blue-500 flex justify-center items-center text-sm rounded-lg w-9 h-9 text-center hover:bg-blue-50"
              >
                <Icon name="edit" className="text-blue-500" />
              </Link>
              <Button
                onClick={function Js() {
                  setIsDeleteOpen(true);
                }}
                title="Delete profile"
                className="text-rose-500 border border-rose-500 w-9 h-9 hover:bg-rose-50"
              >
                <Icon name="delete" className="text-rose-500 mt-0.5" />
              </Button>
              <Dialog
                open={isDeleteOpen}
                onClose={function Js() {
                  setIsDeleteOpen(false);
                }}
              >
                <div className="flex flex-col items-start gap-2">
                  <p className="pl-1 text-lg font-medium">
                    Delete your profile?
                  </p>
                  <div className="w-full h-full flex justify-end items-center gap-3 pt-2.5">
                    <button
                      onClick={deleteClient}
                      className="bg-rose-500 text-white border-none rounded-md py-1.5 hover:bg-rose-600"
                    >
                      Delete
                    </button>
                    <Button
                      onClick={function Js() {
                        setIsDeleteOpen(false);
                      }}
                      className="text-rose-500 border border-rose-500 rounded-md hover:bg-rose-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Dialog>
            </li>
          </ul>
        )}
      </div>
    </>
  );
}
