const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
    getAllMemberships,
    updateMembershipStatus
} = require('../controllers/membership.controller');

router.use(authenticate);

router.get('/', getAllMemberships);
router.patch('/:id', updateMembershipStatus);

module.exports = router;
