/**
 * Realistic Mock Seed Data for RetailFlow Inventory Management System
 * Categories: Electronics, Clothing, Grocery, Home & Kitchen, Personal Care, Accessories
 * 30+ Products, 3 Warehouses, 6 Suppliers, 8 Purchase Orders, 18 Inventory Transactions, 5 Transfers
 */

export const INITIAL_WAREHOUSES = [
  {
    id: "WH-001",
    name: "Delhi Warehouse",
    location: "Okhla Industrial Area Phase III, New Delhi - 110020",
    managerName: "Rajesh Kumar",
    contactNumber: "+91 98112 34567",
    storageCapacity: 50000,
    status: "Active",
    createdAt: "2025-01-15T09:00:00.000Z"
  },
  {
    id: "WH-002",
    name: "Noida Warehouse",
    location: "Sector 62, Electronic City, Noida, UP - 201309",
    managerName: "Pooja Sharma",
    contactNumber: "+91 98711 89012",
    storageCapacity: 35000,
    status: "Active",
    createdAt: "2025-02-01T10:30:00.000Z"
  },
  {
    id: "WH-003",
    name: "Ghaziabad Warehouse",
    location: "Industrial Area, Loni Road, Ghaziabad, UP - 201007",
    managerName: "Amit Verma",
    contactNumber: "+91 99580 43210",
    storageCapacity: 30000,
    status: "Active",
    createdAt: "2025-03-10T11:15:00.000Z"
  }
];

export const INITIAL_SUPPLIERS = [
  {
    id: "SUP-101",
    name: "Vikram Malhotra",
    companyName: "Zenith Techtronics Pvt Ltd",
    email: "orders@zenithtech.in",
    phone: "+91 98200 12345",
    address: "Nehru Place Commercial Complex, New Delhi",
    suppliedProducts: ["Wireless Mouse", "Mechanical Keyboard", "USB-C Charger", "Bluetooth Headphones", "Smart Watch"],
    status: "Active",
    createdAt: "2025-01-10T08:00:00.000Z"
  },
  {
    id: "SUP-102",
    name: "Ananya Sengupta",
    companyName: "Apex Apparel & Textiles",
    email: "contact@apexapparel.co.in",
    phone: "+91 97170 56789",
    address: "Udyog Vihar Phase 4, Gurugram, Haryana",
    suppliedProducts: ["Cotton T-Shirt", "Slim Fit Denim Jeans", "Formal Cotton Shirt", "Woolen Pullover", "Athletic Track Pants"],
    status: "Active",
    createdAt: "2025-01-12T10:00:00.000Z"
  },
  {
    id: "SUP-103",
    name: "Sunil Agrawal",
    companyName: "Kisan Agro Foods & Staples",
    email: "sales@kisanagro.com",
    phone: "+91 94150 98765",
    address: "Grain Mandi, Najafgarh, New Delhi",
    suppliedProducts: ["Rice 5kg", "Cooking Oil 1L", "Whole Wheat Flour 10kg", "Organic Green Tea 250g", "Toor Dal 1kg", "Cashew Nuts 500g"],
    status: "Active",
    createdAt: "2025-01-18T14:30:00.000Z"
  },
  {
    id: "SUP-104",
    name: "Rameshwar Dayal",
    companyName: "HomeCraft Living Essentials",
    email: "support@homecraftliving.in",
    phone: "+91 98390 11223",
    address: "Maya Puri Industrial Area, New Delhi",
    suppliedProducts: ["Water Bottle", "Table Lamp", "Ceramic Dinner Set", "Stainless Steel Cookware Set", "Microfiber Bed Sheet"],
    status: "Active",
    createdAt: "2025-02-05T09:45:00.000Z"
  },
  {
    id: "SUP-105",
    name: "Dr. Meenakshi Sundaram",
    companyName: "Aura Herbals & Personal Care",
    email: "care@auraherbals.com",
    phone: "+91 99400 33445",
    address: "Baddi Industrial Estate, Solan, Himachal Pradesh",
    suppliedProducts: ["Herbal Shampoo 400ml", "Hydrating Face Wash 150ml", "Aloe Vera Gel 200g", "SPF 50 Sunscreen 100ml", "Organic Lip Balm"],
    status: "Active",
    createdAt: "2025-02-12T12:00:00.000Z"
  },
  {
    id: "SUP-106",
    name: "Karan Johar Oberoi",
    companyName: "UrbanGear Lifestyle Accessories",
    email: "info@urbangear.in",
    phone: "+91 98100 66778",
    address: "Connaught Place Outer Circle, New Delhi",
    suppliedProducts: ["Backpack", "Running Shoes", "Polarized Sunglasses", "Leather Bifold Wallet", "Stainless Steel Thermos Flask", "Travel Duffel Bag"],
    status: "Active",
    createdAt: "2025-02-20T16:20:00.000Z"
  }
];

