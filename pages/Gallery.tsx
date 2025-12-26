
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Grid, ArrowRight, X, Sparkles, Loader2, ExternalLink, Navigation, Layers, Globe, Map as MapIcon } from 'lucide-react';
import { INITIAL_PROPERTIES } from '../constants';
import { Property, PropertyCategory } from '../types';
import { geminiService, GroundingSource } from '../services/geminiService';
import { db } from '../services/firebase';
import { ref, onValue } from 'firebase/database';
import L from 'leaflet';
import { SEO, pageSEO } from '../components/SEO';

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
    <div className="pt-40 pb-32 min-h-screen bg-gray-50 font-sans selection:bg-gold selection:text-white overflow-x-hidden">
      <SEO {...pageSEO.gallery} />
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-20 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-4">
             <div className="flex items-center space-x-3 text-gold">
                <div className="w-8 h-px bg-gold"></div>
                <span className="uppercase tracking-[0.5em] text-[10px] font-bold">NewOak Digital Hub</span>
             </div>
            <h1 className="font-serif text-7xl text-oak leading-none">The Portfolio</h1>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-full luxury-shadow border border-gray-100 backdrop-blur-md">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-3 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-oak text-white shadow-xl' : 'text-gray-400 hover:text-oak'}`}
            >
              <Grid size={14} />
              <span>Asset Grid</span>
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-3 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-oak text-white shadow-xl' : 'text-gray-400 hover:text-oak'}`}
            >
              <Navigation size={14} />
              <span>Standard Map</span>
            </button>
          </div>
        </header>

        {/* Search & Filter */}
        <div className="bg-white p-8 rounded-sm luxury-shadow mb-16 flex flex-col lg:flex-row justify-between items-center gap-8 border border-gray-100">
          <div className="flex items-center space-x-8 overflow-x-auto w-full lg:w-auto pb-4 lg:pb-0 scrollbar-hide">
            {['All', ...Object.values(PropertyCategory)].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat as any)}
                className={`text-[10px] uppercase tracking-[0.3em] font-bold whitespace-nowrap pb-2 border-b-2 transition-all ${
                  filter === cat ? 'border-gold text-oak' : 'border-transparent text-gray-300 hover:text-oak'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold w-4 h-4" />
            <input 
              type="text" 
              placeholder="Filter by district or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-sm text-xs focus:ring-1 focus:ring-gold transition-all"
            />
          </div>
        </div>

        {isLoadingProps ? (
          <div className="flex flex-col items-center justify-center py-40 text-gold space-y-4">
             <Loader2 className="animate-spin" size={32} />
             <span className="text-[10px] uppercase font-bold tracking-[0.4em]">Retrieving Cloud Portfolio...</span>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredProperties.map((p, i) => (
              <Link 
                to={`/property/${p.id}`} 
                key={p.id}
                className="group bg-white rounded-sm overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-700 flex flex-col animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                  <div className="absolute top-6 left-6 bg-oak/90 text-gold px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full border border-gold/20">
                    {p.category}
                  </div>
                </div>
                <div className="p-10 flex-grow">
                  <h3 className="font-serif text-3xl mb-4 group-hover:text-gold transition-colors text-oak">{p.title}</h3>
                  <div className="flex items-center text-gray-400 text-xs mb-8 space-x-2 font-light">
                    <MapPin className="w-3 h-3 text-gold" />
                    <span>{p.location}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-50 pt-8">
                    <span className="font-serif text-xl italic text-oak">Consult Desk</span>
                    <ArrowRight className="text-gold group-hover:translate-x-3 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
            {filteredProperties.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-400 text-sm font-light uppercase tracking-widest">No assets matching your criteria were found in our portfolio.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-[800px] w-full rounded-sm overflow-hidden border border-oak/10 shadow-2xl">
            <div ref={mapContainerRef} className="h-full w-full z-10" />
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
        )}
      </div>
    </div>
  );
};
