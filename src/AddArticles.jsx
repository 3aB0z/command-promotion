import { useState } from "react";
import {
  BusyIndicator,
  Button,
  Dialog,
  FlexBox,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@ui5/webcomponents-react";
import DisplaySelectedArticles from "./DisplaySelectedArticles";
import axios from "axios";
import Promotions from "./Promotions";

export default function AddArticles() {
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [promotionArticles, setPromotionArticles] = useState({});
  const [selectedPromotionArticles, setSelectedPromotionArticles] = useState(
    {}
  );
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [visiblePromotions, setVisiblePromotions] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

      // Combiner les données
      return itemsResponse.data.value.map((item) => ({
        ItemCode: item.ItemCode,
        ItemName: item.ItemName,
        U_Family: item.U_Family,
        U_ArticleFamily: article.U_Family,
        U_PromoFamily: promoFamily,
        U_QtyFree: promotionsResponse.data.value[0].U_QtyFree,
        U_QtyRequired: promotionsResponse.data.value[0].U_QtyRequired,
        Quantity: 0,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des promotions:", error);
      return [];
    }
  }

  async function searchPromotions() {
    setIsLoading(true);
    try {
      const newResults = await Promise.all(
        selectedArticles.map(async (item) => {
          return await fetchPromotionArticles(item);
        })
      );

      setPromotionArticles((prev) => {
        const updated = { ...prev };
        selectedArticles.forEach((article, index) => {
          if (!updated[article.ItemCode]) {
            updated[article.ItemCode] = newResults[index];
          }
        });
        return updated;
      });
    } catch (error) {
      console.error("Promotions fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function updateSelectedPromotionArticles(itemCode, updatedList) {
    setSelectedPromotionArticles((prev) => ({
      ...prev,
      [itemCode]: updatedList,
    }));
  }

  const aggregatedPromotions = Object.values(selectedPromotionArticles)
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

  return (
    <>
      <div className="relative w-full flex flex-col justify-center items-center gap-y-7">
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
            className="border text-white py-1.5 bg-emerald-400 border-none hover:bg-emerald-500 transition-colors min-w-fit"
            onClick={searchPromotions}
          >
            Search for promotions
          </button>
          <div className="flex justify-end items-center flex-wrap gap-3">
            <BusyIndicator
              active={isLoading}
              size="M"
              className="text-amber-500"
            />
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
            {aggregatedPromotions.map((promotionArticle, index) => {
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
    </>
  );
}
