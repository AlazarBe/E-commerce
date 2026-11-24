import { useState, useMemo, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import productsData from "../data/products";
import { ProductContext } from "../contexts/productContext";

function AdminProducts() {
    const {
        products: productList = [],
        setProducts: setProductList,
        addStockMovement,
    } = useContext(ProductContext);
    const importFileRef = useRef(null);

    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        category: "",
        image: "",
        stock: "",
    });
    const [editingProductId, setEditingProductId] = useState(null);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [bulkCategory, setBulkCategory] = useState("");

    const [bulkPriceDirection, setBulkPriceDirection] = useState("increase");
    const [bulkPriceType, setBulkPriceType] = useState("amount");
    const [bulkPriceValue, setBulkPriceValue] = useState("");

    const [bulkStockDirection, setBulkStockDirection] = useState("add");
    const [bulkStockQuantity, setBulkStockQuantity] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");
    const [notification, setNotification] = useState(null);
    const [restockProductId, setRestockProductId] = useState(null);
    const [restockQuantity, setRestockQuantity] = useState("");
    const [adjustmentProductId, setAdjustmentProductId] = useState(null);
    const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
    const [adjustmentReason, setAdjustmentReason] = useState("Damaged");

    const showToast = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification((current) => (current?.message === message ? null : current));
        }, 3500);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddProduct = (e) => {
        e.preventDefault();

        if (!newProduct.name.trim()) {
            showToast("Please enter a product name.", "error");
            return;
        }

        if (!newProduct.price || Number(newProduct.price) < 0) {
            showToast("Please enter a valid price.", "error");
            return;
        }

        const createdProduct = {
            id: Date.now(),
            name: newProduct.name.trim(),
            price: Number(newProduct.price),
            category: newProduct.category || "Electronics",
            image: newProduct.image.trim() || "",
            stock: Math.max(0, parseInt(newProduct.stock, 10) || 0),
            featured: false,
            rating: 5.0,
            reviews: 0,
            isnew: true,
        };

        setProductList((prev) => [createdProduct, ...prev]);

        setNewProduct({
            name: "",
            price: "",
            category: "Electronics",
            image: "",
            stock: "",
        });

        setShowAddForm(false);
        showToast(`"${createdProduct.name}" added successfully!`, "success");
    };
    const handleEditProduct = (product) => {
        setEditingProductId(product.id);

        setNewProduct({
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image || "",
            stock: product.stock,
        });

        setShowAddForm(true);
    };
    const handleCancelEdit = () => {
        setEditingProductId(null);
        setNewProduct({
            name: "",
            price: "",
            category: "Electronics",
            image: "",
            stock: "",
        });
        setShowAddForm(false);
    };
    const handleUpdateProduct = (e) => {
        e.preventDefault();

        if (!newProduct.name.trim() || !newProduct.price) {
            showToast("Please fill in the required fields.", "error");
            return;
        }

        setProductList((prevProducts) =>
            prevProducts.map((product) =>
                product.id === editingProductId
                    ? {
                        ...product,
                        name: newProduct.name.trim(),
                        price: Number(newProduct.price),
                        category: newProduct.category,
                        image: newProduct.image.trim(),
                        stock: Math.max(0, Number(newProduct.stock) || 0),
                    }
                    : product
            )
        );

        setEditingProductId(null);

        setNewProduct({
            name: "",
            price: "",
            category: "Electronics",
            image: "",
            stock: "",
        });

        setShowAddForm(false);
        showToast("Product updated successfully!", "success");
    };

    const handleDeleteProduct = (id, name) => {
        if (window.confirm(`Are you sure you want to remove "${name}" from the store?`)) {
            setProductList((prev) => prev.filter((product) => product.id !== id));
            showToast(`"${name}" was removed from the catalog.`, "info");
        }
    };
    const handleSelectProduct = (productId, checked) => {
        setSelectedProductIds((prev) =>
            checked
                ? [...prev, productId]
                : prev.filter((id) => id !== productId)
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedProductIds((prev) => [
                ...new Set([
                    ...prev,
                    ...filteredProducts.map((product) => product.id),
                ]),
            ]);
        } else {
            const visibleIds = filteredProducts.map((product) => product.id);

            setSelectedProductIds((prev) =>
                prev.filter((id) => !visibleIds.includes(id))
            );
        }
    };

    const handleBulkDelete = () => {
        if (selectedProductIds.length === 0) {
            showToast("Please select products to delete.", "error");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedProductIds.length} selected products?`
        );

        if (!confirmed) return;

        setProductList((prevProducts) =>
            prevProducts.filter(
                (product) => !selectedProductIds.includes(product.id)
            )
        );

        const deletedCount = selectedProductIds.length;

        setSelectedProductIds([]);

        showToast(
            `${deletedCount} products deleted successfully!`,
            "success"
        );
    };
    const handleBulkEdit = () => {
        if (selectedProductIds.length === 0) {
            showToast("Please select products first.", "error");
            return;
        }

        const hasCategoryChange = bulkCategory !== "";
        const hasPriceChange = bulkPriceValue !== "";
        const hasStockChange = bulkStockQuantity !== "";

        if (!hasCategoryChange && !hasPriceChange && !hasStockChange) {
            showToast("Please enter at least one change.", "error");
            return;
        }

        const selectedProducts = productList.filter((product) =>
            selectedProductIds.includes(product.id)
        );

        // Validate price
        let priceValue = 0;

        if (hasPriceChange) {
            priceValue = Number(bulkPriceValue);

            if (!Number.isFinite(priceValue) || priceValue <= 0) {
                showToast("Enter a valid price adjustment.", "error");
                return;
            }

            const invalidPrice = selectedProducts.some((product) => {
                const currentPrice = Number(product.price) || 0;

                const adjustment =
                    bulkPriceType === "percentage"
                        ? currentPrice * (priceValue / 100)
                        : priceValue;

                const updatedPrice =
                    bulkPriceDirection === "increase"
                        ? currentPrice + adjustment
                        : currentPrice - adjustment;

                return updatedPrice < 0;
            });

            if (invalidPrice) {
                showToast("The adjustment would make a product price negative.", "error");
                return;
            }
        }

        // Validate stock
        let stockQuantity = 0;

        if (hasStockChange) {
            stockQuantity = Number(bulkStockQuantity);

            if (!Number.isInteger(stockQuantity) || stockQuantity <= 0) {
                showToast("Enter a valid whole stock quantity.", "error");
                return;
            }

            const invalidStock = selectedProducts.some((product) => {
                const currentStock = Number(product.stock) || 0;

                return (
                    bulkStockDirection === "remove" &&
                    stockQuantity > currentStock
                );
            });

            if (invalidStock) {
                showToast("Some products do not have enough stock to remove that quantity.", "error");
                return;
            }
        }

        // Update selected products
        setProductList((prevProducts) =>
            prevProducts.map((product) => {
                if (!selectedProductIds.includes(product.id)) {
                    return product;
                }

                const updatedProduct = { ...product };

                if (hasCategoryChange) {
                    updatedProduct.category = bulkCategory;
                }

                if (hasPriceChange) {
                    const currentPrice = Number(product.price) || 0;

                    const adjustment =
                        bulkPriceType === "percentage"
                            ? currentPrice * (priceValue / 100)
                            : priceValue;

                    updatedProduct.price =
                        bulkPriceDirection === "increase"
                            ? currentPrice + adjustment
                            : currentPrice - adjustment;
                }

                if (hasStockChange) {
                    const previousStock = Number(product.stock) || 0;

                    const newStock =
                        bulkStockDirection === "add"
                            ? previousStock + stockQuantity
                            : previousStock - stockQuantity;

                    updatedProduct.stock = newStock;

                    const movementId =
                        typeof crypto !== "undefined" && crypto.randomUUID
                            ? crypto.randomUUID()
                            : `${Date.now()}-${product.id}`;

                    if (bulkStockDirection === "add") {
                        addStockMovement({
                            id: movementId,
                            productId: product.id,
                            productName: product.name,
                            productImage: product.image || "",
                            movementType: "Bulk Restock",
                            previousStock,
                            quantityAdded: stockQuantity,
                            newStock,
                            date: new Date().toISOString(),
                        });
                    } else {
                        addStockMovement({
                            id: movementId,
                            productId: product.id,
                            productName: product.name,
                            movementType: "Adjustment",
                            previousStock,
                            quantityChanged: stockQuantity,
                            newStock,
                            reason: "Bulk edit",
                            date: new Date().toISOString(),
                        });
                    }
                }

                return updatedProduct;
            })
        );

        const updatedCount = selectedProducts.length;

        // Reset bulk editor
        setSelectedProductIds([]);
        setBulkCategory("");
        setBulkPriceDirection("increase");
        setBulkPriceType("amount");
        setBulkPriceValue("");
        setBulkStockDirection("add");
        setBulkStockQuantity("");

        showToast(`${updatedCount} products updated successfully!`, "success");
    };
    const handleRestock = (e, productId) => {
        e.preventDefault();

        const quantity = Number(restockQuantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            showToast("Enter a valid quantity greater than zero.", "error");
            return;
        }

        const product = productList.find((p) => p.id === productId);

        if (!product) return;

        const previousStock = Number(product.stock) || 0;
        const newStock = previousStock + quantity;

        setProductList((prevProducts) =>
            prevProducts.map((p) =>
                p.id === productId
                    ? { ...p, stock: newStock }
                    : p
            )
        );

        addStockMovement({
            id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
            productId,
            productName: product.name,
            productImage: product.image || "",
            previousStock,
            quantityAdded: quantity,
            newStock,
            date: new Date().toISOString(),
        });

        setRestockProductId(null);
        setRestockQuantity("");

        showToast(`${quantity} units added successfully!`, "success");
    };
    const handleStockAdjustment = (e, productId) => {
        e.preventDefault();

        const quantity = Number(adjustmentQuantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            showToast("Enter a valid quantity greater than zero.", "error");
            return;
        }

        const product = productList.find((p) => p.id === productId);

        if (!product) return;

        const previousStock = Number(product.stock) || 0;

        if (quantity > previousStock) {
            showToast("You cannot remove more stock than available.", "error");
            return;
        }

        const newStock = previousStock - quantity;

        setProductList((prevProducts) =>
            prevProducts.map((p) =>
                p.id === productId
                    ? { ...p, stock: newStock }
                    : p
            )
        );

        addStockMovement({
            id: crypto.randomUUID(),
            productId,
            productName: product.name,
            movementType: "Adjustment",
            previousStock,
            quantityChanged: quantity,
            newStock,
            reason: adjustmentReason,
            date: new Date().toISOString(),
        });

        setAdjustmentProductId(null);
        setAdjustmentQuantity("");
        setAdjustmentReason("Damaged");

        showToast(`${quantity} units removed from ${product.name}.`, "success");
    };
    const handleResetCatalog = () => {
        setProductList(productsData);
        localStorage.removeItem("products");
    };
    const handleImportInventory = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".csv")) {
            showToast("Please select a CSV file.", "error");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            const text = event.target.result;

            const lines = text.trim().split(/\r?\n/);

            if (lines.length < 2) {
                showToast("The CSV file has no product records.", "error");
                return;
            }

            const headers = lines[0]
                .split(",")
                .map((header) => header.trim().toLowerCase());

            const nameIndex = headers.indexOf("product name");
            const stockIndex = headers.indexOf("stock");

            if (nameIndex === -1 || stockIndex === -1) {
                showToast(
                    'CSV must contain "Product Name" and "Stock" columns.',
                    "error"
                );
                return;
            }

            const importedProducts = lines.slice(1).map((line) => {
                const columns = line.split(",");

                return {
                    name: columns[nameIndex]?.trim(),
                    stock: columns[stockIndex]?.trim(),
                };
            });

            const validProducts = importedProducts.filter(
                (item) =>
                    item.name &&
                    item.stock !== "" &&
                    Number.isInteger(Number(item.stock)) &&
                    Number(item.stock) >= 0
            );

            if (validProducts.length === 0) {
                showToast("No valid product records found.", "error");
                return;
            }

            const matchedProducts = validProducts
                .map((item) => {
                    const product = productList.find(
                        (p) =>
                            p.name.toLowerCase() === item.name.toLowerCase()
                    );

                    if (!product) return null;

                    return {
                        product,
                        newStock: Number(item.stock),
                    };
                })
                .filter(Boolean);

            const unmatchedCount = validProducts.length - matchedProducts.length;

            if (matchedProducts.length === 0) {
                showToast("No matching products found.", "error");
                return;
            }

            // Update product stock
            setProductList((prevProducts) =>
                prevProducts.map((product) => {
                    const imported = matchedProducts.find(
                        (item) => item.product.id === product.id
                    );

                    return imported
                        ? { ...product, stock: imported.newStock }
                        : product;
                })
            );

            // Record each imported stock change
            matchedProducts.forEach(({ product, newStock }) => {
                const previousStock = Number(product.stock) || 0;

                addStockMovement({
                    id: crypto.randomUUID(),
                    productId: product.id,
                    productName: product.name,
                    movementType: "Import",
                    previousStock,
                    quantityChanged: newStock - previousStock,
                    newStock,
                    reason: "CSV Import",
                    date: new Date().toISOString(),
                });
            });

            showToast(
                `${matchedProducts.length} products updated. ${unmatchedCount} unmatched products skipped.`,
                "success"
            );
        }

        reader.readAsText(file);
        e.target.value = "";
    };

    // Quick Stats
    // Inventory Statistics
    const LOW_STOCK_LIMIT = 5;

    const totalProducts = productList.length;

    const inStockCount = productList.filter(
        (p) => p.stock > LOW_STOCK_LIMIT
    ).length;

    const lowStockCount = productList.filter(
        (p) => p.stock > 0 && p.stock <= LOW_STOCK_LIMIT
    ).length;

    const outOfStockCount = productList.filter(
        (p) => p.stock === 0
    ).length;

    // Filtered Products
    const filteredProducts = useMemo(() => {
        return productList.filter((product) => {
            const q = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !q ||
                product.name.toLowerCase().includes(q) ||
                product.category.toLowerCase().includes(q) ||
                String(product.id).includes(q);

            const matchesCategory =
                categoryFilter === "all" || product.category === categoryFilter;

            let matchesStock = true;
            const stock = product.stock || 0;
            if (stockFilter === "in-stock") matchesStock = stock > 5;
            if (stockFilter === "low-stock") matchesStock = stock > 0 && stock <= 5;
            if (stockFilter === "out-of-stock") matchesStock = stock === 0;

            return matchesSearch && matchesCategory && matchesStock;
        });
    }, [productList, searchQuery, categoryFilter, stockFilter]);

    const hasActiveFilters =
        searchQuery.trim() !== "" ||
        categoryFilter !== "all" ||
        stockFilter !== "all";

    const clearFilters = () => {
        setSearchQuery("");
        setCategoryFilter("all");
        setStockFilter("all");
    };

    const getStockStatus = (stock) => {
        const qty = Number(stock) || 0;

        if (qty === 0) {
            return { label: "Out of Stock", className: "status-out-of-stock" };
        }

        if (qty <= LOW_STOCK_LIMIT) {
            return { label: "Low Stock", className: "status-low-stock" };
        }

        return { label: "In Stock", className: "status-in-stock" };
    };

    const getCategoryClass = (category) => {
        switch (category) {
            case "Electronics":
                return "cat-electronics";
            case "Fashion":
                return "cat-fashion";
            case "Accessories":
                return "cat-accessories";
            case "Home & Living":
                return "cat-home";
            default:
                return "cat-general";
        }
    };

    return (
        <div className="admin-products">
            {/* Toast Notification */}
            {notification && (
                <div className={`admin-toast toast-${notification.type}`} role="alert">
                    <span className="toast-icon" aria-hidden="true">
                        {notification.type === "success" && "✓"}
                        {notification.type === "error" && "✕"}
                        {notification.type === "info" && "ℹ"}
                    </span>
                    <span className="toast-message">{notification.message}</span>
                    <button
                        type="button"
                        className="toast-close"
                        onClick={() => setNotification(null)}
                        aria-label="Dismiss notification"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Page Header */}
            <div className="admin-products-header">
                <div className="header-text-group">
                    <h1>Product Management</h1>
                    <p>Manage store catalog, track inventory levels, and add new products.</p>
                </div>

                <div className="header-actions-group">
                    <input
                        type="file"
                        accept=".csv"
                        ref={importFileRef}
                        onChange={handleImportInventory}
                        style={{ display: "none" }}
                    />

                    <button
                        type="button"
                        className="admin-btn-secondary"
                        onClick={() => importFileRef.current.click()}
                    >
                        Import Inventory CSV
                    </button>
                    <button
                        type="button"
                        className="reset-demo-btn"
                        onClick={handleResetCatalog}
                        title="Reset to default demo products"
                    >
                        ↻ Reset Demo Data
                    </button>

                    <button
                        type="button"
                        className={`admin-toggle-form-btn ${showAddForm ? "active" : ""}`}
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? (
                            <>
                                <span aria-hidden="true">✕</span> Close Form
                            </>
                        ) : (
                            <>
                                <span aria-hidden="true">+</span> Add New Product
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Inventory Stats Bar */}
            <div className="products-stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon-wrap icon-blue" aria-hidden="true">
                        📦
                    </div>
                    <div>
                        <h3>Total Catalog</h3>
                        <h2>{totalProducts}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon-wrap icon-green" aria-hidden="true">
                        ✓
                    </div>
                    <div>
                        <h3>In Stock</h3>
                        <h2>{inStockCount}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon-wrap icon-amber" aria-hidden="true">
                        ⚡
                    </div>
                    <div>
                        <h3>Low Stock (≤ 5)</h3>                        <h2>{lowStockCount}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon-wrap icon-red" aria-hidden="true">
                        ✕
                    </div>
                    <div>
                        <h3>Out of Stock</h3>
                        <h2>{outOfStockCount}</h2>
                    </div>
                </div>
            </div>

            {/* Add New Product Collapsible Form Card */}
            {showAddForm && (
                <section className="product-form-card" aria-label="Add New Product">
                    <div className="product-form-header">
                        <div>
                            <h2>Add New Product</h2>
                            <p className="product-form-subtitle">
                                Enter product specifications and details to publish to your store.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="product-form-close-btn"
                            onClick={() => setShowAddForm(false)}
                            aria-label="Close add product form"
                        >
                            ✕
                        </button>
                    </div>

                    <form className="product-form" onSubmit={editingProductId ? handleUpdateProduct : handleAddProduct}>
                        <div className="form-grid">
                            {/* Product Name */}
                            <div className="form-group form-group-full">
                                <label htmlFor="product-name">
                                    Product Name <span className="field-required">*</span>
                                </label>
                                <input
                                    id="product-name"
                                    name="name"
                                    type="text"
                                    placeholder="e.g. Premium Noise-Cancelling Headphones"
                                    value={newProduct.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div className="form-group">
                                <label htmlFor="product-category">
                                    Category <span className="field-required">*</span>
                                </label>
                                <div className="select-wrapper">
                                    <select
                                        id="product-category"
                                        name="category"
                                        value={newProduct.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Accessories">Accessories</option>
                                        <option value="Home & Living">Home & Living</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="form-group">
                                <label htmlFor="product-price">
                                    Price (Birr) <span className="field-required">*</span>
                                </label>
                                <div className="input-with-affix">
                                    <span className="input-prefix" aria-hidden="true">
                                        ETB
                                    </span>
                                    <input
                                        id="product-price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="e.g. 1500"
                                        value={newProduct.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Stock Quantity */}
                            <div className="form-group">
                                <label htmlFor="product-stock">
                                    Stock Units <span className="field-required">*</span>
                                </label>
                                <input
                                    id="product-stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="e.g. 25"
                                    value={newProduct.stock}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Image URL */}
                            <div className="form-group">
                                <label htmlFor="product-image">
                                    Image URL <span className="field-optional">(optional)</span>
                                </label>
                                <input
                                    id="product-image"
                                    name="image"
                                    type="url"
                                    placeholder="https://images.unsplash.com/... (or leave blank for demo image)"
                                    value={newProduct.image}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Live Image Preview if link entered */}
                        {newProduct.image.trim() && (
                            <div className="form-image-preview">
                                <span className="preview-label">Image Preview:</span>
                                <div className="preview-thumb-box">
                                    <img
                                        src={newProduct.image}
                                        alt="Preview"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="product-form-actions">
                            <button
                                type="button"
                                className="admin-btn-secondary"
                                onClick={() =>
                                    setNewProduct({
                                        name: "",
                                        price: "",
                                        category: "",
                                        image: "",
                                        stock: "",
                                    })
                                }
                            >
                                Clear Fields
                            </button>

                            <button type="submit" className="admin-btn-primary">
                                {editingProductId ? "✓ Save Changes" : "✓ Add Product to Catalog"}
                            </button>
                            <button type="button" onClick={handleCancelEdit}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Main Products Table Card */}
            <section className="products-table-card">
                {/* Table Header & Controls Bar */}
                <div className="products-table-header">
                    <div className="table-title-wrap">
                        <h2>Product Catalog</h2>
                        <span className="table-count-badge">
                            Showing {filteredProducts.length} of {totalProducts} products
                        </span>
                    </div>

                    {/* Search & Filter Toolbar */}
                    <div className="products-toolbar">
                        {/* Search Input */}
                        <div className="toolbar-search-wrap">
                            <span className="search-icon" aria-hidden="true">
                                🔍
                            </span>
                            <input
                                type="text"
                                className="toolbar-search-input"
                                placeholder="Search products by name or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="clear-search-btn"
                                    onClick={() => setSearchQuery("")}
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="toolbar-filter-group">
                            <select
                                className="toolbar-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                aria-label="Filter by Category"
                            >
                                <option value="all">All Categories</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Fashion">Fashion</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Home & Living">Home & Living</option>
                            </select>
                        </div>

                        {/* Stock Filter */}
                        <div className="toolbar-filter-group">
                            <select
                                className="toolbar-select"
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                aria-label="Filter by Stock Status"
                            >
                                <option value="all">All Stock Statuses</option>
                                <option value="in-stock">In Stock (&gt; 5)</option>
                                <option value="low-stock">Low Stock (1 - 5)</option>
                                <option value="out-of-stock">Out of Stock (0)</option>
                            </select>
                        </div>

                        {/* Reset Filters Button */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="clear-filters-btn"
                                onClick={clearFilters}
                                title="Reset all search and filters"
                            >
                                ✕ Clear Filters
                            </button>
                        )}
                        {selectedProductIds.length > 0 && (
                            <button
                                type="button"
                                className="admin-action-btn delete-btn"
                                onClick={handleBulkDelete}
                            >
                                Delete Selected ({selectedProductIds.length})
                            </button>
                        )}
                    </div>
                </div>
                {/* Bulk Edit Panel */}
                {selectedProductIds.length > 0 && (
                    <div className="bulk-edit-panel">
                        <div className="bulk-edit-header">
                            <div>
                                <h3>Bulk Edit Products</h3>
                                <p>
                                    {selectedProductIds.length} products selected.
                                    Leave fields unchanged if you don't want to modify them.
                                </p>
                            </div>
                        </div>

                        <div className="bulk-edit-grid">

                            {/* Category */}
                            <div className="bulk-edit-field">
                                <label>Change Category</label>

                                <select
                                    value={bulkCategory}
                                    onChange={(e) => setBulkCategory(e.target.value)}
                                >
                                    <option value="">Keep Current Category</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Accessories">Accessories</option>
                                    <option value="Home & Living">Home & Living</option>
                                </select>
                            </div>

                            {/* Price Direction */}
                            <div className="bulk-edit-field">
                                <label>Price Action</label>

                                <select
                                    value={bulkPriceDirection}
                                    onChange={(e) => setBulkPriceDirection(e.target.value)}
                                >
                                    <option value="increase">Increase Price</option>
                                    <option value="decrease">Decrease Price</option>
                                </select>
                            </div>

                            {/* Price Type */}
                            <div className="bulk-edit-field">
                                <label>Price Adjustment Type</label>

                                <select
                                    value={bulkPriceType}
                                    onChange={(e) => setBulkPriceType(e.target.value)}
                                >
                                    <option value="amount">Fixed Amount (Birr)</option>
                                    <option value="percentage">Percentage (%)</option>
                                </select>
                            </div>

                            {/* Price Value */}
                            <div className="bulk-edit-field">
                                <label>Price Adjustment Value</label>

                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder={
                                        bulkPriceType === "amount"
                                            ? "Enter Birr amount"
                                            : "Enter percentage"
                                    }
                                    value={bulkPriceValue}
                                    onChange={(e) => setBulkPriceValue(e.target.value)}
                                />
                            </div>

                            {/* Stock Direction */}
                            <div className="bulk-edit-field">
                                <label>Stock Action</label>

                                <select
                                    value={bulkStockDirection}
                                    onChange={(e) => setBulkStockDirection(e.target.value)}
                                >
                                    <option value="add">Add Stock</option>
                                    <option value="remove">Remove Stock</option>
                                </select>
                            </div>

                            {/* Stock Quantity */}
                            <div className="bulk-edit-field">
                                <label>Stock Quantity</label>

                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="Enter quantity"
                                    value={bulkStockQuantity}
                                    onChange={(e) => setBulkStockQuantity(e.target.value)}
                                />
                            </div>

                        </div>

                        <div className="bulk-edit-actions">
                            <button
                                type="button"
                                className="admin-btn-secondary"
                                onClick={() => {
                                    setBulkCategory("");
                                    setBulkPriceDirection("increase");
                                    setBulkPriceType("amount");
                                    setBulkPriceValue("");
                                    setBulkStockDirection("add");
                                    setBulkStockQuantity("");
                                }}
                            >
                                Clear Changes
                            </button>

                            <button
                                type="button"
                                className="admin-btn-primary"
                                onClick={handleBulkEdit}
                            >
                                Apply Changes to {selectedProductIds.length} Products
                            </button>
                        </div>
                    </div>
                )}


                {/* Products Table Content */}
                {filteredProducts.length === 0 ? (
                    <div className="admin-empty-products">
                        <span className="admin-empty-icon" aria-hidden="true">
                            🔍
                        </span>
                        <h3>No products found</h3>
                        <p>
                            {hasActiveFilters
                                ? "No products match your current search or filter criteria."
                                : "Your store catalog is currently empty. Click 'Add New Product' above to list an item."}
                        </p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="admin-btn-secondary empty-reset-btn"
                                onClick={clearFilters}
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="products-table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredProducts.length > 0 &&
                                                filteredProducts.every((product) =>
                                                    selectedProductIds.includes(product.id)
                                                )
                                            }
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            aria-label="Select all visible products"
                                        />
                                    </th>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock Level</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProducts.map((product) => {
                                    const stockStatus = getStockStatus(product.stock);
                                    const isOutOfStock = (product.stock || 0) === 0;
                                    const isLowStock =
                                        (product.stock || 0) > 0 && product.stock <= 5;

                                    return (
                                        <tr
                                            key={product.id}
                                            className={isOutOfStock ? "row-out-of-stock" : ""}
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProductIds.includes(product.id)}
                                                    onChange={(e) =>
                                                        handleSelectProduct(product.id, e.target.checked)
                                                    }
                                                    aria-label={`Select ${product.name}`}
                                                />
                                            </td>

                                            {/* Product Thumbnail & Meta */}
                                            <td>
                                                <div className="product-table-cell">
                                                    <div className="product-thumb-wrap">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="product-table-thumb"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src =
                                                                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80";
                                                            }}
                                                        />
                                                        {product.isnew && (
                                                            <span className="thumb-new-tag">NEW</span>
                                                        )}
                                                    </div>
                                                    <div className="product-cell-meta">
                                                        <span className="product-cell-name">
                                                            {product.name}
                                                        </span>
                                                        <span className="product-cell-id">
                                                            ID: #{String(product.id).slice(-6)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category Badge */}
                                            <td>
                                                <span
                                                    className={`category-pill ${getCategoryClass(
                                                        product.category
                                                    )}`}
                                                >
                                                    {product.category}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td>
                                                <div className="price-cell">
                                                    <span className="price-current">
                                                        {Number(product.price).toLocaleString()} Birr
                                                    </span>
                                                    {product.originalPrice && (
                                                        <span className="price-original">
                                                            {Number(product.originalPrice).toLocaleString()} Birr
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Stock Quantity */}
                                            <td>
                                                <div className="stock-quantity-cell">
                                                    <span
                                                        className={`stock-badge ${isOutOfStock
                                                            ? "stock-zero"
                                                            : isLowStock
                                                                ? "stock-low"
                                                                : "stock-healthy"
                                                            }`}
                                                    >
                                                        {product.stock || 0}{" "}
                                                        {product.stock === 1 ? "unit" : "units"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <span
                                                    className={`status-badge ${stockStatus.className}`}
                                                >
                                                    <span
                                                        className="status-badge-dot"
                                                        aria-hidden="true"
                                                    ></span>
                                                    {stockStatus.label}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                <div className="product-actions-cell">
                                                    <Link
                                                        to={`/products/${product.id}`}
                                                        className="admin-action-btn view-btn"
                                                        title="Preview product in storefront"
                                                    >
                                                        <span aria-hidden="true">👁️</span> View
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        className="admin-action-btn delete-btn"
                                                        onClick={() =>
                                                            handleDeleteProduct(product.id, product.name)
                                                        }
                                                        title="Delete product"
                                                    >
                                                        <span aria-hidden="true">🗑️</span> Delete
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditProduct(product)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn"
                                                        onClick={() => {
                                                            setRestockProductId(
                                                                restockProductId === product.id ? null : product.id
                                                            );
                                                            setRestockQuantity("");
                                                        }}
                                                    >
                                                        Restock
                                                    </button>

                                                    {restockProductId === product.id && (
                                                        <form
                                                            onSubmit={(e) => handleRestock(e, product.id)}
                                                            className="restock-form"
                                                        >
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                step="1"
                                                                placeholder="Quantity"
                                                                value={restockQuantity}
                                                                onChange={(e) => setRestockQuantity(e.target.value)}
                                                                required
                                                            />

                                                            <button type="submit">
                                                                Add Stock
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setRestockProductId(null);
                                                                    setRestockQuantity("");
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </form>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn"
                                                        onClick={() => {
                                                            setAdjustmentProductId(
                                                                adjustmentProductId === product.id ? null : product.id
                                                            );
                                                            setAdjustmentQuantity("");
                                                            setAdjustmentReason("Damaged");
                                                        }}
                                                    >
                                                        Adjust Stock
                                                    </button>

                                                    {adjustmentProductId === product.id && (
                                                        <form
                                                            className="restock-form"
                                                            onSubmit={(e) => handleStockAdjustment(e, product.id)}
                                                        >
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                step="1"
                                                                placeholder="Quantity to remove"
                                                                value={adjustmentQuantity}
                                                                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                                                                required
                                                            />

                                                            <select
                                                                value={adjustmentReason}
                                                                onChange={(e) => setAdjustmentReason(e.target.value)}
                                                            >
                                                                <option value="Damaged">Damaged</option>
                                                                <option value="Lost">Lost</option>
                                                                <option value="Manual correction">Manual correction</option>
                                                            </select>

                                                            <button type="submit">Confirm Adjustment</button>

                                                            <button
                                                                type="button"
                                                                onClick={() => setAdjustmentProductId(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default AdminProducts;
