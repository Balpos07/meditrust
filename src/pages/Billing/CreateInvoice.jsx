import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Loader2, FileText, User } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function CreateInvoice() {
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const navigate = useNavigate();

  const [patientId, setPatientId] = useState(patientIdParam || '');
  const [patientDetails, setPatientDetails] = useState(null);
  
  const [items, setItems] = useState([
    { description: 'General Consultation', quantity: 1, unitPrice: 5000, serviceCode: 'CONSULT-01', department: 'OPD' }
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

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, serviceCode: '', department: 'GENERAL' }]);
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
    try {
      const response = await api.post('/billing/invoices', {
        patientId,
        items
      });
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Invoice</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Generate a new bill for a patient.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient Selection */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Patient Details
          </h2>
          {patientDetails ? (
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{patientDetails.firstName} {patientDetails.lastName}</p>
                <p className="text-sm text-slate-500">{patientDetails.patientNumber} • {patientDetails.phone}</p>
              </div>
              <button type="button" onClick={() => { setPatientId(''); setPatientDetails(null); }} className="text-sm text-primary hover:underline">
                Change
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Patient Mongo ID (In real app, use a searchable dropdown)</label>
              <input type="text" required value={patientId} onChange={e => setPatientId(e.target.value)} className="input-field" placeholder="60d5ecb..." />
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
                  <div className="flex gap-3">
                    <input type="text" value={item.serviceCode} onChange={e => handleItemChange(idx, 'serviceCode', e.target.value)} className="input-field w-1/2" placeholder="Code (e.g. LAB-01)" />
                    <input type="text" value={item.department} onChange={e => handleItemChange(idx, 'department', e.target.value)} className="input-field w-1/2" placeholder="Dept (e.g. LAB)" />
                  </div>
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

        <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center h-14 text-lg font-semibold shadow-lg shadow-primary/30">
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Generate Invoice"}
        </button>
      </form>
    </div>
  );
}
