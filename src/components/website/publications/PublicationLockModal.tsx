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

  const inputClass = "w-full rounded-[10px] border-2 border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:border-[#911313] focus:bg-white focus:ring-[3px] focus:ring-[#911313]/10";
  const btnPrimaryClass = "w-full rounded-[10px] bg-[#911313] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#7a0f0f] active:scale-[0.98] disabled:opacity-40";

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
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#911313]/10 to-[#911313]/5">
                  <Lock size={26} className="text-[#911313]" />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-center text-xl font-bold tracking-tight text-stone-900 mb-1.5">
                Access Required
              </h2>
              <p className="text-center text-sm text-stone-500 mb-8 leading-relaxed max-w-xs mx-auto">
                This publication is private. Enter the password or request access from the administrator.
              </p>

              {/* Tabs */}
              <div className="flex mb-8 rounded-[10px] border border-stone-200 bg-stone-50 p-1">
                <button
                  type="button"
                  onClick={() => { setTab('password'); setPasswordError(''); }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition-all ${
                    tab === 'password'
                      ? 'bg-white text-[#911313] shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <KeyRound size={15} />
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('request'); setRequestError(''); }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition-all ${
                    tab === 'request'
                      ? 'bg-white text-[#911313] shadow-sm'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Send size={15} />
                  Request Access
                </button>
              </div>

              {/* Password Tab */}
              {tab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <input
                    ref={inputRef}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter publication password"
                    className={inputClass}
                  />
                  {passwordError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded-[8px] px-3 py-2">
                      <Lock size={12} />
                      {passwordError}
                    </p>
                  )}
                  <button type="submit" disabled={verifying || !password} className={btnPrimaryClass}>
                    {verifying ? (
                      <Loader2 size={16} className="mx-auto animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <KeyRound size={15} />
                        Unlock Publication
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* Request Access Tab */}
              {tab === 'request' && (
                requestState === 'sent' ? (
                  <div className="rounded-[12px] bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-200/60 px-6 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle size={24} className="text-emerald-600" />
                    </div>
                    <p className="text-base font-bold text-emerald-900">Request Sent!</p>
                    <p className="mt-2 text-sm text-emerald-700 leading-relaxed max-w-[260px] mx-auto">
                      The administrator will review your request and email the access password to you.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRequestAccess} className="space-y-3">
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      We&apos;ll send the password to this email once the administrator grants your request.
                    </p>
                    {requestError && (
                      <p className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded-[8px] px-3 py-2">
                        <Lock size={12} />
                        {requestError}
                      </p>
                    )}
                    <button type="submit" disabled={requestState === 'loading' || !email} className={btnPrimaryClass}>
                      {requestState === 'loading' ? (
                        <Loader2 size={16} className="mx-auto animate-spin" />
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Send size={15} />
                          Send Request
                        </span>
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
