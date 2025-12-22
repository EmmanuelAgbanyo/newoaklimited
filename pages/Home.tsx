
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Shield, Award, Landmark, Key, Zap, Play, Pause, AlertCircle, MapPin, Loader2 } from 'lucide-react';
import { INITIAL_PROPERTIES } from '../constants';
import { Property } from '../types';
import { db } from '../services/firebase';
import { ref, onValue } from 'firebase/database';

const Hero: React.FC = () => {
  const [assetSrc, setAssetSrc] = useState<string | null>(null);
  const [isAssetLoaded, setIsAssetLoaded] = useState(false);

  useEffect(() => {
    // Specifically fetch the image asset for the Hero section
    const assetRef = ref(db, 'settings/heroImage');
    const unsubscribe = onValue(assetRef, (snapshot) => {
      setAssetSrc(snapshot.val());
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-oak">
      <div className="absolute inset-0">
        {assetSrc ? (
          <div className="relative w-full h-full">
            <img 
              src={assetSrc} 
              className={`w-full h-full object-cover transition-opacity duration-1000 ${isAssetLoaded ? 'opacity-100' : 'opacity-0'}`} 
              onLoad={() => setIsAssetLoaded(true)}
              alt="NewOak Hero Background"
            />
            {!isAssetLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-oak">
                 <Loader2 className="animate-spin text-gold" size={24} />
              </div>
            )}
          </div>
        ) : (
          <img 
            src="https://images.unsplash.com/photo-1707343843437-caacff5cfa74?auto=format&fit=crop&q=80&w=2000" 
            alt="New Oak Heights Luxury Architecture" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-oak/90 via-oak/20 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white">
        <div className="max-w-2xl">
          <div className="flex items-center space-x-3 mb-6 animate-in slide-in-from-bottom duration-700">
             <div className="w-12 h-px bg-gold"></div>
             <span className="text-gold uppercase tracking-[0.5em] font-bold text-[10px]">The Pinnacle of Accra</span>
          </div>
          <h1 className="font-serif text-6xl md:text-8xl mb-8 leading-tight animate-in slide-in-from-left duration-1000">
            New Oak <br />
            <span className="italic">Heights</span>
          </h1>
          <p className="text-lg text-gray-300 mb-10 font-light leading-relaxed max-w-lg animate-in fade-in duration-1000">
            A vertical masterpiece defined by architectural courage. Experience the fusion of terracotta warmth and geometric precision in the heart of Haatso.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 animate-in slide-in-from-bottom duration-1000">
            <Link to="/gallery" className="bg-gold text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-gold-dark transition-all flex items-center justify-center space-x-3 shadow-xl shadow-gold/20">
              <span>View The Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/#services" className="border border-white/20 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-oak transition-all flex items-center justify-center backdrop-blur-sm">
              Our Legacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedSlider: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const propsRef = ref(db, 'properties');
    const unsubscribe = onValue(propsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ ...data[key], id: key }));
        setProperties(list.filter(p => p.featured));
      } else {
        setProperties(INITIAL_PROPERTIES.filter(p => p.featured));
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const next = () => setCurrent((c) => (c + 1) % properties.length);
  const prev = () => setCurrent((c) => (c - 1 + properties.length) % properties.length);

  // Auto-slide effect
  useEffect(() => {
    if (properties.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      next();
    }, 5000); // Slide every 5 seconds

    return () => clearInterval(timer);
  }, [properties.length, isPaused]);

  if (isLoading) return null;
  if (properties.length === 0) return null;

  return (
    <section 
      className="py-32 bg-gray-50"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-20">
          <div>
             <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold block mb-4">The Selection</span>
             <h2 className="font-serif text-5xl text-oak">Featured Enclaves</h2>
          </div>
          <div className="flex items-center space-x-6">
            {/* Slide Indicators for Desktop */}
            <div className="hidden md:flex space-x-2 mr-8">
              {properties.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 transition-all duration-500 rounded-full ${i === current ? 'w-8 bg-gold' : 'w-2 bg-gray-200'}`}
                />
              ))}
            </div>
            <button onClick={prev} className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center hover:bg-oak hover:text-white transition-all"><ChevronLeft size={20} /></button>
            <button onClick={next} className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center hover:bg-oak hover:text-white transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {properties.map((property, idx) => {
            const isActive = idx === current;
            
            return (
              <Link 
                to={`/property/${property.id}`} 
                key={property.id} 
                className={`group relative overflow-hidden bg-white luxury-shadow transition-all duration-1000 ${isActive ? 'opacity-100 scale-100 border-gold/20 border' : 'hidden lg:block opacity-40 scale-95 grayscale-[50%]'}`}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={property.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                </div>
                <div className="p-8">
                  <span className="text-[10px] text-gold uppercase tracking-widest mb-2 block font-bold">{property.category}</span>
                  <h3 className="font-serif text-2xl mb-2 text-oak">{property.title}</h3>
                  <p className="text-gray-400 text-xs mb-6">{property.location}</p>
                  <div className="flex justify-between items-center border-t border-gray-50 pt-6">
                    <span className="font-serif italic text-oak">Consult for Price</span>
                    <div className="flex space-x-4 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>{property.beds} BD</span>
                      <span>{property.sqft} SQFT</span>
                    </div>
                  </div>
                </div>
                {isActive && !isPaused && (
                  <div className="absolute bottom-0 left-0 h-1 bg-gold animate-[progress_5s_linear_infinite]" style={{ width: '100%' }}></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </section>
  );
};

const VideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [assetSrc, setAssetSrc] = useState("https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-house-exterior-at-night-40343-large.mp4");

  useEffect(() => {
    // Specifically fetch the video asset for the Narrative section
    const vRef = ref(db, 'settings/corporateVideo');
    const unsubscribe = onValue(vRef, (snapshot) => {
      const val = snapshot.val();
      if (val) setAssetSrc(val);
    });
    return () => unsubscribe();
  }, []);

  const isVideo = assetSrc?.startsWith('data:video') || assetSrc?.endsWith('.mp4');

  const togglePlay = () => {
    if (videoRef.current && isVideo) {
      if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
      else { videoRef.current.play().then(() => setIsPlaying(true)); }
    }
  };

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-5">
            <span className="text-gold uppercase tracking-[0.3em] text-[10px] mb-4 block font-bold">The NewOak Narrative</span>
            <h2 className="font-serif text-5xl mb-10 leading-tight text-oak">Masterpieces Built on Integrity</h2>
            <p className="text-gray-500 mb-12 leading-relaxed font-light text-lg">Every NewOak development is a meticulous blend of Ghanaian heritage and global architectural standards.</p>
          </div>
          <div className="lg:col-span-7">
            <div className="aspect-video relative rounded-sm overflow-hidden luxury-shadow bg-oak group cursor-pointer" onClick={togglePlay}>
              {isVideo ? (
                <video ref={videoRef} src={assetSrc} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <img src={assetSrc} className="w-full h-full object-cover" alt="NewOak Asset Narrative" />
              )}
              {isVideo && !isPlaying && (
                <div className="absolute inset-0 bg-oak/60 backdrop-blur-[2px] flex items-center justify-center text-white">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20"><Play size={40} className="ml-2 text-gold" /></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <VideoSection />
      <FeaturedSlider />
      <section className="py-32 bg-oak text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-24">
             <span className="text-gold uppercase tracking-[0.5em] text-[10px] font-bold block mb-4">The Portfolio</span>
             <h2 className="font-serif text-5xl mb-6">Unrivaled Excellence</h2>
             <p className="text-gray-400 font-light leading-relaxed">Defining the premium landscape of Accra with integrity and architectural foresight.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { title: 'Estate Development', desc: 'Sovereign-grade suburban planning.', icon: Shield },
              { title: 'Investment Management', desc: 'ROI optimization for the diaspora.', icon: Award },
              { title: 'Architectural Synthesis', desc: 'Merging local context with global luxury.', icon: Landmark },
              { title: 'Asset Concierge', desc: 'End-to-end property maintenance.', icon: Key }
            ].map((s, i) => (
              <div key={i} className="group p-10 border border-white/5 hover:border-gold/30 transition-all duration-500 bg-white/0 hover:bg-white/[0.02]">
                <s.icon className="w-10 h-10 text-gold mb-10" />
                <h3 className="font-serif text-2xl mb-4">{s.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed font-light">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
