import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, likeProduct, shareProduct, addReview } from '../utils/api';
import { FiHeart, FiShare2, FiStar, FiArrowLeft, FiChevronLeft, FiChevronRight, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [review, setReview] = useState({ user: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getProduct(id)
      .then(r => { setProduct(r.data.product); setLikes(r.data.product.likes || 0); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-screen pt-20 flex items-center justify-center text-center container-px">
      <div>
        <h2 className="font-display font-medium text-2xl text-ink mb-4">Product not found</h2>
        <Link to="/shop" className="btn-primary">Back to shop</Link>
      </div>
    </div>
  );

  const images = product.images?.length ? product.images : [{ url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=700&h=700&fit=crop' }];
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleLike = async () => {
    if (liked) return;
    try {
      await likeProduct(id);
      setLikes(l => l + 1);
      setLiked(true);
      toast.success('Saved to favourites');
    } catch { toast.error('Could not save'); }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) await navigator.share({ title: product.name, url });
      else { await navigator.clipboard.writeText(url); toast.success('Link copied'); }
      await shareProduct(id);
    } catch { /* cancelled */ }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!review.user || !review.comment) return toast.error('Add your name and a comment');
    setSubmitting(true);
    try {
      const res = await addReview(id, review);
      setProduct(res.data.product);
      setReview({ user: '', rating: 5, comment: '' });
      toast.success('Review added');
    } catch { toast.error('Could not add review'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-cream pt-16 sm:pt-20 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto container-px py-6 sm:py-10">
        <Link to="/shop" className="inline-flex items-center gap-2 text-stone-dark hover:text-ink text-sm mb-6 sm:mb-8 transition-colors">
          <FiArrowLeft className="text-sm" /> Back to shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-white border border-ink/[0.06] rounded-lg overflow-hidden mb-3">
              <img src={images[imgIdx].url} alt={product.name} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center text-ink shadow-sm">
                    <FiChevronLeft />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)} aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center text-ink shadow-sm">
                    <FiChevronRight />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-rust' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.isNewArrival && <span className="pill bg-ink text-cream">New</span>}
              {product.isBestseller && <span className="pill bg-rust text-cream">Bestseller</span>}
              {product.customizable && <span className="pill bg-forest text-cream">Customisable</span>}
            </div>

            <h1 className="font-display font-medium text-2xl sm:text-3xl lg:text-4xl text-ink mb-3">{product.name}</h1>

            {product.numReviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <FiStar key={s} className={`text-sm ${s <= Math.round(product.ratings) ? 'text-rust fill-current' : 'text-ink/15'}`} />)}
                </div>
                <span className="text-stone-dark text-sm">{product.ratings?.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display font-semibold text-3xl text-ink">₹{product.price.toLocaleString('en-IN')}</span>
              {product.comparePrice > 0 && (
                <>
                  <span className="text-stone text-lg line-through">₹{product.comparePrice.toLocaleString('en-IN')}</span>
                  <span className="pill bg-forest text-cream">{discount}% off</span>
                </>
              )}
            </div>

            <p className="text-stone-dark leading-relaxed mb-6">{product.description}</p>

            <div className="mb-6">
              {product.stock === 0 ? (
                <span className="text-rust font-medium text-sm">Out of stock</span>
              ) : product.stock <= 5 ? (
                <span className="text-rust font-medium text-sm">Only {product.stock} left in stock</span>
              ) : (
                <span className="text-forest font-medium text-sm">In stock — {product.stock} available</span>
              )}
            </div>

            {product.customizable && product.customizationOptions?.length > 0 && (
              <div className="mb-6">
                <p className="label">Customisation options</p>
                <div className="flex flex-wrap gap-2">
                  {product.customizationOptions.map(o => <span key={o} className="tag-chip">{o}</span>)}
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-6">
              <button onClick={handleLike}
                className={`flex items-center gap-2 px-5 py-3 rounded-md border text-sm font-medium transition-colors ${liked ? 'bg-rust border-rust text-cream' : 'border-ink/15 text-ink/70 hover:border-rust hover:text-rust'}`}>
                <FiHeart className="text-sm" /> {likes > 0 ? likes : 'Save'}
              </button>
              <button onClick={handleShare}
                className="flex items-center gap-2 px-5 py-3 rounded-md border border-ink/15 text-ink/70 text-sm font-medium hover:border-ink hover:text-ink transition-colors">
                <FiShare2 className="text-sm" /> Share
              </button>
            </div>

            <div className="card p-4 mb-6 flex items-center gap-2.5">
              <FiShield className="text-forest shrink-0" />
              <p className="text-sm text-stone-dark">Secure checkout · Easy returns · Carefully packaged</p>
            </div>

            <div className="text-sm text-stone-dark space-y-1">
              <p><span className="text-stone">Category:</span> {product.category?.replace(/-/g, ' ')} → {product.subCategory?.replace(/-/g, ' ')}</p>
            </div>
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {product.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 sm:mt-20 grid lg:grid-cols-2 gap-10 lg:gap-14">
          <div>
            <h2 className="font-display font-medium text-xl sm:text-2xl text-ink mb-5 sm:mb-6">
              Reviews {product.numReviews > 0 && `(${product.numReviews})`}
            </h2>
            {product.reviews?.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-stone-dark text-sm">No reviews yet — be the first to leave one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {product.reviews?.map((r, i) => (
                  <div key={i} className="card p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-ink text-sm">{r.user}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => <FiStar key={s} className={`text-xs ${s <= r.rating ? 'text-rust fill-current' : 'text-ink/15'}`} />)}
                      </div>
                    </div>
                    <p className="text-stone-dark text-sm">{r.comment}</p>
                    <p className="text-stone text-xs mt-2">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display font-medium text-xl sm:text-2xl text-ink mb-5 sm:mb-6">Leave a review</h2>
            <form onSubmit={handleReview} className="card p-5 sm:p-6 space-y-4">
              <div>
                <label className="label">Your name</label>
                <input value={review.user} onChange={e => setReview(p => ({ ...p, user: e.target.value }))} placeholder="Jane D." className="input-field" required />
              </div>
              <div>
                <label className="label">Rating</label>
                <div className="flex gap-1.5">
                  {[1,2,3,4,5].map(s => (
                    <button type="button" key={s} onClick={() => setReview(p => ({ ...p, rating: s }))} aria-label={`${s} stars`}>
                      <FiStar className={`text-2xl ${s <= review.rating ? 'text-rust fill-current' : 'text-ink/15'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Comment</label>
                <textarea value={review.comment} onChange={e => setReview(p => ({ ...p, comment: e.target.value }))} rows={4} placeholder="Share your experience" className="input-field resize-none" required />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
