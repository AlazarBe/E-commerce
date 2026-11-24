import { useState, useEffect, useCallback } from "react";
import { OrderContext } from "./orderContext";

function OrderProvider({ children }) {
    const [orders, setOrders] = useState(() => {
        const savedOrders = localStorage.getItem("orders");
        return savedOrders ? JSON.parse(savedOrders) : [];
    });

    useEffect(() => {
        localStorage.setItem("orders", JSON.stringify(orders));
    }, [orders]);

    const addOrder = useCallback((order) => {
        setOrders((prevOrder) => [order, ...prevOrder]);
    }, []);

    const updateOrderStatus = useCallback((orderId, newStatus) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id === orderId && order.status !== "Cancelled"
                    ? { ...order, status: newStatus }
                    : order
            )
        );
    }, []);

    const cancelOrder = useCallback((orderId) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id === orderId && order.status === "Pending"
                    ? { ...order, status: "Cancelled" }
                    : order
            )
        );
    }, []);
    return (
        <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, cancelOrder }}>
            {children}
        </OrderContext.Provider>
    );
}

export default OrderProvider;
