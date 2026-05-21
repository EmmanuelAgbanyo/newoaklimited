import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Shield, TrendingUp, Landmark, Key, Play, Pause, MapPin, Loader2, Map, Sparkles, Building2, Star, Quote, Briefcase, Globe, Zap, Award } from 'lucide-react';
import { ImageComponent } from '../components/ImageComponent';
import { useData } from '../contexts/DataContext';
import { Skeleton } from '../components/ui/Skeleton';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { INITIAL_PROPERTIES, INITIAL_SERVICES, INITIAL_GALLERY } from '../constants';
import { SEO, pageSEO } from '../components/SEO';
import { ShineBorder } from '../components/ui/shine-border';

const IconMap: { [key: string]: React.ElementType } = {
  Shield, TrendingUp, Landmark, Key, Briefcase, Globe, Zap, Award
};

const Hero: React.FC = () => {
  const { heroImages } = useData();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAssetLoaded, setIsAssetLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const [searchLocation, setSearchLocation] = useState('All');
  const [searchCategory, setSearchCategory] = useState('All');
  const [searchBudget, setSearchBudget] = useState('All');

  const defaultImages = [
    "/hero_new_oak_heights.png",
    "/hero_new_oak_facade.png",
    "/hero_new_oak_dusk.jpg",
    "/hero_new_oak_villa.jpg",
    "/hero_new_oak_tower.jpg"
  ];
  const imagesToUse = heroImages.length > 0 ? heroImages : defaultImages;

  useEffect(() => {
    if (imagesToUse.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imagesToUse.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [imagesToUse.length]);

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
    if (index === currentIndex) {
      setIsAssetLoaded(true);
    }
  };

  useEffect(() => {
    if (loadedImages.has(currentIndex)) {
      setIsAssetLoaded(true);
    } else {
      setIsAssetLoaded(false);
    }
  }, [currentIndex, loadedImages]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation !== 'All') params.append('location', searchLocation);
    if (searchCategory !== 'All') params.append('category', searchCategory);
    if (searchBudget !== 'All') params.append('budget', searchBudget);
    navigate(`/gallery?${params.toString()}`);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-oak">
      <div className="absolute inset-0">
        {imagesToUse.map((src, index) => (
          <img
            key={index}
            src={src}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out transform scale-105 ${index === currentIndex && loadedImages.has(index) ? 'opacity-100 scale-100' : 'opacity-0'
              }`}
            onLoad={() => handleImageLoad(index)}
            alt={`NewOak Hero Background ${index + 1}`}
          />
        ))}
        {!isAssetLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-oak">
            {/* Replaced spinner with a logo pulse for more elegance if desired, but retaining spinner for clarity */}
            <Loader2 className="animate-spin text-gold" size={24} />
          </div>
        )}
        {imagesToUse.length > 1 && (
          <div className="absolute bottom-12 right-12 z-20 flex space-x-3">
            {imagesToUse.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 transition-all duration-500 rounded-full ${index === currentIndex ? 'w-12 bg-gold shadow-[0_0_15px_rgba(240,192,90,0.6)]' : 'w-3 bg-white/30 hover:bg-white/50'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-oak/90 via-oak/40 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-oak to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white mt-12">
        <div className="max-w-4xl">
          <div className="flex items-center space-x-4 mb-8 animate-fade-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="w-12 h-[2px] bg-gold"></div>
            <span className="text-gold uppercase tracking-[0.3em] font-semibold text-xs drop-shadow-sm">The Pinnacle of Accra Living</span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl mb-8 leading-[1.1] tracking-tight animate-fade-up opacity-0 drop-shadow-2xl" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            New Oak <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-gold/40 to-white/10">Heights</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-12 font-light leading-relaxed max-w-xl animate-fade-up opacity-0 border-l-[3px] border-gold pl-6" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            A vertical masterpiece defined by architectural courage. Experience the fusion of terracotta warmth and geometric precision in the heart of Haatso.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-up opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
            <Link to="/gallery" className="group relative overflow-hidden bg-gold text-oak px-10 py-4 font-bold uppercase tracking-widest text-xs transition-all hover:bg-white hover:text-oak shadow-lg hover:shadow-gold/20 rounded-sm top-0 hover:-top-1">
              <span className="relative z-10 flex items-center space-x-3">
                <span>View Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link to="/#services" className="group relative overflow-hidden px-10 py-4 font-bold uppercase tracking-widest text-xs text-white border border-white/30 backdrop-blur-md hover:bg-white/10 transition-all rounded-sm">
              <span className="relative z-10">Our Legacy</span>
            </Link>
          </div>
        </div>

        {/* Global Standard Search Card */}
        <div className="mt-16 max-w-4xl animate-fade-up opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
          <form onSubmit={handleSearchSubmit} className="backdrop-blur-xl bg-oak/80 border border-white/10 p-6 md:p-8 shadow-2xl rounded-sm flex flex-col md:flex-row items-center gap-6 text-white w-full">
            <div className="flex-1 w-full space-y-2 text-left">
              <label className="text-[9px] uppercase font-bold tracking-widest text-gold block">Location</label>
              <select 
                value={searchLocation} 
                onChange={(e) => setSearchLocation(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 px-4 py-3.5 rounded-sm text-xs focus:outline-none focus:border-gold transition-colors text-white [&>option]:text-black"
              >
                <option value="All">All Districts</option>
                <option value="Haatso">Haatso</option>
                <option value="Ashongman">Ashongman</option>
                <option value="Musuku">Musuku Junction</option>
              </select>
            </div>
            
            <div className="flex-1 w-full space-y-2 text-left">
              <label className="text-[9px] uppercase font-bold tracking-widest text-gold block">Property Type</label>
              <select 
                value={searchCategory} 
                onChange={(e) => setSearchCategory(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 px-4 py-3.5 rounded-sm text-xs focus:outline-none focus:border-gold transition-colors text-white [&>option]:text-black"
              >
                <option value="All">All Categories</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Residential">Residential</option>
                <option value="Villa">Villa</option>
              </select>
            </div>

            <div className="flex-1 w-full space-y-2 text-left">
              <label className="text-[9px] uppercase font-bold tracking-widest text-gold block">Max Budget</label>
              <select 
                value={searchBudget} 
                onChange={(e) => setSearchBudget(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 px-4 py-3.5 rounded-sm text-xs focus:outline-none focus:border-gold transition-colors text-white [&>option]:text-black"
              >
                <option value="All">No Limit</option>
                <option value="300000">Under $300k</option>
                <option value="600000">Under $600k</option>
                <option value="900000">Under $900k</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full md:w-auto bg-gold text-oak px-8 py-4 rounded-sm font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-oak transition-all flex items-center justify-center space-x-2 shrink-0 md:mt-5 cursor-pointer active:scale-95 shadow-lg shadow-gold/10"
            >
              <span>Find Enclave</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


const FeaturedSlider: React.FC = () => {
  const { properties, isLoading } = useData();
  const featured = properties.filter(p => p.featured);
  // If no featured, fallback to initial props if not loading, else empty
  const list = featured.length > 0 ? featured : (isLoading ? [] : INITIAL_PROPERTIES.filter(p => p.featured));

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = () => setCurrent((c) => (c + 1) % list.length);
  const prev = () => setCurrent((c) => (c - 1 + list.length) % list.length);

  useEffect(() => {
    if (list.length <= 1 || isPaused) return;
    const timer = setInterval(() => { next(); }, 6000);
    return () => clearInterval(timer);
  }, [list.length, isPaused]);

  if (isLoading) {
    return (
      <section className="py-32 bg-[#F9F9F9] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <Skeleton className="w-24 h-4 rounded-full" />
              <Skeleton className="w-96 h-16 rounded-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-[620px] w-full rounded-sm" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (list.length === 0) return null;

  return (
    <section
      className="py-32 relative bg-[#F9F9F9] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="w-8 h-[2px] bg-gold"></span>
              <span className="text-gold uppercase tracking-[0.3em] text-[10px] font-bold">The Selection</span>
            </div>
            <h2 className="font-serif text-5xl md:text-6xl text-oak leading-none">Featured <br /><span className="italic text-gold">Enclaves</span></h2>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={prev} className="w-12 h-12 rounded-full border border-oak/10 flex items-center justify-center text-oak hover:bg-gold hover:border-gold hover:text-white transition-all duration-300 group shadow-sm bg-white">
              <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button onClick={next} className="w-12 h-12 rounded-full border border-oak/10 flex items-center justify-center text-oak hover:bg-gold hover:border-gold hover:text-white transition-all duration-300 group shadow-sm bg-white">
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {list.map((property, idx) => {
            const isActive = idx === current;
            const CardContent = (
              <div className="flex flex-col h-full w-full">
                <div className="h-[65%] overflow-hidden w-full relative">
                  <ImageComponent src={property.images[0]} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105" alt={property.title} />
                </div>
                <div className="h-[35%] bg-white p-8 flex flex-col justify-between border-t border-gray-50 relative w-full">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-block px-3 py-1 text-[9px] uppercase tracking-widest text-white bg-oak font-bold rounded-sm">
                        {property.category}
                      </span>
                      <span className="text-gold text-lg group-hover:translate-x-1 transition-transform">
                        <ArrowRight size={20} />
                      </span>
                    </div>
                    <h3 className="font-serif text-3xl text-oak mb-2 group-hover:text-gold transition-colors line-clamp-1">{property.title}</h3>
                    <p className="text-gray-400 text-xs flex items-center gap-2">
                      <MapPin size={12} className="text-gold" />
                      {property.location}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block mb-1">Config</span>
                      <span className="text-oak font-serif font-medium">
                        {property.beds ? `${property.beds} Bed` : ''}
                        {property.beds && property.baths ? ', ' : ''}
                        {property.baths ? `${property.baths} Bath` : ''}
                        {!property.beds && !property.baths ? 'Custom Config' : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest block mb-1">Details</span>
                      <span className="text-oak font-serif font-medium underline decoration-gold/50 underline-offset-4 group-hover:decoration-gold transition-all">View Residence</span>
                    </div>
                  </div>
                </div>
              </div>
            );

            return (
              <Link
                to={`/property/${property.id}`}
                key={property.id}
                className={`group relative block h-[620px] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isActive ? 'opacity-100 scale-100 z-10' : 'hidden lg:block opacity-40 scale-95 grayscale hover:grayscale-0 hover:opacity-100'}`}
              >
                {isActive ? (
                  <ShineBorder
                    className="h-full w-full p-0 overflow-hidden bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] rounded-sm"
                    color={["#F0C05A", "#0F382E", "#F0C05A"]}
                    borderWidth={1.5}
                  >
                    {CardContent}
                  </ShineBorder>
                ) : (
                  <div className="h-full w-full bg-white overflow-hidden rounded-sm shadow-sm">
                    {CardContent}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const VideoSection: React.FC = () => {
  const { corporateVideo } = useData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const assetSrc = corporateVideo || "/new_oak_narrative.mp4";
  const isVideo = assetSrc?.startsWith('data:video') || assetSrc?.endsWith('.mp4');

  const togglePlay = () => {
    if (videoRef.current && isVideo) {
      if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
      else { videoRef.current.play().then(() => setIsPlaying(true)); }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video && isVideo) {
      video.defaultMuted = true;
      video.muted = true;
      
      // Explicitly trigger programmatic play to handle browser autoplay policies
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Muted video autoplay requires user interaction: ", err);
            setIsPlaying(false);
          });
      }
    }
  }, [assetSrc, isVideo]);

  return (
    <section className="py-32 bg-oak text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-24 items-center">
          <div className="lg:w-5/12 ml-auto order-2 lg:order-1">
            <div className="relative">
              <span className="text-gold uppercase tracking-[0.3em] text-[10px] mb-6 block font-bold">The NewOak Narrative</span>
              <h2 className="font-serif text-5xl md:text-6xl mb-8 leading-tight text-white">Masterpieces <br /><span className="text-gold italic">Built on Integrity</span></h2>
              <p className="text-gray-300/80 mb-12 leading-relaxed font-light text-lg">
                Every NewOak development is a meticulous blend of Ghanaian heritage and global architectural standards. We don't just build houses; we curate lifestyles for the discerning few.
              </p>
              <div className="flex gap-16 border-t border-white/10 pt-8">
                <div>
                  <span className="font-serif text-5xl text-white block mb-2">10+</span>
                  <span className="text-[9px] uppercase tracking-widest text-gold font-bold">Years Excellence</span>
                </div>
                <div>
                  <span className="font-serif text-5xl text-white block mb-2">$50M+</span>
                  <span className="text-[9px] uppercase tracking-widest text-gold font-bold">Portfolio Value</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-7/12 w-full order-1 lg:order-2">
            <div className="relative aspect-[16/10] grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl group cursor-pointer bg-black/50 overflow-hidden" onClick={togglePlay}>
              {isVideo ? (
                <video ref={videoRef} src={assetSrc} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" autoPlay muted loop playsInline />
              ) : (
                <img src={assetSrc} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" alt="NewOak Asset Narrative" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-20 h-20 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center transform transition-all duration-500 ${isPlaying ? 'opacity-0 group-hover:opacity-100 scale-90' : 'opacity-100 scale-100'}`}>
                  {isPlaying ? <Pause size={24} className="text-white fill-white" /> : <Play size={24} className="text-white fill-white ml-1" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TeamSection = () => {
  const { team, isLoading } = useData();
  const list = team.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (isLoading) {
    return (
      <section className="py-32 relative overflow-hidden bg-[#0F382E]">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <Skeleton className="w-64 h-16 mx-auto bg-white/10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[3/4] bg-white/5" />)}
          </div>
        </div>
      </section>
    )
  }

  if (!isLoading && list.length === 0) return null;

  return (
    <section className="py-32 relative overflow-hidden bg-[#0F382E]">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="font-serif text-5xl md:text-6xl text-white mb-6">Visionary <span className="text-gold italic">Leadership</span></h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto opacity-50"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {list.map((member) => (
            <div key={member.id} className="group relative">
              <div className="aspect-[3/4] overflow-hidden rounded-sm relative shadow-2xl">
                <ImageComponent
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F382E]/90 via-[#0F382E]/20 to-transparent opacity-60 transition-opacity duration-500"></div>
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 p-5 rounded-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] group-hover:bg-white/10 transition-colors duration-500">
                    <h3 className="font-serif text-xl text-white mb-1 group-hover:text-gold transition-colors">{member.name}</h3>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-gold/90 font-bold mb-3">{member.role}</p>
                    <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100">
                      <p className="text-gray-300 text-xs leading-relaxed mb-4 line-clamp-3">{member.bio}</p>
                      {member.linkedin ? (
                        <a href={member.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-2 text-[9px] uppercase font-bold tracking-widest text-white hover:text-gold transition-colors group/btn">
                          <span>View Profile</span>
                          <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                      ) : (
                        <span className="inline-flex items-center space-x-2 text-[9px] uppercase font-bold tracking-widest text-white/50 cursor-not-allowed">
                          <span>View Profile</span>
                          <ArrowRight size={12} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-[1px] rounded-sm border border-gold/0 group-hover:border-gold/50 transition-colors duration-700 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Home: React.FC = () => {
  const { galleryItems, services, isLoading, showTeamSection } = useData();
  const [galleryTab, setGalleryTab] = useState<'all' | 'rooms' | 'estate'>('all');

  const displayServices = services.length > 0 ? services : INITIAL_SERVICES;

  // Sort the gallery items dynamically by visual order index, and fall back to createdAt timestamp sequence
  const sortedGalleryItems = [...galleryItems].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 999999;
    const orderB = b.order !== undefined ? b.order : 999999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
  });
  const galleryContent = sortedGalleryItems.length > 0 ? sortedGalleryItems : INITIAL_GALLERY;

  const filteredGallery = galleryContent.filter(item => {
    if (galleryTab === 'all') return true;
    const isRoom = ['1', '4', '6', '7', '8', '9'].includes(item.id) || 
                   item.title.toLowerCase().includes('dressing') || 
                   item.title.toLowerCase().includes('study') || 
                   item.title.toLowerCase().includes('spa') || 
                   item.title.toLowerCase().includes('wine') || 
                   item.title.toLowerCase().includes('culinary') ||
                   item.title.toLowerCase().includes('bath');
    if (galleryTab === 'rooms') return isRoom;
    return !isRoom;
  });

  const mainItem = filteredGallery.find(i => i.isMain) || filteredGallery[0];
  const otherItems = filteredGallery.filter(i => i !== mainItem).slice(0, 4);

  // Testimonials & Features static for now
  const testimonials = [
    { name: 'Dr. Kwame Asante', title: 'Investment Director, Ghana', quote: 'NewOak transformed our understanding of premium real estate in Accra.', rating: 5 },
    { name: 'Abena Morrison', title: 'Diaspora Investor, London', quote: 'The transparency and digital-first approach of NewOak made investing in Ghana seamless.', rating: 5 },
    { name: 'Kofi Mensah', title: 'Business Executive, Accra', quote: 'The architectural quality of New Oak Heights is unmatched.', rating: 5 }
  ];
  const platformFeatures = [
    { icon: Map, title: 'Satellite Intel', desc: 'Real-time neighborhood intelligence backed by Google Maps grounding.' },
    { icon: Sparkles, title: 'AI Dossiers', desc: 'Sophisticated market analyses synthesizing appreciation trends and yields.' },
    { icon: Building2, title: 'Digital Gallery', desc: 'Curated collection with advanced filtering and high-res imagery.' }
  ];

  return (
    <>
      <SEO {...pageSEO.home} />
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fade-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0F382E; }
        ::-webkit-scrollbar-thumb { background: #F0C05A; border-radius: 3px; }
      `}</style>

      <Hero />
      <FeaturedSlider />
      <VideoSection />

      {/* Services Section */}
      <section id="services" className="py-40 bg-white text-oak relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24 cursor-default">
            <ScrollReveal variant="fade-up" delay={0}>
              <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold block mb-6">The New Standard</span>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={100}>
              <h2 className="font-serif text-5xl md:text-6xl mb-8 text-oak">Excellence Within Reach</h2>
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={200}>
              <p className="text-gray-500 font-light leading-relaxed text-lg mx-auto max-w-2xl">
                We believe the path to premium homeownership should be as seamless as the lifestyle it offers.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 mb-32">
            {isLoading ? [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[400px] rounded-2xl" />) : displayServices.map((s, i) => {
              const Icon = IconMap[s.icon] || Shield;
              return (
                <div key={i} className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700">
                  <ImageComponent src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-oak/90 via-oak/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 p-10 flex flex-col justify-end">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="bg-white/10 w-fit p-3 rounded-xl backdrop-blur-md border border-white/20 mb-6 group-hover:bg-gold group-hover:border-gold transition-colors duration-500">
                        <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-serif text-3xl text-white mb-3">{s.title}</h3>
                      <p className="text-white/80 font-light leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-3">{s.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Platform Features - Visual Break */}
          <div className="bg-oak text-white py-24 -mx-6 px-6 mb-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 border-t border-white/10">
              {platformFeatures.map((feature, i) => (
                <div key={i} className="group">
                  <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 text-gold group-hover:bg-gold group-hover:text-oak transition-all">
                    <feature.icon size={20} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-serif text-2xl mb-3 text-white">{feature.title}</h4>
                  <p className="text-gray-400/80 text-sm leading-relaxed font-light">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Design Gallery */}
          <section className="py-32 bg-white relative">
            <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <ScrollReveal variant="fade-up" delay={0}>
                  <span className="text-gold uppercase tracking-[0.3em] text-[10px] font-bold block mb-4">The Aesthetic</span>
                </ScrollReveal>
                <ScrollReveal variant="fade-up" delay={100}>
                  <h2 className="font-serif text-4xl md:text-5xl text-oak">Curated <span className="italic text-gold">Amenities</span></h2>
                </ScrollReveal>
              </div>

              {/* Premium Luxury Tab Switcher */}
              <ScrollReveal variant="fade-up" delay={150}>
                <div className="flex bg-oak/5 p-1 rounded-sm border border-oak/10 backdrop-blur-md">
                  {(['all', 'rooms', 'estate'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setGalleryTab(tab)}
                      className={`px-4 py-2 rounded-sm font-bold uppercase tracking-widest text-[9px] transition-all duration-300 cursor-pointer ${
                        galleryTab === tab 
                          ? 'bg-gold text-oak shadow-md shadow-gold/20' 
                          : 'text-oak/60 hover:text-oak hover:bg-oak/5'
                      }`}
                    >
                      {tab === 'all' ? 'All Spaces' : tab === 'rooms' ? 'Professional Rooms' : 'Estate & Outdoor'}
                    </button>
                  ))}
                </div>
              </ScrollReveal>

              <div className="hidden lg:block">
                <ScrollReveal variant="slide-in-right" delay={200}>
                  <Link to="/gallery" className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-oak hover:text-gold transition-colors"><span>View Full Gallery</span><ArrowRight size={14} /></Link>
                </ScrollReveal>
              </div>
            </div>
            {isLoading ? (
              <div className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 px-4 h-[800px]">
                <Skeleton className="md:col-span-2 md:row-span-2 rounded-sm" />
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="md:col-span-1 md:row-span-1 rounded-sm" />)}
              </div>
            ) : (
              <div key={galleryTab} className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 px-4 h-[800px] animate-fade-in">
                {mainItem ? (
                  <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-sm cursor-pointer">
                    <ImageComponent src={mainItem.image} alt={mainItem.title} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-transparent group-hover:bg-oak/20 transition-colors duration-500"></div>
                    <div className="absolute bottom-8 left-8 p-6 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-sm translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="font-serif text-2xl mb-1">{mainItem.title}</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold">{mainItem.subtitle}</p>
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-2 md:row-span-2 flex items-center justify-center border border-dashed border-oak/20 rounded-sm text-oak/40">
                    No main amenity item available
                  </div>
                )}
                {otherItems.map((item, index) => (
                  <div key={item.id || index} className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-sm cursor-pointer">
                    <ImageComponent src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-oak/0 group-hover:bg-oak/10 transition-colors"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-white font-serif text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.title}</p>
                      <p className="text-gold text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
                {/* Pad grid if otherItems length is less than 4 to keep beautiful structure layout */}
                {otherItems.length < 4 && Array.from({ length: 4 - otherItems.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="md:col-span-1 md:row-span-1 border border-dashed border-oak/10 rounded-sm flex flex-col items-center justify-center p-6 text-center text-oak/30 bg-oak/[0.01]">
                    <span className="font-serif text-sm tracking-wide text-oak/40 italic">Signature Space</span>
                    <span className="text-[8px] uppercase tracking-widest text-gold mt-1">To Be Unveiled</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {showTeamSection && (
            <div className="animate-in fade-in duration-700">
              <TeamSection />
            </div>
          )}

          {/* Testimonials */}
          <div className="relative py-32 overflow-hidden mt-32">
            <div className="absolute inset-0 z-0">
              <ImageComponent src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-20 filter grayscale" alt="Architectural sketch" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/90"></div>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-none md:rounded-3xl p-8 md:p-24 border border-white/50 shadow-2xl relative z-10 max-w-6xl mx-auto">
              <Quote className="absolute top-10 left-10 text-oak/5 w-40 h-40 -rotate-12" />
              <div className="relative z-10 mx-auto text-center">
                <span className="text-gold uppercase tracking-[0.5em] text-[10px] font-bold block mb-8">Client Success</span>
                <h3 className="font-serif text-4xl md:text-5xl mb-20 text-oak">Trusted Voices</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  {testimonials.map((testimonial, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-xl p-8 shadow-sm hover:shadow-xl border border-white/60 hover:border-gold/30 transition-all duration-500 rounded-xl group">
                      <div className="flex mb-6">
                        <div className="flex gap-1">{[...Array(testimonial.rating)].map((_, si) => <Star key={si} size={12} className="text-gold fill-gold" />)}</div>
                      </div>
                      <p className="text-oak/80 text-sm leading-7 font-serif italic mb-8 relative"><span className="text-4xl text-gold/20 absolute -top-4 -left-2 font-serif">"</span>{testimonial.quote}</p>
                      <div className="flex items-center gap-4 pt-6 border-t border-gray-100 group-hover:border-gold/20 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-oak/5 flex items-center justify-center text-oak font-bold font-serif">{testimonial.name[0]}</div>
                        <div><p className="font-bold text-xs text-oak uppercase tracking-wide">{testimonial.name}</p><p className="text-gold text-[9px] uppercase tracking-widest">{testimonial.title}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
