const accountSid = 'AC5269676b8afff87a0c53a0d71f618e2b';
const authToken = '1fd3bd5e5688c0c868826c0839511b52';
const client = require('twilio')(accountSid, authToken);

function sendSMS(to,code) {
    client.messages
        .create({
            body: 'Yor verification code is: '+ code,
            from: '+17624000025',
            to: to
        })
        .then(message => console.log(message.sid));
}

module.exports = {
    sendSMS
};
