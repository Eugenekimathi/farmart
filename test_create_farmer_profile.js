export default async function run(page, ui) {
  // Navigate to farmer portal
  await page.goto('http://localhost:5173/farmer-portal');
  await page.waitForTimeout(1000);

  // Snapshot to see if we need to create a profile
  const snapshot = await ui.snapshot();
  const full = await ui.snapshot({full: true});

  return { snapshot, full };
}
