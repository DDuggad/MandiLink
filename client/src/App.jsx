import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import OfflineBanner from './components/OfflineBanner';
import BottomNav from './components/BottomNav';
import OptionalLoginModal from './components/OptionalLoginModal';
import MandiDetailModal from './components/MandiDetailModal';
import Home from './pages/Home';
import Prices from './pages/Prices';
import Transporters from './pages/Transporters';
import Settings from './pages/Settings';
import {
  fetchNearbyMandis,
  fetchLatestPrices,
  fetchTransporters,
  performDeltaSync,
} from './services/api';
import { getLastSynced } from './services/db';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  // User preferences & location
  const [radiusKm, setRadiusKm] = useState(50);
  const [userLocation, setUserLocation] = useState('Bengaluru Urban');
  const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });

  // App data state
  const [mandis, setMandis] = useState([]);
  const [prices, setPrices] = useState([]);
  const [transporters, setTransporters] = useState([]);

  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedMandi, setSelectedMandi] = useState(null);

  // Check first launch for optional login
  useEffect(() => {
    const isDismissed = localStorage.getItem('mandilink_auth_dismissed');
    if (!isDismissed) {
      setShowLoginModal(true);
    }
  }, []);

  // Request GPS position on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.log('GPS location note:', err.message, '- using selected district');
        },
        { timeout: 5000, maximumAge: 600000 }
      );
    }
  }, []);

  // Sync coords if manual location changes
  useEffect(() => {
    const districtCoords = {
      'Bengaluru Urban': { lat: 12.9716, lng: 77.5946 },
      Kolar: { lat: 13.1367, lng: 78.1348 },
      Pune: { lat: 18.5204, lng: 73.8567 },
      Nashik: { lat: 19.9975, lng: 73.7898 },
    };
    if (districtCoords[userLocation]) {
      setCoordinates(districtCoords[userLocation]);
    }
  }, [userLocation]);

  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = useCallback(async () => {
    const [mandisRes, pricesRes, transportersRes] = await Promise.all([
      fetchNearbyMandis(coordinates.lat, coordinates.lng, radiusKm),
      fetchLatestPrices(),
      fetchTransporters(coordinates.lat, coordinates.lng),
    ]);

    setMandis(mandisRes.data || []);
    setPrices(pricesRes.data || []);
    setTransporters(transportersRes.data || []);
  }, [coordinates.lat, coordinates.lng, radiusKm]);

  // Initial load
  useEffect(() => {
    async function init() {
      const syncTime = await getLastSynced();
      setLastSynced(syncTime);
      await loadData();
      if (navigator.onLine) {
        triggerSync();
      }
    }
    init();
  }, [loadData]);

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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        isOnline={isOnline}
        onSync={triggerSync}
        isSyncing={isSyncing}
        userLocation={userLocation}
      />

      <OfflineBanner isOnline={isOnline} lastSynced={lastSynced} />

      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4">
        {activeTab === 'home' && (
          <Home
            mandis={mandis}
            prices={prices}
            onSelectCommodity={() => setActiveTab('prices')}
            onSelectMandi={(mandi) => setSelectedMandi(mandi)}
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
