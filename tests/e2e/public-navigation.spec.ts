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

test("trust feature cards align within each desktop row", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const cardBottom = async (title: string) => {
    const box = await page
      .getByText(title, { exact: true })
      .locator("xpath=ancestor::div[1]")
      .boundingBox();

    expect(box).not.toBeNull();
    return box!.y + box!.height;
  };

  await expect
    .poll(async () => {
      const [reviewedBottom, partnerBottom] = await Promise.all([
        cardBottom("Reviewed properties"),
        cardBottom("Local partner workflow"),
      ]);

      return Math.abs(reviewedBottom - partnerBottom);
    })
    .toBeLessThan(1);
});

test("date range picker selects and clears stay dates", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await page.getByRole("button", { name: /Check-in/ }).click();
  const calendar = page.getByRole("dialog", { name: "Choose stay dates" });
  await expect(calendar).toBeVisible();
  await expect(calendar.locator("section:visible")).toHaveCount(2);
  const calendarBox = await calendar.boundingBox();
  expect(calendarBox).not.toBeNull();
  expect(calendarBox!.y).toBeGreaterThanOrEqual(0);
  expect(calendarBox!.y + calendarBox!.height).toBeLessThanOrEqual(900);

  const checkinButton = calendar.locator("button[data-calendar-date]:enabled").first();
  const checkin = await checkinButton.getAttribute("data-calendar-date");
  expect(checkin).toBeTruthy();
  await checkinButton.click();

  const checkoutButton = calendar.locator("button[data-calendar-date]:enabled").nth(3);
  const checkout = await checkoutButton.getAttribute("data-calendar-date");
  expect(checkout).toBeTruthy();
  await checkoutButton.click();

  await expect(page.locator('input[name="checkin"]')).toHaveValue(checkin!);
  await expect(page.locator('input[name="checkout"]')).toHaveValue(checkout!);
  await expect(calendar).toBeHidden();

  await page.getByRole("button", { name: "Clear check-out" }).click();
  await expect(page.locator('input[name="checkin"]')).toHaveValue(checkin!);
  await expect(page.locator('input[name="checkout"]')).toHaveValue("");

  await page.getByRole("button", { name: "Clear check-in" }).click();
  await expect(page.locator('input[name="checkin"]')).toHaveValue("");
});

test("date range picker uses one month without mobile overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: /Check-in/ }).click();
  const calendar = page.getByRole("dialog", { name: "Choose stay dates" });
  await expect(calendar.locator("section:visible")).toHaveCount(1);
  await expect(calendar.getByRole("button", { name: "Previous month" })).toBeVisible();
  await expect(calendar.getByRole("button", { name: "Next month" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("brand metadata exposes app and social images", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('link[rel="icon"][href*="icon"]')).toHaveCount(2);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /opengraph-image/,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    /twitter-image/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});
