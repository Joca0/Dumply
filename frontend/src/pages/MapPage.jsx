import React, { useEffect, useState, useMemo } from 'react';
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
    InfoWindow
} from '@vis.gl/react-google-maps';
import { getActiveRentals } from '../api';
import { useSearchParams } from 'react-router-dom';

import { User, MapPin, DollarSign, Cuboid, ChevronLeft } from 'lucide-react';

const apiKey = import.meta.env.VITE_API_KEY;
const GOOGLE_MAPS_API_KEY = apiKey;

const MapPage = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRental, setSelectedRental] = useState(null);
    const [center, setCenter] = useState({ lat: -23.5505, lng: -46.6333 });
    const [zoom, setZoom] = useState(11);

    const [searchParams] = useSearchParams();
    const queryLat = Number(searchParams.get('lat'));
    const queryLng = Number(searchParams.get('lng'));
    const queryZoom = Number(searchParams.get('zoom')) || 12;
    const queryId = searchParams.get('id');

    useEffect(() => {
        getActiveRentals()
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setRentals(data);

                if (queryLat && queryLng) {
                    setCenter({ lat: queryLat, lng: queryLng });
                    setZoom(queryZoom);
                }
                if (queryId) {
                    const found = data.find(r => String(r.id) === String(queryId));
                    if (found) {
                        setSelectedRental(found);
                    }
                }
            })
            .catch(err => {
                console.error(err);
                setRentals([]);
            })
            .finally(() => setLoading(false));
    }, [queryLat, queryLng, queryZoom, queryId]);

    const groupedRentals = useMemo(() => {
        return rentals.reduce((acc, rental) => {
            const key = `${rental.latitude}-${rental.longitude}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(rental);
            return acc;
        }, {});
    }, [rentals]);

    const getMarkerColor = (rental) => {
        if (!rental.endDate) return '#2563eb'; // Azul (Sem data fim)

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(rental.endDate);
        endDate.setHours(0, 0, 0, 0);

        if (endDate < today) return '#ef4444'; // Vermelho (Passou da data fim)

        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);

        if (endDate <= threeDaysFromNow) return '#f59e0b'; // Amarelo (Próximo da data fim)

        return '#10b981'; // Verde (OK)
    };

    const getGroupColor = (rentals) => {
        const colors = rentals.map(getMarkerColor);
        if (colors.includes('#ef4444')) return '#ef4444';
        if (colors.includes('#f59e0b')) return '#f59e0b';
        if (colors.includes('#2563eb')) return '#2563eb';
        return '#10b981';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div className="h-screen w-full bg-gray-900">
                <Map
                    defaultCenter={{ lat: queryLat || -23.5505, lng: queryLng || -46.6333 }}
                    defaultZoom={queryZoom || 12}
                    mapId='3ac641bee6b260db54dce748'
                    gestureHandling={'greedy'}
                    disableDefaultUI={false}
                >
                    {Object.entries(groupedRentals).map(([coords, items]) => {
                        const isGroup = items.length > 1;
                        const first = items[0];

                        return (
                            <AdvancedMarker
                                key={coords}
                                position={{ lat: parseFloat(first.latitude), lng: parseFloat(first.longitude) }}
                                onClick={() => setSelectedRental(isGroup ? items : first)}
                            >
                                <Pin
                                    background={isGroup ? getGroupColor(items) : getMarkerColor(first)}
                                    borderColor={'#fff'}
                                    glyphColor={'#fff'}
                                >
                                    {isGroup && <span className="text-white font-bold text-[10px]">{items.length}</span>}
                                </Pin>
                            </AdvancedMarker>
                        );
                    })}
                    {selectedRental && (
                        <InfoWindow
                            position={{
                                lat: parseFloat(Array.isArray(selectedRental) ? selectedRental[0].latitude : selectedRental.latitude),
                                lng: parseFloat(Array.isArray(selectedRental) ? selectedRental[0].longitude : selectedRental.longitude)
                            }}
                            onCloseClick={() => setSelectedRental(null)}
                        >
                            <div className="p-2 min-w-[220px] max-h-[350px] overflow-y-auto text-gray-800">
                                {Array.isArray(selectedRental) ? (
                                    /* VISÃO DA LISTA*/
                                    <div>
                                        <h3 className="font-bold text-blue-600 border-b pb-1 mb-2 text-xs uppercase">
                                            {selectedRental.length} Equipamentos aqui
                                        </h3>
                                        <div className="flex flex-col gap-1">
                                            {selectedRental.map(item => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setSelectedRental(item)}
                                                    className="p-2 hover:bg-gray-100 rounded cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
                                                >
                                                    <p className="font-bold text-sm text-gray-700">{item.equipment?.name}</p>
                                                    <p className="text-sm text-gray-700">Número de série: {item.equipment?.serialNumber}</p>
                                                    <p new className="text-sm text-gray-700 italic">Data inicio: {new Date (item.startDate).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* VISÃO DOS DETALHES */
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center justify-between border-b border-gray-200 pb-1 mb-2">
                                            <h3 className="font-bold text-blue-600 text-sm uppercase">
                                                {selectedRental.equipment?.name}
                                            </h3>
                                            {/* Botão para voltar à lista se houver outros no mesmo local */}
                                            {groupedRentals[`${selectedRental.latitude}-${selectedRental.longitude}`]?.length > 1 && (
                                                <button
                                                    onClick={() => setSelectedRental(groupedRentals[`${selectedRental.latitude}-${selectedRental.longitude}`])}
                                                    className="p-1 hover:bg-gray-100 rounded text-black"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <p className="flex items-center gap-2">
                                            <User size={14} className="text-gray-400" />
                                            <span><strong>Cliente:</strong> {selectedRental.customer?.fullName}</span>
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-400" />
                                            <span className="truncate w-40"><strong>Local:</strong> {selectedRental.fullAddress}</span>
                                        </p>

                                        <p className="flex items-center gap-2">
                                            <Cuboid size={14} className="text-gray-400" />
                                            <span className="truncate w-40"><strong>Número de série: </strong> {selectedRental.equipment?.serialNumber}</span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Data Inicio</p>
                                                <p>{new Date(selectedRental.startDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Previsão</p>
                                                <p>{selectedRental.endDate ? new Date(selectedRental.endDate).toLocaleDateString() : 'Pendente'}</p>
                                            </div>
                                        </div>
                                        <p className="flex items-center gap-2 font-bold text-green-600 text-sm mt-2">
                                            <DollarSign size={14} />
                                            <span>R$ {selectedRental.charge}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </InfoWindow>
                    )}
                </Map>

                {/* Legenda */}
                <div className="absolute bottom-10 left-10 bg-white p-4 rounded-lg shadow-lg z-1000 border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Legenda</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
                            <span className="text-xs text-gray-700">Passou da data fim</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[#f59e0b]"></div>
                            <span className="text-xs text-gray-700">Próximo da data fim (3 dias)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[#2563eb]"></div>
                            <span className="text-xs text-gray-700">Sem data fim</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[#10b981]"></div>
                            <span className="text-xs text-gray-700">No prazo</span>
                        </div>
                    </div>
                </div>
            </div>
        </APIProvider>
    );
};

export default MapPage;