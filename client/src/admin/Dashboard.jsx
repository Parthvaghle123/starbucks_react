import { useState, useEffect } from 'react';
import { Users, ShoppingCart, DollarSign, Activity } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          console.error('No admin token found');
          return;
        }

        const response = await axios.get('http://localhost:3001/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { totalUsers, totalOrders, totalRevenue, recentOrders } = response.data;
        setStats({ totalUsers, totalOrders, totalRevenue });
        setRecentOrders(recentOrders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'status-completed',
      pending: 'status-pending',
      cancelled: 'status-cancelled',
      Approved: 'status-completed',
      Cancelled: 'status-cancelled',
    };
    return `status-badge ${statusClasses[status] || 'status-pending'}`;
  };

  if (loading) {
    return (
      <div className="dashboard-root">
        <div className="loading">
          <Activity className="animate-spin" size={24} />
          <span style={{ marginLeft: '0.5rem' }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-root">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to your admin dashboard</p>
      </div>
      <hr/>
      {/* small, controlled hr */}
      <hr className="dashboard-hr" />

      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Users</span>
              <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
                <Users size={20} />
              </div>
            </div>
            <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Orders</span>
              <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
                <ShoppingCart size={20} />
              </div>
            </div>
            <div className="stat-value">{stats.totalOrders.toLocaleString()}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Total Revenue</span>
              <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <div className="stat-value">₹{stats.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Orders</h2>
          </div>
          <div className="order-table-container">
            {recentOrders.length === 0 ? (
              <p className="no-orders">No recent orders.</p>
            ) : (
              <table className="order-table">
                <thead >
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.orderId}</td>
                      <td>{order.username}</td>
                      <td>₹{order.total}</td>
                      <td>
                        <span className={getStatusBadge(order.status)}>{order.status}</span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
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

export default Dashboard;
