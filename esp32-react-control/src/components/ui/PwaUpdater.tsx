import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registrado:', r)
    },
    onRegisterError(error) {
      console.error('Erro no registro do Service Worker:', error)
    },
  })

  // Check for updates on mount, visibility change, focus, and online status
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    const checkUpdate = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          console.log('Checking for service worker updates...')
          await registration.update()
        }
      } catch (err) {
        console.error('Failed to check SW update:', err)
      }
    }

    // 1. Check on mount after 2 seconds
    const timer = setTimeout(checkUpdate, 2000)

    // 2. Check on visibility change (re-opening app, unlocking device, tab change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUpdate()
      }
    }

    // 3. Check on window focus
    const handleFocus = () => {
      checkUpdate()
    }

    // 4. Check on internet connection restored
    const handleOnline = () => {
      checkUpdate()
    }

    // 5. Check every 10 minutes
    const interval = setInterval(checkUpdate, 10 * 60 * 1000)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('online', handleOnline)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (!needRefresh && !offlineReady) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-[999] bg-surface-container-high border border-primary/20 p-4 rounded-xl shadow-2xl animate-slideUp flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-3xl">
          {needRefresh ? 'update' : 'offline_pin'}
        </span>
        <div className="flex-1">
          <h4 className="font-semibold text-on-surface text-sm">
            {needRefresh ? 'Nova Versão Disponível!' : 'Pronto para Uso Offline!'}
          </h4>
          <p className="text-body-sm text-on-surface-variant mt-1 leading-relaxed">
            {needRefresh
              ? 'Uma nova versão do BioCore AI está disponível. Clique em atualizar para carregar as novidades.'
              : 'O aplicativo foi baixado com sucesso e agora funciona totalmente sem internet.'}
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2 text-xs">
        <button
          onClick={close}
          className="px-3 py-2 text-on-surface-variant hover:text-on-surface transition-all font-medium"
        >
          Fechar
        </button>
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:shadow-lg transition-all active:scale-95"
          >
            Atualizar
          </button>
        )}
      </div>
    </div>
  )
}
export default PwaUpdater;
