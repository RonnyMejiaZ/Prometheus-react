import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import './Register.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await apiService.register(registerData);
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message || 'Error al registrar usuario');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar usuario. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Prometheus</h1>
        <h2 className="auth-subtitle">Register</h2>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="john@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {showPassword ? (
                    <>
                      <path d="M3.25977 3.25977C2.94418 3.57536 2.94418 4.09064 3.25977 4.40623L6.17477 7.32123C4.52527 8.46923 3.33301 10.4692 3.33301 12.8333C3.33301 15.9167 5.83301 18.4167 8.91634 18.4167C11.2804 18.4167 13.2804 17.2244 14.4284 15.5749L17.3434 18.4899C17.659 18.8055 18.1743 18.8055 18.4899 18.4899C18.8055 18.1743 18.8055 17.659 18.4899 17.3434L3.25977 2.11328C2.94418 1.79769 2.94418 1.28241 3.25977 0.966817C3.57536 0.651228 4.09064 0.651228 4.40623 0.966817L19.6364 16.197C19.952 16.5126 19.952 17.0278 19.6364 17.3434C19.3208 17.659 18.8055 17.659 18.4899 17.3434L3.25977 3.25977Z" fill="currentColor"/>
                      <path d="M12.5 10.8333C12.5 9.72877 11.6046 8.83333 10.5 8.83333L8.25767 8.83333L12.5 13.0757V10.8333Z" fill="currentColor"/>
                      <path d="M10.5 7.33333C12.9853 7.33333 15 9.34805 15 11.8333C15 12.4427 14.8568 13.0207 14.6003 13.534L13.1788 12.1125C13.392 11.6983 13.5 11.2288 13.5 10.8333C13.5 9.72877 12.6046 8.83333 11.5 8.83333C11.1045 8.83333 10.635 8.94133 10.2208 9.15455L8.79927 7.733C9.3126 7.47655 9.89056 7.33333 10.5 7.33333Z" fill="currentColor"/>
                      <path d="M8.91634 17.3333C6.56217 17.3333 4.58301 15.3542 4.58301 13C4.58301 12.3906 4.72623 11.8126 4.98268 11.2993L6.40423 12.7208C6.19098 13.135 6.08301 13.6045 6.08301 14C6.08301 15.1046 6.97844 16 8.08301 16C8.47851 16 8.94801 15.892 9.36223 15.6788L10.7838 17.1003C10.2704 17.3568 9.69244 17.5 9.08301 17.5L8.91634 17.3333Z" fill="currentColor"/>
                    </>
                  ) : (
                    <>
                      <path d="M10 4.16667C6.32499 4.16667 3.33333 6.66667 3.33333 10C3.33333 13.3333 6.32499 15.8333 10 15.8333C13.675 15.8333 16.6667 13.3333 16.6667 10C16.6667 6.66667 13.675 4.16667 10 4.16667ZM10 14.1667C7.69916 14.1667 5.83333 12.3008 5.83333 10C5.83333 7.69916 7.69916 5.83333 10 5.83333C12.3008 5.83333 14.1667 7.69916 14.1667 10C14.1667 12.3008 12.3008 14.1667 10 14.1667Z" fill="currentColor"/>
                      <path d="M10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5Z" fill="currentColor"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {showConfirmPassword ? (
                    <>
                      <path d="M3.25977 3.25977C2.94418 3.57536 2.94418 4.09064 3.25977 4.40623L6.17477 7.32123C4.52527 8.46923 3.33301 10.4692 3.33301 12.8333C3.33301 15.9167 5.83301 18.4167 8.91634 18.4167C11.2804 18.4167 13.2804 17.2244 14.4284 15.5749L17.3434 18.4899C17.659 18.8055 18.1743 18.8055 18.4899 18.4899C18.8055 18.1743 18.8055 17.659 18.4899 17.3434L3.25977 2.11328C2.94418 1.79769 2.94418 1.28241 3.25977 0.966817C3.57536 0.651228 4.09064 0.651228 4.40623 0.966817L19.6364 16.197C19.952 16.5126 19.952 17.0278 19.6364 17.3434C19.3208 17.659 18.8055 17.659 18.4899 17.3434L3.25977 3.25977Z" fill="currentColor"/>
                      <path d="M12.5 10.8333C12.5 9.72877 11.6046 8.83333 10.5 8.83333L8.25767 8.83333L12.5 13.0757V10.8333Z" fill="currentColor"/>
                      <path d="M10.5 7.33333C12.9853 7.33333 15 9.34805 15 11.8333C15 12.4427 14.8568 13.0207 14.6003 13.534L13.1788 12.1125C13.392 11.6983 13.5 11.2288 13.5 10.8333C13.5 9.72877 12.6046 8.83333 11.5 8.83333C11.1045 8.83333 10.635 8.94133 10.2208 9.15455L8.79927 7.733C9.3126 7.47655 9.89056 7.33333 10.5 7.33333Z" fill="currentColor"/>
                      <path d="M8.91634 17.3333C6.56217 17.3333 4.58301 15.3542 4.58301 13C4.58301 12.3906 4.72623 11.8126 4.98268 11.2993L6.40423 12.7208C6.19098 13.135 6.08301 13.6045 6.08301 14C6.08301 15.1046 6.97844 16 8.08301 16C8.47851 16 8.94801 15.892 9.36223 15.6788L10.7838 17.1003C10.2704 17.3568 9.69244 17.5 9.08301 17.5L8.91634 17.3333Z" fill="currentColor"/>
                    </>
                  ) : (
                    <>
                      <path d="M10 4.16667C6.32499 4.16667 3.33333 6.66667 3.33333 10C3.33333 13.3333 6.32499 15.8333 10 15.8333C13.675 15.8333 16.6667 13.3333 16.6667 10C16.6667 6.66667 13.675 4.16667 10 4.16667ZM10 14.1667C7.69916 14.1667 5.83333 12.3008 5.83333 10C5.83333 7.69916 7.69916 5.83333 10 5.83333C12.3008 5.83333 14.1667 7.69916 14.1667 10C14.1667 12.3008 12.3008 14.1667 10 14.1667Z" fill="currentColor"/>
                      <path d="M10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5Z" fill="currentColor"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <div className="auth-footer">
            <span>Already have an account? </span>
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
