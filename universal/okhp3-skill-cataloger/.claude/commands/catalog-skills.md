Run the okhp3-skill-cataloger to scan .agents/skills/ and regenerate the skills catalog README.

Steps:
1. Confirm the working directory is the project root (not inside .agents/skills/).
2. Find the generator script — prefer `scripts/gen-skills-readme.py` at the project root, fall back to `.agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py`.
3. Run: `python3 {script} --skills-dir .agents/skills`
   - Mode is auto-detected from the directory layout. No --mode flag needed in most cases.
   - If you need to preview first: add `--dry-run`
   - If you only want validation: add `--check`
4. Report: number of skills cataloged, detected mode, whether README changed or was already current, any validation warnings, and the updated timestamp shown in the README.
