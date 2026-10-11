/**
 * Power Electronics Simulation Types and Constants
 */

export type PhaseType = '1-phase' | '3-phase';
export type RectifierType = 'half-wave' | 'full-wave';
export type ConverterMode = 'DBR' | 'TCR' | 'Semi-Converter';
export type LoadType = 'R' | 'RL' | 'RLE';

export interface ConverterConfig {
  phase: PhaseType;
  topology: RectifierType;
  converterMode: ConverterMode;
  hasFWD: boolean; // Freewheeling diode connected or disconnected
  firingAngleDeg: number; // α in degrees (0 - 170)
  loadType: LoadType;
  resistance: number; // Ω (e.g. 10 - 100)
  inductance: number; // mH (e.g. 0 - 200)
  backEmf: number; // V (e.g. 0 - 100)
  sourceRms: number; // V_rms (e.g. 230V or 400V)
  frequency: number; // Hz (50 or 60)
  // Individual switch mode overrides (allows users to click individual switches to set diode/thyristor)
  switchOverrides?: Record<string, 'diode' | 'thyristor'>;
}

export interface SwitchState {
  id: string;
  name: string;
  type: 'diode' | 'thyristor';
  state: 'ON' | 'OFF';
  instantCurrent: number;
  instantVoltage: number;
  role: string;
  isFreewheeling?: boolean;
}

export interface InstantaneousData {
  angleDeg: number;
  angleRad: number;
  timeSec: number;
  vs: number; // Primary source voltage (Phase A for 1-phase or Va for 3-phase)
  va?: number; // Phase A
  vb?: number; // Phase B
  vc?: number; // Phase C
  v_ab?: number;
  v_bc?: number;
  v_ca?: number;
  vo: number; // Output rectified voltage
  io: number; // Output load current
  is: number; // Source AC current
  activeCurrentLoop: string;
  conductingSwitches: string[];
  fwdActive: boolean;
  switchStates: Record<string, SwitchState>;
}

export interface CycleSimulationResult {
  waveforms: InstantaneousData[]; // 360 or 720 points over full cycle
  metrics: {
    v_dc: number;
    v_rms: number;
    i_dc: number;
    i_rms: number;
    p_dc: number;
    s_in: number;
    pf: number;
    displacementPf: number;
    rippleFactor: number;
    formFactor: number;
    thd: number;
    conductionMode: 'CCM' | 'DCM';
    theoreticalVdc: number;
    theoreticalFormula: string;
    theoreticalExplanation: string;
  };
  harmonics: {
    harmonic: number;
    frequencyHz: number;
    magnitude: number;
    percentage: number;
  }[];
}
