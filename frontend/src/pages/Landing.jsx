import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Folder, File, Search, Heart, Share2, Users, Lock, ChevronDown, 
  Check, X, Shield, Activity, Plus, Play, Info, ArrowRight, 
  Layout, Database, Star, Bell, Compass, Settings, Clock, Sparkles
} from 'lucide-react';
import logo from '../assets/logo.png';

const Landing = () => {
  const navigate = useNavigate();
  
  // States for interactive components
  const [activeFaq, setActiveFaq] = useState(null);
  const [starredFiles, setStarredFiles] = useState([2, 4]); // indices of starred items
  const [currentOrgTab, setCurrentOrgTab] = useState('marketing'); // 'marketing' | 'engineering'
  const [selectedRoleMatrix, setSelectedRoleMatrix] = useState('admin'); // 'admin' | 'editor' | 'viewer'
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('files'); // 'files' | 'teams' | 'permissions'
  
  // Real-time activity feed state
  const [activities, setActivities] = useState([
    { id: 1, text: 'Sarah uploaded BrandAssets.zip', time: 'Just now', type: 'upload' },
    { id: 2, text: 'Mike edited Homepage.fig', time: '2 mins ago', type: 'edit' },
    { id: 3, text: 'Emma added 24 files', time: '5 mins ago', type: 'upload' },
    { id: 4, text: 'John joined Marketing Team', time: '12 mins ago', type: 'join' },
    { id: 5, text: 'David updated permissions', time: '15 mins ago', type: 'permission' }
  ]);

  // Telemetry simulation for storage & upload activity
  const [simulatedStorage, setSimulatedStorage] = useState(48.2);
  const [simulatedUploads, setSimulatedUploads] = useState([45, 52, 49, 62, 58, 65, 72]);

  // FAQ Content
  const faqItems = [
    {
      q: "Can I create multiple organizations?",
      a: "Yes. You can isolate workspaces by creating different organizations under your account. Each organization has its own members, permission structures, billing scope, and storage parameters."
    },
    {
      q: "How do permissions work?",
      a: "Permissions are managed via strict Role-Based Access Control (RBAC). When you invite members, you can assign them Admin (full control), Editor (upload & modify), or Viewer (view & download) states to maintain total data safety."
    },
    {
      q: "Can editors delete files?",
      a: "No. To protect your company assets from accidental data loss, only organization Admins and owners possess the permission to permanently delete assets from shared organization folders."
    },
    {
      q: "How secure are my files?",
      a: "Files are cryptographically sealed at rest and secure in transit. All user assets are organized inside secure buckets, while metadata operations are guarded by modern JWT session authentications."
    },
    {
      q: "Can I invite external members?",
      a: "Yes. Using secure token-based magic links, you can invite external contractors, design partners, or clients into specific organizations with granular restricted roles."
    },
    {
      q: "Is there a free plan?",
      a: "Yes. Our Starter plan is completely free for individual creators and personal workspaces, supporting standard file sharing and core document uploads up to 5 GB."
    }
  ];

  // Activities loop simulation
  useEffect(() => {
    const activityInterval = setInterval(() => {
      const names = ['Sarah', 'Mike', 'Emma', 'John', 'David', 'Alex', 'Sophia', 'Lucas'];
      const actions = [
        'uploaded BrandAssets.zip',
        'edited Homepage.fig',
        'added 24 files',
        'joined Marketing Team',
        'updated permissions',
        'starred pitch_deck.pdf',
        'created shared workspace Designs',
        'invited external reviewer'
      ];
      const types = ['upload', 'edit', 'upload', 'join', 'permission', 'edit', 'join', 'permission'];
      
      const idx = Math.floor(Math.random() * names.length);
      const actIdx = Math.floor(Math.random() * actions.length);
      
      const newActivity = {
        id: Date.now(),
        text: `${names[idx]} ${actions[actIdx]}`,
        time: 'Just now',
        type: types[actIdx]
      };

      setActivities(prev => {
        const updated = prev.map(a => {
          if (a.time === 'Just now') return { ...a, time: '1 min ago' };
          if (a.time.includes('min ago')) {
            const mins = parseInt(a.time) + 1;
            return { ...a, time: `${mins} mins ago` };
          }
          return a;
        });
        return [newActivity, ...updated.slice(0, 4)];
      });

      // Storage fluctuation
      setSimulatedStorage(prev => {
        const next = prev + (Math.random() - 0.45) * 0.5;
        return parseFloat(Math.max(10, Math.min(99, next)).toFixed(1));
      });

      // Upload chart fluctuation
      setSimulatedUploads(prev => {
        const next = [...prev.slice(1)];
        const newVal = Math.floor(Math.random() * 40) + 40;
        return [...next, newVal];
      });

    }, 4500);

    return () => clearInterval(activityInterval);
  }, []);

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
      background: '#050505',
      color: '#FFFFFF',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      
      {/* Background Grid Pattern Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Subtle Orange Glow Top Header */}
      <div 
        style={{
          position: 'absolute',
          top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: '70vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(255,122,0,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* NAVIGATION BAR */}
      <nav className="glass-effect" style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        height: '64px',
        display: 'flex', alignItems: 'center',
        background: 'rgba(5, 5, 5, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
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
            <a href="#workspace" style={{ fontSize: '13px', color: '#A1A1AA', textDecoration: 'none', transition: 'color 150ms' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#A1A1AA'}>Workspace</a>
            <a href="#organizations" style={{ fontSize: '13px', color: '#A1A1AA', textDecoration: 'none', transition: 'color 150ms' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#A1A1AA'}>Teams</a>
            <a href="#permissions" style={{ fontSize: '13px', color: '#A1A1AA', textDecoration: 'none', transition: 'color 150ms' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#A1A1AA'}>Permissions</a>
            <a href="#pricing" style={{ fontSize: '13px', color: '#A1A1AA', textDecoration: 'none', transition: 'color 150ms' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#A1A1AA'}>Pricing</a>
            <a href="#faq" style={{ fontSize: '13px', color: '#A1A1AA', textDecoration: 'none', transition: 'color 150ms' }} onMouseEnter={e=>e.currentTarget.style.color='#FFF'} onMouseLeave={e=>e.currentTarget.style.color='#A1A1AA'}>FAQ</a>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: 'none', border: 'none', color: '#A1A1AA', fontSize: '13px', cursor: 'pointer',
                fontWeight: 500, transition: 'color 150ms'
              }}
              onMouseEnter={e=>e.currentTarget.style.color='#FFF'}
              onMouseLeave={e=>e.currentTarget.style.color='#A1A1AA'}
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="btn-primary" 
              style={{
                height: '32px', padding: '0 14px', fontSize: '12px',
                background: '#FF7A00', borderRadius: '6px', fontWeight: 600
              }}
              onMouseEnter={e=>e.currentTarget.style.background='#FF9433'}
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
        paddingTop: '140px',
        paddingBottom: '80px',
        paddingLeft: '24px', paddingRight: '24px',
        textAlign: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Micro-badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '100px', background: 'rgba(255, 122, 0, 0.08)',
            border: '1px solid rgba(255, 122, 0, 0.15)', color: '#FF7A00',
            fontFamily: 'var(--font-mono)', fontSize: '10.5px', fontWeight: 600,
            marginBottom: '24px', letterSpacing: '0.04em'
          }}>
            <Sparkles size={11} />
            <span>INTRODUCING FILEDRIVE 2.0</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(44px, 7vw, 92px)',
            fontWeight: 900,
            lineHeight: 1.02,
            letterSpacing: '-0.04em',
            maxWidth: '1000px',
            margin: '0 auto 24px',
            color: '#FFFFFF'
          }}>
            One Workspace For <br />
            Every File And Every Team.
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: '17px',
            color: '#A1A1AA',
            maxWidth: '620px',
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Upload files, create organizations, invite members, assign roles, and collaborate from a single powerful workspace.
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '80px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/register')}
              className="btn-primary" 
              style={{
                height: '46px', padding: '0 28px', fontSize: '13.5px', fontWeight: 600,
                background: '#FF7A00', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px'
              }}
              onMouseEnter={e=>e.currentTarget.style.background='#FF9433'}
              onMouseLeave={e=>e.currentTarget.style.background='#FF7A00'}
            >
              Create Workspace <ArrowRight size={15} />
            </button>
            <button 
              onClick={() => document.getElementById('showcase').scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary" 
              style={{
                height: '46px', padding: '0 28px', fontSize: '13.5px', fontWeight: 600,
                borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)'
              }}
            >
              <Play size={13} fill="#FFF" /> Watch Demo
            </button>
          </div>

          {/* STUNNING DASHBOARD MOCKUP */}
          <div className="animate-slide-up" style={{
            maxWidth: '1060px',
            margin: '0 auto',
            background: '#0A0A0A',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)',
            overflow: 'hidden',
            display: 'flex',
            textAlign: 'left'
          }}>
            
            {/* Sidebar Mockup */}
            <div style={{
              width: '240px',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#080808',
              padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '24px'
            }} className="hidden md:flex">
              {/* User profile section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#52525B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>VN</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Vishwath Narayana</span>
                  <span style={{ fontSize: '10px', color: '#52525B' }}>vortex_agency</span>
                </div>
              </div>

              {/* Workspace tree */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#52525B', fontWeight: 600, letterSpacing: '0.04em' }}>PERSONAL WORKSPACE</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', fontSize: '12px', cursor: 'pointer' }}>
                    <Folder size={14} style={{ color: '#FF7A00' }} />
                    <span style={{ fontWeight: 600 }}>All Files</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', fontSize: '12px', color: '#A1A1AA', cursor: 'pointer' }}>
                    <Heart size={14} />
                    <span>Favorites</span>
                  </div>
                </div>
              </div>

              {/* Organizations Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: '#52525B', fontWeight: 600, letterSpacing: '0.04em' }}>ORGANIZATIONS</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '12px', color: '#A1A1AA', cursor: 'pointer' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                    <span>Marketing Team</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '12px', color: '#A1A1AA', cursor: 'pointer' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
                    <span>Engineering Team</span>
                  </div>
                </div>
              </div>

              {/* Storage indicator */}
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

            {/* Main Mock Content */}
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>Personal Workspace</span>
                  <ChevronDown size={14} style={{ color: '#52525B' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '6px' }}>
                    <Search size={12} style={{ color: '#52525B' }} />
                    <span style={{ fontSize: '11px', color: '#52525B' }}>Search assets...</span>
                  </div>
                  <button style={{ height: '28px', padding: '0 10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={12} /> Invite Member
                  </button>
                </div>
              </div>

              {/* Grid Widgets (Storage overview, members, active feed) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                
                {/* storage overview */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#52525B', fontWeight: 600 }}>STORAGE ALLOCATION</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px' }}>12.4% <span style={{ fontSize: '12px', fontWeight: 500, color: '#A1A1AA' }}>utilized</span></div>
                  <div style={{ fontSize: '11px', color: '#A1A1AA' }}>87.6 GB remaining pool capacity</div>
                </div>

                {/* active members */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#52525B', fontWeight: 600 }}>TEAM MEMBERS</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px' }}>6 <span style={{ fontSize: '12px', fontWeight: 500, color: '#A1A1AA' }}>active nodes</span></div>
                  <div style={{ display: 'flex', gap: '-6px', marginTop: '6px' }}>
                    {['S', 'M', 'E', 'J', 'D', '+1'].map((c, i) => (
                      <div key={i} style={{
                        width: '20px', height: '20px', borderRadius: '50%', background: i===5?'#FF7A00':'#27272A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700,
                        border: '1px solid #0A0A0A', marginLeft: i>0?'-6px':'0'
                      }}>{c}</div>
                    ))}
                  </div>
                </div>

                {/* org nodes count */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#52525B', fontWeight: 600 }}>ORGANIZATIONS</span>
                  <div style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px' }}>2 <span style={{ fontSize: '12px', fontWeight: 500, color: '#A1A1AA' }}>active workspaces</span></div>
                  <div style={{ fontSize: '11px', color: '#A1A1AA' }}>Marketing, Engineering</div>
                </div>

              </div>

              {/* Recent Uploads Table list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: '#52525B', fontWeight: 600 }}>RECENTLY UPLOADED ASSETS</span>
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
                      <span style={{ color: '#52525B', width: '80px' }}>{file.size}</span>
                      <span style={{ color: '#52525B', width: '100px' }}>{file.date}</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', color: '#52525B' }}>
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
        padding: '32px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: '#070707',
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

      {/* SECTION 3: PERSONAL WORKSPACE ("A Home For Your Files") */}
      <section id="workspace" style={{
        padding: '100px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          
          {/* Copywriting */}
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Personal Storage</span>
            <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', margin: '12px 0 18px', lineHeight: 1.1 }}>A Home For Your Files.</h2>
            <p style={{ fontSize: '#A1A1AA', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '24px' }}>
              Manage all your personal assets securely. Our high-fidelity explorer makes uploading, searching, favoriting, and organizing files clean, intuitive, and extremely fast.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Instant file uploads without loading lags', 'Search assets instantly with quick filters', 'Pin critical documents to your Favorites bar'].map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                  <Check size={14} style={{ color: '#FF7A00' }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive File Explorer UI */}
          <div style={{
            background: '#080808', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#52525B' }}>explorer.app</span>
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
                    background: 'rgba(255,255,255,0.01)',
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
                    e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    {item.isFile ? <File size={16} style={{ color: '#A1A1AA' }} /> : <Folder size={16} style={{ color: '#FF7A00' }} />}
                    {item.isFile && (
                      <Star 
                        size={12} 
                        style={{ 
                          color: starredFiles.includes(idx) ? '#FF7A00' : '#52525B',
                          fill: starredFiles.includes(idx) ? '#FF7A00' : 'none'
                        }} 
                      />
                    )}
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: '#52525B', marginTop: '4px' }}>
                    {item.isFile ? item.size : `${item.items} items • ${item.date}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: ORGANIZATIONS ("Create Teams In Seconds") */}
      <section id="organizations" style={{
        padding: '100px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: '#070707'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shared Workspaces</span>
            <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', margin: '12px 0 16px', lineHeight: 1.1 }}>Create Teams In Seconds.</h2>
            <p style={{ fontSize: '15px', color: '#A1A1AA', lineHeight: 1.6 }}>
              Turn your personal workspace into a collaborative team machine. Spin up shared organization hubs, scope folders, and sync resources with zero integration hurdles.
            </p>
          </div>

          <div style={{
            maxWidth: '800px', margin: '0 auto', background: '#0A0A0A',
            border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px',
            overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
          }}>
            
            {/* Tabs selector */}
            <div style={{ display: 'flex', background: '#080808', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <button 
                onClick={() => setCurrentOrgTab('marketing')}
                style={{
                  flex: 1, padding: '16px', border: 'none', background: currentOrgTab === 'marketing' ? '#0A0A0A' : 'none',
                  color: currentOrgTab === 'marketing' ? '#FF7A00' : '#A1A1AA', fontWeight: 600, cursor: 'pointer',
                  fontSize: '13px', borderBottom: currentOrgTab === 'marketing' ? '2px solid #FF7A00' : 'none'
                }}
              >
                Marketing Team Node
              </button>
              <button 
                onClick={() => setCurrentOrgTab('engineering')}
                style={{
                  flex: 1, padding: '16px', border: 'none', background: currentOrgTab === 'engineering' ? '#0A0A0A' : 'none',
                  color: currentOrgTab === 'engineering' ? '#FF7A00' : '#A1A1AA', fontWeight: 600, cursor: 'pointer',
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
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Marketing Team Workspace</span>
                  </div>

                  <div style={{ paddingLeft: '24px', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3F3F46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>SN</div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Sarah Nelson</div>
                          <div style={{ fontSize: '10px', color: '#52525B' }}>sarah@filedrive.com</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,122,0,0.1)', color: '#FF7A00', fontFamily: 'var(--font-mono)' }}>ADMIN</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3F3F46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>MC</div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Mike Carter</div>
                          <div style={{ fontSize: '10px', color: '#52525B' }}>mike@filedrive.com</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#A1A1AA', fontFamily: 'var(--font-mono)' }}>EDITOR</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3F3F46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>EL</div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Emma Lee</div>
                          <div style={{ fontSize: '10px', color: '#52525B' }}>emma@filedrive.com</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: '#52525B', fontFamily: 'var(--font-mono)' }}>VIEWER</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Engineering Team Workspace</span>
                  </div>

                  <div style={{ paddingLeft: '24px', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3F3F46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>DH</div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>David Harris</div>
                          <div style={{ fontSize: '10px', color: '#52525B' }}>david@filedrive.com</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,122,0,0.1)', color: '#FF7A00', fontFamily: 'var(--font-mono)' }}>ADMIN</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3F3F46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>JS</div>
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>John Smith</div>
                          <div style={{ fontSize: '10px', color: '#52525B' }}>john@filedrive.com</div>
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

      {/* SECTION 5: PERMISSIONS ("Everyone Sees Exactly What They Should") */}
      <section id="permissions" style={{
        padding: '100px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          
          {/* Interactive Role matrix details */}
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Security & Scopes</span>
            <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', margin: '12px 0 18px', lineHeight: 1.1 }}>Everyone Sees Exactly What They Should.</h2>
            <p style={{ fontSize: '#A1A1AA', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '24px' }}>
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
                    color: selectedRoleMatrix === role ? '#FFFFFF' : '#A1A1AA',
                    transition: 'all 150ms'
                  }}
                >
                  {role} Scope
                </button>
              ))}
            </div>

            {/* Description box of active selected role */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '16px', fontSize: '12.5px', color: '#A1A1AA', minHeight: '80px' }}>
              {selectedRoleMatrix === 'admin' && "Admins hold full control over the workspace: they can invite members, manage permissions, upload/edit files, and permanently delete assets."}
              {selectedRoleMatrix === 'editor' && "Editors can collaborate fully on files. They possess the permission to upload and edit metadata, but cannot delete files or change member invite tokens."}
              {selectedRoleMatrix === 'viewer' && "Viewers have read-only access. They can browse assets and download resources, but are blocked from uploading, editing, or deleting any folder contents."}
            </div>
          </div>

          {/* High-fidelity table mockup */}
          <div style={{
            background: '#080808', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            textAlign: 'left'
          }}>
            <span style={{ fontSize: '11px', color: '#52525B', fontWeight: 700, display: 'block', marginBottom: '16px' }}>ROLE PERMISSION MATRIX</span>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#A1A1AA' }}>
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
                      {row.admin ? <Check size={14} style={{ color: '#FF7A00', margin: '0 auto' }} /> : <X size={14} style={{ color: '#52525B', margin: '0 auto' }} />}
                    </td>
                    <td style={{ textAlign: 'center', padding: '14px 0' }}>
                      {row.editor ? <Check size={14} style={{ color: '#FF7A00', margin: '0 auto' }} /> : <X size={14} style={{ color: '#52525B', margin: '0 auto' }} />}
                    </td>
                    <td style={{ textAlign: 'center', padding: '14px 0' }}>
                      {row.viewer ? <Check size={14} style={{ color: '#FF7A00', margin: '0 auto' }} /> : <X size={14} style={{ color: '#52525B', margin: '0 auto' }} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* SECTION 6: COLLABORATION ("Built For Teams") */}
      <section style={{
        padding: '100px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: '#070707'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          
          {/* Animated Activity Feed panel */}
          <div style={{
            background: '#0A0A0A', border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            textAlign: 'left', minHeight: '340px', display: 'flex', flexDirection: 'column', justifycontent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', color: '#FF7A00', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>LIVE COLLABORATION FEED</span>
                <span style={{ fontSize: '10px', color: '#52525B' }}>● STREAM ACTIVE</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activities.map((act) => (
                  <div 
                    key={act.id} 
                    style={{
                      display: 'flex', alignItems: 'center', justifycontent: 'space-between',
                      padding: '10px 14px', background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px',
                      animation: 'fadeIn 0.4s ease-out'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: act.type === 'upload' ? '#10B981' : act.type === 'edit' ? '#3B82F6' : '#FF7A00'
                      }} />
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>{act.text}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#52525B' }}>{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#52525B', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '16px' }}>
              Updates synchronize automatically across every active member's client.
            </div>
          </div>

          {/* Copywriting */}
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Real-time Collaboration</span>
            <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', margin: '12px 0 18px', lineHeight: 1.1 }}>Built For Teams.</h2>
            <p style={{ fontSize: '#A1A1AA', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '24px' }}>
              Work together seamlessly on core assets. Everyone receives live alerts, folder state additions, and audit event logs without having to click refresh.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                <Activity size={15} style={{ color: '#FF7A00' }} />
                <span>Live activity ticker detailing all edits & uploads</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px' }}>
                <Shield size={15} style={{ color: '#FF7A00' }} />
                <span>Secure invitations with instant email confirmation</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7: DASHBOARD OVERVIEW ("Everything At A Glance") */}
      <section style={{
        padding: '100px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Data & Overview</span>
            <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', margin: '12px 0 16px', lineHeight: 1.1 }}>Everything At A Glance.</h2>
            <p style={{ fontSize: '15px', color: '#A1A1AA', lineHeight: 1.6 }}>
              Control your organization parameters using clear telemetry visualization metrics. Check storage speeds, node members, and favorite assets from one console.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            {/* Widget 1: Storage visual */}
            <div style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', color: '#52525B', fontWeight: 700 }}>STORAGE USE METRIC</span>
              <div style={{ fontSize: '32px', fontWeight: 900, margin: '12px 0 6px' }}>{simulatedStorage}%</div>
              <p style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '20px' }}>Storage capacity utilization across all organizations.</p>
              
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ width: `${simulatedStorage}%`, height: '100%', background: '#FF7A00', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Widget 2: Upload volumes visual */}
            <div style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', color: '#52525B', fontWeight: 700 }}>DAILY UPLOAD FREQUENCY</span>
              <div style={{ fontSize: '32px', fontWeight: 900, margin: '12px 0 6px' }}>{simulatedUploads[simulatedUploads.length - 1]} <span style={{ fontSize: '12px', fontWeight: 500, color: '#A1A1AA' }}>assets/day</span></div>
              <p style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '16px' }}>Inbound upload actions monitored last week.</p>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '40px' }}>
                {simulatedUploads.map((val, i) => (
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

            {/* Widget 3: Live member status nodes */}
            <div style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', color: '#52525B', fontWeight: 700 }}>ACTIVE USER CONNECTIONS</span>
              <div style={{ fontSize: '32px', fontWeight: 900, margin: '12px 0 6px' }}>4 <span style={{ fontSize: '12px', fontWeight: 500, color: '#A1A1AA' }}>online</span></div>
              <p style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '16px' }}>Members currently online in Marketing Workspace.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['Sarah Nelson (Admin)', 'Mike Carter (Editor)'].map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#A1A1AA' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                    <span>{u}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 8: WHY FILEDRIVE (3 large cards) */}
      <section style={{
        padding: '100px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: '#070707'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>PRODUCT PRINCIPLES</span>
            <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', margin: '12px 0 16px', lineHeight: 1.1 }}>Why Choose FileDrive?</h2>
            <p style={{ fontSize: '15px', color: '#A1A1AA', lineHeight: 1.6 }}>
              A clean, high-performance file sharing architecture engineered specifically for modern teams.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Card 1 */}
            <div style={{
              background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '32px', textAlign: 'left'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,122,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#FF7A00' }}>
                <Layout size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Centralized Workspace</h3>
              <p style={{ fontSize: '13.5px', color: '#A1A1AA', lineHeight: 1.6 }}>
                Everything in one place. Your files, your teams, and your shared resources. Stop dividing assets between personal drives and chaotic group chats.
              </p>
            </div>

            {/* Card 2 */}
            <div style={{
              background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '32px', textAlign: 'left'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,122,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#FF7A00' }}>
                <Lock size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Role-Based Access</h3>
              <p style={{ fontSize: '13.5px', color: '#A1A1AA', lineHeight: 1.6 }}>
                Granular permissions for every team member. Control exactly who can upload, edit metadata, view assets, or perform folder deletions.
              </p>
            </div>

            {/* Card 3 */}
            <div style={{
              background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '32px', textAlign: 'left'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,122,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#FF7A00' }}>
                <Activity size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Real-Time Collaboration</h3>
              <p style={{ fontSize: '13.5px', color: '#A1A1AA', lineHeight: 1.6 }}>
                Work together without chaos. Live updates and instant file synchronization ensure your team is always looking at the absolute latest project version.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 9: PRODUCT SHOWCASE */}
      <section id="showcase" style={{
        padding: '100px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 56px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Interactive Tour</span>
            <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', margin: '12px 0 16px', lineHeight: 1.1 }}>Cinematic Product Showcase.</h2>
            <p style={{ fontSize: '15px', color: '#A1A1AA', lineHeight: 1.6 }}>
              Interact directly with our core visual systems. Switch between file views, team scopes, and permission blocks to preview your future workspace.
            </p>
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
                  color: activeShowcaseTab === tab.id ? '#FFFFFF' : '#A1A1AA',
                  display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 150ms'
                }}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Showcase Viewport */}
          <div style={{
            maxWidth: '960px', margin: '0 auto', background: '#0A0A0A',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
            padding: '32px', minHeight: '300px', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', textAlign: 'left', position: 'relative',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
          }}>
            {activeShowcaseTab === 'files' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <span style={{ fontSize: '11px', color: '#FF7A00', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '16px' }}>FILE VIEWPORT PREVIEW</span>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Ingest assets, organize directories, pin favorites.</h3>
                <p style={{ fontSize: '13.5px', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '24px' }}>
                  Our file explorer delivers maximum file density with zero clutter. Add stars, look up metadata files, organize folders, and sync to organizations in real time.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
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
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <span style={{ fontSize: '11px', color: '#FF7A00', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '16px' }}>ORGANIZATION TREE PREVIEW</span>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Launch organizational workspaces instantly.</h3>
                <p style={{ fontSize: '13.5px', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '24px' }}>
                  Isolate work files by deploying individual workspaces for Marketing, Design, Sales, or Engineering teams. Invite members securely via magic URLs.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
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
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <span style={{ fontSize: '11px', color: '#FF7A00', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '16px' }}>PERMISSION CONSOLE PREVIEW</span>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Deploy rigid, granular security settings.</h3>
                <p style={{ fontSize: '13.5px', color: '#A1A1AA', lineHeight: 1.6, marginBottom: '24px' }}>
                  Ensure proper file ownership. Restrict viewers from performing destructive deletions or uploads, and allow editors to focus purely on content production.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
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
      </section>

      {/* SECTION 10: PRICING */}
      <section id="pricing" style={{
        padding: '100px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        background: '#070707'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Predictable Pricing</span>
            <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', margin: '12px 0 16px', lineHeight: 1.1 }}>Plans Scoped For Every Team.</h2>
            <p style={{ fontSize: '15px', color: '#A1A1AA', lineHeight: 1.6 }}>
              Simple pricing models aligned with your storage and team collaboration requirements.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
            
            {/* Starter Plan */}
            <div style={{
              background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '32px', textAlign: 'left',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#52525B', letterSpacing: '0.04em' }}>STARTER TIER</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0 8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800 }}>Free</span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#A1A1AA', lineHeight: 1.5, marginBottom: '24px' }}>
                  Core parameters mapped for single creators, personal drives, and file organization.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '32px' }}>
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
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', height: '40px', fontSize: '13px', background: 'rgba(255,255,255,0.02)' }}
              >
                Create Free Account
              </button>
            </div>

            {/* Team Plan (Orange highlight) */}
            <div style={{
              background: '#0A0A0A', border: '1px solid #FF7A00',
              borderRadius: '12px', padding: '32px', textAlign: 'left',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(255,122,0,0.06)'
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
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#FF7A00', letterSpacing: '0.04em', fontWeight: 600 }}>TEAM TIER</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0 8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800 }}>₹799</span>
                  <span style={{ fontSize: '12px', color: '#52525B', fontFamily: 'var(--font-mono)' }}>/ MONTH</span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#A1A1AA', lineHeight: 1.5, marginBottom: '24px' }}>
                  Engineered specifically for engineering setups requiring real-time organization sharing.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '32px' }}>
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
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', height: '40px', fontSize: '13px', background: '#FF7A00' }}
                onMouseEnter={e=>e.currentTarget.style.background='#FF9433'}
                onMouseLeave={e=>e.currentTarget.style.background='#FF7A00'}
              >
                Get Started With Team
              </button>
            </div>

            {/* Enterprise Plan */}
            <div style={{
              background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '32px', textAlign: 'left',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#52525B', letterSpacing: '0.04em' }}>ENTERPRISE TIER</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0 8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800 }}>Custom</span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#A1A1AA', lineHeight: 1.5, marginBottom: '24px' }}>
                  Engineered with dedicated scale limits and isolated network pipelines.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '32px' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <Check size={14} style={{ color: '#FF7A00' }} />
                    <span>Dedicated Relationship Manager</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/register')}
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', height: '40px', fontSize: '13px', background: 'rgba(255,255,255,0.02)' }}
              >
                Contact Enterprise
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 11: FAQ */}
      <section id="faq" style={{
        padding: '100px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>FAQ Diagnostics</span>
            <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', color: '#FFFFFF', marginTop: '12px' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqItems.map((item, idx) => (
              <div 
                key={idx} 
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
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
                      color: '#52525B', 
                      transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 200ms ease'
                    }} 
                  />
                </button>
                <div style={{
                  maxHeight: activeFaq === idx ? '200px' : '0px',
                  overflow: 'hidden',
                  transition: 'max-height 250ms ease-out',
                  background: 'rgba(0,0,0,0.1)'
                }}>
                  <p style={{ padding: '0 24px 24px', margin: 0, fontSize: '13.5px', color: '#A1A1AA', lineHeight: 1.6 }}>
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 12: FINAL CTA */}
      <section style={{
        padding: '100px 24px',
        background: '#050505',
        position: 'relative'
      }}>
        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{
            background: 'linear-gradient(135deg, #0A0A0A 0%, rgba(255,122,0,0.02) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '64px 48px',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Glowing top line */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '180px', height: '1px', background: '#FF7A00',
              boxShadow: '0 0 12px #FF7A00'
            }} />

            <span style={{ fontSize: '12px', fontWeight: 600, color: '#FF7A00', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>GET STARTED TODAY</span>
            
            <h3 style={{ fontSize: '36px', fontWeight: 900, color: '#FFFFFF', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Start Building Your Team Workspace Today.
            </h3>
            
            <p style={{ fontSize: '14.5px', color: '#A1A1AA', maxWidth: '540px', margin: '0 auto 32px', lineHeight: 1.6 }}>
              Everything your team needs to organize, manage, and collaborate on files. No credit card required.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/register')}
                className="btn-primary" 
                style={{
                  height: '46px', padding: '0 28px', fontSize: '13.5px', fontWeight: 600,
                  background: '#FF7A00'
                }}
                onMouseEnter={e=>e.currentTarget.style.background='#FF9433'}
                onMouseLeave={e=>e.currentTarget.style.background='#FF7A00'}
              >
                Create Workspace
              </button>
              <button 
                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary" 
                style={{
                  height: '46px', padding: '0 28px', fontSize: '13.5px', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)'
                }}
              >
                View Plans
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: '#030303',
        padding: '40px 24px'
      }}>
        <div style={{
          width: '100%', maxWidth: '1200px', margin: '0 auto',
          display: 'flex', flexDirection: 'column', mdDirection: 'row',
          alignItems: 'center', justifyContent: 'space-between', gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="FileDrive Logo" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
            <span style={{ fontWeight: 700, fontSize: '13px' }}>filedrive</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['WORKSPACE', 'ORGANIZATIONS', 'PRIVACY', 'SECURITY', 'SUPPORT'].map((link) => (
              <a 
                key={link} 
                href="#" 
                style={{ 
                  fontSize: '11px', fontWeight: 600,
                  color: '#52525B', textDecoration: 'none',
                  letterSpacing: '0.04em'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#FFF'}
                onMouseLeave={e => e.currentTarget.style.color = '#52525B'}
              >
                {link}
              </a>
            ))}
          </div>

          <div style={{ fontSize: '11px', color: '#52525B' }}>
            © {new Date().getFullYear()} FILEDRIVE INC. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
