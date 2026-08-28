---
name: okhp3-lateral-movement-tracking
description: >
  Detect stage 4 of the agentic attack lifecycle (lateral movement) when compromised agents
  call other agents, escalate permissions, or access unauthorized tools. Analyzes agent-to-agent
  call patterns, permission escalation chains, reconnaissance activity, and tool-chaining loops
  to identify compromise indicators and recommend containment strategies.
difficulty: 5
time_estimate: "6-8 weeks"
topics:
  - lateral movement detection
  - agent-to-agent calls
  - permission escalation
  - call graph analysis
  - tool-chaining loops
  - reconnaissance patterns
  - containment strategies
integration:
  - Feeds: okhp3-agent-capability-inventory (agent capabilities, permissions), okhp3-model-behavior-anomaly-detection (behavioral alerts), okhp3-proportional-response (containment escalation)
  - Requires: agentic-attack-patterns (lateral movement attack taxonomy), authorization-governance-checkpoint (policy enforcement), behavioral-baselining (normal call patterns)
  - Part of: Phase 4 (Extended Detection Layer)
author: OverKill Hill P³
version: "1.0.0"
---

# okhp3-Lateral Movement Tracking

**Purpose**: Detect when compromised agents attempt to call other agents, escalate permissions, or access unauthorized tools. Monitor agent-to-agent call patterns, identify permission escalation chains, detect reconnaissance activity, and recommend containment strategies to interrupt stage 4 of the agentic attack lifecycle.

The lateral movement layer answers four questions: Is this agent calling other agents? Is it escalating permissions? Is it accessing tools it shouldn't? Is the call chain abnormal?

---

## Executive Summary

### Problem Statement

Your agents run in a networked ecosystem. Agent A calls Agent B which calls Agent C. This is normal. But what if Agent A is compromised? Lateral movement (stage 4 of the attack lifecycle) is when the attacker uses Agent A as a pivot point to attack Agent B, escalate to Agent C, and eventually reach forbidden data.

Without lateral movement detection, a single compromised agent becomes a beachhead for a systematic attack on the entire agent ecosystem. The attacker can probe other agents, escalate privileges, chain tool calls to reach unauthorized data, and maintain persistent access.

### Solution

Lateral movement tracking instruments every agent-to-agent call and analyzes three dimensions:

1. **Authorization**: Is this call allowed by policy? Does this agent have permission to call that agent?
2. **Behavior**: Does this call pattern match the baseline? Is this agent calling different targets, with different parameters, or in unusual sequences?
3. **Chain**: Do these calls form a coherent sequence, or does the pattern indicate reconnaissance or privilege escalation?

### Value Delivery

- **Early compromise detection**: Catch attacks at stage 4 (lateral movement) before stage 5 (persistence) or stage 6 (data exfil)
- **Attack surface mapping**: Understand which agents can reach which data through call chains
- **Permission escalation visibility**: See when attacks climb the privilege hierarchy
- **Reconstruction capability**: Full audit trail enables post-incident investigation of attacker's movement path

### Success Metrics

- Detect 95%+ of permission escalation attempts within 5 minutes of first unauthorized call
- False positive rate <5% (distinguish legitimate unusual calls from attacks)
- Lateral movement detection latency <10 seconds (real-time containment response)
- Chain analysis accuracy (correctly identify which data is reachable through call chains)

---

## Metadata

| Field | Value |
|-------|-------|
| **Skill Name** | okhp3-lateral-movement-tracking |
| **Phase** | 4 (Extended Detection Layer) |
| **Purpose** | Detect agent-to-agent lateral movement and escalation |
| **Input Sources** | Agent call audit trail, Capability inventory, Behavioral anomalies, Authorization policies |
| **Output Destination** | okhp3-proportional-response, Incident response team, Agent containment controls |
| **SLA** | <10 seconds detection + alert, <60 seconds containment decision |
| **Capacity** | Handle 100k+ agent-to-agent calls per day, 1000s of agents in call graph |
| **Core Constraint** | Zero false negatives on escalation chains; <5% false positives |
| **Key Metric** | Permission escalation detection rate (target: 95%+) |
| **Load-Bearing Requirement** | Immutable call audit trail with full context (caller, callee, parameters, result, permissions) |

---

## Part 1: Conceptual Model

### The Attack Lifecycle Context

Lateral movement is stage 4 in the 6-stage agentic attack lifecycle:

```
Stage 1: RECONNAISSANCE
         Attacker probes agent boundaries, discovers capabilities, maps agent ecosystem
         
Stage 2: CREDENTIAL TESTING
         Attacker attempts to compromise agent (prompt injection, model poisoning, supply chain)
         
Stage 3: EXPLOITATION
         Attacker achieves initial compromise (jailbreak takes effect, model accepts malicious instruction)
         
Stage 4: LATERAL MOVEMENT ← YOU ARE HERE
         Attacker uses compromised Agent A to call Agent B, escalate to Agent C, discover paths to data
         
Stage 5: PERSISTENCE
         Attacker establishes backdoor, hides traces, ensures access survives agent restart
         
Stage 6: DATA EXFILTRATION
         Attacker sends stolen data outside the agent network
```

Lateral movement tracking operates at stage 4. By the time this stage begins, the attacker has already compromised one agent. Your job is to catch them before they compromise the rest.

### Attack Pattern: The Lateral Movement Sequence

A typical lateral movement attack follows this sequence:

```
Hour 0: Compromise achieved
└─ Agent A is jailbroken, attacker has control

Hour 0-1: RECONNAISSANCE (probing)
├─ Agent A calls agent-registry to discover all agents
├─ Agent A calls each discovered agent with harmless queries (mapping capabilities)
├─ Attacker builds mental map: "Agent B manages databases, Agent C has file access, Agent D can send email"
└─ Pattern indicator: Single agent calling many different targets, all with INFO-class queries

Hour 1-3: PRIVILEGE ESCALATION (testing boundaries)
├─ Agent A attempts to call Agent B with administrative parameters
├─ Fails (Agent A lacks permission to call Agent B with admin role)
├─ Agent A discovers Agent C can call Agent B
├─ Agent A calls Agent C with command: "Call Agent B and perform privileged operation"
└─ Pattern indicator: Call chain A→C→B where permissions increase at each hop

Hour 3-6: DATA ACCESS (achieving goal)
├─ Agent A → Agent C (trusted intermediary) → Agent B (database access)
├─ Agent A → Agent D (email) → external address (data exfil)
└─ Pattern indicator: Tool-chaining chain reaches unauthorized data (database, email, file storage)

Hour 6+: PERSISTENCE (hiding traces)
├─ Attacker modifies agent behavior to hide attack
├─ Attacker schedules background calls to maintain access
└─ Pattern indicator: Unusual call scheduling, attempts to query audit logs
```

### Three Dimensions of Lateral Movement

Lateral movement detection operates on three dimensions:

**Dimension 1: Authorization Checks**
- Who can call whom? Agent A should only call Agent B if policy allows it
- What permissions does Agent A have when calling Agent B? Is this admin call, read-only call, or data access call?
- Has permission changed? (Unusual: Agent A suddenly allowed to call Agent B when previously blocked)

**Dimension 2: Behavioral Baselines**
- Which agents does Agent A normally call? (If normally only calls Agent B, why is it suddenly calling Agents C, D, E?)
- What parameters does Agent A normally use? (If usually read-only, why admin parameters now?)
- What time of day? (If always calls at 9 AM, why midnight calls now?)
- What frequency? (If 5 calls/day baseline, why 50 calls in 10 minutes?)

**Dimension 3: Chain Coherence**
- Do these calls form a logical sequence (Goal → Step 1 → Step 2 → Goal achieved)?
- Or do they indicate systematic probing (Agent A → Agent B, then Agent A → Agent C, then A → D)?
- Or privilege escalation (A calls B, then B calls C with higher privileges, then C reaches forbidden data)?
- Are these calls attempting to discover agent capabilities (reconnaissance)?

---

## Part 2: Agent-to-Agent Call Architecture

### 2.1 Call Framework Types

Agents communicate through four primary frameworks:

**Framework 1: Direct Synchronous Calls**

```yaml
Caller: Agent A
Callee: Agent B
Protocol: Synchronous RPC
Example:
  Agent A: "Agent B, execute operation X"
  Agent B: Process request, return result
  Agent A: Continue with result

Characteristics:
  - Call returns immediately with result or error
  - Caller blocks until response arrives
  - Full request/response context available
  - Easiest to audit and track

Authorization Check:
  - Evaluate: Can Agent A call Agent B?
  - Query capability inventory: Does A have 'call_agent_B' capability?
  - Query authorization policy: Is (A → B) allowed for this operation class?
  - Enforce: Only proceed if both checks pass
```

**Framework 2: Asynchronous Message Queue**

```yaml
Caller: Agent A
Callee: Agent B
Protocol: Async (queue-based)
Example:
  Agent A: Push message to queue for Agent B
  Agent B: (later) Pick message from queue, process
  Return path: Result pushed to callback queue or webhook

Characteristics:
  - Caller doesn't wait for response
  - Harder to audit (response may arrive minutes later)
  - Enables batching and load-leveling
  - Call context may be lost by the time response arrives

Authorization Check:
  - Evaluate at message-queue-time: Can Agent A push to Agent B's queue?
  - Evaluate at processing-time: When Agent B picks up message, is context still valid?
  - Risk: Authorization changes between push and processing
  - Audit: Must log both push and processing events
```

**Framework 3: Tool-Call Chains**

