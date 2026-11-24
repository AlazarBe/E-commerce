import { useContext } from "react";
import { OrderContext } from "../contexts/orderContext";

function AdminOrders() {
    const { orders, updateOrderStatus } = useContext(OrderContext); const totalOrders = orders.length

    return (
        <div className="admin-orders">
            <h2>Manage Orders</h2>
            <div className="admin-orders-list">
                <p>Total Orders: {totalOrders}</p>

                {orders.length === 0 ? (
                    <p>No orders have been placed yet.</p>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="admin-order-item">
                            <h3>Order #{order.id}</h3>
                            <p>Customer: {order.customer.name}</p>
                            <p>Total: {order.total} Birr</p>
                            <p>Status: {order.status}</p>
                            {order.status === "Cancelled" ? (
                                <p>This order has been cancelled.</p>
                            ) : (
                                <select
                                    value={order.status}
                                    onChange={(e) =>
                                        updateOrderStatus(order.id, e.target.value)
                                    }
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                </select>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AdminOrders;