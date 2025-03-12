import {
  Button,
  Dialog,
  FlexBox,
  StepInput,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableRowAction,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import Articles from "./Articles";

export default function DisplaySelectedArticles({
  selectedArticles,
  setSelectedArticles,
  isArticlesOpen,
  setIsArticlesOpen,
  setPromotionArticlesMap,
  setSelectedPromotionArticlesMap,
}) {
  function deleteArticle(selectedItemCode) {
    setSelectedArticles((prv) => {
      return [...prv.filter((item) => item.ItemCode != selectedItemCode)];
    });

    setPromotionArticlesMap((prev) => {
      const newMap = { ...prev };
      delete newMap[selectedItemCode];
      return newMap;
    });

    setSelectedPromotionArticlesMap((prev) => {
      const newMap = { ...prev };
      delete newMap[selectedItemCode];
      return newMap;
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
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-sky-500">
            Selected Articles
          </h1>
          <Button
            onClick={() => setIsArticlesOpen(true)}
            className="border border-sky-500 bg-sky-50 hover:bg-sky-100 transition-colors group"
          >
            <div className="flex flex-row items-center gap-x-1">
              <span className="text-sky-500 group-hover:text-sky-600 transition-colors">
                Select Articles
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                height={12}
                width={10.5}
                className="fill-sky-500 group-hover:fill-sky-600"
              >
                <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
              </svg>
            </div>
          </Button>
          <Dialog
            footer={
              <FlexBox
                fitContainer
                justifyContent="End"
                style={{ paddingBlock: "0.25rem" }}
              >
                <Button onClick={() => setIsArticlesOpen(false)}>Close</Button>
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
              <TableHeaderCell width="150px">
                <span>Quantity</span>
              </TableHeaderCell>
              <TableHeaderCell minWidth="55px" width="55px">
                <span>Actions</span>
              </TableHeaderCell>
            </TableHeaderRow>
          }
          rowActionCount={1}
          className="max-w-full h-auto max-h-[300px] overflow-y-auto divide-y divide-gray-200 border"
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
              </TableRow>
            );
          })}
        </Table>
      </div>
    </>
  );
}
