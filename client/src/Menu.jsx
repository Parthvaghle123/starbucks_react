import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Menu.css";
import axios from "axios";

const Item = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 🔹 Fetch products with proper loading state management
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Always set loading to true initially to prevent flash
        setLoading(true);

        const response = await axios.get(
          "http://localhost:3001/api/products?displayOnMenu=true"
        );

        // Set products immediately
        setProducts(response.data);
        setFilteredProducts(response.data);
        setError(null);

        // Check if this is first load for spinner timing
        const isFirstLoad = !sessionStorage.getItem("menuPageLoaded");

        if (isFirstLoad) {
          // First load → show spinner for 2.5 seconds
          setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem("menuPageLoaded", "true");
          }, 700);
        } else {
          // Subsequent loads → show data immediately
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle search filtering
  useEffect(() => {
    const query =
      new URLSearchParams(location.search).get("q")?.toLowerCase() || "";
    if (query) {
      setLoading(true);
      setTimeout(() => {
        const filtered = products.filter((item) =>
          item.name.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
        setLoading(false);
      }, 1000);
    } else {
      setFilteredProducts(products);
    }
  }, [location.search, products]);

  const addToCart = async (product) => {
    if (!token) {
      alert("Please login to add items to cart.");
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3001/add-to-cart",
        {
          productId: product._id,
          image: product.image,
          title: product.name,
          price: product.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setToastMessage(`${product.name} added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Error adding item");
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="Herosection_1">
        <div className="container">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "200px", width: "100%" }}
          >
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Herosection_1">
        <div className="container">
          <div className="alert alert-danger text-center">❌ {error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showToast && (
        <div className="toast-popup bg-success">🛒 {toastMessage}</div>
      )}
      <div className="Herosection_1">
        <div className="container">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center my-4">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              className="alert alert-danger text-center mt-3 fw-bold align-items-center"
              style={{
                width: "18%",
                backgroundColor: "#e7414c",
                margin: "20px auto", // centers horizontally
              }}
            >
              {products.length === 0
                ? "❌ No products found."
                : " No found products."}
            </div>
          ) : (
            <div id="products3">
              {filteredProducts.map((item) => (
                <div key={item._id} className="box2">
                  <div className="img-box1">
                    <img className="images1" src={item.image} alt={item.name} />
                  </div>
                  <div className="bottom">
                    <h2>{item.name}</h2>
                    <h4>{item.description}</h4>
                    <h3>₹{item.price}.00</h3>
                    <button className="btn4" onClick={() => addToCart(item)}>
                      Add Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modern Footer */}
      <footer className="bg-dark text-white pt-5 pb-3 fw-medium shadow-lg mt-3">
        <div className="container">
          <div className="row justify-content-start">
            {/* Contact Info Left Aligned */}
            <div className="col-md-5 mb-4 text-md-start text-center">
              <h5 className="text-uppercase fw-bold text-warning mb-3 border-bottom border-warning pb-2">
                Contact
              </h5>
              <p className="mb-2">
                <i className="fas fa-map-marker-alt me-2 text-warning"></i>
                Surat, Gujarat
              </p>
              <p className="mb-2">
                <i className="far fa-envelope me-2 text-warning"></i>
                vaghelaparth2005@gmail.com
              </p>
              <p>
                <i className="fas fa-phone me-2 text-warning"></i>
                +91 8735035021
              </p>
            </div>
          </div>

          <hr className=" border-secondary" />

          <div className="row align-items-center justify-content-between">
            <div className="col-md-6 text-md-start text-center  mb-md-0">
              <p className="mb-0">
                Owned by:{" "}
                <strong className="text-warning text-decoration-none">
                  Noob Ninjas
                </strong>
              </p>
            </div>

            {/* Social Icons Modernized */}
            <div className="col-md-6 text-md-end text-center">
              <ul className="list-inline mb-0">
                {[
                  { icon: "facebook-f", link: "#" },
                  { icon: "x-twitter", link: "#" },
                  { icon: "linkedin-in", link: "#" },
                  { icon: "instagram", link: "#" },
                  { icon: "youtube", link: "#" },
                ].map((social, idx) => (
                  <li className="list-inline-item mx-1" key={idx}>
                    <a
                      href={social.link}
                      className="social-icon d-inline-flex align-items-center justify-content-center rounded-circle"
                      aria-label={social.icon}
                    >
                      <i className={`fab fa-${social.icon}`}></i>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Item;
