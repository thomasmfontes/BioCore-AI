import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Verificar atualizações de forma estável a cada 60 minutos
        setInterval(() => {
          r.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Erro no registro do Service Worker:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleUpdate = () => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // Ativa o novo Service Worker e permite que o vite-plugin-pwa gerencie a recarga limpa
    updateServiceWorker(true);
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="pointer-events-auto w-full clay-card-dark p-4 rounded-2xl animate-slideUp flex flex-col gap-3">
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
            onClick={handleUpdate}
            className="px-4 py-2 clay-btn-primary font-bold rounded-xl active:scale-95"
          >
            Atualizar
          </button>
        )}
      </div>
    </div>
  );
}
export default PwaUpdater;
