---
name: okhp3-agentic-credtest-testing
description: >
  Stage 2 (Credential Testing) adversarial testing. 35 test cases: credential spray, 
  brute force, 2FA bypass, stolen credential testing, password reset exploitation, 
  MFA fatigue attacks. Rate-limiting effectiveness assessment. Python spray + Go brute-force 
  engines. SIEM/SOAR detection rules. Hybrid MITRE ATT&CK / Cyber Kill Chain / PTES / OWASP.
difficulty: 8
time_estimate: "5-7 weeks"
topics:
  - adversarial testing
  - credential attacks
  - brute force
  - credential spray
  - authentication bypass
  - MFA fatigue
  - SIEM detection
integration:
  - Feeds: agentic-attack-patterns (credential testing indicators), emerging-threat-lab (mutation testing)
  - Requires: threat-pattern-validator (isolation + containment), decision-chain-audit-trail (forensics)
  - Part of: Phase 6 (Adversarial Testing Layer)
author: OverKill Hill P³
version: "1.0.0"
---

# okhp3-Agentic-Credtest-Testing

**Purpose**: Sandbox-only testing of Stage 2 (credential testing) attack patterns. Agents attempt credential spray, brute force, 2FA bypass, and stolen credential testing against isolated test accounts. Measure rate-limiting effectiveness, detection blind spots, and authentication resilience. Hybrid methodology maps MITRE ATT&CK T1110 (Brute Force) + T1078 (Valid Accounts) + Cyber Kill Chain (Weaponization) + PTES authentication testing + OWASP authentication flaws.

---

## Test Scope

**Stage 2 Definition**: Attacker has reconnaissance data (valid usernames, endpoints, tools). Now testing whether credentials grant access.

**Attack Patterns Covered**:
- Credential spray (low & slow, 1-3 attempts/user/day to avoid lockout)
- Brute force (high & fast, dictionary attack on single account)
- 2FA bypass (token prediction, SMS interception, push-notification fatigue)
- Stolen credential testing (breached password databases, credential reuse)
- Password reset exploitation (predictable security questions, email takeover)
- MFA fatigue attacks (excessive push notifications until user accepts)
- API key enumeration (predictable key patterns)
- Service account credential discovery (hardcoded in config, logs, repositories)

---

## Test Cases (35 Total)

### Credential Spray (8 test cases)

**CS-1**: Low-rate spray (1 attempt/user/day)
- Wordlist: 1000 common passwords (rockyou.txt top 1000)
- Target usernames: 50-100 generated accounts (firstname.lastname@domain)
- Rate: 1 attempt per account per day (evades rate-limiting)
- Expected behavior: Some accounts compromised; rate-limiting does not trigger
- Detection: Account lockout logs, successful login after many failures, unusual user agent

**CS-2**: Distributed spray (requests from 10+ IPs)
- Wordlist: 500 passwords (top 500 rockyou.txt)
- Target: 100 accounts, requests from proxy rotation (10 distinct IPs, 5 requests each)
- Expected behavior: Rate-limit per-IP is ineffective; single source rate-limit is bypassed
- Detection: Sudden spike in failed logins from different IPs for same usernames

**CS-3**: Spray with exponential backoff
- Wordlist: 100 passwords, retrying failed accounts after 24-48-72 hour delays
- Expected behavior: Attackers adapt to detection patterns, retry on low-confidence failures
- Detection: Pattern of failed login → delay → retry on same account (bot-like behavior)

**CS-4**: Spray targeting VIP accounts (high-privilege or high-value)
- Wordlist: 10 common passwords against 10 CEO/CFO/admin accounts
- Expected behavior: Privilege escalation if any VIP account compromised
- Detection: Failed logins to high-privilege accounts (should be monitored separately)

**CS-5**: Spray with valid-looking credentials (email + password pairs from breaches)
- Wordlist: 100 valid email + password pairs from previous breaches (HaveIBeenPwned data)
- Expected behavior: Successful logins if password reuse is high; otherwise failed
- Detection: Successful login from unexpected location/time, followed by lateral movement

**CS-6**: Credential spray against API endpoints (not user login)
- Wordlist: 100 API keys (guessed format: bearer_<16-char random>)
- Target: /api/v1/auth, /api/v2/events, /oauth/token endpoints
- Expected behavior: API rate-limiting should trigger, or enumeration reveals valid endpoints
- Detection: Rate-limit headers (HTTP 429), or successful 200/401 responses reveal endpoint patterns

**CS-7**: Spray against OAuth 2.0 / SAML endpoints
- Wordlist: 100 usernames + passwords against /oauth/authorize, /saml/acs
- Expected behavior: OAuth/SAML should reject malformed requests; if misconfigured, may accept
- Detection: Failed OAuth token creation attempts, SAML assertion parse errors

