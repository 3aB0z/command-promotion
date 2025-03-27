import { BusyIndicator } from "@ui5/webcomponents-react";
import DisplaySelectedArticles from "./DisplaySelectedArticles";
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
            setSelectedArticles={(value) => setSelectedArticles(value)}
            setPromotionArticles={(value) => setPromotionArticles(value)}
            promotionArticles={promotionArticles}
            visiblePromotions={visiblePromotions}
            setVisiblePromotions={(value) => setVisiblePromotions(value)}
            selectedPromotions={selectedPromotions}
            setSelectedPromotions={(value) => setSelectedPromotions(value)}
            setNotification={(value) => setNotification(value)}
            setTotalPrice={(value) => setTotalPrice(value)}
          />
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
