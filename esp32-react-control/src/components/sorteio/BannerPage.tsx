import React, { useState } from 'react'
import { ArrowLeft, Download, Printer, ZoomIn, ZoomOut, Check, Sparkles } from 'lucide-react'

export function BannerPage() {
  const [zoom, setZoom] = useState<number>(100)
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = '/banner-biocore-next-2026.png'
    link.download = 'banner-biocore-next-2026.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/banner-biocore-next-2026.png')
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#0b0f11] text-white flex flex-col font-sans selection:bg-primary/30">
      {/* Barra Superior - Toolbar Não Imprimível */}
      <header className="sticky top-0 z-50 bg-[#111417]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <a
            href="/sorteio"
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-white transition-all active:scale-95"
            title="Voltar para o formulário"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide text-white">Banner Oficial BioCore AI</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                NEXT 2026
              </span>
            </div>
            <p className="text-[11px] text-white/50">Formato Roll-up (Proporção 80 x 180cm / 80 x 200cm)</p>
          </div>
        </div>

        {/* Controles e Botões de Ação */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
            <button
              onClick={() => setZoom(prev => Math.max(50, prev - 15))}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-white/70">{zoom}%</span>
            <button
              onClick={() => setZoom(prev => Math.min(200, prev + 15))}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Copiar Link Direto */}
          <button
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Copiar URL da imagem"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
            <span className="hidden md:inline">{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>

          {/* Imprimir / Salvar PDF */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-medium text-white transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-4 h-4 text-primary" />
            <span>Imprimir / PDF</span>
          </button>

          {/* Baixar Imagem Alta Resolução */}
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-fixed text-[#00210f] text-xs font-bold transition-all shadow-[0_4px_16px_rgba(90,240,157,0.2)] flex items-center gap-2 cursor-pointer active:scale-95"
            title="Baixar arquivo PNG em alta resolução"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Baixar PNG (Alta Resolução)</span>
          </button>
        </div>
      </header>

      {/* Área Central de Visualização */}
      <main className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-[#070b09] print:p-0 print:bg-white">
        <div 
          className="transition-all duration-200 ease-out origin-top flex flex-col items-center print:w-full print:m-0"
          style={{ width: `${zoom}%`, maxWidth: '780px' }}
        >
          {/* Cartão de Moldura do Banner */}
          <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 print:border-none print:shadow-none print:rounded-none">
            <img
              src="/banner-biocore-next-2026.png"
              alt="Banner Oficial BioCore AI - NEXT 2026"
              className="w-full h-auto object-contain block select-none"
            />
          </div>

          <div className="mt-4 text-center text-xs text-white/40 print:hidden pb-6">
            Dica: Para gráficas, envie diretamente o arquivo <strong className="text-white/70">banner-biocore-next-2026.png</strong> ou use <strong className="text-white/70">Imprimir → Salvar como PDF</strong>.
          </div>
        </div>
      </main>

      {/* Estilos específicos de impressão */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0;
          }
          body {
            background: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
