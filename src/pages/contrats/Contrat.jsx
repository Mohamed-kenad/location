import React, { useEffect, useState } from "react";
import axios from "axios";
// import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";

export default function Contrat({ c, clients, voitures, contrats, open,setContrats }) {
  const [status, setStatus] = useState(""); 
  const [selectedMonth, setSelectedMonth] = useState(""); 
  const location = useLocation();
  
  const valClient = clients.find((client) => client.id === c.clientId);
  const valVoiture = voitures.find((voiture) => voiture.id === c.voitureId);

  const isActive = (endDate) => new Date(endDate) >= new Date();

  useEffect(() => {
    if (c.statut === "pending") {
      setStatus("Pending"); 
    } else if (c.statut === "canceled") {
      setStatus("Canceled");  
    } else {
      setStatus(isActive(c.datefin) ? "Active" : "Expired"); 
    }
  }, [c.datefin, c.statut]);

  useEffect(() => {
    if (voitures.length > 0 && contrats.length > 0) {
      voitures.forEach((car) => {
        const voitureContrats = contrats.filter((contrat) => contrat.voitureId === car.id);

        const hasActiveConfirmedContract = voitureContrats.some((contrat) => isActive(contrat.datefin) && contrat.statut === "confirmed");

        const isAvailable = !hasActiveConfirmedContract;

        if (isAvailable !== car.disponible) {
          const updatedCar = { ...car, disponible: isAvailable };
          axios.put(`https://json-server-api-q84y.onrender.com/voitures/${updatedCar.id}`, updatedCar);
        }
      });
    } else {
      console.log("Data not found");
    }
  }, [voitures, contrats]);

  // const updateContractStatus = (contractId, newStatus) => {
  //   axios.put(`https://json-server-api-q84y.onrender.com/contrats/${contractId}`, { ...c, statut: newStatus })
  //     .then(() => {
  //       Swal.fire(
  //         newStatus === "confirmed" ? "Confirmed" : "Canceled",
  //         `Contract has been ${newStatus === "confirmed" ? "confirmed" : "canceled"}!`
  //       );
  //    setContrats(prevContrats =>
  //      prevContrats.map(contract =>contract.id === contractId ? { ...contract, statut: newStatus } : contract)
  //       );
  //     });
  // };

  
  useEffect(() => {
    if (location.state?.selectedMonth) {

      setSelectedMonth(location.state.selectedMonth);
    }
  }, [location.state]); 


  const navigateFromDashboard = location.state?.fromRentalDashboard;


  if (navigateFromDashboard && (c.statut === "pending" || c.statut === "canceled")) {
    return null;
  }
  
  const getContractMonth = (date) => {
    if (!date) return null; 
    const contractDate = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[contractDate.getMonth()];
  };

  const filterByMonth = selectedMonth 
  ? getContractMonth(c.datedebut) === selectedMonth 
  : true;



  return (
    <>
    {filterByMonth && (
    <tr className="text-center">
      <td className="align-middle">{c.id}</td>
      <td className="align-middle">
        <button
          className="btn btn-link text-primary p-0 text-decoration-none hover:text-primary-dark"
          onClick={() => open(c.clientId, "client")}
        >
          <i className="bi bi-person me-1"></i>
          {valClient?.firstName || "Unknown"}
        </button>
      </td>
      <td className="align-middle">
        <button
          className="btn btn-link text-primary p-0 text-decoration-none hover:text-primary-dark"
          onClick={() => open(c.voitureId, "voiture")}
        >
          <i className="bi bi-car-front me-1"></i>
          {valVoiture?.name || "Not specified"}
        </button>
      </td>
      <td className="align-middle">{c.datedebut}</td>
      <td className="align-middle">{c.datefin}</td>
      <td className="align-middle">{c.prix} DH / day</td>
      <td className="align-middle">{c.total} DH</td>
      <td
        className={`align-middle fw-bold ${
          status === "Active" ? "text-success" :
          status === "Canceled" ? "text-danger" :
          status === "Pending" ? "text-warning" : "text-muted"
        }`}
      >
        {status === "Pending" && <><i className="bi bi-clock me-1"></i>{status}</>}
        {status === "Canceled" && <><i className="bi bi-x-circle me-1"></i>{status}</>}
        {status === "Active" && <><i className="bi bi-check-circle me-1"></i>{status}</>}
        {status === "Expired" && <><i className="bi bi-hourglass me-1"></i>{status}</>}
      </td>
      {/* <td className="align-middle">
        {c.statut === "pending" && (
          <>
            <button onClick={() => updateContractStatus(c.id, "confirmed")} className="btn btn-success btn-sm me-2">signée</button>
            <button onClick={() => updateContractStatus(c.id, "canceled")} className="btn btn-danger btn-sm">Cancel</button>
          </>
        )}
      </td> */}
    </tr>
  )}
  </>
    
  );

}
