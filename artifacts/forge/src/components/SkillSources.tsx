const catalogs = [
  ['OpenAI', 'https://github.com/openai/plugins', 'Current Codex skills and plugins'],
  ['Anthropic', 'https://github.com/anthropics/skills', 'Skill examples and authoring resources'],
  ['Microsoft', 'https://github.com/microsoft/skills#skill-catalog', 'SDK and platform skill catalog'],
  ['Vercel', 'https://github.com/vercel-labs/agent-skills', 'Agent skills from Vercel'],
  ['Cloudflare', 'https://github.com/cloudflare/skills', 'Skills for building on Cloudflare'],
  ['Google', 'https://github.com/google/skills', 'Google product and technology skills'],
  ['Microsoft Learn', 'https://github.com/MicrosoftDocs/Agent-Skills', 'Skills grounded in Microsoft documentation'],
  ['Notion', 'https://github.com/makenotion/skills', 'Notion skills for agents'],
  ['OpenClaw', 'https://github.com/openclaw/agent-skills', 'Skills from the OpenClaw project'],
  ['NVIDIA', 'https://github.com/NVIDIA/skills', 'NVIDIA product and workflow skills'],
] as const;

export default function SkillSources() {
  return (
    <section id="skill-sources" className="skill-sources" aria-labelledby="skill-sources-heading" tabIndex={-1}>
      <h2 id="skill-sources-heading">Guidance &amp; skill catalogs</h2>
      <p>For skill creation and package structure, start with the open standard and the relevant project’s own guidance.</p>
      <a className="skill-sources-standard" href="https://agentskills.io/skill-creation/best-practices" target="_blank" rel="noopener noreferrer">
        <strong>Agent Skills best practices <span aria-hidden="true">↗</span></strong>
        <span>Authoring guidance from agentskills.io</span>
      </a>
      <h3>Provider &amp; project catalogs</h3>
      <ul className="skill-sources-list">
        {catalogs.map(([name, href, description]) => (
          <li key={name}>
            <a href={href} target="_blank" rel="noopener noreferrer">{name} <span aria-hidden="true">↗</span></a>
            <span>{description}</span>
          </li>
        ))}
      </ul>
      <p className="skill-sources-note">OpenAI’s <a href="https://github.com/openai/skills" target="_blank" rel="noopener noreferrer">legacy skills repository</a> is deprecated and directs readers to its current plugins repository above.</p>
      <h3>Community collection</h3>
      <p><a href="https://awesome-copilot.github.com/skills/" target="_blank" rel="noopener noreferrer">Awesome GitHub Copilot skills ↗</a> — community-contributed and curated skills for GitHub Copilot.</p>
    </section>
  );
}
