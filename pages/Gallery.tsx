
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Grid, ArrowRight, Loader2, Navigation, Sparkles, Eye } from 'lucide-react';
import { Property, PropertyCategory } from '../types';
import { SEO, pageSEO } from '../components/SEO';
import { ImageComponent } from '../components/ImageComponent';
import { useData } from '../contexts/DataContext';

// Lazy load the Map component
const LazyMap = lazy(() => import('../components/LazyMap'));

export const Gallery: React.FC = () => {
  const { properties, isLoading } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<PropertyCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [budgetFilter, setBudgetFilter] = useState<string>('All');

  useEffect(() => {
    const loc = searchParams.get('location');
    const cat = searchParams.get('category');
    const bud = searchParams.get('budget');

    if (loc) {
      setSearchTerm(loc);
    }
    if (cat) {
      const matchedCat = Object.values(PropertyCategory).find(
        (c) => c.toLowerCase() === cat.toLowerCase()
      );
      if (matchedCat) setFilter(matchedCat);
    }
    if (bud) {
      setBudgetFilter(bud);
    }
  }, [searchParams]);

  const filteredProperties = properties.filter(p => {
    const matchesFilter = filter === 'All' || p.category === filter;
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesBudget = true;
    if (budgetFilter !== 'All') {
      if (budgetFilter === '300000') {
        matchesBudget = p.price <= 300000;
      } else if (budgetFilter === '600000') {
        matchesBudget = p.price > 300000 && p.price <= 600000;
      } else if (budgetFilter === '900000') {
        matchesBudget = p.price <= 900000;
      }
    }

    return matchesFilter && matchesSearch && matchesBudget;
  });

  return (
    <div className="pt-40 pb-32 min-h-screen bg-[#0B2922] bg-gradient-to-b from-[#0B2922] via-[#0D3028] to-[#081F1A] font-sans selection:bg-gold selection:text-white overflow-x-hidden relative text-white">
      {/* Premium Floating Glowing Orbs for Luxury Ambient Background */}
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-[-10%] w-[600px] h-[600px] bg-oak-light/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <SEO {...pageSEO.gallery} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="mb-20 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gold">
              <div className="w-8 h-px bg-gold"></div>
              <span className="uppercase tracking-[0.5em] text-[10px] font-bold">NewOak Sovereign Portfolio</span>
            </div>
            <h1 className="font-serif text-7xl text-white leading-none tracking-tight">The Portfolio</h1>
          </div>

          {/* Glassmorphic View Mode Switcher */}
          <div className="flex bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-3 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                viewMode === 'grid' 
                  ? 'bg-gold text-oak shadow-[0_0_20px_rgba(240,192,90,0.4)]' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Grid size={14} />
              <span>Asset Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-3 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                viewMode === 'map' 
                  ? 'bg-gold text-oak shadow-[0_0_20px_rgba(240,192,90,0.4)]' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Navigation size={14} />
              <span>Interactive Map</span>
            </button>
          </div>
        </header>

        {/* Glassmorphic Search & Filter Bar */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-16 flex flex-col lg:flex-row justify-between items-center gap-8 border border-white/10">
          <div className="flex items-center space-x-8 overflow-x-auto w-full lg:w-auto pb-4 lg:pb-0 scrollbar-hide">
            {['All', ...Object.values(PropertyCategory)].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat as any)}
                className={`text-[10px] uppercase tracking-[0.3em] font-bold whitespace-nowrap pb-2 border-b-2 transition-all ${
                  filter === cat 
                    ? 'border-gold text-gold font-bold' 
                    : 'border-transparent text-white/40 hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 items-center">
            {/* Glassmorphic Dropdown */}
            <div className="relative w-full sm:w-48">
              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-4 bg-white/5 border border-white/10 rounded-sm text-xs focus:ring-1 focus:ring-gold/30 focus:border-gold transition-all appearance-none cursor-pointer text-white font-medium backdrop-blur-md"
              >
                <option value="All" className="bg-[#0B2922] text-white">All Budgets</option>
                <option value="300000" className="bg-[#0B2922] text-white">Under $300,000</option>
                <option value="600000" className="bg-[#0B2922] text-white">$300,000 - $600,000</option>
                <option value="900000" className="bg-[#0B2922] text-white">Under $900,000</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gold">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            {/* Glassmorphic Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold w-4 h-4" />
              <input
                type="text"
                placeholder="Filter by district or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-sm text-xs focus:ring-1 focus:ring-gold/30 focus:border-gold transition-all placeholder-white/40 text-white backdrop-blur-md"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[480px] w-full rounded-lg bg-white/5 animate-pulse border border-white/5 flex flex-col justify-end p-8 space-y-4">
                <div className="h-6 bg-white/10 rounded w-2/3"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="h-10 bg-white/10 rounded w-full pt-4"></div>
              </div>
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredProperties.map((p, i) => (
              <Link
                to={`/property/${p.id}`}
                key={p.id}
                className="group relative bg-white/5 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 hover:border-gold/40 hover:bg-white/10 hover:shadow-[0_25px_60px_-15px_rgba(240,192,90,0.15)] transition-all duration-700 flex flex-col animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Image Section */}
                <div className="aspect-[4/3] overflow-hidden relative bg-oak-dark">
                  <ImageComponent
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-[1.5s] ease-out"
                  />
                  {/* Subtle Dark Glass Overlay on Image */}
                  <div className="absolute inset-0 bg-[#0B2922]/20 group-hover:bg-transparent transition-colors duration-700"></div>
                  
                  {/* Floating Glassmorphic Category Badge */}
                  <div className="absolute top-6 left-6 bg-oak/80 backdrop-blur-md text-gold px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full border border-gold/20 shadow-md">
                    {p.category}
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="font-serif text-3xl mb-3 text-white group-hover:text-gold transition-colors duration-300 leading-tight">
                    {p.title}
                  </h3>
                  
                  <div className="flex items-center text-white/60 text-xs mb-5 space-x-2 font-light">
                    <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                    <span>{p.location}</span>
                  </div>

                  {/* Glassmorphic Specifications Badges */}
                  <div className="flex items-center space-x-4 text-white/50 text-[10px] uppercase tracking-wider mb-6 border-b border-white/5 pb-5">
                    <span>{p.beds || 0} Beds</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50"></span>
                    <span>{p.baths || 0} Baths</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/50"></span>
                    <span>{p.sqft || 0} Sq Ft</span>
                  </div>

                  {/* Pricing and Action Link */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-6 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest text-white/40 mb-0.5">Asset Value</span>
                      <span className="font-serif text-2xl text-gold font-medium tracking-wide">
                        ${p.price ? p.price.toLocaleString() : 'Call Price'}
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/10 hover:border-gold hover:bg-gold hover:text-oak text-white p-3 rounded-full transition-all duration-300 shadow-md flex items-center justify-center group-hover:scale-105 active:scale-95">
                      <ArrowRight className="w-4 h-4 text-gold group-hover:text-oak group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {filteredProperties.length === 0 && (
              <div className="col-span-full py-28 text-center bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
                <Sparkles size={36} className="mx-auto text-gold/30 mb-4 animate-pulse" />
                <p className="text-white/50 text-sm font-light uppercase tracking-widest">No assets matching your criteria were found in our portfolio.</p>
              </div>
            )}
          </div>
        ) : (
          <Suspense fallback={
            <div className="h-[800px] w-full flex items-center justify-center bg-white/5 backdrop-blur-md rounded-sm border border-white/10">
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin text-gold mb-4" size={32} />
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-white">Loading Global Map System...</span>
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
