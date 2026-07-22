import React from 'react';
import { PlantCamera } from '../ui/PlantCamera';

export function CameraTab() {
  return (
    <div className="space-y-3 animate-fadeIn">
      {/* Live Stream Main View */}
      <PlantCamera />

      {/* Minimalist Hardware Info Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="clay-card-dark rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30 inset-shadow shrink-0">
            <span className="material-symbols-outlined text-primary text-base">developer_board</span>
          </div>
          <div>
            <span className="font-label-caps text-[9px] text-outline block uppercase font-bold">Módulo</span>
            <span className="text-xs font-bold text-on-surface">Arduino UNO Q</span>
          </div>
        </div>

        <div className="clay-card-dark rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/30 inset-shadow shrink-0">
            <span className="material-symbols-outlined text-secondary text-base">movie</span>
          </div>
          <div>
            <span className="font-label-caps text-[9px] text-outline block uppercase font-bold">Stream</span>
            <span className="text-xs font-bold text-on-surface">MJPEG Stream</span>
          </div>
        </div>
      </div>
    </div>
  );
}
