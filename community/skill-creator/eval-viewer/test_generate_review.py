"""Regression tests for non-destructive review-server startup."""
import errno
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import Mock, patch

spec = importlib.util.spec_from_file_location("review", Path(__file__).with_name("generate_review.py"))
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)


class ServerStartupTests(unittest.TestCase):
    def test_available_port_is_used(self):
        server = Mock()
        with patch.object(review, "HTTPServer", return_value=server) as bind:
            self.assertIs(review.bind_review_server(3117, "handler"), server)
        bind.assert_called_once_with(("127.0.0.1", 3117), "handler")

    def test_occupied_port_leaves_foreign_process_untouched(self):
        server = Mock()
        with patch.object(review, "HTTPServer", side_effect=[OSError(errno.EADDRINUSE, "occupied"), server]) as bind, patch("os.kill") as kill, patch("subprocess.run") as run:
            self.assertIs(review.bind_review_server(3117, "handler"), server)
        self.assertEqual([call.args[0] for call in bind.call_args_list], [("127.0.0.1", 3117), ("127.0.0.1", 0)])
        kill.assert_not_called()
        run.assert_not_called()

    def test_other_bind_errors_are_not_hidden(self):
        with patch.object(review, "HTTPServer", side_effect=OSError(errno.EACCES, "denied")) as bind:
            with self.assertRaises(OSError):
                review.bind_review_server(3117, "handler")
        self.assertEqual(bind.call_count, 1)


if __name__ == "__main__":
    unittest.main()
