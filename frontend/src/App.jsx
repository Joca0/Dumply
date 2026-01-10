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
import InvoiceList from './pages/InvoiceList';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceCreate from './pages/InvoiceCreate';

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
          <Route path="rentals/edit/:id" element={<RentalForm />} />
          <Route path="rentals/new" element={<RentalForm />} />
          <Route path="rentals" element={<RentalList />} />
          <Route path="invoices" element={<InvoiceList />} />
          <Route path="invoices/new" element={<InvoiceCreate />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;