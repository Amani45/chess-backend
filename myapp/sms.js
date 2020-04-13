const accountSid = 'AC5269676b8afff87a0c53a0d71f618e2b';
const authToken = 'b18df3f591c60a60ded8c436f5645951';
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
