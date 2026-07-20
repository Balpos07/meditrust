import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, UserPlus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import PermissionGate from '../../components/PermissionGate';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  const fetchPatients = async (currentPage, searchQuery) => {
    setLoading(true);
    try {
      const response = await api.get(`/patients?page=${currentPage}&limit=20&search=${searchQuery}`);
      setPatients(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch patients', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchPatients(page, search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Patient Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage hospital patients and records.</p>
        </div>
        
        <PermissionGate permission="PATIENTS_CREATE">
          <Link to="/patients/new" className="btn-primary flex items-center gap-2">
            <UserPlus size={18} /> Register Patient
          </Link>
        </PermissionGate>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search by name, phone, or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on new search
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Patient ID</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Name</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Phone</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800">Gender</th>
                <th className="px-6 py-4 font-medium border-b border-slate-200 dark:border-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-slate-500">Loading patients...</p>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No patients found matching your search.
                  </td>
                </tr>
              ) : (
                patients.map(patient => (
                  <tr key={patient._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-primary font-medium">{patient.patientNumber}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {patient.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/patients/${patient._id}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && patients.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-900 dark:text-white">{patients.length}</span> of <span className="font-medium text-slate-900 dark:text-white">{meta.total}</span> patients
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
                Page {page} of {meta.totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
