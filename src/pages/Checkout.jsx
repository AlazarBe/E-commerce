import { useContext, useState } from "react";
import { CartContext } from "../contexts/cartContext";
import { OrderContext } from "../contexts/orderContext";
import { AuthContext } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import coupons from "../data/coupons";
function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    address: "",
  });

  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const shippingFee = cart.length > 0 ? 100 : 0;

  const discountAmount = appliedCoupon
    ? (subtotal * appliedCoupon.discount) / 100
    : 0;

  const total = subtotal + shippingFee - discountAmount;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const order = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      userEmail: user.email,

      customer: formData,
      items: cart,

      subtotal,
      shippingFee,
      discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      total,
      status: "Pending"
    };
    addOrder(order)
    navigate("/order-success", {
      state: { order },
    });
    setCart([]);
  };

  const applyCoupon = () => {
    const foundCoupon = coupons.find((coupon) => coupon.code === couponCode.trim().toUpperCase() && coupon.active)
    if (!foundCoupon) {
      alert("Invalid Coupon Code")
      setAppliedCoupon(null)
      return
    }

    setAppliedCoupon(foundCoupon)
    alert("Coupon Applied Successfully")
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-container">
        <div className="checkout-form">
          <h2>Delivery Information</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                required
              />
            </div>
            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full delivery address"
                required
              />
            </div>
            <button type="submit" className="place-order-btn">
              Place Order
            </button>
          </form>
        </div>
        <div className="checkout-summary">
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div className="summary-item" key={item.id}>
              <div>
                <h4>{item.name}</h4>
                <p>Quantiry: {item.quantity}</p>
              </div>
              <p>{(item.price * item.quantity).toLocaleString()} Birr</p>
            </div>
          ))}
          <hr />

          <div className="summary-total">
            <p>Subtotal: {subtotal.toLocaleString()} Birr</p>
            <p>Shipping: {shippingFee} Birr</p>
            <div className="coupon-section">
              <h3>Have a coupon?</h3>

              <div className="coupon-input">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />

                <button type="button" onClick={applyCoupon}>
                  Apply
                </button>
              </div>
            </div>
            {appliedCoupon && (
              <div className="summary-row">
                <span>Discount ({appliedCoupon.code})</span>
                <span>-{discountAmount.toFixed(2)} Birr</span>
              </div>
            )}


            <h3>Total: {total.toLocaleString()} Birr</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
