import { useEffect, useState } from "react";
import {
  BusyIndicator,
  Button,
  Dialog,
  FlexBox,
  Icon,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  Toast,
} from "@ui5/webcomponents-react";
import DisplaySelectedArticles from "./DisplaySelectedArticles";
import axios from "axios";
import Promotions from "./Promotions";
import Articles from "./Articles";
import { Link } from "react-router-dom";
import DisplaySelectedClient from "./DisplaySelectedClient";

export default function CreateOrder() {
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [selectedClient, setSelectedClient] = useState({
    CardCode: "",
    CardName: "",
    CardType: "",
  });
  const [promotionArticles, setPromotionArticles] = useState({});
  const [selectedPromotionArticles, setSelectedPromotionArticles] = useState(
    {}
  );
  const [clients, setClients] = useState([]);

  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [visiblePromotions, setVisiblePromotions] = useState({});
  const [isPromotionLoading, setIsPromotionLoading] = useState(false);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState({
    sucess: true,
    visible: false,
  });

  async function fetchPromotionArticles(article) {
    try {
      const promotionsResponse = await axios.get(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/PROMOTIONS?$select=U_PromoFamily,U_QtyRequired,U_QtyFree&$filter=U_ArticleFamily eq '${article.U_Family}' and U_QtyRequired le ${article.Quantity}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      if (!promotionsResponse.data.value?.length) return [];

      const promoFamily = promotionsResponse.data.value[0].U_PromoFamily;

      const itemsResponse = await axios.get(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/Items?$select=ItemCode,ItemName,U_Family&$filter=U_Family eq '${promoFamily}'`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      return itemsResponse.data.value.map((item) => ({
        ItemCode: item.ItemCode,
        ItemName: item.ItemName,
        U_Family: item.U_Family,
        U_ArticleFamily: article.U_Family,
        U_PromoFamily: promoFamily,
        U_QtyFree: promotionsResponse.data.value[0].U_QtyFree,
        U_QtyRequired: promotionsResponse.data.value[0].U_QtyRequired,
        Price: 0,
        Quantity: 0,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des promotions:", error);
      return [];
    }
  }

  async function searchPromotions() {
    setIsPromotionLoading(true);
    try {
      const results = await Promise.all(
        selectedArticles.map(async (item) => await fetchPromotionArticles(item))
      );
      const nonEmptyPromotions = {};
      selectedArticles.forEach((article, index) => {
        const promotions = results[index];
        if (promotions && promotions.length > 0) {
          nonEmptyPromotions[article.ItemCode] = promotions;
        }
      });
      setPromotionArticles(nonEmptyPromotions);
      setSelectedPromotionArticles({});
    } catch (error) {
      console.error("Promotions fetch failed:", error);
    }
    setIsPromotionLoading(false);
  }

  function updateSelectedPromotionArticles(itemCode, updatedList) {
    updatedList.length !== 0
      ? setSelectedPromotionArticles((prev) => ({
          ...prev,
          [itemCode]: updatedList,
        }))
      : delete selectedPromotionArticles[itemCode];
  }

  const orderArticles = Object.values(selectedPromotionArticles)
    .flat()
    .reduce((acc, curr) => {
      const existing = acc.find((item) => item.ItemCode === curr.ItemCode);
      if (existing) {
        existing.Quantity += curr.Quantity;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);

  function createOrder() {
    async function create() {
      setIsOrderLoading(true);
      const orderedArticles = [...selectedArticles, ...orderArticles];
      const documentLines = orderedArticles.map((article) => {
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
        setOrderCreated({ visible: true, sucess: true });
        console.log("Order Created Sucessfully: ", response);
      } catch (error) {
        setOrderCreated({ visible: true, sucess: false });
        console.error(error);
      }
      setIsOrderLoading(false);
    }

    create();
  }

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await axios.get(
          "https://REDACTED_SAP_HOST:50000/b1s/v2/BusinessPartners?$select=CardCode,CardName,CardType",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );
        const data =
          response.data.value.map((item) => ({
            CardCode: item.CardCode,
            CardName: item.CardName,
            CardType: item.CardType,
          })) || [];
        setClients(data);
      } catch (error) {
        console.error(error.message);
      }
    }

    fetchClients();
  }, []);

  return (
    <>
      <div className="relative w-full flex flex-col justify-center items-center gap-y-16 p-4">
        <div className="w-full flex justify-evenly items-center">
          <div className="w-[360px] flex flex-col items-center gap-8 border px-8 py-6 bg-slate-50 rounded-lg shadow-xl shadow-slate-100">
            <h1 className="text-3xl text-center font-medium text-sky-500 mb-2">
              Create Order
            </h1>
            <div className="w-5/6 flex flex-col gap-3">
              <div className="w-full flex justify-between items-center gap-4">
                <label>
                  Select Client:<span className="text-rose-500">*</span>
                </label>
                <Button
                  onClick={() => setIsClientsOpen(true)}
                  className="border border-sky-500 rounded h-8 bg-sky-50 hover:bg-sky-100 transition-colors group"
                >
                  <div className="flex flex-row items-center gap-x-1">
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
                      <Button onClick={() => setIsClientsOpen(false)}>
                        Close
                      </Button>
                    </FlexBox>
                  }
                  onClose={() => setIsClientsOpen(false)}
                  headerText="Clients"
                  open={isClientsOpen}
                >
                  <div className="flex justify-center items-center p-4">
                    {clients.length > 0 ? (
                      <Table
                        headerRow={
                          <TableHeaderRow sticky className="bg-gray-100 h-11">
                            <TableHeaderCell minWidth="45px">
                              <span></span>
                            </TableHeaderCell>
                            <TableHeaderCell minWidth="150px">
                              <span>Card Code</span>
                            </TableHeaderCell>
                            <TableHeaderCell minWidth="250px">
                              <span>Card Name</span>
                            </TableHeaderCell>
                            <TableHeaderCell minWidth="150px">
                              <span>Card Type</span>
                            </TableHeaderCell>
                            <TableHeaderCell minWidth="100px">
                              <span>Details</span>
                            </TableHeaderCell>
                          </TableHeaderRow>
                        }
                        className="divide-y divide-gray-200 border"
                      >
                        {clients.map((client, index) => {
                          const isClientSelected =
                            selectedClient.CardCode === client.CardCode;
                          return (
                            <TableRow
                              key={client.CardCode}
                              onClick={() => setSelectedClient(client)}
                              className={`${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } ${
                                isClientSelected && "bg-emerald-100/80"
                              } hover:bg-stone-200 transition-colors duration-200`}
                            >
                              <TableCell className="px-4 py-2 whitespace-nowrap">
                                <span className="w-4 h-4">
                                  <input
                                    type="radio"
                                    onChange={() => setSelectedClient(client)}
                                    checked={isClientSelected}
                                    className="w-full h-full"
                                  />
                                </span>
                              </TableCell>
                              <TableCell className="px-4 py-2 whitespace-nowrap">
                                {client.CardCode}
                              </TableCell>
                              <TableCell className="px-4 py-2 whitespace-nowrap">
                                {client.CardName}
                              </TableCell>
                              <TableCell className="px-4 py-2 whitespace-nowrap">
                                {client.CardType}
                              </TableCell>
                              <TableCell className="px-4 py-2 whitespace-nowrap">
                                <Link
                                  to={`/clients/${client.CardCode}`}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  Details
                                </Link>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </Table>
                    ) : (
                      <div className="text-gray-500">
                        Clients table is empty!
                      </div>
                    )}
                  </div>
                </Dialog>
              </div>
              <div className="w-full flex justify-between items-center gap-4">
                <label>
                  Select Articles:<span className="text-rose-500">*</span>
                </label>
                <Button
                  onClick={() => setIsArticlesOpen(true)}
                  disabled={selectedClient.CardCode !== "" ? false : true}
                  className={`${
                    selectedClient.CardCode !== ""
                      ? "cursor-pointer hover:bg-sky-100 group"
                      : "cursor-not-allowed"
                  } border border-sky-500 rounded h-8 bg-sky-50 transition-colors`}
                >
                  <div className="flex flex-row items-center gap-x-1">
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
                  headerText="Available Articles"
                  open={isArticlesOpen}
                >
                  <Articles
                    selectedArticles={selectedArticles}
                    setSelectedArticles={setSelectedArticles}
                    selectedClientCardCode={selectedClient.CardCode}
                  />
                </Dialog>
              </div>
            </div>
            <button
              onClick={createOrder}
              disabled={
                selectedArticles.length !== 0 && selectedClient.CardCode !== ""
                  ? false
                  : true
              }
              className={`${
                selectedArticles.length !== 0 && selectedClient.CardCode !== ""
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
          <DisplaySelectedClient
            selectedClient={selectedClient}
            setSelectedClient={(value) => setSelectedClient(value)}
          />
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-y-6">
          <DisplaySelectedArticles
            selectedArticles={selectedArticles}
            setSelectedArticles={setSelectedArticles}
            isArticlesOpen={isArticlesOpen}
            setIsArticlesOpen={setIsArticlesOpen}
            setPromotionArticles={setPromotionArticles}
            setSelectedPromotionArticles={setSelectedPromotionArticles}
          />
          <div className="w-full flex justify-between items-start">
            <button
              type="button"
              className="border text-white py-1.5 bg-teal-500 hover:bg-teal-600 transition-colors"
              onClick={searchPromotions}
            >
              Search promotions
            </button>
            <div className="flex justify-end items-center flex-wrap gap-3">
              {isPromotionLoading && (
                <BusyIndicator
                  active={true}
                  size="M"
                  className="text-amber-500"
                />
              )}
              {Object.keys(promotionArticles).map((itemCode) => {
                const isPromotionArticles = promotionArticles[itemCode];
                return isPromotionArticles.length > 0 ? (
                  <div key={itemCode}>
                    <Button
                      onClick={() =>
                        setVisiblePromotions((prev) => ({
                          ...prev,
                          [itemCode]: true,
                        }))
                      }
                      className="border text-amber-500 text-sm py-1 bg-amber-50 border-amber-500 hover:bg-amber-100 hover:text-amber-600 hover:border-amber-600 transition-colors"
                    >
                      {itemCode} promotions
                    </Button>
                    <Dialog
                      footer={
                        <FlexBox
                          fitContainer
                          justifyContent="End"
                          style={{ paddingBlock: "0.25rem" }}
                        >
                          <Button
                            onClick={() =>
                              setVisiblePromotions((prev) => ({
                                ...prev,
                                [itemCode]: false,
                              }))
                            }
                          >
                            Close
                          </Button>
                        </FlexBox>
                      }
                      onClose={() =>
                        setVisiblePromotions((prev) => ({
                          ...prev,
                          [itemCode]: false,
                        }))
                      }
                      header={
                        <p className="w-full py-3 text-slate-600">
                          Select Promotion Articles for{" "}
                          <span className="text-emerald-500 font-medium">
                            {itemCode}
                          </span>
                        </p>
                      }
                      open={visiblePromotions[itemCode] || false}
                    >
                      <Promotions
                        promotionArticles={promotionArticles[itemCode] || []}
                        setPromotionArticles={(updatedList) =>
                          setPromotionArticles((prev) => ({
                            ...prev,
                            [itemCode]: updatedList,
                          }))
                        }
                        selectedPromotionArticles={
                          selectedPromotionArticles[itemCode] || []
                        }
                        setSelectedPromotionArticles={(updatedList) =>
                          updateSelectedPromotionArticles(itemCode, updatedList)
                        }
                      />
                    </Dialog>
                  </div>
                ) : null;
              })}
            </div>
          </div>
          <div className="space-y-2 w-full">
            <h1 className="text-xl font-semibold text-amber-500">
              Selected Promotions:
            </h1>
            <Table
              headerRow={
                <TableHeaderRow sticky className="bg-gray-100 h-11">
                  <TableHeaderCell minWidth="200px">
                    <span>Item Code</span>
                  </TableHeaderCell>
                  <TableHeaderCell minWidth="200px" width="auto">
                    <span>Item Name</span>
                  </TableHeaderCell>
                  <TableHeaderCell minWidth="200px">
                    <span>Family</span>
                  </TableHeaderCell>
                  <TableHeaderCell width="150px">
                    <span>Total Quantity</span>
                  </TableHeaderCell>
                </TableHeaderRow>
              }
              className="divide-y divide-gray-200 border"
            >
              {orderArticles.map((promotionArticle, index) => {
                return (
                  <TableRow
                    key={`${promotionArticle.ItemCode}-${index}`}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-stone-200 transition-colors duration-200`}
                  >
                    <TableCell className="px-4 py-2 whitespace-nowrap">
                      {promotionArticle.ItemCode}
                    </TableCell>
                    <TableCell className="px-4 py-2 whitespace-nowrap">
                      {promotionArticle.ItemName}
                    </TableCell>
                    <TableCell className="px-4 py-2 whitespace-nowrap">
                      {promotionArticle.U_PromoFamily}
                    </TableCell>
                    <TableCell className="px-4 py-2 whitespace-nowrap">
                      {promotionArticle.Quantity}
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          </div>
        </div>
        <Toast
          onClose={function Js() {
            setOrderCreated({ sucess: orderCreated.sucess, visible: false });
          }}
          open={orderCreated.visible}
          placement="BottomEnd"
          duration={4000}
          className={`${
            orderCreated.sucess
              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
              : "bg-rose-100 text-rose-800 border-rose-300"
          } border px-3 py-2`}
        >
          <div className="flex justify-center items-center gap-1.5">
            <Icon
              name={orderCreated.sucess ? "accept" : "decline"}
              className={
                orderCreated.sucess ? "text-emerald-500" : "text-rose-600"
              }
            />
            <span>
              {orderCreated.sucess
                ? "Your order was created!"
                : "Your order was rejected!"}
            </span>
          </div>
        </Toast>
      </div>
    </>
  );
}
