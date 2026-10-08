import {
  ForecastTimePoint,
  PredictionSummary,
  RiskLevel,
  WhatIfScenario,
  MLModelEvaluation
} from '../types';

export class MLForecastEngine {
  /**
   * Generates time series data points for future bed availability forecasting
   */
  static generateTimeSeries(
    horizonDays: number = 7,
    bedCategory: string = 'All',
    department: string = 'All',
    simulationDeltaAdmissions: number = 0,
    simulationDeltaDischarges: number = 0,
    simulationAddedBeds: number = 0
  ): ForecastTimePoint[] {
    const points: ForecastTimePoint[] = [];
    const today = new Date('2026-10-03T00:00:00Z');
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Base parameters based on bed category / hospital
    let baseCapacity = 500 + simulationAddedBeds;
    let baseAvailable = 88 + simulationAddedBeds;
    let baseDailyAdmissions = 42;
    let baseDailyDischarges = 38;

    if (bedCategory === 'ICU' || department.includes('ICU')) {
      baseCapacity = 80 + Math.floor(simulationAddedBeds * 0.2);
      baseAvailable = 4 + Math.floor(simulationAddedBeds * 0.2);
      baseDailyAdmissions = 15;
      baseDailyDischarges = 10;
    } else if (bedCategory === 'Emergency' || department.includes('Emergency')) {
      baseCapacity = 40 + Math.floor(simulationAddedBeds * 0.1);
      baseAvailable = 7 + Math.floor(simulationAddedBeds * 0.1);
      baseDailyAdmissions = 24;
      baseDailyDischarges = 22;
    } else if (bedCategory === 'General') {
      baseCapacity = 250 + Math.floor(simulationAddedBeds * 0.5);
      baseAvailable = 25 + Math.floor(simulationAddedBeds * 0.5);
      baseDailyAdmissions = 28;
      baseDailyDischarges = 26;
    } else if (bedCategory === 'Pediatric') {
      baseCapacity = 50 + Math.floor(simulationAddedBeds * 0.1);
      baseAvailable = 10 + Math.floor(simulationAddedBeds * 0.1);
      baseDailyAdmissions = 8;
      baseDailyDischarges = 8;
    }

    // Historical 5 days before today
    for (let i = -5; i < 0; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const histAdmissions = Math.round(baseDailyAdmissions * (isWeekend ? 0.75 : 1.05) + (i % 2 === 0 ? 3 : -2));
      const histDischarges = Math.round(baseDailyDischarges * (isWeekend ? 0.55 : 1.1) + (i % 2 === 0 ? -2 : 4));
      const histAvail = Math.max(2, Math.round(baseAvailable + (i * -3) + (isWeekend ? 5 : -4)));
      const occPercent = Math.min(99, Math.round(((baseCapacity - histAvail) / baseCapacity) * 100));

      points.push({
        date: d.toISOString().split('T')[0],
        dayName: `${dayNames[dayOfWeek]} (Past)`,
        historicalAvailable: histAvail,
        predictedAvailable: histAvail,
        lowerConfidence: histAvail,
        upperConfidence: histAvail,
        admissions: histAdmissions,
        discharges: histDischarges,
        occupancyPercent: occPercent,
        riskLevel: occPercent > 92 ? 'HIGH' : occPercent > 85 ? 'MEDIUM' : 'LOW',
      });
    }

    // Today (Anchor Point)
    const todayIndex = today.getDay();
    const todayOcc = Math.min(99.5, Math.round(((baseCapacity - baseAvailable) / baseCapacity) * 1000) / 10);
    points.push({
      date: today.toISOString().split('T')[0],
      dayName: `Today (${dayNames[todayIndex]})`,
      historicalAvailable: baseAvailable,
      currentAvailable: baseAvailable,
      predictedAvailable: baseAvailable,
      lowerConfidence: baseAvailable,
      upperConfidence: baseAvailable,
      admissions: baseDailyAdmissions,
      discharges: baseDailyDischarges,
      occupancyPercent: todayOcc,
      riskLevel: todayOcc > 90 ? 'HIGH' : todayOcc > 80 ? 'MEDIUM' : 'LOW',
    });

    // Future Days (+1 to horizonDays)
    let runningAvailable = baseAvailable;
    for (let i = 1; i <= horizonDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Day of week multipliers + simulation modifiers
      const admMultiplier = (isWeekend ? 0.82 : 1.08) * (1 + simulationDeltaAdmissions / 100);
      const disMultiplier = (isWeekend ? 0.6 : 1.15) * (1 + simulationDeltaDischarges / 100);

      // Spike simulation on Day 1 & Day 2 (tomorrow/day after)
      let spikeBonus = 0;
      if (i === 1) spikeBonus = Math.round(baseDailyAdmissions * 0.4); // +40% tomorrow
      if (i === 2) spikeBonus = Math.round(baseDailyAdmissions * 0.25);

      const predictedAdm = Math.max(1, Math.round(baseDailyAdmissions * admMultiplier + spikeBonus));
      const predictedDis = Math.max(1, Math.round(baseDailyDischarges * disMultiplier));

      const netDelta = predictedDis - predictedAdm;
      runningAvailable = Math.max(1, Math.min(baseCapacity - 2, runningAvailable + netDelta));

      // Uncertainty expansion cone: grows with sqrt(i)
      const uncertainty = Math.round(Math.sqrt(i) * (bedCategory === 'ICU' ? 1.8 : 3.5));
      const lower = Math.max(0, runningAvailable - uncertainty);
      const upper = Math.min(baseCapacity, runningAvailable + uncertainty);

      const occPercent = Math.min(99.5, Math.round(((baseCapacity - runningAvailable) / baseCapacity) * 1000) / 10);
      let risk: RiskLevel = 'LOW';
      if (occPercent >= 94 || runningAvailable <= 3) risk = 'CRITICAL';
      else if (occPercent >= 88 || runningAvailable <= 8) risk = 'HIGH';
      else if (occPercent >= 80) risk = 'MEDIUM';

      points.push({
        date: d.toISOString().split('T')[0],
        dayName: i === 1 ? 'Tomorrow' : `Day ${i} (${dayNames[dayOfWeek]})`,
        predictedAvailable: runningAvailable,
        lowerConfidence: lower,
        upperConfidence: upper,
        admissions: predictedAdm,
        discharges: predictedDis,
        occupancyPercent: occPercent,
        riskLevel: risk,
      });
    }

    return points;
  }

