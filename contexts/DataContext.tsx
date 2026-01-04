import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';
import { Property, UpcomingProject, TeamMember, GalleryItem, ServiceItem } from '../types';
import { INITIAL_PROPERTIES } from '../constants';

interface DataContextType {
    properties: Property[];
    upcomingProjects: UpcomingProject[];
    team: TeamMember[];
    galleryItems: GalleryItem[];
    services: ServiceItem[];
    heroImages: string[];
    corporateVideo: string;
    isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<DataContextType>({
        properties: [],
        upcomingProjects: [],
        team: [],
        galleryItems: [],
        services: [],
        heroImages: [],
        corporateVideo: "",
        isLoading: true
    });

    useEffect(() => {
        // We listen to the root or individual nodes. Listening to root might be too heavy if DB is huge,
        // but for this scale, individual listeners are safer.

        const fetchData = () => {
            const propertiesRef = ref(db, 'properties');
            const upcomingRef = ref(db, 'upcomingProjects');
            const teamRef = ref(db, 'team');
            const galleryRef = ref(db, 'designGallery');
            const servicesRef = ref(db, 'services');
            const settingsRef = ref(db, 'settings');

            // We can use a single object to hold pending updates to avoid too many re-renders
            // But for simplicity in this implementation, we'll let state update naturally 
            // as this primarily runs on mount.

            // Properties
            onValue(propertiesRef, (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : INITIAL_PROPERTIES;
                setData(prev => ({ ...prev, properties: list }));
            });

            // Upcoming
            onValue(upcomingRef, (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : [];
                setData(prev => ({ ...prev, upcomingProjects: list }));
            });

            // Team
            onValue(teamRef, (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : [];
                setData(prev => ({ ...prev, team: list }));
            });

            // Gallery
            onValue(galleryRef, (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : [];
                setData(prev => ({ ...prev, galleryItems: list }));
            });

            // Services
            onValue(servicesRef, (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : [];
                setData(prev => ({ ...prev, services: list }));
            });

            // Settings (Hero + Video)
            onValue(settingsRef, (snapshot) => {
                const val = snapshot.val();
                if (val) {
                    setData(prev => ({
                        ...prev,
                        heroImages: val.heroImages || [],
                        corporateVideo: val.corporateVideo || ""
                    }));
                }
            });

            // Minimum loading time to prevent flash, then release
            // Effectively we say "loading" is done when we have at least establishing connection
            // or we can just set it to false immediately after attaching listeners.
            // Realistically, the onValue callbacks fire almost instantly if cached.
            // We'll set a short timeout to ensure initial state isn't flashed.
            setTimeout(() => {
                setData(prev => ({ ...prev, isLoading: false }));
            }, 800);
        };

        fetchData();
    }, []);

    return (
        <DataContext.Provider value={data}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
