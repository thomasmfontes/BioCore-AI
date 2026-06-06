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
      return // Already installed, do not show anything
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

    // Android/Chrome direct prompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS or browsers that don't trigger the event, show the manual install banner after a short delay
    const timer = setTimeout(() => {
      if (!deferredPrompt) {
        setShowBanner(true)
      }
    }, 4000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, [deferredPrompt])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger browser's native installation prompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowBanner(false)
      }
    } else {
      // Show instruction modal for manual install (iOS or unsupported browsers)
      setShowModal(true)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    // Persist dismissal for 15 days so we don't annoy the user
    localStorage.setItem('biocore-pwa-install-dismissed', 'true')
  }

  if (!showBanner && !showModal) return null

  return (
    <>
      {/* Floating Banner */}
      {showBanner && !showModal && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-[990] bg-surface-container-high border border-primary/30 p-4 rounded-xl shadow-2xl animate-slideUp flex flex-col gap-3 glow-primary">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">
              install_mobile
            </span>
            <div className="flex-1">
              <h4 className="font-semibold text-on-surface text-sm">
                Instale o BioCore AI!
              </h4>
              <p className="text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                Adicione o aplicativo à tela inicial para carregamento instantâneo, visualização em tela cheia e uso offline.
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
              className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:shadow-lg transition-all active:scale-95 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Instalar
            </button>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-md bg-surface-container border border-outline-variant rounded-2xl shadow-2xl p-6 overflow-hidden animate-slideUp flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {isIOS ? 'phone_iphone' : 'phone_android'}
                </span>
                <h3 className="font-title-md text-on-surface text-lg font-bold">
                  Instalar no {isIOS ? 'iOS (Safari)' : 'Android / Navegador'}
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
                Siga estes passos rápidos para rodar o BioCore AI como um aplicativo nativo:
              </p>

              {isIOS ? (
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
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Android Step 1 */}
                  <div className="flex gap-4 items-start bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="text-body-sm text-on-surface font-semibold flex items-center gap-1.5">
                        Abra o menu do navegador 
                        <span className="material-symbols-outlined text-primary text-base font-normal inline-flex items-center p-1 bg-surface-variant rounded">
                          more_vert
                        </span>
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Toque no botão de três pontos no canto superior direito do Chrome.
                      </p>
                    </div>
                  </div>

                  {/* Android Step 2 */}
                  <div className="flex gap-4 items-start bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="text-body-sm text-on-surface font-semibold flex items-center gap-1.5">
                        Toque em <span className="text-primary font-bold">"Instalar aplicativo"</span> ou <span className="text-primary font-bold">"Adicionar à tela inicial"</span>
                      </p>
                    </div>
                  </div>

                  {/* Android Step 3 */}
                  <div className="flex gap-4 items-start bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="text-body-sm text-on-surface font-semibold">
                        Aguarde e aproveite!
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        O aplicativo estará disponível para uso com carregamento instantâneo.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-2 w-full py-3 bg-primary text-on-primary font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98] text-sm"
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