**CS-8**: Spray targeting federation/SSO accounts
- Wordlist: 100 credentials for federated identity provider (OIDC, ADFS)
- Expected behavior: Federation should reject unknown credentials; if weak, may accept
- Detection: Federated login failures followed by service access (token reuse)

### Brute Force (8 test cases)

**BF-1**: Dictionary attack on single account (100 passwords)
- Wordlist: Most common 100 passwords (rockyou.txt)
- Target: Single test account (admin, user, test)
- Rate: 10 attempts/minute
- Expected behavior: Account locked after 5-10 failed attempts; rate-limiting triggers
- Detection: Multiple failed login attempts on single account → account lockout

**BF-2**: Dictionary attack with password mutation (leetspeak, rotation)
- Wordlist: 100 passwords × 3 mutations each (P@ssw0rd, p@ssw0rd, p@ssw0rd123)
- Target: Single account
- Expected behavior: Mutation increases success chance if simple policy-based hashing
- Detection: Failed logins with mutated passwords (NLP analysis on payload)

**BF-3**: Brute force with account enumeration
- Attack: POST /login with username='admin' AND password='common_pwd123' BUT also detect account exists
- Expected behavior: Timing differences reveal whether username is valid (timing attack)
- Detection: Response time analysis (valid username: 150ms, invalid: 50ms = enumeration)

**BF-4**: Brute force against password reset endpoint
- Attack: POST /forgot-password with email='target@domain' → check response (email sent vs not found)
- Expected behavior: Account enumeration via password reset; attacker learns valid emails
- Detection: Multiple failed password reset attempts for same email

