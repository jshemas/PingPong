var nodemailer = require('nodemailer');

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: 'manta.ping.pong@gmail.com',
        pass: 'mantapingpong'
    }
});


module.exports.send = function send(subject, message, recipients) {
    mailOpts = {
        from: "Ping Pong <manta.ping.pong@gmail.com>", // sender address
        to: recipients.join(),
        subject: subject,
        text: message
    }
    smtpTransport.sendMail(mailOpts, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
    });
    
}
