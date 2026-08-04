import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useCatalog } from '../contexts/CatalogContext';
import Nav from '../components/layout/Nav';

/** C1: renders the FAMILY.md narrative body as a real page, rather than
 *  leaving family context buried in a filter facet on Explore. This was
 *  called out in the PRD as the single highest-value content gap — several
 *  families (agent-foundry, askjamie, ...) have real hand-written scope and
 *  intent narrative that previously had no home in the app at all. */
export default function FamilyDetail() {
  const catalog = useCatalog();
  const { family: familySlug } = useParams();
  const family = catalog.families.find(f => f.name === familySlug);

  useEffect(() => {
    document.title = family ? `${family.displayName} | Skillz Forge` : 'Family not found | Skillz Forge';
    return () => { document.title = 'Skillz Forge | OverKill Hill P³™'; };
  }, [family]);

  if (!familySlug) return <Navigate to="/explore" replace />;

  if (!family) {
    return (
      <div data-page="family-detail">
        <Nav />
        <main className="container page-main">
          <div className="detail-article explore-empty" role="status">
            <h2>Family not found</h2>
            <p>No family named "{familySlug}" exists in the current catalog.</p>
            <Link to="/explore" className="btn">Browse all skills</Link>
          </div>
        </main>
      </div>
    );
  }

  const skills = catalog.skills.filter(s => s.family === family.name);
  const paragraphs = (family.narrativeBody || '').split(/\n\n+/).filter(Boolean);

  return (
    <div data-page="family-detail">
      <Nav />
      <main className="container page-main">
        <div className="page-header">
          <p className="breadcrumb"><Link to="/explore">Explore</Link> / {family.displayName}</p>
          <h1>{family.displayName}</h1>
          <p>{family.skillCount} skill{family.skillCount !== 1 ? 's' : ''} in this family.</p>
        </div>

        <div className="detail-article family-narrative">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p className="meta-pending">This family has no hand-written narrative yet — only an auto-generated summary is available on Explore.</p>
          )}
        </div>

        <div className="family-actions">
          <Link to={`/explore?family=${encodeURIComponent(family.name)}`} className="btn">
            Browse {family.displayName} skills on Explore
          </Link>
        </div>

        <section className="family-skill-list">
          <h2>Skills in this family</h2>
          <ul className="activity-list">
            {skills.map(skill => (
              <li key={skill.name}>
                <div>
                  <Link to={`/skills/${skill.family}/${skill.name}`} className="activity-skill-link">{skill.displayName || skill.name}</Link>
                  <span className="activity-skill-family">{skill.description}</span>
                </div>
                <span data-maturity={skill.maturity}>{skill.maturity}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
