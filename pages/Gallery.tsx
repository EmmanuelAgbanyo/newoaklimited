
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Grid, ArrowRight, X, Sparkles, Loader2, ExternalLink, Navigation, Layers, Globe, Map as MapIcon } from 'lucide-react';
import { INITIAL_PROPERTIES } from '../constants';
import { Property, PropertyCategory } from '../types';
import { geminiService, GroundingSource } from '../services/geminiService';
import { db } from '../services/firebase';
import { ref, onValue } from 'firebase/database';
import L from 'leaflet';

type MapLayerType = 'dark' | 'satellite' | 'streets';

export const Gallery: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProps, setIsLoadingProps] = useState(true);
  const [filter, setFilter] = useState<PropertyCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapType, setMapType] = useState<MapLayerType>('dark');
  
  // Intelligence Hub State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    const propertiesRef = ref(db, 'properties');
    const unsubscribe = onValue(propertiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setProperties(list);
      } else {
        setProperties(INITIAL_PROPERTIES); // Fallback to defaults if DB empty
      }
      setIsLoadingProps(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProperties = properties.filter(p => {
    const matchesFilter = filter === 'All' || p.category === filter;
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  useEffect(() => {
    if (mapInstanceRef.current) {
      if (tileLayerRef.current) tileLayerRef.current.remove();
      const config = layerConfigs[mapType];
      tileLayerRef.current = L.tileLayer(config.url, {
        maxZoom: 19,
        attribution: config.attribution
      }).addTo(mapInstanceRef.current);
    }
  }, [mapType]);

  useEffect(() => {
    if (viewMode === 'map' && mapContainerRef.current && !mapInstanceRef.current) {
      const accraCoords: L.LatLngExpression = [5.68, -0.20];
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
      if (viewMode !== 'map' && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'map' && mapInstanceRef.current) {
      Object.keys(markersRef.current).forEach(id => {
        if (!filteredProperties.find(p => p.id === id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      filteredProperties.forEach(p => {
        if (p.coordinates) {
          const isSelected = selectedProperty?.id === p.id;
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div class="relative flex items-center justify-center">
                <div class="radar-pulse ${isSelected ? 'scale-150 shadow-[0_0_20px_#C5A059]' : ''}"></div>
                ${isSelected ? '<div class="absolute -top-12 bg-oak text-white text-[8px] font-bold px-2 py-1 rounded whitespace-nowrap uppercase tracking-widest border border-gold/30 shadow-xl">' + p.title + '</div>' : ''}
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
    }
  }, [viewMode, filteredProperties, selectedProperty]);

  useEffect(() => { if (selectedProperty) setScanResult(null); }, [selectedProperty]);

  return (
    <div className="pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-24 lg:pb-32 min-h-screen bg-gray-50 font-sans selection:bg-gold selection:text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <header className="mb-10 sm:mb-16 lg:mb-20 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 sm:gap-8 lg:gap-10">
          <div className="space-y-3 sm:space-y-4">
             <div className="flex items-center space-x-2 sm:space-x-3 text-gold">
                <div className="w-6 sm:w-8 h-px bg-gold"></div>
                <span className="uppercase tracking-[0.3em] sm:tracking-[0.5em] text-[9px] sm:text-[10px] font-bold">NewOak Digital Hub</span>
             </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl text-oak leading-none">The Portfolio</h1>
          </div>

          <div className="flex bg-white p-1 sm:p-1.5 rounded-full luxury-shadow border border-gray-100 backdrop-blur-md w-full sm:w-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest transition-all ${viewMode === 'grid' ? 'bg-oak text-white shadow-xl' : 'text-gray-400 hover:text-oak'}`}
            >
              <Grid size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>Asset Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest transition-all ${viewMode === 'map' ? 'bg-oak text-white shadow-xl' : 'text-gray-400 hover:text-oak'}`}
            >
              <Navigation size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>Standard Map</span>
            </button>
          </div>
        </header>

        {/* Search & Filter - Improved mobile layout */}
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-sm luxury-shadow mb-8 sm:mb-12 lg:mb-16 flex flex-col gap-4 sm:gap-6 lg:gap-8 lg:flex-row justify-between items-stretch lg:items-center border border-gray-100">
          {/* Category filters - horizontally scrollable on mobile */}
          <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide -mx-2 px-2">
            {['All', ...Object.values(PropertyCategory)].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat as any)}
                className={`text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold whitespace-nowrap pb-2 border-b-2 transition-all flex-shrink-0 ${
                  filter === cat ? 'border-gold text-oak' : 'border-transparent text-gray-300 hover:text-oak'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full lg:w-80 xl:w-96">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gold w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Filter by district or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 bg-gray-50 border-none rounded-sm text-xs focus:ring-1 focus:ring-gold transition-all"
            />
          </div>
        </div>

        {isLoadingProps ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 lg:py-40 text-gold space-y-4">
             <Loader2 className="animate-spin" size={28} />
             <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.3em] sm:tracking-[0.4em]">Retrieving Cloud Portfolio...</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {filteredProperties.map((p, i) => (
              <Link
                to={`/property/${p.id}`}
                key={p.id}
                className="group bg-white rounded-sm overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-700 flex flex-col animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-oak/90 text-gold px-3 sm:px-4 py-1 sm:py-1.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded-full border border-gold/20">
                    {p.category}
                  </div>
                </div>
                <div className="p-6 sm:p-8 lg:p-10 flex-grow">
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4 group-hover:text-gold transition-colors text-oak">{p.title}</h3>
                  <div className="flex items-center text-gray-400 text-[10px] sm:text-xs mb-6 sm:mb-8 space-x-1.5 sm:space-x-2 font-light">
                    <MapPin className="w-3 h-3 text-gold" />
                    <span>{p.location}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-50 pt-6 sm:pt-8">
                    <span className="font-serif text-base sm:text-lg lg:text-xl italic text-oak">Consult Desk</span>
                    <ArrowRight className="text-gold w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-3 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
            {filteredProperties.length === 0 && (
              <div className="col-span-full py-12 sm:py-16 lg:py-20 text-center">
                <p className="text-gray-400 text-xs sm:text-sm font-light uppercase tracking-widest px-4">No assets matching your criteria were found in our portfolio.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-[500px] sm:h-[600px] lg:h-[800px] w-full rounded-sm overflow-hidden border border-oak/10 shadow-2xl">
            <div ref={mapContainerRef} className="h-full w-full z-10" />
            {selectedProperty && (
              <div className="absolute inset-x-4 bottom-4 sm:inset-auto sm:top-6 sm:right-6 lg:top-10 lg:right-10 w-auto sm:w-full sm:max-w-[360px] lg:max-w-[420px] bg-white rounded-sm shadow-2xl z-20 animate-in slide-in-from-bottom sm:slide-in-from-right duration-500 overflow-hidden border border-gray-100 max-h-[70vh] sm:max-h-none overflow-y-auto">
                <div className="relative h-36 sm:h-40 lg:h-48">
                  <img src={selectedProperty.images[0]} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => setSelectedProperty(null)} className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-oak/80 text-white p-1.5 sm:p-2 rounded-full hover:bg-oak transition-colors">
                    <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
                <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                  <div>
                    <span className="text-gold text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.3em] sm:tracking-[0.4em] mb-1.5 sm:mb-2 block">{selectedProperty.category}</span>
                    <h4 className="font-serif text-xl sm:text-2xl lg:text-3xl text-oak mb-1.5 sm:mb-2">{selectedProperty.title}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-light flex items-center"><MapPin size={10} className="sm:w-3 sm:h-3 mr-1 text-gold" /> {selectedProperty.location}</p>
                  </div>
                  <div className="bg-gray-50 p-4 sm:p-5 lg:p-6 rounded-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                       <h5 className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider sm:tracking-widest text-oak flex items-center">
                         <Sparkles size={10} className="sm:w-3 sm:h-3 mr-1.5 sm:mr-2 text-gold" />
                         Satellite Intel Scan
                       </h5>
                       {!scanResult && !isScanning && (
                         <button onClick={() => runNeighborhoodScan(selectedProperty)} className="text-[8px] sm:text-[9px] uppercase font-bold text-gold hover:underline underline-offset-4">Initialize Scan</button>
                       )}
                    </div>
                    {isScanning ? (
                      <div className="flex flex-col items-center justify-center py-4 sm:py-6 space-y-2 sm:space-y-3 text-gold">
                        <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" />
                        <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.15em] sm:tracking-[0.2em]">Accessing Map Grounding...</span>
                      </div>
                    ) : scanResult ? (
                      <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-700">
                         <p className="text-[9px] sm:text-[10px] text-gray-500 leading-relaxed font-light">{scanResult.text}</p>
                         <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 sm:pt-2">
                           {scanResult.sources.map((s, i) => (
                             <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1.5 sm:space-x-2 bg-white border border-gray-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm text-[8px] sm:text-[9px] font-bold text-gray-500 hover:border-gold hover:text-gold transition-all">
                               <span className="truncate max-w-[80px] sm:max-w-[120px]">{s.title}</span>
                               <ExternalLink size={8} className="sm:w-[10px] sm:h-[10px]" />
                             </a>
                           ))}
                         </div>
                      </div>
                    ) : <p className="text-[9px] sm:text-[10px] text-gray-400 italic font-light">Execute scan for verified Map insights.</p>}
                  </div>
                  <div className="pt-3 sm:pt-4 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <span className="font-serif italic text-oak text-xs sm:text-sm">Priority Consultation</span>
                    <Link to={`/property/${selectedProperty.id}`} className="bg-oak text-white px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-xl shadow-oak/20 w-full sm:w-auto text-center">Open Dossier</Link>
                  </div>
                </div>
              </div>
            )}
            {/* Map layer controls - repositioned for mobile */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:top-10 lg:left-10 z-20 flex flex-col space-y-1.5 sm:space-y-2">
               <div className="bg-oak/90 backdrop-blur-md p-1 sm:p-1.5 rounded-md sm:rounded-lg border border-gold/20 flex flex-col space-y-0.5 sm:space-y-1 shadow-2xl">
                  {[{ id: 'dark', icon: MapIcon, label: 'Intel' }, { id: 'satellite', icon: Globe, label: 'Satellite' }, { id: 'streets', icon: Layers, label: 'Streets' }].map((layer) => (
                    <button key={layer.id} onClick={() => setMapType(layer.id as MapLayerType)} className={`flex items-center space-x-2 sm:space-x-3 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-md transition-all group ${mapType === layer.id ? 'bg-gold text-oak' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title={layer.label}>
                      <layer.icon size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider sm:tracking-widest hidden sm:block">{layer.label}</span>
                    </button>
                  ))}
               </div>
            </div>
            {/* Map status indicator - repositioned for mobile */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-10 lg:left-10 space-y-3 sm:space-y-4 z-20 pointer-events-none hidden sm:block">
              <div className="bg-oak/90 backdrop-blur-md px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 lg:py-4 rounded-sm border border-gold/20 luxury-shadow flex items-center space-x-4 sm:space-x-5 lg:space-x-6">
                <div className="relative">
                   <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 border border-gold/30 rounded-full animate-ping opacity-40"></div>
                   <Navigation size={14} className="sm:w-4 sm:h-4 text-gold absolute inset-0 m-auto" />
                </div>
                <div>
                   <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.3em] sm:tracking-[0.4em] text-white block">Grid Status: Active</span>
                   <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-wider sm:tracking-widest">Global Mapping Standard Enabled</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
