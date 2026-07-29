import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp, FiAlertCircle } from 'react-icons/fi';

/* ── Same tokens as HomePage.jsx / Navbar.jsx / Footer.jsx — worth moving
   to a shared theme.js so every file stays in sync automatically. ── */
const C = {
  canvas: '#F7F3FF',
  canvasDeep: '#EFE7FF',
  ink: '#2A1B3D',
  inkSoft: 'rgba(42,27,61,0.62)',
  inkFaint: 'rgba(42,27,61,0.42)',
  line: 'rgba(42,27,61,0.14)',
  coral: '#FF6552',
  mustard: '#FFC93C',
  teal: '#2FA695',
  pink: '#FF8FB0',
};
const F_DISPLAY = "'Fredoka', sans-serif";
const F_BODY = "'Plus Jakarta Sans', sans-serif";
const ACCENTS = [C.coral, C.mustard, C.teal, C.pink];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'price', label: 'Price: low to high' },
  { value: '-price', label: 'Price: high to low' },
  { value: '-ratings', label: 'Top rated' },
  { value: '-views', label: 'Most popular' },
];

const defaultFilters = {
  search: '', category: '', subCategory: '', minPrice: '', maxPrice: '',
  isFeatured: '', isNewArrival: '', isBestseller: '', sort: '-createdAt',
};

