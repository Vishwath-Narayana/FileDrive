import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 }
    );
    const target = document.getElementById('testimonial');
    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, []);

  const faqItems = [
    {
      q: "Is my data secure on FileDrive?",
      a: "All assets are secured via industry-standard encryption protocols and trusted Cloudinary infrastructure, ensuring zero compromise on privacy."
    },
    {
      q: "Can I collaborate with my team?",
      a: "Yes. Architecture is scoped by organization. You control granular roles—Admin, Editor, Viewer—to maintain order within teams."
    },
    {
      q: "What file types are supported?",
      a: "A versatile ingestion engine supports modern standards—PDFs, SVG/PNG/JPG visual assets, CSVs, and plain text documents."
    },
    {
      q: "How does pricing scale?",
      a: "Transparently. We maintain an independent free tier alongside predictable utility structures for teams experiencing growth."
    }
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-[family-name:var(--font-body)] selection:bg-[hsl(var(--foreground))] selection:text-[hsl(var(--background))] overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-[12px] bg-[rgba(255,255,255,0.7)] border-b border-[hsl(var(--border))]">
        <div className="max-w-[1280px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[hsl(var(--foreground))]"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
            <span className="text-xl font-[family-name:var(--font-display)] font-bold tracking-tight text-[hsl(var(--foreground))]">filedrive</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors no-underline">Features</a>
            <a href="#pricing" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors no-underline">Pricing</a>
            <a href="#faq" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors no-underline">Questions</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-[hsl(var(--foreground))] hover:opacity-70 transition-opacity bg-transparent border-none outline-none hidden sm:block"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-sm font-medium rounded-full px-5 py-2 transition-all hover:scale-[1.02] border-none outline-none"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full min-h-[92vh] bg-[#080808] pt-32 pb-20 px-8 relative overflow-hidden flex flex-col justify-center">
        {/* Animated dot grid background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-15" style={{ background: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 max-w-[1280px] mx-auto w-full flex flex-col items-center">
          {/* Badge */}
          <div className="animate-fade-rise flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]"></div>
            <span className="text-white/60 text-xs font-medium">All Systems Operational</span>
          </div>

          {/* H1 Headline */}
          <h1 className="animate-fade-rise-1 font-[family-name:var(--font-display)] text-6xl sm:text-7xl md:text-8xl font-black tracking-[-3px] leading-[0.92] text-white max-w-4xl mx-auto text-center">
            Smart file management for <em className="not-italic text-white/40">modern</em> teams.
          </h1>

          {/* Subtext */}
          <p className="animate-fade-rise-2 text-white/50 text-lg max-w-xl mx-auto mt-6 leading-relaxed text-center">
            Upload, organize, and share files with your team in real time. No friction, no bloat.
          </p>

          {/* CTAs */}
          <div className="animate-fade-rise-3 mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-black rounded-full px-8 py-3.5 text-sm font-semibold hover:scale-[1.02] transition-transform w-full sm:w-auto"
            >
              Sign Up →
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border border-white/15 text-white/70 rounded-full px-8 py-3.5 text-sm hover:border-white/30 transition-colors w-full sm:w-auto"
            >
              Learn More
            </button>
          </div>

          {/* Floating Product Screenshot Mockup */}
          <div className="animate-fade-rise-3 mt-16 w-full max-w-4xl rounded-2xl border border-white/10 bg-[#111111] overflow-hidden" style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
            <svg width="100%" viewBox="0 0 1200 700" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
              <rect width="1200" height="700" fill="#111111"/>
              {/* Header */}
              <rect x="0" y="0" width="1200" height="60" fill="#1A1A1A"/>
              <circle cx="30" cy="30" r="6" fill="#FF5F56"/>
              <circle cx="50" cy="30" r="6" fill="#FFBD2E"/>
              <circle cx="70" cy="30" r="6" fill="#27C93F"/>
              <rect x="250" y="15" width="700" height="30" rx="15" fill="#222222"/>
              {/* Sidebar */}
              <rect x="0" y="60" width="220" height="640" fill="#151515"/>
              <rect x="20" y="90" width="140" height="20" rx="4" fill="#333333"/>
              <rect x="20" y="130" width="180" height="15" rx="4" fill="#222222"/>
              <rect x="20" y="160" width="160" height="15" rx="4" fill="#222222"/>
              <rect x="20" y="190" width="170" height="15" rx="4" fill="#222222"/>
              {/* Main Area */}
              <rect x="260" y="100" width="300" height="40" rx="8" fill="#222"/>
              <rect x="260" y="180" width="900" height="50" rx="8" fill="#1A1A1A"/>
              <rect x="260" y="240" width="900" height="50" rx="8" fill="#1A1A1A"/>
              <rect x="260" y="300" width="900" height="50" rx="8" fill="#1A1A1A"/>
              <rect x="260" y="360" width="900" height="50" rx="8" fill="#1A1A1A"/>
              <rect x="260" y="420" width="900" height="50" rx="8" fill="#1A1A1A"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-10 border-y border-[hsl(var(--border))] bg-[hsl(var(--background))]">
        <div className="max-w-[1280px] mx-auto px-8">
          <p className="text-center text-[hsl(var(--muted-foreground))] text-sm mb-6">Used by 5,000+ businesses & teams</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {['Raposa', 'Axis', 'Superteam', 'Nexa', 'Vortex', 'Zenith'].map((name, i) => (
              <div key={i} className="opacity-40 hover:opacity-70 transition-opacity grayscale flex items-center justify-center">
                <svg width="120" height="30" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="currentColor" fontFamily="var(--font-display)" fontSize="20" fontWeight="bold">{name}</text>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FileDrive / Features Comparison */}
      <section id="features" className="py-24 md:py-32 bg-[hsl(var(--background))]">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <h4 className="text-xs tracking-widest text-[hsl(var(--muted-foreground))] font-semibold uppercase mb-3">WHY FILEDRIVE</h4>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              Why choose us over others?
            </h2>
            <p className="mt-4 text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              We built FileDrive from the ground up to solve the friction inherent in traditional file sharing tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border border-[hsl(var(--border))] shadow-sm">
            {/* Others Panel */}
            <div className="bg-white p-8 md:p-10">
              <h3 className="font-semibold text-lg text-[hsl(var(--muted-foreground))] mb-8">Others</h3>
              <div className="space-y-0">
                {[
                  "Real-Time File Sync",
                  "Organization-Based Collaboration",
                  "Instant Updates Without Refresh",
                  "Secure File Upload & Storage",
                  "Role-Based Access Control",
                  "Magic Link Invitations",
                  "Centralized File Dashboard",
                  "Live Activity Updates",
                  "Fast & Responsive Interface"
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 border-b border-[hsl(var(--border))] last:border-0 text-sm text-[hsl(var(--muted-foreground))]">
                    <span>{feat}</span>
                    <span className="text-gray-400 font-bold">{idx % 3 === 0 ? "×" : "✓"}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* FileDrive Panel */}
            <div className="bg-[#080808] p-8 md:p-10 text-white">
              <div className="flex items-center gap-2 mb-8">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
                <h3 className="font-semibold text-lg text-white">FileDrive</h3>
              </div>
              <div className="space-y-0">
                {[
                  "Real-Time File Sync",
                  "Organization-Based Collaboration",
                  "Instant Updates Without Refresh",
                  "Secure File Upload & Storage",
                  "Role-Based Access Control",
                  "Magic Link Invitations",
                  "Centralized File Dashboard",
                  "Live Activity Updates",
                  "Fast & Responsive Interface"
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-sm text-white/80">
                    <span>{feat}</span>
                    <span className="text-white font-bold">✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section id="testimonial" className="py-20 bg-[#080808] w-full px-8">
        <div className={`max-w-2xl mx-auto flex flex-col items-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex gap-1 mb-8 text-[#FF5F56]">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
          <blockquote className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-semibold text-white text-center leading-snug">
            "We switched to FileDrive and never looked back. The speed and granular permissions completely changed how our team collaborates on assets."
          </blockquote>
          <p className="text-white/40 text-sm mt-4 italic">— Sarah J., VP of Engineering</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 md:py-32 bg-[hsl(var(--background))] px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h4 className="text-xs tracking-widest text-[hsl(var(--muted-foreground))] font-semibold uppercase mb-3">PRICING</h4>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              Simple pricing, serious value
            </h2>
            <p className="mt-4 text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
              Simple, transparent structures for teams of all scales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {[
              { name: "Starter", price: "₹299", desc: "Essential mechanics designed for singular individuals and emerging setups.", feats: ["5GB cloud storage", "Single organization", "Core interface access"] },
              { name: "Basic", price: "₹799", desc: "Our prioritized structure enabling fast-moving teams to excel.", feats: ["100GB swift storage", "Multiple organizations", "Advanced permission tiering"], active: true, oldPrice: "₹1000" },
              { name: "Enterprise", price: "₹4000", desc: "Infinite scale capability and tailored considerations for large accounts.", feats: ["Uncapped storage limits", "Dedicated relationship manager", "Customized API endpoints"] }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl flex flex-col relative transition-transform ${
                  plan.active 
                    ? 'border-2 border-[hsl(var(--foreground))] bg-[#080808] text-white md:scale-105 shadow-xl z-10' 
                    : 'border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]'
                }`}
              >
                {plan.active && (
                  <div className="absolute -top-3 right-6 bg-white text-black text-xs px-3 py-1 rounded-full font-semibold">
                    Most Popular
                  </div>
                )}
                
                <h4 className={`text-sm font-semibold mb-4 ${plan.active ? 'text-white/80' : 'text-[hsl(var(--muted-foreground))]'}`}>{plan.name}</h4>
                
                <div className="flex items-baseline gap-2 mb-2 font-[family-name:var(--font-display)]">
                  <span className={`text-4xl font-bold ${plan.active ? 'text-white' : 'text-[hsl(var(--foreground))]'}`}>
                    {plan.price}
                  </span>
                  {plan.oldPrice && (
                    <span className="text-sm line-through text-[hsl(var(--muted-foreground))]">{plan.oldPrice}</span>
                  )}
                  <span className={`text-sm ${plan.active ? 'text-white/60' : 'text-[hsl(var(--muted-foreground))]'}`}>/mo</span>
                </div>
                
                <p className={`text-sm leading-relaxed mb-8 min-h-[60px] ${plan.active ? 'text-white/60' : 'text-[hsl(var(--muted-foreground))]'}`}>
                  {plan.desc}
                </p>

                <div className="space-y-4 mb-10 flex-1 text-sm">
                  {plan.feats.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${plan.active ? 'bg-white' : 'bg-[hsl(var(--muted-foreground))]'}`}></div>
                      <span className={plan.active ? 'text-white/90' : 'text-[hsl(var(--foreground))]'}>{feat}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => navigate('/register')} 
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.active 
                      ? 'bg-white text-black hover:scale-[1.02]' 
                      : 'border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                  }`}
                >
                  Select {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-[hsl(var(--background))] px-8">
        <div className="max-w-[720px] mx-auto">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-center mb-12 text-[hsl(var(--foreground))]">
            Frequently asked questions
          </h2>
          
          <div className="space-y-0">
            {faqItems.map((item, id) => (
              <div key={id} className="border-b border-[hsl(var(--border))] py-5">
                <button
                  onClick={() => setActiveFaq(activeFaq === id ? null : id)}
                  className="w-full flex items-center justify-between text-left focus:outline-none bg-transparent border-none cursor-pointer group"
                >
                  <span className="font-medium text-[hsl(var(--foreground))] text-base">{item.q}</span>
                  <span className={`transform transition-transform duration-300 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] ${activeFaq === id ? 'rotate-45' : 'rotate-0'}`}>
                    <Plus size={18} />
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${activeFaq === id ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                  <div className="overflow-hidden">
                    <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed pr-10">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-8 pb-16 w-full max-w-[1280px] mx-auto">
        <div className="bg-[#080808] rounded-3xl p-12 md:p-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">Built for teams that move fast.</h3>
            <p className="text-white/50 mt-2">Get started in minutes. No credit card required.</p>
          </div>
          <button 
            onClick={() => navigate('/register')}
            className="bg-white text-black rounded-2xl px-8 py-4 font-semibold text-sm tracking-wide hover:scale-[1.02] transition-transform flex-shrink-0"
          >
            GET STARTED
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--muted))] border-t border-[hsl(var(--border))] py-10 px-8">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[hsl(var(--foreground))]"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
            <span className="text-lg font-[family-name:var(--font-display)] font-bold tracking-tight text-[hsl(var(--foreground))]">filedrive</span>
          </div>
          
          <div className="flex gap-6">
            {['Twitter', 'Dribbble', 'LinkedIn', 'Contact'].map(link => (
              <a key={link} href="#" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors no-underline">
                {link}
              </a>
            ))}
          </div>

          <span className="text-[hsl(var(--muted-foreground))] text-sm">© {new Date().getFullYear()} FileDrive Inc.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
