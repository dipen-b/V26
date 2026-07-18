'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await apiClient.get('/evaluations');
        setEvaluations(response.data);
        if (response.data.length > 0) {
          setSelectedEvaluation(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch evaluations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading evaluations...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">My Evaluations</h1>
        <p className="text-slate-400">View your evaluation history and feedback</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <h2 className="text-lg font-bold text-white mb-4">Evaluation History</h2>
          <div className="space-y-2">
            {evaluations.map((evaluation: any, index: number) => (
              <button
                key={evaluation.id}
                onClick={() => setSelectedEvaluation(evaluation)}
                className={`w-full text-left p-4 rounded-lg border transition ${
                  selectedEvaluation?.id === evaluation.id
                    ? 'bg-slate-700 border-blue-500'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <p className="font-medium text-white">
                  {evaluation.supervisor.firstName} {evaluation.supervisor.lastName}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(evaluation.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    evaluation.isApproved
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {evaluation.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  {evaluation.isOverridden && (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-900/30 text-purple-400">
                      Overridden
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          {selectedEvaluation ? (
            <>
              {/* Readiness Score */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Readiness Score</h3>
                <div className="flex items-end gap-8">
                  <div>
                    <p className="text-5xl font-bold text-blue-400">
                      {selectedEvaluation.readinessScore.toFixed(1)}
                    </p>
                    <p className="text-sm text-slate-400 mt-2">out of 100</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${selectedEvaluation.readinessScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {selectedEvaluation.readinessScore >= 85
                        ? 'Ready for Critical Project'
                        : selectedEvaluation.readinessScore >= 70
                        ? 'Ready for Independent Project'
                        : selectedEvaluation.readinessScore >= 50
                        ? 'Ready with Guidance'
                        : 'Needs Mentoring'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Scores */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Performance Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedEvaluation.scores).map(([key, value]: any) => {
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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

              {/* Evidence and Feedback */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Feedback & Evidence</h3>
                <div className="space-y-4">
                  {selectedEvaluation.improvementAreas.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">Areas for Improvement</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                        {selectedEvaluation.improvementAreas.map((area: string, idx: number) => (
                          <li key={idx}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedEvaluation.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                        {selectedEvaluation.recommendations.map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedEvaluation.supervisorNotes && (
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">Supervisor Notes</h4>
                      <p className="text-slate-300 text-sm">{selectedEvaluation.supervisorNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              No evaluations available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
