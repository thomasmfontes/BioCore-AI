import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // 1. Checagem imediata ao registrar
        r.update().catch(() => {});

        // 2. Checagem frequente a cada 15 segundos
        const interval = setInterval(() => {
          r.update().catch(() => {});
        }, 15 * 1000);

        // 3. Checagem sempre que o usuário voltar ao app (troca de aba / desbloqueio)
        const handleFocus = () => {
          r.update().catch(() => {});
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            r.update().catch(() => {});
          }
        });

        return () => {
          clearInterval(interval);
          window.removeEventListener('focus', handleFocus);
        };
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
    // Ativa o novo Service Worker e realiza o reload da nova versão
    updateServiceWorker(true);
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="pointer-events-auto w-full clay-card-dark p-4 rounded-2xl animate-slideUp flex flex-col gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-primary/20">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-3xl animate-bounce">
          {needRefresh ? 'update' : 'offline_pin'}
        </span>
        <div className="flex-1">
          <h4 className="font-semibold text-on-surface text-sm">
            {needRefresh ? 'Nova Versão Disponível!' : 'Pronto para Uso Offline!'}
          </h4>
          <p className="text-body-sm text-on-surface-variant mt-1 leading-relaxed">
            {needRefresh
              ? 'Uma nova versão do BioCore AI foi publicada. Clique em atualizar para carregar as novidades.'
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
            Atualizar Agora
          </button>
        )}
      </div>
    </div>
  );
}

export default PwaUpdater;
