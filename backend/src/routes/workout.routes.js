const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
    createWorkout,
    getWorkouts,
    getWorkoutById,
    getExercises
} = require('../controllers/workout.controller');

router.use(authenticate);

router.post('/', createWorkout);
router.get('/', getWorkouts);
router.get('/:id', getWorkoutById);

module.exports = router;
