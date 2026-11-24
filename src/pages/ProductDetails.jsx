import { useContext, useState, useEffect } from "react";
import { CartContext } from "../contexts/cartContext";
import { useParams, Link } from "react-router-dom";
import { ReviewContext } from "../contexts/reviewContext";
import { WishListContext } from "../contexts/wishListContext";
import { RecentlyViewedContext } from "../contexts/recentlyViewedContext"
import { ProductContext } from "../contexts/productContext";
import { QuestionContext } from "../contexts/questionContext";
import { AuthContext } from "../contexts/authContext";
import "./ProductDetails.css";

function ProductDetails() {
  const { questions, addQuestion } = useContext(QuestionContext);
  const { user } = useContext(AuthContext)
  const { products } = useContext(ProductContext);
  const [quantity, setQuantity] = useState(1);
  const { addToWishList, removeFromWishList, isInWishList } =
    useContext(WishListContext);
  const { addToRecentlyViewed } = useContext(RecentlyViewedContext);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: "5",
    comment: "",
  });
  const [newQuestion, setNewQuestion] = useState("");
  const [selectedRating, setSelectedRating] = useState("All");
  const { allReviews, setAllReviews } = useContext(ReviewContext);
  const { addToCart } = useContext(CartContext);
  const { id } = useParams();
  const product = products.find((product) => product.id === Number(id));
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [product, addToRecentlyViewed]);

  if (!product) {
    return (
      <main className="product-details-page">
        <div className="product-not-found">
          <h1>Product not found</h1>
          <p>It may have been moved or is no longer available.</p>
          <Link to="/products">Browse all products</Link>
        </div>
      </main>
    );
  }


  const relatedProducts = products.filter(
    (item) => item.category === product.category && item.id !== product.id,
  );
  const toggleWishList = (product) => {
    if (isInWishList(product.id)) {
      removeFromWishList(product.id);
    } else {
      addToWishList(product);
    }
  };

  const productReviews = allReviews.filter(
    (review) => review.productId === Number(id),
  );
  const hasReviewed = productReviews.some(
    (review) => review.userEmail === user?.email
  );
  const totalReviews = productReviews.length;

  const averageRating =
    totalReviews > 0
      ? productReviews.reduce(
        (total, review) => total + review.rating,
        0
      ) / totalReviews
      : 0;

  const handleReviewChange = (e) => {
    const { name, value } = e.target;

    setNewReview((prevReview) => ({
      ...prevReview,
      [name]: value,
    }));
  };
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (hasReviewed) {
      return;
    }

    if (!newReview.comment.trim()) {
      return;
    }

    const review = {
      id: crypto.randomUUID(),
      productId: Number(id),
      name: user.name,
      userEmail: user.email,
      rating: Number(newReview.rating),
      comment: newReview.comment,
      date: new Date().toISOString().split("T")[0],
    };

    setAllReviews((prevReviews) => [...prevReviews, review]);

    setNewReview({
      name: "",
      rating: "5",
      comment: "",
    });
  };

  const productQuestions = questions.filter(
    (question) => question.productId === Number(id)
  );

  const handleQuestionSubmit = (e) => {
    e.preventDefault();

    if (!newQuestion.trim() || !user) return;

    addQuestion({
      id: crypto.randomUUID(),
      productId: Number(id),
      userEmail: user.email,
      userName: user.name,
      question: newQuestion.trim(),
      answer: "",
      date: new Date().toISOString().split("T")[0],
    });

    setNewQuestion("");
  };
  const filteredReviews = productReviews.filter((review) => {
    return selectedRating === "All" || review.rating === Number(selectedRating);
  });
  const isWishlisted = isInWishList(product.id);
  return (
    <main className="product-details-page">
      <nav className="product-breadcrumb" aria-label="Breadcrumb">
        <Link to="/products">Products</Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>

      <section className="product-showcase" aria-label={product.name}>
        <div className="product-image-panel">
          <span className="product-category-tag">{product.category}</span>
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
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-information">
          <p className="product-eyebrow">Thoughtfully selected for you</p>
          <h1>{product.name}</h1>
          <div className="product-review-summary">
            <span
              className="product-stars"
              aria-label={`${product.rating} out of 5 stars`}
            >
              {"★".repeat(Math.round(averageRating))}
              <span className="product-empty-stars">
                {"★".repeat(5 - Math.round(averageRating))}
              </span>
            </span>
            <span>{averageRating.toFixed(1)} / 5</span>
            <span className="summary-divider" aria-hidden="true">
              ·
            </span>
            <a href="#customer-reviews">{totalReviews} reviews</a>
          </div>

          <p className="product-description">
            Discover this quality {product.category.toLowerCase()} product,
            selected to bring a little more ease to your everyday.
          </p>

          <div className="product-purchase-card">
            <div className="product-prices">
              {product.originalPrice && (
                <span className="original-price">
                  {product.originalPrice} Birr
                </span>
              )}

              <span className="current-price">{product.price} Birr</span>

              {product.originalPrice && (
                <span className="sale-badge">
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                    100,
                  )}
                  % OFF
                </span>
              )}
            </div>
            <div className="stock-status">
              {product.stock > 0 ? (
                <p className="in-stock">In Stock: {product.stock} available</p>
              ) : (
                <p className="out-of-stock">Out of Stock</p>
              )}
            </div>
            <p className="product-purchase-note">
              A lovely choice, at a great price.
            </p>
            <button
              className="product-add-button"
              onClick={() => addToCart(product, quantity)}
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
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <div className="quantity-selector">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>

              <span>{quantity}</span>

              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            <p className="product-care-note">
              Easy, secure checkout whenever you're ready.
            </p>
          </div>

          <Link className="product-back-link" to="/products">
            <span aria-hidden="true">←</span> Continue browsing
          </Link>
        </div>
      </section>

      <section className="reviews-section" id="customer-reviews">
        <div className="reviews-heading">
          <div>
            <p className="product-eyebrow">A little feedback goes a long way</p>
            <h2>Customer reviews</h2>
            <p className="reviews-intro">
              {totalReviews > 0
                ? `Rated ${averageRating} out of 5 from ${totalReviews} customer ${totalReviews === 1 ? "review" : "reviews"}.`
                : "Be the first to share what you think."}
            </p>
          </div>
          <div className="review-filter">
            <label htmlFor="rating-filter">Show</label>
            <select
              id="rating-filter"
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
            >
              <option value="All">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
        </div>

        <p className="review-count">
          Showing {filteredReviews.length} of {totalReviews} reviews
        </p>

        <div className="reviews-layout">
          <div className="review-list">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <div className="review-card-heading">
                    <div>
                      <h3>{review.name}</h3>
                      <p className="review-date">{review.date}</p>
                    </div>
                    <span
                      className="review-rating"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {"★".repeat(review.rating)}
                      <span className="review-empty-stars">
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </article>
              ))
            ) : (
              <div className="reviews-empty">
                <span aria-hidden="true">✦</span>
                <p>
                  {totalReviews > 0
                    ? "No reviews match this rating yet."
                    : "No reviews yet. Your thoughts could be the first."}
                </p>
              </div>
            )}
          </div>
          {user ? (
            hasReviewed ? (
              <p>You have already reviewed this product.</p>
            ) :
              (<form className="review-form" onSubmit={handleReviewSubmit}>
                <h3>Share your thoughts</h3>
                <p>Your feedback helps others find something they’ll love.</p>



                <label htmlFor="review-rating">Your rating</label>
                <select
                  id="review-rating"
                  name="rating"
                  value={newReview.rating}
                  onChange={handleReviewChange}
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Poor</option>
                  <option value="1">1 - Very poor</option>
                </select>

                <label htmlFor="review-comment">Your review</label>
                <textarea
                  id="review-comment"
                  name="comment"
                  placeholder="What did you think about it?"
                  value={newReview.comment}
                  onChange={handleReviewChange}
                  required
                />

                <button type="submit">Post review</button>
              </form>
              )
          ) : (
            <p>
              Please <Link to="/login" state={{ from: `/products/${id}` }}>
                log in
              </Link> to write a review.
            </p>
          )}

        </div>
      </section>

      <section className="product-questions">
        <h2>Customer Questions & Answers</h2>

        <form onSubmit={handleQuestionSubmit}>
          {user ? (
            <>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask a question about this product..."
              />

              <button type="submit">Submit Question</button>
            </>
          ) : (
            <p>
              Please <Link to="/login" state={{ from: `/products/${id}` }}>
                log in
              </Link> to ask a question.
            </p>
          )}
        </form>

        {productQuestions.length === 0 ? (
          <p>No questions yet. Be the first to ask!</p>
        ) : (
          productQuestions.map((question) => (
            <div key={question.id} className="question-card">
              <p>
                <strong>{question.userName} asked about {product.name}:</strong>              </p>
              <p>{question.question}</p>
              <small>{question.date}</small>

              {question.answer ? (
                <div className="question-answer">
                  <strong>Admin answer:</strong>
                  <p>{question.answer}</p>
                </div>
              ) : (
                <p>Waiting for an answer...</p>
              )}
            </div>
          ))
        )}
      </section>

      <section className="related-products">
        <h2>You May Also Like</h2>

        <div className="related-products-grid">
          {relatedProducts.slice(0, 4).map((item) => (
            <Link
              to={`/products/${item.id}`}
              className="related-product-card"
              key={item.id}
            >
              <img src={item.image} alt={item.name} />

              <h3>{item.name}</h3>

              <p>{item.price} Birr</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ProductDetails;
