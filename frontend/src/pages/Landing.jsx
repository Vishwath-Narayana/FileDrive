import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  ChevronRight, 
  Plus, 
  Layout, 
  Shield, 
  Zap, 
  FileText, 
  Users, 
  Globe,
  PlusCircle,
  Clock,
  ChevronDown,
  X
} from 'lucide-react';
import { useState } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  const faqItems = [
    {
      q: "Is my data secure on FileDrive?",
      a: "Yes, we use industry-standard encryption and secure Cloudinary storage to ensure your files are always protected and private."
    },
    {
      q: "Can I collaborate with my team?",
      a: "Absolutely. FileDrive is built for organizations. You can invite team members and manage their roles (Admin, Editor, Viewer) easily."
    },
    {
      q: "What file types do you support?",
      a: "We support a wide range of file types including PDFs, images (PNG, JPG, SVG), CSVs, and plain text files."
    },
    {
      q: "How does the pricing work?",
      a: "We offer a generous free tier for individuals and small teams, with scalable plans for larger organizations as they grow."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-[#F0F0F0]">
        <div className="max-w-7xl mx-auto px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-[10px]">F</span>
            </div>
            <span className="text-sm font-bold tracking-tight">FileDrive</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors">Features</a>
            <a href="#pricing" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors">Pricing</a>
            <a href="#faq" className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors">Resources</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-[11px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-black text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded transition-all shadow-lg shadow-black/5"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden grid-pattern border-b border-dashed border-[#F0F0F0]">
        <div className="section-container !py-0 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#F0F0F0] text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Operational
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-black mb-6 hero-text-glow leading-[1.05] animate-in fade-in slide-in-from-bottom-4 duration-700">
            Smart file management  <br />
            for modern teams.
          </h1>
          
          <p className="max-w-xl mx-auto text-base text-gray-400 font-medium mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Secure, clean, and blazingly fast file management. Use our robust organization system to keep your team's assets synchronized.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <button 
              onClick={() => navigate('/register')}
              className="w-full md:w-auto bg-black text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 group"
            >
              Sign up
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full md:w-auto bg-white text-black text-xs font-bold uppercase tracking-widest px-8 py-4 rounded border border-[#F0F0F0] hover:bg-[#FAFAFA] transition-all">
              Learn more
            </button>
          </div>
        </div>
      </section>

      {/* Comparison Section (Optimized per Image 4) */}
      <section id="features" className="bg-white py-20 border-b border-dashed border-[#F0F0F0]">
        <div className="section-container !py-0">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4">Why choose us over others?</h2>
            <p className="text-sm text-gray-400 font-medium max-w-lg mx-auto leading-relaxed">
              We treat docs like a first-class citizen of your product. Devs notice the difference.
            </p>
          </div>

          <div className="max-w-4xl mx-auto relative group">
            <div className="grid grid-cols-1 lg:grid-cols-10 border border-[#F0F0F0] rounded-xl overflow-hidden bg-white shadow-sm">
              {/* Features List */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="p-8 md:p-10 pb-0">
                   <div className="px-6 py-4 border border-dashed border-[#F0F0F0] rounded flex justify-between items-center mb-8">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Feature</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Others</div>
                   </div>
                </div>

                <div className="px-8 md:px-10 pb-10 space-y-1">
                  {[
                    { name: "Real-Time File Sync", ours: true, others: true },
                    { name: "Organization-Based Collaboration", ours: true, others: true },
                    { name: "Instant Updates Without Refresh", ours: true, others: false },
                    { name: "Secure File Upload & Storage", ours: true, others: true },
                    { name: "Role-Based Access Control", ours: true, others: false },
                    { name: "Magic Link Invitations", ours: true, others: false },
                    { name: "Centralized File Dashboard", ours: true, others: true },
                    { name: "Live Activity Updates", ours: true, others: false },
                    { name: "Fast & Responsive Interface", ours: true, others: false },
                  ].map((item, id) => (
                    <div key={id} className="grid grid-cols-10 py-3.5 items-center border-b border-gray-50 last:border-0 group/item">
                      <span className="col-span-7 text-[13px] font-bold text-gray-600 group-hover/item:text-black transition-colors">{item.name}</span>
                      <div className="col-span-3 flex justify-end pr-4">
                        {item.others ? <Check size={14} className="text-gray-400" /> : <X size={14} className="text-gray-200" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Our Agency Column */}
              <div className="lg:col-span-4 bg-black p-8 md:p-10 flex flex-col">
                <div className="text-center mb-10">
                   <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">Our Agency</span>
                </div>
                
                <div className="space-y-7 flex-1 flex flex-col justify-center">
                  {[
                    "Custom, Brand-Tailored Design",
                    "Custom, Brand-Tailored Design",
                    "Fast Turnaround Time",
                    "Transparent Communication",
                    "Ongoing Post-Launch Support",
                    "SEO & Speed Optimization",
                    "Modern Tools (Framer, Figma, etc.)",
                    "Scalable & Maintainable Systems",
                    "Covers all your needs?"
                  ].map((item, id) => (
                    <div key={id} className="flex items-center gap-4">
                      <Check size={11} className="text-white" strokeWidth={4} />
                      <span className="text-[12px] font-bold text-gray-100 tracking-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Maintained consistent with Refinements) */}
      <section id="pricing" className="py-20 bg-white border-b border-dashed border-[#F0F0F0]">
        <div className="section-container !py-0 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4">Simple Plans, Built for Serious Teams</h2>
          <p className="text-sm text-gray-400 font-medium max-w-lg mx-auto mb-16 leading-relaxed">
            FileDrive has a plan designed to meet your needs. <br /> No bloat, no fluff — just what works.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-[#FAFAFA]/50 border border-dashed border-[#F0F0F0] rounded-xl p-8 flex flex-col text-left group hover:border-black transition-colors duration-500">
              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Starter</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-black">₹299/month</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-8 leading-relaxed">Perfect for MVPs, landing pages, or focused docs.</p>
              <div className="space-y-3 mb-10 flex-1">
                {['One responsive docs page', 'Brand-aligned theme + typography', 'Static export or Framer handoff', 'Light content guidance', 'Single page docs site'].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Check size={10} className="text-gray-300" strokeWidth={3} />
                    <span className="text-[11px] font-bold text-gray-500">{feat}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/register')} className="w-full py-3 bg-[#EFEFEF] hover:bg-black hover:text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all">Start today</button>
            </div>

            {/* Basic */}
            <div className="bg-white border border-black rounded-xl p-8 flex flex-col text-left group shadow-2xl shadow-black/5">
              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Basic</h4>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-sm line-through font-bold">₹1000/month</span>
                  <span className="text-2xl font-bold text-black">₹799/month</span>
                  <span className="text-[9px] font-bold text-green-500 uppercase bg-green-50 px-1.5 py-0.5 rounded tracking-tighter">-0% off</span>
                </div>
              </div>
              <p className="text-xs text-black font-medium mb-8 leading-relaxed">Full documentation site with a structured system.</p>
              <div className="space-y-3 mb-10 flex-1">
                {['Multi-page documentation site', 'Content architecture & navigation tree', 'Design tokens & components', 'Dev-ready assets (Figma + MDX export)', 'Support for changelogs, guides, or SDK pages'].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Check size={10} className="text-black" strokeWidth={3} />
                    <span className="text-[11px] font-bold text-black">{feat}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/register')} className="w-full py-3 bg-black text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">Start today</button>
            </div>

            {/* Enterprise */}
            <div className="bg-[#FAFAFA]/50 border border-dashed border-[#F0F0F0] rounded-xl p-8 flex flex-col text-left group hover:border-black transition-colors duration-500">
              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Enterprise</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-black">₹4000/month</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-8 leading-relaxed">End-to-end developer portal, fully tailored.</p>
              <div className="space-y-3 mb-10 flex-1">
                {['Full portal system (docs, onboarding, APIs)', 'Interactive demos & API explorers', 'Custom components + advanced UX', 'Team collaboration & feedback loops', 'Optional build-out in Framer, Astro, or Next.js'].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Check size={10} className="text-gray-300" strokeWidth={3} />
                    <span className="text-[11px] font-bold text-gray-500">{feat}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/register')} className="w-full py-3 bg-[#EFEFEF] hover:bg-black hover:text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all">Start today</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (Redesigned per Image 6) */}
      <section id="faq" className="py-24 bg-white border-b border-dashed border-[#F0F0F0]">
        <div className="section-container !py-0 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4">Answers to some Questions</h2>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">Everything you need to know about FileDrive.</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, id) => (
              <div 
                key={id} 
                className={`bg-[#F5F5F5] border-2 rounded-xl transition-all duration-300 ${activeFaq === id ? 'border-black' : 'border-[#F0F0F0] hover:border-black/20'}`}
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === id ? null : id)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <span className="font-bold text-black text-sm tracking-tight">{item.q}</span>
                  <Plus size={16} className={`text-gray-400 transform transition-transform duration-300 ${activeFaq === id ? 'rotate-45 text-black' : ''}`} />
                </button>
                {activeFaq === id && (
                  <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
             <div className="inline-flex flex-col items-center">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Have more questions?</p>
                <button className="bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] px-10 py-3.5 rounded-full shadow-lg">Contact us</button>
             </div>
          </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <div className="max-w-7xl mx-auto px-8 py-16">
         <div className="bg-black text-white rounded-[32px] p-16 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
            <div className="relative z-10">
               <h3 className="text-3xl font-bold tracking-tighter mb-4">Let's Make Docs That Devs Trust.</h3>
               <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em] max-w-md leading-relaxed">Book a call or send a brief — we'll respond fast, we mean really really super fast, don't believe?</p>
            </div>
            <button onClick={() => navigate('/register')} className="relative z-10 bg-white text-black text-[11px] font-bold uppercase tracking-widest px-12 py-5 rounded-2xl shadow-2xl transition-transform hover:scale-105">Get Started</button>
            
            {/* Visual Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors"></div>
         </div>
      </div>

      {/* Mini Footer */}
      <footer className="border-t border-dashed border-[#F0F0F0] py-10 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">F</span>
            </div>
            <span className="text-xs font-bold tracking-tight uppercase">FileDrive</span>
          </div>
          
          <div className="flex gap-10 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            <a href="#" className="text-gray-400 no-underline hover:text-black transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 no-underline hover:text-black transition-colors">Dribbble</a>
            <a href="#" className="text-gray-400 no-underline hover:text-black transition-colors">LinkedIn</a>
            <a href="#" className="text-gray-400 no-underline hover:text-black transition-colors">Contact</a>
          </div>

          <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            © 2026 FIledrive Inc.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
