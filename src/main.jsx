import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import CartProvider from "./contexts/CartContext.jsx";
import ReviewProvider from "./contexts/ReviewContext.jsx";
import WishListProvider from "./contexts/WishListContext.jsx";
import ComparisonProvider from "./contexts/ComparisonContext.jsx";
import RecentlyViewedProvider from "./contexts/RecentlyViewedContext.jsx";
import OrderProvider from "./contexts/OrderContext.jsx";
import ProductProvider from "./contexts/ProductContext.jsx";
import AuthProvider from "./contexts/AuthContext.jsx";
import QuestionProvider from "./contexts/QuestionContext.jsx";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <ReviewProvider>
              <WishListProvider>
                <ComparisonProvider>
                  <RecentlyViewedProvider>
                    <QuestionProvider>
                      <OrderProvider>
                        <App />
                      </OrderProvider>
                    </QuestionProvider>

                  </RecentlyViewedProvider>
                </ComparisonProvider>
              </WishListProvider>
            </ReviewProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
