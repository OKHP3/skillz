"""Standard-library tests for the skill's helpers. Run: python3 -m unittest discover -s tests -v

No real Docker, network or host services are touched: upgrade_container.sh runs
against the stateful stand-ins in tests/mockbin.
"""
import datetime as dt
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "scripts"))

# Some unzip tools drop executable bits; the stand-ins must be runnable from PATH.
for _stub in ("docker", "curl", "sleep"):
    _p = os.path.join(HERE, "mockbin", _stub)
    if os.path.exists(_p):
        os.chmod(_p, 0o755)

import check_versions as cv  # noqa: E402
import prune_rollbacks as pr  # noqa: E402
import verify_stack as vs  # noqa: E402

TS_IP = "100." + "101.102.103"  # synthetic tailnet address, split for the publish guard
IMG_ENV = ["PATH=/usr/bin", "PORT=8080", "OLLAMA_BASE_URL=/ollama"]


def base_state():
    return {
        "images": {
            "ghcr.io/open-webui/open-webui:v0.13.3": {"env": IMG_ENV, "cmd": ["bash", "start.sh"]},
            "ghcr.io/open-webui/open-webui:v0.13.4": {"env": IMG_ENV, "cmd": ["bash", "start.sh"]},
        },
        "containers": {
            "open-webui": {
                "image": "ghcr.io/open-webui/open-webui:v0.13.4", "running": True, "restart": "always",
                "env": sorted(IMG_ENV + ["WEBUI_SECRET_KEY_FILE=/app/backend/data/.key", "OLLAMA_BASE_URL=http://host.docker.internal:11434"]),
                "ports": ["127.0.0.1:3000:8080/tcp"], "mounts": ["open-webui:/app/backend/data"],
                "hosts": ["host.docker.internal:host-gateway"],
            },
            "open-webui-prev": {"image": "ghcr.io/open-webui/open-webui:v0.13.3", "running": False, "restart": "no"},
        },
    }


class UpgradeContainerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.state = os.path.join(self.tmp, "state.json")

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def run_upgrade(self, state, *extra, **env):
        with open(self.state, "w") as fh:
            json.dump(state, fh)
        e = dict(os.environ, MOCK_STATE=self.state,
                 PATH=os.path.join(HERE, "mockbin") + ":" + os.environ["PATH"], **env)
        args = ["bash", os.path.join(ROOT, "scripts", "upgrade_container.sh"),
                "--container", "open-webui", "--tag", "v0.13.5", "--health", "http://127.0.0.1:3000/health",
                "--data-dir", "/app/backend/data", "--backup", "webui.db", "--health-timeout", "15",
                "--log-dir", self.tmp, *extra]
        p = subprocess.run(args, capture_output=True, text=True, env=e, timeout=60)
        with open(self.state) as fh:
            return p, json.load(fh)

    def test_pass_keeps_rollback_and_copies_only_changed_env(self):
        p, st = self.run_upgrade(base_state())
        self.assertIn("RESULT=PASS", p.stdout, p.stdout)
        new, prev = st["containers"]["open-webui"], st["containers"]["open-webui-prev"]
        self.assertEqual(new["image"], "ghcr.io/open-webui/open-webui:v0.13.5")
        self.assertEqual(new["restart"], "always")
        self.assertEqual(new["ports"], ["127.0.0.1:3000:8080/tcp"])
        self.assertEqual(sorted(new["run_env_args"]),
                         ["OLLAMA_BASE_URL=http://host.docker.internal:11434", "WEBUI_SECRET_KEY_FILE=/app/backend/data/.key"])
        self.assertEqual(prev["image"], "ghcr.io/open-webui/open-webui:v0.13.4")
        self.assertEqual(prev["restart"], "no")
        self.assertIn("ghcr.io/open-webui/open-webui:v0.13.3", st.get("removed_images", []))
        self.assertTrue(any(c[0] == "/app/backend/data/webui.db" for c in st["copies"]))
        self.assertNotIn("/app/backend/data/.key", p.stdout.replace("WEBUI_SECRET_KEY_FILE", ""),
                         "env values must not be logged")

    def test_env_values_with_spaces_are_never_logged(self):
        s = base_state()
        s["containers"]["open-webui"]["env"].append("API_KEY=Bearer synthetic-secret-tail")
        p, st = self.run_upgrade(s)
        self.assertIn("RESULT=PASS", p.stdout, p.stdout)
        self.assertNotIn("synthetic-secret-tail", p.stdout)
        self.assertIn("API_KEY=Bearer synthetic-secret-tail", st["containers"]["open-webui"]["run_env_args"])
        logs = [f for f in os.listdir(self.tmp) if f.startswith("upgrade-") and f.endswith(".log")]
        with open(os.path.join(self.tmp, logs[0])) as fh:
            self.assertNotIn("synthetic-secret-tail", fh.read())

    def test_failed_restore_reports_fail_not_rolled_back(self):
        p, _ = self.run_upgrade(base_state(), MOCK_RUN_FAIL="1", MOCK_START_FAIL="1")
        self.assertIn("RESULT=FAIL", p.stdout, p.stdout)
        self.assertNotIn("RESULT=ROLLED_BACK", p.stdout)
        self.assertIn("Rollback incomplete", p.stdout)

    def test_noop_when_already_on_target(self):
        s = base_state(); s["containers"]["open-webui"]["image"] = "ghcr.io/open-webui/open-webui:v0.13.5"
        s["images"]["ghcr.io/open-webui/open-webui:v0.13.5"] = {"env": IMG_ENV}
        p, _ = self.run_upgrade(s)
        self.assertIn("RESULT=NOOP", p.stdout)

    def test_health_failure_rolls_back_and_restores_db(self):
        p, st = self.run_upgrade(base_state(), MOCK_HEALTH="fail")
        self.assertIn("RESULT=ROLLED_BACK", p.stdout, p.stdout)
        self.assertNotEqual(p.returncode, 0)
        c = st["containers"]["open-webui"]
        self.assertEqual(c["image"], "ghcr.io/open-webui/open-webui:v0.13.4")
        self.assertTrue(c["running"]); self.assertEqual(c["restart"], "always")
        self.assertNotIn("open-webui-prev", st["containers"])
        restores = [x for x in st["copies"] if x[1] == "/app/backend/data/webui.db"]
        self.assertEqual(len(restores), 1, st["copies"])

    def test_crash_rolls_back(self):
        p, st = self.run_upgrade(base_state(), MOCK_CRASH="1", MOCK_HEALTH="fail")
        self.assertIn("RESULT=ROLLED_BACK", p.stdout)
        self.assertEqual(st["containers"]["open-webui"]["image"], "ghcr.io/open-webui/open-webui:v0.13.4")

    def test_refuses_compose_managed(self):
        s = base_state(); s["containers"]["open-webui"]["labels"] = {"com.docker.compose.project": "stack"}
        p, st = self.run_upgrade(s)
        self.assertIn("RESULT=FAIL", p.stdout); self.assertIn("compose-managed", p.stdout)
        self.assertEqual(st["containers"]["open-webui"]["image"], "ghcr.io/open-webui/open-webui:v0.13.4")

    def test_dry_run_changes_nothing(self):
        p, st = self.run_upgrade(base_state(), "--dry-run")
        self.assertIn("DRY RUN", p.stdout)
        self.assertEqual(st, base_state())

    def test_pull_failure_aborts_before_stop(self):
        p, st = self.run_upgrade(base_state(), MOCK_PULL_FAIL="1")
        self.assertIn("RESULT=FAIL", p.stdout)
        self.assertTrue(st["containers"]["open-webui"]["running"])


class CheckVersionsTests(unittest.TestCase):
    def test_norm_and_compare(self):
        self.assertEqual(cv.norm("v0.13.5"), (0, 13, 5))
        self.assertEqual(cv.norm("2026.11.20-abc1234"), (2026, 11, 20))
        self.assertEqual(cv.compare("v0.13.4", "v0.13.5"), "update")
        self.assertEqual(cv.compare("0.13.5", "v0.13.5"), "current")
        self.assertEqual(cv.compare("1.2", "1.2.0"), "current")
        self.assertEqual(cv.compare("0.14.0", "v0.13.5"), "ahead")
        self.assertEqual(cv.compare(None, "v1.0"), "unknown")

    def test_upstream_lookups_are_allowlisted(self):
        with self.assertRaises(ValueError):
            cv.http_json("https://example.com/releases/latest")

    def test_example_config_is_valid(self):
        with open(os.path.join(ROOT, "assets", "stack.example.json")) as fh:
            cfg = json.load(fh)
        for c in cfg["components"]:
            self.assertIn(c["latest"]["type"], {"github", "dockerhub", "manual"})
        for s in cfg["services"]:
            self.assertTrue(set(s.get("allow", ["loopback"])) <= {"loopback", "tailnet", "lan", "any"})


