const API_URL = 'http://127.0.0.1:3000';

async function testRoutes() {
    console.log('--- Verificando Rutas ---');
    try {
        console.log('1. Probando /health...');
        const hRes = await fetch(`${API_URL}/health`);
        console.log('   Status:', hRes.status);
        
        console.log('2. Probando /api/auth/login (POST)...');
        const lRes = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@test.com', password: '123' })
        });
        console.log('   Status:', lRes.status);
        const lData = await lRes.json().catch(() => ({}));
        console.log('   Data:', lData);

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

testRoutes();