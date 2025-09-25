import assert from 'node:assert/strict';

import { validateLicenseRequestBody } from '../src/controllers/licenseController';

const resultMissingEmail = validateLicenseRequestBody({ productNumber: 'TEMPLATE123' });
assert.equal(resultMissingEmail.valid, false);
assert.equal(resultMissingEmail.message, 'Email is required');

const resultMissingProduct = validateLicenseRequestBody({ email: 'user@example.com' });
assert.equal(resultMissingProduct.valid, false);
assert.equal(resultMissingProduct.message, 'Product number is required');

const resultMinimal = validateLicenseRequestBody({
  email: 'user@example.com',
  productNumber: 'TEMPLATE123'
});
assert.equal(resultMinimal.valid, true);
assert.equal(resultMinimal.message, undefined);

console.log('✅ licenseValidation.test.ts passed');
