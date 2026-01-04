import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, X, Sparkles, Loader2, ExternalLink, Navigation, Layers, Globe, Map as MapIcon } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure CSS is imported if not global
import { Property } from '../types';
import { geminiService, GroundingSource } from '../services/geminiService';

type MapLayerType = 'dark' | 'satellite' | 'streets';

interface LazyMapProps {
    properties: Property[];
}

const LazyMap: React.FC<LazyMapProps> = ({ properties }) => {
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [mapType, setMapType] = useState<MapLayerType>('dark');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const markersRef = useRef<{ [key: string]: L.Marker }>({});

    const layerConfigs: Record<MapLayerType, { url: string; attribution: string }> = {
        dark: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; CartoDB'
        },
        satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles &copy; Esri'
        },
        streets: {
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            attribution: '&copy; CartoDB'
        }
    };

    const runNeighborhoodScan = async (property: Property) => {
        setIsScanning(true);
        setScanResult(null);
        try {
            const result = await geminiService.getNeighborhoodInsights(property.location, property.coordinates?.lat, property.coordinates?.lng);
            setScanResult(result);
        } finally {
            setIsScanning(false);
        }
    };

    // Initialize Map
    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const accraCoords: L.LatLngExpression = [5.68, -0.20]; // Center on Accra
            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView(accraCoords, 13);

            mapInstanceRef.current = map;

            const config = layerConfigs[mapType];
            tileLayerRef.current = L.tileLayer(config.url, { maxZoom: 19 }).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markersRef.current = {};
            }
        };
    }, []);

    // Update Tile Layer
    useEffect(() => {
        if (mapInstanceRef.current && tileLayerRef.current) {
            tileLayerRef.current.remove();
            const config = layerConfigs[mapType];
            tileLayerRef.current = L.tileLayer(config.url, {
                maxZoom: 19,
                attribution: config.attribution
            }).addTo(mapInstanceRef.current);
        }
    }, [mapType]);

    // Update Markers
    useEffect(() => {
        if (mapInstanceRef.current) {
            // Remove markers not in current filtered properties
            Object.keys(markersRef.current).forEach(id => {
                if (!properties.find(p => p.id === id)) {
                    markersRef.current[id].remove();
                    delete markersRef.current[id];
                }
            });

            // Add/Update markers
            properties.forEach(p => {
                if (p.coordinates) {
                    const isSelected = selectedProperty?.id === p.id;
                    const icon = L.divIcon({
                        className: 'custom-marker',
                        html: `
              <div class="relative flex items-center justify-center group">
                <div class="w-4 h-4 rounded-full bg-gold border-[2px] border-white shadow-[0_0_15px_rgba(240,192,90,0.8)] z-10 transition-transform duration-300 group-hover:scale-125"></div>
                <div class="absolute w-8 h-8 rounded-full bg-gold/30 animate-ping"></div>
                <div class="absolute w-16 h-16 rounded-full bg-gold/10 animate-pulse"></div>
                ${isSelected ? '<div class="absolute -top-10 bg-oak text-white text-[10px] font-bold px-3 py-1.5 rounded-sm whitespace-nowrap uppercase tracking-widest border border-gold/30 shadow-xl z-20 animate-in fade-in slide-in-from-bottom-2">' + p.title + '</div>' : ''}
              </div>
            `,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });

                    if (markersRef.current[p.id]) {
                        markersRef.current[p.id].setIcon(icon);
                    } else {
                        const marker = L.marker([p.coordinates.lat, p.coordinates.lng], { icon })
                            .addTo(mapInstanceRef.current!)
                            .on('click', () => {
                                setSelectedProperty(p);
                                mapInstanceRef.current?.flyTo([p.coordinates!.lat, p.coordinates!.lng], 15);
                            });
                        markersRef.current[p.id] = marker;
                    }
                }
            });

            // Fit bounds to show all markers
            if (properties.length > 0) {
                const bounds = L.latLngBounds(properties.filter(p => p.coordinates).map(p => [p.coordinates!.lat, p.coordinates!.lng]));
                if (bounds.isValid()) {
                    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                }
            }
        }
    }, [properties, selectedProperty]);

    // Reset scan when selection changes
    useEffect(() => { if (selectedProperty) setScanResult(null); }, [selectedProperty]);

    return (
        <div className="relative h-[800px] w-full rounded-sm overflow-hidden border border-oak/10 shadow-2xl">
            <div ref={mapContainerRef} className="h-full w-full z-10" />

            {/* Property Popup */}
            {selectedProperty && (
                <div className="absolute top-10 right-10 w-full max-w-[420px] bg-white rounded-sm shadow-2xl z-20 animate-in slide-in-from-right duration-500 overflow-hidden border border-gray-100">
                    <div className="relative h-48">
                        <img src={selectedProperty.images[0]} className="w-full h-full object-cover" alt="" />
                        <button onClick={() => setSelectedProperty(null)} className="absolute top-4 right-4 bg-oak/80 text-white p-2 rounded-full hover:bg-oak transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div>
                            <span className="text-gold text-[9px] uppercase font-bold tracking-[0.4em] mb-2 block">{selectedProperty.category}</span>
                            <h4 className="font-serif text-3xl text-oak mb-2">{selectedProperty.title}</h4>
                            <p className="text-xs text-gray-400 font-light flex items-center"><MapPin size={12} className="mr-1 text-gold" /> {selectedProperty.location}</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="text-[10px] uppercase font-bold tracking-widest text-oak flex items-center">
                                    <Sparkles size={12} className="mr-2 text-gold" />
                                    Satellite Intel Scan
                                </h5>
                                {!scanResult && !isScanning && (
                                    <button onClick={() => runNeighborhoodScan(selectedProperty)} className="text-[9px] uppercase font-bold text-gold hover:underline underline-offset-4">Initialize Scan</button>
                                )}
                            </div>
                            {isScanning ? (
                                <div className="flex flex-col items-center justify-center py-6 space-y-3 text-gold">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-[9px] uppercase font-bold tracking-[0.2em]">Accessing Map Grounding...</span>
                                </div>
                            ) : scanResult ? (
                                <div className="space-y-4 animate-in fade-in duration-700">
                                    <p className="text-[10px] text-gray-500 leading-relaxed font-light">{scanResult.text}</p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {scanResult.sources.map((s, i) => (
                                            <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 bg-white border border-gray-200 px-3 py-1.5 rounded-sm text-[9px] font-bold text-gray-500 hover:border-gold hover:text-gold transition-all">
                                                <span className="truncate max-w-[120px]">{s.title}</span>
                                                <ExternalLink size={10} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ) : <p className="text-[10px] text-gray-400 italic font-light">Execute scan for verified Map insights.</p>}
                        </div>
                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                            <span className="font-serif italic text-oak text-sm">Priority Consultation</span>
                            <Link to={`/property/${selectedProperty.id}`} className="bg-oak text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-xl shadow-oak/20">Open Dossier</Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Controls */}
            <div className="absolute top-10 left-10 z-20 flex flex-col space-y-2">
                <div className="bg-oak/90 backdrop-blur-md p-1.5 rounded-lg border border-gold/20 flex flex-col space-y-1 shadow-2xl">
                    {[{ id: 'dark', icon: MapIcon, label: 'Intel' }, { id: 'satellite', icon: Globe, label: 'Satellite' }, { id: 'streets', icon: Layers, label: 'Streets' }].map((layer) => (
                        <button key={layer.id} onClick={() => setMapType(layer.id as MapLayerType)} className={`flex items-center space-x-3 px-4 py-2.5 rounded-md transition-all group ${mapType === layer.id ? 'bg-gold text-oak' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title={layer.label}>
                            <layer.icon size={16} />
                            <span className="text-[10px] uppercase font-bold tracking-widest hidden md:block">{layer.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Status */}
            <div className="absolute bottom-10 left-10 space-y-4 z-20 pointer-events-none">
                <div className="bg-oak/90 backdrop-blur-md px-6 py-4 rounded-sm border border-gold/20 luxury-shadow flex items-center space-x-6">
                    <div className="relative">
                        <div className="w-10 h-10 border border-gold/30 rounded-full animate-ping opacity-40"></div>
                        <Navigation size={16} className="text-gold absolute inset-0 m-auto" />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-white block">Grid Status: Active</span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest">Global Mapping Standard Enabled</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LazyMap;