export const INITIAL_PRODUCTS = [
  // 1. Electronics
  {
    id: "PRD-1001",
    name: "Wireless Mouse",
    sku: "ELEC-MOU-101",
    category: "Electronics",
    description: "Ergonomic 2.4GHz wireless optical mouse with silent click and DPI switch.",
    purchasePrice: 450,
    sellingPrice: 899,
    minStockLevel: 25,
    supplierId: "SUP-101",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 60, "WH-002": 35, "WH-003": 15 },
    stock: 110,
    createdAt: "2025-01-20T10:00:00.000Z"
  },
  {
    id: "PRD-1002",
    name: "Mechanical Keyboard",
    sku: "ELEC-KEY-102",
    category: "Electronics",
    description: "RGB backlit mechanical keyboard with hot-swappable blue switches.",
    purchasePrice: 1800,
    sellingPrice: 3299,
    minStockLevel: 15,
    supplierId: "SUP-101",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 30, "WH-002": 15, "WH-003": 5 },
    stock: 50,
    createdAt: "2025-01-21T11:00:00.000Z"
  },
  {
    id: "PRD-1003",
    name: "USB-C Charger 65W",
    sku: "ELEC-CHG-103",
    category: "Electronics",
    description: "GaN fast charger adapter with dual Type-C and USB-A power delivery.",
    purchasePrice: 850,
    sellingPrice: 1699,
    minStockLevel: 30,
    supplierId: "SUP-101",
    warehouseId: "WH-002",
    warehouseStock: { "WH-001": 20, "WH-002": 55, "WH-003": 10 },
    stock: 85,
    createdAt: "2025-01-22T14:30:00.000Z"
  },
  {
    id: "PRD-1004",
    name: "Bluetooth Headphones",
    sku: "ELEC-AUD-104",
    category: "Electronics",
    description: "Over-ear active noise cancelling headphones with 40h battery playback.",
    purchasePrice: 2200,
    sellingPrice: 4499,
    minStockLevel: 20,
    supplierId: "SUP-101",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 25, "WH-002": 12, "WH-003": 3 },
    stock: 40,
    createdAt: "2025-01-25T09:15:00.000Z"
  },
  {
    id: "PRD-1005",
    name: "Smart Watch",
    sku: "ELEC-WAT-105",
    category: "Electronics",
    description: "1.96-inch AMOLED display smartwatch with Bluetooth calling and fitness monitor.",
    purchasePrice: 1600,
    sellingPrice: 2999,
    minStockLevel: 15,
    supplierId: "SUP-101",
    warehouseId: "WH-003",
    warehouseStock: { "WH-001": 10, "WH-002": 10, "WH-003": 12 },
    stock: 32,
    createdAt: "2025-02-01T15:00:00.000Z"
  },
  {
    id: "PRD-1006",
    name: "Full HD Webcam 1080p",
    sku: "ELEC-CAM-106",
    category: "Electronics",
    description: "Auto-focus computer web camera with built-in stereo privacy shutter.",
    purchasePrice: 1100,
    sellingPrice: 2199,
    minStockLevel: 10,
    supplierId: "SUP-101",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 6, "WH-002": 2, "WH-003": 0 },
    stock: 8, // Low Stock intentionally for alerts
    createdAt: "2025-02-02T16:00:00.000Z"
  },

  // 2. Clothing
  {
    id: "PRD-1007",
    name: "Cotton T-Shirt (Pack of 3)",
    sku: "CLOT-TSH-201",
    category: "Clothing",
    description: "100% combed cotton breathable round-neck casual t-shirts for men.",
    purchasePrice: 499,
    sellingPrice: 999,
    minStockLevel: 40,
    supplierId: "SUP-102",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 90, "WH-002": 60, "WH-003": 30 },
    stock: 180,
    createdAt: "2025-01-15T12:00:00.000Z"
  },
  {
    id: "PRD-1008",
    name: "Slim Fit Denim Jeans",
    sku: "CLOT-JEA-202",
    category: "Clothing",
    description: "Comfort stretch dark blue slim tapered denim trousers with 5 pockets.",
    purchasePrice: 750,
    sellingPrice: 1699,
    minStockLevel: 30,
    supplierId: "SUP-102",
    warehouseId: "WH-002",
    warehouseStock: { "WH-001": 40, "WH-002": 45, "WH-003": 15 },
    stock: 100,
    createdAt: "2025-01-16T13:30:00.000Z"
  },
  {
    id: "PRD-1009",
    name: "Formal Cotton Shirt",
    sku: "CLOT-SHT-203",
    category: "Clothing",
    description: "Wrinkle-resistant classic fit formal dress shirt for office wear.",
    purchasePrice: 600,
    sellingPrice: 1299,
    minStockLevel: 25,
    supplierId: "SUP-102",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 35, "WH-002": 20, "WH-003": 10 },
    stock: 65,
    createdAt: "2025-01-18T10:45:00.000Z"
  },
  {
    id: "PRD-1010",
    name: "Woolen Pullover Sweater",
    sku: "CLOT-SWE-204",
    category: "Clothing",
    description: "Ribbed knit crew neck warm blended winter sweater.",
    purchasePrice: 850,
    sellingPrice: 1899,
    minStockLevel: 20,
    supplierId: "SUP-102",
    warehouseId: "WH-003",
    warehouseStock: { "WH-001": 0, "WH-002": 0, "WH-003": 0 },
    stock: 0, // Out of Stock intentionally
    createdAt: "2025-01-20T08:30:00.000Z"
  },
  {
    id: "PRD-1011",
    name: "Athletic Track Pants",
    sku: "CLOT-TRK-205",
    category: "Clothing",
    description: "Dry-fit moisture wicking gym track pants with zip pockets.",
    purchasePrice: 450,
    sellingPrice: 949,
    minStockLevel: 25,
    supplierId: "SUP-102",
    warehouseId: "WH-002",
    warehouseStock: { "WH-001": 20, "WH-002": 35, "WH-003": 15 },
    stock: 70,
    createdAt: "2025-02-03T11:20:00.000Z"
  },

  // 3. Grocery
  {
    id: "PRD-1012",
    name: "Rice 5kg (Royal Basmati)",
    sku: "GROC-RIC-301",
    category: "Grocery",
    description: "Aged long grain aromatic Basmati rice sealed in heavy duty pouch.",
    purchasePrice: 420,
    sellingPrice: 650,
    minStockLevel: 50,
    supplierId: "SUP-103",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 120, "WH-002": 80, "WH-003": 40 },
    stock: 240,
    createdAt: "2025-01-10T14:00:00.000Z"
  },
  {
    id: "PRD-1013",
    name: "Cooking Oil 1L (Cold Pressed Mustard)",
    sku: "GROC-OIL-302",
    category: "Grocery",
    description: "Pure kachi ghani mustard cooking oil packed in recyclable bottle.",
    purchasePrice: 120,
    sellingPrice: 185,
    minStockLevel: 60,
    supplierId: "SUP-103",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 150, "WH-002": 90, "WH-003": 60 },
    stock: 300,
    createdAt: "2025-01-11T09:00:00.000Z"
  },
  {
    id: "PRD-1014",
    name: "Whole Wheat Flour 10kg",
    sku: "GROC-ATT-303",
    category: "Grocery",
    description: "100% whole grain stone ground chakki fresh sharbati atta.",
    purchasePrice: 380,
    sellingPrice: 495,
    minStockLevel: 40,
    supplierId: "SUP-103",
    warehouseId: "WH-003",
    warehouseStock: { "WH-001": 70, "WH-002": 50, "WH-003": 45 },
    stock: 165,
    createdAt: "2025-01-14T11:30:00.000Z"
  },
  {
    id: "PRD-1015",
    name: "Organic Green Tea 250g",
    sku: "GROC-TEA-304",
    category: "Grocery",
    description: "Darjeeling whole leaf antioxidant rich herbal green tea.",
    purchasePrice: 210,
    sellingPrice: 380,
    minStockLevel: 30,
    supplierId: "SUP-103",
    warehouseId: "WH-002",
    warehouseStock: { "WH-001": 25, "WH-002": 45, "WH-003": 20 },
    stock: 90,
    createdAt: "2025-01-19T15:45:00.000Z"
  },
  {
    id: "PRD-1016",
    name: "Toor Dal 1kg",
    sku: "GROC-DAL-305",
    category: "Grocery",
    description: "Unpolished farm fresh high protein pigeon pea lentils.",
    purchasePrice: 115,
    sellingPrice: 165,
    minStockLevel: 45,
    supplierId: "SUP-103",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 5, "WH-002": 4, "WH-003": 2 },
    stock: 11, // Low stock intentionally
    createdAt: "2025-01-24T13:15:00.000Z"
  },
  {
    id: "PRD-1017",
    name: "Cashew Nuts 500g (W240 Grade)",
    sku: "GROC-CSH-306",
    category: "Grocery",
    description: "Premium jumbo crunchy whole cashew nuts vacuum packed.",
    purchasePrice: 460,
    sellingPrice: 699,
    minStockLevel: 20,
    supplierId: "SUP-103",
    warehouseId: "WH-002",
    warehouseStock: { "WH-001": 15, "WH-002": 25, "WH-003": 8 },
    stock: 48,
    createdAt: "2025-02-04T10:00:00.000Z"
  },

  // 4. Home & Kitchen
  {
    id: "PRD-1018",
    name: "Water Bottle 1000ml (Copper)",
    sku: "HOME-BOT-401",
    category: "Home & Kitchen",
    description: "Ayurvedic seamless leakproof pure copper water bottle.",
    purchasePrice: 520,
    sellingPrice: 999,
    minStockLevel: 25,
    supplierId: "SUP-104",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 45, "WH-002": 30, "WH-003": 15 },
    stock: 90,
    createdAt: "2025-01-12T16:00:00.000Z"
  },
  {
    id: "PRD-1019",
    name: "Table Lamp (Nordic Wood)",
    sku: "HOME-LMP-402",
    category: "Home & Kitchen",
    description: "Minimalist wooden base nightstand study desk lamp with fabric shade.",
    purchasePrice: 650,
    sellingPrice: 1450,
    minStockLevel: 15,
    supplierId: "SUP-104",
    warehouseId: "WH-002",
    warehouseStock: { "WH-001": 20, "WH-002": 22, "WH-003": 10 },
    stock: 52,
    createdAt: "2025-01-17T14:15:00.000Z"
  },
  {
    id: "PRD-1020",
    name: "Ceramic Dinner Set (18 Pcs)",
    sku: "HOME-DIN-403",
    category: "Home & Kitchen",
    description: "Microwave and dishwasher safe ceramic plates and bowls dinnerware.",
    purchasePrice: 1400,
    sellingPrice: 2899,
    minStockLevel: 10,
    supplierId: "SUP-104",
    warehouseId: "WH-003",
    warehouseStock: { "WH-001": 8, "WH-002": 5, "WH-003": 9 },
    stock: 22,
    createdAt: "2025-01-23T11:00:00.000Z"
  },
  {
    id: "PRD-1021",
    name: "Stainless Steel Cookware Set (3 Pcs)",
    sku: "HOME-CKW-404",
    category: "Home & Kitchen",
    description: "Tri-ply induction compatible fry pan, kadai, and sauce pan with lid.",
    purchasePrice: 1950,
    sellingPrice: 3799,
    minStockLevel: 12,
    supplierId: "SUP-104",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 15, "WH-002": 10, "WH-003": 6 },
    stock: 31,
    createdAt: "2025-01-28T09:40:00.000Z"
  },
  {
    id: "PRD-1022",
    name: "Microfiber King Bed Sheet",
    sku: "HOME-BED-405",
    category: "Home & Kitchen",
    description: "Super soft breathable 250 GSM bedsheet with 2 pillow covers.",
    purchasePrice: 420,
    sellingPrice: 899,
    minStockLevel: 25,
    supplierId: "SUP-104",
    warehouseId: "WH-002",
    warehouseStock: { "WH-001": 3, "WH-002": 2, "WH-003": 1 },
    stock: 6, // Low stock intentionally
    createdAt: "2025-02-06T15:20:00.000Z"
  },

  // 5. Personal Care
  {
    id: "PRD-1023",
    name: "Herbal Shampoo 400ml",
    sku: "CARE-SHM-501",
    category: "Personal Care",
    description: "Sulfate-free bhringraj & shikakai anti-dandruff daily hair cleanser.",
    purchasePrice: 180,
    sellingPrice: 349,
    minStockLevel: 35,
    supplierId: "SUP-105",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 50, "WH-002": 45, "WH-003": 25 },
    stock: 120,
    createdAt: "2025-01-13T10:10:00.000Z"
  },
  {
    id: "PRD-1024",
    name: "Hydrating Face Wash 150ml",
    sku: "CARE-FAC-502",
    category: "Personal Care",
    description: "Gentle neem and tea tree foaming facial wash for acne control.",
    purchasePrice: 120,
    sellingPrice: 249,
    minStockLevel: 30,
    supplierId: "SUP-105",
    warehouseId: "WH-002",
    warehouseStock: { "WH-001": 40, "WH-002": 65, "WH-003": 20 },
    stock: 125,
    createdAt: "2025-01-16T12:45:00.000Z"
  },
  {
    id: "PRD-1025",
    name: "Aloe Vera Gel 200g",
    sku: "CARE-ALO-503",
    category: "Personal Care",
    description: "99% pure cold pressed multi-purpose soothing moisturizing gel.",
    purchasePrice: 95,
    sellingPrice: 199,
    minStockLevel: 40,
    supplierId: "SUP-105",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 70, "WH-002": 30, "WH-003": 20 },
    stock: 120,
    createdAt: "2025-01-22T17:15:00.000Z"
  },
  {
    id: "PRD-1026",
    name: "SPF 50 Sunscreen 100ml",
    sku: "CARE-SUN-504",
    category: "Personal Care",
    description: "Broad spectrum PA+++ non-greasy matte finish sun protection cream.",
    purchasePrice: 210,
    sellingPrice: 425,
    minStockLevel: 25,
    supplierId: "SUP-105",
    warehouseId: "WH-003",
    warehouseStock: { "WH-001": 20, "WH-002": 25, "WH-003": 30 },
    stock: 75,
    createdAt: "2025-01-27T14:00:00.000Z"
  },
  {
    id: "PRD-1027",
    name: "Organic Lip Balm 15g",
    sku: "CARE-LIP-505",
    category: "Personal Care",
    description: "Beeswax and shea butter hydrating strawberry lip butter.",
    purchasePrice: 45,
    sellingPrice: 120,
    minStockLevel: 40,
    supplierId: "SUP-105",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 0, "WH-002": 0, "WH-003": 0 },
    stock: 0, // Out of Stock intentionally
    createdAt: "2025-02-08T11:20:00.000Z"
  },

  // 6. Accessories
  {
    id: "PRD-1028",
    name: "Water Resistant Laptop Backpack",
    sku: "ACCS-BAK-601",
    category: "Accessories",
    description: "30L lightweight business travel laptop backpack with anti-theft zipper.",
    purchasePrice: 850,
    sellingPrice: 1799,
    minStockLevel: 20,
    supplierId: "SUP-106",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 35, "WH-002": 20, "WH-003": 10 },
    stock: 65,
    createdAt: "2025-01-14T09:20:00.000Z"
  },
  {
    id: "PRD-1029",
    name: "Running Shoes (FlyKnit Air)",
    sku: "ACCS-SHO-602",
    category: "Accessories",
    description: "Lightweight breathable mesh athletic training walking sneakers.",
    purchasePrice: 1250,
    sellingPrice: 2499,
    minStockLevel: 25,
    supplierId: "SUP-106",
    warehouseId: "WH-002",
    warehouseStock: { "WH-001": 30, "WH-002": 40, "WH-003": 15 },
    stock: 85,
    createdAt: "2025-01-19T13:40:00.000Z"
  },
  {
    id: "PRD-1030",
    name: "Polarized UV400 Sunglasses",
    sku: "ACCS-SUN-603",
    category: "Accessories",
    description: "Retro aviator metal frame polarized glare reduction sunglasses.",
    purchasePrice: 480,
    sellingPrice: 1199,
    minStockLevel: 20,
    supplierId: "SUP-106",
    warehouseId: "WH-003",
    warehouseStock: { "WH-001": 15, "WH-002": 15, "WH-003": 15 },
    stock: 45,
    createdAt: "2025-01-25T16:10:00.000Z"
  },
  {
    id: "PRD-1031",
    name: "Genuine Leather Bifold Wallet",
    sku: "ACCS-WAL-604",
    category: "Accessories",
    description: "RFID protected slim top-grain leather coin pocket pocketbook.",
    purchasePrice: 380,
    sellingPrice: 899,
    minStockLevel: 15,
    supplierId: "SUP-106",
    warehouseId: "WH-001",
    warehouseStock: { "WH-001": 4, "WH-002": 3, "WH-003": 2 },
    stock: 9, // Low stock intentionally
    createdAt: "2025-02-01T10:15:00.000Z"
  },
  {
    id: "PRD-1032",
    name: "Travel Duffel Gym Bag",
    sku: "ACCS-DUF-605",
    category: "Accessories",
    description: "Waterproof canvas gym bag with dedicated shoe compartment.",
    purchasePrice: 620,
    sellingPrice: 1399,
    minStockLevel: 20,
    supplierId: "SUP-106",
    warehouseId: "WH-002",
    warehouseStock: { "WH-001": 25, "WH-002": 25, "WH-003": 12 },
    stock: 62,
    createdAt: "2025-02-07T12:00:00.000Z"
  }
];

