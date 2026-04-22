const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireActiveMembership } = require('../middleware/membership.middleware');
const {
    createWorkout,
    getWorkouts,
    getWorkoutById,
    getExercises,
    getCatalogVersion,
    getLastValues,
    getTemplates,
    createTemplate,
    getTemplateById,
    deleteTemplate,
    getWorkoutFeedback,
    getFeedbackPreview,
    updateExercise,
    createExercise,
    deleteExercise
} = require('../controllers/workout.controller');

router.use(authenticate);

// Rutas de IA
router.post('/feedback-preview', requireActiveMembership, getFeedbackPreview);

// Rutas de Plantillas
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.get('/templates/:id', getTemplateById);
router.delete('/templates/:id', deleteTemplate);

// Rutas de Entrenamientos
router.post('/', requireActiveMembership, createWorkout);
router.get('/', getWorkouts);
router.get('/exercises', getExercises);
router.get('/exercises/version', getCatalogVersion);
router.post('/exercises', createExercise);
router.patch('/exercises/:id', updateExercise);
router.delete('/exercises/:id', deleteExercise);
router.get('/exercises/last-values/:exerciseId', getLastValues);
router.get('/:id', getWorkoutById);
router.get('/:id/feedback', getWorkoutFeedback);

module.exports = router;