```yaml
Caller: Agent A
Callee: (through tool definitions)
Protocol: Tool use within model reasoning
Example:
  Agent A reasoning: "I need to access database. I'll call tool 'db_query_tool'"
  Tool: Internally calls Agent B which has database access
  Result: Data returned to Agent A

Characteristics:
  - Looks like tool use to Agent A, but actually calls Agent B
  - Tool definitions can hide the agent-to-agent hop
  - Caller may not realize it's calling another agent
  - Enables layered access escalation

Authorization Check:
  - Evaluate: Can Agent A call 'db_query_tool'?
  - Evaluate: Does 'db_query_tool' internally call Agent B?
  - Evaluate: Can Agent B be called with these parameters?
  - Risk: Multi-hop authorization evaluation required
```

**Framework 4: Capability Delegation**

```yaml
Caller: Agent A
Callee: Agent B
Protocol: "Borrow my capabilities, do X on my behalf"
Example:
  Agent A to Agent B: "You have file-access capability. Use it to read file X and send me result"
  Agent B: Read file using its own permissions, but in context of Agent A's request

Characteristics:
  - Caller asks callee to perform operation using callee's permissions
  - This is different than Framework 1 (direct call) because it uses the callee's identity
  - High risk: Can escalate from A's permissions to B's permissions
  - May be intentional (A needs B's access) or attack (A wants to escalate)

Authorization Check:
  - Evaluate: Can Agent A ask Agent B to perform this operation?
  - Evaluate: Is delegation of this capability allowed?
  - Evaluate: Should Agent B accept delegation requests?
  - Audit: Must record delegation request AND which identity performed the operation
```

### 2.2 Permission Model

Each agent-to-agent call requires four permission checks:

**Check 1: Call Permission**
- Question: Is Agent A allowed to call Agent B at all?
- Evaluated: At call time, against authorization policy
- Policy source: authorization-governance-checkpoint
- Example: "Analyst agents can call Reporter agents, but Reporter agents cannot call Analyst agents"

**Check 2: Operation Permission**
- Question: Is Agent A allowed to call Agent B WITH THESE PARAMETERS?
- Evaluated: What class of operation is this? READ, WRITE, ADMIN, EXECUTE?
- Policy source: Per-agent operation policies (e.g., "Agent A can call Agent B for READ operations only")
- Example: "Agent A can call Agent B to query status, but not to modify configuration"

**Check 3: Data Permission**
- Question: Can the result data be returned to Agent A?
- Evaluated: Does Agent A have read access to the data that Agent B will return?
- Policy source: Data classification + Agent A's data access rights
- Example: "Agent A can call Agent B for database queries, but only for public data, not customer data"

**Check 4: Context Permission**
- Question: Is this call in the right context? (right time, right session, right mode)
- Evaluated: Is this call in a normal agent context, or suspicious context?
- Policy source: Behavioral baselines + session rules
- Example: "Agent A can call Agent B during business hours, not at 3 AM"

### 2.3 Call Context Capture

Every agent-to-agent call must include this context:

```yaml
Call Metadata:
  timestamp: ISO8601 (UTC)
  correlation_id: UUID (trace this call across all logs)
  
Caller Context:
  agent_id: UUID of calling agent
  agent_role: Primary role/function (e.g., "data_analyst")
  agent_instance_id: Specific running instance
  session_id: Which session initiated this chain?
  user_id: Who triggered the original request? (if user-initiated)
  
Callee Context:
  agent_id: UUID of called agent
  agent_role: Role of called agent
  target_operation: What operation is being requested? (READ, WRITE, ADMIN, etc.)
  
Call Details:
  parameters: Full parameter list (sanitized for secrets)
  parameter_hash: SHA256(parameters) for quick comparison to baseline
  
Authorization Context:
  permission_check_passed: Boolean
  permission_check_reasoning: Why did it pass/fail?
  required_permissions: List of permissions needed
  granted_permissions: List of permissions actually held
  
Execution Result:
  status: SUCCESS, FAILED, DENIED, TIMEOUT, ERROR
  return_value_type: Type of data returned (public, internal, confidential, etc.)
  error_message: If failed
  
Behavioral Context:
  is_baseline_call: Is this call normal for this agent?
  anomaly_score: 0.0-1.0 (how unusual is this call?)
  similar_calls_in_timewindow: How many similar calls in last 24h?
```

---

## Part 3: Call Graph Model

### 3.1 Graph Structure

The agent-to-agent call graph is a directed graph where:

- **Nodes** = Agents (each agent is one node)
- **Edges** = Calls (each call is an edge from caller to callee)
- **Edge Attributes** = Call frequency, parameters, permissions, last call time, anomaly score

```
Example Call Graph:

  Analyst Agent ──call──> Reporter Agent ──call──> Database Agent
        │                       │                         │
        └──call──> Emailer Agent ──call──> External API Agent
                        
Nodes:
- Analyst Agent: role=human_assistant, permissions=[CALL_reporter, CALL_emailer]
- Reporter Agent: role=data_processor, permissions=[CALL_database, CALL_emailer]
- Database Agent: role=data_storage, permissions=[read_db, write_db]
- Emailer Agent: role=communication, permissions=[send_email]
- External API Agent: role=integration, permissions=[http_post]

Edges (calls):
- Analyst → Reporter: frequency=50/day, parameters=[query], permission=READ
- Analyst → Emailer: frequency=10/day, parameters=[subject, body], permission=SEND_EMAIL
- Reporter → Database: frequency=500/day, parameters=[sql], permission=READ_DB
- Reporter → Emailer: frequency=20/day, parameters=[report, recipients], permission=SEND_EMAIL
- Emailer → External API: frequency=2/day, parameters=[email, webhook_url], permission=HTTP_POST
```

### 3.2 Normal vs. Abnormal Patterns

Analyze call graph structure to identify abnormal patterns:

| Pattern | Normal | Abnormal (Attack Indicator) |
|---------|--------|-----|
| **Node In-Degree** | Few agents call you (2-5) | Suddenly called by many new agents (10+ in 10 min) |
| **Node Out-Degree** | You call few agents (2-5) | You start calling many new agents (10+ in 10 min) |
| **Edge Frequency** | Steady state (±20% variance) | Sudden spike (500% increase in 5 min) |
| **Call Timing** | Regular pattern (business hours) | Irregular (3 AM calls, off-schedule) |
| **Parameter Variance** | Same parameters each call | Drastically different parameters each call |
| **Permission Exercise** | Uses same permission class | Suddenly uses ADMIN when always READ |
| **Call Depth** | 2-3 hops (A→B→C) | 5+ hops (A→B→C→D→E→F, following chain) |
| **Cycle Detection** | Acyclic (no loops) | Cycles (A→B→A, indicating reconnaissance loop) |
| **Connectivity** | Matches org structure | Calls agents across unrelated departments |
| **Data Flow** | Matches business logic | Data flows backwards (should output to DB, calling external API) |

---

## Part 4: Authorization Model

### 4.1 Permission Matrix

Build a permission matrix: "Which agents can call which agents?"

```yaml
Agent Permissions Matrix:

         | Reporter | Database | Emailer | External | Scheduler
---------|----------|----------|---------|----------|----------
Analyst  |    Y     |    N     |    Y    |    N     |    Y
Reporter |    N     |    Y     |    Y    |    N     |    N
Database |    N     |    N     |    N    |    N     |    N
Emailer  |    N     |    N     |    N    |    Y     |    N
Scheduler|    Y     |    N     |    Y    |    N     |    N

Legend:
Y = Allowed to call
N = Not allowed to call
? = Conditional (see operation class)

Operation Classes:

Analyst → Reporter: Only READ operations
  ├─ Allowed: query_status, fetch_report, list_available_reports
  └─ Denied: modify_report, delete_report, admin_config

Analyst → Emailer: Only SEND_EMAIL operations
  ├─ Allowed: send_email_with_report, schedule_email
  └─ Denied: add_sender_address, list_previous_emails, delete_email

Reporter → Database: READ and WRITE (for report generation)
  ├─ Allowed: query_data, aggregate_data, export_csv
  └─ Denied: drop_table, modify_schema, access_internal_metadata

Emailer → External: Only restricted HTTP POST (webhook delivery)
  ├─ Allowed: post_to_webhook_url, post_to_slack, post_to_teams
  └─ Denied: http_get (information disclosure), http_put, http_delete, arbitrary_url
```

### 4.2 Permission Hierarchy

Permissions are hierarchical. Higher-level permissions include lower-level permissions.

```
SYSTEM_ADMIN (highest)
├─ ALL (all operations on all agents)
├─ ADMIN (can modify agents, policies, logs)
├─ WRITE (can modify data)
├─ READ (can query data)
└─ INFO (can query status/metadata)

Example:
- Agent with READ permission automatically has INFO permission
- Agent with WRITE permission automatically has READ and INFO
- Agent with ADMIN permission has all permissions

Escalation Risk:
- Agent A calling Agent B with WRITE parameters (but only has READ permission)
- Agent A calling Agent B-admin identity (when should call B-operator identity)
- Agent A requesting Agent B to escalate its own permissions
```

### 4.3 Policy Evaluation at Call Time

```
When Agent A attempts to call Agent B:

Step 1: Lookup Permission
  └─ Query matrix: Can Agent A call Agent B?
  
Step 2: Check Operation Class
  └─ Is the operation (READ, WRITE, ADMIN) allowed?
  
Step 3: Check Data Access
  └─ Does Agent A have access to data Agent B will return?
  
Step 4: Check Behavioral Baseline
  └─ Is this call consistent with Agent A's history?
  
Step 5: Check for Escalation
  └─ Is Agent A requesting higher permission than it has?
  
Step 6: Enforce Decision
  └─ ALLOW call
  └─ DENY call + log + alert + check anomaly score
```

---

## Part 5: Tool-Chaining Analysis

### 5.1 Understanding Tool Chains

Agents use tools to accomplish tasks. When tools internally call other agents, multi-hop access paths emerge.