/* small helpers so the panel below stays readable */
function FieldLabel({ children }) {
  return (
    <span className="block mb-2 text-xs font-semibold uppercase tracking-wide"
      style={{ color: C.inkFaint, fontFamily: F_BODY, letterSpacing: '0.04em' }}>
      {children}
    </span>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors ${props.className || ''}`}
      style={{ background: '#fff', border: `1.5px solid ${C.line}`, color: C.ink, fontFamily: F_BODY, ...props.style }}
      onFocus={e => { e.currentTarget.style.borderColor = C.coral; props.onFocus?.(e); }}
      onBlur={e => { e.currentTarget.style.borderColor = C.line; props.onBlur?.(e); }}
    />
  );
}

/* gift-tag shaped toggle button, used for quick filters */
function TagToggle({ active, color = C.coral, rotate = -1.5, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center gap-1.5 text-sm font-semibold transition-all"
      style={{
        background: active ? color : '#fff',
        color: active ? '#fff' : C.inkSoft,
        padding: '7px 14px 7px 20px',
        fontFamily: F_BODY,
        clipPath: 'polygon(11px 0, 100% 0, 100% 100%, 11px 100%, 0 50%)',
        border: active ? 'none' : `1.5px solid ${C.line}`,
        transform: `rotate(${active ? 0 : rotate}deg)`,
      }}
    >
      <span aria-hidden="true" className="absolute rounded-full" style={{
        left: 4.5, top: '50%', width: 3.5, height: 3.5, transform: 'translateY(-50%)',
        background: active ? 'rgba(255,255,255,0.55)' : C.canvas,
        boxShadow: active ? 'none' : `inset 0 0 0 1px ${C.line}`,
      }} />
      {children}
    </button>
  );
}

// IMPORTANT: this component is declared at module scope, outside ShopPage.
// Defining it inside ShopPage (as a closure) would make React treat it as a
// brand-new component type on every render of ShopPage, which unmounts and
// remounts every input inside it — that's what was causing the search box
// to lose focus after every keystroke. Everything it needs comes in as
// props instead of being captured from outer scope.
function FilterPanel({ filters, setFilters, categories, expandedCats, setExpandedCats, activeFilterCount, clearFilters }) {
  return (
    <div className="space-y-6" style={{ fontFamily: F_BODY }}>
      <div>
        <FieldLabel>Search</FieldLabel>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: C.inkFaint }} />
          <TextInput
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            placeholder="Search gifts"
            className="pl-9"
          />
        </div>
        <p className="text-xs mt-1.5" style={{ color: C.inkFaint }}>Try a partial word — e.g. "mu" finds "Mug"</p>
      </div>

      <div>
        <FieldLabel>Quick filters</FieldLabel>
        <div className="flex flex-wrap gap-2.5">
          {[['isNewArrival', 'New', C.teal], ['isFeatured', 'Featured', C.coral], ['isBestseller', 'Bestseller', C.pink]].map(([k, l, color], i) => (
            <TagToggle key={k} active={!!filters[k]} color={color} rotate={i % 2 === 0 ? -2 : 2}
              onClick={() => setFilters(p => ({ ...p, [k]: p[k] ? '' : 'true' }))}>
              {l}
            </TagToggle>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Category</FieldLabel>
        <div className="space-y-1">
          <button
            onClick={() => setFilters(p => ({ ...p, category: '', subCategory: '' }))}
            className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: !filters.category ? `${C.coral}14` : 'transparent',
              color: !filters.category ? C.coral : C.inkSoft,
              fontWeight: !filters.category ? 600 : 500,
            }}
          >
            All categories
          </button>
          {categories.map(cat => (
            <div key={cat._id}>
              <div className="flex items-center">
                <button
                  onClick={() => setFilters(p => ({ ...p, category: cat.slug, subCategory: '' }))}
                  className="flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background: filters.category === cat.slug ? `${C.coral}14` : 'transparent',
                    color: filters.category === cat.slug ? C.coral : C.inkSoft,
                    fontWeight: filters.category === cat.slug ? 600 : 500,
                  }}
                >
                  {cat.name}
                </button>
                {cat.subCategories?.length > 0 && (
                  <button onClick={() => setExpandedCats(p => ({ ...p, [cat._id]: !p[cat._id] }))} className="p-2" style={{ color: C.inkFaint }}>
                    {expandedCats[cat._id] ? <FiChevronUp className="text-sm" /> : <FiChevronDown className="text-sm" />}
                  </button>
                )}
              </div>
              {expandedCats[cat._id] && cat.subCategories?.map(sub => (
                <button
                  key={sub.slug}
                  onClick={() => setFilters(p => ({ ...p, category: cat.slug, subCategory: sub.slug }))}
                  className="block w-full text-left px-6 py-1.5 text-sm rounded-lg transition-colors"
                  style={{ color: filters.subCategory === sub.slug ? C.coral : C.inkFaint, fontWeight: filters.subCategory === sub.slug ? 600 : 500 }}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Price range (₹)</FieldLabel>
        <div className="flex gap-2">
          <TextInput type="number" inputMode="numeric" value={filters.minPrice} onChange={e => setFilters(p => ({ ...p, minPrice: e.target.value }))} placeholder="Min" />
          <TextInput type="number" inputMode="numeric" value={filters.maxPrice} onChange={e => setFilters(p => ({ ...p, maxPrice: e.target.value }))} placeholder="Max" />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters}
          className="w-full text-sm font-semibold flex items-center justify-center gap-1.5 py-2.5 rounded-full transition-colors"
          style={{ color: C.coral, border: `1.5px solid ${C.coral}55` }}
          onMouseEnter={e => (e.currentTarget.style.background = `${C.coral}0F`)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <FiX className="text-sm" /> Clear all filters
        </button>
      )}
    </div>
  );
}

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});

  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    isFeatured: searchParams.get('isFeatured') || '',
    isNewArrival: searchParams.get('isNewArrival') || '',
    isBestseller: searchParams.get('isBestseller') || '',
  }));

  useEffect(() => {
    getCategories()
      .then(r => setCategories(r.data.categories || []))
      .catch(err => console.error('getCategories failed:', err));
  }, []);

  const fetchProducts = useCallback(async (pg = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Build params explicitly. Never send isActive — the public shop should
      // always rely on the backend's default (active products only).
      const params = { page: pg, limit: 20, sort: filters.sort };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.subCategory) params.subCategory = filters.subCategory;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.isFeatured) params.isFeatured = filters.isFeatured;
      if (filters.isNewArrival) params.isNewArrival = filters.isNewArrival;
      if (filters.isBestseller) params.isBestseller = filters.isBestseller;

      const res = await getProducts(params);
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
      setPage(pg);
    } catch (err) {
      console.error('fetchProducts failed:', err);
      setProducts([]);
      setErrorMsg(
        err.response
          ? `Server responded with an error (${err.response.status}).`
          : 'Could not reach the server. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounce the search box specifically: fetching on every keystroke is
  // wasteful and can make typing feel janky. Other filters still apply
  // immediately since they're discrete clicks, not continuous typing.
  useEffect(() => {
    const handle = setTimeout(() => { fetchProducts(1); }, filters.search ? 350 : 0);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const clearFilters = () => setFilters(defaultFilters);
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

  const filterPanelProps = { filters, setFilters, categories, expandedCats, setExpandedCats, activeFilterCount, clearFilters };

  return (
    <div className="min-h-screen pt-16 sm:pt-20" style={{ background: C.canvas, fontFamily: F_BODY }}>
      <div className="max-w-7xl mx-auto container-px py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-2xl sm:text-3xl">
              {filters.category ? categories.find(c => c.slug === filters.category)?.name || 'Shop' : 'All products'}
            </h1>
            <p className="text-sm mt-1" style={{ color: C.inkFaint }}>
              {loading ? 'Loading…' : `${total} ${total === 1 ? 'gift' : 'gifts'} found`}
            </p>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors"
            style={{
              border: `1.5px solid ${activeFilterCount > 0 ? C.coral : C.line}`,
              color: activeFilterCount > 0 ? C.coral : C.inkSoft,
              background: activeFilterCount > 0 ? `${C.coral}0F` : '#fff',
            }}
          >
            <FiFilter className="text-sm" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          <select
            value={filters.sort}
            onChange={e => setFilters(p => ({ ...p, sort: e.target.value }))}
            className="rounded-full max-w-[180px] sm:max-w-[200px] text-sm py-2.5 px-4 outline-none"
            style={{ background: '#fff', border: `1.5px solid ${C.line}`, color: C.ink, fontFamily: F_BODY }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="rounded-2xl p-5 sticky top-24" style={{ background: '#fff', boxShadow: '0 8px 20px -12px rgba(42,27,61,0.18)' }}>
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {errorMsg && (
              <div className="flex items-start gap-3 rounded-xl p-4 mb-6" style={{ background: `${C.coral}0F`, border: `1px solid ${C.coral}33` }}>
                <FiAlertCircle style={{ color: C.coral }} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.ink }}>Couldn't load products</p>
                  <p className="text-sm mt-0.5" style={{ color: C.inkSoft }}>{errorMsg}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i}>
                    <div className="aspect-square rounded-xl animate-pulse" style={{ background: C.canvasDeep }} />
                    <div className="h-3.5 mt-3 w-3/4 rounded animate-pulse" style={{ background: C.canvasDeep }} />
                    <div className="h-3.5 mt-2 w-1/2 rounded animate-pulse" style={{ background: C.canvasDeep }} />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 sm:py-24">
                <h3 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-xl mb-2">No gifts found</h3>
                <p style={{ color: C.inkSoft }} className="mb-6">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
                  style={{ border: `1.5px solid ${C.line}`, color: C.ink }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 sm:mt-12 flex-wrap">
                    {Array.from({ length: pages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => fetchProducts(i + 1)}
                        className="w-9 h-9 rounded-full text-sm font-semibold transition-colors"
                        style={{
                          background: page === i + 1 ? C.coral : '#fff',
                          color: page === i + 1 ? '#fff' : C.inkSoft,
                          border: page === i + 1 ? 'none' : `1.5px solid ${C.line}`,
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / shared filter drawer — rendered last, at the highest
          z-index in the app (z-[60]) so it always sits ABOVE the sticky
          navbar (z-50). Previously this was z-40, which put it visually
          underneath the header — the bug where opening filters looked
          like it "broke" the page. */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0" style={{ background: 'rgba(42,27,61,0.4)' }} onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm p-5 overflow-y-auto shadow-2xl"
            style={{ background: C.canvas, borderLeft: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setSidebarOpen(false)} aria-label="Close filters"
                className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
                <FiX style={{ color: C.inkSoft }} className="text-lg" />
              </button>
            </div>
            <FilterPanel {...filterPanelProps} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="relative w-full mt-6 py-3.5 text-sm font-semibold text-white flex items-center justify-center"
              style={{ background: C.coral, borderRadius: 14 }}
            >
              Show {total} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}