import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Lock, 
  Unlock, 
  Download, 
  Users, 
  Calendar, 
  Home, 
  Clock, 
  Briefcase, 
  FileText, 
  Globe, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  Phone, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { getTranslation } from '../utils/i18n';

export default function Navbar({
  currentView,
  setCurrentView,
  onOpenAdd,
  onOpenSearch,
  onOpenFamily,
  onOpenBackup,
  onOpenReports,
  isLocked,
  onToggleLock,
  lang = 'en',
  onToggleLang,
  currentUser,
  onOpenAuth,
  onLogout,
  onInstallApp,
  _isInstallable,
}) {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E7E5E4] px-3 sm:px-5 lg:px-6 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Zone 1: Brand Identity (Left) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-ink-primary text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
                📦
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-base sm:text-lg text-ink-primary tracking-tight group-hover:text-amber-900 transition-colors whitespace-nowrap">
                  {getTranslation(lang, 'appName')}
                </span>
                <span className="hidden 2xl:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                  Personal OS
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Segmented Navigation Pills (Center - Tablet & Desktop) */}
          <nav className="hidden md:flex items-center bg-[#F5F5F4] p-1 rounded-2xl border border-[#E7E5E4] gap-0.5 shadow-xs flex-shrink">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'dashboard'
                  ? 'bg-white text-ink-primary shadow-xs border border-[#E7E5E4]'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-white/60'
              }`}
              title={getTranslation(lang, 'dashboard')}
            >
              <Home className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xl:inline">{getTranslation(lang, 'dashboard')}</span>
            </button>

            <button
              onClick={() => handleNavClick('timeline')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'timeline'
                  ? 'bg-white text-ink-primary shadow-xs border border-[#E7E5E4]'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-white/60'
              }`}
              title={getTranslation(lang, 'timeline')}
            >
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xl:inline">{getTranslation(lang, 'timeline')}</span>
            </button>

            <button
              onClick={() => handleNavClick('calendar')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'calendar'
                  ? 'bg-white text-ink-primary shadow-xs border border-[#E7E5E4]'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-white/60'
              }`}
              title={getTranslation(lang, 'calendar')}
            >
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xl:inline">{getTranslation(lang, 'calendar')}</span>
            </button>

            <button
              onClick={() => handleNavClick('assethub')}
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'assethub'
                  ? 'bg-white text-ink-primary shadow-xs border border-[#E7E5E4]'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-white/60'
              }`}
              title={getTranslation(lang, 'assetHub')}
            >
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xl:inline">{getTranslation(lang, 'assetHub')}</span>
            </button>

            <button
              onClick={onOpenFamily}
              className="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold text-ink-secondary hover:text-ink-primary hover:bg-white/60 transition-all"
              title={getTranslation(lang, 'family')}
            >
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xl:inline">{getTranslation(lang, 'family')}</span>
            </button>
          </nav>

          {/* Zone 3: Clean, Compact, Never-Overflowing Action Group (Right) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Universal Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 p-1.5 xl:px-2.5 xl:py-1.5 rounded-xl text-xs text-ink-secondary bg-white hover:bg-[#F5F5F4] border border-[#E7E5E4] shadow-xs transition-colors flex-shrink-0"
              title="Search anything (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" />
              <span className="hidden xl:inline font-medium">{getTranslation(lang, 'search')}</span>
              <kbd className="hidden 2xl:inline text-[9px] font-mono bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#E7E5E4] text-ink-muted">
                ⌘K
              </kbd>
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5F5F4] border border-[#E7E5E4] shadow-xs text-ink-primary transition-colors flex-shrink-0"
              title="Switch Language / ഭാഷ മാറ്റുക"
            >
              <Globe className="w-3.5 h-3.5 text-amber-800 flex-shrink-0" />
              <span className="text-[11px] font-bold">{lang === 'en' ? 'മലയാളം' : 'EN'}</span>
            </button>

            {/* Sleek Compact Tools Dropdown (Desktop & Tablet) */}
            <div className="relative hidden sm:block flex-shrink-0">
              <button
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-white hover:bg-[#F5F5F4] border border-[#E7E5E4] shadow-xs text-xs font-medium text-ink-secondary hover:text-ink-primary transition-all"
                title="Tools, Reports & PIN Lock"
              >
                <FileText className="w-3.5 h-3.5 text-amber-800" />
                <span className="hidden 2xl:inline">Tools</span>
                <ChevronDown className="w-3 h-3 text-ink-muted" />
              </button>

              {showToolsMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E7E5E4] shadow-xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowToolsMenu(false)}
                >
                  {/* PWA Install Button */}
                  <button
                    onClick={onInstallApp}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 flex items-center gap-2.5 transition-colors"
                    title="Install ExpiryBox directly onto your PC or phone"
                  >
                    <span className="text-sm">📲</span>
                    <span>Install App (PC & Mobile)</span>
                  </button>

                  <button
                    onClick={onOpenReports}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-ink-primary hover:bg-[#FAF9F6] flex items-center gap-2.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-800" />
                    <span>Reports & CSV Export</span>
                  </button>

                  <button
                    onClick={onOpenBackup}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-ink-primary hover:bg-[#FAF9F6] flex items-center gap-2.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-700" />
                    <span>Backup & Restore Data</span>
                  </button>

                  <button
                    onClick={onToggleLock}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-ink-primary hover:bg-[#FAF9F6] flex items-center gap-2.5 transition-colors"
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5 text-rose-700" /> : <Unlock className="w-3.5 h-3.5 text-emerald-700" />}
                    <span>{isLocked ? 'App Locked (Unlock)' : 'Lock with PIN'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile / Sign In Pill */}
            {currentUser ? (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white hover:bg-[#F5F5F4] border border-[#E7E5E4] shadow-xs text-xs font-semibold text-ink-primary transition-all flex-shrink-0"
                  title="User Account"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {currentUser.avatar || currentUser.name?.charAt(0) || '👤'}
                  </span>
                  <span className="hidden xl:inline max-w-[85px] truncate">{currentUser.name?.split(' ')[0] || 'Account'}</span>
                </button>

                {showAccountMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E7E5E4] shadow-xl p-3.5 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="flex items-center justify-between border-b border-[#F5F5F4] pb-2.5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-2xl flex-shrink-0">{currentUser.avatar || '👤'}</span>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-ink-primary truncate">{currentUser.name}</h4>
                          <p className="text-[10px] text-ink-muted truncate">{currentUser.email}</p>
                        </div>
                      </div>
                      {currentUser.isGoogleUser && (
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-semibold flex items-center gap-1 flex-shrink-0">
                          Gmail
                        </span>
                      )}
                    </div>

                    {/* Mobile Number Badge */}
                    <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E7E5E4] text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-ink-muted">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-700" />
                          <span>Mobile:</span>
                        </span>
                        <span className="font-semibold text-ink-primary truncate max-w-[120px]">
                          {currentUser.phone || 'Not added'}
                        </span>
                      </div>
                      <p className="text-[9px] text-ink-muted">
                        Used for urgent WhatsApp and SMS renewal alerts.
                      </p>
                    </div>

                    {/* Quick Menu Options */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          onOpenFamily();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-ink-primary hover:bg-[#FAF9F6] flex items-center gap-2 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-800" />
                        <span>Family Vault & Members</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 shadow-xs transition-colors flex-shrink-0"
                title="Sign In or Register"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Primary Action Button: ALWAYS VISIBLE ON DESKTOP & TABLET */}
            <button
              onClick={onOpenAdd}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold bg-ink-primary hover:bg-[#2D3748] text-white shadow-xs transition-transform active:scale-95 flex-shrink-0 whitespace-nowrap cursor-pointer"
              title="Add a new tracked item"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>{getTranslation(lang, 'addItem')}</span>
            </button>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 md:hidden rounded-xl bg-white border border-[#E7E5E4] text-ink-secondary hover:text-ink-primary shadow-xs flex-shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
          />

          {/* Drawer Sheet */}
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white border-l border-[#E7E5E4] shadow-2xl z-50 flex flex-col justify-between p-5 overflow-y-auto">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-ink-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    📦
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink-primary">{getTranslation(lang, 'appName')}</h3>
                    <p className="text-[10px] text-ink-muted">Personal Deadline OS</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#F5F5F4] text-ink-muted hover:text-ink-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Section inside Drawer */}
              {currentUser ? (
                <div className="p-3 bg-[#FAF9F6] rounded-2xl border border-[#E7E5E4] space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{currentUser.avatar || '👤'}</span>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-ink-primary truncate">{currentUser.name}</h4>
                      <p className="text-[10px] text-ink-muted truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  {currentUser.phone && (
                    <div className="text-[11px] font-medium text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-amber-700" />
                      <span>{currentUser.phone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2 text-center">
                  <p className="text-xs font-medium text-amber-900">
                    Sign in to sync family documents and active reminders.
                  </p>
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-amber-800 text-white text-xs font-bold shadow-xs"
                  >
                    Sign In / Register
                  </button>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block px-2">
                  Views
                </span>

                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-ink-primary text-white'
                      : 'text-ink-primary hover:bg-[#FAF9F6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4" />
                    <span>{getTranslation(lang, 'dashboard')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => handleNavClick('timeline')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    currentView === 'timeline'
                      ? 'bg-ink-primary text-white'
                      : 'text-ink-primary hover:bg-[#FAF9F6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4" />
                    <span>{getTranslation(lang, 'timeline')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => handleNavClick('calendar')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    currentView === 'calendar'
                      ? 'bg-ink-primary text-white'
                      : 'text-ink-primary hover:bg-[#FAF9F6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4" />
                    <span>{getTranslation(lang, 'calendar')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => handleNavClick('assethub')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    currentView === 'assethub'
                      ? 'bg-ink-primary text-white'
                      : 'text-ink-primary hover:bg-[#FAF9F6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4" />
                    <span>{getTranslation(lang, 'assetHub')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenFamily();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-ink-primary hover:bg-[#FAF9F6] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-amber-800" />
                    <span>{getTranslation(lang, 'family')}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>

              {/* Tools & Utilities */}
              <div className="space-y-1 pt-2 border-t border-[#E7E5E4]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted block px-2">
                  Tools & Privacy
                </span>

                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onInstallApp();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/70"
                >
                  <span className="text-sm">📲</span>
                  <span>Install App (PC & Mobile)</span>
                </button>

                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenReports();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink-primary hover:bg-[#FAF9F6]"
                >
                  <FileText className="w-4 h-4 text-ink-muted" />
                  <span>Reports & CSV Export</span>
                </button>

                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenBackup();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink-primary hover:bg-[#FAF9F6]"
                >
                  <Download className="w-4 h-4 text-ink-muted" />
                  <span>Backup & Restore Data</span>
                </button>

                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onToggleLock();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-ink-primary hover:bg-[#FAF9F6]"
                >
                  <Lock className="w-4 h-4 text-ink-muted" />
                  <span>{isLocked ? 'Unlock App' : 'Lock with PIN'}</span>
                </button>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-[#E7E5E4] space-y-2">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onOpenAdd();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-ink-primary hover:bg-[#2D3748] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>{getTranslation(lang, 'addItem')}</span>
              </button>

              {currentUser && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
