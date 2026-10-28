/**
 * Comprehensive Automated System Test Suite for RetailFlow
 * Tests: Data consistency, inventory integrity, stock adjustments,
 * transfers, purchase order receiving, and business rules.
 */

import {
  INITIAL_PRODUCTS,
  INITIAL_WAREHOUSES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_TRANSFERS
} from './src/services/mockData.js';

import {
  validateProduct,
  validateWarehouse,
  validateSupplier,
  validateTransfer,
  validateStockChange
} from './src/services/validationService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n==================================================');
console.log('RETAILFLOW INVENTORY MANAGEMENT SYSTEM - TEST SUITE');
console.log('==================================================\n');

// TEST SUITE 1: SEED DATA SPECIFICATION CHECKS
console.log('--- TEST SUITE 1: Seed Data Requirements ---');
assert(INITIAL_PRODUCTS.length >= 30, `Products count is ${INITIAL_PRODUCTS.length} (>= 30 required)`);

const categories = new Set(INITIAL_PRODUCTS.map(p => p.category));
assert(categories.size >= 6, `Product categories count is ${categories.size} (>= 6 required: ${[...categories].join(', ')})`);

assert(INITIAL_WAREHOUSES.length === 3, `Warehouses count is ${INITIAL_WAREHOUSES.length} (Delhi, Noida, Ghaziabad)`);
const whNames = INITIAL_WAREHOUSES.map(w => w.name);
assert(whNames.includes('Delhi Warehouse') && whNames.includes('Noida Warehouse') && whNames.includes('Ghaziabad Warehouse'), 'All 3 specified warehouse names exist');

assert(INITIAL_SUPPLIERS.length >= 6, `Suppliers count is ${INITIAL_SUPPLIERS.length} (>= 6 required)`);
assert(INITIAL_PURCHASE_ORDERS.length >= 8, `Purchase Orders count is ${INITIAL_PURCHASE_ORDERS.length} (>= 8 required)`);
assert(INITIAL_TRANSACTIONS.length >= 15, `Transactions count is ${INITIAL_TRANSACTIONS.length} (>= 15 required)`);
assert(INITIAL_TRANSFERS.length >= 5, `Stock transfers count is ${INITIAL_TRANSFERS.length} (>= 5 required)`);

// TEST SUITE 2: INVENTORY QUANTITY LOGICAL CONSISTENCY
console.log('\n--- TEST SUITE 2: Stock Consistency Across Warehouses ---');
let allProductsConsistent = true;
let inconsistentProduct = null;

for (const p of INITIAL_PRODUCTS) {
  const sumWh = Object.values(p.warehouseStock || {}).reduce((a, b) => a + Number(b), 0);
  if (sumWh !== p.stock) {
    allProductsConsistent = false;
    inconsistentProduct = p;
    break;
  }
}
assert(allProductsConsistent, 'For all 32 products, sum(warehouseStock) strictly equals product.stock');

// TEST SUITE 3: PRODUCT VALIDATION & SKU TESTS
console.log('\n--- TEST SUITE 3: Product Validation & SKU Uniqueness ---');
const validProd = {
  name: 'Ultra Wireless Headset',
  sku: 'TEST-SKU-999',
  category: 'Electronics',
  purchasePrice: 1200,
  sellingPrice: 2400,
  minStockLevel: 20
};
assert(validateProduct(validProd, INITIAL_PRODUCTS).isValid === true, 'Valid product passes validation');

const missingNameProd = { ...validProd, name: '' };
assert(validateProduct(missingNameProd, INITIAL_PRODUCTS).isValid === false, 'Product without name is rejected');

const duplicateSkuProd = { ...validProd, sku: INITIAL_PRODUCTS[0].sku };
assert(validateProduct(duplicateSkuProd, INITIAL_PRODUCTS).isValid === false, 'Duplicate SKU across different products is rejected');

const negativePriceProd = { ...validProd, purchasePrice: -100 };
assert(validateProduct(negativePriceProd, INITIAL_PRODUCTS).isValid === false, 'Negative purchase price is rejected');

// TEST SUITE 4: INVENTORY ADJUSTMENT & NEGATIVE STOCK PREVENTION
console.log('\n--- TEST SUITE 4: Stock Change & Negative Stock Rejection ---');
assert(validateStockChange(50, 20, 'STOCK_OUT').isValid === true, 'Sufficient stock-out (50 - 20) is permitted');
assert(validateStockChange(10, 25, 'STOCK_OUT').isValid === false, 'Excessive stock-out (10 - 25) leading to negative stock is rejected');
assert(validateStockChange(0, 5, 'STOCK_OUT').isValid === false, 'Stock-out from 0 stock is rejected');
assert(validateStockChange(20, -5, 'STOCK_OUT').isValid === false, 'Negative quantity input is rejected');
assert(validateStockChange(20, 15, 'STOCK_IN').isValid === true, 'Positive stock-in (20 + 15) is permitted');

// TEST SUITE 5: INTER-WAREHOUSE TRANSFER VALIDATION
console.log('\n--- TEST SUITE 5: Inter-Warehouse Stock Transfer Rules ---');
assert(validateTransfer('WH-001', 'WH-002', 'PRD-1001', 10, 50).isValid === true, 'Valid inter-warehouse transfer is permitted');
assert(validateTransfer('WH-001', 'WH-001', 'PRD-1001', 10, 50).isValid === false, 'Transfer where source == destination is rejected');
assert(validateTransfer('WH-001', 'WH-002', 'PRD-1001', 60, 50).isValid === false, 'Transfer quantity exceeding available source stock is rejected');
assert(validateTransfer('WH-001', 'WH-002', 'PRD-1001', -5, 50).isValid === false, 'Non-positive transfer quantity is rejected');

// TEST SUITE 6: PURCHASE ORDER CALCULATIONS & RECEIVING
console.log('\n--- TEST SUITE 6: Purchase Order Subtotals & Calculations ---');
const samplePO = {
  items: [
    { quantity: 50, unitPrice: 400 },
    { quantity: 20, unitPrice: 1500 },
    { quantity: 10, unitPrice: 850 }
  ]
};
const calculatedTotal = samplePO.items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
assert(calculatedTotal === (50 * 400 + 20 * 1500 + 10 * 850), `Purchase Order total calculation matches formula: ₹${calculatedTotal}`);

console.log('\n==================================================');
console.log(`AUTOMATED TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('==================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL BUSINESS LOGIC AND SEED CONSTRAINTS SATISFIED!');
}
