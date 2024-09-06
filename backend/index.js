import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import Patrimoine from '../ui/models/Patrimoine.js';
import Possession from '../ui/models/possessions/Possession.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, './data/data.json');

const loadData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error.message);
    return [];
  }
};

const saveData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Données sauvegardées avec succès.');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données:', error.message);
  }
};

const initializeData = () => {
  const jsonData = loadData();
  const patrimoines = {};

  jsonData.forEach((entry) => {
    if (entry.model === 'Patrimoine') {
      const possesseurNom = entry.data.possesseur.nom;
      const possessions = entry.data.possessions.map((p) => {
        const possession = new Possession(
          p.possesseur.nom,
          p.libelle,
          p.valeur,
          new Date(p.dateDebut),
          p.dateFin ? new Date(p.dateFin) : null,
          p.tauxAmortissement
        );

        if (p.valeurConstante !== undefined) {
          possession.valeurConstante = p.valeurConstante;
        }
        if (p.jour !== undefined) {
          possession.jour = p.jour;
        }

        return possession;
      });

      patrimoines[possesseurNom] = new Patrimoine(possesseurNom, possessions);
    }
  });

  return patrimoines;
};

const patrimoines = initializeData();
const app = express();
app.use(express.json());
app.use(cors());

// Endpoint pour obtenir toutes les possessions
app.get('/api/possessions', (req, res) => {
  const allPossessions = [];
  for (const patrimoine of Object.values(patrimoines)) {
    allPossessions.push(...patrimoine.possessions);
  }
  res.json(allPossessions);
});


// Endpoint pour obtenir une possession par libellé
app.get('/api/possessions/:libelle', (req, res) => {
  const { libelle } = req.params;
  let possessionTrouvee = null;

  for (const patrimoine of Object.values(patrimoines)) {
    if (Array.isArray(patrimoine.possessions)) {
      possessionTrouvee = patrimoine.possessions.find(p => p.libelle === libelle);
      if (possessionTrouvee) {
        break;
      }
    }
  }

  if (possessionTrouvee) {
    res.json(possessionTrouvee);
  } else {
    res.status(404).send('Possession non trouvée');
  }
});


// Endpoint pour obtenir toutes les personnes
app.get('/api/personnes', (req, res) => {
  const personnes = Object.keys(patrimoines).map(nom => ({ nom }));
  res.json(personnes);
});

// Endpoint pour créer une nouvelle possession
app.post('/api/possessions', (req, res) => {
  const { nom, libelle, valeur, dateDebut, dateFin, taux, valeurConstante, jour } = req.body;

  if (!nom || !libelle || !valeur || !dateDebut || taux === undefined) {
    return res.status(400).json({ error: 'Tous les champs requis doivent être remplis' });
  }

  const dateDebutObj = new Date(dateDebut);
  const dateFinObj = dateFin ? new Date(dateFin) : null;

  const newPossession = new Possession(
    nom,
    libelle,
    parseFloat(valeur),
    dateDebutObj,
    dateFinObj,
    parseFloat(taux)
  );

  if (valeurConstante !== undefined) {
    newPossession.valeurConstante = parseFloat(valeurConstante);
  }
  if (jour !== undefined) {
    newPossession.jour = parseInt(jour, 10);
  }

  if (!patrimoines[nom]) {
    patrimoines[nom] = new Patrimoine(nom, []);
  }

  patrimoines[nom].addPossession(newPossession);

  const updatedData = Object.entries(patrimoines).map(([key, patrimoine]) => ({
    model: 'Patrimoine',
    data: {
      possesseur: { nom: key },
      possessions: patrimoine.possessions.map(p => ({
        possesseur: { nom: p.possesseur },
        libelle: p.libelle,
        valeur: p.valeur,
        dateDebut: p.dateDebut.toISOString(),
        dateFin: p.dateFin ? p.dateFin.toISOString() : null,
        tauxAmortissement: p.tauxAmortissement,
        valeurConstante: p.valeurConstante,
        jour: p.jour
      }))
    }
  }));

  const existingPersons = loadData().filter(d => d.model === 'Personne').map(d => d.data.nom);
  if (!existingPersons.includes(nom)) {
    updatedData.push({
      model: 'Personne',
      data: { nom: nom }
    });
  }

  saveData(updatedData);

  res.status(201).json(newPossession);
});

