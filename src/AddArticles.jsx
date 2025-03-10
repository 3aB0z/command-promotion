import { useEffect, useState } from "react";
import Articles from "./Articles";
import {
  BusyIndicator,
  Button,
  Dialog,
  FlexBox,
} from "@ui5/webcomponents-react";
import DisplaySelectedArticles from "./DisplaySelectedArticles";
import axios from "axios";
import Promotions from "./Promotions";

export default function AddArticles() {
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [promotionArticlesMap, setPromotionArticlesMap] = useState({});
  const [selectedPromotionArticlesMap, setSelectedPromotionArticlesMap] =
    useState({});
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [visiblePromotions, setVisiblePromotions] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  async function fetchPromotions(article) {
    try {
      const response = await axios.get(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/PROMOTIONS?$select=U_QtyRequired,U_QtyFree,U_ArticleFamily,U_PromoFamily&$filter=U_ArticleFamily eq '${article.U_Family}'`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data.value;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function fetchPromotionArticles(article) {
    try {
      const response = await axios.get(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/$crossjoin(Items,PROMOTIONS)?$expand=PROMOTIONS($select=U_QtyRequired,U_QtyFree,U_ArticleFamily,U_PromoFamily),Items($select=ItemCode,ItemName,U_Family)&$filter=Items/U_Family eq '${article.U_Family}' and PROMOTIONS/U_ArticleFamily eq '${article.U_Family}' and PROMOTIONS/U_QtyRequired le ${article.Quantity}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data.value.map((item) => ({
        ItemCode: item.Items.ItemCode,
        ItemName: item.Items.ItemName,
        U_Family: item.Items.U_Family,
        U_ArticleFamily: item.PROMOTIONS.U_ArticleFamily,
        U_PromoFamily: item.PROMOTIONS.U_PromoFamily,
        U_QtyFree: item.PROMOTIONS.U_QtyFree,
        U_QtyRequired: item.PROMOTIONS.U_QtyRequired,
        Quantity: 0,
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function searchPromotions() {
    setIsLoading(true);
    const filteredArticles = selectedArticles.reduce((acc, article) => {
      if (
        article.U_Family &&
        !acc.some((item) => item.U_Family === article.U_Family)
      ) {
        acc.push(article);
      }
      return acc;
    }, []);

    const promotionsData = (
      await Promise.all(filteredArticles.map(fetchPromotions))
    ).flat();
    setPromotions(promotionsData);

    const newPromotionArticlesMap = {};
    for (const promo of promotionsData) {
      const promoArticles = await fetchPromotionArticles(
        selectedArticles.find((item) => item.U_Family === promo.U_ArticleFamily)
      );
      newPromotionArticlesMap[promo.U_ArticleFamily] = promoArticles;
    }

    setPromotionArticlesMap(newPromotionArticlesMap);
    setSelectedPromotionArticlesMap({});
    setIsLoading(false);
  }

  function updateSelectedPromotionArticles(family, updatedList) {
    setSelectedPromotionArticlesMap((prev) => ({
      ...prev,
      [family]: updatedList,
    }));
  }

  useEffect(() => {
    searchPromotions();
  }, [selectedArticles.length]);

  return (
    <>
      <div className="w-full h-full flex flex-col justify-center items-center p-6 gap-y-5">
        <form
          method="POST"
          className="flex w-96 flex-col space-y-3 bg-slate-50 px-6 py-4 rounded-lg"
        >
          <div className="flex justify-between items-center">
            <label>Articles:</label>
            <Button
              onClick={() => setIsArticlesOpen(true)}
              className="border border-blue-500 bg-blue-50"
            >
              Select Articles
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
              />
            </Dialog>
          </div>
          <button
            type="submit"
            className="border text-white py-1.5 bg-blue-500"
            onClick={(e) => e.preventDefault()}
          >
            Submit
          </button>
        </form>
        <DisplaySelectedArticles
          selectedArticles={selectedArticles}
          setSelectedArticles={setSelectedArticles}
        />
        <div className="w-full flex justify-between items-center">
          <button
            type="button"
            className="border text-white py-1.5 bg-emerald-500 hover:border-emerald-600 hover:bg-emerald-600 transition-colors"
            onClick={searchPromotions}
          >
            Search for promotions
          </button>
          <div className="flex items-center gap-x-3">
            <BusyIndicator active={isLoading} size="S" />
            {Object.keys(promotionArticlesMap).map((family) => {
              const promotionArticles = promotionArticlesMap[family];
              return promotionArticles.length > 0 ? (
                <div key={family}>
                  <Button
                    onClick={() =>
                      setVisiblePromotions((prev) => ({
                        ...prev,
                        [family]: true,
                      }))
                    }
                    className="border text-emerald-500 text-base py-1.5 bg-emerald-50 border-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 hover:border-emerald-600 transition-colors"
                  >
                    {family} promotions
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
                              [family]: false,
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
                        [family]: false,
                      }))
                    }
                    header={
                      <p className="w-full py-3 text-slate-600">
                        Select Promotion Articles for{" "}
                        <span className="text-emerald-500 font-medium">
                          {family}
                        </span>
                      </p>
                    }
                    open={visiblePromotions[family] || false}
                  >
                    <Promotions
                      promotionArticles={promotionArticles}
                      setPromotionArticles={(updatedList) =>
                        setPromotionArticlesMap((prev) => ({
                          ...prev,
                          [family]: updatedList,
                        }))
                      }
                      selectedPromotionArticles={
                        selectedPromotionArticlesMap[family] || []
                      }
                      setSelectedPromotionArticles={(updatedList) =>
                        updateSelectedPromotionArticles(family, updatedList)
                      }
                      promotions={promotions}
                    />
                  </Dialog>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </>
  );
}
