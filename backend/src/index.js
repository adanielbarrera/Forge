require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const workoutRoutes = require('./routes/workout.routes');
const membershipRoutes = require('./routes/membership.routes');
const { getExercises } = require('./controllers/workout.controller');
const { authenticate } = require('./middleware/auth.middleware');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/memberships', membershipRoutes);
app.get('/api/exercises', authenticate, getExercises);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});