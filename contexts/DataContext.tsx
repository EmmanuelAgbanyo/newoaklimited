import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, get, set } from 'firebase/database';
import { db } from '../services/firebase';
import { Property, UpcomingProject, TeamMember, GalleryItem, ServiceItem } from '../types';
import { 
  INITIAL_PROPERTIES, 
  INITIAL_SERVICES, 
  INITIAL_GALLERY, 
  INITIAL_TEAM, 
  INITIAL_UPCOMING_PROJECTS 
} from '../constants';

interface DataContextType {
    properties: Property[];
    upcomingProjects: UpcomingProject[];
    team: TeamMember[];
    galleryItems: GalleryItem[];
    services: ServiceItem[];
    heroImages: string[];
    corporateVideo: string;
    showTeamSection: boolean;
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
        showTeamSection: true,
        isLoading: true
    });

    useEffect(() => {
        // Run full database seeding checks in the background
        const seedDatabase = async () => {
            try {
                // Ensure hero images are seeded in settings (all five views)
                const heroImagesSnap = await get(ref(db, 'settings/heroImages'));
                const val = heroImagesSnap.val();
                if (!heroImagesSnap.exists() || !val || !Array.isArray(val) || val.length === 0 || (val.length === 2 && val[0] === "/hero_new_oak_heights.png" && val[1] === "/hero_new_oak_facade.png")) {
                    await set(ref(db, 'settings/heroImages'), [
                        "/hero_new_oak_heights.png",
                        "/hero_new_oak_facade.png",
                        "/hero_new_oak_dusk.jpg",
                        "/hero_new_oak_villa.jpg",
                        "/hero_new_oak_tower.jpg"
                    ]);
                }

                // Ensure corporate video is seeded in settings
                const corporateVideoSnap = await get(ref(db, 'settings/corporateVideo'));
                if (!corporateVideoSnap.exists() || !corporateVideoSnap.val() || corporateVideoSnap.val() === "https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-house-exterior-at-night-40343-large.mp4") {
                    await set(ref(db, 'settings/corporateVideo'), "/new_oak_narrative.mp4");
                }

                // Ensure all standard collections have their initial elements seeded to handle new additions dynamically
                // Properties
                const propsSnap = await get(ref(db, 'properties'));
                if (!propsSnap.exists() || !propsSnap.val()) {
                    for (const prop of INITIAL_PROPERTIES) {
                        await set(ref(db, `properties/${prop.id}`), prop);
                    }
                } else {
                    const existing = propsSnap.val();
                    for (const prop of INITIAL_PROPERTIES) {
                        const coreIds = ['1', '2', '3', '4', '5'];
                        if (coreIds.includes(prop.id)) {
                            // Always ensure core enclaves are updated with the latest premium header images and spec metrics
                            await set(ref(db, `properties/${prop.id}`), prop);
                        } else if (!existing[prop.id]) {
                            await set(ref(db, `properties/${prop.id}`), prop);
                        }
                    }
                }

                // Services
                const servicesSnap = await get(ref(db, 'services'));
                if (!servicesSnap.exists() || !servicesSnap.val()) {
                    for (const svc of INITIAL_SERVICES) {
                        await set(ref(db, `services/${svc.id}`), svc);
                    }
                } else {
                    const existing = servicesSnap.val();
                    for (const svc of INITIAL_SERVICES) {
                        if (!existing[svc.id]) {
                            await set(ref(db, `services/${svc.id}`), svc);
                        }
                    }
                }

                // Seed designGallery
                const gallerySnap = await get(ref(db, 'designGallery'));
                if (!gallerySnap.exists() || !gallerySnap.val()) {
                    for (const item of INITIAL_GALLERY) {
                        await set(ref(db, `designGallery/${item.id}`), item);
                    }
                } else {
                    const existing = gallerySnap.val();
                    for (const item of INITIAL_GALLERY) {
                        if (!existing[item.id]) {
                            await set(ref(db, `designGallery/${item.id}`), item);
                        }
                    }
                }

                // Team
                const teamSnap = await get(ref(db, 'team'));
                if (!teamSnap.exists() || !teamSnap.val()) {
                    for (const member of INITIAL_TEAM) {
                        await set(ref(db, `team/${member.id}`), member);
                    }
                } else {
                    const existing = teamSnap.val();
                    for (const member of INITIAL_TEAM) {
                        if (!existing[member.id]) {
                            await set(ref(db, `team/${member.id}`), member);
                        }
                    }
                }

                // Upcoming Projects
                const upcomingSnap = await get(ref(db, 'upcomingProjects'));
                if (!upcomingSnap.exists() || !upcomingSnap.val()) {
                    for (const proj of INITIAL_UPCOMING_PROJECTS) {
                        await set(ref(db, `upcomingProjects/${proj.id}`), proj);
                    }
                } else {
                    const existing = upcomingSnap.val();
                    for (const proj of INITIAL_UPCOMING_PROJECTS) {
                        if (!existing[proj.id]) {
                            await set(ref(db, `upcomingProjects/${proj.id}`), proj);
                        }
                    }
                }

                // Mark isSeeded settings
                await set(ref(db, 'settings/isSeededComplete'), true);
                await set(ref(db, 'settings/isSeeded'), true);
                console.log('Database seed data synchronization check complete.');
            } catch (err) {
                console.error('Error during database seeding check:', err);
            }
        };

        const fetchData = () => {
            const propertiesRef = ref(db, 'properties');
            const upcomingRef = ref(db, 'upcomingProjects');
            const teamRef = ref(db, 'team');
            const galleryRef = ref(db, 'designGallery');
            const servicesRef = ref(db, 'services');
            const settingsRef = ref(db, 'settings');

            // Seed in background without blocking initial fetch
            seedDatabase();

            // Properties
            onValue(propertiesRef, (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : INITIAL_PROPERTIES;
                setData(prev => ({ ...prev, properties: list }));
            }, (error) => {
                console.error("Error reading properties from Firebase:", error);
                setData(prev => ({ ...prev, properties: INITIAL_PROPERTIES }));
            });

            // Upcoming
            onValue(upcomingRef, (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : INITIAL_UPCOMING_PROJECTS;
                setData(prev => ({ ...prev, upcomingProjects: list }));
            }, (error) => {
                console.error("Error reading upcoming projects from Firebase:", error);
                setData(prev => ({ ...prev, upcomingProjects: INITIAL_UPCOMING_PROJECTS }));
            });

            // Team
            onValue(teamRef, (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : INITIAL_TEAM;
                setData(prev => ({ ...prev, team: list }));
            }, (error) => {
                console.error("Error reading team from Firebase:", error);
                setData(prev => ({ ...prev, team: INITIAL_TEAM }));
            });

            // Gallery
            onValue(galleryRef, (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : INITIAL_GALLERY;
                setData(prev => ({ ...prev, galleryItems: list }));
            }, (error) => {
                console.error("Error reading designGallery from Firebase:", error);
                setData(prev => ({ ...prev, galleryItems: INITIAL_GALLERY }));
            });

            // Services
            onValue(servicesRef, (snapshot) => {
                const val = snapshot.val();
                const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : INITIAL_SERVICES;
                setData(prev => ({ ...prev, services: list }));
            }, (error) => {
                console.error("Error reading services from Firebase:", error);
                setData(prev => ({ ...prev, services: INITIAL_SERVICES }));
            });

            // Settings (Hero + Video + Team Visibility)
            onValue(settingsRef, (snapshot) => {
                const val = snapshot.val();
                if (val) {
                    setData(prev => ({
                        ...prev,
                        heroImages: val.heroImages || [],
                        corporateVideo: val.corporateVideo || "",
                        showTeamSection: val.showTeamSection !== false // default to true if not set
                    }));
                }
            }, (error) => {
                console.error("Error reading settings from Firebase:", error);
            });

            // Minimum loading time to prevent flash
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
