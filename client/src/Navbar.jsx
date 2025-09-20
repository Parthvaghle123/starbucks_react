import React, { useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom"; // <-- Link add કર્યું
import "./css/Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ username, setUsername }) => {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim() !== "") {
      const currentPath = location.pathname;
      navigate(`${currentPath}?q=${encodeURIComponent(searchText)}`);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:3001/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setUsername('');
      navigate('/home');
    }
  };

  const hideNavbarPaths = ["/order-success"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);
  if (shouldHideNavbar) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-whitesmoke sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex" to="/">
          <img src="https://www.starbucks.in/assets/icon/logo.png" alt="" width="50" height="50" />
          <h3 className="fs-4 ms-1">Starbucks</h3>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto ms-3 gap-5 nav-links">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link underline-animate ${isActive ? 'active' : ''}`
                }
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/gift"
                className={({ isActive }) =>
                  `nav-link underline-animate ${isActive ? 'active' : ''}`
                }
              >
                Gift
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/menu"
                className={({ isActive }) =>
                  `nav-link underline-animate ${isActive ? 'active' : ''}`
                }
              >
                Menu
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `nav-link underline-animate ${isActive ? 'active' : ''}`
                }
              >
                Order
              </NavLink>
            </li>
          </ul>

          <form
            className="d-flex me-4 search-form mb-1"
            onSubmit={handleSearchSubmit}
          >
            <input
              className="me-2 search bg-transparent head1"
              type="search"
              placeholder="Search"
              id="search"
              value={searchText}
              autoComplete="off"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) => {
                const value = e.target.value;
                setSearchText(value);
                if (value.trim() === "") {
                  const currentPath = location.pathname;
                  navigate(`${currentPath}`);
                }
              }}
            />
            <button className="btn1 btn btn-success" type="submit">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </form>

          <div className="d-flex align-items-center">
            <Link to="/cart" className="btn2 btn btn-success me-3 mb-2">
              🛒 <strong>MyCart</strong>
            </Link>

            <div className="dropdown nav-item text-center mb-2">
              <a
                className="text-decoration-none dropdown-toggle fw-bold text-dark"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-user-circle"></i> Account
              </a>
              <ul className="dropdown-menu custom-dropdown">
                {username ? (
                  <>
                    <li className="dropdown-header text-success fw-bold">
                      <i className="fas fa-user me-2"></i> {username}
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item underline-animate"
                        onClick={handleLogout}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i> Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        className="dropdown-item underline-animate"
                        to="/login"
                      >
                        <i className="fas fa-sign-in-alt me-2"></i> Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item underline-animate"
                        to="/register"
                      >
                        <i className="fas fa-user-plus me-2"></i> Sign-Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;