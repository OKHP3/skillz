---
name: markdown-docs
description: Writes or restructures project documentation in Markdown — READMEs, guides, references, runbooks, architecture notes — organised around what the reader is trying to do. Use this whenever the user asks for a README, docs, a guide, a runbook, or says their documentation is out of date, missing, or unhelpful, and also after building something substantial that nobody else could pick up without a written explanation.
license: MIT
---

# Markdown docs

Documentation is read by someone mid-task who is slightly annoyed. They do not read from the
top; they scan for the part that matches their situation, take it, and leave. Every structural
decision follows from that.

The most common failure is not absence — it is documentation organised around the system's
structure instead of the reader's task. A page-per-module reference is easy to generate and
answers almost no real question.

## 1. Identify the reader and their moment

Different moments need different documents, and merging them serves none:

| Moment | They need | Document |
| --- | --- | --- |
| "What is this, should I use it?" | Purpose, fit, constraints | README top section |
| "Get me running" | The shortest working path | Quickstart |
| "Teach me the concepts" | Mental model, why it works this way | Guide |
| "What are the options for X?" | Complete, scannable facts | Reference |
| "It's 3am and it's broken" | Symptom → action, no prose | Runbook |
| "Why is it built this way?" | Context, alternatives, trade-offs | Decision record |

Write one of these at a time. A quickstart that pauses to explain architecture loses the reader
who wanted to be running in two minutes.

**Done when:** you know which document you are writing and who opens it.

## 2. Front-load ruthlessly

Readers scan the first screen and decide whether to stay.

- **First sentence: what it is and what it is for.** Not history, not motivation. "A CLI that
  syncs Postgres tables to BigQuery on a schedule."
- **Then: whether it fits them.** Requirements, constraints, what it does not do. Saving
  someone twenty minutes by telling them early that it will not work for them is a service.
- **Then: the first working thing.** Copy-pasteable, complete, no placeholders they must
  resolve first.

**Done when:** the first screen answers "what is it" and "does it apply to me".

## 3. Make every command actually runnable

The fastest way to lose trust is a command that fails. For each one:

- Give it whole — no `...`, no `<your-value-here>` without saying where to get the value
- Say what success looks like, so they can tell whether it worked
- Note where it must be run, if that matters

If a step needs a value from somewhere else, say where. "Set `API_KEY`" is a dead end;
"Set `API_KEY` from Settings → Developer → API Keys" is a step.

**Run the instructions yourself, in order, from a clean state.** Documentation written from
memory of how it works is documentation with a missing step, always.

**Done when:** you have executed the path you wrote.

## 4. Structure for scanning, not reading

- **Headings are navigation.** Write them as the questions readers arrive with — "Deploying to
  production" beats "Deployment"; "The sync fails with a timeout" beats "Troubleshooting".
- **Front-load every paragraph.** The first sentence carries the point; the rest supports it.
- **Use tables for anything with parallel structure.** Options, flags, environment variables,
  error codes. A table is scannable; six paragraphs describing six flags are not.
- **Keep code blocks short and tagged with a language.** A forty-line block is not read.
- **One thing per section.** If a section covers two topics, the second is unfindable.

**Done when:** the table of contents alone tells a reader where to go.

## 5. Write what cannot be inferred

Skip what the code already says. Prioritise what a reader cannot discover on their own:

- **Why**, when the choice was not obvious — the alternatives, and why they lost
- **Failure modes:** what breaks, what it looks like, what to do
- **The gotchas:** ordering requirements, undocumented limits, the thing that silently does
  nothing if you get it wrong
- **Boundaries:** what this does not do and never will, so nobody spends a day finding out

A short document containing these beats a long one that paraphrases the function signatures.

**Done when:** nothing in the document could be trivially derived from reading the source.

## 6. Fight rot deliberately

Wrong documentation is worse than missing documentation — it is believed.

- **Put examples where they can be tested**, and test them in CI if the ecosystem allows it
- **Do not duplicate facts across pages.** Link instead. A number in two places becomes two
  different numbers.
- **Avoid time-relative statements.** "Currently", "soon", "the new API", all wrong later.
  Version-qualify instead: "as of 2.x".
- **Delete rather than deprecate in place.** Old instructions left visible get followed.
- **Date anything that will age:** benchmarks, screenshots, pricing.

**Done when:** every fact has exactly one home, and nothing depends on when it was read.

## Formatting that helps

Use fenced blocks with languages, relative links between docs so they survive moving, real
values in examples rather than `foo`/`bar`, and alt text on images. Keep line length reasonable
in source so diffs stay reviewable — a docs change that shows as one modified 400-character
line cannot be reviewed.
