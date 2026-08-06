import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FAQ_GROUPS } from '../data/faq';
import Nav from '../components/layout/Nav';

function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

export default function FAQ() {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'FAQ | Skillz Forge';
    return () => { document.title = 'Skillz Forge | OverKill Hill P³™'; };
  }, []);

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
      <main className="container page-main" id="main-content" tabIndex={-1}>
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
          />
        </div>

        {filteredGroups.length === 0 ? (
          <div className="faq-empty" role="status">
            <p>No questions matched "{search}".</p>
            <button className="btn" onClick={() => setSearch('')}>Clear search</button>
          </div>
        ) : (
          <div className="faq-content">
            {filteredGroups.map(group => (
              <section key={group.id} className="faq-group">
                <h2>{group.title}</h2>
                <dl>
                  {group.items.map(item => (
                    <div key={item.id} id={item.id} className="faq-item">
                      <dt>
                        <button
                          onClick={() => toggleItem(item.id)}
                          aria-expanded={open.has(item.id)}
                          aria-controls={`${item.id}-answer`}
                        >
                          {item.question}
                          <span aria-hidden className="faq-toggle-icon">{open.has(item.id) ? '−' : '+'}</span>
                        </button>
                      </dt>
                      <dd id={`${item.id}-answer`} inert={!open.has(item.id) || undefined}>
                        <div className="faq-answer-inner">
                          <p className="faq-answer">{item.answer}</p>
                          {item.links && item.links.length > 0 && (
                            <ul className="faq-links">
                              {item.links.map(link => (
                                <li key={link.href}>
                                  {isExternalHref(link.href) ? (
                                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                                      {link.label} &rarr;
                                    </a>
                                  ) : (
                                    <Link to={link.href}>{link.label} &rarr;</Link>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
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
