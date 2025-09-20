import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/cart.css";

const Check = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    countryCode: "+91",
    address: "",
    paymentMethod: "Cash On Delivery",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:3001/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData((prev) => ({
          ...prev,
          email: res.data.email || "",
          phone: res.data.phone || "",
        }));
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Luhn algorithm implementation
  const luhnCheck = (numStr) => {
    // numStr should be only digits (no spaces)
    let sum = 0;
    let shouldDouble = false;
    // process digits right-to-left
    for (let i = numStr.length - 1; i >= 0; i--) {
      let digit = parseInt(numStr.charAt(i), 10);
      if (shouldDouble) {
        digit = digit * 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

const placeOrder = async (e) => {
  e.preventDefault();

  const rawCardNumber = formData.cardNumber.replace(/\s/g, "");

  if (formData.paymentMethod === "Online Payment") {
    // Basic length check — many cards are 13-19 digits, but most common are 16.
    if (rawCardNumber.length < 13 || rawCardNumber.length > 19) {
      alert(" Invalid card number — it should be between 13 and 19 digits.");
      return;
    }

    // ensure only digits
    if (!/^\d+$/.test(rawCardNumber)) {
      alert(" Card number must contain only digits.");
      return;
    }

    // Luhn validation
    if (!luhnCheck(rawCardNumber)) {
      alert("Invalid card number. Please enter a valid card.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      alert(" Expiry must be in MM/YY format.");
      return;
    }

    // ---- Expiry Validation ----
    const [mm, yy] = formData.expiry.split("/");
    const month = parseInt(mm, 10);
    const year = parseInt("20" + yy, 10);

    if (month < 1 || month > 12) {
      alert("Invalid month.");
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear) {
      alert("Card has expired.");
      return;
    }
    if (year === currentYear && month < currentMonth) {
      alert("Expiry month cannot be in the past.");
      return;
    }

    if (formData.cvv.length < 3) {
      alert("CVV must be at least 3 digits.");
      return;
    }
  }

  setLoading(true);
  setErrorMsg("");

  const token = localStorage.getItem("token");
  try {
    const payload = {
      ...formData,
      cardNumber: rawCardNumber,
    };

    await axios.post("http://localhost:3001/order", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    navigate("/order-success");
  } catch (err) {
    console.error("Order failed", err);
    setErrorMsg("❌ Order failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-7 col-md-8">
          <div className="card shadow-lg border-0 p-4 rounded-4">
            <h1 className="fs-3 text-success text-center fw-bold checkout-title">
              Payment
            </h1>
            <p className="text-success fw-bold text-center checkout-subtitle">
              Brew & Pay • Easy Checkout
            </p>
            <hr />
            {errorMsg && (
              <div className="alert alert-danger py-2">{errorMsg}</div>
            )}

            <form onSubmit={placeOrder}>
              {/* Email + Phone */}
              <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                <div className="d-flex flex-column flex-fill">
                  <label className="form-label fw-semibold">Email ID</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-lg rounded-3"
                    value={formData.email}
                    readOnly
                    required
                  />
                </div>
                <div className="d-flex flex-column flex-fill">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <div className="input-group">
                    <select
                      className="form-select"
                      value={formData.countryCode}
                      style={{ maxWidth: "100px", height: "50px" }}
                      disabled
                    >
                      <option value="+91">+91 🇮🇳</option>
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      readOnly
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Shipping Address
                </label>
                <textarea
                  name="address"
                  className="form-control rounded-3"
                  placeholder="Enter your address"
                  style={{ resize: "none", height: "100px" }}
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

               {/* Payment Method */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Payment Method</label>
                <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                  <div className="d-flex flex-column flex-fill ">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        value="Cash On Delivery"
                        checked={formData.paymentMethod === "Cash On Delivery"}
                        onChange={handleChange}
                        id="cod"
                      />
                      <label className="form-check-label" htmlFor="cod">
                        Cash on Delivery
                      </label>
                    </div>
                  </div>
                  <div className="d-flex flex-column flex-fill me-5">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        value="Online Payment"
                        checked={formData.paymentMethod === "Online Payment"}
                        onChange={handleChange}
                        id="online"
                      />
                      <label className="form-check-label" htmlFor="online">
                        Online Payment
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              {/* Card Details */}
              {formData.paymentMethod === "Online Payment" && (
                <>
                  <hr />
                  <h6 className="fw-bold mb-3">Card Details</h6>

                  {/* Card Number */}
                  <div className="mb-3">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      className="form-control"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        val = val.slice(0, 16); // allow up to 19 digits
                        val = val.replace(/(\d{4})(?=\d)/g, "$1 ");
                        setFormData((prev) => ({ ...prev, cardNumber: val }));
                      }}
                      inputMode="numeric"
                      maxLength="23" // spaces included
                      required
                    />
                  </div>

                  {/* Expiry + CVV */}
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Expiry</label>
                      <input
                        type="text"
                        name="expiry"
                        className="form-control"
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={(e) => {
                          let val = e.target.value
                            .replace(/[^0-9/]/g, "")
                            .slice(0, 5);
                          if (val.length === 2 && !val.includes("/")) {
                            val = val + "/";
                          }
                          setFormData((prev) => ({ ...prev, expiry: val }));
                        }}
                        required
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label">CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        className="form-control"
                        placeholder="***"
                        value={formData.cvv}
                        onChange={(e) => {
                          const onlyNums = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);
                          setFormData((prev) => ({ ...prev, cvv: onlyNums }));
                        }}
                        inputMode="numeric"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="d-grid mt-4">
                <button
                  type="submit"
                  className="btn7 fw-bold w-100"
                  style={{
                    height: "40px",
                    fontSize: "17px",
                    borderRadius: "5px",
                  }}
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : "Order Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Check;
