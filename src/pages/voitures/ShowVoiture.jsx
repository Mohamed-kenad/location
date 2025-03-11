import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Footer } from "./Voitures";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    axios
      .get(`https://json-server-api-q84y.onrender.com/voitures/${id}`)
      .then((res) => setCar(res.data))
      .catch((err) => console.error(err));
          // Fetch contracts
    axios
    .get("https://json-server-api-q84y.onrender.com/contrats")
    .then((res) => setContracts(res.data))
    .catch((err) => console.error(err));
  }, [id]);

  const getTimeUntilAvailable = (carId) => {
    const now = new Date();

    const carContracts = contracts
      .filter(
        (contract) =>
          contract.voitureId === carId &&
          contract.statut === "confirmed" &&
          new Date(contract.datefin) > now
      )
      .sort((a, b) => new Date(a.datefin) - new Date(b.datefin)); 

    if (carContracts.length > 0) {
      const nextContract = carContracts[0];
      const endDate = new Date(nextContract.datefin);
      const timeLeft = endDate - now;
      const daysLeft = Math.ceil((timeLeft / (1000 * 3600 * 24)));
      return daysLeft;
    }

    return  0; 
  };
  
  if (!car) {
    return (
      <div className="text-center py-5 my-5">
        <span className="spinner-border text-primary" role="status"></span>
        <p>Loading...</p>
      </div>
    );
  }
  const availabilityText = getTimeUntilAvailable(car.id);

  return (
    <>
    <div className="d-flex flex-column min-vh-100">
      <div style={{ paddingTop: '50px' }} className="container d-inline">
        <button className="btn btn-outline-primary mb-4" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Back
        </button>

        <div className="row g-4 mb-5">
        <div className="col-md-6 position-relative overflow-hidden">
            <img
              src={car.image}
              className="img-fluid rounded shadow-lg transition-all duration-300 hover:scale-105"
              alt={car.name}
              style={{
                objectFit: "cover",
                borderRadius: "16px", 
                maxHeight: "400px",
                width: "100%",
              }}
            />
            <span 
              style={{
                position: 'absolute',
                top: '15px',  
                left: '20px',
                background: car.disponible 
                  ? 'linear-gradient(135deg, #34C759 0%, #28A745 100%)' 
                  : 'linear-gradient(135deg, #FF4444 0%, #DC3545 100%)', 
                color: 'white',
                padding: '6px 18px', 
                borderRadius: '25px', 
                fontWeight: '500', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)', 
                transition: 'all 0.3s ease', 
              }}
            >
              {car.disponible ? "Disponible" : "Non Disponible"}
            </span>
            {availabilityText !== 0 ?
            <div 
              className="position-absolute bottom-0 start-50 translate-middle-x mb-4 w-100"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '8px 15px',
                
              }}
            >

              <p 
                className="mb-0 text-white text-center"
                style={{
                  fontSize: '1rem',
                  fontWeight: '400',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)', 
                }}
              >
                 Available in {availabilityText} day (s)  
              </p>
            </div>:""
        }
          </div>

          <div className="col-md-6 my-auto px-5">
            <h1 className="text-primary fw-bold">{car.name}</h1>
            <p className="text-muted mb-4">{car.description}</p>

            <ul className="list-group list-group-flush mb-4">
              <li className="list-group-item">
                <i className="bi bi-calendar-check me-2 text-primary"></i>
                <strong>Model:</strong> {car.modele}
              </li>
              <li className="list-group-item">
                <i className="bi bi-people me-2 text-primary"></i>
                <strong>Seats:</strong> {car.seats}
              </li>
              <li className="list-group-item">
                <i className="bi bi-gear me-2 text-primary"></i>
                <strong>Transmission:</strong> {car.transmission}
              </li>
              <li className="list-group-item">
                <i className="bi bi-fuel-pump me-2 text-primary"></i>
                <strong>Fuel Type:</strong> {car.fuelType}
              </li>
            </ul>

            <h3 className="text-success fw-bold mb-3">${car.price} / Day</h3>

            <Link className="btn btn-lg btn-primary w-100 mt-3 rounded-pill shadow-sm" to="/rent" state={{ rent: car , date: availabilityText }} >
              <i className="bi bi-cart-check me-2"></i> Rent Now
            </Link>
          </div>
        </div>
        </div>
      <Footer />
      </div>


    </>
  );
};

export default CarDetails;
