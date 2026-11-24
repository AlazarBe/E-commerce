import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { OrderContext } from "../contexts/orderContext";
import { CartContext } from "../contexts/cartContext";
import { AuthContext } from "../contexts/authContext";
import "./OrderHistory.css";

function OrderHistory() {
  const { orders } = useContext(OrderContext);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext)
  const [readdedItemId, setReaddedItemId] = useState(null);
  const userOrders = orders.filter(
    (order) => order.userEmail === user.email
  );

  const handleBuyAgain = (item) => {
    addToCart(item, 1);
    setReaddedItemId(item.id);
    setTimeout(() => {
      setReaddedItemId(null);
    }, 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently placed";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently placed";
    }
  };

  return (
    <div className="order-history-page">
      <header className="order-history-header">
        <div>
          <p className="order-history-eyebrow">Your Account</p>
          <h1>My Orders</h1>
          <p className="order-history-description">
            Review past orders, check delivery details, and reorder favorites.
          </p>
        </div>
        {orders && userOrders.length > 0 && (
          <span className="order-history-count">
            {orders.length} {orders.length === 1 ? "order placed" : "orders placed"}
          </span>
        )}
      </header>

      {!userOrders || userOrders.length === 0 ? (
        <section className="empty-orders" aria-labelledby="empty-orders-title">
          <div className="empty-orders-icon" aria-hidden="true">
            📦
          </div>
          <h2 id="empty-orders-title">No orders placed yet</h2>
          <p>
            When you complete a purchase, your order history, delivery details,
            and receipts will be displayed right here.
          </p>
          <Link to="/products" className="empty-orders-shop-link">
            Explore Products
          </Link>
        </section>
      ) : (
        <div className="orders-list">
          {userOrders.map((order) => {
            const itemCount = order.items
              ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
              : 0;

            const shortId = order.id ? order.id.slice(0, 8).toUpperCase() : "N/A";

            return (
              <article className="order-card" key={order.id}>
                <header className="order-card-header">
                  <div className="order-header-meta">
                    <div className="order-id-block">
                      <span className="order-id-label">Order</span>
                      <h2 className="order-id-code">#{shortId}</h2>
                    </div>
                    <div className="order-date-block">
                      <span className="order-date-label">Date Placed</span>
                      <time className="order-date-value">
                        {formatDate(order.date)}
                      </time>
                    </div>
                    <div className="order-total-block">
                      <span className="order-total-label">Total Amount</span>
                      <span className="order-total-value">
                        {order.total ? Number(order.total).toLocaleString() : "0"}{" "}
                        <span className="currency-label">Birr</span>
                      </span>
                    </div>
                  </div>

                  <div className="order-header-status">
                    <span
                      className={`order-status-badge status-${(
                        order.status || "Pending"
                      ).toLowerCase()}`}
                    >
                      <span className="status-dot"></span>
                      {order.status || "Pending"}
                    </span>
                    <span className="order-items-summary">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                    <Link
                      to={`/orders/${order.id}`}
                      className="order-header-link"
                      title="View order details"
                    >
                      Details →
                    </Link>
                  </div>
                </header>

                <div className="order-card-body">
                  <div className="order-items-section">
                    <h3 className="section-mini-heading">Purchased Items</h3>
                    <div className="order-items-list">
                      {order.items &&
                        order.items.map((item) => (
                          <div className="order-item-row" key={item.id}>
                            <Link
                              to={`/products/${item.id}`}
                              className="order-item-image-wrap"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                loading="lazy"
                              />
                            </Link>

                            <div className="order-item-details">
                              <Link
                                to={`/products/${item.id}`}
                                className="order-item-name"
                              >
                                {item.name}
                              </Link>
                              {item.category && (
                                <span className="order-item-category">
                                  {item.category}
                                </span>
                              )}
                              <p className="order-item-qty-price">
                                Qty: {item.quantity || 1} ×{" "}
                                {Number(item.price).toLocaleString()} Birr
                              </p>
                            </div>

                            <div className="order-item-right">
                              <span className="order-item-line-total">
                                {(
                                  Number(item.price) * (item.quantity || 1)
                                ).toLocaleString()}{" "}
                                Birr
                              </span>
                              <button
                                type="button"
                                className={`order-buy-again-btn ${readdedItemId === item.id ? "added" : ""
                                  }`}
                                onClick={() => handleBuyAgain(item)}
                              >
                                {readdedItemId === item.id ? (
                                  <>
                                    <span>✓</span> Added
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <circle cx="9" cy="21" r="1" />
                                      <circle cx="20" cy="21" r="1" />
                                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                    Buy Again
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="order-info-grid">
                    <div className="order-info-card delivery-info-card">
                      <div className="info-card-header">
                        <span className="info-card-icon" aria-hidden="true">
                          📍
                        </span>
                        <h4>Delivery Address</h4>
                      </div>
                      {order.customer ? (
                        <div className="info-card-content">
                          <p className="customer-name">
                            {order.customer.fullName}
                          </p>
                          {order.customer.address && (
                            <p className="customer-address">
                              {order.customer.address}
                            </p>
                          )}
                          {order.customer.city && (
                            <p className="customer-city">
                              {order.customer.city}
                            </p>
                          )}
                          <div className="customer-contacts">
                            {order.customer.phone && (
                              <span>📞 {order.customer.phone}</span>
                            )}
                            {order.customer.email && (
                              <span>✉️ {order.customer.email}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="info-card-empty">No delivery info</p>
                      )}
                    </div>

                    <div className="order-info-card payment-info-card">
                      <div className="info-card-header">
                        <span className="info-card-icon" aria-hidden="true">
                          🧾
                        </span>
                        <h4>Payment Summary</h4>
                      </div>
                      <div className="info-card-content price-breakdown">
                        <div className="price-row">
                          <span>Subtotal</span>
                          <span>
                            {order.subtotal
                              ? Number(order.subtotal).toLocaleString()
                              : Number(order.total || 0).toLocaleString()}{" "}
                            Birr
                          </span>
                        </div>
                        <div className="price-row">
                          <span>Delivery Fee</span>
                          <span>
                            {order.shippingFee
                              ? `${Number(order.shippingFee).toLocaleString()} Birr`
                              : "Free"}
                          </span>
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="price-row discount-row">
                            <span>
                              Discount{" "}
                              {order.couponCode ? `(${order.couponCode})` : ""}
                            </span>
                            <span>
                              -{Number(order.discountAmount).toLocaleString()}{" "}
                              Birr
                            </span>
                          </div>
                        )}
                        <div className="price-divider"></div>
                        <div className="price-row grand-total-row">
                          <span>Total Paid</span>
                          <span>
                            {order.total
                              ? Number(order.total).toLocaleString()
                              : "0"}{" "}
                            Birr
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <footer className="order-card-footer">
                  <div className="order-footer-left">
                    <span className="status-note">
                      Payment method: Cash on Delivery / Verified
                    </span>
                  </div>
                  <div className="order-footer-actions">
                    <Link
                      to={`/orders/${order.id}`}
                      className="order-view-details-btn"
                    >
                      View Details →
                    </Link>
                    <Link to="/products" className="order-action-link">
                      Browse More Products
                    </Link>
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
