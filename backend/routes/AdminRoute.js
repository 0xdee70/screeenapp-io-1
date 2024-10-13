const express = require('express');
const { getUsers, toggleUserAccess, getAdmins, promoteToAdmin, demoteAdmin, toggle2FA } = require('../controller/AdminController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/users', authenticate('admin'), getUsers);
router.post('/toggle-access/:userId', authenticate('master_admin'), toggleUserAccess);
router.get('/admins', authenticate('master_admin'), getAdmins);
router.post('/promote/:userId', authenticate('master_admin'), promoteToAdmin);
router.post('/demote/:userId', authenticate('master_admin'), demoteAdmin);
router.post('/toggle-2fa/:userId', authenticate('master_admin'), toggle2FA);

module.exports = router;