import axios from "axios";
import Swal from "sweetalert2";

export default function Demande({ c, clients, voitures, open, setContrats }) {

  const valClient = clients.find((client) => client.id === c.clientId);

  const valVoiture = voitures.find((voiture) => voiture.id === c.voitureId);

  const updateContractStatus = (contractId, newStatus) => {
    
    axios.put(`https://json-server-api-q84y.onrender.com/contrats/${contractId}`, { ...c, statut: newStatus })
      .then(() => {
        Swal.fire(
          newStatus === "confirmed" ? "Confirmed" : "Canceled",
          `Contract has been ${newStatus === "confirmed" ? "confirmed" : "canceled"}!`
        );
     setContrats(prevContrats =>
       prevContrats.map(contract =>contract.id === contractId ? { ...contract, statut: newStatus } : contract)
        );
      });
  };

  return (
    <tr className="text-center">
      <td className="align-middle">{c.id}</td>
      <td className="align-middle">
        <button className="btn btn-link text-primary p-0 text-decoration-none hover:text-primary-dark" onClick={() => open(c.clientId, "client")}>
          <i className="bi bi-person me-1"></i> {valClient?.firstName || "Unknown"}
        </button>
      </td>
      <td className="align-middle">
        <button className="btn btn-link text-primary p-0 text-decoration-none hover:text-primary-dark" onClick={() => open(c.voitureId, "voiture")}>
          <i className="bi bi-car-front me-1"></i> {valVoiture?.name || "Not specified"}
        </button>
      </td>
      <td className="align-middle">{c.datedebut}</td>
      <td className="align-middle">{c.datefin}</td>
      <td className="align-middle">{c.prix} DH / day</td>
      <td className="align-middle">{c.total} DH</td>
      <td className={`align-middle fw-bold ${c.statut === "pending" ? "text-warning" : "text-muted"}`}>
         <><i className="bi bi-clock me-1"></i>Pending</>
      </td>
      <td className="align-middle">  
          
            <button onClick={() => updateContractStatus(c.id, "confirmed")} className="btn btn-success btn-sm me-2">Signée</button>
            <button onClick={() => updateContractStatus(c.id, "canceled")} className="btn btn-danger btn-sm">Cancel</button>

      </td>
    </tr>
  );
}
