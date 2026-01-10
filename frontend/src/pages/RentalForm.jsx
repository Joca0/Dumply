import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCustomers, getEquipments, createRental, getRental, updateRental } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { Trash2, MapPin, User, Package, Search } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_API_KEY;

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

  // Filtro: mostra o que bate com a busca E não está selecionado em OUTRA linha (mas permite mostrar o atual da linha)
  const filtered = equipments.filter(e => {
    const term = searchTerm.toLowerCase();
    const matches = e.name.toLowerCase().includes(term) || e.serialNumber.toLowerCase().includes(term);
    const isAlreadyInOtherLine = selectedIds.some(id => id === e.id && id !== item.equipmentId);
    return matches && !isAlreadyInOtherLine;
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

// --- AUTOCOMPLETE DO GOOGLE (RESTAURADO E SEGURO) ---
const GoogleAddressInput = ({ onAddressSelect, defaultValue }) => {
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState([]);
  const places = useMapsLibrary('places');
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    if (defaultValue) setInputValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (!places) return;
    setAutocompleteService(new places.AutocompleteService());
    setSessionToken(new places.AutocompleteSessionToken());
  }, [places]);

  useEffect(() => {
    if (!inputValue || inputValue.length < 3 || !autocompleteService || inputValue === defaultValue) {
      setPredictions([]);
      return;
    }

    const timer = setTimeout(() => {
      autocompleteService.getPlacePredictions({
        input: inputValue,
        sessionToken: sessionToken,
        componentRestrictions: { country: 'br' }
      }, (results) => {
        setPredictions(results || []);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, autocompleteService]);

  const handleSelect = (prediction) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === 'OK' && results[0]) {
        onAddressSelect({
          address: results[0].formatted_address,
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        });
        setInputValue(results[0].formatted_address);
        setPredictions([]);
      }
    });
  };

  return (
      <div className="relative">
        <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite o endereço da entrega..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
        />
        {predictions.length > 0 && (
            <div className="absolute z-[100] w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
              {predictions.map(p => (
                  <div
                      key={p.place_id}
                      onClick={() => handleSelect(p)}
                      className="p-3 hover:bg-blue-600 cursor-pointer text-xs border-b border-gray-700 last:border-0"
                  >
                    {p.description}
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const RentalForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [customers, setCustomers] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    items: [{ equipmentId: '', charge: '' }],
    fullAddress: '',
    latitude: -23.5505,
    longitude: -46.6333,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: ''
  });

  const handleAddressSelect = useCallback((data) => {
    setFormData(prev => ({
      ...prev,
      fullAddress: data.address,
      latitude: data.lat,
      longitude: data.lng
    }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        // 1. Busca Clientes e Equipamentos primeiro (Independente do ID)
        const [custRes, eqRes] = await Promise.all([getCustomers(), getEquipments()]);

        const allCustomers = Array.isArray(custRes.data) ? custRes.data : [];
        const allEquipments = Array.isArray(eqRes.data) ? eqRes.data : [];

        setCustomers(allCustomers);

        if (id) {
          // 2. Busca o Aluguel específico se houver ID
          const rentRes = await getRental(id);
          const rental = rentRes.data;

          if (rental) {
            const formatDT = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';

            setFormData({
              customerId: rental.customerId || '',
              items: (rental.items && Array.isArray(rental.items))
                  ? rental.items.map(i => ({
                    equipmentId: i.equipmentId,
                    charge: i.charge ? i.charge.toString() : ''
                  }))
                  : [{ equipmentId: '', charge: '' }],
              fullAddress: rental.fullAddress || '',
              latitude: rental.latitude || -23.5505,
              longitude: rental.longitude || -46.6333,
              startDate: formatDT(rental.startDate),
              endDate: formatDT(rental.endDate)
            });

            // Na edição, usamos todos os equipamentos (para mostrar o que já está alugado)
            setEquipments(allEquipments);
          }
        } else {
          // 3. Se for NOVO aluguel, filtra apenas os disponíveis
          setEquipments(allEquipments.filter(e => e.status === 'AVAILABLE'));
        }
      } catch (err) {
        console.error("ERRO CRÍTICO NO FETCH:", err);
        if (id) alert("Não foi possível carregar os dados deste aluguel.");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("1. Botão salvar clicado!");

    // Verificação básica antes de tentar enviar
    if (!formData.customerId) {
      alert("Por favor, selecione um cliente.");
      return;
    }

    if (!formData.fullAddress) {
      alert("Por favor, selecione um endereço válido no mapa");
      return;
    }

    setLoading(true);
    try {
      console.log("2. Preparando payload...");

      const payload = {
        customerId: formData.customerId,
        // Garante que latitude e longitude são números
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        fullAddress: formData.fullAddress,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        // Converte charges para float e garante que IDs existem
        items: formData.items
            .filter(item => item.equipmentId) // Remove itens vazios
            .map(item => ({
              equipmentId: item.equipmentId,
              charge: parseFloat(item.charge) || 0
            }))
      };


      if (id) {
        await updateRental(id, payload);
      } else {
        await createRental(payload);
      }
      navigate('/rentals');
    } catch (err) {
      // Exibe o erro real que vem da API no alert
      const errorMsg = err.response?.data?.message || err.message || "Erro desconhecido";
      alert("Erro ao salvar: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-20 text-center text-white animate-pulse">Carregando dados...</div>;

  return (
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <div className="max-w-6xl mx-auto p-8 text-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <Package className="text-blue-500" /> {id ? 'Editar Aluguel' : 'Novo Aluguel'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
              {/* Cliente */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><User size={12}/> Cliente</label>
                <select
                    required
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                >
                  <option value="">Selecione um cliente...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
              </div>

              {/* Equipamentos */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Equipamentos e Diárias</label>
                  <button
                      type="button"
                      onClick={() => setFormData({...formData, items: [...formData.items, {equipmentId: '', charge: ''}]})}
                      className="bg-blue-600 px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-500"
                  >
                    + Adicionar Item
                  </button>
                </div>
                {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
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
                        <span className="absolute left-2 top-2 text-[10px] text-gray-500">R$</span>
                        <input
                            type="number"
                            placeholder="0.00"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 pl-7 text-sm"
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
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Início</label>
                  <input type="datetime-local" className="w-full bg-gray-900 p-2.5 rounded-lg text-sm border border-gray-700" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Previsão Fim</label>
                  <input type="datetime-local" className="w-full bg-gray-900 p-2.5 rounded-lg text-sm border border-gray-700" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><MapPin size={12}/> Local de Entrega</label>
                <GoogleAddressInput onAddressSelect={handleAddressSelect} defaultValue={formData.fullAddress} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? 'Salvando...' : id ? 'Salvar Alterações' : 'Finalizar Aluguel'}
              </button>
            </form>
          </div>

          {/* MAPA */}
          <div className="lg:col-span-5">
            <div className="h-[550px] bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl sticky top-8">
              <Map
                  defaultCenter={{ lat: formData.latitude, lng: formData.longitude }}
                  center={{ lat: formData.latitude, lng: formData.longitude }}
                  zoom={15}
                  disableDefaultUI={true}
                  mapId="PREVIEW_MAP"
              >
                <AdvancedMarker position={{ lat: formData.latitude, lng: formData.longitude }}>
                  <Pin background={'#2563eb'} borderColor={'#ffffff'} glyphColor={'#ffffff'} />
                </AdvancedMarker>
              </Map>
            </div>
          </div>
        </div>
      </APIProvider>
  );
};

export default RentalForm;