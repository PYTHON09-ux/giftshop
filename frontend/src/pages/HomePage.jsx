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

/* ─────────────────────────────────────────────────────────────
   DESIGN SYSTEM — "gift tag & scrapbook" look
   Canvas   Cloud Lilac   #F7F3FF  (page background — cool, pale, not the usual beige)
   Ink      Plum Ink      #2A1B3D  (primary text)
   Accent1  Confetti Coral#FF6552  (primary CTA / energy)
   Accent2  Ribbon Mustard#FFC93C  (tags, highlights)
   Accent3  Bow Teal      #2FA695  (tags, secondary accents)
   Accent4  Gift Pink     #FF8FB0  (tags, playful details)
   Fonts: Fredoka (display, rounded+bold), Caveat (handwritten notes/captions),
          Plus Jakarta Sans (body/utility)
   Signature: every label/badge/CTA is shaped like an actual gift tag
   (angled corner + punched hole), and photos sit in taped-down polaroid frames.
   ───────────────────────────────────────────────────────────── */
const C = {
  canvas: '#F7F3FF',
  canvasDeep: '#EFE7FF',
  ink: '#2A1B3D',
  inkSoft: 'rgba(42,27,61,0.62)',
  inkFaint: 'rgba(42,27,61,0.4)',
  line: 'rgba(42,27,61,0.12)',
  coral: '#FF6552',
  coralDark: '#E5432F',
  mustard: '#FFC93C',
  teal: '#2FA695',
  pink: '#FF8FB0',
  white: '#FFFFFF',
};
const ACCENTS = [C.coral, C.mustard, C.teal, C.pink];
const F_DISPLAY = "'Fredoka', sans-serif";
const F_HAND = "'Caveat', cursive";
const F_BODY = "'Plus Jakarta Sans', sans-serif";

const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'New baby', "Valentine's", 'Diwali', 'Housewarming', 'Just because'];

/* ── Social handles ── */
const WHATSAPP_NUMBER = '919146609265';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like to enquire about a gift!")}`;
const INSTAGRAM_HANDLE = 'custom_corner.1';
const INSTAGRAM_LINK = `https://instagram.com/${INSTAGRAM_HANDLE}`;

/* TODO: swap for real assets */
const SHOWCASE_VIDEO_SRC = 'https://www.pexels.com/download/video/6275428/';
const SHOWCASE_VIDEO_POSTER = 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&h=1500&fit=crop';
const INSTAGRAM_PREVIEW_IMAGES = [
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1573883430697-4c3479ba619d?w=400&h=400&fit=crop',
];
const HERO_PHOTOS = [
  'https://plus.unsplash.com/premium_photo-1665423291662-89cb2404392b?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=500&h=600&fit=crop',
  'https://images.unsplash.com/photo-1707944145479-12755f0434d8?q=80&w=600&auto=format&fit=crop',
];

/* ════════════════ Reusable "signature" pieces ════════════════ */