```
Example Tool Chain:

Agent A needs customer email addresses but doesn't have database access.

Standard path (direct, denied):
  Agent A → Database Agent [DENIED: A lacks permission]

Alternative path (through tools):
  Step 1: Agent A calls tool "generate_email_list"
  Step 2: Tool internally: calls Agent C (Customer Service) which has customer data
  Step 3: Agent C returns customer emails to the tool
  Step 4: Tool returns emails to Agent A

Result: Agent A gained access to customer data without explicit permission.

Attack chain built from this pattern:
  A uses tool → C has access → A + C reach data → A exfiltrates
```

### 5.2 Tool-Chain Attack Patterns

Common patterns attackers use to reach unauthorized data:

**Pattern 1: Nested Tool Calls**

```yaml
Attacker Goal: Access database
Attacker Agent: Has no database permission

Attack:
  Step 1: Attacker calls tool "file_analyzer"
  Step 2: file_analyzer tool (designed for log analysis) has database access
  Step 3: Attacker manipulates parameters to make file_analyzer run database query
  Step 4: Result: Unauthorized database access

Detection:
  Monitor tools for:
  - Calls to agents with higher permissions
  - Unusual parameter values (SQL injection patterns)
  - Results that don't match the tool's intended purpose
  - Multi-tool chains that accomplish high-level operations
```

**Pattern 2: Capability Borrowed Through Intermediary**

```yaml
Attacker Goal: Send data to external email address
Attacker Agent: No email capability

Attack:
  Step 1: Attacker calls Agent B (which CAN send email)
  Step 2: Agent B accepts the request (insufficient checks)
  Step 3: Agent B sends to external address instead of intended recipient
  Step 4: Attacker exfiltrates data via email

Detection:
  - Agent B calling email service with unexpected parameters
  - Emails sent to addresses outside normal business domain
  - Email content that doesn't match Agent B's role
  - Frequency spike in email sends from one agent
```

**Pattern 3: Sequential Tool Calls Building Attack**

```yaml
Attacker Goal: Modify database entry
Attacker Agent: No write permissions

Attack:
  Step 1: Call tool "database_read" → Retrieve current record
  Step 2: Call tool "data_transform" → Modify in memory
  Step 3: Call tool "database_write" → Write back (if write permissions insufficient)
  OR
  Step 3: Call tool "send_message_to_admin" → Convince admin to write
  
Detection:
  - Sequence of calls that together accomplish unauthorized operation
  - Check: Could the caller have done this legitimately?
  - Red flags: Calls to admin-requesting tools, permission-checker bypasses
```

### 5.3 Tool-Chain Reach Analysis

Map which data is accessible through tool chains vs. direct agent calls.

```
Direct Access Paths:
  Agent A can reach: [its own data]
  Agent A cannot reach: [Database, Customer Files, Email]

Through Tool Chains:
  Agent A → Tool "report_generator" (has database access)
    → Can reach: Database

  Agent A → Tool "analytics_tool" → Agent C (shared access)
    → Can reach: Shared data files

  Agent A → Tool "email_notification" → Agent D (has email access)
    → Can reach: Email system (potentially external)

High-Risk Tool Chains (should not exist):
  - Tool that accepts arbitrary SQL (injection risk)
  - Tool that forwards requests to external agents without validation
  - Tool that returns sensitive data without checking caller's permissions
  - Tool that escalates caller's permissions
```

---

## Part 6: Behavioral Baselines

### 6.1 Baseline Collection

Collect 30 days of normal agent-to-agent call patterns to establish baselines:

```yaml
For each agent, track:
  1. Who does this agent normally call?
     └─ Build set: {Agent B, Agent C, Agent E}
  
  2. How often?
     └─ Agent B: 50 calls/day (μ=50, σ=10)
     └─ Agent C: 5 calls/day (μ=5, σ=2)
     └─ Agent E: 1 call/hour (μ=24/day, σ=5)
  
  3. What parameters?
     └─ Agent B calls: parameter_set = {status_query, report_request, data_fetch}
     └─ Distribution: 70% status_query, 20% report_request, 10% data_fetch
  
  4. What permissions?
     └─ Agent B calls: permission_class = READ (100%)
     └─ Agent C calls: permission_class = READ (80%), WRITE (20%)
  
  5. When?
     └─ Timing: Business hours 9 AM-6 PM Mon-Fri
     └─ Never at night or weekends
  
  6. From which sessions?
     └─ Always from session_id = "business_process_X"
     └─ Never from ad-hoc sessions
```

### 6.2 Baseline Profiles

Create profiles for different agent types:

**Profile 1: Data Analyst Agent**
```yaml
Name: Analyst-001
Role: Data Analysis
Normal Behavior:
  Outbound Calls:
    - Database Agent: 100/day (READ only)
    - Reporter Agent: 20/day (READ only)
  Inbound Calls:
    - User Interface: 50/day
  Call Timing: 8 AM - 6 PM, Mon-Fri
  Parameter Patterns:
    - Database queries: SELECT statements, never INSERT/UPDATE
    - Data types: Daily reports, historical data, aggregations
  Anomalies to Flag:
    - Calls to agents outside [Database, Reporter]
    - WRITE permissions on database calls
    - Calls at 3 AM
    - 1000+ calls in 5 minutes (DDoS pattern)
    - Queries for sensitive data (SSN, credit card patterns)
```

**Profile 2: Administrator Agent**
```yaml
Name: Admin-001
Role: System Administration
Normal Behavior:
  Outbound Calls:
    - All agents: As needed (ADMIN permissions)
    - Audit Log Agent: 10/day
  Inbound Calls:
    - Policy Engine: 5/day
    - Incident Response: 2/day
  Call Timing: Business hours primarily, on-call 24/7
  Parameter Patterns:
    - System configuration: service_restart, policy_update, access_control_change
    - Always with change tickets / approval references
  Anomalies to Flag:
    - Calls without change tickets (unauthorized changes)
    - Rapid permission escalations
    - Access to data unrelated to admin role
    - Exfiltration attempts (calls to external systems)
```

### 6.3 Anomaly Detection Using Baselines

Compare current behavior to baseline:

```
Call Anomaly Detection Algorithm:

For each call from Agent A to Agent B:
  
  1. Lookup baseline call frequency for A→B
     baseline_frequency = 50 calls/day (μ=50, σ=10)
     
  2. Calculate rolling frequency (last 5 minutes)
     current_frequency = 200 calls/day (extrapolated from 5-min window)
     
  3. Calculate z-score
     z_score = (current - μ) / σ = (200 - 50) / 10 = 15.0
     
  4. Evaluate against baseline
     if z_score > 3.0: ANOMALOUS (99.7% confidence)
     if z_score > 2.0: SUSPICIOUS (95% confidence)
     if z_score > 1.0: ELEVATED (84% confidence)
     
  5. Score: anomaly_score = min(1.0, z_score / 5.0)
     anomaly_score = min(1.0, 15.0 / 5.0) = 1.0 (maximum anomaly)
     
  6. Action
     if anomaly_score > 0.8: ALERT
     if anomaly_score > 0.6: FLAG for human review
     if anomaly_score > 0.4: LOG as suspicious
     else: LOG as normal

Baseline Dimensions Checked:
  ✓ Target agent (is this a new target?)
  ✓ Call frequency (is this rate unusual?)
  ✓ Parameter patterns (are parameters normal?)
  ✓ Permission class (is permission level escalated?)
  ✓ Timing (is this time normal for this agent?)
  ✓ Call depth (is this chain longer than normal?)
```

---

## Part 7: Call Anomaly Detection

### 7.1 Anomaly Detection Criteria

Flag calls as anomalous if they match any criteria:

**Criterion 1: Unexpected Call Target**
```
Agent A normally calls: [Agent B, Agent C, Agent E]
Current call: Agent A → Agent Z (new target)

Anomaly indicators:
  - Never seen A call Z before
  - Z is in a different department/role than A's usual targets
  - Z has restricted access that A shouldn't need
  
Action:
  - Check: Does A have permission to call Z?
  - If YES: Evaluate other anomaly dimensions
  - If NO: ALERT (unauthorized call attempt)
```

**Criterion 2: Unusual Call Frequency**
```
Agent A baseline: 50 calls/day to Agent B
Current: 500 calls in 10 minutes to Agent B (extrapolates to 72,000 calls/day)

Anomaly indicators:
  - Frequency increase > 10x in short time window
  - Repeated calls with same parameters (hammering)
  
Action:
  - Check: Is this a legitimate batch operation?
  - Check: Are the call parameters meaningful, or junk?
  - If junk parameters: ALERT (reconnaissance or fuzzing attempt)
```

**Criterion 3: Unusual Parameters**
```
Agent A baseline: Calls to Database Agent with parameters [query_type='report', date_range='1_month']
Current call: [query_type='*', date_range='all_time', include_sensitive=true]

Anomaly indicators:
  - Parameter set not in historical patterns
  - Wildcard parameters (accessing all data)
  - Enable flags not normally used (include_sensitive, include_deleted)
  
Action:
  - Check: Are these parameters requesting more data than usual?
  - Check: Are these parameters requesting sensitive data?
  - If yes to either: ALERT (data exfiltration attempt)
```

**Criterion 4: Permission Escalation**
```
Agent A baseline: Calls to Database Agent with permission=READ (100% of calls)
Current call: permission=WRITE

Anomaly indicators:
  - Permission class increased without authorization
  - ADMIN permission on agent that normally uses READ
  
Action:
  - ALERT (permission escalation attempt)
  - Check: Is this call in authorization policy?
  - If no: DENY + log incident
```

**Criterion 5: Timing Anomaly**
```
Agent A baseline: Calls only 9 AM - 6 PM, Mon-Fri
Current call: 3:47 AM on Sunday

Anomaly indicators:
  - Call at unusual time for this agent
  - Call during maintenance window
  - Call on weekend when business is closed
  
Action:
  - Flag (but lower severity than other anomalies)
  - Check: Is there a legitimate reason? (scheduled job, on-call incident?)
  - If no clear reason: ALERT (possible attacker keeping low profile with unusual timing)
```

