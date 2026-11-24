import { useState, useEffect } from "react";
import { ReviewContext } from "./reviewContext";
import reviews from "../data/reviews";

function ReviewProvider({ children }) {
  const [allReviews, setAllReviews] = useState(() => {
    const savedReviews = localStorage.getItem("reviews");

    return savedReviews ? JSON.parse(savedReviews) : reviews;
  });

  useEffect(() => {
    localStorage.setItem("reviews", JSON.stringify(allReviews));
  }, [allReviews]);

  return (
    <ReviewContext.Provider value={{ allReviews, setAllReviews }}>
      {children}
    </ReviewContext.Provider>
  );
}

export default ReviewProvider;
