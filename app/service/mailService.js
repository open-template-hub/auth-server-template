const nodemailer = require("nodemailer");
const builder = require("./../util/builder");

const emailTemplatePath = "./assets/mail-template/verifyAccountMailTemplate.html";

const mailConf = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
};

const service = {
    sendAccountVerificationMail: async (user, token) => {
        let transporter = nodemailer.createTransport(mailConf);

        let url = process.env.CLIENT_VERIFICATION_SUCCESS_URL + '?token=' + token;
        url = url.replace('${CLIENT_URL}', process.env.CLIENT_URL);

        let params = new Map();
        params.set('${url}', url);
        params.set('${username}', user.username);

        let mailBody = builder.buildTemplate(emailTemplatePath, params);

        await transporter.sendMail({
            from: 'auth-server',
            to: user.email,
            subject: "Account verification",
            html: mailBody
        });
    },

    sendPasswordResetMail: async (user, token) => {
        let transporter = nodemailer.createTransport(mailConf);

        let url = process.env.CLIENT_RESET_PASSWORD_URL + '?token=' + token + '&username=' + user.username;
        url = url.replace('${CLIENT_URL}', process.env.CLIENT_URL);

        await transporter.sendMail({
            from: 'auth-server',
            to: user.email,
            subject: "Forget password",
            html: `<a href='${url}'>Reset password link</a>`
        });
    }
};

module.exports = service;