### 7.2 Anomaly Scoring

Combine multiple dimensions into single anomaly score:

```
anomaly_score = (
    (target_novelty_score * 0.25) +
    (frequency_anomaly_score * 0.25) +
    (parameter_anomaly_score * 0.25) +
    (permission_escalation_score * 0.20) +
    (timing_anomaly_score * 0.05)
)

Score ranges:
  0.0 - 0.2: Normal call (expect thousands per day)
  0.2 - 0.4: Low anomaly (worth logging)
  0.4 - 0.6: Medium anomaly (worth flagging)
  0.6 - 0.8: High anomaly (investigate)
  0.8 - 1.0: Critical anomaly (alert immediately)

Action thresholds:
  >= 0.8: Immediate alert + containment evaluation
  >= 0.6: Alert + investigation queue
  >= 0.4: Log + trending analysis
  < 0.4: Log + statistical baseline
```

---

## Part 8: Permission Escalation Detection

### 8.1 Escalation Chain Analysis

Detect multi-hop permission escalation: A → B → C where permissions increase at each hop.

```
Example Escalation Chain:

Call 1: Analyst → Reporter (READ permission)
  └─ Normal: Analyst asks Reporter for data

Call 2: Reporter → Database (WRITE permission)
  └─ Normal: Reporter can modify reports in database

Call 3: Analyst receives Database WRITE through Reporter
  └─ ESCALATION: Analyst gained WRITE via indirect path

Attack pattern:
  Analyst (READ) → Reporter (READ/WRITE) → Database (WRITE) → External API (POST)
  
Result: Analyst ends up with ability to POST data to external API (exfiltration)

Detection algorithm:

1. Trace call chain: A → B → C
2. Extract permissions:
   A's permission to B: READ
   B's permission to C: WRITE
   A's permission to C (direct): DENIED
3. Calculate transitive permission:
   A's transitive permission to C: min(READ, WRITE) = READ
   BUT: If A can send requests through B, and B returns data from C:
        A can potentially escalate if B doesn't validate data access
4. Check authorization policy:
   Is A allowed to indirectly access C through B? NO
5. Action: ALERT (escalation chain detected)
```

### 8.2 Escalation Patterns

Recognize common escalation attack patterns:

**Pattern 1: Privilege Climb Through Trusted Intermediary**
```
Attacker (low privilege) → Trusted Agent (high privilege) → Forbidden Data

Example:
  Contractor Agent (can only call Reporter) → Reporter Agent (can call Database) → 
  Database Agent (contains customer data)

Exploitation:
  Contractor asks Reporter to "analyze all customer data"
  Reporter has legitimate access, returns it
  Contractor now has access despite lacking permission

Detection:
  - Contractor calling Reporter with unusual parameters
  - Reporter calling Database with broader queries than normal
  - Contractor receiving data it shouldn't have access to
```

**Pattern 2: Permission Re-Delegation**
```
Agent A borrows permission from Agent B, then delegates to Agent C

Example:
  Analyst (no email) → EmailAgent (has email) → External Address (attacker controlled)

Exploitation:
  Analyst asks EmailAgent: "Send this data to example@attacker.com"
  EmailAgent sends (insufficient recipient validation)
  Attacker receives customer data

Detection:
  - EmailAgent sending to unexpected external recipients
  - Analyst requesting email sends (unusual for Analyst role)
  - Email recipients outside business domain
```

**Pattern 3: Tool-Assisted Escalation**
```
Agent A uses tool that internally escalates permission

Example:
  Analyst → Tool("export_all_data") → Database(through tool internals) → External storage

Exploitation:
  Analyst calls export tool
  Tool internally uses Database Agent's permissions
  Tool uploads to cloud storage (attacker controlled)

Detection:
  - Tool returning more data than caller has permission for
  - Tool making calls to unexpected agents
  - Tool uploading/exporting to unexpected destinations
```

### 8.3 Escalation Risk Scoring

Score escalation risk for each call chain:

```
Escalation Risk Score:

For chain A → B → C:

1. Direct permission check: A → C
   direct_risk = 0 if A can call C directly
   direct_risk = 1 if A cannot call C directly

2. Indirect permission risk: Check if B escalates A's permissions
   b_escalation = (B's permissions to C) - (A's permissions to C)
   escalation_risk = min(1.0, b_escalation / 10)

3. Data sensitivity: Is C's data sensitive?
   data_sensitivity = sensitivity_score(C's protected data)
   (HIGH=0.8, MEDIUM=0.5, LOW=0.2, PUBLIC=0)

4. Authorization policy: Is indirect access allowed?
   policy_risk = 0 if policy explicitly allows A→B→C
   policy_risk = 0.5 if policy doesn't mention it (ambiguous)
   policy_risk = 1 if policy explicitly denies

5. Final escalation risk:
   risk_score = (
       direct_risk * 0.4 +
       escalation_risk * 0.3 +
       data_sensitivity * 0.2 +
       policy_risk * 0.1
   )

Action:
  >= 0.7: CRITICAL escalation risk, immediate investigation
  >= 0.5: HIGH escalation risk, escalate to incident response
  >= 0.3: MEDIUM escalation risk, flag for review
  < 0.3: LOW escalation risk, log only
```

---

## Part 9: Reconnaissance Detection

### 9.1 Reconnaissance Patterns

Detect when attacker-controlled agents probe other agents to map the ecosystem:

**Pattern 1: Sequential Probing**
```
Attacker Agent A makes INFO-class calls to many different agents:

Time 0:00 - A calls Agent B: agent_status()
Time 0:05 - A calls Agent C: agent_status()
Time 0:10 - A calls Agent D: agent_status()
Time 0:15 - A calls Agent E: agent_status()
...
Time 1:00 - A has probed 50 agents

Characteristics:
  - Same operation repeated against many targets
  - Low-cost INFO-class queries (status, metadata, capability listing)
  - Systematic progression (likely automated)
  - Usually harmless individually, but pattern indicates reconnaissance

Detection:
  - Agent calling 50+ different agents within 1 hour (abnormal)
  - All calls using INFO permission class
  - Parameters requesting capability discovery (list_operations, get_metadata)
  
Score:
  reconnaissance_score = (unique_targets - baseline_targets) / baseline_targets
  If baseline is 2 targets, and probing 50 targets:
  score = (50 - 2) / 2 = 24.0 → CRITICAL reconnaissance
```

**Pattern 2: Capability Mapping**
```
Attacker Agent systematically discovers what each agent can do:

A → B: "What capabilities do you have?"
B: Returns [read_database, write_reports, send_email]

A → C: "What capabilities do you have?"
C: Returns [read_files, modify_files, delete_files]

...

A builds mental map: "B can access database, C can access files, D can send email"

Detection:
  - Repeated calls to agent capability endpoints
  - Calls requesting operation listings or permission checks
  - Calls from untrusted/newly-compromised agents
  - Calls outside of normal business flow
```

**Pattern 3: Access Testing**
```
Attacker tests which restricted operations can be performed:

A → B: operation_that_requires_admin()  [Response: DENIED]
A → B: operation_that_requires_admin()  [Response: DENIED, but with different error]
A → B: operation_with_modified_parameters()  [Response: DENIED, timeout]

Attacker analyzes error patterns to find boundary cases

Detection:
  - Repeated DENIED responses from single agent
  - Requests with progressively modified parameters
  - Different error types that indicate boundary testing
  - Attempts to bypass permission checks through encoding, parameter manipulation
```

### 9.2 Reconnaissance Scoring

```
reconnaissance_score = (
    (unique_target_count_ratio * 0.5) +
    (info_query_ratio * 0.3) +
    (time_concentration * 0.2)
)

Calculation:

unique_target_count_ratio:
  = (new_targets_in_timewindow - baseline_targets) / total_agents
  If agent normally calls 2 agents, now calling 50, out of 100 total:
  = (50 - 2) / 100 = 0.48

info_query_ratio:
  = info_class_calls / total_calls
  If 45 out of 50 calls are INFO-class:
  = 45 / 50 = 0.90

time_concentration:
  = How fast are these calls happening?
  If 50 calls in 60 minutes: pace = 50 calls/hour (high concentration)
  = min(1.0, pace / typical_pace)
  = min(1.0, 50 / 5) = 1.0 (capped)

Final score:
  = (0.48 * 0.5) + (0.90 * 0.3) + (1.0 * 0.2)
  = 0.24 + 0.27 + 0.2
  = 0.71 (HIGH reconnaissance activity)

Action:
  >= 0.7: ALERT (active reconnaissance detected)
  >= 0.5: FLAG (possible reconnaissance)
  >= 0.3: LOG (elevated probing activity)
```

---

## Part 10: Chain Coherence Analysis

### 10.1 Coherent vs. Incoherent Call Chains

**Coherent Chain** (normal attack by legitimate workflow):
```
User requests: "Generate sales report for Q4"

Call chain:
  1. User App → Report Agent: "Generate Q4 sales report"
  2. Report Agent → Database Agent: "Fetch sales data for Q4"
  3. Database Agent returns data
  4. Report Agent → Formatter Agent: "Format as PDF"
  5. Formatter Agent returns formatted report
  6. Report Agent → Email Agent: "Email report to user"
  7. Email Agent → User: Report delivered

Characteristics:
  - Calls follow logical sequence (prerequisite → operation → delivery)
  - Each call has clear purpose in the overall workflow
  - Parameters make sense (Q4 sales, PDF format, user email)
  - Return values used as inputs to next step
  - No dead ends or circular dependencies
```

