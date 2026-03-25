import { useState, useEffect } from 'react';
import { billAPI } from '../services/api';
import { FileText, Eye, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    billAPI.getAll().then((r) => setBills(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const filtered = bills.filter((b) =>
    b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
    (b.customerName && b.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-white">Bills History</h1><p className="text-surface-400 mt-1">All generated invoices</p></div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by bill # or customer..." className="w-full pl-11 pr-4 py-2.5 bg-surface-900/60 border border-surface-700/50 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20"><FileText className="w-16 h-16 text-surface-600 mx-auto mb-4" /><p className="text-surface-400 text-lg">No bills found</p></div>
      ) : (
        <div className="bg-surface-900/60 border border-surface-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-surface-700/50 bg-surface-800/30">
                <th className="text-left py-3 px-4 text-xs text-surface-400 uppercase tracking-wider">Bill #</th>
                <th className="text-left py-3 px-4 text-xs text-surface-400 uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-4 text-xs text-surface-400 uppercase tracking-wider">Payment</th>
                <th className="text-right py-3 px-4 text-xs text-surface-400 uppercase tracking-wider">Discount</th>
                <th className="text-right py-3 px-4 text-xs text-surface-400 uppercase tracking-wider">Total</th>
                <th className="text-right py-3 px-4 text-xs text-surface-400 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4"></th>
              </tr></thead>
              <tbody className="divide-y divide-surface-800/50">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-primary-300">{b.billNumber}</td>
                    <td className="py-3 px-4 text-sm text-surface-300">{b.customerName || '—'}</td>
                    <td className="py-3 px-4"><span className="text-xs px-2 py-1 bg-surface-800 text-surface-300 rounded-full">{b.paymentMethod || 'CASH'}</span></td>
                    <td className="py-3 px-4 text-sm text-right text-emerald-400">{Number(b.discountAmount) > 0 ? `-₹${Number(b.discountAmount).toLocaleString()}` : '—'}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-white">₹{Number(b.totalAmount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-right text-surface-400">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right"><button onClick={() => setSelectedBill(b)} className="p-2 text-surface-400 hover:text-primary-400 hover:bg-surface-800 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Invoice #{selectedBill.billNumber}</h3>
            <p className="text-sm text-surface-400 mb-4">{new Date(selectedBill.createdAt).toLocaleString()}</p>
            {selectedBill.customerName && <p className="text-sm text-surface-300 mb-1">Customer: {selectedBill.customerName}</p>}
            {selectedBill.customerPhone && <p className="text-sm text-surface-400 mb-3">Phone: {selectedBill.customerPhone}</p>}
            <div className="border-t border-surface-700/50 pt-3 space-y-2">
              {selectedBill.items.map((it, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-surface-300">{it.productName} × {it.quantity}</span>
                  <span className="text-white">₹{Number(it.lineTotal).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-surface-700/50 mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-surface-400">Subtotal</span><span className="text-white">₹{Number(selectedBill.subtotal).toLocaleString()}</span></div>
              {Number(selectedBill.discountAmount) > 0 && <div className="flex justify-between text-sm"><span className="text-emerald-400">Discount</span><span className="text-emerald-400">-₹{Number(selectedBill.discountAmount).toLocaleString()}</span></div>}
              {Number(selectedBill.taxAmount) > 0 && (() => { const gst = Number(selectedBill.taxPercentage); const half = gst / 2; const halfAmt = (Number(selectedBill.taxAmount) / 2).toFixed(2); return (<>
                <div className="flex justify-between text-sm"><span className="text-primary-400">CGST ({half}%)</span><span className="text-primary-400">₹{halfAmt}</span></div>
                <div className="flex justify-between text-sm"><span className="text-primary-400">SGST ({half}%)</span><span className="text-primary-400">₹{halfAmt}</span></div>
              </>); })()}
              <div className="flex justify-between font-bold text-lg pt-1 border-t border-dashed border-surface-700"><span className="text-white">Total</span><span className="text-primary-300">₹{Number(selectedBill.totalAmount).toLocaleString()}</span></div>
            </div>
            <button onClick={() => setSelectedBill(null)} className="w-full mt-5 py-2.5 bg-surface-800 text-surface-300 rounded-xl hover:bg-surface-700 transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
