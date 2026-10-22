"""Runtime contract checks for the MCP SDK v2 Streamable HTTP client."""

import sys
import unittest
from contextlib import asynccontextmanager
from pathlib import Path
from unittest.mock import AsyncMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import connections  # noqa: E402 - import itself checks the installed SDK API
import evaluation  # noqa: E402 - exercise the evaluator's runtime imports too


class PackageImportTests(unittest.TestCase):
    def test_evaluator_uses_connection_factory(self):
        self.assertIs(evaluation.create_connection, connections.create_connection)


class FakeHTTPClient:
    def __init__(self, events):
        self.events = events

    async def __aenter__(self):
        self.events.append("http enter")
        return self

    async def __aexit__(self, *_):
        self.events.append("http exit")


class FakeSession:
    def __init__(self, events, read, write):
        self.events = events
        self.read = read
        self.write = write
        self.initialize = AsyncMock()

    async def __aenter__(self):
        self.events.append("session enter")
        return self

    async def __aexit__(self, *_):
        self.events.append("session exit")


class HTTPConnectionTests(unittest.IsolatedAsyncioTestCase):
    async def test_v2_transport_receives_owned_client_and_closes_in_order(self):
        events = []
        client = FakeHTTPClient(events)
        session = FakeSession(events, "read", "write")
        seen = {}

        @asynccontextmanager
        async def transport(*, url, http_client):
            seen["url"] = url
            seen["http_client"] = http_client
            events.append("transport enter")
            try:
                yield ("read", "write")
            finally:
                events.append("transport exit")

        def make_client(*, headers, timeout):
            seen["headers"] = headers
            seen["timeout"] = timeout
            return client

        def make_session(read, write):
            self.assertEqual((read, write), ("read", "write"))
            return session

        with (
            patch.object(connections.httpx2, "AsyncClient", side_effect=make_client),
            patch.object(connections, "streamable_http_client", side_effect=transport),
            patch.object(connections, "ClientSession", side_effect=make_session),
        ):
            connection = connections.create_connection(
                "http", url="https://example.test/mcp", headers={"X-Test": "value"}
            )
            async with connection as entered:
                self.assertIs(entered.session, session)
                session.initialize.assert_awaited_once_with()

        self.assertEqual(seen["url"], "https://example.test/mcp")
        self.assertIs(seen["http_client"], client)
        self.assertEqual(seen["headers"], {"X-Test": "value"})
        self.assertEqual((seen["timeout"].connect, seen["timeout"].read), (30, 300))
        self.assertEqual(
            events,
            [
                "http enter",
                "transport enter",
                "session enter",
                "session exit",
                "transport exit",
                "http exit",
            ],
        )
        self.assertIsNone(connection.session)

    async def test_initialization_failure_closes_transport_and_http_client(self):
        events = []
        client = FakeHTTPClient(events)
        session = FakeSession(events, "read", "write")
        session.initialize.side_effect = RuntimeError("initialization failed")

        @asynccontextmanager
        async def transport(*, url, http_client):
            self.assertEqual(url, "https://example.test/mcp")
            self.assertIs(http_client, client)
            events.append("transport enter")
            try:
                yield ("read", "write")
            finally:
                events.append("transport exit")

        with (
            patch.object(connections.httpx2, "AsyncClient", return_value=client),
            patch.object(connections, "streamable_http_client", side_effect=transport),
            patch.object(connections, "ClientSession", return_value=session),
        ):
            connection = connections.MCPConnectionHTTP("https://example.test/mcp")
            with self.assertRaisesRegex(RuntimeError, "initialization failed"):
                async with connection:
                    self.fail("initialization should fail before entering the body")

        self.assertEqual(
            events,
            [
                "http enter",
                "transport enter",
                "session enter",
                "session exit",
                "transport exit",
                "http exit",
            ],
        )