/* Gift-tag shaped chip — used for eyebrows, pills, badges, CTAs */
function GiftTag({
  children, as: Comp = 'span', bg = C.white, color = C.ink, rotate = 0,
  size = 'md', to, href, target, rel, onClick, className = '', style = {},
}) {
  const El = to ? Link : href ? 'a' : Comp;
  const sizes = {
    sm: { pad: '5px 12px 5px 20px', font: 12, hole: 3.5, point: 11 },
    md: { pad: '9px 18px 9px 28px', font: 14, hole: 4.5, point: 15 },
    lg: { pad: '14px 26px 14px 36px', font: 16, hole: 5.5, point: 19 },
  }[size];
  return (
    <El
      to={to} href={href} target={target} rel={rel} onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 font-semibold whitespace-nowrap select-none ${className}`}
      style={{
        background: bg,
        color,
        padding: sizes.pad,
        fontSize: sizes.font,
        fontFamily: F_BODY,
        clipPath: `polygon(${sizes.point}px 0, 100% 0, 100% 100%, ${sizes.point}px 100%, 0 50%)`,
        transform: `rotate(${rotate}deg)`,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          left: sizes.point * 0.42, top: '50%', width: sizes.hole, height: sizes.hole,
          transform: 'translateY(-50%)',
          background: C.canvas,
          boxShadow: `inset 0 0 0 1px ${C.inkFaint}`,
        }}
      />
      {children}
    </El>
  );
}

/* Torn / washi tape strip, purely decorative */
function WashiTape({ color = C.mustard, rotate = -8, style = {} }) {
  return (
    <span
      aria-hidden="true"
      className="absolute block pointer-events-none"
      style={{
        width: 56, height: 20,
        background: `repeating-linear-gradient(45deg, ${color}, ${color} 5px, ${color}CC 5px, ${color}CC 10px)`,
        opacity: 0.92,
        boxShadow: '0 2px 4px rgba(42,27,61,0.18)',
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    />
  );
}

/* A photo taped down like a scrapbook polaroid */
function Polaroid({ src, alt = '', rotate = -3, caption, tapeColor = C.mustard, className = '' }) {
  return (
    <div
      className={`relative bg-white p-2.5 pb-9 shadow-xl ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, boxShadow: '0 14px 30px -10px rgba(42,27,61,0.35)' }}
    >
      <WashiTape color={tapeColor} rotate={rotate < 0 ? -18 : 12} style={{ top: -10, left: '50%', marginLeft: -28 }} />
      <div className="overflow-hidden bg-ink/5" style={{ aspectRatio: '4/5' }}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
      {caption && (
        <p className="absolute bottom-1.5 left-0 right-0 text-center"
          style={{ fontFamily: F_HAND, fontSize: 18, color: C.ink }}>
          {caption}
        </p>
      )}
    </div>
  );
}

/* Confetti canvas — playful stand-in for the old particle field */
function ConfettiCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const COUNT = window.innerWidth < 640 ? 26 : 46;
    const colors = [C.coral, C.mustard, C.teal, C.pink, '#FFFFFF'];

    const bits = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      s: Math.random() * 5 + 3,
      vy: Math.random() * 0.35 + 0.12,
      vx: (Math.random() - 0.5) * 0.25,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.02,
      color: colors[Math.floor(Math.random() * colors.length)],
      o: Math.random() * 0.35 + 0.25,
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      bits.forEach(b => {
        b.y += b.vy; b.x += b.vx; b.rot += b.vr;
        if (b.y > H + 10) { b.y = -10; b.x = Math.random() * W; }
        if (b.x < -10) b.x = W + 10; if (b.x > W + 10) b.x = -10;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.globalAlpha = b.o;
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6);
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* Hand-drawn squiggle underline */
function Squiggle({ color = C.coral, width = 180, className = '' }) {
  return (
    <svg viewBox="0 0 200 14" width={width} height={Math.round(width * 0.07)} className={className}
      style={{ display: 'block' }} aria-hidden="true">
      <path d="M2 9 C 30 1, 55 13, 85 6 C 115 -1, 140 12, 170 5 C 182 2.5, 190 4, 198 6"
        stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ── Scroll-reveal / stagger hooks ── */
function useReveal(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y: options.y ?? 36, scale: options.scale ?? 1, rotate: options.rotate ?? 0 },
        {
          opacity: 1, y: 0, scale: 1, rotate: options.finalRotate ?? options.rotate ?? 0,
          duration: options.duration ?? 0.75,
          delay: options.delay ?? 0,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return ref;
}

function useStagger(selector = '.stagger-child', stagger = 0.09) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll(selector),
        { opacity: 0, y: 26, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6,
          stagger,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return ref;
}

function Counter({ to, suffix = '' }) {
  const elRef = useRef(null);
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: to, duration: 1.6, ease: 'power2.out', snap: { val: 1 },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString() + suffix; },
      });
    });
    return () => ctx.revert();
  }, [to, suffix]);
  return <span ref={elRef}>0{suffix}</span>;
}

