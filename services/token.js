var config = require('../config');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = config.secret;

module.exports = {

    generateToken: function(data){
        var cipher = crypto.createCipher(algorithm,password);
        var crypted = cipher.update(data._id + '-' + data.email + '-' + new Date().getTime(),'utf8','hex');
        crypted += cipher.final('hex');
        return crypted;
    },
    decrypt: function(text){
        var decipher = crypto.createDecipher(algorithm,password);
        var dec = decipher.update(text,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    },

    isValid: function(token) {
        var decrypted = this.decrypt(token);
        var decode = decrypted.split('-');
        if(decode.length != 3) {
            return false;
        }
        /*
        if((new Date().getTime() - parseInt(decode[2])) / 360000 > 6) {
            // Check for token expiry
            return false;
        }
        */

        return {
            _id: parseInt(decode[0]),
            email: decode[1]
        };
    }
};
