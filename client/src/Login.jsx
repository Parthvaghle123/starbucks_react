import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RedirectLoader from "./RedirectLoader";
import "./css/Login.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = ({ setUsername }) => {
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [strengthMessage, setStrengthMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post("http://localhost:3001/login", {
        email: emailInput.toLowerCase(),
        password,
      })
      .then((res) => {
        if (res.data.message === "Success") {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("username", res.data.username);
          setUsername(res.data.username);
          // notify server already emits user:status on login; nothing to do client-side
        } else {
          setErrorMessage(res.data.message);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("Server error. Try again later.");
        setLoading(false);
      });
  };

  if (loading) {
    return <RedirectLoader seconds={3} onComplete={() => navigate("/")} />;
  }

  return (
    <div className="body">
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="login-container">
          <h2 className="text-success text-center mb-3 head h2 ">Login</h2>
          <hr />
          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="example@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                autoComplete="off"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                data-form-type="other"
                aria-autocomplete="none"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="*********"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                data-form-type="other"
                aria-autocomplete="none"
                required
              />
              <small className="text-muted strength">{strengthMessage}</small>
            </div>

            <p className="mt-1 fw-bold">
              <a
                href="/changepassword"
                className="text-decoration-none text-success "
              >
                Change Password
              </a>
            </p>

            <button type="submit" className="btn7 fw-bold w-100 rounded">
              Login
            </button>
          </form>

          <p className="mt-3 text-center">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-decoration-none fw-bold text-success"
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
