import { useContext } from "react";
import { ComparisonContext } from "../contexts/comparisonContext";
import { CartContext } from "../contexts/cartContext";
import { ReviewContext } from "../contexts/reviewContext";
import { ProductContext } from "../contexts/productContext";
import { Link } from "react-router-dom";
import "./Compare.css";

function Compare() {
  const { products } = useContext(ProductContext);
  const { compareList, removeFromCompare, clearCompare } =
    useContext(ComparisonContext);
  const { addToCart } = useContext(CartContext);
  const { allReviews } = useContext(ReviewContext);

  const getProductRating = (product) => {
    const productReviews = allReviews.filter(
      (review) => review.productId === product.id,
    );
    const totalReviews = productReviews.length;
    if (totalReviews > 0) {
      const avg = (
        productReviews.reduce((total, review) => total + review.rating, 0) /
        totalReviews
      ).toFixed(1);
      return { rating: avg, reviewCount: totalReviews };
    }
    return {
      rating: product.rating ? Number(product.rating).toFixed(1) : "4.5",
      reviewCount: product.reviews || 0,
    };
  };

  if (!compareList || compareList.length === 0) {
    return (
      <div className="compare-page">
        <header className="compare-header">
          <div>
            <p className="compare-eyebrow">Side-by-side Specs</p>
            <h1>Product Comparison</h1>
            <p className="compare-description">
              Compare prices, specs, and stock to find the right product for you.
            </p>
          </div>
        </header>

        <section className="empty-compare" aria-labelledby="empty-compare-title">
          <div className="empty-compare-icon" aria-hidden="true">
            ⚖️
          </div>
          <h2 id="empty-compare-title">No products to compare yet</h2>
          <p>
            Explore our collection and click the <strong>Compare</strong> button
            on up to 3 products to see their details, specs, and prices side by side.
          </p>
          <Link to="/products" className="empty-compare-shop-link">
            Browse Products
          </Link>
        </section>
      </div>
    );
  }

  const availableSlots = 3 - compareList.length;

  return (
    <div className="compare-page">
      <header className="compare-header">
        <div>
          <p className="compare-eyebrow">Side-by-side Specs</p>
          <h1>Product Comparison</h1>
          <p className="compare-description">
            Comparing {compareList.length} of 3 items side-by-side to help you make the best choice.
          </p>
        </div>

        <div className="compare-header-actions">
          <span className="compare-counter">
            {compareList.length} / 3 Products
          </span>
          {availableSlots > 0 && (
            <Link to="/products" className="compare-add-more-link">
              + Add Product ({availableSlots} left)
            </Link>
          )}
          <button
            type="button"
            className="compare-clear-btn"
            onClick={clearCompare}
            title="Clear all compared products"
          >
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
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Clear All</span>
          </button>
        </div>
      </header>

      <div className="compare-table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="spec-header-cell">
                <span className="spec-header-title">Specifications</span>
                <span className="spec-header-sub">Side-by-side view</span>
              </th>

              {compareList.map((product) => {
                const discount =
                  product.originalPrice && product.originalPrice > product.price
                    ? Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                      100,
                    )
                    : null;

                return (
                  <th key={product.id} className="product-column-header">
                    <div className="compare-hero-card">
                      <button
                        type="button"
                        className="compare-remove-btn"
                        onClick={() => removeFromCompare(product.id)}
                        aria-label={`Remove ${product.name} from comparison`}
                        title="Remove from comparison"
                      >
                        ✕
                      </button>

                      <Link
                        to={`/products/${product.id}`}
                        className="compare-product-img-wrap"
                      >
                        <img src={product.image} alt={product.name} />
                        {discount && (
                          <span className="compare-badge-sale">
                            -{discount}%
                          </span>
                        )}
                        {product.isnew && (
                          <span className="compare-badge-new">NEW</span>
                        )}
                      </Link>

                      <span className="compare-card-category">
                        {product.category}
                      </span>

                      <Link
                        to={`/products/${product.id}`}
                        className="compare-card-title"
                      >
                        {product.name}
                      </Link>

                      <div className="compare-price-block">
                        <span className="compare-main-price">
                          {Number(product.price).toLocaleString()}{" "}
                          <span className="compare-currency">Birr</span>
                        </span>
                        {product.originalPrice && (
                          <span className="compare-original-price">
                            {Number(product.originalPrice).toLocaleString()} Birr
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="compare-add-cart-btn"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
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
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        <span>
                          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </span>
                      </button>
                    </div>
                  </th>
                );
              })}

              {availableSlots > 0 && (
                <th className="product-column-empty">
                  <div className="compare-empty-slot">
                    <div className="empty-slot-plus">+</div>
                    <p className="empty-slot-text">Add another product</p>
                    <span className="empty-slot-hint">
                      Compare up to 3 items
                    </span>
                    <Link to="/products" className="empty-slot-link">
                      Browse Catalog
                    </Link>
                  </div>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="spec-label">
                <span className="spec-icon">💰</span> Price
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="spec-value">
                  <span className="spec-highlight-price">
                    {Number(product.price).toLocaleString()} Birr
                  </span>
                  {product.originalPrice && (
                    <span className="spec-sub-price">
                      Was: {Number(product.originalPrice).toLocaleString()} Birr
                    </span>
                  )}
                </td>
              ))}
              {availableSlots > 0 && <td className="spec-value-empty">—</td>}
            </tr>

            <tr>
              <td className="spec-label">
                <span className="spec-icon">🏷️</span> Category
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="spec-value">
                  <span className="spec-category-pill">{product.category}</span>
                </td>
              ))}
              {availableSlots > 0 && <td className="spec-value-empty">—</td>}
            </tr>

            <tr>
              <td className="spec-label">
                <span className="spec-icon">⭐</span> Customer Rating
              </td>
              {compareList.map((product) => {
                const { rating, reviewCount } = getProductRating(product);
                return (
                  <td key={product.id} className="spec-value">
                    <div className="spec-rating-wrap">
                      <span className="spec-star">★</span>
                      <span className="spec-score">{rating}</span>
                      <span className="spec-reviews">({reviewCount} reviews)</span>
                    </div>
                  </td>
                );
              })}
              {availableSlots > 0 && <td className="spec-value-empty">—</td>}
            </tr>

            <tr>
              <td className="spec-label">
                <span className="spec-icon">📦</span> Availability
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="spec-value">
                  <span
                    className={`spec-stock-badge ${product.stock > 0 ? "in-stock" : "out-of-stock"
                      }`}
                  >
                    <span className="spec-stock-dot"></span>
                    {product.stock > 0
                      ? `In Stock (${product.stock} left)`
                      : "Out of Stock"}
                  </span>
                </td>
              ))}
              {availableSlots > 0 && <td className="spec-value-empty">—</td>}
            </tr>

            <tr>
              <td className="spec-label">
                <span className="spec-icon">🚚</span> Delivery
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="spec-value">
                  <span className="spec-delivery-text">
                    Standard Delivery (100 Birr)
                  </span>
                </td>
              ))}
              {availableSlots > 0 && <td className="spec-value-empty">—</td>}
            </tr>

            <tr>
              <td className="spec-label">
                <span className="spec-icon">⚡</span> Features & Tag
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="spec-value">
                  <div className="spec-tags-wrap">
                    {product.isnew && (
                      <span className="spec-feature-tag new-tag">
                        New Arrival
                      </span>
                    )}
                    {product.featured && (
                      <span className="spec-feature-tag featured-tag">
                        Featured Choice
                      </span>
                    )}
                    {!product.isnew && !product.featured && (
                      <span className="spec-feature-tag standard-tag">
                        Standard Edition
                      </span>
                    )}
                  </div>
                </td>
              ))}
              {availableSlots > 0 && <td className="spec-value-empty">—</td>}
            </tr>

            <tr className="action-row">
              <td className="spec-label">
                <span className="spec-icon">⚙️</span> Quick Action
              </td>
              {compareList.map((product) => (
                <td key={product.id} className="spec-value action-cell">
                  <div className="compare-cell-actions">
                    <button
                      type="button"
                      className="compare-inline-add-btn"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                      type="button"
                      className="compare-inline-remove-btn"
                      onClick={() => removeFromCompare(product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              ))}
              {availableSlots > 0 && <td className="spec-value-empty">—</td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Compare;
