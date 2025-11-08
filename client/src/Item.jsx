import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Home.css"; // 🔹 popup CSS અહીં હશે
import axios from "axios";

// 🔹 Static Product List
const products1 = [
  { id: 0, image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/100501.jpg", title: "Java Chip Frappuccino", per:"Mocha sauce and Frappuccino® chips blended with with Frappu..",price: 441 },
  { id: 1, image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/112539.jpg", title: "Picco Cappuccino", per:"Dark, Rich in flavour espresso lies in wait under a smoothed..",price: 200 },
  { id: 2, image: "https://starbucksstatic.cognizantorderserv.com/Items/Small/100385.jpg", title: "Iced Caffe Latte",per:"Our dark, Rich in flavour espresso is combined with milk and..", price: 372 },

];

const Item = () => {
  const [filteredProducts, setFilteredProducts] = useState(products1);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 🔹 Search Filter
  useEffect(() => {
    const query = new URLSearchParams(location.search).get("q")?.toLowerCase() || "";
    if (query) {
      setLoading(true);
      setTimeout(() => {
        const filtered = products1.filter((item) =>
          item.title.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
        setLoading(false);
      }, 1000);
    } else {
      setFilteredProducts(products1);
    }
  }, [location.search]);

  // 🔹 Add to Cart Function + Popup Message
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
          productId: product.id,
          image: product.image,
          title: product.title,
          price: product.price,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Show Popup Message
      setToastMessage(`${product.title} added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

    } catch (err) {
      console.error(err);
      alert("Failed to add item");
    }
  };

  return (
    <>
      {/* 🔹 Popup Top Center */}
      {showToast && (
        <div className="toast-popup bg-success">
          🛒 {toastMessage}
        </div>
      )}

      <div className="container mt-4">
        {loading ? (
          <div className="alert alert-info text-center mt-3 mb-2">🔄 Searching...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="alert alert-warning text-center">
            ❌ No products found.
          </div>
        ) : (
          <div className="container" id="products1">
            {filteredProducts.map((item) => (
              <div key={item.id} className="box">
                <div className="img-box1">
                  <img className="images1" src={item.image} alt={item.title} />
                </div>
                  <div className="bottom">
                    <h2>{item.title}</h2>
                    <h4>{item.per}</h4>
                    <h3>  ₹{item.price}.00</h3>
                    <button className="btn4" onClick={() => addToCart(item)}>
                      Add Item
                    </button>
                  </div>
                </div>  
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Item;
