'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionType, setSubmissionType] = useState('code');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiClient.get('/tasks');
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    setSubmitting(true);
    try {
      await apiClient.post(`/tasks/${selectedTask.id}/submit`, {
        type: submissionType,
        content: submissionContent,
        url: submissionUrl,
      });

      setSubmissionContent('');
      setSubmissionUrl('');
      setSelectedTask(null);

      // Refresh tasks
      const response = await apiClient.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to submit work:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/30 text-green-400';
      case 'submitted':
        return 'bg-blue-900/30 text-blue-400';
      case 'evaluated':
        return 'bg-purple-900/30 text-purple-400';
      default:
        return 'bg-slate-700/30 text-slate-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading tasks...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">My Tasks</h1>
        <p className="text-slate-400">View and manage your assigned work</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-400">Total Tasks</p>
          <p className="text-2xl font-bold text-white">{tasks.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-400">In Progress</p>
          <p className="text-2xl font-bold text-blue-400">{tasks.filter(t => t.status === 'in_progress').length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-400">Completed</p>
          <p className="text-2xl font-bold text-green-400">{tasks.filter(t => t.status === 'completed').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {tasks.map((task: any) => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`p-6 border rounded-lg cursor-pointer transition ${
                selectedTask?.id === task.id
                  ? 'bg-slate-700 border-blue-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                  <p className="text-sm text-slate-400">{task.project?.name || 'General Project'}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>

              {task.description && (
                <p className="text-sm text-slate-400 mb-3">{task.description}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-400">Progress</span>
                    <span className="text-xs font-medium text-slate-300">{task.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${task.completionPercentage}%` }}
                    />
                  </div>
                </div>
                {task.dueDate && (
                  <span className="text-xs text-slate-400 ml-4">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-slate-400">No tasks assigned</div>
          )}
        </div>

        {/* Submission Panel */}
        {selectedTask && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 h-fit">
            <h3 className="text-lg font-bold text-white mb-4">Submit Work</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Submission Type
                </label>
                <select
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                >
                  <option value="code">Code</option>
                  <option value="github_pr">GitHub PR</option>
                  <option value="documentation">Documentation</option>
                  <option value="test_evidence">Test Evidence</option>
                  <option value="ai_prompt">AI Prompt</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {submissionType === 'github_pr' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    PR URL
                  </label>
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                    required
                  />
                </div>
              )}

              {submissionType !== 'github_pr' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {submissionType === 'code' ? 'Code' : 'Content'}
                  </label>
                  <textarea
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Paste your content here..."
                    rows={6}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm font-mono resize-none"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded transition"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
