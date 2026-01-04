
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Grid, ArrowRight, Loader2, Navigation } from 'lucide-react';
import { Property, PropertyCategory } from '../types';
import { SEO, pageSEO } from '../components/SEO';
import { ImageComponent } from '../components/ImageComponent';
import { useData } from '../contexts/DataContext';
import { Skeleton } from '../components/ui/Skeleton';

// Lazy load the Map component
const LazyMap = lazy(() => import('../components/LazyMap'));

export const Gallery: React.FC = () => {
  const { properties, isLoading } = useData();
  const [filter, setFilter] = useState<PropertyCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredProperties = properties.filter(p => {
    const matchesFilter = filter === 'All' || p.category === filter;
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
                className={`text-[10px] uppercase tracking-[0.3em] font-bold whitespace-nowrap pb-2 border-b-2 transition-all ${filter === cat ? 'border-gold text-oak' : 'border-transparent text-gray-300 hover:text-oak'
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[450px] w-full rounded-sm" />)}
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
                  <ImageComponent
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                  />
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
          <Suspense fallback={
            <div className="h-[800px] w-full flex items-center justify-center bg-gray-100 rounded-sm border border-oak/10">
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin text-gold mb-4" size={32} />
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-oak">Loading Global Map System...</span>
              </div>
            </div>
          }>
            <LazyMap properties={filteredProperties} />
          </Suspense>
        )}
      </div>
    </div>
  );
};
