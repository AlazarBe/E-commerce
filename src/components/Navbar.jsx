import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../contexts/cartContext";
import { WishListContext } from "../contexts/wishListContext";
import { ComparisonContext } from "../contexts/comparisonContext";
import { AuthContext } from "../contexts/authContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { wishList } = useContext(WishListContext);
  const { compareList } = useContext(ComparisonContext);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  return (
    <nav className="site-navbar">
      <div className="logo">
        <Link to="/">My Store</Link>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart" className="cart-link">
          Cart
          <span className="cart-count">{cartCount}</span>
        </Link>{" "}
        <Link to="wishlist">
          Wishlist
          <span className="cart-count"> {wishList.length}</span>
        </Link>
        <Link to="/compare" className="compare-link">
          Compare
          <span className="cart-count">{compareList.length}</span>
        </Link>
        <Link to="/orders">Orders</Link>
        {user ? (
          <>
            <span>Welcome, {user.name}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
