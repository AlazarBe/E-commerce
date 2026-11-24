
import { useState, useEffect } from "react";
import { ProductContext } from "./productContext";
import productsData from "../data/products";

function ProductProvider({ children }) {
    const [products, setProducts] = useState(() => {
        try {
            const savedProducts = localStorage.getItem("products");
            return savedProducts ? JSON.parse(savedProducts) : productsData;
        } catch {
            return productsData;
        }
    });

    const [stockMovements, setStockMovements] = useState(() => {
        try {
            const savedMovements = localStorage.getItem("stockMovements");
            return savedMovements ? JSON.parse(savedMovements) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("products", JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem("stockMovements", JSON.stringify(stockMovements));
    }, [stockMovements]);

    const addStockMovement = (movement) => {
        setStockMovements((prev) => [movement, ...prev]);
    };

    return (
        <ProductContext.Provider
            value={{
                products,
                setProducts,
                stockMovements,
                addStockMovement,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
}

export default ProductProvider;
