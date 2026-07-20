import { useState, useEffect } from 'react';
import { UserPlus, ShieldAlert, Trash2, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminSettings() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'CASHIER'
  });

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/staff/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStaffList(data);
      }
    } catch (error) {
      console.error('Error fetching staff', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert("Staff created successfully!");
        setFormData({ username: '', password: '', role: 'CASHIER' });
        fetchStaff();
      } else {
        const err = await response.json();
        alert(err.detail || "Failed to create staff");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleDeactivate = async (staffId) => {
    if (!window.confirm("Are you sure you want to deactivate this account?")) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/staff/${staffId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchStaff();
      } else {
        const err = await response.json();
        alert(err.detail || "Failed to deactivate");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h2>
          <p className="text-muted mt-2">You must be an Administrator to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 pt-24 relative z-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Shield className="text-primary w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text">Admin Settings</h1>
          <p className="text-muted">Manage hospital staff accounts and roles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Staff Form */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Create New Staff
            </h2>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Username</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  placeholder="e.g. dr.smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  className="input-field" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  placeholder="Secure password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Role</label>
                <select 
                  className="input-field bg-white dark:bg-slate-800"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="CASHIER">Cashier (Generates Invoices)</option>
                  <option value="PHARMACY">Pharmacy (Views Board)</option>
                  <option value="SECURITY">Security (Verifies Receipts)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full mt-4">Create Account</button>
            </form>
          </div>
        </div>

        {/* Staff List Table */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 h-full">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Active Staff Accounts
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                    <th className="pb-4 pr-4">Username</th>
                    <th className="pb-4 px-4">Role</th>
                    <th className="pb-4 px-4 text-center">Status</th>
                    <th className="pb-4 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4" className="text-center py-8 text-muted">Loading...</td></tr>
                  ) : (
                    staffList.map((staff) => (
                      <tr key={staff.id} className="border-b border-slate-100 dark:border-slate-800/50">
                        <td className="py-4 pr-4 font-medium text-slate-700 dark:text-slate-200">
                          {staff.username} {staff.id === user?.id && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded ml-2">You</span>}
                        </td>
                        <td className="py-4 px-4 font-mono text-sm">
                          {staff.role}
                        </td>
                        <td className="py-4 px-4">
                          {staff.is_active ? (
                            <div className="flex justify-center"><CheckCircle className="w-5 h-5 text-success" /></div>
                          ) : (
                            <div className="flex justify-center"><div className="w-2 h-2 rounded-full bg-danger"></div></div>
                          )}
                        </td>
                        <td className="py-4 pl-4 text-right">
                          {staff.is_active && staff.id !== user?.id && (
                            <button 
                              onClick={() => handleDeactivate(staff.id)}
                              className="text-sm text-danger hover:bg-danger/10 px-3 py-1 rounded transition-colors"
                            >
                              Deactivate
                            </button>
                          )}
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
