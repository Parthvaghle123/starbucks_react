import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Mail,
  Phone,
  Calendar,
  User,
  Users as UsersIcon,
  Cake,
  Activity,
  Filter,
} from "lucide-react";
import axios from "axios";
import "./Users.css";

const StatBreakdown = ({ list }) => {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const thisWeek = list.filter((u) => new Date(u.createdAt) >= weekAgo).length;
  const thisMonth = list.filter((u) => {
    const date = new Date(u.createdAt);
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div style={{ fontSize: "0.8rem", color: "#374151", marginTop: "4px" }}>
      <div>This Week: {thisWeek}</div>
      <div>This Month: {thisMonth}</div>
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Admin token missing. Please login.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:3001/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(response.data);
        setFilteredUsers(response.data);
        setTotalUsers(response.data.length);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users. Check connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          (user.username?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (user.email?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (user.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (user) => (user.status || "active").toLowerCase() === statusFilter
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          alert("Admin token missing. Please login.");
          return;
        }
        await axios.delete(`http://localhost:3001/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((u) => u._id !== userId));
        setTotalUsers((prev) => prev - 1);
      } catch (err) {
        alert("Failed to delete user.");
        console.error(err);
      }
    }
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "N/A";

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getStatusBadge = (status) => {
    const badge = {
      active: "status-badge status-active",
      inactive: "status-badge status-inactive",
      pending: "status-badge status-pending",
    };
    return badge[status] || "status-badge";
  };

  const getGenderBadge = (gender) => {
    const genderClasses = {
      male: "status-badge status-male",
      female: "status-badge status-female",
      other: "status-badge status-other",
    };
    return genderClasses[gender?.toLowerCase()] || "status-badge";
  };

  if (loading) {
    return (
      <div className="loading">
        <Activity className="animate-spin" />
        <span>Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="users-container">
        <div className="page-header">
          <h1>Users Management</h1>
          <p>Manage all registered users</p>
        </div>
        <hr />

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Total Users</span>
              <div className="stat-icon bg-blue">
                <UsersIcon size={20} />
              </div>
            </div>
            <div className="stat-value">{totalUsers}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Active Users</span>
              <div className="stat-icon bg-green">
                <User size={20} />
              </div>
            </div>
            <div className="stat-value">
              {
                users.filter(
                  (u) => (u.status || "active").toLowerCase() === "active"
                ).length
              }
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>New This Month</span>
              <div className="stat-icon bg-yellow">
                <Calendar size={20} />
              </div>
            </div>
            <div className="stat-value">
              {
                users.filter((u) => {
                  const d = new Date(u.createdAt);
                  const now = new Date();
                  return (
                    d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title fw-bold">Registration Trend</span>
              <div className="stat-icon" style={{ backgroundColor: "#6b7280" }}>
                <Calendar size={16} />
              </div>
            </div>
            <div className="state">
              <StatBreakdown list={users} />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="search-filter-container">
          <div className="search-input position-relative flex-grow-1">
            <Search
              size={18}
              className="search-icon position-absolute"
              style={{ top: "50%", left: "15px", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search by Username, Email, or Phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdown d-flex align-items-center gap-2">
            <Filter size={18} className="text-muted" />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-container">
            {filteredUsers.length === 0 ? (
              <div className="empty-state">
                <UsersIcon size={48} />
                <h3>No users found</h3>
                <p>Try different search or filters</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>User Info</th>
                    <th>Contact</th>
                    <th>Details</th>
                    <th>Registered</th>
                    {/* <th>Status</th>
                    <th>Action</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <strong>{user.username}</strong>
                        <div>ID: {user._id.slice(-8)}</div>
                      </td>
                      <td>
                        <div>
                          <Mail size={14} /> {user.email}
                        </div>
                        <div>
                          <Phone size={14} /> {user.phone || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div>
                          <Cake size={14} /> {formatDate(user.dob)} (
                          {calculateAge(user.dob)} yrs)
                        </div>
                        <div>
                          <User size={14} />{" "}
                          <span className={getGenderBadge(user.gender)}>
                            {user.gender}
                          </span>
                        </div>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <span className={getStatusBadge(user.status)}>
                          {user.status || "active"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
