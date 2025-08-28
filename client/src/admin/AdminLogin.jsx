import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if admin is already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:3001/admin/login', { username, password });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin/dashboard');
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex align-items-start justify-content-center bg-light mt-2">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-sm-8 col-md-6 col-lg-4 col-xl-3">
          <div className="card shadow-lg border-0">
            <div className="card-body p-3">
              <div className="text-center mb-3">
                <div className="bg-dark rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-shield-alt text-white fs-4"></i>
                </div>
                <h3 className="card-title mb-1">Admin Login</h3>
                <p className="text-muted small mb-0">Access your admin dashboard</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium">Username</label>
                  <input 
                    type="text" 
                    className="form-control form-control-lg" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    placeholder="Enter your username"
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Password</label>
                  <input 
                    type="password" 
                    className="form-control form-control-lg" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Enter your password"
                    required 
                  />
                </div>

                {error && (
                  <div className="alert alert-danger py-2 mb-3">
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-dark btn-lg w-100 fw-medium" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Secure admin access only
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
