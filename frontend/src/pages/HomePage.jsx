import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories, getEvents } from '../utils/api';
import ProductCard from '../components/ProductCard';
import {
  FiArrowRight, FiTruck, FiRefreshCw, FiShield,
  FiPlay, FiPause, FiVolume2, FiVolumeX, FiInstagram, FiMaximize,
} from 'react-icons/fi';

/* ─────────────────────────────────────────────
   External libs loaded once via <script> tags
   in index.html:
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
   OR install:  npm i gsap
   ───────────────────────────────────────────── */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'New baby', "Valentine's", 'Diwali', 'Housewarming', 'Just because'];

/* ── Social handles (edit here, used everywhere below) ── */
const WHATSAPP_NUMBER = '919146609265';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like to enquire about a gift!")}`;
const INSTAGRAM_HANDLE = 'custom_corner.1';
const INSTAGRAM_LINK = `https://instagram.com/${INSTAGRAM_HANDLE}`;

/* TODO: swap these placeholders for real assets once ready */
const SHOWCASE_VIDEO_SRC = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const SHOWCASE_VIDEO_POSTER = 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&h=1500&fit=crop';
const INSTAGRAM_PREVIEW_IMAGES = [
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1573883430697-4c3479ba619d?w=400&h=400&fit=crop',
];

/* ── Floating particles canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const COUNT = window.innerWidth < 640 ? 28 : 55;

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.2 + 0.8,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      o: Math.random() * 0.45 + 0.1,
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(181,88,44,${p.o})`;
        ctx.fill();
      });
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(181,88,44,${0.08 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.9 }}
    />
  );
}

/* ── Scroll-reveal hook ── */
function useReveal(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y: options.y ?? 36, scale: options.scale ?? 1 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: options.duration ?? 0.75,
          delay: options.delay ?? 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return ref;
}

/* ── Stagger children reveal ── */
function useStagger(selector = '.stagger-child', stagger = 0.1) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll(selector),
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0,
          duration: 0.65,
          stagger,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return ref;
}

/* ── Animated counter ── */
function Counter({ to, suffix = '' }) {
  const elRef = useRef(null);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: to,
        duration: 1.6,
        ease: 'power2.out',
        snap: { val: 1 },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString() + suffix; },
      });
    });
    return () => ctx.revert();
  }, [to, suffix]);
  return <span ref={elRef}>0{suffix}</span>;
}

/* ── Floating WhatsApp / Instagram FAB ── */
function FloatingFAB() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2.5">
      <div style={{
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.88)',
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.22s ease, transform 0.22s ease',
      }} className="flex flex-col items-end gap-2">
        <a href={INSTAGRAM_LINK}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg hover:brightness-110 transition-all"
          style={{ background: 'linear-gradient(135deg,#f58529,#dd2a7b,#8134af)' }}>
          <FiInstagram size={16} />
          @{INSTAGRAM_HANDLE}
        </a>
        <a href={WHATSAPP_LINK}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 bg-[#25D366] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg hover:brightness-110 transition-all">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.52 5.847L0 24l6.335-1.497A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.373l-.36-.214-3.727.88.94-3.633-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
          WhatsApp us
        </a>
        <a href="tel:+919146609265"
          className="flex items-center gap-2.5 bg-white border border-ink/15 text-ink text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#B5582C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.0 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
          Call us
        </a>
      </div>

      <button onClick={() => setOpen(p => !p)} aria-label="Contact us"
        className="w-14 h-14 rounded-full bg-[#25D366] shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95"
        style={{ transition: 'transform 0.22s ease' }}>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="white"
          style={{ transition: 'transform 0.22s ease', transform: open ? 'rotate(45deg) scale(0.85)' : 'rotate(0deg)' }}>
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></>
            : <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.52 5.847L0 24l6.335-1.497A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.373l-.36-.214-3.727.88.94-3.633-.235-.374A9.818 9.818 0 1112 21.818z"/>
          }
        </svg>
      </button>
    </div>
  );
}

