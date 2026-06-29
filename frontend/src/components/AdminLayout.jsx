import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiShoppingBag, FiTag, FiCalendar, FiLogOut, FiMenu, FiX, FiGift, FiExternalLink,
} from 'react-icons/fi';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiHome, exact: true },
  { to: '/admin/products', label: 'Products', icon: FiShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
  { to: '/admin/events', label: 'Events', icon: FiCalendar },
];

export default function AdminLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };
  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-ink/10">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-8 h-8 bg-ink rounded-md flex items-center justify-center">
            <FiGift className="text-cream text-sm" />
          </span>
          <div className="leading-none">
            <p className="font-display font-semibold text-ink text-sm">Custom Corner</p>
            <p className="text-rust text-[10px] font-semibold uppercase tracking-wider2 mt-0.5">Admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive(to, exact) ? 'bg-ink text-cream' : 'text-ink/60 hover:bg-ink/[0.05] hover:text-ink'}`}
          >
            <Icon className="text-base shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-ink/10">
        <Link to="/" target="_blank" className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm text-ink/60 hover:bg-ink/[0.05] hover:text-ink transition-colors mb-1">
          <FiExternalLink className="text-base shrink-0" /> View shop
        </Link>
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <span className="w-7 h-7 rounded-full bg-rust/15 flex items-center justify-center shrink-0">
            <span className="text-rust font-semibold text-xs">{admin?.username?.[0]?.toUpperCase()}</span>
          </span>
          <div className="min-w-0">
            <p className="text-ink text-sm font-medium truncate">{admin?.username}</p>
            <p className="text-stone text-xs capitalize">{admin?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm text-ink/60 hover:text-rust hover:bg-rust-50 transition-colors mt-1">
          <FiLogOut className="text-base shrink-0" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-cream-dark">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-cream border-r border-ink/10">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-cream border-r border-ink/10">
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-cream border-b border-ink/10 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 -ml-1" aria-label="Open menu">
              <FiMenu className="text-ink text-xl" />
            </button>
            <h1 className="font-display font-medium text-ink text-lg sm:text-xl truncate">{title}</h1>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