/* ── Section eyebrow using the gift-tag motif ── */
function Eyebrow({ children, color = C.coral, rotate = -2 }) {
  return (
    <GiftTag size="sm" bg={color} color="#fff" rotate={rotate} className="mb-3 shadow-sm">
      {children}
    </GiftTag>
  );
}

/* ── Floating WhatsApp / Instagram FAB ── */
function FloatingFAB() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2.5" style={{ fontFamily: F_BODY }}>
      <div style={{
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.88)',
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.22s ease, transform 0.22s ease',
      }} className="flex flex-col items-end gap-2">
        <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg hover:brightness-110 transition-all"
          style={{ background: 'linear-gradient(135deg,#f58529,#dd2a7b,#8134af)' }}>
          <FiInstagram size={16} /> @{INSTAGRAM_HANDLE}
        </a>
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 bg-[#25D366] text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg hover:brightness-110 transition-all">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.52 5.847L0 24l6.335-1.497A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.373l-.36-.214-3.727.88.94-3.633-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
          WhatsApp us
        </a>
        <a href="tel:+919146609265"
          className="flex items-center gap-2.5 bg-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all"
          style={{ color: C.ink, border: `1px solid ${C.line}` }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.0 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
          Call us
        </a>
      </div>

      <button onClick={() => setOpen(p => !p)} aria-label="Contact us"
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95"
        style={{ background: C.coral, transition: 'transform 0.22s ease' }}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white"
          style={{ transition: 'transform 0.22s ease', transform: open ? 'rotate(90deg) scale(0.85)' : 'rotate(0deg)' }}>
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2.4" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2.4" strokeLinecap="round"/></>
            : <path d="M20 6h-2.18a3 3 0 00.18-1 3 3 0 00-5.5-1.7L12 4l-.5-.7A3 3 0 006 3a3 3 0 00.18 3H4a2 2 0 00-2 2v2a1 1 0 001 1v7a2 2 0 002 2h14a2 2 0 002-2v-7a1 1 0 001-1V8a2 2 0 00-2-2zM9 5a1 1 0 011-1.7l2 2.7H10a1 1 0 01-1-1zm5-1a1 1 0 011 1 1 1 0 01-1 1h-2l1.34-1.8A1 1 0 0114 4zM5 10h6v9H5v-9zm14 9h-6v-9h6v9z"/>
          }
        </svg>
      </button>
    </div>
  );
}

