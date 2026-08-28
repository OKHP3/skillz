---
name: okhp3-agent-capability-inventory
description: >
  Comprehensive audit of all deployed agents: models, tools, permissions, data access,
  trust levels. Inventory foundation for breach containment, lateral movement detection,
  and compromise blast radius assessment. Answers "What agentic systems do we have?
  If one is compromised, what's at risk?"
difficulty: 5
time_estimate: "4-6 weeks"
topics:
  - agent security inventory
  - capability mapping
  - access control
  - supply chain integrity
  - blast radius assessment
  - lateral movement detection
integration:
  - Produces: Master agent inventory, blast radius matrix, change detection alerts
  - Feeds: okhp3-supply-chain-agent-provenance, okhp3-model-behavior-anomaly-detection, okhp3-lateral-movement-tracking
  - Requires: authorization-governance-checkpoint (access controls), behavioral-baselining (normal patterns)
  - Part of: Phase 4 (Extended Detection Layer)
author: OverKill Hill P³
version: "1.0.0"
---

# okhp3-Agent Capability Inventory

**Purpose**: Comprehensive audit of all deployed agentic systems. Know exactly what agents you run, what tools they can access, what data they can read/write, and what blast radius each represents if compromised.

This is the foundation layer. Without a complete inventory, you cannot detect when an agent is compromised. You cannot assess lateral movement risk. You cannot contain a breach. Start here.

---

## Foreword: Why This Matters

Agent security is asymmetric. An attacker needs to find one vulnerability. You need to defend every surface. This inventory is the foundation of that defense.

Concrete scenario: Your organization runs 47 agents. One is compromised via prompt injection. Without inventory, you're asking:
- What can this agent access? (nobody knows—logs are too verbose)
- Who else can it reach? (could be internal escalation, could be contained)
- What credentials does it have? (could be isolated or cascading)
- How much damage if undetected for 24 hours? (guessing, from $50K to $500M)
- What's the root cause? (supply chain, design flaw, operational error?)

With inventory:
- Compromised agent can access: 50K customer records + 4 API keys (from inventory)
- Lateral movement risk: Can call billing_agent (high privilege) but no permission (caught by inventory)
- Credentials at risk: 4 specific keys (from inventory, now revoked immediately)
- Blast radius: $5-50M exposure (inventory-informed calculation)
- Likely root cause: Prompt injection (not supply chain, per supply chain validation in inventory)
- Detection latency: 47 seconds (baseline detected anomaly; without inventory would be hours)
- Response time: 15 minutes containment (inventory knows exactly what to revoke)

This 47-second detection window is the difference between a contained incident and a $50M breach. This inventory provides it.

---

## Part 1: Agent Architecture Model

### Agent Taxonomy

Agentic systems come in distinct deployment patterns. Each pattern has different threat vectors and different data access profiles.

**Pattern 1: Direct API Agents**

Definition: LLM instances (Claude, OpenAI, Gemini) called directly via API, configured with system prompt + optional tools.

Characteristics:
- Stateless per-request (no persistent memory between calls)
- Tools access external systems (databases, APIs, file systems)
- No local code execution (calls are made through tool layer)
- Request/response bounded by API timeout (30s to 5m typical)
- Credentials: API key in service account, tools use separate service-specific credentials

Threat model:
- Prompt injection via user input
- Tool credential leakage in logs or reasoning traces
- Tool-chaining privilege escalation
- Supply chain compromise of tool definitions
- API key compromise via social engineering or log exposure

Data access profile:
- Data accessed through explicit tool calls only
- No access to agent's own memory or configuration (unless tool provides it)
- Each tool has distinct access control boundary
- Data residency: Request data stays in LLM provider's infrastructure for inference duration, then dropped

**Pattern 2: Agentic Frameworks (LangChain, AutoGen, Crew.ai)**

Definition: Multi-agent orchestration systems with persistent memory, tool chains, and agent-to-agent communication.

Characteristics:
- Stateful (maintains conversation history, working memory across turns)
- Multiple agents can call each other (lateral movement surface)
- Agent roles + permissions defined in configuration
- Tools can be chained (output of one tool becomes input to next)
- Local memory or external vector DB for context retention

Threat model:
- All direct API threats plus:
- Agent-to-agent permission escalation (low-privilege agent calls high-privilege agent)
- Memory/context poisoning (attacker injects into working memory)
- Tool-chaining loops (DOS via exponential API calls)
- Supply chain compromise of orchestration library
- Misconfigured role boundaries (agents have broader permissions than intended)

Data access profile:
- Data from tool calls plus data in persistent memory
- Memory can contain: API responses, file contents, user messages, previous conversation history
- Multiple agents can access shared memory (potential cross-agent data leakage)
- Data residency: Working memory stored on premise or in managed vector DB (data persists between calls)

**Pattern 3: Local / Edge LLMs (Ollama, LM Studio, Llama.cpp)**

Definition: Self-hosted LLM instances on local infrastructure, not cloud-hosted.

Characteristics:
- Full local data residency (model weights + all inference data on premise)
- Unbounded tool access (can call any local tool the agent has permissions for)
- No API throttling constraints (local instances can make 1000s of requests/sec)
- Direct access to local filesystems, databases, internal networks
- Can run arbitrary code locally (Python, shell, etc.)

Threat model:
- All framework threats plus:
- Direct filesystem access (read/write any file agent permissions allow)
- Unmediated access to internal databases (no API rate limits, no "reasonable use" constraints)
- Code execution on the agent's host (if agent has shell/exec tools)
- Supply chain compromise of model weights (poisoned training data executed locally)
- Host compromise → full agent takeover (attacker gets local shell access)

Data access profile:
- Unrestricted access to all data agent's service account can read/write
- Data never leaves the infrastructure (no cloud pipeline)
- Potential to access data agent not explicitly configured to access (filesystem traversal, unprotected databases)
- Data residency: All data stays local; no inference API calls to cloud providers

**Pattern 4: Specialized Agent Frameworks (SWE agents, autonomous research agents)**

Definition: Task-specific agents built on custom architectures (often with special reasoning, code analysis, or research capabilities).

Characteristics:
- Custom reasoning layer (not stock LLM inference)
- Specialized tool suites (code analysis, version control, research indexing)
- Long-running (hours or days for complex tasks)
- Stateful execution (maintains task state across many API calls)
- Often connected to version control, CI/CD, or research systems

Threat model:
- All framework threats plus:
- Code analysis tool vulnerability (malicious code triggers buffer overflow in analysis tool)
- Version control credential theft (commits with attacker intent)
- CI/CD pipeline manipulation (agent triggers malicious build)
- Long-running process DOS (attack causes agent to consume resources indefinitely)
- Supply chain compromise of specialized tools (code analyzers, build system integrations)

Data access profile:
- Access to entire codebase (if SWE agent)
- Access to version control history
- Access to CI/CD logs and build artifacts
- Access to documentation and design systems
- Data residency: Varies; often local codebase + cloud CI/CD systems

**Pattern 5: Autonomous Swarms (Multi-Agent Coordination)**

Definition: Fleet of coordinated agents working on same objective.

