import axios from "axios";
import { useEffect, useState } from "react";
import Ajoutercontrats from "./Ajoutecontrats";
import Contrat from "../contrats/Contrat";

export default function Contrats() {
  const [contrats, setContrats] = useState([]);
  const [voitures, setVoitures] = useState([]);
  const [clients, setClients] = useState([]);
  const [voitureselect, setVoitureselect] = useState("");
  const [clientselect, setClientselect] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    axios.get("https://json-server-api-q84y.onrender.com/voitures/")
      .then(res => setVoitures(res.data))
      .catch(err => console.log(err));
      axios.get("https://json-server-api-q84y.onrender.com/client")
      .then(res => setClients(res.data))
      .catch(err => console.log(err));
  }, []);
  useEffect(() => {
    axios.get("https://json-server-api-q84y.onrender.com/contrats")
      .then(res => {
        const sortedContrats = res.data.sort((a, b) => new Date(b.datedebut) - new Date(a.datedebut));
        setContrats(sortedContrats);
      })
  }, []);


  const filteredContrats = contrats.filter((c) => {
    const client = clients.find(client => client.id === c.clientId);
    const voiture = voitures.find(voiture => voiture.id === c.voitureId);

    const isMatchingSearchTerm = client?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voiture?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const isActive = new Date(c.datefin) >= new Date() && c.statut === "confirmed";
    const isExpired = new Date(c.datefin) < new Date() &&  c.statut === "confirmed";
    const isPending=  c.statut === "pending" ;
    const isCanceled=  c.statut === "canceled" ;

    if (filterStatus === "all") return isMatchingSearchTerm;
    if (filterStatus === "active") return isMatchingSearchTerm && isActive;
    if (filterStatus === "expired") return isMatchingSearchTerm && isExpired;
    if (filterStatus === "pending") return isMatchingSearchTerm && isPending;
    if (filterStatus === "canceled") return isMatchingSearchTerm && isCanceled;
    return false;
  });

  const open = (id, type) => {
    const modalElement = document.getElementById("exampleModal");
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();

    document.getElementById("voitureInfo").style.display = "none";
    document.getElementById("clientInfo").style.display = "none";
    document.getElementById("ajouterContrat").style.display = "none";

    if (type === "voiture") {
      const data = voitures.find((v) => v.id === id);
      setVoitureselect(data);
      document.getElementById("modalTitle").textContent = "Détails Voiture";
      document.getElementById("voitureInfo").style.display = "block";
    }
    if (type === "client") {
      const val = clients.find((c) => c.id === id);
      setClientselect(val);
      document.getElementById("modalTitle").textContent = "Détails Client";
      document.getElementById("clientInfo").style.display = "block";
    }
    if (type === "contrat") {
      document.getElementById("modalTitle").textContent = "Ajouter contrat";
      document.getElementById("ajouterContrat").style.display = "block";
    }
  };



  const closeContractModal = () => {
    document.getElementById("contractModal")?.classList.remove("show");
    document.body.classList.remove("modal-open");
    document.querySelector(".modal-backdrop")?.remove();
};


const [currentPage, setCurrentPage] = useState(1);
const [contractsPerPage] = useState(5);

const indexOfLastContract = currentPage * contractsPerPage;
const indexOfFirstContract = indexOfLastContract - contractsPerPage;
const currentContracts = filteredContrats.slice(indexOfFirstContract, indexOfLastContract);
const totalPages = Math.ceil(filteredContrats.length / contractsPerPage);


const handlePageChange = (action) => {
  if (action === "next" && currentPage < totalPages) {
    setCurrentPage(prev => prev + 1);
  } else if (action === "prev" && currentPage > 1) {
    setCurrentPage(prev => prev - 1);
  }
};