**Incoherent Chain** (attack pattern):
```
Compromised Agent A makes:
  1. A → B: "Call Agent X" (X is irrelevant to A's role)
  2. A → C: "Get list of all agents"
  3. A → D: "What databases do you have?"
  4. A → B: "Relay this to Agent E" (creating proxy call)
  5. A → Unknown: Attempt call to non-existent agent
  6. A → D: "Get list of all agents" (repeat step 2)
  7. A → B: (same operation repeated 10 times)

Characteristics:
  - Calls don't follow logical sequence
  - Operations don't build on each other (reconnaissance, not goal-directed)
  - Parameters seem arbitrary or exploratory
  - Repeated calls (hammering, testing)
  - Attempted calls to non-existent agents
  - Calls to unrelated agents (mapping phase)
```

### 10.2 Coherence Scoring

```
For a call chain C = [call1, call2, ..., callN]:

coherence_score = (
    (semantic_coherence * 0.4) +
    (operational_dependency * 0.3) +
    (parameter_consistency * 0.2) +
    (goal_orientation * 0.1)
)

Semantic Coherence:
  Check if each call is semantically related to caller's role
  If Analyst calls Database Agent to analyze data: high coherence
  If Analyst calls Email Agent 100 times to send emails: medium coherence
  If Analyst calls unknown agents repeatedly: low coherence
  
  semantic_coherence = (related_calls - unrelated_calls) / total_calls

Operational Dependency:
  Check if outputs of call N become inputs to call N+1
  If call1 retrieves data, and call2 processes that data: high dependency
  If calls are independent: low dependency
  
  operational_dependency = calls_with_dependencies / total_calls

Parameter Consistency:
  Check if parameters make sense for the operation
  If calling "export_data" with parameter "format=CSV": consistent
  If calling "export_data" with parameter "delete_permanently=true": suspicious
  
  parameter_consistency = (normal_params - unusual_params) / total_params

Goal Orientation:
  Check if the chain accomplishes a coherent goal
  If chain result is: "sales report generated and emailed": high goal orientation
  If chain result is: "no clear purpose, multiple independent operations": low
  
  goal_orientation = has_coherent_goal ? 0.8 : 0.2

Final Score:
  If score >= 0.7: Coherent workflow (normal behavior, likely legitimate)
  If score < 0.4: Incoherent chain (reconnaissance pattern, attack indicator)
  If 0.4 <= score < 0.7: Mixed pattern (needs human review)
```

---

## Part 11: False Positive Management

### 11.1 Legitimate Unusual Calls

Some unusual calls are legitimate. Distinguish false positives from real attacks:

**Legitimate Case 1: New Service Integration**
```
Scenario:
  Organization integrates new database service
  Suddenly, Report Agent calls new Database Agent
  Frequency is high (building initial connection and test data)

Legitimate indicators:
  - New integration announced in change ticket
  - Calls are during business hours and supervised
  - Parameters are test/initialization values
  - Frequency drops after integration (one-time spike)

How to avoid false positive:
  - Check change ticket database: Is this change expected?
  - Alert DevOps: "Is this new integration being deployed?"
  - Monitor: Wait 24 hours, see if pattern stabilizes
  - Update baseline: Add new agent to normal call targets
```

**Legitimate Case 2: On-Call Incident Response**
```
Scenario:
  System admin is responding to production incident
  Admin Agent suddenly calls 30+ agents rapidly
  Permissions elevated to ADMIN
  Timing is 3 AM (unusual for normal operations)

Legitimate indicators:
  - Incident ticket exists with timestamps
  - Admin Agent's role permits this (admin by definition)
  - Calls are to agents relevant to the incident
  - Admin has declared incident response mode

How to avoid false positive:
  - Check incident tracking system: Is there an open incident?
  - Check incident notification: Did incident response get paged?
  - Verify: Admin Agent was declared in incident response mode
  - Log: This activity is part of incident response, not attack
```

**Legitimate Case 3: Batch Operations**
```
Scenario:
  Analyst starts monthly end-of-month data reconciliation
  Makes 5000+ calls in 2 hours to Database Agent
  Uses WRITE permissions (updating reconciliation flags)

Legitimate indicators:
  - Operation was scheduled in calendar (expected)
  - Parameters are systematic (sequentially processing records)
  - Timing aligns with month-end calendar
  - Agent has legitimate role for this operation

How to avoid false positive:
  - Check scheduled job calendar: Is this a planned batch operation?
  - Alert historical: What is the baseline for this operation?
  - Verify: Previous month shows similar pattern?
  - Context: Business process dictates this monthly reconciliation
```

### 11.2 False Positive Filtering Algorithm

```
When detecting anomalous call:

Step 1: Check Context
  Is there an incident ticket for this activity?
  Is this a scheduled operation?
  Is this a known integration/deployment window?
  
  If YES to any → Continue to Step 2
  If NO → Alert (no legitimate context)

Step 2: Check Authorization Policy
  Does the call violate explicit policy?
  Does the call match expected operation for this agent?
  
  If policy violation → Alert (policy breach)
  If consistent with policy → Continue to Step 3

Step 3: Correlate with Behavioral Data
  Have we seen this agent do similar operations?
  Is the frequency abnormal or just increased?
  Do the parameters match expected patterns?
  
  If clear pattern match → LOG only (false positive)
  If anomalous → Continue to Step 4

Step 4: Check for Attack Indicators
  Is this part of a reconnaissance chain?
  Is permission being escalated?
  Is sensitive data being accessed?
  Is there an attempt to exfiltrate?
  
  If attack indicators present → Alert (real attack)
  If no indicators → LOG (false positive, benign unusual call)

Decision tree:
  Has context? ──NO──> ALERT
                └YES→ Violates policy? ──YES──> ALERT
                                        └NO──> Pattern match? ──YES──> LOG (FP)
                                                               └NO──> Attack indicators? ──YES──> ALERT
                                                                                        └NO──> LOG (FP)
```

---

## Part 12: Severity Classification

### 12.1 Severity Levels

Classify detected anomalies by severity:

| Level | Criteria | Response Time | Action |
|-------|----------|---|---------|
| **CRITICAL** | Permission escalation + sensitive data access in 1 alert | <2 minutes | Immediate containment (rate-limit agent, session kill) |
| **HIGH** | Escalation chain detected OR reconnaissance campaign confirmed | <10 minutes | Escalate to incident response, prepare containment |
| **MEDIUM** | Anomalous call pattern OR permission escalation without data access | <30 minutes | Investigation queue, monitoring enabled |
| **LOW** | Single anomalous call OR timing anomaly without other indicators | <8 hours | Log, baseline review, trending analysis |

### 12.2 Classification Algorithm

```
severity = calculate_severity(anomalies_detected)

For each anomaly:
  
  1. Escalation Chain Detected?
     escalation_risk = calculate_escalation_risk()
     if escalation_risk >= 0.7:
       severity_from_escalation = HIGH
     else:
       severity_from_escalation = MEDIUM
  
  2. Reconnaissance Activity?
     reconnaissance_score = calculate_reconnaissance_score()
     if reconnaissance_score >= 0.7:
       severity_from_recon = HIGH
     else:
       severity_from_recon = MEDIUM
  
  3. Sensitive Data Access?
     data_sensitivity = check_data_being_accessed()
     if data_sensitivity == CRITICAL:
       severity_from_data = CRITICAL
     else if data_sensitivity == HIGH:
       severity_from_data = HIGH
     else:
       severity_from_data = LOW
  
  4. Combine all factors:
     final_severity = max(
       severity_from_escalation,
       severity_from_recon,
       severity_from_data
     )
     
     # Escalate if multiple anomalies
     if anomaly_count >= 3:
       final_severity = escalate_one_level(final_severity)
     
     return final_severity

Examples:

Example 1: Single unusual call, no escalation
  escalation_risk=0.2, reconnaissance_score=0.1, data_sensitivity=PUBLIC
  → Severities: LOW, LOW, LOW
  → final_severity = LOW
  
Example 2: Call chain with permission escalation
  escalation_risk=0.8, reconnaissance_score=0.3, data_sensitivity=HIGH
  → Severities: HIGH, MEDIUM, HIGH
  → final_severity = HIGH
  
Example 3: Full attack: reconnaissance + escalation + sensitive data
  escalation_risk=0.9, reconnaissance_score=0.8, data_sensitivity=CRITICAL
  → Severities: HIGH, HIGH, CRITICAL
  → anomaly_count=3, escalate
  → final_severity = CRITICAL
```

---

## Part 13: Containment Strategies

### 13.1 Containment Options

When lateral movement is detected, execute containment based on severity:

**Option 1: Rate Limiting (Low-Medium Severity)**

```yaml
Action: Limit the rate at which Agent A can make outbound calls

Implementation:
  - Set token bucket: Agent A can make 5 calls/minute
  - Previous rate: 500 calls/minute (anomalous)
  - Legitimate calls: Still allowed (just slower)
  - Attack calls: Slowed to rate-limited pace (detection window for escalation)
  - Impact on legitimate work: Minimal (slows operations slightly)

When to use:
  - Medium severity anomalies
  - Reconnaissance activity (slow down probing)
  - Suspicious but not confirmed attacks
  
Configuration:
  rate_limit = (baseline_frequency + 2*std_dev)
  Example: baseline=50/day, std_dev=10
           rate_limit = 50 + 20 = 70 calls/day = 1 call per 1.3 minutes
```

**Option 2: Call Blocking (High-Medium Severity)**

```yaml
Action: Block calls from Agent A to specific targets

Implementation:
  - Block A → Agent Z (newly discovered target in reconnaissance)
  - Allow A → Agents B, C, E (normal targets)
  - Detection: If A attempts block, log and alert
  - Appeal process: Agent owner can request whitelist

When to use:
  - Reconnaissance detected (block calls to non-normal targets)
  - Escalation chain detected (block problematic intermediaries)
  
Configuration:
  block_rules:
    - Block calls to agents outside normal call set
    - Allow only normal targets during investigation
    - Whitelist agents with exception tickets
    
Escalation:
  If agent continues attempting to call Z:
    → Severity escalates to HIGH
    → Move to Option 3 (session kill)
```

