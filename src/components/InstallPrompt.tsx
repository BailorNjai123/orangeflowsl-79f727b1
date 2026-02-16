import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Radio, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (localStorage.getItem('pwa-install-dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (isIOS()) {
      setTimeout(() => {
        setShowIOSBanner(true);
      }, 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShow(false);
    setShowIOSBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  }, []);

  if (dismissed) return null;

  const showBanner = show || showIOSBanner;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-sm"
        >
          <div className="rounded-xl border bg-card p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-orange">
                <Radio className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-card-foreground">Install OrangeFlow SL</h3>
                {showIOSBanner ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Tap <Share className="inline h-3 w-3 mx-0.5" /> then <strong>"Add to Home Screen"</strong> to install.
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Add to your home screen for faster access and offline support.
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  {!showIOSBanner && (
                    <Button size="sm" className="gradient-orange border-0 text-primary-foreground text-xs h-8" onClick={handleInstall}>
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Install
                    </Button>
                  )}
                  <button
                    type="button"
                    className="text-xs h-8 px-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent pointer-events-auto"
                    style={{ touchAction: 'manipulation' }}
                    onClick={handleDismiss}
                    onTouchEnd={handleDismiss}
                  >
                    {showIOSBanner ? 'Got it' : 'Not now'}
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md pointer-events-auto"
                style={{ touchAction: 'manipulation' }}
                onClick={handleDismiss}
                onTouchEnd={handleDismiss}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
