import { useEffect, useRef, useState } from 'react';
import type { CatalogItem } from '../types';

interface ResourceDrawerProps {
  item: CatalogItem | null;
  onClose: () => void;
}

export function ResourceDrawer({ item, onClose }: ResourceDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [markdownPreview, setMarkdownPreview] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    if (!item) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setCopiedKey(null);
    setMarkdownPreview(null);
    setPreviewState('idle');
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [item, onClose]);

  if (!item) return null;

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((cur) => (cur === key ? null : cur)), 1800);
    } catch {
      setCopiedKey(null);
    }
  };

  const loadUpstreamSkill = async () => {
    if (!item.rawUrl) return;
    setPreviewState('loading');
    try {
      const res = await fetch(item.rawUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setMarkdownPreview(text);
      setPreviewState('idle');
    } catch {
      setPreviewState('error');
    }
  };

  const primarySnippet = item.configSnippet || item.install || `Get skill: ${item.pathSlug}`;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="relative z-10 flex h-dvh w-full max-w-xl flex-col overflow-y-auto border-s border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-drawer)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <span className="font-mono uppercase">{item.kind}</span>
              <span aria-hidden="true">/</span>
              <span>{item.source}</span>
              <span aria-hidden="true">/</span>
              <span>{item.category}</span>
            </div>
            <h2
              id="drawer-title"
              className="mt-1.5 text-lg font-semibold tracking-tight text-[var(--text-primary)] text-balance"
            >
              {item.name}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)] break-all">
              {item.pathSlug}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="btn-press inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
          >
            <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex flex-1 flex-col gap-5">
          <div>
            <h3 className="text-xs font-medium text-[var(--text-tertiary)]">Summary</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)] text-pretty">
              {item.description || 'No description provided by upstream registry.'}
            </p>
          </div>

          {item.topics.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-[var(--text-tertiary)]">Topics</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2 py-0.5 font-mono text-xs text-[var(--text-secondary)]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-medium text-[var(--text-tertiary)]">
                {item.configSnippet ? 'MCP Configuration' : 'Install / Reference Path'}
              </h3>
              <button
                type="button"
                onClick={() => copyText('primary', primarySnippet)}
                className="btn-press inline-flex min-h-9 items-center rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)]"
              >
                {copiedKey === 'primary' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-[var(--bg-inset)] p-3 font-mono text-xs text-[var(--text-primary)]">
              <code>{primarySnippet}</code>
            </pre>
          </div>

          {item.source !== 'skillsourcebook' && item.kind === 'skill' && (
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-medium text-[var(--text-tertiary)]">
                  UI Skills MCP Lookup
                </h3>
                <button
                  type="button"
                  onClick={() => copyText('mcp-call', item.pathSlug)}
                  className="btn-press inline-flex min-h-9 items-center rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                >
                  {copiedKey === 'mcp-call' ? 'Copied slug' : 'Copy slug'}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">
                With <code className="text-[var(--text-primary)]">ui-skills</code> MCP connected, ask any agent to run{' '}
                <code className="text-[var(--text-primary)]">get_skill</code> with{' '}
                <code className="text-[var(--text-primary)]">{item.pathSlug}</code>.
              </p>
            </div>
          )}

          {item.rawUrl && (
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-medium text-[var(--text-tertiary)]">Upstream SKILL.md</h3>
                <button
                  type="button"
                  onClick={loadUpstreamSkill}
                  disabled={previewState === 'loading'}
                  className="btn-press inline-flex min-h-9 items-center rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-50"
                >
                  {previewState === 'loading' ? 'Loading…' : markdownPreview ? 'Reload' : 'Preview Markdown'}
                </button>
              </div>

              {previewState === 'error' && (
                <p className="mt-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-inset)] p-3 text-xs text-[var(--text-secondary)]">
                  Could not fetch upstream raw markdown directly (upstream file may have moved or blocked CORS). Open the source repository link below instead.
                </p>
              )}

              {markdownPreview && (
                <pre className="mt-2 max-h-80 overflow-auto rounded-md border border-[var(--border-subtle)] bg-[var(--bg-inset)] p-3 font-mono text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap break-words">
                  <code>{markdownPreview}</code>
                </pre>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4 pb-[env(safe-area-inset-bottom)]">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press inline-flex min-h-11 items-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-ink)]"
          >
            Open Source
          </a>
          <button
            type="button"
            onClick={onClose}
            className="btn-press inline-flex min-h-11 items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}
