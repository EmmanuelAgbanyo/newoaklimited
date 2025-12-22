
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Edit3, Home, Users, LayoutDashboard, LogOut, Check, X, 
  Search, Filter, Settings, Eye, EyeOff, Upload, FileImage, Link as LinkIcon,
  TrendingUp, BarChart3, Activity, Clock, MoreVertical, Star, ShieldCheck, Video, RefreshCw, Save,
  AlertTriangle, Database, Cpu, PanelLeftClose, PanelLeftOpen, Building2, Calendar, MapPin, Loader2, Image as ImageIcon,
  GripVertical, ChevronDown, ChevronRight, Mail, Lock
} from 'lucide-react';
import { INITIAL_PROPERTIES } from '../constants';
import { Property, PropertyCategory, Booking, BookingStatus } from '../types';
import { Logo } from '../components/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onValue, set, push, remove, update } from 'firebase/database';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const corporateVideoInputRef = useRef<HTMLInputElement>(null);
  const propertyImageInputRef = useRef<HTMLInputElement>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'visits' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  const [isHeroUploading, setIsHeroUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [hasCustomHero, setHasCustomHero] = useState(false);
  const [hasCustomVideo, setHasCustomVideo] = useState(false);
  
  // Property State
  const [properties, setProperties] = useState<Property[]>([]);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  
  // Modal specific image management
  const [formImages, setFormImages] = useState<string[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Inquiry State
  const [inquiries, setInquiries] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Properties Listener
    const propertiesRef = ref(db, 'properties');
    const unsubscribeProps = onValue(propertiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setProperties(list);
      } else {
        setProperties([]);
      }
    });

    // Inquiries Listener
    const inquiriesRef = ref(db, 'inquiries');
    const unsubscribeInquiries = onValue(inquiriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setInquiries(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setInquiries([]);
      }
    });

    // Settings Listeners
    const heroRef = ref(db, 'settings/heroImage');
    const unsubscribeHero = onValue(heroRef, (snapshot) => {
      setHasCustomHero(!!snapshot.val());
    });

    const videoRef = ref(db, 'settings/corporateVideo');
    const unsubscribeVideo = onValue(videoRef, (snapshot) => {
      setHasCustomVideo(!!snapshot.val());
    });

    return () => {
      unsubscribeProps();
      unsubscribeInquiries();
      unsubscribeHero();
      unsubscribeVideo();
    };
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoginError(error.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const seedInitialData = async () => {
    if (properties.length > 0) {
      alert("Portfolio already initialized.");
      return;
    }
    const propertiesRef = ref(db, 'properties');
    for (const prop of INITIAL_PROPERTIES) {
      const newPropRef = push(propertiesRef);
      await set(newPropRef, prop);
    }
    alert("Portfolio initialized with NewOak Collection.");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleExpand = (id: string) => {
    if (!isSidebarOpen) setIsSidebarOpen(true);
    setExpandedItem(expandedItem === id ? null : id);
  };

  const openPropertyModal = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormImages([...property.images]);
    } else {
      setEditingProperty(null);
      setFormImages([]);
    }
    setIsPropertyModalOpen(true);
  };

  const deleteProperty = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this asset from the portfolio?")) {
      const propertyRef = ref(db, `properties/${id}`);
      await remove(propertyRef);
    }
  };

  const handlePropertySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const propertyData = {
      title: formData.get('title') as string,
      price: Number(formData.get('price')),
      location: formData.get('location') as string,
      description: formData.get('description') as string,
      beds: Number(formData.get('beds')),
      baths: Number(formData.get('baths')),
      sqft: Number(formData.get('sqft')),
      category: formData.get('category') as PropertyCategory,
      featured: formData.get('featured') === 'on',
      images: formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'],
      coordinates: editingProperty?.coordinates || { lat: 5.68, lng: -0.2 }
    };

    if (editingProperty) {
      const propertyRef = ref(db, `properties/${editingProperty.id}`);
      await update(propertyRef, propertyData);
    } else {
      const propertiesRef = ref(db, 'properties');
      const newPropRef = push(propertiesRef);
      await set(newPropRef, propertyData);
    }

    setIsPropertyModalOpen(false);
    setEditingProperty(null);
    setFormImages([]);
  };

  const handleDragStart = (index: number) => setDraggedItemIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const items = [...formImages];
    const draggedItem = items[draggedItemIndex];
    items.splice(draggedItemIndex, 1);
    items.splice(index, 0, draggedItem);
    setFormImages(items);
    setDraggedItemIndex(index);
  };
  const handleDragEnd = () => setDraggedItemIndex(null);

  const addImageToForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormImages(prev => [...prev, base64]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImageFromForm = (index: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateInquiryStatus = async (id: string, status: BookingStatus) => {
    const inquiryRef = ref(db, `inquiries/${id}`);
    await update(inquiryRef, { status });
  };

  const deleteInquiry = async (id: string) => {
    if (window.confirm("Delete this inquiry record?")) {
      const inquiryRef = ref(db, `inquiries/${id}`);
      await remove(inquiryRef);
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Check for image MIME type
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file.");
      return;
    }
    // Explicit 3MB limit
    if (file.size > 3 * 1024 * 1024) {
      alert("Hero image exceeds 3MB limit. Please compress or select a smaller image.");
      return;
    }
    setIsHeroUploading(true);
    const reader = new FileReader();
    reader.onerror = () => {
      alert("Error reading file. Please try again.");
      setIsHeroUploading(false);
    };
    reader.onload = async (event) => {
      try {
        const base64String = event.target?.result as string;
        await set(ref(db, 'settings/heroImage'), base64String);
        alert("Homepage Hero Image updated successfully.");
      } catch (err) {
        console.error("Upload error:", err);
        alert("Failed to sync hero image to the cloud.");
      } finally {
        setIsHeroUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCorporateVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Video file exceeds 8MB limit. Please compress.");
      return;
    }
    setIsVideoUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      await set(ref(db, 'settings/corporateVideo'), base64String);
      setIsVideoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const resetHero = async () => {
    if (window.confirm("Revert 'Homepage Hero Image' to the architectural default?")) {
      await remove(ref(db, 'settings/heroImage'));
      alert("Hero Image reset.");
    }
  };

  const resetVideo = async () => {
    if (window.confirm("Reset Corporate Video to default?")) {
      await remove(ref(db, 'settings/corporateVideo'));
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { 
      id: 'properties', 
      label: 'Assets', 
      icon: Building2,
      children: [
        { label: 'View Portfolio', action: () => setActiveTab('properties') },
        { label: 'Register New', action: () => openPropertyModal() }
      ]
    },
    { 
      id: 'visits', 
      label: 'Inquiries', 
      icon: Calendar,
      children: [
        { label: 'All Records', action: () => setActiveTab('visits') },
        { label: 'Confirmed', action: () => setActiveTab('visits') }
      ]
    },
    { id: 'settings', label: 'Terminal', icon: Settings },
  ];

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-oak flex items-center justify-center">
        <Loader2 className="animate-spin text-gold w-10 h-10" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-oak flex items-center justify-center p-6 selection:bg-gold selection:text-white">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gold"></div>
          
          <div className="flex justify-center mb-10">
            <Logo variant="dark" className="h-16" />
          </div>
          
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-oak mb-2">Central Command</h2>
            <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-bold">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-1">Email Terminal</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors" />
                <input 
                  type="email" 
                  placeholder="admin@newoak.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-gray-50 border ${loginError ? 'border-red-500' : 'border-gray-100'} p-4 pl-12 rounded-2xl text-sm focus:outline-none focus:border-gold/50 focus:bg-white transition-all`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-1">Access Key</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-gray-50 border ${loginError ? 'border-red-500' : 'border-gray-100'} p-4 pl-12 rounded-2xl text-sm focus:outline-none focus:border-gold/50 focus:bg-white transition-all`}
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 p-4 rounded-xl flex items-center space-x-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={16} />
                <p className="text-[10px] font-bold uppercase tracking-widest">Authentication Failed</p>
              </div>
            )}

            <button 
              disabled={isLoggingIn}
              className="w-full bg-oak text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-oak/20 active:scale-95 flex items-center justify-center"
            >
              {isLoggingIn ? <Loader2 className="animate-spin mr-2" size={16} /> : "Initialize Session"}
            </button>
            
            <div className="pt-6 border-t border-gray-50 text-center">
              <Link to="/" className="inline-block text-gray-400 text-[9px] uppercase font-bold tracking-[0.2em] hover:text-gold transition-colors">
                Return to Public Interface
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {isPropertyModalOpen && (
        <div className="fixed inset-0 z-[100] bg-oak/60 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="bg-oak p-6 flex justify-between items-center text-white">
              <h3 className="font-serif text-xl">{editingProperty ? 'Edit Asset' : 'Register New Asset'}</h3>
              <button onClick={() => {setIsPropertyModalOpen(false); setEditingProperty(null); setFormImages([]);}}><X /></button>
            </div>
            <form onSubmit={handlePropertySubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Title</label>
                  <input name="title" defaultValue={editingProperty?.title} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Location</label>
                  <input name="location" defaultValue={editingProperty?.location} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Category</label>
                  <select name="category" defaultValue={editingProperty?.category || PropertyCategory.RESIDENTIAL} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none">
                    {Object.values(PropertyCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Price (USD)</label>
                  <input name="price" type="number" defaultValue={editingProperty?.price} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Internal SQFT</label>
                  <input name="sqft" type="number" defaultValue={editingProperty?.sqft} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Beds</label>
                  <input name="beds" type="number" defaultValue={editingProperty?.beds} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Baths</label>
                  <input name="baths" type="number" defaultValue={editingProperty?.baths} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Description</label>
                  <textarea name="description" defaultValue={editingProperty?.description} rows={3} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none resize-none" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Property Imagery (Drag to Reorder)</label>
                  <button type="button" onClick={() => propertyImageInputRef.current?.click()} className="flex items-center space-x-2 text-gold text-[10px] uppercase font-bold tracking-widest hover:text-gold-dark transition-colors">
                    <Plus size={14} />
                    <span>Add Image</span>
                  </button>
                  <input type="file" ref={propertyImageInputRef} className="hidden" accept="image/*" onChange={addImageToForm} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[100px] p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  {formImages.map((img, index) => (
                    <div 
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-move transition-all ${draggedItemIndex === index ? 'opacity-50 scale-95 border-gold' : 'border-white shadow-sm hover:border-gold/50'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <GripVertical className="text-white" size={20} />
                        <button type="button" onClick={() => removeImageFromForm(index)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <input name="featured" type="checkbox" defaultChecked={editingProperty?.featured} className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold" id="feat-check" />
                <label htmlFor="feat-check" className="text-xs font-bold uppercase tracking-widest text-oak">Feature in Hero Collection</label>
              </div>
              <button type="submit" className="w-full bg-gold text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gold-dark transition-all shadow-xl shadow-gold/20">
                {editingProperty ? 'Commit Update' : 'Initialize Asset Entry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-oak text-white transition-all duration-300 ease-in-out z-50 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
            <Logo variant="light" className="h-8" showText={false} />
          </div>
          <button onClick={toggleSidebar} className="p-2 hover:bg-white/10 rounded-lg text-gold transition-colors">
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
        </div>
        <nav className="flex-grow py-8 px-4 space-y-1">
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItem === item.id;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpand(item.id);
                    } else {
                      setActiveTab(item.id as any);
                      setExpandedItem(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${isActive && !hasChildren ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className="flex items-center space-x-4">
                    <item.icon size={20} className={(isActive && !hasChildren) ? 'text-white' : 'text-gold'} />
                    {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>}
                  </div>
                  {isSidebarOpen && hasChildren && (
                    <div className="transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                      <ChevronDown size={14} />
                    </div>
                  )}
                </button>
                
                {isSidebarOpen && hasChildren && isExpanded && (
                  <div className="pl-12 space-y-1 animate-in slide-in-from-top-1 duration-200">
                    {item.children.map((child, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => {
                          child.action();
                          setActiveTab(item.id as any);
                        }}
                        className="w-full text-left p-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gold transition-colors"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center space-x-4 p-4 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">Terminate</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-grow transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-white border-b border-gray-100 p-8 flex justify-between items-center sticky top-0 z-40">
          <div>
            <h1 className="font-serif text-3xl text-oak capitalize">{activeTab}</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">NewOak Management Cloud</p>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={seedInitialData}
              className="px-4 py-2 border border-gold text-gold rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all"
            >
              Seed Data
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs font-bold text-oak">Admin Console</p>
                <p className="text-[9px] text-gold uppercase tracking-tighter">Level 5 Access</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-oak flex items-center justify-center text-gold border border-gold/20">
                <ShieldCheck size={18} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Portfolio Value', val: `$${(properties.reduce((acc, p) => acc + (p.price || 0), 0) / 1000000).toFixed(1)}M`, icon: TrendingUp, color: 'text-green-500' },
                  { label: 'Active Listings', val: properties.length, icon: Building2, color: 'text-gold' },
                  { label: 'Client Inquiries', val: inquiries.length, icon: Users, color: 'text-blue-500' },
                  { label: 'System Health', val: '100%', icon: Activity, color: 'text-purple-500' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
                        <stat.icon size={20} />
                      </div>
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-serif text-oak">{stat.val}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-serif text-xl text-oak mb-8">Recent Inquiry Volume</h3>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const h = Math.floor(Math.random() * 80) + 10;
                      return (
                        <div key={i} className="flex-grow bg-gray-50 rounded-t-lg relative group transition-all">
                          <div className="absolute bottom-0 left-0 right-0 bg-gold/20 group-hover:bg-gold transition-all duration-500 rounded-t-lg" style={{ height: `${h}%` }}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-oak p-8 rounded-2xl shadow-xl flex flex-col justify-between">
                   <div>
                     <div className="flex items-center space-x-2 text-gold mb-6">
                       <Star size={16} fill="currentColor" />
                       <span className="text-[10px] uppercase font-bold tracking-widest">Market Intel</span>
                     </div>
                     <h3 className="text-white font-serif text-2xl mb-4">Sentiment Tracker</h3>
                     <p className="text-gray-400 text-sm leading-relaxed">
                       {inquiries.length > 0 ? (
                         <>High interest detected in <span className="text-white font-bold">{inquiries[0].propertyName}</span>. Overall market sentiment for Haatso enclaves remains bullish.</>
                       ) : (
                         "Awaiting regional data. Deploy listings to begin sentiment tracking."
                       )}
                     </p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                  <input type="text" placeholder="Filter Assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-gold" />
                </div>
                <button onClick={() => openPropertyModal()} className="bg-gold text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 hover:bg-gold-dark transition-all">
                  <Plus size={16} />
                  <span>New Listing</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400">
                      <th className="px-8 py-4 font-bold">Asset</th>
                      <th className="px-8 py-4 font-bold">Category</th>
                      <th className="px-8 py-4 font-bold">Location</th>
                      <th className="px-8 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {properties.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <img src={p.images[0]} className="w-12 h-12 rounded-lg object-cover" alt="" />
                            <div><p className="text-sm font-bold text-oak">{p.title}</p><p className="text-[10px] text-gray-400">NOAK-{p.id}</p></div>
                          </div>
                        </td>
                        <td className="px-8 py-6"><span className="text-[10px] font-bold uppercase tracking-tighter bg-gray-100 px-3 py-1 rounded-full text-gray-500">{p.category}</span></td>
                        <td className="px-8 py-6"><div className="flex items-center space-x-1 text-xs text-gray-500"><MapPin size={12} className="text-gold" /><span>{p.location}</span></div></td>
                        <td className="px-8 py-6 text-right space-x-2">
                          <Link to={`/property/${p.id}`} target="_blank" className="inline-block p-2 text-gray-400 hover:text-gold transition-colors"><Eye size={18} /></Link>
                          <button onClick={() => openPropertyModal(p)} className="p-2 text-gray-400 hover:text-gold transition-colors"><Edit3 size={18} /></button>
                          <button onClick={() => deleteProperty(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
              {inquiries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400">
                        <th className="px-8 py-4">Inquirer</th>
                        <th className="px-8 py-4">Asset Interested</th>
                        <th className="px-8 py-4">Requested Date</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {inquiries.map(i => (
                        <tr key={i.id} className="hover:bg-gray-50/50">
                          <td className="px-8 py-6">
                            <p className="text-sm font-bold text-oak">{i.userName}</p>
                            <p className="text-[10px] text-gray-400">{i.userEmail}</p>
                          </td>
                          <td className="px-8 py-6 text-xs text-gray-500">{i.propertyName}</td>
                          <td className="px-8 py-6 text-xs text-gray-500">{new Date(i.date).toLocaleDateString()}</td>
                          <td className="px-8 py-6">
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${i.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-700' : i.status === BookingStatus.CANCELLED ? 'bg-red-100 text-red-700' : 'bg-gold/10 text-gold'}`}>
                              {i.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right space-x-2">
                             <button onClick={() => updateInquiryStatus(i.id, BookingStatus.CONFIRMED)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><Check size={18} /></button>
                             <button onClick={() => updateInquiryStatus(i.id, BookingStatus.CANCELLED)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={18} /></button>
                             <button onClick={() => deleteInquiry(i.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <Calendar size={48} className="text-gray-100 mb-6" />
                  <h3 className="font-serif text-2xl text-oak mb-2">No Passive Records</h3>
                  <p className="text-gray-400 text-xs max-w-sm">Passive monitoring is active. New public inquiries will appear here automatically.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white p-10 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
              <h3 className="font-serif text-2xl text-oak mb-8">System Configuration</h3>
              <div className="space-y-8">
                {/* Hero Image Section */}
                <div className="flex flex-col space-y-4 p-6 bg-oak/5 rounded-xl border border-oak/5">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-xs font-bold text-oak">Homepage Hero Image</p>
                       <p className="text-[9px] text-gray-400 uppercase tracking-widest">Global static cover for the Hero section (Max 3MB)</p>
                     </div>
                     <div className="flex items-center space-x-3">
                       {hasCustomHero && (
                         <button 
                           onClick={resetHero} 
                           className="text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                         >
                           Reset Default
                         </button>
                       )}
                       <button 
                         onClick={() => heroImageInputRef.current?.click()} 
                         disabled={isHeroUploading} 
                         className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-all flex items-center space-x-2 disabled:opacity-50 shadow-sm"
                       >
                         {isHeroUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                         <span>{isHeroUploading ? 'Uploading...' : 'Change Hero'}</span>
                       </button>
                     </div>
                   </div>
                   <input 
                     type="file" 
                     ref={heroImageInputRef} 
                     className="hidden" 
                     accept="image/*" 
                     onChange={handleHeroImageUpload} 
                   />
                </div>

                {/* Corporate Video Section */}
                <div className="flex flex-col space-y-4 p-6 bg-oak/5 rounded-xl border border-oak/5">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-xs font-bold text-oak">Corporate Narrative Video</p>
                       <p className="text-[9px] text-gray-400 uppercase tracking-widest">Video asset for the narrative background (Max 8MB)</p>
                     </div>
                     <div className="flex items-center space-x-3">
                       {hasCustomVideo && <button onClick={resetVideo} className="text-red-500 text-[10px] font-bold uppercase tracking-widest hover:underline">Reset</button>}
                       <button onClick={() => corporateVideoInputRef.current?.click()} disabled={isVideoUploading} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-all flex items-center space-x-2 disabled:opacity-50">
                         {isVideoUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                         <span>{isVideoUploading ? 'Processing...' : 'Upload Video'}</span>
                       </button>
                     </div>
                   </div>
                   <input type="file" ref={corporateVideoInputRef} className="hidden" accept="video/mp4" onChange={handleCorporateVideoUpload} />
                </div>

                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <div className="flex items-center space-x-2 text-gold">
                    <Database size={16} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Cloud Sync Active</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">Changes to system configuration are applied globally in real-time. If assets fail to load, ensure file sizes are within the supported database limits.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
