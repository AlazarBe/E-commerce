import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../contexts/cartContext";

function Cart() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } =
    useContext(CartContext);
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const shippingFee = cart.length > 0 ? 100 : 0;
  const total = subtotal + shippingFee;
  return (
    <div className="cart-page">
      <header className="cart-header">
        <div>
          <p className="cart-eyebrow">YOUR BAG</p>
          <h1>Shopping Cart</h1>
          <p className="cart-description">
            Review your items and get ready to check out.
          </p>
        </div>
        {cart.length > 0 && (
          <span className="cart-item-count">
            {cart.reduce((count, item) => count + item.quantity, 0)} items
          </span>
        )}
      </header>

      {cart.length === 0 ? (
        <section className="cart-empty">
          <div className="cart-empty-icon" aria-hidden="true">
            🛍
          </div>
          <h2>Your cart is waiting</h2>
          <p>Looks like you haven’t added anything to your cart yet.</p>
          <Link to="/products" className="cart-continue-btn">
            Explore products
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-section" aria-label="Items in your cart">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-heading">
                    <div>
                      <h3>{item.name}</h3>
                      <p className="cart-item-price">
                        {item.price.toLocaleString()} Birr
                      </p>
                    </div>
                    <p className="cart-line-total">
                      {(item.price * item.quantity).toLocaleString()} Birr
                    </p>
                  </div>
                  <div className="quantity-controls">
                    <div
                      className="quantity-stepper"
                      aria-label={`Quantity: ${item.quantity}`}
                    >
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => decreaseQuantity(item.id)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => increaseQuantity(item.id)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Order summary</h2>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{subtotal.toLocaleString()} Birr</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>{shippingFee.toLocaleString()} Birr</span>
            </div>

            <p className="cart-shipping-note">
              Shipping is a flat fee for this order.
            </p>

            <div className="cart-summary-total">
              <span>Total</span>
              <strong>{total.toLocaleString()} Birr</strong>
            </div>

            <Link to="/checkout" className="checkout-btn">
              Proceed to Checkout
            </Link>
            <p className="cart-secure-note">
              Your order total includes shipping.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart;
