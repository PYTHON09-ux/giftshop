import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { createEvent, updateEvent, getEvent, getProducts, uploadImage } from '../../utils/api';
import { FiArrowLeft, FiUploadCloud, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Defined outside the component — see note in AdminProductForm.jsx
const Section = ({ title, children }) => (
  <div className="card p-5 sm:p-6">
    <h2 className="font-display font-medium text-ink mb-5 pb-3 border-b border-ink/10">{title}</h2>
    {children}
  </div>
);
const Label = ({ children }) => <label className="label">{children}</label>;

const EVENT_TYPES = [
  { value: 'new_arrival', label: 'New arrival' },
  { value: 'sale', label: 'Sale' },
  { value: 'restock', label: 'Restock' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'launch', label: 'Launch' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'custom', label: 'Custom event' },
];

const emptyForm = {
  title: '', description: '', type: 'new_arrival', status: 'scheduled',
  startDate: '', endDate: '', discountPercent: 0, badgeText: 'Coming soon',
  badgeColor: '#B5582C', isPublic: true, notifySubscribers: false,
  tags: '', banner: null, scheduledProductIds: [],
};

export default function AdminEventForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProducts({ limit: 100, isActive: 'all' }).then(r => setProducts(r.data.products || [])).catch(console.error);
    if (isEdit) {
      getEvent(id).then(r => {
        const e = r.data.event;
        setForm({
          ...emptyForm, ...e,
          startDate: e.startDate ? format(new Date(e.startDate), "yyyy-MM-dd'T'HH:mm") : '',
          endDate: e.endDate ? format(new Date(e.endDate), "yyyy-MM-dd'T'HH:mm") : '',
          tags: e.tags?.join(', ') || '',
          scheduledProductIds: e.scheduledProducts?.map(p => p._id || p) || [],
        });
      }).catch(() => toast.error('Could not load event'));
    }
  }, [id]);

  useEffect(() => {
    if (!productSearch) { setFilteredProducts(products.slice(0, 20)); return; }
    setFilteredProducts(products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 20));
  }, [productSearch, products]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const toggleProduct = (pid) => setForm(p => ({
    ...p,
    scheduledProductIds: p.scheduledProductIds.includes(pid) ? p.scheduledProductIds.filter(x => x !== pid) : [...p.scheduledProductIds, pid],
  }));

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('folder', 'giftshop/events');
      const res = await uploadImage(fd);
      set('banner', { url: res.data.url, publicId: res.data.publicId });
      toast.success('Banner uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate) return toast.error('Title and start date are required');
    setSaving(true);
    try {
      const data = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        scheduledProducts: form.scheduledProductIds,
        discountPercent: Number(form.discountPercent),
      };
      if (isEdit) { await updateEvent(id, data); toast.success('Event updated'); }
      else { await createEvent(data); toast.success('Event scheduled'); }
      navigate('/admin/events');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit event' : 'Schedule event'}>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 max-w-3xl">
        <button type="button" onClick={() => navigate('/admin/events')}
          className="flex items-center gap-2 text-stone-dark hover:text-ink text-sm transition-colors mb-1">
          <FiArrowLeft className="text-sm" /> Back to events
        </button>

        <Section title="Event details">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Event title *</Label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="input-field" placeholder="e.g. Summer sale 2025" required />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="input-field resize-none" placeholder="What is this event about?" />
            </div>
            <div>
              <Label>Event type *</Label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="input-field">
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input-field">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            <div>
              <Label>Start date & time *</Label>
              <input type="datetime-local" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="input-field" required />
            </div>
            <div>
              <Label>End date & time</Label>
              <input type="datetime-local" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="input-field" />
            </div>
            <div>
              <Label>Discount %</Label>
              <input type="number" value={form.discountPercent} onChange={e => set('discountPercent', e.target.value)} className="input-field" placeholder="0" min="0" max="100" />
            </div>
            <div>
              <Label>Tags (comma separated)</Label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)} className="input-field" placeholder="sale, summer, gift" />
            </div>
          </div>
        </Section>

        <Section title="Badge & appearance">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Badge text</Label>
              <input value={form.badgeText} onChange={e => set('badgeText', e.target.value)} className="input-field" placeholder="Coming soon" />
            </div>
            <div>
              <Label>Badge colour</Label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.badgeColor} onChange={e => set('badgeColor', e.target.value)} className="w-10 h-10 rounded-md border border-ink/15 bg-transparent cursor-pointer" />
                <input value={form.badgeColor} onChange={e => set('badgeColor', e.target.value)} className="input-field flex-1" />
                <span className="pill shrink-0" style={{ background: form.badgeColor, color: '#FAF6F0' }}>{form.badgeText?.slice(0, 12) || 'Preview'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Label>Event banner</Label>
            {form.banner?.url ? (
              <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-cream-dark max-w-sm">
                <img src={form.banner.url} alt="Banner" className="w-full h-full object-cover" />
                <button type="button" onClick={() => set('banner', null)} className="absolute top-2 right-2 w-7 h-7 bg-rust rounded-full flex items-center justify-center">
                  <FiX className="text-cream text-xs" />
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors max-w-sm ${uploading ? 'border-rust/40' : 'border-ink/15 hover:border-rust/30'}`}>
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={uploading} />
                <FiUploadCloud className={`text-xl ${uploading ? 'text-rust' : 'text-stone'}`} />
                <span className="text-stone text-sm">{uploading ? 'Uploading…' : 'Upload banner image'}</span>
              </label>
            )}
          </div>
        </Section>

        <Section title="Link products">
          <p className="text-stone-dark text-sm mb-4">Optionally link products featured in this event.</p>
          <input value={productSearch} onChange={e => setProductSearch(e.target.value)} className="input-field text-sm mb-3" placeholder="Search products" />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredProducts.map(p => (
              <label key={p._id} className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors ${form.scheduledProductIds.includes(p._id) ? 'bg-rust-50' : 'hover:bg-ink/[0.03]'}`}>
                <input type="checkbox" checked={form.scheduledProductIds.includes(p._id)} onChange={() => toggleProduct(p._id)} className="accent-rust" />
                <div className="w-8 h-8 rounded-md overflow-hidden bg-cream-dark shrink-0">
                  {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                </div>
                <span className="text-ink/80 text-sm flex-1 truncate">{p.name}</span>
                <span className="text-stone-dark text-xs shrink-0">₹{p.price?.toLocaleString('en-IN')}</span>
              </label>
            ))}
            {filteredProducts.length === 0 && <p className="text-stone text-sm py-3">No products found</p>}
          </div>
          {form.scheduledProductIds.length > 0 && <p className="text-rust text-xs mt-2">{form.scheduledProductIds.length} product(s) selected</p>}
        </Section>

        <div className="card p-4 sm:p-5">
          <div className="flex flex-wrap gap-3">
            {[['isPublic', 'Visible to customers'], ['notifySubscribers', 'Notify subscribers']].map(([k, l]) => (
              <label key={k} className={`flex items-center gap-2 px-3.5 py-2.5 rounded-md border cursor-pointer transition-colors ${form[k] ? 'border-rust/40 bg-rust-50 text-rust' : 'border-ink/10 text-ink/60'}`}>
                <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} className="accent-rust" />
                <span className="text-sm">{l}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Update event' : 'Schedule event'}
          </button>
          <button type="button" onClick={() => navigate('/admin/events')} className="btn-outline">Cancel</button>
        </div>
      </form>
    </AdminLayout>
  );
}
