const express = require('express');
const router = express.Router();
const HttpStatus = require('http-status-codes');

router.get('/:url', (req, res, next) => {
    // API to fetch any level: GET /levels/:levelURL

    res.json({done: 'ad'});
});

module.exports = router;
