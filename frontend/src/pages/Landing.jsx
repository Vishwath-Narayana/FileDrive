import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Folder, File, Search, Heart, Share2, Users, Lock, ChevronDown, 
  Check, X, Shield, Activity, Plus, Play, Info, ArrowRight, 
  Layout, Database, Star, Bell, Compass, Settings, Clock, Sparkles
} from 'lucide-react';
import logo from '../assets/logo.png';

// ═══════════════════════════════════════════════════
// CUSTOM REACT HOOKS FOR ANIMATIONS
// ═══════════════════════════════════════════════════

const useCountUp = (target, duration = 1200, trigger = true) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const end = parseFloat(target);
    if (isNaN(end)) return;
    const startTime = performance.now();
    const run = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Easing function (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      const val = easeProgress * end;
      setCount(Number(val.toFixed(target.toString().includes('.') ? 1 : 0)));
      if (progress < 1) {
        requestAnimationFrame(run);
      }
    };
    requestAnimationFrame(run);
  }, [target, duration, trigger]);
  return count;
};

// ═══════════════════════════════════════════════════
// DYNAMIC UTILITY COMPONENTS
// ═══════════════════════════════════════════════════

const ViewportCounter = ({ targetValue, duration = 1200, suffix = '', decimals = 0 }) => {
  const ref = useRef(null);
  const [trigger, setTrigger] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTrigger(true);
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(targetValue, duration, trigger);

  return (
    <span ref={ref} style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const ScrollReveal = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
      }
    }, { threshold: 0.05 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 16px, 0)',
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// MAIN LANDING COMPONENT
// ═══════════════════════════════════════════════════

