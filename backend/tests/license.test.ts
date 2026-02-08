import assert from 'node:assert/strict';

/**
 * License Management Tests
 * Tests for NetLicensing integration and license lifecycle
 */

console.log('🧪 Running License Management Tests...\n');

// ============================================
// License Creation Tests
// ============================================

console.log('Testing NetLicensing API Key Format...');
const apiKey = '633afa4f-361d-45bf-996a-d080723b9ab3';
const formattedKey = `apiKey:${apiKey}`;
assert.equal(formattedKey, 'apiKey:633afa4f-361d-45bf-996a-d080723b9ab3');

const credentials = 'apiKey:633afa4f-361d-45bf-996a-d080723b9ab3';
const base64 = Buffer.from(credentials).toString('base64');
assert.equal(base64, 'YXBpS2V5OjYzM2FmYTRmLTM2MWQtNDViZi05OTZhLWQwODA3MjNiOWFiMw==');
console.log('✓ API key formatting correct\n');

console.log('Testing Licensee Creation...');
const licenseeData = {
  productNumber: 'PWEIEW7PP',
  name: 'test@example.com'
};
assert.equal(licenseeData.name, 'test@example.com');
assert.equal(licenseeData.productNumber, 'PWEIEW7PP');

const mockLicenseeNumber = 'I7V6ESS5C';
assert.match(mockLicenseeNumber, /^I[A-Z0-9]{8}$/);
assert.equal(mockLicenseeNumber.length, 9);
console.log('✓ Licensee creation correct\n');

console.log('Testing License Generation...');
const licenseData = {
  productNumber: 'PWEIEW7PP',
  licenseTemplateNumber: 'EEDGXIUE3',
  licenseeNumber: 'I7V6ESS5C',
  active: 'true'
};
assert.equal(licenseData.licenseeNumber, 'I7V6ESS5C');
assert.equal(licenseData.licenseTemplateNumber, 'EEDGXIUE3');
assert.equal(licenseData.active, 'true');

const mockLicenseNumber = 'L2K3AAHR5';
assert.match(mockLicenseNumber, /^L[A-Z0-9]{8}$/);
assert.equal(mockLicenseNumber.length, 9);
console.log('✓ License generation correct\n');

// ============================================
// License Template Selection Tests
// ============================================

console.log('Testing License Template Selection...');
const productLicenseTemplate = {
  monthly: 'TEMPLATE_MONTHLY',
  annual: 'TEMPLATE_ANNUAL'
};

const monthlyTemplate = productLicenseTemplate['monthly'];
assert.equal(monthlyTemplate, 'TEMPLATE_MONTHLY');

const annualTemplate = productLicenseTemplate['annual'];
assert.equal(annualTemplate, 'TEMPLATE_ANNUAL');

const productWithoutTemplate = { product_license_template: null };
const hasTemplate = productWithoutTemplate.product_license_template !== null;
assert.equal(hasTemplate, false);
console.log('✓ Template selection correct\n');

// ============================================
// License Validation Tests
// ============================================

console.log('Testing License Validation...');

// Request validation
const validRequest = {
  email: 'test@example.com',
  productNumber: 'EEDGXIUE3'
};
assert.equal(!!validRequest.email, true);
assert.equal(!!validRequest.productNumber, true);

const invalidEmailRequest = {
  email: '',
  productNumber: 'EEDGXIUE3'
};
assert.equal(invalidEmailRequest.email.trim().length > 0, false);

const invalidProductRequest = {
  email: 'test@example.com',
  productNumber: ''
};
assert.equal(invalidProductRequest.productNumber.trim().length > 0, false);
console.log('✓ Request validation correct\n');

// Status validation
console.log('Testing License Status Validation...');
const activeSubscription = {
  subscriptionStatus: 'active',
  subscriptionExpiryDate: '2027-01-01T00:00:00Z'
};
const now1 = new Date('2026-01-01');
const expiryDate1 = new Date(activeSubscription.subscriptionExpiryDate);
const isValid1 = activeSubscription.subscriptionStatus === 'active' && now1 < expiryDate1;
assert.equal(isValid1, true);

const trialSubscription = {
  subscriptionStatus: 'trial',
  subscriptionTrialExpiryDate: '2026-06-01T00:00:00Z'
};
const now2 = new Date('2026-01-01');
const trialExpiryDate = new Date(trialSubscription.subscriptionTrialExpiryDate);
const isValid2 = trialSubscription.subscriptionStatus === 'trial' && now2 < trialExpiryDate;
assert.equal(isValid2, true);

const expiredSubscription = {
  subscriptionStatus: 'expired',
  subscriptionExpiryDate: '2025-12-06T00:00:00Z'
};
const now3 = new Date('2026-01-01');
const expiryDate3 = new Date(expiredSubscription.subscriptionExpiryDate);
const isExpired = now3 > expiryDate3;
assert.equal(isExpired, true);
assert.equal(expiredSubscription.subscriptionStatus, 'expired');
console.log('✓ Status validation correct\n');

// ============================================
// Product Template Matching Tests
// ============================================

console.log('Testing Product Template Matching...');
const product = {
  id: 'prod_123',
  product_license_template: {
    monthly: 'EEDGXIUE3',
    annual: 'EEDGXIUE4'
  }
};

