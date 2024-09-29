const express = require('express');
const { getMasterAdminDashboard, manageUsers, manageAdmins } = require('../controller/MasterAdminController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', authenticate('master_admin'), getMasterAdminDashboard);
router.post('/manage-users', authenticate('master_admin'), manageUsers);
router.post('/manage-admins', authenticate('master_admin'), manageAdmins);

module.exports = router;