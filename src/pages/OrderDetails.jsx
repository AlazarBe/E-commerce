import { useContext, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { OrderContext } from "../contexts/orderContext";
import { CartContext } from "../contexts/cartContext";
import { AuthContext } from "../contexts/authContext";
import "./OrderDetails.css";

function OrderDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { orders, updateOrderStatus, cancelOrder } = useContext(OrderContext);
  const { addToCart } = useContext(CartContext);
  const [readdedItemId, setReaddedItemId] = useState(null);

  const order = orders
    ? orders.find(
      (item) => item.id === id && item.userEmail === user.email
    )
    : null; if (!order) {
      return (
        <div className="order-details-page">
          <section className="order-not-found">
            <div className="order-not-found-icon" aria-hidden="true">
              🔍
            </div>
            <h2>Order Not Found</h2>
            <p>
              We couldn't locate the order you're looking for. It may have been
              removed or the link might be incorrect.
            </p>
            <Link to="/orders" className="order-not-found-link">
              ← Back to My Orders
            </Link>
          </section>
        </div>
      );
    }

  const orderStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const statusIcons = ["✓", "⚡", "🚚", "📦"];

  const currentStatusIndex = Math.max(
    0,
    orderStatuses.indexOf(order.status || "Pending")
  );

  const handleBuyAgain = (item) => {
    addToCart(item, 1);
    setReaddedItemId(item.id);
    setTimeout(() => {
      setReaddedItemId(null);
    }, 2000);
  };
  const handleStatusChange = (e) => {
    if (typeof updateOrderStatus === "function") {
      updateOrderStatus(order.id, e.target.value);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently placed";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Recently placed";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const handleCancelOrder = () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (confirmCancel) {
      cancelOrder(order.id);
    }
  }

  const shortId = order.id ? order.id.slice(0, 8).toUpperCase() : "N/A";
  const itemCount = order.items
    ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0;

  return (
    <div className="order-details-page">
      <nav className="order-details-breadcrumb" aria-label="Breadcrumb">
        <Link to="/orders">← My Orders</Link>
        <span className="breadcrumb-separator" aria-hidden="true">
          /
        </span>
        <span className="breadcrumb-current">Order #{shortId}</span>
      </nav>

      {/* Hero Card */}
      <section className="order-details-hero">
        <div className="hero-header-row">
          <div className="hero-header-text">
            <p className="hero-eyebrow">Order Receipt</p>
            <h1>Order #{shortId}</h1>
            <p className="hero-timestamp">
              Placed on {formatDate(order.date)}
              {formatTime(order.date) ? ` at ${formatTime(order.date)}` : ""}
            </p>
          </div>

          <div className="hero-actions-group">
            <span
              className={`hero-status-pill status-${(
                order.status || "Pending"
              ).toLowerCase()}`}
            >
              <span className="status-pill-dot" aria-hidden="true"></span>
              {order.status || "Pending"}
            </span>

            <button
              type="button"
              className="hero-print-btn"
              onClick={() => window.print()}
              title="Print Receipt"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print Receipt
            </button>
          </div>
        </div>

        {order.status === "Cancelled" ? (
          <div className="order-cancelled-message">
            <div className="cancelled-badge-icon" aria-hidden="true">
              ✕
            </div>
            <div className="cancelled-message-content">
              <h3>Order Cancelled</h3>
              <p>
                This order was cancelled and will not be processed or delivered.
              </p>
              <div className="cancelled-details-notes">
                <span className="cancelled-note-item">
                  <span className="note-bullet">✓</span> No payment was charged
                </span>
                <span className="cancelled-note-item">
                  <span className="note-bullet">✓</span> Items released back to store
                </span>
              </div>
            </div>
            <Link to="/products" className="cancelled-shop-link">
              Browse Other Products →
            </Link>
          </div>
        ) : (
          <div className="order-stepper-wrap">
            <p className="order-stepper-title">Delivery Status</p>

            <div className="order-stepper">
              <div className="stepper-progress-bar">
                <div
                  className="stepper-progress-fill"
                  style={{
                    width: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100
                      }%`,
                  }}
                ></div>
              </div>

              {orderStatuses.map((status, index) => (
                <div
                  key={status}
                  className={`stepper-step ${index < currentStatusIndex
                    ? "completed"
                    : index === currentStatusIndex
                      ? "current"
                      : ""
                    }`}
                >
                  <div className="step-icon-wrap">
                    {index < currentStatusIndex ? "✓" : statusIcons[index]}
                  </div>

                  <span className="step-label">{status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.status !== "Cancelled" && (
          <div className="status-update">
            <div className="status-update-label-wrap">
              <span className="status-update-icon" aria-hidden="true">
                ⚙️
              </span>
              <div>
                <label htmlFor="orderStatus">Order Status Tracking</label>
                <span className="status-update-hint">
                  Update status milestone in real-time
                </span>
              </div>
            </div>

            <div className="status-update-select-wrap">
              <select
                id="orderStatus"
                className="status-select"
                value={order.status || "Pending"}
                onChange={handleStatusChange}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>

              {order.status === "Pending" && (
                <button
                  type="button"
                  className="cancel-order-btn"
                  onClick={handleCancelOrder}
                  title="Cancel this order"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Purchased Products Card */}
      <section className="order-details-card">
        <div className="card-title-row">
          <h2>Purchased Products</h2>
          <span className="card-count-badge">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="details-items-list">
          {order.items &&
            order.items.map((item) => (
              <div className="details-item-row" key={item.id}>
                <Link
                  to={`/products/${item.id}`}
                  className="details-item-img-wrap"
                >
                  <img src={item.image} alt={item.name} loading="lazy" />
                </Link>

                <div className="details-item-info">
                  <Link
                    to={`/products/${item.id}`}
                    className="details-item-name"
                  >
                    {item.name}
                  </Link>
                  {item.category && (
                    <span className="details-item-category">
                      {item.category}
                    </span>
                  )}
                  <p className="details-item-unit-price">
                    Qty: {item.quantity || 1} ×{" "}
                    {Number(item.price).toLocaleString()} Birr
                  </p>
                </div>

                <div className="details-item-actions-wrap">
                  <span className="details-item-total">
                    {(
                      Number(item.price) * (item.quantity || 1)
                    ).toLocaleString()}{" "}
                    Birr
                  </span>
                  <button
                    type="button"
                    className={`details-buy-again-btn ${readdedItemId === item.id ? "added" : ""
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
      </section>

      {/* Two Column Grid for Logistics & Financials */}
      <div className="order-details-grid">
        <section className="details-panel delivery-panel">
          <div className="panel-header">
            <span className="panel-icon" aria-hidden="true">
              📍
            </span>
            <h3>Delivery Information</h3>
          </div>

          {order.customer ? (
            <div className="delivery-data-list">
              <div className="delivery-data-item">
                <span className="delivery-data-label">Recipient Name</span>
                <span className="delivery-data-value">
                  {order.customer.fullName}
                </span>
              </div>

              {order.customer.address && (
                <div className="delivery-data-item">
                  <span className="delivery-data-label">Shipping Address</span>
                  <span className="delivery-data-value">
                    {order.customer.address}
                  </span>
                </div>
              )}

              {order.customer.city && (
                <div className="delivery-data-item">
                  <span className="delivery-data-label">City</span>
                  <span className="delivery-data-value">
                    {order.customer.city}
                  </span>
                </div>
              )}

              {order.customer.phone && (
                <div className="delivery-data-item">
                  <span className="delivery-data-label">Phone Number</span>
                  <span className="delivery-data-value">
                    {order.customer.phone}
                  </span>
                </div>
              )}

              {order.customer.email && (
                <div className="delivery-data-item">
                  <span className="delivery-data-label">Email Address</span>
                  <span className="delivery-data-value">
                    {order.customer.email}
                  </span>
                </div>
              )}

              <div className="delivery-method-box">
                <span>🚚</span>
                <span>Standard Doorstep Delivery (2-3 Business Days)</span>
              </div>
            </div>
          ) : (
            <p className="info-card-empty">No delivery info available</p>
          )}
        </section>

        <section className="details-panel payment-panel">
          <div className="panel-header">
            <span className="panel-icon" aria-hidden="true">
              🧾
            </span>
            <h3>Payment Summary</h3>
          </div>

          <div className="payment-data-list">
            <div className="payment-row">
              <span>Subtotal</span>
              <span>
                {order.subtotal
                  ? Number(order.subtotal).toLocaleString()
                  : Number(order.total || 0).toLocaleString()}{" "}
                Birr
              </span>
            </div>

            <div className="payment-row">
              <span>Shipping Fee</span>
              <span>
                {order.shippingFee
                  ? `${Number(order.shippingFee).toLocaleString()} Birr`
                  : "Free"}
              </span>
            </div>

            {order.discountAmount > 0 && (
              <div className="payment-row discount-row">
                <span>
                  Discount {order.couponCode ? `(${order.couponCode})` : ""}
                </span>
                <span>
                  -{Number(order.discountAmount).toLocaleString()} Birr
                </span>
              </div>
            )}

            <div className="payment-divider"></div>

            <div className="payment-row grand-total-row">
              <span>Total Amount</span>
              <span>
                {order.total ? Number(order.total).toLocaleString() : "0"} Birr
              </span>
            </div>

            <div className="payment-method-box">
              <span>💵</span>
              <span>Payment Method: Cash on Delivery (COD)</span>
            </div>
          </div>
        </section>
      </div>

      {/* Support Banner */}
      <aside className="order-support-banner">
        <div className="support-banner-text">
          <span className="support-icon" aria-hidden="true">
            💬
          </span>
          <div>
            <h4>Need help with this order?</h4>
            <p>
              Have questions regarding delivery, returns, or product details?
            </p>
          </div>
        </div>
        <Link to="/products" className="support-help-link">
          Explore FAQs & Support →
        </Link>
      </aside>

      {/* Bottom Navigation */}
      <footer className="order-details-bottom-nav">
        <Link to="/orders" className="nav-back-link">
          ← Back to All Orders
        </Link>
        <Link to="/products" className="nav-continue-link">
          Continue Shopping
        </Link>
      </footer>
    </div>
  );
}

export default OrderDetails;
