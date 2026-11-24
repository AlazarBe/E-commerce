

import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../contexts/cartContext";
import { ReviewContext } from "../contexts/reviewContext";
import { WishListContext } from "../contexts/wishListContext";
import { ComparisonContext } from "../contexts/comparisonContext";
import { ProductContext } from "../contexts/productContext";
function Products() {
  const { products } = useContext(ProductContext);
  const { addToCart } = useContext(CartContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");
  const { allReviews } = useContext(ReviewContext);
  const { addToWishList, removeFromWishList, isInWishList } =
    useContext(WishListContext);

  const { addToCompare, removeFromCompare, isInCompare, compareList } =
    useContext(ComparisonContext);
  const toggleWishlist = (product) => {
    if (isInWishList(product.id)) {
      removeFromWishList(product.id);
    } else {
      addToWishList(product);
    }
  };
  const toggleCompare = (product) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortOrder === "low-high") {
      return a.price - b.price;
    }
    if (sortOrder === "high-low") {
      return b.price - a.price;
    }
  });
  return (
    <div className="products-page">
      <h1>Our Products</h1>
      <p>Explore our collection of products.</p>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search Products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="category-filters">
        {["All", "Electronics", "Fashion", "Accessories", "Home & Living"].map(
          (category) => (
            <button
              key={category}
              className={selectedCategory === category ? "active" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ),
        )}
      </div>
      <div className="sort-and-clear">
        <div className="sort-container">
          <label htmlFor="sort">Sort by:</label>

          <select
            id="sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="name">Name: A to Z</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>

        <button
          className="clear-filters"
          onClick={() => {
            setSearchTerm("");
            setSelectedCategory("All");
            setSortOrder("default");
          }}
        >
          Clear Filters
        </button>
      </div>

      <p className="product-count">Showing {sortedProducts.length} product</p>
      <p>Products selected for comparison: {compareList.length}/3</p>
      <div className="products-grid">
        {sortedProducts.length > 0 ? (
          sortedProducts.map((product) => {
            const productReviews = allReviews.filter(
              (review) => review.productId === product.id,
            );

            const totalReviews = productReviews.length;
            const discount = product.originalPrice
              ? Math.round(
                ((product.originalPrice - product.price) /
                  product.originalPrice) *
                100,
              )
              : 0;

            const averageRating =
              totalReviews > 0
                ? (
                  productReviews.reduce(
                    (total, review) => total + review.rating,
                    0,
                  ) / totalReviews
                ).toFixed(1)
                : 0;
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
                  onClick={() => toggleWishlist(product)}
                >
                  {isWishlisted ? "♥" : "♡"}
                </button>
                <div className="product-badges">
                  {product.stock === 0 && (
                    <span className="badge out-of-stock">Out of Stock</span>
                  )}

                  {product.stock > 0 && (
                    <span className="badge in-stock">In Stock</span>
                  )}

                  {product.stock > 5 && (
                    <span className="badge in-stock">In Stock</span>
                  )}

                  {product.stock > 0 && product.stock <= 5 && (
                    <span className="badge low-stock">Low Stock</span>
                  )}
                </div>
                <Link
                  className="product-card-image"
                  to={`/products/${product.id}`}
                >
                  <img src={product.image} alt={product.name} />
                </Link>

                <div className="product-card-details">
                  <Link to={`/products/${product.id}`}></Link>

                  {product.originalPrice && (
                    <span className="sale-badge">{discount}% OFF</span>
                  )}

                  <div className="product-prices">
                    {product.originalPrice && (
                      <span className="original-price">
                        {product.originalPrice} Birr
                      </span>
                    )}

                    <span className="current-price">{product.price} Birr</span>
                  </div>
                  <h3>{product.name}</h3>
                  <p className="product-rating">
                    ⭐ {averageRating} / 5 ({totalReviews} reviews)
                  </p>

                  <p>{product.category}</p>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                  <button onClick={() => toggleCompare(product)}>
                    {isInCompare(product.id)
                      ? "Remove from Compare"
                      : "Compare"}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-results">No Products Found</p>
        )}
      </div>
    </div>
  );
}

export default Products;
