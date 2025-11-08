import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Eye,
  Filter,
  Package,
  Plus,
  Edit,
  Trash2,
  EyeOff,
  Star,
  Gift,
  Menu,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Products.css";

const Products = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "Drinks",
    stock: "",
    featured: false,
    displayOnGift: false,
    displayOnMenu: false,
  });
  // Image preview and error state for Add/Edit modals
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");

  // Validate and preview image URL in real-time
  useEffect(() => {
    if (!formData.image) {
      setImagePreview("");
      setImageError("");
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      setImagePreview(formData.image);
      setImageError("");
    };
    img.onerror = () => {
      setImagePreview("");
      setImageError("Invalid image URL or image could not be loaded.");
    };
    img.src = formData.image;
  }, [formData.image]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "All Categories") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, products]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get("http://localhost:3001/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
      setLoading(false);
    } catch {
      setError("Failed to load products");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "Drinks",
      stock: "",
      featured: false,
      displayOnGift: false,
      displayOnMenu: false,
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        "http://localhost:3001/admin/products",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Add new product to the beginning of the list
        setProducts((prev) => [response.data.product, ...prev]);
        setShowAddModal(false);
        resetForm();
        alert("Product added successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add product");
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.put(
        `http://localhost:3001/admin/products/${selectedProduct._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update product in the list
        setProducts((prev) =>
          prev.map((product) =>
            product._id === selectedProduct._id
              ? response.data.product
              : product
          )
        );
        setShowEditModal(false);
        setSelectedProduct(null);
        resetForm();
        alert("Product updated successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.delete(
        `http://localhost:3001/admin/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove product from the list
        setProducts((prev) =>
          prev.filter((product) => product._id !== productId)
        );
        alert("Product deleted successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleToggleAvailability = async (productId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.patch(
        `http://localhost:3001/admin/products/${productId}/toggle-availability`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update product in the list
        setProducts((prev) =>
          prev.map((product) =>
            product._id === productId ? response.data.product : product
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle availability");
    }
  };

  const handleToggleDisplay = async (productId, displayType) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.patch(
        `http://localhost:3001/admin/products/${productId}/toggle-display`,
        { displayType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update product in the list
        setProducts((prev) =>
          prev.map((product) =>
            product._id === productId ? response.data.product : product
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle display");
    }
  };

 const openEditModal = (product) => {
  if (!product) {
    console.error("Product data not found");
    return;
  }

  setSelectedProduct(product);

  setFormData({
    name: product.name || "",
    description: product.description || "",
    price: product.price ? product.price.toString() : "0",
    image: product.image || "",
    category: product.category || "Other",
    stock: product.stock ? product.stock.toString() : "0",
    featured: !!product.featured,
    displayOnGift: !!product.displayOnGift,
    displayOnMenu: !!product.displayOnMenu,
  });

  setShowEditModal(true);
};


  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="products-container">
        <div className="page-header">
          <h1>Product Management</h1>
          <p>
            Manage all products, add new ones, and control their display on gift
            and menu pages
          </p>
        </div>
        <hr />

        {/* Search & Filter & Add Button */}
        <div className="search-filter-container d-flex flex-wrap gap-3 mb-4 align-items-center">
          <div className="search-input position-relative flex-grow-1">
            <Search
              size={18}
              className="search-icon position-absolute"
              style={{
                top: "50%",
                left: "15px",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search products by name or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown d-flex align-items-center gap-2">
            <Filter size={18} className="text-muted" />
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All Categories">All Categories</option>
              <option value="Drinks">Drinks</option>
              <option value="Food">Food</option>
              <option value="Gifts">Gifts</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            className="btn btn-success add-product-btn fw-bold"
            style={{ width: "25%" }}
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Plus size={18} className="me-2" />
            Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="products-table-card">
          <div className="table-responsive">
            <table className="table align-middle mb-0 modern-table">
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Product</th>
                  <th style={{ width: "12%" }}>Category</th>
                  <th style={{ width: "10%" }}>Price</th>
                  <th style={{ width: "12%" }}>Status</th>
                  <th style={{ width: "18%" }}>Display Options</th>
                  <th style={{ width: "13%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="product-info">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/50x50?text=No+Image";
                          }}
                        />
                        <div className="product-details">
                          <div className="product-name ">
                            {product.name}
                            {product.featured && (
                              <Star
                                size={14}
                                className="ms-2 text-warning"
                                fill="currentColor"
                              />
                            )}
                          </div>
                          <div className="product-description">
                            {product.description.length > 50
                              ? `${product.description.substring(0, 50)}...`
                              : product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{product.category}</span>
                    </td>
                    <td>
                      <span className="price-amount">₹{product.price}</span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm fw-bold ${
                          product.isAvailable ? "btn-success" : "btn-secondary"
                        }`}
                        onClick={() => handleToggleAvailability(product._id)}
                        title={
                          product.isAvailable
                            ? "Click to deactivate"
                            : "Click to activate"
                        }
                      >
                        {product.isAvailable ? (
                          <>
                            <CheckCircle size={14} />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="display-options">
                        <button
                          className={`btn btn-sm ${
                            product.displayOnGift
                              ? "btn-info"
                              : "btn-outline-info"
                          }`}
                          onClick={() =>
                            handleToggleDisplay(product._id, "gift")
                          }
                          title={
                            product.displayOnGift
                              ? "Remove from Gift page"
                              : "Add to Gift page"
                          }
                        >
                          <Gift size={14} />
                        </button>
                        <button
                          className={`btn btn-sm ${
                            product.displayOnMenu
                              ? "btn-warning"
                              : "btn-outline-warning"
                          }`}
                          onClick={() =>
                            handleToggleDisplay(product._id, "menu")
                          }
                          title={
                            product.displayOnMenu
                              ? "Remove from Menu page"
                              : "Add to Menu page"
                          }
                        >
                          <Menu size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openEditModal(product)}
                          title="Edit product"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteProduct(product._id)}
                          title="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <Package size={48} className="text-muted mb-3" />
              <h5>No products found</h5>
              <p className="mb-0">
                {searchTerm || categoryFilter !== "All Categories"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding yogit rst product"}
              </p>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div
            className="modal show d-block "
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <Plus size={24} className="me-2" />
                    Add New Product
                  </h5>
                </div>
                <form onSubmit={handleAddProduct}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Product Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          autoComplete="off"
                          autoCapitalize="words"
                          autoCorrect="off"
                          spellCheck={false}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Category *</label>
                        <select
                          className="form-select"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Drinks">Drinks</option>
                          <option value="Food">Food</option>
                          <option value="Gifts">Gifts</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <textarea
                        className="form-control"
                        name="description"
                        rows="3"
                        style={{ resize: "none", height: "80px" }}
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Price (₹) *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Image URL *</label>
                        <input
                          type="url"
                          className="form-control"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                          autoComplete="off"
                          autoCapitalize="words"
                          autoCorrect="off"
                          spellCheck={false}
                          required
                        />
                      </div>
                    </div>
                    {/* Image Preview Section */}
                    {formData.image && (
                      <div className="mb-3">
                        <label className="form-label">Image Preview</label>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginTop: "10px",
                          }}
                        >
                          {imagePreview && (
                            <div
                              style={{
                                border: "2px solid #00704A",
                                borderRadius: "12px",
                                padding: "8px",
                                background: "#fafafa",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                              }}
                            >
                              <img
                                src={imagePreview}
                                alt="Preview"
                                style={{
                                  maxWidth: "220px",
                                  maxHeight: "220px",
                                  borderRadius: "8px",
                                  display: "block",
                                }}
                              />
                            </div>
                          )}
                          {imageError && (
                            <div
                              style={{
                                color: "red",
                                marginTop: "5px",
                                textAlign: "center",
                              }}
                            >
                              {imageError}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="displayOnGift"
                            checked={formData.displayOnGift}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">
                            Show on Gift Page
                          </label>
                        </div>
                      </div>
                      <div className="col-md-12 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="displayOnMenu"
                            checked={formData.displayOnMenu}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">
                            Show on Menu Page
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary fw-bold w-25"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success fw-bold w-25"
                    >
                      Add Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <Edit size={24} className="me-2" />
                    Edit Product: {selectedProduct?.name}
                  </h5>
                </div>
                <form onSubmit={handleEditProduct}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Product Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Category *</label>
                        <select
                          className="form-select"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Drinks">Drinks</option>
                          <option value="Food">Food</option>
                          <option value="Gifts">Gifts</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description *</label>
                      <textarea
                        className="form-control"
                        name="description"
                        style={{ resize: "none", height: "80px" }}
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Price (₹) *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Image URL *</label>
                        <input
                          type="url"
                          className="form-control"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                          autoComplete="off"
                          autoCapitalize="words"
                          autoCorrect="off"
                          spellCheck={false}
                          required
                        />
                      </div>
                    </div>
                    <label className="form-label">Image Preview</label>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginTop: "10px",
                      }}
                    >
                      {imagePreview && (
                        <div
                          style={{
                            border: "2px solid #00704A",
                            borderRadius: "12px",
                            padding: "8px",
                            background: "#fafafa",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                          }}
                        >
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              maxWidth: "220px",
                              maxHeight: "220px",
                              borderRadius: "8px",
                              display: "block",
                            }}
                          />
                        </div>
                      )}
                      {imageError && (
                        <div
                          style={{
                            color: "red",
                            marginTop: "5px",
                            textAlign: "center",
                          }}
                        >
                          {imageError}
                        </div>
                      )}
                    </div>{" "}
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="displayOnGift"
                            checked={formData.displayOnGift}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">
                            Show on Gift Page
                          </label>
                        </div>
                      </div>
                      <div className="col-md-12 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="displayOnMenu"
                            checked={formData.displayOnMenu}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">
                            Show on Menu Page
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary fw-bold  w-25"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success fw-bold w-25"
                    >
                      Update Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
