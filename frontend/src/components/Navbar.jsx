import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiGift, FiArrowRight } from 'react-icons/fi';

/* ── Same tokens as HomePage.jsx — consider moving these to a shared
   theme.js and importing in both places once you're happy with the look. ── */
const C = {
  canvas: '#F7F3FF',
  ink: '#2A1B3D',
  inkSoft: 'rgba(42,27,61,0.62)',
  line: 'rgba(42,27,61,0.14)',
  coral: '#FF6552',
  mustard: '#FFC93C',
  teal: '#2FA695',
  pink: '#FF8FB0',
};
const F_DISPLAY = "'Fredoka', sans-serif";
const F_HAND = "'Caveat', cursive";
const F_BODY = "'Plus Jakarta Sans', sans-serif";

/* Small gift-tag shaped pill, used for the active link + admin button */
function Tag({ children, as: Comp = 'span', to, bg = '#fff', color = C.ink, rotate = 0, className = '', style = {}, ...rest }) {
  const El = to ? Link : Comp;
  return (
    <El
      to={to}
      className={`relative inline-flex items-center gap-1.5 font-semibold whitespace-nowrap select-none ${className}`}
      style={{
        background: bg,
        color,
        padding: '6px 14px 6px 20px',
        fontSize: 13,
        fontFamily: F_BODY,
        clipPath: 'polygon(11px 0, 100% 0, 100% 100%, 11px 100%, 0 50%)',
        transform: `rotate(${rotate}deg)`,
        transition: 'transform 0.2s ease',
        ...style,
      }}
      {...rest}
    >
      <span aria-hidden="true" className="absolute rounded-full" style={{
        left: 4.5, top: '50%', width: 3.5, height: 3.5, transform: 'translateY(-50%)',
        background: C.canvas, boxShadow: `inset 0 0 0 1px ${C.line}`,
      }} />
      {children}
    </El>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/events', label: 'Events' },
    { to: '/about', label: 'About' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(searchVal)}`);
    setSearchVal('');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-200"
      style={{
        fontFamily: F_BODY,
        background: 'rgba(247,243,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1.5px dashed ${C.line}`,
        boxShadow: scrolled ? '0 6px 18px -10px rgba(42,27,61,0.25)' : 'none',
      }}
    >
      {/* fonts — better moved to index.html once, but included here so the
          navbar looks right even on pages that don't render HomePage */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>

      <nav className="max-w-7xl mx-auto container-px">
        <div className="flex items-center justify-between h-16 md:h-[4.5rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:-rotate-6"
              style={{ background: C.coral }}
            >
              <FiGift className="text-white text-base" />
            </span>
            <span className="flex flex-col leading-none">
              <span style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-base sm:text-lg">
                Custom Corner
              </span>
              <span style={{ fontFamily: F_HAND, color: C.coral }} className="text-sm -mt-0.5">
                gift shopie
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {links.map(l => {
              const active = location.pathname === l.to;
              return active ? (
                <Tag key={l.to} to={l.to} bg="#fff" color={C.ink} rotate={-1.5} className="shadow-sm" style={{ border: `1px solid ${C.line}` }}>
                  {l.label}
                </Tag>
              ) : (
                <Link
                  key={l.to}
                  to={l.to}
                  className="px-3.5 py-2 text-sm font-medium rounded-full transition-colors"
                  style={{ color: C.inkSoft }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.coral)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.inkSoft)}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop search + admin */}
          {/* <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full pl-3.5 pr-1 py-1.5 w-56 transition-colors" style={{ border: `1px solid ${C.line}` }}>
              <FiSearch style={{ color: C.inkSoft }} className="text-sm shrink-0" />
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search gifts"
                className="bg-transparent text-sm outline-none px-2 w-full"
                style={{ color: C.ink, fontFamily: F_BODY }}
              />
            </form>
            <Tag to="/admin" bg={C.ink} color="#fff" rotate={1.5}>Admin</Tag>
          </div> */}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden w-10 h-10 -mr-1 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: '#fff', background: open ? C.ink : C.coral }}
          >
            {open ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div
          className="md:hidden px-4 sm:px-6 py-5 space-y-5"
          style={{
            background: C.canvas,
            borderTop: `1.5px dashed ${C.line}`,
            animation: 'navFadeIn 0.2s ease-out',
          }}
        >
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full pl-4 pr-1.5 py-2.5 shadow-sm" style={{ border: `1px solid ${C.line}` }}>
            <FiSearch style={{ color: C.inkSoft }} className="text-sm shrink-0" />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search gifts"
              className="bg-transparent text-sm outline-none px-2.5 w-full"
              style={{ color: C.ink, fontFamily: F_BODY }}
            />
            <button
              type="submit"
              aria-label="Search"
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: C.coral, color: '#fff' }}
            >
              <FiArrowRight size={14} />
            </button>
          </form>

          <div className="flex flex-col gap-1">
            {links.map((l, i) => {
              const active = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex items-center gap-2.5 py-2.5"
                  style={{ fontFamily: F_BODY }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: active ? C.coral : 'transparent', border: active ? 'none' : `1.5px solid ${C.line}` }}
                  />
                  <span
                    className="text-base"
                    style={{ color: active ? C.ink : C.inkSoft, fontWeight: active ? 600 : 500 }}
                  >
                    {l.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* <Tag to="/admin" bg={C.ink} color="#fff" rotate={0} className="w-full justify-center"
            style={{ padding: '13px 22px 13px 30px', fontSize: 14 }}>
            Admin panel
          </Tag> */}
        </div>
      )}

      <style>{`
        @keyframes navFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </header>
  );
}