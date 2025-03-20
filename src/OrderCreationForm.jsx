import { useState } from "react";
import Articles from "./Articles";
import axios from "axios";
import {
  BusyIndicator,
  Button,
  Dialog,
  FlexBox,
} from "@ui5/webcomponents-react";
import Clients from "./Clients";
import Popup from "./Popup";

export default function OrderCreationForm({
  selectedClient,
  setSelectedClient,
  selectedArticles,
  setSelectedArticles,
  setPromotionArticles,
  setSelectedPromotions,
  selectedPromotionArticles,
  searchPromotions,
  isPromotionLoading,
}) {
  const [orderNotification, setOrderNotification] = useState({
    sucess: true,
    visible: false,
    message: "",
  });
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [isClientsLoading, setIsClientsLoading] = useState(false);
  const [isArticlesLoading, setIsArticlesLoading] = useState(false);

  const isSelectedArticlesAllowed =
    selectedArticles.length !== 0 && selectedClient.CardCode !== "";

  function createOrder() {
    async function create() {
      setIsOrderLoading(true);
      const documentLines = selectedPromotionArticles.map((article) => {
        return {
          ItemCode: article.ItemCode,
          Quantity: article.Quantity,
          UnitPrice: article.PriceInfo.Price,
        };
      });
      const order = {
        CardCode: selectedClient.CardCode,
        DocDueDate: new Date(),
        DocumentLines: documentLines,
      };

      try {
        const response = await axios.post(
          "https://REDACTED_SAP_HOST:50000/b1s/v2/Orders",
          order,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );
        setSelectedClient({
          CardCode: "",
          CardName: "",
          CardType: "",
        });
        setSelectedArticles([]);
        setPromotionArticles({});
        setSelectedPromotions({});
        setOrderNotification({
          message: "Your order was created!",
          sucess: true,
          visible: true,
        });
        console.log("Order Created Sucessfully: ", response);
      } catch (error) {
        setOrderNotification({
          message: error.response.data.error.message,
          sucess: false,
          visible: true,
        });
        console.error(error.response.data.error.message);
      } finally {
        setIsOrderLoading(false);
      }
    }

    create();
  }

  return (
    <>
      <div className="w-full sm:w-[500px] h-full flex flex-col gap-8 border px-8 py-6 bg-slate-50 rounded-lg shadow-xl shadow-slate-100">
        <h1 className="text-3xl font-medium text-sky-500 mb-1.5">
          Create Order
        </h1>
        <div className="w-5/6 flex flex-col gap-3 ml-1.5">
          <div className="w-[230px] flex justify-between items-center">
            <label>
              Select Client:<span className="text-rose-500">*</span>
            </label>
            <Button
              onClick={() => setIsClientsOpen(true)}
              className="border border-sky-500 rounded h-8 bg-sky-50 hover:bg-sky-100 transition-colors group"
            >
              <div className="w-16 flex flex-row justify-between items-center">
                <span className="text-sky-500 group-hover:text-sky-600 transition-colors">
                  Clients
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  height={12}
                  width={10.5}
                  className="fill-sky-500 group-hover:fill-sky-600"
                >
                  <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                </svg>
              </div>
            </Button>
            <Dialog
              footer={
                <FlexBox
                  fitContainer
                  justifyContent="End"
                  style={{ paddingBlock: "0.25rem" }}
                >
                  <Button onClick={() => setIsClientsOpen(false)}>Close</Button>
                </FlexBox>
              }
              onClose={() => setIsClientsOpen(false)}
              header={
                <div className="w-full flex justify-between items-center font-semibold py-2">
                  <span>Available Clients</span>
                  {isClientsLoading && (
                    <BusyIndicator
                      active={true}
                      size="M"
                      className="text-sky-500"
                    />
                  )}
                </div>
              }
              open={isClientsOpen}
            >
              <Clients
                selectedClient={selectedClient}
                setSelectedClient={(value) => setSelectedClient(value)}
                setIsClientsLoading={(value) => setIsClientsLoading(value)}
              />
            </Dialog>
          </div>
          <div className="w-[230px] flex justify-between items-center">
            <label>
              Select Articles:<span className="text-rose-500">*</span>
            </label>
            <Button
              onClick={() => setIsArticlesOpen(true)}
              disabled={selectedClient.CardCode !== "" ? false : true}
              title={
                selectedClient.CardCode == ""
                  ? "You must select a client first"
                  : ""
              }
              className={`${
                selectedClient.CardCode !== ""
                  ? "cursor-pointer hover:bg-sky-100 group"
                  : "cursor-not-allowed"
              } border border-sky-500 rounded h-8 bg-sky-50 transition-colors`}
            >
              <div className="w-16 flex flex-row justify-between items-center">
                <span className="text-sky-500 group-hover:text-sky-600 transition-colors">
                  Articles
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  height={12}
                  width={10.5}
                  className="fill-sky-500 group-hover:fill-sky-600"
                >
                  <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                </svg>
              </div>
            </Button>
            <Dialog
              footer={
                <FlexBox
                  fitContainer
                  justifyContent="End"
                  style={{ paddingBlock: "0.25rem" }}
                >
                  <Button onClick={() => setIsArticlesOpen(false)}>
                    Close
                  </Button>
                </FlexBox>
              }
              onClose={() => setIsArticlesOpen(false)}
              header={
                <div className="w-full flex justify-between items-center font-semibold py-2">
                  <span>Available Articles</span>
                  {isArticlesLoading && (
                    <BusyIndicator
                      active={true}
                      size="M"
                      className="text-sky-500"
                    />
                  )}
                </div>
              }
              open={isArticlesOpen}
            >
              <Articles
                selectedArticles={selectedArticles}
                setSelectedArticles={setSelectedArticles}
                selectedClient={selectedClient}
                setIsArticlesLoading={(value) => setIsArticlesLoading(value)}
              />
            </Dialog>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={searchPromotions}
              disabled={isSelectedArticlesAllowed ? false : true}
              className={`${
                isSelectedArticlesAllowed
                  ? "cursor-pointer bg-teal-500 hover:bg-teal-600"
                  : "cursor-not-allowed bg-teal-500/30"
              } text-white py-1.5 transition-colors`}
            >
              Search promotions
            </button>
            {isPromotionLoading && (
              <BusyIndicator active={true} size="M" className="text-teal-400" />
            )}
          </div>
          <button
            onClick={createOrder}
            disabled={isSelectedArticlesAllowed ? false : true}
            className={`${
              isSelectedArticlesAllowed
                ? "cursor-pointer bg-teal-500 hover:bg-teal-600"
                : "cursor-not-allowed bg-teal-500/30"
            } flex items-center gap-2 text-white transition-colors`}
          >
            <span>{isOrderLoading ? "Creating" : "Create"} Order</span>
            {isOrderLoading && (
              <BusyIndicator
                active={true}
                delay={0}
                size="M"
                className="text-teal-100"
              />
            )}
          </button>
        </div>
        <Popup
          notification={orderNotification}
          setNotification={(value) => setOrderNotification(value)}
        />
      </div>
    </>
  );
}
