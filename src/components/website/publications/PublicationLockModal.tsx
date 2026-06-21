'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Lock, Mail, CheckCircle, Loader2, KeyRound, Send, X } from 'lucide-react';
import { verifyPublicationPassword, requestPublicationAccess } from '@/app/actions/publication-access';
import type { PublicationRow } from '@/lib/publications';

type Props = {
  publication: PublicationRow | null;
  onUnlock: () => void;
  onClose: () => void;
};

type Tab = 'password' | 'request';

export function PublicationLockModal({ publication, onUnlock, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('password');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [requestState, setRequestState] = useState<'idle' | 'sent' | 'loading'>('idle');
  const [requestError, setRequestError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpen = Boolean(publication);

  useEffect(() => {
    if (isOpen) {
      setTab('password');
      setPassword('');
      setEmail('');
      setPasswordError('');
      setRequestError('');
      setRequestState('idle');
      setVerifying(false);
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handlePasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publication) return;
    setPasswordError('');
    setVerifying(true);
    const result = await verifyPublicationPassword(publication.id, password);
    setVerifying(false);
    if (result.valid) {
      try { localStorage.setItem(`pub_unlocked_${publication.id}`, '1'); } catch {}
      onUnlock();
    } else {
      setPasswordError('Incorrect password. Try again or request access.');
    }
  }, [publication, password, onUnlock]);

  const handleRequestAccess = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publication) return;
    setRequestError('');
    setRequestState('loading');
    const result = await requestPublicationAccess(publication.id, email);
    if (result.success) {
      setRequestState('sent');
    } else {
      setRequestError(result.error || 'Something went wrong.');
      setRequestState('idle');
    }
  }, [publication, email]);

  return (
    <>
      <div className={`pub-drawer-backdrop${isOpen ? ' open' : ''}`} onClick={onClose} aria-hidden />
      <aside
        className={`pub-drawer-panel${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Unlock publication"
      >
        <button className="pub-drawer-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="pub-drawer-content" style={{ padding: '3rem 2.5rem' }}>
          {publication && (
            <div className="flex flex-col justify-center" style={{ minHeight: 'calc(100dvh - 6rem)' }}>
              {/* Lock icon */}
              <div className="pub-lock-icon">
                <div className="pub-lock-icon-inner">
                  <Lock size={26} />
                </div>
              </div>

              {/* Heading */}
              <h2 className="pub-lock-heading">Access Required</h2>
              <p className="pub-lock-subtitle">
                This publication is private. Enter the password or request access from the administrator.
              </p>

              {/* Tabs */}
              <div className="pub-lock-tabs">
                <button
                  type="button"
                  onClick={() => { setTab('password'); setPasswordError(''); }}
                  className={`pub-lock-tab${tab === 'password' ? ' active' : ''}`}
                >
                  <KeyRound size={15} />
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('request'); setRequestError(''); }}
                  className={`pub-lock-tab${tab === 'request' ? ' active' : ''}`}
                >
                  <Send size={15} />
                  Request Access
                </button>
              </div>

              {/* Password Tab */}
              {tab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="pub-lock-form">
                  <input
                    ref={inputRef}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter publication password"
                    className="pub-lock-input"
                  />
                  {passwordError && (
                    <p className="pub-lock-error">
                      <Lock size={12} />
                      {passwordError}
                    </p>
                  )}
                  <button type="submit" disabled={verifying || !password} className="pub-lock-btn">
                    {verifying ? (
                      <Loader2 size={16} className="spin" />
                    ) : (
                      <>
                        <KeyRound size={15} />
                        Unlock Publication
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Request Access Tab */}
              {tab === 'request' && (
                requestState === 'sent' ? (
                  <div className="pub-lock-sent-card">
                    <div className="pub-lock-sent-icon">
                      <CheckCircle size={24} />
                    </div>
                    <p className="pub-lock-sent-title">Request Sent!</p>
                    <p className="pub-lock-sent-desc">
                      The administrator will review your request and email the access password to you.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRequestAccess} className="pub-lock-form">
                    <div className="pub-lock-input-icon-wrap">
                      <Mail size={15} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="pub-lock-input pub-lock-input-icon"
                      />
                    </div>
                    <p className="pub-lock-hint">
                      We&apos;ll send the password to this email once the administrator grants your request.
                    </p>
                    {requestError && (
                      <p className="pub-lock-error">
                        <Lock size={12} />
                        {requestError}
                      </p>
                    )}
                    <button type="submit" disabled={requestState === 'loading' || !email} className="pub-lock-btn">
                      {requestState === 'loading' ? (
                        <Loader2 size={16} className="spin" />
                      ) : (
                        <>
                          <Send size={15} />
                          Send Request
                        </>
                      )}
                    </button>
                  </form>
                )
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