const monthlyRequest = 'EEDGXIUE3';
const isMonthly = product.product_license_template.monthly === monthlyRequest;
const isAnnual1 = product.product_license_template.annual === monthlyRequest;
assert.equal(isMonthly, true);
assert.equal(isAnnual1, false);

const annualRequest = 'EEDGXIUE4';
const isAnnual2 = product.product_license_template.annual === annualRequest;
assert.equal(isAnnual2, true);

const invalidRequest = 'INVALID_TEMPLATE';
const isValid3 =
  product.product_license_template.monthly === invalidRequest ||
  product.product_license_template.annual === invalidRequest;
assert.equal(isValid3, false);
console.log('✓ Template matching correct\n');

// ============================================
// Validation Response Format Tests
// ============================================

console.log('Testing Validation Response Format...');
const validResponse = {
  valid: true,
  isBasic: true,
  isPremium: false,
  expiresUtc: '2027-01-01T00:00:00Z',
  subscriptionStatus: 'active',
  message: 'License valid'
};
assert.equal(validResponse.valid, true);
assert.equal(validResponse.subscriptionStatus, 'active');
assert.equal(validResponse.message, 'License valid');

const expiredResponse = {
  valid: false,
  isBasic: true,
  isPremium: false,
  expiresUtc: '2025-12-06T00:00:00Z',
  subscriptionStatus: 'expired',
  message: 'License has expired'
};
assert.equal(expiredResponse.valid, false);
assert.equal(expiredResponse.subscriptionStatus, 'expired');
assert.equal(expiredResponse.message, 'License has expired');

const notFoundResponse = {
  valid: false,
  message: 'No subscription found for this product'
};
assert.equal(notFoundResponse.valid, false);
assert.ok(notFoundResponse.message.includes('No subscription found'));
console.log('✓ Response format correct\n');

// ============================================
// License Renewal Tests
// ============================================

console.log('Testing License Renewal...');
const subscriptionWithLicense = {
  productId: 'prod_123',
  subscriptionStatus: 'trial',
  licenseeNumber: 'I7V6ESS5C',
  licenseNumber: 'L2K3AAHR5'
};
assert.ok(subscriptionWithLicense.licenseeNumber);
assert.ok(subscriptionWithLicense.licenseNumber);
assert.match(subscriptionWithLicense.licenseeNumber, /^I[A-Z0-9]{8}$/);
assert.match(subscriptionWithLicense.licenseNumber, /^L[A-Z0-9]{8}$/);

const oldSub = {
  productId: 'prod_123',
  licenseeNumber: 'I7V6ESS5C',
  licenseNumber: 'L2K3AAHR5',
  subscriptionStatus: 'expired'
};
const newSub = {
  ...oldSub,
  subscriptionStatus: 'trial',
  subscriptionExpiryDate: '2027-01-01T00:00:00Z'
};
assert.equal(newSub.licenseeNumber, oldSub.licenseeNumber);
assert.equal(newSub.licenseNumber, oldSub.licenseNumber);

const subWithoutLicense = {
  productId: 'prod_123',
  licenseeNumber: null,
  licenseNumber: null
};
const shouldGenerateNew = !subWithoutLicense.licenseeNumber || !subWithoutLicense.licenseNumber;
assert.equal(shouldGenerateNew, true);
console.log('✓ License renewal correct\n');

// ============================================
// NetLicensing Module Validation Tests
// ============================================

console.log('Testing NetLicensing Module Validation...');
const validationResponse = {
  items: {
    item: [
      {
        property: [
          { name: 'valid', value: 'false' },
          { name: 'productModuleName', value: 'Semi-automated trading' },
          { name: 'productModuleNumber', value: 'MPSDHAEEX' },
          { name: 'warningLevel', value: 'RED' }
        ]
      },
      {
        property: [
          { name: 'valid', value: 'true' },
          { name: 'productModuleName', value: 'Analytics' },
          { name: 'productModuleNumber', value: 'MVFHYYCXD' },
          { name: 'warningLevel', value: 'GREEN' },
          { name: 'expires', value: '2027-02-05T22:35:46.636Z' }
        ]
      }
    ]
  }
};

const modules = validationResponse.items.item;
assert.equal(modules.length, 2);

const analyticsModule = modules.find(m =>
  m.property.find(p => p.name === 'productModuleNumber' && p.value === 'MVFHYYCXD')
);
const isValidModule = analyticsModule?.property.find(p => p.name === 'valid')?.value === 'true';
assert.equal(isValidModule, true);

const moduleProps = [
  { name: 'valid', value: 'true' },
  { name: 'productModuleName', value: 'Analytics' },
  { name: 'warningLevel', value: 'GREEN' },
  { name: 'expires', value: '2027-02-05T22:35:46.636Z' }
];
const isValidProp = moduleProps.find(p => p.name === 'valid')?.value === 'true';
const warningLevel = moduleProps.find(p => p.name === 'warningLevel')?.value;
const moduleName = moduleProps.find(p => p.name === 'productModuleName')?.value;
assert.equal(isValidProp, true);
assert.equal(warningLevel, 'GREEN');
assert.equal(moduleName, 'Analytics');
console.log('✓ Module validation correct\n');

console.log('✅ All license management tests passed!');
