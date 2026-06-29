import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { getAdminEvents, deleteEvent, syncEventStatus } from '../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  draft: 'bg-ink/[0.05] text-stone',
  scheduled: 'bg-ink/[0.06] text-ink/60',
  active: 'bg-forest/10 text-forest',
  ended: 'bg-ink/[0.03] text-stone-light',
};

const TYPE_LABELS = {
  new_arrival: 'New arrival', sale: 'Sale', restock: 'Restock', seasonal: 'Seasonal',
  launch: 'Launch', collaboration: 'Collaboration', custom: 'Event',
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try { const r = await getAdminEvents(); setEvents(r.data.events || []); }
    catch { toast.error('Could not load events'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await deleteEvent(id); toast.success('Event deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const handleSync = async () => {
    try { await syncEventStatus(); toast.success('Statuses synced'); fetchData(); }
    catch { toast.error('Sync failed'); }
  };

  return (
    <AdminLayout title="Events">
      <div className="space-y-5 sm:space-y-6 max-w-5xl">
        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/events/new" className="btn-primary text-sm py-2.5"><FiPlus className="text-sm" /> Schedule event</Link>
          <button onClick={handleSync} className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-ink/15 text-ink/70 text-sm font-medium hover:border-ink/30 transition-colors">
            <FiRefreshCw className="text-sm" /> Sync statuses
          </button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 skeleton rounded-lg" />)}</div>
        ) : events.length === 0 ? (
          <div className="card p-12 sm:p-16 text-center">
            <FiCalendar className="text-stone-light text-4xl mx-auto mb-3" />
            <p className="text-stone-dark mb-5">No events yet</p>
            <Link to="/admin/events/new" className="btn-primary text-sm">Create event</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map(evt => (
              <div key={evt._id} className="card p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <span className={`pill ${STATUS_STYLES[evt.status]}`}>{evt.status}</span>
                  <div className="flex gap-1.5 shrink-0">
                    <Link to={`/admin/events/edit/${evt._id}`} className="w-7 h-7 rounded-md bg-ink/[0.05] hover:bg-ink/[0.08] flex items-center justify-center text-ink/70">
                      <FiEdit2 className="text-xs" />
                    </Link>
                    <button onClick={() => handleDelete(evt._id)} className="w-7 h-7 rounded-md bg-rust-50 hover:bg-rust/15 flex items-center justify-center text-rust">
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                </div>

                <p className="text-stone text-xs uppercase tracking-wide mb-1">{TYPE_LABELS[evt.type] || 'Event'}</p>
                <h3 className="font-display font-medium text-ink mb-1.5">{evt.title}</h3>
                <p className="text-stone-dark text-sm line-clamp-2 mb-3">{evt.description}</p>

                <div className="flex items-center justify-between text-xs text-stone">
                  <span className="flex items-center gap-1.5"><FiCalendar className="text-xs" /> {format(new Date(evt.startDate), 'MMM d, yyyy')}</span>
                  {evt.endDate && <span>→ {format(new Date(evt.endDate), 'MMM d, yyyy')}</span>}
                </div>

                {evt.discountPercent > 0 && (
                  <div className="mt-2.5"><span className="pill bg-rust-50 text-rust">{evt.discountPercent}% discount</span></div>
                )}
                {evt.scheduledProducts?.length > 0 && (
                  <p className="text-stone text-xs mt-2.5">{evt.scheduledProducts.length} product(s) linked</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
