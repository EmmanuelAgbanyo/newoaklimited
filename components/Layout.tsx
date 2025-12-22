
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
    <footer className="bg-oak text-white pt-20 pb-10 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12 mb-10">
        <div className="space-y-6">
          <Link to="/" className="flex flex-col items-start">
            <Logo className="h-16" variant="light" showText={true} />
          </Link>
          <p className="text-gray-400 leading-relaxed font-light text-sm">
            Crafting legacies in Accra. NewOak Limited is your trusted partner for high-quality estates in Haatso, Musuku, and Ashongman.
          </p>
          <div className="flex space-x-4">
            <Instagram className="w-5 h-5 text-gray-400 hover:text-gold cursor-pointer transition-colors" />
            <Linkedin className="w-5 h-5 text-gray-400 hover:text-gold cursor-pointer transition-colors" />
            <Twitter className="w-5 h-5 text-gray-400 hover:text-gold cursor-pointer transition-colors" />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-serif text-xl text-gold">Our Locations</h4>
          <div className="space-y-4 text-sm text-gray-400 font-light">
            <div>
              <p className="text-white font-bold uppercase text-[10px] tracking-widest mb-1">Main Office</p>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gold mt-1 shrink-0" />
                <span>Musuku Junction, Ashongman Estate, Accra, Ghana</span>
              </div>
            </div>
            <div>
              <p className="text-white font-bold uppercase text-[10px] tracking-widest mb-1">Project Office</p>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gold mt-1 shrink-0" />
                <span>Opposite Wisconsin University, Haatso, Accra</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-serif text-xl text-gold">Connect</h4>
          <ul className="space-y-4 text-sm text-gray-400 font-light">
            <li className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gold" />
              <a href="mailto:sales@newoaklimited.com" className="hover:text-gold transition-colors">sales@newoaklimited.com</a>
            </li>
            <li className="flex flex-col space-y-1">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gold" />
                <span>0244517076 | 0246273940</span>
              </div>
              <div className="pl-7">
                <span>0244098615 | 0243803086</span>
              </div>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-xl text-gold mb-6">Inquiry</h4>
          <p className="text-xs text-gray-400 mb-4">Request a property catalog for our newest developments.</p>
          <div className="flex">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-transparent border border-gray-700 px-4 py-2 w-full focus:outline-none focus:border-gold text-sm"
            />
            <button className="bg-gold px-4 py-2 hover:bg-gold-dark transition-colors">Join</button>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-500 text-xs tracking-widest uppercase">
        <span
          onDoubleClick={handleCopyrightDoubleClick}
          className="cursor-default select-none"
          title=""
        >
          &copy;
        </span>
        {' '}{new Date().getFullYear()} NewOak Limited Ghana. Built with Excellence.
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
