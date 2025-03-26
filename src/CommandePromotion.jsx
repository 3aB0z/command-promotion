import {
  BusyIndicator,
  Button,
  Dialog,
  FlexBox,
} from "@ui5/webcomponents-react";
import DisplaySelectedArticles from "./DisplaySelectedArticles";
import Promotions from "./components/Promotions";
import DisplaySelectedClient from "./DisplaySelectedClient";
import DisplaySelectedPromotions from "./DisplaySelectedPromotions";
import Popup from "./components/Popup";
import { useEffect, useState } from "react";

export default function CommandePromotion({
  selectedClient,
  setSelectedClient,
  selectedArticles,
  setSelectedArticles,
  selectedPromotions,
  setSelectedPromotions,
  promotionArticles,
  setPromotionArticles,
  notification,
  setNotification,
  visiblePromotions,
  setVisiblePromotions,
  selectedPromotionArticles,
  setTotalPrice,
}) {
  const [isPageLoading, setIsPageLoading] = useState(true);

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

  useEffect(() => {
    selectedClient.CardCode && setIsPageLoading(false);
  }, [selectedClient]);

  return (
    <>
      <div className="relative w-full flex flex-col justify-center items-center gap-y-16 py-5">
        {isPageLoading && (
          <div className="w-full h-full bg-black/20 absolute top-0 left-0 z-50 flex justify-center">
            <BusyIndicator
              active={isPageLoading}
              delay={1000}
              size="M"
              className="text-sky-700 mt-36"
            />
          </div>
        )}
        <div className="w-full flex flex-col lg:flex-row justify-evenly items-center gap-10">
          <DisplaySelectedClient
            selectedClient={selectedClient}
            setSelectedClient={(value) => setSelectedClient(value)}
            setNotification={(value) => setNotification(value)}
          />
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-y-6">
          <DisplaySelectedArticles
            selectedClient={selectedClient}
            selectedArticles={selectedArticles}
            setSelectedArticles={setSelectedArticles}
            setPromotionArticles={setPromotionArticles}
            setSelectedPromotions={setSelectedPromotions}
            setNotification={(value) => setNotification(value)}
            setTotalPrice={(value) => setTotalPrice(value)}
          />
          <div className="w-full flex justify-end items-center flex-wrap gap-3">
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
                    className="border text-sky-500 text-sm py-1 bg-sky-50 border-sky-500 hover:bg-sky-100 hover:text-sky-600 hover:border-sky-600 transition-colors"
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
                        Promotions for{" "}
                        <span className="text-emerald-500 font-medium">
                          {itemCode}
                        </span>
                      </p>
                    }
                    open={visiblePromotions[itemCode] || false}
                  >
                    <Promotions
                      promotionArticle={promotionArticles[itemCode] || []}
                      setPromotionArticles={(updatedList) =>
                        setPromotionArticles((prev) => ({
                          ...prev,
                          [itemCode]: updatedList,
                        }))
                      }
                      selectedPromotions={selectedPromotions[itemCode] || []}
                      updateSelectedPromotions={(updatedList) =>
                        updateSelectedPromotions(itemCode, updatedList)
                      }
                    />
                  </Dialog>
                </div>
              ) : null;
            })}
          </div>
          <DisplaySelectedPromotions
            selectedPromotionArticles={selectedPromotionArticles}
          />
        </div>
        <Popup
          notification={notification}
          setNotification={(value) => setNotification(value)}
        />
      </div>
    </>
  );
}
