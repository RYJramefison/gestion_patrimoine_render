import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditPossession = () => {
  const { libelle } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    libelle: '',
    valeur: '',
    dateDebut: '',
    dateFin: '',
    taux: '',
    valeurConstante: '',
    jour: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/possessions/${libelle}`)
      .then(response => {
        setFormData(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération de la possession:', error);
        setError('Erreur lors de la récupération de la possession.');
      });
  }, [libelle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`/api/possessions/${libelle}`, formData)
      .then(response => {
        console.log('Possession mise à jour:', response.data);
        navigate('/');
      })
      .catch(error => {
        console.error('Erreur lors de la mise à jour de la possession:', error);
        setError('Erreur lors de la mise à jour de la possession.');
      });
  };

  return (
    <div className="container mt-4">
      <h2>Modifier la Possession</h2>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="libelle" className="form-label">Libelle</label>
          <input
            type="text"
            id="libelle"
            name="libelle"
            className="form-control"
            value={formData.libelle}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="valeur" className="form-label">Valeur</label>
          <input
            type="number"
            id="valeur"
            name="valeur"
            className="form-control"
            value={formData.valeur}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="dateDebut" className="form-label">Date Début</label>
          <input
            type="date"
            id="dateDebut"
            name="dateDebut"
            className="form-control"
            value={formData.dateDebut}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="dateFin" className="form-label">Date Fin</label>
          <input
            type="date"
            id="dateFin"
            name="dateFin"
            className="form-control"
            value={formData.dateFin || ''}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="taux" className="form-label">Taux d'Amortissement (%)</label>
          <input
            type="number"
            id="taux"
            name="taux"
            className="form-control"
            value={formData.taux}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="valeurConstante" className="form-label">Valeur Constante</label>
          <input
            type="number"
            id="valeurConstante"
            name="valeurConstante"
            className="form-control"
            value={formData.valeurConstante}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="jour" className="form-label">Jour</label>
          <input
            type="number"
            id="jour"
            name="jour"
            className="form-control"
            value={formData.jour}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">Enregistrer</button>
      </form>
    </div>
  );
};

export default EditPossession;
