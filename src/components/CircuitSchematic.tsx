import React, { useState } from 'react';
import { ConverterConfig, InstantaneousData } from '../types/power-electronics';
import { Zap, Maximize2, Minimize2, Power, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CircuitSchematicProps {
  config: ConverterConfig;
  currentData: InstantaneousData;
  theme?: 'light' | 'dark';
  onToggleFWD: () => void;
  onToggleSwitchType: (switchId: string) => void;
}

export const CircuitSchematic: React.FC<CircuitSchematicProps> = ({
  config,
  currentData,
  theme = 'light',
  onToggleFWD,
  onToggleSwitchType,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredSwitch, setHoveredSwitch] = useState<string | null>(null);

  const { phase, topology, hasFWD, loadType, resistance, inductance, backEmf } = config;
  const { vo, io, vs, conductingSwitches, fwdActive, activeCurrentLoop } = currentData;

  const isLight = theme === 'light';

  // Active conduction checks
  const isT1On = conductingSwitches.includes('T1');
  const isT2On = conductingSwitches.includes('T2');
  const isT3On = conductingSwitches.includes('T3');
  const isT4On = conductingSwitches.includes('T4');
  const isT5On = conductingSwitches.includes('T5');
  const isT6On = conductingSwitches.includes('T6');
  const isFwdOn = fwdActive;
  const isAnyOn = conductingSwitches.length > 0;

  // Color variables based on theme
  const colors = {
    bg: isLight ? '#f8fafc' : '#0c1017',
    grid: isLight ? 'rgba(148, 163, 184, 0.2)' : 'rgba(71, 85, 105, 0.2)',
    busDefault: isLight ? '#475569' : '#64748b',
    busActive: isLight ? '#d97706' : '#f59e0b', // Rich copper amber
    busActiveGlow: isLight ? '#b45309' : '#fbbf24',
    dcPositive: isLight ? '#dc2626' : '#f87171',
    dcNegative: isLight ? '#2563eb' : '#60a5fa',
    phaseA: isLight ? '#dc2626' : '#ef4444',
    phaseB: isLight ? '#d97706' : '#f59e0b',
    phaseC: isLight ? '#2563eb' : '#3b82f6',
    neutral: isLight ? '#475569' : '#94a3b8',
    nodeDot: isLight ? '#0f172a' : '#e2e8f0',
    nodeDotActive: isLight ? '#d97706' : '#fbbf24',
    boxBg: isLight ? '#ffffff' : '#161e2e',
    boxBorder: isLight ? '#cbd5e1' : '#334155',
    textMain: isLight ? '#0f172a' : '#f8fafc',
    textMuted: isLight ? '#64748b' : '#94a3b8',
  };

  /**
   * Helper to render semiconductor switch with FULL physical wire leads
   * Connecting from top edge (cy - 38) all the way through cathode and anode to bottom edge (cy + 38)
   */
  const renderSwitchSymbol = (
    id: string,
    label: string,
    type: 'diode' | 'thyristor',
    isOn: boolean,
    cx: number,
    cy: number,
    subLabel: string = ''
  ) => {
    const isHovered = hoveredSwitch === id;
    const stroke = isOn ? (isLight ? '#16a34a' : '#22c55e') : isHovered ? (isLight ? '#2563eb' : '#38bdf8') : colors.busDefault;
    const fill = isOn ? (isLight ? '#f0fdf4' : 'rgba(34, 197, 94, 0.15)') : colors.boxBg;
    const boxBorder = isOn ? (isLight ? '#16a34a' : '#22c55e') : isHovered ? (isLight ? '#2563eb' : '#38bdf8') : colors.boxBorder;

    return (
      <g
        className="cursor-pointer group select-none transition-all duration-150"
        onClick={() => onToggleSwitchType(id)}
        onMouseEnter={() => setHoveredSwitch(id)}
        onMouseLeave={() => setHoveredSwitch(null)}
      >
        {/* Solid continuous internal wire: Top Lead (from cy-38 to cathode bar at cy-10) */}
        <line
          x1={cx}
          y1={cy - 38}
          x2={cx}
          y2={cy - 10}
          stroke={isOn ? (isLight ? '#16a34a' : '#22c55e') : colors.busDefault}
          strokeWidth="3.5"
        />

        {/* Solid continuous internal wire: Bottom Lead (from anode base at cy+10 to cy+38) */}
        <line
          x1={cx}
          y1={cy + 10}
          x2={cx}
          y2={cy + 38}
          stroke={isOn ? (isLight ? '#16a34a' : '#22c55e') : colors.busDefault}
          strokeWidth="3.5"
        />

        {/* Outer component bounding container */}
        <rect
          x={cx - 30}
          y={cy - 30}
          width={60}
          height={60}
          rx={8}
          fill={fill}
          stroke={boxBorder}
          strokeWidth={isOn ? '2.5' : '1.5'}
          filter={isOn ? 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.4))' : undefined}
        />

        {/* Top & Bottom Terminal Pins (Metallic Solder Rings) */}
        <circle cx={cx} cy={cy - 30} r="3.5" fill={colors.nodeDot} />
        <circle cx={cx} cy={cy + 30} r="3.5" fill={colors.nodeDot} />

        {/* Diode Triangle (Anode at cy+10, pointing up to Cathode at cy-10) */}
        <path
          d={`M ${cx - 15} ${cy + 10} L ${cx + 15} ${cy + 10} L ${cx} ${cy - 10} Z`}
          fill={isOn ? (isLight ? '#16a34a' : '#22c55e') : stroke}
          stroke={stroke}
          strokeWidth="2"
        />

        {/* Cathode horizontal bar */}
        <line
          x1={cx - 16}
          y1={cy - 10}
          x2={cx + 16}
          y2={cy - 10}
          stroke={isOn ? (isLight ? '#15803d' : '#4ade80') : stroke}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Thyristor Gate Terminal Lead (Angled pin with label G) */}
        {type === 'thyristor' && (
          <g>
            <path
              d={`M ${cx - 8} ${cy + 10} L ${cx - 22} ${cy + 20}`}
              fill="none"
              stroke={isOn ? (isLight ? '#16a34a' : '#22c55e') : colors.busDefault}
              strokeWidth="2"
            />
            <circle cx={cx - 22} cy={cy + 20} r="2.5" fill={isOn ? '#22c55e' : colors.busDefault} />
            <text
              x={cx - 26}
              y={cy + 24}
              fill={isOn ? (isLight ? '#16a34a' : '#4ade80') : colors.textMuted}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              G
            </text>
          </g>
        )}

        {/* Switch Label Badge (e.g. T1 / D1) */}
        <text
          x={cx}
          y={cy - 35}
          fill={isOn ? (isLight ? '#16a34a' : '#4ade80') : colors.textMain}
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="monospace"
        >
          {label}
        </text>

        {/* Sub-label role */}
        {subLabel && (
          <text
            x={cx}
            y={cy - 46}
            fill={colors.textMuted}
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
          >
            {subLabel}
          </text>
        )}

        {/* Conducting Status Tag */}
        <text
          x={cx}
          y={cy + 42}
          fill={isOn ? (isLight ? '#16a34a' : '#22c55e') : colors.textMuted}
          fontSize="8.5"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="monospace"
        >
          {isOn ? '● ON (CONDUCTING)' : '○ OFF'}
        </text>
      </g>
    );
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
        isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-[#0f141c] border-slate-800 shadow-xl'
      } ${isExpanded ? 'fixed inset-4 z-50 backdrop-blur-xl' : 'h-full min-h-[480px]'}`}
    >
      {/* Schematic Top Bar */}
      <div
        className={`flex flex-wrap items-center justify-between px-4 py-3 border-b gap-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141b26] border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-950/60 border-amber-800 text-amber-400'}`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Electrical Wiring Schematic
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase font-semibold ${
                isLight ? 'bg-slate-200/80 border-slate-300 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}>
                {phase} • {topology}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                config.converterMode === 'DBR'
                  ? isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-950 border-emerald-800 text-emerald-300'
                  : isLight ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-amber-950 border-amber-800 text-amber-300'
              }`}>
                {config.converterMode}
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Fully wired circuit. Click any switch to toggle Diode/Thyristor. Click Freewheeling Diode to connect/disconnect.
            </p>
          </div>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center gap-2">
          <div className={`hidden sm:flex flex-col items-end px-3 py-1 rounded-lg border ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0b0e14] border-slate-800'
          }`}>
            <span className={`text-[9px] uppercase tracking-wider font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Active Conduction Path
            </span>
            <span className={`text-xs font-mono font-bold flex items-center gap-1.5 ${
              isFwdOn
                ? (isLight ? 'text-amber-600' : 'text-amber-400')
                : isAnyOn
                ? (isLight ? 'text-emerald-600' : 'text-emerald-400')
                : (isLight ? 'text-slate-400' : 'text-slate-500')
            }`}>
              <span className={`w-2 h-2 rounded-full ${isAnyOn ? (isFwdOn ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-ping') : 'bg-slate-400'}`} />
              {activeCurrentLoop}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg border transition ${
              isLight ? 'bg-white border-slate-300 text-slate-600 hover:text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isExpanded ? 'Collapse' : 'Full Screen'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className={`relative flex-1 p-2 flex items-center justify-center overflow-hidden ${
        isLight ? 'bg-slate-100/60' : 'bg-[#0a0e14]'
      }`}>
        <svg
          viewBox="0 0 920 460"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto max-h-[440px] select-none block"
        >
          <defs>
            <pattern id="circuitGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke={colors.grid} strokeWidth="1" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#circuitGrid)" />

          {/* ============================================================== */}
          {/* 1-PHASE FULL-BRIDGE RECTIFIER (ALL WIRES VISIBLY CONNECTED)    */}
          {/* ============================================================== */}
          {phase === '1-phase' && topology === 'full-wave' && (
            <g>
              {/* TOP POSITIVE DC BUSBAR (+Vo) running from X=210 to X=760 at Y=60 */}
              <line
                x1="210"
                y1="60"
                x2="760"
                y2="60"
                stroke={isAnyOn ? colors.dcPositive : colors.busDefault}
                strokeWidth="4"
              />
              <circle cx="210" cy="60" r="5.5" fill={colors.dcPositive} />
              <circle cx="360" cy="60" r="5.5" fill={colors.dcPositive} />
              <circle cx="550" cy="60" r="5.5" fill={colors.dcPositive} />
              <circle cx="760" cy="60" r="5.5" fill={colors.dcPositive} />

              <text x="775" y="65" fill={colors.dcPositive} fontSize="12" fontWeight="bold" fontFamily="monospace">
                + Vo ({vo.toFixed(1)}V)
              </text>

              {/* BOTTOM NEGATIVE / RETURN DC BUSBAR (-Vo) running from X=210 to X=760 at Y=420 */}
              <line
                x1="210"
                y1="420"
                x2="760"
                y2="420"
                stroke={isAnyOn ? colors.dcNegative : colors.busDefault}
                strokeWidth="4"
              />
              <circle cx="210" cy="420" r="5.5" fill={colors.dcNegative} />
              <circle cx="360" cy="420" r="5.5" fill={colors.dcNegative} />
              <circle cx="550" cy="420" r="5.5" fill={colors.dcNegative} />
              <circle cx="760" cy="420" r="5.5" fill={colors.dcNegative} />

              <text x="775" y="425" fill={colors.dcNegative} fontSize="12" fontWeight="bold" fontFamily="monospace">
                - Vo (0V Return)
              </text>

              {/* AC Voltage Source (X=80, Y=240) */}
              <g transform="translate(80, 240)">
                <circle cx="0" cy="0" r="32" fill={colors.boxBg} stroke={isLight ? '#2563eb' : '#38bdf8'} strokeWidth="3" />
                <path d="M -16 0 Q -8 -18 0 0 Q 8 18 16 0" fill="none" stroke={isLight ? '#2563eb' : '#38bdf8'} strokeWidth="3" strokeLinecap="round" />
                <text x="0" y="48" fill={colors.textMain} fontSize="11" fontWeight="bold" textAnchor="middle">AC Source</text>
                <text x="0" y="62" fill={colors.textMuted} fontSize="9.5" textAnchor="middle" fontFamily="monospace">vs = {vs.toFixed(1)}V</text>

                {/* Source Top Terminal Lug (Phase L) */}
                <circle cx="0" cy="-32" r="4.5" fill={colors.phaseA} />
                {/* Source Bottom Terminal Lug (Neutral N) */}
                <circle cx="0" cy="32" r="4.5" fill={colors.neutral} />
              </g>

              {/* Continuous Wire from AC Source Top (Y=208) to Phase bus -> Leg 1 center (X=210, Y=240) */}
              <path
                d="M 80 208 L 80 180 L 210 180 L 210 240"
                fill="none"
                stroke={isT1On || isT4On ? colors.busActive : colors.phaseA}
                strokeWidth="3.5"
              />
              <circle cx="80" cy="180" r="4.5" fill={colors.phaseA} />
              <circle cx="210" cy="180" r="4.5" fill={colors.phaseA} />
              <circle cx="210" cy="240" r="5.5" fill={colors.phaseA} />
              <text x="135" y="172" fill={colors.phaseA} fontSize="10.5" fontWeight="bold" fontFamily="monospace">
                Phase (L)
              </text>

              {/* Continuous Wire from AC Source Bottom (Y=272) to Neutral bus -> Leg 2 center (X=360, Y=240) */}
              <path
                d="M 80 272 L 80 300 L 360 300 L 360 240"
                fill="none"
                stroke={isT2On || isT3On ? colors.busActive : colors.neutral}
                strokeWidth="3.5"
              />
              <circle cx="80" cy="300" r="4.5" fill={colors.neutral} />
              <circle cx="360" cy="300" r="4.5" fill={colors.neutral} />
              <circle cx="360" cy="240" r="5.5" fill={colors.neutral} />
              <text x="135" y="315" fill={colors.neutral} fontSize="10.5" fontWeight="bold" fontFamily="monospace">
                Neutral (N)
              </text>

              {/* ===================== LEG 1 (X=210) ===================== */}
              {/* Wire from Top Busbar (Y=60) down to T1 top lead (Y=80) */}
              <line x1="210" y1="60" x2="210" y2="82" stroke={isT1On ? colors.dcPositive : colors.busDefault} strokeWidth="3.5" />
              {/* Wire from T1 bottom lead (Y=158) down to Leg 1 Center (Y=240) */}
              <line x1="210" y1="158" x2="210" y2="240" stroke={isT1On ? colors.busActive : colors.busDefault} strokeWidth="3.5" />
              {/* Wire from Leg 1 Center (Y=240) down to T4 top lead (Y=322) */}
              <line x1="210" y1="240" x2="210" y2="322" stroke={isT4On ? colors.busActive : colors.busDefault} strokeWidth="3.5" />
              {/* Wire from T4 bottom lead (Y=398) down to Bottom Busbar (Y=420) */}
              <line x1="210" y1="398" x2="210" y2="420" stroke={isT4On ? colors.dcNegative : colors.busDefault} strokeWidth="3.5" />

              {/* T1 (Top Left) */}
              {renderSwitchSymbol(
                'T1',
                config.converterMode === 'DBR' ? 'D1' : 'T1',
                config.switchOverrides?.['T1'] || (config.converterMode === 'DBR' ? 'diode' : 'thyristor'),
                isT1On,
                210,
                120,
                'Leg 1 (Upper)'
              )}

              {/* T4 (Bottom Left) */}
              {renderSwitchSymbol(
                'T4',
                config.converterMode === 'DBR' ? 'D4' : 'T4',
                config.switchOverrides?.['T4'] || (config.converterMode === 'DBR' ? 'diode' : 'thyristor'),
                isT4On,
                210,
                360,
                'Leg 1 (Lower)'
              )}

              {/* ===================== LEG 2 (X=360) ===================== */}
              {/* Wire from Top Busbar (Y=60) down to T3 top lead (Y=82) */}
              <line x1="360" y1="60" x2="360" y2="82" stroke={isT3On ? colors.dcPositive : colors.busDefault} strokeWidth="3.5" />
              {/* Wire from T3 bottom lead (Y=158) down to Leg 2 Center (Y=240) */}
              <line x1="360" y1="158" x2="360" y2="240" stroke={isT3On ? colors.busActive : colors.busDefault} strokeWidth="3.5" />
              {/* Wire from Leg 2 Center (Y=240) down to T2 top lead (Y=322) */}
              <line x1="360" y1="240" x2="360" y2="322" stroke={isT2On ? colors.busActive : colors.busDefault} strokeWidth="3.5" />
              {/* Wire from T2 bottom lead (Y=398) down to Bottom Busbar (Y=420) */}
              <line x1="360" y1="398" x2="360" y2="420" stroke={isT2On ? colors.dcNegative : colors.busDefault} strokeWidth="3.5" />

              {/* T3 (Top Right) */}
              {renderSwitchSymbol(
                'T3',
                config.converterMode === 'DBR' ? 'D3' : 'T3',
                config.switchOverrides?.['T3'] || (config.converterMode === 'DBR' ? 'diode' : 'thyristor'),
                isT3On,
                360,
                120,
                'Leg 2 (Upper)'
              )}

              {/* T2 (Bottom Right) */}
              {renderSwitchSymbol(
                'T2',
                config.converterMode === 'DBR' ? 'D2' : 'T2',
                config.switchOverrides?.['T2'] || (config.converterMode === 'DBR' ? 'diode' : 'thyristor'),
                isT2On,
                360,
                360,
                'Leg 2 (Lower)'
              )}

              {/* ============================================================== */}
              {/* FREEWHEELING DIODE (FWD) BRANCH (X=550)                        */}
              {/* Visible wiring and interactive knife switch                   */}
              {/* ============================================================== */}
              <g
                className="cursor-pointer group select-none"
                onClick={onToggleFWD}
                transform="translate(550, 0)"
              >
                {/* Physical wire from Top Busbar (Y=60) down to FWD terminal (Y=190) */}
                <line
                  x1="0"
                  y1="60"
                  x2="0"
                  y2="190"
                  stroke={hasFWD ? (isFwdOn ? (isLight ? '#16a34a' : '#22c55e') : colors.busDefault) : (isLight ? '#94a3b8' : '#475569')}
                  strokeWidth="3.5"
                  strokeDasharray={hasFWD ? undefined : '5 4'}
                />

                {/* Physical wire from FWD bottom terminal (Y=290) down to Bottom Busbar (Y=420) */}
                <line
                  x1="0"
                  y1="290"
                  x2="0"
                  y2="420"
                  stroke={hasFWD ? (isFwdOn ? (isLight ? '#16a34a' : '#22c55e') : colors.busDefault) : (isLight ? '#94a3b8' : '#475569')}
                  strokeWidth="3.5"
                  strokeDasharray={hasFWD ? undefined : '5 4'}
                />

                {/* Solder junction nodes */}
                <circle cx="0" cy="60" r="5" fill={hasFWD ? (isFwdOn ? '#22c55e' : colors.nodeDot) : colors.busDefault} />
                <circle cx="0" cy="420" r="5" fill={hasFWD ? (isFwdOn ? '#22c55e' : colors.nodeDot) : colors.busDefault} />

                {/* FWD Device Box */}
                <rect
                  x="-42"
                  y="190"
                  width="84"
                  height="100"
                  rx="10"
                  fill={
                    isFwdOn
                      ? (isLight ? '#f0fdf4' : 'rgba(34, 197, 94, 0.2)')
                      : hasFWD
                      ? colors.boxBg
                      : (isLight ? '#f1f5f9' : 'rgba(15, 23, 42, 0.4)')
                  }
                  stroke={
                    isFwdOn
                      ? (isLight ? '#16a34a' : '#22c55e')
                      : hasFWD
                      ? (isLight ? '#2563eb' : '#38bdf8')
                      : '#ef4444'
                  }
                  strokeWidth={hasFWD ? '2.5' : '1.5'}
                  strokeDasharray={hasFWD ? undefined : '5 4'}
                />

                {/* Internal leads inside FWD box connecting directly to diode symbols */}
                <line x1="0" y1="190" x2="0" y2="225" stroke={hasFWD ? (isFwdOn ? '#22c55e' : colors.busDefault) : '#94a3b8'} strokeWidth="3" />
                <line x1="0" y1="255" x2="0" y2="290" stroke={hasFWD ? (isFwdOn ? '#22c55e' : colors.busDefault) : '#94a3b8'} strokeWidth="3" />

                {/* Diode Symbol (Cathode bar at Y=225, Anode base at Y=255) */}
                <path
                  d="M -14 255 L 14 255 L 0 225 Z"
                  fill={
                    isFwdOn
                      ? (isLight ? '#16a34a' : '#22c55e')
                      : hasFWD
                      ? (isLight ? '#2563eb' : '#38bdf8')
                      : (isLight ? '#cbd5e1' : '#475569')
                  }
                  stroke={hasFWD ? (isFwdOn ? '#22c55e' : (isLight ? '#2563eb' : '#38bdf8')) : '#94a3b8'}
                  strokeWidth="2"
                />
                {/* Cathode horizontal bar */}
                <line
                  x1="-16"
                  y1="225"
                  x2="16"
                  y2="225"
                  stroke={hasFWD ? (isFwdOn ? '#15803d' : (isLight ? '#1d4ed8' : '#38bdf8')) : '#94a3b8'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Visual Knife Disconnect Switch if disconnected */}
                {!hasFWD && (
                  <g transform="translate(0, 160)">
                    <circle cx="0" cy="0" r="3.5" fill="#ef4444" />
                    <line x1="0" y1="0" x2="16" y2="-18" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                    <text x="0" y="-22" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">
                      OPEN CIRCUIT
                    </text>
                  </g>
                )}

                {/* Labels */}
                <text
                  x="0"
                  y="206"
                  fill={isFwdOn ? (isLight ? '#16a34a' : '#4ade80') : hasFWD ? colors.textMain : colors.textMuted}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  D_FW (FWD)
                </text>

                <text
                  x="0"
                  y="276"
                  fill={
                    isFwdOn
                      ? (isLight ? '#16a34a' : '#22c55e')
                      : hasFWD
                      ? (isLight ? '#2563eb' : '#38bdf8')
                      : '#ef4444'
                  }
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {isFwdOn
                    ? '⚡ FREEWHEELING'
                    : hasFWD
                    ? 'IN CIRCUIT'
                    : 'DISCONNECTED'}
                </text>

                <text
                  x="0"
                  y="308"
                  fill={isLight ? '#2563eb' : '#38bdf8'}
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="underline"
                >
                  (Click to {hasFWD ? 'Disconnect' : 'Connect'})
                </text>
              </g>

              {/* ============================================================== */}
              {/* DC LOAD COMPONENT (X=760) (VISIBLE INTERNAL CONTINUITY)        */}
              {/* ============================================================== */}
              <g transform="translate(760, 240)">
                {/* Physical Wire from Top Busbar (Y=60 -> relative -180) into load top (relative -110) */}
                <line x1="0" y1="-180" x2="0" y2="-110" stroke={isAnyOn ? colors.dcPositive : colors.busDefault} strokeWidth="4" />
                {/* Physical Wire from load bottom (relative +110) into Bottom Busbar (Y=420 -> relative +180) */}
                <line x1="0" y1="110" x2="0" y2="180" stroke={isAnyOn ? colors.dcNegative : colors.busDefault} strokeWidth="4" />

                {/* Load Enclosure Box */}
                <rect
                  x="-45"
                  y="-110"
                  width="90"
                  height="220"
                  rx="12"
                  fill={colors.boxBg}
                  stroke={isLight ? '#2563eb' : '#38bdf8'}
                  strokeWidth="2.5"
                />

                <text x="0" y="-85" fill={isLight ? '#2563eb' : '#38bdf8'} fontSize="12" fontWeight="bold" textAnchor="middle">
                  {loadType} Load
                </text>

                {/* Unbroken internal lead from top pin (-110) down to resistor start (-70) */}
                <line x1="0" y1="-110" x2="0" y2="-70" stroke={isAnyOn ? colors.busActive : colors.busDefault} strokeWidth="3" />
                <circle cx="0" cy="-110" r="4" fill={colors.nodeDot} />

                {/* Resistor zig-zag (from Y=-70 to Y=-10) */}
                <path
                  d="M 0 -70 L -12 -60 L 12 -46 L -12 -32 L 12 -18 L 0 -10"
                  fill="none"
                  stroke={isLight ? '#1e293b' : '#e2e8f0'}
                  strokeWidth="2.5"
                />
                <text x="0" y="5" fill={colors.textMain} fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  R = {resistance} Ω
                </text>

                {/* Unbroken lead between resistor and inductor/battery */}
                {loadType !== 'R' ? (
                  <>
                    <line x1="0" y1="-10" x2="0" y2="15" stroke={isAnyOn ? colors.busActive : colors.busDefault} strokeWidth="3" />
                    {/* Inductor coil loops (from Y=15 to Y=55) */}
                    <path
                      d="M 0 15 C 14 15, 14 26, 0 26 C 14 26, 14 37, 0 37 C 14 37, 14 48, 0 48"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                    />
                    <text x="0" y="65" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      L = {inductance} mH
                    </text>
                    {/* Lead from inductor to bottom pin */}
                    <line x1="0" y1="48" x2="0" y2="110" stroke={isAnyOn ? colors.busActive : colors.busDefault} strokeWidth="3" />
                  </>
                ) : (
                  /* Pure R load lead straight to bottom pin */
                  <line x1="0" y1="-10" x2="0" y2="110" stroke={isAnyOn ? colors.busActive : colors.busDefault} strokeWidth="3" />
                )}

                <circle cx="0" cy="110" r="4" fill={colors.nodeDot} />

                {/* Live Current Badge */}
                <g transform="translate(0, 135)">
                  <rect x="-42" y="-10" width="84" height="22" rx="6" fill={isLight ? '#0284c7' : '#0284c7'} />
                  <text x="0" y="5" fill="#ffffff" fontSize="10.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    i_o = {io.toFixed(2)}A
                  </text>
                </g>
              </g>
            </g>
          )}

          {/* ============================================================== */}
          {/* 1-PHASE HALF-WAVE RECTIFIER (ALL WIRES VISIBLY CONNECTED)      */}
          {/* ============================================================== */}
          {phase === '1-phase' && topology === 'half-wave' && (
            <g>
              {/* Top DC rail */}
              <line x1="160" y1="90" x2="740" y2="90" stroke={isAnyOn ? colors.dcPositive : colors.busDefault} strokeWidth="4" />
              <circle cx="160" cy="90" r="5" fill={colors.dcPositive} />
              <circle cx="530" cy="90" r="5" fill={colors.dcPositive} />
              <circle cx="740" cy="90" r="5" fill={colors.dcPositive} />
              <text x="755" y="95" fill={colors.dcPositive} fontSize="12" fontWeight="bold" fontFamily="monospace">+ Vo ({vo.toFixed(1)}V)</text>

              {/* Bottom Neutral return rail */}
              <line x1="160" y1="390" x2="740" y2="390" stroke={colors.neutral} strokeWidth="4" />
              <circle cx="160" cy="390" r="5" fill={colors.neutral} />
              <circle cx="530" cy="390" r="5" fill={colors.neutral} />
              <circle cx="740" cy="390" r="5" fill={colors.neutral} />
              <text x="755" y="395" fill={colors.neutral} fontSize="12" fontWeight="bold" fontFamily="monospace">Neutral (N)</text>

              {/* AC Source */}
              <g transform="translate(160, 240)">
                <circle cx="0" cy="0" r="32" fill={colors.boxBg} stroke={isLight ? '#2563eb' : '#38bdf8'} strokeWidth="3" />
                <path d="M -16 0 Q -8 -18 0 0 Q 8 18 16 0" fill="none" stroke={isLight ? '#2563eb' : '#38bdf8'} strokeWidth="3" />
                <text x="0" y="48" fill={colors.textMain} fontSize="11" fontWeight="bold" textAnchor="middle">AC Source</text>
                <text x="0" y="62" fill={colors.textMuted} fontSize="9.5" textAnchor="middle" fontFamily="monospace">vs = {vs.toFixed(1)}V</text>
              </g>

              {/* Source wires directly connected to rails */}
              <line x1="160" y1="208" x2="160" y2="90" stroke={isT1On ? colors.busActive : colors.phaseA} strokeWidth="3.5" />
              <line x1="160" y1="272" x2="160" y2="390" stroke={colors.neutral} strokeWidth="3.5" />

              {/* Switch T1 in line with top wire */}
              {renderSwitchSymbol(
                'T1',
                config.converterMode === 'DBR' ? 'D1' : 'T1',
                config.switchOverrides?.['T1'] || (config.converterMode === 'DBR' ? 'diode' : 'thyristor'),
                isT1On,
                340,
                90,
                'Series Switch'
              )}

              {/* Freewheeling Diode branch */}
              <g className="cursor-pointer select-none" onClick={onToggleFWD} transform="translate(530, 0)">
                <line x1="0" y1="90" x2="0" y2="190" stroke={hasFWD ? (isFwdOn ? '#22c55e' : colors.busDefault) : '#94a3b8'} strokeWidth="3.5" strokeDasharray={hasFWD ? undefined : '5 4'} />
                <line x1="0" y1="290" x2="0" y2="390" stroke={hasFWD ? (isFwdOn ? '#22c55e' : colors.busDefault) : '#94a3b8'} strokeWidth="3.5" strokeDasharray={hasFWD ? undefined : '5 4'} />
                <circle cx="0" cy="90" r="5" fill={hasFWD ? (isFwdOn ? '#22c55e' : colors.nodeDot) : colors.busDefault} />
                <circle cx="0" cy="390" r="5" fill={hasFWD ? (isFwdOn ? '#22c55e' : colors.nodeDot) : colors.busDefault} />

                <rect x="-40" y="190" width="80" height="100" rx="10" fill={isFwdOn ? (isLight ? '#f0fdf4' : 'rgba(34,197,94,0.2)') : hasFWD ? colors.boxBg : (isLight ? '#f1f5f9' : '#1e293b')} stroke={isFwdOn ? '#22c55e' : hasFWD ? (isLight ? '#2563eb' : '#38bdf8') : '#ef4444'} strokeWidth="2.5" strokeDasharray={hasFWD ? undefined : '5 4'} />
                <line x1="0" y1="190" x2="0" y2="225" stroke={hasFWD ? (isFwdOn ? '#22c55e' : colors.busDefault) : '#94a3b8'} strokeWidth="3" />
                <line x1="0" y1="255" x2="0" y2="290" stroke={hasFWD ? (isFwdOn ? '#22c55e' : colors.busDefault) : '#94a3b8'} strokeWidth="3" />
                <path d="M -14 255 L 14 255 L 0 225 Z" fill={hasFWD ? (isFwdOn ? '#22c55e' : (isLight ? '#2563eb' : '#38bdf8')) : '#cbd5e1'} stroke={hasFWD ? (isFwdOn ? '#22c55e' : (isLight ? '#2563eb' : '#38bdf8')) : '#94a3b8'} strokeWidth="2" />
                <line x1="-16" y1="225" x2="16" y2="225" stroke={hasFWD ? (isFwdOn ? '#15803d' : (isLight ? '#1d4ed8' : '#38bdf8')) : '#94a3b8'} strokeWidth="3.5" strokeLinecap="round" />

                <text x="0" y="206" fill={isFwdOn ? '#22c55e' : hasFWD ? colors.textMain : colors.textMuted} fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">D_FW (FWD)</text>
                <text x="0" y="276" fill={isFwdOn ? '#22c55e' : hasFWD ? (isLight ? '#2563eb' : '#38bdf8') : '#ef4444'} fontSize="8.5" fontWeight="bold" textAnchor="middle">{isFwdOn ? '⚡ FREEWHEELING' : hasFWD ? 'IN CIRCUIT' : 'DISCONNECTED'}</text>
                <text x="0" y="306" fill={isLight ? '#2563eb' : '#38bdf8'} fontSize="8.5" fontWeight="bold" textAnchor="middle" className="underline">(Click to {hasFWD ? 'Disconnect' : 'Connect'})</text>
              </g>

              {/* Load */}
              <g transform="translate(740, 240)">
                <line x1="0" y1="-150" x2="0" y2="-90" stroke={isAnyOn ? colors.dcPositive : colors.busDefault} strokeWidth="4" />
                <line x1="0" y1="90" x2="0" y2="150" stroke={colors.neutral} strokeWidth="4" />
                <rect x="-42" y="-90" width="84" height="180" rx="10" fill={colors.boxBg} stroke={isLight ? '#2563eb' : '#38bdf8'} strokeWidth="2.5" />
                <line x1="0" y1="-90" x2="0" y2="-60" stroke={colors.busDefault} strokeWidth="3" />
                <circle cx="0" cy="-90" r="3.5" fill={colors.nodeDot} />
                <path d="M 0 -60 L -10 -50 L 10 -38 L -10 -26 L 10 -14 L 0 -6" fill="none" stroke={isLight ? '#1e293b' : '#e2e8f0'} strokeWidth="2.5" />
                <text x="0" y="10" fill={colors.textMain} fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">R={resistance}Ω</text>
                {loadType !== 'R' ? (
                  <>
                    <line x1="0" y1="-6" x2="0" y2="18" stroke={colors.busDefault} strokeWidth="3" />
                    <path d="M 0 18 C 12 18, 12 28, 0 28 C 12 28, 12 38, 0 38" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x="0" y="52" fill="#f59e0b" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">L={inductance}mH</text>
                    <line x1="0" y1="38" x2="0" y2="90" stroke={colors.busDefault} strokeWidth="3" />
                  </>
                ) : (
                  <line x1="0" y1="-6" x2="0" y2="90" stroke={colors.busDefault} strokeWidth="3" />
                )}
                <circle cx="0" cy="90" r="3.5" fill={colors.nodeDot} />
                <g transform="translate(0, 115)">
                  <rect x="-38" y="-9" width="76" height="18" rx="5" fill="#0284c7" />
                  <text x="0" y="4" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">i_o = {io.toFixed(2)}A</text>
                </g>
              </g>
            </g>
          )}

          {/* ============================================================== */}
          {/* 3-PHASE RECTIFIERS (ALL WIRES VISIBLY CONNECTED WITH NODES)    */}
          {/* ============================================================== */}
          {phase === '3-phase' && (
            <g>
              {/* Top Rail (+Vo) */}
              <line x1="280" y1="60" x2="780" y2="60" stroke={colors.dcPositive} strokeWidth="4" />
              <circle cx="320" cy="60" r="5" fill={colors.dcPositive} />
              <circle cx="440" cy="60" r="5" fill={colors.dcPositive} />
              <circle cx="560" cy="60" r="5" fill={colors.dcPositive} />
              <circle cx="670" cy="60" r="5" fill={colors.dcPositive} />
              <circle cx="780" cy="60" r="5" fill={colors.dcPositive} />
              <text x="795" y="65" fill={colors.dcPositive} fontSize="12" fontWeight="bold" fontFamily="monospace">+ Vo ({vo.toFixed(1)}V)</text>

              {/* Bottom Rail (-Vo or Neutral Return) */}
              {topology === 'half-wave' ? (
                <g>
                  {/* Continuous Neutral wire from 3-Phase Supply Neutral terminal (X=80, Y=325) down to Y=420 and across to Load */}
                  <path
                    d="M 80 325 L 80 420 L 780 420"
                    fill="none"
                    stroke={colors.neutral}
                    strokeWidth="4"
                  />
                  <circle cx="80" cy="325" r="5" fill={colors.neutral} />
                  <circle cx="80" cy="420" r="5" fill={colors.neutral} />
                  <circle cx="670" cy="420" r="5" fill={colors.neutral} />
                  <circle cx="780" cy="420" r="5" fill={colors.neutral} />
                  <text x="795" y="425" fill={colors.neutral} fontSize="12" fontWeight="bold" fontFamily="monospace">
                    Neutral (N Return)
                  </text>
                </g>
              ) : (
                <g>
                  <line x1="280" y1="420" x2="780" y2="420" stroke={colors.dcNegative} strokeWidth="4" />
                  <circle cx="320" cy="420" r="5" fill={colors.dcNegative} />
                  <circle cx="440" cy="420" r="5" fill={colors.dcNegative} />
                  <circle cx="560" cy="420" r="5" fill={colors.dcNegative} />
                  <circle cx="670" cy="420" r="5" fill={colors.dcNegative} />
                  <circle cx="780" cy="420" r="5" fill={colors.dcNegative} />
                  <text x="795" y="425" fill={colors.dcNegative} fontSize="12" fontWeight="bold" fontFamily="monospace">
                    - Vo (Return)
                  </text>
                </g>
              )}

              {/* 3-Phase Source on Left */}
              <g transform="translate(60, 240)">
                <rect x="-35" y="-120" width="70" height="240" rx="10" fill={colors.boxBg} stroke={isLight ? '#2563eb' : '#38bdf8'} strokeWidth="2.5" />
                <text x="0" y="-95" fill={isLight ? '#2563eb' : '#38bdf8'} fontSize="11" fontWeight="bold" textAnchor="middle">3Φ Supply</text>
                <text x="0" y="-80" fill={colors.textMuted} fontSize="8.5" textAnchor="middle" fontFamily="monospace">{config.sourceRms}V RMS</text>

                {/* Phase A terminal */}
                <circle cx="20" cy="-45" r="5" fill={colors.phaseA} />
                <text x="5" y="-41" fill={colors.phaseA} fontSize="10" fontWeight="bold">A</text>

                {/* Phase B terminal */}
                <circle cx="20" cy="5" r="5" fill={colors.phaseB} />
                <text x="5" y="9" fill={colors.phaseB} fontSize="10" fontWeight="bold">B</text>

                {/* Phase C terminal */}
                <circle cx="20" cy="55" r="5" fill={colors.phaseC} />
                <text x="5" y="59" fill={colors.phaseC} fontSize="10" fontWeight="bold">C</text>

                {/* Neutral terminal for 3-Phase Half-Wave */}
                {topology === 'half-wave' && (
                  <>
                    <circle cx="20" cy="85" r="5" fill={colors.neutral} />
                    <text x="5" y="89" fill={colors.neutral} fontSize="10" fontWeight="bold">N</text>
                  </>
                )}
              </g>

              {/* Continuous wires from Supply to Legs with visible solder nodes */}
              {/* Phase A to Leg 1 (X=320, Y=195) */}
              <path d="M 80 195 L 320 195 L 320 240" fill="none" stroke={colors.phaseA} strokeWidth="3" />
              <circle cx="320" cy="195" r="5" fill={colors.phaseA} />
              <circle cx="320" cy="240" r="5" fill={colors.phaseA} />

              {/* Phase B to Leg 2 (X=440, Y=245) */}
              <path d="M 80 245 L 440 245 L 440 240" fill="none" stroke={colors.phaseB} strokeWidth="3" />
              <circle cx="440" cy="245" r="5" fill={colors.phaseB} />
              <circle cx="440" cy="240" r="5" fill={colors.phaseB} />

              {/* Phase C to Leg 3 (X=560, Y=295) */}
              <path d="M 80 295 L 560 295 L 560 240" fill="none" stroke={colors.phaseC} strokeWidth="3" />
              <circle cx="560" cy="295" r="5" fill={colors.phaseC} />
              <circle cx="560" cy="240" r="5" fill={colors.phaseC} />

              {/* Leg 1 Wires & Switches */}
              <line x1="320" y1="60" x2="320" y2="82" stroke={colors.busDefault} strokeWidth="3.5" />
              <line x1="320" y1="158" x2="320" y2="240" stroke={colors.busDefault} strokeWidth="3.5" />
              {renderSwitchSymbol('T1', config.converterMode === 'DBR' ? 'D1' : 'T1', config.switchOverrides?.['T1'] || (config.converterMode === 'DBR' ? 'diode' : 'thyristor'), isT1On, 320, 120, 'Ph A (Top)')}

              {topology === 'full-wave' && (
                <>
                  <line x1="320" y1="240" x2="320" y2="322" stroke={colors.busDefault} strokeWidth="3.5" />
                  <line x1="320" y1="398" x2="320" y2="420" stroke={colors.busDefault} strokeWidth="3.5" />
                  {renderSwitchSymbol('T4', config.converterMode === 'DBR' ? 'D4' : 'T4', config.switchOverrides?.['T4'] || (config.converterMode === 'DBR' ? 'diode' : 'thyristor'), isT4On, 320, 360, 'Ph A (Bot)')}
                </>
              )}

              {/* Leg 2 Wires & Switches */}
              <line x1="440" y1="60" x2="440" y2="82" stroke={colors.busDefault} strokeWidth="3.5" />
              <line x1="440" y1="158" x2="440" y2="240" stroke={colors.busDefault} strokeWidth="3.5" />
              {renderSwitchSymbol('T3', config.converterMode === 'DBR' ? 'D3' : 'T3', config.switchOverrides?.['T3'] || (config.converterMode === 'DBR' ? 'diode' : 'thyristor'), isT3On, 440, 120, 'Ph B (Top)')}

              {topology === 'full-wave' && (
                <>
                  <line x1="440" y1="240" x2="440" y2="322" stroke={colors.busDefault} strokeWidth="3.5" />
                  <line x1="440" y1="398" x2="440" y2="420" stroke={colors.busDefault} strokeWidth="3.5" />
                  {renderSwitchSymbol('T6', config.converterMode === 'DBR' ? 'D6' : 'T6', config.switchOverrides?.['T6'] || (config.converterMode === 'DBR' ? 'diode' : 'thyristor'), isT6On, 440, 360, 'Ph B (Bot)')}
                </>
              )}

              {/* Leg 3 Wires & Switches */}
              <line x1="560" y1="60" x2="560" y2="82" stroke={colors.busDefault} strokeWidth="3.5" />
              <line x1="560" y1="158" x2="560" y2="240" stroke={colors.busDefault} strokeWidth="3.5" />
              {renderSwitchSymbol('T5', config.converterMode === 'DBR' ? 'D5' : 'T5', config.switchOverrides?.['T5'] || (config.converterMode === 'DBR' ? 'diode' : 'thyristor'), isT5On, 560, 120, 'Ph C (Top)')}

              {topology === 'full-wave' && (
                <>
                  <line x1="560" y1="240" x2="560" y2="322" stroke={colors.busDefault} strokeWidth="3.5" />
                  <line x1="560" y1="398" x2="560" y2="420" stroke={colors.busDefault} strokeWidth="3.5" />
                  {renderSwitchSymbol('T2', config.converterMode === 'DBR' ? 'D2' : 'T2', config.switchOverrides?.['T2'] || (config.converterMode === 'DBR' ? 'diode' : 'thyristor'), isT2On, 560, 360, 'Ph C (Bot)')}
                </>
              )}

              {/* 3Φ FWD Branch (X=670) */}
              <g className="cursor-pointer select-none" onClick={onToggleFWD} transform="translate(670, 0)">
                <line x1="0" y1="60" x2="0" y2="190" stroke={hasFWD ? (isFwdOn ? '#22c55e' : colors.busDefault) : '#94a3b8'} strokeWidth="3.5" strokeDasharray={hasFWD ? undefined : '5 4'} />
                <line x1="0" y1="290" x2="0" y2="420" stroke={hasFWD ? (isFwdOn ? '#22c55e' : colors.busDefault) : '#94a3b8'} strokeWidth="3.5" strokeDasharray={hasFWD ? undefined : '5 4'} />
                <circle cx="0" cy="60" r="5" fill={hasFWD ? (isFwdOn ? '#22c55e' : colors.nodeDot) : colors.busDefault} />
                <circle cx="0" cy="420" r="5" fill={hasFWD ? (isFwdOn ? '#22c55e' : colors.nodeDot) : colors.busDefault} />

                <rect x="-40" y="190" width="80" height="100" rx="10" fill={isFwdOn ? (isLight ? '#f0fdf4' : 'rgba(34,197,94,0.2)') : hasFWD ? colors.boxBg : (isLight ? '#f1f5f9' : '#1e293b')} stroke={isFwdOn ? '#22c55e' : hasFWD ? (isLight ? '#2563eb' : '#38bdf8') : '#ef4444'} strokeWidth="2.5" strokeDasharray={hasFWD ? undefined : '5 4'} />
                <line x1="0" y1="190" x2="0" y2="225" stroke={hasFWD ? (isFwdOn ? '#22c55e' : colors.busDefault) : '#94a3b8'} strokeWidth="3" />
                <line x1="0" y1="255" x2="0" y2="290" stroke={hasFWD ? (isFwdOn ? '#22c55e' : colors.busDefault) : '#94a3b8'} strokeWidth="3" />
                <path d="M -14 255 L 14 255 L 0 225 Z" fill={hasFWD ? (isFwdOn ? '#22c55e' : (isLight ? '#2563eb' : '#38bdf8')) : '#cbd5e1'} stroke={hasFWD ? (isFwdOn ? '#22c55e' : (isLight ? '#2563eb' : '#38bdf8')) : '#94a3b8'} strokeWidth="2" />
                <line x1="-16" y1="225" x2="16" y2="225" stroke={hasFWD ? (isFwdOn ? '#15803d' : (isLight ? '#1d4ed8' : '#38bdf8')) : '#94a3b8'} strokeWidth="3.5" strokeLinecap="round" />

                <text x="0" y="206" fill={isFwdOn ? '#22c55e' : hasFWD ? colors.textMain : colors.textMuted} fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">D_FW (FWD)</text>
                <text x="0" y="276" fill={isFwdOn ? '#22c55e' : hasFWD ? (isLight ? '#2563eb' : '#38bdf8') : '#ef4444'} fontSize="8" fontWeight="bold" textAnchor="middle">{isFwdOn ? '⚡ FREEWHEELING' : hasFWD ? 'IN CIRCUIT' : 'DISCONNECTED'}</text>
                <text x="0" y="306" fill={isLight ? '#2563eb' : '#38bdf8'} fontSize="8" fontWeight="bold" textAnchor="middle" className="underline">(Click to {hasFWD ? 'Disconnect' : 'Connect'})</text>
              </g>

              {/* 3Φ Load (X=780) */}
              <g transform="translate(780, 240)">
                <line x1="0" y1="-180" x2="0" y2="-100" stroke={colors.dcPositive} strokeWidth="4" />
                <line x1="0" y1="100" x2="0" y2="180" stroke={colors.dcNegative} strokeWidth="4" />
                <rect x="-35" y="-100" width="70" height="200" rx="10" fill={colors.boxBg} stroke={isLight ? '#2563eb' : '#38bdf8'} strokeWidth="2.5" />
                <line x1="0" y1="-100" x2="0" y2="-65" stroke={colors.busDefault} strokeWidth="3" />
                <circle cx="0" cy="-100" r="3.5" fill={colors.nodeDot} />
                <path d="M 0 -65 L -10 -55 L 10 -43 L -10 -31 L 10 -19 L 0 -11" fill="none" stroke={isLight ? '#1e293b' : '#e2e8f0'} strokeWidth="2.5" />
                <text x="0" y="5" fill={colors.textMain} fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">R={resistance}Ω</text>
                {loadType !== 'R' ? (
                  <>
                    <line x1="0" y1="-11" x2="0" y2="15" stroke={colors.busDefault} strokeWidth="3" />
                    <path d="M 0 15 C 12 15, 12 25, 0 25 C 12 25, 12 35, 0 35" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x="0" y="48" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">L={inductance}mH</text>
                    <line x1="0" y1="35" x2="0" y2="100" stroke={colors.busDefault} strokeWidth="3" />
                  </>
                ) : (
                  <line x1="0" y1="-11" x2="0" y2="100" stroke={colors.busDefault} strokeWidth="3" />
                )}
                <circle cx="0" cy="100" r="3.5" fill={colors.nodeDot} />
                <g transform="translate(0, 115)">
                  <rect x="-32" y="-8" width="64" height="18" rx="5" fill="#0284c7" />
                  <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">i_o = {io.toFixed(2)}A</text>
                </g>
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
