import { useEffect, useState, useContext } from "react";
import { WishListContext } from "./wishListContext";
import { ProductContext } from "./productContext";
function WishListProvider({ children }) {
  const { products } = useContext(ProductContext)
  const [wishList, setWishList] = useState(() => {
    const savedWishList = localStorage.getItem("wishList");

    return savedWishList ? JSON.parse(savedWishList) : [];
  });

  useEffect(() => {
    localStorage.setItem("wishList", JSON.stringify(wishList));
  }, [wishList]);
  useEffect(() => {
    setWishList((prevWishList) =>
      prevWishList.filter((item) =>
        products.some((product) => product.id === item.id)
      )
    );
  }, [products]);

  const addToWishList = (product) => {
    setWishList((prevWishList) => {
      const alreadyExist = prevWishList.some((item) => item.id === product.id);
      if (alreadyExist) {
        return prevWishList;
      }

      return [...prevWishList, product];
    });
  };

  const removeFromWishList = (productid) => {
    setWishList((prevWishList) =>
      prevWishList.filter((item) => item.id !== productid),
    );
  };

  const isInWishList = (productId) => {
    return wishList.some((item) => item.id === productId);
  };
  return (
    <WishListContext.Provider
      value={{
        wishList,
        setWishList,
        addToWishList,
        removeFromWishList,
        isInWishList,
      }}
    >
      {children}
    </WishListContext.Provider>
  );
}

export default WishListProvider;
