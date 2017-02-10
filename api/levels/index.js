const express = require('express');
const router = express.Router();
const HttpStatus = require('http-status-codes');
const Level = require('../../models/level');
const User = require('../../models/user');
const tokenMiddleware = require('../middlewares/tokenMiddleware');
const io = require('../sockets')();

let startTime = new Date('Fri, 10 Feb 2017 11:30:00 GMT');
//let startTime = new Date('Fri, 10 Feb 2017 00:30:00 GMT');
router.get('/:url', tokenMiddleware, (req, res, next) => {
    // API to fetch any level: GET /levels/:levelURL
    if(Date.now() < startTime) {
        // Trying to get level before contest start
        console.log(req.user.email, 'tried to get level before contest start');
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Contest has not started yet' });
    }
    User.findOne({ _id: req.user.id }, (err, user) => {

        if(err) {
            console.error(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Internal server error'});
        }

        Level.findOne({ url: req.params.url},{ next: 0, answers: 0, id: 0}, (err, level) => {
            if(err) {
                console.error(err);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Internal server error'});
            }

            if(level) {
                level = level.toPublic();
                if(user.levelId < level.levelId) {
                    // User is trying to fetch
                    // the level he doesn't have access
                    console.log('UNAUTHORIZED', req.user.email, 'tried to get ', level.levelId, 'level');
                    return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'You think you can do that? hahaha'})
                }
                res.json(level);
            }
            else {
                console.log(req.user.email, 'tried to get non existing level ', req.params.url);
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Level doesn\'t exist'});
            }
        });
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
                User.findOne({ _id: req.user.id }, (err, user) => {
                    if(level._id - user.levelId > 0) {
                        // Only sequential answer solution is permitted.
                        console.log(req.user.email, 'attempted to access UNAUTHORIZED level', req.params.url);
                        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Slow down, you are going too fast.' })
                    }

                    let userObj = user.toObject();

                    if(level._id - userObj.levelId == 0) {
                        // First time submitting the correct answer to this level
                        user.level = level.next;
                        user.levelId++;
                        console.log(req.user.email, 'solved', req.params.level);
                        user.save();
                        io.sockets.emit('update', {id: userObj._id, level: userObj.levelId + 1});
                    }
                    return res.json({ status: 'accepted', next: level.next, max: user.level});
                });
            }
            else if(level._id === 26){ // Special condition for level 20 (Phone number is answer)
                User.findOne({ _id: req.user.id }, (err, user) => {
                    if(err) {
                        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong.'});
                    }

                    let userObj = user.toObject();
                    if(ansString === user.phone) {
                        if(level._id - userObj.levelId == 0) {
                            // First time submitting the correct answer to this level
                            user.level = level.next;
                            user.levelId++;
                            console.log(req.user.email, 'solved', req.params.url);
                            user.save();
                            io.sockets.emit('update', {id: userObj._id, level: userObj.levelId + 1});
                        }
                        return res.json({ status: 'accepted', next: level.next, max: user.level});
                    }
                    else {
                        console.log('incorrect', req.user.email, req.params.url, ansString);
                        return res.json({ status: 'rejected' })
                    }
                });
            }
            else {
                console.log('incorrect', req.user.email, req.params.url, ansString);
                res.json({ status: 'rejected'} );
            }
        }
        else {
            return res.status(HttpStatus.BAD_REQUEST).json({ errors: ['Level doesn\'t exist']});
        }
    });
});

module.exports = router;
