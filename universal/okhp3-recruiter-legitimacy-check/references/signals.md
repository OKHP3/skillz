# Signals, scoring, and reply template

## Signal table

| Signal | Concern |
|---|---|
| Profile age and depth | New account, few connections, thin history, stock-like photo |
| Agency | No findable agency site, or the person is absent from its own pages |
| Wording | Mail-merge phrasing, generic praise, role mismatched to actual experience |
| Client claim | Named client with no requisition and no posting on the client's careers site |
| Process | Early asks for government ID, birth date, bank details, payment, or a switch to an off-platform chat app |
| Urgency | Pressure to answer today; "exclusive" without details |
| Engagement type | Unwilling to say retained or contingent with the client |
| Terms drift | Rate, on-site days, location, or term change after interest |
| Address | A supplied address that does not resolve to the named client or agency |

## Scoring

- Two or more process or client-claim concerns with no independent confirmation:
  `likely-fake`.
- Confirmed agency, matching posting or requisition, the sender confirmed through
  an agency-controlled channel (contact details taken from the agency's own site,
  not from the message), and no sensitive requests: `likely-legitimate`. A real
  agency and a real posting with an unconfirmed sender stay `unclear`, because an
  impersonator can copy both.
- Anything else, including a failed search with no evidence either way: `unclear`.

Terms drift alone does not lower the score; it changes the reply.

## Verification reply template

> Thanks for reaching out. Before I send anything, could you share the
> requisition number or posting link, whether you are retained or contingent with
> the client, and the title and team of the hiring manager? I'll send a résumé
> once the role is confirmed.

## Terms-drift reply template

> Thanks for the update. I understood the role as <ORIGINAL_TERMS>. Are the
> revised <CHANGED_ITEM> fixed, or is there flexibility? Happy to talk it through
> on a call.

Keep numbers out of writing unless the user says to include them.
