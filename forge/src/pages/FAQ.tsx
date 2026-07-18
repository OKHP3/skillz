import { useState } from 'react';
import { FAQ_GROUPS } from '../data/faq';
import Nav from '../components/layout/Nav';

export default function FAQ() {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  function toggleItem(id: string) {
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const filteredGroups = FAQ_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item =>
      !search.trim() ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(g => g.items.length > 0);

  return (
    <div data-page="faq">
      <Nav />
      <main className="container" style={{ paddingBottom: 'var(--space-24)' }}>
        <div className="page-header">
          <h1>Frequently asked questions</h1>
          <p>Everything about Agent Skills, using Skillz, trust and safety, and contributing.</p>
        </div>

        <div className="faq-search">
          <label htmlFor="faq-search-input" className="sr-only">Search FAQ</label>
          <input
            id="faq-search-input"
            type="search"
            className="input-text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions…"
            autoComplete="off"
            style={{ fontSize: '1.25rem', padding: 'var(--space-4)' }}
          />
        </div>

        {filteredGroups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }} role="status">
            <p style={{ fontSize: 'var(--text-h3)', marginBottom: 'var(--space-4)' }}>No questions matched "{search}".</p>
            <button className="btn" onClick={() => setSearch('')}>Clear search</button>
          </div>
        ) : (
          <div style={{ maxWidth: '800px' }}>
            {filteredGroups.map(group => (
              <section key={group.id} className="faq-group">
                <h2 style={{ fontSize: 'var(--text-h2)', borderBottom: '2px solid var(--color-border-dark)', paddingBottom: 'var(--space-2)' }}>{group.title}</h2>
                <dl style={{ margin: 0 }}>
                  {group.items.map(item => (
                    <div key={item.id} id={item.id} className="faq-item">
                      <dt>
                        <button
                          onClick={() => toggleItem(item.id)}
                          aria-expanded={open.has(item.id)}
                          aria-controls={`${item.id}-answer`}
                          style={{ width: '100%', cursor: 'pointer', background: 'transparent', border: 'none', padding: 'var(--space-4) 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', color: 'var(--color-text-dark)', fontSize: 'var(--text-h3)', fontFamily: 'var(--font-serif)' }}
                        >
                          {item.question}
                          <span aria-hidden style={{ color: 'var(--color-copper)', fontSize: '1.5rem', fontWeight: 300 }}>{open.has(item.id) ? '−' : '+'}</span>
                        </button>
                      </dt>
                      <dd id={`${item.id}-answer`} hidden={!open.has(item.id)} style={{ margin: 0, paddingBottom: 'var(--space-6)', color: 'var(--color-text-muted-dark)' }}>
                        <p style={{ margin: 0, lineHeight: 1.7 }}>{item.answer}</p>
                        {item.links && item.links.length > 0 && (
                          <ul style={{ listStyle: 'none', padding: 0, marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
                            {item.links.map(link => (
                              <li key={link.href}>
                                <a href={link.href} style={{ fontWeight: 500 }}>{link.label} &rarr;</a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
