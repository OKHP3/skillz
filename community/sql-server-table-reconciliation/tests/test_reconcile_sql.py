"""SQL construction checks; no database connection or skill execution."""

import sys
import unittest
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import reconcile  # noqa: E402


class Cursor:
    def __init__(self):
        self.queries = []

    def execute(self, query, params=None):
        self.queries.append((query, params))

    def arrow(self):
        return self

    def to_pandas(self):
        return {"TABLE_NAME": ["Orders", "Order_Items"]}


class Connection:
    def __init__(self):
        self.current = Cursor()

    def cursor(self):
        return self.current


class IdentifierSqlTests(unittest.TestCase):
    def test_valid_explicit_and_discovered_tables(self):
        conn = Connection()
        self.assertEqual(reconcile.resolve_tables(conn, "dbo.Orders,sales.Order_Items"),
                         ["dbo.Orders", "sales.Order_Items"])
        self.assertEqual(reconcile.resolve_tables(conn, "dbo.*"),
                         ["dbo.Orders", "dbo.Order_Items"])
        self.assertEqual(len(conn.current.queries), 1)
        self.assertEqual(conn.current.queries[0][1], ["dbo"])

    def test_valid_queries_quote_every_identifier(self):
        conn = Connection()
        reconcile.extract_table(conn, "sales.Order_Items", ["Order_ID", "Line2"])
        self.assertEqual(conn.current.queries[-1][0],
                         "SELECT * FROM [sales].[Order_Items] ORDER BY [Order_ID], [Line2]")
        reconcile.extract_hashes(conn, "sales.Order_Items", ["Order_ID"], ["Amount", "Tax2"])
        query = conn.current.queries[-1][0]
        self.assertIn("SELECT [Order_ID]", query)
        self.assertIn("CONCAT_WS('|', [Amount], [Tax2])", query)
        self.assertIn("FROM [sales].[Order_Items]", query)

    def test_malicious_or_malformed_identifiers_never_reach_cursor(self):
        conn = Connection()
        bad_tables = ["dbo.Orders;DROP_TABLE", "dbo.Orders--", "dbo.Orders]",
                      "dbo.Orders.extra", "dbo.", "dbo.Orders OR 1=1"]
        for table in bad_tables:
            with self.subTest(table=table), self.assertRaises(ValueError):
                reconcile.resolve_tables(conn, table)
            with self.subTest(table=table), self.assertRaises(ValueError):
                reconcile.extract_table(conn, table, ["ID"])
        with self.assertRaises(ValueError):
            reconcile.resolve_tables(conn, "dbo.*,dbo.Orders;DROP_TABLE")
        with self.assertRaises(ValueError):
            reconcile.extract_table(conn, "dbo.Orders", ["ID; DROP TABLE Users--"])
        with self.assertRaises(ValueError):
            reconcile.extract_hashes(conn, "dbo.Orders", ["ID"], ["Amount); DROP TABLE Users--"])
        self.assertEqual(conn.current.queries, [])

    def test_wildcard_metadata_cannot_bypass_identifier_validation(self):
        conn = Connection()
        conn.current.to_pandas = lambda: {"TABLE_NAME": ["Orders", "Orders]; DROP TABLE Users--"]}
        with self.assertRaises(ValueError):
            reconcile.resolve_tables(conn, "dbo.*")


if __name__ == "__main__":
    unittest.main()
