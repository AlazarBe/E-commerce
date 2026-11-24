import { useContext } from "react";
import { OrderContext } from "../contexts/orderContext";
import { ProductContext } from "../contexts/productContext";

import { Link } from "react-router-dom";

function AdminDashboard() {
  const { orders } = useContext(OrderContext);
  const {
    products = [],
    stockMovements = [],
  } = useContext(ProductContext);

  const totalOrders = orders ? orders.length : 0;
  const LOW_STOCK_LIMIT = 5;

  const lowStockProducts = products
    ? products.filter(
      (product) =>
        Number(product.stock) > 0 &&
        Number(product.stock) <= LOW_STOCK_LIMIT
    )
    : [];

  const outOfStockProducts = products
    ? products.filter((product) => Number(product.stock) === 0)
    : [];

  const lowStockCount = lowStockProducts.length;
  const outOfStockCount = outOfStockProducts.length;

  const totalRevenue = orders
    ? orders
      .filter((order) => order.status !== "Cancelled")
      .reduce((total, order) => total + (order.total || 0), 0)
    : 0;

  const totalProducts = products ? products.length : 0;
  // Inventory Report Calculations
  const totalStockUnits = products.reduce(
    (total, product) => total + (Number(product.stock) || 0),
    0
  );

  const totalRestocked = stockMovements.reduce(
    (total, movement) =>
      total + (movement.movementType === "Adjustment"
        ? 0
        : Number(movement.quantityAdded) || 0),
    0
  );

  const totalRemoved = stockMovements.reduce(
    (total, movement) =>
      total + (movement.movementType === "Adjustment"
        ? Number(movement.quantityChanged) || 0
        : 0),
    0
  );

  const highestStockProduct = [...products].sort(
    (a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0)
  )[0];

  const lowestStockProduct = [...products]
    .filter((product) => Number(product.stock) > 0)
    .sort(
      (a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0)
    )[0];

  const pendingOrders = orders
    ? orders.filter((order) => (order.status || "Pending") === "Pending").length
    : 0;

  const recentOrders = orders ? orders.slice(0, 5) : [];

  const getInitials = (name) => {
    if (!name) return "CU";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };
  const handleExportInventory = () => {
    const headers = [
      "Product Name",
      "Category",
      "Price",
      "Stock",
      "Stock Status",
    ];

    const rows = products.map((product) => {
      const stock = Number(product.stock) || 0;

      const status =
        stock === 0
          ? "Out of Stock"
          : stock <= 5
            ? "Low Stock"
            : "In Stock";

      return [
        product.name,
        product.category,
        product.price,
        stock,
        status,
      ];
    });

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };
  const handleExportStockMovements = () => {
    const headers = [
      "Product Name",
      "Movement Type",
      "Previous Stock",
      "Quantity Changed",
      "New Stock",
      "Reason",
      "Date",
    ];

    const rows = stockMovements.map((movement) => {
      const isAdjustment =
        movement.movementType === "Adjustment";

      return [
        movement.productName,
        isAdjustment ? "Stock Removed" : "Restocked",
        movement.previousStock,
        isAdjustment
          ? -movement.quantityChanged
          : movement.quantityAdded,
        movement.newStock,
        movement.reason || "Restock",
        new Date(movement.date).toLocaleString(),
      ];
    });

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "stock-movement-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };
  return (
    <div className="admin-dashboard">
      <h1>Dashboard Overview</h1>
      <p>Welcome to your store management dashboard.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <h2>{totalOrders}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <h2>{totalRevenue.toLocaleString()} Birr</h2>
        </div>

        <div className="stat-card">
          <h3>Total Products</h3>
          <h2>{totalProducts}</h2>
        </div>

        <div className="stat-card">
          <h3>Pending Orders</h3>
          <h2>{pendingOrders}</h2>
        </div>
        <div className="stat-card">
          <h3>Low Stock Products</h3>
          <h2>{lowStockCount}</h2>
        </div>

        <div className="stat-card">
          <h3>Out of Stock Products</h3>
          <h2>{outOfStockCount}</h2>
        </div>
      </div>
      <div className="inventory-alerts">
        <div className="inventory-alerts-header">
          <div className="inventory-alerts-title-wrap">
            <h2>Inventory Alerts</h2>
            <p className="inventory-alerts-subtitle">
              Products requiring immediate restocking or inventory attention
            </p>
          </div>

          <div className="inventory-alerts-actions">
            {lowStockCount + outOfStockCount > 0 && (
              <span className="inventory-alerts-badge">
                {lowStockCount + outOfStockCount}{" "}
                {lowStockCount + outOfStockCount === 1 ? "alert" : "alerts"}
              </span>
            )}
            <Link to="/admin/products" className="inventory-manage-btn">
              Manage Inventory →
            </Link>
          </div>
        </div>

        {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
          <div className="inventory-alerts-empty">
            <span className="inventory-empty-icon" aria-hidden="true">
              ✅
            </span>
            <h3>All products have sufficient stock</h3>
            <p>
              Your catalog is healthy. Items will appear here when their stock
              drops below {LOW_STOCK_LIMIT} units.
            </p>
          </div>
        ) : (
          <div className="inventory-alerts-list">
            {outOfStockProducts.map((product) => (
              <div key={product.id} className="inventory-alert out">
                <div className="inventory-alert-left">
                  <div className="inventory-alert-indicator out" aria-hidden="true">
                    ✕
                  </div>
                  {product.image && (
                    <div className="inventory-alert-thumb-wrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="inventory-alert-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80";
                        }}
                      />
                    </div>
                  )}
                  <div className="inventory-alert-info">
                    <span className="inventory-alert-name">{product.name}</span>
                    <span className="inventory-alert-category">
                      {product.category || "General"}
                    </span>
                  </div>
                </div>

                <div className="inventory-alert-right">
                  <span className="inventory-alert-status-badge out">
                    Out of Stock
                  </span>
                  <Link
                    to="/admin/products"
                    className="inventory-alert-restock-link"
                  >
                    Restock Product →
                  </Link>
                </div>
              </div>
            ))}

            {lowStockProducts.map((product) => (
              <div key={product.id} className="inventory-alert low">
                <div className="inventory-alert-left">
                  <div className="inventory-alert-indicator low" aria-hidden="true">
                    !
                  </div>
                  {product.image && (
                    <div className="inventory-alert-thumb-wrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="inventory-alert-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80";
                        }}
                      />
                    </div>
                  )}
                  <div className="inventory-alert-info">
                    <span className="inventory-alert-name">{product.name}</span>
                    <span className="inventory-alert-category">
                      {product.category || "General"}
                    </span>
                  </div>
                </div>

                <div className="inventory-alert-right">
                  <span className="inventory-alert-status-badge low">
                    {product.stock}{" "}
                    {Number(product.stock) === 1 ? "unit" : "units"} remaining
                  </span>
                  <Link
                    to="/admin/products"
                    className="inventory-alert-restock-link"
                  >
                    Restock Product →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inventory Reports */}
      <div className="inventory-reports">
        <div className="inventory-reports-header">
          <div className="inventory-reports-title-wrap">
            <h2>Inventory Reports</h2>
            <button
              onClick={handleExportInventory}
              className="export-btn"
            >
              Export Inventory
            </button>
            <p className="inventory-reports-subtitle">
              Overview of your store's inventory performance and stock distribution
            </p>
          </div>
        </div>

        <div className="inventory-report-grid">
          <div className="inventory-report-card">
            <div className="report-card-top">
              <span className="report-card-icon" aria-hidden="true">📦</span>
              <span className="report-card-tag">Catalog Total</span>
            </div>
            <h3>Total Stock Units</h3>
            <h2>{totalStockUnits.toLocaleString()}</h2>
            <p className="report-card-desc">Units currently in inventory</p>
          </div>

          <div className="inventory-report-card">
            <div className="report-card-top">
              <span className="report-card-icon" aria-hidden="true">📈</span>
              <span className="report-card-tag success-tag">Inflow</span>
            </div>
            <h3>Total Units Restocked</h3>
            <h2>+{totalRestocked.toLocaleString()}</h2>
            <p className="report-card-desc">Units added across all restocks</p>
          </div>

          <div className="inventory-report-card">
            <div className="report-card-top">
              <span className="report-card-icon" aria-hidden="true">📉</span>
              <span className="report-card-tag warning-tag">Outflow</span>
            </div>
            <h3>Total Units Removed</h3>
            <h2>-{totalRemoved.toLocaleString()}</h2>
            <p className="report-card-desc">Adjustments & write-offs</p>
          </div>

          <div className="inventory-report-card">
            <div className="report-card-top">
              <span className="report-card-icon" aria-hidden="true">🏆</span>
              <span className="report-card-tag top-tag">Highest Stock</span>
            </div>
            <h3>Most Stocked Item</h3>
            <h2 className="report-product-name" title={highestStockProduct?.name || "N/A"}>
              {highestStockProduct?.name || "N/A"}
            </h2>
            <p className="report-product-stock">
              <strong>{highestStockProduct?.stock ?? 0}</strong> units remaining
            </p>
          </div>

          <div className="inventory-report-card">
            <div className="report-card-top">
              <span className="report-card-icon" aria-hidden="true">⚡</span>
              <span className="report-card-tag low-tag">Lowest In-Stock</span>
            </div>
            <h3>Least Stocked Item</h3>
            <h2 className="report-product-name" title={lowestStockProduct?.name || "N/A"}>
              {lowestStockProduct?.name || "N/A"}
            </h2>
            <p className="report-product-stock">
              <strong>{lowestStockProduct?.stock ?? 0}</strong> units remaining
            </p>
          </div>
        </div>
      </div>

      {/* Stock Movement History */}
      <div className="stock-movement-section">
        <h2>Stock Movement History</h2>
        <button
          onClick={handleExportStockMovements}
          className="export-btn"
        >
          Export Stock Movements
        </button>
        <p>Recent inventory restocking activities.</p>

        {stockMovements.length === 0 ? (
          <p>No stock movements recorded yet.</p>
        ) : (
          <div className="orders-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Movement</th>
                  <th>Previous Stock</th>
                  <th>Quantity Added</th>
                  <th>New Stock</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {stockMovements.map((movement) => {
                  const matchedProduct = products?.find(
                    (p) => p.id === movement.productId
                  );
                  const productImage =
                    movement.productImage || matchedProduct?.image || "";

                  return (
                    <tr key={movement.id}>
                      <td>
                        <div className="product-table-cell">
                          {productImage && (
                            <div className="product-thumb-wrap">
                              <img
                                src={productImage}
                                alt={movement.productName}
                                className="product-table-thumb"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80";
                                }}
                              />
                            </div>
                          )}
                          <div className="product-cell-meta">
                            <span className="product-cell-name">
                              {movement.productName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {movement.movementType === "Adjustment"
                          ? "Stock Removed"
                          : movement.movementType === "Import"
                            ? "CSV Import"
                            : "Restocked"}
                      </td>
                      <td>{movement.previousStock} units</td>
                      <td>
                        {movement.movementType === "Adjustment" ||
                          movement.movementType === "Import"
                          ? `${movement.quantityChanged > 0 ? "+" : ""}${movement.quantityChanged} units`
                          : `+${movement.quantityAdded} units`}
                      </td>
                      <td>{movement.newStock} units</td>
                      <td>{movement.reason || "—"}</td>
                      <td>{formatDate(movement.date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="recent-orders">
        <div className="recent-orders-header">
          <div className="recent-orders-title-wrap">
            <h2>Recent Orders</h2>
            <p className="recent-orders-subtitle">
              Latest customer purchases and current fulfillment status
            </p>
          </div>

          <div className="recent-orders-actions">
            {recentOrders.length > 0 && (
              <span className="recent-orders-badge">
                {recentOrders.length} {recentOrders.length === 1 ? "order" : "orders"}
              </span>
            )}
            <Link to="/admin/orders" className="view-all-orders-btn">
              View All Orders →
            </Link>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="admin-empty-orders">
            <span className="admin-empty-icon" aria-hidden="true">
              📦
            </span>
            <h3>No orders have been placed yet</h3>
            <p>
              When customers complete orders in your store, they will appear here
              in real-time.
            </p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => {
                  const itemCount = order.items
                    ? order.items.reduce(
                      (sum, item) => sum + (item.quantity || 1),
                      0
                    )
                    : 0;

                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="admin-order-id">
                          #{order.id ? order.id.slice(0, 8).toUpperCase() : "N/A"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-customer-cell">
                          <div
                            className="admin-customer-avatar"
                            aria-hidden="true"
                          >
                            {getInitials(order.customer?.fullName)}
                          </div>
                          <div className="admin-customer-meta">
                            <span className="admin-customer-name">
                              {order.customer?.fullName || "Guest Customer"}
                            </span>
                            <span className="admin-customer-sub">
                              {order.customer?.city ||
                                order.customer?.email ||
                                "Customer"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <time className="admin-order-date">
                          {formatDate(order.date)}
                        </time>
                      </td>

                      <td>
                        <span className="admin-items-count">
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                      </td>

                      <td>
                        <span className="admin-order-total">
                          {order.total
                            ? Number(order.total).toLocaleString()
                            : "0"}{" "}
                          <span className="admin-currency">Birr</span>
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${(
                            order.status || "Pending"
                          ).toLowerCase()}`}
                        >
                          <span
                            className="status-badge-dot"
                            aria-hidden="true"
                          ></span>
                          {order.status || "Pending"}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/orders/${order.id}`}
                          className="admin-order-action-link"
                          title="View order details"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
