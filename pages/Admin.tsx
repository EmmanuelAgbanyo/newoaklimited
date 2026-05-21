
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Edit3, Home, Users, LayoutDashboard, LogOut, Check, X,
  Search, Filter, Settings, Eye, EyeOff, Upload, FileImage, Link as LinkIcon,
  TrendingUp, BarChart3, Activity, Clock, MoreVertical, Star, ShieldCheck, Video, RefreshCw, Save,
  AlertTriangle, Database, Cpu, PanelLeftClose, PanelLeftOpen, Building2, Calendar, MapPin, Loader2, Image as ImageIcon,
  GripVertical, ChevronDown, ChevronRight, Mail, Lock, Hammer, FileText, Newspaper, Layers
} from 'lucide-react';
import { INITIAL_PROPERTIES, INITIAL_SERVICES, INITIAL_GALLERY, INITIAL_TEAM, INITIAL_UPCOMING_PROJECTS } from '../constants';
import { Property, PropertyCategory, Booking, BookingStatus, UpcomingProject, ProjectStatus, BlogPost, TeamMember, GalleryItem, ServiceItem } from '../types';
import { Logo } from '../components/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { ref, onValue, set, push, remove, update } from 'firebase/database';

const compressImage = (file: File, maxWidth = 1200, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'visits' | 'projects' | 'blog' | 'team' | 'gallery' | 'services' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const [isHeroUploading, setIsHeroUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [hasCustomHero, setHasCustomHero] = useState(false);
  const [hasCustomVideo, setHasCustomVideo] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [showTeam, setShowTeam] = useState(true);

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

  // Upcoming Projects State
  const [upcomingProjects, setUpcomingProjects] = useState<UpcomingProject[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<UpcomingProject | null>(null);
  const [projectFormImages, setProjectFormImages] = useState<string[]>([]);
  const [projectHighlights, setProjectHighlights] = useState<string[]>([]);
  const projectImageInputRef = useRef<HTMLInputElement>(null);

  // Blog State
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [blogCoverImage, setBlogCoverImage] = useState<string>('');
  const [blogTags, setBlogTags] = useState<string[]>([]);
  const blogCoverInputRef = useRef<HTMLInputElement>(null);

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [teamImage, setTeamImage] = useState<string>('');
  const teamImageInputRef = useRef<HTMLInputElement>(null);

  // Gallery State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [galleryImage, setGalleryImage] = useState<string>('');
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

  // Custom Toast State
  interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Custom Delete Confirm State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  // Reordering state
  const [draggedGalleryItemIndex, setDraggedGalleryItemIndex] = useState<number | null>(null);

  // Bulk Upload states
  const [isDraggingOverDropzone, setIsDraggingOverDropzone] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState('');


  // Services State
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceItem, setEditingServiceItem] = useState<ServiceItem | null>(null);
  const [serviceImage, setServiceImage] = useState<string>('');
  const [serviceFeatures, setServiceFeatures] = useState<string[]>([]);
  const serviceImageInputRef = useRef<HTMLInputElement>(null);

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
        setProperties(INITIAL_PROPERTIES);
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
    const heroRef = ref(db, 'settings/heroImages');
    const unsubscribeHero = onValue(heroRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        setHeroImages(data);
        setHasCustomHero(data.length > 0);
      } else {
        setHeroImages([]);
        setHasCustomHero(false);
      }
    });

    const videoRef = ref(db, 'settings/corporateVideo');
    const unsubscribeVideo = onValue(videoRef, (snapshot) => {
      setHasCustomVideo(!!snapshot.val());
    });

    const showTeamRef = ref(db, 'settings/showTeamSection');
    const unsubscribeShowTeam = onValue(showTeamRef, (snapshot) => {
      // Default to true if not set
      const val = snapshot.val();
      setShowTeam(val !== false);
    });

    // Upcoming Projects Listener
    const projectsRef = ref(db, 'upcomingProjects');
    const unsubscribeProjects = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setUpcomingProjects(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setUpcomingProjects(INITIAL_UPCOMING_PROJECTS);
      }
    });

    // Blog Posts Listener
    const blogRef = ref(db, 'blogPosts');
    const unsubscribeBlog = onValue(blogRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setBlogPosts(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setBlogPosts([]);
      }
    });

    // Team Listener
    const teamRef = ref(db, 'team');
    const unsubscribeTeam = onValue(teamRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setTeamMembers(list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      } else {
        setTeamMembers(INITIAL_TEAM);
      }
    });

    // Gallery Listener
    const galleryRef = ref(db, 'designGallery');
    const unsubscribeGallery = onValue(galleryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        // Premium visual ordering sort: sort by order index, then fall back to createdAt desc
        const sorted = list.sort((a, b) => {
          const orderA = a.order !== undefined ? a.order : 999999;
          const orderB = b.order !== undefined ? b.order : 999999;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setGalleryItems(sorted);
      } else {
        setGalleryItems(INITIAL_GALLERY);
      }
    });

    // Services Listener
    const servicesRef = ref(db, 'services');
    const unsubscribeServices = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setServiceItems(list.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } else {
        setServiceItems(INITIAL_SERVICES);
      }
    });

    return () => {
      unsubscribeProps();
      unsubscribeInquiries();
      unsubscribeHero();
      unsubscribeVideo();
      unsubscribeShowTeam();
      unsubscribeProjects();
      unsubscribeProjects();
      unsubscribeBlog();
      unsubscribeTeam();
      unsubscribeGallery();
      unsubscribeServices();
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

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.warn("Google popup login failed, trying redirect fallback:", error);
      const isBrowserBlock = 
        error.code === 'auth/popup-blocked' || 
        error.code === 'auth/web-storage-unsupported' ||
        error.message?.toLowerCase().includes('popup') ||
        error.message?.toLowerCase().includes('storage') ||
        error.message?.toLowerCase().includes('blocked') ||
        error.message?.toLowerCase().includes('cookie');

      if (isBrowserBlock) {
        try {
          setLoginError("Browser blocked popup auth. Initializing secure redirect sign-in instead...");
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(auth, provider);
        } catch (redirectError: any) {
          setLoginError(`Google Authentication failed: ${error.message} (Redirect error: ${redirectError.message})`);
        }
      } else {
        setLoginError(error.message || "Google Authentication failed. Please try again.");
      }
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
    try {
      const isSeededCompleteRef = ref(db, 'settings/isSeededComplete');
      
      // Seed all 5 core collections with their premium design values
      for (const prop of INITIAL_PROPERTIES) {
        await set(ref(db, `properties/${prop.id}`), prop);
      }
      for (const svc of INITIAL_SERVICES) {
        await set(ref(db, `services/${svc.id}`), svc);
      }
      for (const item of INITIAL_GALLERY) {
        await set(ref(db, `designGallery/${item.id}`), item);
      }
      for (const member of INITIAL_TEAM) {
        await set(ref(db, `team/${member.id}`), member);
      }
      for (const proj of INITIAL_UPCOMING_PROJECTS) {
        await set(ref(db, `upcomingProjects/${proj.id}`), proj);
      }

      await set(isSeededCompleteRef, true);
      await set(ref(db, 'settings/isSeeded'), true);
      showToast("Premium real estate ecosystem successfully seeded to Firebase!", "success");
    } catch (err: any) {
      showToast(`Error seeding ecosystem: ${err.message}`, "error");
    }
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
      beds: formData.get('beds') ? Number(formData.get('beds')) : undefined,
      baths: formData.get('baths') ? Number(formData.get('baths')) : undefined,
      sqft: formData.get('sqft') ? Number(formData.get('sqft')) : undefined,
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
    // Maximum 10 images in carousel
    if (heroImages.length >= 10) {
      alert("Maximum of 10 hero images allowed. Please remove some images first.");
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
        const updatedImages = [...heroImages, base64String];
        await set(ref(db, 'settings/heroImages'), updatedImages);
        alert("Hero image added to carousel successfully.");
      } catch (err) {
        console.error("Upload error:", err);
        alert("Failed to sync hero image to the cloud.");
      } finally {
        setIsHeroUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeHeroImage = async (index: number) => {
    if (window.confirm("Remove this image from the hero carousel?")) {
      const updatedImages = heroImages.filter((_, i) => i !== index);
      await set(ref(db, 'settings/heroImages'), updatedImages);
    }
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
    if (window.confirm("Remove all hero carousel images and revert to the default?")) {
      await remove(ref(db, 'settings/heroImages'));
      alert("Hero carousel reset to default.");
    }
  };

  const resetVideo = async () => {
    if (window.confirm("Reset Corporate Video to default?")) {
      await remove(ref(db, 'settings/corporateVideo'));
    }
  };

  const handleToggleTeamVisibility = async () => {
    const newVal = !showTeam;
    try {
      await set(ref(db, 'settings/showTeamSection'), newVal);
      showToast(
        newVal
          ? '✓ Visionary Leadership section is now VISIBLE on the homepage.'
          : '✓ Visionary Leadership section is now HIDDEN from the homepage.',
        'success'
      );
    } catch (err: any) {
      showToast(`Failed to update visibility: ${err.message}`, 'error');
    }
  };

  // Upcoming Projects Functions
  const openProjectModal = (project?: UpcomingProject) => {
    if (project) {
      setEditingProject(project);
      setProjectFormImages([...project.images]);
      setProjectHighlights([...(project.highlights || [])]);
    } else {
      setEditingProject(null);
      setProjectFormImages([]);
      setProjectHighlights([]);
    }
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const projectData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      location: formData.get('location') as string,
      expectedCompletion: formData.get('expectedCompletion') as string,
      status: formData.get('status') as ProjectStatus,
      estimatedUnits: Number(formData.get('estimatedUnits')) || undefined,
      featured: formData.get('featured') === 'on',
      images: projectFormImages.length > 0 ? projectFormImages : ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200'],
      highlights: projectHighlights.filter(h => h.trim() !== ''),
      createdAt: editingProject?.createdAt || new Date().toISOString(),
    };

    if (editingProject) {
      const projectRef = ref(db, `upcomingProjects/${editingProject.id}`);
      await update(projectRef, projectData);
    } else {
      const projectsRef = ref(db, 'upcomingProjects');
      const newProjectRef = push(projectsRef);
      await set(newProjectRef, projectData);
    }

    setIsProjectModalOpen(false);
    setEditingProject(null);
    setProjectFormImages([]);
    setProjectHighlights([]);
  };

  const deleteProject = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const projectRef = ref(db, `upcomingProjects/${id}`);
      await remove(projectRef);
    }
  };

  const addProjectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProjectFormImages(prev => [...prev, base64]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeProjectImage = (index: number) => {
    setProjectFormImages(prev => prev.filter((_, i) => i !== index));
  };

  const addHighlight = () => {
    setProjectHighlights(prev => [...prev, '']);
  };

  const updateHighlight = (index: number, value: string) => {
    setProjectHighlights(prev => prev.map((h, i) => i === index ? value : h));
  };

  const removeHighlight = (index: number) => {
    setProjectHighlights(prev => prev.filter((_, i) => i !== index));
  };

  // Blog Functions
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const openBlogModal = (post?: BlogPost) => {
    if (post) {
      setEditingBlogPost(post);
      setBlogCoverImage(post.coverImage || '');
      setBlogTags([...(post.tags || [])]);
    } else {
      setEditingBlogPost(null);
      setBlogCoverImage('');
      setBlogTags([]);
    }
    setIsBlogModalOpen(true);
  };

  const handleBlogSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;

    const blogData = {
      title,
      slug: editingBlogPost?.slug || generateSlug(title),
      excerpt: formData.get('excerpt') as string,
      content: formData.get('content') as string,
      author: formData.get('author') as string,
      category: formData.get('category') as string,
      coverImage: blogCoverImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
      tags: blogTags.filter(t => t.trim() !== ''),
      published: formData.get('published') === 'on',
      publishedAt: editingBlogPost?.publishedAt || new Date().toISOString(),
      createdAt: editingBlogPost?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingBlogPost) {
      const blogRef = ref(db, `blogPosts/${editingBlogPost.id}`);
      await update(blogRef, blogData);
    } else {
      const blogsRef = ref(db, 'blogPosts');
      const newBlogRef = push(blogsRef);
      await set(newBlogRef, blogData);
    }

    setIsBlogModalOpen(false);
    setEditingBlogPost(null);
    setBlogCoverImage('');
    setBlogTags([]);
  };

  const deleteBlogPost = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      const blogRef = ref(db, `blogPosts/${id}`);
      await remove(blogRef);
    }
  };

  const handleBlogCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBlogCoverImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addTag = () => {
    setBlogTags(prev => [...prev, '']);
  };

  const updateTag = (index: number, value: string) => {
    setBlogTags(prev => prev.map((t, i) => i === index ? value : t));
  };

  const removeTag = (index: number) => {
    setBlogTags(prev => prev.filter((_, i) => i !== index));
  };

  // Team Functions
  const openTeamModal = (member?: TeamMember) => {
    if (member) {
      setEditingTeamMember(member);
      setTeamImage(member.image || '');
    } else {
      setEditingTeamMember(null);
      setTeamImage('');
    }
    setIsTeamModalOpen(true);
  };

  const handleTeamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const teamData = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      bio: formData.get('bio') as string,
      image: teamImage || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800',
      linkedin: formData.get('linkedin') as string,
      email: formData.get('email') as string,
      createdAt: editingTeamMember?.createdAt || new Date().toISOString(),
    };

    if (editingTeamMember) {
      const memberRef = ref(db, `team/${editingTeamMember.id}`);
      await update(memberRef, teamData);
    } else {
      const teamRef = ref(db, 'team');
      const newMemberRef = push(teamRef);
      await set(newMemberRef, teamData);
    }

    setIsTeamModalOpen(false);
    setEditingTeamMember(null);
    setTeamImage('');
  };

  const deleteTeamMember = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
      const memberRef = ref(db, `team/${id}`);
      await remove(memberRef);
    }
  };

  const handleTeamImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setTeamImage(compressed);
    } catch (error) {
      console.error('Error compressing image:', error);
    }
    e.target.value = '';
  };

  // Gallery Management
  const openGalleryModal = (item?: GalleryItem) => {
    if (item) {
      setEditingGalleryItem(item);
      setGalleryImage(item.image);
    } else {
      setEditingGalleryItem(null);
      setGalleryImage('');
    }
    setIsGalleryModalOpen(true);
  };

  const deleteGalleryItem = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Showcase Asset',
      message: 'Are you sure you want to permanently delete this asset from the design gallery? This action is immediate and cannot be undone.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const itemRef = ref(db, `designGallery/${id}`);
          await remove(itemRef);
          showToast('Image removed from showcase successfully.', 'success');
        } catch (error: any) {
          showToast(`Delete failed: ${error.message}`, 'error');
        }
      },
      onCancel: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const subtitle = (form.elements.namedItem('subtitle') as HTMLInputElement).value;
    const isMain = (form.elements.namedItem('isMain') as HTMLInputElement).checked;

    let targetId = editingGalleryItem?.id;
    if (!targetId) {
      const itemsRef = ref(db, 'designGallery');
      const newItemRef = push(itemsRef);
      targetId = newItemRef.key as string;
    }

    const itemData = {
      title,
      subtitle,
      image: galleryImage || 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800',
      isMain,
      order: editingGalleryItem?.order !== undefined ? editingGalleryItem.order : galleryItems.length,
      createdAt: editingGalleryItem ? editingGalleryItem.createdAt : new Date().toISOString()
    };

    const updates: Record<string, any> = {};
    updates[`designGallery/${targetId}`] = itemData;

    // Transactional enforcement: If this item is Main, set isMain of all other items to false
    if (isMain) {
      galleryItems.forEach(item => {
        if (item.id !== targetId && item.isMain) {
          updates[`designGallery/${item.id}/isMain`] = false;
        }
      });
    }

    try {
      await update(ref(db), updates);
      showToast(editingGalleryItem ? 'Gallery item updated successfully.' : 'New gallery item created.', 'success');
      setIsGalleryModalOpen(false);
    } catch (error: any) {
      showToast(`Database write failed: ${error.message}`, 'error');
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setGalleryImage(compressed);
        showToast('Image uploaded and optimized successfully.', 'success');
      } catch (error) {
        showToast('Failed to optimize image. Check format and size.', 'error');
      }
    }
  };

  // Instant Main Feature Toggle
  const toggleGalleryMainFeature = async (id: string, currentIsMain: boolean) => {
    const nextIsMain = !currentIsMain;
    const updates: Record<string, any> = {};
    updates[`designGallery/${id}/isMain`] = nextIsMain;

    if (nextIsMain) {
      galleryItems.forEach(item => {
        if (item.id !== id && item.isMain) {
          updates[`designGallery/${item.id}/isMain`] = false;
        }
      });
    }

    try {
      await update(ref(db), updates);
      showToast(nextIsMain ? 'Set as Main Feature asset.' : 'Main Feature disabled.', 'success');
    } catch (error: any) {
      showToast(`Toggle failed: ${error.message}`, 'error');
    }
  };

  // Bulk Upload Handler
  const handleBulkUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsBulkUploading(true);
    let successCount = 0;

    try {
      const updates: Record<string, any> = {};
      const itemsRef = ref(db, 'designGallery');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          showToast(`Skipped ${file.name}: Not an image`, 'info');
          continue;
        }

        setBulkUploadProgress(`Optimizing ${file.name} (${i + 1}/${files.length})...`);
        const compressed = await compressImage(file);

        const newRef = push(itemsRef);
        const newKey = newRef.key as string;

        updates[`designGallery/${newKey}`] = {
          title: file.name.split('.')[0].replace(/[-_]/g, ' '),
          subtitle: 'Architectural Showcase',
          image: compressed,
          isMain: false,
          order: galleryItems.length + successCount,
          createdAt: new Date().toISOString()
        };
        successCount++;
      }

      if (successCount > 0) {
        setBulkUploadProgress('Syncing to Cloud Database...');
        await update(ref(db), updates);
        showToast(`Bulk upload complete! ${successCount} assets added.`, 'success');
      } else {
        showToast('No valid image files were uploaded.', 'error');
      }
    } catch (error: any) {
      showToast(`Bulk upload failed: ${error.message}`, 'error');
    } finally {
      setIsBulkUploading(false);
      setBulkUploadProgress('');
    }
  };

  // Visual Drag and Drop Sorting Handlers
  const handleGalleryDragStart = (index: number) => {
    setDraggedGalleryItemIndex(index);
  };

  const handleGalleryDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedGalleryItemIndex === null || draggedGalleryItemIndex === index) return;
    const items = [...galleryItems];
    const dragged = items[draggedGalleryItemIndex];
    items.splice(draggedGalleryItemIndex, 1);
    items.splice(index, 0, dragged);
    setGalleryItems(items);
    setDraggedGalleryItemIndex(index);
  };

  const handleGalleryDragEnd = async () => {
    setDraggedGalleryItemIndex(null);
    const updates: Record<string, any> = {};
    galleryItems.forEach((item, index) => {
      updates[`designGallery/${item.id}/order`] = index;
    });

    try {
      await update(ref(db), updates);
      showToast('Visual layout sequence synchronized.', 'success');
    } catch (error: any) {
      showToast(`Failed to sync reorder sequence: ${error.message}`, 'error');
    }
  };

  // Service Management
  const openServiceModal = (item?: ServiceItem) => {
    if (item) {
      setEditingServiceItem(item);
      setServiceImage(item.image);
      setServiceFeatures(item.features || []);
    } else {
      setEditingServiceItem(null);
      setServiceImage('');
      setServiceFeatures([]);
    }
    setIsServiceModalOpen(true);
  };

  const deleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this service?')) {
      const itemRef = ref(db, `services/${id}`);
      await remove(itemRef);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
    const icon = (form.elements.namedItem('icon') as HTMLSelectElement).value;

    const itemData: Partial<ServiceItem> = {
      title,
      description,
      features: serviceFeatures,
      image: serviceImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
      icon,
      order: editingServiceItem ? editingServiceItem.order : serviceItems.length + 1
    };

    if (editingServiceItem) {
      const itemRef = ref(db, `services/${editingServiceItem.id}`);
      await update(itemRef, itemData);
    } else {
      const itemsRef = ref(db, 'services');
      const newItemRef = push(itemsRef);
      await set(newItemRef, itemData);
    }
    setIsServiceModalOpen(false);
  };

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setServiceImage(compressed);
      } catch (error) {
        console.error('Error compressing service image:', error);
      }
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
      id: 'projects',
      label: 'Projects',
      icon: Hammer,
      children: [
        { label: 'View All', action: () => setActiveTab('projects') },
        { label: 'Add New', action: () => openProjectModal() }
      ]
    },
    {
      id: 'blog',
      label: 'Blog',
      icon: Newspaper,
      children: [
        { label: 'All Posts', action: () => setActiveTab('blog') },
        { label: 'Create Post', action: () => openBlogModal() }
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
    {
      id: 'team',
      label: 'Team',
      icon: Users,
      children: [
        { label: 'View All', action: () => setActiveTab('team') },
        { label: 'Add Member', action: () => openTeamModal() }
      ]
    },
    {
      id: 'gallery',
      label: 'Design Gallery',
      icon: ImageIcon,
      children: [
        { label: 'View Gallery', action: () => setActiveTab('gallery') },
        { label: 'Add Image', action: () => openGalleryModal() }
      ]
    },
    {
      id: 'services',
      label: 'Services',
      icon: Layers,
      children: [
        { label: 'View All', action: () => setActiveTab('services') },
        { label: 'Add Service', action: () => openServiceModal() }
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
              <div className="bg-red-50 p-4 rounded-xl flex flex-col space-y-1.5 text-red-600 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center space-x-3">
                  <AlertTriangle size={16} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Authentication Failed</p>
                </div>
                <p className="text-[10px] text-left text-red-500 font-medium leading-relaxed break-words">{loginError}</p>
              </div>
            )}

            <button
              disabled={isLoggingIn}
              className="w-full bg-oak text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gold transition-all shadow-xl shadow-oak/20 active:scale-95 flex items-center justify-center"
            >
              {isLoggingIn ? <Loader2 className="animate-spin mr-2" size={16} /> : "Initialize Session"}
            </button>

            {/* Premium Google Sign-In Integration */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="mx-4 text-gray-400 text-[8px] uppercase tracking-widest font-bold">Or</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full bg-white border border-gray-200 text-oak py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:border-gold hover:text-gold transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign In with Google</span>
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
              <button onClick={() => { setIsPropertyModalOpen(false); setEditingProperty(null); setFormImages([]); }}><X /></button>
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
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Square Footage</label>
                  <input name="sqft" type="number" defaultValue={editingProperty?.sqft} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Beds</label>
                  <input name="beds" type="number" defaultValue={editingProperty?.beds} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Baths</label>
                  <input name="baths" type="number" defaultValue={editingProperty?.baths} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
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

      {/* Team Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-[100] bg-oak/60 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="bg-oak p-6 flex justify-between items-center text-white">
              <h3 className="font-serif text-xl">{editingTeamMember ? 'Edit Team Member' : 'Register New Member'}</h3>
              <button onClick={() => { setIsTeamModalOpen(false); setEditingTeamMember(null); setTeamImage(''); }}><X /></button>
            </div>
            <form onSubmit={handleTeamSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <div
                    className="w-24 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden group cursor-pointer"
                    onClick={() => teamImageInputRef.current?.click()}
                  >
                    {teamImage ? (
                      <img src={teamImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload size={20} className="mx-auto mb-1" />
                        <span className="text-[9px] uppercase font-bold">Photo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-[9px] uppercase font-bold">
                      Change
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Full Name</label>
                    <input name="name" defaultValue={editingTeamMember?.name} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm focus:border-gold focus:outline-none" placeholder="e.g. Richard K. Mensah" />
                  </div>
                  <input type="file" ref={teamImageInputRef} className="hidden" accept="image/*" onChange={handleTeamImageUpload} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Corporate Role</label>
                  <input name="role" defaultValue={editingTeamMember?.role} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm focus:border-gold focus:outline-none" placeholder="e.g. Chief Executive Officer" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Bio (Short)</label>
                  <textarea name="bio" defaultValue={editingTeamMember?.bio} rows={3} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm focus:border-gold focus:outline-none resize-none" placeholder="Brief executive summary..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">LinkedIn URL</label>
                    <input name="linkedin" defaultValue={editingTeamMember?.linkedin} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm focus:border-gold focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Email Address</label>
                    <input name="email" defaultValue={editingTeamMember?.email} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm focus:border-gold focus:outline-none" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-gold text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gold-dark transition-all shadow-xl shadow-gold/20">
                {editingTeamMember ? 'Update Profile' : 'Onboard Member'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[100] bg-oak/60 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="bg-oak p-6 flex justify-between items-center text-white">
              <h3 className="font-serif text-xl">{editingProject ? 'Edit Project' : 'New Project'}</h3>
              <button onClick={() => { setIsProjectModalOpen(false); setEditingProject(null); setProjectFormImages([]); setProjectHighlights([]); }}><X /></button>
            </div>
            <form onSubmit={handleProjectSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Title</label>
                  <input name="title" defaultValue={editingProject?.title} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Location</label>
                  <input name="location" defaultValue={editingProject?.location} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Project Highlights</label>
                  <button type="button" onClick={addHighlight} className="flex items-center space-x-2 text-gold text-[10px] uppercase font-bold tracking-widest hover:text-gold-dark transition-colors">
                    <Plus size={14} />
                    <span>Add Highlight</span>
                  </button>
                </div>
                <div className="space-y-2">          {projectHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      placeholder="e.g., 24-hour security"
                      className="flex-grow bg-gray-50 border border-gray-100 p-3 rounded-xl text-sm focus:border-gold focus:outline-none"
                    />
                    <button type="button" onClick={() => removeHighlight(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Project Images</label>
                  <button type="button" onClick={() => projectImageInputRef.current?.click()} className="flex items-center space-x-2 text-gold text-[10px] uppercase font-bold tracking-widest hover:text-gold-dark transition-colors">
                    <Plus size={14} />
                    <span>Add Image</span>
                  </button>
                  <input type="file" ref={projectImageInputRef} className="hidden" accept="image/*" onChange={addProjectImage} />
                </div>
                <div className="grid grid-cols-3 gap-4 min-h-[80px] p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  {projectFormImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-white shadow-sm">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeProjectImage(index)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <input name="featured" type="checkbox" defaultChecked={editingProject?.featured} className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold" id="project-feat-check" />
                <label htmlFor="project-feat-check" className="text-xs font-bold uppercase tracking-widest text-oak">Feature on Homepage</label>
              </div>
              <button type="submit" className="w-full bg-gold text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gold-dark transition-all shadow-xl shadow-gold/20">
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
            </form >
          </div >
        </div >
      )
      }

      {/* Blog Modal */}
      {
        isBlogModalOpen && (
          <div className="fixed inset-0 z-[100] bg-oak/60 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
              <div className="bg-oak p-6 flex justify-between items-center text-white">
                <h3 className="font-serif text-xl">{editingBlogPost ? 'Edit Blog Post' : 'Create New Post'}</h3>
                <button onClick={() => { setIsBlogModalOpen(false); setEditingBlogPost(null); setBlogCoverImage(''); setBlogTags([]); }}><X /></button>
              </div>
              <form onSubmit={handleBlogSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Title</label>
                    <input name="title" defaultValue={editingBlogPost?.title} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Author</label>
                    <input name="author" defaultValue={editingBlogPost?.author || 'NewOak Team'} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Category</label>
                    <input name="category" defaultValue={editingBlogPost?.category} placeholder="e.g., Market Insights" required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Excerpt (Short Summary)</label>
                    <textarea name="excerpt" defaultValue={editingBlogPost?.excerpt} rows={2} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none resize-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Content</label>
                    <textarea name="content" defaultValue={editingBlogPost?.content} rows={8} required className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-sm focus:border-gold focus:outline-none resize-none" placeholder="Write your blog post content here. Use new lines to separate paragraphs." />
                  </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Cover Image</label>
                    <button type="button" onClick={() => blogCoverInputRef.current?.click()} className="flex items-center space-x-2 text-gold text-[10px] uppercase font-bold tracking-widest hover:text-gold-dark transition-colors">
                      <Upload size={14} />
                      <span>Upload Image</span>
                    </button>
                    <input type="file" ref={blogCoverInputRef} className="hidden" accept="image/*" onChange={handleBlogCoverUpload} />
                  </div>
                  {blogCoverImage && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden">
                      <img src={blogCoverImage} className="w-full h-full object-cover" alt="Cover" />
                      <button type="button" onClick={() => setBlogCoverImage('')} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Tags</label>
                    <button type="button" onClick={addTag} className="flex items-center space-x-2 text-gold text-[10px] uppercase font-bold tracking-widest hover:text-gold-dark transition-colors">
                      <Plus size={14} />
                      <span>Add Tag</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blogTags.map((tag, index) => (
                      <div key={index} className="flex items-center space-x-1 bg-gray-50 rounded-full px-3 py-1">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder="Tag"
                          className="bg-transparent text-sm focus:outline-none w-20"
                        />
                        <button type="button" onClick={() => removeTag(index)} className="text-red-500 hover:text-red-600">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <input name="published" type="checkbox" defaultChecked={editingBlogPost?.published ?? true} className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold" id="publish-check" />
                  <label htmlFor="publish-check" className="text-xs font-bold uppercase tracking-widest text-oak">Publish Immediately</label>
                </div>
                <button type="submit" className="w-full bg-gold text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-gold-dark transition-all shadow-xl shadow-gold/20">
                  {editingBlogPost ? 'Update Post' : 'Publish Post'}
                </button>
              </form>
            </div>
          </div>
        )
      }

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

          {activeTab === 'projects' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-xl text-oak">Upcoming Projects</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Manage development pipeline</p>
                </div>
                <button onClick={() => openProjectModal()} className="bg-gold text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 hover:bg-gold-dark transition-all">
                  <Plus size={16} />
                  <span>New Project</span>
                </button>
              </div>
              {upcomingProjects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400">
                        <th className="px-8 py-4 font-bold">Project</th>
                        <th className="px-8 py-4 font-bold">Status</th>
                        <th className="px-8 py-4 font-bold">Location</th>
                        <th className="px-8 py-4 font-bold">Expected</th>
                        <th className="px-8 py-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {upcomingProjects.map(project => (
                        <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <img src={project.images[0]} className="w-12 h-12 rounded-lg object-cover" alt="" />
                              <div>
                                <p className="text-sm font-bold text-oak">{project.title}</p>
                                <p className="text-[10px] text-gray-400">{project.featured ? '⭐ Featured' : ''}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`text-[10px] font-bold uppercase tracking-tighter px-3 py-1 rounded-full ${project.status === ProjectStatus.IN_PROGRESS ? 'bg-gold/20 text-gold' :
                              project.status === ProjectStatus.COMING_SOON ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>{project.status}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <MapPin size={12} className="text-gold" />
                              <span>{project.location}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-xs text-gray-500">{project.expectedCompletion}</td>
                          <td className="px-8 py-6 text-right space-x-2">
                            <Link to="/upcoming-projects" target="_blank" className="inline-block p-2 text-gray-400 hover:text-gold transition-colors"><Eye size={18} /></Link>
                            <button onClick={() => openProjectModal(project)} className="p-2 text-gray-400 hover:text-gold transition-colors"><Edit3 size={18} /></button>
                            <button onClick={() => deleteProject(project.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <Hammer size={48} className="text-gray-100 mb-6" />
                  <h3 className="font-serif text-2xl text-oak mb-2">No Projects Yet</h3>
                  <p className="text-gray-400 text-xs max-w-sm">Add your first upcoming project to showcase your development pipeline.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'blog' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-xl text-oak">Blog Posts</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Manage articles and insights</p>
                </div>
                <button onClick={() => openBlogModal()} className="bg-gold text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 hover:bg-gold-dark transition-all">
                  <Plus size={16} />
                  <span>New Post</span>
                </button>
              </div>
              {blogPosts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400">
                        <th className="px-8 py-4 font-bold">Article</th>
                        <th className="px-8 py-4 font-bold">Category</th>
                        <th className="px-8 py-4 font-bold">Author</th>
                        <th className="px-8 py-4 font-bold">Status</th>
                        <th className="px-8 py-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {blogPosts.map(post => (
                        <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <img src={post.coverImage} className="w-12 h-12 rounded-lg object-cover" alt="" />
                              <div>
                                <p className="text-sm font-bold text-oak line-clamp-1">{post.title}</p>
                                <p className="text-[10px] text-gray-400">{new Date(post.publishedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-[10px] font-bold uppercase tracking-tighter bg-gray-100 px-3 py-1 rounded-full text-gray-500">{post.category}</span>
                          </td>
                          <td className="px-8 py-6 text-xs text-gray-500">{post.author}</td>
                          <td className="px-8 py-6">
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right space-x-2">
                            {post.published && (
                              <Link to={`/blog/${post.slug}`} target="_blank" className="inline-block p-2 text-gray-400 hover:text-gold transition-colors"><Eye size={18} /></Link>
                            )}
                            <button onClick={() => openBlogModal(post)} className="p-2 text-gray-400 hover:text-gold transition-colors"><Edit3 size={18} /></button>
                            <button onClick={() => deleteBlogPost(post.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <FileText size={48} className="text-gray-100 mb-6" />
                  <h3 className="font-serif text-2xl text-oak mb-2">No Blog Posts Yet</h3>
                  <p className="text-gray-400 text-xs max-w-sm">Create your first blog post to share insights and updates with your audience.</p>
                </div>
              )}
            </div>
          )}

          {/* Team Tab Content */}
          {activeTab === 'team' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm flex items-center space-x-2 px-4">
                    <Filter size={14} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">All Roles</span>
                  </div>
                </div>
                <button onClick={() => openTeamModal()} className="bg-oak text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-gold transition-all shadow-lg shadow-oak/20 flex items-center space-x-2">
                  <Plus size={16} />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group hover:border-gold/30 transition-all">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden mb-6 relative">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-10px] group-hover:translate-y-0">
                        <button onClick={() => openTeamModal(member)} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:text-gold shadow-sm transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteTeamMember(member.id)} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:text-red-500 shadow-sm transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-oak mb-1">{member.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-gold font-bold mb-3">{member.role}</p>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4">{member.bio}</p>
                      <div className="flex items-center space-x-3 border-t border-gray-50 pt-4">
                        {member.linkedin && <LinkIcon size={14} className="text-gray-300 hover:text-blue-600 cursor-pointer" />}
                        {member.email && <Mail size={14} className="text-gray-300 hover:text-oak cursor-pointer" />}
                      </div>
                    </div>
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-gray-900 font-medium mb-1">No Team Members Found</h3>
                    <p className="text-gray-500 text-sm mb-6">Start by adding your executive team.</p>
                    <button onClick={() => openTeamModal()} className="text-gold font-bold text-xs uppercase tracking-widest hover:underline">Register First Member</button>
                  </div>
                )}
              </div>
            </div>          )}

          {/* Gallery Tab Content */}
          {activeTab === 'gallery' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Header with Stats & Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 p-6 rounded-2xl border border-gray-100 backdrop-blur-md">
                <div>
                  <h3 className="font-serif text-2xl text-oak flex items-center space-x-2">
                    <span>Design Gallery Hub</span>
                    <span className="bg-gold/15 text-gold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold font-sans">
                      Global Standard
                    </span>
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                    Manage the main architectural showcase assets for the Home page
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-oak/5 border border-oak/5 rounded-xl px-4 py-2 flex items-center space-x-3 text-xs">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Showcase Size</p>
                      <p className="font-serif font-bold text-oak">{galleryItems.length} Assets</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => openGalleryModal()} 
                    className="bg-oak text-white px-5 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-gold hover:text-white transition-all shadow-lg hover:shadow-gold/25 flex items-center space-x-2 group duration-300"
                  >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>Single Upload</span>
                  </button>
                </div>
              </div>

              {/* Advanced Interactive Workspace Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bulk Upload Dropzone & Main Asset Preview */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Glassmorphic Dropzone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingOverDropzone(true); }}
                    onDragLeave={() => setIsDraggingOverDropzone(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOverDropzone(false);
                      handleBulkUpload(e.dataTransfer.files);
                    }}
                    onClick={() => {
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.multiple = true;
                      fileInput.accept = 'image/*';
                      fileInput.onchange = (e) => {
                        handleBulkUpload((e.target as HTMLInputElement).files);
                      };
                      fileInput.click();
                    }}
                    className={`relative rounded-3xl p-8 border-2 border-dashed text-center cursor-pointer transition-all duration-500 flex flex-col items-center justify-center min-h-[220px] ${
                      isDraggingOverDropzone 
                        ? 'border-gold bg-gold/5 scale-[1.01] shadow-xl shadow-gold/5' 
                        : 'border-gray-200 bg-white hover:border-gold hover:bg-gold/5'
                    }`}
                  >
                    {isBulkUploading ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <Loader2 size={36} className="text-gold animate-spin" />
                          <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-oak rounded-full"></div>
                        </div>
                        <p className="text-[10px] text-oak uppercase tracking-widest font-bold font-sans animate-pulse">
                          {bulkUploadProgress}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center group">
                        <div className="mb-4 bg-oak/5 p-4 rounded-full group-hover:bg-gold group-hover:text-white transition-all duration-500">
                          <Upload size={24} className="text-oak group-hover:text-white transition-colors duration-500" />
                        </div>
                        <h4 className="font-serif text-oak text-base mb-1">Bulk Asset Showcase</h4>
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-4">
                          Drag & drop multiple files
                        </p>
                        <span className="text-[8px] bg-oak/5 border border-oak/10 text-oak font-bold uppercase tracking-wider px-3 py-1.5 rounded-full select-none">
                          Browse Files
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Main Feature Highlight panel */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Main Feature</p>
                      <span className="w-2 h-2 rounded-full bg-gold animate-ping"></span>
                    </div>
                    {galleryItems.some(item => item.isMain) ? (
                      (() => {
                        const main = galleryItems.find(item => item.isMain)!;
                        return (
                          <div className="space-y-4 group">
                            <div className="aspect-video rounded-2xl overflow-hidden border border-gold/30 shadow-md relative">
                              <img src={main.image} alt={main.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]" />
                              <div className="absolute inset-0 bg-gradient-to-t from-oak/80 to-transparent opacity-70"></div>
                              <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h4 className="font-serif text-base mb-0.5">{main.title}</h4>
                                <p className="text-[9px] uppercase tracking-widest text-gold font-bold">{main.subtitle}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="py-8 text-center bg-red-50/50 rounded-2xl border border-dashed border-red-100">
                        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <h5 className="text-red-900 font-bold text-xs">No Main Feature Configured</h5>
                        <p className="text-gray-400 text-[10px] mt-1 px-4 leading-normal">
                          The Home page hero grid layout requires one main image. Check a card switch as "Main Feature" below.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sortable Portfolio Grid List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-[10px] font-extrabold text-oak uppercase tracking-widest flex items-center space-x-1.5">
                      <GripVertical size={12} className="text-gray-300" />
                      <span>Reorder Workspace (Drag & Drop)</span>
                    </span>
                    <span className="text-[9px] text-gray-400 tracking-wider">
                      Changes sync in real-time
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[640px] overflow-y-auto pr-2 scrollbar-thin">
                    {galleryItems.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleGalleryDragStart(index)}
                        onDragOver={(e) => handleGalleryDragOver(e, index)}
                        onDragEnd={handleGalleryDragEnd}
                        className={`bg-white rounded-2xl p-4 border transition-all duration-300 relative group flex flex-col justify-between ${
                          draggedGalleryItemIndex === index 
                            ? 'border-gold bg-gold/5 opacity-50 scale-[0.98]' 
                            : 'border-gray-100 hover:border-gold/30 shadow-sm hover:shadow-md'
                        }`}
                      >
                        {/* Image Frame */}
                        <div className="aspect-[4/3] rounded-xl overflow-hidden relative mb-4">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-transparent group-hover:bg-oak/10 transition-colors duration-500"></div>
                          
                          {/* Drag Grip Indicator */}
                          <div className="absolute top-2 left-2 p-1.5 bg-white/95 backdrop-blur-sm rounded-lg text-gray-400 cursor-grab active:cursor-grabbing shadow-sm opacity-60 group-hover:opacity-100 transition-opacity">
                            <GripVertical size={12} />
                          </div>

                          {/* Quick Controls overlay */}
                          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-5px] group-hover:translate-y-0">
                            <button 
                              onClick={() => openGalleryModal(item)} 
                              className="p-2 bg-white/95 backdrop-blur-sm rounded-lg hover:text-gold shadow-sm transition-colors text-oak"
                              title="Edit Details"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button 
                              onClick={() => deleteGalleryItem(item.id)} 
                              className="p-2 bg-white/95 backdrop-blur-sm rounded-lg hover:text-red-500 shadow-sm transition-colors text-oak"
                              title="Delete Asset"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {/* Main Badge */}
                          {item.isMain && (
                            <span className="absolute bottom-2 left-2 bg-gold text-white text-[8px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm">
                              Main Feature
                            </span>
                          )}
                        </div>

                        {/* Text Content & Switch Toggle */}
                        <div className="flex justify-between items-end gap-3 mt-1">
                          <div className="min-w-0">
                            <h4 className="font-serif text-sm text-oak font-bold truncate">{item.title}</h4>
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>

                          {/* Beautiful Interactive Switch for isMain */}
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span className="text-[7px] font-extrabold uppercase tracking-wider text-gray-400 mb-1 select-none">
                              Main Grid
                            </span>
                            <button
                              onClick={() => toggleGalleryMainFeature(item.id, !!item.isMain)}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none flex items-center ${
                                item.isMain ? 'bg-gold' : 'bg-gray-200'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                                  item.isMain ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {galleryItems.length === 0 && (
                      <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-medium mb-1">Gallery workspace is empty</h3>
                        <p className="text-gray-400 text-xs mb-6">Upload premium architecture assets to present Ghana's high-end residential design.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services Tab Content */}
          {activeTab === 'services' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-xl text-oak">Services & Solutions</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Manage service offerings and imagery</p>
                </div>
                <button onClick={() => openServiceModal()} className="bg-oak text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-gold transition-all shadow-lg shadow-oak/20 flex items-center space-x-2">
                  <Plus size={16} />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serviceItems.map((item) => (
                  <div key={item.id} className="relative group rounded-2xl overflow-hidden aspect-[16/9] border border-gray-100 shadow-sm">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-oak/80 group-hover:bg-oak/70 transition-colors backdrop-blur-[2px]"></div>

                    <div className="absolute inset-0 p-8 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="bg-white/10 p-3 rounded-lg backdrop-blur-md border border-white/10">
                          <Layers className="text-gold w-6 h-6" />
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-2 group-hover:translate-y-0">
                          <button onClick={() => openServiceModal(item)} className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white hover:text-oak transition-colors">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => deleteService(item.id)} className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-red-500 hover:text-white transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-2xl font-serif text-white mb-2">{item.title}</h3>
                        <p className="text-white/70 text-sm line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl bg-white p-10 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
              <h3 className="font-serif text-2xl text-oak mb-8">System Configuration</h3>
              <div className="space-y-8">

                {/* Team Section Visibility Toggle */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-oak/5 to-gold/5 rounded-xl border border-oak/10 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      showTeam ? 'bg-gold text-oak shadow-md shadow-gold/20' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-oak">Visionary Leadership Section</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                        {showTeam ? 'Currently visible on the homepage' : 'Hidden from the homepage'}
                      </p>
                    </div>
                  </div>
                  <button
                    id="toggle-team-visibility"
                    onClick={handleToggleTeamVisibility}
                    className={`relative inline-flex items-center h-7 w-14 rounded-full transition-all duration-300 focus:outline-none shadow-inner ${
                      showTeam
                        ? 'bg-gold shadow-gold/20'
                        : 'bg-gray-200'
                    }`}
                    aria-label={showTeam ? 'Hide team section' : 'Show team section'}
                  >
                    <span className={`inline-block w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 ${
                      showTeam ? 'translate-x-8' : 'translate-x-1'
                    }`} />
                    <span className="sr-only">{showTeam ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
                {/* Hero Image Carousel Section */}
                <div className="flex flex-col space-y-4 p-6 bg-oak/5 rounded-xl border border-oak/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-oak">Hero Image Carousel</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">Upload multiple images for auto-sliding hero (Max 3MB each, up to 10 images)</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {hasCustomHero && (
                        <button
                          onClick={resetHero}
                          className="text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => heroImageInputRef.current?.click()}
                        disabled={isHeroUploading || heroImages.length >= 10}
                        className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-all flex items-center space-x-2 disabled:opacity-50 shadow-sm"
                      >
                        {isHeroUploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        <span>{isHeroUploading ? 'Uploading...' : 'Add Image'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Hero Images Grid */}
                  {heroImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {heroImages.map((img, index) => (
                        <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border-2 border-white shadow-sm hover:border-gold/50 transition-all">
                          <img src={img} className="w-full h-full object-cover" alt={`Hero slide ${index + 1}`} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeHeroImage(index)}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-oak/80 text-white text-[9px] px-2 py-1 rounded font-bold">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {heroImages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-200 rounded-xl mt-4">
                      <ImageIcon size={32} className="text-gray-200 mb-3" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">No carousel images</p>
                      <p className="text-[9px] text-gray-300 mt-1">Add images to create an auto-sliding hero</p>
                    </div>
                  )}

                  <p className="text-[9px] text-gray-400 mt-2">
                    <span className="font-bold text-gold">{heroImages.length}/10</span> images uploaded. Images will auto-rotate every 6 seconds on the homepage.
                  </p>

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
        {isGalleryModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-serif text-xl text-oak">{editingGalleryItem ? 'Edit Image' : 'Add to Gallery'}</h3>
                <button onClick={() => setIsGalleryModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleGallerySubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div onClick={() => galleryImageInputRef.current?.click()} className="cursor-pointer group relative aspect-video rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 hover:border-gold transition-all overflow-hidden">
                    {galleryImage ? (
                      <img src={galleryImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-gold transition-colors">
                        <Upload size={32} className="mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Upload Image</span>
                      </div>
                    )}
                    <input ref={galleryImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryImageUpload} />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2">Title</label>
                    <input type="text" name="title" defaultValue={editingGalleryItem?.title} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" placeholder="e.g. Modern Kitchen" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2">Subtitle</label>
                    <input type="text" name="subtitle" defaultValue={editingGalleryItem?.subtitle} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" placeholder="e.g. Italian Marble Finishes" />
                  </div>

                  <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl">
                    <input type="checkbox" name="isMain" id="isMain" defaultChecked={editingGalleryItem?.isMain} className="accent-gold w-4 h-4" />
                    <label htmlFor="isMain" className="text-xs text-gray-600 font-medium select-none cursor-pointer">Set as Main Feature (Large Display)</label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsGalleryModalOpen(false)} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 bg-oak text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors">Save Image</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isServiceModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                <h3 className="font-serif text-xl text-oak">{editingServiceItem ? 'Edit Service' : 'Add Service'}</h3>
                <button onClick={() => setIsServiceModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleServiceSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div onClick={() => serviceImageInputRef.current?.click()} className="cursor-pointer group relative aspect-video rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 hover:border-gold transition-all overflow-hidden">
                    {serviceImage ? (
                      <img src={serviceImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-gold transition-colors">
                        <Upload size={32} className="mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Upload Cover Image</span>
                      </div>
                    )}
                    <input ref={serviceImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleServiceImageUpload} />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2">Title</label>
                    <input type="text" name="title" defaultValue={editingServiceItem?.title} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" placeholder="e.g. Estate Development" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2">Description</label>
                    <textarea name="description" defaultValue={editingServiceItem?.description} required rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors" placeholder="Detailed description of the service..." />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2">Icon</label>
                    <div className="relative">
                      <select name="icon" defaultValue={editingServiceItem?.icon || 'Shield'} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors appearance-none">
                        <option value="Shield">Shield (Security/Trust)</option>
                        <option value="TrendingUp">TrendingUp (Investment)</option>
                        <option value="Landmark">Landmark (Architecture)</option>
                        <option value="Key">Key (Concierge/Access)</option>
                        <option value="Briefcase">Briefcase (Professional)</option>
                        <option value="Globe">Globe (Global)</option>
                        <option value="Zap">Zap (Innovation)</option>
                        <option value="Award">Award (Quality)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsServiceModalOpen(false)} className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 bg-oak text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors">Save Service</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Custom Toast Notifications Stack */}
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-500 transform translate-x-0 animate-in slide-in-from-right-10 ${
                toast.type === 'success'
                  ? 'bg-[#0F382E]/95 text-white border-gold/30'
                  : toast.type === 'error'
                  ? 'bg-red-950/95 text-white border-red-500/30'
                  : 'bg-blue-950/95 text-white border-blue-500/30'
              }`}
            >
              <div className="mr-3">
                {toast.type === 'success' && <Check size={18} className="text-gold" />}
                {toast.type === 'error' && <AlertTriangle size={18} className="text-red-400" />}
                {toast.type === 'info' && <Clock size={18} className="text-blue-400" />}
              </div>
              <p className="text-[11px] uppercase tracking-wider font-bold">{toast.message}</p>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-auto text-white/50 hover:text-white transition-colors pl-4 focus:outline-none"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Custom Delete Confirmation Modal */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 p-8 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <AlertTriangle size={32} />
              </div>
              <h3 className="font-serif text-2xl text-oak mb-3">{confirmModal.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-8 px-2">
                {confirmModal.message}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmModal.onCancel}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
