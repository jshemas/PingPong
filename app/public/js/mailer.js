var nodemailer = require('nodemailer');

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: 'manta.ping.pong@gmail.com',
        pass: 'mantapingpong'
    }
});


var send = function(subject, message, recipients) {
    mailOpts = {
        from: "Ping Pong <manta.ping.pong@gmail.com>", // sender address
        to: recipients.join(),
        subject: subject,
        text: message
    }
    console.log('Preparing to send message:',mailOpts);
    smtpTransport.sendMail(mailOpts, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
    });
}

module.exports.sendRecMatches = function sendRecMatches(pairs) {
    pairs.forEach(function(pair,i) {
        var redName = pair.red.fname + ' ' + pair.red.lname;
        var blueName = pair.blue.fname + ' ' + pair.blue.lname;
        var message = 'Required Match of the week:\n\n' +
            redName + ' vs ' + blueName;
        console.log(message);
        var subject = 'PingPong required match';
        send(subject,message,[pair.red.email,pair.blue.email]);
    });
}
