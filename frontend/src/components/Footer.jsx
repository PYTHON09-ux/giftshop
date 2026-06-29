import { Link } from 'react-router-dom';
import { FiGift, FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-white mt-16 sm:mt-24">
      <div className="max-w-7xl mx-auto container-px py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 bg-ink rounded-md flex items-center justify-center">
                <FiGift className="text-cream text-base" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display font-semibold text-ink text-base">Custom Corner</span>
                <span className="text-rust text-[10px] font-semibold uppercase tracking-wider2">Gift Shopie</span>
              </span>
            </div>
            <p className="text-stone-dark text-sm leading-relaxed max-w-xs">
              Thoughtfully chosen and personalised gifts for every occasion — made with care, delivered with intention.
            </p>
            <div className="flex gap-2 mt-6">
              {[FiInstagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full border border-ink/10 hover:border-ink/30 flex items-center justify-center transition-colors">
                  <Icon className="text-ink/60 text-sm" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-ink text-sm mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {['All products', 'New arrivals', 'Bestsellers', 'Personalised', 'Events'].map(l => (
                <li key={l}><Link to="/shop" className="text-stone-dark hover:text-ink text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-ink text-sm mb-4">Information</h4>
            <ul className="space-y-2.5">
              {['About us', 'Contact'].map(l => (
                <li key={l}><a href="#" className="text-stone-dark hover:text-ink text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-ink/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-stone">
          <p>© 2025 Custom Corner Gift Shopie. All rights reserved.</p>
          <Link to="/admin" className="hover:text-ink transition-colors">Admin panel</Link>
        </div>
      </div>
    </footer>
  );
}
