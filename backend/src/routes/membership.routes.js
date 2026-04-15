const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
    getAllMemberships,
    createMembership,
    updateMembershipStatus
} = require('../controllers/membership.controller');

router.use(authenticate);

router.get('/', getAllMemberships);
router.post('/', createMembership);
router.patch('/:id', updateMembershipStatus);

module.exports = router;
