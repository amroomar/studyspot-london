/**
 * Navbar — London Fog / Bristol Harbour design
 * Frosted glass navigation bar, fixed at bottom on mobile, top on desktop
 * Tabs: Discover, Search, Social, Map, Saved, Badges
 * Features: "Add a Spot" button, Dark mode toggle, City switcher
 */
import { Home, Map, Heart, Award, Search, Play, Plus, GraduationCap, Moon, Sun, ArrowLeftRight } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';

type Tab = 'home' | 'map' | 'search' | 'social' | 'favorites' | 'badges';

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onAddSpot?: () => void;
  cityPrefix?: string; // e.g. "/bristol" or "" for London
}

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Discover', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'social', label: 'Social', icon: Play },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'favorites', label: 'Saved', icon: Heart },
  { id: 'badges', label: 'Badges', icon: Award },
];

export default function Navbar({ activeTab, onTabChange, onAddSpot, cityPrefix = '' }: NavbarProps) {
  const { theme, toggleTheme, switchable } = useTheme();
  const isBristol = cityPrefix === '/bristol';
  const cityLabel = isBristol ? 'Bristol' : 'London';
  const cityBadgeClass = isBristol
    ? 'bg-cyan-600/10 text-cyan-500'
    : 'bg-fog-sage/10 text-fog-sage';
  const uniHref = isBristol ? '/bristol/uni' : '/london/uni';
  const uniBadgeClass = isBristol
    ? 'bg-cyan-600/10 text-cyan-500 border-cyan-600/20 hover:bg-cyan-600/20'
    : 'bg-fog-gold/10 text-fog-gold border-fog-gold/20 hover:bg-fog-gold/20';
  const addBtnClass = isBristol
    ? 'bg-cyan-600 text-white hover:bg-cyan-600/90'
    : 'bg-fog-sage text-white hover:bg-fog-sage/90';
  const addBtnMobileClass = isBristol
    ? 'bg-cyan-600 text-white'
    : 'bg-fog-sage text-white';
  const addLabelClass = isBristol ? 'text-cyan-600' : 'text-fog-sage';

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-30 glass border-b border-border/50 px-6 py-3">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="text-xl text-foreground cursor-pointer hover:opacity-80 transition-opacity" style={{ fontFamily: 'var(--font-display)' }}>StudySpot</span>
            </Link>
            <Link href={isBristol ? '/bristol' : '/london'}>
              <span className={`text-xs ${cityBadgeClass} px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity`}>{cityLabel}</span>
            </Link>
            {/* City switcher */}
            <Link href={isBristol ? '/london' : '/bristol'}>
              <span className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-full border border-border/50 cursor-pointer transition-colors">
                <ArrowLeftRight className="w-3 h-3" />
                {isBristol ? 'London' : 'Bristol'}
              </span>
            </Link>
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
            <Link href={uniHref}>
              <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${uniBadgeClass}`}>
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
              className={`ml-1 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${addBtnClass}`}
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
            <div className={`w-10 h-10 -mt-5 rounded-full ${addBtnMobileClass} flex items-center justify-center shadow-lg border-4 border-background`}>
              <Plus className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-medium ${addLabelClass}`}>Add</span>
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

      {/* Mobile top bar — city switcher, UniMode, dark mode */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 glass border-b border-border/50 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <span className="text-base text-foreground font-semibold cursor-pointer" style={{ fontFamily: 'var(--font-display)' }}>StudySpot</span>
          </Link>
          <span className={`text-[10px] ${cityBadgeClass} px-1.5 py-0.5 rounded-full font-medium`}>{cityLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* City switcher — mobile */}
          <Link href={isBristol ? '/london' : '/bristol'}>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-full border border-border/50 cursor-pointer transition-colors">
              <ArrowLeftRight className="w-3 h-3" />
              {isBristol ? 'London' : 'Bristol'}
            </span>
          </Link>
          {/* UniMode — mobile */}
          <Link href={uniHref}>
            <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border cursor-pointer transition-all ${uniBadgeClass}`}>
              <GraduationCap className="w-3 h-3" />
              Uni
            </span>
          </Link>
          {/* Dark mode toggle — mobile */}
          {switchable && toggleTheme && (
            <button
              onClick={toggleTheme}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
