import React from 'react';
import { CycleSimulationResult } from '../types/power-electronics';
import { X, BarChart3, Info } from 'lucide-react';

interface HarmonicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulationResult: CycleSimulationResult;
  theme?: 'light' | 'dark';
}

export const HarmonicsModal: React.FC<HarmonicsModalProps> = ({
  isOpen,
  onClose,
  simulationResult,
  theme = 'light',
}) => {
  if (!isOpen) return null;

  const { harmonics, metrics } = simulationResult;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0f141c] border-slate-800 text-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141b26] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-amber-500">
            <BarChart3 className="w-5 h-5" />
            <div>
              <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Source Current Harmonics & FFT Spectrum
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Frequency distribution of input AC current
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition ${
              isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Box */}
          <div
            className={`grid grid-cols-2 gap-4 p-4 rounded-xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0e14] border-slate-800'
            }`}
          >
            <div>
              <div className={`text-xs font-mono uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Total Harmonic Distortion (THD_i)
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {metrics.thd}%
              </div>
              <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Measures current distortion relative to fundamental
              </div>
            </div>
            <div>
              <div className={`text-xs font-mono uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Displacement Power Factor
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {metrics.displacementPf}
              </div>
              <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                cos(φ₁) due to phase angle displacement α
              </div>
            </div>
          </div>

          {/* Harmonic Bar Chart */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Harmonic Orders (Fundamental = 100%)
            </h4>

            <div className="space-y-2.5">
              {harmonics.map((h) => (
                <div key={h.harmonic} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}>
                      Harmonic {h.harmonic} ({h.frequencyHz} Hz):
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {h.magnitude} A ({h.percentage}%)
                    </span>
                  </div>
                  <div className={`h-3 w-full rounded-full overflow-hidden border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0b0e14] border-slate-800'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        h.harmonic === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, h.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Note */}
          <div className={`p-3.5 rounded-xl border text-xs flex gap-2.5 ${
            isLight ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-800 text-amber-200'
          }`}>
            <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Harmonic Filtering Insight:</strong> Full-wave bridge rectifiers eliminate even harmonics (2f, 4f, ...), leaving only odd harmonics (3f, 5f, 7f, ...). In 3-phase 6-pulse converters, triplen harmonics (3f, 9f) cancel out in balanced line currents, leaving predominant 6k ± 1 orders (5th, 7th, 11th, 13th).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
