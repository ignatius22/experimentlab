import { test, expect } from "@playwright/test";

test("create experiment flow", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in as demo user" }).click();
  await page.goto("/app/experiments");
  await page.getByLabel("Experiment name").fill("Checkout CTA Test");
  await page.getByLabel("Experiment key").fill("checkout_cta_test");
  await page.getByRole("button", { name: "Create experiment" }).click();
  await expect(page.getByText("Checkout CTA Test")).toBeVisible();
});
