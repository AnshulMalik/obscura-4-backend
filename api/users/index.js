const express = require('express');
const router = express.Router();
const HttpStatus = require('http-status-codes');

const User = require('../../models/user');

router.post('/', (req, res, next) => {
    // Just a sample user creation demo
    // API to create a user, POST /users
    // Input must be validated and corresponding status codes are to be sent.

    console.log(req.body);

    User.create(req.body, (err, user) => {
        if(err) {
            let errors = [];
            Object.keys(err.errors).map((field) => {
                errors.push({
                    type: field,
                    message: err.errors[field].message
                });
            });
            res.status(HttpStatus.BAD_REQUEST).json(errors);
        }

        console.log(user);
        res.status(HttpStatus.OK).json({message: 'User created'});
    });
});

module.exports = router;
