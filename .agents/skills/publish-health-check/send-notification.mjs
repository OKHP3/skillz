#!/usr/bin/env node
/**
 * Send one publish-health incident transition notification.
 *
 * This intentionally uses only Node's built-in fetch so the workflow and the
 * local webhook contract fixture exercise the same payload and error handling.
 * Never include the webhook URL in an error: it is backed by a repository
 * secret in CI.
 */

import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_RESPONSE_DETAILS = 300;

export function notificationPayload(event, runUrl) {
  if (event !== "unhealthy" && event !== "recovered") {
    throw new Error(`Unsupported publish-health notification event: ${event}`);
  }
  if (!runUrl) {
    throw new Error(
      "Publish-health notification is missing its workflow run URL.",
    );
  }

  const message =
    event === "unhealthy"
      ? `Skillz Forge publish is unhealthy. A publish-health incident was opened: ${runUrl}`
      : `Skillz Forge publish has recovered. The publish-health incident was closed: ${runUrl}`;

  return {
    text: message,
    content: message,
    event,
  };
}

function responseDetails(body) {
  const compact = body.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  return `: ${compact.slice(0, MAX_RESPONSE_DETAILS)}`;
}

function redactSecret(message, secret) {
  return String(message).replaceAll(secret, "[REDACTED]");
}

function recordDeliveryFailure({
  failureFile,
  webhookUrl,
  event,
  runUrl,
  status,
  message,
}) {
  if (!failureFile) return;

  const target = resolve(failureFile);
  const record = {
    type: "publish-health-webhook-delivery-failure",
    event,
    runUrl,
    ...(status === undefined ? {} : { status }),
    error: redactSecret(message, webhookUrl),
  };

  try {
    mkdirSync(dirname(target), { recursive: true });
    const temporary = `${target}.tmp-${process.pid}`;
    writeFileSync(temporary, `${JSON.stringify(record)}\n`, { mode: 0o600 });
    renameSync(temporary, target);
  } catch (error) {
    // Preserve the delivery error as the process failure, but make a failed
    // diagnostic write visible in the log. The workflow has a safe fallback
    // when this record is unavailable.
    console.error(`Could not record webhook delivery failure: ${error.message}`);
  }
}

export async function sendNotification({
  webhookUrl,
  event,
  runUrl,
  failureFile,
  fetchImpl = fetch,
}) {
  if (!webhookUrl) {
    throw new Error("Publish-health notification URL is not configured.");
  }

  const payload = notificationPayload(event, runUrl);
  let response;
  try {
    response = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message = `Could not deliver the ${event} publish-health notification: ${error.message}`;
    recordDeliveryFailure({
      failureFile,
      webhookUrl,
      event,
      runUrl,
      message,
    });
    throw new Error(redactSecret(message, webhookUrl));
  }

  let body;
  try {
    body = await response.text();
  } catch (error) {
    const message = `Could not read the ${event} publish-health webhook response: ${error.message}`;
    recordDeliveryFailure({
      failureFile,
      webhookUrl,
      event,
      runUrl,
      status: response.status,
      message,
    });
    throw new Error(redactSecret(message, webhookUrl));
  }
  if (!response.ok) {
    const message =
      `Webhook rejected the ${event} publish-health notification (HTTP ${response.status})` +
      `${responseDetails(body)}. The publish-health result remains the source of truth.`;
    recordDeliveryFailure({
      failureFile,
      webhookUrl,
      event,
      runUrl,
      status: response.status,
      message,
    });
    throw new Error(
      redactSecret(message, webhookUrl),
    );
  }

  return { status: response.status, payload };
}

export function transitionEvent({ started, recovered }) {
  const isStarted = started === true || started === "true";
  const isRecovered = recovered === true || recovered === "true";
  if (isStarted && isRecovered) {
    throw new Error(
      "Publish-health notification cannot be both started and recovered.",
    );
  }
  if (isStarted) return "unhealthy";
  if (isRecovered) return "recovered";
  return null;
}

export async function sendTransitionNotification({
  webhookUrl,
  started,
  recovered,
  runUrl,
  failureFile,
  fetchImpl = fetch,
}) {
  const event = transitionEvent({ started, recovered });
  if (!event) return { sent: false };
  const result = await sendNotification({
    webhookUrl,
    event,
    runUrl,
    failureFile,
    fetchImpl,
  });
  return { sent: true, ...result };
}

if (
  typeof process.argv[1] === "string" &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  sendTransitionNotification({
    webhookUrl: process.env.PUBLISH_HEALTH_WEBHOOK_URL,
    started: process.env.STARTED,
    recovered: process.env.RECOVERED,
    runUrl: process.env.RUN_URL,
    failureFile: process.env.NOTIFICATION_FAILURE_FILE,
  })
    .then((result) => {
      if (!result.sent) {
        console.log("No publish-health transition notification requested.");
        return;
      }
      console.log(
        `Sent ${result.payload.event} publish-health notification (HTTP ${result.status}).`,
      );
    })
    .catch((error) => {
      console.error(`✗ [webhook] ${error.message}`);
      process.exitCode = 1;
    });
}
