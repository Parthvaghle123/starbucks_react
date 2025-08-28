// App.js
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// User Components
import Home from "./Home";
import Cart from "./Cart";
import Login from "./Login";
import Signup from "./Register";
import Navbar from "./Navbar";
import Order from "./Order";
import Gift from "./Gift";
import Menu from "./Menu";
import Item from "./Item";
import ChangePassword from "./Changepassword";
import OrderSuccess from "./OrderSuccess";
import Checkout from "./Checkout";

// Admin Components
import Dashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import Orders from "./admin/Orders";
import Products from "./admin/Products";
import AdminNavbar from "./admin/AdminNavbar";
import AdminLogin from "./admin/AdminLogin";
import AdminRedirect from "./admin/AdminRedirect";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [username, setUsername] = useState("");

  return (
    <Router>
      <AppContent
        username={username}
        setUsername={setUsername}
      />
    </Router>
  );
};

const AppContent = ({ username, setUsername }) => {
  const [token, setToken] = useState("");
  const location = useLocation();

  const hideNavbar =
    ["/login", "/register", "/changepassword", "/checkout"].includes(location.pathname) ||
    location.pathname.startsWith("/admin");

  React.useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (storedToken) setToken(storedToken);
    if (storedUsername) setUsername(storedUsername);
  }, [setUsername]);

  return (
    <>
      {!hideNavbar && <Navbar username={username} setUsername={setUsername} />}

      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Home token={token} />} />
        <Route path="/home" element={<Home token={token} />} />
        <Route path="/gift" element={<Gift token={token} />} />
        <Route path="/menu" element={<Menu token={token} />} />
        <Route path="/cart" element={<Cart token={token} />} />
        <Route path="/login" element={<Login setUsername={setUsername} />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/changepassword" element={<ChangePassword />} />
        <Route path="/orders" element={<Order token={token} />} />
        <Route path="/items" element={<Item token={token} />} />
        <Route
          path="/order-success"
          element={
            <OrderSuccess
              message="Order Successfully. Please Wait..."
              redirectUrl="/orders"
              seconds={3}
            />
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="/admin/" element={<AdminRedirect />} />
        <Route path="/admin/login" element={<AdminLoginRoute />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <Users />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <Orders />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireAdminAuth>
              <AdminLayout>
                <Products />
              </AdminLayout>
            </RequireAdminAuth>
          }
        />
      </Routes>
    </>
  );
};

// 🔐 Admin Auth Protection
const RequireAdminAuth = ({ children }) => {
  const isAdmin = !!localStorage.getItem("adminToken");
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

// 🔐 Admin Login Route Protection (redirect if already logged in)
const AdminLoginRoute = () => {
  const isAdmin = !!localStorage.getItem("adminToken");
  return isAdmin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />;
};

// 🔹 Admin Layout
const AdminLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column">
      <AdminNavbar />
      <div
        className="container-fluid"
        style={{
          padding: "20px",
          minHeight: "calc(100vh - 56px)", // Account for navbar height
          background: "#f8f9fa",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default App;
