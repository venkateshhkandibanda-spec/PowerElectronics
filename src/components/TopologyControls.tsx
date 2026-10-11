import React from 'react';
import { ConverterConfig, ConverterMode, LoadType } from '../types/power-electronics';
import { Sliders, Zap, Cpu, Power } from 'lucide-react';

interface TopologyControlsProps {
  config: ConverterConfig;
  theme?: 'light' | 'dark';
  onChangeConfig: (newConfig: Partial<ConverterConfig>) => void;
  onToggleFWD: () => void;
}

export const TopologyControls: React.FC<TopologyControlsProps> = ({
  config,
  theme = 'light',
  onChangeConfig,
  onToggleFWD,
}) => {
  const {
    phase,
    topology,
    converterMode,
    hasFWD,
    firingAngleDeg,
    loadType,
    resistance,
    inductance,
    backEmf,
    sourceRms,
  } = config;

  const isLight = theme === 'light';
  const alphaPresets = [0, 30, 45, 60, 90, 120, 150];

  const cardClass = isLight
    ? 'bg-white border-slate-200 shadow-sm'
    : 'bg-[#0f141c] border-slate-800 shadow-md';

  const innerBoxClass = isLight
    ? 'bg-slate-50 border-slate-200'
    : 'bg-[#0b0e14] border-slate-800';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. CONVERTER TOPOLOGY PANEL */}
      <div className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-colors duration-200 ${cardClass}`}>
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-indigo-950/60 border-indigo-800 text-indigo-400'}`}>
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Converter Topology
              </h3>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              Architecture
            </span>
          </div>

          {/* Phase Selector */}
          <div className="mb-3">
            <label className={`text-xs block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              AC Supply Configuration
            </label>
            <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-xl border ${innerBoxClass}`}>
              <button
                onClick={() => onChangeConfig({ phase: '1-phase' })}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                  phase === '1-phase'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Single-Phase (1Φ)
              </button>
              <button
                onClick={() => onChangeConfig({ phase: '3-phase' })}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                  phase === '3-phase'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Three-Phase (3Φ)
              </button>
            </div>
          </div>

          {/* Rectification Type */}
          <div className="mb-3">
            <label className={`text-xs block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Rectification Waveform
            </label>
            <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-xl border ${innerBoxClass}`}>
              <button
                onClick={() => onChangeConfig({ topology: 'full-wave' })}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                  topology === 'full-wave'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Full-Bridge
              </button>
              <button
                onClick={() => onChangeConfig({ topology: 'half-wave' })}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                  topology === 'half-wave'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Half-Wave
              </button>
            </div>
          </div>

          {/* Device Control Mode */}
          <div>
            <label className={`text-xs block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Device Control Mode
            </label>
            <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${innerBoxClass}`}>
              <button
                onClick={() => onChangeConfig({ converterMode: 'DBR', firingAngleDeg: 0 })}
                className={`py-1 px-1.5 rounded-lg text-xs font-bold transition ${
                  converterMode === 'DBR'
                    ? 'bg-emerald-600 text-white'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                DBR (Diode)
              </button>
              <button
                onClick={() => onChangeConfig({ converterMode: 'TCR' })}
                className={`py-1 px-1.5 rounded-lg text-xs font-bold transition ${
                  converterMode === 'TCR'
                    ? 'bg-amber-600 text-white'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                TCR (Thyristor)
              </button>
              <button
                onClick={() => onChangeConfig({ converterMode: 'Semi-Converter' })}
                className={`py-1 px-1.5 rounded-lg text-xs font-bold transition ${
                  converterMode === 'Semi-Converter'
                    ? 'bg-indigo-600 text-white'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semi-Conv
              </button>
            </div>
          </div>
        </div>

        <div className={`mt-3 pt-2.5 border-t text-[11px] flex items-center justify-between ${
          isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
        }`}>
          <span>Operating State:</span>
          <span className="font-mono font-bold text-amber-500">
            {converterMode === 'DBR' ? 'Uncontrolled (Diodes)' : converterMode === 'TCR' ? 'Phase-Controlled (SCRs)' : 'Hybrid Semi-Converter'}
          </span>
        </div>
      </div>

      {/* 2. FIRING ANGLE & FREEWHEELING DIODE PANEL */}
      <div className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-colors duration-200 ${cardClass}`}>
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-950/60 border-amber-800 text-amber-400'}`}>
                <Zap className="w-4 h-4" />
              </div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Firing Angle & FWD
              </h3>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              Gate Control
            </span>
          </div>

          {/* Firing Angle Slider */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Firing Angle (α):
              </span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-900 border-slate-800 text-amber-400'
              }`}>
                {converterMode === 'DBR' ? '0° (Locked in DBR)' : `${firingAngleDeg}°`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="165"
              step="5"
              disabled={converterMode === 'DBR'}
              value={firingAngleDeg}
              onChange={(e) => onChangeConfig({ firingAngleDeg: parseInt(e.target.value) })}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500 ${
                converterMode === 'DBR' ? 'opacity-40 cursor-not-allowed bg-slate-300' : 'bg-slate-300 dark:bg-slate-800'
              }`}
            />

            {/* Quick α Presets */}
            <div className="flex items-center justify-between gap-1 mt-2">
              {alphaPresets.map((deg) => (
                <button
                  key={deg}
                  disabled={converterMode === 'DBR'}
                  onClick={() => onChangeConfig({ firingAngleDeg: deg })}
                  className={`text-[10px] font-mono py-1 px-1.5 rounded-md border transition ${
                    firingAngleDeg === deg && converterMode !== 'DBR'
                      ? 'bg-amber-500 border-amber-600 text-white font-bold shadow-sm'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Freewheeling Diode Control */}
          <div className={`p-3.5 rounded-xl border mt-2.5 ${innerBoxClass}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <Power className="w-3.5 h-3.5 text-amber-500" />
                Freewheeling Diode (D_FW)
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                  hasFWD
                    ? isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-950 border-emerald-800 text-emerald-300'
                    : isLight ? 'bg-rose-100 border-rose-300 text-rose-800' : 'bg-rose-950 border-rose-800 text-rose-300'
                }`}
              >
                {hasFWD ? 'IN CIRCUIT' : 'DISCONNECTED'}
              </span>
            </div>

            <button
              onClick={onToggleFWD}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98 ${
                hasFWD
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-800 text-white'
              }`}
            >
              {hasFWD ? 'FWD Connected (Click to Disconnect)' : 'Click to Insert FWD in Circuit'}
            </button>
          </div>
        </div>

        <p className={`mt-3 text-[11px] leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {hasFWD
            ? '✓ FWD connected: Clamps Vo ≥ 0V, eliminating negative inductive spikes.'
            : '⚠️ FWD disconnected: Inductive load causes negative voltage dips during AC reversal.'}
        </p>
      </div>

      {/* 3. LOAD & SOURCE PARAMETERS PANEL */}
      <div className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-colors duration-200 ${cardClass}`}>
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-indigo-950/60 border-indigo-800 text-indigo-400'}`}>
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Load & Source
              </h3>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              Electrical
            </span>
          </div>

          {/* Load Type Selector */}
          <div className="mb-3">
            <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${innerBoxClass}`}>
              {(['R', 'RL', 'RLE'] as LoadType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => onChangeConfig({ loadType: type })}
                  className={`py-1 px-2 rounded-lg text-xs font-bold transition ${
                    loadType === type
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type} Load
                </button>
              ))}
            </div>
          </div>

          {/* Resistance Slider & Direct Input */}
          <div className="mb-2.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Resistance (R):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="150"
                  step="1"
                  value={resistance}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) onChangeConfig({ resistance: Math.max(1, Math.min(150, val)) });
                  }}
                  className={`w-14 text-right px-1.5 py-0.5 rounded border font-mono font-bold text-xs ${
                    isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-900 border-slate-700 text-indigo-400'
                  }`}
                />
                <span className={`font-mono text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Ω</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="150"
              step="1"
              value={resistance}
              onChange={(e) => onChangeConfig({ resistance: parseInt(e.target.value) || 1 })}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 bg-slate-300 dark:bg-slate-800"
            />
          </div>

          {/* Inductance Slider & Direct Input */}
          {loadType !== 'R' && (
            <div className="mb-2.5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Inductance (L):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    step="1"
                    value={inductance}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) onChangeConfig({ inductance: Math.max(0, Math.min(200, val)) });
                    }}
                    className={`w-14 text-right px-1.5 py-0.5 rounded border font-mono font-bold text-xs ${
                      isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-900 border-slate-700 text-amber-400'
                    }`}
                  />
                  <span className={`font-mono text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>mH</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={inductance}
                onChange={(e) => onChangeConfig({ inductance: parseInt(e.target.value) || 0 })}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500 bg-slate-300 dark:bg-slate-800"
              />
            </div>
          )}

          {/* Back-EMF Slider & Direct Input */}
          {loadType === 'RLE' && (
            <div className="mb-2.5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Back-EMF (E):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    step="1"
                    value={backEmf}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) onChangeConfig({ backEmf: Math.max(0, Math.min(200, val)) });
                    }}
                    className={`w-14 text-right px-1.5 py-0.5 rounded border font-mono font-bold text-xs ${
                      isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-900 border-slate-700 text-rose-400'
                    }`}
                  />
                  <span className={`font-mono text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>V</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={backEmf}
                onChange={(e) => onChangeConfig({ backEmf: parseInt(e.target.value) || 0 })}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-rose-500 bg-slate-300 dark:bg-slate-800"
              />
            </div>
          )}

          {/* Source Voltage Slider */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Source Voltage:</span>
              <span className={`font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{sourceRms} V RMS</span>
            </div>
            <input
              type="range"
              min="110"
              max="480"
              step="10"
              value={sourceRms}
              onChange={(e) => onChangeConfig({ sourceRms: parseInt(e.target.value) })}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 bg-slate-300 dark:bg-slate-800"
            />
          </div>
        </div>

        <div className={`mt-3 pt-2.5 border-t text-[11px] flex items-center justify-between ${
          isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
        }`}>
          <span>Grid Frequency:</span>
          <span className={`font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>50 Hz (T = 20ms)</span>
        </div>
      </div>
    </div>
  );
};