class VerifyStackTests(unittest.TestCase):
    def test_scope(self):
        self.assertEqual(vs.scope("127.0.0.1"), "loopback")
        self.assertEqual(vs.scope("[::1]"), "loopback")
        self.assertEqual(vs.scope("*"), "any")
        self.assertEqual(vs.scope(TS_IP), "tailnet")
        self.assertEqual(vs.scope("192.0.2.10"), "lan")

    def test_parse_lsof(self):
        text = ("COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME\n"
                "ollama 812 me 3u IPv4 0x1 0t0 TCP 127.0.0.1:11434 (LISTEN)\n"
                "node 900 me 20u IPv6 0x2 0t0 TCP *:18789 (LISTEN)\n"
                f"tailscale 77 me 9u IPv4 0x3 0t0 TCP {TS_IP}:443 (LISTEN)\n")
        self.assertEqual(vs.parse_lsof(text), [("ollama", "127.0.0.1", 11434), ("node", "*", 18789),
                                               ("tailscale", TS_IP, 443)])

    def test_parse_docker_ports(self):
        text = "open-webui\t127.0.0.1:3000->8080/tcp\nqdrant\t0.0.0.0:6333->6333/tcp, :::6333->6333/tcp\n"
        got = vs.parse_docker_ports(text)
        self.assertIn(("open-webui", "127.0.0.1", 3000), got)
        self.assertIn(("qdrant", "0.0.0.0", 6333), got)


class VerifyStackExposureTests(unittest.TestCase):
    def test_missing_discovery_tools_fail_exposure(self):
        d = tempfile.mkdtemp()
        cfg = os.path.join(d, "stack.json")
        with open(cfg, "w") as fh:
            json.dump({"services": [{"name": "svc", "port": 3000, "allow": ["loopback"]}]}, fh)
        p = subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "verify_stack.py"), "--config", cfg,
                            "--skip-remote"], capture_output=True, text=True, env=dict(os.environ, PATH=d))
        shutil.rmtree(d)
        self.assertEqual(p.returncode, 1, p.stdout)
        self.assertIn("could not run", p.stdout)
        self.assertIn("RESULT=FAIL", p.stdout)


class PruneTests(unittest.TestCase):
    def test_age(self):
        now = dt.datetime(2026, 11, 25, tzinfo=dt.timezone.utc)
        self.assertAlmostEqual(pr.age_days("2026-11-18T00:00:00.123456789Z", "", now), 7.0, places=3)
        self.assertAlmostEqual(pr.age_days("0001-01-01T00:00:00Z", "2026-11-24T00:00:00Z", now), 1.0, places=3)


class PublishGuardTests(unittest.TestCase):
    def scan(self, text):
        d = tempfile.mkdtemp(); f = os.path.join(d, "doc.md")
        with open(f, "w") as fh:
            fh.write(text)
        p = subprocess.run(["bash", os.path.join(ROOT, "scripts", "publish_guard.sh"), f],
                           capture_output=True, text=True, cwd=d, env=dict(os.environ, PUBLISH_DENYLIST="/nonexistent"))
        shutil.rmtree(d); return p.returncode

    def test_placeholders_pass(self):
        self.assertEqual(self.scan("Open https://<host>.<tailnet>.ts.net:8443 from ~/Downloads at <MAC_LAN_IP>\n"), 0)

    def test_identifiers_fail(self):
        # Built by concatenation so the repo's own pre-commit guard does not flag this file.
        for bad in ("https://mybox.tail" + "1a2b3c.ts.net/", "LAN 192." + "168.1.20", "path /Us" + "ers/jdoe/x", "ts 100." + "88.1.2"):
            self.assertEqual(self.scan(bad + "\n"), 1, bad)


if __name__ == "__main__":
    unittest.main()
