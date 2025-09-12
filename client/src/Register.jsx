import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Signup.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    country_code: "+91",
    gender: "",
    dob: "",
    address: "",
  });
  const [password, setPassword] = useState("");
  const [strengthMessage, setStrengthMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Phone only digits max 10
    if (name === "phone") {
      if (/^\d{0,10}$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    }
    // ✅ Username only alphabets and space
    else if (name === "username") {
      if (/^[A-Za-z\s]*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    }
    // ✅ Other inputs normal
    else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Password Strength
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (value.length < 4) {
      setStrengthMessage("Weak password ❌");
    } else if (/[A-Z]/.test(value) && /\d/.test(value) && value.length >= 8) {
      setStrengthMessage("Strong password ✅");
    } else {
      setStrengthMessage("Moderate password ⚠️");
    }
  };

  // Validation Function
  const validateForm = () => {
    let newErrors = {};

    // Username
    if (!form.username || form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(form.username)) {
      newErrors.username = "Username must contain only letters.";
    }
    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    // Phone ✅ only 10 digits required
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits.";
    }

    // Gender
    if (!form.gender) {
      newErrors.gender = "Please select gender.";
    }

    // DOB + Age Check (Minimum 14 years)
  if (!form.dob) {
    newErrors.dob = "Date of birth is required.";
  } else {
    const today = new Date();
    const dobDate = new Date(form.dob);

    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age < 14) {
      newErrors.dob = "You must be at least 14 years old to register.";
    }
  }
    // Address
    if (!form.address || form.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters.";
    }

    // Password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be 8+ chars, 1 uppercase, 1 number, 1 special char.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return; // ❌ stop if validation fails

    axios
      .post("http://localhost:3001/register", {
        ...form,
        password: password,
      })
      .then((res) => {
        if (res.data.success) {
          setToastMessage("Registration successful ✅");
          setShowSuccessToast(true);

          setTimeout(() => setShowSuccessToast(false), 3000);
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      })
      .catch((err) => {
        console.error("Signup error:", err);
        setErrorMessage("An error occurred during signup.");
      });
  };

  return (
    <>
      {showSuccessToast && (
        <div className="toast-popup bg-success">{toastMessage}</div>
      )}

      <div className="body">
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
          <div className="signup-container bg-white p-4 shadow">
            <h2 className="text-success text-center mb-3 h2">Sign-Up</h2>
            <hr />

            {errorMessage && (
              <div className="alert alert-danger">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                {/* Username */}
                <div className="d-flex flex-column flex-fill ">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    placeholder="Enter your name"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                  {errors.username && (
                    <small className="text-danger">{errors.username}</small>
                  )}
                </div>

                {/* Email */}
                <div className="d-flex flex-column flex-fill">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="example@gmail.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <small className="text-danger">{errors.email}</small>
                  )}
                </div>
              </div>

              <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                <div className="d-flex flex-column flex-fill ">
                  <label className="form-label">Phone</label>
                  <div className="input-group">
                    <select
                      name="country_code"
                      className="form-select l2"
                      value={form.country_code}
                      disabled
                    >
                      <option value="+91">+91 </option>
                      <option value="+1">+1 </option>
                      <option value="+44">+44 </option>
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="1234567890"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.phone && (
                    <small className="text-danger">{errors.phone}</small>
                  )}
                </div>
                <div className="d-flex flex-column flex-fill">
                  <label className="form-label">Gender</label>
                  <div className="d-flex gap-3 justify-content-center mt-2">
                    {["male", "female", "other"].map((g) => (
                      <label key={g} style={{ flex: 1 }}>
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={form.gender === g}
                          onChange={handleChange}
                          className="d-none align-items-center"
                        />
                        <div
                          className={`p-2 rounded text-center ${
                            form.gender === g
                              ? "border border-success bg-light"
                              : "border"
                          }`}
                        >
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.gender && (
                    <small className="text-danger">{errors.gender}</small>
                  )}
                </div>
              </div>
              {/* Address */}
              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  placeholder="Enter your address"
                  rows="2"
                  style={{ resize: "none", height: "80px" }}
                  value={form.address}
                  onChange={handleChange}
                  required
                ></textarea>
                {errors.address && (
                  <small className="text-danger">{errors.address}</small>
                )}
              </div>
              <div className="mb-3 d-flex flex-column flex-sm-row gap-3">
                <div className="d-flex flex-column flex-fill">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    className="form-control"
                    value={form.dob}
                    onChange={handleChange}
                    required
                  />
                  {errors.dob && (
                    <small className="text-danger">{errors.dob}</small>
                  )}
                </div>
                <div className="d-flex flex-column flex-fill">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="********"
                    className="form-control"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <small className="text-muted">{strengthMessage}</small>
                  {errors.password && (
                    <small className="text-danger d-block">
                      {errors.password}
                    </small>
                  )}
                </div>
              </div>

              <button type="submit" className="btn7 fw-bold w-100 rounded">
                Register
              </button>
            </form>

            <p className="text-center mt-3">
              Already registered?{" "}
              <a
                href="/login"
                className="text-decoration-none fw-bold text-success"
              >
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
