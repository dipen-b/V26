'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  SparklesIcon, ClipboardDocumentListIcon, BoltIcon, ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-500/15 text-green-400',
  in_progress: 'bg-blue-500/15 text-blue-400',
  submitted: 'bg-purple-500/15 text-purple-400',
  pending: 'bg-amber-500/15 text-amber-400',
};

function StatCard({ label, value, sub, accent, icon: Icon }: any) {
  return (
    <div className="sp-card sp-card-hover sp-stat sp-animate-in" style={{ ['--accent' as any]: accent }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          <div className="mt-2 text-3xl font-bold" style={{ color: accent }}>{value}</div>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tasksRes, evaluationsRes] = await Promise.all([
          apiClient.get('/tasks'),
          apiClient.get('/evaluations'),
        ]);
        setTasks(tasksRes.data);
        setEvaluations(evaluationsRes.data);
        if (evaluationsRes.data.length > 0) {
          const latest = evaluationsRes.data[0];
          setPerformanceMetrics({ readiness: latest.readinessScore, scores: latest.scores });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const performanceData = performanceMetrics?.scores
    ? [
        { name: 'Coding', value: performanceMetrics.scores.codingQuality },
        { name: 'Delivery', value: performanceMetrics.scores.deliverySpeed },
        { name: 'Testing', value: performanceMetrics.scores.testingQuality },
        { name: 'Architecture', value: performanceMetrics.scores.architecture },
        { name: 'Problem Solving', value: performanceMetrics.scores.problemSolving },
        { name: 'Docs', value: performanceMetrics.scores.documentation },
        { name: 'Ownership', value: performanceMetrics.scores.ownership },
        { name: 'AI Usage', value: performanceMetrics.scores.aiUsage },
      ]
    : [];

  const taskStats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const greeting =
    new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening';

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="sp-skeleton h-10 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="sp-skeleton h-28" />)}
        </div>
        <div className="sp-skeleton h-80" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="sp-animate-in">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Good {greeting}, {user?.firstName} 👋
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Here's an overview of your performance and progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Readiness Score"
          value={performanceMetrics?.readiness ? performanceMetrics.readiness.toFixed(1) : '--'}
          sub="Based on latest evaluation"
          accent="#6366f1"
          icon={SparklesIcon}
        />
        <StatCard
          label="Tasks Assigned"
          value={taskStats.total}
          sub={`${taskStats.completed} completed`}
          accent="#22c55e"
          icon={ClipboardDocumentListIcon}
        />
        <StatCard
          label="In Progress"
          value={taskStats.inProgress}
          sub="Active tasks"
          accent="#f59e0b"
          icon={BoltIcon}
        />
        <StatCard
          label="Evaluations"
          value={evaluations.length}
          sub="Total received"
          accent="#a855f7"
          icon={ClipboardDocumentCheckIcon}
        />
      </div>

      {/* Performance Chart */}
      {performanceData.length > 0 && (
        <div className="sp-card sp-animate-in">
          <h2 className="sp-heading mb-1">Performance Breakdown</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            Scores across the 8 evaluation dimensions
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#263248" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #33415a', borderRadius: 12, color: '#f1f5f9' }}
              />
              <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Two column: tasks + evaluations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="sp-card sp-animate-in">
          <h2 className="sp-heading mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task: any) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-xl p-3.5"
                style={{ background: 'var(--surface-3)' }}
              >
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{task.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {task.project?.name || 'General'}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-1)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${task.completionPercentage}%`, background: 'linear-gradient(90deg,#3b82f6,#6366f1)' }}
                    />
                  </div>
                  <span className={`sp-pill ${STATUS_STYLES[task.status] || STATUS_STYLES.pending}`}>
                    {task.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No tasks assigned yet</p>
            )}
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="sp-card sp-animate-in">
          <h2 className="sp-heading mb-4">Recent Evaluations</h2>
          <div className="space-y-3">
            {evaluations.slice(0, 4).map((evaluation: any) => (
              <div key={evaluation.id} className="rounded-xl p-4" style={{ background: 'var(--surface-3)' }}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-white">
                    {evaluation.supervisor?.firstName} {evaluation.supervisor?.lastName}
                  </p>
                  <span className={`sp-pill ${evaluation.isApproved ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
                    {evaluation.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Readiness:{' '}
                  <span className="font-bold" style={{ color: 'var(--brand)' }}>
                    {evaluation.readinessScore?.toFixed(1)}
                  </span>
                </p>
              </div>
            ))}
            {evaluations.length === 0 && (
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No evaluations yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
