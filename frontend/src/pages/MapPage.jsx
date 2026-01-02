import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getActiveRentals } from '../api';


import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveRentals()
      .then(res => {
        if (Array.isArray(res.data)) {
          setRentals(res.data);
        } else {
          setRentals([]);
        }
      })
      .catch(err => {
        console.error(err);
        setRentals([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const rentalList = Array.isArray(rentals) ? rentals : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MapContainer center={[-23.5505, -46.6333]} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {rentalList.map((rental) => (
          <Marker key={rental.id} position={[rental.latitude, rental.longitude]}>
            <Popup>
              <div className="text-gray-900">
                <h3 className="font-bold border-b mb-2">{rental.equipment.name}</h3>
                <p><strong>Cliente:</strong> {rental.customer.fullName}</p>
                <p><strong>Endereço:</strong> {rental.fullAddress}</p>
                <p><strong>Início:</strong> {new Date(rental.startDate).toLocaleDateString()}</p>
                <p><strong>Encerramento:</strong> {rental.endDate ? new Date(rental.endDate).toLocaleDateString() : 'Pendente'}</p>
                <p><strong>Valor:</strong> R$ {rental.charge}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;