import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiGift } from 'react-icons/fi';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${scrolled || open ? 'bg-cream/95 backdrop-blur-sm border-b border-ink/10' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto container-px">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-8 h-8 bg-ink rounded-md flex items-center justify-center">
              <FiGift className="text-cream text-base" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display font-semibold text-white text-base">Custom Corner</span>
              <span className="text-rust text-[10px] font-semibold uppercase tracking-wider2">Gift Shopie</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <Link key={l.to} to={l.to} className={`nav-link ${location.pathname === l.to ? 'text-ink font-semibold' : ''}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop search + admin */}
          {/* <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex items-center bg-white border border-ink/15 rounded-full pl-3.5 pr-1 py-1 w-56 focus-within:border-rust transition-colors">
              <FiSearch className="text-stone text-sm shrink-0" />
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search gifts"
                className="bg-transparent text-sm text-ink outline-none px-2 w-full placeholder-stone"
              />
            </form>
            <Link to="/admin" className="btn-outline text-sm py-2 px-4">Admin</Link>
          </div> */}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden w-10 h-10 -mr-2 flex items-center justify-center rounded-md text-ink"
          >
            {open ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t border-ink/10 bg-cream px-4 sm:px-6 py-5 space-y-5 animate-fade-in">
          <form onSubmit={handleSearch} className="flex items-center bg-white border border-ink/15 rounded-full pl-3.5 pr-1 py-2">
            <FiSearch className="text-stone text-sm shrink-0" />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search gifts"
              className="bg-transparent text-sm text-ink outline-none px-2 w-full placeholder-stone"
            />
          </form>
          <div className="flex flex-col gap-1">
            {links.map(l => (
              <Link
                key={l.to} to={l.to}
                className={`py-2.5 text-base ${location.pathname === l.to ? 'text-ink font-semibold' : 'text-ink/70'}`}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <Link to="/admin" className="btn-outline w-full text-sm">Admin panel</Link>
        </div>
      )}
    </header>
  );
}
