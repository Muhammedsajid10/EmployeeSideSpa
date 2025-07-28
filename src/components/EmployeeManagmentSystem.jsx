import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, Calendar, LogOut, Clock } from 'lucide-react';
import API_CONFIG, { apiCall } from '../utils/api';
import './Employee.css';

const EmployeeManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    checkInTime: null,
    checkOutTime: null,
    isCheckedIn: false,
    absentDays: [],
    attendanceHistory: []
  });
  const [scheduleData, setScheduleData] = useState([]);
  const [reviewData, setReviewData] = useState({
    ratings: {
      average: 0,
      total: 0,
      breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    },
    recentFeedback: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const sidebarRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      console.log('Attempting check-in...'); // Debug log
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEES.CHECK_IN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      console.log('Check-in response:', { status: response.status, data }); // Debug log
      
      if (response.ok && data.success) {
        // Successful check-in
        const now = new Date();
        setAttendanceData(prev => ({
          ...prev,
          checkInTime: now,
          isCheckedIn: true
        }));
        setSuccessMessage('Successfully checked in!');
        
        // Auto-refresh attendance data after a brief delay
        setTimeout(() => {
          fetchAttendanceData();
        }, 1000);
      } else {
        // Handle business logic errors (like already checked in)
        if (response.status === 400 && data.message === 'Already checked in today') {
          setError('You are already checked in today.');
          // Refresh data to sync state
          fetchAttendanceData();
        } else {
          throw new Error(data.message || 'Check-in failed');
        }
      }
    } catch (error) {
      console.error('Error checking in:', error);
      if (error.message.includes('Employee record not found')) {
        setError('Employee profile not found. Please contact your administrator.');
      } else {
        setError(error.message || 'Failed to check in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      console.log('Attempting check-out...'); // Debug log
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEES.CHECK_OUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      console.log('Check-out response:', { status: response.status, data }); // Debug log
      
      if (response.ok && data.success) {
        // Successful check-out
        const now = new Date();
        setAttendanceData(prev => ({
          ...prev,
          checkOutTime: now,
          isCheckedIn: false
        }));
        setSuccessMessage('Successfully checked out!');
        
        // Auto-refresh attendance data after a brief delay
        setTimeout(() => {
          fetchAttendanceData();
        }, 1000);
      } else {
        // Handle business logic errors
        if (response.status === 400 && data.message.includes('No check-in record found')) {
          setError('You need to check in first before checking out.');
          // Refresh data to sync state
          fetchAttendanceData();
        } else {
          throw new Error(data.message || 'Check-out failed');
        }
      }
    } catch (error) {
      console.error('Error checking out:', error);
      if (error.message.includes('Employee record not found')) {
        setError('Employee profile not found. Please contact your administrator.');
      } else {
        setError(error.message || 'Failed to check out. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async (date, reason) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      const response = await apiCall(API_CONFIG.ENDPOINTS.EMPLOYEES.MARK_ABSENT, {
        method: 'POST',
        body: JSON.stringify({
          reason: reason || 'Employee marked as absent',
          leaveType: 'personal'
        })
      });
      
      // Update local state with the new absent record
      setAttendanceData(prev => ({
        ...prev,
        absentDays: [...prev.absentDays, { 
          date, 
          reason: response.data.reason, 
          timestamp: new Date(),
          leaveType: response.data.leaveType 
        }]
      }));
      
      setSuccessMessage('Successfully marked as absent for today');
    } catch (error) {
      console.error('Error marking absent:', error);
      if (error.message.includes('Employee record not found')) {
        setError('Employee profile not found. Please contact your administrator.');
      } else if (error.message.includes('Cannot mark as absent after checking in')) {
        setError('Cannot mark as absent after already checking in today.');
      } else {
        setError(error.message || 'Failed to mark as absent. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee review data
  const fetchReviewData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching review data...'); // Debug log
      
      const response = await apiCall(API_CONFIG.ENDPOINTS.EMPLOYEES.MY_RATINGS);
      console.log('Review response:', response); // Debug log
      
      if (response.success) {
        setReviewData({
          ratings: response.data.ratings || {
            average: 0,
            total: 0,
            breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          },
          recentFeedback: response.data.recentFeedback || []
        });
      }
      
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Don't show error for missing employee record, just show empty state
      if (error.message.includes('Employee record not found')) {
        setReviewData({
          ratings: {
            average: 0,
            total: 0,
            breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          },
          recentFeedback: []
        });
      } else {
        setError('Failed to load review data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee schedule data
  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching schedule data...'); // Debug log
      
      const response = await apiCall(API_CONFIG.ENDPOINTS.EMPLOYEES.MY_SCHEDULE);
      console.log('Schedule response:', response); // Debug log
      
      // Backend returns data.upcomingAppointments, not data.bookings
      const appointments = response.data.upcomingAppointments || [];
      setScheduleData(appointments);
      
    } catch (error) {
      console.error('Error fetching schedule:', error);
      // Don't show error for missing employee record, just show empty state
      if (error.message.includes('Employee record not found')) {
        setScheduleData([]);
      } else {
        setError('Failed to load schedule data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch employee attendance data
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching attendance data...'); // Debug log
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEES.MY_ATTENDANCE}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      console.log('Attendance response:', { status: response.status, data }); // Debug log
      
      if (response.ok && data.success) {
        const attendanceHistory = data.data.attendance || [];
        
        // Find today's attendance if exists
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendanceHistory.find(att => 
          att.date && att.date.split('T')[0] === today
        );
        
        console.log('Today\'s attendance record:', todayAttendance); // Debug log
        
        setAttendanceData(prev => ({
          ...prev,
          attendanceHistory,
          checkInTime: todayAttendance?.checkIn ? new Date(todayAttendance.checkIn) : null,
          checkOutTime: todayAttendance?.checkOut ? new Date(todayAttendance.checkOut) : null,
          isCheckedIn: !!(todayAttendance?.checkIn && !todayAttendance?.checkOut)
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      // Don't show error for missing employee record, just use local state
      if (error.message.includes('Employee record not found')) {
        setAttendanceData(prev => ({ ...prev, attendanceHistory: [] }));
      } else {
        setError('Failed to load attendance data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or tab changes
  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchScheduleData();
    } else if (activeTab === 'attendance') {
      fetchAttendanceData();
    } else if (activeTab === 'profile') {
      fetchReviewData();
    }
  }, [activeTab]);

  // Load attendance data when component first mounts to get current status
  useEffect(() => {
    fetchAttendanceData();
    fetchReviewData(); // Also load review data on component mount
  }, []);

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Appointments data
  const appointments = [
    {
      date: '20 Jun',
      time: 'Fri, 20 Jun 2025 16 : 15',
      status: 'Booked',
      title: 'Lava Stone Massage',
      type: 'Walk-In, 1 h with Dayu',
      payment: 'cash',
      price: 'AED 300',
    },
    {
      date: '15 Jun',
      time: 'Sun, 15 Jun 2025 17 : 30',
      status: 'Completed',
      title: 'Relaxing Massage',
      type: 'Walk-In, 1 h with Sarita',
      payment: '',
      price: 'AED 250',
    },
    {
      date: '15 Jun',
      time: 'Sun, 15 Jun 2025 21 : 40',
      status: 'Completed',
      title: 'Relaxing Massage',
      type: 'Samar, 1 h with Putri',
      payment: '',
      price: 'AED 200',
    },
    {
      date: '20 Jun',
      time: 'Fri, 20 Jun 2025 16 : 15',
      status: 'Booked',
      title: 'Lava Stone Massage',
      type: 'Walk-In, 1 h with Dayu',
      payment: 'cash',
      price: 'AED 300',
    },
    {
      date: '15 Jun',
      time: 'Sun, 15 Jun 2025 17 : 30',
      status: 'Completed',
      title: 'Relaxing Massage',
      type: 'Walk-In, 1 h with Sarita',
      payment: '',
      price: 'AED 250',
    },
    {
      date: '20 Jun',
      time: 'Fri, 20 Jun 2025 16 : 15',
      status: 'Booked',
      title: 'Lava Stone Massage',
      type: 'Walk-In, 1 h with Dayu',
      payment: 'cash',
      price: 'AED 300',
    },
    {
      date: '15 Jun',
      time: 'Sun, 15 Jun 2025 17 : 30',
      status: 'Completed',
      title: 'Relaxing Massage',
      type: 'Walk-In, 1 h with Sarita',
      payment: '',
      price: 'AED 250',
    },
    {
      date: '15 Jun',
      time: 'Sun, 15 Jun 2025 21 : 40',
      status: 'Completed',
      title: 'Relaxing Massage',
      type: 'Samar, 1 h with Putri',
      payment: '',
      price: 'AED 200',
    },
    {
      date: '20 Jun',
      time: 'Fri, 20 Jun 2025 16 : 15',
      status: 'Booked',
      title: 'Lava Stone Massage',
      type: 'Walk-In, 1 h with Dayu',
      payment: 'cash',
      price: 'AED 300',
    },
    {
      date: '20 Jun',
      time: 'Fri, 20 Jun 2025 16 : 15',
      status: 'Booked',
      title: 'Lava Stone Massage',
      type: 'Walk-In, 1 h with Dayu',
      payment: 'cash',
      price: 'AED 300',
    },
    {
      date: '15 Jun',
      time: 'Sun, 15 Jun 2025 17 : 30',
      status: 'Completed',
      title: 'Relaxing Massage',
      type: 'Walk-In, 1 h with Sarita',
      payment: '',
      price: 'AED 250',
    },
    {
      date: '15 Jun',
      time: 'Sun, 15 Jun 2025 21 : 40',
      status: 'Completed',
      title: 'Relaxing Massage',
      type: 'Samar, 1 h with Putri',
      payment: '',
      price: 'AED 200',
    },
    {
      date: '20 Jun',
      time: 'Fri, 20 Jun 2025 16 : 15',
      status: 'Booked',
      title: 'Lava Stone Massage',
      type: 'Walk-In, 1 h with Dayu',
      payment: 'cash',
      price: 'AED 300',
    },
  ];

  const Navbar = () => (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle"
          >
            <Menu className="sidebar-toggle-icon" />
          </button>
          <div className="navbar-brand">
            <User className="navbar-brand-icon" />
            <span className="navbar-brand-text">EmployeeHub</span>
          </div>
        </div>
        
        <div className="navbar-right">
          <div className="user-info">
            <User className="user-avatar-icon" />
            <span className="user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.fullName || 'Employee'
              }
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="logout-button"
            title="Logout"
          >
            <LogOut className="logout-icon" />
          </button>
        </div>
      </div>
    </nav>
  );

  const Sidebar = () => (
    <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} ref={sidebarRef}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Services</h2>
      </div>
      <div className="sidebar-content">
        
        
        <button
          onClick={() => {
            setActiveTab('schedule');
            setSidebarOpen(false);
          }}
          className={`sidebar-item ${activeTab === 'schedule' ? 'sidebar-item-active' : ''}`}
        >
          <Calendar className="sidebar-item-icon" />
          <div className="sidebar-item-content">
            <span className="sidebar-item-title">Schedule</span>
            <span className="sidebar-item-subtitle">Work schedules</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('attendance');
            setSidebarOpen(false);
          }}
          className={`sidebar-item ${activeTab === 'attendance' ? 'sidebar-item-active' : ''}`}
        >
          <Clock className="sidebar-item-icon" />
          <div className="sidebar-item-content">
            <span className="sidebar-item-title">Attendance</span>
            <span className="sidebar-item-subtitle">Check in/out & absences</span>
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab('profile');
            setSidebarOpen(false);
          }}
          className={`sidebar-item ${activeTab === 'profile' ? 'sidebar-item-active' : ''}`}
        >
          <User className="sidebar-item-icon" />
          <div className="sidebar-item-content">
            <span className="sidebar-item-title">Profile</span>
            <span className="sidebar-item-subtitle">Employee information</span>
          </div>
        </button>
      </div>
    </div>
  );

  const ProfilePage = () => {
    const refreshReviews = async () => {
      await fetchReviewData();
    };

    const renderStars = (rating) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      
      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          stars.push(<span key={i} className="star">⭐</span>);
        } else if (i === fullStars + 1 && hasHalfStar) {
          stars.push(<span key={i} className="star">⭐</span>);
        } else {
          stars.push(<span key={i} className="star-empty">☆</span>);
        }
      }
      return stars;
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    return (
      <div className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title">Employee Profile</h1>
              <p className="page-subtitle">Basic Information & Reviews</p>
            </div>
            <button 
              onClick={refreshReviews}
              disabled={loading}
              className="attendance-btn"
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                minHeight: 'auto',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                borderRadius: '0.5rem',
                border: 'none',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh Reviews'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-alert" style={{
            margin: '1rem 0',
            padding: '1rem',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <div className="profile-content" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2fr)',
          gap: '2rem',
          '@media (max-width: 968px)': {
            gridTemplateColumns: '1fr',
            gap: '1.5rem'
          }
        }}>
          <div className="profile-left">
            <div className="profile-card">
              <div className="profile-info">
                <div className="profile-avatar">
                  <User className="profile-avatar-icon" />
                </div>
                <div className="profile-details">
                  <h2 className="profile-name">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.fullName || 'Employee Name'
                    }
                  </h2>
                  <div className="profile-meta">
                    <span className="profile-id">ID: {user?.id || user?._id || 'N/A'}</span>
                  </div>
                  <div className="profile-contact">
                    <div className="contact-item">
                      <span className="contact-icon">✉</span>
                      <span className="contact-text">{user?.email || 'N/A'}</span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">👤</span>
                      <span className="contact-text">
                        {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'N/A'}
                      </span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-icon">📞</span>
                      <span className="contact-text">{user?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-right">
            <div className="personal-details-section">
              <h3 className="section-title">Personal Details</h3>
              <div className="personal-details-grid">
                <div className="detail-item">
                  <div className="detail-label">
                    <span className="detail-icon">📍</span>
                    Address
                  </div>
                  <div className="detail-value">
                    {user?.address ? 
                      `${user.address.city || ''}, ${user.address.country || ''}`.replace(/^,\s*/, '') || 'N/A'
                      : 'N/A'
                    }
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <span className="detail-icon">📅</span>
                    Member since
                  </div>
                  <div className="detail-value">
                    {user?.createdAt ? 
                      new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'N/A'
                    }
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <span className="detail-icon">✅</span>
                    Status
                  </div>
                  <div className="detail-value">
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <span className="detail-icon">👔</span>
                    Role
                  </div>
                  <div className="detail-value">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <span className="detail-icon">🌐</span>
                    Language
                  </div>
                  <div className="detail-value">
                    {user?.preferences?.language || 'English'}
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Summary Section */}
            <div className="rating-summary-section">
              <h3 className="section-title">Rating Overview</h3>
              <div className="rating-overview">
                <div className="average-rating">
                  <div>
                    {reviewData.ratings.average.toFixed(1)}
                  </div>
                  <div className="rating-stars">
                    {renderStars(reviewData.ratings.average)}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Based on {reviewData.ratings.total} review{reviewData.ratings.total !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="rating-breakdown">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star}>
                      <span>{star}★</span>
                      <div>
                        <div style={{
                          width: `${reviewData.ratings.total > 0 ? (reviewData.ratings.breakdown[star] / reviewData.ratings.total) * 100 : 0}%`
                        }}></div>
                      </div>
                      <span>
                        {reviewData.ratings.breakdown[star]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reviews-section">
          <h3 className="section-title">Recent Client Reviews</h3>
          
          {loading && (
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              color: '#0369a1', 
              border: '2px solid #7dd3fc',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Loading reviews...
            </div>
          )}

          <div className="reviews-grid">
            {reviewData.recentFeedback.length > 0 ? (
              reviewData.recentFeedback.map((review, index) => (
                <div key={review._id || index} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-avatar">
                      <User className="reviewer-avatar-icon" />
                    </div>
                    <div className="reviewer-info">
                      <h4 className="reviewer-name">
                        {review.client?.firstName} {review.client?.lastName}
                      </h4>
                      <p className="review-text">{review.comment || 'No comment provided'}</p>
                      <div className="review-meta">
                        <span>Service: {review.service}</span>
                        <span>{formatDate(review.submittedAt)}</span>
                        {review.wouldRecommend && <span>Would recommend</span>}
                      </div>
                    </div>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-reviews">
                <div>⭐</div>
                <h3>No reviews yet</h3>
                <p>Your client reviews will appear here once you start receiving feedback.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const SchedulePage = () => {
    const refreshSchedule = async () => {
      await fetchScheduleData();
    };

    return (
      <div className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="page-title">Schedule Management</h1>
              <p className="page-subtitle">Your upcoming appointments and schedule</p>
            </div>
            <button 
              onClick={refreshSchedule}
              disabled={loading}
              className="attendance-btn"
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                minHeight: 'auto',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem'
              }}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        {loading && (
          <div className="success-alert" style={{ backgroundColor: '#f0f9ff', color: '#0369a1', border: '2px solid #7dd3fc' }}>
            Loading schedule data...
          </div>
        )}

        <div className='appointments-layout'>
          <div className="appointments-left-section">
            <div className="activity-container">
              <h2>My Appointments</h2>

              <div className="activity-scroll-wrapper">
                <div className="activity-list">
                  {loading ? (
                    <div className="loading-message" style={{ 
                      textAlign: 'center', 
                      padding: '3rem', 
                      color: '#6b7280',
                      fontSize: '1.1rem'
                    }}>
                      <div style={{ marginBottom: '1rem' }}>📅</div>
                      Loading appointments...
                    </div>
                  ) : scheduleData.length > 0 ? (
                    scheduleData.map((booking, index) => (
                      <div key={booking._id || index} className="activity-card">
                        <div className="activity-date">
                          {new Date(booking.appointmentDate).toLocaleDateString('en-US', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </div>

                        <div className="activity-details">
                          <div className="activity-time-status">
                            <span className="activity-time">
                              {new Date(booking.appointmentDate).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                              })}
                              {booking.services && booking.services[0]?.startTime && 
                                ` at ${new Date(booking.services[0].startTime).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}`
                              }
                            </span>
                            <span className={`activity-status ${booking.status?.toLowerCase() || 'pending'}`}>
                              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending'}
                            </span>
                          </div>

                          <div className="activity-title">
                            {booking.services?.[0]?.service?.name || 'Service'}
                          </div>
                          <div className="activity-type">
                            Client: {booking.client?.firstName} {booking.client?.lastName}
                            {booking.services?.[0]?.service?.duration && 
                              ` • ${booking.services[0].service.duration} mins`
                            }
                          </div>
                          <div className="activity-payment">
                            Booking: {booking.bookingNumber}
                            {booking.totalDuration && ` • Total: ${booking.totalDuration} mins`}
                          </div>
                        </div>

                        <div className="activity-price">
                          AED {booking.totalAmount || booking.services?.[0]?.service?.price || booking.services?.[0]?.price || '0'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-appointments" style={{ 
                      textAlign: 'center', 
                      padding: '3rem', 
                      color: '#6b7280' 
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                      <h3 style={{ marginBottom: '0.5rem', color: '#374151' }}>No upcoming appointments</h3>
                      <p>Your schedule is clear for now. New appointments will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="appointments-right-section">
            <div>
              <h3 className="next-appointment-heading">Next Appointment</h3>
            </div>
            <div className="next-appointment-container">
              {scheduleData.length > 0 ? (
                <div className='next-appointment-box'>
                  <div className="next-date-box">
                    <div className="next-date">
                      {new Date(scheduleData[0].appointmentDate).getDate()}
                    </div>
                    <div className="next-month">
                      {new Date(scheduleData[0].appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div className="next-details">
                    <div className="next-time-status">
                      <span className="next-time">
                        {new Date(scheduleData[0].appointmentDate).toLocaleDateString('en-US', { weekday: 'short' })}
                        {scheduleData[0].services?.[0]?.startTime && 
                          ` at ${new Date(scheduleData[0].services[0].startTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}`
                        }
                      </span>
                      <span className="next-status">{scheduleData[0].status}</span>
                    </div>
                    <div className="next-title">
                      {scheduleData[0].services?.[0]?.service?.name || 'Service'}
                    </div>
                    <div className="next-info">
                      Client: {scheduleData[0].client?.firstName} {scheduleData[0].client?.lastName}
                      {scheduleData[0].services?.[0]?.service?.duration && 
                        ` • ${scheduleData[0].services[0].service.duration} mins`
                      }
                    </div>
                    <div className="next-location">
                      Booking: {scheduleData[0].bookingNumber}
                      {scheduleData[0].totalDuration && ` • Total: ${scheduleData[0].totalDuration} mins`}
                    </div>
                  </div>
                  <div className="next-price">
                    AED {scheduleData[0].totalAmount || scheduleData[0].services?.[0]?.service?.price || scheduleData[0].services?.[0]?.price || '0'}
                  </div>
                </div>
              ) : (
                <div className="no-next-appointment" style={{ 
                  textAlign: 'center', 
                  padding: '3rem', 
                  color: '#6b7280' 
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🗓️</div>
                  <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>No upcoming appointments</h4>
                  <p>Your next appointment will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AttendancePage = () => {
    const [absentReason, setAbsentReason] = useState('');
    const [showAbsentForm, setShowAbsentForm] = useState(false);

    const formatTime = (date) => {
      if (!date) return '--:--';
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    };

    const formatDate = (date) => {
      if (!date) return '--';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const submitAbsent = () => {
      if (absentReason.trim()) {
        handleMarkAbsent(new Date(), absentReason);
        setAbsentReason('');
        setShowAbsentForm(false);
      }
    };

    return (
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Track your daily attendance and manage absences</p>
        </div>

        {error && (
          <div className="error-alert" style={{ margin: '1rem', padding: '1rem', backgroundColor: '#fee', color: '#c33', borderRadius: '0.5rem' }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-alert" style={{ margin: '1rem', padding: '1rem', backgroundColor: '#efe', color: '#396', borderRadius: '0.5rem' }}>
            {successMessage}
          </div>
        )}

        <div className="attendance-layout">
          <div className="attendance-left-section">
            <div className="attendance-card">
              <h3 className="attendance-card-title">Today's Attendance</h3>
              
              <div className="attendance-status">
                <div className="status-indicator">
                  <div className={`status-dot ${attendanceData.isCheckedIn ? 'checked-in' : 'checked-out'}`}></div>
                  <span className="status-text">
                    {attendanceData.isCheckedIn ? 'Checked In' : 'Checked Out'}
                  </span>
                </div>
              </div>

              <div className="time-display">
                <div className="time-item">
                  <span className="time-label">Check In Time</span>
                  <span className="time-value">{formatTime(attendanceData.checkInTime)}</span>
                </div>
                <div className="time-item">
                  <span className="time-label">Check Out Time</span>
                  <span className="time-value">{formatTime(attendanceData.checkOutTime)}</span>
                </div>
              </div>

              <div className="attendance-actions">
                <button
                  onClick={handleCheckIn}
                  disabled={attendanceData.isCheckedIn || loading}
                  className={`attendance-btn check-in-btn ${(attendanceData.isCheckedIn || loading) ? 'disabled' : ''}`}
                >
                  <Clock className="btn-icon" />
                  {loading && !attendanceData.isCheckedIn ? 'Checking In...' : 
                   attendanceData.isCheckedIn ? 'Already Checked In' : 'Check In'}
                </button>
                
                <button
                  onClick={handleCheckOut}
                  disabled={!attendanceData.isCheckedIn || loading}
                  className={`attendance-btn check-out-btn ${(!attendanceData.isCheckedIn || loading) ? 'disabled' : ''}`}
                >
                  <Clock className="btn-icon" />
                  {loading && attendanceData.isCheckedIn ? 'Checking Out...' : 
                   !attendanceData.isCheckedIn ? 'Check In First' : 'Check Out'}
                </button>
              </div>

              <div className="absent-section">
                <button
                  onClick={() => setShowAbsentForm(!showAbsentForm)}
                  className="attendance-btn absent-btn"
                >
                  Mark as Absent
                </button>

                {showAbsentForm && (
                  <div className="absent-form">
                    <textarea
                      value={absentReason}
                      onChange={(e) => setAbsentReason(e.target.value)}
                      placeholder="Enter reason for absence..."
                      className="absent-textarea"
                      rows="3"
                    />
                    <div className="absent-form-actions">
                      <button
                        onClick={submitAbsent}
                        className="submit-absent-btn"
                        disabled={!absentReason.trim()}
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => {
                          setShowAbsentForm(false);
                          setAbsentReason('');
                        }}
                        className="cancel-absent-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="attendance-right-section">
            <div className="attendance-history">
              <h3 className="section-title">Attendance History</h3>
              
              <div className="history-scroll-wrapper">
                <div className="history-list">
                  {attendanceData.attendanceHistory.length > 0 ? (
                    attendanceData.attendanceHistory.map((record, index) => (
                      <div key={record._id || index}>
                        {record.checkIn && (
                          <div className="history-item">
                            <div className="history-icon check-in-icon">
                              <Clock className="icon" />
                            </div>
                            <div className="history-details">
                              <span className="history-action">Checked In</span>
                              <span className="history-time">
                                {formatDate(new Date(record.date))} at {formatTime(new Date(record.checkIn))}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {record.checkOut && (
                          <div className="history-item">
                            <div className="history-icon check-out-icon">
                              <Clock className="icon" />
                            </div>
                            <div className="history-details">
                              <span className="history-action">Checked Out</span>
                              <span className="history-time">
                                {formatDate(new Date(record.date))} at {formatTime(new Date(record.checkOut))}
                              </span>
                              {record.hoursWorked && (
                                <span className="history-hours">
                                  Hours worked: {record.hoursWorked.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {record.isAbsent && (
                          <div className="history-item">
                            <div className="history-icon absent-icon">
                              <X className="icon" />
                            </div>
                            <div className="history-details">
                              <span className="history-action">Marked Absent</span>
                              <span className="history-time">
                                {formatDate(new Date(record.date))}
                                {record.absentReason && ` - ${record.absentReason}`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    // Fallback to local data if no API data
                    <>
                      {attendanceData.checkInTime && (
                        <div className="history-item">
                          <div className="history-icon check-in-icon">
                            <Clock className="icon" />
                          </div>
                          <div className="history-details">
                            <span className="history-action">Checked In</span>
                            <span className="history-time">
                              {formatDate(attendanceData.checkInTime)} at {formatTime(attendanceData.checkInTime)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {attendanceData.checkOutTime && (
                        <div className="history-item">
                          <div className="history-icon check-out-icon">
                            <Clock className="icon" />
                          </div>
                          <div className="history-details">
                            <span className="history-action">Checked Out</span>
                            <span className="history-time">
                              {formatDate(attendanceData.checkOutTime)} at {formatTime(attendanceData.checkOutTime)}
                            </span>
                          </div>
                        </div>
                      )}

                      {attendanceData.absentDays.map((absent, index) => (
                        <div key={index} className="history-item">
                          <div className="history-icon absent-icon">
                            <X className="icon" />
                          </div>
                          <div className="history-details">
                            <span className="history-action">Marked Absent</span>
                            <span className="history-time">
                              {formatDate(absent.date)} - {absent.reason}
                            </span>
                          </div>
                        </div>
                      ))}

                      {!attendanceData.checkInTime && !attendanceData.checkOutTime && attendanceData.absentDays.length === 0 && (
                        <div className="no-history">
                          <p>No attendance records yet</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePage />;
      case 'schedule':
        return <SchedulePage />;
      case 'attendance':
        return <AttendancePage />;
      default:
        return <ProfilePage />;
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <div className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {renderActivePage()}
      </div>
    </div>
  );
};

export default EmployeeManagementSystem;

