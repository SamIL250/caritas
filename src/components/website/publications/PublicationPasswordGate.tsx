'use client';

import { useState, useCallback } from 'react';
import { Lock, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { verifyPublicationPassword, requestPublicationAccess } from '@/app/actions/publication-access';

type Props = {
  publicationId: string;
  publicationTitle: string;
  onUnlock: () => void;
};

export function PublicationPasswordGate({ publicationId, publicationTitle, onUnlock }: Props) {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [requestState, setRequestState] = useState<'idle' | 'sent' | 'loading'>('idle');
  const [requestError, setRequestError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handlePasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setVerifying(true);
    const result = await verifyPublicationPassword(publicationId, password);
    setVerifying(false);
    if (result.valid) {
      try {
        localStorage.setItem(`pub_unlocked_${publicationId}`, '1');
      } catch {}
      onUnlock();
    } else {
      setPasswordError('Incorrect password. Try again or request access.');
    }
  }, [publicationId, password, onUnlock]);

  const handleRequestAccess = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError('');
    setRequestState('loading');
    const result = await requestPublicationAccess(publicationId, email);
    if (result.success) {
      setRequestState('sent');
    } else {
      setRequestError(result.error || 'Something went wrong. Try again.');
      setRequestState('idle');
    }
  }, [publicationId, email]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4 py-20">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#8c2208]/10 text-[#8c2208]">
          <Lock size={26} />
        </div>
        <h2 className="text-lg font-bold text-stone-900 mb-1">Locked Publication</h2>
        <p className="text-sm text-stone-500 mb-6">
          &ldquo;{publicationTitle}&rdquo; is password-protected.
        </p>

        {/* Password form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-3 mb-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-center focus:border-[#8c2208] focus:outline-none focus:ring-2 focus:ring-[#8c2208]/20"
          />
          {passwordError && (
            <p className="text-xs text-red-600">{passwordError}</p>
          )}
          <button
            type="submit"
            disabled={verifying || !password}
            className="w-full rounded-lg bg-[#8c2208] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#6b1a05] disabled:opacity-50"
          >
            {verifying ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Unlock'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs font-medium text-stone-400">or</span>
          </div>
        </div>

        {/* Request access */}
        {requestState === 'sent' ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle size={18} className="mx-auto mb-2" />
            <p className="font-semibold">Request sent!</p>
            <p className="mt-1 text-xs text-emerald-600">
              The administrator will review your request and send the access password to your email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRequestAccess} className="space-y-3">
            <p className="text-xs font-medium text-stone-500">Don&apos;t have the password? Request access:</p>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full rounded-lg border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-[#8c2208] focus:outline-none focus:ring-2 focus:ring-[#8c2208]/20"
              />
            </div>
            {requestError && (
              <p className="text-xs text-red-600">{requestError}</p>
            )}
            <button
              type="submit"
              disabled={requestState === 'loading' || !email}
              className="w-full rounded-lg border border-[#8c2208] bg-white px-4 py-2.5 text-sm font-bold text-[#8c2208] transition-colors hover:bg-[#8c2208] hover:text-white disabled:opacity-50"
            >
              {requestState === 'loading' ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Request Access'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
