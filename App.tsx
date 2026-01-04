import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Gallery = lazy(() => import('./pages/Gallery').then(module => ({ default: module.Gallery })));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail').then(module => ({ default: module.PropertyDetail })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const UpcomingProjects = lazy(() => import('./pages/UpcomingProjects').then(module => ({ default: module.UpcomingProjects })));
const Blog = lazy(() => import('./pages/Blog').then(module => ({ default: module.Blog })));
import { Chatbot } from './components/Chatbot';

import { DataProvider } from './contexts/DataContext';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-oak">
    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    <span className="mt-6 text-gold text-xs uppercase tracking-[0.3em] animate-pulse">NewOak Limited</span>
  </div>
);

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Admin route has its own layout or no shared layout */}
            <Route path="/admin" element={<Admin />} />

            {/* Public Routes */}
            <Route path="/" element={
              <Layout>
                <Home />
                <Chatbot />
              </Layout>
            } />
            <Route path="/gallery" element={
              <Layout>
                <Gallery />
                <Chatbot />
              </Layout>
            } />
            <Route path="/property/:id" element={
              <Layout>
                <PropertyDetail />
                <Chatbot />
              </Layout>
            } />
            <Route path="/upcoming-projects" element={
              <Layout>
                <UpcomingProjects />
                <Chatbot />
              </Layout>
            } />
            <Route path="/blog" element={
              <Layout>
                <Blog />
                <Chatbot />
              </Layout>
            } />
            <Route path="/blog/:slug" element={
              <Layout>
                <Blog />
                <Chatbot />
              </Layout>
            } />
          </Routes>
        </Suspense>
      </Router>
    </DataProvider>
  );
};

export default App;
