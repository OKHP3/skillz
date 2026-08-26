#!/usr/bin/env node
/**
 * Public companion-site release audit.
 *
 * This intentionally uses only public HTTP endpoints. It does not need a
 * GitHub token and never mutates repositories. Use --strict in CI/release
 * preparation so an unproven deploy handoff blocks publishing.
 */
const sites = [
  {
    name: 'OverKill Hill',
    repo: 'OKHP3/OverKill-Hill',
    domain: 'overkillhill.com',
    paths: ['/', '/about/', '/legal/', '/sitemap.xml'],
  },
  {
    name: 'Glee-fully Tools',
    repo: 'OKHP3/Glee-fullyTools',
    domain: 'glee-fully.tools',
    paths: ['/', '/about/', '/legal/', '/sitemap.xml'],
  },
  {
    name: 'AskJamie',
    repo: 'OKHP3/AskJamie',
    domain: 'askjamie.bot',
    paths: ['/', '/about/', '/legal/', '/sitemap.xml'],
  },
];

const strict = process.argv.includes('--strict');
const json = process.argv.includes('--json');
const failures = [];
const warnings = [];

async function get(url, headers = {}) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'okhp3-publishing-audit/1.0', ...headers },
    redirect: 'follow',
  });
  return { response, text: await response.text() };
}

function fail(site, stage, message) {
  failures.push({ site: site.name, stage, message });
}

function warn(site, stage, message) {
  warnings.push({ site: site.name, stage, message });
}

