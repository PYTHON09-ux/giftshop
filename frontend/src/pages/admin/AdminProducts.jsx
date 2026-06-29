import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { getProducts, deleteProduct, updateStock } from '../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiAlertTriangle, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Declared outside the component for the same reason as ShopPage's
// FilterPanel: an inline component closing over state gets recreated on
// every render, which would remount this <input> and could jump the
// cursor / drop focus while editing stock.
function StockControl({ p, editingStock, setEditingStock, stockVal, setStockVal, onSave }) {
  if (editingStock === p._id) {
    return (
      <div className="flex items-center gap-1.5">
        <input type="number" value={stockVal} onChange={e => setStockVal(e.target.value)} className="w-16 input-field text-xs py-1 px-2" autoFocus />
        <button onClick={() => onSave(p._id)} className="text-forest text-xs font-medium hover:underline">Save</button>
        <button onClick={() => setEditingStock(null)} className="text-stone text-xs hover:underline">Cancel</button>
      </div>
    );
  }
  return (
    <button onClick={() => { setEditingStock(p._id); setStockVal(p.stock); }}
      className={`flex items-center gap-1.5 text-sm font-medium hover:underline ${p.stock === 0 ? 'text-rust' : p.stock <= 5 ? 'text-rust' : 'text-forest'}`}>
      {p.stock === 0 && <FiAlertTriangle className="text-xs" />}
      {p.stock} in stock
    </button>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingStock, setEditingStock] = useState(null);
  const [stockVal, setStockVal] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 15, isActive: 'all' };
      if (search) params.search = search;
      const res = await getProducts(params);
      let prods = res.data.products || [];
      if (filter === 'lowStock') prods = prods.filter(p => p.stock > 0 && p.stock <= 5);
      if (filter === 'outOfStock') prods = prods.filter(p => p.stock === 0);
      if (filter === 'featured') prods = prods.filter(p => p.isFeatured);
      if (filter === 'inactive') prods = prods.filter(p => !p.isActive);
      setProducts(prods);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
      setPage(pg);
    } catch (err) {
      console.error('AdminProducts fetch error:', err);
      toast.error('Could not load products');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const handle = setTimeout(() => { fetchProducts(1); }, search ? 350 : 0);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setDeletingId(id);
    try { await deleteProduct(id); toast.success('Product deleted'); fetchProducts(page); }
    catch { toast.error('Delete failed'); }
    finally { setDeletingId(null); }
  };

  const handleStockSave = async (id) => {
    try { await updateStock(id, Number(stockVal)); toast.success('Stock updated'); setEditingStock(null); fetchProducts(page); }
    catch { toast.error('Update failed'); }
  };

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'lowStock', label: 'Low stock' },
    { key: 'outOfStock', label: 'Out of stock' },
    { key: 'featured', label: 'Featured' },
    { key: 'inactive', label: 'Inactive' },
  ];

  const stockControlProps = { editingStock, setEditingStock, stockVal, setStockVal, onSave: handleStockSave };

  return (
    <AdminLayout title="Products">
      <div className="space-y-5 sm:space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products" className="input-field pl-9 text-sm" />
          </div>
          <Link to="/admin/products/new" className="btn-primary text-sm py-2.5 shrink-0">
            <FiPlus className="text-sm" /> Add product
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filterTabs.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`shrink-0 text-sm px-3.5 py-1.5 rounded-full border transition-colors ${filter === t.key ? 'bg-ink text-cream border-ink' : 'border-ink/15 text-ink/60 hover:border-ink/30'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-lg" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="card p-12 text-center">
            <FiPackage className="text-stone-light text-4xl mx-auto mb-3" />
            <p className="text-stone-dark mb-3">No products found</p>
            <Link to="/admin/products/new" className="text-rust text-sm font-medium hover:underline">Add your first product</Link>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="sm:hidden space-y-3">
              {products.map(p => (
                <div key={p._id} className="card p-3.5">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-cream-dark shrink-0">
                      {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ink font-medium text-sm line-clamp-1">{p.name}</p>
                      <p className="text-stone text-xs capitalize mt-0.5">{p.category?.replace(/-/g, ' ')}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-ink font-semibold text-sm">₹{p.price?.toLocaleString('en-IN')}</span>
                        <span className={`pill ${p.isActive ? 'bg-forest/10 text-forest' : 'bg-ink/[0.05] text-stone'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink/[0.06]">
                    <StockControl p={p} {...stockControlProps} />
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/products/edit/${p._id}`} className="w-8 h-8 rounded-md bg-ink/[0.05] flex items-center justify-center text-ink/70">
                        <FiEdit2 className="text-sm" />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id} className="w-8 h-8 rounded-md bg-rust-50 flex items-center justify-center text-rust disabled:opacity-50">
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink/10">
                      <th className="text-left text-stone font-medium text-xs uppercase tracking-wide px-4 py-3">Product</th>
                      <th className="text-left text-stone font-medium text-xs uppercase tracking-wide px-4 py-3">Category</th>
                      <th className="text-left text-stone font-medium text-xs uppercase tracking-wide px-4 py-3">Price</th>
                      <th className="text-left text-stone font-medium text-xs uppercase tracking-wide px-4 py-3">Stock</th>
                      <th className="text-left text-stone font-medium text-xs uppercase tracking-wide px-4 py-3">Status</th>
                      <th className="text-right text-stone font-medium text-xs uppercase tracking-wide px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id} className="border-b border-ink/[0.06] hover:bg-ink/[0.015] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-cream-dark shrink-0">
                              {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div>
                              <p className="text-ink font-medium line-clamp-1">{p.name}</p>
                              <div className="flex gap-1.5 mt-0.5">
                                {p.isNewArrival && <span className="pill bg-ink/[0.06] text-ink/60 text-[10px]">New</span>}
                                {p.isBestseller && <span className="pill bg-rust-50 text-rust text-[10px]">Bestseller</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-ink/70 capitalize">{p.category?.replace(/-/g, ' ')}</p>
                          <p className="text-stone text-xs capitalize">{p.subCategory?.replace(/-/g, ' ')}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-ink font-medium">₹{p.price?.toLocaleString('en-IN')}</p>
                          {p.comparePrice > 0 && <p className="text-stone text-xs line-through">₹{p.comparePrice?.toLocaleString('en-IN')}</p>}
                        </td>
                        <td className="px-4 py-3"><StockControl p={p} {...stockControlProps} /></td>
                        <td className="px-4 py-3">
                          <span className={`pill ${p.isActive ? 'bg-forest/10 text-forest' : 'bg-ink/[0.05] text-stone'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/products/edit/${p._id}`} className="w-8 h-8 rounded-md bg-ink/[0.05] hover:bg-ink/[0.08] flex items-center justify-center text-ink/70 transition-colors">
                              <FiEdit2 className="text-sm" />
                            </Link>
                            <button onClick={() => handleDelete(p._id)} disabled={deletingId === p._id}
                              className="w-8 h-8 rounded-md bg-rust-50 hover:bg-rust/15 flex items-center justify-center text-rust transition-colors disabled:opacity-50">
                              <FiTrash2 className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-ink/10">
                  <p className="text-stone text-xs">{total} total products</p>
                  <div className="flex gap-1.5">
                    {Array.from({ length: pages }).map((_, i) => (
                      <button key={i} onClick={() => fetchProducts(i + 1)}
                        className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${page === i + 1 ? 'bg-ink text-cream' : 'bg-ink/[0.04] text-ink/60 hover:bg-ink/[0.08]'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile pagination */}
            {pages > 1 && (
              <div className="sm:hidden flex items-center justify-center gap-1.5">
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} onClick={() => fetchProducts(i + 1)}
                    className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${page === i + 1 ? 'bg-ink text-cream' : 'bg-ink/[0.04] text-ink/60'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
