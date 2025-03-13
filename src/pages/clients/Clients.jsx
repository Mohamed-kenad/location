import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import Swal from "sweetalert2";
import axios from 'axios';
import Client from './Client';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState([]);
  const [modalMode, setModalMode] = useState('add');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);  
  const [clientsPerPage] = useState(5);  
  const location = useLocation();
  const { state } = location;

  const hideModal = () => {
    const modalElement = document.getElementById("clientModal");
    if (modalElement) {
      const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.hide();
    }
  };

  const showModal = () => {
    const modalElement = document.getElementById("clientModal");
    if (modalElement) {
      const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  };

  useEffect(() => {
    axios.get("https://json-server-api-q84y.onrender.com/client")
      .then((res) => { setClients(res.data) });
  }, []);

  useEffect(()=>{
    if (state?.showModal) {
      setModalMode('add');
      showModal();
    }
  },[state])



  const deleteClient = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !"
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`https://json-server-api-q84y.onrender.com/client/${id}`)
          .then(() => {
            Swal.fire("Supprimé!", "Le client a été supprimé.", "success");
            setClients((data) => data.filter((client) => client.id !== id));
          });
      }});
  };

  const openEditModal = (id) => {
    const client = clients.find((c) => c.id === id);
    if (client) {
      setSelectedClient(client);
      setModalMode('edit');
      showModal();
    }
  };

  const openAddModal = () => {
    setSelectedClient([]);
    setModalMode('add');
    showModal();
  };



 
  const handleSubmit = () => {
    if (modalMode === 'edit') {
      axios.put(`https://json-server-api-q84y.onrender.com/client/${selectedClient.id}`, selectedClient)
        .then((res) => {
          setClients((data) => data.map((client) => client.id === selectedClient.id ? res.data : client));
          Swal.fire("Mis à jour!", "Les informations de client ont été modifiées.", "success");
          hideModal();
        });
    } else {
      axios.post("https://json-server-api-q84y.onrender.com/client", selectedClient)
        .then((res) => {
          setClients((prevClients) => [...prevClients, res.data]);
          Swal.fire("Ajouté!", "Le client a été ajoutée avec succès.", "success");
          hideModal();
        });
    }
  };



  const filterClient= clients.filter((c)=>
    c.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.lastName.toLowerCase().includes(search.toLowerCase()) ||
    c.cin.toLowerCase().includes(search.toLowerCase())
  
  
  )

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filterClient.slice(indexOfFirstClient, indexOfLastClient);

  const totalPages = Math.ceil(filterClient.length / clientsPerPage);

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light py-4">
      {/* Professional Dashboard Header */}
      <div className="row align-items-center bg-white shadow-sm rounded p-4 mb-4">
        <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
          <h2 className="h3 fw-bold text-dark mb-0">
            <i className="bi bi-people me-2 text-primary"></i>
            Gestion des Clients
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
                className="form-control border-start-0 ps-0"
                placeholder="Rechercher un client..."
                onChange={(e)=>setSearch(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-primary d-flex align-items-center w-100 w-md-auto "
              onClick={openAddModal}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Ajouter un client
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="bg-primary text-white">
                <tr className="text-center">
                  <th className="py-3">ID</th>
                  <th className="py-3">Prénom</th>
                  <th className="py-3">Nom</th>
                  <th className="py-3">CIN</th>
                  <th className="py-3">Permis</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Téléphone</th>
                  <th className="py-3">Adresse</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentClients.map((client) => (
                  <Client 
                  key={client.id}
                    c={client} 
                    open={openEditModal} 
                    deleteClient={deleteClient}
                  />
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

      {/* Client Modal */}
      <div id="clientModal" className="modal fade" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                {modalMode === 'edit' ? 'Modifier Client' : 'Nouveau Client'}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body bg-light p-4">
              <form className="row g-3">
                {modalMode === 'edit' && (
                  <div className="col-12">
                    <label className="form-label small fw-semibold">ID Client</label>
                    <input 
                      type="text" 
                      className="form-control bg-light" 
                      value={selectedClient.id || ''} 
                      disabled 
                    />
                  </div>
                )}
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Prénom</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={selectedClient.firstName || ''} 
                    onChange={(e) => setSelectedClient({ 
                      ...selectedClient, 
                      firstName: e.target.value 
                    })} 
                    placeholder="Entrer le prénom"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Nom</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={selectedClient.lastName || ''} 
                    onChange={(e) => setSelectedClient({ 
                      ...selectedClient, 
                      lastName: e.target.value 
                    })} 
                    placeholder="Entrer le nom"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">CIN</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={selectedClient.cin || ''} 
                    onChange={(e) => setSelectedClient({ 
                      ...selectedClient, 
                      cin: e.target.value 
                    })} 
                    placeholder="Entrer le numéro CIN"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Permis</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={selectedClient.permis || ''} 
                    onChange={(e) => setSelectedClient({ 
                      ...selectedClient, 
                      permis: e.target.value 
                    })} 
                    placeholder="Entrer le numéro de permis"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={selectedClient.email || ''} 
                    onChange={(e) => setSelectedClient({ 
                      ...selectedClient, 
                      email: e.target.value 
                    })} 
                    placeholder="Entrer l'adresse email"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Téléphone</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    value={selectedClient.phone || ''} 
                    onChange={(e) => setSelectedClient({ 
                      ...selectedClient, 
                      phone: e.target.value 
                    })} 
                    placeholder="Entrer le numéro de téléphone"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Adresse</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={selectedClient.address || ''} 
                    onChange={(e) => setSelectedClient({ 
                      ...selectedClient, 
                      address: e.target.value 
                    })} 
                    placeholder="Entrer l'adresse"
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer bg-light">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                data-bs-dismiss="modal"
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSubmit}
              >
                {modalMode === 'edit' ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;