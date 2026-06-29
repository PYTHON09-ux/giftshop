import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getCategories, createCategory, updateCategory, deleteCategory, seedCategories } from '../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiX, FiCheck, FiFolder } from 'react-icons/fi';
import toast from 'react-hot-toast';

const defaultForm = { name: '', slug: '', color: '#B5582C', description: '', subCategories: [] };

const slugify = (s) => s
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/[\s-]+/g, '-')
  .replace(/^-+|-+$/g, '');

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try { const r = await getCategories(); setCategories(r.data.categories || []); }
    catch { toast.error('Could not load categories'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSeed = async () => {
    try { await seedCategories(); toast.success('Default categories seeded'); fetchData(); }
    catch { toast.error('Seed failed'); }
  };

  const handleEdit = (cat) => { setEditingId(cat._id); setForm({ ...cat, subCategories: cat.subCategories || [] }); setShowForm(true); };
  const handleNew = () => { setEditingId(null); setForm(defaultForm); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name) return toast.error('Name required');
    const slug = form.slug || slugify(form.name);
    const subCategories = form.subCategories.map(sub => ({
      ...sub,
      slug: sub.slug || slugify(sub.name || ''),
    }));
    if (subCategories.some(sub => !sub.name || !sub.slug)) {
      return toast.error('Every sub-category needs a name');
    }
    try {
      if (editingId) { await updateCategory(editingId, { ...form, slug, subCategories }); toast.success('Updated'); }
      else { await createCategory({ ...form, slug, subCategories }); toast.success('Category created'); }
      setShowForm(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await deleteCategory(id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const addSubCat = () => setForm(p => ({ ...p, subCategories: [...p.subCategories, { name: '', slug: '' }] }));
  const updateSubCat = (i, key, val) => setForm(p => {
    const subs = [...p.subCategories];
    subs[i] = { ...subs[i], [key]: val };
    // Keep slug in sync with name unless the admin has manually overridden it.
    if (key === 'name') subs[i].slug = slugify(val);
    return { ...p, subCategories: subs };
  });
  const removeSubCat = (i) => setForm(p => ({ ...p, subCategories: p.subCategories.filter((_, j) => j !== i) }));

  return (
    <AdminLayout title="Categories">
      <div className="space-y-5 sm:space-y-6 max-w-4xl">
        <div className="flex flex-wrap gap-2.5">
          <button onClick={handleNew} className="btn-primary text-sm py-2.5"><FiPlus className="text-sm" /> New category</button>
          <button onClick={handleSeed} className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-forest/30 text-forest text-sm font-medium hover:bg-forest/5 transition-colors">
            Seed default categories
          </button>
        </div>

        {showForm && (
          <div className="card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-medium text-ink">{editingId ? 'Edit' : 'New'} category</h2>
              <button onClick={() => setShowForm(false)} aria-label="Close"><FiX className="text-stone hover:text-ink" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))}
                  className="input-field" placeholder="Category name" />
              </div>
              <div>
                <label className="label">Slug</label>
                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className="input-field" placeholder="category-slug" />
              </div>
              <div>
                <label className="label">Accent colour</label>
                <div className="flex gap-2">
                  <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="w-10 h-10 rounded-md border border-ink/15 bg-transparent cursor-pointer" />
                  <input value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="input-field flex-1" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field" placeholder="Short description" />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-ink/70 text-sm font-medium">Sub-categories</h3>
                <button type="button" onClick={addSubCat} className="flex items-center gap-1 text-rust text-sm font-medium hover:underline">
                  <FiPlus className="text-xs" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {form.subCategories.map((sub, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={sub.name} onChange={e => updateSubCat(i, 'name', e.target.value)} className="input-field flex-1" placeholder="Sub-category name" />
                    <button type="button" onClick={() => removeSubCat(i)} className="text-rust/60 hover:text-rust shrink-0 p-2"><FiX className="text-sm" /></button>
                  </div>
                ))}
                {form.subCategories.length === 0 && <p className="text-stone text-sm">No sub-categories yet</p>}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} className="btn-primary text-sm py-2.5"><FiCheck className="text-sm" /> {editingId ? 'Update' : 'Create'}</button>
              <button onClick={() => setShowForm(false)} className="btn-outline text-sm py-2.5">Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-lg" />)}</div>
        ) : categories.length === 0 ? (
          <div className="card p-12 text-center">
            <FiFolder className="text-stone-light text-4xl mx-auto mb-3" />
            <p className="text-stone-dark mb-4">No categories yet</p>
            <button onClick={handleSeed} className="btn-primary text-sm">Seed default categories</button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {categories.map(cat => (
              <div key={cat._id} className="card overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-md flex items-center justify-center text-sm font-display font-semibold shrink-0" style={{ background: `${cat.color}1A`, color: cat.color }}>
                      {cat.name?.[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-ink font-medium truncate">{cat.name}</p>
                      <p className="text-stone text-xs">{cat.subCategories?.length || 0} sub-categories</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {cat.subCategories?.length > 0 && (
                      <button onClick={() => setExpanded(p => ({ ...p, [cat._id]: !p[cat._id] }))} className="p-2 text-stone hover:text-ink">
                        {expanded[cat._id] ? <FiChevronUp className="text-sm" /> : <FiChevronDown className="text-sm" />}
                      </button>
                    )}
                    <button onClick={() => handleEdit(cat)} className="w-8 h-8 rounded-md bg-ink/[0.05] hover:bg-ink/[0.08] flex items-center justify-center text-ink/70">
                      <FiEdit2 className="text-sm" />
                    </button>
                    <button onClick={() => handleDelete(cat._id)} className="w-8 h-8 rounded-md bg-rust-50 hover:bg-rust/15 flex items-center justify-center text-rust">
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
                {expanded[cat._id] && cat.subCategories?.length > 0 && (
                  <div className="px-4 pb-4 border-t border-ink/[0.06]">
                    <div className="flex flex-wrap gap-2 mt-3">
                      {cat.subCategories.map(sub => (
                        <span key={sub.slug} className="tag-chip">{sub.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
