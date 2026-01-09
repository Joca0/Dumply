import React, { useState, useEffect, useRef } from 'react';
import { getCustomers, getEquipments, createRental } from '../api';
import { useNavigate } from 'react-router-dom';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { Plus, Trash2, Calendar, MapPin, User, Package, Search } from 'lucide-react';

const apiKey = import.meta.env.VITE_API_KEY;
const GOOGLE_MAPS_API_KEY = apiKey;

// --- BUSCA DE EQUIPAMENTO ---
const InternalEquipmentSearch = ({ index, item, equipments, onSelect, selectedIds }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedEquipment = equipments.find(e => e.id === item.equipmentId);

  const filtered = equipments.filter(e => {
    const term = searchTerm.toLowerCase();
    const matches = e.name.toLowerCase().includes(term) || e.serialNumber.toLowerCase().includes(term);
    const isAlreadySelected = selectedIds.some(id => id === e.id && id !== item.equipmentId);
    return matches && !isAlreadySelected;
  });

  return (
      <div className="relative" ref={wrapperRef}>
        <div className="relative">
          <input
              type="text"
              placeholder="Buscar nome ou serial..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 pl-8 text-sm text-white focus:border-blue-500 outline-none"
              value={isOpen ? searchTerm : (selectedEquipment ? `${selectedEquipment.name} (${selectedEquipment.serialNumber})` : searchTerm)}
              onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
              onFocus={() => { setSearchTerm(''); setIsOpen(true); }}
          />
          <Search size={14} className="absolute left-2.5 top-3 text-gray-500" />
        </div>

        {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-52 overflow-y-auto">
              {filtered.length > 0 ? (
                  filtered.map(e => (
                      <div
                          key={e.id}
                          className="p-2 hover:bg-blue-600 cursor-pointer border-b border-gray-700 last:border-0 transition-colors"
                          onClick={() => {
                            onSelect(index, 'equipmentId', e.id);
                            setIsOpen(false);
                            setSearchTerm('');
                          }}
                      >
                        <div className="text-xs font-bold text-white">{e.name}</div>
                        <div className="text-[10px] text-gray-300 uppercase">S/N: {e.serialNumber}</div>
                      </div>
                  ))
              ) : (
                  <div className="p-3 text-xs text-gray-500 text-center">Nenhum disponível</div>
              )}
            </div>
        )}
      </div>
  );
};

// --- AUTOCOMPLETE DO GOOGLE ---
const GoogleAddressInput = ({ onAddressSelect }) => {
  const inputRef = useRef(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'formatted_address'],
      componentRestrictions: { country: 'br' }
    });
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        onAddressSelect({
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    });
  }, [places, onAddressSelect]);

  return (
      <input
          ref={inputRef}
          type="text"
          required
          placeholder="Digite o endereço da entrega..."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 text-white"
      />
  );
};

// --- COMPONENTE PRINCIPAL ---
const RentalForm = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ equipmentId: '', charge: '' }],
    fullAddress: '',
    latitude: -23.5505,
    longitude: -46.6333,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, eqRes] = await Promise.all([getCustomers(), getEquipments()]);
        setCustomers(custRes.data);
        setEquipments(eqRes.data.filter(e => e.status === 'AVAILABLE'));
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullAddress) return alert("Selecione um endereço pelo buscador.");

    setLoading(true);
    try {
      await createRental({
        ...formData,
        items: formData.items.map(item => ({ ...item, charge: parseFloat(item.charge) })),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      });
      navigate('/rentals');
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao criar");
    } finally { setLoading(false); }
  };

  return (
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <div className="max-w-6xl mx-auto p-8 text-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LADO ESQUERDO: FORMULÁRIO */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <Package className="text-blue-500" /> Novo Aluguel
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">

              {/* Cliente */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                  <User size={12}/> Cliente
                </label>
                <select
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                >
                  <option value="">Selecione um cliente...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
              </div>

              {/* Itens Dinâmicos */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Equipamentos</label>
                  <button
                      type="button"
                      onClick={() => setFormData({...formData, items: [...formData.items, {equipmentId: '', charge: ''}]})}
                      className="flex items-center gap-1 text-[10px] bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded transition-colors"
                  >
                    <Plus size={12} /> Adicionar Item
                  </button>
                </div>

                {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700 relative">
                      <div className="col-span-7">
                        <InternalEquipmentSearch
                            index={index}
                            item={item}
                            equipments={equipments}
                            onSelect={handleItemChange}
                            selectedIds={formData.items.map(i => i.equipmentId)}
                        />
                      </div>
                      <div className="col-span-4 relative">
                        <span className="absolute left-2 top-2 text-[10px] text-gray-500 font-bold">R$</span>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 pl-7 text-sm outline-none focus:border-blue-500"
                            value={item.charge}
                            onChange={(e) => handleItemChange(index, 'charge', e.target.value)}
                            required
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })}
                            className="text-red-500 hover:text-red-400 disabled:opacity-20"
                            disabled={formData.items.length === 1}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                ))}
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-1 italic">Data Início</label>
                  <input
                      type="datetime-local"
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm outline-none"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-1 italic">Previsão Fim</label>
                  <input
                      type="datetime-local"
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm outline-none"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="border-t border-gray-700 pt-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">
                  <MapPin size={12}/> Local de Entrega
                </label>
                <GoogleAddressInput
                    onAddressSelect={(data) => {
                      setFormData(prev => ({
                        ...prev,
                        fullAddress: data.address,
                        latitude: data.lat,
                        longitude: data.lng
                      }));
                    }}
                />
              </div>

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Finalizar Aluguel'}
              </button>
            </form>
          </div>

          {/* LADO DIREITO: MAPA */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 h-[550px] bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl relative">
              <Map
                  mapId="PREVIEW_MAP"
                  center={{ lat: formData.latitude, lng: formData.longitude }}
                  zoom={15}
                  disableDefaultUI={true}
                  zoomControl={true}
              >
                <AdvancedMarker position={{ lat: formData.latitude, lng: formData.longitude }}>
                  <Pin background={'#2563eb'} borderColor={'#ffffff'} glyphColor={'#ffffff'} />
                </AdvancedMarker>
              </Map>
              <div className="absolute bottom-4 left-4 right-4 bg-gray-900/90 p-3 rounded-lg border border-gray-700 backdrop-blur-sm">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Localização Selecionada</p>
                <p className="text-xs text-white truncate">{formData.fullAddress || "Aguardando endereço..."}</p>
              </div>
            </div>
          </div>

        </div>
      </APIProvider>
  );
};

export default RentalForm;