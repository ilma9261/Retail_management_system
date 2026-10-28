/**
 * Comprehensive Validation Service for Inventory, Warehouses, Suppliers & Orders
 */

export const validateProduct = (product, existingProducts = [], currentId = null) => {
  const errors = {};

  if (!product.name || !product.name.trim()) {
    errors.name = 'Product name is required';
  }

  if (!product.sku || !product.sku.trim()) {
    errors.sku = 'SKU is required';
  } else {
    const duplicateSku = existingProducts.find(
      p => p.sku.trim().toLowerCase() === product.sku.trim().toLowerCase() && p.id !== currentId
    );
    if (duplicateSku) {
      errors.sku = 'SKU must be unique across all products';
    }
  }

  if (!product.category || !product.category.trim()) {
    errors.category = 'Category is required';
  }

  if (product.purchasePrice === '' || isNaN(product.purchasePrice) || Number(product.purchasePrice) < 0) {
    errors.purchasePrice = 'Purchase price must be a non-negative number';
  }

  if (product.sellingPrice === '' || isNaN(product.sellingPrice) || Number(product.sellingPrice) < 0) {
    errors.sellingPrice = 'Selling price must be a non-negative number';
  }

  if (Number(product.sellingPrice) < Number(product.purchasePrice)) {
    // Warning or error - usually selling price should exceed or equal cost
    // Let's allow but maybe warn if needed, or validate
  }

  if (product.minStockLevel === '' || isNaN(product.minStockLevel) || Number(product.minStockLevel) < 0) {
    errors.minStockLevel = 'Minimum stock level must be a non-negative integer';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateWarehouse = (warehouse) => {
  const errors = {};
  if (!warehouse.name || !warehouse.name.trim()) {
    errors.name = 'Warehouse name is required';
  }
  if (!warehouse.location || !warehouse.location.trim()) {
    errors.location = 'Warehouse location is required';
  }
  if (!warehouse.managerName || !warehouse.managerName.trim()) {
    errors.managerName = 'Manager name is required';
  }
  if (!warehouse.contactNumber || !warehouse.contactNumber.trim()) {
    errors.contactNumber = 'Contact phone number is required';
  }
  if (!warehouse.storageCapacity || Number(warehouse.storageCapacity) <= 0) {
    errors.storageCapacity = 'Storage capacity must be greater than zero';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateSupplier = (supplier) => {
  const errors = {};
  if (!supplier.name || !supplier.name.trim()) {
    errors.name = 'Contact person name is required';
  }
  if (!supplier.companyName || !supplier.companyName.trim()) {
    errors.companyName = 'Company name is required';
  }
  if (!supplier.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplier.email)) {
    errors.email = 'Valid email address is required';
  }
  if (!supplier.phone || supplier.phone.replace(/[^0-9]/g, '').length < 7) {
    errors.phone = 'Valid phone number is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateTransfer = (sourceWarehouseId, destWarehouseId, productId, quantity, sourceCurrentStock) => {
  if (!sourceWarehouseId || !destWarehouseId) {
    return { isValid: false, message: 'Please select both source and destination warehouses.' };
  }
  if (sourceWarehouseId === destWarehouseId) {
    return { isValid: false, message: 'Source and destination warehouses must be different.' };
  }
  if (!productId) {
    return { isValid: false, message: 'Please select a product to transfer.' };
  }
  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
    return { isValid: false, message: 'Transfer quantity must be a positive whole number.' };
  }
  if (qty > sourceCurrentStock) {
    return {
      isValid: false,
      message: `Insufficient stock in source warehouse. Available: ${sourceCurrentStock} units, Requested: ${qty} units.`
    };
  }
  return { isValid: true };
};

export const validateStockChange = (currentStock, changeQty, type) => {
  const qty = Number(changeQty);
  if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
    return { isValid: false, message: 'Quantity must be a positive whole number.' };
  }

  if (type === 'STOCK_OUT' && currentStock < qty) {
    return {
      isValid: false,
      message: `Stock out would result in negative stock. Current: ${currentStock}, deduction: ${qty}. Negative stock is strictly prohibited.`
    };
  }

  return { isValid: true };
};
