// Automated API endpoint verification script
async function runTests() {
  const baseUrl = 'http://localhost:5000/api/v1';

  console.log('--- 1. Testing Health Endpoint ---');
  try {
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log('Health Response:', healthData.status === 'healthy' ? 'PASS (Healthy)' : 'FAIL');
  } catch (e) {
    console.error('Health Check Failed:', e.message);
  }

  console.log('\n--- 2. Testing Registration Validation (Password < 6 characters) ---');
  try {
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alex', email: 'test@example.com', password: '123' }),
    });
    const regData = await regRes.json();
    console.log('Status Code:', regRes.status);
    console.log('Validation Message:', regData.message);
    console.log(regRes.status === 400 ? 'PASS (Correctly rejected short password)' : 'FAIL');
  } catch (e) {
    console.error('Registration Test Failed:', e.message);
  }

  console.log('\n--- 3. Testing 404 Route Catcher ---');
  try {
    const notFoundRes = await fetch(`${baseUrl}/non-existent-route`);
    const notFoundData = await notFoundRes.json();
    console.log('Status Code:', notFoundRes.status);
    console.log('404 Message:', notFoundData.message);
    console.log(notFoundRes.status === 404 ? 'PASS (Correct 404 response)' : 'FAIL');
  } catch (e) {
    console.error('404 Test Failed:', e.message);
  }
}

runTests();
