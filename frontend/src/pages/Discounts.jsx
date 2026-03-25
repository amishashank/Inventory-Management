import { useState, useEffect } from 'react';
import { discountAPI, categoryAPI } from '../services/api';
import { Plus, Edit2, Trash2, Percent, Calendar, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Discounts() {
  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = { name: '', description: '', discountType: 'PERCENTAGE', value: '', startDate: '', endDate: '', minPurchaseAmount: '', applicableCategoryId: '', active: true };
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [s, c] = await Promise.all([discountAPI.getAll(), categoryAPI.getAll()]);
      setSchemes(s.data);
      setCategories(c.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, value: form.value ? Number(form.value) : null, minPurchaseAmount: form.minPurchaseAmount ? Number(form.minPurchaseAmount) : null, applicableCategoryId: form.applicableCategoryId ? Number(form.applicableCategoryId) : null };
    try {
      if (editing) { await discountAPI.update(editing.id, payload); toast.success('Scheme updated'); }
      else { await discountAPI.create(payload); toast.success('Scheme created'); }
      setShowModal(false); setEditing(null); setForm(emptyForm); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this discount scheme?')) return;
    try { await discountAPI.delete(id); toast.success('Deleted'); fetchData(); } catch { toast.error('Error'); }
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description || '', discountType: s.discountType, value: s.value || '', startDate: s.startDate, endDate: s.endDate, minPurchaseAmount: s.minPurchaseAmount || '', applicableCategoryId: s.applicableCategory?.id || '', active: s.active });
    setShowModal(true);
  };

  const getStatus = (s) => {
    const today = new Date().toISOString().split('T')[0];
    if (!s.active) return { label: 'Inactive', color: 'bg-surface-600 text-surface-300' };
    if (s.startDate > today) return { label: 'Upcoming', color: 'bg-blue-500/20 text-blue-300' };
    if (s.endDate < today) return { label: 'Expired', color: 'bg-red-500/20 text-red-300' };
    return { label: 'Active', color: 'bg-emerald-500/20 text-emerald-300' };
  };

  const typeLabels = { PERCENTAGE: '% Off', FLAT: '₹ Flat Off', BUY_ONE_GET_ONE: 'BOGO' };
  const update = (k, v) => setForm({ ...form, [k]: v });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Discount Schemes</h1>
          <p className="text-surface-400 mt-1">Manage promotions and offers</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 transition-all hover:scale-105">
          <Plus className="w-4 h-4" /> New Scheme
        </button>
      </div>

      {schemes.length === 0 ? (
        <div className="text-center py-20">
          <Percent className="w-16 h-16 text-surface-600 mx-auto mb-4" />
          <p className="text-surface-400 text-lg">No discount schemes yet</p>
          <p className="text-surface-500 text-sm mt-1">Create your first scheme to offer discounts</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {schemes.map((s) => {
            const status = getStatus(s);
            return (
              <div key={s.id} className="bg-surface-900/60 border border-surface-700/50 rounded-2xl p-6 hover:border-surface-600/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
                      <Percent className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{s.name}</h3>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${status.color}`}>{status.label}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-surface-400 hover:text-primary-400 hover:bg-surface-800 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-surface-400 hover:text-danger hover:bg-surface-800 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {s.description && <p className="text-sm text-surface-400 mb-4">{s.description}</p>}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-3.5 h-3.5 text-surface-500" />
                    <span className="text-surface-300">{typeLabels[s.discountType]}{s.discountType === 'PERCENTAGE' ? `: ${s.value}%` : s.discountType === 'FLAT' ? `: ₹${s.value}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-surface-500" />
                    <span className="text-surface-300">{s.startDate} — {s.endDate}</span>
                  </div>
                  {s.minPurchaseAmount && <p className="text-xs text-surface-500">Min. purchase: ₹{Number(s.minPurchaseAmount).toLocaleString()}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <h3 className="text-xl font-bold text-white mb-4">{editing ? 'Edit Scheme' : 'New Discount Scheme'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Scheme Name *</label>
                <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Type *</label>
                  <select required value={form.discountType} onChange={(e) => update('discountType', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FLAT">Flat Amount</option>
                    <option value="BUY_ONE_GET_ONE">Buy One Get One</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Value</label>
                  <input type="number" step="0.01" value={form.value} onChange={(e) => update('value', e.target.value)} placeholder={form.discountType === 'PERCENTAGE' ? '% off' : '₹ off'} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Start Date *</label>
                  <input required type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">End Date *</label>
                  <input required type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Min Purchase (₹)</label>
                  <input type="number" step="0.01" value={form.minPurchaseAmount} onChange={(e) => update('minPurchaseAmount', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Category</label>
                  <select value={form.applicableCategoryId} onChange={(e) => update('applicableCategoryId', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                    <option value="">All Categories</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => update('active', e.target.checked)} className="w-4 h-4 rounded bg-surface-800 border-surface-600 text-primary-500 focus:ring-primary-500/50" />
                <span className="text-sm text-surface-300">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-surface-800 text-surface-300 rounded-xl hover:bg-surface-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
