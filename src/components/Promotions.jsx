import {
  StepInput,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@ui5/webcomponents-react";

export default function Promotions({
  promotionArticles,
  setPromotionArticles,
  selectedPromotions,
  updateSelectedPromotions,
}) {
  const totalQuantity = promotionArticles[0]?.U_QtyFree ?? 0;
  const selectedQuantity = selectedPromotions.reduce(
    (acc, cur) => acc + cur.Quantity,
    0,
  );
  const remainingQuantity = totalQuantity - selectedQuantity;

  function handleQuantityChange(e, selectedItem) {
    let inputVal = Number(e.target.value);
    if (inputVal < 0) return;
    const allowedMax = selectedItem.Quantity + remainingQuantity;
    if (inputVal > allowedMax) {
      inputVal = allowedMax;
    }
    const newValue = inputVal;
    const existing = selectedPromotions.find(
      (x) => x.ItemCode === selectedItem.ItemCode,
    );
    const oldQty = existing ? existing.Quantity : 0;
    const currentTotal = selectedPromotions.reduce(
      (acc, cur) => acc + cur.Quantity,
      0,
    );
    const newTotal = currentTotal - oldQty + newValue;
    if (newValue >= 0 && newTotal <= totalQuantity) {
      const updatedPromotionArticles = promotionArticles.map((x) =>
        x.ItemCode === selectedItem.ItemCode ? { ...x, Quantity: newValue } : x,
      );
      setPromotionArticles(updatedPromotionArticles);
      if (newValue > 0) {
        if (existing) {
          const updatedSelected = selectedPromotions.map((x) =>
            x.ItemCode === selectedItem.ItemCode
              ? { ...x, Quantity: newValue }
              : x,
          );
          updateSelectedPromotions(updatedSelected);
        } else {
          updateSelectedPromotions([
            ...selectedPromotions,
            { ...selectedItem, Quantity: newValue },
          ]);
        }
      } else {
        const filteredSelected = selectedPromotions.filter(
          (x) => x.ItemCode !== selectedItem.ItemCode,
        );
        updateSelectedPromotions(filteredSelected);
      }
    }
  }

  return (
    <>
      {promotionArticles.length !== 0 ? (
        <div className="flex flex-col justify-center w-full h-full gap-3">
          <h1 className="text-lg font-medium text-slate-700">
            Remaining Quantity:{" "}
            <span className="text-emerald-500">{remainingQuantity}</span>
          </h1>
          <Table
            headerRow={
              <TableHeaderRow sticky className="bg-gray-100">
                <TableHeaderCell minWidth="200px">
                  <span>Item Code</span>
                </TableHeaderCell>
                <TableHeaderCell minWidth="200px" width="auto">
                  <span>Item Name</span>
                </TableHeaderCell>
                <TableHeaderCell width="150px">
                  <span>Quantity</span>
                </TableHeaderCell>
              </TableHeaderRow>
            }
            className="h-[400px] divide-y divide-gray-200 border overflow-y-auto"
          >
            {promotionArticles.map((promotionArticle, index) => {
              const isPromotionSelected = selectedPromotions.some(
                (item) => item.ItemCode === promotionArticle.ItemCode,
              );
              return (
                <TableRow
                  key={promotionArticle.ItemCode}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                    isPromotionSelected && "bg-emerald-300/20"
                  } hover:bg-stone-200 transition-colors duration-200`}
                >
                  <TableCell className="px-4 py-1.5 whitespace-nowrap">
                    {promotionArticle.ItemCode}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 whitespace-nowrap">
                    {promotionArticle.ItemName}
                  </TableCell>
                  <TableCell className="px-4 py-1.5 whitespace-nowrap">
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
        </div>
      ) : (
        <span className="p-4 text-center text-gray-500">
          There is no promotion articles!
        </span>
      )}
    </>
  );
}
