const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getWeeklyVolume, getExerciseProgress } = require('../controllers/stats.controller');

router.use(authenticate);

router.get('/weekly-volume', getWeeklyVolume);
router.get('/exercise-progress', getExerciseProgress);

module.exports = router;