import { useEffect, useState } from "react";
import { Button, Dialog, FlexBox } from "@ui5/webcomponents-react";
import DisplaySelectedArticles from "./DisplaySelectedArticles";
import axios from "axios";
import Promotions from "./Promotions";
import DisplaySelectedClient from "./DisplaySelectedClient";
import OrderCreationForm from "./OrderCreationForm";
import DisplaySelectedPromotions from "./DisplaySelectedPromotions";
import Popup from "./Popup";

export default function CreateOrder() {
  const [selectedClient, setSelectedClient] = useState({
    CardCode: "",
    CardName: "",
    CardType: "",
  });
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [promotionArticles, setPromotionArticles] = useState({});
  const [selectedPromotions, setSelectedPromotions] = useState({});

  const [promotionsNotification, setIsPromotionFound] = useState({
    sucess: true,
    visible: false,
    message: "",
  });
  const [visiblePromotions, setVisiblePromotions] = useState({});
  const [isPromotionLoading, setIsPromotionLoading] = useState(false);

  async function searchPromotions() {
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
          PriceInfo: { Price: 0 },
          Quantity: 0,
        }));
      } catch (error) {
        console.error("Erreur lors de la récupération des promotions:", error);
        return [];
      }
    }

    try {
      setIsPromotionLoading(true);
      const results = await Promise.all(
        selectedArticles.map(async (item) => await fetchPromotionArticles(item))
      );
      console.log(results);
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
        setIsPromotionFound({
          message: "Promotions was found!",
          sucess: true,
          visible: true,
        });
      } else {
        setIsPromotionFound({
          message: "No promotions was found!",
          sucess: false,
          visible: true,
        });
      }
    } catch (error) {
      setIsPromotionFound({
        message: error.response.data.error.message,
        sucess: false,
        visible: true,
      });
      console.error("Promotions fetch failed:", error);
    } finally {
      setIsPromotionLoading(false);
    }
  }

  function updateSelectedPromotions(itemCode, updatedList) {
    updatedList.length !== 0
      ? setSelectedPromotions((prev) => ({
          ...prev,
          [itemCode]: updatedList,
        }))
      : delete selectedPromotions[itemCode];
  }

  const selectedPromotionArticles = Object.values(selectedPromotions)
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

  useEffect(() => {
    setSelectedArticles([]);
    setSelectedPromotions({});
    setPromotionArticles({});
    setVisiblePromotions({});
  }, [selectedClient.CardCode]);

  return (
    <>
      <div className="relative w-full flex flex-col justify-center items-center gap-y-16 p-4">
        <div className="w-full h-auto lg:h-[270px] flex flex-col lg:flex-row justify-evenly items-center gap-10 lg:gap-0">
          <OrderCreationForm
            selectedClient={selectedClient}
            setSelectedClient={(value) => setSelectedClient(value)}
            selectedArticles={selectedArticles}
            setSelectedArticles={(value) => setSelectedArticles(value)}
            setPromotionArticles={(value) => setPromotionArticles(value)}
            setSelectedPromotions={(value) => setSelectedPromotions(value)}
            selectedPromotionArticles={[
              ...selectedArticles,
              ...selectedPromotionArticles,
            ]}
            searchPromotions={searchPromotions}
            isPromotionLoading={isPromotionLoading}
          />
          <DisplaySelectedClient selectedClient={selectedClient} />
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-y-6">
          <div className="w-full flex justify-end items-center flex-wrap gap-3">
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
                    className="border text-sky-500 text-sm py-1 bg-sky-50 border-sky-500 hover:bg-sky-100 hover:text-sky-600 hover:border-sky-600 transition-colors"
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
                      selectedPromotions={selectedPromotions[itemCode] || []}
                      setSelectedPromotions={(updatedList) =>
                        updateSelectedPromotions(itemCode, updatedList)
                      }
                    />
                  </Dialog>
                </div>
              ) : null;
            })}
          </div>
          <DisplaySelectedArticles
            selectedArticles={selectedArticles}
            setSelectedArticles={setSelectedArticles}
            setPromotionArticles={setPromotionArticles}
            setSelectedPromotions={setSelectedPromotions}
          />
          <DisplaySelectedPromotions
            selectedPromotionArticles={selectedPromotionArticles}
          />
        </div>
        <Popup
          notification={promotionsNotification}
          setNotification={(value) => setIsPromotionFound(value)}
        />
      </div>
    </>
  );
}
