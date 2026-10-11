import React from 'react';
import { CycleSimulationResult } from '../types/power-electronics';
import { BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MetricsCardsProps {
  simulationResult: CycleSimulationResult;
  theme?: 'light' | 'dark';
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  simulationResult,
  theme = 'light',
}) => {
  const { metrics } = simulationResult;
  const isLight = theme === 'light';

  const cardClass = isLight
    ? 'bg-white border-slate-200 shadow-sm'
    : 'bg-[#0f141c] border-slate-800 shadow-md';

  return (
    <div className="space-y-4">
      {/* 6 Key Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Avg DC Voltage */}
        <div className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-colors duration-200 ${cardClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Avg DC Voltage
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border font-bold ${
              isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-indigo-950 border-indigo-800 text-indigo-300'
            }`}>
              V_dc
            </span>
          </div>
          <div className="my-2">
            <div className={`text-xl font-extrabold font-mono ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
              {metrics.v_dc.toFixed(1)} <span className="text-xs font-normal text-slate-400">V</span>
            </div>
            <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              V_rms = {metrics.v_rms.toFixed(1)}V
            </div>
          </div>
        </div>

        {/* 2. Avg DC Current */}
        <div className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-colors duration-200 ${cardClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Avg DC Current
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border font-bold ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-950 border-emerald-800 text-emerald-300'
            }`}>
              I_dc
            </span>
          </div>
          <div className="my-2">
            <div className={`text-xl font-extrabold font-mono ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
              {metrics.i_dc.toFixed(2)} <span className="text-xs font-normal text-slate-400">A</span>
            </div>
            <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              I_rms = {metrics.i_rms.toFixed(2)}A
            </div>
          </div>
        </div>

        {/* 3. Output Power */}
        <div className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-colors duration-200 ${cardClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Output Power
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border font-bold ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-950 border-amber-800 text-amber-300'
            }`}>
              P_dc
            </span>
          </div>
          <div className="my-2">
            <div className={`text-xl font-extrabold font-mono ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
              {metrics.p_dc.toFixed(1)} <span className="text-xs font-normal text-slate-400">W</span>
            </div>
            <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              S_in = {metrics.s_in.toFixed(0)}VA
            </div>
          </div>
        </div>

        {/* 4. Power Factor */}
        <div className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-colors duration-200 ${cardClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Power Factor
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border font-bold ${
              isLight ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-purple-950 border-purple-800 text-purple-300'
            }`}>
              PF
            </span>
          </div>
          <div className="my-2">
            <div className={`text-xl font-extrabold font-mono ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
              {metrics.pf.toFixed(3)}
            </div>
            <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              cos(φ₁) = {metrics.displacementPf.toFixed(3)}
            </div>
          </div>
        </div>

        {/* 5. Ripple Factor */}
        <div className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-colors duration-200 ${cardClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Ripple Factor
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border font-bold ${
              isLight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-950 border-rose-800 text-rose-300'
            }`}>
              RF
            </span>
          </div>
          <div className="my-2">
            <div className={`text-xl font-extrabold font-mono ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>
              {metrics.rippleFactor.toFixed(3)}
            </div>
            <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              FF = {metrics.formFactor.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 6. Current THD & Conduction Mode */}
        <div className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-colors duration-200 ${cardClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Source THD_i
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border font-bold ${
              isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-950 border-blue-800 text-blue-300'
            }`}>
              THD
            </span>
          </div>
          <div className="my-2">
            <div className={`text-xl font-extrabold font-mono ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
              {metrics.thd.toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
            </div>
            <div className="text-[10px] font-mono font-bold flex items-center gap-1">
              {metrics.conductionMode === 'CCM' ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> CCM Mode
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" /> DCM Mode
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Derivation Box */}
      <div className={`rounded-2xl border p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-200 ${cardClass}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl border shrink-0 ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-950/60 border-amber-800 text-amber-400'
          }`}>
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Analytical Voltage Derivation & Working Principle
            </h4>
            <p className={`text-xs mt-0.5 max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {metrics.theoreticalExplanation}
            </p>
          </div>
        </div>

        {/* Theoretical Formula Pill */}
        <div className={`flex items-center gap-4 px-4 py-2.5 rounded-xl border shrink-0 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0e14] border-slate-800'
        }`}>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Theoretical Formula</div>
            <div className={`text-xs font-mono font-bold ${isLight ? 'text-indigo-600' : 'text-indigo-300'}`}>
              {metrics.theoreticalFormula}
            </div>
          </div>
          <div className={`border-l pl-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div className="text-[10px] font-mono uppercase text-slate-400">Ideal V_dc</div>
            <div className="text-sm font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
              {metrics.theoreticalVdc.toFixed(1)} V
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