export const INITIAL_PURCHASE_ORDERS = [
  {
    id: "PO-2025-001",
    supplierId: "SUP-101",
    orderDate: "2025-02-01T10:00:00.000Z",
    expectedDelivery: "2025-02-08T18:00:00.000Z",
    targetWarehouseId: "WH-001",
    status: "Received",
    notes: "Q1 restock of core electronic peripherals.",
    items: [
      { productId: "PRD-1001", productName: "Wireless Mouse", quantity: 50, unitPrice: 450, total: 22500 },
      { productId: "PRD-1002", productName: "Mechanical Keyboard", quantity: 20, unitPrice: 1800, total: 36000 }
    ],
    totalAmount: 58500,
    receivedAt: "2025-02-07T14:30:00.000Z"
  },
  {
    id: "PO-2025-002",
    supplierId: "SUP-103",
    orderDate: "2025-02-03T11:30:00.000Z",
    expectedDelivery: "2025-02-10T18:00:00.000Z",
    targetWarehouseId: "WH-001",
    status: "Received",
    notes: "Bulk procurement of Basmati rice and cooking oil.",
    items: [
      { productId: "PRD-1012", productName: "Rice 5kg (Royal Basmati)", quantity: 100, unitPrice: 420, total: 42000 },
      { productId: "PRD-1013", productName: "Cooking Oil 1L", quantity: 150, unitPrice: 120, total: 18000 }
    ],
    totalAmount: 60000,
    receivedAt: "2025-02-09T16:00:00.000Z"
  },
  {
    id: "PO-2025-003",
    supplierId: "SUP-102",
    orderDate: "2025-02-10T14:00:00.000Z",
    expectedDelivery: "2025-02-18T18:00:00.000Z",
    targetWarehouseId: "WH-002",
    status: "Approved",
    notes: "Spring collection cotton casuals shipment awaiting dispatch.",
    items: [
      { productId: "PRD-1007", productName: "Cotton T-Shirt (Pack of 3)", quantity: 80, unitPrice: 499, total: 39920 },
      { productId: "PRD-1008", productName: "Slim Fit Denim Jeans", quantity: 40, unitPrice: 750, total: 30000 }
    ],
    totalAmount: 69920
  },
  {
    id: "PO-2025-004",
    supplierId: "SUP-105",
    orderDate: "2025-02-14T09:15:00.000Z",
    expectedDelivery: "2025-02-22T18:00:00.000Z",
    targetWarehouseId: "WH-001",
    status: "Pending",
    notes: "Urgent restocking for aloe vera gel and skin care products.",
    items: [
      { productId: "PRD-1023", productName: "Herbal Shampoo 400ml", quantity: 60, unitPrice: 180, total: 10800 },
      { productId: "PRD-1025", productName: "Aloe Vera Gel 200g", quantity: 50, unitPrice: 95, total: 4750 },
      { productId: "PRD-1026", productName: "SPF 50 Sunscreen 100ml", quantity: 40, unitPrice: 210, total: 8400 }
    ],
    totalAmount: 23950
  },
  {
    id: "PO-2025-005",
    supplierId: "SUP-104",
    orderDate: "2025-02-18T16:00:00.000Z",
    expectedDelivery: "2025-02-26T18:00:00.000Z",
    targetWarehouseId: "WH-002",
    status: "Pending",
    notes: "Table lamps and dinner set restock for Noida hub.",
    items: [
      { productId: "PRD-1019", productName: "Table Lamp (Nordic Wood)", quantity: 30, unitPrice: 650, total: 19500 },
      { productId: "PRD-1020", productName: "Ceramic Dinner Set (18 Pcs)", quantity: 15, unitPrice: 1400, total: 21000 }
    ],
    totalAmount: 40500
  },
  {
    id: "PO-2025-006",
    supplierId: "SUP-106",
    orderDate: "2025-02-20T10:45:00.000Z",
    expectedDelivery: "2025-02-28T18:00:00.000Z",
    targetWarehouseId: "WH-001",
    status: "Draft",
    notes: "Draft order for outdoor accessories and travel backpacks.",
    items: [
      { productId: "PRD-1028", productName: "Water Resistant Laptop Backpack", quantity: 40, unitPrice: 850, total: 34000 },
      { productId: "PRD-1031", productName: "Genuine Leather Bifold Wallet", quantity: 50, unitPrice: 380, total: 19000 }
    ],
    totalAmount: 53000
  },
  {
    id: "PO-2025-007",
    supplierId: "SUP-101",
    orderDate: "2025-02-22T13:20:00.000Z",
    expectedDelivery: "2025-03-02T18:00:00.000Z",
    targetWarehouseId: "WH-002",
    status: "Approved",
    notes: "High demand USB-C GaN adapters and Smart Watches.",
    items: [
      { productId: "PRD-1003", productName: "USB-C Charger 65W", quantity: 50, unitPrice: 850, total: 42500 },
      { productId: "PRD-1005", productName: "Smart Watch", quantity: 25, unitPrice: 1600, total: 40000 }
    ],
    totalAmount: 82500
  },
  {
    id: "PO-2025-008",
    supplierId: "SUP-102",
    orderDate: "2025-01-25T11:00:00.000Z",
    expectedDelivery: "2025-01-31T18:00:00.000Z",
    targetWarehouseId: "WH-003",
    status: "Cancelled",
    notes: "Supplier had raw material shortage for wool blend.",
    items: [
      { productId: "PRD-1010", productName: "Woolen Pullover Sweater", quantity: 30, unitPrice: 850, total: 25500 }
    ],
    totalAmount: 25500
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-801",
    productId: "PRD-1001",
    productName: "Wireless Mouse",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "STOCK_IN",
    quantity: 50,
    previousStock: 60,
    updatedStock: 110,
    date: "2025-02-07T14:30:00.000Z",
    notes: "Goods received via PO-2025-001."
  },
  {
    id: "TXN-802",
    productId: "PRD-1002",
    productName: "Mechanical Keyboard",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "STOCK_IN",
    quantity: 20,
    previousStock: 30,
    updatedStock: 50,
    date: "2025-02-07T14:35:00.000Z",
    notes: "Goods received via PO-2025-001."
  },
  {
    id: "TXN-803",
    productId: "PRD-1012",
    productName: "Rice 5kg (Royal Basmati)",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "STOCK_IN",
    quantity: 100,
    previousStock: 140,
    updatedStock: 240,
    date: "2025-02-09T16:00:00.000Z",
    notes: "Bulk shipment verified under PO-2025-002."
  },
  {
    id: "TXN-804",
    productId: "PRD-1013",
    productName: "Cooking Oil 1L",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "STOCK_IN",
    quantity: 150,
    previousStock: 150,
    updatedStock: 300,
    date: "2025-02-09T16:05:00.000Z",
    notes: "Direct factory unload under PO-2025-002."
  },
  {
    id: "TXN-805",
    productId: "PRD-1001",
    productName: "Wireless Mouse",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "STOCK_OUT",
    quantity: 12,
    previousStock: 122,
    updatedStock: 110,
    date: "2025-02-12T10:15:00.000Z",
    notes: "Store distribution dispatch #ORD-4491."
  },
  {
    id: "TXN-806",
    productId: "PRD-1003",
    productName: "USB-C Charger 65W",
    warehouseId: "WH-002",
    warehouseName: "Noida Warehouse",
    type: "STOCK_OUT",
    quantity: 15,
    previousStock: 100,
    updatedStock: 85,
    date: "2025-02-14T11:40:00.000Z",
    notes: "Retail store inventory pickup."
  },
  {
    id: "TXN-807",
    productId: "PRD-1006",
    productName: "Full HD Webcam 1080p",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "STOCK_OUT",
    quantity: 10,
    previousStock: 18,
    updatedStock: 8,
    date: "2025-02-15T15:20:00.000Z",
    notes: "Corporate bundle sale fulfillment."
  },
  {
    id: "TXN-808",
    productId: "PRD-1007",
    productName: "Cotton T-Shirt (Pack of 3)",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "STOCK_OUT",
    quantity: 20,
    previousStock: 200,
    updatedStock: 180,
    date: "2025-02-16T12:00:00.000Z",
    notes: "Weekend flash sale dispatches."
  },
  {
    id: "TXN-809",
    productId: "PRD-1016",
    productName: "Toor Dal 1kg",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "ADJUSTMENT",
    quantity: -5,
    previousStock: 16,
    updatedStock: 11,
    date: "2025-02-17T09:30:00.000Z",
    notes: "Damaged packaging discovered during audit."
  },
  {
    id: "TXN-810",
    productId: "PRD-1022",
    productName: "Microfiber King Bed Sheet",
    warehouseId: "WH-002",
    warehouseName: "Noida Warehouse",
    type: "STOCK_OUT",
    quantity: 14,
    previousStock: 20,
    updatedStock: 6,
    date: "2025-02-18T14:10:00.000Z",
    notes: "Outlet consignment delivery."
  },
  {
    id: "TXN-811",
    productId: "PRD-1027",
    productName: "Organic Lip Balm 15g",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "STOCK_OUT",
    quantity: 25,
    previousStock: 25,
    updatedStock: 0,
    date: "2025-02-19T16:45:00.000Z",
    notes: "Final inventory cleared to zero."
  },
  {
    id: "TXN-812",
    productId: "PRD-1010",
    productName: "Woolen Pullover Sweater",
    warehouseId: "WH-003",
    warehouseName: "Ghaziabad Warehouse",
    type: "STOCK_OUT",
    quantity: 10,
    previousStock: 10,
    updatedStock: 0,
    date: "2025-02-20T11:00:00.000Z",
    notes: "End-of-season clearance."
  },
  {
    id: "TXN-813",
    productId: "PRD-1031",
    productName: "Genuine Leather Bifold Wallet",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "STOCK_OUT",
    quantity: 11,
    previousStock: 20,
    updatedStock: 9,
    date: "2025-02-21T13:15:00.000Z",
    notes: "Counter sale bulk delivery."
  },
  {
    id: "TXN-814",
    productId: "PRD-1018",
    productName: "Water Bottle 1000ml (Copper)",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "ADJUSTMENT",
    quantity: 5,
    previousStock: 85,
    updatedStock: 90,
    date: "2025-02-22T10:00:00.000Z",
    notes: "Stock reconciled following physical tally."
  },
  {
    id: "TXN-815",
    productId: "PRD-1004",
    productName: "Bluetooth Headphones",
    warehouseId: "WH-001",
    warehouseName: "Delhi Warehouse",
    type: "STOCK_OUT",
    quantity: 5,
    previousStock: 45,
    updatedStock: 40,
    date: "2025-02-23T15:30:00.000Z",
    notes: "Customer showroom test stock and order fulfillment."
  },
  {
    id: "TXN-816",
    productId: "PRD-1024",
    productName: "Hydrating Face Wash 150ml",
    warehouseId: "WH-002",
    warehouseName: "Noida Warehouse",
    type: "STOCK_IN",
    quantity: 25,
    previousStock: 100,
    updatedStock: 125,
    date: "2025-02-24T12:00:00.000Z",
    notes: "Supplier promotional bonus batch."
  },
  {
    id: "TXN-817",
    productId: "PRD-1029",
    productName: "Running Shoes (FlyKnit Air)",
    warehouseId: "WH-002",
    warehouseName: "Noida Warehouse",
    type: "STOCK_OUT",
    quantity: 15,
    previousStock: 100,
    updatedStock: 85,
    date: "2025-02-25T11:45:00.000Z",
    notes: "Retail sports partner shipment."
  },
  {
    id: "TXN-818",
    productId: "PRD-1030",
    productName: "Polarized UV400 Sunglasses",
    warehouseId: "WH-003",
    warehouseName: "Ghaziabad Warehouse",
    type: "ADJUSTMENT",
    quantity: -3,
    previousStock: 48,
    updatedStock: 45,
    date: "2025-02-26T16:20:00.000Z",
    notes: "Broken optical sample replacement."
  }
];

