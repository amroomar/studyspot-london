/**
 * PWAInstallBanner — Full-width "Add to Home Screen" prompt
 * Shows a prominent banner at the bottom of the screen
 * On iOS, shows instructions for manual Add to Home Screen
 * On other browsers without native prompt, shows generic instructions
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus, Smartphone, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function PWAInstallBanner() {
  const {
    canInstall,
    isIOS,
    isAndroid,
    hasDeferredPrompt,
    showIOSInstructions,
    install,
    dismiss,
    closeIOSInstructions,
  } = usePWAInstall();

  return (
    <>
      {/* Full-width Install Banner */}
      <AnimatePresence>
        {canInstall && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260, delay: 1.5 }}
            className="fixed z-40 left-0 right-0 bottom-16 lg:bottom-0"
          >
            {/* Gradient border top */}
            <div className="h-[2px] bg-gradient-to-r from-fog-sage via-fog-gold to-cyan-500" />

            <div className="bg-[#1e1c19]/98 backdrop-blur-xl border-t border-white/5">
              <div className="container max-w-5xl mx-auto px-4 py-4 sm:py-5">
                <div className="flex items-center gap-4">
                  {/* App icon */}
                  <div className="shrink-0 hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-fog-sage/20 to-fog-gold/10 border border-white/10 items-center justify-center shadow-lg">
                    <Smartphone className="w-7 h-7 text-fog-sage" />
                  </div>

                  {/* Mobile icon — smaller */}
                  <div className="shrink-0 sm:hidden w-11 h-11 rounded-xl bg-gradient-to-br from-fog-sage/20 to-fog-gold/10 border border-white/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-fog-sage" />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-base sm:text-lg font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      Get the StudySpot App
                    </h3>
                    <p className="text-white/50 text-xs sm:text-sm mt-0.5 leading-relaxed hidden sm:block">
                      Install on your phone for quick access, offline browsing &amp; a native app experience
                    </p>
                    <p className="text-white/50 text-xs mt-0.5 sm:hidden">
                      Quick access &amp; offline browsing on your phone
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="shrink-0 flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={install}
                      className="group flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-fog-sage hover:bg-fog-sage/90 text-white text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg shadow-fog-sage/20 hover:shadow-fog-sage/30"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">
                        {hasDeferredPrompt ? 'Install App' : isIOS ? 'Add to Home Screen' : 'Install'}
                      </span>
                      <span className="sm:hidden">Install</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    <button
                      onClick={dismiss}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Dismiss install prompt"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Modal (iOS + generic fallback) */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={closeIOSInstructions}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card rounded-2xl border border-border/50 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className="relative px-6 pt-6 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-fog-sage via-fog-gold to-cyan-500" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#1e1c19] flex items-center justify-center shadow-lg">
                      <Smartphone className="w-5 h-5 text-fog-sage" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                        Install StudySpot
                      </h3>
                      <p className="text-xs text-muted-foreground">Add to your home screen</p>
                    </div>
                  </div>
                  <button
                    onClick={closeIOSInstructions}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="px-6 pb-6 space-y-5">
                {isIOS ? (
                  <>
                    {/* iOS Steps */}
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Share className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          1. Tap the Share button
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Find the share icon at the bottom of Safari (square with an arrow pointing up)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-fog-sage/10 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-fog-sage" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          2. Tap "Add to Home Screen"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Scroll down in the share menu until you see the option
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-fog-gold/10 flex items-center justify-center">
                        <Download className="w-5 h-5 text-fog-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          3. Tap "Add"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Confirm the name and tap Add in the top-right corner
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Generic browser steps */}
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <span className="text-blue-500 font-bold text-sm">...</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          1. Open browser menu
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Tap the three-dot menu (or share button) in your browser
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-fog-sage/10 flex items-center justify-center">
                        <Download className="w-5 h-5 text-fog-sage" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          2. Look for "Install App" or "Add to Home Screen"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          The option may vary by browser — look for install, add, or home screen options
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-fog-gold/10 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-fog-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          3. Confirm and enjoy
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          StudySpot will appear on your home screen like a native app
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={closeIOSInstructions}
                  className="w-full py-3 rounded-xl bg-fog-sage text-white text-sm font-semibold hover:bg-fog-sage/90 transition-colors shadow-sm"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
