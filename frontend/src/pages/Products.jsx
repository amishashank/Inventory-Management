import { useState, useEffect } from 'react';
import { productAPI, categoryAPI, stockAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Package, Search, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Products() {
  const { activeOutletId } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const emptyForm = { name: '', sku: '', categoryId: '', price: '', costPrice: '', quantity: '', reorderLevel: '', unit: '', description: '', gstRate: '18' };
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [prods, cats] = await Promise.all([productAPI.getAll(), categoryAPI.getAll()]);
      setProducts(prods.data);
      setCategories(cats.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reqForm = { ...form };
    delete reqForm.quantity;
    delete reqForm.reorderLevel;

    const payload = { ...reqForm, price: Number(form.price), costPrice: form.costPrice ? Number(form.costPrice) : null, categoryId: form.categoryId ? Number(form.categoryId) : null, gstRate: Number(form.gstRate) };
    
    try {
      let productId;
      if (editing) { 
          const res = await productAPI.update(editing.id, payload); 
          productId = res.data.id;
          toast.success('Product updated'); 
      }
      else { 
          const res = await productAPI.create(payload); 
          productId = res.data.id;
          toast.success('Product created'); 
      }

      // If a specific branch is selected, update physical stock
      if (activeOutletId !== 'all') {
          await stockAPI.update(productId, {
             quantity: Number(form.quantity || 0),
             reorderLevel: form.reorderLevel ? Number(form.reorderLevel) : 0,
             outletId: activeOutletId
          });
          toast.success('Branch Stock Updated!');
      }

      setShowModal(false); setEditing(null); setForm(emptyForm); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving product'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await productAPI.delete(id); toast.success('Deleted'); fetchData(); } catch { toast.error('Error'); }
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku || '', categoryId: p.category?.id || '', price: p.price, costPrice: p.costPrice || '', quantity: p.quantity, reorderLevel: p.reorderLevel || '', unit: p.unit || '', description: p.description || '', gstRate: p.gstRate || '18' });
    setShowModal(true);
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchCat = !filterCat || p.category?.id === Number(filterCat);
    return matchSearch && matchCat;
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-surface-400 mt-1">{products.length} items in inventory</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 transition-all hover:scale-105">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-11 pr-4 py-2.5 bg-surface-900/60 border border-surface-700/50 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="px-4 py-2.5 bg-surface-900/60 border border-surface-700/50 rounded-xl text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-surface-600 mx-auto mb-4" />
          <p className="text-surface-400 text-lg">No products found</p>
        </div>
      ) : (
        <div className="bg-surface-900/60 border border-surface-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700/50 bg-surface-800/30">
                  <th className="text-left py-3 px-4 text-xs font-medium text-surface-400 uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-surface-400 uppercase tracking-wider">SKU</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-surface-400 uppercase tracking-wider">Category</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-surface-400 uppercase tracking-wider">Price</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-surface-400 uppercase tracking-wider">GST Slab</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-surface-400 uppercase tracking-wider">Stock</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-surface-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      {p.description && <p className="text-xs text-surface-500 truncate max-w-[200px]">{p.description}</p>}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-surface-400">{p.sku || '—'}</td>
                    <td className="py-3 px-4"><span className="text-xs px-2.5 py-1 bg-surface-800 text-surface-300 rounded-full">{p.category?.name || 'Uncategorized'}</span></td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-white">₹{Number(p.price).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-right text-surface-400">{p.gstRate || 0}%</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${p.reorderLevel && p.quantity <= p.reorderLevel ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {p.reorderLevel && p.quantity <= p.reorderLevel && <AlertTriangle className="w-3.5 h-3.5" />}
                        {p.quantity} {p.unit || 'pcs'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 text-surface-400 hover:text-primary-400 hover:bg-surface-800 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-surface-400 hover:text-danger hover:bg-surface-800 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
            <h3 className="text-xl font-bold text-white mb-2">{editing ? 'Edit Product' : 'New Product'}</h3>
            
            {activeOutletId === 'all' && (
              <div className="bg-primary-900/30 border border-primary-500/30 rounded-xl p-3 mb-4 flex gap-3 text-primary-300">
                 <Info className="w-5 h-5 shrink-0" />
                 <p className="text-sm">You are viewing global products. Physical stock cannot be edited unless you select a specific branch from the header.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Name *</label>
                  <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">SKU</label>
                  <input value={form.sku} onChange={(e) => update('sku', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Category</label>
                  <select value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                    <option value="">None</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Selling Price *</label>
                  <input required type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Cost Price</label>
                  <input type="number" step="0.01" value={form.costPrice} onChange={(e) => update('costPrice', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                </div>
                {activeOutletId !== 'all' && (
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Branch Quantity *</label>
                    <input required type="number" min="0" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-primary-400 font-semibold mb-1.5">GST Slab *</label>
                  <select required value={form.gstRate} onChange={(e) => update('gstRate', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/80 border border-primary-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 font-medium">
                    <option value="0">0% - Exempted</option>
                    <option value="0.25">0.25% - Precious Stones</option>
                    <option value="3">3% - Metals</option>
                    <option value="5">5% - Essentials</option>
                    <option value="12">12% - General Goods</option>
                    <option value="18">18% - Standard Rate</option>
                    <option value="28">28% - Luxury Goods</option>
                  </select>
                </div>
                {activeOutletId !== 'all' && (
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">Reorder Level</label>
                    <input type="number" min="0" value={form.reorderLevel} onChange={(e) => update('reorderLevel', e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Unit</label>
                  <input value={form.unit} onChange={(e) => update('unit', e.target.value)} placeholder="pcs, kg, ltr..." className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={2} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" />
                </div>
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
