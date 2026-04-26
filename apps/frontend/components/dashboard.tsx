'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, BarChart3, Database, Play, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  getHealth,
  getScenarioRuns,
  runScenario,
  type RunScenarioInput,
  type ScenarioRun,
} from '@/lib/api';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Select } from './ui/select';

const scenarioOptions: Array<{ value: RunScenarioInput['type']; label: string }> = [
  { value: 'success', label: 'success' },
  { value: 'validation_error', label: 'validation_error' },
  { value: 'system_error', label: 'system_error' },
  { value: 'slow_request', label: 'slow_request' },
  { value: 'teapot', label: 'teapot 🫖' },
];

export function Dashboard(): React.ReactElement {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<ScenarioRun | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<RunScenarioInput>({
    defaultValues: {
      type: 'success',
      name: '',
    },
  });

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  });

  const historyQuery = useQuery({
    queryKey: ['scenario-runs'],
    queryFn: getScenarioRuns,
    refetchInterval: 5000,
  });

  const runMutation = useMutation({
    mutationFn: runScenario,
    onSuccess: async (data) => {
      setResult(data);
      setFormError(null);
      reset({ type: 'success', name: '' });
      toast.success(`Scenario ${data.type} finished with ${data.status}.`);
      await queryClient.invalidateQueries({ queryKey: ['scenario-runs'] });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Scenario request failed.';
      setFormError(message);
      toast.error(message);
      void queryClient.invalidateQueries({ queryKey: ['scenario-runs'] });
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    runMutation.mutate({
      type: values.type,
      name: values.name?.trim() || undefined,
    });
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Signal Lab
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            Observability Demo
          </h1>
        </div>
        <nav className="flex items-center gap-3 text-sm text-muted-foreground">
          <a className="hover:text-foreground" href="http://localhost:3001/api/docs">
            Swagger
          </a>
          <a className="hover:text-foreground" href="http://localhost:3001/api/health">
            Health
          </a>
        </nav>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Backend Health
            </CardTitle>
            <CardDescription>Read through TanStack Query</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusLine
              label="Status"
              value={
                healthQuery.isLoading
                  ? 'checking'
                  : healthQuery.data?.status ?? 'unavailable'
              }
            />
            <StatusLine
              label="Timestamp"
              value={healthQuery.data?.timestamp ?? 'No response yet'}
            />
            {healthQuery.error ? (
              <p className="text-sm text-red-700">
                {healthQuery.error instanceof Error
                  ? healthQuery.error.message
                  : 'Health check failed.'}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => void healthQuery.refetch()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Scenario Run
            </CardTitle>
            <CardDescription>Submitted with React Hook Form</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={onSubmit}>
              <label className="space-y-2 text-sm font-medium">
                Type
                <Select {...register('type', { required: true })}>
                  {scenarioOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                Name
                <Input placeholder="optional run name" {...register('name')} />
              </label>
              <div className="flex items-end">
                <Button className="w-full" disabled={runMutation.isPending}>
                  {runMutation.isPending ? 'Running...' : 'Run Scenario'}
                </Button>
              </div>
            </form>

            {formError ? (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            ) : null}

            {result ? (
              <div className="mt-4 rounded-md border bg-muted/50 px-3 py-2 text-sm">
                Created run <span className="font-mono">{result.id}</span> with
                status <span className="font-medium">{result.status}</span>.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Observability Links
          </CardTitle>
          <CardDescription>Open the signals generated by scenario runs</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <a
            className="rounded-md border px-3 py-2 hover:bg-muted"
            href="http://localhost:3100/d/signal-lab-observability/signal-lab-observability"
          >
            Grafana Dashboard: localhost:3100
          </a>
          <a
            className="rounded-md border px-3 py-2 hover:bg-muted"
            href="http://localhost:3001/metrics"
          >
            Prometheus metrics: /metrics
          </a>
          <div className="rounded-md border px-3 py-2">
            Loki query: <span className="font-mono">{'{app="signal-lab"}'}</span>
          </div>
          <div className="rounded-md border px-3 py-2 sm:col-span-3">
            Sentry: check the configured project dashboard after running
            <span className="font-mono"> system_error</span>.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Recent Scenario Runs
          </CardTitle>
          <CardDescription>Latest records from PostgreSQL via Prisma</CardDescription>
        </CardHeader>
        <CardContent>
          {historyQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading recent runs...</p>
          ) : null}
          {historyQuery.error ? (
            <p className="text-sm text-red-700">
              {historyQuery.error instanceof Error
                ? historyQuery.error.message
                : 'Could not load scenario runs.'}
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Duration</th>
                  <th className="py-2 pr-4 font-medium">ID</th>
                  <th className="py-2 pr-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {historyQuery.data?.map((run) => (
                  <tr key={run.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{run.type}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={getBadgeVariant(run.status)}>
                        {run.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      {typeof run.duration === 'number'
                        ? `${run.duration}ms`
                        : '-'}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{run.id}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(run.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {historyQuery.data?.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No scenario runs yet.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

function getBadgeVariant(
  status: string,
): 'default' | 'warning' | 'destructive' | 'secondary' {
  if (status === 'completed') {
    return 'default';
  }

  if (status === 'slow' || status === 'teapot') {
    return 'warning';
  }

  if (status === 'error' || status === 'validation_error') {
    return 'destructive';
  }

  return 'secondary';
}

function StatusLine({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
