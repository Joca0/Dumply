import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  getRental,
  createRental,
  updateRental,
  autocompleteCustomers,
  getCustomer,
  getEquipment,
  autocompleteEquipments
} from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker, Pin, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Trash2, MapPin, User, Package, Search, Calendar, Plus, ChevronRight, Info } from 'lucide-react';
import { toast } from "sonner";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_API_KEY;

// --- COMPONENTE: BUSCA DE CLIENTE ---
const CustomerSearch = ({ onSelect, selectedCustomerId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 1) {
        try {
          const res = await autocompleteCustomers(searchTerm);
          const exactMatch = res.data.length === 1 && res.data[0].fullName === searchTerm;
          if (exactMatch) setSuggestions([]);
          else { setSuggestions(res.data); setIsOpen(true); }
        } catch (err) { console.error(err); }
      } else { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedCustomerId && !searchTerm) {
      getCustomer(selectedCustomerId).then(res => res.data && setSearchTerm(res.data.fullName));
    }
  }, [selectedCustomerId]);

  return (
      <div className="relative" ref={wrapperRef}>
        <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5 ml-1">
          <User size={12} className="text-blue-500" /> Cliente Responsável
        </label>
        <div className="relative group">
          <input
              type="text"
              placeholder="Nome, CPF ou CNPJ..."
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl p-3 pl-10 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
          />
          <Search size={18} className="absolute left-3 top-3 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
        </div>

        {isOpen && suggestions.length > 0 && (
            <div className="absolute z-[100] w-full mt-2 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-y-auto max-h-60 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
              {suggestions.map(c => (
                  <div
                      key={c.id}
                      className="p-4 hover:bg-blue-600/10 cursor-pointer border-b border-gray-800/50 last:border-0 transition-all flex items-center justify-between group"
                      onClick={() => { onSelect(c.id.toString()); setSearchTerm(c.fullName); setIsOpen(false); }}
                  >
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-blue-400">{c.fullName}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{c.document || '---'}</div>
                    </div>
                    <ChevronRight size={14} className="text-gray-700 group-hover:text-blue-400" />
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};

// --- COMPONENTE: BUSCA DE EQUIPAMENTO ---
const InternalEquipmentSearch = ({ index, item, onSelect, selectedIds }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 1) {
        try {
          const res = await autocompleteEquipments(searchTerm);
          const filtered = res.data.filter(e => !selectedIds.includes(e.id) || e.id === item.equipmentId);
          setSuggestions(filtered);
          setIsOpen(true);
        } catch (err) { console.error(err); }
      } else setSuggestions([]);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedIds, item.equipmentId]);

  useEffect(() => {
    if (item.equipmentId && !searchTerm) {
      getEquipment(item.equipmentId).then(res => res.data && setSearchTerm(`${res.data.name} (${res.data.serialNumber})`));
    }
  }, [item.equipmentId]);

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 9999
      });
    }
  }, [isOpen]);

  return (
      <div className="relative" ref={wrapperRef}>
        <div className="relative group">
          <input
              type="text"
              placeholder="Equipamento ou Serial..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 pl-9 text-sm text-white focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
          />
          <Search size={16} className="absolute left-3 top-3 text-gray-600 group-focus-within:text-blue-500" />
        </div>
        {isOpen && suggestions.length > 0 && createPortal(
            <div ref={dropdownRef} style={dropdownStyle} className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-y-auto max-h-60 backdrop-blur-lg">
              {suggestions.map(e => (
                  <div
                      key={e.id}
                      className="p-3 hover:bg-white/5 cursor-pointer border-b border-gray-800 last:border-0 transition-colors"
                      onClick={() => {
                        onSelect(index, 'equipmentId', e.id);
                        setSearchTerm(`${e.name} (${e.serialNumber})`);
                        setIsOpen(false);
                      }}
                  >
                    <div className="text-xs font-bold text-white">{e.name}</div>
                    <div className="text-xs text-gray-400 font-bold mt-1">Número de Série: {e.serialNumber}</div>
                  </div>
              ))}
            </div>,
            document.body
        )}
      </div>
  );
};

