---
name: okhp3-agentic-attack-patterns
description: >
  Pattern library and detection signatures for agentic attack lifecycle stages
  (reconnaissance, credential testing, exploitation, persistence). Provides normalized
  attack taxonomy and behavioral/technical indicators for each stage. Foundation for
  precursor detection and threat intelligence.
license: MIT
compatibility: Agent Skills compatible
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: red-teaming-detection
  origin: okhp3/skillz
  in_scope: "Attack pattern taxonomy, behavioral indicators, technical signatures, detection rules"
  out_of_scope: "Generating attack payloads, executing exploits, bypassing controls"
---

# okhp3-agentic-attack-patterns

Define the attack lifecycle agentic threats follow, so precursor-detection can catch early stages before breach.

## Purpose

Agentic attacks are predictable and repeatable. They follow an observable lifecycle:

1. **Reconnaissance** — discover what systems exist, what versions run, what's exposed
2. **Credential Testing** — enumerate accounts, spray passwords, test known breaches
3. **Exploitation** — exploit known or zero-day vulns, break into initial system
4. **Lateral Movement** — move between systems, escalate privileges, deepen access
5. **Persistence** — hide, maintain access through reboots/updates, avoid detection
6. **Exfiltration/Impact** — steal data or cause damage

Each stage has behavioral and technical signatures. This skill defines the signature library; precursor-detection uses it to catch stages 1-2 before they reach 3+.

## Agentic Attack Lifecycle

### Stage 1: Reconnaissance

**What attackers do:**
- Passive OSINT (DNS, WHOIS, cert transparency, GitHub commits, job postings)
- Active scanning (port probes, service version detection, technology fingerprinting)
- Application probing (HTTP headers, error messages, API enumeration, endpoint discovery)
- Social engineering research (employee names, org structure, public breach data)

**Behavioral indicators (agentic):**
- High volume of distinct GET requests to enumerate endpoints
- Requests to common paths (.well-known, /admin, /api, /config) in rapid sequence
- Header inspection requests (User-Agent, Server, X-Powered-By queries)
- DNS lookups for subdomains never accessed before (systematic subdomain enumeration)
- Requests from multiple source IPs in short time window (distributed scanning)

**Technical signatures:**
- 404 error rate spike for a single source
- Attempts to access /.git, /.env, /config.php, /web.config (known exposure points)
- Requests to paths with SQL injection or XSS payloads in query strings (vuln scanning)
- Shodan/Censys/nmap fingerprint requests (banner grabbing)

**Detection rule example:**
```
IF request_rate > 100/min from single source
   AND target_paths in [/.git, /.env, /admin, /api] (not normal for this agent)
   AND response_codes include 404
THEN flag as reconnaissance
```

---

### Stage 2: Credential Testing

**What attackers do:**
- Brute force common accounts (admin, root, test, demo)
- Password spray (try common passwords across many accounts)
- Reuse credentials from public breaches (credential stuffing)
- Enumerate valid users via timing or error-message differences
- Test default credentials for discovered software

**Behavioral indicators (agentic):**
- Login attempts with many distinct usernames, few passwords (spray pattern)
- Login attempts with few usernames, many passwords (brute force pattern)
- Login attempts from multiple source IPs simultaneously (distributed credential test)
- High failed login rate followed by sudden success (breach detected, now logging in)
- Rapid-fire MFA bypass attempts (TOTP enumeration, SIM swapping vectors, backup code testing)

**Technical signatures:**
- 401/403 error rate spike
- Sudden increase in `Authorization: Basic` headers with different credentials
- POST requests to /login, /auth, /authenticate from source never seen before
- Session tokens rejected then accepted (retry-until-success pattern)
- Requests with credentials from known breach databases (match against HaveIBeenPwned, etc.)

**Detection rule example:**
```
IF failed_login_count > 10 within 5 min from single source
   OR login_velocity (attempts/sec) > 1 for new source
   OR username in known_breach_database
   THEN flag as credential testing
```

---

### Stage 3: Exploitation

**What attackers do:**
- Exploit known CVEs (SQLi, RCE, path traversal, XXE, SSRF)
- Exploit zero-days (attacks without public patches)
- Chain exploits (use one vuln to reach another deeper vuln)
- Break authentication (session fixation, JWT forgery, OAuth bypasses)

