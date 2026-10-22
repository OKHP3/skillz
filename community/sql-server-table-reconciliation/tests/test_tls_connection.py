"""Connection policy checks without a database or real credentials."""

import contextlib
import importlib.util
import io
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import Mock, patch


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "reconcile.py"


class ConnectionPolicyTests(unittest.TestCase):
    def setUp(self):
        pyarrow = types.ModuleType("pyarrow")
        pyarrow.compute = types.ModuleType("pyarrow.compute")
        driver = types.ModuleType("mssql_python")
        driver.connect = Mock(return_value=object())
        self.driver = driver
        self.modules = patch.dict(sys.modules, {
            "pandas": types.ModuleType("pandas"),
            "pyarrow": pyarrow,
            "pyarrow.compute": pyarrow.compute,
            "mssql_python": driver,
        })
        self.modules.start()
        spec = importlib.util.spec_from_file_location("reconcile_tls_test", SCRIPT)
        self.subject = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.subject)

    def tearDown(self):
        self.modules.stop()

    def test_default_sql_auth_validates_certificate_and_preserves_password(self):
        self.subject.connect("prod.database.windows.net", "ProdDB", "sql",
                             user="user;name", password="p@ss;word}")
        self.driver.connect.assert_called_once_with(
            server="prod.database.windows.net", database="ProdDB", uid="user;name",
            pwd="p@ss;word}", encrypt="yes", trust_server_certificate="no")

    def test_default_entra_auth_validates_certificate(self):
        self.subject.connect("prod.database.windows.net", "ProdDB", "entra")
        self.driver.connect.assert_called_once_with(
            server="prod.database.windows.net", database="ProdDB",
            authentication="ActiveDirectoryDefault", encrypt="yes",
            trust_server_certificate="no")

    def test_explicit_development_opt_in(self):
        self.subject.connect("localhost", "DevDB", "entra", trust_server_certificate=True)
        self.assertEqual(self.driver.connect.call_args.kwargs["trust_server_certificate"], "yes")
        self.assertEqual(self.driver.connect.call_args.kwargs["encrypt"], "yes")

    def test_cli_flag_reaches_both_connections_and_warns(self):
        args = ["reconcile.py", "--source-server", "localhost", "--source-database", "Src",
                "--target-server", "localhost", "--target-database", "Dst",
                "--tables", "dbo.Orders", "--auth", "entra", "--trust-self-signed-certificate"]
        stderr = io.StringIO()
        with patch.object(sys, "argv", args), patch.object(self.subject, "connect") as connect:
            with patch.object(self.subject, "resolve_tables", return_value=[]):
                with patch.object(self.subject, "generate_report"):
                    with contextlib.redirect_stderr(stderr):
                        self.subject.main()
        self.assertEqual(connect.call_count, 2)
        self.assertTrue(all(call.kwargs["trust_server_certificate"] for call in connect.call_args_list))
        self.assertIn("certificate validation disabled", stderr.getvalue())

    def test_unknown_authentication_mode_rejected_before_connection(self):
        with self.assertRaises(ValueError):
            self.subject.connect("localhost", "DevDB", "unknown")
        self.driver.connect.assert_not_called()


if __name__ == "__main__":
    unittest.main()
