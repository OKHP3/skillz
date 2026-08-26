# Texas Property Tax Protest Defender — source synthesis

## Purpose and status

This document transforms one homeowner-research thread into reusable product and skill context for **Property Tax Defender**. It is a Texas-first specification for an evidence-led assistant that helps a homeowner decide whether a property-tax protest is worth pursuing and, if so, prepare a homeowner-reviewable evidence package.

It is **not** a tax, appraisal, or legal opinion; it must never file a protest, represent a homeowner, invent comparable sales, or promise savings. County procedures, dates, forms, rates, and portal behavior must be verified during each live use.

**Source window:** May–June 2026 research thread, synthesized July 24, 2026.  
**Product state:** concept and context only; no production skill or consumer-facing prompts yet.  
**Recommended v1 boundary:** Texas residence homesteads; use Denton Central Appraisal District (DCAD) as the worked reference, but do not hard-code DCAD rules into statewide execution.

## Source inventory and confidence

| Source | What it contributes | Confidence/use rule |
| --- | --- | --- |
| Claude conversation: `Denton County property tax protest deadline` | Original research journey, product framing, listed attachments, homeowner decision logic | Treat analysis and commercial claims as leads, not authority. The conversation URL is retained below. |
| Notion: `Texas Property Tax Protest — DCAD Research & Ideation` | Structured capture of value history, evidence inventory, product idea, and follow-ups | Helpful secondary synthesis; property-specific facts stay private and are not product defaults. |
| Attached pasted text | Product framing and the thread’s generated summary | Use as a narrative record, not independent evidence. |
| Official Texas Comptroller sources reviewed on July 24, 2026 | Protest rights, common deadline rule, ARB role, evidence expectations, homestead limitation | Authoritative starting point; re-verify live county and statutory details. |
| Files visibly attached in the Claude conversation | Tax statements/notices, lot/floor plans, storm/fence overlay, and pasted analyses | Files were visible by name in the source conversation but binary copies were not supplied to this repository. Preserve the manifest and request originals for any future case evaluation. |

### Canonical source links

