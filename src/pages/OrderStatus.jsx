import { useLocation, Link } from "react-router-dom";

function OrderStatus() {
  const location = useLocation();

  const order = location.state?.order;

  if (!order) {
    return (
      <div className="order-success">
        <h2>No order found</h2>
        <Link to="/products">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="order-success">
      <div className="success-icon">✓</div>

      <h1>Order Placed Successfully!</h1>

      <p>Thank you for your order, {order.customer.fullName}.</p>

      <h2>Order Summary</h2>

      {order.items.map((item) => (
        <div className="success-item" key={item.id}>
          <span>
            {item.name} × {item.quantity}
          </span>
          <span>{(item.price * item.quantity).toLocaleString()} Birr</span>
        </div>
      ))}

      <hr />

      <h3>Total: {order.total.toLocaleString()} Birr</h3>

      <Link to="/products" className="continue-shopping">
        Continue Shopping
      </Link>
    </div>
  );
}

export default OrderStatus;
