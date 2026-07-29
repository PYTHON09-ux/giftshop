import { Link } from 'react-router-dom';
import { FiGift, FiInstagram, FiArrowUpRight } from 'react-icons/fi';

/* ── Same tokens as HomePage.jsx / Navbar.jsx — worth moving to a shared
   theme.js so all three stay in sync automatically. ── */
const C = {
  canvas: '#F7F3FF',
  ink: '#2A1B3D',
  inkSoft: 'rgba(42,27,61,0.6)',
  inkFaint: 'rgba(42,27,61,0.42)',
  line: 'rgba(42,27,61,0.14)',
  coral: '#FF6552',
  mustard: '#FFC93C',
  teal: '#2FA695',
  pink: '#FF8FB0',
};
const F_DISPLAY = "'Fredoka', sans-serif";
const F_HAND = "'Caveat', cursive";
const F_BODY = "'Plus Jakarta Sans', sans-serif";

const WHATSAPP_NUMBER = '919146609265';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like to enquire about a gift!")}`;
const INSTAGRAM_HANDLE = 'custom_corner.1';
const INSTAGRAM_LINK = `https://instagram.com/${INSTAGRAM_HANDLE}`;

/* Small gift-tag eyebrow used above each link column */
function ColumnTag({ children, color }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 mb-4 relative"
      style={{
        background: color, color: '#fff', fontFamily: F_BODY,
        fontSize: 12, fontWeight: 600, padding: '4px 10px 4px 15px',
        clipPath: 'polygon(9px 0, 100% 0, 100% 100%, 9px 100%, 0 50%)',
        transform: 'rotate(-1.5deg)',
      }}
    >
      <span aria-hidden="true" className="absolute rounded-full" style={{
        left: 3.5, top: '50%', width: 3, height: 3, transform: 'translateY(-50%)',
        background: C.canvas,
      }} />
      {children}
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="relative mt-16 sm:mt-24" style={{ background: C.canvas, fontFamily: F_BODY }}>
      {/* torn-paper edge, continuing the gift-wrap motif */}
      <div aria-hidden="true" className="w-full overflow-hidden leading-none" style={{ height: 14 }}>
        <svg viewBox="0 0 200 14" preserveAspectRatio="none" width="100%" height="14">
          <polygon
            points="0,14 0,4 6,10 12,2 18,11 24,3 30,9 36,1 42,10 48,4 54,12 60,2 66,9 72,3 78,11 84,1 90,10 96,4 102,12 108,2 114,9 120,3 126,11 132,1 138,10 144,4 150,12 156,2 162,9 168,3 174,11 180,1 186,10 192,4 198,12 200,4 200,14"
            fill="white"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto container-px py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 w-fit group">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:-rotate-6"
                style={{ background: C.coral }}>
                <FiGift className="text-white text-base" />
              </span>
              <span className="flex flex-col leading-none">
                <span style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-base">Custom Corner</span>
                <span style={{ fontFamily: F_HAND, color: C.coral }} className="text-sm -mt-0.5">gift shopie</span>
              </span>
            </Link>
            <p style={{ color: C.inkSoft }} className="text-sm leading-relaxed max-w-xs">
              Thoughtfully chosen and personalised gifts for every occasion — made with care, delivered with intention.
            </p>
            <div className="flex gap-2.5 mt-6">
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                style={{ border: `1px solid ${C.line}` }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.52 5.847L0 24l6.335-1.497A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.373l-.36-.214-3.727.88.94-3.633-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
              </a>
              <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                style={{ border: `1px solid ${C.line}` }}>
                <FiInstagram style={{ color: '#dd2a7b' }} className="text-sm" />
              </a>
            </div>
          </div>

          <div>
            <ColumnTag color={C.teal}>Shop</ColumnTag>
            <ul className="space-y-2.5">
              {['All products', 'New arrivals', 'Bestsellers', 'Personalised', 'Events'].map(l => (
                <li key={l}>
                  <Link to="/shop" style={{ color: C.inkSoft }} className="text-sm transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.inkSoft)}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnTag color={C.pink}>Information</ColumnTag>
            <ul className="space-y-2.5">
              {['About us', 'Contact'].map(l => (
                <li key={l}>
                  <a href="#" style={{ color: C.inkSoft }} className="text-sm transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.inkSoft)}>
                    {l}
                  </a>
                </li>
              ))}
              <li>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                  style={{ color: C.inkSoft }} className="text-sm transition-colors inline-flex items-center gap-1"
                  onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.inkSoft)}>
                  WhatsApp us <FiArrowUpRight size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs"
          style={{ borderTop: `1.5px dashed ${C.line}`, color: C.inkFaint }}>
          <p>© 2025 Custom Corner Gift Shopie. All rights reserved.</p>
          <Link to="/admin" className="transition-colors" style={{ color: C.inkFaint }}
            onMouseEnter={e => (e.currentTarget.style.color = C.ink)}
            onMouseLeave={e => (e.currentTarget.style.color = C.inkFaint)}>
            Admin panel
          </Link>
        </div>
      </div>
    </footer>
  );
}