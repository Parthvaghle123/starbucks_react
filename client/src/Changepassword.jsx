import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./css/Login.css";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [showRedirectLoader, setShowRedirectLoader] = useState(false);
  const [showEmailLoader, setShowEmailLoader] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(3);
  const [alertMessage, setAlertMessage] = useState(""); // ✅ Alert msg
  const [alertType, setAlertType] = useState(""); // success | danger
  const navigate = useNavigate();

  // Step 1: Email Verification
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setShowEmailLoader(true);
    setAlertMessage(""); // Clear old alerts

    try {
      const res = await axios.post("http://localhost:3001/verify-email", {
        email: email.toLowerCase(),
      });

      if (res.data.exists) {
        setAlertMessage("✅ Email verified. Enter new password.");
        setAlertType("success");

        const countdown = setInterval(() => {
          setEmailCountdown((prev) => {
            if (prev === 1) {
              clearInterval(countdown);
              setEmailVerified(true);
              setShowEmailLoader(false);
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setAlertMessage("❌ Email not found.");
        setAlertType("danger");
        setShowEmailLoader(false);
      }
    } catch (err) {
      console.error(err);
      setAlertMessage("Server error during email verification.");
      setAlertType("danger");
      setShowEmailLoader(false);
    }
  };

  // Step 2: Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setAlertMessage(""); // Clear old alerts

    if (newPassword !== confirmPassword) {
      setAlertMessage("❌ Passwords do not match.");
      setAlertType("danger");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/change-password", {
        email: email.toLowerCase(),
        newPassword,
      });

      if (res.data.message === "Password updated successfully ✅") {
        setAlertMessage("✅ Password updated successfully.");
        setAlertType("success");
        setShowRedirectLoader(true);

        const countdown = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev === 1) {
              clearInterval(countdown);
              navigate("/login");
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setAlertMessage(res.data.message);
        setAlertType("danger");
      }
    } catch (err) {
      console.error(err);
      setAlertMessage("Server error during password change.");
      setAlertType("danger");
    }
  };

  return (
    <div className="body">
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="login-container">
          <h2 className="text-success text-center mb-3 h2">
            Change Password
          </h2>
          <hr />

          {/* ✅ Alert Message */}
          {alertMessage && (
            <div className={`alert alert-${alertType}`} role="alert">
              {alertMessage}
            </div>
          )}

          {/* ✅ Form and Loaders */}
          {!emailVerified && !showEmailLoader ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-3">
                <label className="l1">Email</label>
                <input
                  type="email"
                  className="form-control mt-2"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="words"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
              </div>
            <button type="submit" className="btn7 fw-bold w-100 rounded">
                Verify Email
              </button>
            </form>
          ) : showEmailLoader ? (
            <div className="text-center mt-4">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2">Verifying Email... {emailCountdown}</p>
            </div>
          ) : !showRedirectLoader ? (
            <form onSubmit={handlePasswordChange}>
              <div className="mb-2">
                <label className="mb-2 l1">New Password</label>
                <input
                  type="password"
                  className="form-control "
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="mb-2 l1">Confirm Password</label>
                <input
                  type="password"
                  className="form-control "
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>
            <button type="submit" className="btn7 fw-bold w-100 rounded">
                Change Password
              </button>
            </form>
          ) : (
            <div className="text-center mt-4">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2">Please Wait {redirectCountdown}...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
