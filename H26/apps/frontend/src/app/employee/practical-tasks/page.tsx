'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { CodeBracketIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const STATUS_META: Record<string, { label: string; cls: string }> = {
  assigned: { label: 'Assigned', cls: 'bg-amber-500/15 text-amber-400' },
  submitted: { label: 'Under Review', cls: 'bg-blue-500/15 text-blue-400' },
  reviewed: { label: 'Reviewed by Supervisor', cls: 'bg-purple-500/15 text-purple-400' },
  closed: { label: 'Closed', cls: 'bg-green-500/15 text-green-400' },
};

export default function PracticalTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    try {
      const res = await apiClient.get('/practical-tasks/mine');
      setTasks(res.data);
    } catch (e) {
      console.error('Failed to load practical tasks', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (taskId: string) => {
    const githubUrl = (urls[taskId] || '').trim();
    if (!githubUrl) {
      setMsg({ id: taskId, type: 'error', text: 'Please paste your GitHub repository URL.' });
      return;
    }
    setSubmitting(taskId);
    setMsg(null);
    try {
      await apiClient.post(`/practical-tasks/${taskId}/submit`, { githubUrl });
      setMsg({ id: taskId, type: 'success', text: 'Submitted! Your code is being reviewed by AI; your supervisor will follow up.' });
      await load();
    } catch (error: any) {
      const m = error.response?.data?.message;
      const text = Array.isArray(m) ? m.map((x: any) => x.message || x).join(', ') : (m || 'Submission failed');
      setMsg({ id: taskId, type: 'error', text });
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div className="sp-skeleton h-10 w-72" />
        <div className="sp-skeleton h-48" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="sp-animate-in">
        <h1 className="text-3xl font-bold tracking-tight text-white">Practical Tasks</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Hands-on tasks generated from your evaluations. Complete one, push it to GitHub, and submit the link for AI review.
        </p>
      </div>

      {tasks.length === 0 && (
        <div className="sp-card text-center py-12">
          <CodeBracketIcon className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No practical tasks yet.</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            A task will appear here after your supervisor completes an evaluation.
          </p>
        </div>
      )}

      {tasks.map((task) => {
        const meta = STATUS_META[task.status] || STATUS_META.assigned;
        const locked = task.status !== 'assigned';
        return (
          <div key={task.id} className="sp-card sp-animate-in">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--brand)' }}>
                  <CodeBracketIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="sp-heading">{task.title}</h2>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {task.targetDimensions?.map((d: string) => (
                      <span key={d} className="sp-pill bg-indigo-500/15 text-indigo-300">{formatDim(d)}</span>
                    ))}
                  </div>
                </div>
              </div>
              <span className={`sp-pill ${meta.cls}`}>{meta.label}</span>
            </div>

            <pre className="text-sm whitespace-pre-wrap font-sans rounded-xl p-4 mb-4" style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}>
              {task.description}
            </pre>

            {task.status === 'assigned' ? (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  GitHub Repository / PR URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    className="sp-input flex-1"
                    placeholder="https://github.com/your-username/your-repo"
                    value={urls[task.id] || ''}
                    onChange={(e) => setUrls((p) => ({ ...p, [task.id]: e.target.value }))}
                  />
                  <button
                    className="sp-btn sp-btn-primary sm:w-44"
                    disabled={submitting === task.id}
                    onClick={() => submit(task.id)}
                  >
                    {submitting === task.id ? 'Submitting…' : 'Submit for Review'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: 'var(--surface-3)' }}>
                {task.status === 'submitted' ? (
                  <ClockIcon className="h-5 w-5 text-blue-400 shrink-0" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5 text-green-400 shrink-0" />
                )}
                <div className="text-sm">
                  <p className="text-white">
                    Submitted:{' '}
                    <a href={task.githubUrl} target="_blank" rel="noreferrer" className="font-medium" style={{ color: 'var(--brand)' }}>
                      {task.githubUrl}
                    </a>
                  </p>
                  <p style={{ color: 'var(--text-muted)' }}>
                    {task.reviewCompleted
                      ? 'AI review complete — your supervisor will discuss the results with you.'
                      : 'Your submission is being reviewed.'}
                  </p>
                </div>
              </div>
            )}

            {msg && msg.id === task.id && (
              <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm border ${
                msg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                <ExclamationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{msg.text}</span>
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
