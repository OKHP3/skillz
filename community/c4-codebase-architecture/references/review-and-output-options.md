## Quality bar for the skill

A good result should be:

* faithful to the codebase
* explicit about uncertainty
* useful to humans
* free from box-and-arrow soup
* focused on important runtime structure

A poor result would:

* confuse packages with deployable units
* invent actors with no evidence
* over-document trivial details
* produce diagrams with many unlabeled arrows
* blur the boundary between facts and guesses

---

## Example interaction pattern

### Example opening

> I inspected the repository and I can already see a frontend app, an API service, a worker, and some infrastructure code for a PostgreSQL database and SQS queue. I can draft a first-pass System Context and Container view from that.
>
> Before I finalize it, I need to clarify a few things that the code does not make fully explicit:
>
> 1. Is this repository the entire system or only one part of a larger platform?
> 2. Who are the main user roles that should appear in the context diagram?
> 3. Should managed AWS services like SQS and S3 appear inside the system boundary, or would you prefer them shown as external supporting services?
> 4. Which container would you like me to break down at the Component level?

### Example follow-up behavior

If the user does not answer every question, continue with a best-effort draft and clearly note the assumptions.

---

## Recommended default deliverables

Unless the user asks otherwise, the skill should try to return:

* one concise System Context view
* one concise Container view
* one Component view for the most central container
* one short narrative explaining assumptions and open questions

If the system is large, propose documenting it incrementally rather than forcing everything into one response.

---

## Optional output formats

When asked, the skill may emit diagrams as:

* Mermaid
* PlantUML with C4 extensions
* Structurizr DSL
* plain Markdown with structured sections

If the user has no preference, default to Markdown narrative plus Mermaid.

---

## Final instruction to the agent

Inspect the codebase carefully, infer architecture conservatively, and use targeted questions to resolve what code cannot tell you. Produce C4 documentation that is precise, readable, and honest about uncertainty.
