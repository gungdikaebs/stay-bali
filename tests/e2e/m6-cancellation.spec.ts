import { loadEnvConfig } from "@next/env";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;
const credentials = {
  admin: { email: "admin@staybali.test", password: process.env.ADMIN_SEED_PASSWORD },
  partner: { email: "partner1@staybali.test", password: process.env.PARTNER_SEED_PASSWORD },
  traveler: { email: "traveler@staybali.test", password: process.env.TRAVELER_SEED_PASSWORD },
};
const canRun = Boolean(connectionString && credentials.admin.password && credentials.partner.password && credentials.traveler.password);
const pool = connectionString ? new Pool({ connectionString }) : null;
const runMarker = `E2E-M6-${Date.now()}-${process.pid}`;
const trackedQuoteIds = new Set<string>();
const trackedIdempotencyKeys = new Set<string>();
let partnerProperty: { name: string; slug: string } | null = null;

function baliDateOffset(days: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = new Date(`${value.year}-${value.month}-${value.day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function signIn(page: Page, role: keyof typeof credentials, callbackUrl: string) {
  const account = credentials[role];
  await page.goto(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel("Email address").fill(account.email);
  await page.getByLabel("Password").fill(account.password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(new RegExp(`${callbackUrl.replaceAll("/", "\\/")}$`));
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).first().click();
  await expect(page).toHaveURL(/\/sign-in$/);
}

async function trackIdempotencyKey(form: Locator) {
  const key = await form.locator('input[name="idempotencyKey"]').inputValue();
  trackedIdempotencyKeys.add(key);
}

async function bookingCode(bookingId: string) {
  const result = await pool!.query<{ booking_code: string }>(
    "SELECT booking_code FROM bookings WHERE id = $1",
    [bookingId],
  );
  expect(result.rows).toHaveLength(1);
  return result.rows[0]!.booking_code;
}

type InventorySnapshot = Array<{
  roomTypeId: string;
  stayDate: Date;
  bookedUnits: number;
}>;

async function inventorySnapshot(bookingId: string): Promise<InventorySnapshot> {
  const result = await pool!.query<{
    room_type_id: string;
    stay_date: Date;
    booked_units: number;
  }>(
    `SELECT bn.room_type_id, bn.stay_date, i.booked_units
     FROM booking_nights bn
     JOIN inventory_dates i ON i.room_type_id = bn.room_type_id AND i.stay_date = bn.stay_date
     WHERE bn.booking_id = $1
     ORDER BY bn.stay_date`,
    [bookingId],
  );
  expect(result.rows.length).toBeGreaterThan(0);
  return result.rows.map((row) => ({
    roomTypeId: row.room_type_id,
    stayDate: row.stay_date,
    bookedUnits: row.booked_units,
  }));
}

async function expectInventoryChange(snapshot: InventorySnapshot, delta: number) {
  for (const night of snapshot) {
    const result = await pool!.query<{ booked_units: number }>(
      "SELECT booked_units FROM inventory_dates WHERE room_type_id = $1 AND stay_date = $2",
      [night.roomTypeId, night.stayDate],
    );
    expect(result.rows[0]?.booked_units).toBe(night.bookedUnits + delta);
  }
}

async function createConfirmedOnlineBooking(page: Page, scenario: string, checkinOffset: number) {
  const guestName = `${runMarker}-${scenario}`;
  const checkin = baliDateOffset(checkinOffset);
  const checkout = baliDateOffset(checkinOffset + 1);
  await signIn(page, "traveler", "/account");
  await page.goto(`/stays/${partnerProperty!.slug}?checkin=${checkin}&checkout=${checkout}&guests=2&children=0`);
  await page.getByRole("button", { name: "Reserve this stay" }).click();
  await expect(page).toHaveURL(/\/checkout\?quote=/);

  const checkoutForm = page.getByRole("button", { name: "Reserve & continue to payment" }).locator("xpath=ancestor::form");
  trackedQuoteIds.add(await checkoutForm.locator('input[name="quoteId"]').inputValue());
  await trackIdempotencyKey(checkoutForm);
  await page.getByLabel("Full name").fill(guestName);
  await page.getByLabel("Email address").fill(credentials.traveler.email);
  await page.getByLabel("Phone number").fill("+628110000002");
  await page.getByLabel("Special requests").fill(guestName);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Reserve & continue to payment" }).click();
  await expect(page).toHaveURL(/\/payment\?booking=/);

  const bookingId = new URL(page.url()).searchParams.get("booking");
  expect(bookingId).toBeTruthy();
  const paymentForm = page.getByRole("button", { name: /^Pay / }).locator("xpath=ancestor::form");
  await trackIdempotencyKey(paymentForm);
  await page.getByRole("button", { name: /^Pay / }).click();
  await expect(page.getByRole("heading", { name: "Your Bali stay is all set." })).toBeVisible();
  return { id: bookingId!, code: await bookingCode(bookingId!) };
}

function reservationCard(page: Page, code: string) {
  return page.locator("article").filter({ hasText: code }).first();
}

function cancellationCard(page: Page, heading: string, code: string) {
  const section = page.getByRole("heading", { name: heading }).locator("xpath=ancestor::section[1]");
  return section.locator("article").filter({ hasText: code });
}

async function openTravelerCancellation(page: Page, code: string) {
  await page.goto("/account");
  const card = reservationCard(page, code);
  await card.getByText("Cancel booking", { exact: true }).click();
  return card;
}

async function requestException(page: Page, code: string, reason: string) {
  const card = await openTravelerCancellation(page, code);
  const form = card.getByRole("button", { name: "Request an exception" }).locator("xpath=ancestor::form");
  await trackIdempotencyKey(form);
  await form.getByLabel("Reason").fill(reason);
  await form.getByRole("button", { name: "Request an exception" }).click();
  await expect(reservationCard(page, code).getByText("Cancellation requested", { exact: true })).toBeVisible();
}

async function resolveRequest(page: Page, heading: string, code: string, decision: "approve" | "reject") {
  const card = cancellationCard(page, heading, code);
  const buttonName = decision === "approve" ? /Approve .*refund/ : "Reject request";
  const form = card.getByRole("button", { name: buttonName }).locator("xpath=ancestor::form");
  await trackIdempotencyKey(form);
  await form.getByLabel("Resolution note").fill(`${runMarker} ${decision} verification.`);
  await form.getByRole("button", { name: buttonName }).click();
  await expect(card.getByText(decision === "approve" ? "Approved" : "Rejected", { exact: true })).toBeVisible();
}

async function cleanupTestData() {
  if (!pool) return;
  const client = await pool.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    const bookings = await client.query<{ id: string; status: string }>(
      "SELECT id, status::text FROM bookings WHERE guest_name LIKE $1",
      [`${runMarker}%`],
    );
    const bookingIds = bookings.rows.map((booking) => booking.id);
    const bookingNights = bookingIds.length
      ? await client.query<{ booking_id: string; room_type_id: string; stay_date: Date }>(
          "SELECT booking_id, room_type_id, stay_date FROM booking_nights WHERE booking_id = ANY($1::varchar[])",
          [bookingIds],
        )
      : { rows: [] };
    const cancellationIds = bookingIds.length
      ? (await client.query<{ id: string }>("SELECT id FROM cancellation_requests WHERE booking_id = ANY($1::varchar[])", [bookingIds])).rows.map((row) => row.id)
      : [];
    const paymentAttemptIds = bookingIds.length
      ? (await client.query<{ id: string }>("SELECT id FROM payment_attempts WHERE booking_id = ANY($1::varchar[])", [bookingIds])).rows.map((row) => row.id)
      : [];
    const quoteIds = [...trackedQuoteIds];
    const holds = quoteIds.length
      ? await client.query<{ id: string; consumed_at: Date | null; room_type_id: string | null; stay_date: Date | null }>(
          `SELECT h.id, h.consumed_at, hn.room_type_id, hn.stay_date
           FROM holds h LEFT JOIN hold_nights hn ON hn.hold_id = h.id
           WHERE h.quote_id = ANY($1::varchar[])`,
          [quoteIds],
        )
      : { rows: [] };

    for (const night of holds.rows.filter((row) => row.consumed_at === null && row.room_type_id && row.stay_date)) {
      await client.query(
        `UPDATE inventory_dates SET held_units = held_units - 1
         WHERE room_type_id = $1 AND stay_date = $2 AND held_units > 0`,
        [night.room_type_id, night.stay_date],
      );
    }
    const activeBookingIds = bookings.rows
      .filter((booking) => !["CANCELLED", "EXPIRED", "REFUNDED"].includes(booking.status))
      .map((booking) => booking.id);
    for (const night of bookingNights.rows.filter((row) => activeBookingIds.includes(row.booking_id))) {
      await client.query(
        `UPDATE inventory_dates SET booked_units = booked_units - 1
         WHERE room_type_id = $1 AND stay_date = $2 AND booked_units > 0`,
        [night.room_type_id, night.stay_date],
      );
    }

    if (bookingIds.length) {
      const outboxIds = (await client.query<{ id: string }>(
        "SELECT id FROM outbox_events WHERE aggregate_type = 'BOOKING' AND aggregate_id = ANY($1::varchar[])",
        [bookingIds],
      )).rows.map((event) => event.id);
      if (outboxIds.length) await client.query("DELETE FROM email_deliveries WHERE outbox_event_id = ANY($1::varchar[])", [outboxIds]);
      await client.query("DELETE FROM outbox_events WHERE aggregate_type = 'BOOKING' AND aggregate_id = ANY($1::varchar[])", [bookingIds]);
      await client.query("DELETE FROM refund_records WHERE booking_id = ANY($1::varchar[])", [bookingIds]);
      await client.query("DELETE FROM cancellation_requests WHERE booking_id = ANY($1::varchar[])", [bookingIds]);
      await client.query("DELETE FROM payment_attempts WHERE booking_id = ANY($1::varchar[])", [bookingIds]);
      await client.query("DELETE FROM bookings WHERE id = ANY($1::varchar[])", [bookingIds]);
    }
    const auditEntityIds = [...bookingIds, ...cancellationIds, ...paymentAttemptIds];
    if (auditEntityIds.length) await client.query("DELETE FROM audit_logs WHERE entity_id = ANY($1::varchar[])", [auditEntityIds]);
    if (trackedIdempotencyKeys.size) {
      await client.query("DELETE FROM idempotency_records WHERE key = ANY($1::varchar[])", [[...trackedIdempotencyKeys]]);
    }
    const holdIds = [...new Set(holds.rows.map((hold) => hold.id))];
    if (holdIds.length) await client.query("DELETE FROM holds WHERE id = ANY($1::varchar[])", [holdIds]);
    if (quoteIds.length) await client.query("DELETE FROM quotes WHERE id = ANY($1::varchar[])", [quoteIds]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

test.describe("M6 policy-driven cancellation", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(!canRun, "DATABASE_URL and all seed account passwords are required for M6 cancellation E2E.");

  test.beforeAll(async () => {
    const result = await pool!.query<{ name: string; slug: string }>(
      `SELECT DISTINCT p.name, p.slug, p.created_at
       FROM properties p
       JOIN partner_profiles pp ON pp.id = p.owner_partner_id
       JOIN users u ON u.id = pp.user_id
       JOIN room_types r ON r.property_id = p.id
       WHERE u.email = $1 AND pp.status = 'ACTIVE' AND p.status = 'PUBLISHED'
         AND p.archived_at IS NULL AND r.is_active = true AND r.archived_at IS NULL
         AND r.adult_capacity >= 2
       ORDER BY p.created_at ASC
       LIMIT 1`,
      [credentials.partner.email],
    );
    partnerProperty = result.rows[0] ?? null;
    expect(partnerProperty, "Partner 1 needs an active published property with a two-adult room.").toBeTruthy();
  });

  test.afterAll(async () => {
    try {
      await cleanupTestData();
    } finally {
      await pool?.end();
    }
  });

  test("Traveler standard cancellation completes a full demo refund", async ({ page }) => {
    test.setTimeout(120_000);
    const booking = await createConfirmedOnlineBooking(page, "STANDARD", 30);
    const inventory = await inventorySnapshot(booking.id);
    const card = await openTravelerCancellation(page, booking.code);
    await expect(card.getByText(/Full refund:/)).toBeVisible();
    const form = card.getByRole("button", { name: "Cancel with full refund" }).locator("xpath=ancestor::form");
    await trackIdempotencyKey(form);
    await form.getByRole("button", { name: "Cancel with full refund" }).click();
    await expect(reservationCard(page, booking.code).getByText("Refunded", { exact: true })).toBeVisible();
    await expectInventoryChange(inventory, -1);
  });

  test("Partner approves a Traveler policy exception", async ({ page }) => {
    test.setTimeout(120_000);
    const booking = await createConfirmedOnlineBooking(page, "EXCEPTION-APPROVE", 2);
    const inventory = await inventorySnapshot(booking.id);
    await requestException(page, booking.code, `${runMarker} late-arrival exception approval.`);
    await signOut(page);
    await signIn(page, "partner", "/partner/bookings");
    await resolveRequest(page, "Guest waiver requests", booking.code, "approve");
    await signOut(page);
    await signIn(page, "traveler", "/account");
    await expect(reservationCard(page, booking.code).getByText("Refunded", { exact: true })).toBeVisible();
    await expectInventoryChange(inventory, -1);
  });

  test("Partner rejects an exception and Traveler can accept the no-refund cancellation", async ({ page }) => {
    test.setTimeout(120_000);
    const booking = await createConfirmedOnlineBooking(page, "EXCEPTION-REJECT", 2);
    const inventory = await inventorySnapshot(booking.id);
    await requestException(page, booking.code, `${runMarker} late exception rejection.`);
    await signOut(page);
    await signIn(page, "partner", "/partner/bookings");
    await resolveRequest(page, "Guest waiver requests", booking.code, "reject");
    await expectInventoryChange(inventory, 0);
    await signOut(page);
    await signIn(page, "traveler", "/account");
    await expect(reservationCard(page, booking.code).getByText("Confirmed", { exact: true })).toBeVisible();
    const card = await openTravelerCancellation(page, booking.code);
    const form = card.getByRole("button", { name: "Cancel without refund" }).locator("xpath=ancestor::form");
    await trackIdempotencyKey(form);
    await form.getByRole("button", { name: "Cancel without refund" }).click();
    await expect(reservationCard(page, booking.code).getByText("Cancelled", { exact: true })).toBeVisible();
    await expectInventoryChange(inventory, -1);
  });

  test("Partner inability to host is approved by Admin", async ({ page }) => {
    test.setTimeout(120_000);
    const booking = await createConfirmedOnlineBooking(page, "PARTNER-INITIATED", 40);
    const inventory = await inventorySnapshot(booking.id);
    await page.goto("/account");
    await signOut(page);
    await signIn(page, "partner", "/partner/bookings");
    const reservation = reservationCard(page, booking.code);
    await reservation.getByText("Report inability to host", { exact: true }).click();
    const requestForm = reservation.getByRole("button", { name: "Escalate to Admin" }).locator("xpath=ancestor::form");
    await trackIdempotencyKey(requestForm);
    await requestForm.getByLabel("Reason").fill(`${runMarker} property cannot host this stay.`);
    await requestForm.getByRole("button", { name: "Escalate to Admin" }).click();
    await expect(reservationCard(page, booking.code).getByText("Cancellation requested", { exact: true })).toBeVisible();
    await signOut(page);
    await signIn(page, "admin", "/admin/bookings");
    await resolveRequest(page, "Cancellation escalations", booking.code, "approve");
    await expectInventoryChange(inventory, -1);
    await signOut(page);
    await signIn(page, "traveler", "/account");
    await expect(reservationCard(page, booking.code).getByText("Refunded", { exact: true })).toBeVisible();
  });

  test("Partner directly cancels an owned manual reservation", async ({ page }) => {
    test.setTimeout(120_000);
    await signIn(page, "partner", "/partner/bookings");
    const createButton = page.getByRole("button", { name: "Create manual reservation" });
    const createForm = createButton.locator("xpath=ancestor::form");
    await trackIdempotencyKey(createForm);
    await createForm.getByLabel("Property and room").selectOption({ index: 1 });
    await createForm.getByLabel("Check-in").fill(baliDateOffset(60));
    await createForm.getByLabel("Check-out").fill(baliDateOffset(61));
    await createForm.getByLabel("Guest name").fill(`${runMarker}-MANUAL`);
    await createForm.getByLabel("Guest email").fill("m6-cancellation@example.test");
    await createForm.getByLabel("Guest phone").fill("+6281200000099");
    await createForm.getByLabel("Internal reason").fill(`${runMarker} manual reservation verification.`);
    await createButton.click();
    const success = createForm.getByRole("status");
    await expect(success).toContainText("Booking code:");
    const code = (await success.textContent())?.match(/SB-\d{4}-[A-Z2-9]{6}/)?.[0];
    expect(code).toBeTruthy();
    const created = await pool!.query<{ id: string }>("SELECT id FROM bookings WHERE booking_code = $1", [code]);
    expect(created.rows).toHaveLength(1);
    const inventory = await inventorySnapshot(created.rows[0]!.id);
    await page.reload();
    const reservation = reservationCard(page, code!);
    await reservation.getByText("Cancel manual reservation", { exact: true }).click();
    const cancelForm = reservation.getByRole("button", { name: "Cancel reservation" }).locator("xpath=ancestor::form");
    await trackIdempotencyKey(cancelForm);
    await cancelForm.getByLabel("Reason").fill(`${runMarker} manual cancellation verification.`);
    await cancelForm.getByRole("button", { name: "Cancel reservation" }).click();
    await expect(reservationCard(page, code!).getByText("Cancelled", { exact: true })).toBeVisible();
    await expectInventoryChange(inventory, -1);
  });
});
