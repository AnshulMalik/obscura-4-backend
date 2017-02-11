var nodemailer = require('nodemailer');
var async = require("async");

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'malikanshul29@gmail.com',
        pass: 'ritlbaaxrpvputop'
    },
    proxy: 'socks5://0.0.0.0:6001'
});
//transporter.set('proxy_socks_module', require('socks'));

function generateBody(user) {
    return "Hi " + user.name +
        ",\n\nWe are glad that you made it this far" +
        "\n\nI am sending a file to help you out with this level\n\n ";
}

function generateEmail(user) {
    return {
        to: user.email,
        subject: 'We want to help you - Obscura',
        text: generateBody(user),
        attachments: [{
            filename: 'obscura.txt',
            path: './obscura.txt'
        }]
    };
}


function send(user) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(generateEmail(user), (err, info) => {
            if(err)
                reject(err);
            else {
                resolve(info);
            }
        });
    });
}


module.exports = send;
