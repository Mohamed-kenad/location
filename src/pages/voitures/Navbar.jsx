import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

const Navbar = ({ scrollToSection, toggleTheme, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [contracts, setContracts] = useState([]);
  const [hoverLink, setHoverLink] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  const user = useSelector((state) => state.user.user);
  const isLoggedIn = !!user;
  const clientId = user?.id;
  const dispatch = useDispatch();

  useEffect(() => {
    axios.get(`https://json-server-api-q84y.onrender.com/contrats`).then((res) => {
      setContracts(res.data);
      
      // Transform contracts into notifications
      if (res.data && clientId) {
        const userContracts = res.data.filter(c => c.clientId === clientId);
        const notifs = userContracts.map(contract => ({
          id: contract.id,
          title: `Car Rental Contract #${contract.id}`,
          message: `Your contract for ${contract.car?.model || 'a vehicle'} has been ${contract.statut}`,
          status: contract.statut,
          date: new Date(contract.dateModification || contract.dateDebut),
          read: false,
          type: contract.statut === "confirmed" ? "success" : 
                contract.statut === "canceled" ? "danger" : "info"
        }));
        const sortedNotifications = notifs.sort((a, b) => b.date - a.date);
        setNotifications(sortedNotifications);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll("section").forEach((section) => observer.observe(section));

    // Close notifications when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      observer.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clientId]);

  const today = new Date();
  const activeContracts = contracts?.filter(
    (c) => c.clientId === clientId &&
           ["pending", "confirmed", "canceled"].includes(c.statut) &&
           new Date(c.datefin) >= today
  ).length || 0;

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
        ? { ...notification, read: true } 
        : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : notifications.filter(n => !n.read);

  const navLinks = [
    { id: "Home", label: "Home" },
    { id: "Cars", label: "Cars" },
    { id: "Contact", label:"Contact" },
  ];

  const navbarStyle = {
    transition: "all 0.4s ease",
    background: isDarkMode 
      ? "linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))" 
      : "linear-gradient(135deg, #ffffff, #f5f7fa)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
    borderBottom: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
    padding: "1rem 0",
  };

  const linkStyle = {
    transition: "all 0.3s ease",
    position: "relative",
    color: isDarkMode ? "#e5e7eb" : "#1f2937",
    fontWeight: 500,
    padding: "0.5rem 1rem",
    borderRadius: "8px",
  };

  const activeLinkStyle = {
    color: "#a78bfa",
    background: isDarkMode ? "rgba(167, 139, 250, 0.1)" : "rgba(167, 139, 250, 0.2)",
  };

  const hoverEffect = {
    transform: "translateY(-2px)",
    background: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
  };

  const notificationDropdownStyle = {
    position: "absolute",
    top: "45px",
    right: "-370px",
    width: "392px",
    maxHeight: "500px",
    overflowY: "auto",
    background: isDarkMode ? "rgba(31, 41, 55, 0.98)" : "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
    backdropFilter: "blur(10px)",
    zIndex: 1000,
    visibility: showNotifications ? "visible" : "hidden",
    opacity: showNotifications ? 1 : 0,
    transform: showNotifications ? "translateY(0)" : "translateY(-10px)",
    transition: "all 0.3s ease",
  };
 const navigate=useNavigate();
  const handleNotificationClick = (notification) => {
    markAsRead(notification);
    setShowNotifications(false);
    navigate(`/tracking`, { state: { id: notification } });
   
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top" style={navbarStyle}>
      <div className="container">
        <Link 
          className="navbar-brand d-flex align-items-center" 
          to="/" 
          style={{ 
            background: "linear-gradient(to right, #a78bfa, #60a5fa)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: 700,
            letterSpacing: "1px"
          }}
        >
          <i className="bi bi-gear-wide-connected me-2" style={{ 
            fontSize: "1.8rem",
            color: "#a78bfa",
            animation: "spin 4s linear infinite"
          }}></i>
          GEARSHIFT
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{ 
            border: "none", 
            color: "#a78bfa",
            padding: "0.5rem"
          }}
        >
          <i className={`bi ${isOpen ? "bi-x-lg" : "bi-list"}`} style={{ 
            fontSize: "1.8rem",
            transition: "all 0.3s ease"
          }}></i>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            {navLinks.map((link) => (
              <li 
                className="nav-item" 
                key={link.id}
                onMouseEnter={() => setHoverLink(link.id)}
                onMouseLeave={() => setHoverLink(null)}
              >
                <a
                  className={`nav-link ${activeSection === link.id ? "active" : ""}`}
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.id);
                  }}
                  style={{
                    ...linkStyle,
                    ...(activeSection === link.id ? activeLinkStyle : {}),
                    ...(hoverLink === link.id ? hoverEffect : {})
                  }}
                >
                  {link.label}
                  <span 
                    style={{
                      position: "absolute",
                      bottom: "0",
                      left: "50%",
                      width: "0",
                      height: "2px",
                      background: "linear-gradient(to right, #a78bfa, #60a5fa)",
                      transition: "all 0.3s ease",
                      transform: "translateX(-50%)",
                      ...(activeSection === link.id ? { width: "60%" } : {}),
                      ...(hoverLink === link.id ? { width: "60%" } : {})
                    }}
                  ></span>
                </a>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="position-relative" ref={notificationRef}>
                  <button 
                    className="btn btn-link p-0 mt-1 position-relative"
                    onClick={() => setShowNotifications(!showNotifications)}
                    style={{ 
                      color: isDarkMode ? "#e5e7eb" : "#1f2937",
                      transition: "all 0.3s ease",
                      background: "transparent",
                      border: "none"
                    }}
                  >
                    <i className="bi bi-bell fs-4" style={{
                      filter: unreadNotifications > 0 ? "drop-shadow(0 0 8px rgba(167, 139, 250, 0.5))" : "none",
                      color: showNotifications ? "#a78bfa" : (isDarkMode ? "#e5e7eb" : "#1f2937")
                    }}></i>
                    {unreadNotifications > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle p-1"
                        style={{
                          background: "red",
                          minWidth: "1.2rem",
                          height: "1.2rem",
                          fontSize: "0.7rem",
                          transform: "translate(-50%, -30%)"
                        }}
                      >
                        {unreadNotifications}
                      </span>
                    )}
                  </button>
                  
                  {/* Notification Dropdown */}
                  <div id="notification-dropdown" style={notificationDropdownStyle}>
                    <div style={{
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "15px", 
                      borderBottom: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`
                    }}>
                      <h6 style={{ margin: 0, color: isDarkMode ? "#e5e7eb" : "#1f2937", fontWeight: "bold" }}>
                        Notifications
                      </h6>
                      {unreadNotifications > 0 && (
                        <button 
                          className="btn btn-link p-0" 
                          style={{ 
                            color: "#a78bfa", 
                            fontSize: "0.8rem", 
                            textDecoration: "none" 
                          }}
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    {/* Tabs */}
                    <div style={{ display: "flex", borderBottom: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}` }}>
                      <button 
                        onClick={() => setActiveTab("all")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "transparent",
                          border: "none",
                          borderBottom: activeTab === "all" ? "2px solid #a78bfa" : "none",
                          color: activeTab === "all" ? "#a78bfa" : (isDarkMode ? "#e5e7eb" : "#1f2937"),
                          fontWeight: activeTab === "all" ? "bold" : "normal"
                        }}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => setActiveTab("unread")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "transparent",
                          border: "none",
                          borderBottom: activeTab === "unread" ? "2px solid #a78bfa" : "none",
                          color: activeTab === "unread" ? "#a78bfa" : (isDarkMode ? "#e5e7eb" : "#1f2937"),
                          fontWeight: activeTab === "unread" ? "bold" : "normal"
                        }}
                      >
                        Unread
                      </button>
                    </div>
                    
                    {/* Notification Items */}
                    <div>
                   
                      {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(notification => (
                          <div 
                            key={notification.id}
                            onClick={() => {markAsRead(notification.id); handleNotificationClick(notification.id)}}
                            style={{
                              padding: "15px",
                              borderBottom: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
                              background: !notification.read 
                                ? (isDarkMode ? "rgba(167, 139, 250, 0.1)" : "rgba(167, 139, 250, 0.05)") 
                                : "transparent",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "flex-start",
                              transition: "background 0.3s ease"
                            }}
                          >
                            <div 
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: notification.type === "success" 
                                  ? "rgba(52, 211, 153, 0.2)" 
                                  : notification.type === "danger" 
                                    ? "rgba(239, 68, 68, 0.2)" 
                                    : "rgba(59, 130, 246, 0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "10px",
                                flexShrink: 0
                              }}
                            >
                              <i className={`bi bi-${
                                notification.type === "success" 
                                  ? "check-circle" 
                                  : notification.type === "danger" 
                                    ? "x-circle" 
                                    : "info-circle"
                              }`} style={{ 
                                color: notification.type === "success" 
                                  ? "#34D399" 
                                  : notification.type === "danger" 
                                    ? "#EF4444" 
                                    : "#3B82F6" 
                              }}></i>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontWeight: notification.read ? "normal" : "bold",
                                color: isDarkMode ? "#e5e7eb" : "#1f2937",
                                marginBottom: "4px"
                              }}>
                                {notification.title}
                              </div>
                              <div style={{ 
                                fontSize: "0.9rem", 
                                color: isDarkMode ? "rgba(229, 231, 235, 0.7)" : "rgba(31, 41, 55, 0.7)"
                              }}>
                                {notification.message}
                              </div>
                              <div style={{ 
                                fontSize: "0.8rem",
                                color: isDarkMode ? "rgba(229, 231, 235, 0.5)" : "rgba(31, 41, 55, 0.5)",
                                marginTop: "5px"
                              }}>
                                {new Date(notification.date).toLocaleString()}
                              </div>
                            </div>
                            {!notification.read && (
                              <div style={{ 
                                width: "8px", 
                                height: "8px", 
                                borderRadius: "50%", 
                                background: "#a78bfa",
                                marginLeft: "10px",
                                marginTop: "8px"
                              }}></div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div style={{ 
                          padding: "20px", 
                          textAlign: "center", 
                          color: isDarkMode ? "rgba(229, 231, 235, 0.7)" : "rgba(31, 41, 55, 0.7)"
                        }}>
                          No notifications to display
                        </div>
                      )}
                    </div>
                    
                    {/* View All Link */}
                    {notifications.length > 0 && (
                      <div style={{ 
                        padding: "15px", 
                        textAlign: "center", 
                        borderTop: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`
                      }}>
                        <Link 
                          to="/tracking" 
                          style={{ 
                            color: "#a78bfa", 
                            textDecoration: "none", 
                            fontWeight: "500",
                            fontSize: "0.9rem"
                          }}
                          onClick={() => setShowNotifications(false)}
                        >
                          View All Contracts
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="dropdown">
                  <button
                    className="btn btn-link d-flex align-items-center text-decoration-none p-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    style={{ borderRadius: "50%" }}
                  >
                    <div style={{
                      position: "relative",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(45deg, #a78bfa, #60a5fa)",
                      padding: "2px"
                    }}>
                      <img
                        src={user?.avatar || "https://via.placeholder.com/40"}
                        alt="User Avatar"
                        className="rounded-circle w-100 h-100 object-cover"
                        style={{ border: `2px solid ${isDarkMode ? '#111827' : '#ffffff'}` }}
                      />
                    </div>
                  </button>
                  
                  <ul className="dropdown-menu dropdown-menu-end" 
                    style={{ 
                      left: 0,
                      background: isDarkMode ? "rgba(31, 41, 55, 0.95)" : "#ffffff",
                      border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                      backdropFilter: isDarkMode ? "blur(10px)" : "none",
                      color: isDarkMode ? "#e5e7eb" : "#1f2937"
                    }}
                  >
                    <li>
                      <h6 className="dropdown-header" style={{ color: "#a78bfa" }}>
                        {user?.firstName}
                      </h6>
                    </li>
                    <li>
                      <Link 
                        className="dropdown-item" 
                        to="/profile"
                        style={{ 
                          transition: "all 0.3s ease",
                          color: isDarkMode ? "#e5e7eb" : "#1f2937",
                        }}
                      >
                        <i className="bi bi-person me-2"></i>Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" style={{ borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }} /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={() => dispatch({ type: "LOGOUT" })}
                        style={{ transition: "all 0.3s ease" }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </div>
                
                <li className="nav-item d-flex align-items-center">
                  <button
                    onClick={toggleTheme}
                    className="btn p-1"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: isDarkMode ? "#e5e7eb" : "#1f2937",
                      transition: "all 0.3s ease"
                    }}
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'} fs-5`}></i>
                  </button>
                </li>
              </>
            ) : (
              <Link
                to="/login"
                className="btn px-4 py-2"
                style={{
                  background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
                  color: "white",
                  borderRadius: "25px",
                  border: "none",
                  boxShadow: "0 4px 15px rgba(167, 139, 250, 0.3)",
                  transition: "all 0.3s ease",
                }}
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;