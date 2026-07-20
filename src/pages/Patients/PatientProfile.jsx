import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Calendar, Activity, Loader2, FileText, Plus } from 'lucide-react';
import api from '../../lib/axios';
import PermissionGate from '../../components/PermissionGate';

export default function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [patientRes, invoicesRes] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get(`/billing/invoices?patientId=${id}&limit=50`)
        ]);
        setPatient(patientRes.data.data);
        setInvoices(invoicesRes.data.data);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-slate-500">Loading patient profile...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-slate-500">
        Patient not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {patient.firstName} {patient.lastName}
            <span className="text-sm font-mono bg-primary/10 text-primary px-3 py-1 rounded-full">{patient.patientNumber}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Patient Profile & History</p>
        </div>
        
        <PermissionGate permission="INVOICES_CREATE">
          <Link to={`/billing/new?patientId=${patient._id}`} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Invoice
          </Link>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 text-xl font-bold">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{patient.firstName} {patient.lastName}</h2>
                <p className="text-sm text-slate-500">{patient.gender} • {new Date().getFullYear() - new Date(patient.dob).getFullYear()} years</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 mb-0.5">Phone Number</p>
                  <p className="font-medium text-slate-900 dark:text-slate-200">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 mb-0.5">Email</p>
                  <p className="font-medium text-slate-900 dark:text-slate-200">{patient.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm text-slate-500 mb-0.5">Address</p>
                  <p className="font-medium text-slate-900 dark:text-slate-200 leading-tight">{patient.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {(patient.bloodGroup || patient.genotype) && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Medical Data
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {patient.bloodGroup && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Blood Group</p>
                    <p className="font-bold text-lg text-danger">{patient.bloodGroup}</p>
                  </div>
                )}
                {patient.genotype && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Genotype</p>
                    <p className="font-bold text-lg text-primary">{patient.genotype}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Invoices */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Billing History
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm">
                  <tr>
                    <th className="px-6 py-3 font-medium">Invoice #</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        No billing history for this patient.
                      </td>
                    </tr>
                  ) : (
                    invoices.map(invoice => (
                      <tr key={invoice._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-slate-900 dark:text-slate-200">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(invoice.grandTotal)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {invoice.status === 'PAID' && <span className="text-success bg-success/10 px-2 py-1 rounded-full text-xs font-bold">PAID</span>}
                          {invoice.status === 'PENDING_PAYMENT' && <span className="text-yellow-600 bg-yellow-500/10 px-2 py-1 rounded-full text-xs font-bold">PENDING</span>}
                          {invoice.status === 'PARTIALLY_PAID' && <span className="text-orange-600 bg-orange-500/10 px-2 py-1 rounded-full text-xs font-bold">PARTIAL</span>}
                          {invoice.status === 'CANCELLED' && <span className="text-danger bg-danger/10 px-2 py-1 rounded-full text-xs font-bold">CANCELLED</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/billing/${invoice._id}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
