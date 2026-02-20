import React, { useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { useAppStore } from './store';
import { ToastContainer } from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { Skeleton } from './components/ui/Atoms';

// Lazy Load Pages for Performance
const MapDashboard = React.lazy(() => import('./pages/MapDashboard'));
const EventsFeed = React.lazy(() => import('./pages/EventsFeed'));
const EventDetails = React.lazy(() => import('./pages/EventDetails'));
const Sources = React.lazy(() => import('./pages/Sources'));
const SettingsPage = React.lazy(() => import('./pages/Settings'));
const SystemStatus = React.lazy(() => import('./pages/SystemStatus'));
// Static pages are small enough to keep, but for consistency:
const StaticPages = React.lazy(() => import('./pages/Static').then(module => ({ default: () => <><module.About /><module.Privacy /></> }))); // Hack for multiple exports if needed, or better:
const About = React.lazy(() => import('./pages/Static').then(module => ({ default: module.About })));
const Privacy = React.lazy(() => import('./pages/Static').then(module => ({ default: module.Privacy })));

const LoadingFallback = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-64 bg-slate-200 rounded col-span-2"></div>
      <div className="h-64 bg-slate-200 rounded"></div>
    </div>
  </div>
);

const Layout: React.FC = () => {
  const { direction, language } = useAppStore();

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [direction, language]);

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/map" replace />} />
        <Route path="map" element={<MapDashboard />} />
        <Route path="events" element={<EventsFeed />} />
        <Route path="event/:id" element={<EventDetails />} />
        <Route path="sources" element={<Sources />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="status" element={<SystemStatus />} />
        <Route path="about" element={<About />} />
        <Route path="privacy" element={<Privacy />} />
      </Route>
    </Routes>
  );
};

export default App;
