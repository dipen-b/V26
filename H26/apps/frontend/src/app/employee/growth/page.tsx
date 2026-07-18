'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function GrowthPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await apiClient.get('/evaluations');
        setEvaluations(response.data);
      } catch (error) {
        console.error('Failed to fetch evaluations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading growth data...</div>;
  }

  const latestEvaluation = evaluations[0];

  const trends = evaluations.map((evaluation: any) => ({
    date: new Date(evaluation.createdAt).toLocaleDateString(),
    readiness: evaluation.readinessScore,
  })).reverse();

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">My Growth</h1>
        <p className="text-slate-400">Track your performance and development</p>
      </div>

      {latestEvaluation ? (
        <>
          {/* Performance Trends */}
          {trends.length > 1 && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Readiness Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="readiness" stroke="#3b82f6" dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Current Competencies */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Current Competencies</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(latestEvaluation.scores).map(([key, value]: any) => {
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .trim()
                  .split(' ')
                  .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ');

                return (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-300">{label}</span>
                      <span className="text-sm font-bold text-blue-400">{value.toFixed(1)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, (value / 100) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Learning Recommendations */}
          {latestEvaluation.recommendations.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Learning Recommendations</h2>
              <div className="space-y-2">
                {latestEvaluation.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">
                      ✓
                    </div>
                    <p className="text-sm text-slate-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas for Improvement */}
          {latestEvaluation.improvementAreas.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Areas for Improvement</h2>
              <div className="space-y-2">
                {latestEvaluation.improvementAreas.map((area: string, idx: number) => (
                  <div key={idx} className="flex gap-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-800">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-white text-sm font-bold">
                      !
                    </div>
                    <p className="text-sm text-yellow-300">{area}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-slate-400">
          No evaluations yet. Check back after your first evaluation!
        </div>
      )}
    </div>
  );
}
