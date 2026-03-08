/**
 * Navbar — London Fog design
 * Frosted glass navigation bar, fixed at bottom on mobile, top on desktop
 * Tabs: Discover, Search, Social, Map, Saved, Badges
 * Features: "Add a Spot" button
 */
import { Home, Map, Heart, Award, Search, Play, Plus } from 'lucide-react';

type Tab = 'home' | 'map' | 'search' | 'social' | 'favorites' | 'badges';

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onAddSpot?: () => void;
}

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Discover', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'social', label: 'Social', icon: Play },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'favorites', label: 'Saved', icon: Heart },
  { id: 'badges', label: 'Badges', icon: Award },
];

export default function Navbar({ activeTab, onTabChange, onAddSpot }: NavbarProps) {
  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-30 glass border-b border-border/50 px-6 py-3">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>StudySpot</span>
            <span className="text-xs bg-fog-sage/10 text-fog-sage px-2 py-0.5 rounded-full font-medium">London</span>
          </div>
          <div className="flex items-center gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
            {/* Add Spot button — desktop */}
            <button
              onClick={onAddSpot}
              className="ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-fog-sage text-white hover:bg-fog-sage/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add a Spot
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-border/50 px-1 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-2">
          {tabs.slice(0, 3).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                activeTab === id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${activeTab === id ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}

          {/* Center "Add" button — mobile */}
          <button
            onClick={onAddSpot}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5"
          >
            <div className="w-10 h-10 -mt-5 rounded-full bg-fog-sage text-white flex items-center justify-center shadow-lg border-4 border-background">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-fog-sage">Add</span>
          </button>

          {tabs.slice(3).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                activeTab === id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${activeTab === id ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
