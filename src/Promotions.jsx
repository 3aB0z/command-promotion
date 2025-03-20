import {
  StepInput,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@ui5/webcomponents-react";
import { useEffect, useState } from "react";

export default function Promotions({
  promotionArticles,
  setPromotionArticles,
  selectedPromotions,
  setSelectedPromotions,
}) {
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [remainingQuantity, setRemainingQuantity] = useState(0);

  function handleQuantityChange(e, selectedItem) {
    let inputVal = Number(e.target.value);
    if (inputVal < 0) return;
    const allowedMax = selectedItem.Quantity + remainingQuantity;
    if (inputVal > allowedMax) {
      inputVal = allowedMax;
    }
    const newValue = inputVal;
    const existing = selectedPromotions.find(
      (x) => x.ItemCode === selectedItem.ItemCode
    );
    const oldQty = existing ? existing.Quantity : 0;
    const currentTotal = selectedPromotions.reduce(
      (acc, cur) => acc + cur.Quantity,
      0
    );
    const newTotal = currentTotal - oldQty + newValue;
    if (newValue >= 0 && newTotal <= totalQuantity) {
      const updatedPromotionArticles = promotionArticles.map((x) =>
        x.ItemCode === selectedItem.ItemCode ? { ...x, Quantity: newValue } : x
      );
      setPromotionArticles(updatedPromotionArticles);
      if (newValue > 0) {
        if (existing) {
          const updatedSelected = selectedPromotions.map((x) =>
            x.ItemCode === selectedItem.ItemCode
              ? { ...x, Quantity: newValue }
              : x
          );
          setSelectedPromotions(updatedSelected);
        } else {
          setSelectedPromotions([
            ...selectedPromotions,
            { ...selectedItem, Quantity: newValue },
          ]);
        }
      } else {
        const filteredSelected = selectedPromotions.filter(
          (x) => x.ItemCode !== selectedItem.ItemCode
        );
        setSelectedPromotions(filteredSelected);
      }
    }
  }

  useEffect(() => {
    const total = selectedPromotions.reduce(
      (acc, cur) => acc + cur.Quantity,
      0
    );
    setSelectedQuantity(total);
  }, [selectedPromotions]);

  useEffect(() => {
    setRemainingQuantity(totalQuantity - selectedQuantity);
  }, [totalQuantity, selectedQuantity]);

  useEffect(() => {
    if (promotionArticles.length > 0 && promotionArticles[0].U_QtyFree) {
      setTotalQuantity(promotionArticles[0].U_QtyFree);
    } else {
      setTotalQuantity(3);
    }
  }, [promotionArticles]);

  return (
    <div className="flex flex-col justify-center items-start gap-y-4 w-full h-full">
      {promotionArticles.length !== 0 ? (
        <>
          <h1 className="text-xl font-medium text-slate-700">
            Remaining Quantity:{" "}
            <span className="text-emerald-500">{remainingQuantity}</span>
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
            className="h-[448px]"
          >
            {promotionArticles.map((promotionArticle, index) => {
              const isPromotionSelected = selectedPromotions.some(
                (item) => item.ItemCode === promotionArticle.ItemCode
              );
              return (
                <TableRow
                  key={promotionArticle.ItemCode}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
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
                    <StepInput
                      onValueStateChange={(e) =>
                        handleQuantityChange(e, promotionArticle)
                      }
                      valueState="None"
                      min={0}
                      max={promotionArticle.Quantity + remainingQuantity}
                      value={promotionArticle.Quantity}
                      className="rounded"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </>
      ) : (
        <span className="p-4 text-center text-gray-500">
          Promotion articles table is empty!
        </span>
      )}
    </div>
  );
}
