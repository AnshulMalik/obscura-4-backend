const express = require('express');
const router = express.Router();

const users = require('./api/users');
const levels = require('./api/levels');

// All routes for various endpoints to be specified here and
// corresponding implementations are to be divided
// into modules
router.use('/users', users);
router.use('/levels', levels);

module.exports = router;
