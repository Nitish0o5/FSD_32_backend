(async () => {
  try {
    const registerRes = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Auto Test', email: `autotest+${Date.now()}@example.com`, password: 'Password123!', role: 'instructor' })
    });
    const registerJson = await registerRes.json();
    console.log('REGISTER STATUS', registerRes.status);
    console.log(registerJson);

    const email = registerJson.user?.email;
    const loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: 'Password123!' })
    });
    const loginJson = await loginRes.json();
    console.log('LOGIN STATUS', loginRes.status);
    console.log(loginJson);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
