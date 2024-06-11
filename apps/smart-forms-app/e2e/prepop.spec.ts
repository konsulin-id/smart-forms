/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect, test } from '@playwright/test';
import { PLAYWRIGHT_APP_URL, PLAYWRIGHT_EHR_URL, PLAYWRIGHT_FORMS_SERVER_URL } from './globals';

test('pre-pop into CVDRiskCalculator questionnaire', async ({ page }) => {
  // Go to playground
  const fetchQPromise = page.waitForResponse(
    `${PLAYWRIGHT_FORMS_SERVER_URL}/Questionnaire?_count=100&_sort=-date&`
  );
  const launchUrl = `${PLAYWRIGHT_APP_URL}/playground`;
  await page.goto(launchUrl);
  const fetchQResponse = await fetchQPromise;
  expect(fetchQResponse.status()).toBe(200);

  // Configure launch settings
  await page.getByTestId('launch-settings-button-playground').click();
  await page.getByTestId('source-fhir-server-url-field-playground').locator('input').fill('');
  await page
    .getByTestId('source-fhir-server-url-field-playground')
    .locator('input')
    .fill(PLAYWRIGHT_EHR_URL);

  // Validate source FHIR server url
  const metadataPromise = page.waitForResponse(`${PLAYWRIGHT_EHR_URL}/metadata`);
  await page.getByTestId('validate-url-button-playground').click();
  const metadataResponse = await metadataPromise;
  expect(metadataResponse.status()).toBe(200);
  await expect(page.getByTestId('source-fhir-server-url-field-playground')).toContainText(
    'URL validated'
  );

  // Set source FHIR server url
  const patientPromise = page.waitForResponse(`${PLAYWRIGHT_EHR_URL}/Patient?_count=100`);
  const practitionerPromise = page.waitForResponse(`${PLAYWRIGHT_EHR_URL}/Practitioner?_count=100`);
  await page.getByTestId('set-fhir-server-button-playground').click();
  const patientResponse = await patientPromise;
  expect(patientResponse.status()).toBe(200);
  const practitionerResponse = await practitionerPromise;
  expect(practitionerResponse.status()).toBe(200);

  // Set patient and user
  await page.getByTestId('patient-picker-playground').click();
  await page.getByRole('option', { name: 'Mrs. Smart Form', exact: true }).click();

  await page.getByTestId('user-picker-playground').click();
  await page.getByRole('option', { name: 'Dr Peter Primary', exact: true }).click();
  await page.getByTestId('save-launch-settings-button-playground').click();

  // Select CVDRiskCalculator questionnaire
  await page
    .getByTestId('questionnaire-picker-playground')
    .locator('input')
    .fill('calculatedexpressioncvdriskcalculatorprepop');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('questionnaire-details-playground')).toContainText(
    'CalculatedExpressionCvdRiskCalculatorPrepop'
  );
  await expect(page.getByTestId('questionnaire-details-playground')).toContainText(
    'https://smartforms.csiro.au/docs/sdc/population/calculated-expression-2'
  );

  // Build CVDRiskCalculator questionnaire
  await page.getByTestId('picker-build-form-button-playground').click();
  await expect(page.getByText('"resourceType": "Questionnaire"')).toBeInViewport();
  await expect(
    page.getByText('"id": "CalculatedExpressionCvdRiskCalculatorPrepop"')
  ).toBeInViewport();

  // Ensure questionnaire is built
  await expect(page.getByTestId('q-item-display-box')).toContainText(
    'The calculator below should only be used for technology demonstration purposes.'
  );

  // Perform pre-population
  const populatePromise = page.waitForResponse(
    new RegExp(/^https:\/\/proxy\.smartforms\.io\/v\/r4\/fhir\/(Observation|Condition)\?.+$/)
  );
  await page.getByTestId('prepop-button-playground').click();
  const populateResponse = await populatePromise;
  expect(populateResponse.status()).toBe(200);

  // Check calculated value
  const cvdRiskValueLinkId = 'cvd-result';
  await expect(
    page.getByTestId('q-item-integer-box').locator(`#${cvdRiskValueLinkId}`)
  ).toHaveValue('23');
});
