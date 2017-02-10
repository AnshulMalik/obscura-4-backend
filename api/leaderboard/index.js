const express = require('express');
const router = express.Router();
const HttpStatus = require('http-status-codes');
const tokenMiddleware = require('../middlewares/tokenMiddleware');
const User = require('../../models/user');


router.get('/', tokenMiddleware, (req, res) => {
    console.log(req.user.email, 'requested leaderboard');
    
    User.find({}, { name: 1, levelId: 1, updated_at: 1, college: 1}).sort({ levelId: -1, updated_at: 1}).exec((err, users) => {
        res.json(users);
    });
});


module.exports = router;
