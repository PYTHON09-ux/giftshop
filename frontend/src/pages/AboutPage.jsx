import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream pt-16 sm:pt-20 pb-16 sm:pb-20">
      <div className="max-w-3xl mx-auto container-px py-16 sm:py-24 text-center">
        <span className="section-label">Our story</span>
        <h1 className="font-display font-medium text-3xl sm:text-4xl text-ink mt-3 mb-6">About Custom Corner</h1>
        <p className="text-stone-dark text-base sm:text-lg leading-relaxed mb-5">
          We believe the right gift can shift the tone of an entire day. Every product in our shop is chosen or made with that in mind — considered, well-made, and personal where it counts.
        </p>
        <p className="text-stone-dark leading-relaxed mb-12">
          We specialise in personalised pieces that go beyond the ordinary gift-shop shelf, built for the people who notice the details.
        </p>
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {[['500+', 'Products'], ['10k+', 'Customers'], ['4.9', 'Avg. rating']].map(([n, l]) => (
            <div key={l} className="card p-5 sm:p-6">
              <p className="font-display font-semibold text-2xl sm:text-3xl text-ink mb-1">{n}</p>
              <p className="text-stone text-xs sm:text-sm">{l}</p>
            </div>
          ))}
        </div>
        <Link to="/shop" className="btn-accent">Start shopping</Link>
      </div>
    </div>
  );
}
