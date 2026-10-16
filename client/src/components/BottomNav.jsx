import React from 'react';
import { Home, Clock, Plus, Calendar, Briefcase, Users } from 'lucide-react';

export default function BottomNav({ currentView, setCurrentView, onOpenAdd, onOpenFamily }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-t border-[#E7E5E4] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg">
      <button
        onClick={() => setCurrentView('dashboard')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2.5 rounded-xl transition-all ${
          currentView === 'dashboard' 
            ? 'text-amber-900 bg-amber-100/60 font-bold' 
            : 'text-ink-secondary hover:text-ink-primary'
        }`}
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>

      <button
        onClick={() => setCurrentView('timeline')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2.5 rounded-xl transition-all ${
          currentView === 'timeline' 
            ? 'text-amber-900 bg-amber-100/60 font-bold' 
            : 'text-ink-secondary hover:text-ink-primary'
        }`}
      >
        <Clock className="w-4 h-4" />
        <span>Timeline</span>
      </button>

      {/* Floating Add Button */}
      <button
        onClick={onOpenAdd}
        className="-mt-5 w-11 h-11 rounded-full bg-ink-primary hover:bg-[#2D3748] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform border-2 border-white ring-2 ring-amber-500/20"
        title="Add Tracked Item"
      >
        <Plus className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrentView('calendar')}
        className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2.5 rounded-xl transition-all ${
          currentView === 'calendar' 
            ? 'text-amber-900 bg-amber-100/60 font-bold' 
            : 'text-ink-secondary hover:text-ink-primary'
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span>Calendar</span>
      </button>

      <button
        onClick={onOpenFamily}
        className="flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2.5 rounded-xl text-ink-secondary hover:text-ink-primary transition-all"
        title="Family Vault"
      >
        <Users className="w-4 h-4 text-amber-800" />
        <span>Family</span>
      </button>
    </nav>
  );
}
