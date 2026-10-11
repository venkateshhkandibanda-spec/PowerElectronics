import React, { useRef, useEffect, useState } from 'react';
import { ConverterConfig, CycleSimulationResult } from '../types/power-electronics';
import { Activity, Grid, Maximize2, Minimize2 } from 'lucide-react';

interface OscilloscopeProps {
  config: ConverterConfig;
  simulationResult: CycleSimulationResult;
  currentAngleDeg: number;
  theme?: 'light' | 'dark';
  onSeekAngle: (deg: number) => void;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({
  simulationResult,
  currentAngleDeg,
  theme = 'light',
  onSeekAngle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [viewMode, setViewMode] = useState<'split' | 'superimposed'>('split');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showVdcRef, setShowVdcRef] = useState<boolean>(true);
  const [cyclesToShow, setCyclesToShow] = useState<1 | 2>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hoverData, setHoverData] = useState<{ x: number; y: number; angle: number; vo: number; io: number; vs: number } | null>(null);

  const isLight = theme === 'light';

  // Channel visibility toggles
  const [visibleChannels, setVisibleChannels] = useState({
    vs: true,
    vo: true,
    io: true,
    is: true,
  });

  const toggleChannel = (ch: keyof typeof visibleChannels) => {
    setVisibleChannels((prev) => ({ ...prev, [ch]: !prev[ch] }));
  };

  const { waveforms, metrics } = simulationResult;
  const currentSample = waveforms.find((w) => Math.abs(w.angleDeg - currentAngleDeg) < 0.6) || waveforms[0];

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // High-contrast Oscilloscope Background
    ctx.fillStyle = isLight ? '#ffffff' : '#080c14';
    ctx.fillRect(0, 0, width, height);

