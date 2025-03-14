import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Footer } from './Voitures';
import axios from 'axios';
import Swal from 'sweetalert2';

const TrackingPage = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); 
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));

      if (!loggedInUser) {
        Swal.fire({
          title: "Authentication Required",
          text: "Please log in to track your reservations.",
          icon: "warning",
          confirmButtonText: "Go to Login",
          confirmButtonColor: "#007bff",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/login");
          }
        });
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`https://json-server-api-q84y.onrender.com/contrats`);

        const today = new Date();
        const filteredReservations = response.data.filter((c) =>c.clientId === loggedInUser.id &&
        ["pending", "confirmed", "canceled"].includes(c.statut) && new Date(c.datefin) >= today )
        .sort((a, b) => new Date(b.datedebut) - new Date(a.datedebut))

        
          const contractId = location.state?.id;
          console.log("Received contract id:", contractId);
          if (contractId) {
            const contractToShow = filteredReservations.filter(
              (c) =>  c.id.toString() === contractId.toString()
            );
            setReservations(contractToShow);
            console.log(contractToShow);
          } else {
            setReservations(filteredReservations);
          }

        const carsResponse = await axios.get(`https://json-server-api-q84y.onrender.com/voitures`);
        
        setCars(carsResponse.data);

      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire({
          title: "Oops!",
          text: "We couldn’t fetch your reservations. Please try again later.",
          icon: "error",
          confirmButtonColor: "#dc3545",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [navigate]);

  return (
    <div className="d-flex flex-column max-vh-100 w-100 bg-light ">
      <main className="flex-grow-1 container d-inline py-5 mb-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fs-2 fw-bold text-dark">Track Your Rentals</h1>
          <button
            className="btn btn-outline-dark rounded-pill px-4"
            onClick={() => navigate("/")}
          >
            <i className="bi bi-arrow-left me-2"></i>Back
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Fetching your reservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-car-front text-muted" style={{ fontSize: '4rem' }}></i>
            <p className="mt-3 text-muted fs-5">No active reservations found.</p>
            <button
              className="btn btn-primary mt-2"
              onClick={() => navigate('/')}
            >
              Rent a Car Now
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {reservations.map((res, index) => {
              const car = cars.find((c) => c.id === res.voitureId);
              return (
                <div key={index} className="col-12 col-md-6 col-lg-4">
                  <div className="card border-0 shadow h-100 transition-hover">
                    <img
                      src={car?.image || "/placeholder.svg"}
                      alt={car?.modele || "Car Image"}
                      className="card-img-top rounded-top-3 object-fit-cover"
                      style={{ height: "180px" }}
                    />
                    <div className="card-body p-4">
                      <h2 className="fs-5 fw-semibold text-dark mb-3">
                        {car?.modele || "Unknown Model"}
                      </h2>
                      <p className="mb-2 text-muted">
                        <strong>Start:</strong>{" "}
                        {new Date(res.datedebut).toLocaleDateString()}
                      </p>
                      <p className="mb-2 text-muted">
                        <strong>End:</strong>{" "}
                        {new Date(res.datefin).toLocaleDateString()}
                      </p>
                      <p className="mb-3 text-muted">
                        <strong>Total:</strong> ${res.total.toFixed(2)}
                      </p>
                      <span
                        className={`badge text-white px-3 py-2 rounded-pill ${
                          res.statut === "pending"
                            ? "bg-warning"
                            : res.statut === "confirmed"? "bg-success" :
                            res.statut === "canceled" ?"bg-danger":""

                        }`}
                      >
                        {res.statut.charAt(0).toUpperCase() + res.statut.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <div className='mt-5'>

      <Footer />
      </div>
    </div>
  );
};

export default TrackingPage;