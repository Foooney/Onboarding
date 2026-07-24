import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, CalendarClock, Smile, TrendingUp } from 'lucide-react';
import { useJourneys, usePeople, useTemplates } from '../lib/store';
import {
  getActiveJourneys,
  getAverageProgress,
  getAverageTemplateDuration,
  getJourneysByMonth,
  getManagerAggregates,
  getMostOverdueTasks,
  getOverdueTasks,
  getPhaseCompletionRates,
  getTeamAggregates,
} from '../lib/selectors';
import { PHASE_LABEL } from '../lib/phases';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';

const COLORS = {
  primary: '#1D8C8B',
  primaryLight: '#A8E2E1',
  success: '#1C9A5B',
  warning: '#E08A1E',
  danger: '#C4432E',
  axis: '#77879A',
  grid: '#E7EAED',
};

const TOOLTIP_STYLE = { borderRadius: 8, border: `1px solid ${COLORS.grid}`, fontSize: 13, boxShadow: '0 1px 2px rgba(16,24,32,0.06)' };

// Fictional — this data model has no real satisfaction survey field.
const SATISFACTION_DATA = [
  { month: 'Feb 26', score: 4.1 },
  { month: 'Mar 26', score: 4.2 },
  { month: 'Apr 26', score: 4.3 },
  { month: 'May 26', score: 4.5 },
  { month: 'Jun 26', score: 4.6 },
  { month: 'Jul 26', score: 4.7 },
];

export function Analytics() {
  const journeys = useJourneys();
  const people = usePeople();
  const templates = useTemplates();

  const activeJourneys = getActiveJourneys(journeys);
  const completionRate = getAverageProgress(activeJourneys);
  const avgDuration = getAverageTemplateDuration(journeys, templates);
  const overdueCount = getOverdueTasks(journeys).length;
  const avgSatisfaction = (SATISFACTION_DATA.reduce((sum, d) => sum + d.score, 0) / SATISFACTION_DATA.length).toFixed(1);

  const teamData = getTeamAggregates(journeys).map((t) => ({ name: t.team, progress: t.averageProgress, journeys: t.journeyCount }));
  const managerData = getManagerAggregates(journeys, people).map((m) => ({ name: m.managerName, progress: m.averageProgress, journeys: m.journeyCount }));
  const overdueData = getMostOverdueTasks(journeys, 6);
  const phaseData = getPhaseCompletionRates(journeys)
    .filter((p) => ['first_30', 'first_60', 'first_90'].includes(p.phase))
    .map((p) => ({ name: PHASE_LABEL[p.phase], percent: p.percent }));
  const monthlyData = getJourneysByMonth(journeys);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-display text-ink-800">Analytics</h1>
        <p className="mt-1 text-body text-ink-500">How onboarding is performing across Smart Infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Completion rate" value={`${completionRate}%`} icon={TrendingUp} hint="Across active journeys" />
        <KpiCard label="Avg. onboarding length" value={`${avgDuration} days`} icon={CalendarClock} hint="Based on templates used" />
        <KpiCard label="Overdue tasks" value={overdueCount} icon={AlertTriangle} tone={overdueCount > 0 ? 'danger' : 'default'} hint="Across all journeys" />
        <KpiCard label="New joiner satisfaction" value={`${avgSatisfaction} / 5`} icon={Smile} tone="success" hint="Fictional survey data" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Progress by team">
          <ResponsiveContainer width="100%" height={Math.max(220, teamData.length * 40)}>
            <BarChart data={teamData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: COLORS.axis, fontSize: 12 }} unit="%" />
              <YAxis type="category" dataKey="name" width={150} tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value}%`, 'Avg. progress']} />
              <Bar dataKey="progress" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Progress by manager">
          <ResponsiveContainer width="100%" height={Math.max(220, managerData.length * 32)}>
            <BarChart data={managerData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: COLORS.axis, fontSize: 12 }} unit="%" />
              <YAxis type="category" dataKey="name" width={150} tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value}%`, 'Avg. progress']} />
              <Bar dataKey="progress" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Most frequently overdue tasks" empty={overdueData.length === 0} emptyLabel="No overdue tasks right now — nice.">
          <ResponsiveContainer width="100%" height={Math.max(220, overdueData.length * 40)}>
            <BarChart data={overdueData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <YAxis type="category" dataKey="title" width={200} tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [value, 'Journeys affected']} />
              <Bar dataKey="count" fill={COLORS.danger} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completion at 30 / 60 / 90 days">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={phaseData} margin={{ top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value}%`, 'Completed']} />
              <Bar dataKey="percent" fill={COLORS.success} radius={[4, 4, 0, 0]} barSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Employees onboarded by month">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} margin={{ top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [value, 'Journeys started']} />
              <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New joiner satisfaction (fictional)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={SATISFACTION_DATA} margin={{ top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fill: COLORS.axis, fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [`${value} / 5`, 'Satisfaction']} />
              <Line type="monotone" dataKey="score" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 4, fill: COLORS.primary }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children, empty, emptyLabel }: { title: string; children: ReactNode; empty?: boolean; emptyLabel?: string }) {
  return (
    <Card>
      <h2 className="text-h3 text-ink-800">{title}</h2>
      <div className="mt-4">{empty ? <p className="py-10 text-center text-body-sm text-ink-400">{emptyLabel}</p> : children}</div>
    </Card>
  );
}
