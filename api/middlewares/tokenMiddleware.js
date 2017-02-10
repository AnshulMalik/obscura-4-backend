const HttpStatus = require('http-status-codes');

const tokenService = require('../../services/token');

module.exports = ( req, res, next ) => {
    /*
        Middleware for protected requests
        -   Verifies whether token is valid, if yes, set's user id and email
            in req.user to identify the user further.
        -   Rejects request if invalid token or no token provided
     */
    let token = req.query.token || req.body.token;
    if(!token) {
        // No token is provided, so reject the request
        return res.status(HttpStatus.BAD_REQUEST).json({
            message: 'An access token is required'
        });
    }

    try {
        req.user = tokenService.isValid(token);
        // If token is valid, req.user contains id and email
        if(req.user) {
            next();     // Forward the request to next function
        }
        else {
            // Can't decode the token
            throw new Error('Not authorized');
        }
    }
    catch(err) {
        console.trace(err);
        return res.status(HttpStatus.UNAUTHORIZED).json({
            message: 'Invalid access token'
        });
    }
};
