const accountSid = 'AC5269676b8afff87a0c53a0d71f618e2b';
const authToken = 'ce02dca980452d085de45609c349063f';
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