// Endpoint pour mettre à jour une possession par libellé
app.put('/api/possessions/:libelle', (req, res) => {
  const { libelle } = req.params;
  const { nouveauLibelle, valeur, dateDebut, dateFin, taux, valeurConstante, jour } = req.body;

  let possessionTrouvee = null;

  for (const patrimoine of Object.values(patrimoines)) {
    possessionTrouvee = patrimoine.possessions.find(p => p.libelle === libelle);
    if (possessionTrouvee) {
      if (nouveauLibelle) {
        possessionTrouvee.libelle = nouveauLibelle;
      }
      
      possessionTrouvee.dateFin = dateFin ? new Date(dateFin) : null;
      
      if (valeurConstante !== undefined) {
        possessionTrouvee.valeurConstante = parseFloat(valeurConstante);
      }
      
      if (jour !== undefined) {
        possessionTrouvee.jour = parseInt(jour, 10);
      }

      break; // Sortir de la boucle si la possession est trouvée et mise à jour
    }
  }

  // Si la possession n'est pas trouvée, retourner une erreur
  if (!possessionTrouvee) {
    return res.status(404).send('Possession non trouvée');
  }

  // Préparer les données pour la sauvegarde
  const updatedData = Object.entries(patrimoines).map(([key, patrimoine]) => ({
    model: 'Patrimoine',
    data: {
      possesseur: { nom: key },
      possessions: patrimoine.possessions.map(p => ({
        possesseur: { nom: p.possesseur },
        libelle: p.libelle,
        valeur: p.valeur,
        dateDebut: p.dateDebut instanceof Date && !isNaN(p.dateDebut) ? p.dateDebut.toISOString() : null,
        dateFin: p.dateFin instanceof Date && !isNaN(p.dateFin) ? p.dateFin.toISOString() : null,
        tauxAmortissement: p.tauxAmortissement,
        valeurConstante: p.valeurConstante,
        jour: p.jour
      }))
    }
  }));

  // Sauvegarder les données mises à jour dans le fichier JSON
  saveData(updatedData);

  // Retourner la possession mise à jour comme réponse
  res.status(200).json({
    message: 'Possession mise à jour avec succès',
    possession: possessionTrouvee
  });
});

// Endpoint pour fermer une possession par libellé
app.put('/api/possessions/:libelle/close', (req, res) => {
  const { libelle } = req.params;

  let possessionTrouvee = null;

  for (const patrimoine of Object.values(patrimoines)) {
    possessionTrouvee = patrimoine.possessions.find(p => p.libelle === libelle);
    if (possessionTrouvee) {
      possessionTrouvee.dateFin = new Date(); 
      break;
    }
  }

  if (!possessionTrouvee) {
    return res.status(404).send('Possession non trouvée');
  }

  const updatedData = Object.entries(patrimoines).map(([key, patrimoine]) => ({
    model: 'Patrimoine',
    data: {
      possesseur: { nom: key },
      possessions: patrimoine.possessions.map(p => ({
        possesseur: { nom: p.possesseur },
        libelle: p.libelle,
        valeur: p.valeur,
        dateDebut: p.dateDebut instanceof Date && !isNaN(p.dateDebut) ? p.dateDebut.toISOString() : null,
        dateFin: p.dateFin instanceof Date && !isNaN(p.dateFin) ? p.dateFin.toISOString() : null,
        tauxAmortissement: p.tauxAmortissement,
        valeurConstante: p.valeurConstante,
        jour: p.jour
      }))
    }
  }));

  saveData(updatedData);

  res.status(200).json({
    message: 'Possession fermée avec succès',
    possession: possessionTrouvee
  });
});



// Endpoint pour supprimer une possession par libellé
app.delete('/api/possessions/:libelle', (req, res) => {
  const { libelle } = req.params;

  let possessionFound = false;

  for (const [key, patrimoine] of Object.entries(patrimoines)) {
    const index = patrimoine.possessions.findIndex(p => p.libelle === libelle);
    if (index !== -1) {
      patrimoine.possessions.splice(index, 1);
      possessionFound = true;
      break;
    }
  }

  if (!possessionFound) {
    return res.status(404).send('Possession non trouvée');
  }

  const updatedData = Object.entries(patrimoines).map(([key, patrimoine]) => ({
    model: 'Patrimoine',
    data: {
      possesseur: { nom: key },
      possessions: patrimoine.possessions.map(p => ({
        possesseur: { nom: p.possesseur },
        libelle: p.libelle,
        valeur: p.valeur,
        dateDebut: p.dateDebut.toISOString(),
        dateFin: p.dateFin ? p.dateFin.toISOString() : null,
        tauxAmortissement: p.tauxAmortissement,
        valeurConstante: p.valeurConstante,
        jour: p.jour
      }))
    }
  }));

  saveData(updatedData);

  res.status(200).send('Possession supprimée avec succès');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en fonctionnement sur le port ${PORT}`);
});
