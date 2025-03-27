import axios from "axios";
import { useEffect, useState } from "react";
import {
  TableRow,
  TableCell,
  Table,
  TableHeaderRow,
  TableHeaderCell,
  CheckBox,
} from "@ui5/webcomponents-react";

export default function Articles({
  selectedArticles,
  setSelectedArticles,
  selectedClient,
  setIsArticlesLoading,
}) {
  const [articles, setArticles] = useState([]);

  function handleArticleSelection(e, selectedArticle) {
    const deleteArticle = () => {
      setSelectedArticles((prv) => {
        return [
          ...prv.filter((item) => item.ItemCode != selectedArticle.ItemCode),
        ];
      });
    };

    const addArticle = () => {
      setSelectedArticles((prv) => {
        return [
          ...prv,
          {
            ...selectedArticle,
            Quantity: 1,
          },
        ];
      });
    };

    if (e.target.checked) {
      const isArticleSelected = selectedArticles.find(
        (item) => item.ItemCode == selectedArticle.ItemCode
      );
      if (isArticleSelected) {
        deleteArticle();
      } else {
        addArticle();
      }
    } else {
      deleteArticle();
    }
  }

  useEffect(() => {
    async function fetchArticles() {
      setIsArticlesLoading(true);
      setSelectedArticles([]);
      try {
        const warehouseCode = "SC061";
        const articlesResponse = await axios.get(
          `https://REDACTED_SAP_HOST:50000/b1s/v2/$crossjoin(Items,Items/ItemWarehouseInfoCollection)?$expand=Items($select=ItemCode,ItemName,U_Family),Items/ItemWarehouseInfoCollection($select=InStock)&$filter=Items/ItemWarehouseInfoCollection/WarehouseCode eq '${warehouseCode}' and Items/ItemCode eq Items/ItemWarehouseInfoCollection/ItemCode and Items/ItemWarehouseInfoCollection/InStock gt 0`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );
        async function fetchArticlePrice(article) {
          const priceParams = {
            ItemPriceParams: {
              CardCode: selectedClient.CardCode,
              ItemCode: article.ItemCode,
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
          return priceInfo;
        }
        const data = await Promise.all(
          articlesResponse.data.value.map(async (item) => {
            const articlePrice = await Promise.resolve(
              fetchArticlePrice(item.Items)
            );
            return {
              ItemCode: item.Items.ItemCode,
              ItemName: item.Items.ItemName,
              U_Family: item.Items.U_Family,
              PriceInfo: articlePrice,
              InStock: item["Items/ItemWarehouseInfoCollection"].InStock,
            };
          })
        );

        setArticles(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsArticlesLoading(false);
      }
    }

    setArticles([]);
    selectedClient.CardCode && fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient.CardCode]);

  return (
    <>
      <div className="flex justify-center items-center w-full h-full">
        {articles.length !== 0 ? (
          <Table
            headerRow={
              <TableHeaderRow sticky className="bg-gray-100">
                <TableHeaderCell minWidth="45px" horizontalAlign="Center">
                  <CheckBox
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedArticles(
                            articles.map((article) => ({
                              ...article,
                              Quantity: 1,
                            }))
                          )
                        : setSelectedArticles([])
                    }
                    checked={selectedArticles.length === articles.length}
                  />
                </TableHeaderCell>
                <TableHeaderCell minWidth="130px">
                  <span>Item Code</span>
                </TableHeaderCell>
                <TableHeaderCell minWidth="200px">
                  <span>Item Name</span>
                </TableHeaderCell>
                <TableHeaderCell minWidth="100px">
                  <span>Price</span>
                </TableHeaderCell>
                <TableHeaderCell minWidth="120px">
                  <span>In Stock</span>
                </TableHeaderCell>
              </TableHeaderRow>
            }
            className="h-[448px] divide-y divide-gray-200 border"
          >
            {articles.map((article, index) => {
              const isArticleSelected = selectedArticles.find(
                (item) => item.ItemCode == article.ItemCode
              );
              return (
                <TableRow
                  key={article.ItemCode}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                    isArticleSelected && "bg-emerald-300/20"
                  } hover:bg-stone-200 transition-colors duration-200`}
                >
                  <TableCell className="whitespace-nowrap">
                    <CheckBox
                      onChange={(e) => handleArticleSelection(e, article)}
                      checked={isArticleSelected ? true : false}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">
                    {article.ItemCode}
                  </TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">
                    {article.ItemName}
                  </TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">
                    {article.PriceInfo.Price}{" "}
                    {article.PriceInfo.Currency
                      ? article.PriceInfo.Currency
                      : "DH"}
                  </TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">
                    {article.InStock}
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        ) : (
          <span className="p-4 text-center text-gray-500">
            Articles table is empty!
          </span>
        )}
      </div>
    </>
  );
}