// --- AUTOCOMPLETE DO GOOGLE (RESTAURADO E SEGURO) ---
const GoogleAddressInput = ({ onAddressSelect, defaultValue }) => {
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState([]);
  const places = useMapsLibrary('places');
  const [autocompleteService, setAutocompleteService] = useState(null);

  useEffect(() => { if (defaultValue) setInputValue(defaultValue); }, [defaultValue]);
  useEffect(() => { if (places) setAutocompleteService(new places.AutocompleteService()); }, [places]);

  useEffect(() => {
    if (!inputValue || inputValue.length < 3 || !autocompleteService || inputValue === defaultValue) {
      setPredictions([]); return;
    }
    const timer = setTimeout(() => {
      autocompleteService.getPlacePredictions({ input: inputValue, componentRestrictions: { country: 'br' } }, (res) => setPredictions(res || []));
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue, autocompleteService]);

  const handleSelect = (prediction) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        onAddressSelect({ address: results[0].formatted_address, lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() });
        setInputValue(results[0].formatted_address); setPredictions([]);
      }
    });
  };

  return (
      <div className="relative">
        <div className="relative group">
          <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Endereço da entrega..."
              className="w-full bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none transition-all pr-10"
          />
          <MapPin size={18} className="absolute right-3 top-3 text-gray-600" />
        </div>
        {predictions.length > 0 && (
            <div className="absolute z-[110] w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-y-auto max-h-60">
              {predictions.map(p => (
                  <div key={p.place_id} onClick={() => handleSelect(p)} className="p-3 hover:bg-blue-600/20 cursor-pointer text-xs border-b border-gray-800 last:border-0 text-gray-300 transition-colors">
                    {p.description}
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};

// --- FORMULÁRIO PRINCIPAL ---
const RentalForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ tempId: Date.now() + Math.random(), equipmentId: '', charge: '' }],
    fullAddress: '',
    latitude: -23.5505,
    longitude: -46.6333,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: '',
    isScheduled: false
  });

  const handleAddressSelect = useCallback((data) => {
    setFormData(prev => ({ ...prev, fullAddress: data.address, latitude: data.lat, longitude: data.lng }));
  }, []);

  const selectedIds = useMemo(() => formData.items.map(i => i.equipmentId), [formData.items]);

  useEffect(() => {
    if (!id) return;
    setFetching(true);
    getRental(id).then(res => {
      const rental = res.data;
      const formatDT = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';
      setFormData({
        customerId: rental.customer?.id || '',
        items: rental.equipment ? [{
          tempId: rental.id,
          equipmentId: rental.equipment.id,
          charge: rental.charge?.toString() || ''
        }] : (rental.status === 'SCHEDULED' ? [{ tempId: Date.now(), equipmentId: '', charge: rental.charge?.toString() || '' }] : []),
        fullAddress: rental.fullAddress || '',
        latitude: rental.latitude || -23.5505,
        longitude: rental.longitude || -46.6333,
        startDate: formatDT(rental.startDate),
        endDate: formatDT(rental.endDate),
        isScheduled: rental.status === 'SCHEDULED'
      });
    }).finally(() => setFetching(false));
  }, [id]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.fullAddress) {
      toast.warning("Preencha cliente e endereço corretamente."); return;
    }
    setLoading(true);
    try {
      const payload = { 
        ...formData, 
        items: formData.items.map(i => ({ 
          equipmentId: (formData.isScheduled || !i.equipmentId) ? null : i.equipmentId, 
          charge: parseFloat(i.charge) || 0 
        })) 
      };
      const response = id ? await updateRental(id, payload) : await createRental(payload);
      toast.success(id ? "Atualizado!" : "Criado!");
      
      // Se era um agendamento e agora TEM equipamento (e não foi explicitamente marcado como isScheduled),
      // e o status do backend retornou como SCHEDULED, poderíamos perguntar se quer ativar.
      // Mas para simplificar, se o usuário editou e colocou equipamento, e o status ainda é SCHEDULED,
      // vamos redirecionar baseado na intenção inicial.
      
      if (!id && formData.isScheduled) {
        navigate('/scheduled');
      } else if (id && formData.isScheduled) {
        navigate('/scheduled');
      } else {
        navigate('/rentals');
      }
    } catch (err) { } finally { setLoading(false); }
  };

  if (fetching) return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-400 font-medium animate-pulse">Sincronizando dados...</p>
      </div>
  );

  return (
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <div className="max-w-350 mx-auto p-4 md:p-10 min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* COLUNA FORMULÁRIO */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{id ? 'Editar Aluguel' : 'Novo Aluguel'}</h2>
                  <p className="text-gray-400 text-sm">Configure os equipamentos e local de entrega.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* CLIENTE E TIPO */}
                <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm space-y-6 overflow-visible">
                  <CustomerSearch selectedCustomerId={formData.customerId} onSelect={(id) => setFormData({ ...formData, customerId: id })} />

                  <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${formData.isScheduled ? 'bg-yellow-600/10 border-yellow-500/50' : 'bg-gray-950 border-gray-800'}`}>
                    <div className="flex items-center gap-3">
                      <Calendar className={formData.isScheduled ? 'text-blue-400' : 'text-gray-600'} size={20} />
                      <div>
                        <span className="block text-sm font-bold text-white uppercase tracking-wider">Modo de Agendamento</span>
                        <p className="text-xs text-gray-400">Equipamentos serão definidos na entrega.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.isScheduled} onChange={(e) => setFormData({ ...formData, isScheduled: e.target.checked })} />
                      <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                </div>

                {/* ITENS */}
                <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm overflow-visible">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Info size={14} className="text-blue-500" /> Itens do Pedido
                    </h3>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, items: [...formData.items, { tempId: Date.now() + Math.random(), equipmentId: '', charge: '' }] })}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-xl text-xs font-bold border border-gray-700 transition-all"
                    >
                      <Plus size={14} /> Adicionar Item
                    </button>
                  </div>

                  <div className="space-y-4 overflow-visible">
                    {formData.items.map((item, index) => (
                        <div key={item.tempId} className="grid grid-cols-12 gap-4 p-4 bg-gray-950/50 rounded-2xl border border-gray-800 group hover:border-gray-700 transition-all">
                          {!formData.isScheduled && (
                              <div className="col-span-12 md:col-span-7">
                                <InternalEquipmentSearch index={index} item={item} onSelect={handleItemChange} selectedIds={selectedIds} />
                              </div>
                          )}
                          <div className={formData.isScheduled ? "col-span-10 md:col-span-11" : "col-span-10 md:col-span-4"}>
                            <div className="relative group">
                              <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-600 group-focus-within:text-blue-500 transition-colors">R$</span>
                              <input
                                  type="number"
                                  placeholder="Valor do Equipamento"
                                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 pl-9 text-sm text-white focus:border-blue-500 outline-none transition-all"
                                  value={item.charge}
                                  onChange={(e) => handleItemChange(index, 'charge', e.target.value)}
                                  onWheel={(e) => e.target.blur()}
                                  required
                              />
                            </div>
                          </div>
                          <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })}
                                className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-0"
                                disabled={formData.items.length === 1}
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* LOGÍSTICA */}
                <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm overflow-visible space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Início do Contrato</label>
                      <input
                          type="datetime-local"
                          className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition-all"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          onWheel={(e) => e.target.blur()}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">Previsão de Coleta</label>
                      <input
                          type="datetime-local"
                          className="w-full bg-gray-950 border border-gray-800 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition-all"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          onWheel={(e) => e.target.blur()}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Local da Operação</label>
                    <GoogleAddressInput onAddressSelect={handleAddressSelect} defaultValue={formData.fullAddress} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-blue-900/20 text-lg flex items-center justify-center gap-2">
                  {loading ? 'Processando...' : id ? 'Salvar Alterações' : 'Confirmar Aluguel'}
                </button>
              </form>
            </div>

            {/* COLUNA MAPA */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-10 space-y-4">
                <div className="h-100 md:h-150 bg-gray-900 rounded-3xl overflow-hidden border-4 border-gray-800 shadow-2xl relative">
                  <Map
                      defaultCenter={{ lat: formData.latitude, lng: formData.longitude }}
                      center={{ lat: formData.latitude, lng: formData.longitude }}
                      zoom={15}
                      disableDefaultUI={true}
                      mapId="RENTAL_MAP_PREVIEW"
                      className="w-full h-full grayscale-[0.2]"
                  >
                    <AdvancedMarker position={{ lat: formData.latitude, lng: formData.longitude }}>
                      <Pin background={'#2563eb'} borderColor={'#ffffff'} glyphColor={'#ffffff'} />
                    </AdvancedMarker>
                  </Map>
                  <div className="absolute bottom-6 left-6 right-6 bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Localização Selecionada</p>
                    <p className="text-xs text-gray-300 truncate">{formData.fullAddress || 'Nenhum local selecionado'}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </APIProvider>
  );
};

export default RentalForm;