import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import OfflineBanner from './components/OfflineBanner';
import OptionalLoginModal from './components/OptionalLoginModal';
import MandiDetailModal from './components/MandiDetailModal';
import Home from './pages/Home';
import Prices from './pages/Prices';
import Transporters from './pages/Transporters';
import Settings from './pages/Settings';
import {
  fetchNearbyMandis,
  fetchLatestPrices,
  fetchNearbyTransporters,
  performDeltaSync,
} from './services/api';
import {
  getCachedMandis,
  getCachedPrices,
  getCachedTransporters,
  getUserSettings,
  getLastSynced,
} from './services/db';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Core state
  const [mandis, setMandis] = useState([]);
  const [prices, setPrices] = useState([]);
  const [transporters, setTransporters] = useState([]);

  // Modals state
  const [selectedMandi, setSelectedMandi] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // User Settings state
  const [radiusKm, setRadiusKm] = useState(50);
  const [userLocation, setUserLocation] = useState('Bengaluru / Kolar');
  const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });

  // Monitor network status
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      triggerSync();
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      // Check if user has dismissed or logged in
      const authDismissed = localStorage.getItem('mandilink_auth_dismissed');
      if (!authDismissed) {
        setShowLoginModal(true);
      }

      // Load settings
      const settings = await getUserSettings();
      if (settings) {
        if (settings.radiusKm) setRadiusKm(settings.radiusKm);
        if (settings.locationName) setUserLocation(settings.locationName);
        if (settings.location) {
          setCoordinates({ lat: settings.location.lat, lng: settings.location.lng });
        }
      }

      const syncTime = await getLastSynced();
      setLastSynced(syncTime);

      await loadData();

      // Delta sync if online
      if (navigator.onLine) {
        triggerSync();
      }
    }

    init();
  }, []);

  async function loadData() {
    // 1. Cached data first (Stale-While-Revalidate)
    const [cachedM, cachedP, cachedT] = await Promise.all([
      getCachedMandis(),
      getCachedPrices(),
      getCachedTransporters(),
    ]);

    if (cachedM.length > 0) setMandis(cachedM);
    if (cachedP.length > 0) setPrices(cachedP);
    if (cachedT.length > 0) setTransporters(cachedT);

    // 2. Network refresh if online
    if (navigator.onLine) {
      try {
        const [freshM, freshP, freshT] = await Promise.all([
          fetchNearbyMandis({
            lat: coordinates.lat,
            lng: coordinates.lng,
            radiusKm,
          }),
          fetchLatestPrices(),
          fetchNearbyTransporters({
            lat: coordinates.lat,
            lng: coordinates.lng,
            radiusKm,
          }),
        ]);

        if (freshM?.data) setMandis(freshM.data);
        if (freshP?.data) setPrices(freshP.data);
        if (freshT?.data) setTransporters(freshT.data);
      } catch (err) {
        console.warn('Network refresh error:', err);
      }
    }
  }

  async function triggerSync() {
    setIsSyncing(true);
    const res = await performDeltaSync();
    if (res.success) {
      const updatedTime = await getLastSynced();
      setLastSynced(updatedTime);
      await loadData();
    }
    setIsSyncing(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-agri-100 selection:text-agri-900">
      <Header
        isOnline={isOnline}
        onSync={triggerSync}
        isSyncing={isSyncing}
        userLocation={userLocation}
      />

      <OfflineBanner isOnline={isOnline} lastSynced={lastSynced} />

      {/* Main content container with safe area and bottom nav padding */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-24 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
        {activeTab === 'home' && (
          <Home
            mandis={mandis}
            prices={prices}
            onSelectCommodity={() => setActiveTab('prices')}
            onSelectMandi={(mandi) => setSelectedMandi(mandi)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'prices' && <Prices prices={prices} mandis={mandis} />}
        {activeTab === 'transporters' && <Transporters transporters={transporters} />}
        {activeTab === 'settings' && (
          <Settings
            radiusKm={radiusKm}
            setRadiusKm={setRadiusKm}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            onGpsRequest={() => {
              if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setCoordinates({
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                    });
                    setUserLocation('Current GPS Location');
                  },
                  (err) => alert(`GPS unavailable: ${err.message}`)
                );
              }
            }}
          />
        )}
      </main>

      {/* Mandi Detail Modal on Click */}
      <MandiDetailModal
        mandi={selectedMandi}
        prices={prices}
        isOpen={Boolean(selectedMandi)}
        onClose={() => setSelectedMandi(null)}
      />

      {/* Optional First-Time Login Modal with "Skip" */}
      <OptionalLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
