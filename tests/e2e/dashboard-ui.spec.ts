import { loadEnvConfig } from "@next/env";
import { expect, test, type Page } from "@playwright/test";

loadEnvConfig(process.cwd());

const credentials = {
  admin: { email: "admin@staybali.test", password: process.env.ADMIN_SEED_PASSWORD },
  partner: { email: "partner1@staybali.test", password: process.env.PARTNER_SEED_PASSWORD },
  traveler: { email: "traveler@staybali.test", password: process.env.TRAVELER_SEED_PASSWORD },
};

async function signIn(page: Page, role: keyof typeof credentials, callbackUrl: string) {
  const account = credentials[role];
  test.skip(!account.password, `${role.toUpperCase()}_SEED_PASSWORD is required for dashboard review.`);
  await page.goto(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel("Email address").fill(account.email);
  await page.getByLabel("Password").fill(account.password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(new RegExp(`${callbackUrl.replace("/", "\\/")}$`));
}

async function expectResponsiveWorkspace(page: Page, heading: string, screenshotName: string) {
  await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: `/tmp/${screenshotName}-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.getByRole("button", { name: "Open workspace navigation" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "Open workspace navigation" }).click();
  const navigationDialog = page.getByRole("dialog", { name: "Workspace navigation" });
  await expect(navigationDialog).toBeVisible();
  const overlayBox = await navigationDialog.boundingBox();
  expect(overlayBox?.width).toBeGreaterThanOrEqual(390);
  expect(overlayBox?.height).toBeGreaterThanOrEqual(844);
  const navigationPanel = navigationDialog.locator("aside");
  await expect(navigationPanel).toHaveCSS("overflow-y", "auto");
  await expect(navigationPanel).toHaveCSS("position", "absolute");
  await expect(navigationPanel.getByText("Workspace", { exact: true })).toBeVisible();
  await expect(navigationPanel.getByRole("navigation")).toBeVisible();
  await expect(navigationPanel.getByText("View public website", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close navigation" })).toBeFocused();
  await page.screenshot({ path: `/tmp/${screenshotName}-drawer-account.png`, fullPage: false });
  await page.keyboard.press("Escape");
  await expect(navigationDialog).toBeHidden();
  await page.screenshot({ path: `/tmp/${screenshotName}-mobile.png`, fullPage: true });
}

async function expectRoutesWithoutOverflow(page: Page, routes: string[]) {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
}

test("Admin workspace is complete and responsive", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signIn(page, "admin", "/admin");
  await expectResponsiveWorkspace(page, "Your operations, at a glance", "staybali-admin-dashboard");
  await expectRoutesWithoutOverflow(page, ["/admin/partners", "/admin/properties", "/admin/bookings", "/admin/jobs"]);
});

test("Partner workspace is complete and responsive", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signIn(page, "partner", "/partner");
  await expectResponsiveWorkspace(page, "Island Homes Bali", "staybali-partner-dashboard");
  await expectRoutesWithoutOverflow(page, ["/partner/properties", "/partner/bookings"]);
});

test("Traveler workspace is complete and responsive", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signIn(page, "traveler", "/account");
  await expectResponsiveWorkspace(page, "My Bali trips", "staybali-traveler-dashboard");
});
