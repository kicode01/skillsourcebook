import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ResourceDrawer } from './components/ResourceDrawer';
import type { CatalogItem, CatalogPayload, StackCombo } from './types';

type TabKey = 'all' | 'core' | 'combos' | 'mcp' | 'workflow' | 'skill';

const PAGE_SIZE = 48;

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('noslop-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [tab, setTab] = useState<TabKey>('all');
  const [query, setQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeItem, setActiveItem] = useState<CatalogItem | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('noslop-theme', theme);
  }, [theme]);

  const loadCatalog = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/data/catalog.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as CatalogPayload;
      setCatalog(data);
      setStatus('ready');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to load catalog');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && !isTyping && !activeItem) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeItem]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [tab, query, selectedTopic]);

  const copyCommand = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCmd(key);
      window.setTimeout(() => setCopiedCmd((cur) => (cur === key ? null : cur)), 1800);
    } catch {
      setCopiedCmd(null);
    }
  };

  const topTopics = useMemo(() => {
    if (!catalog) return [];
    const counts = new Map<string, number>();
    for (const item of catalog.items) {
      for (const topic of item.topics) {
        counts.set(topic, (counts.get(topic) ?? 0) + 1);
      }
    }
    const pinned = ['anti-slop', 'motion', 'responsive', 'backend', 'security', 'redesign', 'a11y', 'mcp'];
    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);
    const merged = [...new Set([...pinned.filter((p) => counts.has(p)), ...sorted])];
    return merged.slice(0, 12);
  }, [catalog]);

  const filteredItems = useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toLowerCase();

    return catalog.items.filter((item) => {
      if (tab === 'core' && item.source !== 'noslop') return false;
      if (tab === 'mcp' && item.kind !== 'mcp') return false;
      if (tab === 'workflow' && item.kind !== 'workflow') return false;
      if (tab === 'skill' && item.kind !== 'skill') return false;
      if (selectedTopic && !item.topics.includes(selectedTopic)) return false;

      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.pathSlug.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.topics.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [catalog, tab, query, selectedTopic]);

  const filteredCombos = useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toLowerCase();
    if (!q) return catalog.combos;
    return catalog.combos.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.goal.toLowerCase().includes(q) ||
        c.upstreamSkills.some((s) => s.toLowerCase().includes(q)) ||
        c.conflictNote.toLowerCase().includes(q),
    );
  }, [catalog, query]);

  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasActiveFilter = Boolean(query.trim() || selectedTopic || tab !== 'all');

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: catalog?.stats.total },
    { key: 'core', label: 'NoSlop Core', count: (catalog?.stats.noslopModules ?? 0) + (catalog?.stats.workflows ?? 0) },
    { key: 'combos', label: 'Stack Combos', count: catalog?.stats.combos },
    { key: 'mcp', label: 'MCP Servers', count: catalog?.stats.mcps },
    { key: 'workflow', label: 'Workflows', count: catalog?.stats.workflows },
    { key: 'skill', label: 'Skills', count: (catalog?.stats.noslopModules ?? 0) + (catalog?.stats.upstreamSkills ?? 0) },
  ];

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-[var(--text-primary)]"
            >
              <span className="inline-flex size-6 items-center justify-center rounded border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs">
                N
              </span>
              <span>noslop</span>
            </a>
            <span className="hidden text-xs text-[var(--text-muted)] sm:inline">
              / skills · mcp · workflows
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/kicode01/noslop"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press inline-flex min-h-10 items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              GitHub
            </a>
            <button
              type="button"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              className="btn-press inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Compact Workbench Header */}
        <section aria-labelledby="page-title" className="border-b border-[var(--border-subtle)] pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1
                id="page-title"
                className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] text-balance sm:text-3xl"
              >
                Full-stack AI agent skills, MCPs &amp; workflows without the slop.
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)] text-pretty">
                One unified router skill (<code className="text-[var(--text-primary)]">skills/noslop</code>) for
                frontend craft, 60fps motion, responsive layouts, backend APIs, and security — paired with a
                searchable index of upstream community skills, MCP endpoints, and verified combos.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:min-w-80">
              <div className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
                <code className="truncate font-mono text-xs text-[var(--text-secondary)]">
                  git clone https://github.com/kicode01/noslop.git
                </code>
                <button
                  type="button"
                  onClick={() => copyCommand('clone', 'git clone https://github.com/kicode01/noslop.git')}
                  className="btn-press ms-3 inline-flex min-h-8 shrink-0 items-center rounded border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                >
                  {copiedCmd === 'clone' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
                <code className="truncate font-mono text-xs text-[var(--text-secondary)]">
                  https://www.ui-skills.com/mcp
                </code>
                <button
                  type="button"
                  onClick={() => copyCommand('mcp', 'https://www.ui-skills.com/mcp')}
                  className="btn-press ms-3 inline-flex min-h-8 shrink-0 items-center rounded border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                >
                  {copiedCmd === 'mcp' ? 'Copied' : 'Copy MCP'}
                </button>
              </div>
            </div>
          </div>

          {catalog && (
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5">
                <dt className="text-xs text-[var(--text-tertiary)]">Total Indexed</dt>
                <dd className="mt-0.5 text-lg font-semibold text-[var(--text-primary)] tabular-nums">
                  {catalog.stats.total}
                </dd>
              </div>
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5">
                <dt className="text-xs text-[var(--text-tertiary)]">NoSlop Modules</dt>
                <dd className="mt-0.5 text-lg font-semibold text-[var(--text-primary)] tabular-nums">
                  {catalog.stats.noslopModules}
                </dd>
              </div>
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5">
                <dt className="text-xs text-[var(--text-tertiary)]">MCP Servers</dt>
                <dd className="mt-0.5 text-lg font-semibold text-[var(--text-primary)] tabular-nums">
                  {catalog.stats.mcps}
                </dd>
              </div>
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5">
                <dt className="text-xs text-[var(--text-tertiary)]">Workflows</dt>
                <dd className="mt-0.5 text-lg font-semibold text-[var(--text-primary)] tabular-nums">
                  {catalog.stats.workflows}
                </dd>
              </div>
              <div className="col-span-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 sm:col-span-1">
                <dt className="text-xs text-[var(--text-tertiary)]">Stack Combos</dt>
                <dd className="mt-0.5 text-lg font-semibold text-[var(--text-primary)] tabular-nums">
                  {catalog.stats.combos}
                </dd>
              </div>
            </dl>
          )}
        </section>

        {/* Filter & Search Controls */}
        <section aria-label="Catalog filters" className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Resource categories">
              {tabs.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTab(t.key)}
                    className={`btn-press inline-flex min-h-10 items-center gap-1.5 rounded-md border px-3 text-xs font-medium ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{t.label}</span>
                    {t.count !== undefined && (
                      <span
                        className={`tabular-nums ${
                          active ? 'opacity-90' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-80">
              <label htmlFor="catalog-search" className="sr-only">
                Search skills, MCP servers, and workflows
              </label>
              <input
                ref={searchInputRef}
                id="catalog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search skills, MCPs, topics… (/)"
                className="min-h-11 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-inset)] px-3 pe-16 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="btn-press absolute end-1.5 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {tab !== 'combos' && topTopics.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Topic filters">
              <span className="me-1 text-xs text-[var(--text-muted)]">Topics:</span>
              {topTopics.map((topic) => {
                const selected = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedTopic((cur) => (cur === topic ? null : topic))}
                    className={`btn-press inline-flex min-h-8 items-center rounded border px-2 font-mono text-xs ${
                      selected
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Content Region */}
        <section aria-live="polite" className="mt-6">
          {status === 'loading' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-36 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
                >
                  <div className="h-3 w-24 rounded bg-[var(--bg-inset)]" />
                  <div className="mt-3 h-4 w-48 rounded bg-[var(--bg-inset)]" />
                  <div className="mt-3 h-3 w-full rounded bg-[var(--bg-inset)]" />
                  <div className="mt-2 h-3 w-4/5 rounded bg-[var(--bg-inset)]" />
                </div>
              ))}
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Could not load resource catalog
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {errorMsg || 'An error occurred while reading /data/catalog.json.'}
              </p>
              <button
                type="button"
                onClick={() => void loadCatalog()}
                className="btn-press mt-4 inline-flex min-h-11 items-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-ink)]"
              >
                Retry
              </button>
            </div>
          )}

          {status === 'ready' && tab === 'combos' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredCombos.map((combo) => (
                <ComboCard key={combo.id} combo={combo} />
              ))}
              {filteredCombos.length === 0 && (
                <EmptyState
                  query={query}
                  onReset={() => {
                    setQuery('');
                    setSelectedTopic(null);
                    setTab('all');
                  }}
                />
              )}
            </div>
          )}

          {status === 'ready' && tab !== 'combos' && (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-tertiary)]">
                <span className="tabular-nums">
                  Showing {displayedItems.length} of {filteredItems.length} resources
                </span>
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setSelectedTopic(null);
                      setTab('all');
                    }}
                    className="btn-press font-medium text-[var(--accent)] hover:underline"
                  >
                    Reset filters
                  </button>
                )}
              </div>

              {filteredItems.length === 0 ? (
                <EmptyState
                  query={query}
                  onReset={() => {
                    setQuery('');
                    setSelectedTopic(null);
                    setTab('all');
                  }}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {displayedItems.map((item) => (
                      <article
                        key={item.id}
                        className="@container flex min-w-0 flex-col justify-between rounded-lg bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="truncate font-mono text-[var(--text-tertiary)]">
                              {item.source}
                            </span>
                            <span
                              className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] ${
                                item.source === 'noslop'
                                  ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                                  : 'bg-[var(--bg-inset)] text-[var(--text-tertiary)]'
                              }`}
                            >
                              {item.kind}
                            </span>
                          </div>

                          <h2 className="mt-2 truncate text-sm font-semibold text-[var(--text-primary)]">
                            {item.name}
                          </h2>

                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)] text-pretty">
                            {item.description || 'No description provided.'}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 @xs:flex-row @xs:items-center @xs:justify-between">
                          <span className="truncate font-mono text-[11px] text-[var(--text-muted)]">
                            {item.pathSlug}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveItem(item)}
                            className="btn-press inline-flex min-h-9 shrink-0 items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                          >
                            Inspect
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>

                  {displayedItems.length < filteredItems.length && (
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                        className="btn-press inline-flex min-h-11 items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                      >
                        Show more ({filteredItems.length - displayedItems.length} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="border-t border-[var(--border-subtle)] py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>NoSlop — Unified Skills, MCP &amp; Workflows Index</span>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/kicode01/noslop"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text-primary)]"
            >
              Source on GitHub
            </a>
            <a
              href="https://www.ui-skills.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text-primary)]"
            >
              UI Skills Registry
            </a>
            <a
              href="https://agentskills.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text-primary)]"
            >
              Agent Skills Spec
            </a>
          </div>
        </div>
      </footer>

      <ResourceDrawer item={activeItem} onClose={() => setActiveItem(null)} />
    </div>
  );
}

function ComboCard({ combo }: { combo: StackCombo }) {
  return (
    <article className="flex min-w-0 flex-col justify-between rounded-lg bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]">
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">{combo.name}</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)] text-pretty">{combo.goal}</p>

        <div className="mt-4 space-y-2.5">
          <div>
            <h3 className="text-xs font-medium text-[var(--text-tertiary)]">NoSlop Modules</h3>
            <ul className="mt-1 space-y-1">
              {combo.noslopModules.map((mod) => (
                <li key={mod} className="truncate font-mono text-xs text-[var(--text-primary)]">
                  {mod}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-[var(--text-tertiary)]">Paired Upstream Skills</h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {combo.upstreamSkills.map((s) => (
                <span
                  key={s}
                  className="rounded border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2 py-0.5 font-mono text-xs text-[var(--text-secondary)]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)] text-pretty">
        <strong className="font-medium text-[var(--text-secondary)]">Conflict rule:</strong>{' '}
        {combo.conflictNote}
      </p>
    </article>
  );
}

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">
        {query ? `No resources match "${query}"` : 'No matching resources'}
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Clear your search or switch category tabs to view all indexed skills, MCP servers, and workflows.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="btn-press mt-4 inline-flex min-h-11 items-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-ink)]"
      >
        Reset filters
      </button>
    </div>
  );
}