const Landing = () => {
  const navigate = useNavigate();
  
  // Interactive component states
  const [activeFaq, setActiveFaq] = useState(null);
  const [starredFiles, setStarredFiles] = useState([2, 4]); // indices of starred items
  const [currentOrgTab, setCurrentOrgTab] = useState('marketing'); // 'marketing' | 'engineering'
  const [selectedRoleMatrix, setSelectedRoleMatrix] = useState('admin'); // 'admin' | 'editor' | 'viewer'
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('files'); // 'files' | 'teams' | 'permissions'
  const [scrollDepth, setScrollDepth] = useState(0);

  // Scroll tracking for transparent-to-blur navbar transition
  useEffect(() => {
    const handleScroll = () => {
      setScrollDepth(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // FAQ Contents
  const faqItems = [
    {
      q: "Can I manage multiple organizations under one account?",
      a: "Yes. You can isolate different projects, business divisions, or clients by creating dedicated organization nodes. Each organization operates with independent member pools, billing boundaries, and storage allocations."
    },
    {
      q: "How does the role-based permission hierarchy work?",
      a: "Permissions are managed via strict Role-Based Access Control (RBAC). Admin roles grant complete control over organizations, Editors allow uploading and editing file metadata, while Viewers have read-only access."
    },
    {
      q: "Are editors permitted to delete organization files?",
      a: "No. To protect your company assets from accidental data loss, only organization Admins possess the permissions required to permanently delete files and directories."
    },
    {
      q: "How secure are my files in FileDrive?",
      a: "Your files are cryptographically isolated and encrypted at rest and in transit. All user sessions and API interactions are secured through modern JWT validation to enforce strict security boundaries."
    },
    {
      q: "Can I invite external partners to specific folders?",
      a: "Yes. You can invite external stakeholders, clients, or contractors to specific organization nodes with custom restricted roles using secure, token-based invitation links."
    },
    {
      q: "Is there a free tier for individual creators?",
      a: "Yes. Our Starter plan is completely free for individual creators and personal workspaces, supporting standard file sharing and core document uploads up to 5 GB."
    }
  ];

  const toggleStar = (idx) => {
    if (starredFiles.includes(idx)) {
      setStarredFiles(prev => prev.filter(i => i !== idx));
    } else {
      setStarredFiles(prev => [...prev, idx]);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060608',
      color: '#FFFFFF',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      
      {/* LOCAL STYLES & REFINED CARD HOVER TRANSLATIONS */}
      <style>{`
        /* Refined card layout styling */
        .card-refined {
          background: #0B0B0E;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease, box-shadow 0.35s ease;
          position: relative;
          z-index: 10;
        }
        .card-refined:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        /* Subtle indicator pulsers */
        .live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22C55E;
          display: inline-block;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
        }

        /* Active navigation links indicator */
        .nav-link-active {
          color: #FFFFFF !important;
          position: relative;
        }
        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: -20px; left: 0; right: 0;
          height: 2px;
          background: #FF7A00;
        }

        /* General section layout */
        .section-padding {
          padding: 130px 24px;
        }
        @media (max-width: 768px) {
          .section-padding {
            padding: 90px 20px;
          }
        }
      `}</style>

      {/* BACKGROUND GRADIENTS (Subtle and low opacity) */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.012) 1.2px, transparent 1.2px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      <div 
        style={{
          position: 'absolute',
          top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: '75vw', height: '45vw',
          background: 'radial-gradient(circle, rgba(255,107,0,0.035) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* NAVIGATION BAR */}
      <nav 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          height: '64px',
          display: 'flex', alignItems: 'center',
          background: scrollDepth > 20 ? 'rgba(6, 6, 8, 0.85)' : 'transparent',
          borderBottom: scrollDepth > 20 ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent',
          backdropFilter: scrollDepth > 20 ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrollDepth > 20 ? 'blur(12px)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{
          width: '100%', maxWidth: '1200px', margin: '0 auto',
          padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logo} alt="FileDrive Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
            <span style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' }}>filedrive</span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="hidden md:flex">
            <a href="#workspace" className={scrollDepth >= 350 && scrollDepth < 1100 ? 'nav-link-active' : ''} style={{ fontSize: '13px', color: '#80808A', textDecoration: 'none', transition: 'color 150ms' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Workspace</a>
            <a href="#organizations" className={scrollDepth >= 1100 && scrollDepth < 1900 ? 'nav-link-active' : ''} style={{ fontSize: '13px', color: '#80808A', textDecoration: 'none', transition: 'color 150ms' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Teams</a>
            <a href="#permissions" className={scrollDepth >= 1900 && scrollDepth < 2750 ? 'nav-link-active' : ''} style={{ fontSize: '13px', color: '#80808A', textDecoration: 'none', transition: 'color 150ms' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Permissions</a>
            <a href="#pricing" className={scrollDepth >= 2750 ? 'nav-link-active' : ''} style={{ fontSize: '13px', color: '#80808A', textDecoration: 'none', transition: 'color 150ms' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Pricing</a>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: 'none', border: 'none', color: '#80808A', fontSize: '13px', cursor: 'pointer',
                fontWeight: 500, transition: 'color 150ms'
              }}
              onMouseEnter={e=>e.currentTarget.style.color='#FFF'}
              onMouseLeave={e=>e.currentTarget.style.color='#80808A'}
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              style={{
                height: '32px', padding: '0 14px', fontSize: '12px',
                background: '#FF7A00', borderRadius: '6px', fontWeight: 600,
                color: '#FFFFFF', border: 'none', cursor: 'pointer',
                transition: 'background 150ms ease'
              }}
              onMouseEnter={e=>e.currentTarget.style.background='#FF8D1A'}
              onMouseLeave={e=>e.currentTarget.style.background='#FF7A00'}
            >
              Create Workspace
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        paddingTop: '160px',
        paddingBottom: '100px',
        paddingLeft: '24px', paddingRight: '24px',
        textAlign: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Micro-badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '100px', background: 'rgba(255, 122, 0, 0.06)',
            border: '1px solid rgba(255, 122, 0, 0.12)', color: '#FF7A00',
            fontFamily: 'var(--font-mono)', fontSize: '10.5px', fontWeight: 600,
            marginBottom: '26px', letterSpacing: '0.04em'
          }}>
            <Sparkles size={11} />
            <span>INTRODUCING FILEDRIVE 2.0</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(44px, 6.8vw, 84px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: '960px',
            margin: '0 auto 24px',
            color: '#FFFFFF'
          }}>
            One Workspace For <br />
            Every File And Every Team.
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: '16px',
            color: '#B8B8C2',
            maxWidth: '580px',
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Upload files, create organizations, invite members, assign roles, and collaborate from a single powerful workspace.
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '90px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/register')}
              style={{
                height: '44px', padding: '0 24px', fontSize: '13px', fontWeight: 600,
                background: '#FF7A00', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px',
                color: '#FFFFFF', border: 'none', cursor: 'pointer', transition: 'background 150ms ease'
              }}
              onMouseEnter={e=>e.currentTarget.style.background='#FF8D1A'}
              onMouseLeave={e=>e.currentTarget.style.background='#FF7A00'}
            >
              Create Workspace <ArrowRight size={15} />
            </button>
            <button 
              onClick={() => document.getElementById('showcase').scrollIntoView({ behavior: 'smooth' })}
              style={{
                height: '44px', padding: '0 24px', fontSize: '13px', fontWeight: 600,
                borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)',
                color: '#FFFFFF', cursor: 'pointer', transition: 'background 150ms ease'
              }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
            >
              <Play size={13} fill="#FFF" /> Watch Demo
            </button>
          </div>

          {/* STATIC HIGH-QUALITY HERO DASHBOARD MOCKUP */}
          <div style={{
            maxWidth: '1060px',
            margin: '0 auto',
            background: '#0B0B0E',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.04)',
            overflow: 'hidden',
            display: 'flex',
            textAlign: 'left'
          }}>
            
            {/* Sidebar Mockup */}
            <div style={{
              width: '240px',
              borderRight: '1px solid rgba(255, 255, 255, 0.06)',
              background: '#08080A',
              padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '24px'
            }} className="hidden md:flex">
              {/* Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#A1A1AA' }}>VN</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Vishwath Narayana</span>
                  <span style={{ fontSize: '10px', color: '#55555E' }}>vortex_agency</span>
                </div>
              </div>

              {/* Workspace links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#55555E', fontWeight: 600, letterSpacing: '0.04em' }}>PERSONAL WORKSPACE</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', fontSize: '12px' }}>
                    <Folder size={14} style={{ color: '#FF7A00' }} />
                    <span style={{ fontWeight: 600 }}>All Files</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', fontSize: '12px', color: '#A1A1AA' }}>
                    <Heart size={14} />
                    <span>Favorites</span>
                  </div>
                </div>
              </div>

              {/* Organizations links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#55555E', fontWeight: 600, letterSpacing: '0.04em' }}>ORGANIZATIONS</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '12px', color: '#A1A1AA' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                    <span>Marketing Team</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '12px', color: '#A1A1AA' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
                    <span>Engineering Team</span>
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#A1A1AA' }}>
                  <span>Storage Used</span>
                  <span>12.4 GB / 100 GB</span>
                </div>
                <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ width: '12.4%', height: '100%', background: '#FF7A00' }} />
                </div>
              </div>
            </div>

            {/* Main Content Pane */}
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>Personal Workspace</span>
                  <ChevronDown size={14} style={{ color: '#55555E' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '6px' }}>
                    <Search size={12} style={{ color: '#55555E' }} />
                    <span style={{ fontSize: '11px', color: '#55555E' }}>Search assets...</span>
                  </div>
                </div>
              </div>

              {/* Grid Widgets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                
                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '16px' }}>
                  <span style={{ fontSize: '10px', color: '#80808A', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>STORAGE ALLOCATION</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px' }}>12.4% <span style={{ fontSize: '12px', fontWeight: 500, color: '#80808A' }}>utilized</span></div>
                  <div style={{ fontSize: '11px', color: '#80808A' }}>87.6 GB pool remaining</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '16px' }}>
                  <span style={{ fontSize: '10px', color: '#80808A', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>ACTIVE CLIENT NODES</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px' }}>6 <span style={{ fontSize: '12px', fontWeight: 500, color: '#80808A' }}>members</span></div>
                  <div style={{ display: 'flex', gap: '-6px', marginTop: '6px' }}>
                    {['S', 'M', 'E', 'J', 'D', '+2'].map((c, i) => (
                      <div key={i} style={{
                        width: '20px', height: '20px', borderRadius: '50%', background: i===5?'#FF7A00':'#27272A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700,
                        border: '1.5px solid #0B0B0E', marginLeft: i>0?'-6px':'0'
                      }}>{c}</div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Table details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '10px', color: '#80808A', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>RECENTLY UPLOADED ASSETS</span>
                <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                  {[
                    { name: 'marketing_pitch_v3.pdf', size: '12.4 MB', date: 'Just now', type: 'document' },
                    { name: 'homepage_hero_final.fig', size: '42.8 MB', date: '12 mins ago', type: 'design' },
                    { name: 'financials_q4.xlsx', size: '2.1 MB', date: '1 hour ago', type: 'sheet' },
                    { name: 'user_research_clip.mp4', size: '154.0 MB', date: 'Yesterday', type: 'video' }
                  ].map((file, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', justifycontent: 'space-between',
                      padding: '12px 16px', borderBottom: idx < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: 'rgba(255,255,255,0.01)', fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '250px' }}>
                        <File size={14} style={{ color: '#FF7A00' }} />
                        <span style={{ fontWeight: 500 }}>{file.name}</span>
                      </div>
                      <span style={{ color: '#80808A', width: '80px' }}>{file.size}</span>
                      <span style={{ color: '#80808A', width: '100px' }}>{file.date}</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '14px', color: '#80808A' }}>
                        <Star size={13} style={{ cursor: 'pointer' }} />
                        <Share2 size={13} style={{ cursor: 'pointer' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 2: TRUST BAR (Marquee) */}
      <section style={{
        padding: '36px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: '#08080A',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', opacity: 0.45 }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: '#A1A1AA' }}>SUPPORTING ASSETS FOR</span>
          {['TEAMS', 'STARTUPS', 'AGENCIES', 'ENTERPRISES'].map((text, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '6px', height: '6px', background: '#FF7A00', borderRadius: '50%' }} />
              <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.04em' }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: PERSONAL WORKSPACE */}
      <section id="workspace" className="section-padding" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'center' }}>
          
          {/* Copywriting */}
          <div style={{ textAlign: 'left' }}>
            <ScrollReveal>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Personal Storage</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '12px 0 18px', lineHeight: 1.2, color: '#FFFFFF' }}>A Home For Your Files.</h2>
              <p style={{ fontSize: '15px', color: '#B8B8C2', lineHeight: 1.6, marginBottom: '28px', maxWidth: '580px' }}>
                Manage all your personal assets securely. Our high-fidelity explorer makes uploading, searching, favoriting, and organizing files clean, intuitive, and extremely fast.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {['Instant file uploads without loading lags', 'Search assets instantly with quick filters', 'Pin critical documents to your Favorites bar'].map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Interactive File Explorer UI */}
          <div className="card-refined" style={{ padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#80808A', fontFamily: 'var(--font-mono)' }}>explorer.app</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { name: 'Designs', items: 12, date: 'May 14' },
                { name: 'Analytics', items: 4, date: 'Apr 28' },
                { name: 'pitch_deck.pdf', isFile: true, size: '8.4 MB' },
                { name: 'ui_roadmap.fig', isFile: true, size: '14.2 MB' },
                { name: 'revenue.xlsx', isFile: true, size: '2.1 MB' },
                { name: 'Legal Documents', items: 8, date: 'Mar 12' }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  style={{
                    background: 'rgba(255,255,255,0.015)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '8px', padding: '14px', cursor: 'pointer',
                    transition: 'all 200ms ease',
                    position: 'relative'
                  }}
                  onClick={() => item.isFile && toggleStar(idx)}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,122,0,0.3)';
                    e.currentTarget.style.background = 'rgba(255,122,0,0.02)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    {item.isFile ? <File size={16} style={{ color: '#80808A' }} /> : <Folder size={16} style={{ color: '#FF7A00' }} />}
                    {item.isFile && (
                      <Star 
                        size={12} 
                        style={{ 
                          color: starredFiles.includes(idx) ? '#FF7A00' : '#55555E',
                          fill: starredFiles.includes(idx) ? '#FF7A00' : 'none'
                        }} 
                      />
                    )}
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: '#80808A', marginTop: '4px' }}>
                    {item.isFile ? item.size : `${item.items} items • ${item.date}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: ORGANIZATIONS */}
      <section id="organizations" className="section-padding" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: '#08080A'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
            <ScrollReveal>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shared Workspaces</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '12px 0 16px', lineHeight: 1.2, color: '#FFFFFF' }}>Create Teams In Seconds.</h2>
              <p style={{ fontSize: '15px', color: '#B8B8C2', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto' }}>
                Turn your personal workspace into a collaborative team machine. Spin up shared organization hubs, scope folders, and sync resources with zero integration hurdles.
              </p>
            </ScrollReveal>
          </div>

          <div className="card-refined" style={{
            maxWidth: '800px', margin: '0 auto',
            overflow: 'hidden'
          }}>
            
            {/* Tabs selector */}
            <div style={{ display: 'flex', background: '#08080A', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <button 
                onClick={() => setCurrentOrgTab('marketing')}
                style={{
                  flex: 1, padding: '16px', border: 'none', background: currentOrgTab === 'marketing' ? '#0B0B0E' : 'none',
                  color: currentOrgTab === 'marketing' ? '#FF7A00' : '#80808A', fontWeight: 600, cursor: 'pointer',
                  fontSize: '13px', borderBottom: currentOrgTab === 'marketing' ? '2px solid #FF7A00' : 'none'
                }}
              >
                Marketing Team Node
              </button>
              <button 
                onClick={() => setCurrentOrgTab('engineering')}
                style={{
                  flex: 1, padding: '16px', border: 'none', background: currentOrgTab === 'engineering' ? '#0B0B0E' : 'none',
                  color: currentOrgTab === 'engineering' ? '#FF7A00' : '#80808A', fontWeight: 600, cursor: 'pointer',
                  fontSize: '13px', borderBottom: currentOrgTab === 'engineering' ? '2px solid #FF7A00' : 'none'
                }}
              >
                Engineering Team Node
              </button>
            </div>

            {/* Org Tree View */}
            <div style={{ padding: '32px', textAlign: 'left' }}>
              {currentOrgTab === 'marketing' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="live-dot" />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Marketing Team Workspace</span>
                  </div>

                  <div style={{ paddingLeft: '24px', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>SN</div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Sarah Nelson</div>
                          <div style={{ fontSize: '10px', color: '#80808A' }}>sarah@filedrive.com</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,122,0,0.1)', color: '#FF7A00', fontFamily: 'var(--font-mono)' }}>ADMIN</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>MC</div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Mike Carter</div>
                          <div style={{ fontSize: '10px', color: '#80808A' }}>mike@filedrive.com</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#A1A1AA', fontFamily: 'var(--font-mono)' }}>EDITOR</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>EL</div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Emma Lee</div>
                          <div style={{ fontSize: '10px', color: '#80808A' }}>emma@filedrive.com</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: '#80808A', fontFamily: 'var(--font-mono)' }}>VIEWER</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Engineering Team Workspace</span>
                  </div>

                  <div style={{ paddingLeft: '24px', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>DH</div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>David Harris</div>
                          <div style={{ fontSize: '10px', color: '#80808A' }}>david@filedrive.com</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,122,0,0.1)', color: '#FF7A00', fontFamily: 'var(--font-mono)' }}>ADMIN</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>JS</div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>John Smith</div>
                          <div style={{ fontSize: '10px', color: '#80808A' }}>john@filedrive.com</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#A1A1AA', fontFamily: 'var(--font-mono)' }}>EDITOR</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: PERMISSIONS */}
      <section id="permissions" className="section-padding" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'center' }}>
          
          {/* Details */}
          <div style={{ textAlign: 'left' }}>
            <ScrollReveal>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Security & Scopes</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '12px 0 18px', lineHeight: 1.2, color: '#FFFFFF' }}>Everyone Sees Exactly What They Should.</h2>
              <p style={{ fontSize: '15px', color: '#B8B8C2', lineHeight: 1.6, marginBottom: '28px', maxWidth: '580px' }}>
                Deploy Role-Based Access Control to prevent asset tampering. Set distinct user capabilities for Admin, Editor, and Viewer layers.
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {['admin', 'editor', 'viewer'].map(role => (
                  <button 
                    key={role}
                    onClick={() => setSelectedRoleMatrix(role)}
                    style={{
                      height: '28px', padding: '0 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                      textTransform: 'uppercase', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)',
                      background: selectedRoleMatrix === role ? '#FF7A00' : 'rgba(255,255,255,0.02)',
                      color: selectedRoleMatrix === role ? '#FFFFFF' : '#80808A',
                      transition: 'all 150ms'
                    }}
                  >
                    {role} Scope
                  </button>
                ))}
              </div>

              {/* Description box */}
              <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '16px', fontSize: '13px', color: '#B8B8C2', minHeight: '80px' }}>
                {selectedRoleMatrix === 'admin' && "Admins hold full control over the workspace: they can invite members, manage permissions, upload/edit files, and permanently delete assets."}
                {selectedRoleMatrix === 'editor' && "Editors can collaborate fully on files. They possess the permission to upload and edit metadata, but cannot delete files or change member invite tokens."}
                {selectedRoleMatrix === 'viewer' && "Viewers have read-only access. They can browse assets and download resources, but are blocked from uploading, editing, or deleting any folder contents."}
              </div>
            </ScrollReveal>
          </div>

          {/* High-fidelity table matrix card */}
          <div className="card-refined" style={{ padding: '24px', textAlign: 'left' }}>
            <span style={{ fontSize: '10px', color: '#80808A', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '16px' }}>ROLE PERMISSION MATRIX</span>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#80808A' }}>
                  <th style={{ textAlign: 'left', paddingBottom: '12px', fontWeight: 600 }}>Permission</th>
                  <th style={{ textAlign: 'center', paddingBottom: '12px', fontWeight: 600 }}>Admin</th>
                  <th style={{ textAlign: 'center', paddingBottom: '12px', fontWeight: 600 }}>Editor</th>
                  <th style={{ textAlign: 'center', paddingBottom: '12px', fontWeight: 600 }}>Viewer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Upload Files', admin: true, editor: true, viewer: false },
                  { label: 'Edit Metadata', admin: true, editor: true, viewer: false },
                  { label: 'Delete Files', admin: true, editor: false, viewer: false },
                  { label: 'View Assets', admin: true, editor: true, viewer: true }
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i<3?'1px solid rgba(255,255,255,0.04)':'none', color: '#FFFFFF' }}>
                    <td style={{ padding: '14px 0', fontWeight: 500 }}>{row.label}</td>
                    <td style={{ textAlign: 'center', padding: '14px 0' }}>
                      {row.admin ? <Check size={14} style={{ color: '#FF7A00', margin: '0 auto' }} /> : <X size={14} style={{ color: '#55555E', margin: '0 auto' }} />}
                    </td>
                    <td style={{ textAlign: 'center', padding: '14px 0' }}>
                      {row.editor ? <Check size={14} style={{ color: '#FF7A00', margin: '0 auto' }} /> : <X size={14} style={{ color: '#55555E', margin: '0 auto' }} />}
                    </td>
                    <td style={{ textAlign: 'center', padding: '14px 0' }}>
                      {row.viewer ? <Check size={14} style={{ color: '#FF7A00', margin: '0 auto' }} /> : <X size={14} style={{ color: '#55555E', margin: '0 auto' }} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* SECTION 6: COLLABORATION */}
      <section className="section-padding" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: '#08080A'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'center' }}>
          
          {/* Static Activity Feed mockup */}
          <div className="card-refined" style={{
            padding: '24px', textAlign: 'left', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '10px', color: '#FF7A00', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>COLLABORATION FEED</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: '9px', color: '#80808A', fontWeight: 600 }}>LIVE</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { text: 'Sarah Nelson uploaded BrandAssets.zip', time: 'Just now', type: 'upload' },
                  { text: 'Mike Carter edited Homepage.fig', time: '2 mins ago', type: 'edit' },
                  { text: 'Emma Lee joined Marketing Team', time: '12 mins ago', type: 'join' },
                  { text: 'David Harris updated permissions', time: '15 mins ago', type: 'permission' }
                ].map((act, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: 'rgba(255,255,255,0.015)',
                      border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: act.type === 'upload' ? '#22C55E' : act.type === 'edit' ? '#3B82F6' : '#FF7A00'
                      }} />
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>{act.text}</span>
                    </div>
                    <span style={{ fontSize: '10.5px', color: '#80808A' }}>{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#80808A', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '16px' }}>
              Updates synchronize automatically across every active client session.
            </div>
          </div>

          {/* Copywriting */}
          <div style={{ textAlign: 'left' }}>
            <ScrollReveal>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Real-time Collaboration</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '12px 0 18px', lineHeight: 1.2, color: '#FFFFFF' }}>Built For Teams.</h2>
              <p style={{ fontSize: '15px', color: '#B8B8C2', lineHeight: 1.6, marginBottom: '28px', maxWidth: '580px' }}>
                Work together seamlessly on core assets. Everyone receives live alerts, folder state additions, and audit event logs without having to click refresh.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                  <Activity size={15} style={{ color: '#FF7A00' }} />
                  <span>Live activity ticker detailing all edits & uploads</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                  <Shield size={15} style={{ color: '#FF7A00' }} />
                  <span>Secure invitations with instant email confirmation</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* SECTION 7: STATS & ANALYTICS */}
      <section className="section-padding" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
            <ScrollReveal>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Data & Overview</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '12px 0 16px', lineHeight: 1.2, color: '#FFFFFF' }}>Everything At A Glance.</h2>
              <p style={{ fontSize: '15px', color: '#B8B8C2', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto' }}>
                Control your organization parameters using clear telemetry visualization metrics. Check storage speeds, node members, and favorite assets from one console.
              </p>
            </ScrollReveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            {/* Widget 1 */}
            <div className="card-refined" style={{ padding: '24px', textAlign: 'left' }}>
              <span style={{ fontSize: '10px', color: '#80808A', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>STORAGE USE METRIC</span>
              <div style={{ fontSize: '32px', fontWeight: 900, margin: '12px 0 6px', color: '#FFFFFF' }}>
                <ViewportCounter targetValue={12.4} decimals={1} suffix="%" />
              </div>
              <p style={{ fontSize: '12px', color: '#B8B8C2', marginBottom: '20px' }}>Storage capacity utilization across all organizations.</p>
              
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ width: '12.4%', height: '100%', background: '#FF7A00' }} />
              </div>
            </div>

            {/* Widget 2 */}
            <div className="card-refined" style={{ padding: '24px', textAlign: 'left' }}>
              <span style={{ fontSize: '10px', color: '#80808A', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>DAILY UPLOAD FREQUENCY</span>
              <div style={{ fontSize: '32px', fontWeight: 900, margin: '12px 0 6px', color: '#FFFFFF' }}>
                <ViewportCounter targetValue={72} suffix=" assets/day" />
              </div>
              <p style={{ fontSize: '12px', color: '#B8B8C2', marginBottom: '16px' }}>Inbound upload actions monitored last week.</p>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '40px' }}>
                {[35, 42, 38, 55, 48, 62, 72].map((val, i) => (
                  <div 
                    key={i} 
                    style={{
                      flex: 1, height: `${val}%`, background: i === 6 ? '#FF7A00' : 'rgba(255,255,255,0.1)',
                      borderRadius: '2px', transition: 'all 0.3s ease'
                    }} 
                  />
                ))}
              </div>
            </div>

            {/* Widget 3 */}
            <div className="card-refined" style={{ padding: '24px', textAlign: 'left' }}>
              <span style={{ fontSize: '10px', color: '#80808A', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>ACTIVE USER CONNECTIONS</span>
              <div style={{ fontSize: '32px', fontWeight: 900, margin: '12px 0 6px', color: '#FFFFFF' }}>
                <ViewportCounter targetValue={4} suffix=" online" />
              </div>
              <p style={{ fontSize: '12px', color: '#B8B8C2', marginBottom: '16px' }}>Members currently online in Marketing Workspace.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['Sarah Nelson (Admin)', 'Mike Carter (Editor)'].map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#B8B8C2' }}>
                    <span className="live-dot" />
                    <span>{u}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 8: WHY FILEDRIVE */}
      <section className="section-padding" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: '#08080A'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
            <ScrollReveal>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>PRODUCT PRINCIPLES</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '12px 0 16px', lineHeight: 1.1, color: '#FFFFFF' }}>Why Choose FileDrive?</h2>
              <p style={{ fontSize: '15px', color: '#B8B8C2', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto' }}>
                A clean, high-performance file sharing architecture engineered specifically for modern teams.
              </p>
            </ScrollReveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Card 1 */}
            <div className="card-refined" style={{ padding: '32px', textAlign: 'left' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,122,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#FF7A00' }}>
                <Layout size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#FFFFFF' }}>Centralized Workspace</h3>
              <p style={{ fontSize: '13.5px', color: '#B8B8C2', lineHeight: 1.6 }}>
                Everything in one place. Your files, your teams, and your shared resources. Stop dividing assets between personal drives and chaotic group chats.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-refined" style={{ padding: '32px', textAlign: 'left' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,122,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#FF7A00' }}>
                <Lock size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#FFFFFF' }}>Role-Based Access</h3>
              <p style={{ fontSize: '13.5px', color: '#B8B8C2', lineHeight: 1.6 }}>
                Granular permissions for every team member. Control exactly who can upload, edit metadata, view assets, or perform folder deletions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-refined" style={{ padding: '32px', textAlign: 'left' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,122,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#FF7A00' }}>
                <Activity size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#FFFFFF' }}>Real-Time Collaboration</h3>
              <p style={{ fontSize: '13.5px', color: '#B8B8C2', lineHeight: 1.6 }}>
                Work together without chaos. Live updates and instant file synchronization ensure your team is always looking at the absolute latest project version.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 9: PRODUCT SHOWCASE */}
      <section id="showcase" className="section-padding" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 56px' }}>
            <ScrollReveal>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Interactive Tour</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '12px 0 16px', lineHeight: 1.1, color: '#FFFFFF' }}>Product Showcase.</h2>
              <p style={{ fontSize: '15px', color: '#B8B8C2', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto' }}>
                Interact directly with our core visual systems. Switch between file views, team scopes, and permission blocks to preview your future workspace.
              </p>
            </ScrollReveal>
          </div>

          {/* Interactive controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
            {[
              { id: 'files', label: 'File explorer', icon: Folder },
              { id: 'teams', label: 'Team scopes', icon: Users },
              { id: 'permissions', label: 'Role settings', icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveShowcaseTab(tab.id)}
                style={{
                  height: '36px', padding: '0 18px', borderRadius: '8px', fontSize: '12.5px',
                  fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                  background: activeShowcaseTab === tab.id ? '#FF7A00' : 'rgba(255,255,255,0.02)',
                  color: activeShowcaseTab === tab.id ? '#FFFFFF' : '#80808A',
                  display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 200ms ease'
                }}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Showcase Viewport */}
          <div className="card-refined" style={{
            maxWidth: '960px', margin: '0 auto',
            padding: '32px', minHeight: '260px', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', textAlign: 'left'
          }}>
            <div style={{ transition: 'opacity 200ms ease' }}>
              {activeShowcaseTab === 'files' && (
                <div>
                  <span style={{ fontSize: '10px', color: '#FF7A00', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '16px' }}>FILE SYSTEM PREVIEW</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#FFFFFF' }}>Ingest assets, organize directories, pin favorites.</h3>
                  <p style={{ fontSize: '13.5px', color: '#B8B8C2', lineHeight: 1.6, marginBottom: '24px' }}>
                    Our file explorer delivers maximum file density with zero clutter. Add stars, look up metadata files, organize folders, and sync to organizations in real time.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <File size={13} /> pitch_deck_v2.pdf
                    </div>
                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <File size={13} /> financials.xlsx
                    </div>
                  </div>
                </div>
              )}

              {activeShowcaseTab === 'teams' && (
                <div>
                  <span style={{ fontSize: '10px', color: '#FF7A00', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '16px' }}>ORGANIZATION TREE PREVIEW</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#FFFFFF' }}>Launch organizational workspaces instantly.</h3>
                  <p style={{ fontSize: '13.5px', color: '#B8B8C2', lineHeight: 1.6, marginBottom: '24px' }}>
                    Isolate work files by deploying individual workspaces for Marketing, Design, Sales, or Engineering teams. Invite members securely via magic URLs.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={13} /> Marketing Team Node
                    </div>
                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={13} /> Engineering Team Node
                    </div>
                  </div>
                </div>
              )}

              {activeShowcaseTab === 'permissions' && (
                <div>
                  <span style={{ fontSize: '10px', color: '#FF7A00', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '16px' }}>PERMISSION CONSOLE PREVIEW</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#FFFFFF' }}>Deploy rigid, granular security settings.</h3>
                  <p style={{ fontSize: '13.5px', color: '#B8B8C2', lineHeight: 1.6, marginBottom: '24px' }}>
                    Ensure proper file ownership. Restrict viewers from performing destructive deletions or uploads, and allow editors to focus purely on content production.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={13} /> Admin Authorization
                    </div>
                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={13} /> Editor Authorization
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 10: PRICING */}
      <section id="pricing" className="section-padding" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: '#08080A'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
            <ScrollReveal>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Predictable Pricing</span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', margin: '12px 0 16px', lineHeight: 1.1, color: '#FFFFFF' }}>Plans Scoped For Every Team.</h2>
              <p style={{ fontSize: '15px', color: '#B8B8C2', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto' }}>
                Simple pricing models aligned with your storage and team collaboration requirements.
              </p>
            </ScrollReveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
            
            {/* Starter Plan */}
            <div className="card-refined" style={{
              padding: '32px', textAlign: 'left',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: '400px'
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#80808A', letterSpacing: '0.04em' }}>STARTER TIER</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0 8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF' }}>Free</span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#B8B8C2', lineHeight: 1.5, marginBottom: '24px' }}>
                  Core parameters mapped for single creators, personal drives, and file organization.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span>5 GB Cloud Storage</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span>Single Personal Workspace</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span>Core File Explorer Tools</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/register')}
                style={{
                  width: '100%', height: '40px', fontSize: '13px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#FFFFFF', cursor: 'pointer',
                  fontWeight: 600, transition: 'background 150ms ease'
                }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
              >
                Create Free Account
              </button>
            </div>

            {/* Team Plan */}
            <div className="card-refined" style={{
              padding: '32px', textAlign: 'left',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: '400px',
              borderColor: '#FF7A00'
            }}>
              <div style={{
                position: 'absolute', top: 0, right: 0,
                background: '#FF7A00', color: '#FFFFFF',
                fontSize: '9px', fontWeight: 700, padding: '4px 12px',
                fontFamily: 'var(--font-mono)', borderBottomLeftRadius: '8px',
                letterSpacing: '0.05em'
              }}>
                MOST POPULAR
              </div>

              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#FF7A00', letterSpacing: '0.04em', fontWeight: 600 }}>TEAM TIER</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0 8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF' }}>₹799</span>
                  <span style={{ fontSize: '11px', color: '#80808A', fontFamily: 'var(--font-mono)' }}>/ MONTH</span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#B8B8C2', lineHeight: 1.5, marginBottom: '24px' }}>
                  Engineered specifically for engineering setups requiring real-time organization sharing.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span style={{ fontWeight: 600 }}>100 GB High-Speed Storage</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span>Uncapped Shared Organizations</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span>Granular Roles & Permission Tiering</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span>Live Event Sync & Activity Feed</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/register')}
                style={{
                  width: '100%', height: '40px', fontSize: '13px', background: '#FF7A00',
                  border: 'none', borderRadius: '6px', color: '#FFFFFF', cursor: 'pointer',
                  fontWeight: 600, transition: 'background 150ms ease'
                }}
                onMouseEnter={e=>e.currentTarget.style.background='#FF8D1A'}
                onMouseLeave={e=>e.currentTarget.style.background='#FF7A00'}
              >
                Get Started With Team
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="card-refined" style={{
              padding: '32px', textAlign: 'left',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: '400px'
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#80808A', letterSpacing: '0.04em' }}>ENTERPRISE TIER</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0 8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF' }}>Custom</span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#B8B8C2', lineHeight: 1.5, marginBottom: '24px' }}>
                  Engineered with dedicated scale limits and isolated network pipelines.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span>Uncapped Dedicated Storage</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span>Dedicated Cluster SLA Handlers</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span>Custom SAML & SSO Authentications</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/register')}
                style={{
                  width: '100%', height: '40px', fontSize: '13px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#FFFFFF', cursor: 'pointer',
                  fontWeight: 600, transition: 'background 150ms ease'
                }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
              >
                Contact Enterprise
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 11: FAQ */}
      <section id="faq" className="section-padding" style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ width: '100%', maxWidth: '840px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>FAQ Center</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', color: '#FFFFFF', marginTop: '12px' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqItems.map((item, idx) => (
              <div 
                key={idx} 
                className="card-refined"
                style={{
                  borderRadius: '10px', overflow: 'hidden', textAlign: 'left'
                }}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  style={{
                    width: '100%', padding: '20px 24px', background: 'none', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', color: '#FFFFFF', fontSize: '14.5px', fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDown 
                    size={16} 
                    style={{ 
                      color: '#80808A', 
                      transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 200ms ease'
                    }} 
                  />
                </button>
                <div style={{
                  maxHeight: activeFaq === idx ? '220px' : '0px',
                  overflow: 'hidden',
                  transition: 'max-height 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                  background: 'rgba(0,0,0,0.15)'
                }}>
                  <p style={{ padding: '0 24px 24px', margin: 0, fontSize: '13.5px', color: '#B8B8C2', lineHeight: 1.6 }}>
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 12: FINAL CTA */}
      <section className="section-padding" style={{
        background: '#060608',
        position: 'relative'
      }}>
        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{
            background: '#0B0B0E',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '64px 48px',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>GET STARTED TODAY</span>
            
            <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Start Building Your Team Workspace Today.
            </h3>
            
            <p style={{ fontSize: '14.5px', color: '#B8B8C2', maxWidth: '540px', margin: '0 auto 32px', lineHeight: 1.6 }}>
              Everything your team needs to organize, manage, and collaborate on files. No credit card required.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/register')}
                style={{
                  height: '44px', padding: '0 24px', fontSize: '13px', fontWeight: 600,
                  background: '#FF7A00', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  transition: 'background 150ms ease'
                }}
                onMouseEnter={e=>e.currentTarget.style.background='#FF8D1A'}
                onMouseLeave={e=>e.currentTarget.style.background='#FF7A00'}
              >
                Create Workspace
              </button>
              <button 
                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                style={{
                  height: '44px', padding: '0 24px', fontSize: '13px', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)',
                  color: '#FFFFFF', cursor: 'pointer', borderRadius: '8px', transition: 'background 150ms ease'
                }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
              >
                View Plans
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER (Stripe/Vercel Layout) */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: '#040406',
        padding: '64px 24px 40px',
        position: 'relative'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '40px',
            marginBottom: '64px',
            textAlign: 'left'
          }}>
            {/* Brand details */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <img src={logo} alt="FileDrive Logo" style={{ width: '22px', height: '22px', borderRadius: '4px' }} />
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>filedrive</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#80808A', lineHeight: 1.6, maxWidth: '260px', marginBottom: '20px' }}>
                A modern workspace for teams to securely store, organize, and collaborate on files.
              </p>
              
              {/* Clean Systems Status Check */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(34,197,94,0.04)',
                border: '1px solid rgba(34,197,94,0.12)',
                fontSize: '11px',
                color: '#22C55E',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}>
                <span className="live-dot" />
                <span>ALL SYSTEMS OPERATIONAL</span>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <span style={{ fontSize: '10px', color: '#55555E', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '16px', letterSpacing: '0.08em' }}>PRODUCT</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                <a href="#workspace" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Files Explorer</a>
                <a href="#organizations" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Organizations</a>
                <a href="#permissions" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Access Security</a>
                <a href="#pricing" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Pricing Plans</a>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '10px', color: '#55555E', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '16px', letterSpacing: '0.08em' }}>RESOURCES</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                <a href="#" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Documentation</a>
                <a href="#" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Developer API</a>
                <a href="#" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>System Status</a>
                <a href="#faq" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>FAQ Center</a>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '10px', color: '#55555E', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '16px', letterSpacing: '0.08em' }}>COMPANY</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                <a href="#" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>About Us</a>
                <a href="#" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Blog Feed</a>
                <a href="#" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Privacy Charter</a>
                <a href="#" style={{ color: '#80808A', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#80808A'}>Terms of Use</a>
              </div>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '11px', color: '#55555E', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '24px' }}>
            <span>© {new Date().getFullYear()} FILEDRIVE INC. ALL RIGHTS RESERVED.</span>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#" style={{ color: '#55555E', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#55555E'}>Security Policy</a>
              <a href="#" style={{ color: '#55555E', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#55555E'}>Sitemap</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Landing;
