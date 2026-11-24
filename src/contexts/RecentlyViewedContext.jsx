import { useState, useEffect, useCallback, useContext } from "react";
import { RecentlyViewedContext } from "./recentlyViewedContext";
import { ProductContext } from "./productContext";

function RecentlyViewedProvider({ children }) {
  const { products } = useContext(ProductContext)
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const savedProducts = localStorage.getItem("recentlyViewed");
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  useEffect(() => {
    localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    setRecentlyViewed((prevProducts) =>
      prevProducts.filter((item) =>
        products.some((product) => product.id === item.id)
      )
    );
  }, [products]);
  const addToRecentlyViewed = useCallback((product) => {
    setRecentlyViewed((prevProducts) => {
      const updateProducts = [
        product,
        ...prevProducts.filter((item) => item.id !== product.id),
      ];
      return updateProducts.slice(0, 8);
    });
  }, []);

  const removeFromRecentlyViewed = useCallback((productId) => {
    setRecentlyViewed((prevProducts) =>
      prevProducts.filter((item) => item.id !== productId)
    );
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
  }, []);

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addToRecentlyViewed,
        removeFromRecentlyViewed,
        clearRecentlyViewed,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export default RecentlyViewedProvider;