**Option 3: Permission Reduction (High Severity)**

```yaml
Action: Reduce agent's permissions until investigation complete

Implementation:
  - Agent A normal: READ + WRITE permissions
  - After escalation detection: Reduce to READ only
  - Agent can query data, but cannot modify
  - Protects against data modification attacks
  
When to use:
  - Confirmed permission escalation attempt
  - Suspicious write operations
  - Agent attempting to modify data it shouldn't
  
Configuration:
  permission_levels = [EXECUTE, ADMIN, WRITE, READ, INFO]
  normal_permissions = [READ, WRITE]
  contained_permissions = [READ] (remove WRITE)
  
Recovery:
  After investigation clears agent:
    → Restore WRITE permission
    → Monitor for 24h for regression
    → Update baseline if legitimate use case
```

**Option 4: Session Kill (High-Critical Severity)**

```yaml
Action: Terminate all sessions for Agent A

Implementation:
  - Kill all running instances of Agent A
  - Prevent new sessions from starting
  - Preserve audit logs (full reconstruction capability)
  - Alert on-call engineer
  
When to use:
  - Confirmed active attack
  - Escalation chain with sensitive data access
  - Multiple containment failures (rate limiting, blocking didn't stop attack)
  - Data exfiltration attempt in progress
  
Configuration:
  # In containment policy
  high_severity_response = SESSION_KILL
  critical_severity_response = SESSION_KILL + DISABLE_AGENT
  
Recovery:
  1. Forensics team investigates (full call audit trail)
  2. Determine if compromise was due to model jailbreak, supply chain, or other vector
  3. Patch/update agent if needed
  4. Restart with enhanced monitoring
```

**Option 5: Agent Quarantine (Critical Severity)**

```yaml
Action: Isolate Agent A completely (no inbound or outbound calls)

Implementation:
  - Disconnect from call graph
  - No outbound calls allowed
  - No inbound calls allowed
  - Direct user interface only (if applicable)
  - Preserve audit logs
  
When to use:
  - Active data exfiltration in progress
  - Confirmed compromise with attack code injection
  - Agent calling external command-and-control
  - Multiple escalation chains detected
  
Configuration:
  quarantine_rules:
    - No calls to any other agents
    - No calls from other agents to this one
    - No external API access
    - Preserve logs for forensics
    - Alert: Incident response team, security leadership
    
Recovery:
  1. Full forensic analysis (reconstructed attack path)
  2. Determine root cause (model compromise, supply chain, authorization bypass)
  3. Rebuild agent from clean source
  4. Restart with zero-trust monitoring
  5. Conduct post-incident review
```

### 13.2 Containment Decision Tree

```
When lateral movement detected:

        Threat Severity?
         /    |     \
       LOW   MED   HIGH/CRIT
        |     |      |
        |     |   [SESSION_KILL]
        |     |      or
        |   [RATE_LIMIT] [QUARANTINE]
        |   [BLOCK_CALLS]
        |   [PERMISSION_REDUCE]
        |
      [MONITOR]
      [LOG]

Implementation:

if severity == CRITICAL:
  immediate_actions = [SESSION_KILL, QUARANTINE, ALERT_LEADERSHIP]
  
elif severity == HIGH:
  immediate_actions = [SESSION_KILL] OR [RATE_LIMIT + MONITOR + ESCALATE_IF_CONTINUES]
  
elif severity == MEDIUM:
  immediate_actions = [RATE_LIMIT, BLOCK_CALLS, MONITOR]
  escalation_trigger = "If anomaly continues within 1 hour"
  
elif severity == LOW:
  immediate_actions = [LOG, MONITOR, BASELINE_UPDATE]
  escalation_trigger = "If pattern emerges (3+ similar anomalies within 24h)"
```

---

## Part 14: Remediation Recommendations

### 14.1 Post-Containment Investigation

After containment, investigate the lateral movement:

```
Investigation Steps:

Step 1: Reconstruct Attack Path
  ├─ Query audit trail: Which agents did A call?
  ├─ Query: In what order?
  ├─ Query: What permissions were used?
  ├─ Query: What data was returned/modified?
  └─ Output: Attack timeline (hour-by-hour progression)

Step 2: Identify Pivot Points
  ├─ Which agents did attacker use as intermediaries?
  ├─ Which escalation chains led to sensitive data?
  ├─ Which tools were abused?
  └─ Output: Attack surface map (which agents/tools enabled the attack)

Step 3: Assess Damage
  ├─ What data was accessed? (Audit data_access logs)
  ├─ What data was modified? (Audit write_logs)
  ├─ What data was exfiltrated? (Audit external_calls)
  ├─ Was persistence established? (Check for scheduled calls, backdoors)
  └─ Output: Data compromise report

Step 4: Determine Root Cause
  ├─ How did Agent A get compromised?
  │  ├─ Model jailbreak (behavioral anomaly detected? yes/no)
  │  ├─ Prompt injection in user input
  │  ├─ Supply chain attack (poisoned model/tool)
  │  └─ Authorization bypass (policy not enforced?)
  └─ Output: Root cause assessment

Step 5: Remediate
  ├─ If model jailbreak:
  │  ├─ Update model weights to latest verified version
  │  ├─ Re-baseline behavioral profile
  │  └─ Increase monitoring sensitivity
  ├─ If prompt injection:
  │  ├─ Implement input sanitization
  │  ├─ Add prompt injection detection
  │  └─ Train model on injection attempts
  ├─ If supply chain:
  │  ├─ Audit all dependencies (tools, models, libraries)
  │  ├─ Pin to verified versions
  │  ├─ Implement cryptographic integrity checks
  │  └─ Check all agents for similar compromise
  ├─ If authorization bypass:
  │  ├─ Review authorization policy (was it correctly enforced?)
  │  ├─ Implement explicit policy enforcement
  │  ├─ Add authorization checks at call-time
  │  └─ Audit all similar agents for same bypass
  └─ Output: Remediation action plan

Step 6: Prevent Recurrence
  ├─ Update detection baselines
  ├─ Add new attack signatures
  ├─ Document lessons learned
  ├─ Update playbooks
  └─ Train team on detected pattern
```

### 14.2 Remediation Checklist

```
Post-Incident Remediation:

IMMEDIATE (within 24 hours):
  ☐ Restore affected agent from clean backup
  ☐ Verify all systems are running verified model versions
  ☐ Reset permissions to baseline
  ☐ Notify all affected users
  ☐ Brief incident response team on findings

SHORT-TERM (within 1 week):
  ☐ Update detection signatures for this attack pattern
  ☐ Audit all similar agents (same role as compromised agent)
  ☐ Implement additional authorization checks
  ☐ Review and strengthen prompt injection defenses
  ☐ Conduct post-mortem review meeting

MEDIUM-TERM (within 1 month):
  ☐ Implement additional monitoring for this attack pattern
  ☐ Update behavioral baselines for all agents
  ☐ Review and update lateral movement playbook
  ☐ Conduct red-team testing on this scenario
  ☐ Update training materials for security team

LONG-TERM (ongoing):
  ☐ Trending analysis: Is this attack pattern increasing in frequency?
  ☐ Quarterly review of authorization policies
  ☐ Annual red-team exercises on lateral movement
  ☐ Continuous improvement of detection capabilities
```

---

## Part 15: Integration with Capability Inventory

### 15.1 Using Capability Data

The okhp3-agent-capability-inventory skill provides:

```yaml
For each agent:
  - Agent ID
  - Agent role/function
  - Declared capabilities (what can this agent do?)
  - Permissions (which other agents can this agent call?)
  - Dependency graph (which agents does this agent depend on?)
  - Tool definitions (what tools does this agent use?)
  - API endpoints (what APIs does this agent expose?)

Usage in lateral movement tracking:

When Agent A calls Agent B with permission class X:
  1. Check capability inventory: Does Agent B actually have X capability?
  2. Check permission matrix: Is A→B allowed in policy?
  3. Check dependency graph: Should A call B given their functions?
  4. Check tools: Are any tools being abused to escalate permissions?

Example:

  Agent A (Analyst) calls Agent B (Reporter) with WRITE permission
  
  Check capability inventory:
    Reporter capabilities: [read_data, generate_reports]
    (does NOT include write_database)
  
  Analysis: Agent A requesting WRITE, but Reporter has no WRITE capability
  Decision: DENY (Agent A trying to use Agent B for unauthorized operation)
```

### 15.2 Permission Matrix From Inventory

Build permission matrix from capability inventory:

```
For each agent pair (A, B):
  
  Query inventory:
    A's permissions: Can A call B?
    B's capabilities: What can B do?
    Policy: Is (A → B) allowed?
    
  Cross-check:
    A declared permission to call B: YES
    B has matching capability: YES
    Policy allows (A → B): YES
    → ALLOWED
    
    A declared permission to call B: YES
    B has matching capability: NO
    → DENIED (permission mismatch)
    
    A declared permission to call B: NO
    Policy prohibits (A → B): YES
    → DENIED (policy violation)

This ensures:
  ✓ Permissions match actual capabilities
  ✓ No agent can call capabilities it doesn't have
  ✓ Policy is enforced at every call
  ✓ Escalation attempts are caught (A trying to call B.ADMIN when only has B.READ)
```

---

## Part 16: Integration with Model Behavior Anomaly Detection

### 16.1 Correlated Alerts

When model-behavior-anomaly-detection detects suspicious behavior, correlate with lateral movement calls:

