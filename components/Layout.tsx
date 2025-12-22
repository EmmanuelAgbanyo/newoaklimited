
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, MapPin, Mail, Instagram, Linkedin, Twitter } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { Logo } from './Logo';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = location.pathname === '/' && !scrolled;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isTransparent ? 'bg-transparent text-white' : 'bg-white text-oak shadow-md py-4'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center">
          <Logo 
            className="h-10 md:h-12 mr-2" 
            variant={isTransparent ? 'light' : 'dark'} 
            showText={true}
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium"
            >
              {link.name}
            </Link>
          ))}
          <Link to="/gallery" className="bg-gold text-white px-6 py-2 rounded-full text-sm uppercase tracking-widest hover:bg-gold-dark transition-all">
            Inquiry
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white text-oak absolute top-full left-0 w-full shadow-xl p-6 flex flex-col space-y-6 animate-in slide-in-from-top duration-300">
          {NAV_LINKS.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              onClick={() => setIsOpen(false)}
              className="text-lg font-serif border-b border-gray-100 pb-2"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleCopyrightDoubleClick = () => {
    navigate('/admin');
  };

  return (
    <footer className="relative overflow-hidden font-sans">
      {/* Warm gradient background - distinctly different from dark oak services section */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-amber-50/50 to-stone-100"></div>

      {/* Subtle decorative pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C5A059' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>

      <div className="relative pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main footer content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 border-b border-gold/20 pb-12 mb-10">
            {/* Brand Column */}
            <div className="space-y-6 sm:col-span-2 lg:col-span-1">
              <Link to="/" className="flex flex-col items-start">
                <Logo className="h-14" variant="dark" showText={true} />
              </Link>
              <p className="text-stone-600 leading-relaxed font-light text-sm max-w-xs">
                Crafting legacies in Accra. NewOak Limited is your trusted partner for high-quality estates in Haatso, Musuku, and Ashongman.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-300 group">
                  <Instagram className="w-4 h-4 text-gold group-hover:text-white transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-300 group">
                  <Linkedin className="w-4 h-4 text-gold group-hover:text-white transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-300 group">
                  <Twitter className="w-4 h-4 text-gold group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>

            {/* Locations Column */}
            <div className="space-y-5">
              <h4 className="font-serif text-xl text-oak">Our Locations</h4>
              <div className="space-y-4 text-sm font-light">
                <div className="p-4 bg-white/60 rounded-lg border border-gold/10 hover:border-gold/30 transition-colors">
                  <p className="text-gold font-bold uppercase text-[10px] tracking-widest mb-2">Main Office</p>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    <span className="text-stone-600">Musuku Junction, Ashongman Estate, Accra, Ghana</span>
                  </div>
                </div>
                <div className="p-4 bg-white/60 rounded-lg border border-gold/10 hover:border-gold/30 transition-colors">
                  <p className="text-gold font-bold uppercase text-[10px] tracking-widest mb-2">Project Office</p>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    <span className="text-stone-600">Opposite Wisconsin University, Haatso, Accra</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Column */}
            <div className="space-y-5">
              <h4 className="font-serif text-xl text-oak">Connect</h4>
              <ul className="space-y-4 text-sm font-light">
                <li className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg border border-gold/10 hover:border-gold/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-gold" />
                  </div>
                  <a href="mailto:sales@newoaklimited.com" className="text-stone-600 hover:text-gold transition-colors">sales@newoaklimited.com</a>
                </li>
                <li className="p-3 bg-white/60 rounded-lg border border-gold/10 hover:border-gold/30 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-gold" />
                    </div>
                    <div className="text-stone-600 space-y-1">
                      <p>0244517076 | 0246273940</p>
                      <p>0244098615 | 0243803086</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="space-y-5">
              <h4 className="font-serif text-xl text-oak">Stay Updated</h4>
              <p className="text-sm text-stone-600 font-light">Request a property catalog for our newest developments.</p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full bg-white/80 border border-gold/20 px-4 py-3 rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm text-stone-700 placeholder:text-stone-400 transition-all"
                />
                <button className="w-full bg-gold text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-gold-dark transition-all shadow-lg shadow-gold/20">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-stone-500 text-xs tracking-widest uppercase">
            <span
              onDoubleClick={handleCopyrightDoubleClick}
              className="cursor-default select-none"
              title=""
            >
              &copy;
            </span>
            {' '}{new Date().getFullYear()} NewOak Limited Ghana. Built with Excellence.
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Scroll to top on regular page changes
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      // Smooth scroll to hash fragment
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100); // Small timeout to ensure page content is rendered
      }
    }
  }, [pathname, hash]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
};
