const request = require('request');

module.exports = {
    verifyIdToken: function(idToken) {
        /*
        Calls google tokeninfo url, to verify the id token presented
         */
        return new Promise((resolve, reject) => {
            let uri = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + idToken;

            console.log('Verifying id-token');

            request.get(uri, (err, httpResponse, body) => {
                if(err) {
                    console.error('Gmail token verify failed ', err);
                    return reject(err);
                }

                try {
                    body = JSON.parse(body);

                    console.log('google resonse', body);
                    console.log('User token verified');

                    if(!body.email) {
                        // Email permission was not granted
                        console.log('Email permission was not granted.');
                        return reject('Email permission was not granted');
                    }
                    resolve(body);
                }
                catch(err) {
                    console.error(err);
                    reject(err);
                }

            });
        });
    },

    verifyAccessToken: function(accessToken) {
        /*
            Verify access token from facebook
         */
        return new Promise((resolve, reject) => {
            let uri = 'https://graph.facebook.com/v2.8/me?fields=id%2Cname%2Cemail%2Cpicture&format=json&access_token=' + accessToken;

            console.log('Verifying access token');

            request.get(uri, (err, httpResponse, body) => {
                if(err) {
                    console.error('Facebook token verify failed ', err);
                    return reject(err);
                }

                try {
                    body = JSON.parse(body);
                    console.log('User access token verified');
                    console.log('facebook response: ', body);
                    if(!body.email) {
                        // Email permission was not granted
                        console.log('Email permission was not granted.');
                        return reject('Email permission was not granted');
                    }
                    resolve(body);
                }
                catch(err) {
                    console.error(err);
                    reject(err);
                }

            });
        });
    }
}
