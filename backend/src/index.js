require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const workoutRoutes = require('./routes/workout.routes');
const membershipRoutes = require('./routes/membership.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Cabeceras de seguridad automáticas (XSS, Clickjacking, etc.)
app.use(helmet());

// 2. CORS Restringido
const allowedOrigins = [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting (Protección contra fuerza bruta y DoS)
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 500, // Aumentado a 500 para permitir el desarrollo fluido
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta después de 5 minutos.' }
});
app.use('/api/', limiter);

// 4. Webhook de Stripe (Debe ir ANTES de express.json() para procesar el signature correctamente)
const membershipController = require('./controllers/membership.controller');
app.post('/api/memberships/webhook', express.raw({ type: 'application/json' }), membershipController.handleWebhook);

app.use(express.json());

// 5. Rutas protegidas
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', secure: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
