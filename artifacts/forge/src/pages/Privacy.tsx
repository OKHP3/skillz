import { useEffect } from 'react';
import Nav from '../components/layout/Nav';

export default function Privacy() {
  useEffect(() => {
    document.title = 'Privacy | Skillz Forge';
    return () => { document.title = 'Skillz Forge | OverKill Hill P³™'; };
  }, []);

  return (
    <div data-page="privacy">
      <Nav />
      <main className="container page-main privacy-page" id="main-content" tabIndex={-1}>
        <div className="page-header">
          <h1>Privacy</h1>
          <p>What Skillz Forge requests over the network, what it stores on your device, and how to clear it.</p>
        </div>

        <div className="privacy-content">
          <section className="privacy-section">
            <h2>Network requests this app makes</h2>
            <p>Skillz Forge is a static, client-side app. It makes four kinds of outbound requests:</p>
            <ul>
              <li>
                <strong>Skill catalog data</strong> — the generated <code>catalog.json</code>,
                per-skill detail files, and the search index are fetched from GitHub Pages.
                This is public, read-only content; nothing you type is sent as part of these requests.
              </li>
              <li>
                <strong>Google Fonts</strong> — typeface files are loaded from Google's font
                CDN (<code>fonts.googleapis.com</code> / <code>fonts.gstatic.com</code>) so text renders
                with the site's chosen fonts. Google can see the request (IP address, user agent) the
                same way any font CDN request works.
              </li>
              <li>
                <strong>Google Analytics 4 (GA4)</strong> — aggregate usage measurement. See the next
                section for exactly what this does and does not send.
              </li>
              <li>
                <strong>GitHub links you click</strong> — buttons like "Copy install URL," "View on
                GitHub," or "Open an issue" send you to github.com in a new tab. Skillz Forge does not
                control what GitHub collects once you're there.
              </li>
            </ul>
            <p>Nothing else leaves your browser. There is no account system, no server-side database
              of your activity, and no third-party write integrations.</p>
          </section>

          <section className="privacy-section">
            <h2>What Google Analytics receives</h2>
            <p>Skillz Forge uses GA4 for aggregate usage measurement — page views and interaction
              events such as copy, share, save, and filter actions. The analytics code is written to
              send only safe, bucketed aggregates:</p>
            <ul>
              <li>Search text is never sent. Only a length bucket (e.g. "1–10 characters") and a
                result-count bucket (e.g. "6–15 results") are recorded — never the query itself.</li>
              <li>Skill and stack names, family names, and maturity labels may be sent when you open
                or interact with a specific skill, since that content is already public catalog data,
                not something you typed.</li>
              <li>No accounts, no sign-in, no email addresses, and no persistent cross-site
                identifiers are collected by this app.</li>
              <li>You can block GA4 entirely with a standard content/tracker-blocking browser
                extension; the app works identically with it blocked.</li>
            </ul>
            <p>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google's privacy policy &rarr;
              </a>
            </p>
          </section>

          <section className="privacy-section">
            <h2>What's stored on your device</h2>
            <p>Skillz Forge keeps a few small pieces of state in your browser's local storage. None
              of it is ever transmitted anywhere — it stays on your device unless you clear it:</p>
            <ul>
              <li><strong>Favorites</strong> — the skills you've saved, so they persist between visits.</li>
              <li><strong>Composer selections</strong> — the working set of skills you've added to the
                stack composer.</li>
              <li><strong>Theme preference</strong> — light or dark mode.</li>
              <li><strong>Guided-discovery dismissal</strong> — whether you've closed the onboarding
                hint panel, so it doesn't reappear every visit.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>Clearing local data</h2>
            <p>To remove everything Skillz Forge has stored in your browser:</p>
            <ol>
              <li>Open your browser's developer tools (or site settings) for this site.</li>
              <li>Find "Local Storage" (or "Site data" / "Storage" depending on your browser) for
                this domain.</li>
              <li>Delete the entries, or clear all local storage for the site.</li>
            </ol>
            <p>Alternatively, most browsers let you clear site data for a single site from the address
              bar's site-information menu without opening developer tools. Clearing local storage
              removes your favorites, composer selections, theme choice, and discovery-panel
              dismissal — it does not affect GA4, since that data already left your browser and is
              held by Google under its own retention policy.</p>
          </section>

          <section className="privacy-section privacy-section--note">
            <h2>A note on consent requirements</h2>
            <p>Depending on where a visitor is located, using GA4 may require a cookie/consent
              notice or a documented legal basis (for example, under GDPR for EU/EEA visitors, or
              similar regional rules elsewhere) before analytics scripts load, in addition to this
              disclosure. This page describes what the app actually does; it is not a legal
              determination that current handling satisfies every applicable jurisdiction's consent
              requirements. That determination should be reviewed and approved by the site owner
              before this is treated as compliance-complete.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
