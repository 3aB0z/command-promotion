import "@ui5/webcomponents-icons/dist/AllIcons.js";
import {
  BusyIndicator,
  Button,
  Dialog,
  FlexBox,
  Icon,
  Input,
  Label,
} from "@ui5/webcomponents-react";
import Clients from "./components/Clients";
import { useState } from "react";
import axios from "axios";
import { SAP_API_URL } from "./config";

export default function DisplaySelectedClient({
  selectedClient,
  setSelectedClient,
  setNotification,
}) {
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isClientsLoading, setIsClientsLoading] = useState(false);

  async function searchClient(value) {
    if (!value) return;
    try {
      const response = await axios.get(
        `${SAP_API_URL}/BusinessPartners?$select=CardCode,CardName,CardType&$filter=CardCode eq '${value}'`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        },
      );

      if (response.data.value.length === 0) {
        setNotification({
          message: value + " not found!",
          sucess: false,
          visible: true,
        });
        console.error("Client not found:", selectedClient.ItemCode);
        return;
      }
      const data = {
        CardCode: response.data.value[0].CardCode,
        CardName: response.data.value[0].CardName,
        CardType: response.data.value[0].CardType,
      };

      setSelectedClient(data);
    } catch (error) {
      setNotification({
        message: error.response.data.error.message,
        sucess: false,
        visible: true,
      });
      console.error("Error while searching client:", error);
    }
  }

  return (
    <>
      <div className="w-1/2 flex flex-col gap-y-4 px-8">
        <h1 className="w-fit text-xl font-semibold text-sky-500">
          Client Details
        </h1>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <Label>
              Card Code: <span className="text-rose-600">*</span>
            </Label>
            <Input
              icon={
                <>
                  <Button
                    onClick={() => setIsClientsOpen(true)}
                    className="rounded-none"
                  >
                    <Icon name="employee" className="mt-0.5" />
                  </Button>
                  <Dialog
                    footer={
                      <FlexBox
                        fitContainer
                        justifyContent="End"
                        style={{ paddingBlock: "0.25rem" }}
                      >
                        <Button onClick={() => setIsClientsOpen(false)}>
                          Close
                        </Button>
                      </FlexBox>
                    }
                    onClose={() => setIsClientsOpen(false)}
                    header={
                      <div className="w-full flex justify-between items-center font-semibold py-2">
                        <span className="text-lg">Clients</span>
                        <BusyIndicator
                          active={isClientsLoading}
                          delay={1000}
                          size="M"
                          className="text-sky-500"
                        />
                      </div>
                    }
                    open={isClientsOpen}
                  >
                    <Clients
                      selectedClient={selectedClient}
                      setSelectedClient={(value) => setSelectedClient(value)}
                      setIsClientsLoading={(value) =>
                        setIsClientsLoading(value)
                      }
                    />
                  </Dialog>
                </>
              }
              value={selectedClient.CardCode}
              onChange={function Js(e) {
                searchClient(e.target.value);
              }}
              type="Text"
            />
          </div>
          <div className="flex justify-between items-center">
            <Label>Card Name:</Label>
            <Input value={selectedClient.CardName} type="Text" readonly />
          </div>
          <div className="flex justify-between items-center">
            <Label>Card Type:</Label>
            <Input value={selectedClient.CardType} type="Text" readonly />
          </div>
        </div>
      </div>
    </>
  );
}
