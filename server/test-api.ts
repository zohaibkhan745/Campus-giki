export {};

async function runTest() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'acm@giki.edu.pk',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.payload.accessToken;

    const res = await fetch('http://localhost:3000/api/posts/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

runTest();
