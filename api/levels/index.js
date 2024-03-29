const express = require('express');
const router = express.Router();
const HttpStatus = require('http-status-codes');
const Level = require('../../models/level');
const User = require('../../models/user');
const tokenMiddleware = require('../middlewares/tokenMiddleware');

router.get('/:url', (req, res, next) => {
    // API to fetch any level: GET /levels/:levelURL

    Level.findOne({ url: req.params.url }, (err, level) => {
        if(err) {
            console.error(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Internal server error'});
        }

        if(level) {
            res.json(level.toPublic());
        }
        else {
            return res.json({ errors: ['Level doesn\'t exist']});
        }
    });
});

router.post('/:url', tokenMiddleware, (req, res) => {
    // Submit answer to the level

    let ansString = req.body.answer;
    if(!ansString) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'answer is required' });
    }

    Level.findOne({ url: req.params.url }, (err, level) => {
        if(err) {
            console.error(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Internal server error'});
        }

        if(level) {
            if(level.answers.indexOf(ansString) !== -1 ) {
                // Right answer
                User.findOne({ _id: req.user.id}, (err, user) => {
                    if(level._id - user.levelId > 0) {
                        // Only sequential answer solution is permitted.
                        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'You are going too fast.' })
                    }

                    let userObj = user.toObject();
                    console.log(level._id, userObj.levelId);

                    if(level._id - userObj.levelId == 0) {
                        // First time submitting the correct answer to this level
                        user.level = level.next;
                        user.levelId++;
                        console.log('Updating user', user);
                        user.save();
                    }
                    return res.json({ status: 'accepted', next: level.next, max: user.level});
                });
            }
            else {
                res.json({ status: 'rejected'} );
            }
        }
        else {
            return res.status(HttpStatus.BAD_REQUEST).json({ errors: ['Level doesn\'t exist']});
        }
    });
});

module.exports = router;
