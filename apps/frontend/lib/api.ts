const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

export interface ScenarioRun {
  id: string;
  type: string;
  status: string;
  duration?: number;
  error?: string;
  metadata?: unknown;
  createdAt: string;
}

export interface RunScenarioInput {
  type: string;
  name?: string;
}

export async function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/api/health');
}

export async function runScenario(
  input: RunScenarioInput,
): Promise<ScenarioRun> {
  return apiFetch<ScenarioRun>('/api/scenarios/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
}

export async function getScenarioRuns(): Promise<ScenarioRun[]> {
  return apiFetch<ScenarioRun[]>('/api/scenarios');
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };

    if (typeof body.message === 'string') {
      return body.message;
    }

    if (Array.isArray(body.message)) {
      return body.message.join(', ');
    }
  } catch {
    return `Request failed with status ${response.status}`;
  }

  return `Request failed with status ${response.status}`;
}
