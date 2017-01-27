const express = require('express');
const router = express.Router();
const HttpStatus = require('http-status-codes');
const googleService = require('../../services/google');
const tokenService = require('../../services/token');
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
        type: 'new' for successful signup, 'old' for successful login
        token: Access token for using the obscura api
        message: Status message
 */
router.post('/', (req, res, next) => {
    // Input must be validated and corresponding status codes are to be sent.

    if(!req.body.id_token) {
        return res.status(HttpStatus.BAD_REQUEST).json({id_token: 'ID token is required.'});
    }

    googleService.verifyIdToken(req.body.id_token).then((gUser) => {
        // We don't need to take email as input from user,
        // since we can get it from google
        req.body.email = gUser.email;
        req.body._id = gUser.sub;
        req.body.picture = gUser.picture;

        User.findOne({ email: req.body.email }, '_id email name', (err, user) => {
            if(err) {
                console.log(err);
            }

            if(!user) {
                // User doesn't exists, try to insert one
                User.create(req.body, (err, user) => {
                    if(err) {
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
                        type: 'new',
                        message: 'Signup successful',
                        token: tokenService.generateToken(user)
                    });
                });
            }
            else {
                // User already exists, just return token
                console.log(user.name, 'logged in');
                return res.json({
                    type: 'old',
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

module.exports = router;
