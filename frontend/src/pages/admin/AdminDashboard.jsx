import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { getProductStats, getAdminEvents, seedCategories, syncEventStatus } from '../../utils/api';
import { FiPlus, FiAlertTriangle, FiBox, FiCalendar, FiEye, FiHeart, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [topViewed, setTopViewed] = useState([]);
  const [topLiked, setTopLiked] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setErrorMsg('');
    try {
      const [sRes, eRes] = await Promise.all([getProductStats(), getAdminEvents()]);
      setStats(sRes.data.stats);
      setTopViewed(sRes.data.topViewed || []);
      setTopLiked(sRes.data.topLiked || []);
      setEvents((eRes.data.events || []).slice(0, 4));
    } catch (err) {
      console.error('Dashboard load error:', err);
      setErrorMsg(err.response ? `Server error (${err.response.status})` : 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSeed = async () => {
    try { await seedCategories(); toast.success('Categories seeded'); }
    catch { toast.error('Seed failed'); }
  };

  const handleSyncEvents = async () => {
    try { await syncEventStatus(); toast.success('Event statuses synced'); fetchData(); }
    catch { toast.error('Sync failed'); }
  };

  const StatCard = ({ label, value, icon: Icon, accent, sublabel, to }) => (
    <Link to={to || '#'} className="card p-4 sm:p-5 hover:border-ink/15 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: `${accent}1A` }}>
          <Icon className="text-base" style={{ color: accent }} />
        </span>
      </div>
      <p className="font-display font-semibold text-2xl sm:text-3xl text-ink mb-0.5">{loading ? '—' : value ?? 0}</p>
      <p className="text-ink/70 text-sm font-medium">{label}</p>
      {sublabel && <p className="text-stone text-xs mt-0.5">{sublabel}</p>}
    </Link>
  );

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6 sm:space-y-8">
        {errorMsg && (
          <div className="card p-4 border-rust/30 bg-rust-50 flex items-start gap-3">
            <FiAlertTriangle className="text-rust shrink-0 mt-0.5" />
            <div>
              <p className="text-ink text-sm font-medium">Couldn't load dashboard data</p>
              <p className="text-stone-dark text-sm mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/products/new" className="btn-primary text-sm py-2.5 px-4">
            <FiPlus className="text-sm" /> New product
          </Link>
          <Link to="/admin/events/new" className="btn-outline text-sm py-2.5 px-4">
            <FiCalendar className="text-sm" /> Schedule event
          </Link>
          <button onClick={handleSeed} className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-forest/30 text-forest text-sm font-medium hover:bg-forest/5 transition-colors">
            Seed categories
          </button>
          <button onClick={handleSyncEvents} className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-ink/15 text-ink/70 text-sm font-medium hover:border-ink/30 transition-colors">
            <FiRefreshCw className="text-sm" /> Sync events
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard label="Total products" value={stats?.total} icon={FiBox} accent="#1C1A17" to="/admin/products" />
          <StatCard label="Active" value={stats?.active} icon={FiBox} accent="#3F5246" to="/admin/products" />
          <StatCard label="Low stock" value={stats?.lowStock} icon={FiAlertTriangle} accent="#B5582C" sublabel="5 or fewer" to="/admin/products" />
          <StatCard label="Out of stock" value={stats?.outOfStock} icon={FiAlertTriangle} accent="#943F1C" to="/admin/products" />
          <StatCard label="Featured" value={stats?.featured} icon={FiBox} accent="#5B7264" to="/admin/products" />
        </div>

        {/* Top products */}
        <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
          <div className="card p-5">
            <h2 className="font-display font-medium text-ink mb-4 flex items-center gap-2">
              <FiEye className="text-rust text-base" /> Top viewed
            </h2>
            {topViewed.length === 0 ? (
              <p className="text-stone text-sm text-center py-6">No data yet</p>
            ) : (
              <div className="space-y-1">
                {topViewed.map((p, i) => (
                  <Link to={`/admin/products/edit/${p._id}`} key={p._id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-ink/[0.03] transition-colors">
                    <span className="text-stone text-sm w-4 shrink-0">{i + 1}</span>
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-cream-dark shrink-0">
                      {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ink text-sm font-medium truncate">{p.name}</p>
                      <p className="text-stone text-xs">₹{p.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-stone-dark text-sm font-medium shrink-0">{p.views}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-display font-medium text-ink mb-4 flex items-center gap-2">
              <FiHeart className="text-rust text-base" /> Most saved
            </h2>
            {topLiked.length === 0 ? (
              <p className="text-stone text-sm text-center py-6">No data yet</p>
            ) : (
              <div className="space-y-1">
                {topLiked.map((p, i) => (
                  <Link to={`/admin/products/edit/${p._id}`} key={p._id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-ink/[0.03] transition-colors">
                    <span className="text-stone text-sm w-4 shrink-0">{i + 1}</span>
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-cream-dark shrink-0">
                      {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ink text-sm font-medium truncate">{p.name}</p>
                      <p className="text-stone text-xs">₹{p.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-stone-dark text-sm font-medium shrink-0">{p.likes}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent events */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-medium text-ink flex items-center gap-2">
              <FiCalendar className="text-rust text-base" /> Recent events
            </h2>
            <Link to="/admin/events" className="text-rust text-sm font-medium hover:underline">View all</Link>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-stone text-sm mb-3">No events yet</p>
              <Link to="/admin/events/new" className="btn-outline text-sm py-2">Create your first event</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {events.map(evt => (
                <Link to={`/admin/events/edit/${evt._id}`} key={evt._id} className="p-3.5 bg-cream-dark rounded-md hover:bg-ink/[0.05] transition-colors">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <h3 className="text-ink text-sm font-medium truncate">{evt.title}</h3>
                    <span className={`pill shrink-0 ${evt.status === 'active' ? 'bg-forest/10 text-forest' : evt.status === 'scheduled' ? 'bg-ink/[0.06] text-ink/60' : 'bg-ink/[0.04] text-stone'}`}>
                      {evt.status}
                    </span>
                  </div>
                  <p className="text-stone text-xs">{new Date(evt.startDate).toLocaleDateString('en-IN')}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
