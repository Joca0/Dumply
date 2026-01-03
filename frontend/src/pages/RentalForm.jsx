import React, { useState, useEffect } from 'react';
import { getCustomers, getEquipments, createRental } from '../api';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { X } from 'lucide-react';

const LocationPickerModal = ({ isOpen, onClose, onSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition || null);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });
    return position ? <Marker position={position} /> : null;
  };

  const MapUpdater = () => {
    const map = useMapEvents({});
    useEffect(() => {
      if (position) {
        map.setView([position.lat, position.lng], map.getZoom());
      }
    }, [position, map]);
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-gray-800 w-full max-w-4xl rounded-2xl overflow-hidden relative border border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 z-[1000] p-2 bg-gray-900 rounded-full hover:bg-gray-700">
          <X size={20} />
        </button>
        <div className="h-[500px] w-full">
          <MapContainer 
            center={position ? [position.lat, position.lng] : [-23.5505, -46.6333]} 
            zoom={15} 
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapEvents />
            <MapUpdater />
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
    fullAddress: '',
    latitude: '',
    longitude: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  const handleAddressSearch = async (query) => {
    setAddressSearch(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Erro ao buscar endereço:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectAddress = (result) => {
    const { lat, lon, display_name, address } = result;
    // Tenta pegar o número da casa se disponível
    const houseNumber = address.house_number || '';
    
    setFormData({
      ...formData,
      fullAddress: display_name,
      latitude: lat,
      longitude: lon
    });
    setAddressSearch(display_name);
    setSearchResults([]);
  };

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
    if (!formData.latitude || !formData.longitude) {
      alert("Por favor, selecione um endereço válido na busca.");
      return;
    }
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
              type="date"
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
              type="date"
              required
              disabled={loading}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 disabled:opacity-50"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mt-4">
          <label className="block text-sm font-medium mb-1">Endereço Completo (Brasil)</label>
          <div className="relative">
            <input
              type="text"
              required
              disabled={loading}
              placeholder="Rua, Número, Bairro, Cidade..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 disabled:opacity-50"
              value={addressSearch}
              onChange={(e) => handleAddressSearch(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm border-b border-gray-700 last:border-0"
                    onClick={() => selectAddress(result)}
                  >
                    {result.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {formData.latitude && `Lat: ${parseFloat(formData.latitude).toFixed(4)}, Long: ${parseFloat(formData.longitude).toFixed(4)}`}
            </span>
            <button 
              type="button" 
              disabled={loading || !formData.latitude}
              onClick={() => setIsModalOpen(true)}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded disabled:opacity-50"
            >
              Ver no Mapa
            </button>
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
        initialPosition={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null}
        onSelect={(pos) => setFormData({ ...formData, latitude: pos.lat, longitude: pos.lng })}
      />
    </div>
  );
};

export default RentalForm;