export const INITIAL_TRANSFERS = [
  {
    id: "TRF-901",
    sourceWarehouseId: "WH-001",
    sourceWarehouseName: "Delhi Warehouse",
    destinationWarehouseId: "WH-002",
    destinationWarehouseName: "Noida Warehouse",
    productId: "PRD-1001",
    productName: "Wireless Mouse",
    quantity: 20,
    status: "Completed",
    notes: "Shifted to meet higher e-commerce order volume in Noida.",
    createdAt: "2025-02-10T11:00:00.000Z"
  },
  {
    id: "TRF-902",
    sourceWarehouseId: "WH-001",
    sourceWarehouseName: "Delhi Warehouse",
    destinationWarehouseId: "WH-003",
    destinationWarehouseName: "Ghaziabad Warehouse",
    productId: "PRD-1012",
    productName: "Rice 5kg (Royal Basmati)",
    quantity: 30,
    status: "Completed",
    notes: "Replenishing Ghaziabad regional fulfillment zone.",
    createdAt: "2025-02-12T14:30:00.000Z"
  },
  {
    id: "TRF-903",
    sourceWarehouseId: "WH-002",
    sourceWarehouseName: "Noida Warehouse",
    destinationWarehouseId: "WH-001",
    destinationWarehouseName: "Delhi Warehouse",
    productId: "PRD-1008",
    productName: "Slim Fit Denim Jeans",
    quantity: 15,
    status: "Completed",
    notes: "Central showroom display replenishment.",
    createdAt: "2025-02-15T09:45:00.000Z"
  },
  {
    id: "TRF-904",
    sourceWarehouseId: "WH-001",
    sourceWarehouseName: "Delhi Warehouse",
    destinationWarehouseId: "WH-002",
    destinationWarehouseName: "Noida Warehouse",
    productId: "PRD-1025",
    productName: "Aloe Vera Gel 200g",
    quantity: 20,
    status: "Completed",
    notes: "Balancing stock levels between warehouses.",
    createdAt: "2025-02-18T13:10:00.000Z"
  },
  {
    id: "TRF-905",
    sourceWarehouseId: "WH-003",
    sourceWarehouseName: "Ghaziabad Warehouse",
    destinationWarehouseId: "WH-001",
    destinationWarehouseName: "Delhi Warehouse",
    productId: "PRD-1020",
    productName: "Ceramic Dinner Set (18 Pcs)",
    quantity: 5,
    status: "Completed",
    notes: "Customer express pickup at Delhi facility.",
    createdAt: "2025-02-22T16:00:00.000Z"
  }
];

export const INITIAL_SETTINGS = {
  businessName: "RetailFlow Commerce Solutions",
  businessAddress: "Plot 42, Cyber Hub, Gurugram, Haryana - 122002",
  phone: "+91 124 456 7890",
  email: "support@retailflow.com",
  gstNumber: "07AAAAA0000A1Z5",
  currency: "INR",
  currencySymbol: "₹",
  lowStockThreshold: 20,
  enableEmailAlerts: true,
  autoSkuGeneration: true,
  profile: {
    name: "System Administrator",
    email: "admin@retailflow.com",
    role: "Lead Inventory Manager",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
  }
};
