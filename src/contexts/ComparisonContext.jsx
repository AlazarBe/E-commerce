import { useEffect, useState, useContext } from "react";
import { ComparisonContext } from "./comparisonContext";
import { ProductContext } from "./productContext";

function ComparisonProvider({ children }) {
  const { products } = useContext(ProductContext)
  const [compareList, setCompareList] = useState(() => {
    const savedCompareList = localStorage.getItem("compareList");
    return savedCompareList ? JSON.parse(savedCompareList) : [];
  });

  useEffect(() => {
    localStorage.setItem("compareList", JSON.stringify(compareList));
  }, [compareList]);
  useEffect(() => {
    setCompareList((prevList) =>
      prevList.filter((item) =>
        products.some((product) => product.id === item.id)
      )
    );
  }, [products]);

  const addToCompare = (product) => {
    setCompareList((prevList) => {
      const alreadyExists = prevList.some((item) => item.id === product.id);

      if (alreadyExists) return prevList;

      if (prevList.length >= 3) {
        alert("You can compare a maximum of 3 products.");
        return prevList;
      }

      return [...prevList, product];
    });
  };

  const removeFromCompare = (productId) => {
    setCompareList((prevList) =>
      prevList.filter((item) => item.id !== productId),
    );
  };

  const isInCompare = (productId) => {
    return compareList.some((item) => item.id === productId);
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <ComparisonContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export default ComparisonProvider;
