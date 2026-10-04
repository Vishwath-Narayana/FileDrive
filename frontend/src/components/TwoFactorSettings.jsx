import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../services/supabaseClient';

const labelStyle = {
  display: 'block',
  fontSize: '11px', fontWeight: 600,
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--text-tertiary)',
  marginBottom: '8px',
};

/**
 * Authenticator-app (TOTP) two-step verification, built on Supabase MFA.
 * Enrolling: scan QR -> enter a code -> factor becomes "verified" and login then requires it.
 */
const TwoFactorSettings = () => {
  const [loading, setLoading] = useState(true);
  const [factor, setFactor] = useState(null); // the verified TOTP factor, if any
  const [setup, setSetup] = useState(null); // { factorId, qr, secret } while enrolling
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      toast.error('Could not load two-step verification status');
    } else {
      setFactor(data.totp?.[0] || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startSetup = async () => {
    setBusy(true);
    try {
      // Drop half-finished enrollments from earlier attempts (they block re-enrolling)
      const { data: all } = await supabase.auth.mfa.listFactors();
      for (const f of all?.all || []) {
        if (f.factor_type === 'totp' && f.status === 'unverified') {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'FileDrive' });
      if (error) throw error;
      setSetup({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
      setCode('');
    } catch (e) {
      toast.error(e.message || 'Could not start setup');
    } finally {
      setBusy(false);
    }
  };

  const cancelSetup = async () => {
    if (setup) await supabase.auth.mfa.unenroll({ factorId: setup.factorId }).catch(() => {});
    setSetup(null);
    setCode('');
  };

  const confirmSetup = async (e) => {
    e.preventDefault();
    if (code.replace(/\s/g, '').length !== 6) {
      toast.error('Enter the 6-digit code from your authenticator app');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: setup.factorId, code: code.replace(/\s/g, '') });
      if (error) throw error;
      toast.success('Two-step verification is on');
      setSetup(null);
      setCode('');
      await load();
    } catch (err) {
      toast.error(err.message || 'That code did not work, try again');
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    if (!window.confirm('Turn off two-step verification? Your account will be protected by your password only.')) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
      if (error) throw error;
      toast.success('Two-step verification turned off');
      await load();
    } catch (err) {
      toast.error(err.message || 'Could not turn it off. Sign out and sign in with your code first.');
    } finally {
      setBusy(false);
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(setup.secret);
      toast.success('Setup key copied');
    } catch {
      toast.error('Copy failed, select the key manually');
    }
  };

  return (
    <div id="two-factor-section" className="cc-surface" style={{ borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <ShieldCheck size={14} style={{ color: 'var(--text-tertiary)' }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Two-step verification</span>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '0 0 16px', lineHeight: 1.5 }}>
        Require a 6-digit code from an authenticator app (Google Authenticator, Authy, 1Password) when you sign in.
      </p>

      {loading ? (
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Loading...</p>
      ) : setup ? (
        <form onSubmit={confirmSetup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <img src={setup.qr} alt="Scan with your authenticator app" width={160} height={160} style={{ background: '#fff', borderRadius: '8px', padding: '6px' }} />
            <div style={{ flex: 1, minWidth: '220px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px' }}>
                1. Scan the QR code with your app.<br />
                2. Enter the 6-digit code it shows.
              </p>
              <label style={labelStyle}>OR ENTER THIS KEY MANUALLY</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <code style={{ fontSize: '12px', wordBreak: 'break-all', color: 'var(--text-primary)' }}>{setup.secret}</code>
                <button type="button" onClick={copySecret} title="Copy" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                  <Copy size={14} />
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '10px 0 0' }}>
                Keep this key somewhere safe. If you lose your device, it is the only way to set the app up again.
              </p>
            </div>
          </div>
          <div style={{ maxWidth: '220px' }}>
            <label style={labelStyle} htmlFor="totp-code">VERIFICATION CODE</label>
            <input
              id="totp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d\s]/g, ''))}
              className="input-field"
              placeholder="123456"
              style={{ letterSpacing: '0.3em', fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={busy} className="btn-primary-indigo">{busy ? 'Verifying...' : 'Verify and turn on'}</button>
            <button type="button" onClick={cancelSetup} disabled={busy} className="btn-secondary">Cancel</button>
          </div>
        </form>
      ) : factor ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> On: authenticator app
          </span>
          <button type="button" onClick={disable} disabled={busy} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldOff size={13} /> Turn off
          </button>
        </div>
      ) : (
        <button type="button" onClick={startSetup} disabled={busy} className="btn-primary-indigo">
          {busy ? 'Starting...' : 'Set up authenticator app'}
        </button>
      )}
    </div>
  );
};

export default TwoFactorSettings;
