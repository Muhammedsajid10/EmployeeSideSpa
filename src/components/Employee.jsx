import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, User, Bell, Search, X, Calendar, Clock, Users, MapPin, 
  Plus, Edit, Trash2, CheckCircle, Mail, Phone, Star, Droplet, 
  Heart, Church 
} from 'lucide-react';
import './Employee.css';

// Navbar Component
const Navbar = ({ onMenuToggle, isMobile }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Left side */}
          <div className="navbar-left">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={onMenuToggle}
                className="mobile-menu-btn"
              >
                <Menu className="menu-icon" />
              </button>
            )}
            
            {/* Logo */}
            <div className="logo-container">
              <div className="logo-icon">
                <User className="logo-user-icon" />
              </div>
              <span className="logo-text">EmployeeHub</span>
            </div>
          </div>
          {/* Right side */}
          <div className="navbar-right">

            {/* Profile */}
            
          </div>
        </div>
      </div>
    </nav>
  );
};

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose, isMobile }) => {
  const menuItems = [
    {
      id: 'profile',
      name: 'Profile',
      icon: User,
      description: 'Employee information'
    },
    {
      id: 'schedule',
      name: 'Schedule',
      icon: Calendar,
      description: 'Work schedules'
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isMobile ? 'sidebar-mobile' : ''} ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-content">
          {/* Sidebar header */}
          <div className="sidebar-header">
            <h2 className="sidebar-title">Services</h2>
            {isMobile && (
              <button onClick={onClose} className="sidebar-close-btn">
                <X className="close-icon" />
              </button>
            )}
          </div>

          {/* Menu items */}
          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) onClose();
                  }}
                  className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                >
                  <Icon className={`nav-icon ${isActive ? 'nav-icon-active' : ''}`} />
                  <div className="nav-content">
                    <div className={`nav-name ${isActive ? 'nav-name-active' : ''}`}>
                      {item.name}
                    </div>
                    <div className={`nav-description ${isActive ? 'nav-description-active' : ''}`}>
                      {item.description}
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="nav-indicator" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          
        </div>
      </div>
    </>
  );
};

