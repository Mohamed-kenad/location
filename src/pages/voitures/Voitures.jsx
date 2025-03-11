"use client";

import React, { forwardRef, useEffect, useState } from 'react';
import Navbar from './Navbar'; // Your existing Navbar
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Theme configurations
const themes = {
  dark: {
    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
    cardBackground: "rgba(30, 41, 59, 0.95)",
    textColor: "#ffffff",
    secondaryText: "#e5e7eb",
    mutedText: "#6c757d",
    borderColor: "rgba(255, 255, 255, 0.05)",
    footerBg: "#1a202c",
  },
  light: {
    background: "linear-gradient(135deg, #f5f7fa, #e4e7eb)",
    cardBackground: "#ffffff",
    textColor: "#1f2937",
    secondaryText: "#4b5563",
    mutedText: "#6b7280",
    borderColor: "rgba(0, 0, 0, 0.1)",
    footerBg: "#f7fafc",
  }
};

const Voitures = () => {
  const [cars, setCars] = useState([]);
  const [hoverElement, setHoverElement] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const navigate = useNavigate();

  const sectionRefs = {
    Home: React.useRef(),
    Cars: React.useRef(),
    Contact: React.useRef(),
  };

  useEffect(() => {
    axios.get("https://json-server-api-q84y.onrender.com/voitures")
      .then(res => setCars(res.data))
      .catch(err => console.error("Error fetching cars:", err));
  }, []);

  const scrollToSection = (section) => {
    if (sectionRefs[section].current) {
      sectionRefs[section].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const currentTheme = isDarkMode ? themes.dark : themes.light;
  const transitionStyle = { transition: 'all 0.4s ease' };
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <>
      <Navbar 
        scrollToSection={scrollToSection} 
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />
      <div style={{ background: currentTheme.background, minHeight: '100vh' }}>
        {/* Hero Section */}
        <section id="Home" ref={sectionRefs.Home} 
          className="min-vh-100 position-relative"
          style={{
            background: currentTheme.background,
            overflow: "hidden",
            ...containerStyle,
            color: currentTheme.textColor
          }}>
          <div className="container position-relative z-1" style={{ ...containerStyle, flexDirection: 'column' }}>
            <div className="row align-items-center justify-content-center w-100">
              <div className="col-lg-6 order-lg-2 text-center">
                <img 
                  src="https://mir-s3-cdn-cf.behance.net/project_modules/fs/02b374101705095.5f24d5db1096f.gif" 
                  loading='lazy'
                  alt="Hero Car" 
                  className="img-fluid rounded-3"
                  style={{ 
                    ...transitionStyle,
                    filter: "drop-shadow(0 0 20px rgba(0, 194, 255, 0.4))",
                    transform: hoverElement === 'hero' ? "scale(1.05)" : "none",
                    maxWidth: "100%"
                  }}
                  onMouseEnter={() => setHoverElement('hero')}
                  onMouseLeave={() => setHoverElement(null)}
                />
              </div>
              <div className="col-lg-6 mt-4 mt-lg-0 text-center">
                <h1 className="display-3 fw-bold mb-4" style={{ 
                  background: "linear-gradient(to right, #00c2ff, #8b5cf6)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}>
                  Explore the Road Ahead
                </h1>
                <p className="lead opacity-75 mb-4" style={{ color: currentTheme.secondaryText }}>
                  Premium car rentals with GearShift.
                </p>
                <button className="btn px-5 py-2" style={{
                  background: "linear-gradient(135deg, #00c2ff, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 15px rgba(0, 194, 255, 0.4)",
                  ...transitionStyle,
                  transform: hoverElement === 'hero-btn' ? "translateY(-5px)" : "none",
                  boxShadow: hoverElement === 'hero-btn' ? "0 8px 25px rgba(0, 194, 255, 0.6)" : "0 4px 15px rgba(0, 194, 255, 0.4)"
                }}
                onMouseEnter={() => setHoverElement('hero-btn')}
                onMouseLeave={() => setHoverElement(null)}>
                  View Our Fleet
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-5" style={{ 
          background: currentTheme.cardBackground,
          borderBottom: `1px solid ${currentTheme.borderColor}`,
          ...containerStyle
        }}>
          <div className="container" style={{ ...containerStyle, flexDirection: 'column' }}>
            <div className="row text-center g-4 w-100 justify-content-center">
              {[
                { value: "10+", label: "Years of Experience" },
                { value: "1000+", label: "Happy Clients" },
                { value: "200+", label: "Vehicles" },
                { value: "10+", label: "Locations" }
              ].map((stat, index) => (
                <div key={index} className="col-md-3">
                  <div style={{ 
                    ...transitionStyle,
                    transform: hoverElement === `stat-${index}` ? "scale(1.1)" : "none",
                    opacity: hoverElement === `stat-${index}` ? 1 : 0.85
                  }}
                  onMouseEnter={() => setHoverElement(`stat-${index}`)}
                  onMouseLeave={() => setHoverElement(null)}>
                    <h2 className="fw-bold" style={{ 
                      background: "linear-gradient(to right, #00c2ff, #8b5cf6)",
                      WebkitBackgroundClip: "text",
                      color: "transparent"
                    }}>{stat.value}</h2>
                    <p style={{ color: currentTheme.secondaryText }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Cars Section */}
        <section id="Cars" ref={sectionRefs.Cars} className="py-5" 
          style={{ 
            background: currentTheme.background,
            ...containerStyle,
            color: currentTheme.textColor
          }}>
          <div className="container" style={{ ...containerStyle, flexDirection: 'column' }}>
            <div className="d-flex justify-content-between align-items-center mb-5 w-100">
              <h2 className="fw-bold" style={{ 
                background: "linear-gradient(to right, #00c2ff, #8b5cf6)",
                WebkitBackgroundClip: "text",
                color: "transparent"
              }}>Featured Cars</h2>
              <button className="btn btn-outline" style={{ 
                ...transitionStyle,
                borderColor: "#00c2ff",
                borderRadius: "8px",
                color: currentTheme.textColor,
                background: hoverElement === 'view-all' ? (isDarkMode ? "rgba(255, 81, 0, 0.2)" : "rgba(0, 0, 0, 0.1)") : "transparent",
                borderColor: hoverElement === 'view-all' ? "#8b5cf6" : "#00c2ff"
              }}
              onClick={()=>navigate('/show-all', { state: { cars, isDarkMode } })}
              onMouseEnter={() => setHoverElement('view-all')}
              onMouseLeave={() => setHoverElement(null)}>
                Show All <i className="bi bi-arrow-right"></i>
              </button>
            </div>
            <div className="row g-4 w-100 justify-content-center">
              {cars.slice(0, 3).map(car => (
                <div key={car.id} className="col-md-4">
                  <div className="card h-100" style={{
                    ...transitionStyle,
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: hoverElement === car.id ? "0 8px 32px rgba(0, 194, 255, 0.4)" : "0 4px 15px rgba(0, 0, 0, 0.1)",
                    transform: hoverElement === car.id ? "translateY(-10px)" : "none",
                    background: currentTheme.cardBackground
                  }}
                  onMouseEnter={() => setHoverElement(car.id)}
                  onMouseLeave={() => setHoverElement(null)}>
                    <div className="position-relative">
                      <img 
                        src={car.image || "https://via.placeholder.com/300x200"}
                        loading='lazy'
                        className="card-img-top"
                        alt={car.name}
                        style={{ 
                          height: "230px",
                          objectFit: "cover",
                          borderRadius: '12px 12px 0 0'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: car.disponible ? 'linear-gradient(135deg, #28a745 0%, #218838 100%)' : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                        color: 'white',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontSize: '0.9rem'
                      }}>
                        {car.disponible ? "disponible" : "non disponible"}
                      </span>
                    </div>
                    <div className="card-body text-center">
                      <h5 style={{ color: currentTheme.secondaryText, fontWeight: '600' }}>{car.name || "Car Name"}</h5>
                      <div className="d-flex align-items-baseline justify-content-center mb-3">
                        <small style={{ color: currentTheme.mutedText }}>AED</small>
                        <span style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          background: "linear-gradient(to right, #00c2ff, #8b5cf6)",
                          WebkitBackgroundClip: "text",
                          color: "transparent",
                          margin: '0 5px'
                        }}>
                          {car.price || "N/A"} <span style={{textDecoration:"line-through",color:"#999999",fontSize:"14px"}}>MAD {car.price+50}</span>
                        </span>
                        <small style={{ color: currentTheme.mutedText }}>/ DAY</small>
                      </div>
                        
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <div className="d-flex align-items-center justify-content-center" style={{ color: currentTheme.mutedText }}>
                            <i className="bi bi-speedometer2 me-2"></i>
                            <small>{car.specs || "N/A"}</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-items-center justify-content-center" style={{ color: currentTheme.mutedText }}>
                            <i className="bi bi-gear me-2"></i>
                            <small>{car.transmission || "N/A"}</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-items-center justify-content-center" style={{ color: currentTheme.mutedText }}>
                            <i className="bi bi-people me-2"></i>
                            <small>{car.seats || "N/A"} Seats</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="d-flex align-items-center justify-content-center" style={{ color: currentTheme.mutedText }}>
                            <i className="bi bi-briefcase me-2"></i>
                            <small>{car.luggage || "N/A"} Luggage</small>
                          </div>
                        </div>
                      </div>
                      <Link to={`/car/${car.id}`} style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #00c2ff, #8b5cf6)',
                        border: 'none',
                        display: "block",
                        color: 'white',
                        padding: '10px',
                        borderRadius: '6px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        textAlign: 'center',
                        ...transitionStyle,
                        boxShadow: hoverElement === car.id ? "0 6px 20px rgba(0, 194, 255, 0.6)" : "none"
                      }}>
                        See Full Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-5" style={{ 
          background: currentTheme.background,
          ...containerStyle
        }}>
          <div className="container" style={{ ...containerStyle, flexDirection: 'column' }}>
            <div className="row g-4 w-100 justify-content-center">
              {[
                { icon: "bi-search", title: "Browse Our Fleet", text: "Lorem ipsum dolor sit amet" },
                { icon: "bi-car-front", title: "Select Your Vehicle", text: "Lorem ipsum dolor sit amet" },
                { icon: "bi-file-text", title: "Submit an Enquiry", text: "Lorem ipsum dolor sit amet" },
                { icon: "bi-geo-alt", title: "Pick Up & Drive", text: "Lorem ipsum dolor sit amet" }
              ].map((step, index) => (
                <div key={index} className="col-md-3 text-center">
                  <div style={{
                    ...transitionStyle,
                    background: currentTheme.cardBackground,
                    padding: "2rem",
                    border: `1px solid ${currentTheme.borderColor}`,
                    borderRadius: "12px",
                    transform: hoverElement === `step-${index}` ? "scale(1.05)" : "none",
                    boxShadow: hoverElement === `step-${index}` ? "0 10px 35px rgba(0, 194, 255, 0.4)" : "none"
                  }}
                  onMouseEnter={() => setHoverElement(`step-${index}`)}
                  onMouseLeave={() => setHoverElement(null)}>
                    <div className="mb-3" style={{
                      background: "linear-gradient(45deg, #00c2ff, #8b5cf6)",
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      ...transitionStyle,
                      boxShadow: "0 2px 10px rgba(0, 194, 255, 0.3)"
                    }}>
                      <i className={`bi ${step.icon} fs-4 text-white`}></i>
                    </div>
                    <h5 className="fw-bold" style={{ color: currentTheme.secondaryText }}>{step.title}</h5>
                    <p style={{ color: currentTheme.mutedText, fontSize: '0.9rem' }}>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer 
       ref={sectionRefs.Contact}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode} 
        scrollToSection={scrollToSection}
        />
      </div>
    </>
  );
};

export const Footer = forwardRef(({ isDarkMode }, ref,scrollToSection) => {

  const currentTheme = isDarkMode ? themes.dark : themes.light;
  const transitionStyle = { transition: 'all 0.4s ease' };



  return (
    <section id="Contact" ref={ref}
      >
    <footer style={{ 
      background: currentTheme.footerBg,
      color: currentTheme.textColor,
      padding: '3rem 0'
    }}  >
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <h3 className="h2 mb-4" style={{ 
              background: "linear-gradient(to right, #00c2ff, #8b5cf6)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>GearShift</h3>
            <p className="mb-4" style={{ color: currentTheme.secondaryText }}>
              We offer high-quality car rental services with a focus on customer satisfaction. Explore our premium fleet
              today and experience the difference.
            </p>
            <div className="d-flex gap-3">
              {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                <a key={social} href={`#${social}`} style={{ 
                  color: currentTheme.textColor, 
                  ...transitionStyle,
                  ':hover': { color: '#00c2ff' }
                }}>
                  <i className={`bi bi-${social} fs-5`}></i>
                </a>
              ))}
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h5 className="mb-4" style={{ 
              background: "linear-gradient(to right, #00c2ff, #8b5cf6)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>Quick Links</h5>
            <ul className="list-unstyled">
              {["Home", "About Us", "Our Fleet", "Locations", "FAQs"].map((link) => (
                <li key={link} className="mb-2">
                  <a
                    href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-decoration-none"
                    style={{ 
                      color: currentTheme.mutedText, 
                      ...transitionStyle,
                      ':hover': { color: '#00c2ff' }
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h5 className="mb-4" style={{ 
              background: "linear-gradient(to right, #00c2ff, #8b5cf6)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>Policies</h5>
            <ul className="list-unstyled">
              {["Terms of Service", "Privacy Policy", "Cancellation Policy", "Cookie Policy"].map((policy) => (
                <li key={policy} className="mb-2">
                  <a
                    href={`#${policy.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-decoration-none"
                    style={{ 
                      color: currentTheme.mutedText, 
                      ...transitionStyle,
                      ':hover': { color: '#00c2ff' }
                    }}
                  >
                    {policy}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h5 className="mb-4" style={{ 
              background: "linear-gradient(to right, #00c2ff, #8b5cf6)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>Contact Us</h5>
            <ul className="list-unstyled mb-4">
              <li className="mb-2">
                <i className="bi bi-envelope-fill me-2" style={{ color: '#00c2ff' }}></i>
                <a href="mailto:support@gearshift.com" style={{ 
                  color: currentTheme.mutedText, 
                  textDecoration: 'none'
                }}>
                  support@gearshift.com
                </a>
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone-fill me-2" style={{ color: '#00c2ff' }}></i>
                <a href="tel:+15551234567" style={{ 
                  color: currentTheme.mutedText, 
                  textDecoration: 'none'
                }}>
                  +1 (555) 123-4567
                </a>
              </li>
              <li>
                <i className="bi bi-geo-alt-fill me-2" style={{ color: '#00c2ff' }}></i>
                <span style={{ color: currentTheme.mutedText }}>
                  123 Rental Street, Car City, CC 12345
                </span>
              </li>
            </ul>

            <a
              href="https://wa.me/212640240753"
              target="_blank"
              rel="noopener noreferrer"
              className="btn px-4 py-2"
              style={{
                background: "linear-gradient(135deg, #00c2ff, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                ...transitionStyle,
                boxShadow: "0 4px 15px rgba(0, 194, 255, 0.4)"
              }}
            >
              <i className="bi bi-whatsapp me-2"></i> Chat on WhatsApp
            </a>
          </div>
        </div>

        <hr className="my-4" style={{ background: currentTheme.borderColor }} />

        <div className="text-center" style={{ color: currentTheme.mutedText }}>
          <p className="mb-0">© {new Date().getFullYear()} GearShift. All rights reserved.</p>
        </div>
      </div>
    </footer>
    </section>
  );

}
);

export default Voitures;