    // Padding for graticule and labels
    const padding = { top: 28, right: 48, bottom: viewMode === 'split' ? 52 : 36, left: 60 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const totalAngle = cyclesToShow === 1 ? 360 : 720;

    // Coordinate mapping helper
    const getX = (angleDeg: number) => {
      const clamped = ((angleDeg % totalAngle) + totalAngle) % totalAngle;
      return padding.left + (clamped / totalAngle) * plotWidth;
    };

    // Nice round max scales for Voltage and Current
    const rawMaxV = Math.max(...waveforms.map((w) => Math.max(Math.abs(w.vo), Math.abs(w.vs))), 100);
    const maxV = Math.ceil(rawMaxV * 1.15 / 50) * 50;

    const rawMaxI = Math.max(...waveforms.map((w) => Math.max(Math.abs(w.io), Math.abs(w.is))), 2);
    const maxI = Math.ceil(rawMaxI * 1.25 / 2) * 2;

    // Waveform trace colors
    const chColors = {
      vs: isLight ? '#2563eb' : '#38bdf8', // Blue
      vo: isLight ? '#16a34a' : '#22c55e', // Green
      io: isLight ? '#d97706' : '#f59e0b', // Amber
      is: isLight ? '#9333ea' : '#c084fc', // Purple
      cursor: isLight ? '#ea580c' : '#f97316', // Orange cursor
      vdcLine: isLight ? '#7c3aed' : '#a855f7',
      gridMajor: isLight ? 'rgba(148, 163, 184, 0.45)' : 'rgba(51, 65, 85, 0.55)',
      gridMinor: isLight ? 'rgba(203, 213, 225, 0.35)' : 'rgba(30, 41, 59, 0.4)',
      textAxis: isLight ? '#475569' : '#94a3b8',
    };

    // ====================================================================
    // VERTICAL ANGLE GRATICULE GRID LINES (0°, 90°, 180°, 270°, 360°)
    // ====================================================================
    if (showGrid) {
      // 1. Minor vertical lines (every 45°)
      ctx.strokeStyle = chColors.gridMinor;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      for (let deg = 45; deg < totalAngle; deg += 90) {
        const x = getX(deg);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 2. Major vertical lines (every 90°: 0°, 90°, 180°, 270°, 360°)
      ctx.strokeStyle = chColors.gridMajor;
      ctx.lineWidth = 1.2;
      for (let deg = 0; deg <= totalAngle; deg += 90) {
        const x = getX(deg);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();

        // Degree label at bottom axis
        ctx.fillStyle = chColors.textAxis;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${deg}°`, x, height - padding.bottom + (viewMode === 'split' ? 14 : 16));
      }
    }

    if (viewMode === 'superimposed') {
      // ==================================================================
      // SUPERIMPOSED MODE (Combined Voltage & Current Grid)
      // ==================================================================
      const zeroY = padding.top + plotHeight * 0.55;
      const getY_V = (val: number) => zeroY - (val / maxV) * (plotHeight * 0.45);
      const getY_I = (val: number) => zeroY - (val / maxI) * (plotHeight * 0.45);

      // Horizontal Voltage & Current Grid Lines
      if (showGrid) {
        const vLevels = [maxV, maxV / 2, 0, -maxV / 2, -maxV];
        vLevels.forEach((v) => {
          const y = getY_V(v);
          ctx.beginPath();
          ctx.strokeStyle = v === 0 ? (isLight ? '#64748b' : '#94a3b8') : chColors.gridMajor;
          ctx.lineWidth = v === 0 ? 1.5 : 1;
          if (v !== 0) ctx.setLineDash([3, 3]);
          ctx.moveTo(padding.left, y);
          ctx.lineTo(width - padding.right, y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Left Y-Axis Voltage Label
          ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
          ctx.font = '10px monospace';
          ctx.textAlign = 'right';
          const sign = v > 0 ? '+' : '';
          ctx.fillText(`${sign}${Math.round(v)}V`, padding.left - 8, y + 3.5);
        });

        // Right Y-Axis Current Labels
        const iLevels = [maxI, maxI / 2, 0, -maxI / 2, -maxI];
        iLevels.forEach((curr) => {
          const y = getY_I(curr);
          ctx.fillStyle = chColors.io;
          ctx.font = '10px monospace';
          ctx.textAlign = 'left';
          const sign = curr > 0 ? '+' : '';
          ctx.fillText(`${sign}${curr.toFixed(1)}A`, width - padding.right + 8, y + 3.5);
        });

        // Units badges
        ctx.fillStyle = isLight ? '#1e293b' : '#f8fafc';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('[V]', padding.left - 8, padding.top - 6);
        ctx.textAlign = 'left';
        ctx.fillText('[A]', width - padding.right + 8, padding.top - 6);
      }

      // 1. Plot Source Voltage (vs)
      if (visibleChannels.vs) {
        ctx.strokeStyle = chColors.vs;
        ctx.lineWidth = 1.9;
        ctx.beginPath();
        for (let cycle = 0; cycle < cyclesToShow; cycle++) {
          const offsetDeg = cycle * 360;
          for (let i = 0; i < waveforms.length; i++) {
            const w = waveforms[i];
            const x = getX(w.angleDeg + offsetDeg);
            const y = getY_V(w.vs);
            if (i === 0 && cycle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 2. Plot Rectified Output Voltage (vo)
      if (visibleChannels.vo) {
        ctx.strokeStyle = chColors.vo;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        for (let cycle = 0; cycle < cyclesToShow; cycle++) {
          const offsetDeg = cycle * 360;
          for (let i = 0; i < waveforms.length; i++) {
            const w = waveforms[i];
            const x = getX(w.angleDeg + offsetDeg);
            const y = getY_V(w.vo);
            if (i === 0 && cycle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Average Vdc horizontal line
        if (showVdcRef && metrics.v_dc > 0) {
          const vdcY = getY_V(metrics.v_dc);
          ctx.strokeStyle = chColors.vdcLine;
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(padding.left, vdcY);
          ctx.lineTo(width - padding.right, vdcY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = chColors.vdcLine;
          ctx.font = '10px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`V_dc = ${metrics.v_dc.toFixed(1)}V`, padding.left + 10, vdcY - 6);
        }
      }

      // 3. Plot Output Load Current (io)
      if (visibleChannels.io) {
        ctx.strokeStyle = chColors.io;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let cycle = 0; cycle < cyclesToShow; cycle++) {
          const offsetDeg = cycle * 360;
          for (let i = 0; i < waveforms.length; i++) {
            const w = waveforms[i];
            const x = getX(w.angleDeg + offsetDeg);
            const y = getY_I(w.io);
            if (i === 0 && cycle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // 4. Plot Source Current (is)
      if (visibleChannels.is) {
        ctx.strokeStyle = chColors.is;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let cycle = 0; cycle < cyclesToShow; cycle++) {
          const offsetDeg = cycle * 360;
          for (let i = 0; i < waveforms.length; i++) {
            const w = waveforms[i];
            const x = getX(w.angleDeg + offsetDeg);
            const y = getY_I(w.is);
            if (i === 0 && cycle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else {
      // ==================================================================
      // SPLIT CHANNELS MODE (TOP: VOLTAGE with GRID, BOTTOM: CURRENT with GRID)
      // ==================================================================
      const halfHeight = (plotHeight - 34) / 2;

      // ----------------- TOP PLOT: VOLTAGE CHANNELS -----------------
      const vTop = padding.top;
      const vZeroY = vTop + halfHeight * 0.52;
      const getY_V = (val: number) => vZeroY - (val / maxV) * (halfHeight * 0.44);

      // Voltage Title & Unit
      ctx.fillStyle = isLight ? '#1e293b' : '#f1f5f9';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Voltage Waveforms (v_s & v_o Superimposed)', padding.left, vTop - 10);
      ctx.textAlign = 'right';
      ctx.fillText('[V]', width - padding.right, vTop - 10);

      // Voltage Horizontal Grid Lines (+maxV, +maxV/2, 0V, -maxV/2, -maxV)
      if (showGrid) {
        const vLevels = [maxV, maxV / 2, 0, -maxV / 2, -maxV];
        vLevels.forEach((v) => {
          const y = getY_V(v);
          ctx.beginPath();
          ctx.strokeStyle = v === 0 ? (isLight ? '#475569' : '#94a3b8') : chColors.gridMajor;
          ctx.lineWidth = v === 0 ? 1.5 : 1;
          if (v !== 0) ctx.setLineDash([3, 3]);
          ctx.moveTo(padding.left, y);
          ctx.lineTo(width - padding.right, y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Tick Label
          ctx.fillStyle = chColors.textAxis;
          ctx.font = '10px monospace';
          ctx.textAlign = 'right';
          const sign = v > 0 ? '+' : '';
          ctx.fillText(`${sign}${Math.round(v)}V`, padding.left - 8, y + 3.5);
        });
      }

      // vs curve
      if (visibleChannels.vs) {
        ctx.strokeStyle = chColors.vs;
        ctx.lineWidth = 1.9;
        ctx.beginPath();
        for (let cycle = 0; cycle < cyclesToShow; cycle++) {
          const offsetDeg = cycle * 360;
          for (let i = 0; i < waveforms.length; i++) {
            const w = waveforms[i];
            const x = getX(w.angleDeg + offsetDeg);
            const y = getY_V(w.vs);
            if (i === 0 && cycle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // vo curve
      if (visibleChannels.vo) {
        ctx.strokeStyle = chColors.vo;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        for (let cycle = 0; cycle < cyclesToShow; cycle++) {
          const offsetDeg = cycle * 360;
          for (let i = 0; i < waveforms.length; i++) {
            const w = waveforms[i];
            const x = getX(w.angleDeg + offsetDeg);
            const y = getY_V(w.vo);
            if (i === 0 && cycle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Average Vdc horizontal dashed line
        if (showVdcRef && metrics.v_dc > 0) {
          const vdcY = getY_V(metrics.v_dc);
          ctx.strokeStyle = chColors.vdcLine;
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(padding.left, vdcY);
          ctx.lineTo(width - padding.right, vdcY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = chColors.vdcLine;
          ctx.font = '9.5px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`V_dc = ${metrics.v_dc.toFixed(1)}V`, width - padding.right - 105, vdcY - 5);
        }
      }

      // ----------------- BOTTOM PLOT: CURRENT CHANNELS -----------------
      const iTop = vTop + halfHeight + 20;
      const iZeroY = iTop + halfHeight * 0.52;
      const getY_I = (val: number) => iZeroY - (val / maxI) * (halfHeight * 0.44);

      // Current Title & Unit
      ctx.fillStyle = isLight ? '#1e293b' : '#f1f5f9';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Current Waveforms (i_o & i_s)', padding.left, iTop - 8);
      ctx.textAlign = 'right';
      ctx.fillText('[A]', width - padding.right, iTop - 8);

      // Current Horizontal Grid Lines (+maxI, +maxI/2, 0A, -maxI/2, -maxI)
      if (showGrid) {
        const iLevels = [maxI, maxI / 2, 0, -maxI / 2, -maxI];
        iLevels.forEach((curr) => {
          const y = getY_I(curr);
          ctx.beginPath();
          ctx.strokeStyle = curr === 0 ? (isLight ? '#475569' : '#94a3b8') : chColors.gridMajor;
          ctx.lineWidth = curr === 0 ? 1.5 : 1;
          if (curr !== 0) ctx.setLineDash([3, 3]);
          ctx.moveTo(padding.left, y);
          ctx.lineTo(width - padding.right, y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Tick Label
          ctx.fillStyle = chColors.textAxis;
          ctx.font = '10px monospace';
          ctx.textAlign = 'right';
          const sign = curr > 0 ? '+' : '';
          ctx.fillText(`${sign}${curr.toFixed(1)}A`, padding.left - 8, y + 3.5);
        });
      }

      // io curve
      if (visibleChannels.io) {
        ctx.strokeStyle = chColors.io;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let cycle = 0; cycle < cyclesToShow; cycle++) {
          const offsetDeg = cycle * 360;
          for (let i = 0; i < waveforms.length; i++) {
            const w = waveforms[i];
            const x = getX(w.angleDeg + offsetDeg);
            const y = getY_I(w.io);
            if (i === 0 && cycle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // is curve
      if (visibleChannels.is) {
        ctx.strokeStyle = chColors.is;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let cycle = 0; cycle < cyclesToShow; cycle++) {
          const offsetDeg = cycle * 360;
          for (let i = 0; i < waveforms.length; i++) {
            const w = waveforms[i];
            const x = getX(w.angleDeg + offsetDeg);
            const y = getY_I(w.is);
            if (i === 0 && cycle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // ----------------- ACTIVE PAIR TIMING BAR AT BOTTOM -----------------
      const barY = height - padding.bottom + 22;
      const barHeight = 16;

      ctx.fillStyle = isLight ? '#0f172a' : '#1e293b';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('ACTIVE PAIR', padding.left - 8, barY + 11);

      // Conduction blocks bar
      const barStartX = padding.left;
      const barEndX = width - padding.right;
      ctx.fillStyle = isLight ? '#e2e8f0' : '#0f172a';
      ctx.fillRect(barStartX, barY, barEndX - barStartX, barHeight);

      // Highlight active segments across the cycle
      const numSegments = waveforms.length;
      for (let i = 0; i < numSegments; i += 4) {
        const sample = waveforms[i];
        const segX = getX(sample.angleDeg);
        const nextX = getX(sample.angleDeg + (4 * totalAngle) / numSegments);
        const segW = Math.max(1, nextX - segX);

        if (sample.conductingSwitches.length > 0 || sample.fwdActive) {
          ctx.fillStyle = sample.fwdActive
            ? (isLight ? '#f59e0b' : '#d97706') // FWD Amber
            : (isLight ? '#10b981' : '#059669'); // Thyristors Emerald
          ctx.fillRect(segX, barY + 1, segW, barHeight - 2);
        }
      }

      // Conduction block text labels along the bar
      if (cyclesToShow === 1) {
        const keyAngles = [45, 135, 225, 315];
        keyAngles.forEach((deg) => {
          const sample = waveforms.find((w) => Math.abs(w.angleDeg - deg) < 1.0);
          if (sample) {
            const x = getX(deg);
            const txt = sample.fwdActive ? 'FWD' : sample.conductingSwitches.join('+') || 'OFF';
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8.5px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(txt, x, barY + 11);
          }
        });
      }
    }

    // ====================================================================
    // VERTICAL CURSOR LINE FOR ACTIVE ANGLE ωt (Sweeps 0° -> 360°)
    // ====================================================================
    const cursorX = getX(currentAngleDeg);
    ctx.strokeStyle = chColors.cursor;
    ctx.lineWidth = 2.0;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(cursorX, padding.top);
    ctx.lineTo(cursorX, height - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cursor Marker Rings
    ctx.fillStyle = chColors.cursor;
    ctx.beginPath();
    ctx.arc(cursorX, padding.top - 4, 4.5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cursorX, height - padding.bottom + 4, 4.5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }, [
    waveforms,
    metrics,
    currentAngleDeg,
    visibleChannels,
    viewMode,
    showGrid,
    showVdcRef,
    cyclesToShow,
    isLight,
  ]);

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const paddingLeft = 60;
    const paddingRight = 48;
    const plotWidth = rect.width - paddingLeft - paddingRight;

    if (clickX >= paddingLeft && clickX <= rect.width - paddingRight) {
      const normalized = (clickX - paddingLeft) / plotWidth;
      const totalAngle = cyclesToShow === 1 ? 360 : 720;
      const deg = Math.max(0, Math.min(360, (normalized * totalAngle) % 360));
      onSeekAngle(parseFloat(deg.toFixed(1)));
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
        isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-[#0f141c] border-slate-800 shadow-xl'
      } ${isExpanded ? 'fixed inset-4 z-50 backdrop-blur-xl' : 'h-full min-h-[480px]'}`}
    >
      {/* Top Bar with Grid Button as in the photos */}
      <div
        className={`flex flex-wrap items-center justify-between px-4 py-2.5 border-b gap-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#141b26] border-slate-800'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-indigo-950/60 border-indigo-800 text-indigo-400'}`}>
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Oscilloscope Waveforms
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                isLight ? 'bg-slate-200 border-slate-300 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}>
                ωt = {currentAngleDeg.toFixed(1)}°
              </span>
            </div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Interactive graticule with voltage & current tracking grid
            </p>
          </div>
        </div>

        {/* View Controls & Explicit # Grid button as in the photos */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className={`flex items-center p-0.5 rounded-lg border ${
            isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#0b0e14] border-slate-800'
          }`}>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === 'split'
                  ? isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Split Channels
            </button>
            <button
              onClick={() => setViewMode('superimposed')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                viewMode === 'superimposed'
                  ? isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Superimposed
            </button>
          </div>

          {/* Explicit # Grid Button as in user's photo */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition ${
              showGrid
                ? isLight
                  ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                  : 'bg-amber-600 border-amber-500 text-white shadow-sm'
                : isLight
                ? 'bg-white border-slate-300 text-slate-400 hover:text-slate-700'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Oscilloscope Graticule Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span># Grid</span>
          </button>

          {/* V_avg Reference Line Toggle */}
          <button
            onClick={() => setShowVdcRef(!showVdcRef)}
            className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border transition ${
              showVdcRef
                ? isLight
                  ? 'bg-purple-100 border-purple-300 text-purple-800'
                  : 'bg-purple-950 border-purple-800 text-purple-300'
                : isLight
                ? 'bg-white border-slate-300 text-slate-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            V_avg
          </button>

          {/* Cycle toggle */}
          <button
            onClick={() => setCyclesToShow(cyclesToShow === 1 ? 2 : 1)}
            className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border transition ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            {cyclesToShow === 1 ? '1 Cycle (360°)' : '2 Cycles (720°)'}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg border transition ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title={isExpanded ? 'Collapse' : 'Full Screen'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Live Channel Badges & Instant Readouts */}
      <div
        className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
          isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0b0e14] border-slate-800'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => toggleChannel('vs')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition ${
              visibleChannels.vs
                ? isLight ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-blue-950/60 border-blue-800 text-blue-400 font-bold'
                : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>v_s: {currentSample.vs.toFixed(1)}V</span>
          </button>

          <button
            onClick={() => toggleChannel('vo')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition ${
              visibleChannels.vo
                ? isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-emerald-950/60 border-emerald-800 text-emerald-400 font-bold'
                : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>v_o: {currentSample.vo.toFixed(1)}V</span>
          </button>

          <button
            onClick={() => toggleChannel('io')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition ${
              visibleChannels.io
                ? isLight ? 'bg-amber-50 border-amber-200 text-amber-700 font-bold' : 'bg-amber-950/60 border-amber-800 text-amber-400 font-bold'
                : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>i_o: {currentSample.io.toFixed(2)}A</span>
          </button>

          <button
            onClick={() => toggleChannel('is')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition ${
              visibleChannels.is
                ? isLight ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold' : 'bg-purple-950/60 border-purple-800 text-purple-400 font-bold'
                : 'text-slate-400 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>i_s: {currentSample.is.toFixed(2)}A</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className={`font-semibold ${isLight ? 'text-purple-700' : 'text-purple-400'}`}>
            V_dc (Avg): {metrics.v_dc.toFixed(1)}V
          </span>
          <span className="text-slate-400">|</span>
          <span className={`font-semibold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
            I_dc: {metrics.i_dc.toFixed(2)}A
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 min-h-[340px] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasInteraction}
          onMouseMove={(e) => {
            if (e.buttons === 1) handleCanvasInteraction(e);
          }}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
