import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader2, MapPin, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// Create custom icons based on risk level
const createCustomIcon = (level) => {
  let colorClass = 'bg-[#cbd5e1]'; // default
  if (level === 'critical' || level === 'high') colorClass = 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.6)]';
  else if (level === 'medium') colorClass = 'bg-[#facc15] shadow-[0_0_10px_rgba(250,204,21,0.6)]';
  else if (level === 'low') colorClass = 'bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.6)]';

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="w-4 h-4 rounded-full border-2 border-white ${colorClass}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

export default function MapVisualization() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMap() {
      try {
        setLoading(true);
        const res = await api.getMapData();
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMap();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto mt-20 border-red-100 bg-red-50">
         <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
         <h3 className="text-lg font-bold text-red-700">Failed to load Map Data</h3>
         <p className="text-red-600 mt-2 text-sm">{error}</p>
      </Card>
    );
  }

  // India Center Coordinates
  const position = [20.5937, 78.9629];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
         <div>
           <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
             <MapPin className="w-4 h-4 text-blue-600" />
             <span>Geospatial Farm Intelligence</span>
           </div>
           <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Geospatial Farm Intelligence</h1>
           <p className="text-sm text-slate-500 mt-2 font-medium">Geospatial view of crop risk and damage</p>
         </div>
         <div className="flex flex-col items-end gap-3">
           <Badge className="bg-[#005c8a] text-white px-4 py-2 font-bold tracking-widest uppercase mb-1">
             {data.length} Nodes Rendered
           </Badge>
           
           {/* Legend */}
           <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RISK LEGEND:</span>
             <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> <span className="text-[10px] font-bold text-slate-700 uppercase">LOW</span></div>
             <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#facc15]" /> <span className="text-[10px] font-bold text-slate-700 uppercase">MEDIUM</span></div>
             <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> <span className="text-[10px] font-bold text-slate-700 uppercase">HIGH</span></div>
           </div>
         </div>
      </div>

      <Card className="p-2 relative overflow-hidden bg-slate-50 border-2 border-slate-200">
        <div className="relative z-10 w-full h-[600px] rounded-lg overflow-hidden">
           <MapContainer center={position} zoom={5} scrollWheelZoom={true} className="w-full h-full">
             <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             />
             
             {data.map((farm) => (
               <Marker 
                 key={farm.farmId} 
                 position={[farm.lat, farm.lon]}
                 icon={createCustomIcon(farm.riskLevel)}
               >
                 <Popup className="custom-popup">
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider m-0">{farm.farmId}</h3>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-xs text-slate-600 m-0"><span className="font-bold text-slate-800">Location:</span> {farm.lat.toFixed(2)}°, {farm.lon.toFixed(2)}°</p>
                        <p className="text-xs text-slate-600 m-0"><span className="font-bold text-slate-800">Damage:</span> {farm.damage}%</p>
                        <p className="text-xs text-slate-600 m-0 uppercase flex items-center gap-1">
                          <span className="font-bold text-slate-800">Risk:</span> 
                          <span className={`font-black ${farm.riskLevel === 'high' || farm.riskLevel === 'critical' ? 'text-red-600' : farm.riskLevel === 'medium' ? 'text-yellow-600' : 'text-emerald-600'}`}>
                            {farm.riskLevel}
                          </span>
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/farm/${farm.farmId}`)}
                        className="w-full bg-[#005c8a] hover:bg-[#004b70] text-white font-bold py-2 rounded shadow-sm transition-colors uppercase tracking-widest text-[10px] border-none cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                 </Popup>
               </Marker>
             ))}
           </MapContainer>
        </div>
      </Card>
      
      {/* Required CSS overrides for Leaflet popups inside Tailwind */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-content {
          margin: 16px;
        }
      `}</style>
    </div>
  );
}
