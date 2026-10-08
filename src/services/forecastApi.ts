export interface ForecastSummary {
  horizon: string;
  bedType: string;
  department: string;
  currentAvailable: number;
  predictedAdmissions: number;
  predictedDischarges: number;
  expectedAvailable: number;
  predictedOccupancy: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceLower: number | null;
  confidenceUpper: number | null;
  lastUpdated: string;
  notes: string;
}

export interface ForecastSummaries {
  '24h': ForecastSummary[];
  '3d': ForecastSummary[];
  '7d': ForecastSummary[];
  '30d': ForecastSummary[];
}

interface PredictionApiResponse {
  success: boolean;
  source?: string;
  summaries: ForecastSummaries;
  error?: string;
}

export async function fetchPredictionSummaries(): Promise<ForecastSummaries> {
  const response = await fetch('/api/predictions');

  if (!response.ok) {
    throw new Error(
      `Prediction API failed: ${response.status}`
    );
  }

  const data: PredictionApiResponse =
    await response.json();

  if (!data.success) {
    throw new Error(
      data.error || 'Failed to load predictions'
    );
  }

  return data.summaries;
}