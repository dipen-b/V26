'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';

export default function EvaluationsPage() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employeeId');
  const isHistory = searchParams.get('history') === 'true';

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [evaluationHistory, setEvaluationHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    codingQuality: 75,
    deliverySpeed: 75,
    testingQuality: 75,
    architecture: 75,
    problemSolving: 75,
    documentation: 75,
    ownership: 75,
    aiUsage: 75,
  });

  const [evidence, setEvidence] = useState({
    codingQuality: '',
    deliverySpeed: '',
    testingQuality: '',
    architecture: '',
    problemSolving: '',
    documentation: '',
    ownership: '',
    aiUsage: '',
  });

  const [improvements, setImprovements] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get('/users/employees');
        setEmployees(response.data);

        if (employeeId) {
          const emp = response.data.find((e: any) => e.id === employeeId);
          if (emp) {
            setSelectedEmployee(emp);
            if (isHistory) {
              fetchEvaluationHistory(employeeId);
            } else {
              setShowForm(true);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [employeeId, isHistory]);

  const fetchEvaluationHistory = async (empId: string) => {
    try {
      const response = await apiClient.get(`/evaluations/employee/${empId}`);
      setEvaluationHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch evaluation history:', error);
    }
  };

  const handleSelectEmployee = (emp: any) => {
    setSelectedEmployee(emp);
    setShowForm(true);
    setEvaluationHistory([]);
  };

  const handleScoreChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: Math.max(0, Math.min(100, value)) }));
  };

  const handleEvidenceChange = (field: string, value: string) => {
    setEvidence(prev => ({ ...prev, [field]: value }));
  };

  const extractErrorMessage = (error: any): string => {
    const data = error.response?.data;
    const msg = data?.message;
    if (Array.isArray(msg)) {
      // ValidationPipe returns [{ field, message }, ...] or [string, ...]
      return msg
        .map((m: any) => (typeof m === 'string' ? m : m.message || JSON.stringify(m)))
        .join(', ');
    }
    if (typeof msg === 'string') return msg;
    return error.message || 'Something went wrong';
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setSubmitting(true);
    setMessage(null);
    try {
      await apiClient.post(`/evaluations/employee/${selectedEmployee.id}`, {
        scores: formData,
        evidence: evidence,
        improvementAreas: improvements.split('\n').filter(a => a.trim()),
        recommendations: recommendations.split('\n').filter(a => a.trim()),
        supervisorNotes: supervisorNotes,
      });

      // Reset form
      setShowForm(false);
      setSelectedEmployee(null);
      setFormData({
        codingQuality: 75,
        deliverySpeed: 75,
        testingQuality: 75,
        architecture: 75,
        problemSolving: 75,
        documentation: 75,
        ownership: 75,
        aiUsage: 75,
      });
      setEvidence({
        codingQuality: '',
        deliverySpeed: '',
        testingQuality: '',
        architecture: '',
        problemSolving: '',
        documentation: '',
        ownership: '',
        aiUsage: '',
      });
      setImprovements('');
      setRecommendations('');
      setSupervisorNotes('');

      setMessage({ type: 'success', text: 'Evaluation submitted successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: `Failed to submit evaluation: ${extractErrorMessage(error)}` });
    } finally {
      setSubmitting(false);
    }
  };

  const readinessScore = Object.values(formData).reduce((a, b) => a + b, 0) / Object.keys(formData).length;

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Evaluations</h1>
        <p className="text-slate-400">Create and manage employee evaluations</p>
      </div>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Employees List */}
        <div className="col-span-1">
          <h2 className="text-lg font-bold text-white mb-4">Select Employee</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {employees.map((employee: any) => (
              <button
                key={employee.id}
                onClick={() => handleSelectEmployee(employee)}
                className={`w-full text-left p-4 rounded-lg border transition ${
                  selectedEmployee?.id === employee.id
                    ? 'bg-slate-700 border-blue-500'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <p className="font-medium text-white">
                  {employee.firstName} {employee.lastName}
                </p>
                <p className="text-xs text-slate-400 mt-1">{employee.position}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Evaluation Form */}
        <div className="col-span-2">
          {showForm && selectedEmployee ? (
            <form onSubmit={handleSubmitEvaluation} className="space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Evaluating: {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h3>

                {/* Readiness Score Preview */}
                <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-sm text-slate-300 mb-2">Calculated Readiness Score</p>
                  <div className="text-3xl font-bold text-blue-400">{readinessScore.toFixed(1)}</div>
                  <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${readinessScore}%` }}
                    />
                  </div>
                </div>

                {/* Performance Scores */}
                <h4 className="font-semibold text-white mb-4">Performance Scores (0-100)</h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(formData).map(([key, value]: any) => {
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                      .split(' ')
                      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ');

                    return (
                      <div key={key}>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm text-slate-300">{label}</label>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => handleScoreChange(key, parseInt(e.target.value))}
                            min="0"
                            max="100"
                            className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                          />
                        </div>
                        <input
                          type="range"
                          value={value}
                          onChange={(e) => handleScoreChange(key, parseInt(e.target.value))}
                          min="0"
                          max="100"
                          className="w-full h-2 bg-slate-600 rounded-full cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Evidence */}
                <h4 className="font-semibold text-white mb-4">Evidence for Each Score</h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.keys(evidence).map((key) => {
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                      .split(' ')
                      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ');

                    return (
                      <div key={key}>
                        <label className="block text-sm text-slate-300 mb-2">{label}</label>
                        <textarea
                          value={evidence[key as keyof typeof evidence]}
                          onChange={(e) => handleEvidenceChange(key, e.target.value)}
                          placeholder="Provide evidence for this score..."
                          rows={3}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm resize-none"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Improvement Areas */}
                <div className="mb-6">
                  <label className="block text-sm text-slate-300 mb-2">Areas for Improvement (one per line)</label>
                  <textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="E.g. Improve documentation quality"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm resize-none"
                  />
                </div>

                {/* Recommendations */}
                <div className="mb-6">
                  <label className="block text-sm text-slate-300 mb-2">Recommendations (one per line)</label>
                  <textarea
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    placeholder="E.g. Consider taking a technical writing course"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm resize-none"
                  />
                </div>

                {/* Supervisor Notes */}
                <div className="mb-6">
                  <label className="block text-sm text-slate-300 mb-2">Supervisor Notes</label>
                  <textarea
                    value={supervisorNotes}
                    onChange={(e) => setSupervisorNotes(e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-lg transition"
                  >
                    {submitting ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center h-96 bg-slate-800 border border-slate-700 rounded-lg">
              <p className="text-slate-400">Select an employee to create an evaluation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
