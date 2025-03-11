import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";
import Swal from "sweetalert2";
import axios from "axios";

export default function Sidebar() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [num, setNum] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(()=>{
    const fetchContrats = async () => {
      try {
         await axios.get("https://json-server-api-q84y.onrender.com/contrats?statut=pending")
     .then((res)=>setNum(res.data.length) )}
      catch (error) {
        console.log(error);
      }
    }
    fetchContrats()
  },[])


  const user = useSelector((state) => state.user.user);
  const isLoggedIn = !!user;

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log me out!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch({ type: "LOGOUT" });
        navigate("/");
      }
    });
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const getNavLinkClass = (path) => {
    return location.pathname === path ? "nav-item active" : "nav-item";
  };

  return (
    <div className={`sidebar ${sidebarExpanded ? "expanded" : ""}`} id="sidebar">
      <button className="toggle-btn" onClick={toggleSidebar}>
        <i className={`bi ${sidebarExpanded ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
      </button>
      
      { isLoggedIn && (
       
          <div className="text-center mb-4 profile-section">
            <div className="profile-card  p-3 rounded">
              <img
                src={user.avatar }
                alt="Admin"
                className="profile-img rounded-circle mb-2 img-fluid"
                width="100"
                height="100"
                />
              <h6 className="mb-1 text-truncate">-------</h6>
              <span className="badge bg-primary">{user.role}</span>
            </div>
          </div>
               
        )}


      <div className="nav-links">
        <Link className={getNavLinkClass("/dashboard")} to="/dashboard">
          <i className="bi bi-house-door-fill"></i>
          <span>Dashboard</span>
        </Link>
        <Link className={getNavLinkClass("/Avoitures")} to="/Avoitures">
          <i className="bi bi-car-front-fill"></i>
          <span>Voitures</span>
        </Link>
        <Link className={getNavLinkClass("/contrats")} to="/contrats">
          <i className="bi bi-clipboard2-check-fill"></i>
        <span>Contrats</span>
        </Link>
        <Link className={getNavLinkClass("/clients")} to="/clients">
          <i className="bi bi-person-fill"></i>
          <span>Clients</span>
        </Link>
        <Link className={getNavLinkClass("/demandes")} to="/demandes">
          <i className="bi bi-bell-fill fs-3 ">
          {num!==0?<strong className="badge bg-danger position-absolute translate-middle rounded-circle">{num}</strong>:""}
          </i>
          <span>demandes</span>
        </Link>
      </div>

     
      <div className="sidebar-footer">
        <Link className="nav-item text-white" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
}
