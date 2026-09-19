"""Public package and adapter regression checks, no network or third-party deps."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class PackageContract(unittest.TestCase):
    def test_portable_profile(self):
        profile = json.loads((ROOT / 'assets/solo-profile.json').read_text())
        self.assertEqual(profile['repository'], 'OWNER/REPOSITORY')
        self.assertEqual(profile['schema_version'], 2)
        self.assertNotIn('token', json.dumps(profile).lower())

    @staticmethod
    def public_text(text):
        # Only documentation vendors and reserved synthetic fixtures may be URLs.
        from urllib.parse import urlsplit
        urls = re.findall(r"https?://[^\s<>\\\"')]+", text)
        allowed = {'docs.github.com', 'help.openai.com', 'support.claude.com', 'invalid.example'}
        if any(urlsplit(url).hostname not in allowed or urlsplit(url).username for url in urls):
            return False
        patterns = [r'(?i)[a-z]:[\\\\/](?:Users|home)[\\\\/]',
                    r'/(?:Users|home)/[A-Za-z0-9_.-]+/',
                    r'(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})',
                    r'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----']
        return not any(re.search(pattern, text) for pattern in patterns)

    def test_no_account_urls_or_credentials(self):
        for path in ROOT.rglob('*'):
            if path.is_file() and '__pycache__' not in path.parts:
                self.assertTrue(self.public_text(path.read_text(encoding='utf-8')), path.name)

    def test_public_scan_counterexamples(self):
        examples = ['https:' + '//github.com/' + 'synthetic-owner',
                    '/' + 'home/' + 'synthetic-owner/private/',
                    'C:' + '/' + 'Users/' + 'synthetic-owner/private/',
                    'github_' + 'pat_' + 'a' * 40]
        for text in examples:
            self.assertFalse(self.public_text(text))
        self.assertTrue(self.public_text('https:' + '//docs.github.com/en/actions'))

    def test_workflow_trust_boundary(self):
        text = (ROOT / 'assets/repo-settings.yml.template').read_text()
        self.assertNotIn('pull_request' + '_target', text)
        tests, audit = text.split('  tests:', 1)[1].split('  audit:', 1)
        self.assertNotIn('secrets.', tests)
        self.assertNotIn('GH_TOKEN', tests)
        self.assertIn('github.event.repository.default_branch', audit)
        self.assertIn('permissions:\n  contents: read', text)
        refs = re.findall(r'uses: ([^\s]+)', text)
        self.assertTrue(refs)
        for ref in refs:
            self.assertRegex(ref, r'^actions/[a-z-]+@[0-9a-f]{40}$')
        self.assertIn('persist-credentials: false', text)
        self.assertIn('retention-days: 7', text)
        self.assertNotIn('continue-on-error', text)

if __name__ == '__main__':
    unittest.main()
