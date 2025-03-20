import {
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@ui5/webcomponents-react";

export default function DisplaySelectedPromotions({
  selectedPromotionArticles,
}) {
  return (
    <>
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
                <span>Quantity</span>
              </TableHeaderCell>
            </TableHeaderRow>
          }
          className="divide-y divide-gray-200 border"
        >
          {selectedPromotionArticles.map((promotionArticle, index) => {
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
    </>
  );
}
