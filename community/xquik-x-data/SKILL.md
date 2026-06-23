---
name: xquik-x-data
description: Plan and verify read-only public X data workflows with Xquik REST API, MCP tools, SDKs, webhooks, and automation. Use when users ask for X post, profile, follower, search, trend, monitor, or export workflows using Xquik.
enabled: true
---

# Xquik X Data

Use this skill when the task needs public X data through Xquik and the user wants a plan, request outline, endpoint choice, SDK choice, MCP tool route, webhook flow, or automation workflow.

## Public Sources

Read public source material before choosing a route:

- `https://docs.xquik.com/llms.txt`
- `https://docs.xquik.com/llms-full.txt`
- `https://docs.xquik.com/api-reference/overview`
- `https://github.com/Xquik-dev/x-twitter-scraper`

Do not infer endpoint names, SDK parameters, pricing, limits, or response fields from memory. If the docs do not confirm a detail, mark it unknown and ask for the missing context.

## Intake

Collect the minimum details needed to choose a route:

1. Goal: search, profile lookup, post lookup, follower data, trend tracking, monitoring, export, or webhook delivery.
2. Target: handles, post URLs, search query, list of accounts, keywords, or saved monitor.
3. Output: raw JSON, CSV, summary, alert, dashboard input, or webhook payload.
4. Runtime: REST API, SDK language, MCP-capable agent, scheduled job, or no-code automation.
5. Constraints: read-only vs write, one-time vs recurring, expected volume, freshness needs, and authentication state.

## Route Selection

Choose the smallest public surface that satisfies the task:

- REST API when a service or script needs direct requests.
- SDK when the user's project already uses a supported language.
- MCP when an agent needs tool access inside an MCP-capable environment.
- Webhooks when the workflow needs async delivery or monitor events.
- Docs-only plan when credentials, targets, or runtime are missing.

Keep workflows read-only unless the user explicitly asks for a write-capable Xquik action and the public docs confirm the route.

## Output Template

Return a compact implementation plan:

```md
## Xquik Route

- Goal:
- Public source checked:
- Recommended surface:
- Inputs required:
- Auth placeholder:
- Request or SDK outline:
- Expected output shape:
- Validation step:
- Unknowns:
```

Use placeholders for keys and secrets. Never request, print, store, or paste real credentials.

## Safety

- Use only public documentation and public repository content.
- Do not include private implementation details, unpublished routes, credentials, logs, or hidden configuration.
- Do not collect private account data unless the user confirms they own or have permission for that account.
- Do not present Xquik as a way around platform rules.
- Preserve the user's data-minimization goal. Ask for fewer targets when a sample proves the workflow.
