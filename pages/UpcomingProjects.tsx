import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Building2, ChevronRight, Hammer, Clock, CheckCircle2 } from 'lucide-react';
import { UpcomingProject, ProjectStatus } from '../types';
import { db } from '../services/firebase';
import { ref, onValue } from 'firebase/database';
import { SEO, pageSEO } from '../components/SEO';

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return 'bg-blue-100 text-blue-700';
      case ProjectStatus.IN_PROGRESS:
        return 'bg-gold/20 text-gold';
      case ProjectStatus.COMING_SOON:
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return <Clock size={12} />;
      case ProjectStatus.IN_PROGRESS:
        return <Hammer size={12} />;
      case ProjectStatus.COMING_SOON:
        return <CheckCircle2 size={12} />;
      default:
        return null;
    }
  };

  return (
    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusStyles()}`}>
      {getStatusIcon()}
      <span>{status}</span>
    </span>
  );
};

export const UpcomingProjects: React.FC = () => {
  const [projects, setProjects] = useState<UpcomingProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<UpcomingProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const projectsRef = ref(db, 'upcomingProjects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setProjects(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setProjects([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const featuredProjects = projects.filter(p => p.featured);
  const otherProjects = projects.filter(p => !p.featured);

  return (
    <div className="min-h-screen bg-white">
      <SEO {...pageSEO.upcomingProjects} />
      {/* Hero Section */}
      <section className="relative bg-oak py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <p className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Future Developments</p>
            <h1 className="font-serif text-4xl md:text-6xl text-white mb-6">Upcoming Projects</h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Discover our pipeline of exceptional properties currently in development.
              Be the first to know about new opportunities in Ghana's most sought-after locations.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <p className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Featured Development</p>
            <h2 className="font-serif text-3xl md:text-4xl text-oak mb-12">Spotlight Projects</h2>

            <div className="grid gap-8">
              {featuredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500"
                >
                  <div className="grid md:grid-cols-2">
                    <div className="relative h-64 md:h-auto">
                      <img
                        src={project.images[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200'}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <StatusBadge status={project.status} />
                      </div>
                    </div>
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <h3 className="font-serif text-2xl md:text-3xl text-oak mb-4">{project.title}</h3>
                      <div className="flex flex-wrap gap-4 mb-6 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <MapPin size={14} className="text-gold" />
                          <span>{project.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar size={14} className="text-gold" />
                          <span>Expected: {project.expectedCompletion}</span>
                        </span>
                        {project.estimatedUnits && (
                          <span className="flex items-center space-x-1">
                            <Building2 size={14} className="text-gold" />
                            <span>{project.estimatedUnits} Units</span>
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-6 leading-relaxed">{project.description}</p>
                      {project.highlights && project.highlights.length > 0 && (
                        <div className="space-y-2 mb-6">
                          {project.highlights.slice(0, 3).map((highlight, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                              <ChevronRight size={14} className="text-gold" />
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="self-start bg-oak text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-all"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Projects Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          {otherProjects.length > 0 || featuredProjects.length === 0 ? (
            <>
              <p className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Development Pipeline</p>
              <h2 className="font-serif text-3xl md:text-4xl text-oak mb-12">All Projects</h2>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                  <Building2 size={48} className="mx-auto text-gray-200 mb-6" />
                  <h3 className="font-serif text-2xl text-oak mb-2">Coming Soon</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    We're working on exciting new developments. Check back soon for updates on our upcoming projects.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(otherProjects.length > 0 ? otherProjects : projects).map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="relative h-56">
                        <img
                          src={project.images[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800'}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <StatusBadge status={project.status} />
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-serif text-xl text-oak mb-3">{project.title}</h3>
                        <div className="flex flex-wrap gap-3 mb-4 text-[10px] text-gray-500">
                          <span className="flex items-center space-x-1">
                            <MapPin size={12} className="text-gold" />
                            <span>{project.location}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar size={12} className="text-gold" />
                            <span>{project.expectedCompletion}</span>
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 bg-oak/80 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-72 md:h-96">
              <img
                src={selectedProject.images[0] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200'}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-colors"
              >
                <span className="text-oak text-xl">&times;</span>
              </button>
              <div className="absolute bottom-4 left-4">
                <StatusBadge status={selectedProject.status} />
              </div>
            </div>
            <div className="p-8 md:p-12">
              <h2 className="font-serif text-3xl text-oak mb-4">{selectedProject.title}</h2>
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
                <span className="flex items-center space-x-2">
                  <MapPin size={16} className="text-gold" />
                  <span>{selectedProject.location}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gold" />
                  <span>Expected: {selectedProject.expectedCompletion}</span>
                </span>
                {selectedProject.estimatedUnits && (
                  <span className="flex items-center space-x-2">
                    <Building2 size={16} className="text-gold" />
                    <span>{selectedProject.estimatedUnits} Units</span>
                  </span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed mb-8">{selectedProject.description}</p>
              {selectedProject.highlights && selectedProject.highlights.length > 0 && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Project Highlights</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedProject.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">
                        <ChevronRight size={14} className="text-gold flex-shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedProject.images.length > 1 && (
                <div className="mt-8">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Gallery</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProject.images.slice(1).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedProject.title} ${idx + 2}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
