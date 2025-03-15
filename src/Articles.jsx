import axios from "axios";
import { useEffect, useState } from "react";
import {
  TableRow,
  TableCell,
  Table,
  TableHeaderRow,
  TableHeaderCell,
} from "@ui5/webcomponents-react";

export default function Articles({ selectedArticles, setSelectedArticles }) {
  const [articles, setArticles] = useState([]);

  function handleArticleSelection(e, selectedArticle) {
    const deleteArticle = () => {
      setSelectedArticles((prv) => {
        return [
          ...prv.filter(
            (item) => item.ItemCode != selectedArticle.Items.ItemCode
          ),
        ];
      });
    };

    const addArticle = () => {
      setSelectedArticles((prv) => {
        return [
          ...prv,
          {
            ...selectedArticle.Items,
            InStock:
              selectedArticle["Items/ItemWarehouseInfoCollection"].InStock,
            Quantity: 1,
          },
        ];
      });
    };

    if (e.target.checked) {
      const isArticleSelected = selectedArticles.find(
        (item) => item.ItemCode == selectedArticle.Items.ItemCode
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
      const WarehouseCode = "SC061";
      const response = await axios.get(
        `https://REDACTED_SAP_HOST:50000/b1s/v2/$crossjoin(Items,Items/ItemWarehouseInfoCollection)?$expand=Items($select=ItemCode,ItemName,U_Family),Items/ItemWarehouseInfoCollection($select=InStock)&$filter=Items/ItemWarehouseInfoCollection/WarehouseCode eq '${WarehouseCode}' and Items/ItemCode eq Items/ItemWarehouseInfoCollection/ItemCode and Items/ItemWarehouseInfoCollection/InStock gt 0`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await response.data.value;

      setArticles(data);
    }

    fetchArticles();
  }, []);

  return (
    <>
      <div className="flex justify-center items-center w-full h-full">
        {articles.length !== 0 ? (
          <Table
            headerRow={
              <TableHeaderRow sticky className="bg-gray-100 h-11">
                <TableHeaderCell minWidth="45px">
                  <span></span>
                </TableHeaderCell>
                <TableHeaderCell minWidth="130px">
                  <span>Item Code</span>
                </TableHeaderCell>
                <TableHeaderCell minWidth="200px">
                  <span>Item Name</span>
                </TableHeaderCell>
                <TableHeaderCell minWidth="100px">
                  <span>Family</span>
                </TableHeaderCell>
                <TableHeaderCell minWidth="120px">
                  <span>In Stock</span>
                </TableHeaderCell>
              </TableHeaderRow>
            }
            className="h-[448px]"
          >
            {articles.map((article, index) => {
              const isArticleSelected = selectedArticles.find(
                (item) => item.ItemCode == article.Items.ItemCode
              );
              return (
                <TableRow
                  key={`${article.Items.ItemCode}-${article.Items.ItemName}`}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                    isArticleSelected && "bg-emerald-200/40"
                  } hover:bg-stone-200 transition-colors duration-200`}
                >
                  <TableCell className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      onChange={(e) => handleArticleSelection(e, article)}
                      checked={isArticleSelected ? true : false}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">
                    {article.Items.ItemCode}
                  </TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">
                    {article.Items.ItemName}
                  </TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">
                    {article.Items.U_Family}
                  </TableCell>
                  <TableCell className="px-4 py-2 whitespace-nowrap">
                    {article["Items/ItemWarehouseInfoCollection"].InStock}
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
