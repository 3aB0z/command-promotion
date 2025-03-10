import {
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableRowAction,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/AllIcons.js";

export default function DisplaySelectedArticles({
  selectedArticles,
  setSelectedArticles,
}) {
  function deleteArticle(selectedItemCode) {
    setSelectedArticles((prv) => {
      return [...prv.filter((item) => item.ItemCode != selectedItemCode)];
    });
  }

  function handleInputChange(e, selectedItemCode) {
    const value = Number(e.target.value);

    if (value > 0) {
      setSelectedArticles((prv) => {
        return [
          ...prv.map((item) => {
            if (item.ItemCode == selectedItemCode) {
              return { ...item, Quantity: value };
            }
            return item;
          }),
        ];
      });
    }
  }

  return (
    <>
      <div className="space-y-2 w-full">
        <h1 className="text-xl font-semibold text-blue-500">
          Selected Articles
        </h1>
        <Table
          headerRow={
            <TableHeaderRow sticky className="bg-gray-100 h-11">
              <TableHeaderCell minWidth="100px" width="auto">
                <span>Item Code</span>
              </TableHeaderCell>
              <TableHeaderCell minWidth="200px" width="auto">
                <span>Item Name</span>
              </TableHeaderCell>
              <TableHeaderCell minWidth="100px" width="auto">
                <span>Family</span>
              </TableHeaderCell>
              <TableHeaderCell minWidth="100px" width="auto">
                <span>In Stock</span>
              </TableHeaderCell>
              <TableHeaderCell minWidth="100px" width="auto">
                <span>Quantity</span>
              </TableHeaderCell>
              <TableHeaderCell minWidth="100px" width="100px">
                <span>Actions</span>
              </TableHeaderCell>
            </TableHeaderRow>
          }
          rowActionCount={1}
          className="max-w-full h-auto max-h-[300px] overflow-y-auto border"
        >
          {selectedArticles.map((article, index) => {
            return (
              <TableRow
                actions={
                  <TableRowAction
                    icon="delete"
                    onClick={() => deleteArticle(article.ItemCode)}
                  >
                    Delete
                  </TableRowAction>
                }
                key={`${article.ItemCode}-${article.ItemName}`}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-stone-200 transition-colors duration-200`}
              >
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  {article.ItemCode}
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  {article.ItemName}
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  {article.U_Family}
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  {article.InStock}
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  <input
                    type="number"
                    min={1}
                    value={article.Quantity}
                    onChange={(e) => handleInputChange(e, article.ItemCode)}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } w-[80px] px-0.5 py-1 mx-0.5 rounded-sm`}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      </div>
    </>
  );
}
