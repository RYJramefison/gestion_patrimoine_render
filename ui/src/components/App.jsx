import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './menu/menu';
import Add from './add';  
import PatrimoineList from './listPatrimoine/patrimoineList'; 
import EditPossession from './editPossession'; 

export default function App() {
  return (
    <Router>
      <Menu />
      <Routes>
        <Route path="/" element={<PatrimoineList />}/>
        <Route path="/add" element={<Add />}/> 
        <Route path="/patrimoine" element={<PatrimoineList />}/>  
        <Route path="/editPossession/:libelle" element={<EditPossession />}/>  
      </Routes>
    </Router>
  );
}