const paginate = (pageNumber) => setCurrentPage(pageNumber);



  return (
    <div className="container-fluid min-vh-100 bg-light py-4">

      {/* Professional Dashboard Header */}
              <div className="row align-items-center bg-white shadow-sm rounded p-4 mb-4">
                <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
                  <h2 className="h3 fw-bold text-primary mb-0">
                    <i className="bi bi-file-text me-2"></i>
                    Gestion des Contrats
                  </h2>
                </div>
                <div className="col-12 col-md-6">
                  <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end align-items-center">
                  <div className="input-group w-100 w-md-auto">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 "
                      placeholder="Rechercher ..."
                      onChange={(e)=>setSearchTerm(e.target.value)}
                    />
                  </div>
                    <select
                      className="form-select form-select-sm w-100 w-md-auto"
                      onChange={(e) => setFilterStatus(e.target.value)}
                      value={filterStatus}
                    >
                      <option value="all">Tous les contrats</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                               
                      <option value="pending">Pending</option>
                      <option value="canceled">Canceled</option>
  
                    </select>
                    <button 
                      className="btn btn-primary btn-sm d-flex align-items-center w-100 w-md-auto"
                      onClick={() => open(null, "contrat")}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Ajouter un contrat
                    </button>
                  </div>
                </div>
              </div>


      {/* Main Content Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
            <thead className="bg-dark text-white text-center">
                <tr className="bg-light text-center">
                  <th>ID Contrat</th>
                  <th>Client</th>
                  <th>Voiture</th>
                  <th>Date Début</th>
                  <th>Date Fin </th>
                  <th>Prix / jour</th>
                  <th>Prix total</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {currentContracts.map((c) => (
                  <Contrat key={c.id} c={c} contrats={contrats} clients={clients} voitures={voitures} open={open} setContrats={setContrats}  />
                ))}
              </tbody>
            </table>
                      {/* Pagination Controls */}
        <div className="d-flex justify-content-center my-3">
        <nav>
          <ul className="pagination">
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            <li className="page-item">
              <button className="page-link">
                {currentPage} / {totalPages}
              </button>
            </li>
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => handlePageChange('next')}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
            


          </div>
        </div>
      </div>




      <div id="exampleModal" className="modal fade" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0">
            <div className="modal-header bg-warning bg-gradient text-white">
              <h5 className="modal-title" id="modalTitle">Détails</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body bg-light p-4">
              <div id="voitureInfo" style={{ display: "none" }}>
                <div className="card border-0 shadow-sm">
                  <div className="row g-0">
                    <div className="col-md-5">
                      <img 
                        id="photo" 
                        src={voitureselect.image} 
                        alt="voiture"
                        className="img-fluid rounded-start h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="col-md-7">
                      <div className="card-body">
                        <h6 className="card-title mb-4">
                          <i className="bi bi-car-front text-warning me-2"></i>
                          Détails du Véhicule
                        </h6>
                        <div className="list-group list-group-flush">
                          <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                            <span className="text-muted">ID</span>
                            <span className="badge bg-light text-dark">{voitureselect.id}</span>
                          </div>
                          <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                            <span className="text-muted">Marque</span>
                            <span className="badge bg-light text-dark">{voitureselect.name}</span>
                          </div>
                          <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                            <span className="text-muted">Matricule</span>
                            <span className="badge bg-light text-dark">{voitureselect.matricule}</span>
                          </div>
                          <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                            <span className="text-muted">Modèle</span>
                            <span className="badge bg-light text-dark">{voitureselect.modele}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="clientInfo" style={{ display: "none" }}>
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-4">
                      <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '60px', height: '60px' }}>
                        <i className="bi bi-person-fill fs-4"></i>
                      </div>
                      <div>
                        <h5 className="mb-1">{clientselect.firstName} {clientselect.lastName}</h5>
                        <small className="text-muted">Client ID: {clientselect.id}</small>
                      </div>
                    </div>

                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="card h-100 border-0 bg-white shadow-sm">
                          <div className="card-body">
                            <h6 className="text-warning mb-3">
                              <i className="bi bi-person-vcard me-2"></i>
                              Information Personnelle
                            </h6>
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">CIN</small>
                              <span className="fw-medium">{clientselect.cin}</span>
                            </div>
                            <div>
                              <small className="text-muted d-block mb-1">Permis</small>
                              <span className="fw-medium">{clientselect.permis}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card h-100 border-0 bg-white shadow-sm">
                          <div className="card-body">
                            <h6 className="text-warning mb-3">
                              <i className="bi bi-info-circle me-2"></i>
                              Contact
                            </h6>
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">
                                <i className="bi bi-telephone-fill me-2"></i>
                                Téléphone
                              </small>
                              <span className="fw-medium">{clientselect.phone}</span>
                            </div>
                            <div className="mb-3">
                              <small className="text-muted d-block mb-1">
                                <i className="bi bi-envelope-fill me-2"></i>
                                Email
                              </small>
                              <span className="fw-medium">{clientselect.email}</span>
                            </div>
                            <div>
                              <small className="text-muted d-block mb-1">
                                <i className="bi bi-geo-alt-fill me-2"></i>
                                Adresse
                              </small>
                              <span className="fw-medium">{clientselect.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="ajouterContrat" style={{ display: "none" }}>
                <Ajoutercontrats 
                  key={contrats.length} 
                  voitures={voitures} 
                  c={clients} 
                  setContrats={setContrats} 
                  closeContractModal={closeContractModal}

                />
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}