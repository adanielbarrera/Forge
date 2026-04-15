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

// 2. CORS Restringido (Solo permitimos nuestro frontend en desarrollo)
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting (Protección contra fuerza bruta y DoS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 peticiones por IP en la ventana
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta después de 15 minutos.' }
});
app.use('/api/', limiter);

app.use(express.json());

// 4. Rutas protegidas
app.use('/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', secure: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});