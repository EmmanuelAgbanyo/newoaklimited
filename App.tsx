
import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Gallery } from './pages/Gallery';
import { PropertyDetail } from './pages/PropertyDetail';
import { Admin } from './pages/Admin';
import { UpcomingProjects } from './pages/UpcomingProjects';
import { Blog } from './pages/Blog';
import { Chatbot } from './components/Chatbot';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-oak">
    <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
    <span className="mt-6 text-gold text-xs uppercase tracking-[0.3em] animate-pulse">NewOak Limited</span>
  </div>
);

const App: React.FC = () => {
  return (
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
  );
};

export default App;