/* ── Gift showcase video (autoplay-in-view, tap to unmute / fullscreen) ── */
function VideoShowcase() {
  const wrapRef = useReveal({ y: 30 });
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setPlaying(true); }
    else { video.pause(); setPlaying(false); }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const goFullscreen = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    video.muted = false;
    setMuted(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div ref={wrapRef} style={{ opacity: 0 }} className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
        <div>
          <span className="section-label">Take a look</span>
          <h2 className="section-heading mt-1 mb-4">From box to "wow"</h2>
          <p className="text-stone-dark text-sm sm:text-base leading-relaxed mb-6 max-w-md">
            Every order is wrapped, packed and finished by hand. Here's a peek at what actually
            shows up on someone's doorstep.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/shop" className="btn-accent group">
              Shop the collection
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-ink/15 text-ink font-medium text-sm px-5 py-3 rounded-md hover:border-rust/50 hover:text-rust transition-all">
              <FiInstagram /> More on Instagram
            </a>
          </div>
        </div>

        <div
          ref={containerRef}
          onClick={togglePlay}
          className="relative rounded-2xl overflow-hidden shadow-card-hover ring-1 ring-ink/10 bg-ink
            aspect-[9/13] sm:aspect-[4/5] lg:aspect-[3/4] max-w-sm mx-auto lg:max-w-none w-full cursor-pointer group"
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={SHOWCASE_VIDEO_SRC}
            poster={SHOWCASE_VIDEO_POSTER}
            muted={muted}
            loop
            playsInline
            preload="metadata"
          />

          {/* gradient for control legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />

          {/* center play/pause */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl
              transition-all duration-300 ${playing ? 'opacity-0 scale-75 group-hover:opacity-100' : 'opacity-100 scale-100'}`}>
              {playing ? <FiPause className="text-ink text-2xl" /> : <FiPlay className="text-ink text-2xl ml-0.5" />}
            </div>
          </div>

          {/* bottom controls */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="pill" style={{ background: 'rgba(0,0,0,0.5)', color: '#FAF6F0' }}>
              Gift unboxing
            </span>
            <div className="flex gap-2">
              <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}
                className="w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/65 transition-colors">
                {muted ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
              </button>
              <button onClick={goFullscreen} aria-label="Fullscreen"
                className="w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/65 transition-colors">
                <FiMaximize size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── WhatsApp + Instagram connect band ── */
function ConnectSection() {
  const ref = useStagger('.stagger-child', 0.12);
  return (
    <section className="bg-cream-dark border-y border-ink/10 py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-9 sm:mb-12">
          <span className="section-label">Stay close</span>
          <h2 className="section-heading mt-1">Chat with us, follow along</h2>
          <p className="text-stone-dark text-sm sm:text-base mt-3 max-w-md mx-auto">
            Fastest replies on WhatsApp. Prettiest updates on Instagram.
          </p>
        </div>

        <div ref={ref} className="grid sm:grid-cols-2 gap-5 sm:gap-6 mb-10">
          {/* WhatsApp card */}
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
            className="stagger-child card-surface p-6 sm:p-8 flex items-center gap-5
              hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#25D366]/12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.52 5.847L0 24l6.335-1.497A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.373l-.36-.214-3.727.88.94-3.633-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-medium text-ink text-lg mb-0.5">Message us on WhatsApp</h3>
              <p className="text-stone-dark text-sm">Get gift ideas, check stock, or place a custom order</p>
            </div>
            <FiArrowRight className="text-stone shrink-0 group-hover:translate-x-1 group-hover:text-[#25D366] transition-all" />
          </a>

          {/* Instagram card */}
          <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer"
            className="stagger-child card-surface p-6 sm:p-8 flex items-center gap-5
              hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(245,133,41,0.14),rgba(221,42,123,0.14),rgba(129,52,175,0.14))' }}>
              <FiInstagram size={24} style={{ color: '#dd2a7b' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-medium text-ink text-lg mb-0.5">@{INSTAGRAM_HANDLE}</h3>
              <p className="text-stone-dark text-sm">Unboxings, new drops, and gifting inspiration</p>
            </div>
            <FiArrowRight className="text-stone shrink-0 group-hover:translate-x-1 group-hover:text-[#dd2a7b] transition-all" />
          </a>
        </div>

        {/* Instagram preview strip */}
        <div className="stagger-child grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {INSTAGRAM_PREVIEW_IMAGES.map((src, i) => (
            <a key={i} href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer"
              className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden group">
              <img src={src} alt="" loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/25 transition-colors duration-300
                flex items-center justify-center">
                <FiInstagram className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={18} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════ */
export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* hero refs */
  const heroTextRef = useRef(null);
  const heroImgRef  = useRef(null);
  const heroStatsRef = useRef(null);

  /* section refs */
  const trustRef      = useStagger('.stagger-child', 0.12);
  const occasionsRef  = useStagger('.stagger-child', 0.06);
  const eventsRef     = useReveal();
  const categoriesRef = useStagger('.stagger-child', 0.07);
  const featuredRef   = useStagger('.stagger-child', 0.06);
  const newRef        = useStagger('.stagger-child', 0.06);
  const ctaRef        = useReveal({ y: 24 });

  useEffect(() => {
    /* hero entrance — runs immediately, no scroll needed */
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(heroTextRef.current,
          { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9 })
        .fromTo(heroStatsRef.current,
          { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
        .fromTo(heroImgRef.current,
          { opacity: 0, scale: 0.96, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 1.0 }, '-=0.7');
    });

    Promise.all([
      getProducts({ isFeatured: 'true', limit: 8 }),
      getProducts({ isNewArrival: 'true', limit: 8 }),
      getCategories(),
      getEvents({ status: 'active' }),
    ])
      .then(([feat, newP, cats, evts]) => {
        setFeaturedProducts(feat.data.products || []);
        setNewProducts(newP.data.products || []);
        setCategories(cats.data.categories || []);
        setEvents(evts.data.events || []);
      })
      .catch(err => { console.error(err); setError(true); })
      .finally(() => setLoading(false));

    return () => ctx.revert();
  }, []);

  /* re-trigger ScrollTrigger when new data arrives */
  useEffect(() => { ScrollTrigger.refresh(); }, [featuredProducts, newProducts, categories]);

  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      <FloatingFAB />

      {/* ══════════ HERO ══════════ */}
      <section className="relative pt-20 sm:pt-28 pb-14 sm:pb-24 bg-ink overflow-hidden min-h-[92svh] sm:min-h-0 flex items-center">
        <ParticleCanvas />

        {/* warm glow orbs */}
        <div className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(181,88,44,0.13) 0%, transparent 68%)' }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(181,88,44,0.07) 0%, transparent 70%)' }} />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* text block */}
          <div ref={heroTextRef} style={{ opacity: 0 }}>
            <span className="section-label tracking-widest text-rust/80 uppercase text-xs font-semibold">
              Custom Corner Gift Shopie
            </span>
            <h1 className="font-display font-medium text-[2.1rem] sm:text-5xl lg:text-6xl leading-[1.1] text-cream mt-4 mb-5">
              Gifts chosen with the same care{' '}
              <em className="not-italic" style={{
                background: 'linear-gradient(90deg, #E07040, #B5582C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>you'd give them yourself.</em>
            </h1>
            <p className="text-cream/60 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              A curated, personalised collection for birthdays, anniversaries, and the moments worth marking properly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/shop" className="btn-accent justify-center text-center group">
                Shop the collection
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-cream/20 text-cream/80 font-medium text-sm px-6 py-3 rounded-md hover:bg-cream/8 hover:border-cream/35 transition-all">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.52 5.847L0 24l6.335-1.497A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.373l-.36-.214-3.727.88.94-3.633-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* stats */}
            <div ref={heroStatsRef} className="flex gap-8 sm:gap-12 mt-10 pt-8 border-t border-cream/10"
              style={{ opacity: 0 }}>
              {[
                [500, '+', 'Products'],
                [10000, '+', 'Happy customers'],
                [null, '4.9★', 'Avg. rating'],
              ].map(([n, sfx, label]) => (
                <div key={label}>
                  <p className="font-display font-semibold text-xl sm:text-2xl text-cream">
                    {n ? <><Counter to={n} />{sfx}</> : sfx}
                  </p>
                  <p className="text-cream/45 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* image grid */}
          <div ref={heroImgRef} style={{ opacity: 0 }} className="hidden lg:grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden aspect-[3/4] mt-10 shadow-2xl ring-1 ring-white/5">
              <img src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500&h=650&fit=crop"
                alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl ring-1 ring-white/5">
              <img src="https://images.unsplash.com/photo-1707944145479-12755f0434d8?q=80&w=880&auto=format&fit=crop"
                alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </div>

          {/* mobile hero image */}
          <div ref={heroImgRef} className="lg:hidden rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10">
            <img src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&h=380&fit=crop"
              alt="" className="w-full h-52 object-cover" />
          </div>
        </div>

        {/* animated scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
          style={{ animation: 'bounce-slow 2.2s ease-in-out infinite' }}>
          <span className="text-cream/30 text-[10px] tracking-widest uppercase">Scroll</span>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <rect x="5" y="0" width="6" height="12" rx="3" stroke="rgba(250,246,240,0.25)" strokeWidth="1.2"/>
            <rect x="7" y="2.5" width="2" height="3.5" rx="1" fill="rgba(181,88,44,0.6)"
              style={{ animation: 'scroll-dot 2.2s ease-in-out infinite' }} />
            <path d="M4 16l4 4 4-4" stroke="rgba(250,246,240,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <style>{`
          @keyframes bounce-slow {
            0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.7; }
            50% { transform: translateX(-50%) translateY(6px); opacity: 1; }
          }
          @keyframes scroll-dot {
            0%, 100% { transform: translateY(0); opacity: 0.8; }
            50% { transform: translateY(4px); opacity: 0.3; }
          }
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
          }
        `}</style>
      </section>

      {/* ══════════ TRUST STRIP ══════════ */}
      <section className="border-b border-ink/10 bg-white">
        <div ref={trustRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 grid grid-cols-3 gap-2 sm:gap-6">
          {[
            [FiTruck, 'Tracked shipping', 'Every order'],
            [FiRefreshCw, 'Easy returns', '7-day window'],
            [FiShield, 'Secure checkout', 'Always protected'],
          ].map(([Icon, title, sub], i) => (
            <div key={i} className="stagger-child flex flex-col sm:flex-row items-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left">
              <div className="w-8 h-8 rounded-full bg-rust/10 flex items-center justify-center shrink-0">
                <Icon className="text-rust text-sm" />
              </div>
              <div>
                <p className="text-ink text-xs sm:text-sm font-semibold leading-tight">{title}</p>
                <p className="text-stone text-xs hidden sm:block">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ OCCASIONS ══════════ */}
      <section className="py-5 sm:py-7 bg-cream-dark border-b border-ink/10">
        <div ref={occasionsRef} className="max-w-7xl mx-auto">
          <div className="flex gap-2.5 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-1
            [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {OCCASIONS.map(o => (
              <Link key={o} to={`/shop?occasion=${encodeURIComponent(o)}`}
                className="stagger-child shrink-0 bg-white border border-ink/10
                  hover:border-rust hover:text-rust hover:shadow-sm
                  active:scale-95 rounded-full px-4 py-2.5 sm:py-2 text-sm text-ink/70
                  transition-all whitespace-nowrap">
                {o}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ VIDEO SHOWCASE ══════════ */}
      <VideoShowcase />

      {/* ══════════ EVENTS ══════════ */}
      {events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div ref={eventsRef} style={{ opacity: 0 }}>
            <div className="flex items-end justify-between mb-6 sm:mb-8">
              <div>
                <span className="section-label">Happening now</span>
                <h2 className="section-heading mt-1">Current events</h2>
              </div>
              <Link to="/events" className="hidden sm:inline-flex btn-ghost">
                View all <FiArrowRight className="text-sm" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {events.slice(0, 2).map(evt => (
                <Link to="/events" key={evt._id}
                  className="card-surface p-5 sm:p-6 block
                    hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
                  <span className="pill mb-3 inline-block"
                    style={{ background: evt.badgeColor || '#B5582C', color: '#FAF6F0' }}>
                    {evt.badgeText}
                  </span>
                  <h3 className="font-display font-medium text-ink text-lg mb-2">{evt.title}</h3>
                  <p className="text-stone-dark text-sm mb-4 line-clamp-2">{evt.description}</p>
                  <span className="text-rust text-sm font-medium inline-flex items-center gap-1">
                    Explore <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <Link to="/events" className="sm:hidden btn-ghost mt-4 w-full justify-center">
            View all events <FiArrowRight className="text-sm" />
          </Link>
        </section>
      )}

      {/* ══════════ CATEGORIES ══════════ */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-10">
            <span className="section-label">Browse</span>
            <h2 className="section-heading mt-1">Shop by category</h2>
          </div>
          <div ref={categoriesRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.map(cat => (
              <Link key={cat._id} to={`/shop?category=${cat.slug}`}
                className="stagger-child card p-4 sm:p-5
                  hover:border-rust/40 hover:shadow-card-hover hover:-translate-y-1.5
                  transition-all duration-300 group block">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center mb-3
                  text-sm font-display font-bold group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `${cat.color}1A`, color: cat.color }}>
                  {cat.name?.[0]}
                </span>
                <h3 className="font-display font-medium text-ink text-sm mb-1">{cat.name}</h3>
                <p className="text-stone text-xs line-clamp-1">{cat.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════ LOADING ══════════ */}
      {loading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="aspect-square skeleton rounded-xl" />
                <div className="h-4 skeleton mt-3 w-3/4 rounded" />
                <div className="h-4 skeleton mt-2 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════ FEATURED ══════════ */}
      {!loading && featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <span className="section-label">Curated</span>
              <h2 className="section-heading mt-1">Featured picks</h2>
            </div>
            <Link to="/shop?isFeatured=true" className="hidden sm:inline-flex btn-ghost">
              See all <FiArrowRight className="text-sm" />
            </Link>
          </div>
          <div ref={featuredRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {featuredProducts.map(p => (
              <div key={p._id} className="stagger-child hover:-translate-y-1.5 transition-transform duration-300">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <Link to="/shop?isFeatured=true" className="sm:hidden btn-ghost mt-5 w-full justify-center">
            See all featured <FiArrowRight className="text-sm" />
          </Link>
        </section>
      )}

      {/* ══════════ NEW ARRIVALS ══════════ */}
      {!loading && newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <span className="section-label">Just landed</span>
              <h2 className="section-heading mt-1">New arrivals</h2>
            </div>
            <Link to="/shop?isNewArrival=true" className="hidden sm:inline-flex btn-ghost">
              See all <FiArrowRight className="text-sm" />
            </Link>
          </div>
          <div ref={newRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {newProducts.map(p => (
              <div key={p._id} className="stagger-child hover:-translate-y-1.5 transition-transform duration-300">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <Link to="/shop?isNewArrival=true" className="sm:hidden btn-ghost mt-5 w-full justify-center">
            See all new arrivals <FiArrowRight className="text-sm" />
          </Link>
        </section>
      )}

      {/* ══════════ EMPTY / ERROR ══════════ */}
      {!loading && !error && featuredProducts.length === 0 && newProducts.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="font-display font-medium text-2xl sm:text-3xl text-ink mb-3">
            The shop is just getting set up
          </h2>
          <p className="text-stone-dark mb-8 max-w-md mx-auto">
            No products are published yet. Add some from the admin panel to see them here.
          </p>
          <Link to="/admin" className="btn-primary">Go to admin panel</Link>
        </section>
      )}
      {error && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="font-display font-medium text-2xl text-ink mb-3">Couldn't load products</h2>
          <p className="text-stone-dark max-w-md mx-auto">
            Make sure the backend is running, then refresh.
          </p>
        </section>
      )}

      {/* ══════════ CONNECT (WHATSAPP + INSTAGRAM) ══════════ */}
      <ConnectSection />

      {/* ══════════ CTA ══════════ */}
      <section className="bg-ink py-14 sm:py-20 overflow-hidden relative">
        {/* subtle shimmer ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full border border-white/[0.04]
            animate-[spin_18s_linear_infinite]" />
          <div className="absolute w-[340px] h-[340px] rounded-full border border-rust/[0.07]
            animate-[spin_12s_linear_infinite_reverse]" />
        </div>
        <div ref={ctaRef} style={{ opacity: 0 }}
          className="relative max-w-2xl mx-auto text-center px-4 sm:px-6">
          <h2 className="font-display font-medium text-2xl sm:text-3xl text-cream mb-4">
            Can't find the right gift?
          </h2>
          <p className="text-cream/55 mb-8 text-sm sm:text-base max-w-sm mx-auto">
            Tell us the occasion and the person — we'll help put something together that fits.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-accent justify-center">
              Chat on WhatsApp
            </a>
            <a href="mailto:hello@customcornershopie.com"
              className="inline-flex items-center justify-center gap-2 border border-cream/20 text-cream/80 font-medium text-sm px-6 py-3 rounded-md hover:bg-cream/8 hover:border-cream/35 transition-all">
              Email us instead
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}