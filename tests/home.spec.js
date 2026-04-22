const { expect, test } = require("@playwright/test");

test.describe("Home Lending Advisor static site", () => {
  test("loads the home page with core SEO content and CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Home Lending Advisor/);
    await expect(page.getByRole("heading", { name: "Home Lending Advisor" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start a lending review" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore guidance" })).toBeVisible();
    await expect(page.getByText("Advice for the moments that shape your loan.")).toBeVisible();

    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", "https://homelendingadvisor.lol/");
    await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator("link[rel='manifest']")).toHaveAttribute("href", "/site.webmanifest");

    const structuredData = await page.locator("script[type='application/ld+json']").evaluateAll((nodes) =>
      nodes.map((node) => node.textContent || ""),
    );
    expect(structuredData.length).toBeGreaterThanOrEqual(3);
    expect(structuredData.join("\n")).toContain("\"@type\": \"FAQPage\"");

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("renders contact form and builds a mailto request", async ({ page }) => {
    await page.goto("/");
    await page.locator("#consultation").scrollIntoViewIfNeeded();

    await page.getByLabel("Name").fill("Taylor Morgan");
    await page.getByLabel("Email").fill("taylor@example.com");
    await page.getByLabel("Loan goal").selectOption({ label: "Comparing loan offers" });
    await page.getByLabel("Message").fill("I have two lender estimates and want help comparing them.");

    await page.getByRole("button", { name: "Email my request" }).click();

    await expect(page.getByText("Opening your email app with the request details.")).toBeVisible();
    const mailto = await page.locator("[data-contact-form]").getAttribute("data-last-mailto");

    expect(mailto).toContain("mailto:hello@homelendingadvisor.lol");
    expect(decodeURIComponent(mailto)).toContain("Home lending review request from Taylor Morgan");
    expect(decodeURIComponent(mailto)).toContain("Loan goal: Comparing loan offers");
  });

  test("serves brand assets referenced by the page", async ({ page, request }) => {
    await page.goto("/");

    const logo = await request.get("/assets/brand/logo-mark.png");
    const favicon = await request.get("/assets/brand/favicon.png");
    const hero = await request.get("/assets/brand/hero-field.png");
    const robots = await request.get("/robots.txt");
    const sitemap = await request.get("/sitemap.xml");

    expect(logo.ok()).toBeTruthy();
    expect(favicon.ok()).toBeTruthy();
    expect(hero.ok()).toBeTruthy();
    expect(robots.ok()).toBeTruthy();
    expect(sitemap.ok()).toBeTruthy();
    expect(await robots.text()).toContain("https://homelendingadvisor.lol/sitemap.xml");
    expect(await sitemap.text()).toContain("https://homelendingadvisor.lol/");
  });
});