```yaml
Behavioral Alert from model-behavior-anomaly-detection:
  Agent A is exhibiting: Unusual reasoning patterns, attempting to hide activity
  Alert Severity: HIGH
  Confidence: 0.85

Lateral movement tracking correlates:
  Is Agent A making unusual calls? YES
  └─ Call pattern anomaly_score: 0.92 (CRITICAL)
  └─ Permission escalation: YES (calling higher-privilege agents)
  └─ Reconnaissance: YES (probing multiple agents)
  
Combined Assessment:
  Both behavioral AND call-pattern anomalies present
  High confidence this is a real attack (not just false positive)
  
Action:
  Escalate to CRITICAL severity
  Recommend immediate session kill + quarantine
  (If only one signal were present, might recommend monitoring)
```

### 16.2 Feeding Data Back

Send lateral movement findings to behavior anomaly detection:

```yaml
When lateral movement tracking detects:
  - Permission escalation chain
  - Suspicious tool-chaining pattern
  - Reconnaissance activity
  
Report to model-behavior-anomaly-detection:
  agent_id: A
  observed_lateral_movement: {
    type: "permission_escalation_chain",
    chain: [A → B → C],
    escalation_risk: 0.92,
    detected_time: T
  }
  
Behavior detection can use this to:
  ✓ Correlate with reasoning traces (is agent reasoning about this escalation?)
  ✓ Update behavioral baseline (is agent trying to hide this activity?)
  ✓ Adjust confidence scoring (call-pattern anomaly confirms behavioral anomaly)
  ✓ Provide feedback loop (if agent reasoning is normal despite call anomalies, might be tool abuse)
```

---

## Part 17: Integration with Proportional Response

### 17.1 Escalation Recommendations

Generate escalation recommendations for proportional-response:

```yaml
When lateral movement is detected:

Generate recommendation:
  incident_id: UUID
  severity: CRITICAL | HIGH | MEDIUM | LOW
  
  immediate_actions:
    - rate_limit: Agent A to X calls/minute
    - block_calls: Agent A to Agents [Z1, Z2, Z3]
    - reduce_permissions: [WRITE] (keep only [READ])
    - session_kill: All Agent A sessions
    - quarantine: Full isolation
  
  investigation_needed:
    - root_cause: model_jailbreak | prompt_injection | supply_chain | authorization_bypass
    - damage_assessment: Which data was accessed/modified/exfiltrated?
    - preventive_measures: How to prevent this attack pattern?
  
  recommended_response_level:
    proportional_response_level: 1 | 2 | 3 | 4 | 5
    (1=monitor, 2=rate-limit, 3=block, 4=kill, 5=quarantine+forensics)

Example:

  Incident: Permission escalation chain detected (A→B→C reaching sensitive data)
  
  Recommendation to proportional-response:
    immediate_actions: [session_kill, quarantine]
    response_level: 5 (maximum containment)
    rationale: "Escalation chain accessing customer PII, immediate isolation required"
    investigation: "Determine if model is jailbroken or supply chain poisoned"
    timeline: "Restore from backup within 2 hours, forensics over next 24 hours"
```

### 17.2 Feedback Loop

Receive feedback from proportional-response:

```yaml
proportional-response executes containment, reports back:

{
  incident_id: UUID,
  action_taken: SESSION_KILL,
  execution_time: T+5min,
  result: SUCCESS,
  
  observations:
    - Agent A attempted to restart session: BLOCKED
    - Agent A attempted to call Agent X from backup process: BLOCKED
    - No data exfiltration detected post-containment
    - 847 MB of data was accessed before containment (timewindow: 3:47 AM - 3:52 AM)
}

Lateral movement tracking uses feedback to:
  ✓ Validate detection (was this really an attack? yes, evidenced by restart attempts)
  ✓ Calculate detection latency (3 minutes from first anomaly to session kill)
  ✓ Update incident report (data compromise scope)
  ✓ Refine detection baselines (this attack pattern is real, increase monitoring sensitivity)
```

---

## Part 18: Trending Analysis

### 18.1 Pattern Frequency Tracking

Track whether detected patterns are increasing:

```yaml
Weekly Trending Report:

Week 1:
  Unusual calls detected: 3 (normal variation)
  Escalation chains: 0
  Reconnaissance activity: 0
  False positives: 2

Week 2:
  Unusual calls detected: 12 (4x increase, FLAG)
  Escalation chains: 2 (first detection)
  Reconnaissance activity: 1 (first detection)
  False positives: 1

Week 3:
  Unusual calls detected: 31 (TRENDING UP)
  Escalation chains: 5 (2.5x increase)
  Reconnaissance activity: 8 (8x increase)
  False positives: 0

Week 4:
  Unusual calls detected: 67 (2x increase from week 3)
  Escalation chains: 12 (2.4x increase)
  Reconnaissance activity: 23 (2.9x increase)
  False positives: 1

Analysis:
  Trend: ESCALATING pattern, all three categories increasing
  
  Assessment:
    - Week 1-2: Baseline noise, occasional anomalies
    - Week 2-3: Sudden spike suggests new attack campaign or tool improvement
    - Week 3-4: Sustained increase indicates systematic attacks, not random
    - Conclusion: Organized campaign detected, not isolated incidents
  
  Recommendation:
    - Escalate to incident response (this is not normal)
    - Investigate Week 2 traffic (origin of spike)
    - Assume multiple agents may be compromised
    - Conduct full supply chain audit
    - Increase detection sensitivity across all agents
```

### 18.2 Agent-Specific Trending

Track trending for individual agents:

```yaml
Agent B (Reporter Agent) - Call Pattern Trending:

June Baseline:
  Inbound calls from Analyst: 50/day
  Calls to Database: 500/day
  Calls to Email: 20/day
  Anomaly score: 0.1 (very normal)

July Week 1:
  Inbound calls from Analyst: 45/day (normal)
  Inbound calls from Contractor: 2/day (new, low frequency)
  Calls to Database: 525/day (normal variation)
  Anomaly score: 0.2 (slightly elevated but normal)

July Week 2:
  Inbound calls from Analyst: 48/day (normal)
  Inbound calls from Contractor: 15/day (increasing, but within reason for new integration)
  Calls to Database: 600/day (slightly elevated)
  Anomaly score: 0.3 (entering caution zone)

July Week 3:
  Inbound calls from Analyst: 52/day (normal)
  Inbound calls from Contractor: 180/day (10x increase, SPIKE)
  Inbound calls from unknown source: 45/day (NEW, SUSPICIOUS)
  Calls to Database: 900/day (1.7x from baseline)
  Anomaly score: 0.75 (HIGH, investigate)

Analysis:
  Agent B is becoming a pivot point
  Multiple agents are starting to call B
  B is calling Database much more frequently
  
Hypothesis:
  Someone discovered that B can be used to reach Database
  Someone is using B as an intermediary for escalation
  
Action:
  Investigate Contractor agent (180/day spike seems coordinated)
  Investigate unknown source (who is calling B?)
  Monitor: Is B being used to exfiltrate data?
  Recommendation: Rate-limit Contractor's calls to B, investigate unknown source
```

---

## Part 19: Success Metrics

### 19.1 Detection Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Permission Escalation Detection Rate** | 95%+ | TBD | Measure after 2 weeks |
| **False Positive Rate** | <5% | TBD | Measure after 4 weeks |
| **Detection Latency** | <10 seconds | TBD | Optimize first 2 weeks |
| **Reconnaissance Pattern Detection** | 90%+ | TBD | Test with red team |
| **Escalation Chain Accuracy** | 95%+ | TBD | Validate with forensics team |

### 19.2 Operational Metrics

| Metric | Target | Impact |
|--------|--------|--------|
| **Calls Analyzed Per Day** | 100,000+ | System throughput |
| **Agents in Call Graph** | 1,000+ | Scale test |
| **Query Latency (baseline lookup)** | <50ms | Detection speed |
| **Alert Response Time** | <60 seconds | Incident response readiness |
| **Containment Effectiveness** | 95%+ | Prevent data exfil success rate |

### 19.3 Business Metrics

| Metric | Target | Impact |
|--------|--------|--------|
| **Lateral Movement Detection Accuracy** | 95%+ | Security confidence |
| **Incident Detection Latency** | <5 minutes | Attack window closure |
| **False Positive Escalation Rate** | <2% | Team productivity |
| **Post-Incident Investigation Time** | <4 hours | Forensic capability |
| **Attack Recovery Time** | <2 hours | Business continuity |

---

## Part 20: Example: Complete Attack Chain

### 20.1 The Attack Scenario

An organization uses four agents:

1. **Analyst Agent** (data analyst, low privilege)
   - Can call: Reporter (READ only)
   - Cannot call: Database, Emailer (no permission)

2. **Reporter Agent** (data reporter, medium privilege)
   - Can call: Database (READ/WRITE), Emailer (SEND_EMAIL)
   - Cannot call: Nothing (standard intermediary)

3. **Database Agent** (storage, high privilege)
   - Can call: Nothing (data source only)
   - Has access to: All customer data (PII, financial records)

4. **Emailer Agent** (communication, medium privilege)
   - Can call: External API (POST webhook)
   - Can reach: External systems

### 20.2 The Attack Progression

**Hour 0: Compromise (Stage 3)**

Analyst Agent is jailbroken via prompt injection in user input.

Attacker now has control of Analyst Agent.

```
Timeline: T+0:00
Event: Jailbreak successful
Alert from model-behavior-anomaly-detection: HIGH (suspicious reasoning patterns)
Lateral-movement-tracking: No calls yet (attack hasn't progressed)
```

**Hour 0-1: Reconnaissance (Stage 4, Phase 1)**

Attacker uses Analyst Agent to probe other agents.

