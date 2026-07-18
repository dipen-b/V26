'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import {
  CpuChipIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

const STATUS_META: Record<string, { label: string; cls: string }> = {
  assigned: { label: 'Assigned', cls: 'bg-amber-500/15 text-amber-400' },
  submitted: { label: 'Review Pending', cls: 'bg-blue-500/15 text-blue-400' },
  reviewed: { label: 'Awaiting Your Action', cls: 'bg-purple-500/15 text-purple-400' },
  closed: { label: 'Closed', cls: 'bg-green-500/15 text-green-400' },
};

function scoreColor(n: number) {
  if (n >= 80) return '#22c55e';
  if (n >= 60) return '#f59e0b';
  return '#ef4444';
}

export default function AiReviewsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await apiClient.get('/practical-tasks/team');
      setTasks(res.data);
    } catch (e) {
      console.error('Failed to load team tasks', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveDecision = async (taskId: string) => {
    const decision = (decisions[taskId] || '').trim();
    if (!decision) return;
    setSaving(taskId);
    try {
      await apiClient.post(`/practical-tasks/${taskId}/decision`, { decision });
      await load();
    } catch (e) {
      console.error('Failed to save decision', e);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <div className="sp-skeleton h-10 w-72" />
        <div className="sp-skeleton h-64" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div className="sp-animate-in">
        <h1 className="text-3xl font-bold tracking-tight text-white">AI Reviews</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          AI-assessed code submissions from your team's practical tasks. Results are visible to you only.
        </p>
      </div>

      {tasks.length === 0 && (
        <div className="sp-card text-center py-12">
          <CpuChipIcon className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No practical tasks yet.</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Create an evaluation for a team member — a practical task is generated automatically.
          </p>
        </div>
      )}

      {tasks.map((task) => {
        const meta = STATUS_META[task.status] || STATUS_META.assigned;
        const review = task.aiReview;
        return (
          <div key={task.id} className="sp-card sp-animate-in">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
                  {(task.employee?.firstName?.[0] || '') + (task.employee?.lastName?.[0] || '')}
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {task.employee?.firstName} {task.employee?.lastName}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{task.title}</p>
                </div>
              </div>
              <span className={`sp-pill ${meta.cls}`}>{meta.label}</span>
            </div>

            {/* Submission link */}
            {task.githubUrl && (
              <a href={task.githubUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm mt-4 font-medium" style={{ color: 'var(--brand)' }}>
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                {task.githubUrl}
              </a>
            )}

            {/* States */}
            {task.status === 'assigned' && (
              <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <ClockIcon className="h-5 w-5" /> Waiting for the employee to submit their work.
              </div>
            )}

            {task.aiReviewStatus === 'failed' && (
              <div className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm bg-red-500/10 border border-red-500/30 text-red-400">
                <XCircleIcon className="h-5 w-5 shrink-0" />
                AI review failed: {task.aiReviewError || 'unknown error'}
              </div>
            )}

            {/* AI Review result */}
            {review && (
              <div className="mt-5 rounded-xl p-5" style={{ background: 'var(--surface-3)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CpuChipIcon className="h-5 w-5" style={{ color: 'var(--brand)' }} />
                    <span className="font-semibold text-white">AI Assessment</span>
                    <span className="sp-pill bg-slate-500/15 text-slate-300 uppercase text-[10px]">{review.engine}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: scoreColor(review.overallScore) }}>
                      {review.overallScore}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>overall</p>
                  </div>
                </div>

                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{review.summary}</p>

                {/* Dimension scores */}
                <div className="space-y-2 mb-4">
                  {Object.entries(review.dimensionScores || {}).map(([dim, val]: any) => (
                    <div key={dim} className="flex items-center gap-3">
                      <span className="text-xs w-32 shrink-0" style={{ color: 'var(--text-secondary)' }}>{formatDim(dim)}</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${val}%`, background: scoreColor(val) }} />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right" style={{ color: scoreColor(val) }}>{val}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold mb-2 text-green-400">STRENGTHS</p>
                    <ul className="space-y-1">
                      {review.strengths?.map((s: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <CheckCircleIcon className="h-4 w-4 text-green-400 shrink-0 mt-0.5" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-2 text-amber-400">ISSUES</p>
                    <ul className="space-y-1">
                      {review.issues?.map((s: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <XCircleIcon className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 rounded-lg p-3" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--brand)' }}>RECOMMENDATION</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{review.recommendation}</p>
                </div>
              </div>
            )}

            {/* Supervisor decision */}
            {task.status === 'reviewed' && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Your decision / next steps
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    className="sp-input flex-1"
                    placeholder="e.g. Approved — strong docs. Pair on AI-usage practices next sprint."
                    value={decisions[task.id] || ''}
                    onChange={(e) => setDecisions((p) => ({ ...p, [task.id]: e.target.value }))}
                  />
                  <button className="sp-btn sp-btn-primary sm:w-40" disabled={saving === task.id} onClick={() => saveDecision(task.id)}>
                    {saving === task.id ? 'Saving…' : 'Record & Close'}
                  </button>
                </div>
              </div>
            )}

            {task.status === 'closed' && task.supervisorDecision && (
              <div className="mt-4 rounded-xl p-4" style={{ background: 'var(--surface-3)' }}>
                <p className="text-xs font-semibold mb-1 text-green-400">YOUR DECISION</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{task.supervisorDecision}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDim(key: string) {
  return key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, (c) => c.toUpperCase());
}
