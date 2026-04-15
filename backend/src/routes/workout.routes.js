const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
    createWorkout,
    getWorkouts,
    getWorkoutById,
    getExercises,
    getLastValues
} = require('../controllers/workout.controller');

router.use(authenticate);

router.post('/', createWorkout);
router.get('/', getWorkouts);
router.get('/exercises', getExercises);
router.get('/exercises/last-values/:exerciseId', getLastValues);
router.get('/:id', getWorkoutById);

module.exports = router;
