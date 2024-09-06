import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import PossessionsTable from '../listPossession/listPossession';

const AddPossessionForm = () => {
  const [formData, setFormData] = useState({
    nom: '',
    libelle: '',
    valeur: '',
    dateDebut: '',
    dateFin: '',
    taux: '',
    valeurConstante: '',
    jour: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const { nom, libelle, valeur, dateDebut, taux } = formData;
    if (!nom || !libelle || !valeur || !dateDebut || !taux) {
      return 'Tous les champs marqués comme requis doivent être remplis.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/possessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Possession ajoutée avec succès');
        setError('');
        setFormData({
          nom: '',
          libelle: '',
          valeur: '',
          dateDebut: '',
          dateFin: '',
          taux: '',
          valeurConstante: '',
          jour: '',
        });
      } else {
        const errorText = await response.json();
        setError(`Erreur lors de l'ajout de la possession: ${errorText.error || 'Erreur inconnue'}`);
        setSuccess('');
      }
    } catch (error) {
      setError('Erreur lors de l\'ajout de la possession');
      setSuccess('');
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <Container className="my-4">
      <div className='card-link card-body'>
        <h2 className="mb-4">Créer une Possession</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formNom">
                <Form.Label>Nom du Possesseur</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Entrez le nom du possesseur"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formLibelle">
                <Form.Label>Libellé</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Entrez le libellé de la possession"
                  name="libelle"
                  value={formData.libelle}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formValeur">
                <Form.Label>Valeur</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Entrez la valeur de la possession"
                  name="valeur"
                  value={formData.valeur}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formDateDebut">
                <Form.Label>Date Début</Form.Label>
                <Form.Control
                  type="date"
                  name="dateDebut"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formDateFin">
                <Form.Label>Date Fin</Form.Label>
                <Form.Control
                  type="date"
                  name="dateFin"
                  value={formData.dateFin}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formTaux">
                <Form.Label>Taux d'Amortissement</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Entrez le taux d'amortissement"
                  name="taux"
                  value={formData.taux}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="formJour">
                <Form.Label>Jour</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Entrez le jour (optionnel)"
                  name="jour"
                  value={formData.jour}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formValeurConstante">
                <Form.Label>Valeur Constante</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Entrez la valeur constante (optionnel)"
                  name="valeurConstante"
                  value={formData.valeurConstante}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" type="submit">Ajouter la Possession</Button>
        </Form>
        {success && <Alert variant="success" className="mt-4">{success}</Alert>}
      </div>
      <div>
        <PossessionsTable/>
      </div>
    </Container>
  );
};

export default AddPossessionForm;
