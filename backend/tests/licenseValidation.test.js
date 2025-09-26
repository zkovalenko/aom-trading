"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const licenseController_1 = require("../src/controllers/licenseController");
const resultMissingEmail = (0, licenseController_1.validateLicenseRequestBody)({ productNumber: 'TEMPLATE123' });
strict_1.default.equal(resultMissingEmail.valid, false);
strict_1.default.equal(resultMissingEmail.message, 'Email is required');
const resultMissingProduct = (0, licenseController_1.validateLicenseRequestBody)({ email: 'user@example.com' });
strict_1.default.equal(resultMissingProduct.valid, false);
strict_1.default.equal(resultMissingProduct.message, 'Product number is required');
const resultMinimal = (0, licenseController_1.validateLicenseRequestBody)({
    email: 'user@example.com',
    productNumber: 'TEMPLATE123'
});
strict_1.default.equal(resultMinimal.valid, true);
strict_1.default.equal(resultMinimal.message, undefined);
console.log('✅ licenseValidation.test.ts passed');
//# sourceMappingURL=licenseValidation.test.js.map