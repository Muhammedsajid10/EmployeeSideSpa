// API configuration
const API_CONFIG = {
  BASE_URL: 'https://spabackend-0tko.onrender.com/api/v1', // Always use deployed backend
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      SIGNUP: '/auth/signup',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    EMPLOYEES: {
      MY_SCHEDULE: '/employees/my-schedule',
      MY_ATTENDANCE: '/employees/my-attendance',
      CHECK_IN: '/employees/check-in',
      CHECK_OUT: '/employees/check-out',
      MARK_ABSENT: '/employees/mark-absent',
      MY_RATINGS: '/employees/my-ratings',
      MY_PERFORMANCE: '/employees/my-performance',
    },
    BOOKINGS: '/bookings',
    SERVICES: '/services',
    CATEGORIES: '/categories',
  },
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export default API_CONFIG;
