'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RichTextEditor } from '@/components/dashboard/RichTextEditor';
import { updatePolicyPage } from '@/app/actions/policy-pages';
import { Loader2 } from 'lucide-react';
import type { PolicyPage } from '@/lib/cookie-consent';

export function PolicyPageEditor({ page }: { page: PolicyPage }) {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    const result = await updatePolicyPage(page.slug, { title, content });
    if (result.success) {
      setMessage({ type: 'ok', text: 'Page updated successfully.' });
    } else {
      setMessage({ type: 'err', text: result.error || 'Failed to save.' });
    }
    setSaving(false);
  }, [page.slug, title, content]);

  return (
    <Card className="p-6 space-y-5">
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Page Title</p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515]"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Content</p>
        <RichTextEditor value={content} onChange={setContent} placeholder="Start writing your policy content..." />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <div>
          {message && (
            <span className={`text-xs font-bold ${message.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/${page.slug}`}
            target="_blank"
            className="text-xs font-bold text-stone-500 hover:text-[#7A1515] transition-colors"
          >
            Preview page →
          </a>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
