const express = require('express');
const router = express.Router();
const HttpStatus = require('http-status-codes');
const googleService = require('../../services/google');
const tokenService = require('../../services/token');
const tokenMiddleware = require('../middlewares/tokenMiddleware');
const User = require('../../models/user');

/*
    API to login/signup

    @param id_token ID token obtained from google

    To signup
    @param name - Name of the user          - Required
    @param phone - Phone number of user     - Required
    @param college - College of user
    @param course - Course (B.tech/MCA etc)

    @returns
        id: Unique id of the user
        type: 'new' for successful signup, 'old' for successful login
        token: Access token for using the obscura api
        message: Status message
 */
router.post('/', (req, res) => {
    // Input must be validated and corresponding status codes are to be sent.

    console.log(req.body);
    if(!req.body.id_token) {
        // id_token is not present in request, reject
        return res.status(HttpStatus.BAD_REQUEST).json({id_token: 'ID token is required.'});
    }

    googleService.verifyIdToken(req.body.id_token).then((gUser) => {
        // We don't need to take email as input from user,
        // since we can get it from google
        req.body.email = gUser.email;
        req.body._id = gUser.sub;
        req.body.picture = gUser.picture;

        User.findOne({ email: req.body.email }, '', (err, user) => {
            if(err) {
                console.log(err);
            }

            if(!user) {
                // User doesn't exists, try to insert one
                User.create(req.body, (err, user) => {
                    if(err) {
                        console.log(err);
                        let errors = [];
                        Object.keys(err.errors).map((field) => {
                            errors.push({
                                type: field,
                                message: err.errors[field].message
                            });
                        });
                        return res.status(HttpStatus.BAD_REQUEST).json(errors);
                    }

                    console.log(user.name, 'signed up');
                    return res.json({
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        picture: user.picture,
                        college: user.college,
                        level: user.level,
                        message: 'Signup successful',
                        token: tokenService.generateToken(user)
                    });
                });
            }
            else {
                // User already exists, just return token
                console.log(user.name, 'logged in');
                console.log(user);
                return res.json({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                    college: user.college,
                    level: user.level,
                    token: tokenService.generateToken(user),
                    message: 'Login successful'
                });
            }
        }).catch((err) => {
            console.trace(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR, { message: 'Something went wrong'});
        });
    });
});


/*
    To fetch details of user
 */
router.get('/:id', tokenMiddleware, (req, res) => {

    if(req.user.id == req.params.id) {
        User.findOne({ _id: req.params.id }, (err, user) => {
            return res.json(user.toPublic());
        });
    }
    else {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Invalid token provided'
        });
    }
});

router.post('/:id', tokenMiddleware, ( req, res ) => {

    if(req.user.id == req.params.id) {
        let toUpdate = { };
        if(req.body.name)
            toUpdate.name = req.body.name;
        if(req.body.picture)
            toUpdate.picture = req.body.picture;
        if(req.body.phone)
            toUpdate.phone = req.body.phone;
        if(req.body.college)
            toUpdate.college = req.body.college;

        User.update({ _id: req.params.id }, { $set: toUpdate }, (err, raw) => {
            if(err || !raw.ok) {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
            }

            return res.json({ message: 'Successfully updated' });
        });
    }
    else {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Invalid token provided'
        });
    }
});

module.exports = router;
