import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Plus,
  Minus
} from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo.png';

const Landing = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(0);

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
    <div className="min-h-screen bg-[#FDFDFD] text-[#111111] font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#FDFDFD]/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-10 h-20 flex items-center justify-between">
          <div className="flex items-center group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-[18px] font-bold tracking-tighter text-black">filedrive</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-[14px] font-medium text-gray-500 hover:text-black transition-all duration-200 ease-in-out relative group no-underline">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-black transition-all duration-200 ease-in-out group-hover:w-full"></span>
            </a>
            <a href="#pricing" className="text-[14px] font-medium text-gray-500 hover:text-black transition-all duration-200 ease-in-out relative group no-underline">
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-black transition-all duration-200 ease-in-out group-hover:w-full"></span>
            </a>
            <a href="#faq" className="text-[14px] font-medium text-gray-500 hover:text-black transition-all duration-200 ease-in-out relative group no-underline">
              Queries
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-black transition-all duration-200 ease-in-out group-hover:w-full"></span>
            </a>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/login')}
              className="text-[14px] font-medium text-gray-500 hover:text-black transition-all duration-200 ease-in-out hidden sm:block bg-transparent border-0 outline-none hover:no-underline"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-black text-white text-[14px] font-medium rounded-full px-6 py-2.5 transition-all duration-200 ease-in-out hover:opacity-80 hover:scale-[1.02] border-0 outline-none"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 md:pt-48 md:pb-28 bg-[#FDFDFD]">
        <div className="max-w-6xl mx-auto px-10">
          <div className="max-w-3xl flex flex-col gap-7">

            {/* Headline */}
            <h1 className="text-[56px] md:text-[76px] font-medium tracking-tighter text-black leading-[1.06]">
              Your files.<br />
              <em className="not-italic font-light text-gray-400">Organized.</em> Your team, aligned.
            </h1>

            {/* Subtext */}
            <p className="max-w-[520px] text-[17px] text-gray-600 font-normal leading-[1.7]">
              A focused, minimal file management workspace built for teams who value clarity — without the clutter.
            </p>

            {/* CTA */}
            <div className="flex items-center gap-5 pt-1">
              <button
                onClick={() => navigate('/register')}
                className="bg-black text-white text-[14px] font-medium rounded-full px-7 py-3 transition-all duration-200 ease-in-out hover:opacity-80 hover:scale-[1.02] flex items-center gap-2 group shrink-0"
              >
                Start for free
                <ArrowRight size={15} className="text-gray-400 group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section (Swiss Grid Style) */}
      <section id="features" className="py-24 md:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-10">

          <div className="mb-24 flex flex-col md:flex-row md:items-start justify-between gap-8">
            <h2 className="text-5xl md:text-6xl font-medium tracking-tighter text-black max-w-md">
              Designed for focus.
            </h2>
            <p className="text-[18px] text-gray-500 font-normal max-w-sm leading-relaxed md:pt-4">
              We stripped away the noise to build an experience centered entirely on your work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-100">
            {[
              { num: "01", title: "Global synchronization", desc: "Changes propagate across your workspace instantly, everywhere. No reloading, no lag." },
              { num: "02", title: "Granular permissions", desc: "Precise control over who views or edits your team's content with absolute zero friction." },
              { num: "03", title: "Quiet architecture", desc: "An interface designed to stay entirely out of the way. Just your files, beautifully structured." },
              { num: "04", title: "Secured foundation", desc: "Enterprise-grade protection protocols and industry-standard encryption for every single asset." }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className={`group py-12 flex flex-col gap-4 border-b border-gray-100 transition-all duration-500 ease-in-out hover:bg-gray-50/30 ${
                  idx % 2 === 0 ? 'md:pr-16 md:border-r' : 'md:pl-16'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-medium tracking-tight text-black transition-colors duration-300 group-hover:text-black">
                    {feature.title}
                  </h3>
                  <span className="text-[11px] font-bold text-gray-400 tracking-[0.2em] group-hover:text-black transition-colors duration-300">
                    {feature.num}
                  </span>
                </div>
                <p className="text-[17px] text-gray-500 leading-relaxed max-w-[320px] transition-all duration-300 group-hover:text-gray-900">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-20 flex justify-center text-[12px] text-gray-300 font-medium tracking-[0.3em] uppercase">
             Fundamental Principles
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-20 bg-[#FDFDFD]">
        <div className="max-w-6xl mx-auto px-10">
          <div className="mb-20">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black mb-6">Predictable utility.</h2>
            <p className="text-[17px] text-gray-500 font-normal max-w-lg leading-relaxed">
              Simple, transparent structures for teams of all scales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {[
              { name: "Starter", price: "₹299", desc: "Essential mechanics designed for singular individuals and emerging setups.", feats: ["5GB cloud storage", "Single organization", "Core interface access"] },
              { name: "Basic", price: "₹799", desc: "Our prioritized structure enabling fast-moving teams to excel.", feats: ["100GB swift storage", "Multiple organizations", "Advanced permission tiering"], active: true },
              { name: "Enterprise", price: "₹4000", desc: "Infinite scale capability and tailored considerations for large accounts.", feats: ["Uncapped storage limits", "Dedicated relationship manager", "Customized API endpoints"] }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 border rounded-2xl flex flex-col bg-white transition-all duration-300 ease-in-out ${plan.active
                    ? 'border-gray-300 shadow-sm md:scale-105 z-10'
                    : 'border-gray-100 hover:border-gray-200'
                  }`}
              >
                <h4 className="text-[14px] font-medium text-gray-500 mb-6">{plan.name}</h4>
                <div className="text-[40px] font-medium tracking-tighter text-black mb-2">{plan.price}<span className="text-[14px] text-gray-400 font-normal tracking-normal">/mo</span></div>
                <p className="text-[14px] text-gray-500 leading-relaxed mb-10 min-h-[60px]">{plan.desc}</p>

                <div className="space-y-4 mb-12 flex-1">
                  {plan.feats.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                      <span className="text-[14px] text-gray-700">{feat}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate('/register')} className="border border-gray-200 text-gray-700 font-medium rounded-full px-6 py-3 transition-all duration-200 ease-in-out hover:bg-gray-100 hover:scale-[1.02] w-full mt-auto">
                  Select {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section (Split Layout) */}
      <section id="faq" className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-10 grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-32">
          <div className="md:col-span-5">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black mb-6">Clarifications.</h2>
            <p className="text-[16px] text-gray-500 font-normal leading-relaxed mb-8">
              Answers to specific intricacies. Don't see your question? Contact us directly.
            </p>
            <a href="mailto:contact@filedrive.inc" className="text-[14px] font-medium text-gray-700 border-b border-gray-300 pb-1 hover:text-black hover:border-black transition-all duration-200 ease-in-out">
              Email support
            </a>
          </div>

          <div className="md:col-span-12 lg:col-span-7">
            <div className="space-y-2">
              {faqItems.map((item, id) => (
                <div
                  key={id}
                  className={`border border-gray-100 rounded-2xl transition-all duration-300 ${activeFaq === id ? 'bg-white shadow-sm border-gray-200' : 'bg-transparent hover:border-gray-200'
                    }`}
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === id ? null : id)}
                    className="w-full px-7 py-6 flex items-center justify-between text-left focus:outline-none bg-transparent border-none cursor-pointer group"
                  >
                    <span className={`text-[16px] tracking-tight transition-colors duration-300 ${activeFaq === id ? 'text-black font-medium' : 'text-gray-500 group-hover:text-black'}`}>{item.q}</span>
                    <span className="flex justify-end shrink-0 ml-4 transition-transform duration-300">
                      {activeFaq === id ?
                        <Minus size={18} className="text-black" /> :
                        <Plus size={18} className="text-gray-400 group-hover:text-black" />
                      }
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${activeFaq === id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-7 pb-6 text-[15px] text-gray-500 font-normal leading-relaxed pr-12">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 md:py-16 bg-[#FDFDFD]">
        <div className="max-w-6xl mx-auto px-10 border-t border-gray-100 pt-12 md:pt-16">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <h3 className="text-4xl md:text-5xl font-medium tracking-tight text-black mb-6">Equip your team.</h3>
              <p className="text-[17px] text-gray-500 font-normal leading-relaxed">
                Embrace an environment free from notifications, dashboards, and visual saturation.
                Return to focus.
              </p>
            </div>
            <button onClick={() => navigate('/register')} className="bg-black text-white font-medium rounded-full px-6 py-3 transition-all duration-200 ease-in-out hover:opacity-80 hover:scale-[1.02] flex items-center gap-2 group shrink-0">
              Setup workspace
              <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-8 bg-[#FDFDFD]">
        <div className="max-w-6xl mx-auto px-10">
          <div className="flex flex-col sm:flex-row justify-between items-center pt-10 border-t border-gray-100 text-[13px] gap-8">
            <div className="flex items-center">
              <span className="text-[17px] font-bold tracking-tighter text-black">filedrive</span>
            </div>

            <div className="flex gap-10">
              <a href="#" className="text-gray-500 hover:text-black transition-colors duration-200 ease-in-out no-underline font-medium">Features</a>
              <a href="#" className="text-gray-500 hover:text-black transition-colors duration-200 ease-in-out no-underline font-medium">Pricing</a>
              <a href="#" className="text-gray-500 hover:text-black transition-colors duration-200 ease-in-out no-underline font-medium">Queries</a>
            </div>

            <span className="text-gray-400">© {new Date().getFullYear()} Operations.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
