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
  const [promotionArticlesMap, setPromotionArticlesMap] = useState({});
  const [selectedPromotionArticlesMap, setSelectedPromotionArticlesMap] =
    useState({});
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [visiblePromotions, setVisiblePromotions] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  async function fetchPromotionArticles(article) {
    try {
      const promoFamilyResponse = await axios.get(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/PROMOTIONS?$select=U_PromoFamily&$filter=U_ArticleFamily eq '${article.U_Family}'`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      const promoFamily = promoFamilyResponse.data.value[0]?.U_PromoFamily;
      if (!promoFamily) return [];

      const response = await axios.get(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/Items?$select=ItemCode,ItemName,U_Family&$filter=U_Family eq '${promoFamily}'`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      const promotionsResponse = await axios.get(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/PROMOTIONS?$select=U_QtyRequired,U_QtyFree,U_ArticleFamily,U_PromoFamily&$filter=U_ArticleFamily eq '${article.U_Family}' and U_QtyRequired le ${article.Quantity}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      return response.data.value.map((item) => {
        const promotion = promotionsResponse.data.value.find(
          (p) => p.U_PromoFamily === item.U_Family
        );
        return {
          ItemCode: item.ItemCode,
          ItemName: item.ItemName,
          U_Family: item.U_Family,
          U_ArticleFamily: article.U_Family,
          U_PromoFamily: item.U_Family,
          U_QtyFree: promotion?.U_QtyFree || 0,
          U_QtyRequired: promotion?.U_QtyRequired || 0,
          Quantity: 0,
        };
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function searchPromotions() {
    setIsLoading(true);
    const results = await Promise.all(
      selectedArticles.map((item) => fetchPromotionArticles(item))
    );
    const newMap = {};
    selectedArticles.forEach((article, index) => {
      newMap[article.ItemCode] = results[index];
    });
    console.log(results, newMap);
    setPromotionArticlesMap(newMap);
    setSelectedPromotionArticlesMap({});
    setIsLoading(false);
  }

  function updateSelectedPromotionArticles(itemCode, updatedList) {
    setSelectedPromotionArticlesMap((prev) => ({
      ...prev,
      [itemCode]: updatedList,
    }));
  }

  return (
    <>
      <div className="relative w-full flex flex-col justify-center items-center p-6 gap-y-7 top-[69px]">
        <DisplaySelectedArticles
          selectedArticles={selectedArticles}
          setSelectedArticles={setSelectedArticles}
          isArticlesOpen={isArticlesOpen}
          setIsArticlesOpen={setIsArticlesOpen}
          setPromotionArticlesMap={setPromotionArticlesMap}
          setSelectedPromotionArticlesMap={setSelectedPromotionArticlesMap}
        />
        <div className="w-full flex justify-between items-center">
          <button
            type="button"
            className="border text-white py-1.5 bg-emerald-400 border-none hover:bg-emerald-500 transition-colors"
            onClick={searchPromotions}
          >
            Search for promotions
          </button>
          <div className="flex justify-end items-center flex-wrap gap-3">
            <BusyIndicator
              active={isLoading}
              size="M"
              className="text-amber-500 p-1"
            />
            {Object.keys(promotionArticlesMap).map((itemCode) => {
              const promotionArticles = promotionArticlesMap[itemCode];
              return promotionArticles.length > 0 ? (
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
                      promotionArticles={promotionArticlesMap[itemCode] || []}
                      setPromotionArticles={(updatedList) =>
                        setPromotionArticlesMap((prev) => ({
                          ...prev,
                          [itemCode]: updatedList,
                        }))
                      }
                      selectedPromotionArticles={
                        selectedPromotionArticlesMap[itemCode] || []
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
        {Object.keys(selectedPromotionArticlesMap).map((itemCode) => {
          return (
            selectedPromotionArticlesMap[itemCode].length > 0 && (
              <div key={itemCode} className="space-y-2 w-full">
                <h1 className="text-xl font-semibold text-amber-500">
                  Selected {itemCode} Promotions:
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
                        <span>Quantity</span>
                      </TableHeaderCell>
                    </TableHeaderRow>
                  }
                  className="divide-y divide-gray-200 border"
                >
                  {selectedPromotionArticlesMap[itemCode].map(
                    (promotionArticle, index) => {
                      const isPromotionSelected = selectedPromotionArticlesMap[
                        itemCode
                      ].some(
                        (item) => item.ItemCode === promotionArticle.ItemCode
                      );
                      return (
                        <TableRow
                          key={`${promotionArticle.ItemCode}-${index}`}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } ${
                            isPromotionSelected && "bg-emerald-100"
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
                    }
                  )}
                </Table>
              </div>
            )
          );
        })}
      </div>
    </>
  );
}
