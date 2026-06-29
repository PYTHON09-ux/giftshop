import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiChevronUp, FiAlertCircle } from 'react-icons/fi';

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

// IMPORTANT: this component is declared at module scope, outside ShopPage.
// Defining it inside ShopPage (as a closure) would make React treat it as a
// brand-new component type on every render of ShopPage, which unmounts and
// remounts every input inside it — that's what was causing the search box
// to lose focus after every keystroke. Everything it needs comes in as
// props instead of being captured from outer scope.
function FilterPanel({ filters, setFilters, categories, expandedCats, setExpandedCats, activeFilterCount, clearFilters }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="label">Search</label>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone text-sm" />
          <input
            value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            placeholder="Search gifts"
            className="input-field pl-9"
          />
        </div>
        <p className="text-stone text-xs mt-1.5">Try a partial word — e.g. "mu" finds "Mug"</p>
      </div>

      <div>
        <label className="label">Quick filters</label>
        <div className="flex flex-wrap gap-2">
          {[['isNewArrival', 'New'], ['isFeatured', 'Featured'], ['isBestseller', 'Bestseller']].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilters(p => ({ ...p, [k]: p[k] ? '' : 'true' }))}
              className={`pill border transition-colors ${filters[k] ? 'bg-ink text-cream border-ink' : 'bg-transparent text-ink/60 border-ink/15 hover:border-ink/40'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Category</label>
        <div className="space-y-1">
          <button
            onClick={() => setFilters(p => ({ ...p, category: '', subCategory: '' }))}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${!filters.category ? 'bg-rust/[0.08] text-rust font-medium' : 'text-ink/70 hover:bg-ink/[0.04]'}`}
          >
            All categories
          </button>
          {categories.map(cat => (
            <div key={cat._id}>
              <div className="flex items-center">
                <button
                  onClick={() => setFilters(p => ({ ...p, category: cat.slug, subCategory: '' }))}
                  className={`flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors ${filters.category === cat.slug ? 'bg-rust/[0.08] text-rust font-medium' : 'text-ink/70 hover:bg-ink/[0.04]'}`}
                >
                  {cat.name}
                </button>
                {cat.subCategories?.length > 0 && (
                  <button onClick={() => setExpandedCats(p => ({ ...p, [cat._id]: !p[cat._id] }))} className="p-2 text-stone">
                    {expandedCats[cat._id] ? <FiChevronUp className="text-sm" /> : <FiChevronDown className="text-sm" />}
                  </button>
                )}
              </div>
              {expandedCats[cat._id] && cat.subCategories?.map(sub => (
                <button
                  key={sub.slug}
                  onClick={() => setFilters(p => ({ ...p, category: cat.slug, subCategory: sub.slug }))}
                  className={`block w-full text-left px-6 py-1.5 text-sm rounded-md transition-colors ${filters.subCategory === sub.slug ? 'text-rust font-medium' : 'text-stone-dark hover:text-ink'}`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Price range (₹)</label>
        <div className="flex gap-2">
          <input type="number" inputMode="numeric" value={filters.minPrice} onChange={e => setFilters(p => ({ ...p, minPrice: e.target.value }))} placeholder="Min" className="input-field" />
          <input type="number" inputMode="numeric" value={filters.maxPrice} onChange={e => setFilters(p => ({ ...p, maxPrice: e.target.value }))} placeholder="Max" className="input-field" />
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="w-full text-rust text-sm font-medium flex items-center justify-center gap-1.5 py-2.5 rounded-md border border-rust/25 hover:bg-rust-50 transition-colors">
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
    <div className="min-h-screen bg-cream pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto container-px py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-display font-medium text-2xl sm:text-3xl text-ink">
              {filters.category ? categories.find(c => c.slug === filters.category)?.name || 'Shop' : 'All products'}
            </h1>
            <p className="text-stone text-sm mt-1">{loading ? 'Loading…' : `${total} ${total === 1 ? 'gift' : 'gifts'} found`}</p>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm border transition-colors ${activeFilterCount > 0 ? 'border-rust text-rust bg-rust-50' : 'border-ink/15 text-ink/70'}`}
          >
            <FiFilter className="text-sm" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          <select
            value={filters.sort}
            onChange={e => setFilters(p => ({ ...p, sort: e.target.value }))}
            className="input-field max-w-[180px] sm:max-w-[200px] text-sm py-2.5"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="card p-5 sticky top-24">
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {errorMsg && (
              <div className="flex items-start gap-3 bg-rust-50 border border-rust/20 rounded-md p-4 mb-6">
                <FiAlertCircle className="text-rust shrink-0 mt-0.5" />
                <div>
                  <p className="text-ink text-sm font-medium">Couldn't load products</p>
                  <p className="text-stone-dark text-sm mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i}>
                    <div className="aspect-square skeleton" />
                    <div className="h-3.5 skeleton mt-3 w-3/4" />
                    <div className="h-3.5 skeleton mt-2 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 sm:py-24">
                <h3 className="font-display font-medium text-xl text-ink mb-2">No gifts found</h3>
                <p className="text-stone-dark mb-6">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="btn-outline">Clear filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 sm:mt-12">
                    {Array.from({ length: pages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => fetchProducts(i + 1)}
                        className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${page === i + 1 ? 'bg-ink text-cream' : 'bg-white border border-ink/10 text-ink/60 hover:border-ink/30'}`}
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
          <div className="absolute inset-0 bg-ink/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-cream border-l border-ink/10 p-5 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-medium text-ink text-lg">Filters</h3>
              <button onClick={() => setSidebarOpen(false)} aria-label="Close filters">
                <FiX className="text-ink/60 text-lg" />
              </button>
            </div>
            <FilterPanel {...filterPanelProps} />
            <button onClick={() => setSidebarOpen(false)} className="btn-primary w-full mt-6">
              Show {total} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
