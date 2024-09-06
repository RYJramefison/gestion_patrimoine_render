import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LineChartComponent from '../chart/chart'; 
import '../App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Argent from "../../../models/possessions/Argent";
import BienMateriel from "../../../models/possessions/BienMateriel";
import Flux from "../../../models/possessions/Flux";
import Patrimoine from "../../../models/Patrimoine";
import Personne from "../../../models/Personne";
import data from "../../../../backend/data/data.json";

export default function PatrimoineList() {
    const [personnes, setPersonnes] = useState([]);
    const [patrimoines, setPatrimoines] = useState([]);
    const [selectedPersonne, setSelectedPersonne] = useState(null);
    const [date, setDate] = useState(new Date());
    const [valeurPatrimoine, setValeurPatrimoine] = useState(0);
    const [showChart, setShowChart] = useState(false);
    const navigate = useNavigate();

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

    const handlePersonneChange = (e) => {
        const selected = e.target.value;
        setSelectedPersonne(selected);
    };

    const handleDateChange = (e) => {
        setDate(new Date(e.target.value));
    };

    const handleApplyClick = () => {
        if (selectedPersonne) {
            const patrimoine = patrimoines.find(p => p.possesseur === selectedPersonne);
            if (patrimoine) {
                const totalValue = patrimoine.getValeur(date);
                setValeurPatrimoine(totalValue.toFixed(2));
                setShowChart(true);
            } else {
                setValeurPatrimoine(0);
                setShowChart(false);
            }
        }
    };

    const patrimoine = patrimoines.find(p => p.possesseur === selectedPersonne);

    return (
        <div className="container mt-4">
            <div className="text-center mb-4">
                <h1 className="text-danger">Patrimoine</h1>
            </div>
            <div className="form-group mb-4">
                <label htmlFor="personneSelect" className="form-label">Sélectionner une personne</label>
                <select id="personneSelect" className="form-control" onChange={handlePersonneChange}>
                    <option value="">Sélectionner une personne</option>
                    {personnes.map((personne, index) => (
                        <option key={index} value={personne.nom}>{personne.nom}</option>
                    ))}
                </select>
            </div>
            {selectedPersonne && patrimoine && (
                <div className="table-responsive mb-4">
                    <table className="table table-modern">
                        <thead>
                            <tr>
                                <th>Libelle</th>
                                <th>Valeur Initiale</th>
                                <th>Date Début</th>
                                <th>Date Fin</th>
                                <th>Taux d'Amortissement (%)</th>
                                <th>Valeur Actuelle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patrimoine.possessions.map((possession, index) => {
                                const isDateFinBeforeOrEqual = possession.dateFin && possession.dateFin <= date;
                                const isDateDebutGreaterThanSelectedDate = possession.dateDebut > date;
                                
                                let valeurActuelle;

                                if (isDateFinBeforeOrEqual) {
                                    // Get last known value before dateFin
                                    const lastKnownDate = new Date(possession.dateFin);
                                    valeurActuelle = possession.getValeur(lastKnownDate);
                                } else if (isDateDebutGreaterThanSelectedDate) {
                                    valeurActuelle = 0;
                                } else {
                                    valeurActuelle = possession.getValeur(date);
                                }

                                return (
                                    <tr key={index}>
                                        <td>{possession.libelle}</td>
                                        <td>{possession.valeurConstante !== undefined ? possession.valeurConstante + " Ar" : possession.valeur + " Ar"}</td>
                                        <td>{new Date(possession.dateDebut).toLocaleDateString()}</td>
                                        <td>{possession.dateFin ? new Date(possession.dateFin).toLocaleDateString() : "non spécifiée"}</td>
                                        <td>{possession.tauxAmortissement !== null ? possession.tauxAmortissement : 0}</td>
                                        <td>{valeurActuelle.toFixed(2)} Ar</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="form-group mb-4">
                <label htmlFor="datePicker" className="form-label">Choisir une date</label>
                <input id="datePicker" type="date" className="form-control" onChange={handleDateChange} />
            </div>
            <div className="text-center">
                <button className="btn btn-dark" onClick={handleApplyClick}>Appliquer</button>
                <p className="mt-4 text-secondary">Valeur totale du patrimoine : {valeurPatrimoine} Ar</p>
            </div>
            
            {showChart && (
                <div className="mb-4">
                    <h3 className="text-center">Graphique de patrimoine</h3>
                    <LineChartComponent 
                        possessions={patrimoine ? patrimoine.possessions : []} 
                    />
                </div>
            )}
        </div>
    );
}
