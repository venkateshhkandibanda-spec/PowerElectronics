import { ConverterConfig, CycleSimulationResult, InstantaneousData, SwitchState } from '../types/power-electronics';

/**
 * High-fidelity Power Electronics Simulation Engine for DBR and TCR Converters
 */
export function simulateCycle(config: ConverterConfig): CycleSimulationResult {
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
    frequency,
    switchOverrides,
  } = config;

  const R = Math.max(resistance, 0.5);
  const L = loadType === 'R' ? 0 : Math.max(inductance * 1e-3, 0); // Convert mH to H
  const E = loadType === 'RLE' ? Math.max(backEmf, 0) : 0;
  const omega = 2 * Math.PI * frequency;
  const Vm_ph = Math.sqrt(2) * sourceRms;
  const Vm_line = phase === '3-phase' ? Math.sqrt(3) * Vm_ph : Vm_ph;

  // Effective firing angle: if DBR mode, alpha is effectively 0
  const alphaDeg = converterMode === 'DBR' ? 0 : firingAngleDeg;
  const alphaRad = (alphaDeg * Math.PI) / 180;

  // Number of simulation steps (720 points for 0.5 deg resolution)
  const N_POINTS = 720;
  const stepRad = (2 * Math.PI) / N_POINTS;
  const stepDeg = 360 / N_POINTS;

  // Raw instantaneous arrays
  const rawVo: number[] = new Array(N_POINTS).fill(0);
  const rawVs: number[] = new Array(N_POINTS).fill(0);
  const rawVa: number[] = new Array(N_POINTS).fill(0);
  const rawVb: number[] = new Array(N_POINTS).fill(0);
  const rawVc: number[] = new Array(N_POINTS).fill(0);
  const conductingList: string[][] = [];
  const fwdActiveList: boolean[] = new Array(N_POINTS).fill(false);
  const loopDescriptions: string[] = [];

  // 1. Determine instantaneous output voltage vo(wt) and active switches for each angle wt
  for (let i = 0; i < N_POINTS; i++) {
    const wt = i * stepRad;
    const wtDeg = (wt * 180) / Math.PI;

    if (phase === '1-phase') {
      const vsVal = Vm_ph * Math.sin(wt);
      rawVs[i] = vsVal;

      if (topology === 'half-wave') {
        // 1-Phase Half-Wave
        // Positive half cycle: [0, π)
        // Fire at alpha
        let swState = 'OFF';
        let voVal = 0;
        let isFwd = false;
        let activeLoop = 'Idle (No Conduction)';
        const condSwitches: string[] = [];

        if (wt >= alphaRad && wt < Math.PI) {
          // Normal conduction through T1/D1
          if (vsVal > E) {
            swState = 'ON';
            voVal = vsVal;
            condSwitches.push('T1');
            activeLoop = 'AC Source (L) → T1 → Load → Neutral (N)';
          }
        } else if (wt >= Math.PI && wt < 2 * Math.PI) {
          // Negative half-cycle of source
          if (hasFWD && L > 0) {
            // Freewheeling diode clamps vo to 0V
            isFwd = true;
            voVal = 0;
            condSwitches.push('FWD');
            activeLoop = 'Freewheeling Loop (Load → FWD → Load)';
          } else if (!hasFWD && L > 0) {
            // Inductor forces conduction to continue into negative voltage until current extinguishes
            // Approximate negative excursion: decays until extinction angle beta
            const tau = L / R;
            const phi = Math.atan((omega * L) / R);
            // If tau is significant, voltage goes negative
            const extRatio = Math.min(1.0, (tau * omega) / 2);
            const beta = Math.PI + extRatio * Math.PI * 0.6;
            if (wt < beta) {
              voVal = vsVal; // Negative voltage excursion!
              condSwitches.push('T1');
              activeLoop = 'Inductive Energy Return: T1 conducting with negative Vo';
            }
          }
        }

        rawVo[i] = voVal;
        fwdActiveList[i] = isFwd;
        conductingList.push(condSwitches);
        loopDescriptions.push(activeLoop);
      } else {
        // 1-Phase Full-Wave Bridge
        // Pair 1: T1 & T2 (positive half)
        // Pair 2: T3 & T4 (negative half)
        let voVal = 0;
        let isFwd = false;
        let activeLoop = 'Idle';
        const condSwitches: string[] = [];

        // Check if Semi-converter mode (top thyristors, bottom diodes)
        const isSemi = converterMode === 'Semi-Converter';

        if (hasFWD || isSemi) {
          // With FWD or Semi-Converter: voltage is clamped at 0V, cannot go negative
          if (wt >= alphaRad && wt < Math.PI) {
            voVal = Math.max(0, vsVal);
            condSwitches.push('T1', 'T2');
            activeLoop = 'Positive Half: AC Phase → T1 → Load → T2 → AC Neutral';
          } else if (wt >= Math.PI && wt < Math.PI + alphaRad) {
            // In this interval, source reversed but next pair not yet fired
            // Freewheeling diode (or D2+T1 / D4+T3 in semi-bridge) clamps Vo to 0
            if (L > 0) {
              isFwd = true;
              voVal = 0;
              condSwitches.push(isSemi ? 'D2' : 'FWD');
              activeLoop = isSemi ? 'Freewheeling through D2 & T1' : 'Freewheeling Loop: Load → FWD';
            }
          } else if (wt >= Math.PI + alphaRad && wt < 2 * Math.PI) {
            voVal = Math.max(0, -vsVal);
            condSwitches.push('T3', 'T4');
            activeLoop = 'Negative Half: AC Neutral → T3 → Load → T4 → AC Phase';
          } else if (wt < alphaRad) {
            // Initial freewheeling from previous cycle if inductive
            if (L > 0) {
              isFwd = true;
              voVal = 0;
              condSwitches.push(isSemi ? 'D4' : 'FWD');
              activeLoop = isSemi ? 'Freewheeling through D4 & T3' : 'Freewheeling Loop: Load → FWD';
            }
          }
        } else {
          // Fully controlled TCR WITHOUT FWD
          // Pair 1 fired at alpha, conducts until pi + alpha
          // Pair 2 fired at pi + alpha, conducts until 2*pi + alpha
          if (wt >= alphaRad && wt < Math.PI + alphaRad) {
            voVal = vsVal; // Can go negative between π and π + α!
            condSwitches.push('T1', 'T2');
            activeLoop = wt < Math.PI
              ? 'Positive Half: AC Phase → T1 → Load → T2 → AC Neutral'
              : 'Continuous Conduction into Negative Vo (T1 + T2 holding)';
          } else {
            voVal = -vsVal; // Follows inverted sine wave
            condSwitches.push('T3', 'T4');
            activeLoop = wt < 2 * Math.PI
              ? 'Negative Half: AC Neutral → T3 → Load → T4 → AC Phase'
              : 'Continuous Conduction into Negative Vo (T3 + T4 holding)';
          }
        }

        rawVo[i] = voVal;
        fwdActiveList[i] = isFwd;
        conductingList.push(condSwitches);
        loopDescriptions.push(activeLoop);
      }
    } else {
      // 3-Phase Systems
      const va = Vm_ph * Math.sin(wt);
      const vb = Vm_ph * Math.sin(wt - (2 * Math.PI) / 3);
      const vc = Vm_ph * Math.sin(wt - (4 * Math.PI) / 3);
      rawVa[i] = va;
      rawVb[i] = vb;
      rawVc[i] = vc;
      rawVs[i] = va;

      if (topology === 'half-wave') {
        // 3-Phase Half-Wave (3-Pulse)
        // Natural crossover points at 30° (π/6), 150° (5π/6), 270° (3π/2)
        // With firing angle α:
        // T1 conducts from π/6 + α to 5π/6 + α (Phase A)
        // T2 conducts from 5π/6 + α to 3π/2 + α (Phase B)
        // T3 conducts from 3π/2 + α to 13π/6 + α (Phase C)
        const t1_start = Math.PI / 6 + alphaRad;
        const t1_end = (5 * Math.PI) / 6 + alphaRad;
        const t2_start = (5 * Math.PI) / 6 + alphaRad;
        const t2_end = (3 * Math.PI) / 2 + alphaRad;

        let activePhase = 'A';
        let voVal = 0;
        const condSwitches: string[] = [];
        let isFwd = false;

        // Wrap angle for cyclic calculation
        const normWt = wt % (2 * Math.PI);
        if (normWt >= t1_start && normWt < t1_end) {
          activePhase = 'A';
          voVal = va;
          condSwitches.push('T1');
        } else if (normWt >= t2_start && normWt < t2_end) {
          activePhase = 'B';
          voVal = vb;
          condSwitches.push('T2');
        } else {
          activePhase = 'C';
          voVal = vc;
          condSwitches.push('T3');
        }

        // Clamp if FWD connected and Vo goes negative
        if (hasFWD && voVal < 0) {
          voVal = 0;
          isFwd = true;
          condSwitches.length = 0;
          condSwitches.push('FWD');
        }

        rawVo[i] = voVal;
        fwdActiveList[i] = isFwd;
        conductingList.push(condSwitches);
        loopDescriptions.push(
          isFwd
            ? 'Freewheeling Loop: Load → FWD'
            : `Phase ${activePhase} → ${condSwitches.join(' + ')} → Load → Neutral (N)`
        );
      } else {
        // 3-Phase Full Bridge (6-Pulse)
        // Line-to-line voltages:
        const vab = va - vb;
        const vac = va - vc;
        const vbc = vb - vc;
        const vba = vb - va;
        const vca = vc - va;
        const vcb = vc - vb;

        // Commutation intervals of 60° (π/3)
        // Pair sequences: (T1,T6)->vab, (T1,T2)->vac, (T3,T2)->vbc, (T3,T4)->vba, (T5,T4)->vca, (T5,T6)->vcb
        // Natural crossover starts at 60° (π/3) for vab
        const baseShift = Math.PI / 3 + alphaRad;
        let shifted = (wt - baseShift) % (2 * Math.PI);
        if (shifted < 0) shifted += 2 * Math.PI;

        const interval = Math.floor(shifted / (Math.PI / 3)) % 6;
        let voVal = 0;
        let pair = ['T1', 'T6'];
        let pairName = 'T1 + T6 (v_ab)';

        switch (interval) {
          case 0:
            voVal = vab;
            pair = ['T1', 'T6'];
            pairName = 'T1 + T6 (Phase A → B)';
            break;
          case 1:
            voVal = vac;
            pair = ['T1', 'T2'];
            pairName = 'T1 + T2 (Phase A → C)';
            break;
          case 2:
            voVal = vbc;
            pair = ['T3', 'T2'];
            pairName = 'T3 + T2 (Phase B → C)';
            break;
          case 3:
            voVal = vba;
            pair = ['T3', 'T4'];
            pairName = 'T3 + T4 (Phase B → A)';
            break;
          case 4:
            voVal = vca;
            pair = ['T5', 'T4'];
            pairName = 'T5 + T4 (Phase C → A)';
            break;
          case 5:
            voVal = vcb;
            pair = ['T5', 'T6'];
            pairName = 'T5 + T6 (Phase C → B)';
            break;
        }

        let isFwd = false;
        if (hasFWD && voVal < 0) {
          voVal = 0;
          isFwd = true;
          pair = ['FWD'];
          pairName = 'Freewheeling Loop (Vo clamped at 0V)';
        }

        rawVo[i] = voVal;
        fwdActiveList[i] = isFwd;
        conductingList.push(pair);
        loopDescriptions.push(isFwd ? 'Freewheeling Loop: Load → FWD' : `3Φ Bridge Pair: ${pairName}`);
      }
    }
  }

  // 2. Solve for load current io(t) using steady-state ODE simulation
  // Differential equation: L * di/dt + R * i + E = Vo(t)
  // We simulate 3 full cycles to reach exact periodic steady-state
  const rawIo: number[] = new Array(N_POINTS).fill(0);
  const dt = (1 / frequency) / N_POINTS;

  let current = 0;
  const numWarmupCycles = L > 0 ? 3 : 1;

  for (let cycle = 0; cycle < numWarmupCycles; cycle++) {
    for (let i = 0; i < N_POINTS; i++) {
      const vInst = rawVo[i];
      if (L <= 0) {
        // Pure resistive or R+E
        current = Math.max(0, (vInst - E) / R);
      } else {
        // Runge-Kutta 2nd order (Heun's method) for high numerical accuracy
        const f1 = (vInst - R * current - E) / L;
        const currentPred = current + f1 * dt;
        const f2 = (vInst - R * currentPred - E) / L;
        current = current + 0.5 * (f1 + f2) * dt;

        // Current cannot flow backwards through diodes / SCRs
        if (current < 0) current = 0;
      }

      if (cycle === numWarmupCycles - 1) {
        rawIo[i] = current;
      }
    }
  }

  // 3. Compute Source Current is(t)
  const rawIs: number[] = new Array(N_POINTS).fill(0);
  for (let i = 0; i < N_POINTS; i++) {
    const active = conductingList[i];
    const ioVal = rawIo[i];

    if (phase === '1-phase') {
      if (topology === 'half-wave') {
        rawIs[i] = active.includes('T1') ? ioVal : 0;
      } else {
        if (active.includes('T1') && active.includes('T2')) {
          rawIs[i] = ioVal;
        } else if (active.includes('T3') && active.includes('T4')) {
          rawIs[i] = -ioVal;
        } else {
          rawIs[i] = 0;
        }
      }
    } else {
      // 3-Phase Phase A current
      if (active.includes('T1')) {
        rawIs[i] = ioVal;
      } else if (active.includes('T4')) {
        rawIs[i] = -ioVal;
      } else {
        rawIs[i] = 0;
      }
    }
  }

  // 4. Calculate Comprehensive Metrics (Vdc, Vrms, Idc, Irms, Power, PF, THD)
  let sumVo = 0;
  let sumVoSq = 0;
  let sumIo = 0;
  let sumIoSq = 0;
  let sumIsSq = 0;
  let sumActivePower = 0;

  for (let i = 0; i < N_POINTS; i++) {
    sumVo += rawVo[i];
    sumVoSq += rawVo[i] * rawVo[i];
    sumIo += rawIo[i];
    sumIoSq += rawIo[i] * rawIo[i];
    sumIsSq += rawIs[i] * rawIs[i];
    sumActivePower += rawVo[i] * rawIo[i];
  }

  const v_dc = sumVo / N_POINTS;
  const v_rms = Math.sqrt(sumVoSq / N_POINTS);
  const i_dc = sumIo / N_POINTS;
  const i_rms = Math.sqrt(sumIoSq / N_POINTS);
  const is_rms = Math.sqrt(sumIsSq / N_POINTS);
  const p_dc = sumActivePower / N_POINTS;

  const s_in = (phase === '3-phase' ? Math.sqrt(3) * (Math.sqrt(3) * sourceRms) : sourceRms) * is_rms;
  const pf = s_in > 0 ? Math.min(1.0, Math.max(0, p_dc / s_in)) : 0;

  // Ripple factor RF = sqrt((Vrms/Vdc)^2 - 1)
  const formFactor = v_dc > 0.01 ? v_rms / v_dc : 1;
  const rippleFactor = Math.sqrt(Math.max(0, formFactor * formFactor - 1));

  // Determine conduction mode: CCM (continuous) vs DCM (discontinuous)
  const minCurrent = Math.min(...rawIo);
  const conductionMode = minCurrent > 0.05 ? 'CCM' : 'DCM';

  // 5. Analytical / Theoretical Formulas
  let theoreticalFormula = '';
  let theoreticalVdc = 0;
  let theoreticalExplanation = '';

  const Vm = Vm_ph;
  const cosAlpha = Math.cos(alphaRad);

  if (phase === '1-phase') {
    if (topology === 'half-wave') {
      if (hasFWD || loadType === 'R') {
        theoreticalFormula = 'V_{dc} = \\frac{V_m}{2\\pi} (1 + \\cos\\alpha)';
        theoreticalVdc = (Vm / (2 * Math.PI)) * (1 + cosAlpha);
        theoreticalExplanation = 'Single-Phase Half-Wave with Freewheeling Diode clamps negative excursions at 0V.';
      } else {
        theoreticalFormula = 'V_{dc} = \\frac{V_m}{2\\pi} (\\cos\\alpha - \\cos\\beta)';
        theoreticalVdc = (Vm / (2 * Math.PI)) * (cosAlpha - Math.cos(Math.PI * 1.25));
        theoreticalExplanation = 'Without FWD, inductor sustains conduction past 180° into negative voltage region.';
      }
    } else {
      // 1-Phase Full-Wave
      if (converterMode === 'DBR') {
        theoreticalFormula = 'V_{dc} = \\frac{2 V_m}{\\pi} \\approx 0.90 \\cdot V_{rms}';
        theoreticalVdc = (2 * Vm) / Math.PI;
        theoreticalExplanation = 'Diode Bridge Rectifier (DBR) uncontrolled rectification with natural commutation at α = 0°.';
      } else if (hasFWD || converterMode === 'Semi-Converter') {
        theoreticalFormula = 'V_{dc} = \\frac{V_m}{\\pi} (1 + \\cos\\alpha)';
        theoreticalVdc = (Vm / Math.PI) * (1 + cosAlpha);
        theoreticalExplanation = 'With Freewheeling Diode (or Semi-Converter), inductive load current freewheels through FWD clamping Vo to 0V.';
      } else {
        theoreticalFormula = 'V_{dc} = \\frac{2 V_m}{\\pi} \\cos\\alpha';
        theoreticalVdc = ((2 * Vm) / Math.PI) * cosAlpha;
        theoreticalExplanation = 'Fully Controlled Thyristor Bridge without FWD: operates in 2-quadrant mode; Vo swings negative for α > 0°.';
      }
    }
  } else {
    // 3-Phase
    if (topology === 'half-wave') {
      if (hasFWD && alphaDeg > 30) {
        theoreticalFormula = 'V_{dc} = \\frac{3\\sqrt{3} V_m}{2\\pi} \\cdot \\text{clamped}';
        theoreticalVdc = ((3 * Math.sqrt(3) * Vm) / (2 * Math.PI)) * Math.max(0, cosAlpha);
        theoreticalExplanation = '3-Phase 3-pulse half-wave converter with FWD clamping at zero for large α.';
      } else {
        theoreticalFormula = 'V_{dc} = \\frac{3\\sqrt{3} V_m}{2\\pi} \\cos\\alpha \\approx 0.827 \\cdot V_m \\cos\\alpha';
        theoreticalVdc = ((3 * Math.sqrt(3) * Vm) / (2 * Math.PI)) * cosAlpha;
        theoreticalExplanation = '3-Phase Half-Wave converter (3-pulse) with natural commutation points separated by 120°.';
      }
    } else {
      // 3-Phase 6-Pulse Full Bridge
      if (converterMode === 'DBR') {
        theoreticalFormula = 'V_{dc} = \\frac{3 V_{m,LL}}{\\pi} = \\frac{3\\sqrt{3} V_m}{\\pi} \\approx 1.35 \\cdot V_{LL,rms}';
        theoreticalVdc = (3 * Math.sqrt(3) * Vm) / Math.PI;
        theoreticalExplanation = '3-Phase Diode Bridge (DBR 6-Pulse Graetz bridge) with 60° commutation intervals and minimal ripple.';
      } else if (hasFWD && alphaDeg > 60) {
        theoreticalFormula = 'V_{dc} = \\frac{3 V_{m,LL}}{\\pi} [1 + \\cos(\\alpha + 60^\\circ)]';
        theoreticalVdc = ((3 * Math.sqrt(3) * Vm) / Math.PI) * Math.max(0, cosAlpha);
        theoreticalExplanation = '3-Phase Full Converter with FWD: for α > 60°, freewheeling diode clamps negative line segments.';
      } else {
        theoreticalFormula = 'V_{dc} = \\frac{3 V_{m,LL}}{\\pi} \\cos\\alpha = \\frac{3\\sqrt{3} V_m}{\\pi} \\cos\\alpha';
        theoreticalVdc = ((3 * Math.sqrt(3) * Vm) / Math.PI) * cosAlpha;
        theoreticalExplanation = '3-Phase Thyristor Controlled Rectifier (TCR 6-Pulse): average voltage strictly proportional to cos(α).';
      }
    }
  }

  // 6. Fast Fourier Transform / Harmonics calculation for source current
  const harmonics: { harmonic: number; frequencyHz: number; magnitude: number; percentage: number }[] = [];
  let fundMag = 0;
  let harmonicSumSq = 0;

  for (let h = 1; h <= 15; h += (topology === 'half-wave' ? 1 : 2)) {
    let re = 0;
    let im = 0;
    for (let i = 0; i < N_POINTS; i++) {
      const angle = (h * i * 2 * Math.PI) / N_POINTS;
      re += rawIs[i] * Math.cos(angle);
      im -= rawIs[i] * Math.sin(angle);
    }
    const mag = (2 * Math.sqrt(re * re + im * im)) / N_POINTS;

    if (h === 1) {
      fundMag = mag;
      harmonics.push({
        harmonic: 1,
        frequencyHz: frequency,
        magnitude: parseFloat(mag.toFixed(2)),
        percentage: 100,
      });
    } else if (fundMag > 0.01) {
      const pct = (mag / fundMag) * 100;
      harmonicSumSq += mag * mag;
      harmonics.push({
        harmonic: h,
        frequencyHz: h * frequency,
        magnitude: parseFloat(mag.toFixed(2)),
        percentage: parseFloat(pct.toFixed(1)),
      });
    }
  }

  const thd = fundMag > 0.05 ? parseFloat(((Math.sqrt(harmonicSumSq) / fundMag) * 100).toFixed(1)) : 0;

  // 7. Compile waveform structures
  const waveforms: InstantaneousData[] = [];
  const switchCount = phase === '1-phase' ? (topology === 'half-wave' ? 1 : 4) : topology === 'half-wave' ? 3 : 6;

  for (let i = 0; i < N_POINTS; i++) {
    const angleDeg = parseFloat((i * stepDeg).toFixed(1));
    const condList = conductingList[i];
    const isFwd = fwdActiveList[i];

    // Build switch states
    const switchStates: Record<string, SwitchState> = {};
    for (let s = 1; s <= switchCount; s++) {
      const swId = `T${s}`;
      const defaultType = converterMode === 'DBR' ? 'diode' : 'thyristor';
      const actualType = switchOverrides?.[swId] || defaultType;
      const isConducting = condList.includes(swId);

      switchStates[swId] = {
        id: swId,
        name: actualType === 'diode' ? `D${s}` : `T${s}`,
        type: actualType,
        state: isConducting ? 'ON' : 'OFF',
        instantCurrent: isConducting ? rawIo[i] : 0,
        instantVoltage: isConducting ? 0 : rawVo[i],
        role: `Arm Switch ${s}`,
      };
    }

    // FWD switch state
    switchStates['FWD'] = {
      id: 'FWD',
      name: 'D_FW',
      type: 'diode',
      state: isFwd ? 'ON' : 'OFF',
      instantCurrent: isFwd ? rawIo[i] : 0,
      instantVoltage: isFwd ? 0 : -rawVo[i],
      role: 'Freewheeling Diode',
      isFreewheeling: true,
    };

    waveforms.push({
      angleDeg,
      angleRad: i * stepRad,
      timeSec: (i * stepRad) / omega,
      vs: rawVs[i],
      va: rawVa[i],
      vb: rawVb[i],
      vc: rawVc[i],
      vo: rawVo[i],
      io: rawIo[i],
      is: rawIs[i],
      activeCurrentLoop: loopDescriptions[i],
      conductingSwitches: condList,
      fwdActive: isFwd,
      switchStates,
    });
  }

  return {
    waveforms,
    metrics: {
      v_dc: parseFloat(v_dc.toFixed(1)),
      v_rms: parseFloat(v_rms.toFixed(1)),
      i_dc: parseFloat(i_dc.toFixed(2)),
      i_rms: parseFloat(i_rms.toFixed(2)),
      p_dc: parseFloat(p_dc.toFixed(1)),
      s_in: parseFloat(s_in.toFixed(1)),
      pf: parseFloat(pf.toFixed(3)),
      displacementPf: parseFloat(Math.cos(alphaRad).toFixed(3)),
      rippleFactor: parseFloat(rippleFactor.toFixed(3)),
      formFactor: parseFloat(formFactor.toFixed(2)),
      thd,
      conductionMode,
      theoreticalVdc: parseFloat(theoreticalVdc.toFixed(1)),
      theoreticalFormula,
      theoreticalExplanation,
    },
    harmonics,
  };
}
