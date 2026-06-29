import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { createProduct, updateProduct, getProduct, getCategories, uploadImages, deleteImage } from '../../utils/api';
import { FiTrash2, FiUploadCloud, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

// These live OUTSIDE the component on purpose: defining them inside causes
// React to treat them as new component types on every render, which remounts
// every input and drops keyboard focus after each keystroke.
const Section = ({ title, children }) => (
  <div className="card p-5 sm:p-6">
    <h2 className="font-display font-medium text-ink mb-5 pb-3 border-b border-ink/10">{title}</h2>
    {children}
  </div>
);

const Label = ({ children }) => <label className="label">{children}</label>;

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'New baby', "Valentine's", 'Diwali', 'Christmas', 'Graduation', 'Housewarming', 'Just because'];
const GIFT_FOR = ['Her', 'Him', 'Kids', 'Parents', 'Friends', 'Couples', 'Boss', 'Teacher', 'Pet lover'];

const emptyForm = {
  name: '', description: '', price: '', comparePrice: '', category: '', subCategory: '',
  stock: '', lowStockThreshold: 5, sku: '', isActive: true, isFeatured: false,
  isNewArrival: false, isBestseller: false, customizable: false,
  customizationOptions: '', tags: '', occasion: [], giftFor: [],
  images: [], weight: '', dimensions: { length: '', width: '', height: '' },
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.categories || [])).catch(console.error);
    if (isEdit) {
      getProduct(id).then(r => {
        const p = r.data.product;
        setForm({
          ...emptyForm, ...p,
          tags: p.tags?.join(', ') || '',
          customizationOptions: p.customizationOptions?.join(', ') || '',
          dimensions: p.dimensions || { length: '', width: '', height: '' },
        });
      }).catch(() => toast.error('Could not load product'));
    }
  }, [id]);

  useEffect(() => {
    const cat = categories.find(c => c.slug === form.category);
    setSubCats(cat?.subCategories || []);
  }, [form.category, categories]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const toggleArr = (key, val) => setForm(p => ({
    ...p, [key]: p[key].includes(val) ? p[key].filter(v => v !== val) : [...p[key], val],
  }));

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('images', f));
      fd.append('folder', 'giftshop/products');
      const res = await uploadImages(fd);
      setForm(p => ({ ...p, images: [...p.images, ...res.data.images] }));
      toast.success(`${res.data.images.length} image(s) uploaded`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const removeImage = async (idx) => {
    const img = form.images[idx];
    if (img.publicId) { try { await deleteImage(img.publicId); } catch {} }
    setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        stock: Number(form.stock),
        lowStockThreshold: Number(form.lowStockThreshold),
        weight: form.weight ? Number(form.weight) : undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        customizationOptions: form.customizationOptions ? form.customizationOptions.split(',').map(t => t.trim()).filter(Boolean) : [],
        dimensions: {
          length: Number(form.dimensions.length) || 0,
          width: Number(form.dimensions.width) || 0,
          height: Number(form.dimensions.height) || 0,
        },
      };
      if (isEdit) { await updateProduct(id, data); toast.success('Product updated'); }
      else { await createProduct(data); toast.success('Product created'); }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit product' : 'New product'}>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 max-w-4xl">
        <button type="button" onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-stone-dark hover:text-ink text-sm transition-colors mb-1">
          <FiArrowLeft className="text-sm" /> Back to products
        </button>

        <Section title="Basic information">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Product name *</Label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" placeholder="e.g. Personalised photo mug" required />
            </div>
            <div className="sm:col-span-2">
              <Label>Description *</Label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} className="input-field resize-none" placeholder="Describe the product" required />
            </div>
            <div>
              <Label>SKU</Label>
              <input value={form.sku} onChange={e => set('sku', e.target.value)} className="input-field" placeholder="e.g. MUG-001" />
            </div>
            <div>
              <Label>Weight (grams)</Label>
              <input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} className="input-field" placeholder="200" />
            </div>
          </div>
        </Section>

        <Section title="Pricing & stock">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label>Price (₹) *</Label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="input-field" placeholder="499" required min="0" />
            </div>
            <div>
              <Label>Compare price (₹)</Label>
              <input type="number" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)} className="input-field" placeholder="799" min="0" />
            </div>
            <div>
              <Label>Stock *</Label>
              <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className="input-field" placeholder="50" required min="0" />
            </div>
            <div>
              <Label>Low stock alert</Label>
              <input type="number" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} className="input-field" min="1" />
            </div>
          </div>
        </Section>

        <Section title="Category">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <select value={form.category} onChange={e => { set('category', e.target.value); set('subCategory', ''); }} className="input-field" required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Sub-category *</Label>
              <select value={form.subCategory} onChange={e => set('subCategory', e.target.value)} className="input-field" required>
                <option value="">Select sub-category</option>
                {subCats.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Tags (comma separated)</Label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)} className="input-field" placeholder="handmade, birthday, gift-set" />
            </div>
          </div>
        </Section>

        <Section title="Images">
          <div className="space-y-4">
            <label className={`flex flex-col items-center gap-2.5 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploading ? 'border-rust/40 bg-rust-50' : 'border-ink/15 hover:border-rust/30 hover:bg-ink/[0.02]'}`}>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
              <FiUploadCloud className={`text-2xl ${uploading ? 'text-rust' : 'text-stone'}`} />
              <span className="text-stone-dark text-sm">{uploading ? 'Uploading…' : 'Click to upload images'}</span>
            </label>
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-md overflow-hidden group">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-1 left-1 text-[10px] bg-ink text-cream px-1.5 py-0.5 rounded font-medium">Main</span>}
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-rust/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FiTrash2 className="text-cream text-lg" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        <Section title="Occasion & gift for">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label>Occasions</Label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map(o => (
                  <button type="button" key={o} onClick={() => toggleArr('occasion', o)}
                    className={`pill border transition-colors ${form.occasion.includes(o) ? 'bg-ink text-cream border-ink' : 'bg-transparent text-ink/60 border-ink/15 hover:border-ink/30'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Gift for</Label>
              <div className="flex flex-wrap gap-2">
                {GIFT_FOR.map(g => (
                  <button type="button" key={g} onClick={() => toggleArr('giftFor', g)}
                    className={`pill border transition-colors ${form.giftFor.includes(g) ? 'bg-rust text-cream border-rust' : 'bg-transparent text-ink/60 border-ink/15 hover:border-rust/30'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Flags & customisation">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ['isActive', 'Active'],
              ['isFeatured', 'Featured'],
              ['isNewArrival', 'New arrival'],
              ['isBestseller', 'Bestseller'],
              ['customizable', 'Customisable'],
            ].map(([k, l]) => (
              <label key={k} className={`flex items-center gap-3 p-3.5 rounded-md border cursor-pointer transition-colors ${form[k] ? 'border-rust/40 bg-rust-50' : 'border-ink/10 hover:border-ink/20'}`}>
                <input type="checkbox" checked={!!form[k]} onChange={ev => set(k, ev.target.checked)} className="accent-rust w-4 h-4" />
                <span className="text-ink/80 text-sm">{l}</span>
              </label>
            ))}
          </div>
          {form.customizable && (
            <div className="mt-4">
              <Label>Customisation options (comma separated)</Label>
              <input value={form.customizationOptions} onChange={e => set('customizationOptions', e.target.value)} className="input-field" placeholder="Name, Date, Photo, Message" />
            </div>
          )}
        </Section>

        <div className="flex items-center gap-3 pb-8">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Update product' : 'Create product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline">Cancel</button>
        </div>
      </form>
    </AdminLayout>
  );
}