async function inspectSite(site) {
  const home = await get(`https://${site.domain}/`);
  if (!home.response.ok) {
    fail(site, 'public-home', `HTTP ${home.response.status}`);
    return;
  }

  const canonical = home.text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1];
  if (canonical !== `https://${site.domain}/`) {
    fail(site, 'metadata', `canonical is ${canonical || 'missing'}, expected https://${site.domain}/`);
  }
  const ogUrl = home.text.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)/i)?.[1];
  if (ogUrl && ogUrl !== `https://${site.domain}/`) {
    fail(site, 'metadata', `og:url is ${ogUrl}, expected https://${site.domain}/`);
  }
  const ogImage = home.text.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1];
  if (!ogImage) fail(site, 'metadata', 'og:image is missing');
  else {
    const image = await get(ogImage);
    if (!image.response.ok) fail(site, 'asset', `og:image returned HTTP ${image.response.status}: ${ogImage}`);
  }

  for (const path of site.paths.slice(1)) {
    const result = await get(`https://${site.domain}${path}`);
    if (!result.response.ok) fail(site, 'public-route', `${path} returned HTTP ${result.response.status}`);
  }

  const sitemap = await get(`https://${site.domain}/sitemap.xml`);
  const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(match => match[1]);
  for (const url of urls.slice(0, 5)) {
    const result = await get(url);
    if (!result.response.ok) fail(site, 'sitemap-route', `${url} returned HTTP ${result.response.status}`);
  }

  const repo = await get(`https://api.github.com/repos/${site.repo}`, { accept: 'application/vnd.github+json' });
  if (!repo.response.ok) {
    if (repo.response.status === 403 || repo.response.status === 429) {
      warn(site, 'github-repository', `GitHub API metadata is temporarily unavailable (HTTP ${repo.response.status}); public deployment probes remain valid, but repository handoff/CNAME checks require an authenticated retry`);
      return {
        repository: site.repo,
        githubApiUnavailable: true,
        liveLastModified: home.response.headers.get('last-modified'),
        sitemapUrlCount: urls.length,
      };
    }
    fail(site, 'github-repository', `GitHub repository metadata returned HTTP ${repo.response.status}`);
    return;
  }
  const repoData = JSON.parse(repo.text);
  const runs = await get(
    `https://api.github.com/repos/${site.repo}/actions/runs?per_page=20`,
    { accept: 'application/vnd.github+json' },
  );
  const workflowRuns = runs.response.ok ? JSON.parse(runs.text).workflow_runs || [] : [];
  const cname = await get(
    `https://api.github.com/repos/${site.repo}/contents/CNAME?ref=${encodeURIComponent(repoData.default_branch)}`,
    { accept: 'application/vnd.github+json' },
  );
  if (cname.response.ok) {
    const cnameData = JSON.parse(cname.text);
    const value = Buffer.from(cnameData.content || '', 'base64').toString('utf8').trim();
    if (value !== site.domain) fail(site, 'custom-domain', `CNAME is ${value || 'missing'}, expected ${site.domain}`);
  } else {
    fail(site, 'custom-domain', `CNAME could not be read (HTTP ${cname.response.status})`);
  }

  const workflows = await get(
    `https://api.github.com/repos/${site.repo}/contents/.github/workflows?ref=${encodeURIComponent(repoData.default_branch)}`,
    { accept: 'application/vnd.github+json' },
  );
  let workflowNames = [];
  let workflowText = '';
  if (workflows.response.ok) {
    const entries = JSON.parse(workflows.text);
    workflowNames = entries.filter(entry => entry.type === 'file').map(entry => entry.name);
    for (const entry of entries.filter(entry => entry.type === 'file' && (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml')))) {
      // The raw endpoint can return an intermediary error page for workflow
      // files. The JSON Contents endpoint is the stable public representation.
      const file = await get(entry.url, { accept: 'application/vnd.github+json' });
      if (file.response.ok) {
        const fileData = JSON.parse(file.text);
        workflowText += `\n${Buffer.from(fileData.content || '', 'base64').toString('utf8')}`;
      }
    }
  } else {
    warn(site, 'github-workflows', `workflow directory returned HTTP ${workflows.response.status}`);
  }
  if (!/deploy-pages|upload-pages-artifact|gh-pages|peaceiris\/actions-gh-pages/i.test(workflowText)) {
    const managedPagesRun = workflowRuns.find(run =>
      /pages build and deployment/i.test(run.name)
      && run.status === 'completed'
      && run.conclusion === 'success'
      && run.head_branch === repoData.default_branch
    );
    if (managedPagesRun) {
      warn(site, 'publishing-handoff', `deployment is GitHub-managed and not source-controlled; latest successful Pages run is ${managedPagesRun.head_sha.slice(0, 8)}`);
    } else {
      fail(site, 'publishing-handoff', `no deploy step or successful GitHub-managed Pages run found in ${workflowNames.join(', ') || 'workflow directory'}`);
    }
  }

  const lastModified = home.response.headers.get('last-modified');
  const repoPushed = repoData.pushed_at ? Date.parse(repoData.pushed_at) : NaN;
  const liveModified = lastModified ? Date.parse(lastModified) : NaN;
  if (Number.isFinite(repoPushed) && Number.isFinite(liveModified) && repoPushed - liveModified > 48 * 60 * 60 * 1000) {
    warn(site, 'freshness', `repository push ${repoData.pushed_at} is more than 48h newer than live Last-Modified ${lastModified}`);
  }

  return {
    repository: site.repo,
    defaultBranch: repoData.default_branch,
    repositoryPushedAt: repoData.pushed_at,
    liveLastModified: lastModified,
    sitemapUrlCount: urls.length,
    workflowNames,
    managedPagesDeployment: workflowRuns.some(run =>
      /pages build and deployment/i.test(run.name)
      && run.status === 'completed'
      && run.conclusion === 'success'
      && run.head_branch === repoData.default_branch
    ),
  };
}

const results = {};
for (const site of sites) {
  try {
    results[site.name] = await inspectSite(site);
  } catch (error) {
    fail(site, 'audit-runtime', error.message);
  }
}

const report = { strict, results, warnings, failures };
if (json) console.log(JSON.stringify(report, null, 2));
else {
  for (const [name, result] of Object.entries(results)) {
    console.log(`\n${name}`);
    if (result) console.log(`  ✓ ${result.repository} @ ${result.defaultBranch}; sitemap URLs: ${result.sitemapUrlCount}`);
  }
  for (const item of warnings) console.warn(`  ! ${item.site} [${item.stage}] ${item.message}`);
  for (const item of failures) console.error(`  ✗ ${item.site} [${item.stage}] ${item.message}`);
  console.log(`\nPublishing audit: ${failures.length} failure(s), ${warnings.length} warning(s)`);
}
if (failures.length || (strict && warnings.length)) process.exit(1);