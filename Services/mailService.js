const nodemailer = require('../node_modules/nodemailer');
const mailHostConfig = require('../Configs/mailConfig').mailHostConfig;


class MailService{
    constructor(){
        this.mailHost = mailHostConfig;
        this.mailOptions = {
            from: 'handsapp.system@gmail.com', 
            to: ' ',
            subject: '', 
            html: ''
          };
    }
    submitRequestEmail(obj){
        this.mailOptions.subject = `Welcome To HandsApp`;
        this.mailOptions.html = `
        <h1>Hello ${obj.name.first} ${obj.name.last}!<h1>
        <h3>Your request was submited to our system!<h3>
        <h3>to follow up on your request status or edit your request<h3>
        <h3>you can log in with your email as the email and phone number as password<h3>
        <h2> HandsApp Team <h2>
        `;
        this.sendEmail(obj.email);
    }
    rejectRequestEmail(obj){
        this.mailOptions.subject = 'HandsApp Team';
        this.mailOptions.html = `
            <h1>Hello ${obj.name.first}!<h1>
            <h3>We are sorry to inform you that we can't help you with your problem<h3>
            <h3>This is because we don't have enough resources.<h3>
            <h3>We wish you all the best and GOOD LUCK!<h3>
            <h2>HandsApp Team<h2>
        `;
        this.sendEmail(obj.email);
    }
    acceptRequestEmail(obj){
        this.mailOptions.subject = 'HandsApp Team';
        this.mailOptions.html = `
            <h1>Hello ${obj.name.first} ${obj.name.last}!<h1>
            <h3>We are excited to start working on your request!<h3>
            <h3>Login to the system to find out all the details<h3>
            <h2>HandsApp Team<h2>
        `;
        this.sendEmail(obj.email);
    }
    sendEmail(email){
        var transporter = nodemailer.createTransport(this.mailHost);
        this.mailOptions.to = email;
        transporter.sendMail(this.mailOptions, function (err, info) {
            if(err)
              console.log(err)
            else
              console.log(info);
         });
    }
}

const mailService = new MailService();

module.exports = {
    mailService
}