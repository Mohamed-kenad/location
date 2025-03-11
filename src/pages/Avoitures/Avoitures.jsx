import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from "sweetalert2";
import Avoiture from "./Avoiture";

export default function Avoitures() {
  const [voitures, setVoitures] = useState([]);
  const [selectVoiture, setSelectVoiture] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of items per page

  useEffect(() => {
    axios.get("https://json-server-api-q84y.onrender.com/voitures")
      .then(res => {
        const sortedVoitures = res.data.sort((a, b) => b.disponible - a.disponible);
        setVoitures(sortedVoitures);
      });
  }, []);

  const deletev = (idv) => {
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
        axios.delete(`https://json-server-api-q84y.onrender.com/voitures/${idv}`)
          .then(() => {
            Swal.fire("Supprimé!", "Le véhicule a été supprimé.", "success");
            setVoitures((data) => data.filter((v) => v.id !== idv));
          });
      }
    });
  };

  const openEditModal = (idv) => {     
    const data = voitures.find((v) => v.id === idv);
    if (data) {
      setSelectVoiture(data);
      setModalMode('edit');
      showModal();
    }
  };

  const openAddModal = () => {
    setSelectVoiture({ disponible: true });
    setModalMode('add');
    showModal();
  };

  const showModal = () => {
    const modalElement = document.getElementById("voitureModal");
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
  };

  const handleSubmit = () => {
    if (modalMode === 'edit') {
      axios.put(`https://json-server-api-q84y.onrender.com/voitures/${selectVoiture.id}`, selectVoiture)
        .then((res) => { 
          setVoitures(prev => prev.map(v => v.id === selectVoiture.id ? res.data : v));
          Swal.fire("Mis à jour!", "Les informations de la voiture ont été modifiées.", "success");
          hideModal();
        });
    } else {
      axios.post("https://json-server-api-q84y.onrender.com/voitures", selectVoiture)
        .then((res) => {
          setVoitures([...voitures, res.data]);
          Swal.fire("Ajouté!", "La voiture a été ajoutée avec succès.", "success");
          hideModal();
        });
    }
  };

  const hideModal = () => {
    const modalElement = document.getElementById("voitureModal");
    if (modalElement) {
      const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.hide();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire('Erreur', 'Le fichier doit être une image!', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Erreur', 'L\'image est trop grande! (Max: 5MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectVoiture({ ...selectVoiture, image: reader.result });
      };
      reader.readAsDataURL(file);  
    }
  };

  const filteredVoitures = voitures.filter((v) => 
    filterAvailable === 'all' || (filterAvailable === 'Disponible' && v.disponible) || (filterAvailable === 'Non disponible' && !v.disponible)
  );

  // Paginate the filtered vehicles
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentVoitures = filteredVoitures.slice(indexOfFirst, indexOfLast);

  // Calculate total pages
  const totalPages = Math.ceil(filteredVoitures.length / itemsPerPage);

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container-fluid min-vh-100 bg-light py-4">
      <div className="row align-items-center bg-white shadow-sm rounded p-4 mb-4">
        <div className="col-12 col-lg-6 mb-3 mb-lg-0">
          <h2 className="h3 fw-bold text-primary mb-0">
            <i className="bi bi-car-front me-2"></i>
            Gestion des Véhicules
          </h2>
        </div>
        <div className="col-12 col-lg-6">
          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-lg-end">
            <select 
              className="form-select form-select-sm" 
              style={{ width: '200px' }}
              value={filterAvailable} 
              onChange={(e) => setFilterAvailable(e.target.value)}
            >
              <option value="all">Tous les véhicules</option>
              <option value="Disponible">Disponible</option>
              <option value="Non disponible">Non disponible</option>
            </select>
            <button className="btn btn-primary btn-sm d-flex align-items-center" onClick={openAddModal}>
              <i className="bi bi-plus-circle me-2"></i>
              Ajouter un véhicule
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead>
                <tr className="bg-light text-center">
                  <th>Image</th>
                  <th>Nom</th>
                  <th>Matricule</th>
                  <th>Modele</th>
                  <th>Disponible</th>
                  <th>Actions </th>
                </tr>
              </thead>
              <tbody>
                {currentVoitures.map((v) => (
                  <Avoiture key={v.id} v={v} openEditModal={openEditModal} deletev={deletev} />
                ))}
              </tbody>
            </table>
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

      <div className="modal fade" id="voitureModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0">
            <div className="modal-header bg-warning border-0">
              <h5 className="modal-title fw-bold text-white">
                <i className="bi bi-car-front me-2"></i>
                {modalMode === 'edit' ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body p-4">
              <form className="needs-validation">
                <div className="row g-3">
                  {modalMode === "edit" && (
                    <div className="col-12">
                      <label className="form-label small text-muted fw-semibold">ID</label>
                      <input type="text" className="form-control bg-light" value={selectVoiture.id || ""} disabled />
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Nom</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Entrez le nom"
                      value={selectVoiture.name || ""} 
                      onChange={(e) => setSelectVoiture({ ...selectVoiture, name: e.target.value })} 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Matricule</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Entrez le matricule"
                      value={selectVoiture.matricule || ""} 
                      onChange={(e) => setSelectVoiture({ ...selectVoiture, matricule: e.target.value })} 
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Modèle</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Entrez le modèle"
                      value={selectVoiture.modele || ""} 
                      onChange={(e) => setSelectVoiture({ ...selectVoiture, modele: e.target.value })} 
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Image</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                    {selectVoiture.image && (
                      <div className="mt-2">
                        <img 
                          src={selectVoiture.image} 
                          alt="preview" 
                          className="img-thumbnail" 
                          style={{ height: '150px', objectFit: 'cover' }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer border-0 bg-light">
              <button type="button" className="btn btn-light fw-semibold" data-bs-dismiss="modal">
                <i className="bi bi-x-circle me-2"></i>
                Annuler
              </button>
              <button type="button" className="btn btn-primary fw-semibold px-4" onClick={handleSubmit}>
                <i className="bi bi-check2-circle me-2"></i>
                {modalMode === 'edit' ? 'Sauvegarder' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
