import { expect, test } from "@playwright/test";

test("public navigation stays available from landing and search", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const landingHeader = page.locator('header[data-variant="overlay"]');
  await expect(landingHeader).toHaveCSS("position", "fixed");
  await expect(landingHeader).toHaveCSS("border-bottom-width", "0px");
  await expect(landingHeader).toHaveAttribute("data-inverted", "true");
  await expect(landingHeader.getByRole("link", { name: "Explore stays" })).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(landingHeader).toHaveAttribute("data-inverted", "false");
  await expect(landingHeader).toHaveCSS("border-bottom-width", "1px");
  await expect(landingHeader).toBeInViewport();

  await page.goto("/search?location=all&guests=2");
  const searchHeader = page.locator('header[data-variant="solid"]');
  await expect(searchHeader).toHaveCSS("position", "sticky");
  await expect(searchHeader.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect(searchHeader.getByRole("link", { name: "Explore stays" })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(searchHeader).toBeInViewport();
});

test("public mobile navigation opens above the sticky header", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/search?location=all&guests=2");

  await page.getByRole("button", { name: "Open navigation" }).click();
  const navigation = page.getByRole("dialog", { name: "Mobile navigation" });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link", { name: "All stays" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.keyboard.press("Escape");
  await expect(navigation).toBeHidden();
});
