import { useState, useEffect } from 'react';
import { getEvents } from '../utils/api';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';

const TYPE_LABELS = {
  new_arrival: 'New arrival', sale: 'Sale', restock: 'Restock', seasonal: 'Seasonal',
  launch: 'Launch', collaboration: 'Collaboration', custom: 'Event',
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Promise.all([getEvents({ status: 'active' }), getEvents({ status: 'scheduled' })])
      .then(([a, s]) => { setEvents(a.data.events || []); setUpcoming(s.data.events || []); })
      .catch(err => { console.error(err); setErrorMsg('Could not load events.'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  );

  const EventCard = ({ event, isUpcoming }) => (
    <div className="card-surface overflow-hidden">
      {event.banner?.url && (
        <div className="aspect-[16/9] overflow-hidden">
          <img src={event.banner.url} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="pill" style={{ background: event.badgeColor || '#B5582C', color: '#FAF6F0' }}>
            {TYPE_LABELS[event.type] || 'Event'}
          </span>
          <span className={`pill ${isUpcoming ? 'bg-ink/[0.06] text-ink/60' : 'bg-forest/10 text-forest'}`}>
            {isUpcoming ? 'Upcoming' : 'Live now'}
          </span>
        </div>
        <h3 className="font-display font-medium text-ink text-lg sm:text-xl mb-2">{event.title}</h3>
        <p className="text-stone-dark text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>
        {event.discountPercent > 0 && (
          <div className="mb-4 inline-flex items-center gap-1.5 bg-rust-50 text-rust text-sm font-semibold px-3 py-1 rounded-full">
            {event.discountPercent}% off
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-stone">
          <span className="flex items-center gap-1.5"><FiCalendar /> {format(new Date(event.startDate), 'MMM d, yyyy')}</span>
          {event.endDate && (
            <span className="flex items-center gap-1.5">
              <FiClock />
              {isUpcoming
                ? `Starts ${formatDistanceToNow(new Date(event.startDate), { addSuffix: true })}`
                : `Ends ${formatDistanceToNow(new Date(event.endDate), { addSuffix: true })}`}
            </span>
          )}
        </div>
        {event.scheduledProducts?.length > 0 && (
          <Link to="/shop" className="mt-4 inline-flex items-center gap-1.5 text-rust text-sm font-medium hover:underline">
            View products <FiArrowRight className="text-xs" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream pt-16 sm:pt-20 pb-16 sm:pb-20">
      <div className="bg-ink py-14 sm:py-20">
        <div className="max-w-7xl mx-auto container-px text-center">
          <span className="section-label">What's on</span>
          <h1 className="font-display font-medium text-3xl sm:text-4xl text-cream mt-2 mb-3">Events &amp; launches</h1>
          <p className="text-cream/60 max-w-xl mx-auto">New arrivals, sales, and limited collaborations — all in one place.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto container-px py-12 sm:py-16">
        {errorMsg && <p className="text-rust text-sm mb-8 text-center">{errorMsg}</p>}

        {events.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <h2 className="section-heading mb-6 sm:mb-8 flex items-center gap-3">
              <span className="w-2 h-2 bg-forest rounded-full inline-block" /> Live now
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {events.map(e => <EventCard key={e._id} event={e} isUpcoming={false} />)}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section>
            <h2 className="section-heading mb-6 sm:mb-8">Coming soon</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {upcoming.map(e => <EventCard key={e._id} event={e} isUpcoming={true} />)}
            </div>
          </section>
        )}

        {!errorMsg && events.length === 0 && upcoming.length === 0 && (
          <div className="text-center py-20 sm:py-24">
            <h2 className="font-display font-medium text-2xl text-ink mb-3">No events right now</h2>
            <p className="text-stone-dark mb-8">Check back soon, or browse the full collection.</p>
            <Link to="/shop" className="btn-primary">Explore the shop</Link>
          </div>
        )}
      </div>
    </div>
  );
}
