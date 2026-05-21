import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, X, Sparkles, Loader2, ExternalLink, Navigation, Layers, Globe, Map as MapIcon, ArrowRight, Eye } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
    const sidebarRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
                <div class="w-4.5 h-4.5 rounded-full bg-gold border-[2px] border-oak shadow-[0_0_15px_rgba(240,192,90,0.8)] z-10 transition-transform duration-300 group-hover:scale-125 ${isSelected ? 'scale-110 border-white bg-gold ring-[3px] ring-gold/40' : ''}"></div>
                <div class="absolute w-8 h-8 rounded-full bg-gold/30 animate-ping"></div>
                <div class="absolute w-16 h-16 rounded-full bg-gold/10 animate-pulse"></div>
                ${isSelected ? '<div class="absolute -top-10 bg-oak text-white text-[9px] font-bold px-3 py-1.5 rounded-sm whitespace-nowrap uppercase tracking-widest border border-gold/30 shadow-xl z-20 animate-in fade-in slide-in-from-bottom-2">' + p.title + '</div>' : ''}
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
                                handleEnclaveSelection(p, false); // select without map flight to prevent fighting map drag
                            });
                        markersRef.current[p.id] = marker;
                    }
                }
            });

            // Fit bounds to show all markers initially if no selection is set
            if (properties.length > 0 && !selectedProperty) {
                const bounds = L.latLngBounds(properties.filter(p => p.coordinates).map(p => [p.coordinates!.lat, p.coordinates!.lng]));
                if (bounds.isValid()) {
                    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
                }
            }
        }
    }, [properties, selectedProperty]);

    // Reset scan when selection changes
    useEffect(() => { 
        if (selectedProperty) setScanResult(null); 
    }, [selectedProperty]);

    const handleEnclaveSelection = (property: Property, shouldFly = true) => {
        setSelectedProperty(property);
        
        // Handle Sidebar Scrolling
        const cardEl = sidebarRefs.current[property.id];
        if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Handle Map Flight
        if (shouldFly && mapInstanceRef.current && property.coordinates) {
            mapInstanceRef.current.flyTo([property.coordinates.lat, property.coordinates.lng], 15, {
                animate: true,
                duration: 1.5
            });
        }
    };

    return (
        <div className="relative flex flex-col lg:flex-row h-[850px] w-full rounded-sm overflow-hidden border border-oak/10 shadow-2xl bg-oak text-white font-sans selection:bg-gold selection:text-white">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 56, 46, 0.2);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #F0C05A;
                    border-radius: 2px;
                }
                .leaflet-container {
                    background: #0B2922 !important;
                }
            `}</style>

            {/* Glassmorphic Enclaves Sidebar */}
            <div className="w-full lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col h-[320px] lg:h-full bg-oak/65 backdrop-blur-xl z-20 overflow-hidden">
                <div className="p-8 border-b border-white/10 bg-oak/30">
                    <div className="flex items-center space-x-3 text-gold mb-2">
                        <Sparkles size={12} />
                        <span className="text-[9px] uppercase font-bold tracking-[0.4em]">Interactive Map Portal</span>
                    </div>
                    <h3 className="font-serif text-3xl text-white">Featured Enclaves</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Select an enclave to scan its location</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-oak/10">
                    {properties.map((p) => {
                        const isSelected = selectedProperty?.id === p.id;
                        return (
                            <div
                                key={p.id}
                                ref={el => sidebarRefs.current[p.id] = el}
                                onClick={() => handleEnclaveSelection(p, true)}
                                className={`group relative flex gap-4 p-4 rounded-sm cursor-pointer border transition-all duration-500 overflow-hidden ${
                                    isSelected 
                                        ? 'bg-white/10 border-gold shadow-[0_0_20px_rgba(240,192,90,0.15)]' 
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-gold/30'
                                }`}
                            >
                                {/* Left Image Thumbnail */}
                                <div className="w-20 h-20 rounded-sm overflow-hidden shrink-0 relative bg-oak/50">
                                    <img 
                                        src={p.images[0]} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        alt={p.title} 
                                    />
                                    <div className={`absolute inset-0 bg-oak/10 group-hover:bg-transparent transition-colors`}></div>
                                </div>

                                {/* Right Enclave Meta */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gold text-[8px] uppercase tracking-[0.25em] font-bold truncate max-w-[120px]">{p.category}</span>
                                            {isSelected && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                                            )}
                                        </div>
                                        <h4 className={`font-serif text-base leading-tight mt-1 truncate ${isSelected ? 'text-gold' : 'text-white group-hover:text-gold transition-colors'}`}>
                                            {p.title}
                                        </h4>
                                        <span className="text-[10px] text-gray-400 font-light flex items-center mt-1 truncate">
                                            <MapPin size={10} className="mr-1 text-gold shrink-0" />
                                            <span className="truncate">{p.location}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-end justify-between mt-2 pt-1 border-t border-white/5">
                                        <span className="text-gold font-serif text-sm font-medium">
                                            ${p.price ? p.price.toLocaleString() : 'Call Price'}
                                        </span>
                                        <span className="text-[8px] uppercase tracking-widest text-white/50 group-hover:text-gold transition-colors flex items-center gap-1">
                                            <span>Scan</span>
                                            <ArrowRight size={8} className="group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {properties.length === 0 && (
                        <div className="py-20 text-center text-white/40">
                            <MapIcon size={24} className="mx-auto mb-3 opacity-30" />
                            <span className="text-[9px] uppercase tracking-widest block font-bold">No Enclaves Found</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Canvas and Overlays Container */}
            <div className="flex-1 h-1/2 lg:h-full relative overflow-hidden z-10">
                <div ref={mapContainerRef} className="h-full w-full" />

                {/* Glassmorphic Property Detail Overlay */}
                {selectedProperty && (
                    <div className="absolute bottom-6 md:bottom-auto md:top-8 right-6 left-6 md:left-auto w-auto md:w-[420px] bg-oak/90 backdrop-blur-xl rounded-sm shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] z-20 animate-in slide-in-from-right duration-700 overflow-hidden border border-white/10">
                        {/* Banner Image */}
                        <div className="relative h-44">
                            <img src={selectedProperty.images[0]} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-oak via-oak/20 to-transparent"></div>
                            
                            <button 
                                onClick={() => setSelectedProperty(null)} 
                                className="absolute top-4 right-4 bg-oak/80 backdrop-blur-md text-white p-2 rounded-full border border-white/10 hover:bg-gold hover:text-oak hover:border-gold transition-all duration-300 active:scale-95 cursor-pointer"
                                aria-label="Close details"
                            >
                                <X size={14} />
                            </button>

                            <div className="absolute bottom-4 left-6">
                                <span className="text-gold text-[8px] uppercase tracking-[0.3em] font-bold block mb-1">{selectedProperty.category}</span>
                                <h4 className="font-serif text-2xl text-white leading-none">{selectedProperty.title}</h4>
                            </div>
                        </div>

                        {/* Description & Dynamic Satellite Scan */}
                        <div className="p-6 space-y-6">
                            <p className="text-xs text-gray-300 font-light flex items-center leading-none mt-[-5px]">
                                <MapPin size={12} className="mr-1.5 text-gold shrink-0" />
                                {selectedProperty.location}
                            </p>

                            {/* Google Grounding Synthesis Area */}
                            <div className="bg-white/5 p-5 rounded-sm border border-white/15 backdrop-blur-md">
                                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                    <h5 className="text-[9px] uppercase font-bold tracking-widest text-gold flex items-center">
                                        <Sparkles size={11} className="mr-1.5 animate-pulse" />
                                        Satellite Grounding Insights
                                    </h5>
                                    {!scanResult && !isScanning && (
                                        <button 
                                            onClick={() => runNeighborhoodScan(selectedProperty)} 
                                            className="text-[9px] uppercase font-bold text-white hover:text-gold transition-colors underline underline-offset-4 cursor-pointer"
                                        >
                                            Initialize Scan
                                        </button>
                                    )}
                                </div>
                                
                                {isScanning ? (
                                    <div className="flex flex-col items-center justify-center py-5 space-y-2 text-gold">
                                        <Loader2 size={14} className="animate-spin" />
                                        <span className="text-[8px] uppercase tracking-[0.2em] font-bold">Connecting Maps Grounding...</span>
                                    </div>
                                ) : scanResult ? (
                                    <div className="space-y-3 animate-in fade-in duration-500">
                                        <p className="text-[10px] text-gray-300 leading-relaxed font-light">{scanResult.text}</p>
                                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                                            {scanResult.sources.map((s, i) => (
                                                <a 
                                                    key={i} 
                                                    href={s.uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="flex items-center space-x-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-sm text-[8px] font-bold text-gray-400 hover:border-gold hover:text-gold hover:bg-white/10 transition-all"
                                                >
                                                    <span className="truncate max-w-[100px]">{s.title}</span>
                                                    <ExternalLink size={8} />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-gray-400 italic font-light">Trigger real-time neighborhood appreciation metrics.</p>
                                )}
                            </div>

                            {/* CTAs */}
                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                <div>
                                    <span className="text-[8px] uppercase tracking-widest text-gray-400 block mb-0.5">Asset Pricing</span>
                                    <span className="font-serif text-lg text-gold">${selectedProperty.price ? selectedProperty.price.toLocaleString() : 'Price on Request'}</span>
                                </div>
                                <Link 
                                    to={`/property/${selectedProperty.id}`} 
                                    className="bg-gold text-oak px-6 py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-white hover:text-oak hover:shadow-white/10 transition-all duration-300 shadow-lg shadow-gold/10 rounded-sm flex items-center space-x-2"
                                >
                                    <span>Open Dossier</span>
                                    <Eye size={12} />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* High-Tech Map Layer Control Panel */}
                <div className="absolute top-6 left-6 z-20 flex flex-col space-y-2">
                    <div className="bg-oak/80 backdrop-blur-xl p-1 rounded-sm border border-white/10 flex flex-col space-y-1 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.5)]">
                        {[{ id: 'dark', icon: MapIcon, label: 'Intel View' }, { id: 'satellite', icon: Globe, label: 'Satellite View' }, { id: 'streets', icon: Layers, label: 'Streets View' }].map((layer) => (
                            <button 
                                key={layer.id} 
                                onClick={() => setMapType(layer.id as MapLayerType)} 
                                className={`flex items-center space-x-2.5 px-3 py-2 rounded-sm transition-all group cursor-pointer ${
                                    mapType === layer.id 
                                        ? 'bg-gold text-oak font-bold shadow-md shadow-gold/20' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`} 
                                title={layer.label}
                            >
                                <layer.icon size={14} className={`${mapType === layer.id ? 'text-oak' : 'text-gold group-hover:scale-110 transition-transform'}`} />
                                <span className="text-[9px] uppercase tracking-widest font-bold hidden md:block">{layer.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Glassmorphic Grounding HUD Status */}
                <div className="absolute bottom-6 left-6 space-y-4 z-20 pointer-events-none hidden sm:block">
                    <div className="bg-oak/85 backdrop-blur-xl px-5 py-3 rounded-sm border border-white/10 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.5)] flex items-center space-x-4">
                        <div className="relative flex shrink-0">
                            <div className="w-8 h-8 border border-gold/30 rounded-full animate-ping absolute inset-0 opacity-40"></div>
                            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                                <Navigation size={12} className="text-gold animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-white block">Grounding Status: Active</span>
                            <span className="text-[8px] text-gray-400 uppercase tracking-widest">Sovereign Intel Grid Seeding</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LazyMap;
