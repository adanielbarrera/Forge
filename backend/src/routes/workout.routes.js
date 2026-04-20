const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
    createWorkout,
    getWorkouts,
    getWorkoutById,
    getExercises,
    getLastValues,
    getTemplates,
    createTemplate,
    getTemplateById
} = require('../controllers/workout.controller');

router.use(authenticate);

// Rutas de Plantillas
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.get('/templates/:id', getTemplateById);

// Rutas de Entrenamientos
router.post('/', createWorkout);
router.get('/', getWorkouts);
router.get('/exercises', getExercises);
router.get('/exercises/last-values/:exerciseId', getLastValues);
router.get('/:id', getWorkoutById);

module.exports = router;
