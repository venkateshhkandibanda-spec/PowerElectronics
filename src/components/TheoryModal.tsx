import React from 'react';
import { X, BookOpen, Check, Zap } from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const TheoryModal: React.FC<TheoryModalProps> = ({
  isOpen,
  onClose,
  theme = 'light',
}) => {
  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`border rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${
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
            <BookOpen className="w-5 h-5" />
            <div>
              <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Power Electronics Converter Theory
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Engineering principles, derivations, and freewheeling diode behavior
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
        <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed">
          {/* Section 1: DBR vs TCR */}
          <div
            className={`p-4.5 rounded-2xl border space-y-2.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0e14] border-slate-800'
            }`}
          >
            <h4 className="font-bold text-amber-500 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" /> 1. DBR vs TCR Rectifiers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#141a24] border-slate-800'}`}>
                <span className={`font-bold block mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  DBR (Diode Bridge Rectifier)
                </span>
                Uncontrolled rectifier. Diodes commutate naturally whenever forward-biased (anode potential exceeds cathode potential). Firing delay angle α = 0°. Produces fixed DC output voltage.
              </div>
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#141a24] border-slate-800'}`}>
                <span className={`font-bold block mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  TCR (Thyristor Controlled Rectifier)
                </span>
                Fully-controlled phase converter. Thyristors (SCRs) block forward voltage until an intentional gate trigger pulse is applied at angle α. Allows continuous variable DC output voltage control from 0° to 180°.
              </div>
            </div>
          </div>

          {/* Section 2: Freewheeling Diode (FWD) */}
          <div
            className={`p-4.5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0e14] border-slate-800'
            }`}
          >
            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" /> 2. Role of the Freewheeling Diode (FWD / D_FW)
            </h4>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              When supplying inductive loads (RL or RLE), the inductor stores magnetic energy (½·L·i²). When the AC source reverses polarity:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-rose-950/30 border-rose-900/50 text-rose-200'}`}>
                <span className="font-bold block mb-1">WITHOUT FWD (Disconnected)</span>
                The inductor counter-electromotive force (-L·di/dt) forces the thyristors to keep conducting into the negative half-cycle. This creates large negative voltage dips across the load, reducing average DC voltage and worsening power factor.
              </div>
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-200'}`}>
                <span className="font-bold block mb-1">WITH FWD (In Circuit)</span>
                The moment the output voltage tries to go negative, the Freewheeling Diode becomes forward-biased and turns ON immediately! It clamps Vo to 0V, commutating the thyristors OFF and allowing stored inductive energy to circulate smoothly in the load loop.
              </div>
            </div>
          </div>

          {/* Section 3: Summary of Analytical Formulas */}
          <div
            className={`p-4.5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0e14] border-slate-800'
            }`}
          >
            <h4 className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              3. Summary of Analytical DC Voltage Equations
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? 'border-slate-300 text-slate-600' : 'border-slate-800 text-slate-400'}`}>
                    <th className="py-2.5 px-3">Topology</th>
                    <th className="py-2.5 px-3">Without FWD</th>
                    <th className="py-2.5 px-3">With FWD / Semi-Bridge</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800 text-slate-200'}`}>
                  <tr>
                    <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">1Φ Half-Wave</td>
                    <td className="py-2 px-3">(Vm / 2π) · (cos α - cos β)</td>
                    <td className="py-2 px-3">(Vm / 2π) · (1 + cos α)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">1Φ Full-Wave TCR</td>
                    <td className="py-2 px-3">(2·Vm / π) · cos α</td>
                    <td className="py-2 px-3">(Vm / π) · (1 + cos α)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">1Φ Full-Wave DBR</td>
                    <td className="py-2 px-3">(2·Vm / π) ≈ 0.90 · Vrms</td>
                    <td className="py-2 px-3">(2·Vm / π) ≈ 0.90 · Vrms</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">3Φ Half-Wave</td>
                    <td className="py-2 px-3">(3√3·Vm / 2π) · cos α</td>
                    <td className="py-2 px-3">Clamped at 0V for α &gt; 30°</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">3Φ Full-Bridge TCR</td>
                    <td className="py-2 px-3">(3·Vm,LL / π) · cos α</td>
                    <td className="py-2 px-3">Clamped at 0V for α &gt; 60°</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">3Φ Full-Bridge DBR</td>
                    <td className="py-2 px-3">(3·Vm,LL / π) ≈ 1.35 · VLL,rms</td>
                    <td className="py-2 px-3">≈ 1.35 · VLL,rms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
