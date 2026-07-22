import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Auto-recuperação contra falhas pontuais de carregamento de chunk durante trocas de versão do PWA
window.addEventListener('error', (e) => {
  const isChunkError = e.message && (
    e.message.includes('Loading chunk') || 
    e.message.includes('Importing a module script failed') ||
    e.message.includes('Unexpected token')
  );
  if (isChunkError) {
    console.warn('Falha na troca de versão do PWA detectada. Recarregando de forma limpa...');
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
