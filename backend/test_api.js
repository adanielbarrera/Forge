const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function test() {
    console.log('--- Iniciando Pruebas de Endpoints ---');

    try {
        // 1. Registrar un Entrenador
        console.log('\n1. Registrando Entrenador...');
        const trainerReg = await axios.post(`${API_URL}/auth/register`, {
            email: `trainer_${Date.now()}@test.com`,
            password: 'password123',
            role: 'TRAINER'
        });
        console.log('Entrenador registrado.');

        // 2. Login Entrenador
        console.log('\n2. Login Entrenador...');
        const trainerLogin = await axios.post(`${API_URL}/auth/login`, {
            email: trainerReg.data.email,
            password: 'password123'
        });
        const trainerToken = trainerLogin.data.token;
        console.log('Login exitoso.');

        // 3. Registrar un Miembro
        console.log('\n3. Registrando Miembro...');
        const memberReg = await axios.post(`${API_URL}/auth/register`, {
            email: `member_${Date.now()}@test.com`,
            password: 'password123',
            role: 'MEMBER'
        });
        console.log('Miembro registrado.');

        // 4. Login Miembro
        console.log('\n4. Login Miembro...');
        const memberLogin = await axios.post(`${API_URL}/auth/login`, {
            email: memberReg.data.email,
            password: 'password123'
        });
        const memberToken = memberLogin.data.token;
        console.log('Login exitoso.');

        const authHeader = { headers: { Authorization: `Bearer ${memberToken}` } };
        const trainerAuthHeader = { headers: { Authorization: `Bearer ${trainerToken}` } };

        // 5. GET /api/exercises
        console.log('\n5. Probando GET /api/exercises...');
        const exercises = await axios.get(`${API_URL}/api/exercises`, authHeader);
        console.log(`Ejercicios encontrados: ${exercises.data.length}`);
        const exId = exercises.data[0].id;

        // 6. POST /api/workouts
        console.log('\n6. Probando POST /api/workouts...');
        const workoutData = {
            notas: 'Entrenamiento de prueba con IA',
            exercises: [
                { exerciseId: exId, series: 3, reps: 10, peso: 80 }
            ]
        };
        const newWorkout = await axios.post(`${API_URL}/api/workouts`, workoutData, authHeader);
        console.log('Workout creado:', newWorkout.data.id);

        // 7. GET /api/workouts
        console.log('\n7. Probando GET /api/workouts...');
        const workouts = await axios.get(`${API_URL}/api/workouts`, authHeader);
        console.log(`Entrenamientos del usuario: ${workouts.data.length}`);

        // 8. GET /api/workouts/:id
        console.log('\n8. Probando GET /api/workouts/:id...');
        const detail = await axios.get(`${API_URL}/api/workouts/${newWorkout.data.id}`, authHeader);
        console.log('Detalle del workout obtenido:', detail.data.notas);

        // 9. GET /api/memberships (TRAINER)
        console.log('\n9. Probando GET /api/memberships (TRAINER)...');
        try {
            const memberships = await axios.get(`${API_URL}/api/memberships`, trainerAuthHeader);
            console.log(`Membresías encontradas: ${memberships.data.length}`);
        } catch (e) {
            console.log('Error esperado si no hay membresías:', e.response?.data || e.message);
        }

        console.log('\n--- Pruebas Finalizadas con Éxito ---');

    } catch (error) {
        console.error('\n❌ ERROR EN LAS PRUEBAS:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

test();
