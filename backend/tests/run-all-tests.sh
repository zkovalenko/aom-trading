#!/bin/bash

# Run all subscription and license tests

echo "🧪 Running Subscription Renewal Tests..."
echo "========================================"
ts-node --transpile-only tests/subscriptionRenewal.test.ts

echo ""
echo "🧪 Running License Management Tests..."
echo "========================================"
ts-node --transpile-only tests/license.test.ts

echo ""
echo "🧪 Running License Validation Tests..."
echo "========================================"
ts-node --transpile-only tests/licenseValidation.test.ts

echo ""
echo "✅ All backend tests completed!"
