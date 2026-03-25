import { useState, useEffect } from 'react';
import { categoryAPI } from '../services/api';
import { Plus, Edit2, Trash2, Tags } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchData = () => {
    categoryAPI.getAll().then((r) => setCategories(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await categoryAPI.update(editing.id, form);
        toast.success('Category updated');
      } else {
        await categoryAPI.create(form);
        toast.success('Category created');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryAPI.delete(id);
      toast.success('Deleted');
      fetchData();
    } catch { toast.error('Error deleting'); }
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="text-surface-400 mt-1">Organize your products by category</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 transition-all hover:scale-105">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20">
          <Tags className="w-16 h-16 text-surface-600 mx-auto mb-4" />
          <p className="text-surface-400 text-lg">No categories yet</p>
          <p className="text-surface-500 text-sm mt-1">Create your first category to organize products</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-surface-900/60 border border-surface-700/50 rounded-2xl p-5 hover:border-surface-600/50 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Tags className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{cat.name}</h3>
                    <p className="text-sm text-surface-400 mt-0.5">{cat.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)} className="p-2 text-surface-400 hover:text-primary-400 hover:bg-surface-800 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-surface-400 hover:text-danger hover:bg-surface-800 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">{editing ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-surface-800 text-surface-300 rounded-xl hover:bg-surface-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-500 hover:to-primary-400 transition-all">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
