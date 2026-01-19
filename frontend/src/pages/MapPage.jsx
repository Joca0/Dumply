import React, { useEffect, useState } from 'react';
import {
    APIProvider,
    Map,
    AdvancedMarker,
    Pin,
    InfoWindow
} from '@vis.gl/react-google-maps';
import { getActiveRentals } from '../api';
import { useSearchParams } from 'react-router-dom';

import { User, MapPin, DollarSign } from 'lucide-react';

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
    const queryZoom = Number(searchParams.get('zoom')) || 13;
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
                    defaultZoom={queryZoom || 16}
                    mapId='3ac641bee6b260db54dce748'
                    gestureHandling={'greedy'}
                    disableDefaultUI={false}

                >
                    {rentals.map((rental) => (
                        <AdvancedMarker
                            key={rental.id}
                            position={{ lat: parseFloat(rental.latitude), lng: parseFloat(rental.longitude) }}
                            onClick={() => setSelectedRental(rental)}
                        >
                            {/* Customização do Pin baseada em (ex: atrasado ou no prazo) */}
                            <Pin
                                background={rental.endDate ? '#10b981' : '#2563eb'}
                                borderColor={'#fff'}
                                glyphColor={'#fff'}
                            />
                        </AdvancedMarker>
                    ))}

                    {/* Renderização Condicional do Popup (InfoWindow) */}
                    {selectedRental && (
                        <InfoWindow
                            position={{
                                lat: parseFloat(selectedRental.latitude),
                                lng: parseFloat(selectedRental.longitude)
                            }}
                            onCloseClick={() => setSelectedRental(null)}
                        >
                            <div className="p-2 min-w-[200px] text-gray-800">
                                <h3 className="font-bold text-blue-600 border-b border-gray-200 pb-1 mb-2 text-sm uppercase">
                                    {selectedRental.equipment?.name || 'Equipamento'}
                                </h3>

                                <div className="space-y-2 text-xs">
                                    <p className="flex items-center gap-2">
                                        <User size={14} className="text-gray-400" />
                                        <span><strong>Cliente:</strong> {selectedRental.customer?.fullName}</span>
                                    </p>

                                    <p className="flex items-center gap-2">
                                        <MapPin size={14} className="text-gray-400" />
                                        <span className="truncate w-40"><strong>Local:</strong> {selectedRental.fullAddress}</span>
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

                                    <p className="flex items-center gap-1 mt-2 font-bold text-green-600 text-sm">
                                        <DollarSign size={14} />
                                        <span>R$ {selectedRental.charge}</span>
                                    </p>
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </div>
        </APIProvider>
    );
};

export default MapPage;