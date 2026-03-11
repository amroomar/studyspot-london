/**
 * PWAInstallBanner — "Add to Home Screen" prompt
 * Shows a dismissible banner at the bottom of the screen (above mobile nav)
 * On iOS, shows instructions for manual Add to Home Screen
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function PWAInstallBanner() {
  const {
    canInstall,
    isIOS,
    showIOSInstructions,
    install,
    dismiss,
    closeIOSInstructions,
  } = usePWAInstall();

  return (
    <>
      {/* Install Banner */}
      <AnimatePresence>
        {canInstall && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-40 left-3 right-3 bottom-20 lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm"
          >
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
              {/* Decorative gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fog-sage via-fog-gold to-cyan-500" />

              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* App icon preview */}
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-[#1e1c19] flex items-center justify-center shadow-lg">
                    <Smartphone className="w-6 h-6 text-fog-sage" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground leading-tight">
                      Install StudySpot
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      Add to your home screen for quick access, offline browsing, and a native app experience.
                    </p>
                  </div>

                  {/* Dismiss button */}
                  <button
                    onClick={dismiss}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    aria-label="Dismiss install prompt"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={install}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-fog-sage text-white text-sm font-semibold hover:bg-fog-sage/90 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    {isIOS ? 'How to Install' : 'Install App'}
                  </button>
                  <button
                    onClick={dismiss}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions Modal */}
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
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-card rounded-2xl border border-border/50 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-5 pb-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fog-sage via-fog-gold to-cyan-500" />
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                    Install StudySpot
                  </h3>
                  <button
                    onClick={closeIOSInstructions}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Follow these steps to add StudySpot to your home screen:
                </p>
              </div>

              {/* Steps */}
              <div className="px-5 pb-5 space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Share className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      1. Tap the Share button
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Find the share icon at the bottom of Safari (square with arrow pointing up)
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-fog-sage/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-fog-sage" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      2. Tap "Add to Home Screen"
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Scroll down in the share menu and tap the option
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-fog-gold/10 flex items-center justify-center">
                    <Download className="w-4 h-4 text-fog-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      3. Tap "Add"
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Confirm the name and tap Add in the top right corner
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5">
                <button
                  onClick={closeIOSInstructions}
                  className="w-full py-2.5 rounded-xl bg-fog-sage text-white text-sm font-semibold hover:bg-fog-sage/90 transition-colors"
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
