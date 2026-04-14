import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { outletAPI } from '../services/api';
import {
  LayoutDashboard, Package, Tags, Percent, ShoppingCart, FileText,
  Menu, X, LogOut, Store
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/categories', icon: Tags, label: 'Categories' },
  { path: '/discounts', icon: Percent, label: 'Discounts' },
  { path: '/billing', icon: ShoppingCart, label: 'New Bill' },
  { path: '/bills', icon: FileText, label: 'Bills History' },
];

export default function Layout() {
  const { user, logout, activeOutletId, setActiveOutletId } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [outlets, setOutlets] = useState([]);

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN') {
      outletAPI.getAll()
        .then(res => setOutlets(res.data))
        .catch(console.error);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-900/80 backdrop-blur-xl border-r border-surface-700/50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-700/50">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">StockFlow</h1>
              <p className="text-xs text-surface-400 truncate max-w-[140px]">{user?.shopName}</p>
            </div>
            <button className="ml-auto lg:hidden text-surface-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-300 shadow-sm shadow-primary-500/10'
                      : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
                  }`
                }
              >
                <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-surface-700/50">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-sm font-bold text-white">
                {user?.shopName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-200 truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-surface-400 hover:text-danger rounded-lg hover:bg-surface-800 transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-surface-900/50 backdrop-blur-xl border-b border-surface-700/50 flex items-center px-6 lg:px-8 shrink-0">
          <button className="lg:hidden mr-4 p-2 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800 transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-4">
            {user?.role === 'ROLE_ADMIN' && (
               <div className="hidden sm:flex items-center gap-2 bg-surface-800/80 px-3 py-1.5 rounded-lg border border-surface-700/50 shadow-sm">
                  <Store className="w-4 h-4 text-primary-400" />
                  <select 
                     className="bg-transparent text-sm font-medium text-surface-200 outline-none border-none cursor-pointer focus:ring-0 [&>option]:bg-surface-800 [&>option]:text-white"
                     value={activeOutletId}
                     onChange={(e) => {
                         setActiveOutletId(e.target.value);
                         window.location.reload();
                     }}
                  >
                    <option value="all">🏢 All Branches</option>
                    {outlets.map(o => (
                       <option key={o.id} value={o.id}>📍 {o.name}</option>
                    ))}
                  </select>
               </div>
            )}
            
            {user?.role === 'ROLE_EMPLOYEE' && (
               <div className="hidden sm:flex items-center gap-2 bg-surface-800/80 px-3 py-1.5 rounded-lg border border-surface-700/50 shadow-sm">
                  <Store className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-medium text-surface-200">Terminal Active</span>
               </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-surface-400">Connected</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
