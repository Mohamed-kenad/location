import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "bootstrap-icons/font/bootstrap-icons.css";
import { Footer } from './Voitures';


const themes = {
  dark: {
    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
    cardBackground: "rgba(30, 41, 59, 0.95)",
    textColor: "#ffffff",
    secondaryText: "#e5e7eb",
    mutedText: "#6c757d",
    borderColor: "rgba(255, 255, 255, 0.05)",
    footerBg: "#1a202c",
    inputBg: "rgba(55, 65, 81, 0.8)",
  },
  light: {
    background: "linear-gradient(135deg, #f5f7fa, #e4e7eb)",
    cardBackground: "#ffffff",
    textColor: "#1f2937",
    secondaryText: "#4b5563",
    mutedText: "#6b7280",
    borderColor: "rgba(0, 0, 0, 0.1)",
    footerBg: "#f7fafc",
    inputBg: "#f3f4f6",
  }
};

const ShowAll = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [hoverElement, setHoverElement] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [carsPerPage, setCarsPerPage] = useState(6); // Default 6 cars per page

  const navigate = useNavigate();

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      // Adjust cars per page based on screen size
      if (window.innerWidth < 576) {
        setCarsPerPage(2); // For mobile
      } else if (window.innerWidth < 992) {
        setCarsPerPage(4); // For tablets
      } else {
        setCarsPerPage(6); // For desktop
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const passedCars = location.state?.cars || [];
    if (passedCars.length > 0) {
      setCars(passedCars);
      setFilteredCars(passedCars);
      setIsDarkMode(location.state.isDarkMode || true);
    } else {
      axios.get("https://json-server-api-q84y.onrender.com/voitures")
        .then(res => {
          setCars(res.data);
          setFilteredCars(res.data);
        })
        .catch(err => console.error("Error fetching cars:", err));
    }
  }, [location.state]);

  // Reset to page 1 when cars per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [carsPerPage]);

  const handleSort = (criteria) => {
    setSortBy(criteria);
    const sortedCars = [...filteredCars].sort((a, b) => {
      if (criteria === 'name') return a.name.localeCompare(b.name);
      if (criteria === 'price') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      if (criteria === 'availability') return (b.disponible ? 1 : 0) - (a.disponible ? 1 : 0);
      return 0;
    });
    setFilteredCars(sortedCars);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = cars.filter(car => 
      car.name.toLowerCase().includes(query) ||
      (car.specs && car.specs.toLowerCase().includes(query)) ||
      (car.transmission && car.transmission.toLowerCase().includes(query))
    );
    setFilteredCars(filtered);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Get current cars for pagination
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of container on page change for better UX
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);

  // Determine page numbers to show based on screen size
  const getVisiblePageNumbers = useCallback(() => {
    let delta = windowWidth < 768 ? 1 : 2; // Fewer pages on mobile
    
    let pages = [];
    
    // Always include first and last page
    let startPage = Math.max(1, currentPage - delta);
    let endPage = Math.min(totalPages, currentPage + delta);
    
    // Always show first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis1');
      }
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis2');
      }
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages, windowWidth]);

  const currentTheme = isDarkMode ? themes.light : themes.dark;
  const transitionStyle = { transition: 'all 0.4s ease' };
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

  };

  return (
    <>
      <div style={{ background: currentTheme.background, minHeight: '100vh', padding: '4rem 0' }}>


        <div className="container-inline"> 
    <button className="btn btn-outline-primary text-dark" onClick={() => navigate(-1)} style={{marginLeft:"150px"}}>
      <i className="bi bi-arrow-left"></i> Back
    </button>
        <section style={{ ...containerStyle, marginTop: '50px' }}>
    
          <div className="container" style={{ ...containerStyle, flexDirection: 'column' }}>
            {/* Header with Search and Sort */}
            <div className="mb-5 w-100">
              <h2 className="fw-bold text-center mb-4" style={{ 
                background: "linear-gradient(to right, #00c2ff, #8b5cf6)",
                WebkitBackgroundClip: "text",
                color: "transparent"
              }}>Browse All Rental Cars</h2>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="input-group mx-auto" style={{ 
                  maxWidth: windowWidth < 768 ? '100%' : '500px',
                  width: windowWidth < 768 ? '100%' : '50%'
                }}>
                  <span className="input-group-text" style={{ 
                    background: currentTheme.inputBg, 
                    color: currentTheme.textColor,
                    borderColor: currentTheme.borderColor
                  }}>
                    <i className="bi bi-search"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search by name, specs, or transmission..." 
                    value={searchQuery}
                    onChange={handleSearch}
                    style={{ 
                      background: currentTheme.inputBg,
                      color: currentTheme.textColor,
                      borderColor: currentTheme.borderColor,
                      ...transitionStyle
                    }}
                  />
                </div>
                <div className={`dropdown ${windowWidth < 768 ? 'mt-2 w-100' : ''}`}>
                  <button 
                    className={`btn btn-outline dropdown-toggle ${windowWidth < 768 ? 'w-100' : ''}`}
                    type="button" 
                    data-bs-toggle="dropdown"
                    style={{ 
                      ...transitionStyle,
                      borderColor: "#00c2ff",
                      color: currentTheme.textColor,
                      background: hoverElement === 'sort-btn' ? (isDarkMode ? "rgba(255, 81, 0, 0.2)" : "rgba(0, 0, 0, 0.1)") : "transparent"
                    }}
                    onMouseEnter={() => setHoverElement('sort-btn')}
                    onMouseLeave={() => setHoverElement(null)}
                  >
                    Sort By: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  </button>
                  <ul className="dropdown-menu" style={{ 
                    background: currentTheme.cardBackground, 
                    color: currentTheme.textColor,
                    border: `1px solid ${currentTheme.borderColor}`,
                    width: windowWidth < 768 ? '100%' : 'auto'
                  }}>
                    <li><button className="dropdown-item" onClick={() => handleSort('name')} style={{ color: currentTheme.textColor }}>Name</button></li>
                    <li><button className="dropdown-item" onClick={() => handleSort('price')} style={{ color: currentTheme.textColor }}>Price</button></li>
                    <li><button className="dropdown-item" onClick={() => handleSort('availability')} style={{ color: currentTheme.textColor }}>Availability</button></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cars Grid */}
            {filteredCars.length === 0 ? (
              <p style={{ color: currentTheme.secondaryText, textAlign: 'center', fontSize: '1.2rem' }}>
                No cars match your search criteria.
              </p>
            ) : (
              <div className="row g-4 w-100">
                {currentCars.map(car => (
                  <div key={car.id} className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="card" style={{
                      ...transitionStyle,
                      border: `1px solid ${currentTheme.borderColor}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      background: currentTheme.cardBackground,
                      boxShadow: hoverElement === car.id ? "0 12px 40px rgba(0, 194, 255, 0.5)" : "0 6px 20px rgba(0, 0, 0, 0.15)",
                      transform: hoverElement === car.id ? "translateY(-10px) scale(1.02)" : "none"
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
                            height: "200px",
                            objectFit: "cover",
                            borderBottom: `1px solid ${currentTheme.borderColor}`
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: car.disponible ? 'linear-gradient(135deg, #28a745 0%, #218838 100%)' : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                        }}>
                          {car.disponible ? "Available" : "Booked"}
                        </span>
                      </div>
                      <div className="card-body p-4">
                        <h5 className="card-title mb-3" style={{ 
                          color: currentTheme.secondaryText, 
                          fontWeight: '700',
                          fontSize: '1.25rem'
                        }}>{car.name || "Car Name"}</h5>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            background: "linear-gradient(to right, #00c2ff, #8b5cf6)",
                            WebkitBackgroundClip: "text",
                            color: "transparent"
                          }}>
                            AED {car.price || "N/A"} <span style={{textDecoration:"line-through",color:"#999999",fontSize:"14px"}}>MAD {car.price+50}</span>
                          </span>
                          <small style={{ color: currentTheme.mutedText }}>/ Day</small>
                        </div>
                        <div className="d-flex flex-wrap gap-2 mb-4">
                          <span className="badge" style={{ 
                            background: currentTheme.borderColor, 
                            color: currentTheme.secondaryText,
                            padding: '6px 12px',
                            borderRadius: '12px'
                          }}>
                            <i className="bi bi-speedometer2 me-1"></i> {car.specs || "N/A"}
                          </span>
                          <span className="badge" style={{ 
                            background: currentTheme.borderColor, 
                            color: currentTheme.secondaryText,
                            padding: '6px 12px',
                            borderRadius: '12px'
                          }}>
                            <i className="bi bi-gear me-1"></i> {car.transmission || "N/A"}
                          </span>
                          <span className="badge" style={{ 
                            background: currentTheme.borderColor, 
                            color: currentTheme.secondaryText,
                            padding: '6px 12px',
                            borderRadius: '12px'
                          }}>
                            <i className="bi bi-people me-1"></i> {car.seats || "N/A"} Seats
                          </span>
                          <span className="badge" style={{ 
                            background: currentTheme.borderColor, 
                            color: currentTheme.secondaryText,
                            padding: '6px 12px',
                            borderRadius: '12px'
                          }}>
                            <i className="bi bi-briefcase me-1"></i> {car.luggage || "N/A"} Bags
                          </span>
                        </div>
                        <Link 
                          to={`/car/${car.id}`} 
                          className="btn w-100"
                          style={{
                            background: 'linear-gradient(135deg, #00c2ff, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px',
                            fontWeight: '600',
                            ...transitionStyle,
                            boxShadow: hoverElement === car.id ? "0 8px 25px rgba(0, 194, 255, 0.6)" : "0 4px 15px rgba(0, 194, 255, 0.3)"
                          }}
                        >
                          Rent Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Responsive Pagination */}
            {filteredCars.length > 0 && (
              <nav aria-label="Page navigation" className="my-5">
                <ul className="pagination justify-content-center flex-wrap">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => paginate(currentPage - 1)}
                      style={{
                        background: currentTheme.cardBackground,
                        color: currentTheme.textColor,
                        borderColor: currentTheme.borderColor,
                        ...transitionStyle
                      }}
                      aria-label="Previous page"
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  
                  {getVisiblePageNumbers().map((pageNumber, index) => {
                    if (pageNumber === 'ellipsis1' || pageNumber === 'ellipsis2') {
                      return (
                        <li key={`ellipsis-${index}`} className="page-item disabled">
                          <span 
                            className="page-link"
                            style={{
                              background: currentTheme.cardBackground,
                              color: currentTheme.mutedText,
                              borderColor: currentTheme.borderColor
                            }}
                          >
                            ...
                          </span>
                        </li>
                      );
                    }
                    
                    return (
                      <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => paginate(pageNumber)}
                          style={{
                            background: currentPage === pageNumber ? 'linear-gradient(135deg, #00c2ff, #8b5cf6)' : currentTheme.cardBackground,
                            color: currentPage === pageNumber ? 'white' : currentTheme.textColor,
                            borderColor: currentTheme.borderColor,
                            ...transitionStyle
                          }}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  })}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => paginate(currentPage + 1)}
                      style={{
                        background: currentTheme.cardBackground,
                        color: currentTheme.textColor,
                        borderColor: currentTheme.borderColor,
                        ...transitionStyle
                      }}
                      aria-label="Next page"
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
                
                <div className="text-center mt-3" style={{ color: currentTheme.mutedText }}>
                  <span className="d-block d-sm-inline">
                    Showing {indexOfFirstCar + 1}-{Math.min(indexOfLastCar, filteredCars.length)} of {filteredCars.length} cars
                  </span>
                  <span className="d-block d-sm-inline ms-sm-2 mt-2 mt-sm-0">
                    <button 
                      className="btn btn-sm"
                      onClick={() => setCarsPerPage(windowWidth < 576 ? 2 : (windowWidth < 992 ? 4 : 6))}
                      style={{
                        background: 'transparent',
                        color: currentTheme.secondaryText,
                        border: `1px solid ${currentTheme.borderColor}`,
                        borderRadius: '8px',
                        padding: '4px 8px',
                        ...transitionStyle
                      }}
                    >
                      Reset View
                    </button>
                  </span>
                </div>
              </nav>
            )}
          </div>
        </section>
         </div>
      </div>
      <Footer isDarkMode={isDarkMode} />
    </>
  );
};

export default ShowAll;