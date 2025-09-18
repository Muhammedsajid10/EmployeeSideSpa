import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, Calendar, LogOut, Clock, Star, TrendingUp, Award, CheckCircle, XCircle } from 'lucide-react';
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

  const Navbar = () => (
    <nav className="enhanced-navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle"
          >
            <Menu className="sidebar-toggle-icon" />
          </button>
          <div className="navbar-brand">
            <div className="brand-icon">
              <User className="navbar-brand-icon" />
            </div>
            <span className="navbar-brand-text">EmployeeHub</span>
          </div>
        </div>
       
        <div className="navbar-right">
          <div className="user-info">
            <div className="user-avatar">
              <User className="user-avatar-icon" />
            </div>
            <div className="user-details">
              <span className="user-name">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.fullName || 'Employee'
                }
              </span>
              <span className="user-role">{user?.role || 'Employee'}</span>
            </div>
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
    <div className={`enhanced-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} ref={sidebarRef}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Dashboard</h2>
        {/* <p className="sidebar-subtitle">Employee Services</p> */}
      </div>
      <div className="sidebar-content">
        <button
          onClick={() => {
            setActiveTab('profile');
            setSidebarOpen(false);
          }}
          className={`sidebar-item ${activeTab === 'profile' ? 'sidebar-item-active' : ''}`}
        >
          <div className="sidebar-item-icon">
            <User />
          </div>
          <div className="sidebar-item-content">
            <span className="sidebar-item-title">Profile</span>
            <span className="sidebar-item-subtitle">Personal information & reviews</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('schedule');
            setSidebarOpen(false);
          }}
          className={`sidebar-item ${activeTab === 'schedule' ? 'sidebar-item-active' : ''}`}
        >
          <div className="sidebar-item-icon">
            <Calendar />
          </div>
          <div className="sidebar-item-content">
            <span className="sidebar-item-title">Schedule</span>
            <span className="sidebar-item-subtitle">Appointments & bookings</span>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveTab('attendance');
            setSidebarOpen(false);
          }}
          className={`sidebar-item ${activeTab === 'attendance' ? 'sidebar-item-active' : ''}`}
        >
          <div className="sidebar-item-icon">
            <Clock />
          </div>
          <div className="sidebar-item-content">
            <span className="sidebar-item-title">Attendance</span>
            <span className="sidebar-item-subtitle">Check in/out & time tracking</span>
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
          stars.push(<Star key={i} className="star filled" />);
        } else if (i === fullStars + 1 && hasHalfStar) {
          stars.push(<Star key={i} className="star half-filled" />);
        } else {
          stars.push(<Star key={i} className="star empty" />);
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
      <div className="enhanced-main-content">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">Employee Profile</h1>
              <p className="page-subtitle">Personal information, performance metrics & client reviews</p>
            </div>
            <button
              onClick={refreshReviews}
              disabled={loading}
              className="refresh-button"
            >
              <TrendingUp className="refresh-icon" />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert error-alert">
            <XCircle className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert success-alert">
            <CheckCircle className="alert-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="profile-grid">
          <div className="profile-main-card">
            <div className="profile-header-section">
              <div className="profile-avatar-large">
                <User className="profile-avatar-icon-large" />
                <div className="avatar-status online"></div>
              </div>
              <div className="profile-info">
                <h2 className="profile-name">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.fullName || 'Employee Name'
                  }
                </h2>
                <div className="profile-badges">
                  <span className="badge primary">ID: {user?.id || user?._id || 'N/A'}</span>
                  <span className="badge secondary">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Employee'}</span>
                  <span className={`badge ${user?.isActive ? 'success' : 'warning'}`}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Star className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{reviewData.ratings.average.toFixed(1)}</div>
                  <div className="stat-label">Average Rating</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Award className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{reviewData.ratings.total}</div>
                  <div className="stat-label">Total Reviews</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Calendar className="icon" />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{scheduleData.length}</div>
                  <div className="stat-label">Upcoming Appointments</div>
                </div>
              </div>
            </div>

            <div className="contact-info">
              <h3 className="section-title">Contact Information</h3>
              <div className="contact-grid">
                <div className="contact-item">
                  <div className="contact-icon">✉</div>
                  <div className="contact-details">
                    <span className="contact-label">Email</span>
                    <span className="contact-value">{user?.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div className="contact-details">
                    <span className="contact-label">Phone</span>
                    <span className="contact-value">{user?.phone || 'N/A'}</span>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">📍</div>
                  <div className="contact-details">
                    <span className="contact-label">Location</span>
                    <span className="contact-value">
                      {user?.address ?
                        `${user.address.city || ''}, ${user.address.country || ''}`.replace(/^,\s*/, '') || 'N/A'
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">📅</div>
                  <div className="contact-details">
                    <span className="contact-label">Member Since</span>
                    <span className="contact-value">
                      {user?.createdAt ?
                        new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-side-panel">
            <div className="rating-overview-card">
              <h3 className="section-title">Performance Overview</h3>
              <div className="rating-summary">
                <div className="rating-display">
                  <div className="rating-number">{reviewData.ratings.average.toFixed(1)}</div>
                  <div className="rating-stars">
                    {renderStars(reviewData.ratings.average)}
                  </div>
                  <div className="rating-text">
                    Based on {reviewData.ratings.total} review{reviewData.ratings.total !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="rating-breakdown">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="rating-row">
                      <span className="rating-label">{star}★</span>
                      <div className="rating-bar-container">
                        <div 
                          className="rating-bar" 
                          style={{
                            width: `${reviewData.ratings.total > 0 ? (reviewData.ratings.breakdown[star] / reviewData.ratings.total) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="rating-count">{reviewData.ratings.breakdown[star]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="recent-reviews-card">
              <h3 className="section-title">Recent Client Reviews</h3>
              {loading && (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <span>Loading reviews...</span>
                </div>
              )}
              <div className="reviews-list">
                {reviewData.recentFeedback.length > 0 ? (
                  reviewData.recentFeedback.slice(0, 3).map((review, index) => (
                    <div key={review._id || index} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-avatar">
                          <User className="reviewer-icon" />
                        </div>
                        <div className="reviewer-info">
                          <h4 className="reviewer-name">
                            {review.client?.firstName} {review.client?.lastName}
                          </h4>
                          <div className="review-rating">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="review-date">{formatDate(review.submittedAt)}</span>
                      </div>
                      <p className="review-comment">{review.comment || 'No comment provided'}</p>
                      <div className="review-meta">
                        <span className="service-name">{review.service}</span>
                        {review.wouldRecommend && <span className="recommend-badge">Recommended</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Star className="empty-icon" />
                    <h4>No reviews yet</h4>
                    <p>Your client reviews will appear here once you start receiving feedback.</p>
                  </div>
                )}
              </div>
            </div>
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
      <div className="enhanced-main-content">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">Schedule Management</h1>
              <p className="page-subtitle">Your upcoming appointments and schedule overview</p>
            </div>
            <button
              onClick={refreshSchedule}
              disabled={loading}
              className="refresh-button"
            >
              <Calendar className="refresh-icon" />
              {loading ? 'Refreshing...' : 'Refresh Schedule'}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert error-alert">
            <XCircle className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="alert info-alert">
            <div className="loading-spinner"></div>
            <span>Loading schedule data...</span>
          </div>
        )}

        <div className="schedule-layout">
          <div className="appointments-section">
            <div className="section-header">
              <h2 className="section-title">My Appointments</h2>
              <span className="appointment-count">{scheduleData.length} upcoming</span>
            </div>

            <div className="appointments-list">
              {loading ? (
                <div className="loading-state large">
                  <div className="loading-spinner"></div>
                  <span>Loading appointments...</span>
                </div>
              ) : scheduleData.length > 0 ? (
                scheduleData.map((booking, index) => (
                  <div key={booking._id || index} className="appointment-card">
                    <div className="appointment-date-badge">
                      <div className="date-day">
                        {new Date(booking.appointmentDate).getDate()}
                      </div>
                      <div className="date-month">
                        {new Date(booking.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>

                    <div className="appointment-details">
                      <div className="appointment-header">
                        <h3 className="appointment-title">
                          {booking.services?.[0]?.service?.name || 'Service'}
                        </h3>
                        <span className={`status-badge ${booking.status?.toLowerCase() || 'pending'}`}>
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="appointment-info">
                        <div className="info-item">
                          <Clock className="info-icon" />
                          <span>
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
                        </div>
                        
                        <div className="info-item">
                          <User className="info-icon" />
                          <span>Client: {booking.client?.firstName} {booking.client?.lastName}</span>
                        </div>
                        
                        <div className="info-item">
                          <Calendar className="info-icon" />
                          <span>Booking: {booking.bookingNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="appointment-price">
                      <span className="price-amount">
                        AED {booking.totalAmount || booking.services?.[0]?.service?.price || booking.services?.[0]?.price || '0'}
                      </span>
                      {booking.services?.[0]?.service?.duration && (
                        <span className="duration">{booking.services[0].service.duration} mins</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state large">
                  <Calendar className="empty-icon" />
                  <h3>No upcoming appointments</h3>
                  <p>Your schedule is clear for now. New appointments will appear here.</p>
                </div>
              )}
            </div>
          </div>

          <div className="next-appointment-section">
            <h3 className="section-title">Next Appointment</h3>
            <div className="next-appointment-card">
              {scheduleData.length > 0 ? (
                <div className="next-appointment-content">
                  <div className="next-date-display">
                    <div className="next-date-large">
                      {new Date(scheduleData[0].appointmentDate).getDate()}
                    </div>
                    <div className="next-date-info">
                      <div className="next-month">
                        {new Date(scheduleData[0].appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="next-year">
                        {new Date(scheduleData[0].appointmentDate).getFullYear()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="next-appointment-details">
                    <h4 className="next-title">
                      {scheduleData[0].services?.[0]?.service?.name || 'Service'}
                    </h4>
                    <div className="next-info-list">
                      <div className="next-info-item">
                        <Clock className="next-icon" />
                        <span>
                          {scheduleData[0].services?.[0]?.startTime &&
                            new Date(scheduleData[0].services[0].startTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                          }
                        </span>
                      </div>
                      <div className="next-info-item">
                        <User className="next-icon" />
                        <span>{scheduleData[0].client?.firstName} {scheduleData[0].client?.lastName}</span>
                      </div>
                    </div>
                    <div className="next-price">
                      AED {scheduleData[0].totalAmount || scheduleData[0].services?.[0]?.service?.price || scheduleData[0].services?.[0]?.price || '0'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <Calendar className="empty-icon" />
                  <h4>No upcoming appointments</h4>
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
      <div className="enhanced-main-content">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">Attendance Management</h1>
              <p className="page-subtitle">Track your daily attendance and manage time records</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert error-alert">
            <XCircle className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert success-alert">
            <CheckCircle className="alert-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="attendance-layout">
          <div className="attendance-main-card">
            <div className="attendance-header">
              <h3 className="card-title">Today's Attendance</h3>
              <div className="attendance-status">
                <div className={`status-indicator ${attendanceData.isCheckedIn ? 'checked-in' : 'checked-out'}`}>
                  <div className="status-dot"></div>
                  <span className="status-text">
                    {attendanceData.isCheckedIn ? 'Checked In' : 'Checked Out'}
                  </span>
                </div>
              </div>
            </div>

            <div className="time-display-grid">
              <div className="time-card">
                <div className="time-icon check-in">
                  <Clock className="icon" />
                </div>
                <div className="time-info">
                  <span className="time-label">Check In</span>
                  <span className="time-value">{formatTime(attendanceData.checkInTime)}</span>
                </div>
              </div>
              <div className="time-card">
                <div className="time-icon check-out">
                  <Clock className="icon" />
                </div>
                <div className="time-info">
                  <span className="time-label">Check Out</span>
                  <span className="time-value">{formatTime(attendanceData.checkOutTime)}</span>
                </div>
              </div>
            </div>

            <div className="attendance-actions">
              <button
                onClick={handleCheckIn}
                disabled={attendanceData.isCheckedIn || loading}
                className={`action-button check-in-btn ${(attendanceData.isCheckedIn || loading) ? 'disabled' : ''}`}
              >
                <CheckCircle className="btn-icon" />
                <span>
                  {loading && !attendanceData.isCheckedIn ? 'Checking In...' :
                   attendanceData.isCheckedIn ? 'Already Checked In' : 'Check In'}
                </span>
              </button>
               
              <button
                onClick={handleCheckOut}
                disabled={!attendanceData.isCheckedIn || loading}
                className={`action-button check-out-btn ${(!attendanceData.isCheckedIn || loading) ? 'disabled' : ''}`}
              >
                <XCircle className="btn-icon" />
                <span>
                  {loading && attendanceData.isCheckedIn ? 'Checking Out...' :
                   !attendanceData.isCheckedIn ? 'Check In First' : 'Check Out'}
                </span>
              </button>
            </div>

            <div className="absent-section">
              <button
                onClick={() => setShowAbsentForm(!showAbsentForm)}
                className="action-button absent-btn"
              >
                <X className="btn-icon" />
                <span>Mark as Absent</span>
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
                  <div className="form-actions">
                    <button
                      onClick={submitAbsent}
                      className="submit-btn"
                      disabled={!absentReason.trim()}
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setShowAbsentForm(false);
                        setAbsentReason('');
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="attendance-history-card">
            <h3 className="card-title">Attendance History</h3>
             
            <div className="history-list">
              {attendanceData.attendanceHistory.length > 0 ? (
                attendanceData.attendanceHistory.map((record, index) => (
                  <div key={record._id || index} className="history-group">
                    {record.checkIn && (
                      <div className="history-item">
                        <div className="history-icon check-in">
                          <CheckCircle className="icon" />
                        </div>
                        <div className="history-content">
                          <span className="history-action">Checked In</span>
                          <span className="history-time">
                            {formatDate(new Date(record.date))} at {formatTime(new Date(record.checkIn))}
                          </span>
                        </div>
                      </div>
                    )}
                   
                    {record.checkOut && (
                      <div className="history-item">
                        <div className="history-icon check-out">
                          <XCircle className="icon" />
                        </div>
                        <div className="history-content">
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
                        <div className="history-icon absent">
                          <X className="icon" />
                        </div>
                        <div className="history-content">
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
                      <div className="history-icon check-in">
                        <CheckCircle className="icon" />
                      </div>
                      <div className="history-content">
                        <span className="history-action">Checked In</span>
                        <span className="history-time">
                          {formatDate(attendanceData.checkInTime)} at {formatTime(attendanceData.checkInTime)}
                        </span>
                      </div>
                    </div>
                  )}
                 
                  {attendanceData.checkOutTime && (
                    <div className="history-item">
                      <div className="history-icon check-out">
                        <XCircle className="icon" />
                      </div>
                      <div className="history-content">
                        <span className="history-action">Checked Out</span>
                        <span className="history-time">
                          {formatDate(attendanceData.checkOutTime)} at {formatTime(attendanceData.checkOutTime)}
                        </span>
                      </div>
                    </div>
                  )}

                  {attendanceData.absentDays.map((absent, index) => (
                    <div key={index} className="history-item">
                      <div className="history-icon absent">
                        <X className="icon" />
                      </div>
                      <div className="history-content">
                        <span className="history-action">Marked Absent</span>
                        <span className="history-time">
                          {formatDate(absent.date)} - {absent.reason}
                        </span>
                      </div>
                    </div>
                  ))}

                  {!attendanceData.checkInTime && !attendanceData.checkOutTime && attendanceData.absentDays.length === 0 && (
                    <div className="empty-state">
                      <Clock className="empty-icon" />
                      <h4>No attendance records</h4>
                      <p>Your attendance history will appear here.</p>
                    </div>
                  )}
                </>
              )}
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
    <div className="enhanced-app-container">
      <Navbar />
      <Sidebar />
      <div className={`enhanced-main-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {renderActivePage()}
      </div>
    </div>
  );
};

export default EmployeeManagementSystem;