- Claude thread: <https://claude.ai/chat/e18d4b73-084c-44b3-bcd9-5983c33a81d3>
- Notion capture: <https://app.notion.com/p/overkillhill/Texas-Property-Tax-Protest-DCAD-Research-Ideation-380812e0ced48179b983d2b134a92a4e?source=copy_link>
- Texas Comptroller, [Appraisal Protests and Appeals](https://comptroller.texas.gov/taxes/property-tax/protests/)
- Texas Comptroller, [Valuing Property](https://comptroller.texas.gov/taxes/property-tax/valuing-property.php)
- Texas Comptroller, [Property Taxpayers’ Bill of Rights](https://comptroller.texas.gov/taxes/property-tax/bill-of-rights.php)
- Texas Comptroller, [Taxpayer Assistance Pamphlet](https://comptroller.texas.gov/taxes/property-tax/docs/96-295.pdf)

## What the thread establishes

### User problem

Texas homeowners receive an annual appraisal notice but often lack the time, confidence, data access, or process knowledge to determine whether the proposed appraisal is defensible. Contingency-fee protest services reduce effort but can capture a portion of the first-year savings. The intended product serves homeowners who want a transparent, DIY or assisted evidence workflow—not people who want a fully delegated representative.

The fundamental question is not “can a protest be generated?” It is:

> Given the owner’s evidence, deadline, expected value reduction, tax impact, time cost, and risk posture, should this homeowner file, pursue an informal resolution, or deliberately stop?

The source case demonstrated a valuable non-filing result: a small proposed increase, aligned public valuation evidence, and low estimated gross savings made non-protest the rational recommendation. This is a core product requirement. The assistant must be willing to recommend **do not proceed**.

### Texas workflow model

1. **Orient and protect the deadline.** Explain the difference between the appraisal district, appraisal review board (ARB), tax assessor-collector, and taxing units. Capture the actual notice mailing date and displayed deadline before doing research.
2. **Validate eligibility and records.** Confirm principal-residence and exemption context; intake appraisal notice, property record card, value history, and basic physical facts. Surface material record errors without advising the user to disclose an error that could increase value.
3. **Choose protest theory.** Separate market-value evidence, unequal-appraisal/equity evidence, record-error issues, exemption issues, and condition/repair evidence. Do not conflate high taxes, insurance cost, or dissatisfaction with evidence of market value.
4. **Build an evidence ledger.** Gather dated, traceable evidence: official records, arm’s-length comparable sales, condition photos, repair estimates and invoices, listings, deeds, surveys, and appraisal-district evidence where available. Record relevance, limitations, and source URL/file for every exhibit.
5. **Estimate decision economics.** Calculate a transparent range of possible annual tax savings using current tax rates and taxable-value/exemption assumptions. Compare it with the homeowner’s stated effort threshold, third-party fee alternative, and uncertainty. Do not make federal SALT treatment a core go/no-go factor without current tax-professional confirmation.
6. **Prepare, not submit.** Produce a filing checklist, proposed grounds for homeowner confirmation, concise theory narrative, exhibit index/captions, comp table, and hearing outline. Require the owner to verify factual inputs, deadline, form/portal choices, and final submission.
7. **Learn for next year.** Store a privacy-aware annual review record: notice date, filed/not filed, theory, evidence quality, requested and final values, savings, and what to collect earlier next cycle.

## Current Texas legal and process baseline

The following is a reusable baseline, not a substitute for live verification:

- A Texas owner may protest an appraisal district’s property value and other specified appraisal matters to the local ARB. Market/appraised value and unequal appraisal are common value grounds.
- The usual filing deadline is May 15 or 30 days after the appraisal district mailed the notice of appraised value, whichever is later. The notice and county portal are the case-specific authority; do not rely on an annual reminder alone.
- A protest may begin with the form supplied with the notice, but a written protest that identifies the owner/property and expresses dissatisfaction can be sufficient. The product should recommend the district-supported online or form path after verification, rather than hard-code a form number.
- An informal conference can resolve a matter before a formal ARB hearing; if no resolution occurs, the owner may continue to the ARB hearing.
- The ARB decides appraisal issues for the tax year in question. It does not set tax rates, and personal financial hardship or generalized frustration is not valuation evidence.
- For an eligible residence homestead, the taxable-value limitation generally constrains the annual increase subject to statutory rules and new-improvement treatment. The skill must distinguish market value, appraised value, and taxable value, and must never state the cap as a blanket bar to protest.
- Repair/restoration facts can matter when they demonstrate condition or challenge treatment of a new improvement. They require dated proof and a clear connection to valuation; they are not automatically a reduction.

## Product requirements derived from the source case

### Six-stage prompt/workflow architecture

| Stage | Objective | Required intake | Reliable output | Stop condition |
| --- | --- | --- | --- | --- |
| 1. Orientation | Establish scope, roles, deadline, safety limits | County, tax year, notice date/deadline, owner goal | Plain-language plan and deadline alert | No notice/deadline: direct owner to official district source before legal conclusions. |
| 2. Record intake | Create a verified fact base | Notice, property record card, exemption/value history, physical facts | Fact table with source/confidence fields and discrepancy log | Missing core records: generate retrieval checklist only. |
| 3. Theory triage | Select supportable grounds | Fact table, condition narrative, sale/equity availability | Ranked theory matrix: evidence, weaknesses, and exclusions | No viable theory: explain why and move to annual-monitoring plan. |
| 4. Research and exhibits | Evaluate comparables and evidence | Sale dates/prices, characteristic adjustments, photos/invoices, district evidence | Evidence ledger, comp table, exhibit list, uncertainty notes | Evidence is stale/insufficient/non-comparable: do not draft conclusions. |
| 5. ROI decision | Decide whether action is proportionate | Target-value range, tax-rate assumptions, fees/time threshold | Savings range; proceed / file-preservation / monitor recommendation with math | Savings too uncertain or too low for stated threshold: recommend no further effort. |
| 6. Owner-ready packet | Prepare reviewable materials | Owner-confirmed facts/theory/evidence | Filing checklist, concise narrative, exhibit captions, informal-hearing outline | Owner has not reviewed facts and attachments: never present as ready to submit. |

### Evidence hierarchy

1. Official notice, property record, appraisal-district data, and county records.
2. Recent, arm’s-length, physically similar closed sales with documented adjustment reasoning.
3. Contemporaneous condition evidence: dated photos, estimates, invoices, inspections, insurance correspondence, engineering reports.
4. Owner documentation: construction plans, surveys, deeds, listing/closing materials.
5. Public-site estimates and active/pending listings: discovery and context only; never the sole value conclusion.
6. Media, neighborhood discussion, broad insurance trends, or generic market commentary: context only; clearly label as non-dispositive.

### Comparable-selection rules

- Prefer sales close to the statutory valuation date and geographically/physically similar properties.
- Capture sale date, verified sale price, source, distance/submarket, living area, build year, lot, bed/bath, condition, financing/arm’s-length caveats, and adjustment rationale.
- Keep the raw sale record separate from any inferred adjusted indication. Never turn an automated estimate into a closed sale.
- Preserve unfavorable evidence. The product’s credibility depends on reporting when a public estimate or strong comp supports the district’s value.
- For equity analysis, assemble a representative comparison set and document the appraisal-value relationship; do not claim “unequal appraisal” from a handful of hand-picked lower assessments.

### Decision economics

Use a range rather than a single promised number:

`estimated annual gross savings = expected taxable-value reduction × estimated combined tax rate`

Then disclose assumptions that may change the result: exemptions, rate adoption, caps, new-improvement treatment, final ARB value, and whether savings persist. Compare gross savings against the homeowner’s stated time/effort threshold and any provider’s specific fee terms.

The source case’s “approximately $111 gross savings” conclusion is retained as a private historical example only. It is not a reusable benchmark, rate, threshold, or guarantee.

## Case-study signals to preserve without productizing personal data

The original Denton County case contains four important design lessons:

1. **Record checks precede protest work.** Homestead status and property-record accuracy can have greater value than a marginal market-value argument.
2. **A low-ROI answer is success.** The worked case stopped when a modest improvement-only increase, evidence alignment, and low estimated savings did not clear the owner’s effort threshold.
3. **Condition narratives need proof and causal discipline.** Storm restoration and fence work were potentially relevant to improvement classification/condition, but not a freestanding valuation claim.
4. **Do not amplify adverse discrepancies.** A bedroom-count mismatch between the district record and public sites was recognized as potentially value-increasing if corrected. The skill should flag it privately as a decision consideration, not suggest strategic misrepresentation or concealment.

Do not copy the source homeowner’s address, account number, names, exact values, plans, attachments, age, tax status, or insurance history into prompts, examples, analytics, or product marketing.

## Required safeguards

- State that the workflow provides research and drafting assistance, not legal, tax, appraisal, or representation services.
- Ask for only the minimum property and owner data required. Keep property identifiers, notices, PINs, tax records, and insurance documents out of logs and published artifacts.
- Mask account numbers, owner names, signatures, QR codes, PINs, and full addresses in shareable examples and exported drafts.
- Require source attribution and uncertainty labeling for every valuation-relevant claim.
- Never scrape, bypass authentication, or misrepresent the homeowner to access county, MLS, insurer, Zillow, Redfin, or third-party data.
- Never auto-submit a protest, select grounds without owner confirmation, sign a form, or communicate with an appraisal district as the homeowner.
- Do not advise hiding facts, falsifying condition, or selectively omitting requested information. The product may explain that correcting a record can have consequences and recommend professional advice when appropriate.
- Escalate to a licensed Texas property-tax professional or attorney for complex ownership, exemption, litigation, agent representation, late-protest, commercial, disaster, title, or high-value disputes.

## Data and integration design

### Minimum case object

```text
case: county, state, tax_year, owner_goal, notice_deadline, valuation_date
property: identifier, address_private, type, living_area, year_built, physical_features
district_record: market_value, appraised_value, taxable_value, land, improvements, exemptions, history
theories: market_value, unequal_appraisal, record_error, exemption, condition_or_improvement
evidence[]: source, captured_at, type, claim_supported, file_or_url, reliability, limitations
comparables[]: sale_date, sale_price, source, similarity, adjustments, exclusions
roi: target_range, rate_assumption, savings_range, fee_assumption, owner_threshold, recommendation
packet: owner_confirmations, draft_narrative, exhibits, filing_steps, hearing_outline
```

### Connector posture

- **Appraisal-district/county sources:** first priority; use official lookup, evidence-request, and portal instructions only after county verification.
- **Property listing and estimate sources:** use for discovery, listing facts, and candidate comps. Clearly label their estimate values as non-authoritative and capture retrieval date.
- **Maps/parcel/sales sources:** use to validate proximity, property characteristics, and recorded sales where lawful and accessible.
- **Document extraction:** accept homeowner-supplied notices, repair documents, photos, surveys, and floor plans; extract facts with a human-verification queue.
- **Calendar/task integration:** create an optional annual reminder only after the user confirms the date and destination; it must say to check the new notice and deadline, not assume a fixed filing date.

## Attachment manifest from the Claude thread

The following items were visible in the source conversation. They are context references only; no binary file was available in this repository at synthesis time.

| Visible name | Described contribution |
| --- | --- |
| `pdf_download_8DF4C60F-517C-4695-9B04-F79119212DE1.pdf` | Denton County tax statement / value and exemption information (appeared twice) |
| `pdf_download_0525D7E4-62C8-491A-996F-F5A30F65B080.pdf` | Notice of Appraised Value / protest information |
| `IMG_4614.jpeg` | Lot plan or survey illustration (appeared twice) |
| `20230526_152538559_iOS.jpeg` | Floor plan |
| `House-Model.jpeg` | Annotated storm/fence-work overlay |
| Seven pasted analyses | Baseline property-tax review, Redfin review, tax-statement analysis, overlay analysis, repair timeline, insurance-risk analysis, and DIY filing path |

## Implementation backlog

1. Create a Texas-specific `SKILL.md` only after validating the desired installation location and interface; keep this source document as a reference rather than embedding it wholesale.
2. Add a county configuration model for notice deadlines, online filing, evidence access, hearing options, local contacts, and source links.
3. Write the six workflow prompts around structured intake/output schemas—not generic persuasive language.
4. Build a redaction-aware document intake and evidence ledger template.
5. Forward-test on synthetic, fully anonymized scenarios: clear market-value case, equity-only case, low-ROI no-file case, record-error case, and missing-deadline case.
6. Obtain and validate primary sources for any market-size, non-protest-rate, competitor-fee, or tax-effect claim before product or marketing use.

## Open questions

- Is the first deliverable a private Codex skill, a consumer prompt pack, a Notion template, or an interactive tool?
- Should DCAD be the first county configuration and testing target, or should v1 launch with a Texas-wide core plus a small set of tested counties?
- Which data connectors are actually available, licensed, and permissible for production use?
- What privacy, retention, and deletion policy applies to owner notices and evidence?
- What annual gross-savings or confidence threshold should trigger a recommendation to invest more research time? This must be an owner-set preference, not a universal default.
