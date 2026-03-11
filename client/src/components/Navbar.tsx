/**
 * Navbar — London Fog design
 * Frosted glass navigation bar, fixed at bottom on mobile, top on desktop
 * Tabs: Discover, Search, Social, Map, Saved, Badges
 * Features: "Add a Spot" button, Dark mode toggle
 */
import { Home, Map, Heart, Award, Search, Play, Plus, GraduationCap, Moon, Sun } from 'lucide-react';
import { Link } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme, toggleTheme, switchable } = useTheme();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-30 glass border-b border-border/50 px-6 py-3">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl text-foreground" style={{ fontFamily: 'var(--font-display)' }}>StudySpot</span>
            <span className="text-xs bg-fog-sage/10 text-fog-sage px-2 py-0.5 rounded-full font-medium">London</span>
          </div>
          <div className="flex items-center gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
            {/* UniMode link — desktop */}
            <Link href="/uni">
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-fog-gold/10 text-fog-gold border border-fog-gold/20 hover:bg-fog-gold/20 transition-all cursor-pointer">
                <GraduationCap className="w-4 h-4" />
                UniMode
              </span>
            </Link>
            {/* Dark mode toggle — desktop */}
            {switchable && toggleTheme && (
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            {/* Add Spot button — desktop */}
            <button
              onClick={onAddSpot}
              className="ml-1 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-fog-sage text-white hover:bg-fog-sage/90 transition-all shadow-sm"
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

      {/* Mobile dark mode toggle — floating button */}
      {switchable && toggleTheme && (
        <button
          onClick={toggleTheme}
          className="lg:hidden fixed top-4 right-4 z-30 w-10 h-10 rounded-full glass shadow-lg flex items-center justify-center text-foreground border border-border/50 transition-all duration-200"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>
      )}
    </>
  );
}
