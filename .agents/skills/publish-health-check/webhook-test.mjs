#!/usr/bin/env node
/**
 * Dependency-free contract check for publish-health transition webhooks.
 *
 * The receiver is local and deliberately uses a synthetic URL. No repository
 * secret is read, printed, or needed.
 */

import assert from "node:assert/strict";
import { createServer } from "node:http";
import {
  notificationPayload,
  sendTransitionNotification,
} from "./send-notification.mjs";

const runUrl = "https://example.test/actions/runs/123";
const requests = [];
const responseStatuses = [204, 204, 400];

const server = createServer((request, response) => {
  let body = "";
  request.setEncoding("utf8");
  request.on("data", (chunk) => {
    body += chunk;
  });
  request.on("end", () => {
    requests.push({
      method: request.method,
      contentType: request.headers["content-type"],
      body: JSON.parse(body),
    });
    const status = responseStatuses.shift() ?? 204;
    response.writeHead(status, { "Content-Type": "text/plain" });
    response.end(status === 400 ? "provider rejected test payload" : "");
  });
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const webhookUrl = `http://127.0.0.1:${port}/webhook`;

try {
  const failure = await sendTransitionNotification({
    webhookUrl,
    started: true,
    recovered: false,
    runUrl,
  });
  assert.equal(failure.status, 204);
  assert.deepEqual(requests[0], {
    method: "POST",
    contentType: "application/json",
    body: notificationPayload("unhealthy", runUrl),
  });

  // The workflow only calls the sender for a transition. A repeated
  // unhealthy check has no transition and therefore must not call the receiver.
  const requestCountAfterFirstFailure = requests.length;
  assert.equal(requestCountAfterFirstFailure, 1);
  const repeated = await sendTransitionNotification({
    webhookUrl,
    started: false,
    recovered: false,
    runUrl,
  });
  assert.equal(repeated.sent, false);
  assert.equal(requests.length, requestCountAfterFirstFailure);

  const recovery = await sendTransitionNotification({
    webhookUrl,
    started: false,
    recovered: true,
    runUrl,
  });
  assert.equal(recovery.status, 204);
  assert.deepEqual(requests[1], {
    method: "POST",
    contentType: "application/json",
    body: notificationPayload("recovered", runUrl),
  });

  await assert.rejects(
    sendTransitionNotification({
      webhookUrl,
      started: true,
      recovered: false,
      runUrl,
    }),
    (error) => {
      assert.match(
        error.message,
        /Webhook rejected the unhealthy publish-health notification \(HTTP 400\)/,
      );
      assert.match(
        error.message,
        /publish-health result remains the source of truth/,
      );
      assert.doesNotMatch(error.message, /PUBLISH_HEALTH_WEBHOOK_URL/);
      assert.equal(error.message.includes(webhookUrl), false);
      return true;
    },
  );
  assert.equal(requests.length, 3);

  console.log(
    "✓ webhook contract: failure, debounce, recovery, and rejection handling passed",
  );
} finally {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}
