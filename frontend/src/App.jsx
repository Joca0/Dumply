import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import CustomerForm from './pages/CustomerForm';
import CustomerList from './pages/CustomerList';
import EquipmentForm from './pages/EquipmentForm';
import EquipmentList from './pages/EquipmentList';
import RentalForm from './pages/RentalForm';
import RentalList from './pages/RentalList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<MapPage />} />
          <Route path="customers/new" element={<CustomerForm />} />
          <Route path="customers/edit/:id" element={<CustomerForm />} />
          <Route path="customers" element={<CustomerList />} />
          <Route path="equipments/new" element={<EquipmentForm />} />
          <Route path="equipments/edit/:id" element={<EquipmentForm />} />
          <Route path="equipments" element={<EquipmentList />} />
          <Route path="rentals/new" element={<RentalForm />} />
          <Route path="rentals" element={<RentalList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;