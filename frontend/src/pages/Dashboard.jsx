import { useState, useEffect } from 'react';
import { dashboardAPI, billAPI} from '../services/api';
import { Package, AlertTriangle, Percent, DollarSign, TrendingUp, FileText } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats(),
      billAPI.getAll(),
    ]).then(([statsRes, billsRes]) => {
      setStats(statsRes.data);
      setRecentBills(billsRes.data.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div></div>;

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Low Stock Items', value: stats?.lowStockProducts || 0, icon: AlertTriangle, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
    { label: 'Active Schemes', value: stats?.activeSchemes || 0, icon: Percent, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Bills', value: stats?.totalBills || 0, icon: FileText, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10' },
    { label: "Today's Revenue", value: `₹${(stats?.todayRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-emerald-400 to-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-surface-400 mt-1">Overview of your inventory and sales</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <div key={card.label} className="bg-surface-900/60 backdrop-blur-sm border border-surface-700/50 rounded-2xl p-6 hover:border-surface-600/50 transition-all duration-300 group hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-400 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-white">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} transition-transform duration-300 group-hover:scale-110`}>
                <card.icon className={`w-6 h-6 bg-gradient-to-r ${card.color} bg-clip-text`} style={{ color: 'currentColor' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bills */}
      <div className="bg-surface-900/60 backdrop-blur-sm border border-surface-700/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Bills</h2>
        {recentBills.length === 0 ? (
          <p className="text-surface-400 text-center py-8">No bills yet. Create your first bill from the "New Bill" page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-surface-400 uppercase tracking-wider">Bill #</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-surface-400 uppercase tracking-wider">Customer</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-surface-400 uppercase tracking-wider">Amount</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-surface-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/50">
                {recentBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-primary-300">{bill.billNumber}</td>
                    <td className="py-3 px-4 text-sm text-surface-300">{bill.customerName || '—'}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-white">₹{Number(bill.totalAmount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-right text-surface-400">{new Date(bill.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
