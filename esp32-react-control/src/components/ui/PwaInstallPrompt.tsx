import { useState, useEffect } from 'react'

export function PwaInstallPrompt() {
  const [showBanner, setShowBanner] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed / running in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true

    if (isStandalone) {
      return
    }

    // Check if dismissed before
    const isDismissed = localStorage.getItem('biocore-pwa-install-dismissed')
    if (isDismissed === 'true') {
      return
    }

    // Detect if iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(ios)

    if (ios) {
      // For iOS, show the banner after 4 seconds since it does not support beforeinstallprompt
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 4000)
      return () => clearTimeout(timer)
    } else {
      // For Android / Desktop, ONLY show banner if browser fires beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setShowBanner(true)
      }
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger browser's native installation prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowBanner(false)
      }
    } else if (isIOS) {
      // Show instruction modal ONLY for iOS
      setShowModal(true)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    // Persist dismissal
    localStorage.setItem('biocore-pwa-install-dismissed', 'true')
  }

  if (!showBanner && !showModal) return null

  return (
    <>
      {/* Floating Banner */}
      {showBanner && !showModal && (
        <div className="pointer-events-auto w-full clay-card-dark p-4 rounded-2xl animate-slideUp flex flex-col gap-3 glow-primary">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">
              install_mobile
            </span>
            <div className="flex-1">
              <h4 className="font-semibold text-on-surface text-sm">
                Instale o BioCore AI!
              </h4>
              <p className="text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                Adicione o aplicativo à tela inicial para carregamento instantâneo, visualização em tela cheia e suporte offline.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 text-xs mt-1">
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-on-surface-variant hover:text-on-surface transition-all font-medium"
            >
              Agora Não
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 clay-btn-primary font-bold rounded-xl active:scale-95 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Instalar
            </button>
          </div>
        </div>
      )}

      {/* Tutorial Modal - ONLY FOR iOS */}
      {showModal && isIOS && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-md clay-card-dark rounded-3xl p-6 overflow-hidden animate-slideUp flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">
                  phone_iphone
                </span>
                <h3 className="font-title-md text-on-surface text-lg font-bold">
                  Instalar no iOS (Safari)
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-on-surface transition-all w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 py-2">
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                Siga estes passos rápidos para rodar o BioCore AI como um aplicativo nativo no seu iPhone ou iPad:
              </p>

              <div className="flex flex-col gap-4">
                {/* iOS Step 1 */}
                <div className="flex gap-4 items-start bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="text-body-sm text-on-surface font-semibold flex items-center gap-1.5">
                      Toque no botão de compartilhar 
                      <span className="material-symbols-outlined text-primary text-base font-normal inline-flex items-center p-1 bg-surface-variant rounded">
                        ios_share
                      </span>
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Ele fica na barra inferior do Safari (no iPhone) ou no topo (no iPad).
                    </p>
                  </div>
                </div>

                {/* iOS Step 2 */}
                <div className="flex gap-4 items-start bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="flex-1">
                    <p className="text-body-sm text-on-surface font-semibold flex items-center gap-1.5 font-sans">
                      Selecione 
                      <span className="text-primary font-bold">"Adicionar à Tela de Início"</span>
                      <span className="material-symbols-outlined text-primary text-base font-normal inline-flex items-center p-1 bg-surface-variant rounded">
                        add_box
                      </span>
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Role a lista de opções para baixo até encontrar esta opção.
                    </p>
                  </div>
                </div>

                {/* iOS Step 3 */}
                <div className="flex gap-4 items-start bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="flex-1">
                    <p className="text-body-sm text-on-surface font-semibold">
                      Confirme clicando em <span className="text-primary font-bold">"Adicionar"</span>
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Pronto! O ícone do BioCore AI aparecerá na sua tela inicial como um app nativo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-2 w-full py-3 clay-btn-primary font-bold rounded-2xl active:scale-[0.98] text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
export default PwaInstallPrompt;