/* ── Gift showcase video, taped into a polaroid frame ── */
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
        if (entry.isIntersecting) video.play().then(() => setPlaying(true)).catch(() => {});
        else { video.pause(); setPlaying(false); }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current; if (!video) return;
    if (video.paused) { video.play(); setPlaying(true); } else { video.pause(); setPlaying(false); }
  };
  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current; if (!video) return;
    video.muted = !video.muted; setMuted(video.muted);
  };
  const goFullscreen = (e) => {
    e.stopPropagation();
    const video = videoRef.current; if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    video.muted = false; setMuted(false);
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(${C.line} 1.4px, transparent 1.4px)`,
          backgroundSize: '18px 18px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 90%)',
        }}
      />
      <div ref={wrapRef} style={{ opacity: 0 }} className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <Eyebrow color={C.teal}>Take a peek</Eyebrow>
          <h2 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-3xl sm:text-4xl leading-tight mb-4">
            From box to <span style={{ color: C.coral }}>"wow"</span>
          </h2>
          <p style={{ color: C.inkSoft, fontFamily: F_BODY }} className="text-sm sm:text-base leading-relaxed mb-7 max-w-md">
            Every order is wrapped, packed and finished by hand. Here's a peek at what actually
            shows up on someone's doorstep.
          </p>
          <div className="flex flex-wrap gap-3">
            <GiftTag to="/shop" size="lg" bg={C.coral} color="#fff" rotate={-1.5} className="shadow-md hover:!rotate-0 hover:-translate-y-0.5">
              Shop the collection <FiArrowRight />
            </GiftTag>
            <GiftTag href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer" size="lg" bg="#fff" color={C.ink} rotate={1.5}
              className="shadow-sm hover:!rotate-0 hover:-translate-y-0.5" style={{ border: `1px solid ${C.line}` }}>
              <FiInstagram /> More on Instagram
            </GiftTag>
          </div>
        </div>

        <div
          ref={containerRef}
          onClick={togglePlay}
          className="relative mx-auto lg:mx-0 max-w-xs sm:max-w-sm w-full cursor-pointer group bg-white p-3 pb-10"
          style={{ transform: 'rotate(-2deg)', boxShadow: '0 20px 40px -12px rgba(42,27,61,0.35)' }}
        >
          <WashiTape color={C.mustard} rotate={-16} style={{ top: -12, left: 26 }} />
          <WashiTape color={C.pink} rotate={12} style={{ top: -12, right: 26 }} />
          <div className="relative overflow-hidden rounded-sm" style={{ aspectRatio: '9/13' }}>
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-16 h-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl
                transition-all duration-300 ${playing ? 'opacity-0 scale-75 group-hover:opacity-100' : 'opacity-100 scale-100'}`}>
                {playing ? <FiPause style={{ color: C.ink }} size={22} /> : <FiPlay style={{ color: C.ink, marginLeft: 2 }} size={22} />}
              </div>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <GiftTag size="sm" bg="rgba(0,0,0,0.55)" color="#fff" rotate={0}>Gift unboxing</GiftTag>
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
          <p className="absolute bottom-2 left-0 right-0 text-center" style={{ fontFamily: F_HAND, fontSize: 19, color: C.ink }}>
            unboxing day 🎁
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── WhatsApp + Instagram connect band ── */
function ConnectSection() {
  const ref = useStagger('.stagger-child', 0.12);
  return (
    <section className="py-16 sm:py-24" style={{ background: C.canvasDeep, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex justify-center"><Eyebrow color={C.pink} rotate={2}>Stay close</Eyebrow></div>
          <h2 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-3xl sm:text-4xl">
            Chat with us, follow along
          </h2>
          <p style={{ color: C.inkSoft, fontFamily: F_BODY }} className="text-sm sm:text-base mt-3 max-w-md mx-auto">
            Fastest replies on WhatsApp. Prettiest updates on Instagram.
          </p>
        </div>

        <div ref={ref} className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12">
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
            className="stagger-child bg-white p-6 sm:p-8 flex items-center gap-5 rounded-2xl
              hover:shadow-2xl hover:-translate-y-1.5 hover:rotate-1 transition-all duration-300 group"
            style={{ boxShadow: '0 10px 24px -12px rgba(42,27,61,0.2)' }}>
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#25D366]/12 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.52 5.847L0 24l6.335-1.497A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.373l-.36-.214-3.727.88.94-3.633-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-lg mb-0.5">Message us on WhatsApp</h3>
              <p style={{ color: C.inkSoft, fontFamily: F_BODY }} className="text-sm">Get gift ideas, check stock, or place a custom order</p>
            </div>
            <FiArrowRight style={{ color: C.inkFaint }} className="shrink-0 group-hover:translate-x-1 transition-all" />
          </a>

          <a href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer"
            className="stagger-child bg-white p-6 sm:p-8 flex items-center gap-5 rounded-2xl
              hover:shadow-2xl hover:-translate-y-1.5 hover:-rotate-1 transition-all duration-300 group"
            style={{ boxShadow: '0 10px 24px -12px rgba(42,27,61,0.2)' }}>
            <div className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(245,133,41,0.14),rgba(221,42,123,0.14),rgba(129,52,175,0.14))' }}>
              <FiInstagram size={24} style={{ color: '#dd2a7b' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-lg mb-0.5">@{INSTAGRAM_HANDLE}</h3>
              <p style={{ color: C.inkSoft, fontFamily: F_BODY }} className="text-sm">Unboxings, new drops, and gifting inspiration</p>
            </div>
            <FiArrowRight style={{ color: C.inkFaint }} className="shrink-0 group-hover:translate-x-1 transition-all" />
          </a>
        </div>

        <div className="stagger-child grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {INSTAGRAM_PREVIEW_IMAGES.map((src, i) => (
            <a key={i} href={INSTAGRAM_LINK} target="_blank" rel="noopener noreferrer"
              className="relative aspect-square bg-white p-1.5 group"
              style={{
                transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)`,
                boxShadow: '0 8px 16px -8px rgba(42,27,61,0.3)',
              }}>
              <div className="w-full h-full overflow-hidden">
                <img src={src} alt="" loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="absolute inset-1.5 bg-ink/0 group-hover:bg-ink/30 transition-colors duration-300 flex items-center justify-center">
                <FiInstagram className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={16} />
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

  const heroTextRef = useRef(null);
  const heroImgRef = useRef(null);
  const heroStatsRef = useRef(null);

  const trustRef = useStagger('.stagger-child', 0.1);
  const occasionsRef = useStagger('.stagger-child', 0.05);
  const eventsRef = useReveal();
  const categoriesRef = useStagger('.stagger-child', 0.07);
  const featuredRef = useStagger('.stagger-child', 0.06);
  const newRef = useStagger('.stagger-child', 0.06);
  const ctaRef = useReveal({ y: 24 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(heroTextRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9 })
        .fromTo(heroStatsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
        .fromTo(heroImgRef.current, { opacity: 0, scale: 0.94, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 1.0 }, '-=0.7');
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

  useEffect(() => { ScrollTrigger.refresh(); }, [featuredProducts, newProducts, categories]);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: C.canvas, fontFamily: F_BODY, color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes bounce-slow {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.65; }
          50% { transform: translateX(-50%) translateY(6px); opacity: 1; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <FloatingFAB />

      {/* ══════════ HERO ══════════ */}
      <section className="relative pt-24 sm:pt-28 pb-16 sm:pb-24 overflow-hidden">
        <ConfettiCanvas />
        <div aria-hidden="true" className="absolute -top-24 -right-24 w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${C.pink}33 0%, transparent 68%)` }} />
        <div aria-hidden="true" className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${C.teal}22 0%, transparent 70%)` }} />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div ref={heroTextRef} style={{ opacity: 0 }}>
            <GiftTag size="sm" bg="#fff" color={C.coral} rotate={-3} className="mb-5 shadow-sm" style={{ border: `1px solid ${C.line}` }}>
              🎁utkarsh Gift Shopie
            </GiftTag>
            <h1 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-[2.3rem] sm:text-5xl lg:text-[3.4rem] leading-[1.08] mb-3">
              Gifts chosen with the<br className="hidden sm:block" /> same care{' '}
            </h1>
            <div className="mb-6">
              <span style={{ fontFamily: F_HAND, color: C.coral, fontSize: '2.1rem', lineHeight: 1 }}>
                you'd give them yourself.
              </span>
              <Squiggle color={C.mustard} width={220} />
            </div>
            <p style={{ color: C.inkSoft }} className="text-base sm:text-lg leading-relaxed mb-8 max-w-md">
              A curated, personalised collection for birthdays, anniversaries, and the moments worth marking properly.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <GiftTag to="/shop" size="lg" bg={C.coral} color="#fff" rotate={-1.5}
                className="shadow-lg hover:!rotate-0 hover:-translate-y-1">
                Shop the collection <FiArrowRight />
              </GiftTag>
              <GiftTag href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" size="lg" bg="#fff" color={C.ink} rotate={1.5}
                className="shadow-sm hover:!rotate-0 hover:-translate-y-1" style={{ border: `1px solid ${C.line}` }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.52 5.847L0 24l6.335-1.497A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.373l-.36-.214-3.727.88.94-3.633-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
                Chat on WhatsApp
              </GiftTag>
            </div>

            <div ref={heroStatsRef} className="flex gap-7 sm:gap-10 mt-11 pt-7"
              style={{ opacity: 0, borderTop: `1.5px dashed ${C.line}` }}>
              {[
                [50, '+', 'Products'],
                [1000, '+', 'Happy customers'],
                [null, '4.9★', 'Avg. rating'],
              ].map(([n, sfx, label]) => (
                <div key={label}>
                  <p style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-xl sm:text-2xl">
                    {n ? <><Counter to={n} />{sfx}</> : sfx}
                  </p>
                  <p style={{ color: C.inkFaint }} className="text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* photo collage */}
          <div ref={heroImgRef} style={{ opacity: 0 }} className="relative hidden lg:block h-[440px]">
            <Polaroid src={HERO_PHOTOS[0]} rotate={-6} tapeColor={C.mustard} caption="for her 💛"
              className="absolute w-52 left-4 top-0" />
            <Polaroid src={HERO_PHOTOS[1]} rotate={4} tapeColor={C.teal} caption="just because"
              className="absolute w-56 right-0 top-16" />
            <Polaroid src={HERO_PHOTOS[2]} rotate={-2} tapeColor={C.pink} caption="wrapped w/ love"
              className="absolute w-52 left-24 bottom-0" />
          </div>

          {/* mobile hero image */}
          <div className="lg:hidden">
            <Polaroid src={HERO_PHOTOS[0]} rotate={-2} tapeColor={C.mustard} caption="wrapped w/ love 🎁" className="max-w-[280px] mx-auto" />
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1.5 pointer-events-none"
          style={{ animation: 'bounce-slow 2.2s ease-in-out infinite' }}>
          <span style={{ color: C.inkFaint }} className="text-[10px] tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* ══════════ TRUST STRIP ══════════ */}
      <section style={{ background: '#fff', borderTop: `1.5px dashed ${C.line}`, borderBottom: `1.5px dashed ${C.line}` }}>
        <div ref={trustRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7 grid grid-cols-3 gap-2 sm:gap-6">
          {[
            [FiTruck, 'Tracked shipping', 'Every order', C.coral],
            [FiRefreshCw, 'Easy returns', '7-day window', C.teal],
            [FiShield, 'Secure checkout', 'Always protected', C.pink],
          ].map(([Icon, title, sub, color], i) => (
            <div key={i} className="stagger-child flex flex-col sm:flex-row items-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${color}1E` }}>
                <Icon style={{ color }} className="text-sm" />
              </div>
              <div>
                <p style={{ color: C.ink }} className="text-xs sm:text-sm font-semibold leading-tight">{title}</p>
                <p style={{ color: C.inkFaint }} className="text-xs hidden sm:block">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ OCCASIONS ══════════ */}
      <section className="py-7 sm:py-9" style={{ background: C.canvasDeep, borderBottom: `1px solid ${C.line}` }}>
        <div ref={occasionsRef} className="max-w-7xl mx-auto">
          <div className="flex gap-3.5 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2 pt-1
            [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {OCCASIONS.map((o, i) => (
              <GiftTag key={o} to={`/shop?occasion=${encodeURIComponent(o)}`} size="md"
                bg="#fff" color={C.ink} rotate={i % 2 === 0 ? -2 : 2}
                className="shrink-0 shadow-sm hover:!rotate-0 hover:-translate-y-1 hover:shadow-md"
                style={{ border: `1px solid ${C.line}` }}>
                {o}
              </GiftTag>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ VIDEO SHOWCASE ══════════ */}
      <VideoShowcase />

      {/* ══════════ EVENTS ══════════ */}
      {events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div ref={eventsRef} style={{ opacity: 0 }}>
            <div className="flex items-end justify-between mb-7 sm:mb-9">
              <div>
                <Eyebrow color={C.mustard} rotate={-2}>Happening now</Eyebrow>
                <h2 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-2xl sm:text-3xl">Current events</h2>
              </div>
              <GiftTag to="/events" size="sm" bg="#fff" color={C.ink} className="hidden sm:inline-flex" style={{ border: `1px solid ${C.line}` }}>
                View all <FiArrowRight className="text-sm" />
              </GiftTag>
            </div>
            <div className="grid sm:grid-cols-2 gap-5 sm:gap-7">
              {events.slice(0, 2).map((evt, i) => (
                <Link to="/events" key={evt._id}
                  className="bg-white rounded-2xl p-5 sm:p-6 block hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group"
                  style={{ boxShadow: '0 10px 24px -12px rgba(42,27,61,0.18)', transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}>
                  <GiftTag size="sm" bg={evt.badgeColor || ACCENTS[i % ACCENTS.length]} color="#fff" rotate={-2} className="mb-3">
                    {evt.badgeText}
                  </GiftTag>
                  <h3 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-lg mb-2">{evt.title}</h3>
                  <p style={{ color: C.inkSoft }} className="text-sm mb-4 line-clamp-2">{evt.description}</p>
                  <span style={{ color: C.coral }} className="text-sm font-semibold inline-flex items-center gap-1">
                    Explore <FiArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ CATEGORIES ══════════ */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center mb-9 sm:mb-11">
            <div className="flex justify-center"><Eyebrow color={C.teal} rotate={2}>Browse</Eyebrow></div>
            <h2 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-2xl sm:text-3xl">Shop by category</h2>
          </div>
          <div ref={categoriesRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((cat, i) => (
              <Link key={cat._id} to={`/shop?category=${cat.slug}`}
                className="stagger-child bg-white rounded-2xl p-4 sm:p-5 block
                  hover:shadow-xl hover:-translate-y-1.5 hover:rotate-0 transition-all duration-300 group"
                style={{ boxShadow: '0 8px 18px -10px rgba(42,27,61,0.18)', transform: `rotate(${i % 2 === 0 ? -1.4 : 1.4}deg)` }}>
                <span className="w-10 h-10 rounded-lg flex items-center justify-center mb-3
                  text-sm font-bold group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `${cat.color || ACCENTS[i % ACCENTS.length]}22`, color: cat.color || ACCENTS[i % ACCENTS.length], fontFamily: F_DISPLAY }}>
                  {cat.name?.[0]}
                </span>
                <h3 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-sm mb-1">{cat.name}</h3>
                <p style={{ color: C.inkFaint }} className="text-xs line-clamp-1">{cat.description}</p>
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
                <div className="aspect-square rounded-xl animate-pulse" style={{ background: C.canvasDeep }} />
                <div className="h-4 mt-3 w-3/4 rounded animate-pulse" style={{ background: C.canvasDeep }} />
                <div className="h-4 mt-2 w-1/2 rounded animate-pulse" style={{ background: C.canvasDeep }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════ FEATURED ══════════ */}
      {!loading && featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="flex items-end justify-between mb-7 sm:mb-9">
            <div>
              <Eyebrow color={C.pink} rotate={-2}>Curated</Eyebrow>
              <h2 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-2xl sm:text-3xl">Featured picks</h2>
            </div>
            <GiftTag to="/shop?isFeatured=true" size="sm" bg="#fff" color={C.ink} className="hidden sm:inline-flex" style={{ border: `1px solid ${C.line}` }}>
              See all <FiArrowRight className="text-sm" />
            </GiftTag>
          </div>
          <div ref={featuredRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {featuredProducts.map(p => (
              <div key={p._id} className="stagger-child hover:-translate-y-1.5 transition-transform duration-300">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <div className="sm:hidden mt-5 flex justify-center">
            <GiftTag to="/shop?isFeatured=true" size="md" bg="#fff" color={C.ink} style={{ border: `1px solid ${C.line}` }}>
              See all featured <FiArrowRight className="text-sm" />
            </GiftTag>
          </div>
        </section>
      )}

      {/* ══════════ NEW ARRIVALS ══════════ */}
      {!loading && newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="flex items-end justify-between mb-7 sm:mb-9">
            <div>
              <Eyebrow color={C.mustard} rotate={2}>Just landed</Eyebrow>
              <h2 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-2xl sm:text-3xl">New arrivals</h2>
            </div>
            <GiftTag to="/shop?isNewArrival=true" size="sm" bg="#fff" color={C.ink} className="hidden sm:inline-flex" style={{ border: `1px solid ${C.line}` }}>
              See all <FiArrowRight className="text-sm" />
            </GiftTag>
          </div>
          <div ref={newRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {newProducts.map(p => (
              <div key={p._id} className="stagger-child hover:-translate-y-1.5 transition-transform duration-300">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <div className="sm:hidden mt-5 flex justify-center">
            <GiftTag to="/shop?isNewArrival=true" size="md" bg="#fff" color={C.ink} style={{ border: `1px solid ${C.line}` }}>
              See all new arrivals <FiArrowRight className="text-sm" />
            </GiftTag>
          </div>
        </section>
      )}

      {/* ══════════ EMPTY / ERROR ══════════ */}
      {!loading && !error && featuredProducts.length === 0 && newProducts.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-2xl sm:text-3xl mb-3">
            The shop is just getting set up
          </h2>
          <p style={{ color: C.inkSoft }} className="mb-8 max-w-md mx-auto">
            No products are published yet. Add some from the admin panel to see them here.
          </p>
          <GiftTag to="/admin" size="lg" bg={C.coral} color="#fff">Go to admin panel</GiftTag>
        </section>
      )}
      {error && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 style={{ fontFamily: F_DISPLAY, color: C.ink }} className="font-semibold text-2xl mb-3">Couldn't load products</h2>
          <p style={{ color: C.inkSoft }} className="max-w-md mx-auto">Make sure the backend is running, then refresh.</p>
        </section>
      )}

      {/* ══════════ CONNECT (WHATSAPP + INSTAGRAM) ══════════ */}
      <ConnectSection />

      {/* ══════════ CTA ══════════ */}
      <section className="relative py-16 sm:py-24 overflow-hidden" style={{ background: C.ink }}>
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: `radial-gradient(#fff 1.5px, transparent 1.5px)`, backgroundSize: '20px 20px' }} />
        <div ref={ctaRef} style={{ opacity: 0 }} className="relative max-w-2xl mx-auto text-center px-4 sm:px-6">
          <span style={{ fontFamily: F_HAND, color: C.mustard, fontSize: '1.6rem' }}>psst —</span>
          <h2 style={{ fontFamily: F_DISPLAY, color: '#fff' }} className="font-semibold text-2xl sm:text-4xl mb-4 mt-1">
            Can't find the right gift?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-9 text-sm sm:text-base max-w-sm mx-auto">
            Tell us the occasion and the person — we'll help put something together that fits.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <GiftTag href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" size="lg" bg={C.coral} color="#fff" rotate={-1.5}
              className="justify-center shadow-lg hover:!rotate-0">
              Chat on WhatsApp
            </GiftTag>
            <GiftTag href="mailto:hello@customcornershopie.com" size="lg" bg="transparent" color="#fff" rotate={1.5}
              className="justify-center hover:!rotate-0" style={{ border: '1px solid rgba(255,255,255,0.25)' }}>
              Email us instead
            </GiftTag>
          </div>
        </div>
      </section>
    </div>
  );
}