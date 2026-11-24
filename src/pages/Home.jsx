import { Link } from "react-router-dom";
import { useContext, useMemo } from "react";
import { CartContext } from "../contexts/cartContext";
import { ReviewContext } from "../contexts/reviewContext";
import { WishListContext } from "../contexts/wishListContext";
import { RecentlyViewedContext } from "../contexts/recentlyViewedContext";
import { ProductContext } from "../contexts/productContext";

function Home() {
  const { products } = useContext(ProductContext)
  const { addToCart } = useContext(CartContext);
  const { allReviews } = useContext(ReviewContext);
  const { addToWishList, removeFromWishList, isInWishList } =
    useContext(WishListContext);
  const {
    recentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed,
  } = useContext(RecentlyViewedContext);

  const toggleWishList = (product) => {
    if (isInWishList(product.id)) {
      removeFromWishList(product.id);
    } else {
      addToWishList(product);
    }
  };

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

  const recommendedProducts = useMemo(() => {
    if (!recentlyViewed || recentlyViewed.length === 0) return [];

    const viewedCategories = new Set(
      recentlyViewed.map((viewed) => viewed.category),
    );
    const viewedIds = new Set(recentlyViewed.map((viewed) => viewed.id));

    return products
      .filter(
        (product) =>
          viewedCategories.has(product.category) && !viewedIds.has(product.id),
      )
      .slice(0, 4);
  }, [recentlyViewed, products]);
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Products you'll love</h1>
          <p>
            Find quality products at great prices. Shop your favorites today.
          </p>
          <Link to="products" className="shop-btn">
            Shop Now
          </Link>
        </div>
        <div className="hero-image">
          <img src="/images/hero.png" alt="Featured shopping products" />
        </div>
      </section>

      <section className="featured-products">
        <h1>Featured Products</h1>
        <p>Explore some of our popular products</p>

        <div className="products-grid">
          {products
            .filter((product) => product.featured)
            .map((product) => {
              const { rating: averageRating, reviewCount: totalReviews } =
                getProductRating(product);
              const isWishlisted = isInWishList(product.id);
              return (
                <div className="product-card" key={product.id}>
                  <button
                    type="button"
                    className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                    aria-label={
                      isWishlisted
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                    }
                    aria-pressed={isWishlisted}
                    onClick={() => toggleWishList(product)}
                  >
                    {isWishlisted ? "♥" : "♡"}
                  </button>
                  <Link
                    className="product-card-image"
                    to={`/products/${product.id}`}
                  >
                    <img src={product.image} alt={product.name} />
                  </Link>

                  <div className="product-card-details">
                    <Link to={`/products/${product.id}`}>
                      <h3>{product.name}</h3>
                    </Link>
                    <p>{product.category}</p>
                    <p className="product-rating">
                      ⭐ {averageRating} / 5 ({totalReviews} reviews)
                    </p>

                    <h4>{product.price} Birr</h4>
                    <button onClick={() => addToCart(product)}>

                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {recentlyViewed && recentlyViewed.length > 0 && (
        <section
          className="recently-viewed-section"
          aria-labelledby="recently-viewed-title"
        >
          <div className="recently-viewed-header">
            <div className="recently-viewed-header-text">
              <span className="recently-viewed-eyebrow">
                <span className="eyebrow-dot" aria-hidden="true"></span>
                Pick up where you left off
              </span>
              <h2 id="recently-viewed-title">Recently Viewed</h2>
              <p className="recently-viewed-subtitle">
                Items you’ve explored recently. Fast and easy to jump back in.
              </p>
            </div>

            <div className="recently-viewed-header-actions">
              <span className="recently-viewed-counter">
                {recentlyViewed.length}{" "}
                {recentlyViewed.length === 1 ? "item" : "items"}
              </span>
              {clearRecentlyViewed && (
                <button
                  type="button"
                  className="recently-viewed-clear-btn"
                  onClick={clearRecentlyViewed}
                  title="Clear all recently viewed items"
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
                  <span>Clear history</span>
                </button>
              )}
            </div>
          </div>

          <div className="recently-viewed-grid">
            {recentlyViewed.map((product) => {
              const { rating, reviewCount } = getProductRating(product);
              const isWishlisted = isInWishList(product.id);
              const discount =
                product.originalPrice && product.originalPrice > product.price
                  ? Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                    100,
                  )
                  : null;

              return (
                <article className="recently-viewed-card" key={product.id}>
                  <div className="recently-viewed-card-top">
                    <div className="rv-badge-group">
                      {discount && (
                        <span className="rv-badge rv-badge-sale">
                          -{discount}%
                        </span>
                      )}
                      {product.isnew && (
                        <span className="rv-badge rv-badge-new">NEW</span>
                      )}
                    </div>

                    <div className="rv-action-group">
                      <button
                        type="button"
                        className={`rv-icon-btn rv-wishlist-btn ${isWishlisted ? "active" : ""
                          }`}
                        aria-label={
                          isWishlisted
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                        }
                        aria-pressed={isWishlisted}
                        onClick={() => toggleWishList(product)}
                        title={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        {isWishlisted ? "♥" : "♡"}
                      </button>

                      {removeFromRecentlyViewed && (
                        <button
                          type="button"
                          className="rv-icon-btn rv-remove-btn"
                          aria-label={`Remove ${product.name} from history`}
                          onClick={() => removeFromRecentlyViewed(product.id)}
                          title="Remove from history"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <Link
                      to={`/products/${product.id}`}
                      className="recently-viewed-image-link"
                      tabIndex="-1"
                      aria-hidden="true"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                    </Link>
                  </div>

                  <div className="recently-viewed-card-body">
                    <div className="rv-meta-row">
                      <span className="rv-category-tag">
                        {product.category}
                      </span>
                      <span
                        className={`rv-stock-tag ${product.stock > 0 ? "in-stock" : "out-of-stock"
                          }`}
                      >
                        <span className="rv-stock-dot"></span>
                        {product.stock > 0 ? "In stock" : "Out of stock"}
                      </span>
                    </div>

                    <h3 className="rv-product-title">
                      <Link to={`/products/${product.id}`}>
                        {product.name}
                      </Link>
                    </h3>

                    <div className="rv-rating-row">
                      <span className="rv-stars" aria-hidden="true">
                        ★
                      </span>
                      <span className="rv-rating-score">{rating}</span>
                      <span className="rv-review-count">
                        ({reviewCount})
                      </span>
                    </div>

                    <div className="rv-price-row">
                      <div className="rv-price-wrap">
                        <span className="rv-current-price">
                          {Number(product.price).toLocaleString()}{" "}
                          <span className="rv-currency">Birr</span>
                        </span>
                        {product.originalPrice && (
                          <span className="rv-original-price">
                            {Number(product.originalPrice).toLocaleString()} Birr
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rv-card-footer">
                      <button
                        type="button"
                        className="rv-add-btn"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <svg
                          width="16"
                          height="16"
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

                      <Link
                        to={`/products/${product.id}`}
                        className="rv-details-link"
                        aria-label={`View details for ${product.name}`}
                        title="View details"
                      >
                        →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
      {recommendedProducts && recommendedProducts.length > 0 && (
        <section
          className="recommended-section"
          aria-labelledby="recommended-title"
        >
          <div className="recommended-header">
            <div className="recommended-header-text">
              <span className="recommended-eyebrow">
                <span className="recommended-sparkle" aria-hidden="true">
                  ✨
                </span>
                Curated For You
              </span>
              <h2 id="recommended-title">Recommended Products</h2>
              <p className="recommended-subtitle">
                Inspired by the categories you've explored. Handpicked to match your taste.
              </p>
            </div>

            <div className="recommended-header-actions">
              <span className="recommended-badge">
                {recommendedProducts.length}{" "}
                {recommendedProducts.length === 1 ? "suggestion" : "suggestions"}
              </span>
            </div>
          </div>

          <div className="recommended-grid">
            {recommendedProducts.map((product) => {
              const { rating, reviewCount } = getProductRating(product);
              const isWishlisted = isInWishList(product.id);
              const discount =
                product.originalPrice && product.originalPrice > product.price
                  ? Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                    100,
                  )
                  : null;

              return (
                <article className="recommended-card" key={product.id}>
                  <div className="recommended-card-top">
                    <div className="rec-badge-group">
                      <span className="rec-badge rec-badge-curated">
                        ★ For You
                      </span>
                      {discount && (
                        <span className="rec-badge rec-badge-sale">
                          -{discount}%
                        </span>
                      )}
                      {product.isnew && (
                        <span className="rec-badge rec-badge-new">NEW</span>
                      )}
                    </div>

                    <div className="rec-action-group">
                      <button
                        type="button"
                        className={`rec-icon-btn rec-wishlist-btn ${isWishlisted ? "active" : ""
                          }`}
                        aria-label={
                          isWishlisted
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                        }
                        aria-pressed={isWishlisted}
                        onClick={() => toggleWishList(product)}
                        title={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        {isWishlisted ? "♥" : "♡"}
                      </button>
                    </div>

                    <Link
                      to={`/products/${product.id}`}
                      className="recommended-image-link"
                      tabIndex="-1"
                      aria-hidden="true"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                    </Link>
                  </div>

                  <div className="recommended-card-body">
                    <div className="rec-meta-row">
                      <span className="rec-category-tag">
                        {product.category}
                      </span>
                      <span
                        className={`rec-stock-tag ${product.stock > 0 ? "in-stock" : "out-of-stock"
                          }`}
                      >
                        <span className="rec-stock-dot"></span>
                        {product.stock > 0 ? "In stock" : "Out of stock"}
                      </span>
                    </div>

                    <h3 className="rec-product-title">
                      <Link to={`/products/${product.id}`}>
                        {product.name}
                      </Link>
                    </h3>

                    <div className="rec-rating-row">
                      <span className="rec-stars" aria-hidden="true">
                        ★
                      </span>
                      <span className="rec-rating-score">{rating}</span>
                      <span className="rec-review-count">
                        ({reviewCount})
                      </span>
                    </div>

                    <div className="rec-price-row">
                      <div className="rec-price-wrap">
                        <span className="rec-current-price">
                          {Number(product.price).toLocaleString()}{" "}
                          <span className="rec-currency">Birr</span>
                        </span>
                        {product.originalPrice && (
                          <span className="rv-original-price">
                            {Number(product.originalPrice).toLocaleString()} Birr
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rec-card-footer">
                      <button
                        type="button"
                        className="rec-add-btn"
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        <svg
                          width="16"
                          height="16"
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

                      <Link
                        to={`/products/${product.id}`}
                        className="rec-details-link"
                        aria-label={`View details for ${product.name}`}
                        title="View details"
                      >
                        →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export default Home;

