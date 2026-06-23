Run the okhp3-skill-cataloger to scan .agents/skills/ and regenerate the skills catalog README.

Steps:
1. Confirm working directory is the project root (not inside .agents/skills/).
2. Find the generator script — prefer `scripts/gen-skills-readme.py`, fall back to `.agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py`.
3. Detect catalog mode: if .agents/skills/ contains category subfolders (not direct SKILL.md files), use `--mode library`; otherwise use default project mode.
4. Run: `python3 {script} --skills-dir .agents/skills`
5. Report: number of skills cataloged, whether README changed or was already current, any validation warnings, and the updated timestamp shown in the README.
