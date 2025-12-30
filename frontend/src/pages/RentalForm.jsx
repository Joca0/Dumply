import React, { useState, useEffect } from 'react';
import { getCustomers, getEquipments, createRental } from '../api';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { X } from 'lucide-react';

const LocationPickerModal = ({ isOpen, onClose, onSelect }) => {
  const [position, setPosition] = useState(null);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });
    return position ? <Marker position={position} /> : null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-gray-800 w-full max-w-4xl rounded-2xl overflow-hidden relative border border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 z-[1000] p-2 bg-gray-900 rounded-full hover:bg-gray-700">
          <X size={20} />
        </button>
        <div className="h-[500px] w-full">
          <MapContainer center={[-23.5505, -46.6333]} zoom={13} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapEvents />
          </MapContainer>
        </div>
        <div className="p-4 bg-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
          <button 
            disabled={!position}
            onClick={() => { onSelect(position); onClose(); }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            Confirmar Localização
          </button>
        </div>
      </div>
    </div>
  );
};

const RentalForm = () => {
  const [customers, setCustomers] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    equipmentId: '',
    charge: '',
    latitude: '',
    longitude: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, eqRes] = await Promise.all([getCustomers(), getEquipments()]);
        setCustomers(custRes.data);
        setEquipments(eqRes.data.filter(e => e.status === 'AVAILABLE'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRental({
        ...formData,
        charge: parseFloat(formData.charge),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      });
      alert('Aluguel criado com sucesso!');
      navigate('/rentals');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao criar aluguel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Novo Aluguel</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select
              required
              disabled={loading}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 disabled:opacity-50"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            >
              <option value="">Selecione...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Equipamento</label>
            <select
              required
              disabled={loading}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 disabled:opacity-50"
              value={formData.equipmentId}
              onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
            >
              <option value="">Selecione...</option>
              {equipments.map(e => <option key={e.id} value={e.id}>{e.name} - {e.serialNumber}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Valor do Aluguel (R$)</label>
          <input
            type="number"
            step="0.01"
            required
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 disabled:opacity-50"
            value={formData.charge}
            onChange={(e) => setFormData({ ...formData, charge: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data Início</label>
            <input
              type="datetime-local"
              required
              disabled={loading}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 disabled:opacity-50"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Fim (Previsão)</label>
            <input
              type="datetime-local"
              required
              disabled={loading}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 disabled:opacity-50"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Coordenadas</span>
            <button 
              type="button" 
              disabled={loading}
              onClick={() => setIsModalOpen(true)}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded disabled:opacity-50"
            >
              Selecionar no Mapa
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Latitude"
              readOnly
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-gray-400"
              value={formData.latitude}
            />
            <input
              placeholder="Longitude"
              readOnly
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-gray-400"
              value={formData.longitude}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg mt-4 disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processando...
            </>
          ) : 'Confirmar Aluguel'}
        </button>
      </form>

      <LocationPickerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelect={(pos) => setFormData({ ...formData, latitude: pos.lat, longitude: pos.lng })}
      />
    </div>
  );
};

export default RentalForm;