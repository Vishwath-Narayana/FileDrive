import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Terminal, Activity, Shield, Cpu, Users, UploadCloud, Layers, 
  HardDrive, ArrowRight, Play, RefreshCw, Command, Key, GitBranch, 
  Info, AlertTriangle, ChevronRight, X, Maximize2, ExternalLink, 
  Network, FileText, Database, Radio, CheckCircle
} from 'lucide-react';
import logo from '../assets/logo.png';

const Landing = () => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState('security');
  const [ingestLogs, setIngestLogs] = useState([]);
  const [bandwidth, setBandwidth] = useState(48.2);
  const [uptime, setUptime] = useState(99.982);
  const [cpuUsage, setCpuUsage] = useState(24.5);
  const [activeUploads, setActiveUploads] = useState([
    { id: 1, name: 'ml_dataset_v4.bin', size: '1.2 GB', progress: 68, speed: '42.5 MB/s', status: 'ingesting' },
    { id: 2, name: 'brand_identity_draft.fig', size: '84.2 MB', progress: 92, speed: '12.1 MB/s', status: 'indexing' },
    { id: 3, name: 'compliance_report_q2.pdf', size: '4.8 MB', progress: 100, speed: '0.0 MB/s', status: 'completed' },
  ]);
  const [showcaseState, setShowcaseState] = useState('ready'); // 'ready', 'processing', 'completed'
  const [showcaseLog, setShowcaseLog] = useState([]);
  const [cliCommand, setCliCommand] = useState('');
  const [cliOutput, setCliOutput] = useState([
    { type: 'input', text: 'filedrive init --org vortex' },
    { type: 'system', text: 'Initializing FileDrive local agent configuration...' },
    { type: 'success', text: '✔ Created node configuration in /etc/filedrive/node.json' },
    { type: 'success', text: '✔ Secured endpoint token authentication handshake successful' },
    { type: 'system', text: 'Node is online. Stream port listener running on :5001' }
  ]);

  const logIndex = useRef(0);
  const simulatedFiles = [
    'analytics_model.py', 'user_metrics_delta.csv', 'vector_index_01.db', 'payload_pack_9.tar.gz',
    'node_config.yml', 'client_signature.key', 'system_event_stream.log', 'assets_compressed.zip'
  ];
  const simulatedNodes = ['us-east-1', 'eu-west-2', 'ap-south-1', 'us-west-2', 'sa-east-1'];

  // Telemetry intervals
  useEffect(() => {
    // Ingest logs simulation
    const initialLogs = Array.from({ length: 6 }).map(() => generateSimulatedLog());
    setIngestLogs(initialLogs);

    const logInterval = setInterval(() => {
      setIngestLogs(prev => [generateSimulatedLog(), ...prev.slice(0, 8)]);
    }, 2500);

    // Bandwidth & CPU fluctuation
    const metricInterval = setInterval(() => {
      setBandwidth(prev => parseFloat((prev + (Math.random() - 0.5) * 4).toFixed(1)));
      setCpuUsage(prev => {
        const next = Math.max(10, Math.min(95, prev + (Math.random() - 0.5) * 8));
        return parseFloat(next.toFixed(1));
      });
      setUptime(prev => parseFloat((99.98 + Math.random() * 0.019).toFixed(3)));
    }, 1200);

    // Active upload queue progress bar incrementer
    const uploadInterval = setInterval(() => {
      setActiveUploads(prev => prev.map(up => {
        if (up.progress < 100) {
          const added = Math.floor(Math.random() * 8) + 2;
          const nextProg = Math.min(100, up.progress + added);
          return {
            ...up,
            progress: nextProg,
            status: nextProg === 100 ? 'indexing' : up.status
          };
        } else if (up.progress === 100 && up.status === 'indexing') {
          return {
            ...up,
            status: 'completed'
          };
        } else if (up.progress === 100 && up.status === 'completed') {
          // cycle completed to a new random upload
          const newName = simulatedFiles[Math.floor(Math.random() * simulatedFiles.length)];
          const newSize = (Math.random() * 450 + 5).toFixed(1) + ' MB';
          return {
            id: up.id,
            name: newName,
            size: newSize,
            progress: 0,
            speed: (Math.random() * 30 + 5).toFixed(1) + ' MB/s',
            status: 'ingesting'
          };
        }
        return up;
      }));
    }, 1500);

    return () => {
      clearInterval(logInterval);
      clearInterval(metricInterval);
      clearInterval(uploadInterval);
    };
  }, []);

  const generateSimulatedLog = () => {
    const timestamp = new Date().toLocaleTimeString();
    const file = simulatedFiles[Math.floor(Math.random() * simulatedFiles.length)];
    const node = simulatedNodes[Math.floor(Math.random() * simulatedNodes.length)];
    const status = Math.random() > 0.85 ? 'WARN' : 'INFO';
    
    let message = '';
    if (status === 'WARN') {
      message = `Retry handshake triggered on cluster node [${node}] for payload segment`;
    } else {
      const actions = [
        `Ingested segment packet from node [${node}]`,
        `Cryptographic seal validated for file: ${file}`,
        `Distributed index replication synchronized to cluster [${node}]`,
        `Deduplication check passed: unique block registered`,
        `Reorganized tree partition path for asset mapping`
      ];
      message = actions[Math.floor(Math.random() * actions.length)];
    }

    return { id: logIndex.current++, timestamp, status, message };
  };

  // CLI submit handler
  const handleCliSubmit = (e) => {
    e.preventDefault();
    if (!cliCommand.trim()) return;

    const cmd = cliCommand.trim().toLowerCase();
    const newOutput = [...cliOutput, { type: 'input', text: cliCommand }];

    if (cmd === 'clear') {
      setCliOutput([]);
      setCliCommand('');
      return;
    }

    if (cmd.startsWith('help')) {
      newOutput.push(
        { type: 'system', text: 'Available commands:' },
        { type: 'system', text: '  filedrive status     Check system operational parameters' },
        { type: 'system', text: '  filedrive list       Display registered files on current node' },
        { type: 'system', text: '  filedrive orgs       Retrieve active organization workspace nodes' },
        { type: 'system', text: '  clear                Flush terminal terminal lines' }
      );
    } else if (cmd === 'filedrive status') {
      newOutput.push(
        { type: 'system', text: `Node connection status: STABLE [${simulatedNodes[0]}]` },
        { type: 'system', text: `Telemetry: Uptime ${uptime}%, Core CPU Load ${cpuUsage}%` },
        { type: 'success', text: `Local token authentication: ACTIVE` }
      );
    } else if (cmd === 'filedrive list') {
      newOutput.push(
        { type: 'system', text: 'Ingested documents on current node:' },
        ...simulatedFiles.map(f => ({ type: 'success', text: `  - ${f} (Verified Cryptographic Integrity)` }))
      );
    } else if (cmd === 'filedrive orgs') {
      newOutput.push(
        { type: 'system', text: 'Active organizations linked to identity token:' },
        { type: 'success', text: '  Node 1: VORTEX [Primary Workspace]' },
        { type: 'success', text: '  Node 2: ZENITH_LABS [Secondary]' }
      );
    } else {
      newOutput.push({ type: 'error', text: `bash: command not found: ${cliCommand}. Enter "help" for a list of diagnostics.` });
    }

    setCliOutput(newOutput);
    setCliCommand('');
  };

  // Interactive showcase simulation
  const triggerShowcaseSim = () => {
    if (showcaseState !== 'ready') return;
    
    setShowcaseState('processing');
    setShowcaseLog([{ time: '0ms', text: 'Ingestion trigger detected via client request API...' }]);

    setTimeout(() => {
      setShowcaseLog(prev => [...prev, { time: '400ms', text: 'Evaluating deduplication hashes across active storage pools...' }]);
    }, 400);

    setTimeout(() => {
      setShowcaseLog(prev => [...prev, { time: '900ms', text: 'Initializing encryption seal (AES-GCM-256 bits). Generating block signatures...' }]);
    }, 900);

    setTimeout(() => {
      setShowcaseLog(prev => [...prev, { time: '1400ms', text: 'Replicating node fragments globally to cluster clusters...' }]);
    }, 1400);

    setTimeout(() => {
      setShowcaseLog(prev => [...prev, { time: '1800ms', text: 'Handshake completed. Target successfully synced and indexed.' }]);
      setShowcaseState('completed');
    }, 1800);
  };

  const resetShowcase = () => {
    setShowcaseState('ready');
    setShowcaseLog([]);
  };

  const faqs = {
    security: {
      cmd: 'query --topic security',
      output: [
        { key: 'ENCRYPTION', val: 'AES-GCM-256 at rest, TLS 1.3 in transit' },
        { key: 'ARCHITECTURE', val: 'Decentralized workspace isolation' },
        { key: 'AUTH HANDSHAKE', val: 'Secured cryptographic authorization keys via Supabase' },
        { key: 'INTEGRITY SEAL', val: 'Continuous automatic SHA-256 asset verification' }
      ]
    },
    collaboration: {
      cmd: 'query --topic sync',
      output: [
        { key: 'REAL-TIME PROPAGATION', val: 'Instant client updates via WebSocket events' },
        { key: 'ROLE MANAGEMENT', val: 'Admin, Editor, Viewer strict authorization scoping' },
        { key: 'AUDIT LOGS', val: 'Structured telemetry logging for every internal action' },
        { key: 'INVITATION PATHS', val: 'Cryptographically sealed unique token magic links' }
      ]
    },
    performance: {
      cmd: 'query --topic pipeline',
      output: [
        { key: 'INGEST RATE', val: 'Multi-threaded network chunk uploads' },
        { key: 'DEDUPLICATION', val: 'Smart asset block level verification' },
        { key: 'CACHE LAYER', val: 'Global CDN caching via Cloudinary edge systems' },
        { key: 'DASHBOARD LATENCY', val: 'Fast reactivity compiled with Vite React engine' }
      ]
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Dot grid background overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.25,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Subtle orange ambient glow in hero */}
      <div 
        style={{
          position: 'absolute',
          top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* HEADER NAVBAR */}
      <nav className="glass-effect" style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        height: '60px',
        display: 'flex', alignItems: 'center'
      }}>
        <div style={{
          width: '100%', maxWidth: '1280px', margin: '0 auto',
          padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logo} alt="FileDrive Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' }}>filedrive<span style={{ color: 'var(--accent-indigo)' }}>_</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* System Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: 'var(--bg-hover)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div className="live-dot" />
              <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>SYS_ONLINE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => navigate('/login')}
                className="btn-secondary" 
                style={{ height: '30px', padding: '0 12px', fontSize: '12px' }}
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="btn-primary" 
                style={{ height: '30px', padding: '0 14px', fontSize: '12px' }}
              >
                Initialize
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        paddingTop: '120px',
        paddingBottom: '64px',
        paddingLeft: '24px', paddingRight: '24px'
      }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Metadata telemetry line */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-indigo)',
            marginBottom: '16px', letterSpacing: '0.15em', fontWeight: 600
          }}>
            <Radio size={12} className="animate-pulse" />
            <span>FILEDRIVE NODE HANDSHAKE // LIVE DEMO ESTABLISHED</span>
          </div>

          {/* Giant Headline */}
          <h1 style={{
            fontSize: 'clamp(38px, 6vw, 76px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            maxWidth: '1000px',
            margin: '0 auto 24px',
            color: 'var(--text-primary)',
            textShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            The Workspace Operating System <br />
            for <span style={{
              background: 'linear-gradient(90deg, #FFFFFF, var(--text-tertiary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Distributed Assets.</span>
          </h1>

          {/* Subtext description */}
          <p style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 36px',
            lineHeight: 1.6
          }}>
            FileDrive merges global asset organization, automated pipeline ingestion, and cryptographically isolated team permissions into a dense real-time command deck.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '64px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/register')}
              className="btn-primary" 
              style={{ height: '44px', padding: '0 24px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              Initialize Node Account <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => document.getElementById('network-showcase').scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary" 
              style={{ height: '44px', padding: '0 24px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Terminal size={14} /> View Diagnostics
            </button>
          </div>

          {/* LIVE SYSTEM DASHBOARD HERO WIDGET */}
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
            overflow: 'hidden'
          }}>
            {/* Header controls bar */}
            <div style={{
              height: '42px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ marginLeft: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>node_handshake_viewer.sh</span>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                <span>UPTIME: <span style={{ color: 'var(--text-primary)' }}>{uptime}%</span></span>
                <span>CPU: <span style={{ color: 'var(--text-primary)' }}>{cpuUsage}%</span></span>
                <span>INGEST_RATE: <span style={{ color: 'var(--accent-indigo)' }}>{bandwidth} MB/s</span></span>
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', minHeight: '380px' }}>
              
              {/* Column 1: Tree / Node Index */}
              <div style={{ borderRight: '1px solid var(--border)', padding: '20px', textAlign: 'left', background: 'rgba(0,0,0,0.1)' }}>
                <span className="sys-label" style={{ display: 'block', marginBottom: '16px' }}>Workspace Directory</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <Layers size={14} style={{ color: 'var(--accent-indigo)' }} />
                    <span>root_vortex_org</span>
                  </div>
                  <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Database size={13} style={{ color: 'var(--text-tertiary)' }} />
                      <span>assets_database</span>
                    </div>
                    <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--accent-indigo)' }}>🗎</span>
                        <span>prod_db_dump.sql</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🗎</span>
                        <span>client_credentials.pem</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Cpu size={13} style={{ color: 'var(--text-tertiary)' }} />
                      <span>pipelines_config</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={13} style={{ color: 'var(--text-tertiary)' }} />
                      <span>organization_nodes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Live Graphic / Wave telemetry */}
              <div style={{ borderRight: '1px solid var(--border)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
                <div>
                  <span className="sys-label" style={{ display: 'block', marginBottom: '16px' }}>Network Interface Wave</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '140px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                    {/* Simulated bouncing wave bars */}
                    {Array.from({ length: 18 }).map((_, i) => {
                      const randVal = Math.floor(Math.sin((i + cpuUsage) * 0.5) * 45) + 55;
                      return (
                        <div 
                          key={i} 
                          style={{ 
                            flex: 1, 
                            height: `${randVal}%`, 
                            background: i % 3 === 0 ? 'var(--accent-indigo)' : 'var(--border-strong)', 
                            borderRadius: '2px',
                            transition: 'height 1s ease'
                          }} 
                        />
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ color: 'var(--text-quaternary)' }}>INBOUND NODE</span>
                    <span>10.231.42.92</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-quaternary)' }}>PACKETS INGESTED</span>
                    <span>{(cpuUsage * 142).toFixed(0)} / sec</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Live Ingest Queue list */}
              <div style={{ padding: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className="sys-label">Live Ingestion Queue</span>
                  <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>● {activeUploads.filter(u=>u.progress < 100).length} ACTIVE</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeUploads.map(up => (
                    <div key={up.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{up.name}</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>{up.size}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {/* Text based progress visual */}
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: '10px',
                          color: up.status === 'completed' ? 'var(--accent-green)' : 'var(--text-secondary)',
                          flex: 1, letterSpacing: '-0.02em', overflow: 'hidden', whiteSpace: 'nowrap'
                        }}>
                          {up.status === 'completed' ? (
                            '|████████████████████| 100% SUCCESS'
                          ) : (
                            `|${'█'.repeat(Math.floor(up.progress / 5))}${'░'.repeat(20 - Math.floor(up.progress / 5))}| ${up.progress}%`
                          )}
                        </div>
                        <span style={{
                          fontSize: '9px', fontFamily: 'var(--font-mono)',
                          padding: '2px 6px', borderRadius: '4px',
                          background: up.status === 'completed' ? 'var(--accent-green-soft)' : up.status === 'indexing' ? 'var(--accent-amber-soft)' : 'var(--accent-indigo-soft)',
                          color: up.status === 'completed' ? 'var(--accent-green)' : up.status === 'indexing' ? 'var(--accent-amber)' : 'var(--accent-indigo)',
                          textTransform: 'uppercase'
                        }}>
                          {up.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* LIVE NETWORK ACTIVITY FEED */}
      <section id="network-showcase" style={{
        position: 'relative',
        zIndex: 10,
        padding: '80px 24px',
        borderTop: '1px solid var(--border)',
        background: 'rgba(11, 11, 13, 0.5)'
      }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '2fr 3fr', gap: '48px', alignItems: 'start' }}>
            
            {/* Descriptive block */}
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-indigo)',
                letterSpacing: '0.1em', fontWeight: 600
              }}>
                [TELEMETRY PIPELINE]
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                Continuous, cryptographically sealed ingress.
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Every node connection registers transparently. Monitor indexing parameters, deduplication handshakes, and distributed network health in real-time. No background queues that vanish.
              </p>

              {/* Ingress stats cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
                <div className="stat-card">
                  <span className="metric-label">GLOBAL DATAPATHS</span>
                  <div className="metric-value" style={{ marginTop: '8px' }}>12 / 12</div>
                  <span style={{ fontSize: '10px', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>▲ Node Handshake Stable</span>
                </div>
                <div className="stat-card">
                  <span className="metric-label">ENCRYPT_LATENCY</span>
                  <div className="metric-value" style={{ marginTop: '8px' }}>0.04 ms</div>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>AES-GCM-256 Core</span>
                </div>
              </div>
            </div>

            {/* Simulated log feed block */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              fontFamily: 'var(--font-mono)',
              textAlign: 'left',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={14} style={{ color: 'var(--accent-indigo)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>LIVE NODE INGRESS LOGS</span>
                </div>
                <div style={{ width: '6px', height: '6px', background: 'var(--accent-green)', borderRadius: '50%' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '260px', maxHeight: '320px', overflowY: 'hidden' }}>
                {ingestLogs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', gap: '12px', fontSize: '11px', lineHeight: 1.4, animation: 'fadeIn 0.3s ease-out' }}>
                    <span style={{ color: 'var(--text-quaternary)' }}>[{log.timestamp}]</span>
                    <span style={{ 
                      color: log.status === 'WARN' ? 'var(--accent-amber)' : 'var(--accent-indigo)',
                      fontWeight: 700
                    }}>[{log.status}]</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* MISSION CONTROL INTERACTIVE CLI SHOWCASE */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        padding: '80px 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-base)'
      }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 56px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-indigo)',
              letterSpacing: '0.15em', fontWeight: 600, marginBottom: '16px'
            }}>
              [COMMAND-LINE INTERACTION]
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              A CLI-First Workspace Node Core
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '12px' }}>
              FileDrive connects directly into your developer terminal. Authenticate credentials, spin up sync services, and inspect workspace files with straightforward CLI binaries.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            
            {/* Left: Terminal Shell UI */}
            <div style={{
              background: '#070709',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
            }}>
              {/* Terminal Title Bar */}
              <div style={{
                height: '36px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px'
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-quaternary)', marginLeft: '12px' }}>bash - filedrive-agent</span>
              </div>

              {/* Terminal Scroll Area */}
              <div style={{
                padding: '20px', fontFamily: 'var(--font-mono)', fontSize: '11.5px',
                textAlign: 'left', minHeight: '260px', maxHeight: '300px', overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                {cliOutput.map((line, idx) => (
                  <div key={idx} style={{ 
                    color: line.type === 'input' ? 'var(--text-primary)' : line.type === 'error' ? 'var(--accent-red)' : line.type === 'success' ? 'var(--accent-green)' : 'var(--text-secondary)'
                  }}>
                    {line.type === 'input' ? <span style={{ color: 'var(--accent-indigo)' }}>vortex_shell$ </span> : ''}
                    {line.text}
                  </div>
                ))}

                {/* Form command input line */}
                <form onSubmit={handleCliSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ color: 'var(--accent-indigo)' }}>vortex_shell$ </span>
                  <input 
                    type="text"
                    value={cliCommand}
                    onChange={(e) => setCliCommand(e.target.value)}
                    placeholder='Type "help" and press enter...'
                    style={{
                      background: 'none', border: 'none', outline: 'none',
                      color: 'var(--text-primary)', flex: 1, marginLeft: '6px',
                      fontFamily: 'var(--font-mono)', fontSize: '11.5px'
                    }}
                  />
                </form>
              </div>
            </div>

            {/* Right: Interactive Pipeline Simulator */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '28px',
              textAlign: 'left',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span className="sys-label">Interactive Pipeline Simulator</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: showcaseState === 'completed' ? 'var(--accent-green)' : showcaseState === 'processing' ? 'var(--accent-amber)' : 'var(--text-quaternary)' }} />
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{showcaseState}</span>
                  </div>
                </div>

                <div style={{
                  minHeight: '140px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)',
                  borderRadius: '6px', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px',
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  {showcaseLog.length === 0 ? (
                    <div style={{ color: 'var(--text-quaternary)', display: 'flex', alignItems: 'center', height: '100px', justifyContent: 'center' }}>
                      Click "Trigger Upload Handshake" below to visualize.
                    </div>
                  ) : (
                    showcaseLog.map((log, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ color: 'var(--accent-indigo)' }}>+{log.time}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{log.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={triggerShowcaseSim}
                  disabled={showcaseState === 'processing'}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', height: '38px', fontSize: '12px' }}
                >
                  {showcaseState === 'processing' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={12} className="animate-spin" /> Processing...
                    </span>
                  ) : (
                    'Trigger Upload Handshake'
                  )}
                </button>
                <button 
                  onClick={resetShowcase}
                  className="btn-secondary"
                  style={{ height: '38px', width: '38px', padding: 0, justifyContent: 'center' }}
                  title="Reset Simulator"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* TEAM COLLABORATION & ACTIVITY LOG */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        padding: '80px 24px',
        borderTop: '1px solid var(--border)',
        background: 'rgba(11, 11, 13, 0.5)'
      }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '3fr 2fr', gap: '48px', alignItems: 'center' }}>
            
            {/* Telemetry log table */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '24px', textAlign: 'left',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <span className="sys-label">COLLABORATIVE AUDIT DICTIONARY</span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>REFRESHED RECENTLY</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[
                  { time: '14:28', node: 'vortex-node-1', user: 'vishwath.n', action: 'CREATE_TOKEN', target: 'magic_invite_link_492', role: 'ADMIN' },
                  { time: '14:15', node: 'vortex-node-2', user: 'sarah.j', action: 'INGEST_ASSET', target: 'marketing_pitch_v2.pdf', role: 'EDITOR' },
                  { time: '13:58', node: 'vortex-node-1', user: 'system_core', action: 'SYNC_HANDSHAKE', target: 'ap-south-1_replica_pool', role: 'CORE' },
                  { time: '13:12', node: 'vortex-node-3', user: 'dev_runner', action: 'ROTATED_KEYS', target: 'jwt_sign_token', role: 'ADMIN' },
                  { time: '12:44', node: 'vortex-node-1', user: 'vishwath.n', action: 'ROLE_UPDATE', target: 'john.doe_view_badge', role: 'ADMIN' }
                ].map((audit, i) => (
                  <div key={i} className="activity-item" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '12px 0' }}>
                    <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                      <span style={{ color: 'var(--text-quaternary)' }}>{audit.time}</span>
                      <span style={{ color: 'var(--accent-indigo)', width: '90px', overflow: 'hidden' }}>{audit.node}</span>
                      <span style={{ color: 'var(--text-primary)', width: '80px', overflow: 'hidden' }}>{audit.user}</span>
                      <span style={{ 
                        color: audit.action === 'ROTATED_KEYS' ? 'var(--accent-amber)' : 'var(--text-secondary)',
                        fontWeight: 600, width: '110px'
                      }}>{audit.action}</span>
                      <span style={{ color: 'var(--text-tertiary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{audit.target}</span>
                      <span style={{ 
                        color: audit.role === 'ADMIN' || audit.role === 'CORE' ? 'var(--accent-indigo-hover)' : 'var(--text-tertiary)',
                        fontSize: '9px', padding: '1px 5px', borderRadius: '4px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)'
                      }}>{audit.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Informational block */}
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-indigo)',
                letterSpacing: '0.1em', fontWeight: 600
              }}>
                [AUDITING & COMPLIANCE]
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                Granular collaboration, fully indexed.
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Track organization state shifts with detailed logs. Every invitation, role alignment, and ingestion block gets logged into a tamper-proof workspace ledger.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={16} style={{ color: 'var(--accent-indigo)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cryptographically sealed token validation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={16} style={{ color: 'var(--accent-indigo)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Granular team scope separation</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* TECHNICAL PRICE MATRIX SECTION */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        padding: '80px 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-base)'
      }}>
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-indigo)',
              letterSpacing: '0.15em', fontWeight: 600, marginBottom: '16px'
            }}>
              [CAPACITY SPECIFICATION]
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Node tiers constructed for utility scale
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Choose a node configuration that matches your data throughput needs. Linear tiering with zero surprise costs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
            
            {/* Starter Plan */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '32px', textAlign: 'left',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden'
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>NODE_STARTER</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0 8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>₹299</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-quaternary)', fontFamily: 'var(--font-mono)' }}>/ MONTH</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                  Core parameters mapped for single-engineer operations and small project syncs.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span>5 GB Cloud Storage Space</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span>1 Active Organization Node</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span>Standard Ingest Pipelines</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/register')}
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', height: '40px', fontSize: '13px' }}
              >
                Initialize Starter Tier
              </button>
            </div>

            {/* Scale Plan (Orange highlight) */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--accent-indigo)',
              borderRadius: '12px', padding: '32px', textAlign: 'left',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(255,107,0,0.06)'
            }}>
              <div style={{
                position: 'absolute', top: 0, right: 0,
                background: 'var(--accent-indigo)', color: '#FFFFFF',
                fontSize: '9px', fontWeight: 700, padding: '4px 12px',
                fontFamily: 'var(--font-mono)', borderBottomLeftRadius: '8px',
                letterSpacing: '0.05em'
              }}>
                RECOMMENDED
              </div>

              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-indigo)', letterSpacing: '0.04em', fontWeight: 600 }}>NODE_COLLABORATIVE</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0 8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>₹799</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-quaternary)', fontFamily: 'var(--font-mono)' }}>/ MONTH</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                  Engineered specifically for engineering setups requiring real-time organization sharing.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--accent-indigo)' }} />
                    <span style={{ fontWeight: 600 }}>100 GB High-Speed Storage</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--accent-indigo)' }} />
                    <span>Uncapped Organization Nodes</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--accent-indigo)' }} />
                    <span>Granular Roles & Permission Tiering</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--accent-indigo)' }} />
                    <span>Priority Queue Ingestion Processing</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/register')}
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', height: '40px', fontSize: '13px' }}
              >
                Initialize Collaborative Tier
              </button>
            </div>

            {/* Enterprise Plan */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '32px', textAlign: 'left',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden'
            }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>NODE_ENTERPRISE</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0 8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>₹4,000</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-quaternary)', fontFamily: 'var(--font-mono)' }}>/ MONTH</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                  Engineered with dedicated ingestion resources and isolated network pipelines.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span>Uncapped Storage Space Limit</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span>Dedicated Cluster Handlers</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span>Custom Endpoint API Webhooks</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                    <CheckCircle size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span>Continuous Uptime Compliance SLA</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/register')}
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', height: '40px', fontSize: '13px' }}
              >
                Initialize Enterprise Node
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* TERMINAL-STYLE FAQ SECTION */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        padding: '80px 24px',
        borderTop: '1px solid var(--border)',
        background: 'rgba(11, 11, 13, 0.5)'
      }}>
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="sys-label">System Diagnostics Q&A</span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginTop: '12px' }}>
              Frequently Queried Topics
            </h2>
          </div>

          {/* Selector Tabs styled as buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {Object.keys(faqs).map(topic => (
              <button 
                key={topic}
                onClick={() => setActiveFaq(topic)}
                className={activeFaq === topic ? 'btn-primary' : 'btn-secondary'}
                style={{ 
                  height: '32px', padding: '0 16px', fontSize: '11.5px', 
                  fontFamily: 'var(--font-mono)', textTransform: 'uppercase'
                }}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* FAQ Terminal Box */}
          <div style={{
            background: '#070709', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '24px', fontFamily: 'var(--font-mono)',
            textAlign: 'left', boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', gap: '8px', color: 'var(--accent-indigo)', fontSize: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <span>filedrive-cli $</span>
              <span style={{ color: 'var(--text-primary)' }}>{faqs[activeFaq].cmd}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {faqs[activeFaq].output.map((out, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--text-quaternary)', fontSize: '10px' }}>&gt;&gt; {out.key}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px', paddingLeft: '12px' }}>{out.val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* PREMIUM CTA BANNER SECTION */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        padding: '80px 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-base)'
      }}>
        <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
          
          <div style={{
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(255,107,0,0.03) 100%)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '64px 48px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
          }}>
            {/* Glowing highlight strip */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '200px', height: '1px', background: 'var(--accent-indigo-hover)',
              boxShadow: '0 0 12px var(--accent-indigo-hover)'
            }} />

            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-indigo)',
              letterSpacing: '0.15em', fontWeight: 600, marginBottom: '16px'
            }}>
              [INITIALIZATION PORTAL]
            </div>

            <h3 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
              Initialize your organization node today.
            </h3>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
              Unlock micro-latency file ingestion, team permission matrixes, and total command control in less than five minutes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => navigate('/register')}
                className="btn-primary" 
                style={{ height: '46px', padding: '0 32px', fontSize: '13px', fontWeight: 600 }}
              >
                Create Workspace Node Now
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                <span>OR EXECUTE:</span>
                <code style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-primary)' }}>npm i -g @filedrive/cli</code>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid var(--border)',
        background: 'rgba(11, 11, 13, 0.9)',
        padding: '40px 24px'
      }}>
        <div style={{
          width: '100%', maxWidth: '1280px', margin: '0 auto',
          display: 'flex', flexDirection: 'column', mdDirection: 'row',
          alignItems: 'center', justifyContent: 'space-between', gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="FileDrive Logo" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>filedrive_</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['REPOSITORY', 'TELEMETRY', 'DOCUMENTATION', 'SUPPORT'].map((link) => (
              <a 
                key={link} 
                href="#" 
                style={{ 
                  fontFamily: 'var(--font-mono)', fontSize: '11px', 
                  color: 'var(--text-tertiary)', textDecoration: 'none',
                  letterSpacing: '0.04em'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              >
                {link}
              </a>
            ))}
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-quaternary)' }}>
            © {new Date().getFullYear()} FILEDRIVE INC. ALL SECRETS REGISTERED.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
