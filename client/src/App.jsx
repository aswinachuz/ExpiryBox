import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import DashboardView from './views/DashboardView';
import TimelineView from './views/TimelineView';
import CalendarView from './views/CalendarView';
import AssetHubView from './views/AssetHubView';
import { getStats, getItems, deleteItem, resolveItem, getMissedReminders, getMe, logoutUser } from './api';
import { playReminderChime, playSuccessChime } from './utils/sound';

// Code-split modals for optimal initial page-load performance
const AddItemModal = lazy(() => import('./components/AddItemModal'));
const ItemDetailModal = lazy(() => import('./components/ItemDetailModal'));
const RenewModal = lazy(() => import('./components/RenewModal'));
const SnoozeModal = lazy(() => import('./components/SnoozeModal'));
const MissedRemindersModal = lazy(() => import('./components/MissedRemindersModal'));
const UniversalSearchModal = lazy(() => import('./components/UniversalSearchModal'));
const PinLockModal = lazy(() => import('./components/PinLockModal'));
const FamilyVaultModal = lazy(() => import('./components/FamilyVaultModal'));
const BackupModal = lazy(() => import('./components/BackupModal'));
const ReportsModal = lazy(() => import('./components/ReportsModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [missedItems, setMissedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('expirybox_lang') || 'en');
  const [isLocked, setIsLocked] = useState(false);

  // Authentication State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('expirybox_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFamilyOpen, setIsFamilyOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isMissedRemindersOpen, setIsMissedRemindersOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [renewingItem, setRenewingItem] = useState(null);
  const [snoozingItem, setSnoozingItem] = useState(null);
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('📦 ExpiryBox App successfully installed on device!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('📲 Install ExpiryBox:\n\n• On Chrome/Edge (PC): Click the (⊕) Install button in your address bar.\n• On Android: Tap browser menu (⋮) → "Install App" or "Add to Home screen".\n• On iPhone/iPad: Tap the Share button (⎋) → "Add to Home Screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'ml' : 'en';
    setLang(next);
    localStorage.setItem('expirybox_lang', next);
  };

  // Load Data
  const refreshData = async () => {
    try {
      const [statsData, itemsData, missedData] = await Promise.all([
        getStats(),
        getItems(),
        getMissedReminders(),
      ]);
      if (statsData.success) setStats(statsData);
      if (itemsData.success) setItems(itemsData.items);
      if (missedData.success) {
        setMissedItems(missedData.missed);
        // Automatically prompt missed reminders once on launch if any are overdue
        const hasOverdue = missedData.missed.some((m) => m.isOverdue);
        if (hasOverdue && !sessionStorage.getItem('expirybox_missed_prompted')) {
          setIsMissedRemindersOpen(true);
          playReminderChime();
          sessionStorage.setItem('expirybox_missed_prompted', 'true');
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Check auth session
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('expirybox_token');
      if (token) {
        try {
          const res = await getMe();
          if (res.success && res.user) {
            setCurrentUser(res.user);
            localStorage.setItem('expirybox_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification:', err);
        }
      }
    };
    checkAuth();
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    refreshData();
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsAddOpen(false);
        setIsAuthOpen(false);
        setSelectedItem(null);
        setRenewingItem(null);
        setSnoozingItem(null);
        setIsFamilyOpen(false);
        setIsBackupOpen(false);
        setIsReportsOpen(false);
        setIsMissedRemindersOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleDelete = async (id) => {
    try {
      const res = await deleteItem(id);
      if (res.success) {
        refreshData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete item: ' + err.message);
    }
  };

  const handleResolve = async (item) => {
    try {
      const res = await resolveItem(item._id);
      if (res.success) {
        playSuccessChime();
        refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-ink-primary flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* PIN Lock Screen if locked */}
      <PinLockModal
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
      />

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAdd={() => setIsAddOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenFamily={() => setIsFamilyOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenReports={() => setIsReportsOpen(true)}
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
        lang={lang}
        onToggleLang={toggleLanguage}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onInstallApp={handleInstallClick}
        isInstallable={isInstallable}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-24 md:pb-12">
        {loading ? (
          <div className="py-24 text-center text-xs text-ink-muted">
            Connecting to ExpiryBox database...
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <DashboardView
                stats={stats}
                items={items}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                onSelectItem={(item) => setSelectedItem(item)}
                onRenew={(item) => setRenewingItem(item)}
                onResolve={handleResolve}
                onSnooze={(item) => setSnoozingItem(item)}
                onOpenAdd={() => setIsAddOpen(true)}
                onOpenMissedReminders={() => setIsMissedRemindersOpen(true)}
                missedCount={missedItems.length}
                lang={lang}
              />
            )}

            {currentView === 'timeline' && (
              <TimelineView
                onSelectItem={(item) => setSelectedItem(item)}
                onRenew={(item) => setRenewingItem(item)}
                onResolve={handleResolve}
                lang={lang}
              />
            )}

            {currentView === 'calendar' && (
              <CalendarView
                onSelectItem={(item) => setSelectedItem(item)}
                onRenew={(item) => setRenewingItem(item)}
                lang={lang}
              />
            )}

            {currentView === 'assethub' && (
              <AssetHubView
                onSelectItem={(item) => setSelectedItem(item)}
                onOpenAdd={() => setIsAddOpen(true)}
                lang={lang}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Floating Bottom Bar */}
      <BottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAdd={() => setIsAddOpen(true)}
        onOpenFamily={() => setIsFamilyOpen(true)}
      />

      {/* Modals wrapped in Suspense for on-demand lazy bundle loading */}
      <Suspense fallback={null}>
        {isAddOpen && (
          <AddItemModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onItemCreated={() => refreshData()}
            lang={lang}
          />
        )}

        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            onRenew={(item) => {
              setSelectedItem(null);
              setRenewingItem(item);
            }}
            onSnooze={(item) => {
              setSelectedItem(null);
              setSnoozingItem(item);
            }}
            onResolve={handleResolve}
            onDelete={handleDelete}
            lang={lang}
          />
        )}

        {renewingItem && (
          <RenewModal
            item={renewingItem}
            isOpen={!!renewingItem}
            onClose={() => setRenewingItem(null)}
            onRenewed={() => {
              playSuccessChime();
              refreshData();
            }}
          />
        )}

        {snoozingItem && (
          <SnoozeModal
            item={snoozingItem}
            isOpen={!!snoozingItem}
            onClose={() => setSnoozingItem(null)}
            onSnoozed={() => refreshData()}
            lang={lang}
          />
        )}

        {isMissedRemindersOpen && (
          <MissedRemindersModal
            missedItems={missedItems}
            isOpen={isMissedRemindersOpen}
            onClose={() => setIsMissedRemindersOpen(false)}
            onSelectItem={(item) => {
              setSelectedItem(item);
              setIsMissedRemindersOpen(false);
            }}
            onRenew={(item) => setRenewingItem(item)}
            onSnooze={(item) => setSnoozingItem(item)}
            lang={lang}
          />
        )}

        {isSearchOpen && (
          <UniversalSearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSelectItem={(item) => setSelectedItem(item)}
          />
        )}

        {isFamilyOpen && (
          <FamilyVaultModal
            isOpen={isFamilyOpen}
            onClose={() => setIsFamilyOpen(false)}
            onSelectItem={(item) => setSelectedItem(item)}
            onRenew={(item) => setRenewingItem(item)}
            onPersonUpdated={() => refreshData()}
            lang={lang}
          />
        )}

        {isReportsOpen && (
          <ReportsModal
            items={items}
            isOpen={isReportsOpen}
            onClose={() => setIsReportsOpen(false)}
            lang={lang}
          />
        )}

        {isBackupOpen && (
          <BackupModal
            isOpen={isBackupOpen}
            onClose={() => setIsBackupOpen(false)}
            onDataRestored={() => refreshData()}
          />
        )}

        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onAuthSuccess={handleAuthSuccess}
            lang={lang}
          />
        )}
      </Suspense>
    </div>
  );
}
