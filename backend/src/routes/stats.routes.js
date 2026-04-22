const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getWeeklyVolume, getExerciseProgress, getPersonalRecords } = require('../controllers/stats.controller');

router.use(authenticate);

router.get('/weekly-volume', getWeeklyVolume);
router.get('/exercise-progress', getExerciseProgress);
router.get('/personal-records', getPersonalRecords);

module.exports = router;