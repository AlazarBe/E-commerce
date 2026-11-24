import { useContext } from "react";
import { WishListContext } from "../contexts/wishListContext";
import { CartContext } from "../contexts/cartContext";
import { Link } from "react-router-dom";
import "./WishList.css";

function WishList() {
  const { wishList, removeFromWishList } = useContext(WishListContext);
  const { addToCart } = useContext(CartContext);
  return (
    <div className="wishlist-page">
      <header className="wishlist-header">
        <div>
          <p className="wishlist-eyebrow">Saved for later</p>
          <h1>My Wishlist</h1>
          <p className="wishlist-description">
            Keep the things you love in one place.
          </p>
        </div>
        {wishList.length > 0 && (
          <span className="wishlist-count">
            {wishList.length} {wishList.length === 1 ? "item" : "items"}
          </span>
        )}
      </header>

      {wishList.length === 0 ? (
        <section className="empty-wishlist" aria-labelledby="empty-wishlist-title">
          <span className="empty-wishlist-icon" aria-hidden="true">
            ♡
          </span>
          <h2 id="empty-wishlist-title">Nothing saved just yet</h2>
          <p>
            Browse the collection and tap the heart on anything you’d like to
            keep close.
          </p>
          <Link to="/products" className="wishlist-shop-link">
            Explore products
          </Link>
        </section>
      ) : (
        <div className="wishlist-grid">
          {wishList.map((product) => (
            <div className="wishlist-card" key={product.id}>
              <Link
                className="wishlist-card-image"
                to={`/products/${product.id}`}
              >
                <img src={product.image} alt={product.name} />
              </Link>
              <div className="wishlist-card-details">
                <Link to={`/products/${product.id}`}>
                  <h3>{product.name}</h3>
                </Link>
                <p className="wishlist-card-category">{product.category}</p>
                <p className="wishlist-card-price">
                  {product.price.toLocaleString()} <span>Birr</span>
                </p>

                <div className="wishlist-card-actions">
                  <button
                    type="button"
                    className="wishlist-add-button"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    className="wishlist-remove-button"
                    aria-label={`Remove ${product.name} from wishlist`}
                    onClick={() => removeFromWishList(product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishList;
