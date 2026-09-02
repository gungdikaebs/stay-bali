import assert from "node:assert/strict";
import test from "node:test";
import { createEmailAdapter } from "./email-adapter";

test("sink email transport never requires or contacts SMTP", async () => {
  const previousTransport = process.env.EMAIL_TRANSPORT;
  process.env.EMAIL_TRANSPORT = "sink";
  try {
    const result = await createEmailAdapter().send({
      eventId: "event-test",
      to: "traveler@example.test",
      subject: "Test",
      text: "Test",
      html: "<p>Test</p>",
    });
    assert.equal(result.messageId, "staybali-preview-event-test");
  } finally {
    if (previousTransport === undefined) delete process.env.EMAIL_TRANSPORT;
    else process.env.EMAIL_TRANSPORT = previousTransport;
  }
});