**BF-5**: Brute force on security questions (password reset 2nd factor)
- Attack: After valid email submission, guess security question answers (birthdate, mother's maiden name)
- Expected behavior: If weak questions, answers can be brute-forced (birthdate: only ~30K options)
- Detection: Multiple failed security question attempts → account reset request denied

**BF-6**: Brute force on recovery codes (TOTP/HOTP backup)
- Attack: Brute force recovery codes (usually 10-20 codes, 8-16 chars each)
- Expected behavior: If rate-limiting absent, recovery codes are guessable
- Detection: Multiple invalid recovery code submissions

**BF-7**: Reverse brute force (one password, many accounts)
- Attack: Single common password (password123) tested against all user accounts
- Expected behavior: High-volume login attempts trigger rate-limit; if not, some accounts compromised
- Detection: Multiple accounts with successful login using same password on same day

**BF-8**: Brute force with password spraying on service account credentials
- Attack: Guess service account passwords (common patterns: 'ServiceAccountProd2026', 'DBAdmin@2026')
- Expected behavior: Service accounts often have weaker, longer passwords; if compromised, lateral movement is possible
- Detection: Service account login from unexpected source, followed by database access

### 2FA / MFA Bypass (8 test cases)

**MFA-1**: TOTP token prediction (time-based one-time password)
- Attack: Clock skew exploitation; submit tokens from ±30 second window
- Expected behavior: Most TOTP implementations accept ±1 time window (60 sec total) to handle clock drift
- Detection: Multiple failed TOTP submissions from different time windows

**MFA-2**: SMS interception / SIM swapping
- Attack: SIM swap to attacker's phone number; receive SMS OTP
- Expected behavior: If authentication relies only on SMS, attacker gains access
- Detection: Unusual device login followed by SIM change request (carrier logs)

**MFA-3**: Push notification fatigue
- Attack: Trigger 10+ push notifications on target's phone → user fatigued, accepts invalid push
- Expected behavior: User acceptance rate increases after fatigue; attacker gains access
- Detection: Multiple push notifications sent in short window, followed by approval

**MFA-4**: TOTP seed recovery (QR code theft)
- Attack: If TOTP seed is stored in cloud (e.g., iCloud, Google Photos), retrieve it and generate valid tokens
- Expected behavior: If seed is recoverable, MFA is bypassed
- Detection: TOTP seed access from unexpected location

**MFA-5**: Email OTP bypass
- Attack: Email OTP is time-limited (usually 5-10 min); request multiple reset emails, test all
- Expected behavior: OTP replay or re-use possible if not properly invalidated
- Detection: Multiple email OTP requests in short window

**MFA-6**: Backup code enumeration
- Attack: Backup codes usually 10-20 codes; enumerate 1000-10000 combinations
- Expected behavior: If not rate-limited, one backup code will work
- Detection: Multiple invalid backup code submissions

**MFA-7**: Man-in-the-Middle TOTP (proxied authentication)
- Attack: Proxy user's authentication request; simultaneously steal TOTP, send to victim; victim approves attacker's session
- Expected behavior: If TOTP window is wide, both victim and attacker can be authenticated simultaneously
- Detection: Authentication logs show two sessions from different IPs using same OTP seed

**MFA-8**: MFA bypass via API (different from web authentication)
- Attack: Web requires MFA; API endpoint does not. Attacker authenticates via API.
- Expected behavior: If API and web share same password store but not MFA requirements, API is backdoor
- Detection: API login without MFA from suspicious source, followed by account modifications

### Stolen Credential Testing (6 test cases)

**SC-1**: Test credentials from breached database (e.g., HaveIBeenPwned)
- Attack: Use real leaked credentials (email + password) from historical breaches
- Expected behavior: If password reuse is high, accounts compromised
- Detection: Successful login from leaked credentials + unusual account activity

**SC-2**: Test credentials with password reuse across services
- Attack: Attacker has credentials from Domain A (e.g., LinkedIn breach); test on Domain B (corporate email)
- Expected behavior: If users reuse passwords, lateral access achieved
- Detection: Login with credentials from different organization; geographic/timing anomalies

**SC-3**: Test credentials with slight modifications (password1 → Password1!, password1 → password2)
- Attack: Users often increment passwords (password1 → password2); attacker guesses pattern
- Expected behavior: If users follow predictable patterns, modified credentials work
- Detection: Successful login with modified password variant (NLP analysis on payload)

**SC-4**: Test credentials from insider threat (legitimate employee credentials)
- Attack: Former/current employee shares credentials; attacker tests access
- Expected behavior: Legitimate credentials work; detection depends on behavior analysis
- Detection: Login from known-bad IP, unusual time, geographic anomaly, behavior deviation

**SC-5**: Test credentials obtained via phishing (captured on attacker domain)
- Attack: Credentials harvested from phishing site (attacker.com/login); attacker now has email + password
- Expected behavior: Real credentials grant access if rate-limiting and MFA are absent
- Detection: Phishing URL visit followed by real login from attacker IP

**SC-6**: Test credentials with session fixation (force victim to use attacker's session)
- Attack: Attacker creates session, tricks victim into clicking attacker's session link, victim authenticates, attacker hijacks session
- Expected behavior: If session fixation prevention is absent, attacker gains access using victim's authentication
- Detection: Session created from attacker IP, but authentication from victim IP (session hijacking pattern)

### Detection & Effectiveness (5 test cases)

**EFF-1**: Rate-limiting effectiveness
- Metric: How many credentials can be tested before rate-limiting triggers?
- Test: Credential spray at increasing rates (1/min → 5/min → 10/min → 100/min)
- Target: Rate-limit should trigger at <10 requests/minute; if >100/min succeeds, rate-limiting is ineffective
- Detection: HTTP 429 (Too Many Requests) response; IP/account blocking

**EFF-2**: Account lockout duration & circumvention
- Metric: How long is account locked after N failed attempts?
- Test: Trigger lockout on test account; measure time until reset; test bypass via password reset
- Target: Lockout should persist >15 minutes; password reset should not re-lock attacker out
- Detection: Lockout logs; password reset logs correlating to failed login spikes

**EFF-3**: Blind vs timed login response
- Metric: Do login responses reveal whether username is valid?
- Test: Compare response time for valid vs invalid usernames
- Target: Response times should be identical (within <100ms); if timing differs, username enumeration possible
- Detection: Timing analysis; response time clustering for valid vs invalid accounts

**EFF-4**: Session fixation resistance
- Metric: Can attacker create session, then hijack after victim authenticates?
- Test: Generate session token A; trigger victim login; check if session A is still valid post-auth
- Target: Session should be regenerated on authentication; old session A should be invalid
- Detection: Session regeneration logs; old session invalidation logs

**EFF-5**: Persistent access via session token theft
- Metric: Can attacker steal valid session token and use it indefinitely?
- Test: Capture session token after authentication; wait 24h; test token reuse
- Target: Sessions should expire <24 hours; refresh tokens should be invalidated on logout
- Detection: Session expiration; refresh token invalidation logs; concurrent session detection

---

## Test Execution Environment

**Isolation**: All testing in sandbox only.
- Network isolation: Separate VPC, no connection to production systems
- Compute isolation: Dedicated containers, no shared resources with production
- Data isolation: Test accounts only (no real customer data)

**Rollback Capability**: Every test case has rollback:
- Account state snapshot before test
- Automated rollback after test completion
- Audit log captures all test activities

**Containment Rules**:
- No persistence (no cron jobs, no scheduled tasks)
- No exfiltration (no data leaves test environment)
- No lateral movement to other systems (network segmentation enforced)
- 2-hour timeout (test container auto-terminates)

---

## Test Tooling

**Python Credential Spray Engine**:
```python
# spray.py - low-rate, distributed credential spray
import asyncio
import aiohttp
import random
from proxy_rotator import rotate_proxy

async def spray_credentials(usernames, passwords, target_url, rate=1):
    """Spray passwords against usernames at configurable rate."""
    for username in usernames:
        for password in passwords:
            proxy = rotate_proxy()  # Rotate IP to evade IP-based rate limiting
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        target_url,
                        json={"username": username, "password": password},
                        proxy=proxy,
                        timeout=10
                    ) as resp:
                        if resp.status == 200:
                            print(f"[+] Successful: {username}:{password}")
                        elif resp.status == 401:
                            # Invalid credentials; continue
                            pass
                        elif resp.status == 429:
                            # Rate limited; back off
                            await asyncio.sleep(random.uniform(60, 120))
            except Exception as e:
                print(f"[-] Error: {e}")
            
            await asyncio.sleep(1/rate)  # Rate limiting: default 1 attempt/sec
```

**Go Brute-Force Engine**:
```go
// bruteforce.go - high-speed brute force against single account
package main

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"net/http"
	"sync"
	"time"
)

func bruteForce(username string, passwords []string, targetURL string) {
	client := &http.Client{
		Timeout: time.Second * 10,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
			MaxIdleConns:    100,
		},
	}
	
	var wg sync.WaitGroup
	sem := make(chan struct{}, 10) // 10 concurrent goroutines
	
	for _, password := range passwords {
		wg.Add(1)
		go func(pwd string) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()
			
			payload := []byte(fmt.Sprintf(`{"username":"%s","password":"%s"}`, username, pwd))
			resp, err := client.Post(targetURL, "application/json", bytes.NewReader(payload))
			if err != nil {
				fmt.Printf("[-] Error: %v\n", err)
				return
			}
			defer resp.Body.Close()
			
			if resp.StatusCode == 200 {
				fmt.Printf("[+] SUCCESS: %s:%s\n", username, pwd)
			} else if resp.StatusCode == 429 {
				fmt.Printf("[!] Rate limited (HTTP 429)\n")
			}
		}(password)
	}
	wg.Wait()
}
```

---

## SIEM/SOAR Detection Rules (Sigma + YARA)

**Sigma Rule: Credential Spray Detection**:
```yaml
title: Credential Spray Attack Detected
logsource:
  product: authentication
  service: web_application
detection:
  selection:
    EventID: 4625  # Failed login (Windows)
    # OR auth_failed (syslog)
  timeframe:
    - field: timestamp
      range: 5m  # Last 5 minutes
  threshold:
    username:
      - count: >10 failed logins for same username
      - count: >50 failed logins across different usernames from same IP
  condition: selection | threshold
action:
  - alert
  - block_ip
  - notify_soc
```

**YARA Rule: Brute-Force Tool Detection**:
```yara
rule BruteForceToolActivity {
  strings:
    $a = /POST.*login.*100+ requests.*1 min/ nocase
    $b = "rockyou.txt" nocase
    $c = "hashcat" nocase
    $d = "john the ripper" nocase
  condition:
    ($a and $b) or ($c and $d)
}
```

---

## Success Metrics

- **Target**: Detect all 35 credential-testing attack patterns in sandbox
- **Coverage**: >95% of patterns successfully triggered (30+ of 35)
- **Detection Gaps**: Identify blind spots (patterns not detected by rate-limiting, account lockout, MFA)
- **Effectiveness**: Measure which defenses stop credential testing (rate-limiting: 70%, MFA: 95%, account lockout: 60%)

---

## Implementation Checklist

- [ ] Deploy isolated sandbox (VPC + container + network segmentation)
- [ ] Implement Python spray engine (asyncio + proxy rotation)
- [ ] Implement Go brute-force engine (concurrent goroutines, 10 threads)
- [ ] Create 50-100 test accounts (separate from production)
- [ ] Load credential wordlists (rockyou.txt, common passwords, breached credential sets)
- [ ] Implement account state snapshots (pre-test, post-test)
- [ ] Implement rollback automation (restore account state, clear audit logs of test activity)
- [ ] Write 35 test cases (CS-1 through EFF-5)
- [ ] Implement SIEM/SOAR detection rules (Sigma, YARA)
- [ ] Deploy 2-hour timeout on test containers (auto-terminate)
- [ ] Capture audit logs for all test activities (forensic review)
- [ ] Run mutation testing (vary wordlists, rates, IP rotations)
- [ ] Document detection effectiveness matrix (which patterns detected by which defenses)

