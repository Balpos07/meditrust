import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Loader2, FileText, User, Search } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function CreateInvoice() {
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState(patientIdParam || '');
  const [patientDetails, setPatientDetails] = useState(null);

  // Patient search dropdown state
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [patientsLoaded, setPatientsLoaded] = useState(false);
  const searchWrapperRef = useRef(null);
  
  const [items, setItems] = useState([
    { description: 'General Consultation', quantity: 1, unitPrice: 5000 }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patientIdParam) {
      // Fetch patient details to confirm and display
      api.get(`/patients/${patientIdParam}`)
        .then(res => setPatientDetails(res.data.data))
        .catch(err => toast.error('Could not load patient details'));
    }
  }, [patientIdParam]);

  // Loads the patient list from the backend. With an empty query, this browses ALL
  // (most recent first) patients so staff can scroll and pick without needing to type
  // anything; with a query, it filters by name/phone/patient number.
  const loadPatients = async (query) => {
    setSearchingPatients(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (query) params.set('search', query);
      const response = await api.get(`/patients?${params.toString()}`);
      setPatientResults(response.data.data || []);
      setPatientsLoaded(true);
    } catch (error) {
      console.error('Patient search failed', error);
    } finally {
      setSearchingPatients(false);
    }
  };

  // Debounce search-as-you-type; an empty query re-loads the full browsable list.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadPatients(patientQuery.trim());
    }, patientQuery ? 300 : 0);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientQuery]);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPatient = (patient) => {
    setPatientId(patient._id || patient.id);
    setPatientDetails(patient);
    setPatientQuery('');
    setShowResults(false);
  };

  const handleChangePatient = () => {
    setPatientId('');
    setPatientDetails(null);
    setPatientQuery('');
    setShowResults(false);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index][field] = Number(value);
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      toast.error('Please specify a patient ID');
      return;
    }
    setLoading(true);
    const payload = {
      patientId,
      items
    };
    try {
      const response = await api.post('/billing/invoices', payload);
      console.log('--- INVOICE CREATION RESPONSE ---');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('---------------------------------');
      toast.success('Invoice created successfully!');
      // Navigate to the invoice detail page where virtual account info will appear
      const invoiceId = response.data.data?._id || response.data.data?.id || response.data?._id || response.data?.id;
      navigate(`/billing/${invoiceId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[95%] lg:w-[80%] mx-auto px-4 py-8 max-w-none">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Create Invoice</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Generate a new bill for a patient.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient Selection */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Patient Details
          </h2>
          {patientDetails ? (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white truncate">{patientDetails.firstName} {patientDetails.lastName}</p>
                <p className="text-sm text-slate-500 truncate">{patientDetails.patientNumber} • {patientDetails.phone}</p>
              </div>
              <button type="button" onClick={handleChangePatient} className="text-sm text-primary hover:underline shrink-0">
                Change
              </button>
            </div>
          ) : (
            <div className="relative" ref={searchWrapperRef}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Patient</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={patientQuery}
                  onChange={e => setPatientQuery(e.target.value)}
                  onFocus={() => {
                    setShowResults(true);
                    if (!patientsLoaded) loadPatients('');
                  }}
                  className="input-field pl-10"
                  placeholder="Click to browse all patients, or type to search..."
                  autoComplete="off"
                />
                {searchingPatients && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>

              {showResults && (
                <div className="absolute z-20 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                  {patientResults.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500 text-center">
                      {searchingPatients ? 'Loading patients...' : 'No patients found. Try a different search.'}
                    </div>
                  ) : (
                    <>
                      <div className="px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 sticky top-0">
                        {patientQuery ? `${patientResults.length} match${patientResults.length === 1 ? '' : 'es'}` : `All Patients (${patientResults.length})`}
                      </div>
                      {patientResults.map(patient => (
                        <button
                          type="button"
                          key={patient._id || patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full text-left px-4 py-3 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 flex justify-between items-center gap-3"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate">{patient.firstName} {patient.lastName}</p>
                            <p className="text-xs text-slate-500 truncate">{patient.patientNumber} • {patient.phone}</p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-2">Click the field to browse all patients, or type to search by name, phone, or patient number.</p>
            </div>
          )}
        </div>

        {/* Billing Items */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Line Items
            </h2>
            <button type="button" onClick={handleAddItem} className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 font-medium transition-colors">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 items-start bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex-grow w-full space-y-3">
                  <input type="text" required value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} className="input-field" placeholder="Description (e.g. Blood Test)" />
                </div>
                <div className="w-full md:w-1/3 flex gap-3">
                  <input type="number" required min="1" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="input-field w-20" placeholder="Qty" />
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-medium">₦</span>
                    </div>
                    <input type="number" required min="0" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} className="input-field pl-8" placeholder="Price" />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="p-3 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-5 flex justify-between items-center shadow-inner">
          <span className="text-lg font-medium text-slate-700 dark:text-slate-300">Grand Total</span>
          <span className="text-2xl font-bold text-primary">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalAmount)}</span>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto px-10 flex justify-center items-center h-14 text-lg font-semibold shadow-lg shadow-primary/30">
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Generate Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
