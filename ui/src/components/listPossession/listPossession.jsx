import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Argent from "../../../models/possessions/Argent";
import BienMateriel from "../../../models/possessions/BienMateriel";
import Flux from "../../../models/possessions/Flux";
import Patrimoine from "../../../models/Patrimoine";
import Personne from "../../../models/Personne";
import data from "../../../../backend/data/data.json";
import '../App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function PossessionsTable() {
    const [personnes, setPersonnes] = useState([]);
    const [patrimoines, setPatrimoines] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPossession, setSelectedPossession] = useState(null);

    useEffect(() => {
        const loadedPersonnesSet = new Set();
        const loadedPatrimoines = [];

        data.forEach(item => {
            if (item.model === 'Personne') {
                loadedPersonnesSet.add(item.data.nom);
            } else if (item.model === 'Patrimoine') {
                const possesseurNom = item.data.possesseur.nom;
                loadedPersonnesSet.add(possesseurNom);

                const possessions = item.data.possessions.map(pos => {
                    if (pos.valeurConstante !== undefined && pos.valeurConstante != null) {
                        return new Flux(
                            pos.possesseur.nom, 
                            pos.libelle, 
                            pos.valeurConstante,  
                            new Date(pos.dateDebut), 
                            pos.dateFin ? new Date(pos.dateFin) : null, 
                            pos.tauxAmortissement, 
                            pos.jour
                        );
                    } else {
                        return new BienMateriel(
                            pos.possesseur.nom, 
                            pos.libelle, 
                            pos.valeur, 
                            new Date(pos.dateDebut), 
                            pos.dateFin ? new Date(pos.dateFin) : null, 
                            pos.tauxAmortissement
                        );
                    }
                });
                loadedPatrimoines.push(new Patrimoine(possesseurNom, possessions));
            }
        });

        const loadedPersonnes = Array.from(loadedPersonnesSet).map(nom => new Personne(nom));

        setPersonnes(loadedPersonnes);
        setPatrimoines(loadedPatrimoines);
    }, []);

    const handleUpdate = (possession) => {
        setSelectedPossession({ ...possession }); 
        setShowModal(true); 
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3000/api/possessions/${selectedPossession.libelle}`, selectedPossession);
            setShowModal(false);
            const updatedPatrimoines = patrimoines.map(patrimoine => {
                patrimoine.possessions = patrimoine.possessions.map(pos => 
                    pos.libelle === selectedPossession.libelle ? selectedPossession : pos
                );
                return patrimoine;
            });
            setPatrimoines(updatedPatrimoines);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la possession:', error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedPossession(prev => ({
            ...prev,
            [name]: name === 'dateDebut' || name === 'dateFin' ? new Date(value) : value
        }));
    };

    const handleDelete = async (libelle) => {
        try {
            await axios.delete(`http://localhost:3000/api/possessions/${libelle}`);
            const updatedPatrimoines = patrimoines.map(patrimoine => {
                patrimoine.possessions = patrimoine.possessions.filter(pos => pos.libelle !== libelle);
                return patrimoine;
            });
            setPatrimoines(updatedPatrimoines);
        } catch (error) {
            console.error('Erreur lors de la suppression de la possession:', error.message);
        }
    };

    const handleClose = async (libelle) => {
        try {
            const dateFin = new Date().toISOString();
            await axios.put(`http://localhost:3000/api/possessions/${libelle}/close`, { dateFin });
            const updatedPatrimoines = patrimoines.map(patrimoine => {
                patrimoine.possessions = patrimoine.possessions.map(pos => {
                    if (pos.libelle === libelle) {
                        return {
                            ...pos,
                            dateFin: new Date()
                        };
                    }
                    return pos;
                });
                return patrimoine;
            });
            setPatrimoines(updatedPatrimoines);
        } catch (error) {
            console.error('Erreur lors de la fermeture de la possession:', error.message);
        }
    };

    const calculateCurrentValue = (possession) => {
        const now = new Date();
        const start = new Date(possession.dateDebut);
        const end = possession.dateFin ? new Date(possession.dateFin) : now;
    
        if (possession.valeurConstante != null) {
            const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
            const value = possession.valeur * Math.max(months, 0);
            return value.toFixed(2);
        }
    
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
        const rate = possession.tauxAmortissement / 100;
        const value = possession.valeur * Math.pow((1 - rate), years);
    
        return value.toFixed(2);
    };
    

    
    
    
    

    return (
        <div className="container mt-lg-5">
            <div className="text-center mb-4">
                <h1 className="display-4 text-center text-danger mt-4 mb-4">Liste des Possessions</h1>
            </div>
            <div className="container-flex">
                <div className="table-container">
                    {personnes.map((personne, index) => {
                        const patrimoine = patrimoines.find(p => p.possesseur === personne.nom);
                        return patrimoine ? (
                            <div key={index} className="mb-5">
                                <h3 className="mb-3">{personne.nom}</h3>
                                <div className="table-responsive">
                                    <table className="table table-modern">
                                        <thead>
                                            <tr>
                                                <th>Libelle</th>
                                                <th>Valeur Initiale</th>
                                                <th>Date Début</th>
                                                <th>Date Fin</th>
                                                <th>Taux d'Amortissement (%)</th>
                                                <th>Valeur Actuelle</th> 
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            
                                            {patrimoine.possessions.map((possession, index) => (
                                                
                                                <tr key={index}>
                                                    <td>{possession.libelle}</td>
                                                    <td>{possession.valeurConstante !== undefined ? possession.valeurConstante + " Ar" : possession.valeur + " Ar"}</td>
                                                    <td>{new Date(possession.dateDebut).toLocaleDateString()}</td>
                                                    <td>{possession.dateFin ? new Date(possession.dateFin).toLocaleDateString() : "non spécifiée"}</td>
                                                    <td>{possession.tauxAmortissement !== null ? possession.tauxAmortissement : 0}</td>
                                                    <td>{calculateCurrentValue(possession)} Ar</td> 
                                                    <td>
                                                        <i className="fas fa-edit text-primary mx-2" style={{ cursor: 'pointer' }} onClick={() => handleUpdate(possession)}></i>
                                                        <i className="fas fa-close text-bg-dark pe-1 rounded mx-2" style={{ cursor: 'pointer' }} onClick={() => handleClose(possession.libelle)}></i>
                                                        <i className="fas fa-trash text-secondary mx-2" style={{ cursor: 'pointer' }} onClick={() => handleDelete(possession.libelle)}></i>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : null;
                    })}
                </div>
                {showModal && (
                    <>
                        <div className="overlay" onClick={() => setShowModal(false)}></div>
                        <div className="form-container">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Modifier la Possession</h5>
                                    <button type="button" className="close" onClick={() => setShowModal(false)}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleUpdateSubmit}>
                                        <div className="form-group">
                                            <label>Libelle</label>
                                            <input type="text" className="form-control" name="libelle" value={selectedPossession.libelle || ''} onChange={handleInputChange} readOnly/>
                                        </div>
                                        <div className="form-group">
                                            <label>Nouveau nom de libelle</label>
                                            <input type="text" placeholder="optionnelle" className="form-control" name="nouveauLibelle" value={selectedPossession.nouveauLibelle || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Valeur</label>
                                            <input type="number" className="form-control" name="valeur" value={selectedPossession.valeur || ''} onChange={handleInputChange} readOnly/>
                                        </div>
                                        <div className="form-group">
                                            <label>Date Début</label>
                                            <input type="date" className="form-control" name="dateDebut" value={selectedPossession.dateDebut ? selectedPossession.dateDebut.toISOString().split('T')[0] : ''} onChange={handleInputChange} readOnly/>
                                        </div>
                                        <div className="form-group">
                                            <label>Date Fin</label>
                                            <input type="date" className="form-control" name="dateFin" value={selectedPossession.dateFin ? selectedPossession.dateFin.toISOString().split('T')[0] : ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Taux d'Amortissement (%)</label>
                                            <input type="number" className="form-control" name="tauxAmortissement" value={selectedPossession.tauxAmortissement || ''} onChange={handleInputChange} readOnly/>
                                        </div>
                                        <button type="submit" className="btn btn-primary mt-lg-3">Sauvegarder</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
