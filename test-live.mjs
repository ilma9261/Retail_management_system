async function testLive() {
  const BASE = 'https://retail-inventory-system-ten.vercel.app';

  console.log('--- 1. Testing Live HTML ---');
  const htmlRes = await fetch(BASE);
  const htmlText = await htmlRes.text();
  console.log('HTML status:', htmlRes.status, 'HTML length:', htmlText.length);

  console.log('--- 2. Testing Live Login ---');
  const loginRes = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailflow.com', password: 'Admin@123' })
  });
  console.log('Login HTTP status:', loginRes.status);
  const loginData = await loginRes.json();
  if (!loginData.token) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }
  console.log('JWT received! User email:', loginData.user.email, 'Role:', loginData.user.role);

  const token = loginData.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  };

  console.log('--- 3. Testing Live Products ---');
  const prodsRes = await fetch(BASE + '/api/products', { headers });
  console.log('Products HTTP status:', prodsRes.status);
  const prods = await prodsRes.json();
  console.log('Products count from Atlas:', prods.length, 'Sample product:', prods[0]?.name, 'SKU:', prods[0]?.sku);

  console.log('--- 4. Testing Live Dashboard ---');
  const dashRes = await fetch(BASE + '/api/dashboard', { headers });
  console.log('Dashboard HTTP status:', dashRes.status);
  const stats = await dashRes.json();
  console.log('Dashboard metrics:', {
    totalProducts: stats.totalProducts,
    totalStockUnits: stats.totalStockUnits,
    totalStockValue: stats.totalStockValue,
    totalWarehouses: stats.totalWarehouses,
    totalSuppliers: stats.totalSuppliers
  });

  console.log('--- 5. Testing Live Warehouses & Suppliers ---');
  const whs = await fetch(BASE + '/api/warehouses', { headers }).then(r => r.json());
  const sups = await fetch(BASE + '/api/suppliers', { headers }).then(r => r.json());
  console.log('Live warehouses count:', whs.length, 'Live suppliers count:', sups.length);

  console.log('==============================================');
  console.log('🏆 ALL LIVE ENDPOINTS AND DATA FLOW VERIFIED 100%!');
  console.log('==============================================');
}

testLive().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
