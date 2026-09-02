import { expect, test } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
const travelerPassword = process.env.TRAVELER_SEED_PASSWORD;
const partnerPassword = process.env.PARTNER_SEED_PASSWORD;

function baliDateOffset(days: number) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

async function signIn(page: import("@playwright/test").Page, email: string, password: string) {
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => url.pathname !== "/sign-in", { timeout: 15_000 });
}

test("guest quote continues through Traveler login, booking, demo payment, and confirmation", async ({ page }) => {
  test.skip(!travelerPassword, "TRAVELER_SEED_PASSWORD is required for the M4 browser review.");
  const checkin = baliDateOffset(14);
  const checkout = baliDateOffset(16);

  await page.goto("/");
  await page.getByLabel("Check-in").fill(checkin);
  await page.getByLabel("Check-out").fill(checkout);
  await page.getByRole("button", { name: "Search stays" }).click();
  await expect(page.getByRole("heading", { name: /stays? found/ })).toBeVisible();

  await page.locator('a[href^="/stays/"]').first().click();
  await expect(page.getByRole("button", { name: "Reserve this stay" })).toBeVisible();
  await page.getByRole("button", { name: "Reserve this stay" }).click();
  await expect(page.getByRole("heading", { name: "Traveler sign-in required." })).toBeVisible();
  await page.getByRole("link", { name: "Sign in to continue" }).click();

  await signIn(page, "traveler@staybali.test", travelerPassword!);
  await expect(page.getByRole("heading", { name: "Tell us who's staying." })).toBeVisible();
  await page.getByLabel("Full name").fill("M4 Browser Review");
  await page.getByLabel("Email address").fill("traveler@staybali.test");
  await page.getByLabel("Phone number").fill("+628110000002");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Reserve & continue to payment" }).click();

  await expect(page.getByRole("heading", { name: "Simulate the payment result." })).toBeVisible();
  await page.getByRole("button", { name: /^Pay / }).click();
  await expect(page.getByRole("heading", { name: "Your Bali stay is all set." })).toBeVisible();
  await page.screenshot({ path: "/tmp/staybali-m4-confirmation-desktop.png", fullPage: true });
});

test("manual reservation workspace has no horizontal overflow on mobile and desktop", async ({ page }) => {
  test.skip(!partnerPassword, "PARTNER_SEED_PASSWORD is required for the M4 browser review.");
  await page.goto("/sign-in");
  await signIn(page, "partner1@staybali.test", partnerPassword!);
  await page.goto("/partner/bookings");
  await expect(page.getByRole("heading", { name: "New manual reservation" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel("Property and room")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "/tmp/staybali-m4-manual-mobile.png", fullPage: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole("heading", { name: "Recent reservations" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "/tmp/staybali-m4-manual-desktop.png", fullPage: true });
});
