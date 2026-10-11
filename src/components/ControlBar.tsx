import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface ControlBarProps {
  isRunning: boolean;
  onToggleRun: () => void;
  angleDeg: number;
  onAngleChange: (deg: number) => void;
  speed: number;
  theme?: 'light' | 'dark';
  onSpeedChange: (speed: number) => void;
  onStep: (deltaDeg: number) => void;
  onReset: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isRunning,
  onToggleRun,
  angleDeg,
  onAngleChange,
  speed,
  theme = 'light',
  onSpeedChange,
  onStep,
  onReset,
}) => {
  const speeds = [0.1, 0.25, 0.5, 1.0, 2.0];
  const isLight = theme === 'light';

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0f141c] border-slate-800 shadow-md'
      }`}
    >
      {/* Run & Navigation Controls */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
        {/* Main Run Button */}
        <button
          onClick={onToggleRun}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Sweep</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run (0° → 360°)</span>
            </>
          )}
        </button>

        {/* Step Backward */}
        <button
          onClick={() => onStep(-15)}
          className={`p-2.5 rounded-xl border transition ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Step Backward -15°"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Step Forward */}
        <button
          onClick={() => onStep(15)}
          className={`p-2.5 rounded-xl border transition ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Step Forward +15°"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className={`p-2.5 rounded-xl border transition ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Reset to 0°"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Angle Slider Scrubber */}
      <div className="flex-1 w-full max-w-xl flex items-center gap-3 px-2">
        <span className={`text-xs font-mono font-bold whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Sweep ωt:
        </span>
        <div className="relative flex-1">
          <input
            type="range"
            min="0"
            max="360"
            step="0.5"
            value={angleDeg}
            onChange={(e) => onAngleChange(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500 bg-slate-300 dark:bg-slate-800"
          />
          {/* Quick markers */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span onClick={() => onAngleChange(0)} className="cursor-pointer hover:text-amber-500">0°</span>
            <span onClick={() => onAngleChange(90)} className="cursor-pointer hover:text-amber-500">90°</span>
            <span onClick={() => onAngleChange(180)} className="cursor-pointer hover:text-amber-500">180°</span>
            <span onClick={() => onAngleChange(270)} className="cursor-pointer hover:text-amber-500">270°</span>
            <span onClick={() => onAngleChange(360)} className="cursor-pointer hover:text-amber-500">360°</span>
          </div>
        </div>
        <div className="w-20 text-right">
          <span className={`font-mono text-sm font-bold px-2.5 py-1 rounded-lg border ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-900 border-slate-800 text-amber-400'
          }`}>
            {angleDeg.toFixed(1)}°
          </span>
        </div>
      </div>

      {/* Speed Selector */}
      <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
        <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
        <span className={`text-xs font-mono font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Speed:
        </span>
        <div className={`flex p-1 rounded-xl border ${
          isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#090d16] border-slate-800'
        }`}>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-0.5 text-xs font-mono rounded-lg transition ${
                speed === s
                  ? 'bg-amber-500 text-white font-bold shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