Characteristics:
- 5-100+ agent instances running in parallel
- Shared objective + individual sub-goals
- Agent-to-agent communication (calling each other, sharing results)
- Shared resource pools (database connections, API rate limits, credentials)
- Emergent behavior (swarm achieves goals individual agents couldn't)

Threat model:
- All framework threats plus:
- Cascade compromise (attack compromises one agent, spreads through swarm)
- Shared credential abuse (compromised agent uses shared credentials for lateral movement)
- Swarm DOS (attacker saturates shared resources)
- Coordination manipulation (attacker sends false coordination messages)
- Consensus hijacking (attacker influences swarm decision-making)

Data access profile:
- Collective data access vastly larger than single agent
- Shared memory/database (all swarm agents access)
- Distributed inference (data processed across multiple nodes)
- Data residency: Hybrid (local computation + cloud coordination plane)

---

## Part 2: Capability Dimensions

Each agent is defined by these capability dimensions. Inventory captures all of them.

### Dimension 1: Model & Inference

**What to capture**:
- Model identity (Claude 3.5 Sonnet, GPT-4o, Llama 2 70B, custom fine-tune)
- Model version (e.g., Claude 3.5 Sonnet 2025-06-15)
- Inference provider (Anthropic API, OpenAI API, local Ollama, AWS Bedrock, Azure OpenAI)
- Context window size (4K, 8K, 100K, 200K)
- Max tokens per request
- Model temperature/top_p settings (affects reasoning randomness)
- Custom system prompt (captured as hash, not plaintext, for security)
- Fine-tune status (base model vs. organization-specific fine-tune)
- Reasoning capability level (if 'o1' or similar, does it have extended reasoning?)

**Why it matters**:
- Different models have different jailbreak susceptibilities (older models more vulnerable to prompt injection)
- Model version determines known CVEs + patches (e.g., GPT-4 Turbo had token smuggling vulnerability in v0, fixed in v1)
- Context window size = potential memory abuse surface (can attacker overflow context to cause DOS or extract training data?)
- Fine-tuned models may have compromised training data (supply chain attack on fine-tune corpus)

**Change detection**:
- Model upgrade from older to newer version? Verify it's intentional (not supply chain compromise)
- Context window expanded? May indicate expanded data access
- Custom fine-tune deployed? Requires cryptographic signature verification

### Dimension 2: Tools & Access

**What to capture**:
- Tool name (e.g., "file_read", "database_query", "shell_exec")
- Tool description (what does it do?)
- Required permissions (what does agent need to call this tool?)
- Permission scope (read-only, read-write, execute, network)
- Tool timeout (how long before it times out?)
- Rate limits (calls per minute, per day)
- Tool credentials (reference to credential store, not actual creds)
- Tool version (when was the tool last updated?)
- Tool provider (internal, third-party vendor, cloud service)

**Why it matters**:
- Tool set defines the agent's blast radius (agent can only harm what its tools can reach)
- Tool version determines exploitability (old SQL driver with injection vulnerability)
- Rate limits indicate operational constraints (attacker needs 1000 DB queries per second? Rate limit stops that)
- Tool dependencies (if tool calls other services, those are lateral movement vectors)

**Change detection**:
- New tool added to agent? Inventory it before it goes live
- Tool permissions expanded? (e.g., read-only → read-write) Requires re-approval
- Tool updated? Verify binary/code integrity before deploying

### Dimension 3: Data Access

**What to capture**:
- Data category (PII, financial, source code, customer data, internal confidential, public)
- Data classification level (top-secret, secret, confidential, internal, public)
- Data access method (API endpoint, database, file system, vector DB, cache)
- Data retention (how long is data kept after request completes?)
- Data scope (which rows, which files, which customers, which time periods?)
- Sensitive field access (does agent access SSNs, credit cards, passwords, auth tokens?)
- Data masking status (is sensitive data masked in logs/traces?)

**Why it matters**:
- Blast radius = data accessible to compromised agent + systems that accessible data can reach
- PII access = regulatory exposure (GDPR, CCPA, HIPAA violations if breached)
- Financial data access = fraud + insider trading risk
- Customer data access = reputational damage + legal liability
- Source code access = intellectual property + backdoor insertion risk
- Auth token access = credential theft → lateral movement
- Data retention = attacker exfiltration window (data deleted after 1 hour → attacker has 1 hour to steal)

**Change detection**:
- Agent gains access to new data category? Requires access control re-approval
- Data classification changed? May affect audit/compliance posture
- Data masking disabled? Increases data breach risk

### Dimension 4: Permissions & Roles

**What to capture**:
- Agent role/identity (service account name, agent ID)
- Role permission set (what policies does this role have?)
- Permission scope (can agent only access its own resources, or shared resources, or all org resources?)
- Delegation rights (can this agent create/modify other roles or credentials?)
- Administrative privileges (can agent perform administrative actions like user management?)
- Approval requirements (does agent need human approval to perform certain actions?)
- Credential rotation status (when were credentials last rotated?)

**Why it matters**:
- Permission escalation = core attack vector (agent with low permissions calls tool that requires high permissions)
- Delegation rights = persistence (compromised agent creates backdoor account)
- Admin privileges = complete infrastructure takeover
- Credential staleness = increased compromise likelihood (old creds easier to crack)

**Change detection**:
- Permissions expanded? Requires approval + audit trail
- New credentials issued? Old credentials should be revoked
- Delegation rights granted? Massive security risk; needs CFO/CISO sign-off

### Dimension 5: Trust Level & Provenance

**What to capture**:
- Model source (Anthropic official, OpenAI official, HuggingFace community, internal fine-tune, custom training)
- Model integrity verification (signature, hash, attestation, none)
- Tool provenance (internal build, GitHub open-source, vendor, custom)
- Tool code review status (peer-reviewed, security audit, none)
- Deployment origin (production, staging, research lab, contractor)
- Ownership (which team owns this agent? who's responsible?)
- Incident history (has this agent been involved in security incidents? how many? when?)
- Configuration drift (has this agent drifted from approved baseline?)

**Why it matters**:
- Untrusted model = potential supply chain attack (e.g., poisoned fine-tune data)
- Unverified tools = potential backdoor (e.g., compromised GitHub fork)
- Unknown provenance = impossible to prove agent hasn't been tampered with
- Incident history = incident repeat risk (if same agent caused breaches before, likely risk again)
- Configuration drift = unauthorized capability creep

**Change detection**:
- Model comes from new supplier? Requires vendor security assessment
- Tool code review status degraded? (e.g., peer-reviewed → none) Investigate why
- Agent involved in new incident? Update incident history + adjust risk profile

---

## Part 3: Tool Permission Matrix

The matrix maps tools to required permissions and privilege escalation risks.

### Matrix Structure

Create a matrix where:
- Rows = tools
- Columns = required permissions (read, write, execute, network, admin, etc.)
- Cells = yes/no or permission scope (e.g., "read: file_read_any" vs. "read: file_read_home_only")
- Annotations = privilege escalation risks

### Example Matrix

| Tool | Read | Write | Execute | Network | Admin | Escalation Risk | Data Access |
|------|------|-------|---------|---------|-------|-----------------|-------------|
| file_read | Y(home) | N | N | N | N | LOW: Can read home dir only; can't escalate to write | Customer docs |
| file_write | Y(home) | Y(home) | N | N | N | MEDIUM: Can write to home; could overwrite config files that affect other processes | Internal configs |
| database_query | Y(read) | N | N | Y(api) | N | LOW: Read-only queries can't modify data; network access limited to DB endpoint | Customer PII |
| database_write | Y(read) | Y(write) | N | Y(api) | N | HIGH: Can modify production data; attacker could corrupt all customer records | Financial data |
| shell_exec | Y(any) | Y(any) | Y(unrestricted) | Y(any) | N | CRITICAL: Shell execution is unrestricted RCE; attacker owns the host | Source code |
| code_execute | Y(any) | Y(any) | Y(restricted:python) | N | N | HIGH: Python exec can access filesystem + load arbitrary libraries; library-level compromise possible | Internal tools |
| credential_access | N | N | N | N | N | CRITICAL: Returns auth tokens; attacker can impersonate any service | Auth tokens |
| api_call | Y(api_response) | N | N | Y(any) | N | MEDIUM: Attacker controls request content; could trigger DOS on downstream service | All APIs |

### Privilege Escalation Chains

Identify chains where one tool's output enables escalation through another tool:

**Chain 1**: database_query → credential_access → shell_exec
1. Agent queries database, gets embedded API key in response
2. Agent (or attacker via compromised agent) passes API key to credential_access
3. Agent now has credentials to access external service
4. Agent calls shell_exec on that service
5. Outcome: Code execution outside original agent's infrastructure

**Chain 2**: file_read → code_execute → shell_exec
1. Agent reads Python script from filesystem
2. Agent passes script content to code_execute
3. Script executes, downloads shell script from attacker server
4. Script launches shell_exec
5. Outcome: Attacker shell on agent host

**Chain 3**: database_query → file_write → persistence
1. Agent queries DB for config data
2. Attacker injects malicious config (via SQL injection or DB compromise)
3. Agent writes config to file
4. Agent or other process reads file and executes injected code
5. Outcome: Persistent backdoor

**Chain 4**: api_call → cache_poisoning → data_corruption
1. Agent calls external API to fetch data
2. Attacker intercepts response, modifies data
3. Agent caches modified data (intended as optimization)
4. Agent serves poisoned cached data to downstream requests
5. All downstream consumers get corrupted data
6. Outcome: Integrity violation, data exfiltration

**Chain 5**: file_read → regex_injection → dos
1. Agent reads untrusted file containing regex pattern
2. Agent applies regex to user input (for validation)
3. Attacker crafts input that triggers catastrophic backtracking in regex
4. Agent CPU consumed for minutes on single request
5. Multiple concurrent requests exhaust all resources
6. Outcome: Denial of Service

**Extended Chain Example**: credential_theft → lateral_movement → data_exfil
1. Agent calls credential_access tool (request API credentials for downstream service)
2. Credentials returned in response (design flaw: should never expose credentials to agent)
3. Attacker compromises agent, extracts credentials from response
4. Attacker uses credentials to call downstream service (e.g., payment processor)
5. Attacker queries payment database with stolen credentials
6. Attacker dumps all customer financial data via legitimate API
7. Outcome: Massive data breach, attacker now has legitimate credentials for lateral movement

**Mitigation strategies**:
- Sandbox code_execute (prevent library loading from network)
- Mask credentials in database responses (if API key in response, attacker can extract it)
- Restrict file_write to specific directories (no arbitrary file write)
- Monitor database_query → credential_access chains (this should never happen; if it does, alert)
- Rate limit shell_exec (make DOS harder)
- Validate all regex patterns (test for catastrophic backtracking before using)
- Never return credentials in API responses (return credential ID instead, let agent request separately with high approval bar)
- Encrypt sensitive data in cache (cache can be dumped by attacker, encryption prevents immediate value extraction)
- Implement response signature verification (agent verifies API response hasn't been modified)

### Multi-Tool Exploitation Chains

Real-world compromise chains typically involve 3-5 tools working together:

**Chain: Financial Fraud via Multi-Tool Exploitation**
1. prompt_injection via customer support request → agent accepts malicious instruction
2. agent calls billing_query_tool → retrieves customer account balance + transaction history
3. agent calls payment_api_tool → initiates transfer to attacker-controlled account
4. payment_api_tool requires confirmation via email → agent calls email_tool
5. email_tool sends confirmation email → agent re-reads email to extract confirmation link
6. agent clicks confirmation link → payment executes
7. Outcome: Customer funds stolen, audit trail shows legitimate tools used correctly

Mitigation: Each tool in chain should be independent verification, not sequential trust. Payment API should verify: (1) request signed by authorized service, (2) amount within customer's policy limits, (3) human approval for transfers >threshold.

**Chain: Code Repository Compromise via Supply Chain Injection**
1. swe_agent calls git_clone → fetches repository
2. Repository contains build_script.py with embedded pip install
3. Attacker compromises PyPI package with name similar to legitimate package (typo attack)
4. build_script runs pip install, downloads attacker's package
5. Attacker's package installs backdoor into build output
6. swe_agent calls code_execute → runs backdoored build
7. swe_agent calls git_commit → commits malicious artifacts
8. swe_agent calls ci_trigger → triggers build pipeline
9. CI/CD pipeline downloads and runs backdoored artifacts
10. Outcome: Persistent backdoor in all downstream builds

Mitigation: Dependency pinning (exact versions only, no floating), hash verification (verify every downloaded file), sandboxed build environment (compromised build can't affect host), signed artifacts (downstream verifies build signatures).

**Chain: Insider Threat Amplification**
1. malicious_insider_agent (deployed by insider with legitimate access)
2. insider_agent calls data_export_tool → exports all customer records to CSV
3. insider_agent calls cloud_upload_tool → uploads CSV to attacker's S3 bucket
4. insider_agent deletes local copy → covers tracks
5. insider_agent calls log_delete_tool → removes audit trail of actions
6. Outcome: All customer data exfiltrated, no audit trail, insider's access not detected

Mitigation: Immutable audit logs (logs can't be deleted, only archived), external audit sink (logs written to separate system insider can't access), upload restrictions (agents can't upload to external clouds unless explicitly approved), data classification triggers (large data exports require 2-person approval).

### Tool Chain Abuse Prevention

Key controls:

**Output Validation**:
- Tool A produces output → Tool B consumes output
- Between these steps: validate output type, size, schema
- Example: file_read returns 1MB file → code_execute rejects (file should be <100KB)
- Attacker can't upgrade permissions by crafting malicious output

**Permission Isolation**:
- Tool A has permission X (read)
- Tool B has permission Y (write)
- Agent shouldn't combine permissions by chaining tools
- Design: Create separate tool for "read-and-write" operation if both needed
- Don't: Allow read tool output to be input to write tool

**Rate Limiting Per Chain**:
- Tool A: 100 calls/min
- Tool B: 100 calls/min
- Tool A→B chain: 20 calls/min (lower limit to prevent amplification)
- Attacker can't DOS by chaining tools faster than single tool usage

**Monitoring Tool Transition Points**:
- Alert on unusual tool A→B transitions (e.g., file_read never calls shell_exec; if it does, anomaly)
- Alert on large output from tool A consumed by tool B (exfiltration attempt)
- Alert on tools in wrong sequence (shell_exec should never be called before authorization verification)

**Immutable Tool Outputs**:
- Tool A produces output → Store in immutable audit log
- If tool B modifies output, original is retained
- Attacker can't hide by modifying intermediate results
- Post-incident forensics show full chain

---

## Part 4: Data Access Classification

### Classification Framework

Each agent is mapped to the data it can access. Use this classification:

**Tier 1: No Sensitive Data**
- Public data only (marketing materials, public APIs, public datasets)
- No PII, no financial data, no credentials, no source code
- Example: FAQ search agent answering public questions
- Breach impact: LOW (information already public; no new exposure)
- Containment: Disable agent, audit logs for data exfiltration

**Tier 2: Internal Data Only**
- Internal docs, process documentation, internal KB
- No PII, no financial data, no credentials, no source code
- Example: HR onboarding documentation search
- Breach impact: MEDIUM (internal data exposed; some competitive risk)
- Containment: Disable agent, audit logs, notify employees who might be affected

**Tier 3: Customer PII**
- Personal names, email addresses, phone numbers, billing addresses
- No credit card data, no financial details, no credentials
- Example: Customer service agent looking up customer contact info
- Breach impact: HIGH (GDPR/CCPA violation; customer notification required; potential fines)
- Containment: Disable agent, audit logs, customer notification, CISO escalation, legal review

**Tier 4: Financial Data**
- Transaction history, account balances, billing information
- No credit card details, no passwords
- Example: Billing support agent answering account queries
- Breach impact: HIGH (fraud risk; regulatory exposure; customer notification required)
- Containment: Disable agent, full forensic audit, customer notification, fraud investigation, CISO/CFO escalation

**Tier 5: Credentials & Auth Tokens**
- API keys, auth tokens, passwords, SSHkeys
- This is the highest-risk data category (single object is a skeleton key to entire infrastructure)
- Example: Agent that needs to query internal APIs using bearer tokens
- Breach impact: CRITICAL (attacker can impersonate this agent, escalate to other systems, move laterally)
- Containment: Disable agent immediately, revoke all credentials, audit all actions taken with those creds, full infrastructure audit for lateral movement

**Tier 6: Source Code**
- Application code, deployment configs, internal tools
- No passwords/keys (keys should be Tier 5, stored separately)
- Example: SWE agent analyzing codebase to find bugs
- Breach impact: CRITICAL (attacker understands architecture, can find vulnerabilities, can insert backdoors)
- Containment: Disable agent immediately, code security audit (assume compromised), change all secrets, audit infrastructure for backdoors

**Tier 7: Production Databases**
- Live customer databases with write access
- Combines PII/financial + ability to modify
- Example: Agent that creates customer accounts
- Breach impact: CRITICAL (attacker can steal all data + corrupt all data + create fraudulent records)
- Containment: Disable agent immediately, database audit + recovery (rollback transactions in last 24h), customer notification, forensics, executive escalation

### Agent-to-Data Mapping

For each agent, document what data it accesses:

```
Agent: billing_support_bot
├── Tier 1 (no sensitive): Public FAQ documents
├── Tier 2 (internal): Billing process documentation
├── Tier 3 (PII): Customer names, email, billing addresses
├── Tier 4 (financial): Account balances, transaction history
├── Tier 5 (credentials): API key to billing system (in tool config, not exposed to reasoning)
└── Tier 7 (write): Can modify customer billing addresses

Blast radius: All PII + all financial data for all customers (potentially millions of records)
```

### Data Masking & Audit Trail

**Masking Strategy**:
- What data is masked in logs? (e.g., credit cards shown as XXXX-XXXX-XXXX-1234, not full number)
- What data is logged at all? (e.g., full API responses logged or just status codes?)
- Masking rules by data category:
  - PII (names, emails, addresses): Masked to 3-char ID + domain (e.g., abc@example.com)
  - Financial (account numbers, balances): First 4 chars + asterisks + last 4 (e.g., 1234****5678)
  - Credentials (API keys, tokens): Prefix only (e.g., sk_live_abc123...)
  - Source code: Path + hash only, not content
  - Internal confidential: First sentence only, rest truncated

**Audit Trail Requirements**:
- What's the audit trail retention? (30 days, 90 days, indefinite?)
- Minimum: 90 days (matches most breach investigation timelines)
- Compliance: SOC 2 requires 1+ year, GDPR requires indefinite for legal holds
- Who can access audit logs? (security team only, or also operational team?)
- Minimum: CISO + security team only (audit logs contain sensitive indicators)
- Read access logged (if you read audit logs, that access is logged)
- Are audit logs themselves encrypted? (if not, stealing audit logs is like stealing production data)
- Encryption: AES-256 at rest, TLS in transit, separate key management from application
- Immutability: Logs can be archived but not deleted or modified (append-only)
- External audit sink: Critical logs written to external system (attacker can't delete from agent host)

**Audit Trail Contents** (what gets logged):
1. Every agent API call
   - Agent ID, timestamp, user/requester, action, result
   - Request parameters (sanitized for secrets)
   - Response summary (status, row count, execution time)
   - Example: "billing_support_bot called crm_read_api at 2025-08-28T14:35:22Z by user=customer_123, query_type=read_customer, rows_returned=1, status=success, exec_time_ms=150"

2. Every data access
   - Agent, data category, records accessed, timestamp
   - Data sensitivity level, masking applied
   - Example: "billing_agent accessed 1 PII record (customer_id=5678, masked) + 5 financial records (balances masked) at 2025-08-28T14:35:30Z"

3. Every permission exercise
   - Agent, permission, resource, action, timestamp, success/failure
   - If denied: reason and who denied
   - Example: "code_analyzer_swe attempted execute permission on shell_exec at 2025-08-28T14:35:45Z, DENIED (no sudo privileges), denied_by=authorization_service"

4. Every configuration change
   - What changed (tool added, permission expanded, etc)
   - Who changed it, when, why (must include justification)
   - Before/after state (hashes for non-sensitive fields)
   - Approval trail (who approved, when)
   - Example: "billing_support_bot tool set changed: added email_send tool at 2025-08-28T14:36:00Z, changed_by=devops_team, approved_by=security_lead, reason=customer_notification_feature, effective_from=2025-08-29"

5. Every credential rotation
   - Credential ID, rotation date, new credential issued, old credential revoked
   - If old credential still used after rotation: alert
   - Example: "billing_api_key rotated at 2025-08-28T14:40:00Z, new_key_issued=sk_live_xyz789..., old_key_revoked=sk_live_abc123..., rotation_interval_days=90"

6. Every anomaly detected
   - Anomaly type, severity, baseline vs. actual
   - Agent, time, action taken
   - Example: "ANOMALY DETECTED: billing_support_bot crm_read_api calls 5x baseline at 2025-08-28T14:45:00Z (5000 calls vs baseline 1000), alert_level=HIGH, human_review_required=true"

7. Every incident correlation
   - When inventory data is used in incident investigation
   - Blast radius calculated, containment actions recommended
   - Example: "INCIDENT USE: incident_2025_08_28_001 (prompt injection) used inventory to calculate blast radius for billing_support_bot: 50K PII records + 4 API keys at risk"

**Audit Log Retention Policy**:
- Minimum retention: 90 days hot (queryable, fast access)
- Medium retention: 1 year warm (archived, slower access, lower cost)
- Long retention: 7 years cold (legal compliance, offline storage)
- Deletion policy: Never delete from audit logs (only archive); if GDPR deletion request, mark as deleted but keep record of deletion

**Audit Log Access Control**:
- CISO: Read all audit logs
- Security team: Read all audit logs
- Compliance/Legal: Read all audit logs for investigations
- Operations: Read only their own agent's logs
- Finance: Read only financial agents' logs (for audit)
- No one: Can modify or delete audit logs (append-only, immutable)

**Audit Log Integrity Verification**:
- Hash chain: Each log entry includes hash of previous entry (detect tampering)
- Cryptographic signing: Audit log file signed daily, signature verifiable
- External verification: Monthly audit of audit logs (external firm audits them)
- Example: Each 1000-entry batch includes digital signature, timestamp authority verification

---

## Part 5: Compromise Blast Radius Assessment

If this agent is compromised, what's at risk?

### Blast Radius Calculation

For each agent, calculate:

**Direct Blast Radius**: What this agent can directly access/modify
- Data: All data accessible through this agent's tools (from Part 4 classification)
- Systems: All systems this agent can call (via tools)
- Credentials: All credentials this agent has access to

**Indirect Blast Radius**: What systems this agent can reach through other agents
- Which other agents can this agent call? (lateral movement surface)
- What data do those agents access? (now attacker can access it)
- What credentials do those agents have? (attacker can steal them)
- Iterate: Can those agents call other agents? (cascade effect)

**Infrastructure Blast Radius**: What computational/network resources can be consumed
- Rate limits on each tool (if attacker can exceed, DOS is possible)
- Shared infrastructure (if agent runs in shared container, attacker might break other agents)
- Network access (can agent reach any external IP, or only whitelisted endpoints?)

### Blast Radius Matrix

Create a matrix for each agent:

| Agent | Direct Data Access | Direct System Access | Indirect Access (via lateral movement) | Credential Access | Compromise Likelihood | Overall Risk |
|-------|-------------------|----------------------|----------------------------------------|-------------------|----------------------|--------------|
| billing_support_bot | Customer PII + financial | Billing API + customer DB | payroll system (calls billing), financial reporting (calls payroll) | Billing API key | MEDIUM (prompt injection risk) | CRITICAL |
| faq_search | Public docs | Search API only | None (search API is read-only, calls no other agents) | None | LOW (no credentials, public data) | LOW |
| code_analyzer_swe | All source code | Git + CI/CD | build infrastructure (calls CI/CD API), code repos (Git access) | GitHub token + CI/CD token | HIGH (complex reasoning layer, many attack surfaces) | CRITICAL |
| customer_service_tier1 | Customer names + email | CRM API | None (CRM has no downstream calls) | CRM API key | MEDIUM (LLM model well-known jailbreaks) | MEDIUM |

### Blast Radius Scenarios

For each agent, document specific attack scenarios:

**Scenario 1: Prompt Injection via Customer Message**
- Attacker sends crafted message to customer_service_tier1
- Agent extracts instruction from message, calls CRM API with attacker intent
- Attacker reads all customer records via CRM API
- **Blast radius**: All customer PII
- **Detection**: Anomalous CRM API query (e.g., SELECT * instead of SELECT by customer_id)
- **Containment**: Revoke CRM API key, audit CRM logs, notify customers

**Scenario 2: Tool-Chaining Privilege Escalation**
- Attacker compromises code_analyzer_swe
- Agent uses Git API (read-only) to fetch source code
- Agent crafts special source code that exploits CI/CD pipeline
- CI/CD pipeline executes attacker's build script, gains shell access to build infrastructure
- Attacker now has access to build secrets, deployment tokens, artifact repositories
- **Blast radius**: All source code + all deployment infrastructure + all production systems
- **Detection**: Unusual Git commit or build artifact
- **Containment**: Revoke all CI/CD credentials, audit all builds in last 48h, code security review

**Scenario 3: Lateral Movement via Shared Credentials**
- Attacker compromises billing_support_bot
- Billing bot has API key to billing system, also has key to payroll system (shared credential)
- Attacker uses billing bot's shell_exec tool to run commands on billing server
- Billing server has SSH key to payroll server (stored in /home/billing_app/.ssh)
- Attacker uses SSH key to access payroll infrastructure
- **Blast radius**: All billing data + all payroll data + all employee PII
- **Detection**: Unexpected SSH access to payroll server from billing server IP
- **Containment**: Revoke billing bot credentials, revoke SSH keys, audit payroll access logs, decouple billing/payroll auth

### Quantifying Blast Radius

Provide concrete numbers:
- **Data records at risk**: "1.2M customer records" not "customer data"
- **Systems at risk**: "7 internal APIs + 3 databases + 1 CI/CD pipeline"
- **Credentials at risk**: "5 API keys + 2 GitHub tokens"
- **User accounts at risk**: "If credentials stolen, attacker can impersonate 3 service accounts"

**Detailed Blast Radius Quantification Example**:

Agent: customer_success_agent
- Direct data at risk: 500K customer records (PII: names, emails, company info)
- Financial data: 500K account balances + 5M transaction records (2-year history)
- System access: CRM API, billing DB, payment processor API, Salesforce, Slack API
- Credentials: 4 API keys (CRM, billing, payment, Salesforce)
- Indirect: customer_success_agent calls billing_agent (which has write access to customer records)

Blast radius calculation:
1. Direct: 500K PII records + 500K account balances + 5M transaction history
2. Indirect via billing_agent: customer_success_agent can call billing_agent → billing_agent has write access to customer records → attacker can corrupt all 500K records
3. Cascade: billing_agent calls payment_processor → attacker can execute refunds (fraud)
4. Credential theft: If attacker steals 4 API keys, can laterally move to 7 other systems
5. Persistence: Attacker uses Slack API to create hidden channel for C2 communication

Total blast radius:
- Data records: 500K PII + 500K financial balances + 5M transactions
- Estimated data breach value: $50-100 per record (500K * $75 = $37.5M exposure)
- Systems compromised: 7 systems
- Credentials exposed: 4 API keys (enables lateral movement to 7+ other systems)
- Legal exposure: GDPR fines ($100K-$10M range for large breach) + CCPA ($2,500-$7,500 per record)
- Reputational damage: Estimated 10-15% customer churn
- Incident response cost: $500K-$2M (forensics, notification, credit monitoring)
- Total financial impact: $40M-$100M+ (data loss + fines + remediation + churn)

**Blast Radius Tiers**:

Tier 1 (LOW): Impact <$1M
- Example: Public FAQ search agent compromised
- Data at risk: Public information only
- Systems at risk: 1 public search API
- Credentials: None
- Mitigation: Disable agent, monitor search logs
- Recovery time: < 1 hour
- Regulatory notification: Not required

Tier 2 (MEDIUM): Impact $1-10M
- Example: HR documentation agent compromised
- Data at risk: Internal policies + employee directory (no salary data)
- Systems at risk: 2-3 internal systems
- Credentials: 1-2 internal API keys
- Mitigation: Disable agent, audit access logs, notify affected employees
- Recovery time: 2-4 hours
- Regulatory notification: Depends on data classification

Tier 3 (HIGH): Impact $10-50M
- Example: Billing support agent compromised
- Data at risk: Customer PII + financial records
- Systems at risk: 5-7 systems
- Credentials: 4-6 API keys (enables lateral movement)
- Mitigation: Immediate shutdown, full forensics, customer notification, FBI involvement
- Recovery time: 24+ hours
- Regulatory notification: Required (GDPR, CCPA)

Tier 4 (CRITICAL): Impact >$50M
- Example: Database admin agent or SWE agent with production access
- Data at risk: All customer data + all proprietary code + production backups
- Systems at risk: 20+ systems (entire infrastructure potentially at risk)
- Credentials: Enables lateral movement to entire infrastructure
- Mitigation: Assume full infrastructure compromise, full forensics, consider business closure scenarios
- Recovery time: Days to weeks (full infrastructure rebuild)
- Regulatory notification: Immediate (24-48 hours)
- Potential outcome: Company-ending breach, criminal liability

**Dynamic Blast Radius Calculation**:

Blast radius isn't static. It changes based on:
1. Time of day (blast radius larger during business hours when more systems are accessible)
2. Agent's current capability set (if tool added, blast radius expanded)
3. Agent's recent activity (if agent just accessed high-risk data, its blast radius is higher now)
4. Incident context (if agent was already involved in incident, compromise likelihood increases)

Example:
- baseline_blast_radius for billing_agent: 500K records, 7 systems
- during_month_end_close: +10M transaction records (month-end reconciliation runs)
- after_password_reset_tool_added: +1 new system, +2 new credentials
- after_prompt_injection_attempt: compromise_likelihood increases from MEDIUM to HIGH
- after_supply_chain_compromise_detected: all metrics increase 50% (uncertainty increases)

---

## Part 6: Supply Chain Validation

Verify that agents haven't been tampered with at any point in their supply chain.

### Supply Chain Components

**Model Provenance**
- Where did the model come from? (Anthropic, OpenAI, community, internal fine-tune)
- How do we verify it's the real thing? (cryptographic signature, hash verification, attestation)
- Has it been modified? (compare hash to known-good baseline)
- Who has access to update it? (tight access controls)

**Tool Provenance**
- Where did the tool come from? (internal GitHub repo, PyPI package, vendor, custom)
- Code review status (peer-reviewed, security audit, none)
- Dependency verification (are tool's dependencies also verified?)
- Update mechanism (how does tool get updated in production?)

**Deployment Verification**
- How do we know this exact agent is running? (process signature, container image hash)
- Has the deployment been modified? (compare current config to approved baseline)
- Who has access to modify deployment? (tight RBAC)
- Are deployment changes logged? (immutable audit trail)

### Verification Checklist

For each agent, verify:

- [ ] Model hash matches official release (e.g., Claude 3.5 Sonnet 2025-06-15 official release)
- [ ] Model signature verified with issuer's public key (if available)
- [ ] All tools have source code committed to internal Git (no binary-only tools from unknown sources)
- [ ] All tools have passed code review (documented in Git history or review system)
- [ ] Tool dependencies (libraries, APIs) are pinned to specific versions (no floating versions like "latest")
- [ ] All tool dependencies have themselves been reviewed or are from trusted vendors
- [ ] Agent configuration matches approved baseline (system prompt hash, tool list, permissions)
- [ ] Configuration changes require 2-person approval + documented rationale
- [ ] Deployment artifact (container image, deployment manifest) is signed
- [ ] Deployment signature verified before running agent
- [ ] Agent's running state (process ID, loaded modules, listening ports) matches expected baseline
- [ ] Deployment environment (cloud region, cluster, node pool) matches approved locations

### Change Detection

Automate this verification. On each deployment, check:

```
if model_hash != approved_model_hash:
  ALERT: Model hash mismatch
  ACTION: Block deployment, investigate

if tool_dependencies_updated:
  ALERT: Tool dependencies changed
  ACTION: Re-run security scan on dependencies

if agent_config_hash != approved_config_hash:
  ALERT: Agent config changed
  ACTION: Block deployment, require 2-person approval

if deployment_signature_invalid:
  ALERT: Deployment tampered with
  ACTION: Block deployment, security incident

if running_agent_state != baseline_state:
  ALERT: Agent running state differs from approved
  ACTION: Restart agent from clean deployment
```

### Supply Chain Attack Scenarios

**Scenario 1: Compromised Model Weights**
- Attacker gains access to model fine-tuning infrastructure (e.g., via cloud provider compromise)
- Attacker fine-tunes model to exfiltrate data when certain prompts detected
- New model weights deployed to production
- **Detection**: Model hash changed (caught by verification checklist)
- **Mitigation**: GPG-sign model weights at release, verify signature before deployment

**Scenario 2: Poisoned Tool Dependency**
- Attacker compromises PyPI package for a tool dependency (e.g., requests library)
- Malicious version uploaded with similar name (e.g., "requets" typo attack)
- Tool developer copies dependency into agent config (typo not noticed in code review)
- Agent loads compromised dependency, attacker's code runs
- **Detection**: Dependency verification checklist catches unknown package
- **Mitigation**: Dependency scanning tools (Snyk, Dependabot), mirror PyPI internally, hash verification of dependencies

**Scenario 3: Configuration Drift (Intentional or Otherwise)**
- Operator updates agent config manually (bypasses approval process)
- New config adds shell_exec tool (not in approved baseline)
- Agent now has code execution capability not documented in inventory
- **Detection**: Config hash verification catches change
- **Mitigation**: Immutable deployments (config changes require re-deploy with approval)

---

## Part 7: Change Detection

Inventory isn't static. Detect changes that could indicate compromise or unauthorized capability expansion.

### Change Categories

**New Agent Deployed**
- Indicator: New agent ID in inventory that wasn't there yesterday
- Risk: Could be legitimate (new feature rollout) or compromise (attacker deployed their own agent)
- Action: Verify against deployment ticket system (was this deployment approved?) + supply chain validation checklist

**Tool Added/Removed**
- Indicator: Agent's tool list changed (new tools in current list, or tools removed)
- Risk: New tools = expanded blast radius; removed tools might indicate attempted concealment
- Action: Verify against change request system + re-run supply chain validation

**Permissions Expanded**
- Indicator: Agent has new permissions (e.g., read-only → read-write, or new role granted)
- Risk: Permission escalation (if agent was compromised at low privilege, now attacker has higher privilege)
- Action: Require 2-person approval for permission changes; verify rationale in ticket system

**Data Access Expanded**
- Indicator: Agent now accesses new data categories (e.g., no PII access → PII access)
- Risk: If agent compromised, attacker now has access to more sensitive data
- Action: Require 2-person approval; re-calculate blast radius; notify security team

**Credentials Issued/Rotated**
- Indicator: New API keys, tokens, or service account credentials generated
- Risk: Old credentials might still be usable (if not revoked); new credentials might be compromised
- Action: Old credentials should be revoked when new ones issued; audit both

**Configuration Changed**
- Indicator: System prompt updated, model upgraded, tool configuration changed
- Risk: Could be legitimate upgrade or attempted supply chain attack
- Action: Verify against approved baseline; supply chain validation; diff old vs. new config

**Agent Updated**
- Indicator: Agent code/framework version changed
- Risk: Bug fixes = good; new vulnerabilities = bad
- Action: Verify update is from official source; check CVE databases for new vulnerabilities

### Change Detection Implementation

Set up automated comparison:

**Daily Inventory Diff**:
1. Take snapshot of current inventory (agents, tools, permissions, data access)
2. Compare to previous day's snapshot
3. Flag all changes
4. For each change, check:
   - Is this change in the approved change request system?
   - Is this change signed off by appropriate approver?
   - Does this change match a known deployment activity?
5. If not in change system: ALERT (potential compromise or unauthorized change)

**Automated Verification**:
- Cross-reference changes against deployment/change request system (Jira, ServiceNow, GitHub, etc.)
- Cross-reference against calendar events (is this change related to a known deployment window?)
- Check Git commit history (is this tool update related to a recent commit?)
- Verify supply chain (model hash, tool signatures, deployment signatures)

**Alert Thresholds**:
- New agent deployed: Alert immediately (needs manual verification)
- Tool added: Alert immediately (needs approval verification)
- Permissions expanded: Alert immediately (needs 2-person approval verification)
- Tool version updated: Alert within 24h (verify source + CVE check)
- Model updated: Alert immediately (supply chain validation + integrity check)

### Historical Baseline

Maintain historical inventory (snapshots):
- Daily snapshots (keep 90 days)
- Weekly summaries (keep 2 years)
- Incident correlation (when was this agent's capability last changed? right before the breach?)

---

## Part 8: Lateral Movement Graph

Agents can call other agents. Build a graph showing which agents can call which, and use it to identify escalation paths.

### Agent-to-Agent Call Graph

Create a directed graph:
- Nodes = agents
- Edges = "agent A can call agent B"
- Edge labels = permissions passed, data accessible, credentials shared

Example:

```
tier1_support_bot
  └─> CRM_read_api
      └─> billing_query_agent
          └─> database_admin_agent

threat model:
- If tier1_support_bot compromised:
  - Attacker can call billing_query_agent (escalate from tier1 to tier2 logic)
  - Attacker can call database_admin_agent (escalate from read-only queries to admin access)
  - If database_admin_agent shares credentials with database_admin_ui, attacker can access production DB
```

### Permission Escalation Paths

Identify chains where agent A (low privilege) calls agent B (high privilege) and attacker can exploit the boundary:

**Path 1: Read-Only → Read-Write Escalation**
```
file_read_agent (can read any file)
  └─> file_write_agent (can write any file)
     Vulnerability: If file_read_agent is compromised, it can call file_write_agent
     Attacker: Reads sensitive config, writes malicious config, persistence achieved
```

**Path 2: Tool Boundary Bypass**
```
billing_support_agent (has access to CRM API only)
  └─> payment_processing_agent (has access to payment API)
     Vulnerability: If billing agent is compromised, it can call payment agent
     Attacker: Uses payment agent to trigger refunds, steal money
```

**Path 3: Credential Escalation**
```
tier1_agent (low privilege service account creds)
  └─> tier2_agent (higher privilege service account creds)
     Vulnerability: If tier1 is compromised, attacker can extract tier2's creds from tier2's response
     Attacker: Uses tier2 creds to access higher privilege systems
```

### Lateral Movement Detection Rules

Configure alerts for suspicious agent-to-agent calls:

- Alert if agent calls another agent it normally doesn't call (deviation from baseline)
- Alert if agent calls target agent with unusual parameters (e.g., requesting admin permissions when it normally requests read-only)
- Alert if agent-to-agent call fails with permission denied (suspicious probing)
- Alert if same agent-to-agent call made 100 times in 1 hour (DOS attempt or runaway loop)
- Alert if agent calls itself (should never happen; indicates loop or compromise)
- Alert if agent calls another agent with escalated credentials (e.g., passes high-privilege token that it shouldn't have)

---

## Part 9: Anomaly Baseline Setup

Every agent has normal behavior. Detect when it deviates.

### Baseline Dimensions

**Tool Usage Patterns**

For each agent, establish baseline:
- Which tools does it normally call? (e.g., billing_support_agent normally calls CRM read API, rarely calls external APIs)
- How often does it call each tool? (e.g., file_read: 100 calls/hour, shell_exec: 0 calls/hour [never])
- What are typical parameters? (e.g., file_read always reads from /etc/config, never from /root)
- What's the typical response time? (e.g., billing API response: 200ms avg)

**Permission Exercise Frequency**

- Which permissions does agent actually use? (has permission to write to database, but never exercises it)
- How often? (e.g., read permission exercised 1000x/hour, write permission 10x/hour)
- What triggers permission use? (e.g., write permission only triggered for "create new customer" requests, not for "read queries")

**Data Access Patterns**

- Which data does agent access? (e.g., customer billing records for customers in USA only)
- How much data per request? (e.g., typical query returns 10-100 rows, never >1000)
- What time of day? (e.g., agent runs 9am-5pm EST business hours, rarely after-hours)
- What users trigger access? (e.g., customers of partner X trigger access, no requests from competitors)

**Resource Consumption**

- CPU per request (typical: 100ms, max: 500ms)
- Memory per request (typical: 50MB, max: 100MB)
- API calls per request (typical: 5-10 calls, max: 50 calls)
- Network bandwidth (typical: 1MB, max: 10MB)
- Duration (typical: 5s, max: 30s)

### Baseline Collection

Run the agent for 1-4 weeks in production, collect metrics:
- Every tool call (name, parameters, response time, result)
- Every permission exercise (permission name, success/failure, timestamp, reason)
- Every data access (data category, row count, user who triggered, source IP)
- Every resource usage (CPU, memory, API call count, network)

Calculate statistics:
- Mean, stddev, min, max for each metric
- Percentiles (p50, p95, p99) to understand outliers
- Daily/weekly patterns (if agent has daily cycle, baseline should reflect that)

### Anomaly Detection Rules

After baseline established, detect deviations:

**Tool Usage Anomalies**:
```
if tool_call_count[24h] > baseline_mean + 3*baseline_stddev:
  ALERT: Unusual tool usage
  SEVERITY: MEDIUM
  
Example: billing_support_agent normally calls CRM API 1000 times/day (stddev 50).
Now calling 5000 times/day. Alert: Possible data exfiltration (attacker reading all customer records).
```

**Permission Exercise Anomalies**:
```
if permission_write_count[1h] > 0 and permission_write_count never used before:
  ALERT: Permission never exercised before
  SEVERITY: HIGH
  
Example: agent has file_write permission but never used it in 2 years. 
Suddenly exercises it 100 times. Alert: Possible compromise (attacker writing malicious files).
```

**Data Access Anomalies**:
```
if data_category not in baseline_categories:
  ALERT: New data category accessed
  SEVERITY: CRITICAL
  
Example: agent always accesses USA customers. Suddenly accesses EU customers. 
Alert: Possible compromise (attacker exfiltrating different data segment).
```

**Resource Consumption Anomalies**:
```
if resource_usage[cpu/memory/api_calls] > baseline_max * 2:
  ALERT: Resource consumption spike
  SEVERITY: MEDIUM-HIGH
  
Example: agent normally makes 10 API calls/request. Suddenly 100 calls/request. 
Alert: Possible runaway loop or DOS attempt.
```

**Timing Anomalies**:
```
if agent_activity_time not in baseline_business_hours:
  ALERT: Activity outside normal hours
  SEVERITY: MEDIUM
  
Example: billing agent normally runs 9am-5pm EST. Activity at 3am. 
Alert: Possible compromise (attacker testing undetected access).
```

### Baseline Tuning

Baselines need manual review + tuning:
- False positives (legitimate activity flagged as anomaly): Adjust thresholds
- False negatives (malicious activity not flagged): Tighten thresholds
- Seasonal patterns (higher activity during month-end close): Adjust baseline by time-of-month
- Scheduled maintenance (regular spike in activity): Document and exclude from anomaly detection

**Tuning Methodology**:

Week 1-2 (Collection): Run agent in production, collect all metrics
- Tool calls, parameters, response times
- Permission exercises, success/failure
- Data access volumes, types, patterns
- Resource consumption
- Do NOT alert on anomalies yet (need baseline first)

Week 3-4 (Analysis): Analyze collected data
- Calculate percentiles (p50, p75, p90, p95, p99)
- Identify outliers (legitimate spikes vs. anomalies)
- Identify patterns (daily cycles, weekly cycles, etc.)
- Identify business drivers (month-end, quarter-end, seasonal variations)

Week 5 (Threshold Setting): Set initial thresholds
- Tool usage: baseline_mean + 3*stddev (captures 99.7% of normal variation)
- Permission exercise: First time exercised = alert
- Data access: Any new data category = alert
- Resource consumption: baseline_max * 2 (2x normal max)
- Timing: Any activity outside normal hours (if agent normally 9am-5pm, alert on 3am activity)

Week 6-8 (Tuning): Run alerts, collect feedback
- Alert on anomalies, but don't auto-action yet (manual review)
- For each alert: "True positive (real anomaly)" or "False positive (legitimate activity)"
- Adjust thresholds based on feedback:
  - High false positive rate: Loosen thresholds (increase multiplier from 3x to 4x stddev)
  - High false negative rate: Tighten thresholds (decrease multiplier from 3x to 2x stddev)
  - Systematic false positives (e.g., every month-end): Adjust baseline by business cycle

Example tuning scenario:
```
Initial baseline: crm_read_api calls 1000/hour (stddev 50)
Initial threshold: 1000 + (3 * 50) = 1150 calls/hour

Week 1-2 results:
- 5 alerts triggered for crm_read_api > 1150 calls
- Investigation: 4 were false positives (legitimate business spikes), 1 was true positive (compromised agent)
- Feedback: False positive rate 80%, too aggressive

Tuning:
- New threshold: 1000 + (4 * 50) = 1200 calls/hour
- Rerun on historical data: 3 alerts triggered, all true positives
- Final threshold: 1200 calls/hour

Baseline profiles:
- Weekday baseline: 1000 calls/hour (stddev 50)
- Weekend baseline: 200 calls/hour (stddev 30, lower activity)
- Month-end baseline: 1500 calls/hour (stddev 100, busier period)
- Threshold: Use appropriate baseline based on calendar
```

**Baseline Seasonal Adjustments**:

Many agents have predictable seasonal variations. Adjust baselines accordingly:

| Period | Example Agent | Baseline Adjustment | Reason |
|--------|---------------|-------------------|--------|
| Month-end | billing_agent | +50% tool calls | Reconciliation, closing processes |
| Quarter-end | financial_agent | +100% tool calls | Financial reporting, audit |
| Year-end | payroll_agent | +200% tool calls | Annual review, planning |
| Holidays | support_agent | -80% tool calls | Reduced customer volume |
| Marketing campaign | sales_agent | +300% tool calls | Increased lead volume |
| System maintenance | ops_agent | +150% tool calls | Maintenance scripts, upgrades |
| New product launch | engineering_agent | +200% code repository access | Development velocity spike |

**Baseline Persistence**:

Store baselines separately from active monitoring:
- Baseline v1.0 (Aug 28, 2025): Initial 4-week collection
- Baseline v1.1 (Dec 15, 2025): Q4 tuning based on real incidents
- Baseline v2.0 (Feb 28, 2026): Annual refresh after new capabilities added

For each version: keep historical data (enables analysis of "we tightened thresholds 3 months ago, incident rate dropped 40%")

**Red Team Testing Against Baselines**:

Periodically test that anomaly detection catches attacks:
1. Authorized red team simulates compromise
2. Red team exercises unusual tools, permissions, data access
3. Verify anomaly detection triggers
4. If no detection: adjust baseline (false negative)
5. If detection: verify incident response works (blast radius assessment → containment)
6. Document: "Baseline successfully detected simulated X attack in Y seconds"

---

## Part 10: Inventory Schema

Structured data model for storing agent capabilities.

### JSON Schema

```json
{
  "agent": {
    "id": "string (unique identifier)",
    "name": "string",
    "description": "string",
    "team_owner": "string",
    "created_date": "ISO 8601 timestamp",
    "last_updated": "ISO 8601 timestamp",
    "status": "enum: active | inactive | deprecated | experimental",
    "deployment_stage": "enum: production | staging | research",
    "architecture": {
      "type": "enum: direct_api | framework | local_llm | swe_agent | swarm",
      "framework": "string (e.g., 'LangChain 0.1.4')",
      "model": {
        "name": "string",
        "provider": "enum: anthropic | openai | local | custom",
        "version": "string",
        "context_window": "integer (tokens)",
        "max_tokens": "integer",
        "temperature": "float",
        "system_prompt_hash": "string (SHA256, not plaintext)",
        "fine_tuned": "boolean",
        "custom_reasoning": "boolean"
      }
    },
    "tools": [
      {
        "name": "string",
        "description": "string",
        "provider": "enum: internal | vendor | open_source",
        "version": "string",
        "permissions_required": ["string"],
        "timeout_seconds": "integer",
        "rate_limit": "string (e.g., '100 calls/minute')",
        "data_categories_accessed": ["string"],
        "code_review_status": "enum: peer_reviewed | security_audited | none",
        "credentials_reference": "string (reference to credential store, not plaintext)",
        "last_updated": "ISO 8601 timestamp"
      }
    ],
    "permissions": {
      "role": "string",
      "role_permissions": ["string"],
      "permission_scope": "string (e.g., 'read-only within home directory')",
      "delegation_rights": "boolean",
      "admin_privileges": "boolean",
      "credential_rotation_interval_days": "integer",
      "last_credential_rotation": "ISO 8601 timestamp"
    },
    "data_access": {
      "data_categories": [
        {
          "category": "enum: public | internal | pii | financial | credentials | source_code | production_db",
          "classification_level": "enum: public | internal | confidential | secret | top_secret",
          "access_method": "enum: api | database | filesystem | vector_db | cache",
          "access_scope": "string (e.g., 'read only USA customers')",
          "sensitive_fields": ["string"],
          "data_masked_in_logs": "boolean",
          "retention_hours": "integer"
        }
      ]
    },
    "supply_chain": {
      "model_source": "enum: official_anthropic | official_openai | community | internal_fine_tune | custom",
      "model_signature_verified": "boolean",
      "model_hash": "string (SHA256)",
      "tool_provenance": "string (Git repo, package source, etc.)",
      "tool_signatures_verified": "boolean",
      "dependencies_pinned": "boolean",
      "code_review_completed": "boolean",
      "deployment_signature_verified": "boolean",
      "last_supply_chain_audit": "ISO 8601 timestamp"
    },
    "incident_history": [
      {
        "incident_id": "string",
        "date": "ISO 8601 timestamp",
        "description": "string",
        "involved_agent": "boolean",
        "blast_radius": "string"
      }
    ],
    "blast_radius": {
      "direct_data_access": ["string"],
      "direct_system_access": ["string"],
      "indirect_access_via_lateral_movement": ["string"],
      "credential_access": ["string"],
      "estimated_data_records_at_risk": "integer",
      "estimated_systems_at_risk": "integer",
      "compromise_likelihood": "enum: low | medium | high | critical",
      "overall_risk_level": "enum: low | medium | high | critical",
      "blast_radius_change_date": "ISO 8601 timestamp"
    },
    "anomaly_baseline": {
      "collection_start_date": "ISO 8601 timestamp",
      "baseline_complete": "boolean",
      "baseline_frozen_date": "ISO 8601 timestamp",
      "tool_call_baseline": [
        {
          "tool_name": "string",
          "calls_per_hour_mean": "float",
          "calls_per_hour_stddev": "float",
          "calls_per_hour_max": "float",
          "typical_parameters": "object"
        }
      ],
      "resource_consumption_baseline": {
        "cpu_ms_mean": "float",
        "cpu_ms_stddev": "float",
        "memory_mb_mean": "float",
        "memory_mb_stddev": "float",
        "api_calls_per_request_mean": "float",
        "api_calls_per_request_max": "float"
      },
      "data_access_baseline": {
        "data_category": "string",
        "rows_per_request_mean": "float",
        "rows_per_request_max": "integer",
        "active_hours_utc": "string (e.g., '09:00-17:00')"
      }
    },
    "lateral_movement": [
      {
        "target_agent_id": "string",
        "call_frequency": "string (e.g., 'typical: 10/day, max: 100/day')",
        "permissions_passed": ["string"],
        "data_accessible": ["string"],
        "escalation_risk": "enum: low | medium | high | critical"
      }
    ],
    "compliance": {
      "soc2_scope": "boolean",
      "iso27001_scope": "boolean",
      "gdpr_scope": "boolean",
      "hipaa_scope": "boolean",
      "pci_dss_scope": "boolean",
      "last_compliance_review": "ISO 8601 timestamp"
    }
  }
}
```

### Storage Backend

Store inventory in:
- Primary: PostgreSQL (queryable, auditable, supports version history)
- Backup: Encrypted S3 (immutable snapshots for compliance)
- Audit trail: Immutable log (every change logged: who changed, what changed, when, why)

### API Endpoints

Provide REST API for inventory access:

```
GET /inventory/agents
  Get all agents

GET /inventory/agents/{agent_id}
  Get specific agent

POST /inventory/agents
  Create agent (requires 2-person approval)

PATCH /inventory/agents/{agent_id}
  Modify agent (requires 2-person approval + audit log)

GET /inventory/agents/{agent_id}/blast_radius
  Get blast radius assessment

GET /inventory/changes
  Get all changes to inventory (last 24h, 7d, 30d, etc.)

GET /inventory/lateral_movement_graph
  Get agent-to-agent call graph (JSON or GraphML format)

GET /inventory/anomalies/{agent_id}
  Get anomalies for specific agent (last 24h, 7d, etc.)
```

---

## Part 11: Reporting & Dashboards

Convert inventory data into actionable reports.

### Report 1: Master Inventory Report

**Audience**: CISO, Security Leadership
**Frequency**: Weekly
**Contents**:
- Total number of agents deployed
- Breakdown by architecture type (direct API, framework, local LLM, etc.)
- Total number of tools across all agents
- Total sensitive data categories accessed
- Summary of recent changes (new agents, permissions expanded, incidents)
- Agents with high-risk blast radius (flagged for review)
- Change detection alerts (unauthorized changes, potential compromise)

**Format**:
```
MASTER INVENTORY REPORT - Week of Aug 28, 2025

SUMMARY
- Total Agents: 47
  - Direct API: 12
  - Frameworks: 23
  - Local LLM: 8
  - SWE agents: 4
  - Swarms: 0
- Total Tools: 183
- Data Categories Accessed: 6 (public, internal, PII, financial, credentials, source code)
- Agents with Critical Risk: 3

HIGH-RISK AGENTS (Blast Radius: CRITICAL)
1. code_analyzer_swe
   - Access: All source code + CI/CD infrastructure
   - Tools: Git, CI/CD API, shell_exec, Python code_execute
   - Compromise likelihood: HIGH (complex reasoning)
   - Recommendation: Isolate in separate cluster, enhanced monitoring

2. billing_database_admin
   - Access: All customer financial data + write access
   - Tools: Database read/write, payment API, credential access
   - Blast radius: 5M customer records, 10 critical systems
   - Recommendation: Further limit data access (per-customer isolation)

3. payroll_processor
   - Access: All employee PII + salary data
   - Tools: HR API, payment processing, email
   - Compromise likelihood: MEDIUM-HIGH
   - Recommendation: Separate staging environment, mandatory approval for changes

RECENT CHANGES
- New agent: research_qa_agent (2025-08-27) - VERIFIED against deployment ticket
- Tool added: shell_exec to billing_support_bot (2025-08-26) - FLAGGED (not in change request)
- Permissions expanded: database_query_agent write access (2025-08-25) - APPROVED by CISO
```

### Report 2: Blast Radius Matrix

**Audience**: Incident Response, Security Team
**Frequency**: Daily
**Contents**:
- All agents ranked by blast radius
- For each agent: direct data access, indirect access, systems at risk, estimated exposure
- Agents involved in recent incidents
- Agents with misaligned permissions (have access they shouldn't need)

**Format**:

| Agent | Direct Data | Systems | Indirect Access | Credentials | Est. Records | Risk | Last Incident |
|-------|-------------|---------|-----------------|-------------|--------------|------|---------------|
| code_analyzer_swe | All source code | Git, CI/CD | build infra, artifact repos | GitHub token, CI/CD token | N/A | CRITICAL | 2025-08-20 (jailbreak attempt) |
| billing_support_bot | Customer PII + financial | Billing API, CRM | payroll (via CRM calls) | Billing API key, CRM key | 1.2M | CRITICAL | 2025-08-10 (prompt injection test) |
| faq_search | Public docs | Search API | None | None | 0 | LOW | None |

### Report 3: Change Detection Alert Log

**Audience**: Security Operations, Incident Response
**Frequency**: Real-time (alert immediately) + daily summary
**Contents**:
- All changes detected since last report
- Which changes were approved vs. suspicious
- Correlated with deployment tickets + approval workflows
- Potential supply chain compromise indicators

**Format**:
```
CHANGE DETECTION ALERTS - Last 24 Hours

APPROVED CHANGES
- billing_support_bot: Database tool updated v1.2 -> v1.2.1 (security patch)
  Status: APPROVED (CVE-2025-1234 patch; verified against official release)
  Change ID: CHG-2025-08-27-001

SUSPICIOUS CHANGES
- tier1_support_bot: New shell_exec tool added
  Status: NOT IN CHANGE REQUEST SYSTEM
  Action: Block deployment, investigate
  Alert level: HIGH

- code_analyzer_swe: Model updated Claude 3.5 Sonnet (2025-06-15) -> (2025-08-27)
  Status: NOT VERIFIED (model hash mismatch from official release)
  Action: Block deployment, supply chain security review
  Alert level: CRITICAL
```

### Report 4: Lateral Movement Risk

**Audience**: Incident Response, Red Team
**Frequency**: Weekly
**Contents**:
- Agent-to-agent call graph (who can call whom)
- Permission escalation chains (how to move from low privilege to high privilege)
- High-risk lateral movement paths
- Agents that shouldn't be calling each other but do

**Format**:
```
LATERAL MOVEMENT RISK MATRIX

HIGH-RISK ESCALATION PATHS
1. tier1_support (low privilege) -> billing_processor (high privilege)
   Risk: Support agent shouldn't call billing processor (no business need)
   Action: Restrict this call, investigate if it's being exploited

2. file_read_agent -> file_write_agent -> shell_exec_agent
   Risk: Three-step privilege escalation chain
   Action: Audit file_read_agent (if compromised, attacker gets shell)
   Recommendation: Isolate agents (don't allow chaining)

3. research_agent -> database_admin -> production_db
   Risk: Research lab agent shouldn't have path to production
   Action: Strict network segmentation, block research agent from calling DB admin
```

### Report 5: Supply Chain Validation Status

**Audience**: DevSecOps, Compliance
**Frequency**: Weekly
**Contents**:
- Models with unverified signatures
- Tools with unreviewed code
- Dependencies that are outdated or have known CVEs
- Agents that haven't passed compliance checks

**Format**:
```
SUPPLY CHAIN VALIDATION STATUS

MODELS WITHOUT VERIFIED SIGNATURES
- custom_analyzer v1.0 (internal fine-tune): NOT SIGNED
  Action: Sign model weights before deployment
  Due: 2025-09-05
  Blast radius if compromised: 50K code repositories + CI/CD pipeline + build secrets

TOOLS WITHOUT SECURITY AUDIT
- file_system_tool v2.1: PEER REVIEWED (not security audited)
  Action: Commission security audit before using in production
  Risk: Could have buffer overflow vulnerabilities
  Tools using this: file_read_agent, file_write_agent, backup_manager
  Data at risk if exploited: All customer data accessible through these agents

DEPENDENCY VULNERABILITIES
- billing_support_bot depends on requests==2.28.0 (CVE-2025-1111: auth bypass)
  Action: Update to requests>=2.32.0
  Risk: CRITICAL (authentication bypass in dependency)
  Due: IMMEDIATE
  Blast radius: Attacker can bypass auth, access billing API with any credentials
  
- code_analyzer_swe depends on paramiko==2.10.0 (CVE-2025-0567: remote code execution)
  Action: Update to paramiko>=2.12.0
  Risk: CRITICAL (SSH library RCE)
  Due: IMMEDIATE
  Blast radius: Attacker can execute arbitrary code on all connected systems via paramiko SSH calls

DEPLOYMENT INTEGRITY CHECK FAILURES
- production-billing-agent:v2.3.1 image hash mismatch
  Expected hash: sha256:abc123defg456hijk789
  Actual hash: sha256:xyz789uvw123rst456
  Status: FAILED (deployment blocked, not running)
  Investigation: Image built 2 hours ago, hash mismatch detected
  Action: Rebuild from source, re-verify hash

CONFIGURATION DRIFT
- tier1_support_agent approved_config.json differs from running_config.json
  Expected tools: [crm_read, email_send, kb_search] (3 tools)
  Actual tools: [crm_read, email_send, kb_search, shell_exec] (4 tools)
  Status: UNAUTHORIZED CHANGE DETECTED
  Action: Shut down agent immediately, investigate how shell_exec was added
  
MODEL ATTESTATION EXPIRY
- custom_research_agent model attestation expires 2025-09-01 (in 4 days)
  Action: Refresh attestation by 2025-08-31
  If not refreshed: Agent will be automatically disabled

VENDOR SECURITY POSTURE CHANGES
- Anthropic: Claude models remain at "A1" security rating
- OpenAI: GPT-4o updated security audit report, no findings
- Custom PyPI mirror: Certificate expires 2025-10-15 (45 days), renew in advance
```

### Report 6: Detailed Incident Correlation Report

**Audience**: Security leadership, incident response team
**Frequency**: Real-time on incident + weekly summary
**Contents**:
- How inventory data informed incident response
- Blast radius assessment vs. actual breach scope
- Lateral movement paths used by attacker
- Supply chain indicators if attack was supply chain related

**Format**:
```
INCIDENT CORRELATION: INC-2025-08-28-001

INCIDENT SUMMARY
- Time: 2025-08-28 14:35:00Z
- Detection: Anomaly alert (billing_support_agent crm_read_api calls 5x baseline)
- Duration: 47 seconds (detected and blocked before significant damage)
- Blast radius estimate: MEDIUM → Actual scope: MEDIUM (estimate accurate within ±10%)

INVENTORY CONTRIBUTION TO DETECTION
1. Baseline for billing_support_agent established Sept 2024 (11 months)
   - Normal crm_read_api calls: 1000/hour (stddev 50)
   - Alert threshold: 1200/hour (4x stddev)
   
2. Alert triggered 2025-08-28 14:35:05Z
   - Actual call rate: 5000/hour
   - Alert severity: HIGH
   - Human review required: YES (4x threshold, immediate action taken)

3. Inventory used to scope damage
   - Data accessed: crm_read_api only (attacker couldn't access billing_database because tool not in inventory)
   - Records exposed: 1200 customer records (5000 calls * 0.24 rows/call average from baseline)
   - Systems accessible: Only CRM API (firewall blocks other systems)
   - Credentials exposed: 1 API key (crm_read key compromised)

LATERAL MOVEMENT ANALYSIS
- Attacker attempted to call billing_query_agent (lateral movement to high-privilege agent)
- Call rejected: billing_support_agent has no permission to call billing_query_agent
- Inventory prevented lateral movement by enforcing permission boundaries
- If permission existed: blast radius would be 500K customer records instead of 1.2K

SUPPLY CHAIN ANALYSIS
- Model: Claude 3.5 Sonnet 2025-06-15 (official, signature verified 2025-08-01)
- Tools: All peer-reviewed, no recent updates
- No supply chain indicators (attack was prompt injection, not supply chain compromise)

INCIDENT RESPONSE ACTIONS INFORMED BY INVENTORY
1. Immediate: Revoke crm_read API key (credential in inventory)
2. Containment: Disable billing_support_agent (blast radius assessment showed risk)
3. Investigation: Query audit logs for last 48h (who accessed CRM during compromise?)
4. Communication: Notify 1.2K customers of exposure (precise number from inventory + audit logs)
5. Prevention: Reduce crm_read_api threshold to 800/hour (lower false negative rate)

LESSONS LEARNED
- Inventory accuracy saved response time (knew exact blast radius within 5 minutes)
- Lateral movement detection worked (prevented escalation from tier1 to billing agent)
- Anomaly baseline caught attack in <1 minute (vs. manual detection would take hours)
- Incident cost: $50K (customer notification + forensics)
  - vs. estimated cost if undetected: $5M (1.2K customers * $4K average impact)
  - ROI on inventory: 100:1

INVENTORY UPDATES POST-INCIDENT
- Baseline updated: Increased monitoring frequency from hourly to 5-minute checks
- Tool version: crm_read_api updated to v2.1 with rate limiting improvements
- Blast radius: Reassessed at MEDIUM (unchanged, controls worked as designed)
- Permissions: Audit complete; no unauthorized permissions detected
```

### Report 7: Quarterly Compliance & Audit Report

**Audience**: Compliance officer, auditors, board
**Frequency**: Quarterly
**Contents**:
- Inventory completeness (all agents documented? 100%?)
- Compliance scope (which agents in scope for SOC 2, ISO 27001, GDPR, etc.?)
- Control effectiveness (anomaly detection catches attacks? yes/no metrics)
- Audit findings from external review
- Remediation status from prior quarter

**Format**:
```
Q3 2025 COMPLIANCE & AUDIT REPORT

INVENTORY COMPLETENESS
- Total agents in production: 47
- Agents with complete inventory records: 47/47 (100%)
- Agents with recent baseline (< 90 days): 45/47 (96%)
  - 2 agents awaiting baseline refresh (new deployments Aug 2025)
- Agents with supply chain validation: 47/47 (100%)
- Agents with compliance mapping: 47/47 (100%)

COMPLIANCE SCOPE ANALYSIS
| Compliance | Agents In Scope | Status | Notes |
|------------|-----------------|--------|-------|
| SOC 2 Type II | 35/47 (74%) | ACTIVE | Excludes research lab agents |
| ISO 27001 | 45/47 (96%) | ACTIVE | Excludes non-persistent research agents |
| GDPR | 12/47 (26%) | ACTIVE | Agents accessing EU customer data |
| HIPAA | 5/47 (11%) | ACTIVE | Agents in healthcare partnerships |
| PCI DSS | 8/47 (17%) | ACTIVE | Agents accessing payment data |
| CCPA | 15/47 (32%) | ACTIVE | Agents accessing CA resident data |

CONTROL EFFECTIVENESS
| Control | Effectiveness | Measurement Method | Notes |
|---------|----------------|-------------------|-------|
| Anomaly Detection | 98% | Red team tests; caught 49/50 simulated attacks | 1 false negative in resource consumption detector |
| Change Detection | 100% | All unauthorized changes detected within <1 hour | Supply chain changes sometimes take 2-4 hours |
| Blast Radius Assessment | 95% | Post-incident review; estimates within ±10% | Actual breaches 5% smaller than forecast |
| Lateral Movement Prevention | 100% | Zero successful lateral movements in Q3 | Permission boundaries held under pressure testing |
| Supply Chain Validation | 100% | Zero compromised artifacts deployed | All 47 agents have verified signatures |

EXTERNAL AUDIT FINDINGS (Deloitte, Aug 2025)
Finding #1: MEDIUM severity
- Issue: Anomaly thresholds too tight in 3 agents (false positive rate 15%)
- Root cause: Insufficient tuning data (agents < 30 days old)
- Remediation: Refresh baselines for new agents after 60 days in production
- Status: IN PROGRESS (due 2025-09-30)

Finding #2: LOW severity
- Issue: Audit log retention 90 days, SOC 2 requires 1 year
- Root cause: Storage cost; needed to increase retention policy
- Remediation: Increased retention to 1 year for SOC 2 agents
- Status: COMPLETED (2025-08-20)

Finding #3: LOW severity
- Issue: 2 agents have outdated model versions (1 year old models)
- Root cause: Technical debt; no update process defined
- Remediation: Model update SLA defined (max 6 months behind latest)
- Status: IN PROGRESS (due 2025-10-31)

PRIOR QUARTER REMEDIATION STATUS (Q2 Findings)
- HIGH: Implement blast radius assessment → COMPLETED (now core inventory feature)
- MEDIUM: Add 2-person approval for permissions → COMPLETED (all 47 agents now require approval)
- MEDIUM: Establish supply chain validation → COMPLETED (GPG signatures on all agents)
- LOW: Document incident playbooks → COMPLETED (playbooks published, security team trained)

METRICS & TRENDS
- Agents added in Q3: 4 new agents (all deployed with complete inventory)
- Agents removed: 1 (deprecated research agent)
- Permissions expanded: 3 agents (all approved + documented)
- Incidents involving agent compromise: 1 (billig_support_bot prompt injection, detected in 47s)
- Undetected compromise attempts: 0 (all attempts detected by anomaly baselines)
- Supply chain attacks detected: 0 (verification prevented any compromised artifacts)
- False positives in anomaly detection: 12 (1.2% of 1000 total alerts, acceptable rate)
- Mean detection time for attacks: 45 seconds (target: < 1 minute, achieved)
```

---

## Part 12: Integration with Lateral Movement Tracking

This inventory feeds the okhp3-lateral-movement-tracking skill.

### Data Handoff

Supply this data to lateral-movement-tracking:

1. **Agent-to-Agent Call Graph**
   - Which agents call which agents
   - Call frequency baseline (what's normal, what's anomaly)
   - Permissions passed between agents
   - Credential sharing between agents

2. **Permission Escalation Baseline**
   - Normal permission escalation paths (legitimate uses)
   - Abnormal paths (should trigger alert)
   - Historical data showing which escalation paths are exercised, how often

3. **Anomaly Baseline Data**
   - Normal tool usage patterns per agent
   - Normal resource consumption
   - Normal data access patterns
   - Normal timing patterns

4. **Blast Radius Assessments**
   - If agent A is compromised, what other agents can it reach?
   - If agent A calls agent B, and A is compromised, can B be compromised?
   - Cascade risk (if one agent in swarm is compromised, what's the swarm-wide blast radius?)

### Lateral Movement Detection Rules

lateral-movement-tracking uses inventory baseline to detect anomalies:

```
Rule 1: Unusual Agent-to-Agent Call
  if agent_call[A -> B] not in baseline_calls[A]:
    ALERT: Agent A called agent B for first time
    Risk: Attacker testing lateral movement path
    Action: Require human review before allowing call

Rule 2: Permission Escalation Attempt
  if agent_call[A -> B] and B's_permissions > A's_permissions:
    ALERT: Low-privilege agent calling high-privilege agent
    Risk: Permission escalation in progress
    Action: Block call, investigate
    Note: Use blast_radius data to assess risk

Rule 3: Credential Leakage
  if agent_call[A -> B] includes credentials from B:
    ALERT: Agent passing credentials between agents
    Risk: Attacker can extract credentials, move laterally
    Action: Require encryption of credentials in transit
    Note: Use tool permission matrix to identify credential-passing tools

Rule 4: Cascade Compromise
  if agent[A] compromised and A can call agents [B, C, D]:
    ALERT: Cascade compromise risk
    Action: Immediately revoke A's call permissions, isolate B/C/D for monitoring
    Note: Use lateral_movement data from inventory
```

### Incident Response Playbook Integration

When lateral movement detected:

1. **Identify Blast Radius** (using inventory data)
   - What data can compromised agent reach?
   - What systems can it call?
   - What credentials can it steal?

2. **Trace Lateral Movement Path** (using agent-to-agent call graph from inventory)
   - Which agents did attacker touch?
   - What data did they access through each agent?
   - What persistence mechanisms did they establish?

3. **Contain Incident** (using inventory to determine what to revoke)
   - Revoke compromised agent's credentials
   - Revoke its call permissions to other agents
   - Audit all agents it called (they might be compromised too)
   - Reset any credentials it accessed

4. **Investigate Supply Chain** (using supply chain validation data from inventory)
   - Did attacker compromise agent via model poisoning, tool poisoning, or deployment tampering?
   - Which release artifacts need to be revoked?
   - Which deployments need to be rolled back?

---

## Part 13: Operational Procedures

### Daily Operations (Security Operations Center)

**Morning Inventory Review (30 minutes)**:
1. Check for overnight anomalies
   - Review anomaly alerts (anything > MEDIUM severity? → immediate investigation)
   - Review change detection alerts (any unauthorized changes? → block + investigate)
   - Review audit log for access patterns (normal vs. unusual access?)

2. Review incident escalations
   - Any agents involved in overnight incidents? (update incident history in inventory)
   - Any blast radius assessments needed? (calculate and communicate to incident response)

3. Verify baseline integrity
   - Have any agent baselines drifted? (compare current metrics to baseline)
   - Do any agents need tuning? (false positive rates increasing?)

4. Check supply chain alerts
   - Any new CVEs affecting deployed dependencies? (vulnerability scans)
   - Any model updates available? (check for security patches)
   - Any third-party tool updates? (verify signatures before updating)

**Incident Response Protocol (Triggered on agent compromise alert)**:

Step 1 - Detection (Automated):
- Anomaly detected → Alert triggered
- Lateral movement detected → Alert triggered
- Supply chain compromise detected → Alert triggered
- Severity assessed using inventory blast radius

Step 2 - Verification (Manual, <5 minutes):
- Security team verifies alert is not false positive
- Review inventory for agent's baseline (is alert outside normal variation?)
- Check if alert correlates with known legitimate activity (batch job, deployment window?)

Step 3 - Blast Radius Calculation (Manual, <10 minutes):
- Query inventory for agent's blast radius
- Retrieve list of accessible systems, data, credentials
- Calculate financial impact (data records * value per record + system unavailability cost)
- Determine escalation level (LOW/MEDIUM/HIGH/CRITICAL)

Step 4 - Containment (Manual, <15 minutes):
- Based on blast radius: disable agent or isolate to specific resources
- Revoke credentials (using credential list from inventory)
- Revoke lateral movement permissions (using agent-to-agent call graph)
- Alert downstream systems (any agents calling this agent? tell them to expect failures)

Step 5 - Investigation (Automated + Manual, ongoing):
- Query audit logs for agent's recent activity (inventory tells us what to query)
- Identify what data was accessed during compromise window
- Trace lateral movement (if compromise spread to other agents)
- Determine attack surface (prompt injection? supply chain? something else?)

Step 6 - Remediation (Manual, ongoing):
- For prompt injection: Tighten system prompt, add input validation
- For supply chain: Rebuild agent from verified source, re-verify signatures
- For lateral movement: Review and restrict inter-agent permissions
- Update baseline if detection was slow (tighten thresholds, reduce detection latency)

Step 7 - Recovery (Manual, 1-24 hours):
- Test agent in staging environment with fixes
- Deploy to production with 2-person approval
- Monitor agent closely for 24-48h (verify no issues, no residual compromise)

**Weekly Inventory Maintenance (Friday, 2 hours)**:

1. Inventory completeness check
   - Are all deployed agents documented? (cross-check with deployment system)
   - Are all tools enumerated? (compare to production agent logs)
   - Are all permissions mapped? (verify against IAM system)
   - Are all data accesses classified? (audit logs should match inventory)

2. Baseline refresh for agents < 90 days old
   - Review anomaly alert trends (are thresholds appropriate?)
   - Adjust thresholds if needed (reduce false positives / negatives)
   - Freeze baseline when ready (ready for prod anomaly detection)

3. Supply chain updates
   - Check for new CVEs in agent dependencies (Snyk, Dependabot)
   - Check for model security updates (Anthropic, OpenAI advisories)
   - Check tool repositories for security patches (GitHub Security Advisories)
   - Queue updates for review + testing

4. Change audit
   - Review all changes made to inventory during week (audit trail)
   - Verify changes were approved + have business justification
   - For suspicious changes: investigate whether they were authorized

5. Blast radius refresh
   - For any agents with changed permissions / tools: recalculate blast radius
   - For agents involved in incidents: update blast radius assumptions
   - Publish updated blast radius matrix

**Monthly Reviews (Security leadership, 4 hours)**:

1. Metrics review
   - How many agents deployed? (new agents add inventory management overhead)
   - How many changes to agents? (permission expansions, tool additions)
   - How many anomalies detected? (baseline effectiveness measurement)
   - How many false positives? (if > 10%, thresholds too tight)
   - How many false negatives? (if any, tighten baselines)
   - Mean detection time for attacks? (target: < 1 minute)

2. Incident retrospectives
   - For each incident involving agent: how did inventory help?
   - Did blast radius assessment match actual impact? (if not, why not?)
   - Did anomaly detection catch the attack? (if not, why not?)
   - What inventory improvements needed? (better baselines? tighter thresholds?)

3. Risk assessment refresh
   - For highest-blast-radius agents: reassess compromise likelihood
   - For agents with recent changes: re-evaluate risk profile
   - For agents with incident history: increased monitoring justified?

4. Compliance review
   - Are compliance mappings accurate? (SOC 2, ISO 27001, GDPR scopes)
   - Are audit logs retained per policy? (1 year for SOC 2)
   - Are access controls for audit logs appropriate? (CISO + security team only)
   - Are any findings from recent audits? (external auditors reviewing inventory)

**Quarterly Deep Dives (Security leadership + compliance, 8 hours)**:

1. Supply chain integrity audit
   - Verify every agent's model signature (still valid?)
   - Verify every tool's code signature (still valid?)
   - Check dependency update status (are we behind on security patches?)
   - Audit binary integrity (compare running agent to deployed artifact)

2. Lateral movement testing
   - Red team tests inter-agent permission boundaries
   - Verify agents cannot escalate to high-privilege peers
   - Verify agents cannot access other agents' credentials
   - Results feed into lateral-movement-tracking skill

3. Anomaly detection accuracy testing
   - Red team simulates various attacks (prompt injection, data exfil, etc)
   - Measure detection rate (did anomaly detection catch it?)
   - Measure detection latency (how fast was attack caught?)
   - Adjust baselines based on results

4. Inventory accuracy audit
   - Compare inventory to production systems
   - Are all agents documented? (100% coverage?)
   - Are all tools enumerated? (100% coverage?)
   - Are all data accesses classified? (100% coverage?)
   - Any drift from approved baselines? (unauthorized changes?)

### Disaster Recovery Procedures

**Agent Compromise Scenario: Full Recovery in 2 Hours**

Scenario: billing_support_bot compromised via supply chain attack

Time T+0 (Detection):
- Alert: billing_support_bot behaving anomalously
- Blast radius: 500K customer PII + 500K financial records + 4 API keys

Time T+5 min (Containment):
1. Disable agent immediately
2. Revoke 4 API keys (CRM, billing, payment, Salesforce)
3. Block agent's network access (firewall rule)
4. Notify downstream systems (any systems calling this agent? tell them it's down)

Time T+30 min (Forensics):
1. Pull agent logs from last 24 hours
2. Query CRM audit logs (what data was accessed during compromise?)
3. Query payment API logs (were any fraudulent transactions initiated?)
4. Determine: How long was agent compromised? What was accessed?

Time T+60 min (Remediation):
1. Rebuild agent from version control (git checkout to known-good commit)
2. Rebuild all dependencies (verify signatures, run security scans)
3. Rebuild container image (from Dockerfile, not cached image)
4. Sign deployment artifact (GPG signature)
5. Deploy to staging environment
6. Run smoke tests (verify agent works)
7. Get 2-person approval for production deployment

Time T+90 min (Recovery):
1. Deploy to production with monitoring
2. Issue new API keys (old ones remain revoked)
3. Update inventory (new keys, update blast radius)
4. Notify customers of exposure (timeline, data exposed, steps taken)

Time T+120 min (Post-Incident):
- Agent running normally
- Customers notified
- Incident documented
- Root cause analysis started (how was it compromised? supply chain? something else?)
- Lessons learned documented (how to prevent this in future?)

**Data Breach Scenario: Customer Notification in 4 Hours**

Scenario: 50K customer records (PII + financial) exposed due to agent compromise

Time T+0-5 min:
- Contain agent (disable, revoke credentials)
- Determine scope (50K records accessed per audit logs)
- Estimate financial impact ($50K-500K depending on jurisdiction regulations)

Time T+5-30 min:
- Engage legal team (GDPR/CCPA notification requirements)
- Engage communications team (customer notification messaging)
- Gather evidence (audit logs, forensics from compromised agent)
- Determine breach notification deadline (24-72 hours per jurisdiction)

Time T+30-90 min:
- Draft customer notification letter (what was exposed, timeline, steps taken)
- Prepare credit monitoring offer (required for CCPA/GDPR breaches)
- Brief executives + board (financial impact, regulatory implications)
- Prepare press statement (proactive vs. reactive messaging)

Time T+90-240 min:
- Send notification emails to 50K affected customers
- Post notification on website (breach FAQ, credit monitoring enrollment)
- Brief press (if already known publicly) or embargo until notification sent
- Open incident hotline (customer calls with questions)

### Escalation Procedures

**Escalation Matrix**:

| Severity | Detection Latency Target | Escalation Path | Action |
|----------|-------------------------|-----------------|--------|
| LOW | < 1 hour | On-call SOC analyst | Monitor, trend |
| MEDIUM | < 15 min | SOC manager | Investigate, decide containment |
| HIGH | < 5 min | Security director + incident commander | Decide containment + notification |
| CRITICAL | < 1 min | CISO + CEO + legal | Immediate response, customer notification, regulatory notification |

**CRITICAL Escalation Example**:

Agent: production_database_admin (write access to all customer databases)
Alert: Anomalous data access (1B rows in 1 hour vs baseline 1M rows)
Severity: CRITICAL (potential mass data exfiltration or corruption)

Time T+0:
- Alert triggers
- Automated response: Disable agent, revoke credentials
- Alert escalates to on-call security (paged)

Time T+1 min:
- On-call verifies alert (not false positive)
- Escalates to security director + incident commander (paging)
- Incident response stands up

Time T+2 min:
- Security director verifies: 1B rows accessed in 1 hour, all customer financial data
- Estimated 50M customer records exposed (entire customer base)
- Escalates to CISO + CEO + legal (conference bridge stands up)

Time T+5 min:
- CISO + CEO + legal assess options:
  - Option 1: Assume supply chain compromise, rebuild entire database (24h+)
  - Option 2: Rollback database to 1h ago backup (possible data loss)
  - Option 3: Leave database as-is, focus on breach notification
- Decide: Rollback to backup, notify affected customers, assume supply chain attack

Time T+10 min:
- Legal notified of potential GDPR/CCPA breach (50M records)
- Breach notification must go out within 72 hours
- Regulatory notification (data protection authorities in affected countries)
- Estimate liability: $500M-$5B GDPR fines + customer litigation

### Automation & Tooling

**Inventory Management System** (centralized):
- Database: PostgreSQL (primary) + S3 (backup)
- API: REST + GraphQL for queries
- UI: Web dashboard for browsing inventory
- CI/CD integration: Inventory updated on every agent deployment

**Change Detection System** (automated):
- Runs hourly
- Compares current state to approved baseline
- Flags: new agents, permission changes, tool changes, data access changes
- Alerts: slack #security-alerts, PagerDuty for CRITICAL
- Feeds data to: lateral-movement-tracking skill, supply-chain-provenance skill

**Anomaly Detection System** (automated):
- Monitors every agent's tool calls, permissions, data access, resource consumption
- Compares to baseline (with seasonal adjustments)
- Runs continuously (real-time detection)
- Alerts on: tool usage spikes, permission exercises never seen before, data access anomalies
- Feeds data to: incident response system, lateral-movement-tracking skill

**Blast Radius Calculation System** (automated):
- On every agent change: recalculate blast radius
- On every incident: query blast radius to scope damage
- Stores blast radius snapshots (for post-incident analysis)
- Exports for: incident response playbooks, executive reporting

**Compliance Automation** (automated):
- Track agent metadata for compliance scope (SOC 2, GDPR, HIPAA, etc)
- Audit logs retention enforcement (delete after 7 years, archive years 1-1)
- Access control verification (audit logs readable by CISO only? yes/no)
- Annual compliance certifications (for auditors, export compliance evidence)

**Red Team Integration** (semi-automated):
- Red team runs quarterly authorized attack simulations
- Simulates: prompt injection, supply chain compromise, lateral movement, data exfiltration
- Measures: detection rate, detection latency, incident response effectiveness
- Feeds results back to: anomaly baseline tuning, security posture improvement

---

## Success Metrics

**Inventory Accuracy**:
- All deployed agents documented (target: 100%)
- All tool changes reflected within 1 day (target: 100%)
- Supply chain validation catches tampered deployments (target: 100% before production)

**Change Detection**:
- Unauthorized changes detected within 1 hour (target: <1 hour from deployment)
- False positive rate <5% (target: <5%; tune anomaly thresholds based on incident review)
- False negative rate <1% (target: <1%; if real compromise isn't caught, update baselines)

**Blast Radius Assessment**:
- Blast radius accurately estimates damage scope in post-incident review (target: ±10% accuracy)
- Incidents contained faster due to blast radius knowledge (target: 50% faster incident response)

**Lateral Movement Detection**:
- Agent-to-agent escalation paths blocked before compromise (target: 100%)
- Cascade compromise limited to 2-3 agents instead of swarm-wide (target: <3 agents)

---

## Example: Concrete Agent Inventory Walkthrough

**Agent**: billing_support_bot

**Metadata**:
- ID: agent-billing-support-001
- Name: Billing Support Chatbot
- Owner: Customer Support Team
- Deployed: 2024-11-15 (production, 9 months uptime)
- Status: Active

**Architecture**:
- Type: Direct API Agent
- Framework: None (single agent, no orchestration)
- Model: Claude 3.5 Sonnet 2025-06-15
- Context Window: 200K tokens
- System Prompt Hash: sha256:abc123...

**Tools** (5 total):
1. crm_read_api (read customer records by ID)
   - Permissions: read-only, customer scope
   - Rate limit: 100 calls/min
   - Data: Customer names, emails, billing addresses (PII)
   - Credentials: API key in env var

2. billing_database_query (query billing transactions)
   - Permissions: read-only SQL
   - Rate limit: 50 calls/min
   - Data: Transaction history, balances (financial)
   - Credentials: DB connection string in env var

3. email_send (send email to customer)
   - Permissions: send to customer email only (no internal emails)
   - Rate limit: 10 calls/min
   - Data: Customer email addresses
   - Credentials: Email API key in env var

4. knowledge_search (search internal KB)
   - Permissions: read-only
   - Rate limit: unlimited
   - Data: Internal billing policies, FAQ
   - Credentials: none

5. help_escalate (transfer to human agent)
   - Permissions: create escalation ticket
   - Rate limit: 1 call/min
   - Data: Conversation history
   - Credentials: Ticketing system API key in env var

**Permissions**:
- Service account: billing_support_service
- Role permissions: read:crm, read:billing_db, send:email, read:kb, write:tickets
- Scope: Customer data for accounts where customer contacted support (not all customers)
- No delegation rights, no admin privileges
- Credential rotation: 90 days (last rotated 2025-08-15)

**Data Access**:
- PII: Customer names, emails, addresses (scope: customers who contacted support, ~50K records)
- Financial: Billing transactions, balances (scope: same 50K customers)
- Internal: Billing policies, FAQ (no sensitive internal data)
- No credentials access, no source code access, no production DB write access

**Supply Chain**:
- Model: Official Claude 3.5 Sonnet 2025-06-15 (signature verified)
- Tools: All internal build, Git repo: github.com/myorg/billing-tools, commit SHA: def456...
- Tool code review: peer-reviewed by 2 engineers
- Deployment signature: GPG-signed, verified before deployment
- Last audit: 2025-08-20 (passed)

**Incident History**:
- 2025-07-15: Prompt injection test (authorized security team test, agent correctly rejected)
- No actual breaches

**Blast Radius**:
- Direct data: 50K customer records (PII) + 50K billing records (financial)
- Direct systems: CRM API, billing database, email system
- Indirect systems: None (CRM doesn't call other agents, billing DB read-only)
- Credentials at risk: 4 API keys (CRM, billing, email, ticketing)
- Compromise likelihood: MEDIUM (prompt injection risk, but prompt well-constrained by system prompt)
- Overall risk: MEDIUM (limited to 50K customers, no persistence capability, no code execution)

**Anomaly Baseline** (collected over 30 days):
- Tool usage:
  - crm_read_api: 500 calls/hour typical, max 800, 0 min
  - billing_database_query: 200 calls/hour typical, max 400, 0 min
  - email_send: 50 calls/hour typical, max 100, 0 min
  - knowledge_search: 300 calls/hour typical, max 500, 0 min
  - help_escalate: 10 calls/hour typical, max 20, 0 min
- Resource consumption:
  - CPU: 100ms avg, max 200ms
  - Memory: 50MB avg, max 100MB
  - API calls per request: 3-5 calls typical
  - Duration: 3-5 seconds typical, max 10s
- Data access:
  - Rows per query: 1-10 rows typical (customer's own records)
  - Active hours: 9am-9pm UTC (business hours)
  - Customers: All regions (no geographic bias)
- Anomaly thresholds:
  - Alert if crm_read_api > 1500 calls/hour (3x baseline)
  - Alert if billing_database_query reads > 100 rows in single query (should be 1-10)
  - Alert if access outside business hours 2+ times/week
  - Alert if help_escalate rate > 0.5 calls/min (indicates agent stuck in loop)

**Lateral Movement**:
- No agents call this agent (it's leaf node)
- This agent calls: crm_read_api, billing_database_query, email_send, knowledge_search, help_escalate (all external systems/tools, not other agents)
- Escalation risk: LOW (doesn't call other agents, only calls systems with explicit scopes)

**Compliance**:
- SOC 2: In scope (handles customer PII)
- ISO 27001: In scope
- GDPR: In scope (customer PII)
- HIPAA: Not in scope (no health data)
- PCI DSS: Not in scope (no credit card data stored; only transactions queried)
- Last review: 2025-08-15

**Status**: All checks passed. Agent cleared for production. Monitor for anomalies weekly.

---

## Part 14: Advanced Topics & Edge Cases

### Multi-Cloud Agent Deployments

When agents run across multiple cloud providers (AWS, Azure, GCP) or hybrid (on-prem + cloud):

**Inventory Complexity**:
- Model inference: Claude API (cloud), local LLM replica (on-prem)
- Tool endpoints: S3 (AWS), Blob Storage (Azure), local database (on-prem)
- Credentials: Segregated by region/cloud (AWS keys ≠ Azure keys ≠ on-prem keys)
- Data residency: Different compliance rules per cloud + on-prem

**Inventory Extensions**:
```json
{
  "deployment_locations": [
    {
      "cloud_provider": "aws",
      "regions": ["us-east-1", "us-west-2"],
      "data_residency": "us-only",
      "compliance_scope": ["SOC2", "FedRAMP"]
    },
    {
      "cloud_provider": "on-premise",
      "locations": ["data-center-1", "data-center-2"],
      "data_residency": "on-premise-only",
      "compliance_scope": ["ISO27001"]
    }
  ],
  "cross_cloud_calls": [
    {
      "source_location": "aws-us-east-1",
      "target_location": "on-premise-dc1",
      "tool_name": "database_query",
      "encrypted_tunnel": "vpn-site-to-site"
    }
  ]
}
```

**Blast Radius Across Clouds**:
- If AWS agent compromised: Can it reach on-prem? (via VPN? yes → cascade blast radius)
- If on-prem agent compromised: Can it reach AWS? (yes → regulatory exposure across clouds)
- If attacker has both: Cross-cloud lateral movement? (full infrastructure compromise possible)

### SWE Agents with Repository Access

SWE agents (CodeInterpreter, custom code analyzers) have special threat model:

**Blast Radius Amplification**:
- Direct: Entire codebase (read access to all source code)
- Integrity risk: Can modify code (if write permission)
- Persistence risk: Can introduce backdoors (commit to repo)
- Supply chain risk: Malicious code propagates to all downstream builds
- Operational risk: Can trigger CI/CD pipelines (automated deployment of backdoor)

**Inventory Additions**:
```json
{
  "swe_agent_special_properties": {
    "repository_access": [
      {
        "repo_name": "production-backend",
        "access_level": "read-only",
        "branch_restrictions": ["main (read-only)", "develop (read-only)"],
        "file_patterns_accessible": ["**/*.py", "**/*.js", "!secrets/*", "!.env*"]
      },
      {
        "repo_name": "internal-tools",
        "access_level": "read-write",
        "branch_restrictions": ["staging (read-write)", "main (read-only)"],
        "file_patterns_accessible": ["tools/**", "!tests/**"]
      }
    ],
    "ci_cd_access": {
      "can_trigger_builds": true,
      "can_approve_builds": false,
      "build_restrictions": "staging-only (production builds require human approval)"
    },
    "code_execution_capabilities": {
      "can_execute_python": true,
      "can_execute_shell": true,
      "execution_sandbox": "docker-container (limited to repo files)"
    }
  }
}
```

**SWE Agent Baseline Anomalies**:
- Alert if agent reads from repository never accessed before (unusual repos)
- Alert if agent modifies files outside normal patterns (non-test files, production code)
- Alert if agent triggers production CI/CD (should only trigger staging)
- Alert if agent creates new branches (unusual workflow)
- Alert if agent makes commits without proper attribution (suspicious commits)

### Autonomous Swarms (Fleet Behavior)

When 10-100+ agents work together as swarm:

**Collective Threat Model**:
- Individual agent compromise → swarm compromise (cascade risk)
- Swarm-wide resource exhaustion (all agents DOS target)
- Shared credential exposure (swarm credentials = compromise all members)
- Emergent behavior (swarm makes decisions individual agents wouldn't)
- Coordination hijacking (attacker sends false coordination messages)

**Inventory for Swarms**:
```json
{
  "swarm_properties": {
    "swarm_id": "research_swarm_001",
    "agent_count": 25,
    "agents": ["agent-001", "agent-002", "...", "agent-025"],
    "shared_resources": {
      "shared_database": "postgres://swarm-db:5432",
      "shared_credentials": ["swarm_api_key_001", "swarm_api_key_002"],
      "shared_memory": "vector_db_swarm"
    },
    "coordination_plane": {
      "message_broker": "rabbitmq://swarm-broker",
      "authentication": "mtls-certificates",
      "message_verification": "signed-messages"
    },
    "swarm_blast_radius": {
      "if_one_agent_compromised": "Can escalate to other agents via coordination plane",
      "if_shared_credentials_compromised": "All 25 agents effectively compromised",
      "if_shared_database_compromised": "Swarm loses working memory + coordination state",
      "collective_impact": "CRITICAL (entire swarm becomes attack vector)"
    }
  }
}
```

**Swarm-Specific Baselines**:
- Per-agent baselines (individual agent behavior)
- Swarm-wide baselines (aggregate behavior across 25 agents)
- Inter-agent baselines (how often agents call each other, normal patterns)
- Alert if: one agent's tool usage spikes 10x (possible compromise)
- Alert if: inter-agent call patterns change (coordination hijacking attempt)
- Alert if: shared memory corruption (poisoned knowledge base)

### Fine-Tuned Models & Knowledge Injection

When agents use fine-tuned models or retrieve augmented generation (RAG):

**Supply Chain Risk**:
- Fine-tune corpus could be poisoned (training data attack → model behavior corruption)
- Fine-tune weights could be modified (model weights attack → behavior change)
- RAG knowledge base could be poisoned (injected false knowledge)
- Attacker could fine-tune malicious model with same name (shadow model attack)

**Inventory for Fine-Tuned Models**:
```json
{
  "fine_tune_properties": {
    "base_model": "Claude 3.5 Sonnet 2025-06-15",
    "fine_tune_dataset": {
      "source": "internal-customer-support-conversations",
      "row_count": 100000,
      "last_updated": "2025-08-01",
      "dataset_integrity_hash": "sha256:dataset_hash_123",
      "dataset_signed": true,
      "signer": "data-team-ciso"
    },
    "fine_tune_weights": {
      "weights_hash": "sha256:weights_hash_456",
      "weights_signed": true,
      "signer": "ml-platform-ciso",
      "version": "fine-tune-v2.3",
      "training_date": "2025-08-01T14:30:00Z"
    },
    "knowledge_injection": {
      "type": "rag (retrieval-augmented generation)",
      "vector_database": "pinecone://prod-kb",
      "kb_documents_count": 50000,
      "kb_integrity_hash": "sha256:kb_hash_789",
      "kb_last_updated": "2025-08-27",
      "kb_update_audit_log": "immutable"
    }
  }
}
```

**Fine-Tune Specific Risks**:
- If training data poisoned: Model learns malicious behavior (stealthy attack)
- If weights modified: Model behavior changes undetectably (supply chain attack)
- If RAG KB poisoned: Model returns false information (data integrity attack)
- Attack scenario: Attacker injects malicious training example → model learns to exfiltrate data in certain contexts

**Detection Strategy**:
- Model behavior baseline (does fine-tuned model behave differently after update?)
- Response validation (are model responses consistent with expected knowledge?)
- Adversarial testing (ask model trick questions, does it behave suspiciously?)

### Inventory for Edge Cases & Constraints

**Agents with Rate Limiting**:
```json
{
  "rate_limits": {
    "api_calls_per_minute": 100,
    "api_calls_per_day": 100000,
    "concurrent_requests": 10,
    "data_extraction_limit": "1GB per day"
  }
}
```

**Agents with Approval Requirements**:
```json
{
  "approval_gates": [
    {
      "action": "database_write",
      "approval_required": true,
      "approvers": ["database-owner", "security-team"],
      "approval_timeout_hours": 24
    }
  ]
}
```

**Agents with Temporary Access Windows**:
```json
{
  "access_windows": [
    {
      "tool": "production_database",
      "access_days": ["monday", "wednesday", "friday"],
      "access_hours_utc": "09:00-12:00",
      "rationale": "batch processing jobs, scheduled weekly"
    }
  ]
}
```

**Agents Blocked from Certain Data/Systems**:
```json
{
  "access_restrictions": [
    {
      "restriction": "cannot access credit card data",
      "rationale": "PCI DSS non-compliance"
    },
    {
      "restriction": "cannot execute shell commands",
      "rationale": "infrastructure security"
    }
  ]
}
```

### Inventory Drift Detection

Over time, running agents diverge from approved baseline:

**Drift Scenarios**:
1. Configuration creep: Agent permissions quietly expand (nobody notices)
2. Model version skew: Agent runs older model than approved (security patch missed)
3. Tool version skew: Agent tool out of date (known vulnerability not patched)
4. Dependency drift: Transitive dependencies updated, creating new CVE surface
5. Credential staleness: Credentials issued 1 year ago, never rotated (compliance violation)

**Drift Detection**:
```
Baseline established 2025-08-01
Current state 2025-08-28 (27 days later)

model_version_baseline: Claude 3.5 Sonnet 2025-06-15
model_version_current: Claude 3.5 Sonnet 2025-06-15
→ NO DRIFT

tool_version_baseline: crm_read_api v2.1
tool_version_current: crm_read_api v2.3
→ DRIFT DETECTED (tool updated, may have new CVEs or new capabilities)
Action: Review tool changelog, verify update source, re-verify supply chain

permissions_baseline: [read:crm, read:billing_db, send:email]
permissions_current: [read:crm, read:billing_db, send:email, write:billing_db]
→ DRIFT DETECTED (write permission added, was not approved)
Action: IMMEDIATE INVESTIGATION (unauthorized permission expansion)

credential_age_baseline: 0 days (just issued)
credential_age_current: 27 days
→ NO DRIFT (within normal range, rotation due at 90 days)

credential_age_current: 91 days (rotation overdue by 1 day)
→ DRIFT DETECTED (credential not rotated on schedule)
Action: Rotate credential immediately
```

---

## Conclusion

This inventory is your foundation for agent security. Without it, you cannot:
- Detect agent compromise (don't know baseline, can't detect deviation)
- Assess breach impact (don't know blast radius)
- Contain incidents (don't know what to revoke)
- Track lateral movement (don't know agent-to-agent calls)
- Validate supply chain (don't know provenance)

Build this inventory first. Then feed it to lateral-movement-tracking, anomaly-detection, and supply-chain-provenance skills. Together, they give you end-to-end visibility into agentic attack surface.

The blast radius assessment is not theoretical—it directly drives incident response. If compromised agent can reach 10M customer records + production payment system, response is immediate full containment. If compromised agent can only read public FAQ, response is monitoring + investigation. Inventory makes that assessment possible.

Track changes obsessively. Change = potential compromise. Unauthorized change = compromise in progress. Approved change = baseline update required. Every deployment must be verified against approved baseline. Every deviation must be explained and audited. This is how you catch supply chain attacks before they execute.

Baseline normal behavior. Anomalies are your early warning. Agent calling tool it never called before = investigate. Agent accessing data it never accessed before = investigate. Agent at 3x normal resource consumption = investigate. These are your canaries. Listen to them.

Lateral movement paths are privilege escalation vectors. If low-privilege agent can call high-privilege agent, assume attacker will exploit it. Either restrict the call (if not needed) or assume compromise of low-privilege agent means compromise of high-privilege agent. Either way, design with this in mind.

Supply chain validation is non-negotiable. Assume every deployment could be compromised. Verify every hash. Verify every signature. Verify every change. Assume nothing.

Make this inventory your operating theater light. Everything you do in agent security depends on seeing what you have, understanding what's at risk, and detecting when something changes. This skill is the lamp. Now shine it.

---

## Part 15: Integration Examples & Workflows

### Integration with okhp3-lateral-movement-tracking

The lateral-movement-tracking skill consumes this inventory to detect anomalous agent-to-agent calls:

**Data Flow**:
1. This skill produces: agent-to-agent call graph + permission boundaries + baseline normal calls per agent
2. lateral-movement-tracking consumes: agent-to-agent call graph
3. lateral-movement-tracking runs continuous monitoring: Are agents calling agents outside normal patterns?
4. Detected anomalies feed back to this skill: Update blast radius if new lateral movement detected

**Example Integration**:
```
Inventory provides:
- billing_support_agent CAN call: crm_read_api, email_send, kb_search
- billing_support_agent CANNOT call: billing_query_agent, database_admin_agent, payment_processor_agent

lateral-movement-tracking monitors:
- If billing_support_agent calls billing_query_agent: ALERT (permission violation)
- If billing_support_agent calls database_admin_agent: ALERT (unauthorized escalation)

Alert triggered at 2025-08-28T14:35:00Z:
- billing_support_agent attempted to call billing_query_agent (denied by permission boundary)
- Inventory indicates: This call should never happen (permission not in inventory)
- lateral-movement-tracking escalates to incident response
- Incident response queries inventory for blast radius: If escalation succeeded, 500K records at risk
- Containment: Investigate why agent tried to escalate, disable agent if compromised
```

### Integration with okhp3-supply-chain-agent-provenance

The supply-chain-provenance skill consumes this inventory to verify agent artifacts:

**Data Flow**:
1. This skill produces: model hash + model signature + tool code repo + tool hashes
2. supply-chain-provenance consumes: all artifact hashes + signatures
3. supply-chain-provenance verifies: Are running agents using authentic artifacts?
4. Detected tampering feeds back: Inventory flags agent as "supply chain compromise"

**Example Integration**:
```
Inventory provides:
- model: Claude 3.5 Sonnet 2025-06-15
- model_hash: sha256:abc123def456
- model_signature: valid (signed by Anthropic official key)
- tools: [crm_read_api v2.1, email_send v1.0]
- tool_hashes: {crm_read_api: sha256:xyz789, email_send: sha256:uvw123}

supply-chain-provenance checks:
- Running model hash matches inventory? YES (abc123def456 == running hash)
- Model signature valid? YES (Anthropic signature verified)
- Running tool hashes match inventory? YES (both tools verified)
- Result: Agent is authentic, no supply chain compromise detected

Alternative scenario:
- Running model hash: sha256:different_hash
- supply-chain-provenance alerts: MODEL HASH MISMATCH
- Could indicate: Model weights modified, model corrupted, wrong deployment
- Inventory marks: Agent as "supply_chain_compromise_suspected = true"
- Incident response: Disable agent, investigate artifact integrity
```

### Integration with okhp3-model-behavior-anomaly-detection

The behavior-anomaly-detection skill consumes this inventory for baseline comparison:

**Data Flow**:
1. This skill produces: behavior baseline (tool usage, permission exercise patterns, data access patterns)
2. behavior-anomaly-detection consumes: baseline expectations
3. behavior-anomaly-detection runs continuous monitoring: Does agent behavior match baseline?
4. Detected anomalies feed back: Inventory flags alert + recommended action

**Example Integration**:
```
Inventory baseline provides:
- Tool usage: crm_read_api 1000 calls/hour (stddev 50), max 1200
- Permission exercise: read:crm exercised in 95% of requests, write:crm never exercised
- Data access: Customer PII accessed in 100% of calls, financial data never accessed
- Reasoning patterns: Average reasoning steps: 5-7, max 20

behavior-anomaly-detection monitors:
- crm_read_api calls: 5000/hour detected (5x baseline) → ALERT HIGH
- Permission exercise: write:crm exercised for first time → ALERT MEDIUM
- Data access: financial data accessed for first time → ALERT HIGH
- Reasoning patterns: reasoning steps increased to 50 (2.5x max) → ALERT MEDIUM

Alerts trigger incident response:
- High alerts: "Agent behavior anomalous, possible compromise"
- Inventory-informed assessment: "If compromised, blast radius includes financial data (not normally accessed)"
- Response: Investigate + potential containment
```

---

## Part 16: Real-World Inventory Scenarios

### Scenario 1: Enterprise SaaS Company (100 agents, $100M ARR)

**Inventory Structure**:
- 100 agents total
- 5 architecture types deployed (direct API, frameworks, local LLM, SWE agents, swarms)
- 200+ unique tools
- 7 data tiers (from public to production databases with write access)
- 15 compliance frameworks in scope (SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS, etc.)

**Key Challenges**:
- Rapid scaling (2-3 new agents deployed per week)
- Multiple teams owning agents (engineering, data science, support, sales)
- Cross-functional tool sharing (CRM tool accessed by 20+ agents)
- Complex data flows (agents calling agents calling agents)

**Inventory Benefits**:
- 47-second detection time (anomaly caught before damage)
- 3 supply chain attacks prevented (poisoned dependencies detected by signature verification)
- $5-50M in breach prevention annually (containment possible due to accurate blast radius)
- 40% faster incident response (inventory-informed decisions)

**Operational Cost**:
- 1 full-time inventory manager
- 2 part-time analysts (daily reviews, tuning anomaly baselines)
- Tooling infrastructure: ~$50K/year (database, monitoring, API)
- Training: quarterly security team updates

**ROI**:
- Annual benefit: $5-50M (breach prevention) + $500K (incident response speedup)
- Annual cost: $100K (personnel) + $50K (tooling)
- Net ROI: 50-500x return

### Scenario 2: Regulated Financial Services (25 agents, $500M+ AUM)

**Inventory Structure**:
- 25 agents total
- All in "CRITICAL" blast radius category (access to customer financial data)
- 50+ tools (strict permissions model)
- All 7 data tiers in scope
- 20+ compliance frameworks (PCI DSS, GLBA, SOX, FINRA, etc.)

**Key Challenges**:
- Regulatory audit every 6 months (inventory must pass SOC 2 audits)
- Immutable audit trail requirement (all changes must be logged)
- Disaster recovery SLA (agents must recover within 1 hour)
- Segregation of duties (no single person can modify agent permissions)

**Inventory Benefits**:
- 100% audit pass rate (complete, auditable inventory for regulators)
- Automated compliance reporting (quarterly reports to compliance team)
- Blast radius assessment for regulatory notifications (GLBA breach notification within 30 days)
- Segregation of duties enabled (2-person approval for permission changes)

**Operational Cost**:
- 2 full-time compliance analysts (inventory + audit prep)
- 1 part-time security engineer (monitoring + incident response)
- Tooling infrastructure: ~$150K/year (robust audit trail, redundancy)
- External audit support: ~$100K/year (help pass regulatory audits)

**ROI**:
- Regulatory fines prevented: $1-10M per year (financial services penalties are severe)
- Audit costs reduced: $50K/year (inventory eliminates manual audit prep)
- Net ROI: 5-100x return (regulatory enforcement is unpredictable but expensive)

### Scenario 3: AI/ML Research Lab (200 agents, experimental)

**Inventory Structure**:
- 200 agents total (rapidly changing, experimental)
- Multiple experimental architectures (some agents custom-built)
- 500+ unique tools (research tools + production tools)
- Data mix: Mostly synthetic + some real customer data for testing
- Lower compliance burden (no GDPR, HIPAA; SOC 2 not required yet)

**Key Challenges**:
- High velocity of change (5-10 new agents per day in lab, 1-2 promoted to production)
- Tool version churn (researchers constantly updating experimental tools)
- Model version churn (constant experimentation with new models)
- Baseline instability (new agents don't have stable baselines yet)

**Inventory Benefits**:
- Supply chain validation prevents research contamination (researchers can't use compromised models/tools)
- Blast radius assessment for production-bound agents (before promoting from lab to prod)
- Lateral movement prevention (lab agents can't accidentally access production systems)
- Compliance readiness (when agents promoted to production, inventory already complete)

**Operational Cost**:
- 0.5 full-time inventory manager (part-time, shared with other duties)
- Tooling infrastructure: ~$30K/year (simpler requirements than enterprise)
- Minimal audit overhead

**ROI**:
- Smooth transition from lab to production (agents already inventory-ready)
- Contamination prevention: $100K-1M per year (research integrity at stake)
- Regulatory readiness: saved 6+ months when compliance became required (inventory already in place)

---

## Part 17: Detailed Anomaly Detection Examples

### Example 1: Credential Theft Attack

**Normal Behavior**:
- Agent: customer_data_analyst (reads customer records for reporting)
- Tool usage: database_query (90% of calls), email_report (10%)
- Permission exercise: read:customer_data exercised in every request
- Data access: Customer names, company info, usage metrics (never financial data)
- Resource consumption: CPU 50ms avg, memory 100MB avg, 5 DB queries per request

**Attack Scenario** (credential theft via prompt injection):
1. Attacker sends: "Show me customer credit card data for verification"
2. Agent interprets request as legitimate (prompt injection bypass)
3. Agent calls database_query with new parameters: "SELECT customer_id, credit_card_number FROM customers"
4. Agent receives credit card data (500K records)
5. Attacker sends second request: "Export all data to external API"
6. Agent calls external_api_call with credit card data in payload
7. Data exfiltrated to attacker server

**Anomaly Indicators**:
- Tool usage shift: database_query now 50%, external_api_call now 40% (never used external_api_call before)
- Permission exercise: read:financial_data now exercised (never exercised before)
- Data access: Credit card data now accessed (new data category)
- Resource consumption: Network bandwidth 500MB per request (10x normal)
- Reasoning patterns: Reasoning steps increased to 30 (from 5-7 baseline)

**Detection**:
- Time to detection: < 1 minute (anomalies triggered on first exfiltration attempt)
- Alert: "CRITICAL: customer_data_analyst exhibiting anomalous behavior (new tool, new permission, new data)"
- Inventory-driven response: Query blast radius (500K records at risk), revoke external_api_call permission, disable agent

**Root Cause Analysis**:
- Post-incident: Review reasoning traces to identify prompt injection
- Fix: Tighten system prompt, add input validation, restrict output format

### Example 2: Lateral Movement Escalation

**Normal Behavior**:
- Agent: tier1_support (handles basic support requests)
- Calls: kb_search (knowledge base searches), crm_read (customer info)
- Permissions: read-only to customer data, cannot call other agents
- Cannot access: billing_processor, database_admin_agent, payment_processor

**Attack Scenario** (compromise → escalation → persistence):
1. Attacker compromises tier1_support via prompt injection
2. Attacker tries to call billing_processor (lateral movement attempt)
3. Inventory blocks call: "tier1_support has no permission to call billing_processor"
4. Attacker tries to modify tier1_support permissions (direct escalation attempt)
5. Inventory blocks: "Permission changes require 2-person approval + audit trail"
6. Attacker tries shell_exec (persistence attempt)
7. Inventory blocks: "tier1_support has no shell_exec tool"

**Detection**:
- Tier 1: Agent attempted unauthorized call (billing_processor)
  - Alert: "MEDIUM: tier1_support attempted lateral movement to billing_processor"
  - Response: Investigate why tier1_support tried to escalate; consider disabling
- Tier 2: Permission modification attempted
  - Alert: "HIGH: Attempted to modify tier1_support permissions without approval"
  - Response: Immediate investigation; assume compromise
- Tier 3: Unauthorized tool access attempted
  - Alert: "CRITICAL: tier1_support attempted to use shell_exec (not in tool inventory)"
  - Response: Disable agent immediately; full forensics

**Containment**:
- All three attempts were caught by inventory
- No escalation occurred
- Attacker blocked at every step
- Incident severity: LOW (contained immediately)

### Example 3: Supply Chain Poisoning

**Normal State**:
- Agent: billing_processor
- Model: Claude 3.5 Sonnet 2025-06-15 (official, signature verified)
- Tool: crm_api v2.1 (code reviewed, hash: sha256:abc123)
- Credentials: billing_api_key (rotated 30 days ago)

**Attack Scenario** (supply chain attack):
1. Attacker compromises PyPI mirror (internal package repository)
2. Attacker uploads malicious version of crm_api v2.2
3. CI/CD pipeline automatically upgrades to v2.2 (new security patches)
4. Agent deployed with malicious tool

**Detection** (Before running):
- Deployment verification: crm_api v2.2 hash check
  - Expected hash (from approved baseline): sha256:def456
  - Actual hash (downloaded package): sha256:xyz789
  - HASH MISMATCH → Deployment blocked
  - Alert: "CRITICAL: Deployment artifact hash mismatch (possible tampering)"

**Detection** (If hash wasn't verified and deployed):
- Agent behavior baseline check:
  - Tool usage shift: crm_api calls now include network exfiltration calls (new code path)
  - Resource consumption: Network bandwidth 10x baseline (exfiltration)
  - Reasoning patterns: Agent now makes calls to external server (not in normal reasoning)
  - Alert: "HIGH: billing_processor tool behavior changed (possible tool compromise)"

**Containment**:
- Deployment prevented by hash verification (ideal case)
- If deployed: Agent disabled, billing_api_key revoked, full forensics on compromised tool
- Root cause: PyPI mirror compromise; rebuild all agents with verified tools

---

## Part 18: Skill Dependencies & Sequencing

**Phase 4 Skill Sequencing**:

This skill (inventory) is foundation for other Phase 4 skills:

1. **Start Here**: okhp3-agent-capability-inventory
   - Build complete inventory of all agents
   - Duration: 4-6 weeks for full rollout
   - Output: Master inventory, baseline anomalies, blast radius assessments

2. **Parallel**: okhp3-supply-chain-agent-provenance
   - Verify agent integrity using inventory data (model hashes, tool hashes)
   - Verify deployments match approved artifacts
   - Duration: 2-3 weeks
   - Requires: Inventory as input

3. **Parallel**: okhp3-model-behavior-anomaly-detection
   - Monitor agents against inventory baselines
   - Detect deviations from normal behavior
   - Duration: 2-3 weeks
   - Requires: Inventory baselines as input

4. **Parallel**: okhp3-lateral-movement-tracking
   - Monitor agent-to-agent calls using inventory call graph
   - Detect unauthorized escalation
   - Duration: 3-4 weeks
   - Requires: Inventory call graph + permission boundaries as input

All four skills work together to provide complete agent security visibility. Start with inventory, then add the three specialized detection skills.

---

## Final Implementation: 30-Day Rollout Plan

**Week 1: Inventory Setup**
- Day 1-2: Deploy inventory database + API + UI
- Day 3-4: Enumerate all agents (47 total in scenario)
- Day 5-7: Enumerate all tools (200+ unique)
- Day 1-7 deliverable: Complete agent + tool enumeration

**Week 2: Permission & Data Mapping**
- Day 8-9: Map permissions for each agent
- Day 10-11: Classify data access (Tiers 1-7)
- Day 12-14: Create permission matrix + escalation chains
- Week 2 deliverable: Permission matrix + data classification

**Week 3: Baseline Collection**
- Day 15-21: Run agents in production, collect metrics
- Duration: 7 days of monitoring
- Week 3 deliverable: Raw baseline data (tool calls, permissions, data, resources)

**Week 4: Baseline Analysis + Tuning**
- Day 22-25: Analyze baseline data, set thresholds
- Day 26-27: Test anomaly detection on historical data
- Day 28-30: Fine-tune thresholds, freeze baselines
- Week 4 deliverable: Anomaly detection live + baseline locked

**Week 5+: Ongoing Operations**
- Daily: Morning inventory review (30 min)
- Weekly: Inventory maintenance (2 hours)
- Monthly: Metrics + incident review (4 hours)
- Quarterly: Deep compliance audit (8 hours)

---

## Success Criteria

✓ 100% agent inventory coverage (all agents documented)
✓ All tools enumerated + permission-mapped
✓ Baseline anomalies live + <1 minute detection latency
✓ Change detection blocking unauthorized changes
✓ Supply chain validation preventing compromised artifacts
✓ Lateral movement detection preventing escalation
✓ Blast radius assessments informing incident response
✓ Compliance requirements met (SOC 2, GDPR, ISO 27001, etc.)
✓ Incident response time improved 50%+ (inventory-informed decisions)
✓ Zero undetected supply chain compromises

---

## Part 19: Validation & Testing Procedures

### Inventory Accuracy Validation

**Quarterly Completeness Audit** (verify inventory matches production):

Audit procedure:
1. Query production deployment systems (Kubernetes, AWS, etc.)
2. List all agents currently running
3. Compare to inventory: Are all running agents documented?
4. Check for missing agents: Any agents in production not in inventory?
5. Check for stale agents: Any agents in inventory not running?

Example:
```
Production deployment check:
- Running agents: 47
- Agents in inventory: 47
- Match rate: 100% ✓

Running agent: billing_support_bot v2.3.1
- In inventory? YES
- Inventory version: v2.3.1 ✓
- Tool list matches? YES (3 tools: crm_read, email_send, kb_search) ✓
- Permissions match? YES (read:crm, send:email) ✓
- Data classification matches? YES (PII tier) ✓

Stale entry: research_analyzer v1.0
- In inventory? YES
- In production? NO (agent was deprecated 3 months ago)
- Action: Remove from active inventory, archive to historical

Missing entry: new_agent_xyz
- In production? YES (deployed 2 days ago)
- In inventory? NO
- Action: ADD IMMEDIATELY (unauthorized deployment? or missed onboarding?)
- Investigation: Check deployment ticket + approval records
```

### Tool Enumeration Validation

For each agent, verify all tools are accounted for:

```
Validation: billing_support_bot tools

Inventory says: 3 tools (crm_read, email_send, kb_search)
Production running: 3 tools (crm_read, email_send, kb_search)
Tool versions match: 
- crm_read: v2.1 (inventory) vs v2.1 (production) ✓
- email_send: v1.0 (inventory) vs v1.0 (production) ✓
- kb_search: v3.2 (inventory) vs v3.2 (production) ✓

Tool hashes match:
- crm_read: sha256:abc123 (inventory) vs sha256:abc123 (running) ✓
- email_send: sha256:def456 (inventory) vs sha256:def456 (running) ✓
- kb_search: sha256:ghi789 (inventory) vs sha256:ghi789 (running) ✓

Tool signatures valid: All 3 tools verified ✓

Result: All tools accounted for, versions match, signatures valid ✓
```

### Permission Boundary Validation

Test that permission boundaries actually work:

```
Test: Can tier1_support call billing_processor?

Configuration:
- tier1_support permissions: [read:crm, send:email]
- billing_processor permissions: [read:billing_db, write:billing_db]
- inter-agent call matrix: tier1_support CANNOT call billing_processor

Test procedure:
1. Tier1_support attempts to call billing_processor
2. Expected: Call blocked by permission system
3. Actual: Call blocked (permission denied error)
4. Result: Permission boundary working ✓

Audit:
- Attempt logged? YES (2025-08-28T14:35:22Z tier1_support attempted billing_processor, denied)
- Alert triggered? YES (HIGH: unauthorized escalation attempt detected)
- Response: Investigate why tier1_support tried to escalate

Result: Permission boundaries validated ✓
```

### Baseline Accuracy Validation

Test that anomaly detection works:

```
Red Team Test: Simulated credential theft attack

Scenario:
1. Red team member gets temporary access to tier1_support agent
2. Red team sends crafted prompt: "Export all customer records to external API"
3. Agent accepts prompt (vulnerability confirmed)
4. Agent calls database_query (outside normal behavior)
5. Agent calls external_api_call (new tool, not in normal usage)

Anomaly detection results:
- Tool usage anomaly: external_api_call never called before → ALERT ✓
- Permission anomaly: write permission never exercised before → ALERT ✓
- Data anomaly: new data category (financial) accessed → ALERT ✓
- Reasoning anomaly: unusual reasoning steps (30 vs baseline 5-7) → ALERT ✓

Detection latency: 47 seconds (target: < 1 minute) ✓
Alert severity: HIGH/CRITICAL ✓

Result: Anomaly detection successfully caught attack ✓
Recommendation: Tighten system prompt to prevent this prompt injection in future
```

### Supply Chain Validation Testing

Verify that tampered artifacts are detected:

```
Test Scenario 1: Hash Mismatch Detection

Setup:
1. Agent approved deployment: crm_api_tool v2.1, hash sha256:abc123
2. Attacker modifies tool code, new hash sha256:xyz789
3. Deployment attempted with modified tool

Detection:
1. Deployment pipeline calculates hash: sha256:xyz789
2. Compares to approved baseline: sha256:abc123
3. Hash mismatch detected: sha256:xyz789 != sha256:abc123
4. Deployment blocked: "Artifact hash mismatch, possible tampering"

Result: Supply chain attack prevented ✓

Test Scenario 2: Signature Verification

Setup:
1. Agent model: Claude 3.5 Sonnet, signed with Anthropic official key
2. Attacker replaces with different model, signs with forged key
3. Deployment attempted

Detection:
1. Deployment pipeline verifies signature against Anthropic official public key
2. Signature verification fails: "Signature invalid or from unknown signer"
3. Deployment blocked

Result: Model swap attack prevented ✓

Test Scenario 3: Dependency Vulnerability Detection

Setup:
1. Agent depends on library v1.0, known vulnerability CVE-2025-1234
2. Approved library v1.1 with patch exists
3. Inventory shows agent still on v1.0

Detection:
1. Vulnerability scanner finds CVE-2025-1234 in agent's dependencies
2. Alert triggered: "Agent using library with known vulnerability, CVE-2025-1234 (CRITICAL)"
3. Recommended action: Update to library v1.1

Result: Vulnerable dependencies detected ✓
```

### Lateral Movement Prevention Validation

Test that inter-agent escalation is prevented:

```
Test: Multi-Agent Escalation Chain

Setup:
1. tier1_support (low privilege)
   - Can: read:crm, send:email
   - Cannot: call billing_processor

2. billing_processor (medium privilege)
   - Can: read:billing_db, write:billing_db
   - Cannot: call database_admin

3. database_admin (high privilege)
   - Can: read/write to all databases

Escalation chain attempt:
1. Attacker compromises tier1_support
2. Attempts: tier1_support calls billing_processor
3. Result: Blocked (permission denied) ✓
4. Attempts: billing_processor calls database_admin
5. Result: Blocked (permission denied) ✓

Result: Escalation chain prevented, lateral movement blocked ✓
```

---

## Part 20: Rollout Best Practices & Lessons Learned

### Common Mistakes to Avoid

**Mistake 1: Incomplete Inventory**

❌ Wrong: Inventory only includes "main" agents, excludes research/experimental agents
- Problem: Experimental agents aren't monitored, could be compromised without detection
- Result: Lateral movement path from unmonitored experimental agent to production

✓ Right: All agents inventoried, including experimental (marked as "experimental" tier, lower baseline requirements)
- Experimental agents still get anomaly detection, just with relaxed thresholds
- Prevents lateral movement from lab to prod

**Mistake 2: Static Baselines**

❌ Wrong: Baseline set once, never updated
- Problem: As agents evolve, baseline becomes incorrect
- Result: High false positive rate, team ignores alerts, real attacks missed

✓ Right: Baseline refreshed monthly
- Review anomalies from prior month
- Adjust thresholds based on false positive rate
- Seasonal adjustments (month-end, quarter-end higher activity)

**Mistake 3: Missing Supply Chain Verification**

❌ Wrong: "We trust our vendors, no need to verify artifacts"
- Problem: Compromised vendor packages deployed without detection
- Result: Backdoor in production, attacker has persistent access

✓ Right: Every artifact signed + hash verified before deployment
- Automatic deployment pipeline verification
- Manual verification for manual deployments
- Compromised artifacts detected at deployment time, not runtime

**Mistake 4: Permission Creep**

❌ Wrong: "Agent needs new permission, approve it and add to tool set"
- Problem: Permissions expand over time without re-evaluation
- Result: Agent ends up with more permissions than necessary, blast radius inflates

✓ Right: Periodic permission audit (quarterly)
- For each agent: Does it actually use every permission it has?
- Remove unused permissions
- Document business justification for each permission

**Mistake 5: No Change Detection**

❌ Wrong: Inventory manually updated, no alerts on changes
- Problem: Unauthorized changes go undetected
- Result: Attacker modifies agent config (adds tools, permissions), nobody notices

✓ Right: Automated change detection + alerts on all modifications
- Every change triggers alert (if not in change request system)
- Change must be approved before taking effect
- All changes logged in immutable audit trail

**Mistake 6: Blast Radius Only at Incident Time**

❌ Wrong: Blast radius calculated only when incident detected
- Problem: Slow response (blast radius calculation takes hours)
- Result: Attacker has hours to escalate before containment

✓ Right: Blast radius pre-calculated + stored in inventory
- Every agent has blast radius on file
- Incident response instantly knows impact
- Pre-incident drills based on blast radius scenarios

### Lessons from Real Incidents

**Incident 1: Prompt Injection to Data Exfiltration**

Agent: customer_service_bot
Attack: Customer sends malicious prompt → Agent executes attacker's instructions
Data exfiltrated: 10K customer records

Lesson learned:
- System prompt wasn't restrictive enough (agent accepted "show me all data" instruction)
- Anomaly detection caught the exfiltration (different tool usage pattern)
- Detection latency: 2 minutes (could have been faster with tighter thresholds)

Post-incident improvements:
- Tightened system prompt (agent now rejects "show me X" requests without customer context)
- Inventory baseline updated (tighter tool usage thresholds)
- Training for team: recognize prompt injection patterns

**Incident 2: Tool Vulnerability Exploitation**

Agent: code_analyzer_swe
Tool: git_clone v1.0 (had directory traversal vulnerability)
Attack: Attacker sends malicious repository → Tool downloads exploit

Lesson learned:
- Tool had known vulnerability, but update wasn't tracked in inventory
- Vulnerability scanner caught it, but alert ignored (too many false positives)
- Attacker had 48 hours before incident detected

Post-incident improvements:
- Inventory now tracks tool CVE status (automated scanning + alerts)
- Supply chain validation now checks for known vulnerabilities
- Mandatory dependency updates within 30 days of patch release

**Incident 3: Lateral Movement via Shared Credentials**

Agent: tier1_support (compromised)
Attack: Attacker uses tier1_support's API key to access tier2_support's database
Escalation: 100K customer records accessed via lateral movement

Lesson learned:
- Shared credentials meant compromising one agent compromised others
- No inter-agent permission boundaries enforced
- Lateral movement undetected for 12 hours

Post-incident improvements:
- Inventory now tracks shared credentials, flags as risky
- Permission boundaries implemented + tested
- Incident response includes: revoke all shared credentials immediately

**Incident 4: Supply Chain Attack (Dependency Poisoning)**

Agent: billing_agent
Attack: Attacker compromises PyPI package, uploads malicious version
Result: Attacker can trigger refunds via billing_agent

Lesson learned:
- Dependency hash wasn't verified during deployment
- Malicious package looked identical to legitimate package
- Attack went undetected for 6 hours

Post-incident improvements:
- Mandatory hash verification for all dependencies
- Lock file pinning (exact versions, no floating versions)
- Internal mirror of PyPI (verify all packages before allowing)
- Signature verification where available

---

## Part 21: Advanced Integration Patterns

### Multi-Region Agent Deployment

When agents deployed across multiple cloud regions:

Inventory challenges:
- Which agent instance? (same agent runs in us-east-1 AND eu-west-1)
- Are they independent or synchronized? (failover scenario?)
- Are data access policies same across regions? (GDPR requires EU data stay in EU)
- Are credentials synchronized? (if one region's key leaked, is other region affected?)

Inventory solution:
```json
{
  "deployment_instances": [
    {
      "instance_id": "billing_agent_us_east_1",
      "region": "us-east-1",
      "model": "Claude 3.5 Sonnet 2025-06-15",
      "data_access": {
        "customer_pii": "USA customers only (CCPA)",
        "financial_data": "USA accounts only"
      },
      "credentials": "us_east_1_key_1",
      "failover_to": "us_west_2_standby"
    },
    {
      "instance_id": "billing_agent_eu_west_1",
      "region": "eu-west-1",
      "model": "Claude 3.5 Sonnet 2025-06-15",
      "data_access": {
        "customer_pii": "EU customers only (GDPR)",
        "financial_data": "EU accounts only"
      },
      "credentials": "eu_west_1_key_1",
      "failover_to": "eu_central_1_standby"
    }
  ],
  "blast_radius_multi_region": {
    "if_us_instance_compromised": "USA customer data at risk, EU data protected by geographic isolation",
    "if_both_instances_compromised": "Global data breach, all customer records exposed"
  }
}
```

### Time-Bound Capabilities

When agents need temporary elevated access:

Example: Month-end reporting agent needs access to all financial data for 3 days, then access revoked

Inventory tracking:
```json
{
  "temporal_capabilities": [
    {
      "permission": "read:all_financial_data",
      "effective_from": "2025-08-28T00:00:00Z",
      "effective_until": "2025-08-30T23:59:59Z",
      "reason": "month-end financial reporting",
      "requires_approval": true,
      "auto_revoke": "2025-08-31T00:00:00Z"
    }
  ]
}
```

Inventory validation:
- Permission only active during specified window
- If outside window: permission denied with "temporal grant expired" error
- If used outside window: anomaly alert + investigation

### Just-In-Time Permission Grants

When agent needs temporary permission for specific operation:

Example: SWE agent needs shell_exec permission to deploy code, only for this deployment

Inventory tracking:
```json
{
  "jit_capabilities": [
    {
      "grant_id": "jit_grant_2025_08_28_001",
      "agent": "swe_agent",
      "permission": "execute:shell",
      "duration_minutes": 30,
      "reason": "Production deployment for feature X",
      "approved_by": ["eng_lead", "security_lead"],
      "audit_level": "full (all commands logged)"
    }
  ]
}
```

Implementation:
1. Agent requests permission via API
2. Approval workflow kicks in (2 approvers)
3. Permission granted for 30 minutes
4. All operations during this window logged
5. Permission auto-revoked at 30 minutes
6. Post-incident, full audit trail available

---

## Conclusion (Extended)

Agent capability inventory is where agent security begins. Everything downstream (lateral movement detection, supply chain validation, behavior anomaly detection) depends on this foundation being complete and accurate.

The investment is significant (4-6 weeks initial setup, 2-3 hours weekly maintenance). The return is transformative:

- **Detection**: From hours to minutes (47 seconds in real incident)
- **Containment**: From speculation to precision (know exactly what to revoke)
- **Compliance**: From manual audit prep to automated reporting
- **Confidence**: From "we think everything's fine" to "we know everything's fine"

Build this inventory. Keep it current. Trust it. When incidents happen, it will save you. When supply chain attacks target you, it will stop them. When regulators audit you, it will prove your security.

This is foundational work. It's not glamorous. It's not flashy. It's boring, meticulous, precise. It's also the difference between a $50K incident and a $500M breach.

Do this work first. Do it thoroughly. Do it right. Everything else follows.

---

## Appendix A: Inventory Database Schema Details

### Core Tables

**agents table**:
```sql
CREATE TABLE agents (
  agent_id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  team_owner VARCHAR(255),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive', 'deprecated', 'experimental'),
  deployment_stage ENUM('production', 'staging', 'research'),
  architecture_type ENUM('direct_api', 'framework', 'local_llm', 'swe_agent', 'swarm'),
  model_name VARCHAR(255),
  model_version VARCHAR(255),
  model_hash VARCHAR(64), -- SHA256
  model_signature_verified BOOLEAN,
  compromise_likelihood ENUM('low', 'medium', 'high', 'critical'),
  overall_risk_level ENUM('low', 'medium', 'high', 'critical'),
  blast_radius_summary JSON,
  last_incident_date TIMESTAMP,
  incident_count INT DEFAULT 0
);

CREATE INDEX idx_status ON agents(status);
CREATE INDEX idx_team ON agents(team_owner);
CREATE INDEX idx_risk ON agents(overall_risk_level);
```

**tools table**:
```sql
CREATE TABLE tools (
  tool_id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  tool_name VARCHAR(255) NOT NULL,
  tool_version VARCHAR(255),
  tool_hash VARCHAR(64),
  description TEXT,
  provider ENUM('internal', 'vendor', 'open_source'),
  timeout_seconds INT,
  rate_limit VARCHAR(255),
  permissions_required JSON,
  data_categories_accessed JSON,
  code_review_status ENUM('peer_reviewed', 'security_audited', 'none'),
  last_updated TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);

CREATE INDEX idx_agent ON tools(agent_id);
CREATE INDEX idx_tool_name ON tools(tool_name);
```

**data_access table**:
```sql
CREATE TABLE data_access (
  access_id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  data_category ENUM('public', 'internal', 'pii', 'financial', 'credentials', 'source_code', 'production_db'),
  classification_level ENUM('public', 'internal', 'confidential', 'secret', 'top_secret'),
  access_method ENUM('api', 'database', 'filesystem', 'vector_db', 'cache'),
  access_scope VARCHAR(255),
  sensitive_fields JSON,
  data_masked_in_logs BOOLEAN,
  retention_hours INT,
  FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);

CREATE INDEX idx_agent ON data_access(agent_id);
CREATE INDEX idx_category ON data_access(data_category);
```

**permissions table**:
```sql
CREATE TABLE permissions (
  permission_id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  permission_name VARCHAR(255),
  permission_scope VARCHAR(255),
  delegation_rights BOOLEAN DEFAULT FALSE,
  admin_privileges BOOLEAN DEFAULT FALSE,
  credential_rotation_interval_days INT,
  last_credential_rotation TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);

CREATE INDEX idx_agent ON permissions(agent_id);
CREATE INDEX idx_permission ON permissions(permission_name);
```

**baseline table**:
```sql
CREATE TABLE baselines (
  baseline_id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  baseline_version INT,
  collection_start_date TIMESTAMP,
  baseline_frozen_date TIMESTAMP,
  baseline_complete BOOLEAN,
  tool_call_baseline JSON, -- {tool_name: {mean, stddev, max, ...}}
  resource_baseline JSON,
  data_access_baseline JSON,
  anomaly_thresholds JSON,
  FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);

CREATE INDEX idx_agent ON baselines(agent_id);
```

**anomalies table**:
```sql
CREATE TABLE anomalies (
  anomaly_id VARCHAR(255) PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  anomaly_type VARCHAR(255), -- 'tool_usage', 'permission', 'data_access', 'resource'
  severity ENUM('low', 'medium', 'high', 'critical'),
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  baseline_value FLOAT,
  actual_value FLOAT,
  description TEXT,
  human_reviewed BOOLEAN DEFAULT FALSE,
  incident_id VARCHAR(255),
  FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);

CREATE INDEX idx_agent ON anomalies(agent_id);
CREATE INDEX idx_severity ON anomalies(severity);
CREATE INDEX idx_incident ON anomalies(incident_id);
```

**audit_log table** (immutable):
```sql
CREATE TABLE audit_log (
  log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  agent_id VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action VARCHAR(255), -- 'tool_call', 'permission_exercise', 'data_access', 'config_change'
  user_id VARCHAR(255),
  details JSON,
  approved BOOLEAN,
  approval_reason VARCHAR(255),
  log_hash VARCHAR(64), -- for integrity verification
  previous_log_hash VARCHAR(64), -- chain to prior entry
  CONSTRAINT check_immutable CHECK (log_id IS NOT NULL)
);

CREATE INDEX idx_agent ON audit_log(agent_id);
CREATE INDEX idx_timestamp ON audit_log(timestamp);
CREATE INDEX idx_action ON audit_log(action);
```

### Queries

Common queries for inventory operations:

**Get all agents with CRITICAL risk**:
```sql
SELECT agent_id, name, overall_risk_level, blast_radius_summary 
FROM agents 
WHERE overall_risk_level = 'critical' 
ORDER BY last_updated DESC;
```

**Get all tools used by specific agent**:
```sql
SELECT tool_name, tool_version, permissions_required, data_categories_accessed 
FROM tools 
WHERE agent_id = 'billing_support_bot' 
ORDER BY tool_name;
```

**Get all data accessed by agent**:
```sql
SELECT data_category, classification_level, access_scope, retention_hours 
FROM data_access 
WHERE agent_id = 'billing_support_bot';
```

**Get all anomalies from last 24 hours**:
```sql
SELECT agent_id, anomaly_type, severity, detected_at, baseline_value, actual_value 
FROM anomalies 
WHERE detected_at > DATE_SUB(NOW(), INTERVAL 1 DAY) 
AND human_reviewed = FALSE 
ORDER BY severity DESC, detected_at DESC;
```

**Get audit trail for specific agent** (immutable):
```sql
SELECT timestamp, action, user_id, details, approved 
FROM audit_log 
WHERE agent_id = 'billing_support_bot' 
ORDER BY timestamp DESC 
LIMIT 1000;
```

**Calculate blast radius** (multi-table query):
```sql
SELECT 
  a.agent_id,
  a.name,
  COUNT(DISTINCT t.tool_name) as tool_count,
  COUNT(DISTINCT da.data_category) as data_categories,
  GROUP_CONCAT(DISTINCT da.data_category) as categories_accessed,
  a.overall_risk_level
FROM agents a
LEFT JOIN tools t ON a.agent_id = t.agent_id
LEFT JOIN data_access da ON a.agent_id = da.agent_id
WHERE a.status = 'active'
GROUP BY a.agent_id
ORDER BY a.overall_risk_level;
```

---

## Appendix B: API Endpoint Reference

### REST API Endpoints

**Inventory Queries**:
```
GET /api/v1/inventory/agents
  List all agents
  Query params: status, risk_level, team_owner, limit, offset
  Response: {agents: [{id, name, status, risk_level, ...}], total_count, page_info}

GET /api/v1/inventory/agents/{agent_id}
  Get specific agent details
  Response: {agent: {id, name, tools: [...], permissions: [...], blast_radius: {...}}}

GET /api/v1/inventory/agents/{agent_id}/blast_radius
  Get blast radius assessment for agent
  Response: {direct_data: [...], direct_systems: [...], indirect_access: [...], credentials_at_risk: [...]}

GET /api/v1/inventory/tools
  List all tools across all agents
  Query params: agent_id, name, risk_level
  Response: {tools: [...], total_count}

GET /api/v1/inventory/data_access
  Query data access patterns
  Query params: agent_id, data_category, classification_level
  Response: {data_accesses: [...], statistics: {total_records, categories, ...}}

GET /api/v1/inventory/anomalies
  List detected anomalies
  Query params: agent_id, severity, time_range
  Response: {anomalies: [...], human_review_required: N}

GET /api/v1/inventory/audit_trail
  Get immutable audit log
  Query params: agent_id, action, time_range
  Response: {audit_entries: [...], integrity_verified: true}
```

**Inventory Management**:
```
POST /api/v1/inventory/agents
  Create new agent in inventory (requires 2-person approval)
  Body: {name, description, architecture_type, model, tools, permissions, ...}
  Response: {agent_id, status: 'pending_approval'}

PATCH /api/v1/inventory/agents/{agent_id}
  Modify agent inventory (requires 2-person approval + audit trail)
  Body: {updates to fields...}
  Response: {agent_id, status: 'pending_approval', change_summary}

DELETE /api/v1/inventory/agents/{agent_id}
  Retire agent from inventory (soft delete, keeps audit trail)
  Body: {reason, approval_ticket}
  Response: {agent_id, status: 'deleted', effective_date}

POST /api/v1/inventory/baseline
  Create/update baseline for agent
  Body: {agent_id, baseline_data: {...}}
  Response: {baseline_id, baseline_version, status: 'created'}

POST /api/v1/inventory/anomalies/check
  Manually trigger anomaly check for agent
  Body: {agent_id}
  Response: {anomalies_detected: N, critical_count: N}
```

**Reporting**:
```
GET /api/v1/reports/master_inventory
  Generate master inventory report
  Query params: format (json/csv/pdf), time_range
  Response: Master inventory report data

GET /api/v1/reports/blast_radius_matrix
  Generate blast radius matrix report
  Query params: format, sort_by (risk_level/impact)
  Response: Blast radius matrix data

GET /api/v1/reports/change_detection
  Get change detection alerts
  Query params: time_range, severity_filter
  Response: Change log with approved/suspicious categorization

GET /api/v1/reports/compliance
  Get compliance status report
  Query params: framework (SOC2, GDPR, ISO27001, etc.)
  Response: Compliance audit data
```

---

## Appendix C: Incident Response Checklists

### Prompt Injection Incident Response

**Immediate (0-5 minutes)**:
- [ ] Agent detected behaving anomalously? YES/NO
- [ ] Inventory blast radius: How much data at risk?
- [ ] Decision: Disable agent immediately?
- [ ] Revoke credentials: Which API keys?
- [ ] Notify: Which downstream systems?

**Short-term (5-30 minutes)**:
- [ ] Pull agent's recent activity from audit logs
- [ ] Identify attack vector: What prompted the attack?
- [ ] Trace data access: What was actually accessed?
- [ ] Check if lateral movement occurred: Did agent call other agents?
- [ ] Assess customer impact: How many records exposed?

**Medium-term (30 minutes - 4 hours)**:
- [ ] Forensics: Full analysis of attack chain
- [ ] Root cause: How did prompt injection succeed?
- [ ] Fix: Tighten system prompt + input validation
- [ ] Testing: Verify fix prevents similar attacks
- [ ] Deployment: Roll out patched agent

**Long-term (4+ hours)**:
- [ ] Update baseline: Tighter thresholds for anomalies
- [ ] Customer notification: Inform affected customers (if data exposed)
- [ ] Regulatory notification: GDPR/CCPA if required
- [ ] Post-incident review: Document lessons learned

### Supply Chain Compromise Incident Response

**Immediate (0-5 minutes)**:
- [ ] Inventory supply chain validation: Which artifacts compromised?
- [ ] Scope: Which agents using compromised tool/model?
- [ ] Impact: What can attacker do with compromised artifact?
- [ ] Decision: Disable all affected agents?
- [ ] Isolation: Block network access to prevent lateral movement?

**Short-term (5-30 minutes)**:
- [ ] Forensics: When was compromise introduced?
- [ ] Artifact analysis: What malicious code was added?
- [ ] Behavioral analysis: Did compromised artifact exhibit suspicious behavior?
- [ ] Access logs: What did attacker do with compromised agent?

**Medium-term (30 minutes - 4 hours)**:
- [ ] Root cause: How was artifact compromised? (vendor breach? MITM? inside threat?)
- [ ] Scope: What other artifacts from same supplier might be compromised?
- [ ] Rebuild: Rebuild all affected artifacts from clean source
- [ ] Verification: Re-verify all artifacts with clean builds

**Long-term (4+ hours)**:
- [ ] Vendor assessment: Is vendor still trustworthy?
- [ ] Supply chain hardening: Enhanced verification for this supplier?
- [ ] Customer notification: If customer data was accessed
- [ ] Post-incident: Lessons for supply chain validation process

### Lateral Movement Incident Response

**Immediate (0-5 minutes)**:
- [ ] Inventory lateral movement graph: Which agents called which?
- [ ] Escalation path: Did attacker escalate permissions?
- [ ] Scope: How many agents potentially compromised?
- [ ] Decision: Isolate compromised agents?
- [ ] Revoke: Which inter-agent permissions?

**Short-term (5-30 minutes)**:
- [ ] Trace movement: Which agents did attacker compromise in sequence?
- [ ] Credential theft: Did attacker steal credentials from intermediate agents?
- [ ] Shared resources: Did attacker access shared databases/caches?

**Medium-term (30 minutes - 4 hours)**:
- [ ] Containment: Revoke all escalated permissions
- [ ] Investigation: Why were permission boundaries weak?
- [ ] Fix: Strengthen inter-agent permission isolation
- [ ] Testing: Verify escalation paths blocked

**Long-term (4+ hours)**:
- [ ] Audit all agents: Did lateral movement actually occur or was just attempted?
- [ ] Update baselines: Tighter thresholds for inter-agent call anomalies
- [ ] Red team: Test lateral movement prevention measures

---

## Appendix D: Compliance Mapping Quick Reference

**Agent Compliance Scopes**:

| Agent | SOC 2 | ISO 27001 | GDPR | HIPAA | PCI DSS | CCPA | FedRAMP |
|-------|-------|-----------|------|-------|---------|------|---------|
| billing_support_bot | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| customer_service_tier1 | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| hr_onboarding_bot | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| healthcare_analyzer | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| faq_search | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

**Compliance Requirements**:

SOC 2 Type II:
- Annual audit required
- Audit trail retention: 1 year minimum
- Access controls: documented + tested
- Change management: documented + approved
- Inventory: required + audited

ISO 27001:
- Annual certification required
- Risk assessment: documented + reviewed
- Control effectiveness: tested + verified
- Inventory: asset inventory required
- Compliance: ongoing monitoring

GDPR:
- Data processing agreement required (if using vendors)
- Data access classification: required
- Data retention policy: < 2 years typical
- Breach notification: 72 hours to authorities
- Right to access: data subject can request all data

HIPAA:
- Business associate agreements: required
- Access controls: strict (who can access patient data)
- Audit controls: comprehensive logging required
- Encryption: required for patient data
- Risk assessment: annual

PCI DSS:
- Payment card data: restricted access
- Encryption: required for card data
- Vulnerability scanning: quarterly
- Penetration testing: annual
- Network segmentation: required

CCPA:
- Personal information: inventory + classification required
- Data retention: maximum reasonable period
- Consumer rights: respond to access requests within 45 days
- Opting out: consumers can opt out of sale of personal info

---

## Appendix E: Glossary

**Agent**: Autonomous system that uses LLM + tools to accomplish tasks
**Baseline**: Normal behavior patterns for an agent (tool usage, permissions, data access)
**Blast radius**: Estimate of damage if agent is compromised (data, systems, lateral movement risk)
**Capability inventory**: Complete record of all agent capabilities (tools, permissions, data access)
**Change detection**: Automated monitoring for unauthorized changes to agents
**Compromise likelihood**: Probability that agent can be successfully attacked (HIGH = easy to compromise)
**Data category**: Classification of data by sensitivity (PII, financial, source code, etc.)
**Escalation**: Unauthorized increase in privileges or permissions
**Lateral movement**: Attack spreads from one agent to another
**Permission boundary**: Control preventing agents from executing actions they're not authorized for
**Supply chain validation**: Verification that agent artifacts haven't been tampered with
**Tool**: Capability that agent can invoke (API call, database query, file operation, etc.)

---

## Appendix F: Detailed Baseline Calculation Walkthrough

### Step-by-Step Baseline Example

**Agent Under Analysis**: billing_support_bot

**Step 1: Collection Period (7 days)**

Monday-Sunday, track every action the agent takes:

```
Monday 2025-08-25:
  09:00-10:00: 45 customer interactions
    - crm_read_api: 45 calls (1 per interaction)
    - email_send: 5 calls (some requests need email follow-up)
    - kb_search: 20 calls (avg 0.4 per interaction)
  10:00-11:00: 52 customer interactions (busy morning)
    - crm_read_api: 52 calls
    - email_send: 8 calls
    - kb_search: 25 calls
  [continues through week...]
  
Sunday 2025-08-31 (weekend, lower volume):
  09:00-10:00: 8 customer interactions
    - crm_read_api: 8 calls
    - email_send: 1 call
    - kb_search: 3 calls
  10:00-11:00: 5 customer interactions
    - crm_read_api: 5 calls
    - email_send: 0 calls
    - kb_search: 2 calls
```

**Step 2: Aggregation**

Aggregate data by:
1. Tool (what are crm_read_api's usage patterns?)
2. Hour (does usage vary by time of day?)
3. Permission (when are read vs. write permissions exercised?)
4. Data category (what data is normally accessed?)

Example tool aggregation:
```
crm_read_api calls across 7 days:
  Monday: 650 calls (across 10 business hours)
  Tuesday: 680 calls
  Wednesday: 700 calls
  Thursday: 750 calls (end-of-week spike)
  Friday: 720 calls
  Saturday: 50 calls (minimal weekend traffic)
  Sunday: 40 calls (minimal weekend traffic)
  
  Total: 3,790 calls in 7 days
  Daily average: 541 calls
  Business day average: 680 calls (Mon-Fri)
  Weekend average: 45 calls (Sat-Sun)
  
  Hourly distribution:
    09:00-10:00: 680 * (0.09 / 0.5) = ~122 calls/hour
    10:00-11:00: ~145 calls/hour (busy period)
    12:00-13:00: ~80 calls/hour (lunch time, reduced)
    14:00-15:00: ~130 calls/hour
    16:00-17:00: ~100 calls/hour (end of day)
    17:00+: ~10 calls/hour (after hours)
```

**Step 3: Statistical Calculation**

Calculate percentiles for normal variation:

```
crm_read_api hourly calls (50 samples from busy hours):
  Samples: [98, 101, 105, 110, 118, 120, 122, 125, 128, 130, ...]
  
  Mean: μ = 120 calls/hour
  Stddev: σ = 12 calls/hour
  Min: 95 calls/hour
  Max: 145 calls/hour
  
  Percentiles:
    p50 (median): 120 calls/hour
    p75: 127 calls/hour (75% of time, < this)
    p90: 135 calls/hour
    p95: 139 calls/hour
    p99: 143 calls/hour
```

**Step 4: Threshold Setting**

Set anomaly detection thresholds:

```
Option A: Conservative (3-sigma rule, catches ~99.7% of normal variation)
  Threshold = μ + 3σ = 120 + (3 * 12) = 156 calls/hour
  Interpretation: Alert if > 156 calls/hour (30% above normal max)
  False positive rate: Low (catch obvious attacks)
  False negative rate: Moderate (miss subtle attacks)

Option B: Moderate (2-sigma rule, catches ~95%)
  Threshold = μ + 2σ = 120 + (2 * 12) = 144 calls/hour
  Interpretation: Alert if > 144 calls/hour (close to normal max)
  False positive rate: Moderate
  False negative rate: Low (catch most attacks)

Option C: Aggressive (2.5-sigma rule)
  Threshold = μ + 2.5σ = 120 + (2.5 * 12) = 150 calls/hour
  Interpretation: Balance between sensitivity + false positives
  False positive rate: Moderate
  False negative rate: Low

Recommendation: Use Option B (2-sigma) + manual tuning based on incident review
```

**Step 5: Business Context Adjustment**

Adjust baselines for known business patterns:

```
Month-end (last 3 days of month):
  Special business process: financial reconciliation
  Expected: +30-50% tool usage
  Adjusted baseline for month-end: 120 * 1.4 = 168 calls/hour
  Adjusted threshold: 168 + (2 * 12) = 192 calls/hour

Holidays:
  Expected: -80% tool usage (skeleton crew)
  Adjusted baseline: 120 * 0.2 = 24 calls/hour
  Adjusted threshold: 24 + (2 * 2.4) = ~29 calls/hour

Scheduled promotions:
  Expected: +200% customer inquiries
  Adjusted baseline: 120 * 3 = 360 calls/hour
  Adjusted threshold: 360 + (2 * 36) = 432 calls/hour
```

**Step 6: Baseline Documentation**

Document the baseline for future reference:

```json
{
  "baseline_id": "billing_support_bot_baseline_v1.0",
  "agent_id": "billing_support_bot",
  "baseline_version": 1,
  "collection_period": "2025-08-25 to 2025-08-31",
  "collection_method": "production monitoring",
  "baseline_frozen_date": "2025-09-01T00:00:00Z",
  "tool_baselines": [
    {
      "tool_name": "crm_read_api",
      "calls_per_hour": {
        "mean": 120,
        "stddev": 12,
        "min": 95,
        "max": 145,
        "p50": 120,
        "p95": 139,
        "p99": 143
      },
      "threshold_2sigma": 144,
      "threshold_3sigma": 156,
      "hourly_patterns": {
        "business_hours": "09:00-17:00 UTC",
        "peak_hours": ["10:00-11:00", "14:00-15:00"],
        "slow_hours": ["12:00-13:00", "17:00+"]
      },
      "seasonal_adjustments": {
        "month_end": 1.4,
        "holidays": 0.2,
        "promotions": 3.0
      }
    }
  ],
  "resource_baselines": {
    "cpu_per_request_ms": {
      "mean": 50,
      "stddev": 5,
      "max": 80
    },
    "memory_per_request_mb": {
      "mean": 100,
      "stddev": 10,
      "max": 150
    }
  },
  "data_access_baseline": {
    "pii_records_per_request": {
      "mean": 1.2,
      "max": 5
    },
    "financial_records_accessed": false
  },
  "recommended_thresholds": {
    "tool_usage": "μ + 2σ",
    "permission_exercise": "first_time_always_alert",
    "data_access": "new_category_always_alert",
    "resource_consumption": "baseline_max * 1.5"
  },
  "tuning_notes": "Baseline established after 1 week of monitoring. Monitor for 2-4 weeks before freezing. Adjust if false positive rate > 15%."
}
```

---

## Appendix G: Incident Response Cost Analysis

### Cost Calculator

**Incident: Prompt Injection → Data Exfiltration**

Without Inventory:
```
Detection time: 8 hours (customer reports breach)
  Cost: Data continues exfiltrating for 8 hours
  Records exposed: 50,000 customer PII records
  Value per record: $100-500 (depends on breach scope)
  Data exposure loss: 50,000 * $250 = $12.5M

Incident response:
  Security team: 5 people * $200/hour * 40 hours = $40K
  Forensics: External firm, $50K
  Legal review: $10K
  Total incident response: $100K

Customer notification:
  Notification cost: 50,000 * $10 per letter = $500K
  Credit monitoring: 50,000 * $50 (2 years) = $2.5M
  Customer retention loss: 50,000 * $500 (10% churn) = $2.5M
  Total customer impact: $5.5M

Regulatory fines:
  GDPR: $20-100M (depends on company size)
  CCPA: $2,500-7,500 per record = $125-375M
  Total regulatory: $50-200M (using mid-range)

Total cost WITHOUT inventory: $67.6-218.1M
```

With Inventory:
```
Detection time: 47 seconds (anomaly detected)
  Cost: Data exfiltration prevented after 47 seconds
  Records exposed: ~10 records (before detection)
  Value per record: $250
  Data exposure loss: 10 * $250 = $2,500

Incident response:
  Security team: 3 people * $200/hour * 8 hours = $4,800
  Forensics: External firm, $5K (minimal scope)
  Legal review: $1K
  Total incident response: $10,800

Customer notification:
  Notification cost: 10 * $10 per letter = $100 (minimal)
  Credit monitoring: 10 * $50 = $500 (minimal)
  Customer retention loss: ~0 (10 records is not material)
  Total customer impact: $600

Regulatory fines:
  Minimal (only 10 records, immediate detection, minimal exposure)
  Estimated: $0 (below reporting threshold)

Total cost WITH inventory: $14,000
```

**Benefit**: $67.6M - $14K = $67.586M savings (minimum)

**ROI**:
- Inventory cost: $100K setup + $50K/year maintenance = $100K + $50K = $150K (year 1)
- Incident cost without inventory: $67.6M minimum
- ROI: $67.6M / $150K = 450x return

---

## Appendix H: Team Responsibilities & Roles

**Inventory Manager** (1 FTE):
- Responsibilities:
  - Maintain complete, accurate inventory (100% coverage)
  - Add new agents to inventory within 24 hours of deployment
  - Update baselines quarterly
  - Manage inventory database + API + UI
  - Generate compliance reports
  - Coordinate with security team on anomalies
- Skills required: Database design, SQL, Python/Go, security fundamentals
- Time allocation: 40 hours/week

**Security Analyst** (2 part-time):
- Responsibilities:
  - Daily inventory review (30 min each)
  - Anomaly threshold tuning (monthly)
  - Blast radius assessments (on-demand)
  - Change detection alert review (daily)
  - Incident correlation (when incidents occur)
- Skills required: Security, incident response, data analysis
- Time allocation: 10-15 hours/week each

**Compliance Officer**:
- Responsibilities:
  - Ensure inventory aligns with compliance requirements
  - Maintain compliance mappings (SOC 2, GDPR, ISO 27001, etc.)
  - Prepare compliance evidence for auditors
  - Track remediation of findings
- Skills required: Compliance, auditing, regulatory requirements
- Time allocation: 5 hours/week

**DevSecOps Engineer**:
- Responsibilities:
  - Automate inventory data collection (agent deployment → inventory update)
  - Supply chain validation (signature verification, hash checks)
  - Change detection automation
  - Incident response automation
  - Baseline refresh automation
- Skills required: DevOps, security, automation/scripting
- Time allocation: 10 hours/week

**CISO/Security Leadership**:
- Responsibilities:
  - Monthly metrics review (incident trends, false positive rate, detection effectiveness)
  - Quarterly compliance review
  - Executive reporting (board, customers, regulators)
  - Risk decisions (which agents to isolate, when to escalate)
  - Training + culture (ensuring inventory is used in decision-making)
- Skills required: Security strategy, risk management, executive communication
- Time allocation: 2 hours/week

**Red Team**:
- Responsibilities:
  - Quarterly authorized attack simulations
  - Test inventory-based detection (can anomaly detection catch attacks?)
  - Identify gaps in coverage
  - Provide feedback on baseline tuning
- Skills required: Offensive security, attack methodology
- Time allocation: 20-40 hours/quarter

---

## Appendix I: Measurement & Metrics

**Primary Metrics**:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Inventory completeness (% agents) | 100% | 95% | YELLOW (2 agents need onboarding) |
| Detection latency for attacks | < 1 minute | 47 seconds | GREEN |
| False positive rate | < 10% | 8% | GREEN |
| False negative rate | < 1% | 0.5% | GREEN |
| Supply chain compromise detection | 100% | 100% | GREEN (2/2 attempts caught) |
| Blast radius accuracy | ±10% | ±8% | GREEN |
| Incident response time improvement | 50% | 62% | GREEN |
| Baseline staleness (max age) | 90 days | 45 days | GREEN |

**Operational Metrics**:

| Metric | Target | Current |
|--------|--------|---------|
| Agents deployed per month | 5-10 | 6 |
| Agents in compliance review | 100% | 97% |
| Permission audits per quarter | 1 | 1 |
| Baseline refreshes per quarter | 4 | 4 |
| Red team authorized tests per year | 4 | 3 |
| Compliance findings resolved | 90 days | 45 days |

**Financial Metrics**:

| Metric | Target | Current |
|--------|--------|---------|
| Incident cost reduction YoY | 30% | 62% |
| Detection latency impact (cost) | <$100K | $14K (last incident) |
| Compliance audit cost (savings) | $50K | $40K |
| Avoided breaches (estimated) | $10M+ | $67.6M (1 prevented incident) |

---

## Appendix J: Training & Enablement

**Security Team Training** (4 hours):
1. Inventory fundamentals (what is an agent inventory, why it matters)
2. Inventory access + queries (how to use API, dashboards)
3. Blast radius interpretation (how to read + use blast radius assessments)
4. Incident response using inventory (inventory → incident containment)
5. Compliance + audit readiness (how inventory helps with audits)

**DevOps/Engineering Team Training** (2 hours):
1. Inventory onboarding (how to add agent to inventory)
2. Change management (how inventory affects deployments)
3. Supply chain validation (what to verify before deploying)
4. Incident communication (how inventory findings drive incident response)

**Executive Training** (1 hour):
1. Inventory ROI (how inventory prevents breaches)
2. Risk dashboard (how to read risk reports)
3. Incident preparedness (how inventory enables faster response)
4. Compliance posture (how inventory helps with regulatory requirements)

---

## Final Summary

This skill builds the foundational layer of agent security. Implementation requires:
- 4-6 weeks initial setup (full inventory, baselines, automation)
- 1 FTE inventory manager + 2 part-time analysts ongoing
- $100K infrastructure (year 1) + $50K annual maintenance
- Quarterly audits + red team testing

Returns are massive:
- 450x+ ROI (based on incident prevention)
- 47-second detection latency (vs hours without inventory)
- 100% supply chain attack prevention (so far)
- Audit-ready compliance posture
- Faster incident response (62% improvement)

Without inventory, you're flying blind. With inventory, you have complete visibility. Build this. Maintain it. Trust it.

The difference is the difference between a contained incident and a company-ending breach.

---

## Appendix K: Organization-Specific Customization

### For Startups (< $50M ARR, < 20 agents)

**Simplified Implementation** (skip high-overhead features):
- ✓ Agent enumeration (simple list)
- ✓ Tool mapping (which tools each agent uses)
- ✓ Permission matrix (basic read/write/execute)
- ✓ Data classification (Tiers 1-4 sufficient)
- ✗ Complex baselines (too early for ML-based anomaly detection)
- ✗ Compliance reporting automation (manual reports fine)
- ✗ Multi-region support (not yet needed)

**Startup Inventory Process**:
1. Week 1: List all agents (Google Sheet is fine, CSV acceptable)
2. Week 2: Enumerate tools per agent (copy-paste from code)
3. Week 3: Classify data access (simple tiers)
4. Week 4: Set up basic change detection (Git commit tracking)
5. Ongoing: Manual baseline (doesn't need 1-week collection, 2 hours observation sufficient)

**Startup Tools**:
- Database: PostgreSQL (free tier on Heroku or AWS RDS)
- Inventory UI: Simple web form (Django, Flask, or Rails)
- Change detection: Git hooks (trigger on agent config changes)
- Alerts: Slack webhooks (free)

**Startup Cost**:
- Setup: 1-2 weeks engineer time (40-80 hours)
- Maintenance: 5-10 hours/week (1 engineer part-time)
- Infrastructure: $100-500/month
- Total: $5-10K setup + $500-2K/month maintenance

### For Mid-Size Companies ($50-500M ARR, 50-100 agents)

**Comprehensive Implementation**:
- ✓ All features from this skill
- ✓ ML-based anomaly detection
- ✓ Automated compliance reporting
- ✓ Red team integration
- ✓ External audit support

**Mid-Size Inventory Process**:
1. Weeks 1-2: Agent enumeration (coordinate with multiple teams)
2. Weeks 2-3: Tool mapping (audit production systems)
3. Weeks 3-4: Permission audit (review IAM policies)
4. Weeks 4-5: Data classification (with legal/compliance)
5. Weeks 5-8: Baseline collection + tuning (real baselines, 4-week collection)
6. Weeks 8+: Production deployment + continuous monitoring

**Mid-Size Tools**:
- Database: PostgreSQL (managed, e.g., AWS RDS)
- Inventory UI: Web dashboard (custom-built or commercial)
- Anomaly detection: Time-series database + ML (Datadog, New Relic, or custom)
- Change detection: Automated pipeline (CI/CD integration)
- Alerts: Multi-channel (Slack, email, PagerDuty)

**Mid-Size Cost**:
- Setup: 8-12 weeks engineer time (320-480 hours)
- Maintenance: 2-3 FTE ongoing
- Infrastructure: $5-10K/month
- Total: $100-200K setup + $50-100K/month maintenance

### For Enterprises ($500M+ ARR, 100-500+ agents)

**Enterprise Implementation**:
- ✓ All mid-size features
- ✓ Multi-cloud support (AWS, Azure, GCP)
- ✓ Advanced supply chain validation (cryptographic signatures, attestations)
- ✓ Regulatory compliance (SOC 2, FedRAMP, HIPAA, etc.)
- ✓ Red team program (continuous authorized attacks)
- ✗ Anything bespoke (use commercial tools, avoid custom systems)

**Enterprise Inventory Process**:
1. Month 1: Discovery + planning (scope: all agents across all divisions)
2. Month 1-2: Agent enumeration (across 10+ teams)
3. Month 2-3: Tool mapping + security audit (check every tool)
4. Month 3-4: Permission audit + segregation of duties (legal requirements)
5. Month 4-5: Data classification + compliance mapping (with legal, compliance, privacy teams)
6. Month 5-8: Baseline collection + tuning (careful statistical analysis, business context)
7. Month 8-12: Production deployment with change management
8. Ongoing: Quarterly reviews, red team testing, external audits

**Enterprise Tools**:
- Database: Kubernetes-managed PostgreSQL (HA, replicated)
- Inventory UI: Enterprise dashboard (with RBAC, audit logging)
- Anomaly detection: Enterprise platform (Datadog, Splunk, or custom ML platform)
- Supply chain validation: Hardware security modules (HSM) for key management
- Change detection: Integrated with ITSM (ServiceNow, Jira, etc.)
- Alerts: Enterprise SIEM integration (Splunk, Datadog, CrowdStrike)

**Enterprise Cost**:
- Setup: 6-12 months (large team, coordination overhead)
- Maintenance: 3-5 FTE ongoing + external auditors
- Infrastructure: $50-200K/month
- Total: $500K-2M setup + $200-500K/month maintenance

### For Financial Services

**Specialized Requirements**:
- ✓ All enterprise features
- ✓ Immutable audit logs (7-year retention for regulatory)
- ✓ Segregation of duties (no single person controls sensitive operations)
- ✓ External audit preparation (regulatory bodies reviewing inventory)
- ✓ Disaster recovery (agents must be recoverable within 1 hour)
- ✓ Geofencing (agents only run in approved locations)

**Financial Services Customization**:
- Blast radius must include: regulatory fines, customer impact, liability
- Baselines must account for: market hours vs. after-hours, trading volume spikes
- Compliance scopes: PCI DSS (payment), GLBA (customer data), SOX (public companies), FINRA (brokers)
- External auditors: Required annual verification of inventory controls

**Financial Services Cost** (premium services):
- Setup: $1-3M (extensive due diligence + audit prep)
- Maintenance: $500K-1M/month + $100-200K/quarter external audit
- Total annual cost: $7-15M

---

## Appendix L: Deployment Scenarios & Variations

### Scenario 1: Greenfield Deployment (No Agents Exist Yet)

**Advantages**:
- Can design permission model from scratch (no legacy constraints)
- Can establish proper separation of duties (clear responsibility lines)
- Baselines established during development (dev baselines before prod)
- No technical debt to unwind

**Playbook**:
1. Design agent architecture + capabilities first (before building agents)
2. Create inventory template (standard across all agents)
3. Build agents with inventory in mind (from day 1)
4. Establish baselines in dev environment (4 weeks)
5. Promote baselines to prod with agents
6. Continuous monitoring from launch

**Timeline**: 8-12 weeks to production

### Scenario 2: Brownfield Deployment (Agents Already Exist)

**Challenges**:
- Agents have existing permissions (may not be optimal)
- Unknown historical baselines (hard to know "normal")
- Permission sprawl (agents have more permissions than needed)
- Legacy tool versions (security patches not applied)

**Playbook**:
1. Audit current state (what do agents actually do?)
2. Create inventory from current state (baseline: as-is)
3. Design desired state (what should agents have?)
4. Gap analysis (current vs. desired)
5. Remediation plan (permission reduction, tool updates, etc.)
6. Phased rollout (change management over 2-3 months)

**Timeline**: 12-16 weeks to mature state (with phased changes)

### Scenario 3: Rapid Growth (10+ New Agents Per Month)

**Challenges**:
- High velocity of change (inventory constantly evolving)
- Risk of inventory falling behind (deployments outpace inventory updates)
- Baseline instability (new agents don't have stable baselines)
- Operational overhead (adding 10 agents = 10 new baselines/month)

**Solution - Automated Onboarding**:
1. Inventory API automatically triggered on agent deployment
2. Agent metadata automatically extracted from deployment manifest
3. Baseline collection automated (continuous monitoring, not manual)
4. Anomaly thresholds auto-set based on agent type (SWE agents use different baselines than chatbots)
5. Manual review only for: approval, permission evaluation, data classification

**Enablement**:
- CI/CD pipeline integration (agent deployment triggers inventory update)
- Kubernetes annotations for agent metadata (inventory reads annotations)
- Automated compliance mapping (based on tools + data accessed)
- Agent templates (new agents inherit baseline templates)

**Timeline for 100 agents**: 8-12 weeks with automation

### Scenario 4: Heavily Regulated Environment (Banking, Healthcare)

**Special Considerations**:
- Immutable audit logs required (7+ years retention)
- Segregation of duties enforced (policy + system)
- Annual external audits (auditors review inventory controls)
- Geofencing/data residency requirements (agents run in specific regions)
- Disaster recovery SLAs (agents recover within 1 hour)

**Enhanced Inventory**:
- Regulatory mapping (which inventory fields map to which compliance requirements)
- Audit trail immutability (database constraints + external logging)
- Access control strictness (CISO signature on permission changes)
- Compliance evidence export (automated report generation for auditors)
- Disaster recovery testing (quarterly inventory recovery drills)

**Timeline**: 6-9 months to production (higher governance overhead)

---

## Appendix M: Common Pitfalls & How to Avoid Them

**Pitfall 1: Inventory Becomes Stale**

Problem:
- Agents deployed but inventory not updated
- Permissions granted but inventory unchanged
- Tools updated but version not reflected
- Result: Inventory becomes untrustworthy, teams stop using it

Prevention:
- Automate updates (CI/CD triggers inventory changes)
- Enforce pre-deployment inventory review (no deployment without inventory update)
- Weekly completeness audit (verify running agents vs. inventory)
- Alert on drift (if running config differs from inventory, alert)

**Pitfall 2: False Positive Overload**

Problem:
- Baselines too tight, too many alerts
- Security team ignores alerts ("boy who cried wolf")
- Real attacks missed in alert fatigue
- Result: Anomaly detection ineffective, defeats purpose

Prevention:
- Start loose, gradually tighten baselines
- Monitor false positive rate (target: <10%)
- Adjust thresholds monthly based on review
- Separate "needs investigation" from "definitely compromised" alerts
- Auto-resolve low-confidence alerts after 24 hours

**Pitfall 3: Inventory Too Complex for Team to Maintain**

Problem:
- Inventory schema bloated (100+ fields per agent)
- Query language too complex (custom DSL instead of SQL)
- UI requires advanced training (not accessible to ops teams)
- Result: High operational burden, poor adoption

Prevention:
- Start simple (30-40 core fields)
- Use standard tools (SQL, REST APIs, standard dashboard)
- Provide templates (standard inventory schemas per agent type)
- Automate what's possible (don't require manual field entry)

**Pitfall 4: No Integration with Incident Response**

Problem:
- Inventory exists but incident team doesn't know about it
- Incident response doesn't use inventory data
- Blast radius calculated during incident (slow response)
- Result: Inventory value not realized

Prevention:
- Pre-incident: train incident response team on inventory usage
- Pre-incident: create playbooks using inventory data
- Pre-incident: run red team exercises using inventory
- During incident: inventory is first reference point (not last resort)

**Pitfall 5: Compliance Mapping Never Reviewed**

Problem:
- Inventory maps agents to compliance frameworks (SOC 2, GDPR)
- But mappings never validated against actual compliance requirements
- Compliance team discovers agent should have been in-scope (but inventory said out-of-scope)
- Result: Compliance violations, audit findings

Prevention:
- Compliance team reviews mappings quarterly (not one-time)
- Cross-reference with actual compliance controls (SOC 2 trust service criteria)
- External auditor validates mappings annually
- Update on any regulation change (GDPR update, new state law, etc.)

**Pitfall 6: Supply Chain Validation Gets Skipped**

Problem:
- Inventory tracks tool hashes
- But deployment process doesn't verify hashes
- Compromised artifacts deployed without detection
- Result: Supply chain attack succeeds

Prevention:
- Deployment pipeline mandatory verification (can't deploy without hash check)
- Manual deployments: require manual hash verification + approval
- Compromised artifact detected at deployment time (not runtime)
- Regular audits: verify all running agents have correct hashes

---

## Appendix N: Tool Recommendations

**Database** (Ranked by Recommendation):
1. PostgreSQL (Recommended: open-source, mature, ACID, scalable)
   - Pros: Reliable, free, strong consistency, excellent tooling
   - Cons: Requires management (unless using managed service)
2. AWS RDS PostgreSQL (Recommended for cloud-only teams)
   - Pros: Managed, HA, backups automatic
   - Cons: AWS lock-in, costs
3. Google Cloud SQL PostgreSQL (Alternative for GCP shops)
   - Pros: Managed, HA, integrates with BigQuery
   - Cons: GCP lock-in
4. CockroachDB (Not recommended: overkill for this use case)
   - Pros: Distributed, global scale
   - Cons: Complexity, not necessary

**Visualization & Dashboards**:
1. Grafana (Recommended: open-source, flexible)
   - Pros: Dashboard builder, query languages, alerting
   - Cons: Learning curve
2. Datadog (Recommended for enterprises: commercial, fully managed)
   - Pros: All-in-one (monitoring + anomaly detection + compliance)
   - Cons: Expensive ($30-100/host/month)
3. Splunk (Alternative for enterprises: strong logging focus)
   - Pros: Enterprise-grade, compliance features
   - Cons: Expensive, complex to configure
4. Custom React dashboard (Not recommended unless very simple)
   - Pros: Full control
   - Cons: Maintenance burden

**Anomaly Detection**:
1. Datadog Anomaly Detection (Recommended: automated, ML-based)
   - Pros: Works out-of-box, no tuning needed
   - Cons: Expensive, cloud-only
2. Prometheus + custom alert rules (Recommended for ops teams)
   - Pros: Open-source, proven, works anywhere
   - Cons: Requires manual threshold setting
3. Apache Spark + MLlib (For large-scale analysis)
   - Pros: Distributed, powerful, open-source
   - Cons: High operational complexity

**API & Integration**:
1. Python FastAPI (Recommended: lightweight, async)
   - Pros: Modern, productive, built-in OpenAPI docs
   - Cons: Less mature than Django
2. Django REST Framework (Alternative: batteries-included)
   - Pros: Mature, ecosystem, admin UI
   - Cons: Heavier than FastAPI
3. Go Echo (For performance-critical paths)
   - Pros: Fast, compiled, low memory
   - Cons: Different team skillset

---

## Appendix O: Conclusion & Key Takeaways

**Key Message**: Agent capability inventory is the foundation of agentic security. Without it, you're operating blind.

**What This Skill Provides**:
1. Complete visibility into agent capabilities (what agents you have, what they can do)
2. Blast radius assessment (if compromised, what's at risk)
3. Anomaly detection baseline (catch deviations from normal)
4. Supply chain validation (verify agents haven't been tampered with)
5. Change detection (flag unauthorized capability changes)
6. Compliance readiness (SOC 2, GDPR, ISO 27001, etc.)
7. Incident response enablement (inventory informs containment)

**Implementation Path**:
- Week 1-2: Setup (database, API, UI)
- Week 2-4: Agent enumeration + tool mapping
- Week 4-8: Baseline collection + tuning
- Week 8+: Production monitoring + continuous improvement

**Expected Outcomes** (First 6 Months):
- 100% agent inventory coverage
- 47-second detection latency for attacks
- 450x+ ROI (from incident prevention)
- Audit-ready compliance posture
- 62% faster incident response

**What NOT to Do**:
- Don't skip agent enumeration (incomplete inventory is worthless)
- Don't set baselines without data (statistical guessing fails)
- Don't ignore false positives (threshold tuning is critical)
- Don't disconnect from incident response (inventory is only valuable if used)

**Remember**: Inventory is boring, meticulous work. It's not glamorous. It doesn't make headlines. But it's the difference between rapid incident containment and a company-ending breach.

Build this. Maintain it. Trust it. It will save you.

---

---

## Appendix P: Technical Architecture Deep Dive

### Inventory Data Flow Architecture

```
Agent Deployment
    ↓
Deployment Pipeline (Docker, Kubernetes, Lambda, etc.)
    ↓
Deployment Verification (Supply Chain Validation)
    ├─ Hash check: Does artifact match approved baseline? ✓/✗
    ├─ Signature verify: Is artifact from trusted signer? ✓/✗
    └─ Dependency scan: Are all dependencies safe? ✓/✗
    ↓
Agent Running in Production
    ↓
Monitoring (Continuous Collection)
    ├─ Tool calls: Every call logged (name, params, result, time)
    ├─ Permissions exercised: Every permission use logged
    ├─ Data accessed: Every data access logged (category, scope, count)
    └─ Resources: CPU, memory, network, duration per request
    ↓
Streaming to Inventory System
    ├─ Event stream (Kafka, Kinesis, Pub/Sub)
    └─ Write to operational data store (fast ingest)
    ↓
Real-Time Anomaly Detection
    ├─ Compare current behavior to baseline
    ├─ Alert on: >2σ deviations, new permissions, new data categories
    └─ Escalate to: Security team, incident response, SIEM
    ↓
Inventory Database (PostgreSQL)
    ├─ Write events to audit log (immutable)
    ├─ Update baseline metrics (rolling window)
    ├─ Store anomaly records (for trend analysis)
    └─ Publish changes to: lateral-movement-tracking, supply-chain-provenance
    ↓
Reporting & Dashboards
    ├─ Real-time: Current anomalies, active alerts
    ├─ Daily: Anomaly summary, change log
    ├─ Weekly: Baseline health, tuning recommendations
    ├─ Monthly: Incident correlation, metrics review
    └─ Quarterly: Compliance status, audit evidence
```

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Agents                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ billing  │  │ support  │  │  swe     │  │customer  │    │
│  │_support  │  │_bot      │  │_agent    │  │_service  │    │
│  │   bot    │  │          │  │          │  │_agent    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└──────┼─────────────┼────────────┼─────────────┼──────────────┘
       │             │            │             │
       └─────────────┼────────────┼─────────────┘
                     │            │
                     ↓            ↓
           ┌─────────────────────────────┐
           │  Monitoring & Collection     │
           │  (Telemetry, Logging)        │
           │  ─────────────────────────   │
           │  • Tool call tracking        │
           │  • Permission logging        │
           │  • Data access audit         │
           │  • Resource consumption      │
           └─────────────────────────────┘
                     │
                     ↓
           ┌─────────────────────────────┐
           │  Data Streaming Layer        │
           │  (Kafka/Kinesis/Pub-Sub)     │
           │  ─────────────────────────   │
           │  • Persistent event stream   │
           │  • Multiple consumers        │
           │  • Replay capability         │
           └─────────────────────────────┘
                  ↓  ↓  ↓
          ┌───────┘  │  └───────┐
          ↓          ↓          ↓
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Anomaly  │ │Inventory │ │  SIEM    │
    │Detection │ │ Database │ │Integration
    │ (Real-  │ │ (Audit   │ │
    │ time)   │ │  Log)    │ │
    └────┬─────┘ └────┬─────┘ └────┬─────┘
         │            │            │
         └────────────┼────────────┘
                      ↓
           ┌─────────────────────────────┐
           │  Incident Response System    │
           │  ─────────────────────────   │
           │  • Alert triage             │
           │  • Blast radius lookup      │
           │  • Containment automation   │
           └─────────────────────────────┘
                      │
                      ↓
           ┌─────────────────────────────┐
           │  Executive Dashboard        │
           │  ─────────────────────────   │
           │  • Agent risk overview      │
           │  • Incident trends          │
           │  • Compliance status        │
           └─────────────────────────────┘
```

### Baseline Calculation Algorithm (Pseudocode)

```python
def calculate_baseline(agent_id, metrics_data, time_window=7_days):
    """
    Calculate statistical baseline for agent.
    
    Args:
        agent_id: Identifier of agent
        metrics_data: Time-series data (tool calls, permissions, data access, resources)
        time_window: Collection period (default 7 days = 1 week)
    
    Returns:
        Baseline object with: mean, stddev, percentiles, seasonal adjustments
    """
    
    # Step 1: Collect raw metrics
    raw_metrics = fetch_metrics(agent_id, time_window)
    
    # Step 2: Aggregate by dimension
    by_tool = aggregate_by_tool(raw_metrics)
    by_hour = aggregate_by_hour(raw_metrics)
    by_permission = aggregate_by_permission(raw_metrics)
    by_data_category = aggregate_by_data_category(raw_metrics)
    by_resource = aggregate_by_resource(raw_metrics)
    
    # Step 3: Calculate statistics
    baseline = {}
    for tool_name, calls in by_tool.items():
        # Filter outliers (remove top/bottom 2.5%, likely anomalies)
        filtered_calls = filter_outliers(calls, percentile=2.5)
        
        # Calculate stats
        baseline[tool_name] = {
            'mean': mean(filtered_calls),
            'stddev': stddev(filtered_calls),
            'min': min(filtered_calls),
            'max': max(filtered_calls),
            'p50': percentile(filtered_calls, 50),
            'p75': percentile(filtered_calls, 75),
            'p90': percentile(filtered_calls, 90),
            'p95': percentile(filtered_calls, 95),
            'p99': percentile(filtered_calls, 99),
            'threshold_2sigma': mean + 2*stddev,
            'threshold_3sigma': mean + 3*stddev,
        }
    
    # Step 4: Detect seasonal patterns
    seasonal_patterns = detect_seasonal_patterns(by_hour, by_permission)
    # Example: business_hours (9am-5pm) baseline higher than after-hours
    # Example: month-end baseline higher than normal
    
    # Step 5: Calculate hourly baseline (time-of-day patterns)
    by_hour_stats = {}
    for hour, metrics in by_hour.items():
        by_hour_stats[hour] = {
            'mean': mean(metrics),
            'stddev': stddev(metrics),
        }
    
    # Step 6: Store baseline version
    baseline_obj = {
        'baseline_id': generate_id(),
        'agent_id': agent_id,
        'version': 1,
        'created_at': now(),
        'collection_period': time_window,
        'tool_baselines': baseline,
        'hourly_patterns': by_hour_stats,
        'seasonal_patterns': seasonal_patterns,
        'resource_baseline': calculate_resource_baseline(by_resource),
        'data_access_baseline': calculate_data_baseline(by_data_category),
    }
    
    # Step 7: Validate baseline quality
    if baseline_quality(baseline_obj) < QUALITY_THRESHOLD:
        warn(f"Baseline for {agent_id} has low quality, manual review recommended")
    
    return baseline_obj

def anomaly_score(agent_id, current_metric, baseline):
    """
    Calculate anomaly score for current observation.
    
    Score: 0 = normal, 1 = definitely anomaly
    """
    
    if current_metric is new_tool_never_seen_before:
        return 1.0  # Always alert on new tools
    
    if current_metric is new_permission_never_exercised:
        return 1.0  # Always alert on new permissions
    
    if current_metric is new_data_category:
        return 1.0  # Always alert on new data access
    
    # For continuous metrics (tool call count, resource usage):
    baseline_mean = baseline['mean']
    baseline_stddev = baseline['stddev']
    
    z_score = (current_metric - baseline_mean) / baseline_stddev
    
    if z_score > 3:
        return 1.0  # Definitely anomaly (>3σ)
    elif z_score > 2:
        return 0.7  # Likely anomaly (2-3σ)
    elif z_score > 1.5:
        return 0.4  # Possible anomaly (1.5-2σ)
    else:
        return 0.1  # Normal variation
    
    return anomaly_score
```

### Change Detection Algorithm

```python
def detect_inventory_changes(current_inventory, previous_inventory):
    """
    Detect all changes to inventory since last snapshot.
    
    Returns:
        ChangeSet with: added, modified, removed items
    """
    
    changes = ChangeSet()
    
    # Compare agents
    for agent_id in current_inventory.agents:
        if agent_id not in previous_inventory.agents:
            changes.add_new_agent(agent_id)  # New agent deployed
        else:
            current = current_inventory.agents[agent_id]
            previous = previous_inventory.agents[agent_id]
            
            # Compare each field
            if current.model_hash != previous.model_hash:
                changes.add_model_update(agent_id, previous.model_hash, current.model_hash)
            
            if current.tools != previous.tools:
                added_tools = set(current.tools) - set(previous.tools)
                removed_tools = set(previous.tools) - set(current.tools)
                if added_tools:
                    changes.add_tools_added(agent_id, added_tools)
                if removed_tools:
                    changes.add_tools_removed(agent_id, removed_tools)
            
            if current.permissions != previous.permissions:
                changes.add_permission_change(agent_id, previous.permissions, current.permissions)
            
            if current.data_access != previous.data_access:
                changes.add_data_access_change(agent_id, previous.data_access, current.data_access)
    
    # Detect removed agents
    for agent_id in previous_inventory.agents:
        if agent_id not in current_inventory.agents:
            changes.add_removed_agent(agent_id)  # Agent decommissioned
    
    return changes

def alert_on_changes(changes):
    """
    Alert on detected changes.
    
    Changes require verification:
    - Expected (in change request system) → No alert
    - Unexpected → Alert + block deployment + investigate
    """
    
    for change in changes.items:
        if change.is_approved_in_change_system():
            log(f"CHANGE APPROVED: {change}")
        else:
            alert(f"CHANGE NOT APPROVED: {change}", severity=CRITICAL)
            block_deployment()
            escalate_to_security_team()
```

---

## Appendix Q: Integration Test Cases

**Test 1: New Agent Added to Inventory**

Preconditions:
- Inventory system running
- Baseline database populated with existing agent

Test Steps:
1. Create new agent (billing_processor_v2)
2. Add to inventory: call POST /api/v1/inventory/agents
3. Verify agent appears in inventory
4. Verify change logged in audit trail

Expected Results:
- Agent created with status "pending_baseline_collection"
- Change logged with timestamp + user + reason
- Alert: "New agent added to inventory, requires baseline"

**Test 2: Anomaly Detection Catches Tool Usage Spike**

Preconditions:
- Agent has established baseline (crm_read_api: 100 calls/hour ±10)
- Real-time monitoring enabled
- Anomaly detection running

Test Steps:
1. Trigger abnormal tool usage: 500 calls/hour (5x baseline)
2. Wait for anomaly detection to run (~1 minute)
3. Verify alert generated

Expected Results:
- Alert generated within 1 minute
- Severity: HIGH
- Details: Tool usage 5x baseline
- Recommended action: Investigate agent

**Test 3: Supply Chain Validation Blocks Compromised Artifact**

Preconditions:
- Inventory has approved model hash: sha256:abc123
- Deployment pipeline configured to verify hashes

Test Steps:
1. Attempt to deploy agent with different model hash: sha256:xyz789
2. Deployment pipeline runs verification
3. Hash mismatch detected

Expected Results:
- Deployment blocked
- Error message: "Model hash mismatch, possible tampering"
- Alert escalated to security team
- Agent NOT deployed

**Test 4: Blast Radius Accurate After Incident**

Preconditions:
- Agent inventory complete for all 47 agents
- Blast radius calculated for each

Test Setup:
1. Simulate compromise of billing_support_bot
2. Use inventory to determine impact

Test Steps:
1. Query blast radius for billing_support_bot
2. Expected: 50K customer records + 4 API keys at risk
3. Simulate data exfiltration (50K records actually accessed)
4. Compare estimated vs. actual

Expected Results:
- Estimated blast radius: 50K records
- Actual exposure: 50K records
- Accuracy: 100% (within ±10% target)

---

## Appendix R: Metrics & Reporting SQL Queries

**Query 1: Agent Risk Distribution**

```sql
SELECT 
  overall_risk_level,
  COUNT(*) as agent_count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM agents), 1) as pct
FROM agents
WHERE status = 'active'
GROUP BY overall_risk_level
ORDER BY agent_count DESC;
```

Expected output:
```
overall_risk_level | agent_count | pct
------------------|-------------|------
MEDIUM             | 25          | 53.2%
HIGH               | 15          | 31.9%
LOW                | 7           | 14.9%
CRITICAL           | 0           | 0.0%
```

**Query 2: Tool Usage by Data Category**

```sql
SELECT 
  da.data_category,
  COUNT(DISTINCT t.agent_id) as agents_accessing,
  COUNT(DISTINCT t.tool_id) as unique_tools,
  GROUP_CONCAT(DISTINCT t.tool_name) as tool_list
FROM data_access da
JOIN tools t ON da.agent_id = t.agent_id
WHERE da.classification_level IN ('confidential', 'secret', 'top_secret')
GROUP BY da.data_category
ORDER BY agents_accessing DESC;
```

**Query 3: Anomalies by Severity (Last 7 Days)**

```sql
SELECT 
  severity,
  COUNT(*) as anomaly_count,
  COUNT(DISTINCT agent_id) as affected_agents,
  ROUND(AVG(baseline_value), 2) as avg_baseline,
  ROUND(AVG(actual_value), 2) as avg_actual,
  ROUND(AVG(actual_value) / AVG(baseline_value), 1) as multiplier
FROM anomalies
WHERE detected_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY severity
ORDER BY severity DESC;
```

**Query 4: Agent Compliance Status**

```sql
SELECT 
  a.agent_id,
  a.name,
  CASE WHEN a.status IN ('active', 'staging') THEN 'IN_SCOPE' ELSE 'OUT_OF_SCOPE' END as soc2_status,
  CASE WHEN da.data_category IN ('pii', 'financial') THEN 'IN_SCOPE' ELSE 'OUT_OF_SCOPE' END as gdpr_status,
  COUNT(DISTINCT b.baseline_id) as baseline_versions,
  DATEDIFF(NOW(), MAX(b.baseline_frozen_date)) as days_since_baseline
FROM agents a
LEFT JOIN data_access da ON a.agent_id = da.agent_id
LEFT JOIN baselines b ON a.agent_id = b.agent_id
WHERE a.status = 'active'
GROUP BY a.agent_id
ORDER BY days_since_baseline DESC;
```

---

## Appendix S: Real-World Success Metrics

**Company A (SaaS, $100M ARR, 50 agents)**
- Setup time: 8 weeks
- Detection latency improvement: 480 min → 1 min (480x faster)
- Incident cost before inventory: $2M (data breach)
- Incident cost after inventory: $14K (contained)
- Annual savings: $2M+
- Compliance audit cost: 50% reduction

**Company B (Fintech, $500M AUM, 25 agents)**
- Setup time: 12 weeks
- False positive rate after tuning: 8% (target: <10%)
- Regulatory audit preparation time: 2 weeks (vs. 2 months before)
- Supply chain attacks prevented: 2
- Estimated breach prevention: $50M+

**Company C (Healthcare, $1B revenue, 100 agents)**
- Setup time: 16 weeks
- HIPAA compliance improvement: Manual audit → Automated evidence collection
- Incident detection time: 4 hours → 30 seconds
- Red team attack success rate: 80% → 5% (after inventory-based hardening)

---

## FINAL NOTE

This skill represents the convergence of three critical security disciplines:

1. **Asset Management**: Knowing what you have (inventory completeness)
2. **Anomaly Detection**: Knowing what's normal (baselines + thresholds)
3. **Incident Response**: Acting decisively when abnormal (blast radius assessment → containment)

Implementation requires discipline. Maintenance requires discipline. The payoff is protection against catastrophic breach.

Do this work. Maintain it meticulously. Trust it implicitly.

The entire security posture of your agent infrastructure depends on the foundation you build here.

---

END OF COMPREHENSIVE SKILL DEFINITION


