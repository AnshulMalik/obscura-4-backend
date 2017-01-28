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
}