**Behavioral indicators (agentic):**
- Requests with unusual character sequences (SQLi payloads: '; DROP --, %27, UNION SELECT)
- Requests with command-injection patterns (;ls, |cat, $(whoami), backtick commands)
- Requests exceeding normal size/complexity for that endpoint
- Response time anomalies (DB query from SQLi takes longer than normal request)
- Successful exploit followed by data extraction (exfil attempt begins immediately)

**Technical signatures:**
- Payloads matching known CVE patterns (CVE-2024-XXXXX, etc.)
- Requests with null bytes, encoding bypasses (URL encoding, Unicode, double-encoding)
- Error messages indicating successful injection (SQL error, stack trace, memory access)
- File access patterns (reading /etc/passwd, /proc/self/environ, system files)
- Reverse shell indicators (outbound connection to attacker-controlled IP immediately after exploit)

**Detection rule example:**
```
IF request_payload contains [SQL patterns OR command patterns OR file access patterns]
   AND response contains [error_message OR stack_trace OR system_info]
THEN flag as exploitation attempt
```

---

### Stage 4: Lateral Movement

**What attackers do:**
- Move between systems using compromised credentials
- Exploit trust relationships (internal services trusting each other)
- Use legitimate tools to traverse systems (SSH, RDP, kubectl, cloud APIs)
- Escalate privileges (kernel exploits, sudo bypasses, containerization breakouts)

**Behavioral indicators (agentic):**
- Compromised agent suddenly calling tools it never called before
- Agent accessing services in different network segment (cross-datacenter lateral movement)
- Tool chains forming unusual patterns (exploit tool → privilege escalation tool → persistence tool)
- Credential usage from unexpected contexts (admin creds from non-admin agent)
- Service-to-service communication breaking normal patterns (service A calls service B for first time)

**Technical signatures:**
- SSH/RDP connection attempts to internal IPs from newly compromised asset
- Kubernetes API calls from pod attempting to read secrets (serviceaccount escalation)
- Cloud API calls with elevated permissions from delegated identity
- Commands like `sudo -l`, `id`, `whoami`, `getent passwd` (privilege enumeration)
- Network port scans from internal IP (internal recon after foothold)

**Detection rule example:**
```
IF agent_A suddenly calls tool_B
   WHERE tool_B is in lateral_movement_tools [ssh, kubectl, aws-cli, azure-cli, rdp]
   AND this tool/combo not in agent_A baseline
   THEN flag as lateral movement attempt
```

---

### Stage 5: Persistence

**What attackers do:**
- Install backdoors, webshells, or rootkits
- Create new admin accounts
- Modify startup scripts, cron jobs, systemd services
- Compromise configuration management (Puppet, Ansible, Chef)
- Inject into supply chain (dependencies, package repos)

**Behavioral indicators (agentic):**
- Agent writing to system directories or configs after exploit
- Agent creating new tool definitions or extending capabilities
- Agent modifying logging/audit configs (to hide traces)
- Agent calling tool management APIs (register new tool, modify existing tool)
- Recurring automated actions at scheduled intervals (cron backdoor, persistent polling)

**Technical signatures:**
- File writes to /etc/cron.d, ~/.ssh/authorized_keys, /etc/sudoers (Unix persistence)
- Registry modifications to Run, RunOnce keys (Windows persistence)
- New scheduled tasks created (Windows Task Scheduler persistence)
- Configuration file modifications for infra-as-code tools
- Binary/script uploads to startup directories

**Detection rule example:**
```
IF agent writes to [persistence_paths]
   AND write follows exploitation stage
   AND write targets non-agent-owned resources
THEN flag as persistence attempt
```

---

## Usage: Pattern Library Integration

This skill provides:

1. **Pattern taxonomy** — define what each stage looks like
2. **Behavioral indicators** — what agents do that signals each stage
3. **Technical signatures** — what you see in logs/telemetry for each stage
4. **Detection rules** — concrete conditions to trigger alerts

Use this to:
- **Populate okhp3-precursor-detection** — these rules feed precursor detection
- **Train okhp3-agentic-pattern-observatory** — new patterns get classified by stage
- **Validate okhp3-threat-pattern-validator** — does an emerging attack match known stages?
- **Tune okhp3-proportional-response** — response severity tied to which stage detected

## Updating the Pattern Library

As new agentic attack techniques emerge:

1. Classify into attack stage (recon, credential test, exploitation, lateral movement, persistence)
2. Document behavioral indicators (what the agent does)
3. Document technical signatures (what appears in logs)
4. Add detection rules
5. Test rules against clean baselines (validate false-positive rate <2%)
6. Update related skills (precursor-detection, response rules)

New patterns discovered by okhp3-emerging-threat-lab feed back into this library.

## Constraints

- This skill describes ATTACK patterns, not DEFENSE
- The library is reference material; actual detection/response lives in other skills
- Pattern library is itself a target; keep it private and update it carefully
- False positives (flagging normal behavior as attack) cause alert fatigue; validate before deploying detection rules