  /**
   * Generates ML Bed Demand Summaries for 24h, 3d, 7d, 30d
   */
  static getPredictionSummaries(): { [key: string]: PredictionSummary[] } {
    return {
      '24h': [
        {
          horizon: '24h',
          bedType: 'ICU',
          department: 'ICU / Critical Care',
          currentAvailable: 4,
          predictedAdmissions: 15,
          predictedDischarges: 10,
          expectedAvailable: 3,
          predictedOccupancy: 96.0,
          riskLevel: 'HIGH',
          confidenceLower: 1,
          confidenceUpper: 5,
          lastUpdated: '2 mins ago',
          notes: 'High respiratory influx & post-op critical transfers expected overnight.',
        },
        {
          horizon: '24h',
          bedType: 'Emergency',
          department: 'Emergency & Trauma',
          currentAvailable: 7,
          predictedAdmissions: 28,
          predictedDischarges: 24,
          expectedAvailable: 3,
          predictedOccupancy: 92.5,
          riskLevel: 'HIGH',
          confidenceLower: 2,
          confidenceUpper: 6,
          lastUpdated: 'Just now',
          notes: 'Admissions spike (+51%) detected for tomorrow afternoon.',
        },
        {
          horizon: '24h',
          bedType: 'General',
          department: 'General Ward',
          currentAvailable: 25,
          predictedAdmissions: 28,
          predictedDischarges: 32,
          expectedAvailable: 29,
          predictedOccupancy: 81.6,
          riskLevel: 'MEDIUM',
          confidenceLower: 24,
          confidenceUpper: 34,
          lastUpdated: '5 mins ago',
          notes: 'Favorable net capacity gain (+4 beds) due to morning discharge batch.',
        },
        {
          horizon: '24h',
          bedType: 'Pediatric',
          department: 'Pediatrics & NICU',
          currentAvailable: 10,
          predictedAdmissions: 6,
          predictedDischarges: 7,
          expectedAvailable: 11,
          predictedOccupancy: 74.0,
          riskLevel: 'LOW',
          confidenceLower: 8,
          confidenceUpper: 14,
          lastUpdated: '12 mins ago',
          notes: 'Stable pediatric volume with adequate safety buffer.',
        },
        {
          horizon: '24h',
          bedType: 'Private Suite',
          department: 'Executive Suites',
          currentAvailable: 10,
          predictedAdmissions: 8,
          predictedDischarges: 6,
          expectedAvailable: 8,
          predictedOccupancy: 85.0,
          riskLevel: 'MEDIUM',
          confidenceLower: 6,
          confidenceUpper: 11,
          lastUpdated: '10 mins ago',
          notes: 'Elective private requests steady; 2 VIP reservations pending.',
        },
      ],
      '3d': [
        {
          horizon: '3d',
          bedType: 'ICU',
          department: 'ICU / Critical Care',
          currentAvailable: 4,
          predictedAdmissions: 38,
          predictedDischarges: 34,
          expectedAvailable: 5,
          predictedOccupancy: 93.8,
          riskLevel: 'HIGH',
          confidenceLower: 2,
          confidenceUpper: 8,
          lastUpdated: '2 mins ago',
          notes: 'Severe pressure on ventilators; step-down transfers required.',
        },
        {
          horizon: '3d',
          bedType: 'Emergency',
          department: 'Emergency & Trauma',
          currentAvailable: 7,
          predictedAdmissions: 76,
          predictedDischarges: 72,
          expectedAvailable: 6,
          predictedOccupancy: 85.0,
          riskLevel: 'MEDIUM',
          confidenceLower: 3,
          confidenceUpper: 9,
          lastUpdated: 'Just now',
          notes: 'Surge stabilizes after Day 2 evening.',
        },
        {
          horizon: '3d',
          bedType: 'General',
          department: 'General Ward',
          currentAvailable: 25,
          predictedAdmissions: 84,
          predictedDischarges: 90,
          expectedAvailable: 31,
          predictedOccupancy: 79.2,
          riskLevel: 'LOW',
          confidenceLower: 25,
          confidenceUpper: 38,
          lastUpdated: '5 mins ago',
          notes: 'Cumulative discharges clear ward backlog.',
        },
        {
          horizon: '3d',
          bedType: 'Pediatric',
          department: 'Pediatrics & NICU',
          currentAvailable: 10,
          predictedAdmissions: 18,
          predictedDischarges: 20,
          expectedAvailable: 12,
          predictedOccupancy: 72.0,
          riskLevel: 'LOW',
          confidenceLower: 8,
          confidenceUpper: 16,
          lastUpdated: '12 mins ago',
          notes: 'Pediatric capacity remains well within normal operating margins.',
        },
      ],
      '7d': [
        {
          horizon: '7d',
          bedType: 'ICU',
          department: 'ICU / Critical Care',
          currentAvailable: 4,
          predictedAdmissions: 84,
          predictedDischarges: 80,
          expectedAvailable: 8,
          predictedOccupancy: 90.0,
          riskLevel: 'HIGH',
          confidenceLower: 4,
          confidenceUpper: 12,
          lastUpdated: '2 mins ago',
          notes: 'Weekly cyclic ICU demand peaks midweek.',
        },
        {
          horizon: '7d',
          bedType: 'Emergency',
          department: 'Emergency & Trauma',
          currentAvailable: 7,
          predictedAdmissions: 172,
          predictedDischarges: 168,
          expectedAvailable: 8,
          predictedOccupancy: 80.0,
          riskLevel: 'MEDIUM',
          confidenceLower: 4,
          confidenceUpper: 12,
          lastUpdated: 'Just now',
          notes: 'Weekend road-traffic accident influx modeled with Poisson distribution.',
        },
        {
          horizon: '7d',
          bedType: 'General',
          department: 'General Ward',
          currentAvailable: 25,
          predictedAdmissions: 195,
          predictedDischarges: 202,
          expectedAvailable: 32,
          predictedOccupancy: 81.0,
          riskLevel: 'LOW',
          confidenceLower: 22,
          confidenceUpper: 42,
          lastUpdated: '5 mins ago',
          notes: 'Steady state equilibrium achieved across medical floors.',
        },
      ],
      '30d': [
        {
          horizon: '30d',
          bedType: 'Hospital-Wide Total',
          department: 'All Departments (500 Beds)',
          currentAvailable: 88,
          predictedAdmissions: 840,
          predictedDischarges: 855,
          expectedAvailable: 95,
          predictedOccupancy: 81.0,
          riskLevel: 'MEDIUM',
          confidenceLower: 70,
          confidenceUpper: 120,
          lastUpdated: '10 mins ago',
          notes: 'Seasonal transition model predicts 8% decline in monsoon fevers.',
        },
        {
          horizon: '30d',
          bedType: 'ICU & Critical Care',
          department: 'ICU Block (80 Beds)',
          currentAvailable: 4,
          predictedAdmissions: 360,
          predictedDischarges: 356,
          expectedAvailable: 8,
          predictedOccupancy: 89.5,
          riskLevel: 'HIGH',
          confidenceLower: 3,
          confidenceUpper: 15,
          lastUpdated: '10 mins ago',
          notes: 'Long-term capacity recommendation: Expand HDU step-down by 10 beds.',
        },
      ],
    };
  }

