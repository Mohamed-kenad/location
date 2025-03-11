import axios from "axios";
import { useEffect, useState } from "react";
import Demande from "./Demande";

export default function Demandes() {
  const [contrats, setContrats] = useState([]);
  const [voitures, setVoitures] = useState([]);
  const [clients, setClients] = useState([]);
  const [voitureselect, setVoitureselect] = useState("");
  const [clientselect, setClientselect] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of items per page

  useEffect(() => {
    axios.get("https://json-server-api-q84y.onrender.com/voitures/")
      .then(res => setVoitures(res.data));

    axios.get("https://json-server-api-q84y.onrender.com/client")
      .then(res => setClients(res.data));
  }, []);

  useEffect(() => {
    const fetchContrats = async () => {
      try {
        const response = await axios.get("https://json-server-api-q84y.onrender.com/contrats");
        const data = response.data.filter(contrat => contrat.statut === "pending");
        const sortedContrats = data.sort((a, b) => new Date(b.datedebut) - new Date(a.datedebut));
        setContrats(sortedContrats);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      }
    };

    fetchContrats();
    // If you don't want to re-fetch on every change of contrats,
    // consider using an empty dependency array instead.
  }, [contrats]);

  const filteredContrats = contrats.filter((c) => {
    const client = clients.find(client => client.id === c.clientId);
    const voiture = voitures.find(voiture => voiture.id === c.voitureId);
    return (
      client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voiture?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentContrats = filteredContrats.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredContrats.length / itemsPerPage);

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const open = (id, type) => {
    const modalElement = document.getElementById("exampleModal");
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();

    document.getElementById("voitureInfo").style.display = "none";
    document.getElementById("clientInfo").style.display = "none";

    if (type === "voiture") {
      const data = voitures.find((v) => v.id === id);
      if (data) {
        setVoitureselect(data);
        document.getElementById("modalTitle").textContent = "Détails Voiture";
        document.getElementById("voitureInfo").style.display = "block";
      }
    }
    if (type === "client") {
      const val = clients.find((c) => c.id === id);
      if (val) {
        setClientselect(val);
        document.getElementById("modalTitle").textContent = "Détails Client";
        document.getElementById("clientInfo").style.display = "block";
      }
    }
  };

  return (
    <>
      <div className="container-fluid min-vh-100 bg-light py-4">
        <div className="row align-items-center bg-white shadow-sm rounded p-4 mb-4">
          <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
            <h2 className="h3 fw-bold text-primary mb-0">
              <i className="bi bi-file-text me-2"></i>
              Gestion des demandes
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
                  className="form-control border-start-0"
                  placeholder="Rechercher ..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
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
                    <th>Date Fin</th>
                    <th>Prix / jour</th>
                    <th>Prix total</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentContrats.map((c) => (
                    <Demande key={c.id} c={c} clients={clients} voitures={voitures} open={open} setContrats={setContrats} />
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
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
