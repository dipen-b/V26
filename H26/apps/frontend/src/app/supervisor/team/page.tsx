'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import Link from 'next/link';

export default function TeamPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get('/users/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleSelectEmployee = async (employee: any) => {
    setSelectedEmployee(employee);
    try {
      const response = await apiClient.get(`/users/employees/${employee.id}`);
      setEmployeeDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch employee details:', error);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading team...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Team Management</h1>
        <p className="text-slate-400">Manage and evaluate your team members</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Employees List */}
        <div className="col-span-1 space-y-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredEmployees.map((employee: any) => (
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
                <p className="text-xs text-slate-400 mt-1">{employee.position || 'Employee'}</p>
                {employee.department && (
                  <p className="text-xs text-slate-500 mt-1">{employee.department}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Employee Details */}
        <div className="col-span-2 space-y-6">
          {selectedEmployee && employeeDetails ? (
            <>
              {/* Header */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {employeeDetails.firstName} {employeeDetails.lastName}
                    </h2>
                    <p className="text-slate-400 mt-2">{employeeDetails.position || 'Employee'}</p>
                    {employeeDetails.department && (
                      <p className="text-sm text-slate-500 mt-1">Department: {employeeDetails.department}</p>
                    )}
                  </div>
                  <span className={`px-4 py-2 rounded-lg font-semibold ${
                    employeeDetails.isActive
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {employeeDetails.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Link
                  href={`/supervisor/evaluations?employeeId=${selectedEmployee.id}`}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-center"
                >
                  Create Evaluation
                </Link>
                <Link
                  href={`/supervisor/evaluations?employeeId=${selectedEmployee.id}&history=true`}
                  className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition text-center"
                >
                  View History
                </Link>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Email</p>
                  <p className="font-medium text-white break-all">{employeeDetails.email}</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Joined</p>
                  <p className="font-medium text-white">
                    {new Date(employeeDetails.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Status</p>
                  <p className="font-medium text-blue-400">Active</p>
                </div>
              </div>

              {/* Help Text */}
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-400">
                  💡 Use the "Create Evaluation" button to assess this employee's performance and readiness for projects.
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 bg-slate-800 border border-slate-700 rounded-lg">
              <p className="text-slate-400 text-center">
                {employees.length === 0
                  ? 'No employees in your team'
                  : 'Select an employee to view details'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
