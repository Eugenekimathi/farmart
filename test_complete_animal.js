export default async function run(page, ui) {
  // Navigate to add animal form
  await page.goto('http://localhost:5173/farmer-portal/add-animal');
  await page.waitForTimeout(1000);

  // Fill animal form
  await page.getByPlaceholder('e.g. Purebred Boran Bull').fill('Test Boran Bull');
  await page.waitForTimeout(200);

  // Select animal type (Cattle)
  const typeSelect = page.locator('select').first();
  await typeSelect.selectOption('Cattle');
  await page.waitForTimeout(500);

  // Select breed (Boran)
  const breedSelect = page.locator('select').nth(1);
  await breedSelect.selectOption('Boran');
  await page.waitForTimeout(200);

  // Select gender (Male) - use more specific selector
  await page.locator('button:has-text("Male")').first().click();
  await page.waitForTimeout(200);

  // Set age (24 months)
  const ageInput = page.locator('input[type="number"]').first();
  await ageInput.fill('24');
  await page.waitForTimeout(200);

  // Set price (75000)
  const priceInput = page.locator('input[type="number"]').nth(1);
  await priceInput.fill('75000');
  await page.waitForTimeout(200);

  // Set location
  await page.getByPlaceholder('e.g. Naivasha, Kenya').fill('Nairobi');
  await page.waitForTimeout(200);

  // Set description
  await page.getByPlaceholder('Describe the animal').fill('Healthy Boran bull for sale. Vaccinated and ready for sale.');
  await page.waitForTimeout(200);

  // Skip image upload for now (test without image first)
  // Submit form
  await page.getByRole('button', { name: 'Add Animal' }).click();
  await page.waitForTimeout(3000);

  // Check result
  const url = page.url();
  const title = await page.title();
  const snapshot = await ui.snapshot();
  const full = await ui.snapshot({full: true});

  return { url, title, snapshot, full };
}