// Profile Page Component
const ProfilePage = () => {
  const allCards = [
    { id: 1, name: "John Doe", review: "Very professional and reliable", rating: 5 },
    { id: 2, name: "Alice Smith", review: "Great communication skills", rating: 4 },
    { id: 3, name: "Michael Lee", review: "Excellent work quality", rating: 5 },
    { id: 4, name: "Emily Davis", review: "Always willing to support", rating: 4 },
    { id: 5, name: "Kevin Brown", review: "Hardworking and consistent", rating: 5 },
    { id: 6, name: "Laura Green", review: "Very detail-oriented", rating: 4 },
    { id: 7, name: "David Clark", review: "A pleasure to work with", rating: 5 },
    { id: 8, name: "Sophia Lee", review: "Great leadership skills", rating: 4 }
  ];

  const [visibleCards, setVisibleCards] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  const handleScroll = () => {
    const container = containerRef.current;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
      if (visibleCards < allCards.length && !isLoading) {
        setIsLoading(true);
        setTimeout(() => {
          setVisibleCards(prev => Math.min(prev + 4, allCards.length));
          setIsLoading(false);
        }, 500);
      }
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header profile-header">
        <h1 className="page-title">Employee Profile</h1>
        <p className="page-subtitle">Basic Information & Reviews</p>
      </div>

      {/* Profile Section */}
      <div className="content-card">
        <div className="profile-grid">
          {/* Left Side - Profile */}
          <div className="profile-left">
            <div className="profile-avatar-container">
              <div className="profile-avatar-large">
                <User className="profile-avatar-icon" />
              </div>
            </div>

            <div className="profile-info">
              <h2 className="employee-name">John Williams</h2>
              <p className="employee-id">ID: 1210372726433743682</p>
              
              <div className="contact-info">
                <div className="contact-item">
                  <Mail className="contact-icon" />
                  <span>johnwilliams@bicaradata.com</span>
                </div>
                <div className="contact-item">
                  <User className="contact-icon" />
                  <span>Male</span>
                </div>
                <div className="contact-item">
                  <Phone className="contact-icon" />
                  <span>081323323311</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Additional Info */}
          <div className="profile-details">
            <h3 className="details-title">Personal Details</h3>
            
            <div className="detail-item">
              <div className="detail-label">
                <MapPin className="detail-icon" />
                <span>Place of birth</span>
              </div>
              <span className="detail-value">Bandung</span>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Calendar className="detail-icon" />
                <span>Birth date</span>
              </div>
              <span className="detail-value">30 Oct 1994</span>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Droplet className="detail-icon" />
                <span>Blood type</span>
              </div>
              <span className="detail-value">AB</span>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Heart className="detail-icon" />
                <span>Marital Status</span>
              </div>
              <span className="detail-value">Married</span>
            </div>

            <div className="detail-item">
              <div className="detail-label">
                <Church className="detail-icon" />
                <span>Religion</span>
              </div>
              <span className="detail-value">Christian</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="content-card">
        <h3 className="section-title">Team Reviews</h3>

        <div className="reviews-container">
          <div
            className="reviews-scroll"
            onScroll={handleScroll}
            ref={containerRef}
          >
            <div className="reviews-grid">
              {allCards.slice(0, visibleCards).map((card) => (
                <div key={card.id} className="review-card">
                  <div className="review-content">
                    <div className="review-avatar">
                      <User className="review-avatar-icon" />
                    </div>
                    
                    <div className="review-info">
                      <h4 className="review-name">{card.name}</h4>
                      <p className="review-text">{card.review}</p>
                      
                      <div className="review-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`star ${i < card.rating ? 'star-filled' : 'star-empty'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isLoading && (
              <div className="loading-container">
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            )}

            {visibleCards >= allCards.length && (
              <div className="end-message">
                All reviews loaded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Schedule Page Component with New Appointments Content
const SchedulePage = () => {
  // Helper to parse appointment date/time
  const parseDateTime = (app) => {
    // Try to extract a valid Date object from time string
    // Example: 'Tue, Sep 2, 2025 at 09:45 AM'
    const match = app.time.match(/([A-Za-z]+), ([A-Za-z]+ \d{1,2}, \d{4}) at ([\d:]+ [APM]{2})/);
    if (match) {
      return new Date(`${match[2]} ${match[3]}`);
    }
    // Fallback: try to parse time directly
    return new Date(app.time);
  };

  // Find the next upcoming appointment
  const now = new Date();
  const upcomingAppointments = appointments
    .map(app => ({ ...app, dateTime: parseDateTime(app) }))
    .filter(app => app.dateTime > now)
    .sort((a, b) => a.dateTime - b.dateTime);
  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
  const [showAddForm, setShowAddForm] = useState(false);

  // Appointments data from the new design
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

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header schedule-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Schedule Management</h1>
          </div>
        </div>
      </div>
      {/* Main Appointments Layout */}
      <div className="appointments-layout">
        {/* Left Section - Appointments Activity */}
        <div className="appointments-left-section">
          <div className="activity-container">
            <h2>Appointments Activity</h2>

            <div className="activity-scroll-wrapper">
              <div className="activity-list">
                {appointments.map((app, index) => (
                  <div key={index} className="activity-card">
                    <div className="activity-date">{app.date}</div>

                    <div className="activity-details">
                      <div className="activity-time-status">
                        <span className="activity-time">{app.time}</span>
                        <span className={`activity-status ${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="activity-title">{app.title}</div>
                      <div className="activity-type">{app.type}</div>
                      {app.payment && <div className="activity-payment">{app.payment}</div>}
                    </div>

                    <div className="activity-price">{app.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Next Appointment */}
        <div className="appointments-right-section">
          <div>
            <h3 className="next-appointment-heading">Next Appointment</h3>
          </div>
          <div className="next-appointment-container">
            {nextAppointment ? (
              <div className='next-appointment-box'>
                <div className="next-date-box">
                  <div className="next-date">{nextAppointment.dateTime.getDate()}</div>
                  <div className="next-month">{nextAppointment.dateTime.toLocaleString('default', { month: 'short' })}</div>
                </div>
                <div className="next-details">
                  <div className="next-time-status">
                    <span className="next-time">{nextAppointment.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="next-status">{nextAppointment.status}</span>
                  </div>
                  <div className="next-title">{nextAppointment.title}</div>
                  <div className="next-info">{nextAppointment.type}</div>
                  {nextAppointment.payment && <div className="next-location">{nextAppointment.payment}</div>}
                </div>
                <div className="next-price">{nextAppointment.price}</div>
              </div>
            ) : (
              <div>No upcoming appointments</div>
            )}
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Add New Schedule</h3>
            <div className="modal-form">
              <input
                type="text"
                placeholder="Schedule title"
                className="form-input"
              />
              <input
                type="date"
                className="form-input"
              />
              <input
                type="time"
                className="form-input"
              />
              <input
                type="text"
                placeholder="Location"
                className="form-input"
              />
              <textarea
                placeholder="Description"
                rows="3"
                className="form-textarea"
              ></textarea>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowAddForm(false)}
                className="modal-btn modal-btn-cancel"
              >
                Cancel
              </button>
              <button className="modal-btn modal-btn-primary">
                Add Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
const EmployeeManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePage />;
      case 'schedule':
        return <SchedulePage />;
      default:
        return <ProfilePage />;
    }
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar onMenuToggle={toggleSidebar} isMobile={isMobile} />
      
      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <div className={`sidebar-container ${isMobile ? 'sidebar-mobile-container' : ''}`}>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={sidebarOpen}
            onClose={closeSidebar}
            isMobile={isMobile}
          />
        </div>

        {/* Main Content */}
        <div className="content-container">
          <main className="main-content">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagementSystem;