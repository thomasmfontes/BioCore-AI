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
