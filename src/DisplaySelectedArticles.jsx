import {
  BusyIndicator,
  Button,
  Dialog,
  FlexBox,
  Icon,
  Input,
  StepInput,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableRowAction,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { useEffect, useState } from "react";
import Articles from "./components/Articles";
import axios from "axios";
import Promotions from "./components/Promotions";

export default function DisplaySelectedArticles({
  selectedClient,
  selectedArticles,
  setSelectedArticles,
  setPromotionArticles,
  promotionArticles,
  selectedPromotions,
  setSelectedPromotions,
  visiblePromotions,
  setVisiblePromotions,
  setNotification,
  setTotalPrice,
}) {
  const [articleInputs, setArticleInputs] = useState({
    ItemCode: "",
    ItemName: "",
  });
  const [isArticleSearching, setIsArticleSearching] = useState(false);
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [isArticlesLoading, setIsArticlesLoading] = useState(false);

  function deleteArticle(selectedItemCode) {
    if (selectedItemCode) {
      setSelectedArticles((prev) =>
        prev.filter((item) => item.ItemCode !== selectedItemCode)
      );
      setPromotionArticles((prev) => {
        const newMap = { ...prev };
        delete newMap[selectedItemCode];
        return newMap;
      });
      setSelectedPromotions((prev) => {
        const newMap = { ...prev };
        delete newMap[selectedItemCode];
        return newMap;
      });
    }
  }

  function handleInputChange(e, selectedItemCode) {
    const value = Number(e.target.value);
    if (value > 0) {
      setSelectedArticles((prev) =>
        prev.map((item) =>
          item.ItemCode === selectedItemCode
            ? { ...item, Quantity: value }
            : item
        )
      );
    }
  }

  function updateSelectedPromotions(itemCode, updatedList) {
    setSelectedPromotions((prev) => {
      if (updatedList.length === 0) {
        const newObj = { ...prev };
        delete newObj[itemCode];
        return newObj;
      } else {
        return { ...prev, [itemCode]: updatedList };
      }
    });
  }

  async function searchArticleByCode(value) {
    if (!value) return;
    try {
      setIsArticleSearching(true);
      const warehouseCode = "SC061";
      const articlesResponse = await axios.get(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/$crossjoin(Items,Items/ItemWarehouseInfoCollection)?$expand=Items($select=ItemCode,ItemName,U_Family),Items/ItemWarehouseInfoCollection($select=InStock)&$filter=Items/ItemWarehouseInfoCollection/WarehouseCode eq '${warehouseCode}' and Items/ItemCode eq Items/ItemWarehouseInfoCollection/ItemCode and Items/ItemCode eq '${value}' and Items/ItemWarehouseInfoCollection/InStock gt 0`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      if (
        !articlesResponse.data.value ||
        articlesResponse.data.value.length === 0
      ) {
        setNotification({
          message: value + " not found!",
          sucess: false,
          visible: true,
        });
        console.error("Article not found by code:", value);
        return;
      }

      const priceParams = {
        ItemPriceParams: {
          CardCode: selectedClient.CardCode,
          ItemCode: value,
        },
      };

      const priceResponse = await axios.post(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/CompanyService_GetItemPrice`,
        priceParams,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      const priceInfo = {
        Price: priceResponse.data.Price,
        Currency: priceResponse.data.Currency,
      };

      const itemData = articlesResponse.data.value[0];
      const data = {
        ItemCode: itemData.Items.ItemCode,
        ItemName: itemData.Items.ItemName,
        U_Family: itemData.Items.U_Family,
        PriceInfo: priceInfo,
        Quantity: 1,
        InStock: itemData["Items/ItemWarehouseInfoCollection"].InStock,
      };

      const isArticleFound = selectedArticles.some(
        (item) => item.ItemCode.toUpperCase() === value
      );
      if (isArticleFound) {
        setNotification({
          message: `${value} is already exist!`,
          sucess: false,
          visible: true,
        });
        return;
      }

      setSelectedArticles((prev) => [...prev, data]);
      setArticleInputs((prv) => ({ ...prv, ItemCode: "" }));
    } catch (error) {
      setNotification({
        message: error.response.data.error.message,
        sucess: false,
        visible: true,
      });
      console.error("Error searching article by code:", error);
    } finally {
      setIsArticleSearching(false);
    }
  }

  useEffect(() => {
    const total = selectedArticles.reduce(
      (prev, curr) => prev + curr.PriceInfo.Price * curr.Quantity,
      0
    );
    setTotalPrice(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArticles]);

  return (
    <>
      <div className="space-y-2 w-full">
        <h1 className="text-xl font-semibold text-sky-500">Articles</h1>
        <Table
          headerRow={
            <TableHeaderRow sticky className="bg-gray-100 h-11">
              <TableHeaderCell width="200px">Item Code</TableHeaderCell>
              <TableHeaderCell minWidth="200px">Item Name</TableHeaderCell>
              <TableHeaderCell minWidth="100px">Price</TableHeaderCell>
              <TableHeaderCell minWidth="100px">In Stock</TableHeaderCell>
              <TableHeaderCell width="150px">Quantity</TableHeaderCell>
              <TableHeaderCell minWidth="100px">Total Price</TableHeaderCell>
              <TableHeaderCell minWidth="120px" horizontalAlign="Center">
                Promotion
              </TableHeaderCell>
            </TableHeaderRow>
          }
          rowActionCount={1}
          className="max-w-full max-h-[350px] overflow-y-auto divide-y divide-gray-200 border"
        >
          <TableRow>
            <TableCell className="relative flex items-center px-4 py-2 whitespace-nowrap">
              <Input
                value={articleInputs.ItemCode}
                onChange={(e) => {
                  searchArticleByCode(e.target.value.toUpperCase());
                  setArticleInputs((prev) => ({
                    ...prev,
                    ItemCode: e.target.value,
                  }));
                }}
                disabled={!selectedClient?.CardCode || isArticleSearching}
                type="Text"
              />
              <Button
                onClick={() => setIsArticlesOpen(true)}
                disabled={!selectedClient?.CardCode || isArticleSearching}
                className="absolute right-4"
              >
                <Icon name="product" className="mt-0.5" />
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
                    <span className="text-lg">Available Articles</span>
                    <BusyIndicator
                      active={isArticlesLoading}
                      delay={1000}
                      size="M"
                      className="text-sky-500"
                    />
                  </div>
                }
                open={isArticlesOpen}
              >
                <Articles
                  selectedArticles={selectedArticles}
                  setSelectedArticles={(value) => setSelectedArticles(value)}
                  selectedClient={selectedClient}
                  setIsArticlesLoading={(value) => setIsArticlesLoading(value)}
                />
              </Dialog>
            </TableCell>
            <TableCell className="px-4 py-2 whitespace-nowrap">
              <Input disabled type="Text" />
            </TableCell>
            <TableCell className="px-4 py-2 whitespace-nowrap text-slate-300">
              0
            </TableCell>
            <TableCell className="px-4 py-2 whitespace-nowrap text-slate-300">
              0
            </TableCell>
            <TableCell className="px-4 py-2 whitespace-nowrap">
              <StepInput disabled value={0} className="bg-white rounded" />
            </TableCell>
            <TableCell className="px-4 py-2 whitespace-nowrap bg-emerald-50/30 text-slate-300 border-x">
              0.00 DH
            </TableCell>
            <TableCell className="px-4 py-2 whitespace-nowrap text-slate-300" />
          </TableRow>
          {selectedArticles.map((article, index) => {
            const isPromotion = Object.keys(promotionArticles).find(
              (item) => item === article.ItemCode
            );
            return (
              <TableRow
                key={article.ItemCode}
                actions={
                  <TableRowAction
                    icon="delete"
                    onClick={() => deleteArticle(article.ItemCode)}
                  >
                    Delete
                  </TableRowAction>
                }
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-stone-200 transition-colors duration-200 group`}
              >
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  {article.ItemCode}
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  {article.ItemName}
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  {article.PriceInfo.Price} {article.PriceInfo.Currency}
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  {article.InStock}
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  <StepInput
                    onChange={(e) => handleInputChange(e, article.ItemCode)}
                    valueState="None"
                    min={1}
                    max={article.InStock}
                    value={article.Quantity}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } rounded`}
                  />
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap bg-emerald-50 group-hover:bg-emerald-100 border-x transition-colors">
                  {(article.PriceInfo.Price * article.Quantity).toFixed(2)}{" "}
                  {article.PriceInfo.Currency}
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  {isPromotion && promotionArticles[isPromotion].length > 0 ? (
                    <>
                      <Button
                        onClick={() =>
                          setVisiblePromotions((prev) => ({
                            ...prev,
                            [isPromotion]: !prev[isPromotion],
                          }))
                        }
                        className="bg-sky-50 text-sky-500 border rounded-sm"
                      >
                        <div className="flex justify-center items-center gap-2">
                          <span>Show</span>
                          <Icon
                            name="navigation-down-arrow"
                            className="text-sky-500"
                          />
                        </div>
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
                                  [isPromotion]: false,
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
                            [isPromotion]: false,
                          }))
                        }
                        header={
                          <p className="w-full py-3 text-slate-600 space-x-2">
                            <span className="text-lg font-semibold">
                              Promotions for
                            </span>
                            <span className="text-emerald-500 text-lg font-medium">
                              {isPromotion}
                            </span>
                          </p>
                        }
                        open={visiblePromotions[isPromotion] || false}
                      >
                        <Promotions
                          promotionArticles={
                            promotionArticles[isPromotion] || []
                          }
                          setPromotionArticles={(updatedList) =>
                            setPromotionArticles((prev) => ({
                              ...prev,
                              [isPromotion]: updatedList,
                            }))
                          }
                          selectedPromotions={
                            selectedPromotions[isPromotion] || []
                          }
                          updateSelectedPromotions={(updatedList) =>
                            updateSelectedPromotions(isPromotion, updatedList)
                          }
                        />
                      </Dialog>
                    </>
                  ) : (
                    <span>No promotion</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      </div>
    </>
  );
}