  /**
   * Executes What-If Scenario Simulations
   */
  static runWhatIfSimulation(
    deltaAdmissionsPercent: number,
    deltaDischargesPercent: number,
    additionalBeds: number,
    emergencySurgeFactor: number
  ): WhatIfScenario {
    const baselineCapacity = 500;
    const totalCapacity = baselineCapacity + additionalBeds;
    const baselineOccupied = 412;

    // Admission shock
    const netAdmissionsFactor = (1 + deltaAdmissionsPercent / 100) * (1 + (emergencySurgeFactor - 1) * 0.4);
    const netDischargesFactor = 1 + deltaDischargesPercent / 100;

    // Projected 48-hour shift
    const base48hAdmissions = 84;
    const base48hDischarges = 78;

    const simAdmissions = Math.round(base48hAdmissions * netAdmissionsFactor);
    const simDischarges = Math.round(base48hDischarges * netDischargesFactor);
    const deltaShift = simAdmissions - simDischarges;

    const simOccupied = Math.min(totalCapacity - 1, Math.max(100, baselineOccupied + deltaShift));
    const simAvailable = Math.max(1, totalCapacity - simOccupied);
    const simOccupancyRate = Math.round((simOccupied / totalCapacity) * 1000) / 10;

    let simRisk: RiskLevel = 'LOW';
    let bottleneck = 'General Medicine';
    let criticalBeds = 0;

    if (simOccupancyRate >= 94 || simAvailable <= 15) {
      simRisk = 'CRITICAL';
      bottleneck = 'ICU / Critical Care & Trauma Emergency';
      criticalBeds = Math.max(0, 15 - simAvailable);
    } else if (simOccupancyRate >= 88 || simAvailable <= 40) {
      simRisk = 'HIGH';
      bottleneck = 'ICU / Critical Care';
      criticalBeds = 2;
    } else if (simOccupancyRate >= 80) {
      simRisk = 'MEDIUM';
      bottleneck = 'Emergency & Triage';
    }

    return {
      id: `sim-${Date.now()}`,
      name: `Simulation (Adm ${deltaAdmissionsPercent > 0 ? '+' : ''}${deltaAdmissionsPercent}%, Dis ${deltaDischargesPercent > 0 ? '+' : ''}${deltaDischargesPercent}%, +${additionalBeds} Beds, Surge ${emergencySurgeFactor}x)`,
      deltaAdmissionsPercent,
      deltaDischargesPercent,
      additionalBeds,
      emergencySurgeFactor,
      simulatedAvailable: simAvailable,
      simulatedOccupancy: simOccupancyRate,
      simulatedRisk: simRisk,
      bottleneckDepartment: bottleneck,
      criticalBedCount: criticalBeds,
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  /**
   * Generates a sample CSV dataset of 12 months for demo/training download & inspection
   */
  static generateSampleCSV(): string {
    const headers = [
      'date',
      'department',
      'bed_type',
      'total_beds',
      'occupied_beds',
      'admissions',
      'discharges',
      'emergency_admissions',
      'avg_length_of_stay_days',
      'occupancy_rate_percent',
      'risk_flag'
    ].join(',');

    const rows: string[] = [headers];
    const departments = [
      { name: 'General Ward', type: 'General', total: 250, baseAdm: 24, alos: 4.2 },
      { name: 'ICU / Critical Care', type: 'ICU', total: 80, baseAdm: 14, alos: 6.8 },
      { name: 'Emergency & Trauma', type: 'Emergency', total: 40, baseAdm: 22, alos: 1.5 },
      { name: 'Pediatrics & NICU', type: 'Pediatric', total: 50, baseAdm: 7, alos: 3.4 },
      { name: 'Cardiology & CCU', type: 'Cardiac', total: 35, baseAdm: 6, alos: 5.1 },
      { name: 'General Surgery', type: 'Surgical', total: 25, baseAdm: 5, alos: 3.9 },
    ];

    const startDate = new Date('2025-10-01T00:00:00Z');
    // Generate 60 representative daily rows for concise, realistic sample
    for (let day = 0; day < 60; day++) {
      const curDate = new Date(startDate);
      curDate.setDate(startDate.getDate() + day);
      const dateStr = curDate.toISOString().split('T')[0];
      const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6;

      for (const d of departments) {
        const admNoise = Math.floor(Math.sin(day / 7) * 4) + (isWeekend ? -3 : 2);
        const admissions = Math.max(1, d.baseAdm + admNoise);
        const discharges = Math.max(1, Math.round(d.baseAdm * (isWeekend ? 0.6 : 1.05) + Math.cos(day / 5) * 2));
        const emergencyAdm = Math.round(admissions * (d.type === 'Emergency' ? 0.85 : d.type === 'ICU' ? 0.5 : 0.2));
        const occupied = Math.min(d.total - 1, Math.max(Math.floor(d.total * 0.65), Math.floor(d.total * 0.82) + admNoise));
        const occRate = Math.round((occupied / d.total) * 1000) / 10;
        const risk = occRate > 92 ? 'HIGH' : occRate > 84 ? 'MEDIUM' : 'LOW';

        rows.push(
          [
            dateStr,
            `"${d.name}"`,
            d.type,
            d.total,
            occupied,
            admissions,
            discharges,
            emergencyAdm,
            d.alos,
            occRate,
            risk
          ].join(',')
        );
      }
    }

    return rows.join('\n');
  }
}
