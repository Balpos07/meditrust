import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function Receipt({ invoice }) {
  if (!invoice) return null;

  const totalAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="hidden print:block bg-white p-8 w-full max-w-2xl mx-auto text-black">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">MediTrust</h1>
          <p className="text-sm text-slate-500 mt-1">123 Health Avenue, Medical District</p>
          <p className="text-sm text-slate-500">contact@meditrust.com | +234 800 123 4567</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-slate-700">OFFICIAL RECEIPT</h2>
          <p className="text-sm text-slate-500 mt-1">Ref: <span className="font-medium text-slate-800">{invoice.payment_reference}</span></p>
          <p className="text-sm text-slate-500">Date: <span className="font-medium text-slate-800">{new Date().toLocaleDateString()}</span></p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
        <p className="text-lg font-medium text-slate-800">Patient Invoice</p>
        <p className="text-sm text-slate-600">Please retain this receipt for your records.</p>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 text-sm font-semibold text-slate-600">Description</th>
            <th className="text-right py-3 text-sm font-semibold text-slate-600">Amount (NGN)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-slate-100">
              <td className="py-3 text-sm text-slate-700">{item.description}</td>
              <td className="py-3 text-sm text-slate-700 text-right">₦{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="py-4 text-right text-sm font-bold text-slate-800 uppercase pr-4">Total Paid</td>
            <td className="py-4 text-right text-lg font-bold text-green-600">₦{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
          </tr>
        </tfoot>
      </table>

      {/* Status */}
      <div className="flex items-center justify-center space-x-2 bg-green-50 rounded-lg p-4 mb-12">
        <CheckCircle className="h-6 w-6 text-green-500" />
        <span className="text-green-700 font-semibold text-lg">PAID IN FULL</span>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-slate-400 border-t border-slate-200 pt-8">
        <p>Thank you for choosing MediTrust for your healthcare needs.</p>
        <p>This is a computer-generated receipt and requires no physical signature.</p>
      </div>
    </div>
  );
}
