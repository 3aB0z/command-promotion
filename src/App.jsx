import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import CommandePromotion from "./CommandePromotion";
import Navbar from "./components/Navbar";
import {
  Bar,
  BusyIndicator,
  Button,
  DynamicPage,
  DynamicPageHeader,
  DynamicPageTitle,
  Icon,
} from "@ui5/webcomponents-react";
import Popup from "./components/Popup";

function App() {
  const [selectedClient, setSelectedClient] = useState({
    CardCode: "",
    CardName: "",
    CardType: "",
  });
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [promotionArticles, setPromotionArticles] = useState({});
  const [selectedPromotions, setSelectedPromotions] = useState({});
  const [notification, setNotification] = useState({
    sucess: true,
    visible: false,
    message: "",
  });
  const [visiblePromotions, setVisiblePromotions] = useState({});
  const [isPromotionLoading, setIsPromotionLoading] = useState(false);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const selectedPromotionArticles = useMemo(() => {
    return Object.values(selectedPromotions)
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
  }, [selectedPromotions]);

  const isSelectedArticlesAllowed =
    selectedArticles.length !== 0 && selectedClient.CardCode;

  async function searchPromotions() {
    setIsPromotionLoading(true);
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
          `https://REDACTED_SAP_HOST:50000/b1s/v2/Items?$select=ItemCode,ItemName&$filter=U_Family eq '${promoFamily}'`,
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
          U_ArticleFamily: article.U_Family,
          U_PromoFamily: promoFamily,
          U_QtyFree: promotionsResponse.data.value[0].U_QtyFree,
          U_QtyRequired: promotionsResponse.data.value[0].U_QtyRequired,
          PriceInfo: { Price: 0 },
          Quantity: 0,
        }));
      } catch (error) {
        console.error("Error while fetch promotions:", error);
        return [];
      }
    }

    try {
      const results = await Promise.all(
        selectedArticles.map(async (item) => await fetchPromotionArticles(item))
      );
      if (results.some((item) => item.length !== 0)) {
        const nonEmptyPromotions = {};
        selectedArticles.forEach((article, index) => {
          const promotions = results[index];
          if (promotions && promotions.length > 0) {
            nonEmptyPromotions[article.ItemCode] = promotions;
          }
        });
        setPromotionArticles(nonEmptyPromotions);
        setSelectedPromotions({});
        setNotification({
          message: "Promotions found!",
          sucess: true,
          visible: true,
        });
      } else {
        setNotification({
          message: "No promotions found!",
          sucess: false,
          visible: true,
        });
      }
    } catch (error) {
      setNotification({
        message: error.response.data.error.message,
        sucess: false,
        visible: true,
      });
      console.error("Promotions fetch failed:", error);
    } finally {
      setIsPromotionLoading(false);
    }
  }

  async function createOrder() {
    setIsOrderLoading(true);
    const documentLines = [
      ...selectedArticles,
      ...selectedPromotionArticles,
    ].map((article) => {
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
      cancel();
      setNotification({
        message: "Your order was created!",
        sucess: true,
        visible: true,
      });
      console.log("Order Created Sucessfully: ", response);
    } catch (error) {
      setNotification({
        message: error.response.data.error.message,
        sucess: false,
        visible: true,
      });
      console.error(error.response.data.error.message);
    } finally {
      setIsOrderLoading(false);
    }
  }

  function cancel() {
    setSelectedArticles([]);
    setSelectedPromotions({});
    setPromotionArticles({});
    setVisiblePromotions({});
  }

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
        console.error("SAP Login Error:", error);
      }
    }

    loginToSAP();
  }, []);

  useEffect(() => {
    cancel();
  }, [selectedClient.CardCode]);

  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <Navbar />
        <DynamicPage
          className="h-full"
          headerArea={
            <DynamicPageHeader className="bg-[#3c5971] pb-6">
              <div className="flex gap-10">
                <ul className="flex flex-col gap-1">
                  <li className="text-slate-200 ml-1">Client</li>
                  <li className="flex items-center">
                    <Icon
                      name="feeder-arrow"
                      className="w-5 h-5 text-amber-600"
                    />
                    <span className="text-blue-300 text-sm custom-text-shadow">
                      {selectedClient.CardCode
                        ? selectedClient.CardCode
                        : "no client selected"}
                    </span>
                  </li>
                  <li className="text-white ml-1 font-medium custom-text-shadow">
                    {selectedClient?.CardName}
                  </li>
                </ul>
                <ul>
                  <li className="text-slate-200">Total</li>
                  <li className="text-white text-sm font-medium custom-text-shadow">
                    {totalPrice.toFixed(2)} DH
                  </li>
                </ul>
                <ul>
                  <li className="text-slate-300">Status</li>
                  <li className="text-green-300 text-sm font-medium custom-text-shadow">
                    Open
                  </li>
                </ul>
              </div>
            </DynamicPageHeader>
          }
          footerArea={
            <Bar
              className="bg-primary mr-6"
              design="FloatingFooter"
              startContent={
                <div className="flex items-center gap-4">
                  <Button
                    onClick={searchPromotions}
                    disabled={!isSelectedArticlesAllowed}
                    className={`${
                      isSelectedArticlesAllowed
                        ? "cursor-pointer bg-sky-300/70 hover:bg-sky-300/60"
                        : "cursor-not-allowed"
                    } bg-sky-300/80 text-white whitespace-nowrap`}
                  >
                    Search promotions
                  </Button>
                  <BusyIndicator
                    active={isPromotionLoading}
                    delay={1000}
                    size="M"
                    className="text-sky-400"
                  />
                </div>
              }
              endContent={
                <div className="flex items-center gap-4">
                  <Button
                    onClick={createOrder}
                    disabled={!isSelectedArticlesAllowed}
                    className={`${
                      isSelectedArticlesAllowed
                        ? "cursor-pointer bg-sky-300/70 hover:bg-sky-300/60"
                        : "cursor-not-allowed"
                    } bg-sky-300/80 transition-colors`}
                  >
                    <div className="flex items-center gap-2 whitespace-nowrap text-white">
                      <span>
                        {isOrderLoading ? "Creating" : "Create"} Order
                      </span>
                      {isOrderLoading && (
                        <BusyIndicator
                          active={true}
                          delay={0}
                          size="M"
                          className="text-teal-100"
                        />
                      )}
                    </div>
                  </Button>
                  <Button onClick={cancel} className="text-sky-200">
                    Cancel
                  </Button>
                </div>
              }
            />
          }
          showFooter={true}
          titleArea={
            <DynamicPageTitle
              className="bg-gradient-to-b from-primary to-[#3c5971]"
              heading={
                <h3
                  className="text-white text-2xl"
                  style={{ textShadow: "none" }}
                >
                  Commande Promotion
                </h3>
              }
              snappedHeading={
                <h3
                  className="text-white text-2xl"
                  style={{ textShadow: "none" }}
                >
                  Commande Promotion
                </h3>
              }
              actionsBar={
                <div className="flex flex-col items-end px-6">
                  <div>
                    <div className="w-fit text-slate-200">Total</div>
                    <div className="w-fit text-white text-sm font-medium custom-text-shadow">
                      {totalPrice.toFixed(2)} DH
                    </div>
                  </div>
                </div>
              }
            />
          }
        >
          <CommandePromotion
            selectedClient={selectedClient}
            setSelectedClient={(value) => setSelectedClient(value)}
            selectedArticles={selectedArticles}
            setSelectedArticles={(value) => setSelectedArticles(value)}
            promotionArticles={promotionArticles}
            setPromotionArticles={(value) => setPromotionArticles(value)}
            selectedPromotions={selectedPromotions}
            setSelectedPromotions={(value) => setSelectedPromotions(value)}
            visiblePromotions={visiblePromotions}
            setVisiblePromotions={(value) => setVisiblePromotions(value)}
            notification={notification}
            setNotification={(value) => setNotification(value)}
            selectedPromotionArticles={selectedPromotionArticles}
            setTotalPrice={(value) => setTotalPrice(value)}
          />
          <Popup
            notification={notification}
            setNotification={(value) => setNotification(value)}
          />
        </DynamicPage>
      </div>
    </>
  );
}

export default App;
