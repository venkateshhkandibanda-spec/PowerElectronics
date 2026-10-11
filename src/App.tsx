import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ConverterConfig, CycleSimulationResult } from './types/power-electronics';
import { simulateCycle } from './services/simulationEngine';
import { Header } from './components/Header';
import { CircuitSchematic } from './components/CircuitSchematic';
import { Oscilloscope } from './components/Oscilloscope';
import { ControlBar } from './components/ControlBar';
import { TopologyControls } from './components/TopologyControls';
import { MetricsCards } from './components/MetricsCards';
import { HarmonicsModal } from './components/HarmonicsModal';
import { TheoryModal } from './components/TheoryModal';

const DEFAULT_CONFIG: ConverterConfig = {
  phase: '1-phase',
  topology: 'full-wave',
  converterMode: 'TCR',
  hasFWD: false,
  firingAngleDeg: 45,
  loadType: 'RL',
  resistance: 20,
  inductance: 45,
  backEmf: 24,
  sourceRms: 230,
  frequency: 50,
  switchOverrides: {},
};

export default function App() {
  const [config, setConfig] = useState<ConverterConfig>(DEFAULT_CONFIG);
  const [angleDeg, setAngleDeg] = useState<number>(45.0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(0.5);
  // Theme state: defaults to 'light' for a clean, academic lab aesthetic (different from reference images)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [layoutMode, setLayoutMode] = useState<'split' | 'stacked'>('split');

  const [isHarmonicsOpen, setIsHarmonicsOpen] = useState<boolean>(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);

  // Memoize cycle simulation result
  const simulationResult: CycleSimulationResult = useMemo(() => {
    return simulateCycle(config);
  }, [config]);

  // Current instantaneous sample at angleDeg
  const currentData = useMemo(() => {
    const { waveforms } = simulationResult;
    const sample = waveforms.find((w) => Math.abs(w.angleDeg - angleDeg) < 0.6);
    return sample || waveforms[0];
  }, [simulationResult, angleDeg]);

  // Animation loop: sweeps omega*t from 0° to 360° and wraps back to 0°
  const lastTimeRef = useRef<number>(performance.now());
  const requestRef = useRef<number | null>(null);

  const animate = useCallback(
    (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isRunning) {
        const degPerSec = 60 * speed;
        setAngleDeg((prev) => {
          let next = prev + degPerSec * dt;
          if (next >= 360) {
            next = next % 360; // Returns smoothly back to 0° after 360°
          }
          return parseFloat(next.toFixed(1));
        });
      }

      requestRef.current = requestAnimationFrame(animate);
    },
    [isRunning, speed]
  );

  useEffect(() => {
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // Toggle Freewheeling Diode (FWD)
  const handleToggleFWD = () => {
    setConfig((prev) => ({
      ...prev,
      hasFWD: !prev.hasFWD,
    }));
  };

  // Toggle switch type
  const handleToggleSwitchType = (switchId: string) => {
    setConfig((prev) => {
      const currentOverrides = { ...(prev.switchOverrides || {}) };
      const currentMode =
        currentOverrides[switchId] || (prev.converterMode === 'DBR' ? 'diode' : 'thyristor');
      currentOverrides[switchId] = currentMode === 'thyristor' ? 'diode' : 'thyristor';
      return {
        ...prev,
        switchOverrides: currentOverrides,
      };
    });
  };

  // Change config
  const handleChangeConfig = (newConfig: Partial<ConverterConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...newConfig,
      switchOverrides: newConfig.converterMode === 'DBR' ? {} : prev.switchOverrides,
    }));
  };

  // Apply presets
  const handleApplyPreset = (preset: Partial<ConverterConfig>) => {
    setConfig((prev) => ({
      ...prev,
      ...preset,
      switchOverrides: {},
    }));
    setAngleDeg(0);
  };

  // Reset to default
  const handleResetAll = () => {
    setConfig(DEFAULT_CONFIG);
    setAngleDeg(0);
    setIsRunning(true);
    setSpeed(0.5);
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-amber-500 selection:text-white ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#090d14] text-slate-100'
      }`}
    >
      {/* Top Header with Title and Student info [Venkateshh Kandibanda] [24EE10020] */}
      <Header
        config={config}
        theme={theme}
        layoutMode={layoutMode}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        onToggleLayout={() => setLayoutMode(layoutMode === 'split' ? 'stacked' : 'split')}
        onApplyPreset={handleApplyPreset}
        onOpenHarmonics={() => setIsHarmonicsOpen(true)}
        onOpenTheory={() => setIsTheoryOpen(true)}
        onResetAll={handleResetAll}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Row 1: Circuit Schematic (Fully Visible Wiring) & Oscilloscope */}
        <div
          className={
            layoutMode === 'split'
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch'
              : 'flex flex-col gap-5'
          }
        >
          {/* Circuit Schematic Card */}
          <CircuitSchematic
            config={config}
            currentData={currentData}
            theme={theme}
            onToggleFWD={handleToggleFWD}
            onToggleSwitchType={handleToggleSwitchType}
          />

          {/* Waveform Oscilloscope */}
          <Oscilloscope
            config={config}
            simulationResult={simulationResult}
            currentAngleDeg={angleDeg}
            theme={theme}
            onSeekAngle={(deg) => setAngleDeg(deg)}
          />
        </div>

        {/* Row 2: 0° -> 360° -> 0° Real-Time Sweep Control Bar */}
        <ControlBar
          isRunning={isRunning}
          onToggleRun={() => setIsRunning(!isRunning)}
          angleDeg={angleDeg}
          onAngleChange={(deg) => setAngleDeg(deg)}
          speed={speed}
          theme={theme}
          onSpeedChange={(s) => setSpeed(s)}
          onStep={(delta) =>
            setAngleDeg((prev) => {
              const res = (prev + delta + 360) % 360;
              return parseFloat(res.toFixed(1));
            })
          }
          onReset={() => setAngleDeg(0)}
        />

        {/* Row 3: Converter Topology & Electrical Parameters */}
        <TopologyControls
          config={config}
          theme={theme}
          onChangeConfig={handleChangeConfig}
          onToggleFWD={handleToggleFWD}
        />

        {/* Row 4: Performance Metrics & Analytical Derivations */}
        <MetricsCards simulationResult={simulationResult} theme={theme} />
      </main>

      {/* Modals */}
      <HarmonicsModal
        isOpen={isHarmonicsOpen}
        onClose={() => setIsHarmonicsOpen(false)}
        simulationResult={simulationResult}
        theme={theme}
      />

      <TheoryModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
        theme={theme}
      />

      {/* Footer with Student Attribution */}
      <footer
        className={`border-t px-4 py-3.5 text-center text-xs font-mono transition-colors duration-200 ${
          isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-[#0b0e14] border-slate-800 text-slate-500'
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="font-bold text-amber-500">[Venkateshh Kandibanda]</span>
          <span className="font-bold text-indigo-500">[24EE10020]</span>
          <span>• Power Electronics Circuit Studio</span>
          <span>• Diode & Thyristor Converters (1Φ & 3Φ)</span>
        </div>
      </footer>
    </div>
  );
}
