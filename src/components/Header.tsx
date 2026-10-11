import React, { useState } from 'react';
import { ConverterConfig } from '../types/power-electronics';
import { Zap, BookOpen, BarChart3, RotateCcw, Share2, Check, Sparkles, Sun, Moon, Cpu } from 'lucide-react';

interface HeaderProps {
  config: ConverterConfig;
  theme: 'light' | 'dark';
  layoutMode: 'split' | 'stacked';
  onToggleTheme: () => void;
  onToggleLayout: () => void;
  onApplyPreset: (preset: Partial<ConverterConfig>) => void;
  onOpenHarmonics: () => void;
  onOpenTheory: () => void;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  layoutMode,
  onToggleTheme,
  onToggleLayout,
  onApplyPreset,
  onOpenHarmonics,
  onOpenTheory,
  onResetAll,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  const isLight = theme === 'light';

  const presets = [
    {
      name: '1Φ DBR Full-Bridge (Diode Rectifier, R Load)',
      config: {
        phase: '1-phase' as const,
        topology: 'full-wave' as const,
        converterMode: 'DBR' as const,
        hasFWD: false,
        firingAngleDeg: 0,
        loadType: 'R' as const,
        resistance: 20,
        inductance: 0,
      },
    },
    {
      name: '1Φ TCR with RL Load & NO FWD (Negative Vo Spikes)',
      config: {
        phase: '1-phase' as const,
        topology: 'full-wave' as const,
        converterMode: 'TCR' as const,
        hasFWD: false,
        firingAngleDeg: 45,
        loadType: 'RL' as const,
        resistance: 20,
        inductance: 45,
      },
    },
    {
      name: '1Φ TCR with RL Load & Freewheeling Diode (Clamped at 0V)',
      config: {
        phase: '1-phase' as const,
        topology: 'full-wave' as const,
        converterMode: 'TCR' as const,
        hasFWD: true,
        firingAngleDeg: 45,
        loadType: 'RL' as const,
        resistance: 20,
        inductance: 45,
      },
    },
    {
      name: '1Φ Semi-Converter (Half Controlled Bridge)',
      config: {
        phase: '1-phase' as const,
        topology: 'full-wave' as const,
        converterMode: 'Semi-Converter' as const,
        hasFWD: true,
        firingAngleDeg: 60,
        loadType: 'RL' as const,
        resistance: 25,
        inductance: 50,
      },
    },
    {
      name: '3Φ 6-Pulse DBR (Industrial Diode Bridge)',
      config: {
        phase: '3-phase' as const,
        topology: 'full-wave' as const,
        converterMode: 'DBR' as const,
        hasFWD: false,
        firingAngleDeg: 0,
        loadType: 'RL' as const,
        resistance: 20,
        inductance: 30,
        sourceRms: 230,
      },
    },
    {
      name: '3Φ 6-Pulse TCR (Controlled Converter α = 45°)',
      config: {
        phase: '3-phase' as const,
        topology: 'full-wave' as const,
        converterMode: 'TCR' as const,
        hasFWD: false,
        firingAngleDeg: 45,
        loadType: 'RL' as const,
        resistance: 20,
        inductance: 35,
        sourceRms: 230,
      },
    },
    {
      name: '3Φ Half-Wave Converter with FWD (3-Pulse)',
      config: {
        phase: '3-phase' as const,
        topology: 'half-wave' as const,
        converterMode: 'TCR' as const,
        hasFWD: true,
        firingAngleDeg: 60,
        loadType: 'RL' as const,
        resistance: 20,
        inductance: 40,
        sourceRms: 230,
      },
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header
      className={`border-b sticky top-0 z-40 backdrop-blur-md px-4 py-3 transition-colors duration-200 ${
        isLight ? 'bg-white/95 border-slate-200 shadow-sm' : 'bg-[#0f141c]/95 border-slate-800 shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Title & Author Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Power Electronics Circuit Studio
              </h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-950 border-amber-800 text-amber-300'
              }`}>
                DBR • TCR • FWD
              </span>
            </div>
            {/* User credit requested by user */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-xs font-bold text-amber-500 tracking-wide">
                [Venkateshh Kandibanda]
              </span>
              <span className="font-mono text-xs font-bold text-indigo-500 tracking-wide">
                [24EE10020]
              </span>
              <span className={`text-[11px] ml-1 hidden sm:inline ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                • Interactive Converter Simulator
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Theme Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
            }`}
            title="Toggle Light / Dark Theme"
          >
            {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-600" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isLight ? 'Dark Studio' : 'Light Lab'}</span>
          </button>

          {/* Layout Toggle Button */}
          <button
            onClick={onToggleLayout}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Toggle Side-by-Side vs Wide Circuit Layout"
          >
            <span>{layoutMode === 'split' ? '⊞ Wide Circuit' : '⊟ Split View'}</span>
          </button>

          {/* Presets dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Presets</span>
            </button>

            {showPresetsMenu && (
              <div
                className={`absolute right-0 mt-2 w-72 rounded-xl border shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#141b26] border-slate-800'
                }`}
              >
                <div className={`px-3 py-2 text-[10px] uppercase font-mono border-b ${
                  isLight ? 'text-slate-500 border-slate-100' : 'text-slate-400 border-slate-800'
                }`}>
                  Select Converter Preset
                </div>
                <div className="py-1">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onApplyPreset(p.config);
                        setShowPresetsMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition ${
                        isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FFT Harmonics Button */}
          <button
            onClick={onOpenHarmonics}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Harmonics (FFT)</span>
          </button>

          {/* Theory / Equations Button */}
          <button
            onClick={onOpenTheory}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isLight
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                : 'bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border-amber-800/80'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Theory & Equations</span>
          </button>

          {/* Share / Copy App Link */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Copy App URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-amber-500" />}
            <span>{copied ? 'Link Copied!' : 'Share App'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={onResetAll}
            className={`p-1.5 rounded-lg border transition ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
            }`}
            title="Reset All Parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
