import React, { useState, useEffect } from 'react';
import Argent from "../../patrimoine-economique/models/possessions/Argent";
import BienMateriel from "../../patrimoine-economique/models/possessions/BienMateriel";
import Flux from "../../patrimoine-economique/models/possessions/Flux";
import Patrimoine from "../../patrimoine-economique/models/Patrimoine";
import Personne from "../../patrimoine-economique/models/Personne";
import data from "../../patrimoine-economique/data/data.json";

export default function App() {
    const [personnes, setPersonnes] = useState([]);
    const [patrimoines, setPatrimoines] = useState([]);
    const [selectedPersonne, setSelectedPersonne] = useState(null);
    const [date, setDate] = useState(new Date());
    const [valeurPatrimoine, setValeurPatrimoine] = useState(0);

    useEffect(() => {
        const loadedPersonnes = data
            .filter(item => item.model === 'Personne')
            .map(item => new Personne(item.data.nom));

        const loadedPatrimoines = data
            .filter(item => item.model === 'Patrimoine')
            .map(item => {
                const possessions = item.data.possessions.map(pos => {
                    if (pos.valeurConstante !== undefined) {
                        return new Flux(
                            pos.possesseur.nom, 
                            pos.libelle, 
                            pos.valeur, 
                            new Date(pos.dateDebut), 
                            new Date(pos.dateFin), 
                            pos.tauxAmortissement, 
                            pos.jour
                        );
                    } else {
                        return new BienMateriel(
                            pos.possesseur.nom, 
                            pos.libelle, 
                            pos.valeur, 
                            new Date(pos.dateDebut), 
                            new Date(pos.dateFin), 
                            pos.tauxAmortissement
                        );
                    }
                });
                return new Patrimoine(item.data.possesseur.nom, possessions);
            });

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
        if (selectedPersonne && patrimoine) {
            const totalValue = patrimoine.getValeur(date);
            setValeurPatrimoine(totalValue.toFixed(2));
        }
    };

    const patrimoine = patrimoines.find(p => p.possesseur === selectedPersonne);

    return (
        <div className="container mt-3">
            <div className="title text-center">
                <h1 className='text-danger'>Patrimoine</h1>
            </div>
            <div className='contain_personne mb-3'>
                <select className='form-control' onChange={handlePersonneChange}>
                    <option>Sélectionner une personne</option>
                    {personnes.map((personne, index) => (
                        <option key={index} value={personne.nom}>{personne.nom}</option>
                    ))}
                </select>
            </div>
            {selectedPersonne && patrimoine && (
                <div className='contain_possession_personne'>
                    <table className='table table-bordered'>
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
                            {patrimoine.possessions.map((possession, index) => (
                                <tr key={index}>
                                    <td>{possession.libelle}</td>
                                    <td>{possession.valeur}</td>
                                    <td>{new Date(possession.dateDebut).toLocaleDateString()}</td>
                                    <td>{new Date(possession.dateFin).toLocaleDateString()}</td>
                                    <td>{possession.tauxAmortissement}</td>
                                    <td>{possession.getValeur(date).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className='date_patrimoine mb-3'>
                <input type="date" className='form-control' onChange={handleDateChange} />
            </div>
            <div className='text-center mt-3'>
                <button className='btn btn-secondary' onClick={handleApplyClick}>Appliquer</button>
                <p>Valeur totale du patrimoine : {valeurPatrimoine} </p>
            </div>
        </div>
    );
}
