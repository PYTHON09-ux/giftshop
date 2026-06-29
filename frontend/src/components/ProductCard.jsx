import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShare2, FiStar } from 'react-icons/fi';
import { likeProduct, shareProduct } from '../utils/api';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500&h=500&fit=crop';

export default function ProductCard({ product }) {
  const [likes, setLikes] = useState(product.likes || 0);
  const [liked, setLiked] = useState(false);

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const handleLike = async (e) => {
    e.preventDefault();
    if (liked) return;
    try {
      await likeProduct(product._id);
      setLikes(l => l + 1);
      setLiked(true);
    } catch { toast.error('Could not save'); }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/product/${product._id}`;
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
      await shareProduct(product._id);
    } catch { /* user cancelled share — ignore */ }
  };

  const imgUrl = product.images?.[0]?.url || PLACEHOLDER;

  return (
    <Link to={`/product/${product._id}`} className="product-card group block">
      {/* Image */}
      <div className="relative aspect-square bg-cream-dark overflow-hidden">
        <img src={imgUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.isNewArrival && <span className="pill bg-ink text-cream">New</span>}
          {product.isBestseller && <span className="pill bg-rust text-cream">Bestseller</span>}
          {discount > 0 && <span className="pill bg-forest text-cream">{discount}% off</span>}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
            <span className="bg-white text-ink text-xs font-semibold px-3 py-1.5 rounded-full">Out of stock</span>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-2.5 right-2.5">
            <span className="pill bg-white text-rust border border-rust/30">{product.stock} left</span>
          </div>
        )}

        {/* Actions */}
        <div className="absolute bottom-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleShare}
            aria-label="Share"
            className="w-8 h-8 rounded-full bg-white/95 shadow-sm flex items-center justify-center text-ink/70 hover:text-ink transition-colors"
          >
            <FiShare2 className="text-sm" />
          </button>
          <button
            onClick={handleLike}
            aria-label="Save"
            className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-colors ${liked ? 'bg-rust text-cream' : 'bg-white/95 text-ink/70 hover:text-rust'}`}
          >
            <FiHeart className="text-sm" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5 sm:p-4">
        <p className="text-stone text-[11px] uppercase tracking-wide mb-1 truncate">
          {product.subCategory?.replace(/-/g, ' ')}
        </p>
        <h3 className="font-display font-medium text-ink text-sm sm:text-base leading-snug line-clamp-2 mb-2">
          {product.name}
        </h3>

        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <FiStar className="text-rust text-xs fill-current" />
            <span className="text-stone-dark text-xs">{product.ratings?.toFixed(1)} ({product.numReviews})</span>
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="font-display font-semibold text-ink text-base sm:text-lg">₹{product.price.toLocaleString('en-IN')}</span>
          {product.comparePrice > 0 && (
            <span className="text-stone text-sm line-through">₹{product.comparePrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        {likes > 0 && (
          <p className="text-stone text-xs mt-1.5">{likes} {likes === 1 ? 'person' : 'people'} saved this</p>
        )}
      </div>
    </Link>
  );
}