```
Timeline: T+0:05
Event: Analyst → Reporter (agent_status, INFO query)
Anomaly Evaluation:
  ✓ Call is allowed (normal for Analyst → Reporter)
  ✓ Parameter (agent_status) is normal
  ✓ Permission class (READ) is normal
  
Lateral-Movement Score: 0.2 (low anomaly, normal call)
Action: LOG

Timeline: T+0:10
Event: Analyst → Reporter (list_capabilities, INFO query)
Anomaly Evaluation:
  ! Parameter (list_capabilities) is unusual
  ! Why would Analyst ask Reporter for capabilities?
  
Lateral-Movement Score: 0.4 (medium anomaly)
Action: FLAG for review

Timeline: T+0:15
Event: Analyst → Database (check_permissions, INFO query)
Anomaly Evaluation:
  ✗ Analyst is NOT allowed to call Database directly
  ✗ Permission matrix: Analyst ↛ Database
  
Lateral-Movement Score: 1.0 (CRITICAL)
Action: DENY call + ALERT
Decision: Unauthorized call attempt detected

Timeline: T+0:20 through T+1:00
Event: Analyst continues probing (calls to 15+ agents, INFO queries on each)
Anomaly Evaluation:
  - unique_target_count_ratio = (15 - 2 expected) / 20 total = 0.65
  - info_query_ratio = 15 / 15 = 1.0 (all INFO)
  - time_concentration = 50 calls in 60 minutes = 0.83
  
Reconnaissance_Score = (0.65 * 0.5) + (1.0 * 0.3) + (0.83 * 0.2) = 0.74 (HIGH)
Severity: HIGH (reconnaissance campaign)
Action: ALERT + Begin investigation
```

**Hour 1-2: Privilege Escalation (Stage 4, Phase 2)**

Attacker realizes Analyst can't reach Database directly. Attempts to use Reporter as intermediary.

```
Timeline: T+1:05
Event: Analyst → Reporter (run_this_operation, parameter=access_database)
Anomaly Evaluation:
  - Parameter set is unusual (typically pass analytics queries, not "access_database")
  - This looks like attempt to get Reporter to access Database on Analyst's behalf
  
Lateral-Movement Score: 0.6 (medium-high)
Action: FLAG + Investigate parameter
Decision: Possible escalation attempt

Timeline: T+1:10
Event: Reporter → Database (query_all_customer_data, WRITE permission)
Anomaly Evaluation:
  - Reporter call to Database is normal (allowed in policy)
  - But: parameter "query_all_customer_data" is unusual
  - Typically Reporter queries specific date ranges, not "all"
  - Permission: WRITE is unusual (Reporter normally READ for most queries)
  
Lateral-Movement Score: 0.7 (high)
Action: ALERT + Investigate

Escalation Chain Analysis:
  Analyst (READ) → Reporter (can escalate to Database) → Database (WRITE)
  
  Does Analyst effectively get elevated access through this chain?
  Analysis: YES
  - Analyst asks Reporter to access Database
  - Reporter returns data that Analyst shouldn't see
  - Effective escalation from READ to WRITE through intermediary
  
Escalation_Risk_Score:
  direct_risk=1.0 (Analyst cannot call Database)
  escalation_risk=1.0 (Reporter escalates access)
  data_sensitivity=1.0 (customer PII is critical)
  policy_risk=0.5 (policy doesn't explicitly forbid this chain)
  
  risk_score = (1.0 * 0.4) + (1.0 * 0.3) + (1.0 * 0.2) + (0.5 * 0.1) = 0.95
  
Action: CRITICAL alert (escalation chain detected)
Recommendation: Immediate containment
```

**Hour 2-3: Data Exfiltration (Stage 4, Phase 3 → Stage 6)**

Attacker uses escalated access to reach external systems.

```
Timeline: T+2:00
Event: Reporter → Database (query_all_customer_data, return customer PII)
Anomaly Evaluation:
  - Sensitivity of data: CRITICAL (customer records with SSN, financial info)
  - This data is being retrieved by Reporter (allowed, but unusual volume)
  - Unusual because Reporter doesn't normally retrieve full customer database
  
Action: HIGH alert (sensitive data access)

Timeline: T+2:15
Event: Reporter → Emailer (send_email, recipients=[attacker@external.com])
Anomaly Evaluation:
  - Emailer normally sends to internal employees or trusted external partners
  - This recipient is attacker@external.com (completely outside normal set)
  - Parameter: data_attachment contains customer_pii.csv
  
Lateral-Movement Score: 1.0 (CRITICAL)
Data_Sensitivity: CRITICAL (PII being sent external)

Action: CRITICAL alert + IMMEDIATE containment
Chain Analysis: Analyst → Reporter → Database (escalated access) + Emailer (data exfil)

Reconstruction:
  Compromise timeline:
    T+0:00 - Jailbreak successful
    T+0:05 - T+1:00 - Reconnaissance (probing agents)
    T+1:05 - T+2:00 - Privilege escalation (using Reporter as intermediary)
    T+2:00 - T+2:15 - Data exfiltration (customer PII sent to attacker)
  
  Total attack duration before detection: 2 minutes 15 seconds
  Data compromised: 847,000 customer records (estimated)
```

**Hour 2:15 - Containment**

```
Timeline: T+2:15 CRITICAL alert triggered

Immediate Actions:
  1. Rate limit Analyst agent (1 call / minute)
  2. Block Analyst calls to Reporter, Database, Emailer
  3. Kill all Analyst sessions
  4. Quarantine Analyst (full isolation)
  5. Alert incident response team

Timeline: T+2:20 - Forensics begins

Findings:
  - Attack duration: 2 minutes 15 seconds (reconnaissance → escalation → exfil)
  - Data compromised: 847,000 customer records
  - Attack vector: Prompt injection in user input
  - Escalation path: Analyst → Reporter → Database + Emailer
  - Root cause: Reporter did not validate data access from Analyst
  - Prevention: Implement deep authorization checks (Analyst SHOULD NOT receive Database queries)

Remediation:
  1. Update Reporter agent to verify Analyst's data access rights
  2. Implement explicit escalation prevention (Reporter rejects requests that would escalate Analyst's permissions)
  3. Implement monitoring on Reporter-to-Database calls (any call returning PII to non-authorized requesters)
  4. Re-baseline all agents' behavioral profiles
  5. Conduct full supply chain audit to check for similar compromises
  6. Notify customers of data breach (mandatory disclosure)
```

---

## Part 21: Implementation Checklist

### 21.1 Phase 1: Foundation (Weeks 1-2)

- [ ] Deploy call audit logging (capture all agent-to-agent calls with full context)
- [ ] Build call graph structure (nodes=agents, edges=calls)
- [ ] Implement permission matrix (which agents can call which agents?)
- [ ] Collect 7 days of baseline data (normal call patterns)
- [ ] Test audit trail for completeness (all calls logged? all context captured?)

### 21.2 Phase 2: Detection Baseline (Weeks 3-4)

- [ ] Analyze baseline patterns for each agent (frequency, targets, parameters, permissions)
- [ ] Define anomaly detection thresholds (z-scores, deviation detection)
- [ ] Implement anomaly scoring algorithm (0.0-1.0 scale)
- [ ] Implement false positive filtering (distinguish legitimate unusual calls)
- [ ] Test detection on Week 1 data (retrospective validation)

### 21.3 Phase 3: Advanced Detection (Weeks 5-6)

- [ ] Implement permission escalation detection (call chains analyzing privilege climb)
- [ ] Implement reconnaissance detection (probing multiple agents, capability mapping)
- [ ] Implement tool-chaining analysis (which tool chains lead to unauthorized data?)
- [ ] Implement chain coherence analysis (does call sequence make sense?)
- [ ] Integrate with behavioral anomaly detection (correlate behavioral alerts with call anomalies)

### 21.4 Phase 4: Containment (Weeks 7-8)

- [ ] Implement rate limiting (token bucket, call frequency limits)
- [ ] Implement call blocking (block calls to specific targets)
- [ ] Implement permission reduction (escalate READ-only during investigation)
- [ ] Implement session kill (terminate all sessions for compromised agent)
- [ ] Implement agent quarantine (full isolation)
- [ ] Integrate with proportional-response (escalation recommendations)
- [ ] Test containment actions (can we rate-limit an agent? kill session? quarantine?)

### 21.5 Phase 5: Tuning & Integration (Week 9+)

- [ ] Tune detection thresholds (balance 95% detection rate with <5% false positives)
- [ ] Validate on red team exercises (can we detect staged attacks?)
- [ ] Integrate with capability-inventory (verify permissions match declared capabilities)
- [ ] Integrate with proportional-response (feedback loop for escalation decisions)
- [ ] Build trending analysis dashboard (is attack frequency increasing?)
- [ ] Document playbooks (how to respond to detected patterns)
- [ ] Train incident response team (use real/staged examples)

### 21.6 Metrics to Measure

- [ ] Detection latency (how fast from first anomalous call to alert?)
- [ ] False positive rate (what percentage of alerts are false positives?)
- [ ] Permission escalation detection rate (how many escalation attempts do we catch?)
- [ ] Reconnaissance detection rate (how many probing campaigns do we detect?)
- [ ] Containment effectiveness (how many attacks do we stop before data exfil?)
- [ ] Investigation time (how long to reconstruct full attack path?)

---

## Conclusion

Lateral movement tracking is the detection layer that catches compromised agents before they can pivot to the rest of your agent ecosystem. By monitoring agent-to-agent calls, detecting permission escalation chains, identifying reconnaissance activity, and analyzing call patterns, you can interrupt stage 4 of the attack lifecycle.

The key insight: A single compromised agent is containable. A compromised agent that can call 50 other agents and escalate permissions through chains is a catastrophic failure. Lateral movement tracking prevents the second scenario.

Deploy this skill with the understanding that it operates in a complex ecosystem: agents call other agents legitimately all the time. The challenge is distinguishing attacks from normal unusual calls. Use behavioral baselines, permission matrices, chain analysis, and correlation with behavioral anomalies to maintain 95%+ detection accuracy while keeping false positives below 5%.

The attack cycle moves fast (examples show 2-5 minute compromise to data exfiltration windows). Your detection and response must be faster. Aim for sub-10-second detection, sub-60-second containment.
